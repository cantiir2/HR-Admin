import { useState, useEffect } from 'react';
import {
  ShieldCheck, Menu as MenuIcon, Layout, Globe, KeyRound, Plus, Edit2, Trash2,
  Check, X, Loader2, Search, SlidersHorizontal, ChevronRight, FolderClosed
} from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import AppAlert from '../../components/AppAlert';
import MasterMenus from './MasterMenus';
import Pagination from '../../components/Pagination';
import RoleTreeCheckbox from '../../components/RoleTreeCheckbox';
import AppSelect from '../../components/AppSelect';

const AuthorizationManagement = () => {
  const [activeTab, setActiveTab] = useState('roles');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { fetchMenus } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();

  // Roles state
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [treeRawList, setTreeRawList] = useState([]);
  const [selectedFeatureIds, setSelectedFeatureIds] = useState([]);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isPermModalOpen, setIsPermModalOpen] = useState(false);
  const [roleForm, setRoleForm] = useState({ id: null, name: '', description: '' });

  // Menus state
  const [menus, setMenus] = useState([]);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [menuForm, setMenuForm] = useState({
    id: null, displayText: '', parentId: '', functionId: '', icon: 'FolderClosed', seq: 0, isActive: true
  });

  // Functions & Features state
  const [functions, setFunctions] = useState([]);
  const [features, setFeatures] = useState([]);
  const [isFnModalOpen, setIsFnModalOpen] = useState(false);
  const [fnForm, setFnForm] = useState({ name: '', url: '', description: '' });

  const [isFeatModalOpen, setIsFeatModalOpen] = useState(false);
  const [featForm, setFeatForm] = useState({ apiMethod: 'GET', apiUrl: '', functionId: '' });
  const [apiMethods, setApiMethods] = useState([]);

  const getMethodBadgeClass = (method) => {
    switch (method?.toUpperCase()) {
      case 'GET':
        return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      case 'POST':
        return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
      case 'PUT':
        return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      case 'PATCH':
        return 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
      case 'DELETE':
        return 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
      case 'OPTIONS':
      case 'HEAD':
        return 'bg-teal-500/20 text-teal-400 border border-teal-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border border-gray-500/30';
    }
  };

  const defaultApiMethods = [
    { code: 'GET', name: 'GET' },
    { code: 'POST', name: 'POST' },
    { code: 'PUT', name: 'PUT' },
    { code: 'PATCH', name: 'PATCH' },
    { code: 'DELETE', name: 'DELETE' },
    { code: '*', name: '* (ALL METHODS)' }
  ];

  const methodOptions = apiMethods.length > 0
    ? apiMethods.map(item => ({ code: item.code, name: item.name || item.code }))
    : defaultApiMethods;

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'roles') {
        const res = await api.get('/api/authorization/roles');
        setRoles(res.data.data || []);
      } else if (activeTab === 'menus') {
        const [resMenus, resFns] = await Promise.all([
          api.get('/api/authorization/menus'),
          api.get('/api/authorization/functions')
        ]);
        setMenus(resMenus.data.data || []);
        setFunctions(resFns.data.data || []);
      } else if (activeTab === 'functions') {
        const res = await api.get('/api/authorization/functions');
        setFunctions(res.data.data || []);
      } else if (activeTab === 'features') {
        const [resFeats, resFns, resMethods] = await Promise.all([
          api.get('/api/authorization/features'),
          api.get('/api/authorization/functions'),
          api.get('/api/system?category=API_METHOD&isActive=true')
        ]);
        setFeatures(resFeats.data.data || []);
        setFunctions(resFns.data.data || []);
        setApiMethods(resMethods.data || []);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Gagal memuat data otorisasi');
    } finally {
      setLoading(false);
    }
  };

  // ─── ROLES HANDLERS ────────────────────────────────────────────────────────
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
      fetchData();
      if (fetchMenus) await fetchMenus();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal menyimpan role');
    }
  };

  const handleDeleteRole = async (id) => {
    const isOk = await confirm({
      title: 'Hapus Role',
      message: 'Apakah Anda yakin ingin menghapus role ini? Seluruh hak akses role akan dicabut.',
      type: 'danger'
    });
    if (!isOk) return;

    try {
      await api.delete(`/api/authorization/roles/${id}`);
      toast.success('Role berhasil dihapus');
      fetchData();
      if (fetchMenus) await fetchMenus();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal menghapus role');
    }
  };

  // ─── PERMISSION MATRIX HANDLERS ──────────────────────────────────────────
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
      toast.error('Gagal memuat matriks hak akses');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePermissions = async () => {
    try {
      await api.put(`/api/authorization/roles/${selectedRole.id}/permissions`, {
        featureIds: selectedFeatureIds
      });
      toast.success(`Hak akses untuk role ${selectedRole.name} berhasil diperbarui`);
      setIsPermModalOpen(false);
      if (fetchMenus) await fetchMenus();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal menyimpan matriks hak akses');
    }
  };

  // ─── MENU HANDLERS ────────────────────────────────────────────────────────
  const openMenuModal = (menu = null) => {
    if (menu) {
      setMenuForm({
        id: menu.id,
        displayText: menu.displayText,
        parentId: menu.parentId || '',
        functionId: menu.functionId || '',
        icon: menu.icon || 'FolderClosed',
        seq: menu.seq || 0,
        isActive: menu.isActive !== false
      });
    } else {
      setMenuForm({
        id: null, displayText: '', parentId: '', functionId: '', icon: 'FolderClosed', seq: 0, isActive: true
      });
    }
    setIsMenuModalOpen(true);
  };

  const handleSaveMenu = async (e) => {
    e.preventDefault();
    try {
      if (menuForm.id) {
        await api.put(`/api/authorization/menus/${menuForm.id}`, menuForm);
        toast.success('Menu berhasil diperbarui');
      } else {
        await api.post('/api/authorization/menus', menuForm);
        toast.success('Menu baru berhasil ditambahkan');
      }
      setIsMenuModalOpen(false);
      fetchData();
      if (fetchMenus) await fetchMenus();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal menyimpan menu');
    }
  };

  const handleDeleteMenu = async (id) => {
    const isOk = await confirm({
      title: 'Hapus Menu',
      message: 'Apakah Anda yakin ingin menghapus menu ini?',
      type: 'danger'
    });
    if (!isOk) return;

    try {
      await api.delete(`/api/authorization/menus/${id}`);
      toast.success('Menu berhasil dihapus');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal menghapus menu');
    }
  };

  // ─── FUNCTION & FEATURE HANDLERS ──────────────────────────────────────────
  const handleSaveFunction = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/authorization/functions', fnForm);
      toast.success('Function baru berhasil ditambahkan');
      setIsFnModalOpen(false);
      setFnForm({ name: '', url: '', description: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal menambah function');
    }
  };

  const handleSaveFeature = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/authorization/features', featForm);
      toast.success('API Feature baru berhasil ditambahkan');
      setIsFeatModalOpen(false);
      setFeatForm({ apiMethod: 'GET', apiUrl: '', functionId: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal menambah API feature');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <ShieldCheck className="text-brand-400" size={28} />
            Otorisasi & Manajemen Hak Akses
          </h1>
          <p className="text-sm text-surface-400 mt-1">
            Konfigurasi Role, Dynamic Menus, Screen Functions, dan Otorisasi API.
          </p>
        </div>
      </div>

      {error && <AppAlert type="error" message={error} onClose={() => setError(null)} />}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/[0.08] pb-3">
        <button
          onClick={() => setActiveTab('roles')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${activeTab === 'roles'
            ? 'gradient-brand text-white shadow-lg shadow-brand-500/20'
            : 'bg-white/[0.04] text-surface-400 hover:text-white hover:bg-white/[0.08]'
            }`}
        >
          <KeyRound size={16} />
          Management Role & Permission
        </button>

        <button
          onClick={() => setActiveTab('menus')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${activeTab === 'menus'
            ? 'gradient-brand text-white shadow-lg shadow-brand-500/20'
            : 'bg-white/[0.04] text-surface-400 hover:text-white hover:bg-white/[0.08]'
            }`}
        >
          <MenuIcon size={16} />
          Dynamic Menus (Sidebar)
        </button>

        <button
          onClick={() => setActiveTab('functions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${activeTab === 'functions'
            ? 'gradient-brand text-white shadow-lg shadow-brand-500/20'
            : 'bg-white/[0.04] text-surface-400 hover:text-white hover:bg-white/[0.08]'
            }`}
        >
          <Layout size={16} />
          Screen Functions
        </button>

        <button
          onClick={() => setActiveTab('features')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${activeTab === 'features'
            ? 'gradient-brand text-white shadow-lg shadow-brand-500/20'
            : 'bg-white/[0.04] text-surface-400 hover:text-white hover:bg-white/[0.08]'
            }`}
        >
          <Globe size={16} />
          API Features
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-brand-500" size={36} />
        </div>
      ) : (
        <>
          {/* TAB 1: ROLES MANAGEMENT */}
          {activeTab === 'roles' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => openRoleModal()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-brand text-white text-sm font-medium shadow-lg hover:shadow-brand-500/25 transition-all"
                >
                  <Plus size={16} />
                  Tambah Role Baru
                </button>
              </div>

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
                      <button
                        onClick={() => openPermModal(role)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-medium hover:bg-brand-500/20 transition-all"
                      >
                        <SlidersHorizontal size={14} />
                        Hak Akses Matrix
                      </button>
                      <button onClick={() => openRoleModal(role)} className="p-1.5 rounded-lg bg-white/[0.06] text-surface-400 hover:text-white">
                        <Edit2 size={14} />
                      </button>
                      {/* {Number(role.id) > 4 && ( */}
                      <button onClick={() => handleDeleteRole(role.id)} className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20">
                        <Trash2 size={14} />
                      </button>
                      {/* )} */}
                    </div>
                    {roles.totalRows > 0 && (
                      <div className="mt-6 glass-card p-4">
                        <Pagination
                          page={page}
                          doSearch={doSearch}
                          changePageSize={changePageSize}
                          hideGoToPage={false}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: DYNAMIC MENUS */}
          {activeTab === 'menus' && (
            <MasterMenus />
          )}

          {/* TAB 3: SCREEN FUNCTIONS */}
          {activeTab === 'functions' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => setIsFnModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-brand text-white text-sm font-medium shadow-lg hover:shadow-brand-500/25 transition-all"
                >
                  <Plus size={16} />
                  Tambah Screen Function
                </button>
              </div>

              <div className="glass-card rounded-2xl overflow-hidden border border-white/[0.08]">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/[0.04] text-surface-400 text-xs uppercase border-b border-white/[0.08]">
                    <tr>
                      <th className="p-4">ID</th>
                      <th className="p-4">Nama Function</th>
                      <th className="p-4">Route URL</th>
                      <th className="p-4">Deskripsi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06] text-surface-300">
                    {functions.map(fn => (
                      <tr key={fn.id} className="hover:bg-white/[0.02]">
                        <td className="p-4 font-mono text-surface-500">#{Number(fn.id)}</td>
                        <td className="p-4 font-semibold text-white">{fn.name}</td>
                        <td className="p-4 text-xs font-mono text-brand-300">{fn.url}</td>
                        <td className="p-4 text-xs text-surface-400">{fn.description || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: API FEATURES */}
          {activeTab === 'features' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => setIsFeatModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-brand text-white text-sm font-medium shadow-lg hover:shadow-brand-500/25 transition-all"
                >
                  <Plus size={16} />
                  Tambah API Feature
                </button>
              </div>

              <div className="glass-card rounded-2xl overflow-hidden border border-white/[0.08]">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/[0.04] text-surface-400 text-xs uppercase border-b border-white/[0.08]">
                    <tr>
                      <th className="p-4">ID</th>
                      <th className="p-4">Method</th>
                      <th className="p-4">API URL Pattern</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06] text-surface-300">
                    {features.map(feat => (
                      <tr key={feat.id} className="hover:bg-white/[0.02]">
                        <td className="p-4 font-mono text-surface-500">#{Number(feat.id)}</td>
                        <td className="p-4">
                          <span className={`text-xs px-2 py-0.5 rounded font-mono font-bold ${getMethodBadgeClass(feat.apiMethod)}`}>
                            {feat.apiMethod}
                          </span>
                        </td>
                        <td className="p-4 text-xs font-mono text-brand-300">{feat.apiUrl}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
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
                placeholder="Contoh: HR Manager"
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
                Simpan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MENU FORM MODAL */}
      {isMenuModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <form onSubmit={handleSaveMenu} className="bg-surface-900 border border-white/[0.1] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">{menuForm.id ? 'Edit Menu Sidebar' : 'Tambah Menu Sidebar'}</h3>
            <div>
              <label className="text-xs font-medium text-surface-300 block mb-1">Display Text</label>
              <input
                type="text"
                required
                value={menuForm.displayText}
                onChange={e => setMenuForm({ ...menuForm, displayText: e.target.value })}
                className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-surface-300 block mb-1">Parent Menu (Kosongkan jika Header)</label>
              <AppSelect
                value={menuForm.parentId}
                onChange={e => setMenuForm({ ...menuForm, parentId: e.target.value })}
                className="w-full bg-surface-800 border border-white/[0.1] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500"
              >
                <option value="">-- Tanpa Parent (Header Categories) --</option>
                {menus.filter(m => !m.parentId && m.id !== menuForm.id).map(p => (
                  <option key={p.id} value={Number(p.id)}>{p.displayText}</option>
                ))}
              </AppSelect>
            </div>
            <div>
              <label className="text-xs font-medium text-surface-300 block mb-1">Function / Target Route</label>
              <select
                value={menuForm.functionId}
                onChange={e => setMenuForm({ ...menuForm, functionId: e.target.value })}
                className="w-full bg-surface-800 border border-white/[0.1] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500"
              >
                <option value="">-- Tanpa Function (Kategori Kumpulan) --</option>
                {functions.map(f => (
                  <option key={f.id} value={Number(f.id)}>{f.name} ({f.url})</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-surface-300 block mb-1">Icon Name</label>
                <input
                  type="text"
                  value={menuForm.icon}
                  onChange={e => setMenuForm({ ...menuForm, icon: e.target.value })}
                  className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-surface-300 block mb-1">Sequence Order</label>
                <input
                  type="number"
                  value={menuForm.seq}
                  onChange={e => setMenuForm({ ...menuForm, seq: e.target.value })}
                  className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setIsMenuModalOpen(false)} className="px-4 py-2 rounded-xl bg-white/[0.06] text-surface-300 text-sm">
                Batal
              </button>
              <button type="submit" className="px-5 py-2 rounded-xl gradient-brand text-white text-sm font-medium shadow-lg">
                Simpan Menu
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SCREEN FUNCTION FORM MODAL */}
      {isFnModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <form onSubmit={handleSaveFunction} className="bg-surface-900 border border-white/[0.1] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Tambah Screen Function</h3>
            <div>
              <label className="text-xs font-medium text-surface-300 block mb-1">Nama Screen Function</label>
              <input
                type="text"
                required
                value={fnForm.name}
                onChange={e => setFnForm({ ...fnForm, name: e.target.value })}
                className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-surface-300 block mb-1">Route URL (misal: /admin/users)</label>
              <input
                type="text"
                required
                value={fnForm.url}
                onChange={e => setFnForm({ ...fnForm, url: e.target.value })}
                className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-surface-300 block mb-1">Deskripsi</label>
              <textarea
                value={fnForm.description}
                onChange={e => setFnForm({ ...fnForm, description: e.target.value })}
                className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500"
                rows={2}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setIsFnModalOpen(false)} className="px-4 py-2 rounded-xl bg-white/[0.06] text-surface-300 text-sm">
                Batal
              </button>
              <button type="submit" className="px-5 py-2 rounded-xl gradient-brand text-white text-sm font-medium shadow-lg">
                Simpan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* API FEATURE FORM MODAL */}
      {isFeatModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <form onSubmit={handleSaveFeature} className="bg-surface-900 border border-white/[0.1] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Tambah API Feature Endpoint</h3>
            <div>
              <label className="text-xs font-medium text-surface-300 block mb-1">HTTP Method</label>
              <AppSelect
                value={featForm.apiMethod}
                onChange={value => setFeatForm({ ...featForm, apiMethod: value })}
                options={methodOptions.map(m => ({
                  value: m.code,
                  label: m.name
                }))}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-surface-300 block mb-1">API URL Pattern (misal: /api/users/*)</label>
              <input
                type="text"
                required
                value={featForm.apiUrl}
                onChange={e => setFeatForm({ ...featForm, apiUrl: e.target.value })}
                className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-surface-300 block mb-1">Link ke Function (Opsional)</label>
              <AppSelect
                value={featForm.functionId}
                onChange={value => setFeatForm({ ...featForm, functionId: value })}
                options={functions.map(f => ({
                  value: f.id,
                  label: f.name
                }))}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setIsFeatModalOpen(false)} className="px-4 py-2 rounded-xl bg-white/[0.06] text-surface-300 text-sm">
                Batal
              </button>
              <button type="submit" className="px-5 py-2 rounded-xl gradient-brand text-white text-sm font-medium shadow-lg">
                Simpan
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AuthorizationManagement;
