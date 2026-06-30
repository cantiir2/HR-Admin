const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

// Helpers
function formatDuration(minutes) {
  if (minutes <= 0) return '00.00';
  const h = Math.floor(minutes / 60);
  const m = Math.floor(minutes % 60);
  return `${String(h).padStart(2, '0')}.${String(m).padStart(2, '0')}`;
}

function parseTimeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + (m || 0);
}

function calculateWorkingHours(checkInTime, checkOutTime, breakMinutes) {
  if (!checkInTime || !checkOutTime) return 0;
  const start = new Date(checkInTime);
  const end = new Date(checkOutTime);
  let diffMs = end - start;
  let diffMins = Math.floor(diffMs / 60000);
  diffMins -= breakMinutes;
  return Math.max(0, diffMins);
}

function calculateOvertime(totalWorkingMins, normalWorkingMins = 480) {
  return Math.max(0, totalWorkingMins - normalWorkingMins);
}

async function generateWorkingReport(userId, month, year, prisma) {
  month = parseInt(month, 10);
  year = parseInt(year, 10);

  // Get user profile & active projects
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: {
    id: true,
    name: true,
    jobRoleCode: true,
    projects: {
      select: {
        project: {
          select: {
            name: true,
            customer: true,
            customerName: true,
            location: true,
            woNumber: true,
            projectManager: {
              select: {
                name: true
              }
            }
          }
        }
      }
    }
  }
});

  if (!user) throw new Error('User not found');

  // Fetch Job Role Name from SystemMaster
  user.jobRoleName = user.jobRoleCode || '';
  if (user.jobRoleCode) {
    const roleMaster = await prisma.systemMaster.findUnique({
      where: { category_code: { category: 'JOB_ROLE', code: user.jobRoleCode } }
    });
    if (roleMaster) user.jobRoleName = roleMaster.name;
  }

  console.log("user", user);

  // Find Customer / Project Name
  let customer = '';
  let customerName = '';
  let projectName = '';
  let location = '';
  let woNumber = '';
  let projectManagerName = '';
  let projectManagerPhoto = '';

  if (user.projects && user.projects.length > 0) {
    const activeProject = user.projects[0].project;
    console.log("active project", activeProject);
    projectName = activeProject.name || '';
    customer = activeProject.customer || '';
    customerName = activeProject.customerName || '';
    location = activeProject.location || '';
    woNumber = activeProject.woNumber || '';
    if (activeProject.projectManager) {
      projectManagerName = activeProject.projectManager.name || '';
    }
  }

  // Get Break Time
  const breakTimeConfig = await prisma.systemMaster.findFirst({
    where: { category: 'BREAK_TIME' }
  });
  const breakStr = breakTimeConfig ? breakTimeConfig.code : '01:00';
  const breakMinutes = parseTimeToMinutes(breakStr);

  // Get Attendance Data
  // Convert month/year to local range (since dates are saved as db.Date which might be 00:00 UTC)
  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate = new Date(Date.UTC(year, month, 1));

  const attendances = await prisma.attendance.findMany({
    where: {
      userId: userId,
      date: {
        gte: startDate,
        lt: endDate
      }
    },
    orderBy: { date: 'asc' }
  });

  // Create Excel Workbook
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Working Report', {
    properties: {
      defaultRowHeight: 20,
    },
    pageSetup: {
      paperSize: 9, // A4
      orientation: 'landscape',
      margins: {
        left: 0.25, right: 0.25,
        top: 0.5, bottom: 0.5,
        header: 0.3, footer: 0.3
      }
    }
  });

  // Base Font
  const baseFont = { name: 'Arial Unicode MS', size: 11 };

  // Add columns format roughly matching the image
  sheet.columns = [
    { key: 'A', width: 15 }, // DATE
    { key: 'B', width: 10 },  // IN
    { key: 'C', width: 10 },  // OUT
    { key: 'D', width: 12 }, // BREAK
    { key: 'E', width: 12 }, // Total
    { key: 'F', width: 12 }, // OverTime
    { key: 'G', width: 30 }, // Place
    { key: 'H', width: 50 }, // ACTIVITY
  ];

  // Title: Working Report
  sheet.mergeCells('D1:F2');
  const titleCell = sheet.getCell('D1');
  titleCell.value = 'Working Report';
  titleCell.font = { name: 'Arial Unicode MS', size: 18, bold: true, color: { argb: 'FF0000FF' } }; // Blue text
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

  // Header Box 1
  sheet.mergeCells('A3:B3');
  sheet.getCell('A3').value = 'EmployeeName';
  sheet.mergeCells('C3:D3');
  sheet.getCell('C3').value = user.name;

  sheet.mergeCells('A4:B4');
  sheet.getCell('A4').value = 'ID No.';
  sheet.mergeCells('C4:D4');
  sheet.getCell('C4').value = user.id.slice(0, 8);

  sheet.mergeCells('A5:B5');
  sheet.getCell('A5').value = 'Position';
  sheet.mergeCells('C5:D5');
  sheet.getCell('C5').value = user.jobRoleName || '';

  // Header Box 2
  sheet.mergeCells('F3:G3');
  sheet.getCell('F3').value = 'Customer';
  sheet.getCell('H3').value = customer;
  sheet.getCell('F4').value = 'Customer PIC';
  sheet.getCell('H4').value = customerName;

  sheet.mergeCells('F4:G4');
  sheet.getCell('F4').value = 'Project Name';
  sheet.getCell('H4').value = projectName;

  sheet.mergeCells('F5:G5');
  sheet.getCell('F5').value = 'WO Number';
  sheet.getCell('H5').value = woNumber;

  const headerCells = ['A3', 'C3', 'A4', 'C4', 'A5', 'C5', 'F3', 'H3', 'F4', 'H4', 'F5', 'H5'];
  headerCells.forEach(cell => {
    const c = sheet.getCell(cell);
    c.font = { ...baseFont, bold: true, size: 10 };
    c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };

    // Light yellow background for values
    if (['C3', 'C4', 'C5', 'H3', 'H4', 'H5'].includes(cell)) {
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF99' } };
      c.font = { ...baseFont, size: 10 };
    }
  });

  // Month / Year box
  sheet.getCell('A7').value = 'MONTH/YEAR:';
  sheet.getCell('A7').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
  sheet.getCell('B7').value = month;
  sheet.getCell('C7').value = year;

  ['A7', 'B7', 'C7'].forEach(cell => {
    const c = sheet.getCell(cell);
    c.font = { ...baseFont, bold: true, size: 10 };
    c.alignment = { horizontal: 'center' };
    c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
  });
  sheet.getCell('B7').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCCFFFF' } }; // Light blue
  sheet.getCell('C7').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCCFFFF' } }; // Light blue

  // Table Headers
  sheet.mergeCells('A8:A9');
  sheet.getCell('A8').value = 'DATE';

  sheet.mergeCells('B8:D8');
  sheet.getCell('B8').value = 'TIME';
  sheet.getCell('B9').value = 'IN';
  sheet.getCell('C9').value = 'OUT';
  sheet.getCell('D9').value = 'BREAK';

  sheet.mergeCells('E8:F8');
  sheet.getCell('E8').value = 'Working Time';
  sheet.getCell('E9').value = 'Total';
  sheet.getCell('F9').value = 'OverTime';

  sheet.mergeCells('G8:G9');
  sheet.getCell('G8').value = 'Place';

  sheet.mergeCells('H8:H9');
  sheet.getCell('H8').value = 'ACTIVITY';

  const tableHeaders = ['A8', 'B8', 'B9', 'C9', 'D9', 'E8', 'E9', 'F9', 'G8', 'H8'];
  tableHeaders.forEach(cell => {
    const c = sheet.getCell(cell);
    c.font = { ...baseFont, color: { argb: 'FF0000FF' }, size: 10 }; // Blue text
    c.alignment = { horizontal: 'center', vertical: 'middle' };
    c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
  });

  // Fill Data
  let startRow = 10;
  let sumTotalWorking = 0;
  let sumOverTime = 0;

  const daysInMonth = new Date(year, month, 0).getDate();

  for (let i = 1; i <= daysInMonth; i++) {
    const currentDate = new Date(Date.UTC(year, month - 1, i));
    const att = attendances.find(a => new Date(a.date).getUTCDate() === i);

    const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'short' });
    const dateStr = `${i} (${dayName})`;

    let inTime = '';
    let outTime = '';
    let breakStrRow = '';
    let totalStr = '';
    let overStr = '';
    let placeStr = '';
    let activityStr = '';

    if (att && att.checkInTime) {
      const inDate = new Date(att.checkInTime);
      inTime = `${String(inDate.getHours()).padStart(2, '0')}.${String(inDate.getMinutes()).padStart(2, '0')}`;
      placeStr = location;

      let notes = [];
      if (att.checkInNote) notes.push(att.checkInNote);

      if (att.checkOutTime) {
        const outDate = new Date(att.checkOutTime);
        outTime = `${String(outDate.getHours()).padStart(2, '0')}.${String(outDate.getMinutes()).padStart(2, '0')}`;
        if (att.checkOutNote) notes.push(att.checkOutNote);

        const totalMins = calculateWorkingHours(att.checkInTime, att.checkOutTime, breakMinutes);
        const overMins = calculateOvertime(totalMins, 480);

        breakStrRow = breakStr.replace(':', '.');
        totalStr = formatDuration(totalMins);
        overStr = formatDuration(overMins);

        sumTotalWorking += totalMins;
        sumOverTime += overMins;
      } else {
        outTime = '-';
        breakStrRow = '-';
        totalStr = '-';
        overStr = '00.00';
      }
      activityStr = notes.join('\n');
    }

    const row = sheet.getRow(startRow);
    row.values = {
      A: dateStr,
      B: inTime,
      C: outTime,
      D: breakStrRow,
      E: totalStr,
      F: overStr,
      G: placeStr,
      H: activityStr
    };

    // Formatting
    ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].forEach(col => {
      const c = row.getCell(col);
      c.font = { ...baseFont, size: 10 };
      c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });
    // Activity left align
    row.getCell('H').alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };

    // Auto height for activity
    if (activityStr.includes('\n')) {
      row.height = 30; // approx 2 lines
    }

    startRow++;
  }

  // Footer Total
  const footerRow = sheet.getRow(startRow);
  sheet.mergeCells(`A${startRow}:D${startRow}`);
  footerRow.getCell('A').value = 'TOTAL';
  footerRow.getCell('E').value = formatDuration(sumTotalWorking);
  footerRow.getCell('F').value = formatDuration(sumOverTime);

  ['A', 'E', 'F'].forEach(col => {
    const c = footerRow.getCell(col);
    c.font = { ...baseFont, bold: true, size: 10 };
    c.alignment = { horizontal: 'center', vertical: 'middle' };
    c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    if (col === 'A') {
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCCFFFF' } }; // Light blue
    }
  });

  startRow += 2;

  // Signature Section
  sheet.mergeCells(`A${startRow}:A${startRow + 1}`);
  sheet.getCell(`A${startRow}`).value = 'Issued by';
  sheet.mergeCells(`B${startRow}:E${startRow}`);
  sheet.getCell(`B${startRow}`).value = 'Name';
  sheet.mergeCells(`F${startRow}:H${startRow}`);
  sheet.getCell(`F${startRow}`).value = 'Signature';

  sheet.mergeCells(`B${startRow + 1}:E${startRow + 1}`);
  sheet.getCell(`B${startRow + 1}`).value = user.name;
  sheet.mergeCells(`F${startRow + 1}:H${startRow + 2}`); // big signature box

  sheet.getCell(`A${startRow + 2}`).value = 'Date';
  sheet.mergeCells(`B${startRow + 2}:E${startRow + 2}`);
  const today = new Date();
  sheet.getCell(`B${startRow + 2}`).value = today.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '-');

  startRow += 3;

  sheet.mergeCells(`A${startRow}:A${startRow + 1}`);
  sheet.getCell(`A${startRow}`).value = 'Approved by';
  sheet.mergeCells(`B${startRow}:E${startRow}`);
  sheet.getCell(`B${startRow}`).value = 'Name';
  sheet.mergeCells(`F${startRow}:H${startRow}`);
  sheet.getCell(`F${startRow}`).value = 'Signature';

  sheet.mergeCells(`B${startRow + 1}:E${startRow + 1}`);
  sheet.getCell(`B${startRow + 1}`).value = projectManagerName;
  sheet.mergeCells(`F${startRow + 1}:H${startRow + 2}`);

  sheet.getCell(`A${startRow + 2}`).value = 'Date';
  sheet.mergeCells(`B${startRow + 2}:E${startRow + 2}`);
  sheet.getCell(`B${startRow + 2}`).value = today.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '-');


  // Apply styles to signature section
  const sigRowStart = startRow - 3;
  for (let i = sigRowStart; i <= startRow + 2; i++) {
    const r = sheet.getRow(i);
    r.height = 20;

    // Left labels
    const cA = r.getCell('A');
    cA.font = { ...baseFont, size: 10, bold: true };
    cA.alignment = { horizontal: 'center', vertical: 'middle' };
    cA.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };

    // Right values (names/dates)
    ['B', 'C', 'D', 'E'].forEach(col => {
      r.getCell(col).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });
    const cB = r.getCell('B');
    cB.font = { ...baseFont, size: 10 };
    cB.alignment = { horizontal: 'left', vertical: 'middle' };

    // Signature label & box
    ['F', 'G', 'H'].forEach(col => {
      r.getCell(col).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });
    const cF = r.getCell('F');
    cF.font = { ...baseFont, size: 10, color: { argb: 'FF0000FF' } }; // Blue text for "Signature"
    cF.alignment = { horizontal: 'center', vertical: 'middle' };
  }

  // Fill signature box with yellow
  sheet.getCell(`F${sigRowStart + 1}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF99' } };
  sheet.getCell(`F${startRow + 1}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF99' } };

  // Adjust signature row heights
  sheet.getRow(sigRowStart + 1).height = 40;
  sheet.getRow(startRow + 1).height = 40;

  startRow += 4;

  // Footer Text
  const textMsg = `;00\nBagi karyawan yang tugas luar (khusus untuk standby di satu customer), prosedur absensi adalah sbb:\n1. Absen wajib dilakukan pada saat datang dan saat pulang kerja dengan mengisi form terlampir.\n2. Setelah akhir bulan, form yang sudah lengkap tsb dikirim beserta lampirannya seperti: form cuti, keterangan dokter, dll via fax ke manager bersangkutan.\n3. Setelah disetujui manager, form ini diserahkan ke HRD.`;
  sheet.mergeCells(`A${startRow}:H${startRow}`);
  const textCell = sheet.getCell(`A${startRow}`);
  textCell.value = textMsg;
  textCell.font = { name: 'Arial', size: 9 };
  textCell.alignment = { horizontal: 'left', vertical: 'top', wrapText: true };
  textCell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
  sheet.getRow(startRow).height = 80;

  // Add logo
  const logoPath = path.join(__dirname, '..', 'images', 'fujitsu.png');
  if (fs.existsSync(logoPath)) {
    const imageId = workbook.addImage({
      filename: logoPath,
      extension: 'png',
    });
    sheet.addImage(imageId, {
      tl: { col: 0, row: 0 },
      ext: { width: 150, height: 40 }
    });
  }

  // Freeze header
  sheet.views = [
    { state: 'frozen', ySplit: 9 }
  ];

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

module.exports = {
  generateWorkingReport
};
