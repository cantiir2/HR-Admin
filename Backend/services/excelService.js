const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const { detectProjectArea } = require('../utils/geofence');

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

function formatTimeJakarta(dateValue) {
  if (!dateValue) return '';

  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
    .format(new Date(dateValue))
    .replace(':', '.');
}

function toYmdStr(dateValue) {
  if (!dateValue) return '';
  const d = new Date(dateValue);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Name Function : calculateWorkingHours
// Author : Iyan.FID
// Description : Menghitung total jam kerja efektif setelah dikurangi jam istirahat normal dan istirahat lembur
function calculateWorkingHours(checkInTime, checkOutTime, breakMinutes, overtimeBreakMinutes = 0, normalWorkingMins = 480) {
  if (!checkInTime || !checkOutTime) return { totalMins: 0, appliedBreakMins: 0 };

  const start = new Date(checkInTime);
  const end = new Date(checkOutTime);
  let diffMs = end - start;
  let diffMins = Math.floor(diffMs / 60000);

  let appliedBreakMins = breakMinutes;
  diffMins -= breakMinutes;

  if (diffMins > normalWorkingMins) {
    const excess = diffMins - normalWorkingMins;

    if (excess >= overtimeBreakMinutes) {
      appliedBreakMins += overtimeBreakMinutes;
      const actualOvertime = excess - overtimeBreakMinutes;
      diffMins = normalWorkingMins + actualOvertime;
    } else {
      diffMins = normalWorkingMins;
    }
  }

  return {
    totalMins: Math.max(0, diffMins),
    appliedBreakMins: appliedBreakMins
  };
}

function calculateOvertime(totalWorkingMins, normalWorkingMins = 480) {
  return Math.max(0, totalWorkingMins - normalWorkingMins);
}

// Name Function : getWorkingReportData
// Author : Iyan.FID
// Description : Mengambil data komprehensif working report bulanan untuk preview dan export
async function getWorkingReportData(userId, month, year, prisma) {
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

  const daysInMonth = new Date(year, month, 0).getDate();
  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate = new Date(Date.UTC(year, month, 1));
  const endOfMonthDate = new Date(Date.UTC(year, month - 1, daysInMonth, 23, 59, 59, 999));

  // Find all active projects for this user in the period
  let activeProjects = [];
  try {
    const memberships = await prisma.projectMember.findMany({
      where: {
        userId,
        OR: [
          {
            project: {
              contractStart: { lte: endOfMonthDate },
              contractEnd: { gte: startDate },
              status: { notIn: ['cancelled', 'Cancelled', 'CANCELLED'] }
            }
          },
          {
            project: {
              status: { in: ['active', 'Active', 'ACTIVE'] }
            }
          }
        ]
      },
      include: {
        project: {
          include: {
            projectManager: { select: { id: true, name: true, email: true } }
          }
        }
      },
      orderBy: { project: { contractStart: 'asc' } }
    });

    if (memberships.length > 0) {
      activeProjects = memberships.map(m => m.project);
    } else if (user.projects && user.projects.length > 0) {
      activeProjects = user.projects.map(p => p.project);
    }
  } catch (e) {
    if (user.projects && user.projects.length > 0) {
      activeProjects = user.projects.map(p => p.project);
    }
  }

  const uniqueProjects = [...new Map(activeProjects.map(p => [p.id || p.name, p])).values()];

  const projectNames = uniqueProjects.map(p => p.name?.trim()).filter(Boolean);
  const customerNames = [...new Set(uniqueProjects.map(p => p.customer?.trim() || p.customerName?.trim()).filter(Boolean))];
  const woNumbers = [...new Set(uniqueProjects.map(p => p.woNumber?.trim()).filter(Boolean))];
  const pmNames = [...new Set(uniqueProjects.map(p => p.projectManager?.name?.trim()).filter(Boolean))];

  const projectName = projectNames.join(', ');
  const customer = customerNames.join(', ');
  const woNumber = woNumbers.join(', ');
  const projectManagerName = pmNames.join(', ');

  // Get Break Time
  const breakTimeConfig = await prisma.systemMaster.findFirst({
    where: { category: 'BREAK_TIME' }
  });
  const breakStr = breakTimeConfig ? breakTimeConfig.code : '01:00';
  const breakMinutes = parseTimeToMinutes(breakStr);

  // Get Overtime Break Time
  const otBreakTimeConfig = await prisma.systemMaster.findFirst({
    where: { category: 'BREAK_TIME_OVERTIME' }
  });
  const otBreakStr = otBreakTimeConfig ? otBreakTimeConfig.code : '00:30';
  const overtimeBreakMinutes = parseTimeToMinutes(otBreakStr);

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

  // Get Approved Leave Requests for the month
  const leaveRequests = await prisma.leaveRequest.findMany({
    where: {
      userId: userId,
      status: 'APPROVED',
      startDate: { lte: endOfMonthDate },
      endDate: { gte: startDate }
    }
  });

  // Get Active Geofences
  let activeGeofences = [];
  try {
    const geofences = await prisma.geofence.findMany({
      where: { isActive: true }
    });
    if (geofences && geofences.length > 0) {
      activeGeofences = geofences;
    }
  } catch (e) { }

  if (!activeGeofences || activeGeofences.length === 0) {
    try {
      activeGeofences = await prisma.project.findMany({
        where: {
          status: { in: ['active', 'Active', 'ACTIVE'] }
        }
      });
    } catch (e) { }
  }

  // Get Working Report info if available (for approval/submission dates)
  let reportRecord = null;
  try {
    reportRecord = await prisma.workingReport.findUnique({
      where: { userId_month_year: { userId, month, year } },
      include: {
        approvedBy: { select: { id: true, name: true } },
        rejectedBy: { select: { id: true, name: true } }
      }
    });
  } catch (e) { }

  let sumTotalWorking = 0;
  let sumOverTime = 0;
  const rows = [];

  for (let i = 1; i <= daysInMonth; i++) {
    const currentDate = new Date(Date.UTC(year, month - 1, i));
    const currentYmd = toYmdStr(currentDate);

    const att = attendances.find(a => new Date(a.date).getUTCDate() === i);
    const leave = leaveRequests.find(l => {
      const startYmd = toYmdStr(l.startDate);
      const endYmd = toYmdStr(l.endDate);
      return currentYmd >= startYmd && currentYmd <= endYmd;
    });

    const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'short' });
    const dateStr = `${i} (${dayName})`;
    const isWeekend = dayName === 'Sat' || dayName === 'Sun';

    if (leave) {
      const keterangan = leave.reason ? leave.reason.trim() : '';
      const leaveText = keterangan
        ? (keterangan.toUpperCase().startsWith('CUTI:') ? keterangan : `CUTI: ${keterangan}`)
        : 'CUTI';

      rows.push({
        day: i,
        dayName,
        dateStr,
        fullDate: currentYmd,
        isLeave: true,
        leaveText,
        isWeekend,
        inTime: '',
        outTime: '',
        breakTime: '',
        totalWorkingTime: '',
        overtime: '',
        place: '',
        activity: ''
      });
    } else {
      let inTime = '';
      let outTime = '';
      let breakStrRow = '';
      let totalStr = '';
      let overStr = '';
      let placeStr = '';
      let activityStr = '';

      if (att && att.checkInTime) {
        inTime = formatTimeJakarta(att.checkInTime);

        if (att.checkInLat !== null && att.checkInLat !== undefined && att.checkInLng !== null && att.checkInLng !== undefined) {
          const areaMatch = detectProjectArea(att.checkInLat, att.checkInLng, activeGeofences);
          if (areaMatch) {
            placeStr = areaMatch.name;
          } else {
            placeStr = 'WFH'; // Luar area
          }
        } else {
          placeStr = 'Attendance Request';
        }

        let notes = [];
        if (att.checkInNote) notes.push(att.checkInNote);

        if (att.checkOutTime) {
          outTime = formatTimeJakarta(att.checkOutTime);
          if (att.checkOutNote) notes.push(att.checkOutNote);

          const calcResult = calculateWorkingHours(att.checkInTime, att.checkOutTime, breakMinutes, overtimeBreakMinutes);
          const totalMins = calcResult.totalMins;
          const overMins = calculateOvertime(totalMins, 480);

          breakStrRow = formatDuration(calcResult.appliedBreakMins);
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

      rows.push({
        day: i,
        dayName,
        dateStr,
        fullDate: currentYmd,
        isLeave: false,
        leaveText: '',
        isWeekend,
        inTime,
        outTime,
        breakTime: breakStrRow,
        totalWorkingTime: totalStr,
        overtime: overStr,
        place: placeStr,
        activity: activityStr
      });
    }
  }

  const today = new Date();
  const defaultDateStr = today.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '-');
  
  const issuedDate = reportRecord?.submittedAt 
    ? new Date(reportRecord.submittedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '-')
    : defaultDateStr;

  const approvedDate = reportRecord?.approvedAt
    ? new Date(reportRecord.approvedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '-')
    : defaultDateStr;

  const approvedByName = reportRecord?.approvedBy?.name || projectManagerName;

  return {
    header: {
      employeeName: user.name,
      employeeId: user.id.slice(0, 8),
      position: user.jobRoleName || '',
      customer,
      projectName,
      woNumber,
      month: String(month).padStart(2, '0'),
      year: String(year)
    },
    rows,
    summary: {
      totalWorkingHours: formatDuration(sumTotalWorking),
      totalOvertimeHours: formatDuration(sumOverTime),
      sumTotalWorkingMins: sumTotalWorking,
      sumOverTimeMins: sumOverTime
    },
    signatures: {
      issuedBy: {
        name: user.name,
        date: issuedDate
      },
      approvedBy: {
        name: approvedByName,
        date: approvedDate
      }
    },
    procedureNotes: [
      'Bagi karyawan yang tugas luar (khusus untuk standby di satu customer), prosedur absensi adalah sbb:',
      '1. Absen wajib dilakukan pada saat datang dan saat pulang kerja dengan mengisi form terlampir.',
      '2. Setelah akhir bulan, form yang sudah lengkap tsb dikirim beserta lampirannya seperti: form cuti, keterangan dokter, dll via fax ke manager bersangkutan.',
      '3. Setelah disetujui manager, form ini diserahkan ke HRD.'
    ]
  };
}

// Name Function : generateWorkingReport
// Author : Iyan.FID
// Description : Menghasilkan report jam kerja bulanan beserta perhitungan jam lembur karyawan
async function generateWorkingReport(userId, month, year, prisma) {
  const data = await getWorkingReportData(userId, month, year, prisma);
  const { header, rows, summary, signatures, procedureNotes } = data;

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
  sheet.getCell('C3').value = header.employeeName;

  sheet.mergeCells('A4:B4');
  sheet.getCell('A4').value = 'ID No.';
  sheet.mergeCells('C4:D4');
  sheet.getCell('C4').value = header.employeeId;

  sheet.mergeCells('A5:B5');
  sheet.getCell('A5').value = 'Position';
  sheet.mergeCells('C5:D5');
  sheet.getCell('C5').value = header.position;

  // Header Box 2
  sheet.mergeCells('F3:G3');
  sheet.getCell('F3').value = 'Customer';
  sheet.getCell('H3').value = header.customer;

  sheet.mergeCells('F4:G4');
  sheet.getCell('F4').value = 'Project Name';
  sheet.getCell('H4').value = header.projectName;

  sheet.mergeCells('F5:G5');
  sheet.getCell('F5').value = 'WO Number';
  sheet.getCell('H5').value = header.woNumber;

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
  sheet.getCell('B7').value = parseInt(header.month, 10);
  sheet.getCell('C7').value = parseInt(header.year, 10);

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

  for (const item of rows) {
    const row = sheet.getRow(startRow);

    if (item.isLeave) {
      const cellA = row.getCell('A');
      cellA.value = item.dateStr;
      cellA.font = { ...baseFont, size: 10 };
      cellA.alignment = { horizontal: 'center', vertical: 'middle' };
      cellA.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };

      sheet.mergeCells(`B${startRow}:H${startRow}`);
      const cellB = row.getCell('B');
      cellB.value = item.leaveText;

      ['B', 'C', 'D', 'E', 'F', 'G', 'H'].forEach(col => {
        const c = row.getCell(col);
        c.font = { name: 'Arial Unicode MS', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
        c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      });

      row.height = 35;
    } else {
      row.values = {
        A: item.dateStr,
        B: item.inTime,
        C: item.outTime,
        D: item.breakTime,
        E: item.totalWorkingTime,
        F: item.overtime,
        G: item.place,
        H: item.activity
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
      if (item.activity && item.activity.includes('\n')) {
        row.height = 30; // approx 2 lines
      }
    }

    startRow++;
  }

  // Footer Total
  const footerRow = sheet.getRow(startRow);
  sheet.mergeCells(`A${startRow}:D${startRow}`);
  footerRow.getCell('A').value = 'TOTAL';
  footerRow.getCell('E').value = summary.totalWorkingHours;
  footerRow.getCell('F').value = summary.totalOvertimeHours;

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
  sheet.getCell(`B${startRow + 1}`).value = signatures.issuedBy.name;
  sheet.mergeCells(`F${startRow + 1}:H${startRow + 2}`); // big signature box

  sheet.getCell(`A${startRow + 2}`).value = 'Date';
  sheet.mergeCells(`B${startRow + 2}:E${startRow + 2}`);
  sheet.getCell(`B${startRow + 2}`).value = signatures.issuedBy.date;

  startRow += 3;

  sheet.mergeCells(`A${startRow}:A${startRow + 1}`);
  sheet.getCell(`A${startRow}`).value = 'Approved by';
  sheet.mergeCells(`B${startRow}:E${startRow}`);
  sheet.getCell(`B${startRow}`).value = 'Name';
  sheet.mergeCells(`F${startRow}:H${startRow}`);
  sheet.getCell(`F${startRow}`).value = 'Signature';

  sheet.mergeCells(`B${startRow + 1}:E${startRow + 1}`);
  sheet.getCell(`B${startRow + 1}`).value = signatures.approvedBy.name;
  sheet.mergeCells(`F${startRow + 1}:H${startRow + 2}`);

  sheet.getCell(`A${startRow + 2}`).value = 'Date';
  sheet.mergeCells(`B${startRow + 2}:E${startRow + 2}`);
  sheet.getCell(`B${startRow + 2}`).value = signatures.approvedBy.date;

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
  const textMsg = `;00\n${procedureNotes.join('\n')}`;
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
  generateWorkingReport,
  getWorkingReportData,
  formatDuration,
  calculateWorkingHours,
  calculateOvertime
};
