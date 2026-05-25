import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Search, Users } from 'lucide-react';
import api from '../../lib/api';
import AppSelect from '../../components/AppSelect';
import AppAlert from '../../components/AppAlert';

const AvailableMember = () => {
  const [members, setMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filters, setFilters] = useState({ startDate: '', endDate: '', skill: '', projectId: '' });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/projects').then(res => setProjects(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/api/users/available-members', { params: filters });
        setMembers(res.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Gagal mengambil availability member');
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [filters]);

  const displayed = useMemo(() => members.filter(member => {
    const q = search.toLowerCase();
    return member.name.toLowerCase().includes(q) || member.email.toLowerCase().includes(q);
  }), [members, search]);

  return (
    <div className="animate-fade-in space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2"><Users size={20} /> Available Member</h2>
        <p className="text-sm text-surface-400">Urutan otomatis dari member available sekarang ke availability terdekat.</p>
      </div>
      <AppAlert tone="error" message={error} />
      <div className="glass-card p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <input type="date" className="input-dark text-sm" value={filters.startDate} onChange={e => setFilters({ ...filters, startDate: e.target.value })} />
        <input type="date" className="input-dark text-sm" value={filters.endDate} onChange={e => setFilters({ ...filters, endDate: e.target.value })} />
        <input className="input-dark text-sm" placeholder="Filter skill" value={filters.skill} onChange={e => setFilters({ ...filters, skill: e.target.value })} />
        <AppSelect value={filters.projectId} onChange={value => setFilters({ ...filters, projectId: value })} options={[['', 'Semua project'], ...projects.map(project => [project.id, project.name])]} />
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
          <input className="input-dark text-sm pl-9" placeholder="Cari nama" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead><tr className="border-b border-white/[0.06] text-xs uppercase text-surface-400">
              <th className="px-4 py-3">Member</th><th className="px-4 py-3">Job / Skill</th><th className="px-4 py-3">Current Project</th><th className="px-4 py-3">Available From</th><th className="px-4 py-3">Status</th>
            </tr></thead>
            <tbody className="divide-y divide-white/[0.04]">
              {displayed.map(member => (
                <tr key={member.user_id}>
                  <td className="px-4 py-3"><p className="text-white font-medium">{member.name}</p><p className="text-xs text-surface-500">{member.email}</p></td>
                  <td className="px-4 py-3 text-surface-300">{member.job_title || '-'}<p className="text-xs text-surface-500">{member.skill || '-'}</p></td>
                  <td className="px-4 py-3 text-surface-300">{member.current_project || '-'}</td>
                  <td className="px-4 py-3 text-surface-300">{member.available_from ? new Date(member.available_from).toLocaleDateString('id-ID') : 'Sekarang'}</td>
                  <td className="px-4 py-3"><span className={member.availability_status === 'Available Now' ? 'badge-success' : 'badge-info'}>{member.availability_status === 'Available Now' ? 'Available Now' : `Available From ${new Date(member.available_from).toLocaleDateString('id-ID')}`}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && !displayed.length && <div className="text-center text-surface-400 text-sm py-12"><CalendarDays className="mx-auto mb-2" />Tidak ada member sesuai filter.</div>}
          {loading && <div className="text-center text-surface-400 text-sm py-12">Memuat availability...</div>}
        </div>
      </div>
    </div>
  );
};

export default AvailableMember;
