import { useCallback, useEffect, useState } from 'react';
import { Check, Download, Eye, Loader2, Search, X } from 'lucide-react';
import { format } from 'date-fns';
import api from '../lib/api';
import AppSelect from '../components/AppSelect';
import Pagination from '../components/Pagination';
import { useAuth } from '../context/AuthContext';
import { downloadBase64File, viewBase64File } from '../lib/fileValidation';


const LeaveManagement = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [statuses, setStatuses] = useState([['', 'Semua Status']]);
  const [statusClass, setStatusClass] = useState({});
  const [filters, setFilters] = useState({ search: '', status: '' });

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const res = await api.get('/api/system?category=LEAVE_STATUS&isActive=true');
        const dynamicStatuses = [['', 'Semua Status']];
        const dynamicStatusClass = {};

        if (res.data && res.data.length > 0) {
          res.data.forEach(item => {
            dynamicStatuses.push([item.code, item.name]);
            dynamicStatusClass[item.code] = item.description || 'badge-info';
          });
        }

        setStatuses(dynamicStatuses);
        setStatusClass(dynamicStatusClass);
      } catch (error) {
        console.error('Failed to fetch leave statuses', error);
      }
    };

    fetchStatuses();
  }, []);
  const [page, setPage] = useState({ pageNo: 1, pageSize: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchLeaves = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/leaves', {
        params: { ...filters, pageNo: page.pageNo, pageSize: page.pageSize }
      });
      setLeaves(res.data.data || []);
      setPage(current => ({ ...current, ...(res.data.page || {}) }));
    } catch {
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  }, [filters, page.pageNo, page.pageSize]);

  useEffect(() => {
    const timer = setTimeout(fetchLeaves, 300);
    return () => clearTimeout(timer);
  }, [fetchLeaves]);

  const updateFilter = (key, value) => {
    setFilters(current => ({ ...current, [key]: value }));
    setPage(current => ({ ...current, pageNo: 1 }));
  };

  const runAction = async (handler, successMessage) => {
    try {
      setActionLoading(true);
      setError('');
      await handler();
      setMessage(successMessage);
      fetchLeaves();
    } catch (err) {
      setError(err.response?.data?.error || 'Aksi gagal diproses');
    } finally {
      setActionLoading(false);
    }
  };

  const approvePm = (id) => runAction(() => api.put(`/api/leaves/${id}/approve-pm`), 'Pengajuan cuti berhasil diapprove PM');
  const approveAdmin = (id) => runAction(() => api.put(`/api/leaves/${id}/approve-admin`), 'Pengajuan cuti berhasil diapprove Admin');
  const rejectLeave = (id) => {
    const rejectionReason = window.prompt('Masukkan alasan reject');
    if (!rejectionReason) return;
    runAction(() => api.put(`/api/leaves/${id}/reject`, { rejectionReason }), 'Pengajuan cuti berhasil direject');
  };
  const fetchEvidence = async (id) => {
    const res = await api.get(`/api/leaves/${id}/evidence-photo`);
    return res.data;
  };
  const viewEvidence = async (id) => {
    try {
      const evidence = await fetchEvidence(id);
      await viewBase64File(evidence.fileData, evidence.fileType);
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal membuka evidence photo');
    }
  };
  const downloadEvidence = async (id) => {
    try {
      const evidence = await fetchEvidence(id);
      downloadBase64File(evidence.fileData, evidence.fileName, evidence.fileType);
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal download evidence photo');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">Annual Leave Approval</h2>
        <p className="text-sm text-surface-400">Approval cuti tahunan karyawan</p>
      </div>

      {message && <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">{message}</div>}
      {error && <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">{error}</div>}

      <div className="grid gap-3 md:grid-cols-[1fr_220px] mb-4">
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-500" />
          <input value={filters.search} onChange={e => updateFilter('search', e.target.value)} placeholder="Cari nama atau email..." className="input-dark pl-11 text-sm" />
        </div>
        <AppSelect value={filters.status} onChange={value => updateFilter('status', value)} options={statuses} />
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="px-4 py-3 text-xs font-semibold text-surface-400 uppercase">Karyawan</th>
                <th className="px-4 py-3 text-xs font-semibold text-surface-400 uppercase">Periode</th>
                <th className="px-4 py-3 text-xs font-semibold text-surface-400 uppercase">Total</th>
                <th className="px-4 py-3 text-xs font-semibold text-surface-400 uppercase">Status</th>
                <th className="px-4 py-3 text-xs font-semibold text-surface-400 uppercase">Evidence</th>
                <th className="px-4 py-3 text-xs font-semibold text-surface-400 uppercase">Info</th>
                <th className="px-4 py-3 text-xs font-semibold text-surface-400 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {leaves.map(item => (
                <tr key={item.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-white">{item.user?.name}</p>
                    <p className="text-xs text-surface-500">{item.user?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-surface-300">
                    {format(new Date(item.startDate), 'dd MMM yyyy')} - {format(new Date(item.endDate), 'dd MMM yyyy')}
                  </td>
                  <td className="px-4 py-3 text-sm text-surface-400">{item.totalDays} hari</td>
                  <td className="px-4 py-3"><span className={statusClass[item.status] || 'badge-info'}>{item.status}</span></td>
                  <td className="px-4 py-3 text-sm text-surface-400">
                    {item.hasEvidencePhoto ? 'Evidence tersedia' : item.leaveType === 'OTHERS' ? 'Tidak ada evidence photo' : 'Tidak ada evidence'}
                  </td>
                  <td className="px-4 py-3 text-sm text-surface-400">
                    {item.isOverQuota ? <span className="badge-danger mr-2">Over Quota</span> : null}
                    {item.reason}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {item.leaveType === 'OTHERS' && item.hasEvidencePhoto && (
                        <>
                          <button type="button" disabled={actionLoading} onClick={() => viewEvidence(item.id)} className="badge-info"><Eye size={13} />Lihat Evidence</button>
                          <button type="button" disabled={actionLoading} onClick={() => downloadEvidence(item.id)} className="badge-info"><Download size={13} />Download Evidence</button>
                        </>
                      )}
                      {item.status === 'PENDING' && (
                        <button type="button" disabled={actionLoading} onClick={() => approvePm(item.id)} className="badge-success"><Check size={13} />PM Approve</button>
                      )}
                      {user?.role === 'ADMIN' && ['PENDING', 'APPROVED_BY_PM'].includes(item.status) && (
                        <button type="button" disabled={actionLoading} onClick={() => approveAdmin(item.id)} className="badge-success"><Check size={13} />Admin Approve</button>
                      )}
                      {['PENDING', 'APPROVED_BY_PM'].includes(item.status) && (
                        <button type="button" disabled={actionLoading} onClick={() => rejectLeave(item.id)} className="badge-danger"><X size={13} />Reject</button>
                      )}
                      {!['PENDING', 'APPROVED_BY_PM'].includes(item.status) && !(item.leaveType === 'OTHERS' && item.hasEvidencePhoto) && <span className="text-xs text-surface-500">-</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <div className="py-12 flex justify-center"><Loader2 size={28} className="animate-spin text-brand-400" /></div>}
          {!loading && leaves.length === 0 && <div className="py-12 text-center text-sm text-surface-400">Tidak ada data cuti</div>}
        </div>
        {leaves.length > 0 && (
          <div className="p-4 border-t border-white/[0.06] flex justify-end">
            <Pagination page={page} doSearch={(pageNo, pageSize) => setPage(current => ({ ...current, pageNo, pageSize }))} />
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveManagement;
