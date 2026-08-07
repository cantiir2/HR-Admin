import { useEffect, useMemo, useState } from 'react';
import { Download, FileText, Loader2, Send } from 'lucide-react';
import { format } from 'date-fns';
import api from '../lib/api';
import AppSelect from '../components/AppSelect';
import SortableHeader from '../components/SortableHeader';
import useTableSort from '../hooks/useTableSort';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Pagination from '../components/Pagination';

const months = [
  [1, 'Januari'], [2, 'Februari'], [3, 'Maret'], [4, 'April'], [5, 'Mei'], [6, 'Juni'],
  [7, 'Juli'], [8, 'Agustus'], [9, 'September'], [10, 'Oktober'], [11, 'November'], [12, 'Desember']
];

const statusLabel = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  LATE: 'Late'
};

const statusClass = {
  DRAFT: 'badge-info',
  SUBMITTED: 'badge-info',
  APPROVED: 'badge-success',
  REJECTED: 'badge-danger',
  LATE: 'badge-danger'
};

const formatDeadlineDate = (deadlineDate) => {
  if (!deadlineDate) return '';
  const dateObj = new Date(deadlineDate);
  if (isNaN(dateObj.getTime())) return '';
  return format(dateObj, 'dd MMM yyyy');
};

const isDeadlinePassed = (deadlineDate) => {
  if (!deadlineDate) return false;
  const date = new Date(deadlineDate);
  return new Date() >= new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1);
};

const WorkingReport = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [detail, setDetail] = useState({ report: null, attendances: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);


  const { sortBy, sortOrder, handleSort } = useTableSort('date', 'asc');

  const years = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, index) => [current - index, String(current - index)]);
  }, []);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/working-reports/me/${month}/${year}`, { params: { sortBy, sortOrder, pageNo, pageSize } });
      setDetail(res.data);
      if (res.data.totalRecords !== undefined) {
        setTotalRecords(res.data.totalRecords);
      }
    } catch {
      setDetail({ report: null, attendances: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [month, year, sortBy, sortOrder, pageNo, pageSize]);

  const submitReport = async () => {
    try {
      setSaving(true);
      await api.post('/api/working-reports/submit', { month, year });
      showToast({ type: 'success', title: 'Berhasil', message: 'Working Report berhasil disubmit' });
      fetchDetail();
    } catch (err) {
      showToast({ type: 'error', title: 'Gagal', message: err.response?.data?.error || 'Gagal submit Working Report' });
    } finally {
      setSaving(false);
    }
  };

  const exportReport = async () => {
    try {
      setSaving(true);
      const res = await api.get('/api/working-reports/export', {
        params: { month, year },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Working Report - ${String(month).padStart(2, '0')}-${year} ${user?.name}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      showToast({ type: 'error', title: 'Gagal', message: 'Gagal export Working Report' });
    } finally {
      setSaving(false);
    }
  };

  const reportStatus = detail.computedStatus || detail.report?.computedStatus || detail.report?.status || 'DRAFT';
  const lateDays = detail.lateDays ?? detail.report?.lateDays ?? 0;
  const deadlineText = formatDeadlineDate(detail.deadlineDate);
  const deadlinePassed = isDeadlinePassed(detail.deadlineDate);
  const totalPages = Math.ceil(totalRecords / pageSize);

  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">Working Report</h2>
        <p className="text-sm text-surface-400">Preview attendance bulanan dan submit Working Report</p>
      </div>

      <div className="glass-card-light p-4 mb-4">
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto_auto]">
          <AppSelect label="Bulan" value={month} onChange={value => setMonth(Number(value))} options={months} />
          <AppSelect label="Tahun" value={year} onChange={value => setYear(Number(value))} options={years} />
          <button type="button" onClick={exportReport} disabled={saving} className="btn-ghost mt-6 text-sm inline-flex items-center justify-center gap-2">
            <Download size={16} />
            Export
          </button>
          <button type="button" onClick={submitReport} disabled={saving || reportStatus === 'APPROVED'} className="btn-primary mt-6 text-sm inline-flex items-center justify-center gap-2">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            Submit
          </button>
        </div>
      </div>

      {deadlinePassed && reportStatus !== 'APPROVED' && (
        <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm">
          Deadline Working Report {deadlineText} sudah terlewati.
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-4 mb-4">
        <div className="stat-card">
          <p className="text-xs text-surface-400 mb-2">Status</p>
          <span className={statusClass[reportStatus]}>{statusLabel[reportStatus]}</span>
        </div>
        <div className="stat-card">
          <p className="text-xs text-surface-400 mb-2">Deadline Submit</p>
          <p className="text-2xl font-bold text-white">{deadlineText}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-surface-400 mb-2">Total Attendance</p>
          <p className="text-2xl font-bold text-white">{detail.totalRecords || 0}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-surface-400 mb-2">Late Days</p>
          <p className="text-2xl font-bold text-white">{lateDays}</p>
        </div>
      </div>

      <div className="glass-card-light p-4 mb-4">
        <div className="text-xs text-surface-400">
          <p className="font-semibold mb-1">Note:</p>
          <ul className="space-y-1">
            <li className="flex gap-1.5 items-start">
              <span>1.</span>
              <span>
                Jika H+3 masih belum mengirimkan Working Report, <span className="text-red-500 font-medium">maka OT flat bulan berikutnya hanya akan dibayarkan SETENGAHnya.</span>
              </span>
            </li>
            <li className="flex gap-1.5 items-start">
              <span>2.</span>
              <span>Mass Leave / Cuti Bersama memotong cuti tahunan.</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-white/[0.06]">
          <FileText size={18} className="text-brand-400" />
          <h3 className="text-sm font-semibold text-white">Preview Attendance</h3>
        </div>
        {loading ? (
          <div className="py-14 flex items-center justify-center">
            <Loader2 size={28} className="animate-spin text-brand-400" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <SortableHeader label="Tanggal" field="date" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={handleSort} />
                  <SortableHeader label="Check-In" field="checkInTime" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={handleSort} />
                  <SortableHeader label="Check-Out" field="checkOutTime" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={handleSort} />
                  <SortableHeader label="Catatan" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {(detail.attendances || []).map(item => (
                  <tr key={item.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-sm text-surface-300">{format(new Date(item.date), 'dd MMM yyyy')}</td>
                    <td className="px-4 py-3 text-sm text-surface-400">{item.checkInTime ? format(new Date(item.checkInTime), 'HH:mm') : '-'}</td>
                    <td className="px-4 py-3 text-sm text-surface-400">{item.checkOutTime ? format(new Date(item.checkOutTime), 'HH:mm') : '-'}</td>
                    <td className="px-4 py-3 text-sm text-surface-400">{item.checkInNote || item.checkOutNote || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(detail.attendances || []).length === 0 && <div className="py-12 text-center text-sm text-surface-400">Tidak ada attendance pada periode ini</div>}
          </div>
        )}

        {detail.attendances.length > 0 && (
          <div className="p-4 border-t border-white/[0.06] flex justify-end">
            <Pagination
              page={{ pageNo, pageSize, totalPages }}
              doSearch={(p, s) => { setPageNo(p); setPageSize(s); }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkingReport;
