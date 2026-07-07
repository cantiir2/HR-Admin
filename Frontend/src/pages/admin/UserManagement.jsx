import React, { useCallback, useEffect, useRef, useState } from 'react';
import api from '../../lib/api';
import {
  Pencil, Trash2, Search, X, UserPlus, Eye, Download, Loader2,
  FileText, Shield, Phone, UsersRound, Briefcase
} from 'lucide-react';
import { format } from 'date-fns';
import { useConfirm } from '../../context/ConfirmContext';
import UserAvatar from '../../components/UserAvatar';
import AppSelect from '../../components/AppSelect';
import Pagination from '../../components/Pagination';
import SortableHeader from '../../components/SortableHeader';
import useTableSort from '../../hooks/useTableSort';
import { displaySystemValue, formatWorkingPeriod, parseWorkingExperience } from '../../lib/profileFormat';
import { useToast } from '../../context/ToastContext';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [jobRoles, setJobRoles] = useState([]);
  const [religions, setReligions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [detailUser, setDetailUser] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [filters, setFilters] = useState({ search: '', role: '', jobRoleCode: '', contractStatus: '' });
  const [page, setPage] = useState({ pageNo: 1, pageSize: 10, totalRows: 0, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [statusOptions, setStatusOptions] = useState([['', 'Semua Kontrak']]);
  const [statusClasses, setStatusClasses] = useState({});
  const pageSizeRef = useRef(10);
  const [jobHistoryForm, setJobHistoryForm] = useState({ id: '', companyName: '', jobTitle: '', description: '', startDate: '', endDate: '', isPresent: false });
  const [contractHistoryForm, setContractHistoryForm] = useState({ id: '', contractNumber: '', vendor: '', startDate: '', endDate: '', contractValue: '' });
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'MEMBER', jobRoleCode: '',
  });

  const { sortBy, sortOrder, handleSort } = useTableSort('name', 'asc');

  useEffect(() => {
    const fetchContractStatuses = async () => {
      try {
        const res = await api.get('/api/system?category=CONTRACT_STATUS&isActive=true');

        if (res.data && res.data.length > 0) {
          const dynamicStatusClass = {};
          const fetchedOptions = [['', 'Semua Kontrak']];

          res.data.forEach(item => {
            fetchedOptions.push([item.code, item.name || item.code]);

            dynamicStatusClass[item.code] = item.description || 'badge-info';
          });

          setStatusOptions(fetchedOptions);
          setStatusClasses(dynamicStatusClass);
        }
      } catch (error) {
        console.error('Failed to fetch contract statuses', error);
      }
    };

    fetchContractStatuses();
  }, []);

  const fetchUsers = useCallback(async (pageNo = 1, pageSize = pageSizeRef.current) => {
    pageSizeRef.current = pageSize;
    setLoading(true);
    try {
      const res = await api.post('/api/users/search', {
        pageNo,
        pageSize,
        search: filters.search,
        role: filters.role,
        jobRoleCode: filters.jobRoleCode,
        contractStatus: filters.contractStatus,
        sortBy,
        sortOrder
      });
      setUsers(res.data.data || []);
      setPage(res.data.page || { pageNo, pageSize, totalRows: 0, totalPages: 1 });
    } catch (err) {
      showToast({ type: 'error', title: 'Gagal', message: err.response?.data?.error || 'Gagal mengambil data user' });
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy, sortOrder]);

  const fetchJobRoles = async () => {
    const res = await api.get('/api/system?category=JOB_ROLE');
    setJobRoles(res.data);
  };

  const fetchReligions = async () => {
    const res = await api.get('/api/system?category=RELIGION');
    setReligions(res.data);
  };

  useEffect(() => {
    // Existing screen pattern: initial API hydration updates local list state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchJobRoles();
    fetchReligions();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(1, pageSizeRef.current);
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const doSearch = async (pageNo, pageSize) => {
    await fetchUsers(pageNo, pageSize);
  };

  const changePageSize = (pageSize) => {
    pageSizeRef.current = pageSize;
    setPage(prev => ({ ...prev, pageNo: 1, pageSize }));
  };

  const openCreate = () => {
    setEditingUser(null);
    setDetailUser(null);
    setForm({ name: '', email: '', password: '', role: 'MEMBER', jobRoleCode: '' });
    setShowModal(true);
  };

  const openEdit = async (user) => {
    setEditingUser(user);
    setForm({
      name: user.name, email: user.email, password: '', role: user.role,
      jobRoleCode: user.jobRoleCode || '',
    });
    setContractHistoryForm({ id: '', contractNumber: '', vendor: '', startDate: '', endDate: '', contractValue: '' });
    setShowModal(true);

    setDetailUser(null);
    setDetailLoading(true);
    try {
      const res = await api.get(`/api/users/${user.id}/detail`);
      setDetailUser(res.data);
    } catch (err) {
      showToast({ type: 'error', title: 'Gagal', message: err.response?.data?.error || 'Gagal mengambil detail user' });
    } finally {
      setDetailLoading(false);
    }
  };

  const submitUser = async () => {
    setActionLoading(true);
    try {
      if (editingUser) {
        const data = { ...form };
        if (!data.password) delete data.password;
        await api.put(`/api/users/${editingUser.id}`, data);
      } else {
        await api.post('/api/users', form);
      }
      setShowModal(false);
      await fetchUsers(page.pageNo, page.pageSize);
      showToast({ type: 'success', title: 'Berhasil', message: editingUser ? 'Data user berhasil diperbarui' : 'User baru berhasil ditambahkan' });
    } catch (err) {
      showToast({ type: 'error', title: 'Gagal', message: err.response?.data?.error || 'Gagal menyimpan' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const confirmed = await confirm({
      title: editingUser ? 'Update User' : 'Tambah User',
      message: editingUser ? 'Simpan perubahan user ini?' : 'Tambahkan user baru dengan data ini?',
      confirmText: editingUser ? 'Ya, Update' : 'Ya, Tambah',
      cancelText: 'Batal'
    });
    if (confirmed) {
      await submitUser();
    }
  };

  const handleDelete = async (user) => {
    const confirmed = await confirm({
      title: 'Hapus User',
      message: `Hapus user ${user.name}? Aksi ini tidak bisa dibatalkan.`,
      confirmText: 'Hapus',
      cancelText: 'Batal',
      variant: 'danger'
    });
    if (confirmed) {
      setActionLoading(true);
      try {
        const nextPageNo = users.length === 1 && page.pageNo > 1
          ? page.pageNo - 1
          : page.pageNo;
        await api.delete(`/api/users/${user.id}`);
        await fetchUsers(nextPageNo, page.pageSize);
        showToast({ type: 'success', title: 'Berhasil', message: 'User berhasil dihapus' });
      } catch (err) {
        showToast({ type: 'error', title: 'Gagal', message: err.response?.data?.error || 'Gagal menghapus user' });
      } finally {
        setActionLoading(false);
      }
    }
  };

  const openDetail = async (user) => {
    setShowDetail(true);
    setDetailUser(null);
    setDetailLoading(true);
    try {
      const res = await api.get(`/api/users/${user.id}/detail`);
      setDetailUser(res.data);
      setJobHistoryForm({ id: '', companyName: '', jobTitle: '', description: '', startDate: '', endDate: '', isPresent: false });
      setContractHistoryForm({ id: '', contractNumber: '', vendor: '', startDate: '', endDate: '', contractValue: '' });
    } catch (err) {
      showToast({ type: 'error', title: 'Gagal', message: err.response?.data?.error || 'Gagal mengambil detail user' });
      setShowDetail(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const refreshDetail = async () => {
    const res = await api.get(`/api/users/${detailUser.id}/detail`);
    setDetailUser(res.data);
  };

  const saveJobHistory = async () => {
    try {
      const path = `/api/users/${detailUser.id}/job-histories${jobHistoryForm.id ? `/${jobHistoryForm.id}` : ''}`;
      await (jobHistoryForm.id ? api.put(path, jobHistoryForm) : api.post(path, jobHistoryForm));
      setJobHistoryForm({ id: '', companyName: '', jobTitle: '', description: '', startDate: '', endDate: '', isPresent: false });
      await refreshDetail();
      showToast({ type: 'success', title: 'Berhasil', message: 'Riwayat pekerjaan berhasil disimpan' });
    } catch (err) { showToast({ type: 'error', title: 'Gagal', message: err.response?.data?.error || 'Gagal menyimpan riwayat pekerjaan' }); }
  };

  const saveContractHistory = async () => {
    try {
      const path = `/api/users/${detailUser.id}/contracts${contractHistoryForm.id ? `/${contractHistoryForm.id}` : ''}`;
      await (contractHistoryForm.id ? api.put(path, contractHistoryForm) : api.post(path, contractHistoryForm));
      setContractHistoryForm({ id: '', contractNumber: '', vendor: '', startDate: '', endDate: '', contractValue: '' });
      await refreshDetail();
      showToast({ type: 'success', title: 'Berhasil', message: 'History kontrak berhasil disimpan' });
    } catch (err) { showToast({ type: 'error', title: 'Gagal', message: err.response?.data?.error || 'Gagal menyimpan kontrak' }); }
  };

  const generateContractNumber = async () => {
    try {
      const res = await api.post('/api/users/contract-number');
      setContractHistoryForm(prev => ({ ...prev, contractNumber: res.data.contractNumber }));
    } catch (err) {
      showToast({ type: 'error', title: 'Gagal', message: err.response?.data?.error || 'Gagal membuat nomor kontrak' });
    }
  };

  const deleteDetailRow = async (resource, id) => {
    await api.delete(`/api/users/${detailUser.id}/${resource}/${id}`);
    await refreshDetail();
  };

  const downloadDocument = async (doc) => {
    if (!detailUser) return;
    const res = await api.get(`/api/users/admin/${detailUser.id}/files/${doc.id}/download`);
    const link = document.createElement('a');
    link.href = res.data.fileData;
    link.download = res.data.fileName || doc.fileName || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const daysUntilExpiry = (dateStr) => {
    if (!dateStr) return null;
    const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">User Management</h2>
          <p className="text-sm text-surface-400">Kelola data karyawan dan kontrak</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
          <UserPlus size={16} /> Tambah User
        </button>
      </div>

      <div className="glass-card p-4 mb-4">
        {/* Bagian Input Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-500" />
            <input
              type="text"
              placeholder="Cari nama, email, telepon..."
              value={filters.search}
              onChange={e => setFilters({ ...filters, search: e.target.value })}
              className="input-dark pl-11 text-sm w-full"
            />
          </div>
          <AppSelect
            value={filters.role}
            onChange={value => setFilters({ ...filters, role: value })}
            options={[['', 'Semua Role'], ['ADMIN', 'Admin'], ['MEMBER', 'Member']]}
          />
          <AppSelect
            value={filters.jobRoleCode}
            onChange={value => setFilters({ ...filters, jobRoleCode: value })}
            options={[['', 'Semua Job Role'], ...jobRoles.filter(j => j.isActive).map(j => [j.code, `${j.code} - ${j.name}`])]}
          />
          <AppSelect
            value={filters.contractStatus}
            onChange={value => setFilters({ ...filters, contractStatus: value })}
            options={statusOptions}
          />
        </div>

        {/* Bagian Tombol Reset - Terpisah di bawah kanan */}
        <div className="flex justify-end mt-4 pt-3 border-t border-white/[0.06]">
          <button
            type="button"
            className="btn-ghost text-sm px-4 py-2"
            onClick={() => {
              setFilters({ search: '', role: '', jobRoleCode: '', contractStatus: '' });
              setPage(prev => ({ ...prev, pageNo: 1 }));
            }}
          >
            Reset Filter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <SortableHeader label="Nama" field="name" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={(field) => handleSort(field, () => setPage(p => ({ ...p, pageNo: 1 })))} />
                <SortableHeader label="Email" field="email" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={(field) => handleSort(field, () => setPage(p => ({ ...p, pageNo: 1 })))} />
                <SortableHeader label="Role" field="role" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={(field) => handleSort(field, () => setPage(p => ({ ...p, pageNo: 1 })))} />
                <SortableHeader label="Job" field="jobRoleCode" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={(field) => handleSort(field, () => setPage(p => ({ ...p, pageNo: 1 })))} />
                <SortableHeader label="Identitas" />
                <SortableHeader label="Kontrak" />
                <SortableHeader label="Aksi" align="center" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {!loading && users.map(user => {
                const latestContract = user.contracts?.[0];
                const contractEnd = latestContract?.endDate || user.contractEnd;
                const days = daysUntilExpiry(contractEnd);
                return (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <UserAvatar name={user.name} photo={user.profilePhoto} size="sm" />
                        <span className="text-sm font-medium text-white">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-surface-400">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={user.role === 'ADMIN' ? 'badge-info' : 'badge-success'}>{user.role}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-surface-400">{user.jobRoleCode || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="space-y-1 text-xs text-surface-500">
                        <p>KTP: {user.ktpNumberMasked || '-'}</p>
                        <p>KK: {user.kkNumberMasked || '-'}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {contractEnd ? (
                        <div>
                          <p className="text-xs text-surface-400">
                            {(latestContract?.startDate || user.contractStart) && format(new Date(latestContract?.startDate || user.contractStart), 'dd/MM/yy')} - {format(new Date(contractEnd), 'dd/MM/yy')}
                          </p>
                          {days !== null && days <= 30 && days >= 0 && (
                            <span className="text-[10px] text-amber-400 font-medium">⚠ {days} hari lagi</span>
                          )}
                          {days !== null && days < 0 && (
                            <span className="text-[10px] text-rose-400 font-medium">✗ Expired</span>
                          )}
                        </div>
                      ) : <span className="text-xs text-surface-600">-</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => openDetail(user)} className="p-1.5 rounded-lg hover:bg-white/[0.08] text-surface-400 hover:text-emerald-400 transition-colors" title="Detail">
                          <Eye size={14} />
                        </button>
                        <button onClick={() => openEdit(user)} className="p-1.5 rounded-lg hover:bg-white/[0.08] text-surface-400 hover:text-brand-400 transition-colors">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDelete(user)} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-surface-400 hover:text-rose-400 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {loading && (
            <div className="text-center py-12 text-surface-400 text-sm">Memuat data user...</div>
          )}
          {!loading && users.length === 0 && (
            <div className="text-center py-12 text-surface-400 text-sm">Tidak ada data user</div>
          )}
        </div>
      </div>

      {page.totalRows > 0 && (
        <div className="mt-4 glass-card p-4">
          <Pagination page={page} doSearch={doSearch} changePageSize={changePageSize} hideGoToPage={false} />
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className={`w-full ${editingUser ? 'max-w-4xl' : 'max-w-lg'} glass-card-light p-6 animate-scale-in max-h-[90vh] overflow-y-auto`} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-white">{editingUser ? 'Edit User' : 'Tambah User Baru'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-surface-400 hover:text-white"><X size={20} /></button>
            </div>

            {!editingUser ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-surface-300 mb-1">Nama Lengkap *</label>
                  <input type="text" required className="input-dark text-sm" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm text-surface-300 mb-1">Email *</label>
                  <input type="email" required className="input-dark text-sm" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm text-surface-300 mb-1">Password *</label>
                  <input type="password" className="input-dark text-sm" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-surface-300 mb-1">Role Sistem</label>
                    <AppSelect value={form.role} onChange={value => setForm({ ...form, role: value })} options={[['MEMBER', 'Member'], ['ADMIN', 'Admin']]} />
                  </div>
                  <div>
                    <label className="block text-sm text-surface-300 mb-1">Job Role</label>
                    <AppSelect
                      value={form.jobRoleCode}
                      onChange={value => setForm({ ...form, jobRoleCode: value })}
                      options={[['', '- Pilih -'], ...jobRoles.filter(j => j.isActive).map(j => [j.code, `${j.code} - ${j.name}`])]}
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-ghost text-sm text-center">Batal</button>
                  <button type="submit" disabled={actionLoading} className="flex-1 btn-primary text-sm">Buat User</button>
                </div>
              </form>
            ) : detailLoading ? (
              <div className="py-16 flex justify-center"><Loader2 size={24} className="animate-spin text-brand-400" /></div>
            ) : detailUser ? (
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <UserAvatar name={detailUser.name} photo={detailUser.profilePhoto} className="w-16 h-16 text-xl" />
                  <div>
                    <h4 className="text-white font-semibold">{detailUser.name}</h4>
                    <p className="text-sm text-surface-400">{detailUser.email}</p>
                    <div className="flex gap-2 mt-2">
                      <span className={detailUser.role === 'ADMIN' ? 'badge-info' : 'badge-success'}>{detailUser.role}</span>
                      {detailUser.jobRoleCode && <span className="badge-info">{detailUser.jobRoleCode}</span>}
                    </div>
                  </div>
                </div>

                <DetailSection icon={Shield} title="Data Sistem & Akun">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-surface-300 mb-1">Nama Lengkap *</label>
                        <input type="text" required className="input-dark text-sm" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-sm text-surface-300 mb-1">Email *</label>
                        <input type="email" required className="input-dark text-sm" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-sm text-surface-300 mb-1">Password (kosongkan jika tidak diubah)</label>
                        <input type="password" className="input-dark text-sm" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm text-surface-300 mb-1">Role Sistem</label>
                          <AppSelect value={form.role} onChange={value => setForm({ ...form, role: value })} options={[['MEMBER', 'Member'], ['ADMIN', 'Admin']]} />
                        </div>
                        <div>
                          <label className="block text-sm text-surface-300 mb-1">Job Role</label>
                          <AppSelect
                            value={form.jobRoleCode}
                            onChange={value => setForm({ ...form, jobRoleCode: value })}
                            options={[['', '- Pilih -'], ...jobRoles.filter(j => j.isActive).map(j => [j.code, `${j.code} - ${j.name}`])]}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button type="submit" disabled={actionLoading} className="btn-primary text-sm">Simpan Perubahan Akun</button>
                    </div>
                  </form>
                </DetailSection>

                <DetailSection icon={Shield} title="Biodata dan Identitas">
                  <DetailGrid items={[
                    ['Telepon', detailUser.phone],
                    ['Alamat', detailUser.address],
                    ['Tempat / Tanggal Lahir', `${detailUser.birthPlace || '-'} / ${formatDate(detailUser.birthDate)}`],
                    ['Jenis Kelamin', detailUser.gender === 'L' ? 'Laki-laki' : detailUser.gender === 'P' ? 'Perempuan' : detailUser.gender],
                    ['Agama', displaySystemValue(detailUser.religion, religions)],
                    ['Status Pernikahan', detailUser.maritalStatus],
                    ['Pendidikan', detailUser.education],
                    ['Nomor KTP', detailUser.ktpNumber || detailUser.ktpNumberMasked],
                    ['Nomor KK', detailUser.kkNumber || detailUser.kkNumberMasked]
                  ]} />
                </DetailSection>

                <div className="grid md:grid-cols-2 gap-4">
                  <DetailSection icon={UsersRound} title="Data Keluarga">
                    <DetailGrid items={[
                      ['Nama Ayah', detailUser.fatherName],
                      ['Nama Ibu', detailUser.motherName]
                    ]} />
                  </DetailSection>
                  <DetailSection icon={Phone} title="Kontak Darurat">
                    <DetailGrid items={[
                      ['Nama', detailUser.emergencyContactName],
                      ['Nomor', detailUser.emergencyContactPhone]
                    ]} />
                  </DetailSection>
                </div>

                <DetailSection icon={Briefcase} title="Pekerjaan">
                  <DetailGrid items={[
                    ['Projects', detailUser.projects?.map(p => p.project?.name).filter(Boolean).join(', ') || '-'],
                    ['Skill', detailUser.skill]
                  ]} />
                  <WorkingExperienceList value={detailUser.workingExperience} />
                  <div className="pt-3 border-t border-white/[0.06] space-y-3">
                    <p className="text-xs text-surface-500">Job History</p>
                    <div className="grid sm:grid-cols-2 gap-2">
                      <input className="input-dark text-sm" placeholder="Perusahaan *" value={jobHistoryForm.companyName} onChange={e => setJobHistoryForm({ ...jobHistoryForm, companyName: e.target.value })} />
                      <input className="input-dark text-sm" placeholder="Jabatan *" value={jobHistoryForm.jobTitle} onChange={e => setJobHistoryForm({ ...jobHistoryForm, jobTitle: e.target.value })} />
                      <input type="date" className="input-dark text-sm" value={jobHistoryForm.startDate} onChange={e => setJobHistoryForm({ ...jobHistoryForm, startDate: e.target.value })} />
                      <input type="date" disabled={jobHistoryForm.isPresent} className="input-dark text-sm" value={jobHistoryForm.endDate} onChange={e => setJobHistoryForm({ ...jobHistoryForm, endDate: e.target.value })} />
                    </div>
                    <textarea className="input-dark text-sm w-full" placeholder="Deskripsi" value={jobHistoryForm.description} onChange={e => setJobHistoryForm({ ...jobHistoryForm, description: e.target.value })} />
                    <label className="text-xs text-surface-400 flex gap-2"><input type="checkbox" checked={jobHistoryForm.isPresent} onChange={e => setJobHistoryForm({ ...jobHistoryForm, isPresent: e.target.checked })} /> Masih bekerja</label>
                    <div className="flex gap-2">
                      <button type="button" onClick={saveJobHistory} className="btn-primary text-xs">{jobHistoryForm.id ? 'Update Pekerjaan' : 'Tambah Pekerjaan'}</button>
                      {jobHistoryForm.id && (
                        <button type="button" onClick={() => setJobHistoryForm({ id: '', companyName: '', jobTitle: '', description: '', startDate: '', endDate: '', isPresent: false })} className="btn-ghost text-xs">Batal</button>
                      )}
                    </div>
                    {detailUser.jobHistories?.map(item => (
                      <div key={item.id} className="flex justify-between border-t border-white/[0.06] pt-2 text-sm">
                        <span className="text-surface-300">{item.jobTitle} - {item.companyName}</span>
                        <span><button onClick={() => setJobHistoryForm({ ...item, description: item.description || '', startDate: item.startDate?.split('T')[0] || '', endDate: item.endDate?.split('T')[0] || '' })} className="p-1 text-brand-400"><Pencil size={13} /></button><button onClick={() => deleteDetailRow('job-histories', item.id)} className="p-1 text-rose-400"><Trash2 size={13} /></button></span>
                      </div>
                    ))}
                  </div>
                </DetailSection>

                <DetailSection icon={FileText} title="Manajemen Kontrak">
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-surface-400 mb-1">Nomor Kontrak</label>
                        <input readOnly className="input-dark text-sm opacity-80" placeholder="Generate nomor kontrak" value={contractHistoryForm.contractNumber} />
                      </div>
                      <div className="flex items-end">
                        {!contractHistoryForm.id && (
                          <button type="button" onClick={generateContractNumber} className="btn-ghost text-sm w-full md:w-auto">
                            Generate Nomor
                          </button>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs text-surface-400 mb-1">Vendor *</label>
                        <input className="input-dark text-sm" value={contractHistoryForm.vendor} onChange={e => setContractHistoryForm({ ...contractHistoryForm, vendor: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-xs text-surface-400 mb-1">Nilai Kontrak *</label>
                        <input
                          type="text"
                          className="input-dark text-sm"
                          value={
                            typeof contractHistoryForm.contractValue === 'number'
                              ? 'Rp. ' + new Intl.NumberFormat('id-ID').format(contractHistoryForm.contractValue)
                              : ''
                          }
                          onChange={(e) => {
                            const rawValue = e.target.value.replace(/[^0-9]/g, '');
                            setContractHistoryForm({
                              ...contractHistoryForm,
                              contractValue: rawValue === '' ? '' : parseInt(rawValue, 10),
                            });
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-surface-400 mb-1">Tanggal Mulai *</label>
                        <input type="date" className="input-dark text-sm" value={contractHistoryForm.startDate} onChange={e => setContractHistoryForm({ ...contractHistoryForm, startDate: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-xs text-surface-400 mb-1">Tanggal Selesai *</label>
                        <input type="date" className="input-dark text-sm" value={contractHistoryForm.endDate} onChange={e => setContractHistoryForm({ ...contractHistoryForm, endDate: e.target.value })} />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={saveContractHistory} className="btn-primary text-sm">{contractHistoryForm.id ? 'Update Kontrak' : 'Tambah Kontrak'}</button>
                      {contractHistoryForm.id && (
                        <button type="button" onClick={() => setContractHistoryForm({ id: '', contractNumber: '', vendor: '', startDate: '', endDate: '', contractValue: '' })} className="btn-ghost text-sm">Batal Edit</button>
                      )}
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
                    <table className="w-full text-left">
                      <thead className="bg-white/[0.03]">
                        <tr className="text-xs uppercase text-surface-400">
                          <th className="px-3 py-2">Kontrak</th>
                          <th className="px-3 py-2 text-right">Nilai</th>
                          <th className="px-3 py-2 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.06]">
                        {detailUser.contracts?.map(item => (
                          <tr key={item.id} className="text-sm">
                            <td className="px-3 py-2">
                              <div className="text-white font-medium">{item.contractNumber}</div>
                              <div className="text-xs text-surface-400">{item.vendor}</div>
                              <div className="text-xs text-surface-400">{formatDateLong(item.startDate)} - {formatDateLong(item.endDate)}</div>
                            </td>
                            <td className="px-3 py-2 text-white text-right align-top">{formatRupiah(item.contractValue)}</td>
                            <td className="px-3 py-2 text-right align-top whitespace-nowrap">
                              <button onClick={() => setContractHistoryForm({ ...item, startDate: item.startDate.split('T')[0], endDate: item.endDate.split('T')[0], contractValue: String(item.contractValue) })} className="p-1.5 text-brand-400" title="Edit"><Pencil size={14} /></button>
                              <button onClick={() => deleteDetailRow('contracts', item.id)} className="p-1.5 text-rose-400" title="Delete"><Trash2 size={14} /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {!detailUser.contracts?.length && <p className="text-sm text-surface-500 text-center py-4">Belum ada kontrak.</p>}
                  </div>
                </DetailSection>

                <DetailSection icon={FileText} title="File Ter-upload">
                  <div className="divide-y divide-white/[0.06]">
                    {detailUser.documents?.length ? detailUser.documents.map(doc => (
                      <div key={doc.id} className="py-3 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm text-white">{doc.label || doc.documentType}</p>
                          <p className="text-xs text-surface-300">{doc.storedFileName || doc.fileName}</p>
                          <p className="text-xs text-surface-500">{doc.documentType} - {formatDate(doc.uploadedAt || doc.createdAt)}</p>
                        </div>
                        <button type="button" onClick={() => downloadDocument(doc)} className="btn-ghost text-xs flex items-center gap-2">
                          <Download size={14} /> Download
                        </button>
                      </div>
                    )) : <p className="text-sm text-surface-500 py-3">Belum ada file di database.</p>}
                  </div>
                </DetailSection>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {showDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-4xl glass-card-light p-6 animate-scale-in max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-white">Detail Karyawan</h3>
              <button onClick={() => setShowDetail(false)} className="p-1 text-surface-400 hover:text-white"><X size={20} /></button>
            </div>

            {detailLoading ? (
              <div className="py-16 flex justify-center"><Loader2 size={24} className="animate-spin text-brand-400" /></div>
            ) : detailUser && (
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <UserAvatar name={detailUser.name} photo={detailUser.profilePhoto} className="w-16 h-16 text-xl" />
                  <div>
                    <h4 className="text-white font-semibold">{detailUser.name}</h4>
                    <p className="text-sm text-surface-400">{detailUser.email}</p>
                    <div className="flex gap-2 mt-2">
                      <span className={detailUser.role === 'ADMIN' ? 'badge-info' : 'badge-success'}>{detailUser.role}</span>
                      {detailUser.jobRoleCode && <span className="badge-info">{detailUser.jobRoleCode}</span>}
                    </div>
                  </div>
                </div>

                <DetailSection icon={Shield} title="Biodata dan Identitas">
                  <DetailGrid items={[
                    ['Telepon', detailUser.phone],
                    ['Alamat', detailUser.address],
                    ['Tempat / Tanggal Lahir', `${detailUser.birthPlace || '-'} / ${formatDate(detailUser.birthDate)}`],
                    ['Jenis Kelamin', detailUser.gender === 'L' ? 'Laki-laki' : detailUser.gender === 'P' ? 'Perempuan' : detailUser.gender],
                    ['Agama', displaySystemValue(detailUser.religion, religions)],
                    ['Status Pernikahan', detailUser.maritalStatus],
                    ['Pendidikan', detailUser.education],
                    ['Nomor KTP', detailUser.ktpNumber || detailUser.ktpNumberMasked],
                    ['Nomor KK', detailUser.kkNumber || detailUser.kkNumberMasked]
                  ]} />
                </DetailSection>

                <div className="grid md:grid-cols-2 gap-4">
                  <DetailSection icon={UsersRound} title="Data Keluarga">
                    <DetailGrid items={[
                      ['Nama Ayah', detailUser.fatherName],
                      ['Nama Ibu', detailUser.motherName]
                    ]} />
                  </DetailSection>
                  <DetailSection icon={Phone} title="Kontak Darurat">
                    <DetailGrid items={[
                      ['Nama', detailUser.emergencyContactName],
                      ['Nomor', detailUser.emergencyContactPhone]
                    ]} />
                  </DetailSection>
                </div>

                <DetailSection icon={Briefcase} title="Pekerjaan">
                  <DetailGrid items={[
                    ['Projects', detailUser.projects?.map(p => p.project?.name).filter(Boolean).join(', ') || '-'],
                    ['Skill', detailUser.skill]
                  ]} />
                  <WorkingExperienceList value={detailUser.workingExperience} />
                  <div className="pt-3 border-t border-white/[0.06] space-y-3">
                    <p className="text-xs text-surface-500">Job History</p>
                    {detailUser.jobHistories?.map(item => (
                      <div key={item.id} className="flex justify-between border-t border-white/[0.06] pt-2 text-sm">
                        <span className="text-surface-300">{item.jobTitle} - {item.companyName}</span>
                      </div>
                    ))}
                    {!detailUser.jobHistories?.length && <p className="text-sm text-surface-500 py-1">Belum ada job history.</p>}
                  </div>
                </DetailSection>

                <DetailSection icon={FileText} title="Contract History">
                  <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
                    <table className="w-full min-w-[680px] text-left">
                      <thead className="bg-white/[0.03]">
                        <tr className="text-xs uppercase text-surface-400">
                          <th className="px-4 py-3">Nomor Kontrak</th>
                          <th className="px-4 py-3">Vendor</th>
                          <th className="px-4 py-3">Periode Kontrak</th>
                          <th className="px-4 py-3 text-right">Nilai Kontrak</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.06]">
                        {detailUser.contracts?.map(item => (
                          <tr key={item.id} className="text-sm">
                            <td className="px-4 py-3 text-white font-medium">{item.contractNumber}</td>
                            <td className="px-4 py-3 text-surface-300">{item.vendor}</td>
                            <td className="px-4 py-3 text-surface-300">{formatDateLong(item.startDate)} - {formatDateLong(item.endDate)}</td>
                            <td className="px-4 py-3 text-white text-right">{formatRupiah(item.contractValue)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {!detailUser.contracts?.length && <p className="text-sm text-surface-500 text-center py-8">Belum ada contract history.</p>}
                  </div>
                </DetailSection>

                <DetailSection icon={FileText} title="File Ter-upload">
                  <div className="divide-y divide-white/[0.06]">
                    {detailUser.documents?.length ? detailUser.documents.map(doc => (
                      <div key={doc.id} className="py-3 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm text-white">{doc.label || doc.documentType}</p>
                          <p className="text-xs text-surface-300">{doc.storedFileName || doc.fileName}</p>
                          <p className="text-xs text-surface-500">{doc.documentType} - {formatDate(doc.uploadedAt || doc.createdAt)}</p>
                        </div>
                        <button onClick={() => downloadDocument(doc)} className="btn-ghost text-xs flex items-center gap-2">
                          <Download size={14} /> Download
                        </button>
                      </div>
                    )) : <p className="text-sm text-surface-500 py-3">Belum ada file di database.</p>}
                  </div>
                </DetailSection>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

const DetailSection = ({ icon: Icon, title, children }) => (
  <div className="glass-card p-4 space-y-3">
    <h4 className="text-sm font-semibold text-white flex items-center gap-2">
      <Icon size={15} className="text-brand-400" /> {title}
    </h4>
    {children}
  </div>
);

const DetailGrid = ({ items }) => (
  <div className="grid sm:grid-cols-2 gap-3">
    {items.map(([label, value]) => (
      <div key={label}>
        <p className="text-xs text-surface-500">{label}</p>
        <p className="text-sm text-surface-200 whitespace-pre-wrap break-words">{value || '-'}</p>
      </div>
    ))}
  </div>
);

const WorkingExperienceList = ({ value }) => {
  const items = parseWorkingExperience(value);
  if (!items.length) return null;

  return (
    <div className="pt-3 border-t border-white/[0.06] space-y-3">
      <p className="text-xs text-surface-500">Working Experience</p>
      {items.map((item, index) => (
        <div key={index} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-white">{item.role || '-'}</p>
              <p className="text-xs text-surface-400">{item.companyName || '-'}</p>
            </div>
            <span className="text-xs text-brand-300">{formatWorkingPeriod(item)}</span>
          </div>
          {item.detail && <p className="text-sm text-surface-300 whitespace-pre-wrap mt-3">{item.detail}</p>}
        </div>
      ))}
    </div>
  );
};

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString('id-ID') : '-';
}

function formatDateLong(value) {
  return value ? new Date(value).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-';
}

function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value || 0));
}

export default UserManagement;
