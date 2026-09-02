import { useEffect, useState } from 'react';
import { Download, FileText, Loader2, MessageSquare, X } from 'lucide-react';
import api from '../lib/api';

const WorkingReportPreviewDialog = ({ open, onClose, reportData, onEditComment }) => {
  const [detail, setDetail] = useState({ report: null, previewData: null });
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!open || !reportData) return;
      try {
        setLoading(true);
        const userId = reportData.userId || reportData.user?.id;
        const res = await api.get(`/api/working-reports/${userId}/${reportData.month}/${reportData.year}`);
        setDetail(res.data);
      } catch {
        setDetail({ report: null, previewData: null });
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [open, reportData]);

  if (!open) return null;

  const currentReport = detail.report || reportData;
  const currentComment = detail.report?.rejectionReason || reportData?.rejectionReason;
  const preview = detail.previewData;
  const header = preview?.header || {};
  const rows = preview?.rows || [];
  const summary = preview?.summary || {};
  const signatures = preview?.signatures || {};
  const procedureNotes = preview?.procedureNotes || [];

  const handleExport = async () => {
    try {
      setExporting(true);
      const userId = reportData.userId || reportData.user?.id;
      const res = await api.get('/api/working-reports/export', {
        params: { userId, month: reportData.month, year: reportData.year },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      const empName = header.employeeName || reportData?.user?.name || 'User';
      const fileName = `Working Report - ${String(reportData.month).padStart(2, '0')}-${reportData.year} ${empName}.xlsx`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4 animate-fade-in">
      <div className="w-full max-w-5xl xl:max-w-6xl max-h-[92vh] flex flex-col glass-card-light animate-scale-in overflow-hidden shadow-2xl border border-white/10">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.08] bg-surface-900/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <FileText size={18} className="text-brand-400" />
            <h3 className="text-sm font-semibold text-white truncate">
              Preview Working Report - {header.employeeName || reportData?.user?.name} ({String(reportData?.month).padStart(2, '0')}/{reportData?.year})
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting || loading}
              className="px-3 py-1.5 bg-emerald-600/80 hover:bg-emerald-600 text-white rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
            >
              {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              Export Excel
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-surface-400 hover:text-white rounded-lg hover:bg-white/[0.06] transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-surface-950/40">
          {/* Notes Banner */}
          {currentComment ? (
            <div className="mb-4 p-3.5 rounded-xl bg-surface-800/90 border border-white/10 text-sm flex items-start justify-between gap-3 shadow-sm">
              <div>
                <span className="font-semibold text-white">Catatan / Alasan: </span>
                <span className="text-surface-300 whitespace-pre-wrap">{currentComment}</span>
              </div>
              {onEditComment && currentReport && (
                <button
                  type="button"
                  onClick={() => onEditComment(currentReport)}
                  className="badge-warning text-xs inline-flex items-center gap-1 shrink-0"
                >
                  <MessageSquare size={12} />
                  Edit Catatan
                </button>
              )}
            </div>
          ) : onEditComment && currentReport ? (
            <div className="mb-4 flex justify-end">
              <button
                type="button"
                onClick={() => onEditComment(currentReport)}
                className="badge-warning text-xs inline-flex items-center gap-1"
              >
                <MessageSquare size={12} />
                + Tambah Catatan
              </button>
            </div>
          ) : null}

          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3">
              <Loader2 size={36} className="animate-spin text-brand-400" />
              <p className="text-sm text-surface-400">Memuat preview dokumen Working Report...</p>
            </div>
          ) : !preview ? (
            <div className="py-20 text-center text-sm text-surface-400">
              Gagal memuat data preview Working Report.
            </div>
          ) : (
            <div className="overflow-x-auto flex justify-center pb-4">
              {/* Document Sheet Layout (Identical to Excel) */}
              <div className="w-full max-w-4xl bg-white text-slate-900 p-6 sm:p-8 rounded-lg shadow-xl border border-slate-300 font-sans text-xs select-text">
                
                {/* Excel Header: Logo & Title */}
                <div className="relative mb-5 flex items-center justify-center min-h-[50px]">
                  <div className="absolute left-0 top-0">
                    <img
                      src="/fujitsu.png"
                      alt="Fujitsu Logo"
                      className="h-10 w-auto object-contain"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold text-blue-700 tracking-wider">
                    Working Report
                  </h1>
                </div>

                {/* Header Information Grid (Boxes 1 & 2) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Box 1 (Left): Employee Info */}
                  <table className="w-full border-collapse border border-slate-400 text-xs">
                    <tbody>
                      <tr>
                        <td className="w-1/3 border border-slate-400 px-2.5 py-1.5 font-bold bg-slate-50 text-slate-800">
                          EmployeeName
                        </td>
                        <td className="w-2/3 border border-slate-400 px-2.5 py-1.5 font-semibold bg-[#FFFF99] text-slate-900">
                          {header.employeeName || '-'}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-400 px-2.5 py-1.5 font-bold bg-slate-50 text-slate-800">
                          ID No.
                        </td>
                        <td className="border border-slate-400 px-2.5 py-1.5 bg-[#FFFF99] text-slate-900">
                          {header.employeeId || '-'}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-400 px-2.5 py-1.5 font-bold bg-slate-50 text-slate-800">
                          Position
                        </td>
                        <td className="border border-slate-400 px-2.5 py-1.5 bg-[#FFFF99] text-slate-900">
                          {header.position || '-'}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Box 2 (Right): Project Info */}
                  <table className="w-full border-collapse border border-slate-400 text-xs">
                    <tbody>
                      <tr>
                        <td className="w-1/3 border border-slate-400 px-2.5 py-1.5 font-bold bg-slate-50 text-slate-800">
                          Customer
                        </td>
                        <td className="w-2/3 border border-slate-400 px-2.5 py-1.5 font-semibold bg-[#FFFF99] text-slate-900">
                          {header.customer || '-'}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-400 px-2.5 py-1.5 font-bold bg-slate-50 text-slate-800">
                          Project Name
                        </td>
                        <td className="border border-slate-400 px-2.5 py-1.5 bg-[#FFFF99] text-slate-900">
                          {header.projectName || '-'}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-400 px-2.5 py-1.5 font-bold bg-slate-50 text-slate-800">
                          WO Number
                        </td>
                        <td className="border border-slate-400 px-2.5 py-1.5 bg-[#FFFF99] text-slate-900">
                          {header.woNumber || '-'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* MONTH / YEAR Box */}
                <div className="mb-4">
                  <table className="border-collapse border border-slate-400 text-xs">
                    <tbody>
                      <tr>
                        <td className="border border-slate-400 px-3 py-1 font-bold bg-slate-50 text-slate-800 text-center">
                          MONTH/YEAR:
                        </td>
                        <td className="border border-slate-400 px-4 py-1 font-bold text-center bg-[#CCFFFF] text-slate-900 min-w-[50px]">
                          {parseInt(header.month, 10)}
                        </td>
                        <td className="border border-slate-400 px-4 py-1 font-bold text-center bg-[#CCFFFF] text-slate-900 min-w-[70px]">
                          {header.year}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Main Attendance Table */}
                <table className="w-full border-collapse border border-slate-400 text-xs mb-4">
                  <thead>
                    {/* Level 1 Header */}
                    <tr className="bg-slate-100 text-blue-700 font-bold text-center">
                      <th rowSpan={2} className="border border-slate-400 px-2 py-1.5 w-[13%]">DATE</th>
                      <th colSpan={3} className="border border-slate-400 px-2 py-1">TIME</th>
                      <th colSpan={2} className="border border-slate-400 px-2 py-1">Working Time</th>
                      <th rowSpan={2} className="border border-slate-400 px-2 py-1.5 w-[20%]">Place</th>
                      <th rowSpan={2} className="border border-slate-400 px-2 py-1.5 w-[33%]">ACTIVITY</th>
                    </tr>
                    {/* Level 2 Header */}
                    <tr className="bg-slate-100 text-blue-700 font-bold text-center">
                      <th className="border border-slate-400 px-1 py-1 w-[7%]">IN</th>
                      <th className="border border-slate-400 px-1 py-1 w-[7%]">OUT</th>
                      <th className="border border-slate-400 px-1 py-1 w-[7%]">BREAK</th>
                      <th className="border border-slate-400 px-1 py-1 w-[7%]">Total</th>
                      <th className="border border-slate-400 px-1 py-1 w-[8%]">OverTime</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => {
                      if (row.isLeave) {
                        return (
                          <tr key={row.day} className="h-9">
                            <td className="border border-slate-400 px-2 py-1 text-center font-medium text-slate-800">
                              {row.dateStr}
                            </td>
                            <td
                              colSpan={7}
                              className="border border-slate-400 px-3 py-1.5 text-center font-bold text-sm bg-[#FF0000] text-white tracking-wide uppercase"
                            >
                              {row.leaveText}
                            </td>
                          </tr>
                        );
                      }

                      return (
                        <tr
                          key={row.day}
                          className={`hover:bg-slate-50/80 ${row.isWeekend ? 'bg-slate-50/40 text-slate-600' : 'text-slate-900'}`}
                        >
                          <td className="border border-slate-400 px-2 py-1 text-center font-medium whitespace-nowrap">
                            {row.dateStr}
                          </td>
                          <td className="border border-slate-400 px-1 py-1 text-center font-mono">
                            {row.inTime}
                          </td>
                          <td className="border border-slate-400 px-1 py-1 text-center font-mono">
                            {row.outTime}
                          </td>
                          <td className="border border-slate-400 px-1 py-1 text-center font-mono">
                            {row.breakTime}
                          </td>
                          <td className="border border-slate-400 px-1 py-1 text-center font-mono font-medium">
                            {row.totalWorkingTime}
                          </td>
                          <td className="border border-slate-400 px-1 py-1 text-center font-mono">
                            {row.overtime}
                          </td>
                          <td className="border border-slate-400 px-2 py-1 text-center text-[11px] truncate max-w-[150px]" title={row.place}>
                            {row.place}
                          </td>
                          <td className="border border-slate-400 px-2.5 py-1 text-left whitespace-pre-wrap leading-relaxed text-[11px]">
                            {row.activity}
                          </td>
                        </tr>
                      );
                    })}

                    {/* TOTAL Row */}
                    <tr className="font-bold text-slate-900 bg-slate-50">
                      <td
                        colSpan={4}
                        className="border border-slate-400 px-3 py-1.5 text-center font-bold text-xs bg-[#CCFFFF] tracking-wider"
                      >
                        TOTAL
                      </td>
                      <td className="border border-slate-400 px-1 py-1.5 text-center font-mono text-xs">
                        {summary.totalWorkingHours || '00.00'}
                      </td>
                      <td className="border border-slate-400 px-1 py-1.5 text-center font-mono text-xs">
                        {summary.totalOvertimeHours || '00.00'}
                      </td>
                      <td colSpan={2} className="border border-slate-400 px-2 py-1.5 bg-slate-50"></td>
                    </tr>
                  </tbody>
                </table>

                {/* Signatures Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Issued by (Employee) */}
                  <table className="w-full border-collapse border border-slate-400 text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-800 font-bold text-center">
                        <th className="border border-slate-400 px-2 py-1 w-1/4">Issued by</th>
                        <th className="border border-slate-400 px-2 py-1 w-1/2">Name</th>
                        <th className="border border-slate-400 px-2 py-1 w-1/4 text-blue-700">Signature</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-400 px-2 py-1 text-center font-bold bg-slate-50">
                          {/* Left Empty as per format */}
                        </td>
                        <td className="border border-slate-400 px-2 py-1 text-left font-medium">
                          {signatures.issuedBy?.name || header.employeeName || '-'}
                        </td>
                        <td
                          rowSpan={2}
                          className="border border-slate-400 px-2 py-1 text-center bg-[#FFFF99] align-middle h-14"
                        >
                          <span className="text-[10px] text-slate-400 italic">Signature</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-400 px-2 py-1 text-center font-bold bg-slate-50">
                          Date
                        </td>
                        <td className="border border-slate-400 px-2 py-1 text-left font-mono">
                          {signatures.issuedBy?.date || '-'}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Approved by (Project Manager) */}
                  <table className="w-full border-collapse border border-slate-400 text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-800 font-bold text-center">
                        <th className="border border-slate-400 px-2 py-1 w-1/4">Approved by</th>
                        <th className="border border-slate-400 px-2 py-1 w-1/2">Name</th>
                        <th className="border border-slate-400 px-2 py-1 w-1/4 text-blue-700">Signature</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-400 px-2 py-1 text-center font-bold bg-slate-50">
                          {/* Left Empty as per format */}
                        </td>
                        <td className="border border-slate-400 px-2 py-1 text-left font-medium">
                          {signatures.approvedBy?.name || '-'}
                        </td>
                        <td
                          rowSpan={2}
                          className="border border-slate-400 px-2 py-1 text-center bg-[#FFFF99] align-middle h-14"
                        >
                          <span className="text-[10px] text-slate-400 italic">Signature</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-400 px-2 py-1 text-center font-bold bg-slate-50">
                          Date
                        </td>
                        <td className="border border-slate-400 px-2 py-1 text-left font-mono">
                          {signatures.approvedBy?.date || '-'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Footer SOP Procedures Box */}
                <div className="border border-slate-400 p-3 bg-slate-50/50 rounded-none text-[11px] leading-relaxed text-slate-700">
                  <p className="font-mono text-[10px] text-slate-400 mb-0.5">;00</p>
                  {procedureNotes.map((note, index) => (
                    <p key={index} className={index === 0 ? 'font-medium text-slate-800 mb-1' : 'ml-1'}>
                      {note}
                    </p>
                  ))}
                </div>

              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default WorkingReportPreviewDialog;
