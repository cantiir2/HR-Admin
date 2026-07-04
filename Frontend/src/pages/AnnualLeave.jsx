import React, { useCallback, useEffect, useState } from 'react';
import { CalendarDays, Download, Eye, FileImage, Loader2, Send, Upload, X } from 'lucide-react';
import { format } from 'date-fns';
import api from '../lib/api';
import AppSelect from '../components/AppSelect';
import SortableHeader from '../components/SortableHeader';
import useTableSort from '../hooks/useTableSort';
import {
  downloadBase64File,
  normalizeBase64DataUrl,
  readFileAsDataUrl,
  validateEvidencePhotoFile,
  viewBase64File
} from '../lib/fileValidation';
import { useToast } from '../context/ToastContext';

const initialForm = {
  leaveType: '',
  startDate: '',
  endDate: '',
  reason: '',
  evidencePhoto: '',
  evidencePhotoName: '',
  evidencePhotoMimeType: ''
};

const calculateWorkingDays = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  if (start > end) return 0;

  let total = 0;
  const cursor = new Date(start);
  while (cursor <= end) {
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) total += 1;
    cursor.setDate(cursor.getDate() + 1);
  }
  return total;
};

const AnnualLeave = () => {
  const { showToast } = useToast();
  const [balance, setBalance] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [warning, setWarning] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusClass, setStatusClass] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [evidenceImage, setEvidenceImage] = useState(null);

  const totalDays = calculateWorkingDays(form.startDate, form.endDate);

  const { sortBy, sortOrder, handleSort } = useTableSort('startDate', 'desc');

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const res = await api.get('/api/system?category=LEAVE_STATUS&isActive=true');
        const dynamicStatusClass = {};

        if (res.data && res.data.length > 0) {
          res.data.forEach(item => {
            dynamicStatusClass[item.code] = item.description || 'badge-info';
          });
        }

        setStatusClass(dynamicStatusClass);
      } catch (error) {
        console.error('Failed to fetch leave statuses', error);
      }
    };

    fetchStatuses();
  }, []);

  const fetchLeaves = useCallback(async (nextSortBy = sortBy, nextSortOrder = sortOrder) => {
    const leavesRes = await api.get('/api/leaves/me', {
      params: {
        sortBy: nextSortBy,
        sortOrder: nextSortOrder
      }
    });

    setLeaves(leavesRes.data || []);
  }, [sortBy, sortOrder]);

  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);

      const [balanceRes, leavesRes, systemRes] = await Promise.all([
        api.get('/api/leaves/me/balance'),
        api.get('/api/leaves/me', {
          params: {
            sortBy,
            sortOrder
          }
        }),
        api.get('/api/system?category=LEAVE_TYPE&isActive=true')
      ]);

      setBalance(balanceRes.data);
      setLeaves(leavesRes.data || []);

      const dynamicLeaveTypes = (systemRes.data || []).map(item => ({
        value: item.code,
        label: item.name
      }));

      setLeaveTypes(dynamicLeaveTypes);

      setForm(prev => ({
        ...prev,
        leaveType: prev.leaveType || (dynamicLeaveTypes.length > 0 ? dynamicLeaveTypes[0].value : '')
      }));
    } catch {
      setBalance(null);
      setLeaves([]);
      setLeaveTypes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  const fetchData = useCallback(async () => {
    try {
      const [balanceRes, leavesRes] = await Promise.all([
        api.get('/api/leaves/me/balance'),
        api.get('/api/leaves/me', {
          params: {
            sortBy,
            sortOrder
          }
        })
      ]);
      setBalance(balanceRes.data);
      setLeaves(leavesRes.data || []);
    } catch (err) {
      console.error('Failed to fetch leave data', err);
    }
  }, [sortBy, sortOrder]);

  const submitLeave = async (warningAcknowledged = false) => {
    try {
      setSaving(true);
      const res = await api.post('/api/leaves', { ...form, warningAcknowledged });
      showToast({ type: 'success', title: 'Berhasil', message: res.data.message || 'Pengajuan cuti berhasil dibuat' });
      setForm({ ...initialForm, leaveType: leaveTypes.length > 0 ? leaveTypes[0].value : '' });
      setWarning(null);
      fetchData();
    } catch (err) {
      console.log(err);

      if (err.response?.status === 409 && err.response?.data?.requiresWarning) {
        setWarning(err.response.data.balance);
      } else {
        showToast({ type: 'error', title: 'Gagal', message: err.response?.data?.error || 'Gagal membuat pengajuan cuti' });
      }
    } finally {
      setSaving(false);
    }
  };

  const updateLeaveType = (leaveType) => {
    setForm(current => ({
      ...current,
      leaveType,
      evidencePhoto: '',
      evidencePhotoName: '',
      evidencePhotoMimeType: ''
    }));
  };

  const handleEvidenceChange = async (file) => {
    if (!file) {
      setForm(current => ({ ...current, evidencePhoto: '', evidencePhotoName: '', evidencePhotoMimeType: '' }));
      return;
    }

    const validationError = validateEvidencePhotoFile(file);
    if (validationError) {
      showToast({ type: 'error', title: 'Validasi Gagal', message: validationError });
      setForm(current => ({ ...current, evidencePhoto: '', evidencePhotoName: '', evidencePhotoMimeType: '' }));
      return;
    }

    const fileData = await readFileAsDataUrl(file);
    setForm(current => ({
      ...current,
      evidencePhoto: fileData,
      evidencePhotoName: file.name,
      evidencePhotoMimeType: file.type
    }));
  };

  const fetchEvidence = async (id) => {
    const res = await api.get(`/api/leaves/${id}/evidence-photo`);
    return res.data;
  };

  const viewEvidence = async (id) => {
    try {
      const evidence = await fetchEvidence(id);
      const imageUrl = evidence.fileData.startsWith('data:')
        ? evidence.fileData
        : `data:${evidence.fileType || 'image/png'};base64,${evidence.fileData}`;
      setEvidenceImage(imageUrl);
      setIsModalOpen(true);
    } catch (err) {
      showToast({ type: 'error', title: 'Gagal', message: err.response?.data?.error || 'Gagal membuka evidence photo' });
    }
  };

  const closeEvidenceModal = () => {
    setIsModalOpen(false);
    setEvidenceImage(null);
  };

  const downloadEvidence = async (id) => {
    try {
      const evidence = await fetchEvidence(id);
      downloadBase64File(evidence.fileData, evidence.fileName, evidence.fileType);
    } catch (err) {
      showToast({ type: 'error', title: 'Gagal', message: err.response?.data?.error || 'Gagal download evidence photo' });
    }
  };

  const cancelLeave = async (id) => {
    try {
      setSaving(true);
      await api.put(`/api/leaves/${id}/cancel`);
      showToast({ type: 'success', title: 'Berhasil', message: 'Pengajuan cuti berhasil dibatalkan' });
      fetchData();
    } catch (err) {
      showToast({ type: 'error', title: 'Gagal', message: err.response?.data?.error || 'Gagal membatalkan cuti' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 size={30} className="animate-spin text-brand-400" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">Annual Leave</h2>
        <p className="text-sm text-surface-400">Ajukan cuti tahunan dan pantau status approval</p>
      </div>

      <div className="grid gap-3 md:grid-cols-3 mb-5">
        <div className="stat-card">
          <p className="text-xs text-surface-400 mb-2">Jatah Cuti</p>
          <p className="text-2xl font-bold text-white">{balance?.entitlementDays || 0}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-surface-400 mb-2">Terpakai</p>
          <p className="text-2xl font-bold text-white">{balance?.usedLeaveDays || 0}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-surface-400 mb-2">Sisa Cuti</p>
          <p className="text-2xl font-bold text-white">{balance?.remainingLeaveDays || 0}</p>
        </div>
      </div>

      <div className="glass-card-light p-5 mb-5">
        <div className="grid gap-3 md:grid-cols-2">
          <AppSelect
            label="Jenis Cuti"
            value={form.leaveType}
            onChange={updateLeaveType}
            options={leaveTypes}
          />
          <div>
            <label className="block text-sm text-surface-300 mb-1">Tanggal Mulai</label>
            <input type="date" value={form.startDate} onChange={e => setForm(current => ({ ...current, startDate: e.target.value }))} className="input-dark text-sm [color-scheme:light] dark:[color-scheme:dark]" />
          </div>
          <div>
            <label className="block text-sm text-surface-300 mb-1">Tanggal Selesai</label>
            <input type="date" value={form.endDate} onChange={e => setForm(current => ({ ...current, endDate: e.target.value }))} className="input-dark text-sm [color-scheme:light] dark:[color-scheme:dark]" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-surface-300 mb-1">Alasan</label>
            <textarea value={form.reason} onChange={e => setForm(current => ({ ...current, reason: e.target.value }))} className="input-dark text-sm min-h-28 resize-none" placeholder="Tuliskan alasan cuti..." />
          </div>
          {form.leaveType === 'OTHERS' && (
            <div className="md:col-span-2">
              <label className="block text-sm text-surface-300 mb-1">Evidence Photo</label>
              <label className="input-dark text-sm min-h-[46px] flex items-center justify-between gap-3 cursor-pointer">
                <span className="flex items-center gap-2 min-w-0">
                  <FileImage size={16} className="text-brand-400 shrink-0" />
                  <span className="truncate">{form.evidencePhotoName || 'Pilih file evidence'}</span>
                </span>
                <Upload size={16} className="text-surface-400 shrink-0" />
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => handleEvidenceChange(e.target.files?.[0])} />
              </label>
              <p className="mt-1 text-xs text-surface-500">Opsional. Upload foto bukti pendukung jika tersedia.</p>
              
              <div className="mt-3 p-3 bg-white/[0.02] border border-white/[0.06] rounded-lg space-y-1">
                <p className="text-xs text-surface-300">
                  <span className="font-semibold text-brand-400">Aturan Cuti OTHERS:</span> Sakit 1 hari tidak memotong cuti. Sakit lebih dari 1 hari tanpa surat dokter akan memotong cuti mulai hari ke-2.
                </p>
                {form.startDate && form.endDate && totalDays > 0 && (
                  <div className="mt-2 text-sm font-medium">
                    {form.evidencePhoto ? (
                      <p className="text-emerald-400">Dengan evidence/surat dokter, pengajuan ini tidak memotong jatah cuti.</p>
                    ) : totalDays === 1 ? (
                      <p className="text-emerald-400">Sakit 1 hari tidak memotong jatah cuti.</p>
                    ) : (
                      <p className="text-amber-400">Tanpa surat dokter, pengajuan ini akan mengurangi jatah cuti sebanyak {totalDays - 1} hari.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="mt-4 flex justify-end">
          <button type="button" onClick={() => submitLeave(false)} disabled={saving} className="btn-primary text-sm inline-flex items-center gap-2">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            Ajukan Cuti
          </button>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-white/[0.06]">
          <CalendarDays size={18} className="text-brand-400" />
          <h3 className="text-sm font-semibold text-white">Daftar Pengajuan</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <SortableHeader label="Periode" field="startDate" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={handleSort} />
                <SortableHeader label="Total" field="totalDays" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={handleSort} />
                <SortableHeader label="Status" field="status" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={handleSort} />
                <SortableHeader label="Evidence" />
                <SortableHeader label="Keterangan" />
                <SortableHeader label="Aksi" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {leaves.map(item => (
                <tr key={item.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-sm text-surface-300">
                    {format(new Date(item.startDate), 'dd MMM yyyy')} - {format(new Date(item.endDate), 'dd MMM yyyy')}
                  </td>
                  <td className="px-4 py-3 text-sm text-surface-400">{item.totalDays} hari</td>
                  <td className="px-4 py-3"><span className={statusClass[item.status] || 'badge-info'}>{item.status}</span></td>
                  <td className="px-4 py-3 text-sm text-surface-400">
                    {item.hasEvidencePhoto ? 'Evidence tersedia' : 'Tidak ada evidence'}
                  </td>
                  <td className="px-4 py-3 text-sm text-surface-400">
                    {item.isOverQuota ? <span className="badge-danger mr-2">Over Quota</span> : null}
                    {item.rejectionReason || item.reason}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {item.hasEvidencePhoto && (
                        <>
                          <button type="button" onClick={() => viewEvidence(item.id)} className="badge-info"><Eye size={13} />Lihat Evidence</button>
                          <button type="button" onClick={() => downloadEvidence(item.id)} className="badge-info"><Download size={13} />Download Evidence</button>
                        </>
                      )}
                      {['PENDING', 'APPROVED_BY_PM'].includes(item.status) ? (
                        <button type="button" onClick={() => cancelLeave(item.id)} className="badge-danger"><X size={13} />Cancel</button>
                      ) : !item.hasEvidencePhoto ? <span className="text-xs text-surface-500">-</span> : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {leaves.length === 0 && <div className="py-12 text-center text-sm text-surface-400">Belum ada pengajuan cuti</div>}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl rounded-lg bg-white p-4 shadow-xl">

            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Evidence Photo</h3>
              <button
                onClick={closeEvidenceModal}
                className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex justify-center overflow-hidden rounded bg-gray-50 p-2">
              {evidenceImage ? (
                <img
                  src={evidenceImage}
                  alt="Evidence"
                  className="max-h-[75vh] w-auto object-contain"
                />
              ) : (
                <p className="py-10 text-gray-500">Gambar tidak tersedia</p>
              )}
            </div>

          </div>
        </div>
      )}

      {warning && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md glass-card-light p-6">
            <h3 className="text-lg font-semibold text-white mb-3">Peringatan Cuti Melebihi Jatah</h3>
            <div className="space-y-2 text-sm text-surface-300">
              <p>Sisa cuti Anda saat ini adalah {warning.remainingLeaveDays} hari.</p>
              <p>Jumlah cuti yang diajukan adalah {warning.totalDays} hari.</p>
              {warning.requestedDeductDays !== undefined && warning.requestedDeductDays !== warning.totalDays && (
                <p>Jumlah cuti yang memotong jatah adalah {warning.requestedDeductDays} hari.</p>
              )}
              <p>Terdapat kelebihan cuti sebanyak {warning.overQuotaDays} hari.</p>
              <p className="text-amber-300">Kelebihan cuti dapat dikenakan pemotongan gaji sesuai kebijakan perusahaan.</p>
              <p>Apakah Anda tetap ingin mengajukan cuti?</p>
            </div>
            <div className="flex gap-3 mt-5">
              <button type="button" onClick={() => setWarning(null)} className="flex-1 btn-ghost text-sm">Batal</button>
              <button type="button" onClick={() => submitLeave(true)} disabled={saving} className="flex-1 btn-primary text-sm">Tetap Ajukan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnualLeave;
