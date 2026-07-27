import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { MapContainer, TileLayer, Marker, Polygon, Polyline, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, MousePointerClick, Trash2, Save, CheckCircle2, AlertTriangle, Info, Loader2, Search, X, Plus } from 'lucide-react';
import AppSelect from '../../components/AppSelect';
import { useToast } from '../../context/ToastContext';

const vertexIcon = (index) => L.divIcon({
  className: 'custom-vertex-marker',
  html: `<div style="width:24px;height:24px;background:#2563eb;border:2px solid #ffffff;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;color:white;font-size:10px;font-weight:bold">${index}</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});


const createLabelIcon = (name, zoomLevel = 16) => {
  const fontSize = Math.max(5, Math.min(20, Math.round(9 + (zoomLevel - 7) * 0.5)));
  return L.divIcon({
    className: 'custom-polygon-label',
    html: `<div style="font-weight:bold;font-size:${fontSize}px;color:#000000;text-shadow:0 0 4px #ffffff;white-space:nowrap;text-align:center;pointer-events:none;transform:translate(-50%,-50%);transition:font-size 0.15s ease;">${name}</div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });
};


function RecenterMap({ center }) {
  const map = useMapEvents({});
  useEffect(() => {
    if (center && center.length === 2 && !isNaN(center[0]) && !isNaN(center[1])) {
      map.setView(center, 16);
    }
  }, [center, map]);
  return null;
}

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

function MapClickHandler({ isDrawing, onAddPoint }) {
  useMapEvents({
    click(e) {
      if (isDrawing) {
        onAddPoint([e.latlng.lat, e.latlng.lng]);
      }
    }
  });
  return null;
}

const ProjectGeofenceConfig = () => {
  const { showToast } = useToast();
  const [geofences, setGeofences] = useState([]);
  const [selectedGeofenceId, setSelectedGeofenceId] = useState('NEW');
  const [areaName, setAreaName] = useState('');
  const [description, setDescription] = useState('');
  const [polygonPoints, setPolygonPoints] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mapCenter, setMapCenter] = useState([-6.200000, 106.816000]);
  const [mapZoom, setMapZoom] = useState(16);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchGeofences();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 3) {
      setSearchResults([]);
      setIsSearching(false);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    setShowDropdown(true);

    const timer = setTimeout(() => {
      fetchAddressSuggestions(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchAddressSuggestions = async (query) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
        {
          headers: {
            'Accept-Language': 'id,en'
          }
        }
      );
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setSearchResults(data || []);
    } catch (err) {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectAddress = (item) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    if (!isNaN(lat) && !isNaN(lon)) {
      setMapCenter([lat, lon]);
      setShowDropdown(false);
    }
  };

  const fetchGeofences = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/geofences');
      const data = Array.isArray(res.data) ? res.data : [];
      setGeofences(data);
      if (data.length > 0) {
        handleSelectGeofence(data[0].id, data);
      } else {
        handleNewArea();
      }
    } catch (err) {
      showToast({ type: 'error', title: 'Error', message: 'Gagal memuat data geofence' });
    } finally {
      setLoading(false);
    }
  };

  const handleNewArea = () => {
    setSelectedGeofenceId('NEW');
    setAreaName('');
    setDescription('');
    setPolygonPoints([]);
    setIsDrawing(false);
  };

  const handleSelectGeofence = (geofenceId, list = geofences) => {
    if (geofenceId === 'NEW') {
      handleNewArea();
      return;
    }
    setSelectedGeofenceId(geofenceId);
    const item = list.find(g => g.id === geofenceId);
    setIsDrawing(false);
    if (item) {
      setAreaName(item.name || '');
      setDescription(item.description || '');
      let points = [];
      if (item.location) {
        try {
          const parsed = JSON.parse(item.location);
          if (Array.isArray(parsed)) {
            points = parsed.map(pt => {
              if (Array.isArray(pt)) return [parseFloat(pt[0]), parseFloat(pt[1])];
              return [parseFloat(pt.lat), parseFloat(pt.lng)];
            });
          }
        } catch (e) {
          points = [];
        }
      }
      setPolygonPoints(points);
      if (points.length > 0) {
        setMapCenter(points[0]);
      } else if (item.latitude && item.longitude) {
        setMapCenter([parseFloat(item.latitude), parseFloat(item.longitude)]);
      }
    }
  };

  const handleAddPoint = (pt) => {
    setPolygonPoints(prev => [...prev, pt]);
  };

  const handleUpdatePoints = (updated) => {
    setPolygonPoints(updated);
  };

  const handleClearArea = () => {
    setPolygonPoints([]);
  };

  const handleSave = async () => {
    if (!areaName.trim()) {
      showToast({ type: 'error', title: 'Validasi Gagal', message: 'Nama area geofence wajib diisi.' });
      return;
    }
    setSaving(true);
    try {
      const payloadPoints = polygonPoints.map(pt => ({
        lat: Number(pt[0].toFixed(6)),
        lng: Number(pt[1].toFixed(6))
      }));
      const locationString = polygonPoints.length >= 3 ? JSON.stringify(payloadPoints) : '';

      const centerLat = polygonPoints.length > 0 ? polygonPoints[0][0] : mapCenter[0];
      const centerLng = polygonPoints.length > 0 ? polygonPoints[0][1] : mapCenter[1];

      const body = {
        name: areaName.trim(),
        description: description.trim() || null,
        location: locationString,
        latitude: centerLat,
        longitude: centerLng,
        isActive: true
      };

      let res;
      if (selectedGeofenceId === 'NEW') {
        res = await api.post('/api/geofences', body);
        showToast({ type: 'success', title: 'Berhasil', message: 'Area geofence baru berhasil ditambahkan.' });
      } else {
        res = await api.put(`/api/geofences/${selectedGeofenceId}`, body);
        showToast({ type: 'success', title: 'Berhasil', message: 'Konfigurasi area geofence berhasil diperbarui.' });
      }

      const refreshed = await api.get('/api/geofences');
      const data = refreshed.data || [];
      setGeofences(data);
      const savedId = res.data?.id || selectedGeofenceId;
      handleSelectGeofence(savedId, data);
    } catch (err) {
      showToast({ type: 'error', title: 'Gagal', message: err.response?.data?.error || 'Gagal menyimpan konfigurasi geofence.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (selectedGeofenceId === 'NEW') return;
    if (!window.confirm(`Hapus area geofence "${areaName}"?`)) return;

    setDeleting(true);
    try {
      await api.delete(`/api/geofences/${selectedGeofenceId}`);
      showToast({ type: 'success', title: 'Berhasil', message: 'Area geofence berhasil dihapus.' });
      const refreshed = await api.get('/api/geofences');
      const data = refreshed.data || [];
      setGeofences(data);
      if (data.length > 0) {
        handleSelectGeofence(data[0].id, data);
      } else {
        handleNewArea();
      }
    } catch (err) {
      showToast({ type: 'error', title: 'Gagal', message: err.response?.data?.error || 'Gagal menghapus area geofence.' });
    } finally {
      setDeleting(false);
    }
  };

  const geofenceOptions = [
    { value: 'NEW', label: '+ Tambah Area Baru' },
    ...geofences.map(g => ({
      value: g.id,
      label: g.name
    }))
  ];

  const getBoundaryStatus = () => {
    if (polygonPoints.length >= 3) {
      return {
        type: 'success',
        title: 'Geofence Area Aktif',
        desc: `${polygonPoints.length} titik koordinat telah terdefinisi untuk area ini.`
      };
    }
    if (polygonPoints.length > 0) {
      return {
        type: 'warning',
        title: 'Batas Belum Lengkap',
        desc: `Minimal 3 titik dibutuhkan untuk membentuk area polygon (saat ini ${polygonPoints.length} titik).`
      };
    }
    return {
      type: 'empty',
      title: 'Belum Dikonfigurasi',
      desc: 'Area ini belum memiliki batasan polygon geofence.'
    };
  };

  const status = getBoundaryStatus();

  const getPolygonCenter = () => {
    if (polygonPoints.length === 0) return null;
    let sumLat = 0;
    let sumLng = 0;
    polygonPoints.forEach(pt => {
      sumLat += pt[0];
      sumLng += pt[1];
    });
    return [sumLat / polygonPoints.length, sumLng / polygonPoints.length];
  };

  const polygonCenter = getPolygonCenter();

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
            <MapPin className="text-brand-500" size={22} />
            Master Area Geofence
          </h1>
          <p className="text-sm text-surface-600 dark:text-surface-400">Konfigurasi pemetaan area geofence lokasi untuk absensi</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0 overflow-hidden">
        <div className="w-full lg:w-96 glass-card p-5 border border-surface-200 dark:border-white/10 rounded-2xl flex flex-col justify-between overflow-y-auto shrink-0">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Pilih / Tambah Area Geofence</label>
              {loading ? (
                <div className="flex items-center justify-center p-3 rounded-xl bg-surface-100 dark:bg-surface-900 border border-surface-200 dark:border-white/10 text-surface-600 dark:text-surface-400 text-sm">
                  <Loader2 size={16} className="animate-spin mr-2" /> Memuat geofence...
                </div>
              ) : (
                <AppSelect
                  options={geofenceOptions}
                  value={selectedGeofenceId}
                  onChange={(val) => handleSelectGeofence(val)}
                  placeholder="Pilih area geofence..."
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Nama Area Geofence</label>
              <input
                type="text"
                value={areaName}
                onChange={(e) => setAreaName(e.target.value)}
                placeholder="Contoh: TMMIN Karawang Plant 1 & 2"
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-white/10 text-surface-900 dark:text-white placeholder-surface-400 text-sm focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Keterangan (Opsional)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Deskripsi lokasi area..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-white/10 text-surface-900 dark:text-white placeholder-surface-400 text-sm focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Cari Alamat / Lokasi</label>
              <div className="relative">
                <div className="relative flex items-center">
                  <Search className="absolute left-3.5 text-surface-400 pointer-events-none" size={16} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari lokasi atau alamat..."
                    className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-white/10 text-surface-900 dark:text-white placeholder-surface-400 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setSearchResults([]);
                        setShowDropdown(false);
                      }}
                      className="absolute right-3 text-surface-400 hover:text-surface-700 dark:hover:text-white transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {showDropdown && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-surface-900 border border-surface-200 dark:border-white/10 rounded-xl shadow-xl z-[600] max-h-60 overflow-y-auto divide-y divide-surface-100 dark:divide-white/5">
                    {isSearching ? (
                      <div className="p-3 text-xs text-surface-500 dark:text-surface-400 flex items-center justify-center gap-2">
                        <Loader2 size={14} className="animate-spin text-brand-500 dark:text-brand-400" />
                        Mencari lokasi...
                      </div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((item, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSelectAddress(item)}
                          className="w-full text-left p-3 hover:bg-surface-100 dark:hover:bg-white/5 text-xs text-surface-700 dark:text-surface-200 transition-colors flex items-start gap-2"
                        >
                          <MapPin size={14} className="text-brand-500 dark:text-brand-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-2 leading-relaxed">{item.display_name}</span>
                        </button>
                      ))
                    ) : searchQuery.trim().length >= 3 ? (
                      <div className="p-3 text-xs text-surface-500 dark:text-surface-400 text-center">
                        Lokasi tidak ditemukan
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Kontrol Peta & Area</label>
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => setIsDrawing(!isDrawing)}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${isDrawing
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-600 dark:text-amber-300 hover:bg-amber-500/30'
                    : 'bg-surface-100 dark:bg-white/[0.05] border-surface-200 dark:border-white/10 text-surface-800 dark:text-white hover:bg-surface-200 dark:hover:bg-white/[0.1]'
                    }`}
                >
                  <MousePointerClick size={16} />
                  {isDrawing ? 'Selesai Menggambar' : 'Mulai Gambar Polygon'}
                </button>

                <button
                  type="button"
                  onClick={handleClearArea}
                  disabled={polygonPoints.length === 0}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-all text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Trash2 size={16} />
                  Hapus Area (Clear)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Status Batas Area</label>
              <div className={`p-4 rounded-xl border flex items-start gap-3 ${status.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-300'
                : status.type === 'warning'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-300'
                  : 'bg-surface-100 dark:bg-surface-800/50 border-surface-200 dark:border-white/10 text-surface-600 dark:text-surface-400'
                }`}>
                {status.type === 'success' && <CheckCircle2 size={20} className="shrink-0 text-emerald-500 dark:text-emerald-400 mt-0.5" />}
                {status.type === 'warning' && <AlertTriangle size={20} className="shrink-0 text-amber-500 dark:text-amber-400 mt-0.5" />}
                {status.type === 'empty' && <Info size={20} className="shrink-0 text-surface-500 dark:text-surface-400 mt-0.5" />}
                <div>
                  <p className="text-sm font-semibold text-surface-900 dark:text-white">{status.title}</p>
                  <p className="text-xs mt-0.5 text-surface-600 dark:text-surface-300 leading-relaxed">{status.desc}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-surface-200 dark:border-white/10 mt-4 space-y-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl gradient-brand text-white font-medium hover:opacity-90 transition-all shadow-lg shadow-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Simpan Area Geofence
                </>
              )}
            </button>

            {selectedGeofenceId !== 'NEW' && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 text-xs font-medium transition-all"
              >
                <Trash2 size={14} />
                Hapus Geofence Ini
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 h-full min-h-[450px] rounded-2xl overflow-hidden border border-surface-200 dark:border-white/10 relative shadow-xl z-0">
          {isDrawing && (
            <div className="absolute top-4 left-4 z-[500] bg-white/90 dark:bg-surface-900/90 backdrop-blur-md px-4 py-2 rounded-xl border border-amber-500/40 text-amber-700 dark:text-amber-300 text-xs font-medium flex items-center gap-2 shadow-lg">
              <MousePointerClick size={16} className="animate-pulse" />
              Klik pada peta untuk menambahkan titik sudut area polygon
            </div>
          )}

          <MapContainer center={mapCenter} zoom={polygonPoints.length > 0 ? 16 : 11} style={{ height: '100%', width: '100%' }}>
            <MapZoomListener onZoomChange={setMapZoom} />
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <RecenterMap center={mapCenter} />
            <MapClickHandler isDrawing={isDrawing} onAddPoint={handleAddPoint} />

            {polygonPoints.map((pt, idx) => (
              <Marker
                key={`vertex-${idx}`}
                position={pt}
                icon={vertexIcon(idx + 1)}
                draggable={true}
                eventHandlers={{
                  dragend: (e) => {
                    const pos = e.target.getLatLng();
                    const updated = [...polygonPoints];
                    updated[idx] = [pos.lat, pos.lng];
                    handleUpdatePoints(updated);
                  }
                }}
              />
            ))}

            {polygonPoints.length === 2 && (
              <Polyline positions={polygonPoints} pathOptions={{ color: '#3b82f6', weight: 3, dashArray: '4, 4' }} />
            )}

            {polygonPoints.length >= 3 && (
              <>
                <Polygon positions={polygonPoints} pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.35, weight: 3 }} />
                {polygonCenter && areaName && (
                  <Marker position={polygonCenter} icon={createLabelIcon(areaName, mapZoom)} />
                )}
              </>
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default ProjectGeofenceConfig;
