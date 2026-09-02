import { useCallback, useMemo, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Check, Download, Eye, Loader2, Search, X } from 'lucide-react';
import { format } from 'date-fns';
import api from '../lib/api';
import AppSelect from '../components/AppSelect';
import Pagination from '../components/Pagination';
import SortableHeader from '../components/SortableHeader';
import useTableSort from '../hooks/useTableSort';
import { useAuth } from '../context/AuthContext';
import { downloadBase64File, viewBase64File } from '../lib/fileValidation';
import { useToast } from '../context/ToastContext';
import PermissionControl from '../components/PermissionControl';

// Name Function : LeaveManagement
// Author : Iyan.FID
// Description : Halaman manajemen pengajuan cuti karyawan dan proses approval/rejection.
const LeaveManagement = () => {
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [statuses, setStatuses] = useState([['', 'Semua Status']]);
  const defaultStatusClass = {
    PENDING: 'badge-warning',
    APPROVED_BY_PM: 'badge-info',
    APPROVED: 'badge-success',
    REJECTED: 'badge-danger',
    CANCELLED: 'badge-danger',
  };
  const [statusClass, setStatusClass] = useState(defaultStatusClass);
  const [statusLabels, setStatusLabels] = useState({
    PENDING: 'Pending',
    APPROVED_BY_PM: 'Approved by PM',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    CANCELLED: 'Cancelled',
  });
  const [leaveTypeLabels, setLeaveTypeLabels] = useState({
    ANNUAL_LEAVE: 'Cuti Tahunan',
    OTHERS: 'Cuti Khusus/Lainnya',
  });
  const [filters, setFilters] = useState({
    search: '',
    projectManagerId: '',
    status: searchParams.get('status') || ''
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [evidenceImage, setEvidenceImage] = useState(null);
  const [projectManagers, setProjectManagers] = useState([]);
  const [pmInitialized, setPmInitialized] = useState(false);

  const isSystemAdmin = user?.role === 'System Administrator' || user?.roles?.includes('System Administrator');

  const pmOptions = useMemo(() => {
    return [
      ['', 'Semua Project Manager'],
      ...projectManagers.map(pm => [pm.id, pm.name])
    ];
  }, [projectManagers]);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [statusRes, typeRes] = await Promise.all([
          api.get('/api/system?category=LEAVE_STATUS&isActive=true'),
          api.get('/api/system?category=LEAVE_TYPE&isActive=true')
        ]);
        const dynamicStatuses = [['', 'Semua Status']];
        const dynamicStatusClass = {};
        const dynamicStatusLabels = {};

        if (statusRes.data && statusRes.data.length > 0) {
          statusRes.data.forEach(item => {
            dynamicStatuses.push([item.code, item.name]);
            if (item.name) dynamicStatusLabels[item.code] = item.name;
            if (item.description) {
              dynamicStatusClass[item.code] = (item.code === 'PENDING' && item.description === 'badge-info')
                ? 'badge-warning'
                : item.description;
            }
          });
        }

        setStatuses(dynamicStatuses);
        setStatusLabels(prev => ({ ...prev, ...dynamicStatusLabels }));
        setStatusClass(prev => ({ ...prev, ...dynamicStatusClass }));

        if (typeRes.data && typeRes.data.length > 0) {
          const dynamicTypes = {};
          typeRes.data.forEach(item => {
            dynamicTypes[item.code] = item.name;
          });
          setLeaveTypeLabels(prev => ({ ...prev, ...dynamicTypes }));
        }
      } catch (error) {
        console.error('Failed to fetch leave metadata', error);
      }
    };

    fetchMetadata();
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
  const [page, setPage] = useState({ pageNo: 1, pageSize: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const { sortBy, sortOrder, handleSort } = useTableSort('createdAt', 'desc');

  const closeEvidenceModal = () => {
    setIsModalOpen(false);
    setEvidenceImage(null);
  };

  const fetchLeaves = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/leaves', {
        params: { ...filters, pageNo: page.pageNo, pageSize: page.pageSize, sortBy, sortOrder }
      });
      setLeaves(res.data.data || []);
      setPage(current => ({ ...current, ...(res.data.page || {}) }));
    } catch {
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  }, [filters, page.pageNo, page.pageSize, sortBy, sortOrder]);

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
      await handler();
      showToast({ type: 'success', title: 'Berhasil', message: successMessage });
      fetchLeaves();
    } catch (err) {
      showToast({ type: 'error', title: 'Gagal', message: err.response?.data?.error || 'Aksi gagal diproses' });
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
      const imageUrl = evidence.fileData.startsWith('data:')
        ? evidence.fileData
        : `data:${evidence.fileType || 'image/png'};base64,${evidence.fileData}`;
      setEvidenceImage(imageUrl);
      setIsModalOpen(true);
    } catch (err) {
      showToast({ type: 'error', title: 'Gagal', message: err.response?.data?.error || 'Gagal membuka evidence photo' });
    }
  };
  const downloadEvidence = async (id) => {
    try {
      const evidence = await fetchEvidence(id);
      downloadBase64File(evidence.fileData, evidence.fileName, evidence.fileType);
    } catch (err) {
      showToast({ type: 'error', title: 'Gagal', message: err.response?.data?.error || 'Gagal download evidence photo' });
    }
  };

  const isAdmin = user?.role === 'System Administrator';

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">Annual Leave Approval</h2>
        <p className="text-sm text-surface-400">Approval cuti tahunan karyawan</p>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_280px_220px] mb-4">
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-500" />
          <input value={filters.search} onChange={e => updateFilter('search', e.target.value)} placeholder="Cari nama atau email..." className="input-dark pl-11 text-sm" />
        </div>
        <AppSelect value={filters.projectManagerId} onChange={value => updateFilter('projectManagerId', value)} options={pmOptions} placeholder="Pilih Project Manager" isDisabled={!isSystemAdmin} />
        <AppSelect value={filters.status} onChange={value => updateFilter('status', value)} options={statuses} />
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <SortableHeader label="Karyawan" field="user.name" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={(field) => handleSort(field, () => setPage(p => ({ ...p, pageNo: 1 })))} />
                <SortableHeader label="Jenis Cuti" field="leaveType" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={(field) => handleSort(field, () => setPage(p => ({ ...p, pageNo: 1 })))} />
                <SortableHeader label="Periode" field="startDate" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={(field) => handleSort(field, () => setPage(p => ({ ...p, pageNo: 1 })))} />
                <SortableHeader label="Total" field="totalDays" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={(field) => handleSort(field, () => setPage(p => ({ ...p, pageNo: 1 })))} />
                <SortableHeader label="Quota Cuti" />
                <SortableHeader label="Status" field="status" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={(field) => handleSort(field, () => setPage(p => ({ ...p, pageNo: 1 })))} />
                <SortableHeader label="Created Date" field="createdAt" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={(field) => handleSort(field, () => setPage(p => ({ ...p, pageNo: 1 })))} />
                <SortableHeader label="Evidence" />
                <SortableHeader label="Info" />
                <SortableHeader label="Aksi" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {leaves.map(item => (
                <tr key={item.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-white">{item.user?.name}</p>
                    <p className="text-xs text-surface-500">{item.user?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={item.leaveType === 'OTHERS' ? 'badge-warning' : 'badge-info'}>
                      {leaveTypeLabels[item.leaveType] || (item.leaveType === 'OTHERS' ? 'Cuti Khusus/Lainnya' : 'Cuti Tahunan')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-surface-300">
                    {format(new Date(item.startDate), 'dd MMM yyyy')} - {format(new Date(item.endDate), 'dd MMM yyyy')}
                  </td>
                  <td className="px-4 py-3 text-sm text-surface-400">{item.totalDays} hari</td>
                  <td className="px-4 py-3 text-sm">
                    {item.leaveBalance ? (
                      <div className="flex flex-col gap-0.5">
                        <span className={`text-xs font-semibold ${item.leaveBalance.remainingLeaveDays <= 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          Sisa: {item.leaveBalance.remainingLeaveDays} hari
                        </span>
                        <span className="text-[11px] text-surface-400">
                          Jatah: {item.leaveBalance.entitlementDays} | Terpakai: {item.leaveBalance.usedLeaveDays}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-surface-500">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3"><span className={statusClass[item.status] || (item.status === 'PENDING' ? 'badge-warning' : 'badge-info')}>{statusLabels[item.status] || item.status}</span></td>
                  <td className="px-4 py-3 text-sm text-surface-400">
                    {format(new Date(item.createdAt), 'dd MMM yyyy')}
                  </td>
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
                      {item.status === 'PENDING' && (isAdmin || item.isCurrentUserPm) && (
                        <PermissionControl action="edit" apiUrl="/api/leaves/*/approve-pm">
                          <button type="button" disabled={actionLoading} onClick={() => approvePm(item.id)} className="badge-success"><Check size={13} />PM Approve</button>
                        </PermissionControl>
                      )}
                      {item.status === 'PENDING' && (isAdmin || item.isCurrentUserPm) && (
                        <PermissionControl action="edit" apiUrl="/api/leaves/*/reject">
                          <button type="button" disabled={actionLoading} onClick={() => rejectLeave(item.id)} className="badge-danger"><X size={13} />Reject</button>
                        </PermissionControl>
                      )}
                      {!(
                        item.status === 'PENDING' && (isAdmin || item.isCurrentUserPm)
                      ) && !(item.leaveType === 'OTHERS' && item.hasEvidencePhoto) && <span className="text-xs text-surface-500">-</span>}
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

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl rounded-lg bg-white p-4 shadow-xl">

            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Evidence Photo</h3>
              <button
                onClick={closeEvidenceModal}
                className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex justify-center overflow-hidden rounded bg-gray-50 p-2">
              {evidenceImage ? (
                <img
                  src={evidenceImage}
                  alt="Evidence"
                  className="max-h-[75vh] w-auto object-contain"
                />
              ) : (
                <p className="py-10 text-gray-500">Gambar tidak tersedia</p>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;
