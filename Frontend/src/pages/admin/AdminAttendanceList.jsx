import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Search } from 'lucide-react';
import { format } from 'date-fns';
import Pagination from '../../components/Pagination';
import SortableHeader from '../../components/SortableHeader';
import useTableSort from '../../hooks/useTableSort';

const jakartaToday = () => new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit'
}).format(new Date());

const AdminAttendanceList = () => {
  const [attendances, setAttendances] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState('');
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [startDate, setStartDate] = useState(jakartaToday);
  const [endDate, setEndDate] = useState(jakartaToday);
  const [showAll, setShowAll] = useState(false);

  const { sortBy, sortOrder, handleSort } = useTableSort('date', 'desc');

  useEffect(() => {
    const fetchAttendances = async () => {
      try {
        const params = { page: pageNo, limit: pageSize, search, sortBy, sortOrder };
        if (showAll) {
          params.all = true;
        } else {
          params.startDate = startDate;
          params.endDate = endDate;
        }
        const r = await api.get('/api/attendance', { params });
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
  }, [pageNo, pageSize, search, startDate, endDate, showAll, sortBy, sortOrder]);

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
          <input type="text" placeholder="Cari nama atau email..." value={search} onChange={e => { setSearch(e.target.value); setPageNo(1); }} className="input-dark pl-11 text-sm w-full" />
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <input type="date" disabled={showAll} value={startDate} onChange={e => { setStartDate(e.target.value); setPageNo(1); }} className="input-dark text-sm w-full sm:w-auto md:w-36 disabled:opacity-50 [color-scheme:light] dark:[color-scheme:dark]" title="Dari Tanggal" />
          <span className="text-surface-400 text-sm hidden sm:inline">s/d</span>
          <input type="date" disabled={showAll} value={endDate} onChange={e => { setEndDate(e.target.value); setPageNo(1); }} className="input-dark text-sm w-full sm:w-auto md:w-36 disabled:opacity-50 [color-scheme:light] dark:[color-scheme:dark]" title="Sampai Tanggal" />
        </div>
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
                <SortableHeader label="Karyawan" field="user.name" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={(field) => handleSort(field, () => setPageNo(1))} />
                <SortableHeader label="Tanggal" field="date" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={(field) => handleSort(field, () => setPageNo(1))} />
                <SortableHeader label="Check-In" field="checkInTime" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={(field) => handleSort(field, () => setPageNo(1))} />
                <SortableHeader label="Check-Out" field="checkOutTime" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={(field) => handleSort(field, () => setPageNo(1))} />
                <SortableHeader label="Catatan In" />
                <SortableHeader label="Catatan Out" />
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
                  <td className="px-4 py-3 text-xs text-surface-400 max-w-[150px] truncate">{att.checkInNote || '-'}</td>
                  <td className="px-4 py-3 text-xs text-surface-400 max-w-[150px] truncate">{att.checkOutNote || '-'}</td>
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
