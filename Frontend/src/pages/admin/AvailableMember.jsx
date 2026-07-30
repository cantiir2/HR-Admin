import { useCallback, useEffect, useRef, useState } from 'react';
import { CalendarDays, Search, Users } from 'lucide-react';
import api from '../../lib/api';
import AppSelect from '../../components/AppSelect';
import Pagination from '../../components/Pagination';
import SortableHeader from '../../components/SortableHeader';
import useTableSort from '../../hooks/useTableSort';
import { useToast } from '../../context/ToastContext';

const AvailableMember = () => {
  const [members, setMembers] = useState([]);
  const [jobRoles, setJobRoles] = useState([]);
  const [filters, setFilters] = useState({ startDate: '', endDate: '', skill: '', search: '' });
  const [page, setPage] = useState({ pageNo: 1, pageSize: 10, totalRows: 0, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const pageSizeRef = useRef(10);

  const { sortBy, sortOrder, handleSort } = useTableSort('name', 'asc');

  const fetchMembers = useCallback(async (pageNo = 1, pageSize = pageSizeRef.current) => {
    pageSizeRef.current = pageSize;
    setLoading(true);
    try {
      const res = await api.post('/api/users/available-members/search', {
        pageNo,
        pageSize,
        startDate: filters.startDate,
        endDate: filters.endDate,
        skill: filters.skill,
        search: filters.search,
        sortBy,
        sortOrder
      });
      setMembers(res.data.data || []);
      setPage(res.data.page || { pageNo, pageSize, totalRows: 0, totalPages: 1 });
    } catch (err) {
      showToast({ type: 'error', title: 'Gagal', message: err.response?.data?.error || 'Gagal mengambil availability member' });
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy, sortOrder]);

  useEffect(() => {
    api.get('/api/system', { params: { category: 'JOB_ROLE', isActive: true } })
      .then(res => setJobRoles(res.data))
      .catch(() => showToast({ type: 'error', title: 'Gagal', message: 'Gagal mengambil daftar job role' }));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMembers(1, pageSizeRef.current);
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchMembers]);

  const doSearch = async (pageNo, pageSize) => {
    await fetchMembers(pageNo, pageSize);
  };

  const changePageSize = (pageSize) => {
    pageSizeRef.current = pageSize;
    setPage(prev => ({ ...prev, pageNo: 1, pageSize }));
  };

  return (
    <div className="animate-fade-in space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2"><Users size={20} /> Available Member</h2>
        <p className="text-sm text-surface-400">Urutan otomatis dari member available sekarang ke availability terdekat.</p>
      </div>
      <div className="glass-card p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block text-sm text-surface-300">Start Date
          <input
            type="date"
            className="input-dark text-sm mt-1 [color-scheme:light] dark:[color-scheme:dark]"
            value={filters.startDate}
            onChange={e => setFilters({ ...filters, startDate: e.target.value })} />
        </label>
        <label className="block text-sm text-surface-300">End Date
          <input
            type="date"
            className="input-dark text-sm mt-1 [color-scheme:light] dark:[color-scheme:dark]"
            value={filters.endDate}
            onChange={e => setFilters({ ...filters, endDate: e.target.value })} />
        </label>
        <AppSelect label="Job Role / Skill" value={filters.skill} onChange={value => setFilters({ ...filters, skill: value })} options={[['', 'Semua role'], ...jobRoles.map(role => [role.code, role.name])]} />
        <div>
          <label className="block text-sm text-surface-300 mb-1">Search Nama</label>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
            <input className="input-dark text-sm pl-9" placeholder="Cari nama" value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })} />
          </div>
        </div>
      </div>
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <SortableHeader label="Member" field="name" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={(field) => handleSort(field, () => setPage(p => ({ ...p, pageNo: 1 })))} />
                <SortableHeader label="Job / Skill" field="job_role_code" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={(field) => handleSort(field, () => setPage(p => ({ ...p, pageNo: 1 })))} />
                <SortableHeader label="Current Project" />
                <SortableHeader label="Available From" field="available_from" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={(field) => handleSort(field, () => setPage(p => ({ ...p, pageNo: 1 })))} />
                <SortableHeader label="Available Until" field="available_until" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={(field) => handleSort(field, () => setPage(p => ({ ...p, pageNo: 1 })))} />
                <SortableHeader label="Status" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {!loading && members.map(member => (
                <tr key={member.user_id}>
                  <td className="px-4 py-3"><p className="text-white font-medium">{member.name}</p><p className="text-xs text-surface-500">{member.email}</p></td>
                  <td className="px-4 py-3 text-surface-300"><p>{member.job_role_name || member.job_title || '-'}</p><p className="text-xs text-surface-500">{member.job_role_code || '-'}</p></td>
                  <td className="px-4 py-3 text-surface-300">{member.current_project || '-'}</td>
                  <td className="px-4 py-3 text-surface-300">{member.available_from ? new Date(member.available_from).toLocaleDateString('id-ID') : 'Sekarang'}</td>
                  <td className="px-4 py-3 text-surface-300">
                    {member.available_until
                      ? new Date(member.available_until).toLocaleDateString('id-ID')
                      : 'Seterusnya'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={member.availability_status.startsWith('Available On') || member.availability_status === 'Available Now' ? 'badge-success' : 'badge-info'}>
                      {member.availability_status === 'Available From' && member.available_from
                        ? `Available From ${new Date(member.available_from).toLocaleDateString('id-ID')}`
                        : member.availability_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && !members.length && <div className="text-center text-surface-400 text-sm py-12"><CalendarDays className="mx-auto mb-2" />Tidak ada member sesuai filter.</div>}
          {loading && <div className="text-center text-surface-400 text-sm py-12">Memuat availability...</div>}
        </div>
      </div>
      {page.totalRows > 0 && (
        <div className="mt-4 glass-card p-4">
          <Pagination page={page} doSearch={doSearch} changePageSize={changePageSize} hideGoToPage={false} />
        </div>
      )}
    </div>
  );
};

export default AvailableMember;
