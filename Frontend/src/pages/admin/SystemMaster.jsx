import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Plus, Pencil, Trash2, X, Settings, Search } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import PermissionControl from '../../components/PermissionControl';

const SystemMaster = () => {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ category: 'JOB_ROLE', code: '', name: '', description: '' });
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    const res = await api.get('/api/system');
    setItems(res.data);
  };

  const openCreate = () => {
    setEditingItem(null);
    setForm({ category: 'JOB_ROLE', code: '', name: '', description: '' });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm({ category: item.category, code: item.code, name: item.name, description: item.description || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/api/system/${editingItem.id}`, form);
      } else {
        await api.post('/api/system', form);
      }
      showToast({ type: 'success', title: 'Berhasil', message: 'Data master berhasil disimpan' });
      setShowModal(false);
      fetchItems();
    } catch (err) {
      showToast({ type: 'error', title: 'Gagal', message: err.response?.data?.error || 'Gagal menyimpan' });
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await confirm({
      title: 'Hapus Data Master?',
      message: 'Apakah Anda yakin ingin menghapus data master ini?',
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      variant: 'danger'
    });
    if (!confirmed) return;
    try {
      await api.delete(`/api/system/${id}`);
      showToast({ type: 'success', title: 'Berhasil', message: 'Data master berhasil dihapus' });
      fetchItems();
    } catch (err) {
      showToast({ type: 'error', title: 'Gagal', message: 'Gagal menghapus data master' });
    }
  };

  const toggleActive = async (item) => {
    try {
      await api.put(`/api/system/${item.id}`, { isActive: !item.isActive });
      fetchItems();
    } catch (err) {
      showToast({ type: 'error', title: 'Gagal', message: 'Gagal mengubah status' });
    }
  };

  const filtered = items.filter(i => {
    const q = search.toLowerCase();
    return i.code.toLowerCase().includes(q) || i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q);
  });

  const categories = [...new Set(items.map(i => i.category))];

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">System Master</h2>
          <p className="text-sm text-surface-400">Kelola System dan data master lainnya</p>
        </div>
        <PermissionControl action="add">
          <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} /> Tambah Data
          </button>
        </PermissionControl>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-500" />
        <input type="text" placeholder="Cari kode atau nama..." value={search} onChange={e => setSearch(e.target.value)} className="input-dark pl-11 text-sm" />
      </div>

      {categories.map(cat => {
        const catItems = filtered.filter(i => i.category === cat);
        if (catItems.length === 0) return null;
        return (
          <div key={cat} className="mb-6">
            <h3 className="text-sm font-semibold text-surface-400 uppercase tracking-wider mb-2 px-1 flex items-center gap-2">
              <Settings size={14} /> {cat.replace('_', ' ')}
            </h3>
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="px-4 py-3 text-xs font-semibold text-surface-400">Kode</th>
                      <th className="px-4 py-3 text-xs font-semibold text-surface-400">Nama</th>
                      <th className="px-4 py-3 text-xs font-semibold text-surface-400">Deskripsi</th>
                      <th className="px-4 py-3 text-xs font-semibold text-surface-400">Status</th>
                      <th className="px-4 py-3 text-xs font-semibold text-surface-400">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {catItems.map(item => (
                      <tr key={item.id} className="hover:bg-white/[0.02]">
                        <td className="px-4 py-3 text-sm font-mono font-medium text-brand-400">{item.code}</td>
                        <td className="px-4 py-3 text-sm text-white">{item.name}</td>
                        <td className="px-4 py-3 text-sm text-surface-400">{item.description || '-'}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => toggleActive(item)} className={`text-xs px-2 py-0.5 rounded-full cursor-pointer ${item.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-surface-700 text-surface-400'}`}>
                            {item.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <PermissionControl action="edit">
                              <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-white/[0.08] text-surface-400 hover:text-brand-400"><Pencil size={14} /></button>
                            </PermissionControl>
                            <PermissionControl action="delete">
                              <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-surface-400 hover:text-rose-400"><Trash2 size={14} /></button>
                            </PermissionControl>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md glass-card-light p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-white">{editingItem ? 'Edit Data' : 'Tambah Data Master'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-surface-400 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-surface-300 mb-1">Category *</label>
                <input type="text" required className="input-dark text-sm" placeholder="JOB_ROLE" value={form.category} onChange={e => setForm({...form, category: e.target.value})} disabled={!!editingItem} />
              </div>
              <div>
                <label className="block text-sm text-surface-300 mb-1">Kode *</label>
                <input type="text" required className="input-dark text-sm" placeholder="SA" value={form.code} onChange={e => setForm({...form, code: e.target.value})} disabled={!!editingItem} />
              </div>
              <div>
                <label className="block text-sm text-surface-300 mb-1">Nama *</label>
                <input type="text" required className="input-dark text-sm" placeholder="System Analyst" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm text-surface-300 mb-1">Deskripsi</label>
                <input type="text" className="input-dark text-sm" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-ghost text-sm text-center">Batal</button>
                <button type="submit" className="flex-1 btn-primary text-sm">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemMaster;
