import { useEffect, useMemo, useState } from 'react';
import { Check, Download, Eye, Loader2, RefreshCw, Search, X } from 'lucide-react';
import api from '../../lib/api';
import AppSelect from '../../components/AppSelect';
import Pagination from '../../components/Pagination';
import SortableHeader from '../../components/SortableHeader';
import useTableSort from '../../hooks/useTableSort';
import { useToast } from '../../context/ToastContext';
import WorkingReportPreviewDialog from '../../components/WorkingReportPreviewDialog';

const statuses = [
  ['', 'Semua Status'],
  ['DRAFT', 'Draft'],
  ['SUBMITTED', 'Submitted'],
  ['APPROVED', 'Approved'],
  ['REJECTED', 'Rejected'],
  ['LATE', 'Late']
];

const statusClass = {
  DRAFT: 'badge-info',
  SUBMITTED: 'badge-info',
  APPROVED: 'badge-success',
  REJECTED: 'badge-danger',
  LATE: 'badge-danger'
};

const formatDeadlineDate = (deadlineDate) => {
  if (!deadlineDate) return '-';
  const date = new Date(deadlineDate);
  return [
    String(date.getUTCDate()).padStart(2, '0'),
    String(date.getUTCMonth() + 1).padStart(2, '0'),
    date.getUTCFullYear()
  ].join('/');
};

const AdminWorkingReports = () => {
  const [reports, setReports] = useState([]);
  const [page, setPage] = useState({ pageNo: 1, pageSize: 10, totalPages: 1 });
  const [filters, setFilters] = useState({
    search: '',
    month: String(new Date().getMonth() + 1),
    year: new Date().getFullYear(),
    status: ''
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [previewReport, setPreviewReport] = useState(null);
  const [monthOptions, setMonthOptions] = useState([]);
  const { showToast } = useToast();

  const { sortBy, sortOrder, handleSort } = useTableSort('user.name', 'asc');

  const years = useMemo(() => {
    const current = new Date().getFullYear();
    return [['', 'Semua Tahun'], ...Array.from({ length: 5 }, (_, index) => [current - index, String(current - index)])];
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/working-reports', {
        params: { ...filters, pageNo: page.pageNo, pageSize: page.pageSize, sortBy, sortOrder }
      });
      setReports(res.data.data || []);
      setPage(current => ({ ...current, ...(res.data.page || {}) }));
    } catch {
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchMonths = async () => {
      try {
        const res = await api.get('/api/system?category=MONTH&isActive=true');
        if (res.data && res.data.length > 0) {
          const fetchedOptions = [];
          const sortedMonths = res.data.sort((a, b) => {
            return parseInt(a.code, 10) - parseInt(b.code, 10);
          });
          sortedMonths.forEach(item => {
            fetchedOptions.push([item.code, item.name || item.code]);
          });
          setMonthOptions(fetchedOptions);
        }
      } catch (error) {
        console.error('Failed to fetch months', error);
      }
    };

    fetchMonths();
  }, []);

  useEffect(() => {
    const timer = setTimeout(fetchReports, 300);
    return () => clearTimeout(timer);
  }, [filters, page.pageNo, page.pageSize, sortBy, sortOrder]);

  const updateFilter = (key, value) => {
    setFilters(current => ({ ...current, [key]: value }));
    setPage(current => ({ ...current, pageNo: 1 }));
  };

  const approveReport = async (id) => {
    setActionLoading(true);
    await api.put(`/api/working-reports/${id}/approve`);
    showToast({ type: 'success', title: 'Berhasil', message: 'Working Report berhasil diapprove' });
    setActionLoading(false);
    fetchReports();
  };

  const rejectReport = async (id) => {
    const rejectionReason = window.prompt('Masukkan alasan reject');
    if (!rejectionReason) return;
    setActionLoading(true);
    await api.put(`/api/working-reports/${id}/reject`, { rejectionReason });
    showToast({ type: 'success', title: 'Berhasil', message: 'Working Report berhasil direject' });
    setActionLoading(false);
    fetchReports();
  };

  const exportReport = async (report) => {
    const res = await api.get('/api/working-reports/export', {
      params: { userId: report.userId, month: report.month, year: report.year },
      responseType: 'blob'
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Working Report - ${String(report.month).padStart(2, '0')}-${report.year} ${report.user?.name}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const generateReminder = async () => {
    setActionLoading(true);
    const res = await api.post('/api/working-reports/generate-reminders', {});
    showToast({ type: 'success', title: 'Berhasil', message: res.data.message || 'Reminder WR selesai dibuat' });
    setActionLoading(false);
  };

  const generateLate = async () => {
    setActionLoading(true);
    const res = await api.post('/api/working-reports/generate-late-status', {});
    showToast({ type: 'success', title: 'Berhasil', message: res.data.message || 'Late status WR selesai dibuat' });
    setActionLoading(false);
    fetchReports();
  };

  const exportZipReports = async () => {
    try {
      setActionLoading(true);
      const res = await api.get('/api/working-reports/export-zip', {
        params: { ...filters },
        responseType: 'blob'
      });

      if (res.data.type === 'application/json') {
        const textData = await res.data.text();
        const jsonError = JSON.parse(textData);
        showToast({ type: 'error', title: 'Gagal', message: jsonError.error || 'Data tidak ditemukan' });
        return;
      }

      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/zip' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Working_Reports_${filters.month}_${filters.year}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      showToast({ type: 'success', title: 'Berhasil', message: 'File ZIP berhasil diunduh' });
    } catch (error) {
      console.error(error);
      showToast({ type: 'error', title: 'Gagal', message: 'Gagal mengunduh file ZIP' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Working Report Admin</h2>
          <p className="text-sm text-surface-400">Monitoring, approval, reminder, dan export Working Report</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={generateReminder} disabled={actionLoading} className="btn-ghost text-sm inline-flex items-center gap-2">
            <RefreshCw size={16} />
            Reminder
          </button>
          <button type="button" onClick={generateLate} disabled={actionLoading} className="btn-primary text-sm inline-flex items-center gap-2">
            {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            Late
          </button>
          <button
            type="button"
            onClick={exportZipReports}
            disabled={actionLoading}
            className="btn-ghost text-sm inline-flex items-center gap-2 text-brand-500 hover:text-brand-400"
          >
            {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            Export ZIP
          </button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_180px_180px_180px] mb-4">
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-500" />
          <input value={filters.search} onChange={e => updateFilter('search', e.target.value)} placeholder="Cari nama atau email..." className="input-dark pl-11 text-sm" />
        </div>
        <AppSelect value={filters.month} onChange={value => updateFilter('month', value)} options={monthOptions} />
        <AppSelect value={filters.year} onChange={value => updateFilter('year', value)} options={years} />
        <AppSelect value={filters.status} onChange={value => updateFilter('status', value)} options={statuses} />
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <SortableHeader label="Karyawan" field="user.name" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={(field) => handleSort(field, () => setPage(p => ({ ...p, pageNo: 1 })))} />
                <SortableHeader label="Periode" field="month" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={(field) => handleSort(field, () => setPage(p => ({ ...p, pageNo: 1 })))} />
                <SortableHeader label="Deadline" field="deadlineDate" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={(field) => handleSort(field, () => setPage(p => ({ ...p, pageNo: 1 })))} />
                <SortableHeader label="Status" field="status" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={(field) => handleSort(field, () => setPage(p => ({ ...p, pageNo: 1 })))} />
                <SortableHeader label="Late" field="lateDays" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={(field) => handleSort(field, () => setPage(p => ({ ...p, pageNo: 1 })))} />
                <SortableHeader label="Aksi" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {reports.map(report => {
                const displayStatus = report.computedStatus || report.status || 'DRAFT';
                return (
                  <tr key={report.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-white">{report.user?.name}</p>
                      <p className="text-xs text-surface-500">{report.user?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-surface-400">{String(report.month).padStart(2, '0')}/{report.year}</td>
                    <td className="px-4 py-3 text-sm text-surface-400">{formatDeadlineDate(report.deadlineDate)}</td>
                    <td className="px-4 py-3"><span className={statusClass[displayStatus] || 'badge-info'}>{displayStatus}</span></td>
                    <td className="px-4 py-3 text-sm text-surface-400">{report.isLate ? `${report.lateDays} hari` : '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => setPreviewReport(report)} className="btn-ghost text-xs inline-flex items-center gap-1 text-brand-500 hover:text-brand-400"><Eye size={14} />View</button>
                        <button type="button" onClick={() => exportReport(report)} className="btn-ghost text-xs inline-flex items-center gap-1"><Download size={14} />Export</button>
                        {displayStatus === 'SUBMITTED' && (
                          <>
                            <button type="button" onClick={() => approveReport(report.id)} className="badge-success"><Check size={13} />Approve</button>
                            <button type="button" onClick={() => rejectReport(report.id)} className="badge-danger"><X size={13} />Reject</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {loading && <div className="py-12 flex justify-center"><Loader2 size={28} className="animate-spin text-brand-400" /></div>}
          {!loading && reports.length === 0 && <div className="py-12 text-center text-sm text-surface-400">Tidak ada data Working Report</div>}
        </div>
        {reports.length > 0 && (
          <div className="p-4 border-t border-white/[0.06] flex justify-end">
            <Pagination page={page} doSearch={(pageNo, pageSize) => setPage(current => ({ ...current, pageNo, pageSize }))} />
          </div>
        )}
      </div>
      <WorkingReportPreviewDialog
        open={!!previewReport}
        reportData={previewReport}
        onClose={() => setPreviewReport(null)}
      />
    </div>
  );
};

export default AdminWorkingReports;
