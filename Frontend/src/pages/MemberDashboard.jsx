import { useState, useEffect, useRef, useCallback } from 'react';
import Webcam from "react-webcam";
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import {
  Camera, MapPin, LogOut, CheckCircle, Clock,
  ArrowUpCircle, ArrowDownCircle, FileText,
  Navigation, Loader2, AlertCircle, Fingerprint,
  CalendarDays, User, FolderKanban, ChevronRight,
  MapPinCheck
} from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import AppSelect from '../components/AppSelect';
import Pagination from '../components/Pagination';
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
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [attendances, setAttendances] = useState([]);
  const [todayRecord, setTodayRecord] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isOvertimeCheckout, setIsOvertimeCheckout] = useState(false);
  const webcamRef = useRef(null);

  const [filterDate, setFilterDate] = useState(new Date().getDate());
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [exportLoading, setExportLoading] = useState(false);

  const [dashboardProjects, setDashboardProjects] = useState([]);
  const [dashboardTimeline, setDashboardTimeline] = useState('current');
  const [dashboardProjectsLoading, setDashboardProjectsLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => { fetchAttendances(); }, [filterMonth, filterYear]);
  useEffect(() => { fetchDashboardProjects(); }, [dashboardTimeline]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterDate, filterMonth, filterYear]);

  useEffect(() => {
    if (filterDate) {
      const maxDays = new Date(filterYear, filterMonth, 0).getDate();
      if (filterDate > maxDays) {
        setFilterDate(maxDays);
      }
    }
  }, [filterMonth, filterYear]);

  const fetchDashboardProjects = async () => {
    try {
      setDashboardProjectsLoading(true);
      const res = await api.get(`/api/projects/my-projects?pageNo=1&pageSize=3&timeline=${dashboardTimeline}`);
      setDashboardProjects(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setDashboardProjectsLoading(false);
    }
  };

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

  const handleSubmit = async (type) => {
    if (type === 'check-out' && !note.trim()) { showToast({ type: 'error', title: 'Validasi Gagal', message: 'Catatan aktivitas wajib diisi' }); return; }

    setLoading(true);
    try {
      let position;
      try {
        position = await new Promise((resolve, reject) => {
          if (!navigator.geolocation) reject(new Error('Geolocation tidak didukung'));
          navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 });
        });
      } catch (geoErr) {
        if (geoErr.code === 2 || geoErr.code === 3) {
          position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: false, timeout: 8000, maximumAge: 10000 });
          });
        } else {
          throw geoErr;
        }
      }

      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      const endpoint = type === 'check-in' ? '/api/attendance/check-in' : '/api/attendance/check-out';
      const payload = {
        photo: photoBase64,
        latitude,
        longitude,
        ...(type === 'check-out' ? { note } : {})
      };
      const response = await api.post(endpoint, payload);
      if (response.data.attendance) {
        setTodayRecord(response.data.attendance);
      }
      await fetchAttendances();
      showToast({ type: 'success', title: 'Berhasil', message: response.data.message || `${type === 'check-in' ? 'Check-In' : 'Check-Out'} berhasil!` });
      setPhotoBase64(null); setNote('');
      setIsOvertimeCheckout(false);
    } catch (err) {
      if (err.code === 1) {
        showToast({ type: 'error', title: 'Izin Lokasi Ditolak', message: 'Akses lokasi ditolak browser. Mohon izinkan akses.' });
      } else if (err.code === 2) {
        showToast({ type: 'error', title: 'Lokasi Tidak Tersedia', message: 'Pastikan fitur Location / GPS di pengaturan perangkat Anda (Windows/HP) sudah Aktif.' });
      } else if (err.code === 3) {
        showToast({ type: 'error', title: 'Waktu Habis', message: 'Sinyal lokasi lemah atau pencarian terlalu lama. Coba lagi.' });
      } else if (err.message === 'Geolocation tidak didukung') {
        showToast({ type: 'error', title: 'Gagal', message: 'Perangkat tidak mendukung fitur lokasi.' });
      } else {
        showToast({ type: 'error', title: 'Gagal', message: err.response?.data?.error || 'Gagal mengirim absensi' });
      }
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

  const daysInMonth = new Date(filterYear, filterMonth, 0).getDate();
  const daysOptions = [
    { value: '', label: 'Semua Tanggal' },
    ...Array.from({ length: daysInMonth }, (_, i) => {
      const d = new Date(filterYear, filterMonth - 1, i + 1);
      const dayName = format(d, 'EEEE', { locale: localeId });
      return { value: i + 1, label: `${dayName}, ${i + 1}` };
    })
  ];

  const filteredAttendances = attendances.filter(att => {
    if (!filterDate) return true;
    const dateValue = att.date || att.checkInTime;
    if (!dateValue) return false;
    const day = parseInt(formatDateJakarta(dateValue).split('-')[2], 10);
    return day === Number(filterDate);
  });

  const totalPages = Math.ceil(filteredAttendances.length / pageSize) || 1;
  const paginatedAttendances = filteredAttendances.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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

      <div className="grid grid-cols-2 gap-3 animate-slide-up">
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10"><ArrowUpCircle size={16} className="text-emerald-400" /></div>
            <span className="text-xs font-medium text-surface-400">Check-In</span>
          </div>
          <p className="text-lg font-bold text-white">
            {todayRecord?.checkInTime ? format(new Date(todayRecord.checkInTime), 'HH:mm') : '--:--'}
          </p>
          {todayRecord?.checkInTime && todayRecord?.checkInArea && (
            <div className="mt-1">
              <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium ${todayRecord.checkInArea.inRange
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                <MapPinCheck size={13} /> {todayRecord.checkInArea.name}
              </span>
            </div>
          )}
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-rose-500/10"><ArrowDownCircle size={16} className="text-rose-400" /></div>
            <span className="text-xs font-medium text-surface-400">Check-Out</span>
          </div>
          <p className="text-lg font-bold text-white">
            {todayRecord?.checkOutTime ? format(new Date(todayRecord.checkOutTime), 'HH:mm') : '--:--'}
          </p>
          {todayRecord?.checkOutTime && todayRecord?.checkOutArea && (
            <div className="mt-1">
              <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium ${todayRecord.checkOutArea.inRange
                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                <MapPinCheck size={13} /> {todayRecord.checkOutArea.name}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="glass-card p-6 animate-slide-up mt-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FolderKanban size={18} className="text-brand-400" />
            <h2 className="text-lg font-semibold text-white">Project Saya</h2>
          </div>
          <div className="flex items-center gap-3">
            <AppSelect
              value={dashboardTimeline}
              onChange={(val) => setDashboardTimeline(val)}
              className="py-1 text-xs"
              options={[
                ['current', 'Sedang Berjalan'],
                ['incoming', 'Akan Datang']
              ]}
            />
            <button
              onClick={() => navigate('/member/projects')}
              className="text-xs text-brand-400 hover:text-brand-300 font-medium flex items-center gap-1"
            >
              Lihat Semua <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {dashboardProjectsLoading ? (
          <div className="text-center py-6"><Loader2 size={20} className="animate-spin text-surface-400 mx-auto" /></div>
        ) : dashboardProjects.length === 0 ? (
          <div className="text-center py-6 text-surface-400 text-sm bg-white/[0.03] rounded-xl border border-white/[0.05]">
            Tidak ada project untuk kategori ini
          </div>
        ) : (
          <div className="space-y-3">
            {dashboardProjects.map(p => (
              <div key={p.id} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] transition-colors cursor-pointer flex justify-between items-center" onClick={() => navigate(`/member/projects/${p.id}`)}>
                <div>
                  <p className="text-sm font-medium text-white line-clamp-1">{p.name}</p>
                  <p className="text-xs text-surface-400 mt-0.5" title="Rentang penugasan Anda">
                    {format(new Date(p.members?.[0]?.joinedAt || p.contractStart), 'dd MMM yyyy')} - {format(new Date(p.members?.[0]?.leftAt || p.contractEnd), 'dd MMM yyyy')}
                  </p>
                </div>
                <ChevronRight size={16} className="text-surface-500" />
              </div>
            ))}
          </div>
        )}
      </div>

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
              {loading ? <><Loader2 size={18} className="animate-spin" /> {canCheckIn ? 'Check-In...' : 'Check-Out...'}</> : canCheckIn ? <><ArrowUpCircle size={18} /> Check-In</> : <><ArrowDownCircle size={18} /> Check-Out</>}
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

          <div className="grid grid-cols-3 gap-2">
            <AppSelect
              value={filterDate ?? ''}
              onChange={value => setFilterDate(value === '' ? null : parseInt(value))}
              className="py-2 text-sm"
              options={daysOptions}
            />
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

        {filteredAttendances.length === 0 ? (
          <div className="text-center py-8"><Clock size={24} className="text-surface-500 mx-auto mb-2" /><p className="text-surface-400 text-sm">{filterDate ? 'Belum ada riwayat pada tanggal ini' : 'Belum ada riwayat di bulan ini'}</p></div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              {paginatedAttendances.map(att => (
                <div key={att.id} className="flex gap-3 items-center p-3 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{format(new Date(att.date), 'EEEE, dd MMM', { locale: localeId })}</p>
                    <div className="grid grid-cols-2 gap-3 mt-1.5">
                      <div>
                        <span className="text-xs text-emerald-400 font-medium block mb-0.5">In: {att.checkInTime ? format(new Date(att.checkInTime), 'HH:mm') : '-'}</span>
                        {att.checkInTime && att.checkInArea && (
                          <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium mb-1 ${att.checkInArea.inRange
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}>
                            <MapPinCheck size={13} /> {att.checkInArea.name}
                          </span>
                        )}
                        <span className="text-[11px] text-surface-400 line-clamp-1 block" title={att.checkInNote || 'Tidak ada catatan'}>Catatan: {att.checkInNote || '-'}</span>
                      </div>
                      <div>
                        <span className="text-xs text-rose-400 font-medium block mb-0.5">Out: {att.checkOutTime ? format(new Date(att.checkOutTime), 'HH:mm') : '-'}</span>
                        {att.checkOutTime && att.checkOutArea && (
                          <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium mb-1 ${att.checkOutArea.inRange
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}>
                            <MapPinCheck size={13} /> {att.checkOutArea.name}
                          </span>
                        )}
                        <span className="text-[11px] text-surface-400 line-clamp-1 block" title={att.checkOutNote || 'Tidak ada catatan'}>Catatan: {att.checkOutNote || '-'}</span>
                      </div>
                    </div>
                  </div>
                  {att.checkInPhoto && <img src={att.checkInPhoto} alt="" className="w-9 h-9 rounded-lg object-cover border border-white/10 flex-shrink-0" />}
                  {att.checkOutPhoto && <img src={att.checkOutPhoto} alt="" className="w-9 h-9 rounded-lg object-cover border border-white/10 flex-shrink-0" />}
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-white/[0.06]">
              <Pagination
                page={{
                  pageNo: currentPage,
                  pageSize: pageSize,
                  totalRows: filteredAttendances.length,
                  totalPages: totalPages
                }}
                doSearch={(pageNo, size) => {
                  setCurrentPage(pageNo);
                  if (size) setPageSize(size);
                }}
                changePageSize={(size) => setPageSize(size)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberDashboard;
