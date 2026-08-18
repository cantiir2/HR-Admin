import { useState, useEffect, useMemo } from 'react';
import {
  Menu as MenuIcon, Plus, Edit2, Trash2, Link as LinkIcon, Move,
  ChevronDown, ChevronRight, Eye, EyeOff, Save, Check, X, Loader2, Search
} from 'lucide-react';
import { icons } from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import AppAlert from '../../components/AppAlert';
import AppSelect from '../../components/AppSelect';
import DynamicIcon from '../../components/DynamicIcon';
import PermissionControl from '../../components/PermissionControl';

const ALL_ICON_NAMES = Object.keys(icons);

const MasterMenus = () => {
  const [menus, setMenus] = useState([]);
  const [functions, setFunctions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [draggedId, setDraggedId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [iconSearch, setIconSearch] = useState('');
  const [menuForm, setMenuForm] = useState({
    id: null, displayText: '', parentId: '', functionId: '', icon: 'FolderClosed', seq: 0, isActive: true
  });

  const filteredIcons = useMemo(() => {
    if (!iconSearch.trim()) return ALL_ICON_NAMES.slice(0, 60);
    const q = iconSearch.toLowerCase();
    return ALL_ICON_NAMES.filter(name => name.toLowerCase().includes(q)).slice(0, 60);
  }, [iconSearch]);

  const { fetchMenus: refreshNavbar } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resMenus, resFn] = await Promise.all([
        api.get('/api/authorization/menus'),
        api.get('/api/authorization/functions')
      ]);
      setMenus(resMenus.data.data || []);
      setFunctions(resFn.data.data || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Gagal memuat data menu');
    } finally {
      setLoading(false);
    }
  };

  // Build tree structure
  const parentMenus = menus.filter(m => !m.parentId).sort((a, b) => (a.seq || 0) - (b.seq || 0));
  const getChildren = (parentId) => menus.filter(m => Number(m.parentId) === Number(parentId)).sort((a, b) => (a.seq || 0) - (b.seq || 0));

  // Handle Drag & Drop
  const handleDragStart = (e, id) => {
    setDraggedId(id);
    e.dataTransfer.setData('text/plain', id.toString());
  };

  const handleDragOver = (e, id) => {
    e.preventDefault();
    if (draggedId !== id) {
      setDragOverId(id);
    }
  };

  const handleDrop = (e, targetId) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const updated = [...menus];
    const draggedIdx = updated.findIndex(m => Number(m.id) === Number(draggedId));
    const targetIdx = updated.findIndex(m => Number(m.id) === Number(targetId));

    if (draggedIdx > -1 && targetIdx > -1) {
      const targetMenu = updated[targetIdx];
      const draggedMenu = updated[draggedIdx];

      // If dragged item was dropped onto another parent item, update parentId or swap order
      if (draggedMenu.id !== targetMenu.id) {
        const item = updated.splice(draggedIdx, 1)[0];
        updated.splice(targetIdx, 0, item);

        // Recalculate seq
        const reordered = updated.map((m, idx) => ({ ...m, seq: idx + 1 }));
        setMenus(reordered);
        toast.info('Urutan menu diubah di tampilan. Klik "Simpan Urutan & Perubahan" untuk menyimpan permanen.');
      }
    }
    setDraggedId(null);
    setDragOverId(null);
  };

  const handleSaveBatchReorder = async () => {
    setSaving(true);
    try {
      await api.put('/api/authorization/menus/reorder', { items: menus });
      toast.success('Urutan dan konfigurasi menu berhasil disimpan!');
      fetchData();
      if (refreshNavbar) await refreshNavbar();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal menyimpan urutan menu');
    } finally {
      setSaving(false);
    }
  };

  const toggleActiveStatus = async (menu) => {
    try {
      const newStatus = !menu.isActive;
      await api.put(`/api/authorization/menus/${menu.id}`, {
        ...menu,
        isActive: newStatus
      });
      toast.success(`Menu "${menu.displayText}" sekarang ${newStatus ? 'AKTIF' : 'NON-AKTIF'}`);
      setMenus(prev => prev.map(m => Number(m.id) === Number(menu.id) ? { ...m, isActive: newStatus } : m));
      if (refreshNavbar) await refreshNavbar();
    } catch (err) {
      toast.error('Gagal mengubah status aktif menu');
    }
  };

  const openFormModal = (menu = null, parentId = '') => {
    if (menu) {
      setMenuForm({
        id: menu.id ? String(menu.id) : null,
        displayText: menu.displayText || '',
        parentId: menu.parentId !== null && menu.parentId !== undefined ? String(menu.parentId) : (parentId ? String(parentId) : ''),
        functionId: menu.functionId !== null && menu.functionId !== undefined ? String(menu.functionId) : '',
        icon: menu.icon || 'FolderClosed',
        seq: menu.seq || 0,
        isActive: menu.isActive !== false
      });
    } else {
      setMenuForm({
        id: null,
        displayText: '',
        parentId: parentId ? String(parentId) : '',
        functionId: '',
        icon: 'FolderClosed',
        seq: menus.length + 1,
        isActive: true
      });
    }
    setIsModalOpen(true);
    setIconSearch('');
  };

  const handleSaveForm = async (e) => {
    e.preventDefault();
    try {
      if (menuForm.id) {
        await api.put(`/api/authorization/menus/${menuForm.id}`, menuForm);
        toast.success('Menu berhasil diperbarui');
      } else {
        await api.post('/api/authorization/menus', menuForm);
        toast.success('Menu baru berhasil ditambahkan');
      }
      setIsModalOpen(false);
      fetchData();
      if (refreshNavbar) await refreshNavbar();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal menyimpan menu');
    }
  };

  const handleDeleteMenu = async (id, displayText) => {
    const isOk = await confirm({
      title: 'Hapus Menu',
      message: `Apakah Anda yakin ingin menghapus menu "${displayText}"?`,
      variant: 'danger'
    });
    if (!isOk) return;

    try {
      await api.delete(`/api/authorization/menus/${id}`);
      toast.success('Menu berhasil dihapus');
      fetchData();
      if (refreshNavbar) await refreshNavbar();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal menghapus menu');
    }
  };

  const openLinkModal = (menu) => {
    setEditingItem(menu);
    setMenuForm({
      id: menu.id ? String(menu.id) : null,
      displayText: menu.displayText || '',
      parentId: menu.parentId !== null && menu.parentId !== undefined ? String(menu.parentId) : '',
      functionId: menu.functionId !== null && menu.functionId !== undefined ? String(menu.functionId) : '',
      icon: menu.icon || 'FolderClosed',
      seq: menu.seq || 0,
      isActive: menu.isActive !== false
    });
    setIsLinkModalOpen(true);
  };

  const handleSaveLink = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/authorization/menus/${editingItem.id}`, {
        displayText: editingItem.displayText,
        parentId: editingItem.parentId ? String(editingItem.parentId) : null,
        icon: editingItem.icon,
        seq: editingItem.seq,
        isActive: editingItem.isActive,
        functionId: menuForm.functionId ? String(menuForm.functionId) : null
      });
      toast.success(`Set Function URL untuk menu "${editingItem.displayText}" berhasil!`);
      setIsLinkModalOpen(false);
      fetchData();
      if (refreshNavbar) await refreshNavbar();
    } catch (err) {
      toast.error('Gagal memperbarui function link menu');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <MenuIcon className="text-brand-400" size={28} />
            Master Dynamic Menus (Drag & Drop)
          </h1>
          <p className="text-sm text-surface-400 mt-1">
            Struktur Menu Dinamis OVOID: Atur Parent-Child, Urutan Drag & Drop, Icon, dan Link Screen Function URL.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto">
          <PermissionControl action="edit">
            <button
              onClick={handleSaveBatchReorder}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium shadow-lg transition-all"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Simpan Urutan & Perubahan
            </button>
          </PermissionControl>
          <PermissionControl action="add">
            <button
              onClick={() => openFormModal()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-brand text-white text-sm font-medium shadow-lg hover:shadow-brand-500/25 transition-all"
            >
              <Plus size={16} />
              Tambah Parent Menu
            </button>
          </PermissionControl>
        </div>
      </div>

      {error && <AppAlert type="error" message={error} onClose={() => setError(null)} />}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-brand-500" size={36} />
        </div>
      ) : (
        <div className="glass-card p-6 rounded-2xl border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-surface-400 uppercase tracking-wider pb-3 border-b border-white/[0.08] px-3">
            <span>Struktur Menu / Sub-Menu</span>
            <div className="flex items-center gap-8">
              <span>Linked Screen Function</span>
              <span>Status</span>
              <span>Aksi</span>
            </div>
          </div>

          <div className="space-y-3">
            {parentMenus.map(parent => {
              const children = getChildren(parent.id);
              const parentFunc = functions.find(f => Number(f.id) === Number(parent.functionId));

              return (
                <div key={parent.id} className="space-y-2">
                  {/* PARENT MENU ROW */}
                  <div
                    draggable
                    onDragStart={e => handleDragStart(e, parent.id)}
                    onDragOver={e => handleDragOver(e, parent.id)}
                    onDrop={e => handleDrop(e, parent.id)}
                    className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${dragOverId === parent.id
                        ? 'border-brand-400 bg-brand-500/20'
                        : parent.isActive
                          ? 'bg-white/[0.03] border-white/[0.08] text-white hover:bg-white/[0.06]'
                          : 'bg-rose-500/5 border-rose-500/20 text-surface-500'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="cursor-grab active:cursor-grabbing text-surface-500 hover:text-white p-1">
                        <Move size={16} />
                      </span>
                      <span className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-300 font-bold text-xs">
                        #{parent.seq}
                      </span>
                      <div>
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                          <DynamicIcon name={parent.icon || 'FolderClosed'} size={16} className="text-brand-400" />
                          {parent.displayText}
                          <span className="text-[11px] font-normal px-2 py-0.5 rounded bg-white/[0.06] text-surface-400 font-mono">
                            icon: {parent.icon || 'FolderClosed'}
                          </span>
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      {/* Linked Function URL */}
                      <div className="text-right">
                        {parentFunc ? (
                          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                            {parentFunc.url}
                          </span>
                        ) : (
                          <span className="text-xs text-surface-500 italic">Category Header (No Link)</span>
                        )}
                      </div>

                      {/* Active Status */}
                      <button
                        onClick={() => toggleActiveStatus(parent)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${parent.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                          }`}
                      >
                        {parent.isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                        {parent.isActive ? 'Aktif' : 'Non-Aktif'}
                      </button>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1.5">
                        <PermissionControl action="edit">
                          <button
                            onClick={() => openLinkModal(parent)}
                            title="Set Function Link"
                            className="p-1.5 rounded-lg bg-brand-500/10 text-brand-300 hover:bg-brand-500/20"
                          >
                            <LinkIcon size={14} />
                          </button>
                        </PermissionControl>
                        <PermissionControl action="add">
                          <button
                            onClick={() => openFormModal(null, parent.id)}
                            title="Tambah Sub-Menu"
                            className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                          >
                            <Plus size={14} />
                          </button>
                        </PermissionControl>
                        <PermissionControl action="edit">
                          <button
                            onClick={() => openFormModal(parent)}
                            title="Edit Menu"
                            className="p-1.5 rounded-lg bg-white/[0.06] text-surface-300 hover:text-white"
                          >
                            <Edit2 size={14} />
                          </button>
                        </PermissionControl>
                        <PermissionControl action="delete">
                          <button
                            onClick={() => handleDeleteMenu(parent.id, parent.displayText)}
                            title="Hapus Menu"
                            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                          >
                            <Trash2 size={14} />
                          </button>
                        </PermissionControl>
                      </div>
                    </div>
                  </div>

                  {/* CHILD SUB-MENUS */}
                  {children.length > 0 && (
                    <div className="pl-8 space-y-2 border-l-2 border-brand-500/30 ml-4 py-1">
                      {children.map(child => {
                        const childFunc = functions.find(f => Number(f.id) === Number(child.functionId));

                        return (
                          <div
                            key={child.id}
                            draggable
                            onDragStart={e => handleDragStart(e, child.id)}
                            onDragOver={e => handleDragOver(e, child.id)}
                            onDrop={e => handleDrop(e, child.id)}
                            className={`p-3 rounded-xl border flex items-center justify-between transition-all ${dragOverId === child.id
                                ? 'border-brand-400 bg-brand-500/20'
                                : child.isActive
                                  ? 'bg-white/[0.02] border-white/[0.06] text-surface-200 hover:bg-white/[0.05]'
                                  : 'bg-rose-500/5 border-rose-500/15 text-surface-500'
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="cursor-grab active:cursor-grabbing text-surface-500 hover:text-white p-1">
                                <Move size={14} />
                              </span>
                              <span className="text-xs font-mono text-surface-400">
                                #{child.seq}
                              </span>
                              <h5 className="text-sm font-medium text-white flex items-center gap-2">
                                {child.displayText}
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.05] text-surface-400 font-mono">
                                  icon: {child.icon}
                                </span>
                              </h5>
                            </div>

                            <div className="flex items-center gap-6">
                              <div className="text-right">
                                {childFunc ? (
                                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/20">
                                    {childFunc.url}
                                  </span>
                                ) : (
                                  <span className="text-xs text-rose-400/80 italic">Unlinked Function</span>
                                )}
                              </div>

                              <button
                                onClick={() => toggleActiveStatus(child)}
                                className={`px-2 py-0.5 rounded-full text-[11px] font-medium flex items-center gap-1 transition-all ${child.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                                  }`}
                              >
                                {child.isActive ? 'Aktif' : 'Non-Aktif'}
                              </button>

                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => openLinkModal(child)}
                                  title="Set Function Link"
                                  className="p-1.5 rounded-lg bg-brand-500/10 text-brand-300 hover:bg-brand-500/20"
                                >
                                  <LinkIcon size={14} />
                                </button>
                                <button
                                  onClick={() => openFormModal(child)}
                                  title="Edit Sub-Menu"
                                  className="p-1.5 rounded-lg bg-white/[0.06] text-surface-300 hover:text-white"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteMenu(child.id, child.displayText)}
                                  title="Hapus Sub-Menu"
                                  className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* EDIT / CREATE MENU MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <form onSubmit={handleSaveForm} className="bg-surface-900 border border-white/[0.1] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="text-lg font-bold text-white">
                {menuForm.id ? 'Edit Menu' : menuForm.parentId ? 'Tambah Sub-Menu' : 'Tambah Parent Menu'}
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-surface-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div>
              <label className="text-xs font-medium text-surface-300 block mb-1">Display Text (Nama Menu) *</label>
              <input
                type="text"
                required
                value={menuForm.displayText}
                onChange={e => setMenuForm({ ...menuForm, displayText: e.target.value })}
                className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-surface-300 block mb-1">Parent Menu</label>
              <select
                value={menuForm.parentId}
                onChange={e => setMenuForm({ ...menuForm, parentId: e.target.value })}
                className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500"
              >
                <option value="">(None - Top Level Parent)</option>
                {parentMenus.filter(p => Number(p.id) !== Number(menuForm.id)).map(p => (
                  <option key={p.id} value={p.id.toString()}>{p.displayText}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-surface-300 block mb-1">Icon Menu</label>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-300 flex-shrink-0">
                  <DynamicIcon name={menuForm.icon} size={20} />
                </div>
                <div className="flex-1 relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
                  <input
                    type="text"
                    placeholder="Search icons..."
                    value={iconSearch}
                    onChange={e => setIconSearch(e.target.value)}
                    className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl pl-9 pr-4 py-2 text-white text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-8 gap-1.5 max-h-36 overflow-y-auto rounded-xl bg-white/[0.03] border border-white/[0.08] p-2">
                {filteredIcons.map(iconName => (
                  <button
                    key={iconName}
                    type="button"
                    title={iconName}
                    onClick={() => setMenuForm({ ...menuForm, icon: iconName })}
                    className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                      menuForm.icon === iconName
                        ? 'bg-brand-500/20 text-brand-300 ring-1 ring-brand-500/40'
                        : 'text-surface-400 hover:text-white hover:bg-white/[0.08]'
                    }`}
                  >
                    <DynamicIcon name={iconName} size={16} />
                  </button>
                ))}
                {filteredIcons.length === 0 && (
                  <p className="col-span-8 text-xs text-surface-500 text-center py-3">No icons found</p>
                )}
              </div>
              <p className="text-[11px] text-surface-500 mt-1">Selected: <span className="text-brand-400 font-mono">{menuForm.icon}</span></p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-surface-300 block mb-1">Linked Screen Function</label>
                <AppSelect
                  value={menuForm.functionId}
                  onChange={value => setMenuForm({ ...menuForm, functionId: value })}
                  options={[
                    ['', '(None - Header Category)'],
                    ...functions.map(f => [f.id.toString(), `${f.name} (${f.url})`])
                  ]}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-surface-300 block mb-1">Urutan Sequence (seq)</label>
                <input
                  type="number"
                  value={menuForm.seq}
                  onChange={e => setMenuForm({ ...menuForm, seq: parseInt(e.target.value, 10) || 0 })}
                  className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <label className="flex items-center gap-2 text-sm text-surface-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={menuForm.isActive}
                  onChange={e => setMenuForm({ ...menuForm, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-white/[0.2] bg-white/[0.06] text-brand-500 focus:ring-brand-500"
                />
                Status Menu Aktif (tampil di navbar)
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.08]">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl bg-white/[0.06] text-surface-300 text-sm">
                Batal
              </button>
              <button type="submit" className="px-5 py-2 rounded-xl gradient-brand text-white text-sm font-medium shadow-lg">
                Simpan Menu
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SET FUNCTION LINK MODAL */}
      {isLinkModalOpen && editingItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <form onSubmit={handleSaveLink} className="bg-surface-900 border border-white/[0.1] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">Set Function URL Link</h3>
                <p className="text-xs text-brand-400">Menu: {editingItem.displayText}</p>
              </div>
              <button type="button" onClick={() => setIsLinkModalOpen(false)} className="text-surface-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div>
              <label className="text-xs font-medium text-surface-300 block mb-1">Pilih Screen Function Route</label>
              <AppSelect
                value={menuForm.functionId}
                onChange={value => setMenuForm({ ...menuForm, functionId: value })}
                options={[
                  ['', '(Tanpa Function - Header Parent)'],
                  ...functions.map(f => [f.id.toString(), `${f.name} (${f.url})`])
                ]}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.08]">
              <button type="button" onClick={() => setIsLinkModalOpen(false)} className="px-4 py-2 rounded-xl bg-white/[0.06] text-surface-300 text-sm">
                Batal
              </button>
              <button type="submit" className="px-5 py-2 rounded-xl gradient-brand text-white text-sm font-medium shadow-lg">
                Simpan Function Link
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default MasterMenus;
