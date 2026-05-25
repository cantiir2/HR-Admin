import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Search } from 'lucide-react';
import { format } from 'date-fns';
import Pagination from '../../components/Pagination';

const jakartaToday = () => new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit'
}).format(new Date());

const AdminAttendanceList = () => {
  const [attendances, setAttendances] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState('');
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedDate, setSelectedDate] = useState(jakartaToday);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchAttendances = async () => {
      try {
        const r = await api.get('/api/attendance', {
          params: { page: pageNo, limit: pageSize, search, ...(showAll ? { all: true } : { date: selectedDate }) }
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
  }, [pageNo, pageSize, search, selectedDate, showAll]);

  const totalPages = Math.ceil(totalRecords / pageSize);

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">Riwayat Absensi</h2>
        <p className="text-sm text-surface-400">Semua rekaman check-in dan check-out karyawan</p>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_auto_auto] mb-4">
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-500" />
          <input type="text" placeholder="Cari nama atau email..." value={search} onChange={e => { setSearch(e.target.value); setPageNo(1); }} className="input-dark pl-11 text-sm" />
        </div>
        <input type="date" disabled={showAll} value={selectedDate} onChange={e => { setSelectedDate(e.target.value); setPageNo(1); }} className="input-dark text-sm md:w-44 disabled:opacity-50" />
        <label className="flex items-center gap-2 px-4 rounded-xl border border-white/[0.08] text-sm text-surface-300">
          <input type="checkbox" checked={showAll} onChange={e => { setShowAll(e.target.checked); setPageNo(1); }} />
          Show All
        </label>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="px-4 py-3 text-xs font-semibold text-surface-400 uppercase">Karyawan</th>
                <th className="px-4 py-3 text-xs font-semibold text-surface-400 uppercase">Tanggal</th>
                <th className="px-4 py-3 text-xs font-semibold text-surface-400 uppercase">Check-In</th>
                <th className="px-4 py-3 text-xs font-semibold text-surface-400 uppercase">Check-Out</th>
                <th className="px-4 py-3 text-xs font-semibold text-surface-400 uppercase">Catatan In</th>
                <th className="px-4 py-3 text-xs font-semibold text-surface-400 uppercase">Catatan Out</th>
                <th className="px-4 py-3 text-xs font-semibold text-surface-400 uppercase">Foto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {attendances.map(att => (
                <tr key={att.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-white">{att.user?.name}</p>
                    <p className="text-[11px] text-surface-500">{att.user?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-surface-400">{format(new Date(att.date), 'dd MMM yyyy')}</td>
                  <td className="px-4 py-3">
                    {att.checkInTime ? (
                      <span className="badge-success">{format(new Date(att.checkInTime), 'HH:mm')}</span>
                    ) : <span className="text-surface-600 text-xs">-</span>}
                  </td>
                  <td className="px-4 py-3">
                    {att.checkOutTime ? (
                      <span className="badge-danger">{format(new Date(att.checkOutTime), 'HH:mm')}</span>
                    ) : <span className="text-surface-600 text-xs">-</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-surface-400 max-w-[150px] truncate">{att.checkInNote || '-'}</td>
                  <td className="px-4 py-3 text-xs text-surface-400 max-w-[150px] truncate">{att.checkOutNote || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {att.checkInPhoto && <img src={att.checkInPhoto} alt="In" className="w-8 h-8 rounded-lg object-cover border border-white/10" />}
                      {att.checkOutPhoto && <img src={att.checkOutPhoto} alt="Out" className="w-8 h-8 rounded-lg object-cover border border-white/10" />}
                      {!att.checkInPhoto && !att.checkOutPhoto && <span className="text-surface-600 text-xs">-</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {attendances.length === 0 && <div className="text-center py-12 text-surface-400 text-sm">Tidak ada data absensi</div>}
        </div>
        {attendances.length > 0 && (
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

export default AdminAttendanceList;
