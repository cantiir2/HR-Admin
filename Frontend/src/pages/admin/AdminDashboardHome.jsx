import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polygon, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Users, ArrowUpCircle, ArrowDownCircle, BarChart3, Search, Clock, Calendar, CheckSquare } from 'lucide-react';
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

const createPolygonTextIcon = (name, zoomLevel = 13) => {
  const fontSize = Math.max(5, Math.min(20, Math.round(9 + (zoomLevel - 7) * 0.5)));
  return L.divIcon({
    className: 'custom-polygon-label-overlay',
    html: `<div style="font-weight:bold;font-size:${fontSize}px;color:#000000;text-shadow:0 0 5px #ffffff, 0 0 2px #ffffff;white-space:nowrap;text-align:center;pointer-events:none;transform:translate(-50%,-50%);transition:font-size 0.15s ease;">${name}</div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });
};

const projectIcon = L.divIcon({
  className: 'custom-project-map-marker',
  html: `<div style="width:32px;height:32px;background:#2563eb;border:3px solid #ffffff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 4px 14px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center"><div style="width:10px;height:10px;background:white;border-radius:50%;transform:rotate(45deg)"></div></div>`,
  iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32],
});

function MapZoomListener({ onZoomChange }) {
  const map = useMapEvents({
    zoomend() {
      onZoomChange(map.getZoom());
    },
    zoom() {
      onZoomChange(map.getZoom());
    }
  });

  useEffect(() => {
    onZoomChange(map.getZoom());
  }, [map, onZoomChange]);

  return null;
}

const AdminDashboardHome = () => {
  const [locations, setLocations] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [projects, setProjects] = useState([]);
  const [geofences, setGeofences] = useState([]);
  const [mapZoom, setMapZoom] = useState(13);
  const [totalRecords, setTotalRecords] = useState(0);
  const [tab, setTab] = useState('map');
  const [search, setSearch] = useState('');
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [projectManagers, setProjectManagers] = useState([]);
  const [projectManagerId, setProjectManagerId] = useState('');
  const [pendingTasks, setPendingTasks] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(true);

  useEffect(() => {
    api.get('/api/projects').then(r => {
      const dataList = Array.isArray(r.data) ? r.data : (r.data?.data || []);
      setProjects(dataList);

      const managers = dataList.map(project => project.projectManager).filter(Boolean);
      setProjectManagers([...new Map(managers.map(manager => [manager.id, manager])).values()]);
    }).catch(() => { });

    api.get('/api/geofences').then(r => {
      setGeofences(Array.isArray(r.data) ? r.data : []);
    }).catch(() => { });
  }, []);

  useEffect(() => {
    api.get('/api/attendance/locations', { params: { projectManagerId: projectManagerId || undefined } })
      .then(r => setLocations(r.data)).catch(() => { });
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

  useEffect(() => {
    const fetchPendingTasks = async () => {
      setPendingLoading(true);
      try {
        const [attRes, leaveRes] = await Promise.all([
          api.get('/api/attendance-requests', { params: { status: 'PENDING', pageSize: 5 } }).catch(() => ({ data: { data: [] } })),
          api.get('/api/leaves', { params: { status: 'PENDING', pageSize: 5 } }).catch(() => ({ data: { data: [] } }))
        ]);

        const attList = (attRes.data?.data || attRes.data || []).map(item => ({
          id: `att-${item.id}`,
          type: 'Attendance Request',
          user: item.user?.name || 'Karyawan',
          date: item.requestDate || item.createdAt,
          link: '/admin/attendance-requests?status=PENDING',
          icon: Clock
        }));

        const leaveList = (leaveRes.data?.data || leaveRes.data || []).map(item => ({
          id: `leave-${item.id}`,
          type: 'Leave Request',
          user: item.user?.name || 'Karyawan',
          date: item.startDate || item.createdAt,
          link: '/admin/leaves?status=PENDING',
          icon: Calendar
        }));

        setPendingTasks([...attList, ...leaveList]);
      } catch {
        setPendingTasks([]);
      } finally {
        setPendingLoading(false);
      }
    };
    fetchPendingTasks();
  }, []);

  let defaultMapCenter = [-6.2, 106.816];
  if (locations.length > 0 && (locations[0].checkInLat || locations[0].checkOutLat)) {
    defaultMapCenter = [locations[0].checkOutLat || locations[0].checkInLat, locations[0].checkOutLng || locations[0].checkInLng];
  } else if (geofences.length > 0) {
    for (const g of geofences) {
      if (g.location) {
        try {
          const parsed = JSON.parse(g.location);
          if (Array.isArray(parsed) && parsed.length > 0) {
            defaultMapCenter = [parseFloat(parsed[0].lat !== undefined ? parsed[0].lat : parsed[0][0]), parseFloat(parsed[0].lng !== undefined ? parsed[0].lng : parsed[0][1])];
            break;
          }
        } catch (e) { }
      }
    }
  }

  const checkedIn = locations.filter(l => l.checkInTime).length;
  const checkedOut = locations.filter(l => l.checkOutTime).length;

  const totalPages = Math.ceil(totalRecords / pageSize);
  const paginatedData = attendances;

  const mapOverlayItems = geofences.length > 0 ? geofences : projects;

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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="stat-card"><div className="flex items-center gap-2 mb-2"><div className="p-1.5 rounded-lg bg-brand-500/10"><Users size={14} className="text-brand-400" /></div><span className="text-xs text-surface-400">Total Hadir</span></div><p className="text-2xl font-bold text-white">{locations.length}</p></div>
        <div className="stat-card"><div className="flex items-center gap-2 mb-2"><div className="p-1.5 rounded-lg bg-emerald-500/10"><ArrowUpCircle size={14} className="text-emerald-400" /></div><span className="text-xs text-surface-400">Check-In</span></div><p className="text-2xl font-bold text-white">{checkedIn}</p></div>
        <div className="stat-card"><div className="flex items-center gap-2 mb-2"><div className="p-1.5 rounded-lg bg-rose-500/10"><ArrowDownCircle size={14} className="text-rose-400" /></div><span className="text-xs text-surface-400">Check-Out</span></div><p className="text-2xl font-bold text-white">{checkedOut}</p></div>
        <div className="stat-card"><div className="flex items-center gap-2 mb-2"><div className="p-1.5 rounded-lg bg-amber-500/10"><BarChart3 size={14} className="text-amber-400" /></div><span className="text-xs text-surface-400">Total Members</span></div><p className="text-2xl font-bold text-white">{totalRecords}</p></div>
      </div>

      <div className="glass-card p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10">
              <CheckSquare size={16} className="text-amber-400" />
            </div>
            <h3 className="text-sm font-semibold text-white">To Do List (Waiting Approval)</h3>
          </div>
          <span className="badge-warning text-xs font-semibold px-2 py-0.5 rounded-full">
            {pendingTasks.length} Pending
          </span>
        </div>
        {pendingLoading ? (
          <div className="text-center py-4 text-surface-400 text-xs">Memuat...</div>
        ) : pendingTasks.length === 0 ? (
          <div className="text-center py-4 text-surface-400 text-xs">Tidak ada persetujuan yang tertunda</div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {pendingTasks.map(task => {
              const IconComp = task.icon;
              return (
                <div key={task.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded bg-surface-800 text-surface-400">
                      <IconComp size={14} />
                    </div>
                    <div>
                      <p className="font-medium text-white">{task.user}</p>
                      <p className="text-[11px] text-surface-400">{task.type} • {task.date ? format(new Date(task.date), 'dd MMM yyyy') : '-'}</p>
                    </div>
                  </div>
                  <Link to={task.link} className="btn-ghost text-xs px-2.5 py-1 rounded text-brand-400 hover:text-brand-300">
                    Proses
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab('map')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'map' ? 'gradient-brand text-white shadow-lg shadow-brand-500/20' : 'btn-ghost'}`}>Peta Pemetaan Area</button>
        <button onClick={() => setTab('list')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'list' ? 'gradient-brand text-white shadow-lg shadow-brand-500/20' : 'btn-ghost'}`}>Daftar Absensi</button>
      </div>

      {tab === 'map' && (
        <div className="glass-card overflow-hidden" style={{ height: 'calc(100vh - 380px)', minHeight: '400px' }}>
          <MapContainer center={defaultMapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
            <MapZoomListener onZoomChange={setMapZoom} />
            <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {mapOverlayItems.map(item => {
              let polygon = null;
              if (item.location) {
                try {
                  const parsed = JSON.parse(item.location);
                  if (Array.isArray(parsed) && parsed.length >= 3) {
                    polygon = parsed.map(pt => [parseFloat(pt.lat !== undefined ? pt.lat : pt[0]), parseFloat(pt.lng !== undefined ? pt.lng : pt[1])]);
                  }
                } catch (e) { }
              }

              let centerLat = 0;
              let centerLng = 0;
              if (polygon && polygon.length > 0) {
                polygon.forEach(pt => {
                  centerLat += pt[0];
                  centerLng += pt[1];
                });
                centerLat /= polygon.length;
                centerLng /= polygon.length;
              } else if (item.latitude != null && item.longitude != null) {
                centerLat = item.latitude;
                centerLng = item.longitude;
              }

              const itemCenter = (centerLat && centerLng) ? [centerLat, centerLng] : null;

              if (!itemCenter && !polygon) return null;

              return (
                <div key={`area-${item.id}`}>
                  {polygon ? (
                    <>
                      <Polygon
                        positions={polygon}
                        pathOptions={{
                          color: '#3b82f6',
                          fillColor: '#3b82f6',
                          fillOpacity: 0.25,
                          weight: 3
                        }}
                      />
                      {itemCenter && (
                        <Marker position={itemCenter} icon={createPolygonTextIcon(item.name, mapZoom)} />
                      )}
                    </>
                  ) : (
                    <Circle
                      center={itemCenter}
                      radius={200}
                      pathOptions={{
                        color: '#3b82f6',
                        fillColor: '#3b82f6',
                        fillOpacity: 0.2,
                        weight: 2,
                        dashArray: '6, 6'
                      }}
                    />
                  )}
                  {/* {itemCenter && (
                    <Marker position={itemCenter} icon={projectIcon}>
                      <Popup>
                        <div className="text-center min-w-[170px] p-1">
                          <p className="font-bold text-blue-600 text-sm">{item.name}</p>
                          <p className="text-xs text-gray-600 mb-1">{polygon ? (item.description || '') : 'Area Geofence'}</p>
                        </div>
                      </Popup>
                    </Marker>
                  )} */}
                </div>
              );
            })}

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
                      <td className="px-4 py-3">
                        {att.checkInTime ? (
                          <div>
                            <span className="badge-success">{format(new Date(att.checkInTime), 'HH:mm')}</span>
                            <p className="text-[11px] font-semibold text-surface-700 dark:text-surface-300 mt-1">
                              {att.checkInArea?.inRange ? att.checkInArea.name : '-'}
                            </p>
                          </div>
                        ) : <span className="text-surface-600 text-xs">-</span>}
                      </td>
                      <td className="px-4 py-3">
                        {att.checkOutTime ? (
                          <div>
                            <span className="badge-danger">{format(new Date(att.checkOutTime), 'HH:mm')}</span>
                            <p className="text-[11px] font-semibold text-surface-700 dark:text-surface-300 mt-1">
                              {att.checkOutArea?.inRange ? att.checkOutArea.name : '-'}
                            </p>
                          </div>
                        ) : <span className="text-surface-600 text-xs">-</span>}
                      </td>
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
