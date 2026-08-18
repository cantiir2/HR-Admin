import { useState, useEffect } from 'react';
import { ShieldCheck, Plus, Edit2, Trash2, SlidersHorizontal, X, Check, Loader2 } from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import AppAlert from '../../components/AppAlert';
import RoleTreeCheckbox from '../../components/RoleTreeCheckbox';
import PermissionControl from '../../components/PermissionControl';

const MasterRoles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [treeRawList, setTreeRawList] = useState([]);
  const [selectedFeatureIds, setSelectedFeatureIds] = useState([]);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isPermModalOpen, setIsPermModalOpen] = useState(false);
  const [roleForm, setRoleForm] = useState({ id: null, name: '', description: '' });
  const { fetchMenus } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/authorization/roles');
      setRoles(res.data.data || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Gagal memuat data role');
    } finally {
      setLoading(false);
    }
  };

  const openRoleModal = (role = null) => {
    if (role) {
      setRoleForm({ id: role.id, name: role.name, description: role.description || '' });
    } else {
      setRoleForm({ id: null, name: '', description: '' });
    }
    setIsRoleModalOpen(true);
  };

  const handleSaveRole = async (e) => {
    e.preventDefault();
    try {
      if (roleForm.id) {
        await api.put(`/api/authorization/roles/${roleForm.id}`, roleForm);
        toast.success('Role berhasil diperbarui');
      } else {
        await api.post('/api/authorization/roles', roleForm);
        toast.success('Role baru berhasil dibuat');
      }
      setIsRoleModalOpen(false);
      fetchRoles();
      if (fetchMenus) await fetchMenus();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal menyimpan role');
    }
  };

  const handleDeleteRole = async (id) => {
    const isOk = await confirm({
      title: 'Hapus Role',
      message: 'Apakah Anda yakin ingin menghapus role ini?',
      variant: 'danger'
    });
    if (!isOk) return;

    try {
      await api.delete(`/api/authorization/roles/${id}`);
      toast.success('Role berhasil dihapus');
      fetchRoles();
      if (fetchMenus) await fetchMenus();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal menghapus role');
    }
  };

  const openPermModal = async (role) => {
    setSelectedRole(role);
    setIsPermModalOpen(true);
    setLoading(true);
    try {
      const res = await api.get(`/api/authorization/roles/${role.id}/permissions`);
      if (res.data.data) {
        setTreeRawList(res.data.data.rawList || []);
        setSelectedFeatureIds(res.data.data.selectedFeatureIds || []);
      }
    } catch (err) {
      toast.error('Gagal mengambil matriks hak akses');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePermissions = async () => {
    try {
      await api.put(`/api/authorization/roles/${selectedRole.id}/permissions`, {
        featureIds: selectedFeatureIds
      });
      toast.success(`Hak akses role "${selectedRole.name}" berhasil diperbarui!`);
      setIsPermModalOpen(false);
      if (fetchMenus) await fetchMenus();
    } catch (err) {
      toast.error('Gagal memperbarui hak akses role');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <ShieldCheck className="text-brand-400" size={28} />
            Master Role & Hak Akses
          </h1>
          <p className="text-sm text-surface-400 mt-1">
            Pengaturan Role dan Konfigurasi Matriks Hak Akses Screen/API (OVOID).
          </p>
        </div>
        <PermissionControl action="add">
          <button
            onClick={() => openRoleModal()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-brand text-white text-sm font-medium shadow-lg hover:shadow-brand-500/25 transition-all self-start md:self-auto"
          >
            <Plus size={16} />
            Tambah Role Baru
          </button>
        </PermissionControl>
      </div>

      {error && <AppAlert type="error" message={error} onClose={() => setError(null)} />}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-brand-500" size={36} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {roles.map(role => (
            <div key={role.id} className="glass-card p-5 rounded-2xl border border-white/[0.08] flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-brand-500/20 text-brand-300">
                    Role #{Number(role.id)}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${role.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                    {role.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mt-3">{role.name}</h3>
                <p className="text-xs text-surface-400 mt-1">{role.description || 'Tidak ada deskripsi'}</p>
              </div>

              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
                <PermissionControl action="edit">
                  <button
                    onClick={() => openPermModal(role)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-medium hover:bg-brand-500/20 transition-all"
                  >
                    <SlidersHorizontal size={14} />
                    Hak Akses Matrix
                  </button>
                </PermissionControl>
                <PermissionControl action="edit">
                  <button onClick={() => openRoleModal(role)} className="p-1.5 rounded-lg bg-white/[0.06] text-surface-400 hover:text-white">
                    <Edit2 size={14} />
                  </button>
                </PermissionControl>
                {Number(role.id) > 4 && (
                  <PermissionControl action="delete">
                    <button onClick={() => handleDeleteRole(role.id)} className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20">
                      <Trash2 size={14} />
                    </button>
                  </PermissionControl>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PERMISSION MATRIX MODAL */}
      {isPermModalOpen && selectedRole && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-surface-900 border border-white/[0.1] rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl">
            <div className="p-5 border-b border-white/[0.08] flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Matriks Hak Akses Screen Function</h3>
                <p className="text-xs text-brand-400 mt-0.5">Role: {selectedRole.name}</p>
              </div>
              <button onClick={() => setIsPermModalOpen(false)} className="text-surface-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1">
              <RoleTreeCheckbox
                rawList={treeRawList}
                selectedFeatureIds={selectedFeatureIds}
                onChangeSelected={setSelectedFeatureIds}
              />
            </div>

            <div className="p-4 border-t border-white/[0.08] flex justify-end gap-3">
              <button onClick={() => setIsPermModalOpen(false)} className="px-4 py-2 rounded-xl bg-white/[0.06] text-surface-300 text-sm">
                Batal
              </button>
              <button onClick={handleSavePermissions} className="px-5 py-2 rounded-xl gradient-brand text-white text-sm font-medium shadow-lg">
                Simpan Matriks Hak Akses
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ROLE FORM MODAL */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <form onSubmit={handleSaveRole} className="bg-surface-900 border border-white/[0.1] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">{roleForm.id ? 'Edit Role' : 'Tambah Role Baru'}</h3>
            <div>
              <label className="text-xs font-medium text-surface-300 block mb-1">Nama Role</label>
              <input
                type="text"
                required
                value={roleForm.name}
                onChange={e => setRoleForm({ ...roleForm, name: e.target.value })}
                className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-surface-300 block mb-1">Deskripsi</label>
              <textarea
                value={roleForm.description}
                onChange={e => setRoleForm({ ...roleForm, description: e.target.value })}
                className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setIsRoleModalOpen(false)} className="px-4 py-2 rounded-xl bg-white/[0.06] text-surface-300 text-sm">
                Batal
              </button>
              <button type="submit" className="px-5 py-2 rounded-xl gradient-brand text-white text-sm font-medium shadow-lg">
                Simpan Role
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default MasterRoles;
