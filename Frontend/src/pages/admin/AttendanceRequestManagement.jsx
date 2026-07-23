import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { Loader2, Search, Eye, X } from 'lucide-react';
import Pagination from '../../components/Pagination';
import AppSelect from '../../components/AppSelect';
import SortableHeader from '../../components/SortableHeader';
import useTableSort from '../../hooks/useTableSort';

const RequestTypeBadge = ({ type }) => {
  const styles = {
    CHECK_IN: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    CHECK_OUT: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    BOTH: 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
  };
  const labels = { CHECK_IN: 'Check-In', CHECK_OUT: 'Check-Out', BOTH: 'In & Out' };

  return (
    <span className={`px-2 py-1 rounded-md text-xs font-medium ${styles[type] || 'bg-surface-700 text-surface-200'}`}>
      {labels[type] || type}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    PENDING: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    APPROVED: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    DECLINED: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    CANCELLED: 'bg-surface-500/10 text-surface-400 border border-surface-500/20'
  };

  return (
    <span className={`px-2 py-1 rounded-md text-xs font-medium ${styles[status] || 'bg-surface-700 text-surface-200'}`}>
      {status}
    </span>
  );
};

export default function AttendanceRequestManagement() {
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [statuses, setStatuses] = useState([]);

  const { sortBy, sortOrder, handleSort } = useTableSort('requestDate', 'desc');


  const [selectedReq, setSelectedReq] = useState(null);
  const [evidenceData, setEvidenceData] = useState(null);
  const [loadingEvidence, setLoadingEvidence] = useState(false);

  const [declineReason, setDeclineReason] = useState('');
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const res = await api.get('/api/system?category=ATTENDANCE_REQUEST_STATUS&isActive=true');
        if (res.data && res.data.length > 0) {
          setStatuses([{ code: '', name: 'Semua Status' }, ...res.data]);
        }
      } catch (error) {
        console.error('Failed to fetch attendance request statuses', error);
      }
    };
    fetchStatuses();
  }, []);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/attendance-requests', {
        params: {
          search,
          status: statusFilter,
          pageNo: pagination.page,
          pageSize: pagination.limit,
          sortBy,
          sortOrder
        }
      });
      setRequests(res.data.data);
      setPagination(prev => ({
        ...prev,
        page: res.data.page,
        total: res.data.total,
        totalPages: res.data.totalPages
      }));
    } catch (err) {
      showToast({ type: 'error', message: 'Gagal memuat request' });
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, pagination.page, pagination.limit, sortBy, sortOrder, showToast]);

  useEffect(() => {
    const timer = setTimeout(fetchRequests, 300);
    return () => clearTimeout(timer);
  }, [fetchRequests]);

  const loadEvidence = async (req) => {
    setSelectedReq(req);
    setEvidenceData(null);
    setLoadingEvidence(true);
    try {
      const res = await api.get(`/api/attendance-requests/${req.id}/evidence`);
      setEvidenceData(res.data.evidencePhoto);
    } catch (err) {
      showToast({ type: 'error', message: 'Gagal memuat evidence' });
      setSelectedReq(null);
    } finally {
      setLoadingEvidence(false);
    }
  };

  const handleApprove = async () => {
    const confirmed = await confirm({
      title: 'Setujui Request?',
      message: 'Apakah Anda yakin ingin menyetujui request ini?',
      confirmText: 'Ya, Setujui',
      cancelText: 'Batal',
      variant: 'info'
    });
    if (!confirmed) return;
    setActionLoading(true);
    try {
      await api.put(`/api/attendance-requests/${selectedReq.id}/approve`, {
        adminNote: 'Disetujui Admin'
      });
      showToast({ type: 'success', message: 'Request disetujui' });
      setSelectedReq(null);
      fetchRequests();
    } catch (err) {
      showToast({ type: 'error', message: err.response?.data?.error || 'Gagal menyetujui request' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecline = async (e) => {
    e.preventDefault();
    if (!declineReason.trim()) return showToast({ type: 'error', message: 'Alasan penolakan wajib diisi' });

    setActionLoading(true);
    try {
      await api.put(`/api/attendance-requests/${selectedReq.id}/decline`, {
        declineReason
      });
      showToast({ type: 'success', message: 'Request ditolak' });
      setIsDeclineModalOpen(false);
      setSelectedReq(null);
      setDeclineReason('');
      fetchRequests();
    } catch (err) {
      showToast({ type: 'error', message: err.response?.data?.error || 'Gagal menolak request' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Attendance Requests</h1>
          <p className="text-surface-400 text-sm mt-1">Kelola request pembaruan absensi member.</p>
        </div>
      </div>

      <div className="glass-card p-4 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            placeholder="Cari nama member..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-dark w-full pl-10"
          />
        </div>
        <div className="w-full md:w-48">
          <AppSelect
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
            options={statuses.map(status => ({ value: status.code, label: status.name }))}
            className="w-full"
          />
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-white/[0.02] text-surface-400 border-b border-white/5">
                <SortableHeader label="Member" field="user.name" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={(field) => handleSort(field, () => setPagination(p => ({ ...p, page: 1 })))} />
                <SortableHeader label="Tanggal Request" field="requestDate" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={(field) => handleSort(field, () => setPagination(p => ({ ...p, page: 1 })))} />
                <SortableHeader label="Jenis" field="requestType" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={(field) => handleSort(field, () => setPagination(p => ({ ...p, page: 1 })))} />
                <SortableHeader label="Waktu" />
                <SortableHeader label="Alasan" field="reason" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={(field) => handleSort(field, () => setPagination(p => ({ ...p, page: 1 })))} />
                <SortableHeader label="Status" field="status" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={(field) => handleSort(field, () => setPagination(p => ({ ...p, page: 1 })))} />
                <SortableHeader label="Aksi" align="right" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-surface-300">
              {loading ? (
                <tr><td colSpan="7" className="text-center py-8"><Loader2 className="animate-spin mx-auto text-brand-400" /></td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-8 text-surface-400">Tidak ada data.</td></tr>
              ) : (
                requests.map(req => (
                  <tr key={req.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{req.user.name}</div>
                      <div className="text-xs text-surface-400">{req.user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      {format(new Date(req.requestDate), 'dd MMM yyyy', { locale: localeId })}
                    </td>
                    <td className="px-6 py-4">
                      <RequestTypeBadge type={req.requestType} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-xs">
                        {req.requestedCheckInTime && <span>In: {format(new Date(req.requestedCheckInTime), 'HH:mm')}</span>}
                        {req.requestedCheckOutTime && <span>Out: {format(new Date(req.requestedCheckOutTime), 'HH:mm')}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-[200px] truncate" title={req.reason}>
                      {req.reason}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => loadEvidence(req)}
                        className="text-xs text-brand-400 hover:text-brand-300 bg-brand-500/10 hover:bg-brand-500/20 px-2 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        <Eye size={14} /> Detail / Evidence
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.totalPages > 0 && (
          <div className="p-4 border-t border-white/5">
            <Pagination
              page={{ pageNo: pagination.page, pageSize: pagination.limit, totalPages: pagination.totalPages }}
              doSearch={(pageNo, pageSize) => {
                setPagination(prev => ({ ...prev, page: pageNo, limit: pageSize }));
              }}
            />
          </div>
        )}
      </div>

      {/* Modal Detail / Evidence */}
      {selectedReq && !isDeclineModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <h3 className="text-lg font-semibold text-white">Detail Request Absensi</h3>
              <button onClick={() => setSelectedReq(null)} className="text-surface-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-xs text-surface-400 mb-1">Member</p>
                  <p className="text-sm font-medium text-white">{selectedReq.user.name}</p>
                </div>
                <div>
                  <p className="text-xs text-surface-400 mb-1">Tanggal Request</p>
                  <p className="text-sm font-medium text-white">{format(new Date(selectedReq.requestDate), 'EEEE, dd MMMM yyyy', { locale: localeId })}</p>
                </div>
                <div>
                  <p className="text-xs text-surface-400 mb-1">Waktu</p>
                  <p className="flex gap-2 text-sm font-medium text-white">
                    {selectedReq.requestedCheckInTime && (
                      <span>In: {format(new Date(selectedReq.requestedCheckInTime), 'HH:mm')}</span>
                    )}
                    {selectedReq.requestedCheckOutTime && (
                      <span>Out: {format(new Date(selectedReq.requestedCheckOutTime), 'HH:mm')}</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-surface-400 mb-1">Status</p>
                  <StatusBadge status={selectedReq.status} />
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-surface-400 mb-1">Alasan</p>
                  <p className="text-sm text-surface-200 bg-white/[0.02] p-3 rounded-lg border border-white/5">{selectedReq.reason}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-surface-400 mb-2">Bukti (Evidence)</p>
                <div className="bg-black/40 rounded-xl border border-white/10 flex items-center justify-center overflow-hidden min-h-[300px]">
                  {loadingEvidence ? (
                    <Loader2 size={32} className="animate-spin text-brand-400" />
                  ) : evidenceData ? (
                    <img src={evidenceData} alt="Evidence" className="max-w-full max-h-[60vh] object-contain" />
                  ) : (
                    <p className="text-surface-500 text-sm">Evidence tidak tersedia</p>
                  )}
                </div>
              </div>
            </div>

            {selectedReq.status === 'PENDING' && (
              <div className="p-4 border-t border-white/10 bg-white/[0.02] flex justify-end gap-3">
                <button
                  onClick={() => setIsDeclineModalOpen(true)}
                  disabled={actionLoading}
                  className="btn-secondary text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 hover:border-rose-500/20 border-surface-700"
                >
                  Tolak Request
                </button>
                <button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="btn-primary"
                >
                  {actionLoading ? <Loader2 size={16} className="animate-spin" /> : 'Setujui Request'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Decline Modal */}
      {isDeclineModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-rose-400">Tolak Request</h3>
              <button onClick={() => setIsDeclineModalOpen(false)} className="text-surface-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleDecline} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">Alasan Penolakan</label>
                <textarea
                  className="input-dark w-full resize-none"
                  rows="3"
                  placeholder="Misal: Bukti tidak valid, dll"
                  value={declineReason}
                  onChange={e => setDeclineReason(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setIsDeclineModalOpen(false)} className="btn-secondary">
                  Batal
                </button>
                <button type="submit" disabled={actionLoading} className="px-4 py-2 text-sm font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg hover:bg-rose-500/20 transition-colors flex items-center gap-2">
                  {actionLoading ? <Loader2 size={16} className="animate-spin" /> : 'Tolak Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
