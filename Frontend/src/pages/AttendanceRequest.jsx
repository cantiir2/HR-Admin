import React, { useState, useEffect, useRef } from 'react';
import api from '../lib/api';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';
import AppSelect from '../components/AppSelect';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { ArrowLeft, FileText, Loader2, CalendarDays, UploadCloud, X, Plus, Clock, FileWarning } from 'lucide-react';

const RequestTypeBadge = ({ type }) => {
  const styles = {
    CHECK_IN: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    CHECK_OUT: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    BOTH: 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
  };
  const labels = { CHECK_IN: 'Check-In', CHECK_OUT: 'Check-Out', BOTH: 'In & Out' };

  return (
    <span className={`px-2 py-1 rounded-md text-xs font-medium ${styles[type] || 'bg-surface-700 text-surface-200'}`}>
      {labels[type] || type}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    PENDING: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    APPROVED: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    DECLINED: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    CANCELLED: 'bg-surface-500/10 text-surface-400 border border-surface-500/20'
  };

  return (
    <span className={`px-2 py-1 rounded-md text-xs font-medium ${styles[status] || 'bg-surface-700 text-surface-200'}`}>
      {status}
    </span>
  );
};

export default function AttendanceRequest() {
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const [activeTab, setActiveTab] = useState('history'); // 'history' | 'form'

  // Data
  const [requests, setRequests] = useState([]);
  const [eligibleDates, setEligibleDates] = useState([]);

  // Filters
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [selectedDateObj, setSelectedDateObj] = useState(null);
  const [requestType, setRequestType] = useState('');
  const [requestedCheckInTime, setRequestedCheckInTime] = useState('');
  const [requestedCheckOutTime, setRequestedCheckOutTime] = useState('');
  const [reason, setReason] = useState('');
  const [evidencePhoto, setEvidencePhoto] = useState(null);
  const [evidencePhotoName, setEvidencePhotoName] = useState('');

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    { value: 1, label: 'Januari' }, { value: 2, label: 'Februari' }, { value: 3, label: 'Maret' },
    { value: 4, label: 'April' }, { value: 5, label: 'Mei' }, { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' }, { value: 8, label: 'Agustus' }, { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' }, { value: 11, label: 'November' }, { value: 12, label: 'Desember' }
  ];

  useEffect(() => {
    fetchRequests();
    fetchEligibleDates();
  }, [filterMonth, filterYear]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/attendance-requests/me?month=${filterMonth}&year=${filterYear}`);
      setRequests(res.data.data);
    } catch (err) {
      showToast({ type: 'error', title: 'Gagal', message: 'Gagal memuat riwayat request' });
    } finally {
      setLoading(false);
    }
  };

  const fetchEligibleDates = async () => {
    try {
      const res = await api.get(`/api/attendance-requests/eligible-dates?month=${filterMonth}&year=${filterYear}`);
      setEligibleDates(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast({ type: 'error', title: 'Error', message: 'Ukuran file maksimal 5MB' });
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setEvidencePhoto(event.target.result);
      setEvidencePhotoName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDateObj) return showToast({ type: 'error', message: 'Pilih tanggal terlebih dahulu' });
    if (!evidencePhoto) return showToast({ type: 'error', message: 'Bukti (Evidence) wajib dilampirkan' });

    setSubmitting(true);
    try {
      await api.post('/api/attendance-requests', {
        requestDate: selectedDateObj.date,
        requestType,
        requestedCheckInTime: requestType !== 'CHECK_OUT' ? requestedCheckInTime : null,
        requestedCheckOutTime: requestType !== 'CHECK_IN' ? requestedCheckOutTime : null,
        reason,
        evidencePhoto,
        evidencePhotoName
      });
      showToast({ type: 'success', title: 'Berhasil', message: 'Request berhasil diajukan' });
      setActiveTab('history');

      // Reset form
      setSelectedDateObj(null);
      setRequestType('');
      setRequestedCheckInTime('');
      setRequestedCheckOutTime('');
      setReason('');
      setEvidencePhoto(null);
      setEvidencePhotoName('');

      fetchRequests();
      fetchEligibleDates();
    } catch (err) {
      showToast({ type: 'error', title: 'Gagal', message: err.response?.data?.error || 'Gagal mengajukan request' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id) => {
    const confirmed = await confirm({
      title: 'Batalkan Request?',
      message: 'Apakah Anda yakin ingin membatalkan request ini?',
      confirmText: 'Ya, Batalkan',
      cancelText: 'Tidak',
      variant: 'danger'
    });
    if (!confirmed) return;
    try {
      await api.put(`/api/attendance-requests/${id}/cancel`);
      showToast({ type: 'success', message: 'Request dibatalkan' });
      fetchRequests();
      fetchEligibleDates();
    } catch (err) {
      showToast({ type: 'error', message: 'Gagal membatalkan request' });
    }
  };

  const onDateSelect = (dateStr) => {
    if (!dateStr) {
      setSelectedDateObj(null);
      setRequestType('');
      return;
    }
    const d = eligibleDates.find(x => x.date === dateStr);
    setSelectedDateObj(d);

    // Auto-select type if only 1 suggested
    if (d.suggestedRequestTypes.length === 1) {
      setRequestType(d.suggestedRequestTypes[0]);
    } else {
      setRequestType('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Attendance Request</h1>
          <p className="text-surface-400 text-sm mt-1">Ajukan pembaruan absensi yang terlewat.</p>
        </div>
        {activeTab === 'history' ? (
          <button
            onClick={() => setActiveTab('form')}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} /> Ajukan Request
          </button>
        ) : (
          <button
            onClick={() => setActiveTab('history')}
            className="btn-secondary flex items-center gap-2"
          >
            <ArrowLeft size={14} />  Kembali
          </button>
        )}
      </div>

      {activeTab === 'form' ? (
        <div className="glass-card p-6 max-w-2xl mx-auto">
          <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
            <FileText size={18} className="text-brand-400" /> Form Pengajuan
          </h2>

          {eligibleDates.length === 0 ? (
            <div className="text-center py-8">
              <FileWarning size={32} className="mx-auto text-surface-500 mb-3" />
              <p className="text-surface-300">Tidak ada absensi terlewat di bulan ini yang bisa diajukan.</p>
              <p className="text-sm text-surface-400 mt-2">Coba ubah bulan pada tab riwayat.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">Tanggal Terlewat</label>
                <AppSelect
                  className="w-full"
                  placeholder="-- Pilih Tanggal --"
                  value={selectedDateObj ? selectedDateObj.date : ''}
                  onChange={onDateSelect}
                  options={eligibleDates.map(d => {
                    let optionLabel = format(new Date(d.date), 'EEEE, dd MMMM yyyy', { locale: localeId });
                    if (d.isToday) {
                      if (d.missingCheckIn) optionLabel = "Hari ini - belum check-in";
                      else if (d.missingCheckOut) optionLabel = "Hari ini - belum check-out";
                    }
                    return { value: d.date, label: optionLabel };
                  })}
                  required
                />
              </div>

              {selectedDateObj && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-surface-300 mb-1.5">Jenis Request</label>
                    <AppSelect
                      className="w-full"
                      placeholder="-- Pilih Jenis --"
                      value={requestType}
                      onChange={setRequestType}
                      options={selectedDateObj.suggestedRequestTypes.map(t => ({
                        value: t,
                        label: t === 'CHECK_IN' ? 'Check-In Saja' : t === 'CHECK_OUT' ? 'Check-Out Saja' : 'Check-In & Check-Out'
                      }))}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {['CHECK_IN', 'BOTH'].includes(requestType) && (
                      <div>
                        <label className="block text-sm font-medium text-surface-300 mb-1.5">Waktu Check-In</label>
                        <input
                          type="time"
                          className="input-dark w-full"
                          value={requestedCheckInTime}
                          onChange={(e) => setRequestedCheckInTime(e.target.value)}
                          required
                        />
                      </div>
                    )}
                    {['CHECK_OUT', 'BOTH'].includes(requestType) && (
                      <div>
                        <label className="block text-sm font-medium text-surface-300 mb-1.5">Waktu Check-Out</label>
                        <input
                          type="time"
                          className="input-dark w-full"
                          value={requestedCheckOutTime}
                          onChange={(e) => setRequestedCheckOutTime(e.target.value)}
                          required
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-300 mb-1.5">Alasan Lengkap</label>
                    <textarea
                      className="input-dark w-full resize-none"
                      rows="3"
                      placeholder="Jelaskan alasan terlewat..."
                      value={reason}
                      onChange={e => setReason(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-300 mb-1.5">Bukti (Evidence)</label>
                    <div className="border-2 border-dashed border-white/10 rounded-xl p-4 text-center hover:bg-white/[0.02] transition-colors relative flex flex-col items-center justify-center min-h-[160px]">
                      <input
                        type="file"
                        accept="image/jpeg, image/png, image/webp"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        onChange={handleFileChange}
                        required={!evidencePhoto}
                      />

                      {evidencePhoto ? (
                        <div className="flex flex-col items-center w-full pointer-events-none">
                          <img
                            src={evidencePhoto}
                            alt="Preview Bukti"
                            className="h-32 max-w-full object-contain rounded-lg mb-3 border border-white/5"
                          />
                          <p className="text-sm font-medium text-brand-400">Klik untuk ganti foto</p>
                          <p className="text-xs text-surface-500 mt-1 truncate max-w-[250px]">
                            {evidencePhotoName}
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center pointer-events-none">
                          <UploadCloud size={32} className="text-surface-400 mb-3" />
                          <p className="text-sm text-surface-400">
                            <span className="text-brand-400 font-medium">Klik untuk upload</span> foto bukti
                          </p>
                          <p className="text-xs text-surface-500 mt-1">Maksimal 5MB (JPG/PNG/WEBP)</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="bg-brand-500/10 border border-brand-500/20 rounded-lg p-3 flex items-start gap-3">
                      <FileText size={18} className="text-brand-500 dark:text-brand-400 mt-0.5 shrink-0" />
                      <div className="text-sm text-brand-700 dark:text-brand-200 leading-relaxed">
                        <p>Request ini akan masuk approval dan attendance akan diperbarui setelah disetujui.</p>
                        {requestType === 'CHECK_IN' && selectedDateObj?.isToday && (
                          <p className="mt-1 font-medium">Setelah request check-in disetujui, Anda dapat melakukan check-out normal.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end gap-3">
                    <button type="button" onClick={() => setActiveTab('history')} className="btn-secondary">
                      Batal
                    </button>
                    <button type="submit" disabled={submitting} className="btn-primary min-w-[120px]">
                      {submitting ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Kirim Request'}
                    </button>
                  </div>
                </>
              )}
            </form>
          )}
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <h3 className="font-semibold text-white">Riwayat Pengajuan</h3>
            <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto_auto]">
              <AppSelect
                value={filterMonth}
                onChange={setFilterMonth}
                options={months.map(m => ({ value: m.value, label: m.label }))}
              />
              <AppSelect
                value={filterYear}
                onChange={setFilterYear}
                options={years.map(y => ({ value: y, label: y }))}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-white/[0.02] text-surface-400 border-b border-white/5">
                  <th className="px-6 py-4 font-medium">Tanggal Request</th>
                  <th className="px-6 py-4 font-medium">Jenis</th>
                  <th className="px-6 py-4 font-medium">Waktu</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-surface-300">
                {loading ? (
                  <tr><td colSpan="5" className="text-center py-8"><Loader2 className="animate-spin mx-auto text-brand-400" /></td></tr>
                ) : requests.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-8 text-surface-400">Tidak ada riwayat.</td></tr>
                ) : (
                  requests.map(req => (
                    <tr key={req.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">
                          {format(new Date(req.requestDate), 'dd MMM yyyy', { locale: localeId })}
                        </div>
                        <div className="text-xs text-surface-500 mt-1">
                          Diajukan {format(new Date(req.createdAt), 'dd/MM/yyyy HH:mm')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <RequestTypeBadge type={req.requestType} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 text-xs">
                          {req.requestedCheckInTime && (
                            <span>In: {format(new Date(req.requestedCheckInTime.replace('Z', '')), 'HH:mm')}</span>
                          )}
                          {req.requestedCheckOutTime && (
                            <span>Out: {format(new Date(req.requestedCheckOutTime.replace('Z', '')), 'HH:mm')}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 items-start">
                          <StatusBadge status={req.status} />
                          {req.declineReason && (
                            <span className="text-xs text-rose-400 truncate max-w-[150px]" title={req.declineReason}>
                              {req.declineReason}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {req.status === 'PENDING' && (
                          <button
                            onClick={() => handleCancel(req.id)}
                            className="text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-2 py-1 rounded-lg transition-colors"
                          >
                            Batalkan
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
