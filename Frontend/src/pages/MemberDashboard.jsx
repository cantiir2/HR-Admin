import { useState, useEffect, useRef, useCallback } from 'react';
import Webcam from "react-webcam";
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import {
  Camera, MapPin, LogOut, CheckCircle, Clock,
  ArrowUpCircle, ArrowDownCircle, FileText,
  Navigation, Loader2, AlertCircle, Fingerprint,
  CalendarDays, User
} from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import AppSelect from '../components/AppSelect';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

function formatDateJakarta(dateValue) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date(dateValue));
}

function isTodayJakarta(dateValue) {
  return formatDateJakarta(dateValue) === formatDateJakarta(new Date());
}

const MemberDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [photoBase64, setPhotoBase64] = useState(null);
  const [location, setLocation] = useState(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [attendances, setAttendances] = useState([]);
  const [todayRecord, setTodayRecord] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isOvertimeCheckout, setIsOvertimeCheckout] = useState(false);
  const webcamRef = useRef(null);

  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [exportLoading, setExportLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => { fetchAttendances(); }, [filterMonth, filterYear]);

  const fetchAttendances = async () => {
    try {
      const res = await api.get(`/api/attendance/me?month=${filterMonth}&year=${filterYear}&_t=${Date.now()}`);
      setAttendances(res.data);
      const todayRec = res.data.find(a => {
        const dateValue = a.date || a.checkInTime;
        return dateValue && isTodayJakarta(dateValue);
      });
      setTodayRecord(todayRec || null);
    } catch (err) {
      console.error(err);
    } finally {
      setInitialLoading(false);
    }
  };

  const capturePhoto = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setPhotoBase64(imageSrc);
    setIsCameraOpen(false);
  }, [webcamRef]);

  const retakePhoto = () => {
    setPhotoBase64(null);
    setIsCameraOpen(true);
  };

  const handleExport = async () => {
    try {
      setExportLoading(true);
      const res = await api.get(`/api/attendance/export?month=${filterMonth}&year=${filterYear}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Working Report - ${String(filterMonth).padStart(2, '0')}-${filterYear} ${user?.name}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      showToast({ type: 'error', title: 'Gagal', message: 'Gagal export data absen' });
    } finally {
      setExportLoading(false);
    }
  };

  const handlePhotoCapture = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { showToast({ type: 'error', title: 'Validasi Gagal', message: 'Ukuran file maksimal 3MB' }); return; }
    const reader = new FileReader();
    reader.onloadend = () => { setPhotoBase64(reader.result); };
    reader.readAsDataURL(file);
  };

  const getLocation = () => {
    if (!navigator.geolocation) { showToast({ type: 'error', title: 'Gagal', message: 'Geolocation tidak didukung' }); return; }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }); setLocationLoading(false); },
      () => { showToast({ type: 'error', title: 'Gagal', message: 'Gagal mendapatkan lokasi' }); setLocationLoading(false); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (type) => {
    // if (!photoBase64) { showToast({ type: 'error', title: 'Validasi Gagal', message: 'Silakan ambil foto' }); return; }
    if (!location) { showToast({ type: 'error', title: 'Validasi Gagal', message: 'Silakan dapatkan lokasi' }); return; }
    if (type === 'check-out' && !note.trim()) { showToast({ type: 'error', title: 'Validasi Gagal', message: 'Catatan aktivitas wajib diisi' }); return; }
    setLoading(true);
    try {
      const endpoint = type === 'check-in' ? '/api/attendance/check-in' : '/api/attendance/check-out';
      const payload = {
        photo: photoBase64,
        latitude: location.latitude,
        longitude: location.longitude,
        ...(type === 'check-out' ? { note } : {})
      };
      const response = await api.post(endpoint, payload);
      if (response.data.attendance) {
        setTodayRecord(response.data.attendance);
      }
      await fetchAttendances();
      showToast({ type: 'success', title: 'Berhasil', message: response.data.message || `${type === 'check-in' ? 'Check-In' : 'Check-Out'} berhasil!` });
      setPhotoBase64(null); setLocation(null); setNote('');
      setIsOvertimeCheckout(false);
    } catch (err) {
      showToast({ type: 'error', title: 'Gagal', message: err.response?.data?.error || 'Gagal mengirim absensi' });
    } finally { setLoading(false); }
  };

  const isCurrentMonth = filterMonth === (new Date().getMonth() + 1) && filterYear === new Date().getFullYear();
  const canCheckIn = isCurrentMonth && (!todayRecord || !todayRecord.checkInTime);
  const canCheckOut = isCurrentMonth && (todayRecord && todayRecord.checkInTime && !todayRecord.checkOutTime) || isOvertimeCheckout;
  const showOvertimeOption = isCurrentMonth && todayRecord && todayRecord.checkInTime && todayRecord.checkOutTime && !isOvertimeCheckout;

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    { value: 1, label: 'Januari' }, { value: 2, label: 'Februari' }, { value: 3, label: 'Maret' },
    { value: 4, label: 'April' }, { value: 5, label: 'Mei' }, { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' }, { value: 8, label: 'Agustus' }, { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' }, { value: 11, label: 'November' }, { value: 12, label: 'Desember' }
  ];

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <Loader2 size={32} className="animate-spin text-brand-400" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-5 animate-fade-in pb-8">
      <div className="text-center">
        <p className="text-surface-400 text-sm">{format(new Date(), 'EEEE, dd MMMM yyyy', { locale: localeId })}</p>
        <p className="text-3xl font-bold text-white tracking-tight mt-1">{format(new Date(), 'HH:mm')}</p>
      </div>

      {/* Today Stats */}
      <div className="grid grid-cols-2 gap-3 animate-slide-up">
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10"><ArrowUpCircle size={16} className="text-emerald-400" /></div>
            <span className="text-xs font-medium text-surface-400">Check-In</span>
          </div>
          <p className="text-lg font-bold text-white">
            {todayRecord?.checkInTime ? format(new Date(todayRecord.checkInTime), 'HH:mm') : '--:--'}
          </p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-rose-500/10"><ArrowDownCircle size={16} className="text-rose-400" /></div>
            <span className="text-xs font-medium text-surface-400">Check-Out</span>
          </div>
          <p className="text-lg font-bold text-white">
            {todayRecord?.checkOutTime ? format(new Date(todayRecord.checkOutTime), 'HH:mm') : '--:--'}
          </p>
        </div>
      </div>

      {/* Attendance Form */}
      {(canCheckIn || canCheckOut) && (
        <div className="glass-card-light p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-semibold text-white">
              {canCheckIn ? 'Check-In' : isOvertimeCheckout ? 'Update Check-Out Lembur' : 'Check-Out'}
            </h2>
            {isOvertimeCheckout && (
              <button 
                onClick={() => setIsOvertimeCheckout(false)}
                className="text-xs text-surface-400 hover:text-white transition-colors"
              >
                Batal
              </button>
            )}
          </div>
          <p className="text-sm text-surface-400 mb-5">Ambil lokasi untuk absensi</p>

          <div className="space-y-4">
            {/* <div className="w-full h-64 border-2 border-dashed border-white/[0.1] rounded-xl overflow-hidden relative bg-black/20 flex flex-col items-center justify-center">
              {photoBase64 ? (
                <div className="relative w-full h-full group">
                  <img src={photoBase64} alt="Captured" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={retakePhoto} className="text-sm font-medium text-white bg-white/20 backdrop-blur px-4 py-2 rounded-full">
                      Foto Ulang
                    </button>
                  </div>
                </div>
              ) : isCameraOpen ? (

                <div className="relative w-full h-full flex flex-col items-center">
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ facingMode: "user" }} // "user" = kamera depan, "environment" = kamera belakang
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={capturePhoto}
                    className="absolute bottom-4 bg-brand-500 text-white p-3 rounded-full shadow-lg hover:scale-105 transition-transform"
                  >
                    <Camera size={24} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsCameraOpen(true)}
                  className="flex flex-col items-center text-surface-500 hover:text-brand-400 transition-colors"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white/[0.06] flex items-center justify-center mb-3">
                    <Camera size={24} />
                  </div>
                  <span className="font-medium text-sm">Buka Kamera Absensi</span>
                </button>
              )}
            </div> */}

            <button onClick={getLocation} disabled={locationLoading}
              className={`w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all text-sm font-medium ${location ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-white/[0.06] text-surface-300 border border-white/[0.1] hover:bg-white/[0.1]'}`}>
              {locationLoading ? <Loader2 size={16} className="animate-spin" /> : location ? <Navigation size={16} /> : <MapPin size={16} />}
              {locationLoading ? 'Mendapatkan lokasi...' : location ? `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}` : 'Dapatkan Lokasi'}
            </button>

            {canCheckOut && (
              <div className="relative">
                <FileText size={16} className="absolute left-3.5 top-3 text-surface-500" />
                <textarea className="input-dark pl-10 resize-none text-sm" placeholder="Catatan aktivitas (wajib diisi)..." rows="2" value={note} onChange={e => setNote(e.target.value)} />
              </div>
            )}

            <button onClick={() => handleSubmit(canCheckIn ? 'check-in' : 'check-out')} disabled={loading}
              className={`w-full py-3.5 font-semibold rounded-xl transition-all shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 flex items-center justify-center gap-2 ${canCheckIn
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-emerald-500/20'
                : 'bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-rose-500/20'
                }`}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : canCheckIn ? <><ArrowUpCircle size={18} /> Check-In</> : <><ArrowDownCircle size={18} /> Check-Out</>}
            </button>
          </div>
        </div>
      )}

      {!isCurrentMonth ? (
        <div className="glass-card p-6 text-center">
          <CalendarDays size={32} className="text-brand-400 mx-auto mb-3" />
          <h3 className="font-semibold text-white mb-1">Mode Riwayat</h3>
          <p className="text-sm text-surface-400">Kembali ke bulan ini untuk melakukan absensi.</p>
        </div>
      ) : showOvertimeOption ? (
        <div className="glass-card p-6 text-center">
          <CheckCircle size={32} className="text-emerald-400 mx-auto mb-3" />
          <h3 className="font-semibold text-white mb-1">Absensi Lengkap</h3>
          <p className="text-sm text-surface-400 mb-4">Anda sudah check-in dan check-out hari ini.</p>
          <button
            onClick={() => setIsOvertimeCheckout(true)}
            className="px-4 py-2 text-sm font-medium bg-brand-500/20 text-brand-400 border border-brand-500/30 rounded-lg hover:bg-brand-500/30 transition-colors mx-auto inline-flex items-center gap-2"
          >
            <Clock size={16} />
            Update Check-Out Lembur
          </button>
        </div>
      ) : null}

      {/* History */}
      <div className="glass-card p-6 animate-slide-up">
        <div className="flex flex-col gap-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays size={18} className="text-brand-400" />
              <h2 className="text-lg font-semibold text-white">Riwayat</h2>
            </div>
            <button
              onClick={handleExport}
              disabled={exportLoading}
              className="px-3 py-1.5 text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {exportLoading ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
              Export
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <AppSelect
              value={filterMonth}
              onChange={value => setFilterMonth(parseInt(value))}
              className="py-2 text-sm"
              options={months}
            />
            <AppSelect
              value={filterYear}
              onChange={value => setFilterYear(parseInt(value))}
              className="py-2 text-sm"
              options={years.map(y => ({ value: y, label: y }))}
            />
          </div>
        </div>

        {attendances.length === 0 ? (
          <div className="text-center py-8"><Clock size={24} className="text-surface-500 mx-auto mb-2" /><p className="text-surface-400 text-sm">Belum ada riwayat di bulan ini</p></div>
        ) : (
          <div className="space-y-2">
            {attendances.slice(0, 10).map(att => (
              <div key={att.id} className="flex gap-3 items-center p-3 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{format(new Date(att.date), 'EEEE, dd MMM', { locale: localeId })}</p>
                  <div className="grid grid-cols-2 gap-3 mt-1.5">
                    <div>
                      <span className="text-xs text-emerald-400 font-medium block mb-0.5">In: {att.checkInTime ? format(new Date(att.checkInTime), 'HH:mm') : '-'}</span>
                      <span className="text-[11px] text-surface-400 line-clamp-1" title={att.checkInNote || 'Tidak ada catatan'}>Catatan: {att.checkInNote || '-'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-rose-400 font-medium block mb-0.5">Out: {att.checkOutTime ? format(new Date(att.checkOutTime), 'HH:mm') : '-'}</span>
                      <span className="text-[11px] text-surface-400 line-clamp-1" title={att.checkOutNote || 'Tidak ada catatan'}>Catatan: {att.checkOutNote || '-'}</span>
                    </div>
                  </div>
                </div>
                {att.checkInPhoto && <img src={att.checkInPhoto} alt="" className="w-9 h-9 rounded-lg object-cover border border-white/10 flex-shrink-0" />}
                {att.checkOutPhoto && <img src={att.checkOutPhoto} alt="" className="w-9 h-9 rounded-lg object-cover border border-white/10 flex-shrink-0" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberDashboard;
