import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../../lib/api';
import { Plus, Pencil, Trash2, X, FolderKanban, MapPin, Users, Calendar, LayoutDashboard } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import AppSelect from '../../components/AppSelect';
import Pagination from '../../components/Pagination';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';

const ProjectManagement = () => {
  const [projects, setProjects] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [memberForm, setMemberForm] = useState({ userId: '', roleInProject: 'Member', joinedAt: '', leftAt: '' });
  const [filters, setFilters] = useState({
    search: '', status: '', projectManagerId: '', customer: '', dateFrom: '', dateTo: ''
  });
  const [page, setPage] = useState({
    pageNo: 1, pageSize: 10, totalRows: 0, totalPages: 1
  });
  const [loading, setLoading] = useState(false);
  const pageSizeRef = useRef(10);
  const [form, setForm] = useState({
    name: '', description: '', location: '', customer: '', customerName: '', woNumber: '', projectManagerId: '', contractStart: '', contractEnd: '', status: 'active'
  });
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const fetchProjects = useCallback(async (pageNo = 1, pageSize = pageSizeRef.current) => {
    if (filters.dateFrom && filters.dateTo && filters.dateFrom > filters.dateTo) {
      showToast({ type: 'error', title: 'Validasi Gagal', message: 'Tanggal mulai filter tidak boleh lebih besar dari tanggal selesai filter.' });
      return;
    }

    pageSizeRef.current = pageSize;
    setLoading(true);

    try {
      const res = await api.post('/api/projects/search', {
        pageNo,
        pageSize,
        search: filters.search,
        status: filters.status,
        projectManagerId: filters.projectManagerId,
        customer: filters.customer,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo
      });

      setProjects(res.data.data || []);
      setPage(res.data.page || {
        pageNo,
        pageSize,
        totalRows: 0,
        totalPages: 1
      });
    } catch (err) {
      showToast({ type: 'error', title: 'Gagal', message: err.response?.data?.error || 'Gagal mengambil data project' });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchUsers = async () => {
    const res = await api.get('/api/users');
    setAllUsers(res.data.filter(u => u.role === 'MEMBER' || u.role === 'ADMIN'));
  };

  useEffect(() => {
    // Existing screen pattern: initial API hydration updates local list state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProjects(1, pageSizeRef.current);
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchProjects]);

  const doSearch = async (pageNo, pageSize) => {
    await fetchProjects(pageNo, pageSize);
  };

  const changePageSize = (pageSize) => {
    pageSizeRef.current = pageSize;
    setPage(prev => ({
      ...prev,
      pageNo: 1,
      pageSize
    }));
  };

  const openCreate = () => {
    setEditingProject(null);
    setForm({ name: '', description: '', location: '', customer: '', customerName: '', woNumber: '', projectManagerId: '', contractStart: '', contractEnd: '', status: 'active' });
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditingProject(p);
    setForm({
      name: p.name, description: p.description || '', location: p.location || '',
      customer: p.customer || '',
      customerName: p.customerName || '',
      woNumber: p.woNumber || '',
      projectManagerId: p.projectManagerId || '',
      contractStart: p.contractStart?.split('T')[0] || '',
      contractEnd: p.contractEnd?.split('T')[0] || '',
      status: p.status
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.contractStart > form.contractEnd) {
      showToast({ type: 'error', title: 'Validasi Gagal', message: 'Tanggal mulai project tidak boleh melebihi tanggal selesai.' });
      return;
    }
    try {
      if (editingProject) {
        await api.put(`/api/projects/${editingProject.id}`, form);
      } else {
        await api.post('/api/projects', form);
      }
      showToast({ type: 'success', title: 'Berhasil', message: 'Project berhasil disimpan' });
      setShowModal(false);
      fetchProjects(page.pageNo, page.pageSize);
    } catch (err) {
      showToast({ type: 'error', title: 'Gagal', message: err.response?.data?.error || 'Gagal menyimpan' });
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await confirm({
      title: 'Hapus Project?',
      message: 'Apakah Anda yakin ingin menghapus project ini?',
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      variant: 'danger'
    });
    if (!confirmed) return;
    const nextPageNo = projects.length === 1 && page.pageNo > 1
      ? page.pageNo - 1
      : page.pageNo;
    try {
      await api.delete(`/api/projects/${id}`);
      showToast({ type: 'success', title: 'Berhasil', message: 'Project berhasil dihapus' });
      fetchProjects(nextPageNo, page.pageSize);
    } catch (err) {
      showToast({ type: 'error', title: 'Gagal', message: err.response?.data?.error || 'Gagal menghapus project' });
    }
  };

  const openMembers = (project) => {
    setSelectedProject(project);
    setMemberForm({ userId: '', roleInProject: 'Member', joinedAt: '', leftAt: '' });
    setShowMemberModal(true);
  };

  const addMember = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...memberForm,
        joinedAt: memberForm.joinedAt || null,
        leftAt: memberForm.leftAt || null,
      };
      await api.post(`/api/projects/${selectedProject.id}/members`, payload);
      fetchProjects(page.pageNo, page.pageSize);
      // Refresh selected project
      const updated = await api.get(`/api/projects/${selectedProject.id}`);
      setSelectedProject(updated.data);
      setMemberForm({ userId: '', roleInProject: 'Member', joinedAt: '', leftAt: '' });
      showToast({ type: 'success', title: 'Berhasil', message: 'Member berhasil ditambahkan' });
    } catch (err) {
      showToast({ type: 'error', title: 'Gagal', message: err.response?.data?.error || 'Gagal menambah member' });
    }
  };

  const removeMember = async (userId) => {
    try {
      await api.delete(`/api/projects/${selectedProject.id}/members/${userId}`);
      fetchProjects(page.pageNo, page.pageSize);
      const updated = await api.get(`/api/projects/${selectedProject.id}`);
      setSelectedProject(updated.data);
      showToast({ type: 'success', title: 'Berhasil', message: 'Member berhasil dihapus' });
    } catch (err) {
      showToast({ type: 'error', title: 'Gagal', message: 'Gagal menghapus member' });
    }
  };

  const statusColors = {
    active: 'badge-success',
    completed: 'badge-info',
    cancelled: 'badge-danger'
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Dashboard Project</h2>
          <p className="text-sm text-surface-400">Kelola project dan tim</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Tambah Project
        </button>
      </div>

      <div className="glass-card p-4 mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 items-center">

          <label className="block text-sm text-surface-300">Cari Project
          <input
            className="input-dark text-sm w-full"
            placeholder="Cari project / customer / WO"
            value={filters.search}
            onChange={e => setFilters({ ...filters, search: e.target.value })}
          />
          </label>

          <label className="block text-sm text-surface-300">Status Project
          <AppSelect
            value={filters.status}
            className="w-full"
            onChange={value => setFilters({ ...filters, status: value })}
            options={[
              ['', 'Semua Status'],
              ['active', 'Active'],
              ['completed', 'Completed'],
              ['cancelled', 'Cancelled']
            ]}
          />
          </label>

          <label className="block text-sm text-surface-300">Project Manager
          <AppSelect
            value={filters.projectManagerId}
            className="w-full"
            onChange={value => setFilters({ ...filters, projectManagerId: value })}
            options={[
              ['', 'Semua Project Manager'],
              ...allUsers
                .filter(u => u.jobRoleCode === 'PM' || u.role === 'ADMIN')
                .map(u => [u.id, `${u.name} (${u.jobRoleCode || u.role})`])
            ]}
          />
          </label>

          <div className="flex items-center gap-2 w-full">
            <label className="block text-sm text-surface-300">Start Date Project
            <input
              type="date"
              className="input-dark text-sm w-full [color-scheme:light] dark:[color-scheme:dark]"
              value={filters.dateFrom}
              onChange={e => setFilters({ ...filters, dateFrom: e.target.value })}
            />
            </label>
            <span className="text-surface-500 text-sm">-</span>
            <label className="block text-sm text-surface-300">End Date Project
            <input
              type="date"
              className="input-dark text-sm w-full [color-scheme:light] dark:[color-scheme:dark]"
              value={filters.dateTo}
              onChange={e => setFilters({ ...filters, dateTo: e.target.value })}
            />
            </label>
          </div>

        </div>

        {/* Bagian Tombol Reset - Terpisah di bawah kanan */}
        <div className="flex justify-end mt-4 pt-3 border-t border-white/[0.06]">
          <button
            type="button"
            className="btn-ghost text-sm px-4 py-2"
            onClick={() => {
              setFilters({
                search: '',
                status: '',
                projectManagerId: '',
                customer: '',
                dateFrom: '',
                dateTo: ''
              });
              setPage(prev => ({
                ...prev,
                pageNo: 1
              }));
            }}
          >
            Reset Filter
          </button>
        </div>
      </div>

      {/* Project Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {!loading && projects.map(project => (
          <div key={project.id} className="glass-card p-5 hover:border-white/[0.15] transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-brand-500/10">
                  <FolderKanban size={16} className="text-brand-400" />
                </div>
                <h3 className="font-semibold text-white text-sm">{project.name}</h3>
              </div>
              <span className={statusColors[project.status] || 'badge-info'}>{project.status}</span>
            </div>

            {project.description && (
              <p className="text-xs text-surface-400 mb-3 line-clamp-2">{project.description}</p>
            )}

            <div className="mb-3 p-2 rounded-lg bg-surface-800/50 border border-white/[0.05]">
              <div className="flex justify-between items-center text-[11px] mb-1">
                <span className="text-surface-500">Customer Company</span>
                <span className="text-white font-medium truncate ml-2" title={project.customer || '-'}>{project.customer || '-'}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] mb-1">
                <span className="text-surface-500">Customer PIC</span>
                <span className="text-white font-medium truncate ml-2" title={project.customerName || '-'}>{project.customerName || '-'}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] mb-1">
                <span className="text-surface-500">WO Number</span>
                <span className="text-white font-medium truncate ml-2" title={project.woNumber || '-'}>{project.woNumber || '-'}</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-surface-500">Project Manager</span>
                <span className="text-brand-300 font-medium truncate ml-2" title={project.projectManager?.name || '-'}>{project.projectManager?.name || '-'}</span>
              </div>
            </div>

            <div className="space-y-1.5 mb-4">
              {project.location && (
                <div className="flex items-center gap-2 text-xs text-surface-400">
                  <MapPin size={12} /> {project.location}
                </div>
              )}
              <div className="flex items-center gap-2 text-xs text-surface-400">
                <Calendar size={12} />
                {format(new Date(project.contractStart), 'MM/dd/yy')} — {format(new Date(project.contractEnd), 'MM/dd/yy')}
              </div>
              <div className="flex items-center gap-2 text-xs text-surface-400">
                <Users size={12} /> {project.members.length} anggota
              </div>
            </div>

            {/* Member avatars */}
            <div className="flex -space-x-2 mb-4">
              {project.members.slice(0, 5).map(m => (
                <div key={m.id} className="w-7 h-7 rounded-full gradient-brand flex items-center justify-center text-[10px] font-bold border-2 border-surface-900" title={m.user.name}>
                  {m.user.profilePhoto ? (
                    <img src={m.user.profilePhoto} alt="avatar" className="w-full h-full rounded-lg object-cover" />
                  ) : (
                    m.user.name.charAt(0).toUpperCase()
                  )}
                </div>
              ))}
              {project.members.length > 5 && (
                <div className="w-7 h-7 rounded-full bg-surface-700 flex items-center justify-center text-[10px] font-bold text-surface-300 border-2 border-surface-900">
                  +{project.members.length - 5}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Link to={`/admin/projects/${project.id}`} className="flex-1 btn-primary text-xs text-center flex items-center justify-center gap-1">
                <LayoutDashboard size={12} /> Detail
              </Link>
              <button onClick={() => openMembers(project)} className="p-2 rounded-lg hover:bg-white/[0.08] text-surface-400 hover:text-brand-400 transition-colors" title="Anggota">
                <Users size={14} />
              </button>
              <button onClick={() => openEdit(project)} className="p-2 rounded-lg hover:bg-white/[0.08] text-surface-400 hover:text-brand-400 transition-colors" title="Edit">
                <Pencil size={14} />
              </button>
              <button onClick={() => handleDelete(project.id)} className="p-2 rounded-lg hover:bg-rose-500/10 text-surface-400 hover:text-rose-400 transition-colors" title="Hapus">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {loading && (
          <div className="col-span-full text-center py-16 text-surface-400 text-sm">Memuat project...</div>
        )}
        {!loading && projects.length === 0 && (
          <div className="col-span-full text-center py-16 text-surface-400 text-sm">Tidak ada project sesuai filter.</div>
        )}
      </div>

      {page.totalRows > 0 && (
        <div className="mt-6 glass-card p-4">
          <Pagination
            page={page}
            doSearch={doSearch}
            changePageSize={changePageSize}
            hideGoToPage={false}
          />
        </div>
      )}

      {/* Project Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg glass-card-light p-6 animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-white">{editingProject ? 'Edit Project' : 'Tambah Project'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-surface-400 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-surface-300 mb-1">Nama Project <span style={{ color: 'red' }}>*</span></label>
                <input type="text" required className="input-dark text-sm" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm text-surface-300 mb-1">Customer Company <span style={{ color: 'red' }}>*</span></label>
                <input type="text" required className="input-dark text-sm" value={form.customer} onChange={e => setForm({ ...form, customer: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm text-surface-300 mb-1">Customer Name / PIC</label>
                <input type="text" className="input-dark text-sm" value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-surface-300 mb-1">WO Number</label>
                  <input type="text" className="input-dark text-sm" value={form.woNumber} onChange={e => setForm({ ...form, woNumber: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm text-surface-300 mb-1">Project Manager</label>
                  <AppSelect
                    value={form.projectManagerId}
                    onChange={value => setForm({ ...form, projectManagerId: value })}
                    options={[['', 'Pilih PM'], ...allUsers.filter(u => u.jobRoleCode === 'PM' || u.role === 'ADMIN').map(u => [u.id, `${u.name} (${u.jobRoleCode || u.role})`])]}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-surface-300 mb-1">Deskripsi</label>
                <textarea className="input-dark text-sm resize-none" rows="2" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm text-surface-300 mb-1">Lokasi</label>
                <input type="text" className="input-dark text-sm" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-surface-300 mb-1">Mulai Kontrak <span style={{ color: 'red' }}>*</span></label>
                  <input type="date" required className="input-dark text-sm" value={form.contractStart} onChange={e => setForm({ ...form, contractStart: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm text-surface-300 mb-1">Selesai Kontrak <span style={{ color: 'red' }}>*</span></label>
                  <input type="date" required className="input-dark text-sm" value={form.contractEnd} onChange={e => setForm({ ...form, contractEnd: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm text-surface-300 mb-1">Status</label>
                <AppSelect
                  value={form.status}
                  onChange={value => setForm({ ...form, status: value })}
                  options={[['active', 'Active'], ['completed', 'Completed'], ['cancelled', 'Cancelled']]}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-ghost text-sm text-center">Batal</button>
                <button type="submit" className="flex-1 btn-primary text-sm">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Members Modal */}
      {showMemberModal && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg glass-card-light p-6 animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-white">Anggota: {selectedProject.name}</h3>
              <button onClick={() => setShowMemberModal(false)} className="p-1 text-surface-400 hover:text-white"><X size={20} /></button>
            </div>

            {/* Add member form */}
            <form onSubmit={addMember} className="bg-surface-800 p-3 rounded-xl mb-4 space-y-3 border border-white/[0.05]">
              <AppSelect
                value={memberForm.userId}
                onChange={value => setMemberForm({ ...memberForm, userId: value })}
                options={[
                  ['', 'Pilih Karyawan'],
                  ...allUsers
                    .filter(u => !selectedProject.members.some(m => m.userId === u.id))
                    .map(u => {
                      const otherProjects = u.projects?.map(item => item.project.name).filter(name => name !== selectedProject.name) || [];
                      const assignedInfo = otherProjects.length ? ` - Already in ${otherProjects.join(', ')}` : '';
                      return [u.id, `${u.name} (${u.jobRoleCode || '-'})${assignedInfo}`];
                    })
                ]}
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-surface-400 mb-1 block">Tgl Join</label>
                  <input type="date" className="input-dark text-sm" value={memberForm.joinedAt} onChange={e => setMemberForm({ ...memberForm, joinedAt: e.target.value })} />
                </div>
                <div>
                  <label className="text-[10px] text-surface-400 mb-1 block">Tgl Selesai</label>
                  <input type="date" className="input-dark text-sm" value={memberForm.leftAt} onChange={e => setMemberForm({ ...memberForm, leftAt: e.target.value })} />
                </div>
              </div>
              <button type="submit" className="btn-primary text-sm w-full py-2 flex justify-center items-center gap-1">
                <Plus size={14} /> Tambah Member
              </button>
            </form>

            {/* Member list */}
            <div className="space-y-2">
              {selectedProject.members.map(m => (
                <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center text-xs font-bold shrink-0">
                      {m.user.profilePhoto ? (
                        <img src={m.user.profilePhoto} alt="avatar" className="w-full h-full rounded-lg object-cover" />
                      ) : (
                        m.user.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{m.user.name}</p>
                      <p className="text-[11px] text-surface-500">{m.user.email} • {m.user.jobRoleCode || '-'}</p>
                      {(m.joinedAt || m.leftAt) && (
                        <p className="text-[10px] text-brand-400 mt-0.5">
                          {m.joinedAt ? format(new Date(m.joinedAt), 'dd MMM yy') : '...'} — {m.leftAt ? format(new Date(m.leftAt), 'dd MMM yy') : 'Sekarang'}
                        </p>
                      )}
                    </div>
                  </div>
                  <button onClick={() => removeMember(m.userId)} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-surface-400 hover:text-rose-400 transition-colors shrink-0">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {selectedProject.members.length === 0 && (
                <p className="text-center text-surface-500 text-sm py-6">Belum ada anggota</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManagement;
