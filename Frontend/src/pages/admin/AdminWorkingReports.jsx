import { useEffect, useMemo, useState } from 'react';
import { Check, Download, Eye, Loader2, MessageSquare, RefreshCw, Search, X } from 'lucide-react';
import api from '../../lib/api';
import AppSelect from '../../components/AppSelect';
import ConfirmDialog from '../../components/ConfirmDialog';
import Pagination from '../../components/Pagination';
import SortableHeader from '../../components/SortableHeader';
import useTableSort from '../../hooks/useTableSort';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import WorkingReportPreviewDialog from '../../components/WorkingReportPreviewDialog';
import PermissionControl from '../../components/PermissionControl';

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
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [page, setPage] = useState({ pageNo: 1, pageSize: 10, totalPages: 1 });
  const [filters, setFilters] = useState({
    search: '',
    projectManagerId: '',
    month: String(new Date().getMonth() + 1),
    year: new Date().getFullYear(),
    status: ''
  });
  const [projectManagers, setProjectManagers] = useState([]);
  const [pmInitialized, setPmInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [previewReport, setPreviewReport] = useState(null);
  const [monthOptions, setMonthOptions] = useState([]);
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    type: null,
    report: null,
    comment: '',
    title: '',
    message: '',
    confirmLabel: '',
    tone: 'brand'
  });
  const { showToast } = useToast();

  const { sortBy, sortOrder, handleSort } = useTableSort('user.name', 'asc');

  const isSystemAdmin = user?.role === 'System Administrator';

  const years = useMemo(() => {
    const current = new Date().getFullYear();
    return [['', 'Semua Tahun'], ...Array.from({ length: 5 }, (_, index) => [current - index, String(current - index)])];
  }, []);

  const pmOptions = useMemo(() => {
    return [
      ['', 'Semua Project Manager'],
      ...projectManagers.map(pm => [pm.id, pm.name])
    ];
  }, [projectManagers]);

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
    api.get('/api/projects').then(r => {
      const dataList = Array.isArray(r.data) ? r.data : (r.data?.data || []);
      const managers = dataList.map(project => project.projectManager).filter(Boolean);
      if (user?.jobRoleCode === 'PM' && user?.id && !managers.some(m => m.id === user.id)) {
        managers.push({ id: user.id, name: user.name });
      }
      const uniqueManagers = [...new Map(managers.map(manager => [manager.id, manager])).values()];
      setProjectManagers(uniqueManagers);
    }).catch(() => { });
  }, [user]);

  useEffect(() => {
    if (!pmInitialized && user?.id) {
      const isPM = user?.jobRoleCode === 'PM' || projectManagers.some(m => m.id === user.id);
      if (isPM) {
        setFilters(current => ({ ...current, projectManagerId: user.id }));
      }
      if (projectManagers.length > 0 || user?.jobRoleCode === 'PM') {
        setPmInitialized(true);
      }
    }
  }, [user, projectManagers, pmInitialized]);

  useEffect(() => {
    const timer = setTimeout(fetchReports, 300);
    return () => clearTimeout(timer);
  }, [filters, page.pageNo, page.pageSize, sortBy, sortOrder]);

  const updateFilter = (key, value) => {
    setFilters(current => ({ ...current, [key]: value }));
    setPage(current => ({ ...current, pageNo: 1 }));
  };

  const handleOpenApprove = (report) => {
    setConfirmModal({
      open: true,
      type: 'approve',
      report,
      comment: '',
      title: 'Approve Working Report',
      message: `Apakah Anda yakin ingin menyetujui Working Report untuk ${report.user?.name} periode ${String(report.month).padStart(2, '0')}/${report.year}?`,
      confirmLabel: 'Approve',
      tone: 'success'
    });
  };

  const handleOpenReject = (report) => {
    setConfirmModal({
      open: true,
      type: 'reject',
      report,
      comment: '',
      title: 'Reject Working Report',
      message: `Masukkan alasan penolakan Working Report untuk ${report.user?.name} periode ${String(report.month).padStart(2, '0')}/${report.year}:`,
      confirmLabel: 'Reject',
      tone: 'danger'
    });
  };

  const handleOpenEditComment = (report) => {
    setConfirmModal({
      open: true,
      type: 'edit-comment',
      report,
      comment: report.rejectionReason || '',
      title: 'Edit Catatan Working Report',
      message: `Perbarui catatan / alasan untuk ${report.user?.name} periode ${String(report.month).padStart(2, '0')}/${report.year}:`,
      confirmLabel: 'Simpan',
      tone: 'brand'
    });
  };

  const handleConfirmAction = async () => {
    const { type, report, comment } = confirmModal;
    if (!report) return;

    if (type === 'reject' && !comment.trim()) {
      showToast({ type: 'error', title: 'Validasi Gagal', message: 'Alasan reject wajib diisi' });
      return;
    }

    try {
      setActionLoading(true);
      if (type === 'approve') {
        await api.put(`/api/working-reports/${report.id}/approve`, { comment: comment.trim() || undefined });
        showToast({ type: 'success', title: 'Berhasil', message: 'Working Report berhasil diapprove' });
      } else if (type === 'reject') {
        await api.put(`/api/working-reports/${report.id}/reject`, { rejectionReason: comment.trim() });
        showToast({ type: 'success', title: 'Berhasil', message: 'Working Report berhasil direject' });
      } else if (type === 'edit-comment') {
        await api.put(`/api/working-reports/${report.id}/comment`, { comment: comment.trim() });
        showToast({ type: 'success', title: 'Berhasil', message: 'Catatan Working Report berhasil diperbarui' });
      }

      setConfirmModal({
        open: false,
        type: null,
        report: null,
        comment: '',
        title: '',
        message: '',
        confirmLabel: '',
        tone: 'brand'
      });
      fetchReports();
    } catch (err) {
      showToast({ type: 'error', title: 'Gagal', message: err.response?.data?.error || 'Aksi gagal diproses' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseConfirmModal = () => {
    if (actionLoading) return;
    setConfirmModal(prev => ({ ...prev, open: false }));
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
          <PermissionControl action="add" apiMethod="POST" apiUrl="/api/working-reports/generate-reminders">
            <button type="button" onClick={generateReminder} disabled={actionLoading} className="btn-ghost text-sm inline-flex items-center gap-2">
              <RefreshCw size={16} />
              Reminder
            </button>
          </PermissionControl>
          <PermissionControl action="add" apiMethod="POST" apiUrl="/api/working-reports/generate-late-status">
            <button type="button" onClick={generateLate} disabled={actionLoading} className="btn-primary text-sm inline-flex items-center gap-2">
              {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              Late
            </button>
          </PermissionControl>
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

      <div className="grid gap-3 md:grid-cols-[1fr_200px_160px_160px_160px] mb-4">
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-500" />
          <input value={filters.search} onChange={e => updateFilter('search', e.target.value)} placeholder="Cari nama atau email..." className="input-dark pl-11 text-sm" />
        </div>
        <AppSelect value={filters.projectManagerId} onChange={value => updateFilter('projectManagerId', value)} options={pmOptions} placeholder="Pilih Project Manager" isDisabled={!isSystemAdmin} />
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
                <SortableHeader label="Catatan" />
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
                    <td className="px-4 py-3 text-sm text-surface-400 max-w-[200px] truncate" title={report.rejectionReason || '-'}>
                      {report.rejectionReason || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => setPreviewReport(report)} className="btn-ghost text-xs inline-flex items-center gap-1 text-brand-500 hover:text-brand-400"><Eye size={14} />View</button>
                        <button type="button" onClick={() => exportReport(report)} className="btn-ghost text-xs inline-flex items-center gap-1"><Download size={14} />Export</button>
                        {displayStatus === 'SUBMITTED' && (
                          <>
                            <button type="button" onClick={() => handleOpenApprove(report)} disabled={actionLoading} className="badge-success"><Check size={13} />Approve</button>
                            <button type="button" onClick={() => handleOpenReject(report)} disabled={actionLoading} className="badge-danger"><X size={13} />Reject</button>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => handleOpenEditComment(report)}
                          disabled={actionLoading}
                          className="badge-warning inline-flex items-center gap-1"
                        >
                          <MessageSquare size={13} />
                          Edit Catatan
                        </button>
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

      <ConfirmDialog
        open={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel={confirmModal.confirmLabel}
        tone={confirmModal.tone}
        loading={actionLoading}
        onConfirm={handleConfirmAction}
        onCancel={handleCloseConfirmModal}
      >
        {(confirmModal.type === 'reject' || confirmModal.type === 'edit-comment' || confirmModal.type === 'approve') && (
          <div className="mt-3">
            <label className="block text-xs font-medium text-surface-300 mb-1.5">
              {confirmModal.type === 'reject'
                ? 'Alasan Penolakan'
                : confirmModal.type === 'approve'
                  ? 'Catatan Approval (Opsional)'
                  : 'Catatan / Alasan'}
              {confirmModal.type === 'reject' && <span className="text-rose-400 ml-1">*</span>}
            </label>
            <textarea
              value={confirmModal.comment}
              onChange={(e) => setConfirmModal(prev => ({ ...prev, comment: e.target.value }))}
              placeholder={
                confirmModal.type === 'reject'
                  ? 'Masukkan alasan reject...'
                  : confirmModal.type === 'approve'
                    ? 'Masukkan catatan approval jika ada (opsional)...'
                    : 'Masukkan catatan...'
              }
              rows={3}
              className="input-dark w-full text-sm resize-none"
              autoFocus
            />
          </div>
        )}
      </ConfirmDialog>

      <WorkingReportPreviewDialog
        open={!!previewReport}
        reportData={previewReport}
        onClose={() => setPreviewReport(null)}
        onEditComment={(report) => {
          handleOpenEditComment(report);
        }}
      />
    </div>
  );
};

export default AdminWorkingReports;
