import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Users, ArrowUpCircle, ArrowDownCircle, BarChart3, Search } from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import Pagination from '../../components/Pagination';
import AppSelect from '../../components/AppSelect';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'assets/marker-icon-2x.png',
  iconUrl: 'assets/marker-icon.png',
  shadowUrl: 'assets/marker-shadow.png',
});

const createIcon = (color) => L.divIcon({
  className: 'custom-marker',
  html: `<div style="width:28px;height:28px;background:${color};border:3px solid rgba(255,255,255,0.9);border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 4px 12px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center"><div style="width:7px;height:7px;background:white;border-radius:50%;transform:rotate(45deg)"></div></div>`,
  iconSize: [28, 28], iconAnchor: [14, 28], popupAnchor: [0, -28],
});
const ciIcon = createIcon('#10b981');
const coIcon = createIcon('#f43f5e');

const AdminDashboardHome = () => {
  const [locations, setLocations] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [tab, setTab] = useState('map');
  const [search, setSearch] = useState('');
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [projectManagers, setProjectManagers] = useState([]);
  const [projectManagerId, setProjectManagerId] = useState('');

  useEffect(() => {
    api.get('/api/projects').then(r => {
      const managers = r.data.map(project => project.projectManager).filter(Boolean);
      setProjectManagers([...new Map(managers.map(manager => [manager.id, manager])).values()]);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    api.get('/api/attendance/locations', { params: { projectManagerId: projectManagerId || undefined } })
      .then(r => setLocations(r.data)).catch(() => {});
  }, [projectManagerId]);

  useEffect(() => {
    const fetchAttendances = async () => {
      try {
        const r = await api.get('/api/attendance', {
          params: { page: pageNo, limit: pageSize, search, projectManagerId: projectManagerId || undefined }
        });
        if (r.data && r.data.data !== undefined) {
          setAttendances(r.data.data);
          setTotalRecords(r.data.total);
        } else {
          setAttendances(r.data || []);
          setTotalRecords((r.data || []).length);
        }
      } catch {
        setAttendances([]);
        setTotalRecords(0);
      }
    };
    const timer = setTimeout(fetchAttendances, 300);
    return () => clearTimeout(timer);
  }, [pageNo, pageSize, search, projectManagerId]);

  const center = locations.length > 0
    ? [locations[0].checkInLat || -6.2, locations[0].checkInLng || 106.816]
    : [-6.2, 106.816];

  const checkedIn = locations.filter(l => l.checkInTime).length;
  const checkedOut = locations.filter(l => l.checkOutTime).length;

  const totalPages = Math.ceil(totalRecords / pageSize);
  const paginatedData = attendances;

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">Dashboard</h2>
        <p className="text-sm text-surface-400">{format(new Date(), 'EEEE, dd MMMM yyyy', { locale: localeId })}</p>
      </div>
      <div className="max-w-xs mb-6">
        <AppSelect
          label="Filter Project Manager"
          value={projectManagerId}
          onChange={value => { setProjectManagerId(value); setPageNo(1); }}
          options={[['', 'Semua Project Manager'], ...projectManagers.map(manager => [manager.id, manager.name])]}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="stat-card"><div className="flex items-center gap-2 mb-2"><div className="p-1.5 rounded-lg bg-brand-500/10"><Users size={14} className="text-brand-400"/></div><span className="text-xs text-surface-400">Total Hadir</span></div><p className="text-2xl font-bold text-white">{locations.length}</p></div>
        <div className="stat-card"><div className="flex items-center gap-2 mb-2"><div className="p-1.5 rounded-lg bg-emerald-500/10"><ArrowUpCircle size={14} className="text-emerald-400"/></div><span className="text-xs text-surface-400">Check-In</span></div><p className="text-2xl font-bold text-white">{checkedIn}</p></div>
        <div className="stat-card"><div className="flex items-center gap-2 mb-2"><div className="p-1.5 rounded-lg bg-rose-500/10"><ArrowDownCircle size={14} className="text-rose-400"/></div><span className="text-xs text-surface-400">Check-Out</span></div><p className="text-2xl font-bold text-white">{checkedOut}</p></div>
        <div className="stat-card"><div className="flex items-center gap-2 mb-2"><div className="p-1.5 rounded-lg bg-amber-500/10"><BarChart3 size={14} className="text-amber-400"/></div><span className="text-xs text-surface-400">Total Record</span></div><p className="text-2xl font-bold text-white">{totalRecords}</p></div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab('map')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'map' ? 'gradient-brand text-white shadow-lg shadow-brand-500/20' : 'btn-ghost'}`}>Peta</button>
        <button onClick={() => setTab('list')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'list' ? 'gradient-brand text-white shadow-lg shadow-brand-500/20' : 'btn-ghost'}`}>Daftar</button>
      </div>

      {tab === 'map' && (
        <div className="glass-card overflow-hidden" style={{ height: 'calc(100vh - 380px)', minHeight: '350px' }}>
          <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {locations.map(loc => {
              const lat = loc.checkOutLat || loc.checkInLat;
              const lng = loc.checkOutLng || loc.checkInLng;
              if (!lat || !lng) return null;
              return (
                <Marker key={loc.id} position={[lat, lng]} icon={loc.checkOutTime ? coIcon : ciIcon}>
                  <Popup>
                    <div className="text-center min-w-[160px]">
                      <p className="font-bold text-black text-sm">{loc.user?.name}</p>
                      <p className="text-xs text-surface-400 mb-1">{loc.user?.email}</p>
                      {loc.checkInTime && <p className="text-[11px] text-emerald-400">In: {format(new Date(loc.checkInTime), 'HH:mm')}</p>}
                      {loc.checkOutTime && <p className="text-[11px] text-rose-400">Out: {format(new Date(loc.checkOutTime), 'HH:mm')}</p>}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      )}

      {tab === 'list' && (
        <div>
          <div className="relative mb-3">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-500" />
            <input type="text" placeholder="Cari nama..." value={search} onChange={e => { setSearch(e.target.value); setPageNo(1); }} className="input-dark pl-11 text-sm" />
          </div>
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead><tr className="border-b border-white/[0.06]">
                  <th className="px-4 py-3 text-xs font-semibold text-surface-400">Karyawan</th>
                  <th className="px-4 py-3 text-xs font-semibold text-surface-400">Tanggal</th>
                  <th className="px-4 py-3 text-xs font-semibold text-surface-400">Check-In</th>
                  <th className="px-4 py-3 text-xs font-semibold text-surface-400">Check-Out</th>
                  <th className="px-4 py-3 text-xs font-semibold text-surface-400">Catatan</th>
                </tr></thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {paginatedData.map(att => (
                    <tr key={att.id} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-3"><p className="text-sm font-medium text-white">{att.user?.name}</p><p className="text-[11px] text-surface-500">{att.user?.jobRoleCode || '-'}</p></td>
                      <td className="px-4 py-3 text-sm text-surface-400">{format(new Date(att.date), 'dd MMM yyyy')}</td>
                      <td className="px-4 py-3">{att.checkInTime ? <span className="badge-success">{format(new Date(att.checkInTime), 'HH:mm')}</span> : <span className="text-surface-600 text-xs">-</span>}</td>
                      <td className="px-4 py-3">{att.checkOutTime ? <span className="badge-danger">{format(new Date(att.checkOutTime), 'HH:mm')}</span> : <span className="text-surface-600 text-xs">-</span>}</td>
                      <td className="px-4 py-3 text-xs text-surface-400 max-w-[180px] truncate">{att.checkInNote || att.checkOutNote || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {paginatedData.length === 0 && <div className="text-center py-12 text-surface-400 text-sm">Tidak ada data</div>}
            </div>
            {paginatedData.length > 0 && (
                <div className="p-4 border-t border-white/[0.06] flex justify-end">
                    <Pagination 
                        page={{ pageNo, pageSize, totalPages }}
                        doSearch={(p, s) => { setPageNo(p); setPageSize(s); }}
                    />
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardHome;
