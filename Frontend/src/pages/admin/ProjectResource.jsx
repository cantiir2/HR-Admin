// Name Function : ProjectResource
// Author : Iyan.FID
// Description : Admin page for viewing resource planning matrix by project and month

import { useState, useEffect, useMemo } from 'react';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import AppAlert from '../../components/AppAlert';
import AppSelect from '../../components/AppSelect';
import { Search, Loader2 } from 'lucide-react';

function generateMonths(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  start.setDate(1); 
  end.setDate(1); 
  
  const months = [];
  let current = new Date(start);
  
  while (current <= end) {
    months.push({
      key: `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`,
      label: current.toLocaleString('default', { month: 'short', year: '2-digit' }),
      startDate: new Date(current.getFullYear(), current.getMonth(), 1),
      endDate: new Date(current.getFullYear(), current.getMonth() + 1, 0)
    });
    current.setMonth(current.getMonth() + 1);
  }
  return months;
}

function isMonthOverlapping(startDate, endDate, monthStart, monthEnd) {
  if (!startDate || !endDate) return false;
  return new Date(startDate) <= monthEnd && new Date(endDate) >= monthStart;
}

function formatDate(dateString) {
  if (!dateString) return '-';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '-');
}

export default function ProjectResource() {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [search, setSearch] = useState('');
  const [activeOnly, setActiveOnly] = useState(true);
  const [startMonth, setStartMonth] = useState('');
  const [endMonth, setEndMonth] = useState('');
  const [memberId, setMemberId] = useState('');
  
  const [memberOptions, setMemberOptions] = useState([]);
  
  const [appliedFilters, setAppliedFilters] = useState({
    startMonth: '',
    endMonth: '',
    memberId: ''
  });
  
  const fetchData = async (overrideFilters = null) => {
    const currentSearch = overrideFilters?.search !== undefined ? overrideFilters.search : search;
    const currentActiveOnly = overrideFilters?.activeOnly !== undefined ? overrideFilters.activeOnly : activeOnly;
    const currentStartMonth = overrideFilters?.startMonth !== undefined ? overrideFilters.startMonth : startMonth;
    const currentEndMonth = overrideFilters?.endMonth !== undefined ? overrideFilters.endMonth : endMonth;
    const currentMemberId = overrideFilters?.memberId !== undefined ? overrideFilters.memberId : memberId;

    if (currentStartMonth && currentEndMonth && currentStartMonth > currentEndMonth) {
      showToast({ type: 'error', title: 'Error', message: 'Start Month tidak boleh lebih besar dari End Month' });
      return;
    }
    
    setAppliedFilters({ startMonth: currentStartMonth, endMonth: currentEndMonth, memberId: currentMemberId });

    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/api/project-resources', {
        search: currentSearch,
        activeOnly: currentActiveOnly ? 'true' : 'false',
        startMonth: currentStartMonth,
        endMonth: currentEndMonth,
        memberId: currentMemberId
      });
      
      const pmData = response.data.projectManagers || [];
      setData(pmData);
      
      if (!currentMemberId) {
        const memberMap = new Map();
        pmData.forEach(pm => {
          pm.projects.forEach(project => {
            project.members.forEach(m => {
              if (!memberMap.has(m.id)) {
                memberMap.set(m.id, { value: m.id, label: m.name });
              }
            });
          });
        });
        setMemberOptions([{ value: '', label: 'All Members' }, ...Array.from(memberMap.values()).sort((a, b) => a.label.localeCompare(b.label))]);
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.error || err.message || 'Gagal mengambil data project resources';
      setError(errMsg);
      showToast({ type: 'error', title: 'Error', message: errMsg });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApplyFilter = () => {
    fetchData();
  };

  const handleResetFilter = () => {
    setSearch('');
    setActiveOnly(true);
    setStartMonth('');
    setEndMonth('');
    setMemberId('');
    fetchData({ search: '', activeOnly: true, startMonth: '', endMonth: '', memberId: '' });
  };
  
  const months = useMemo(() => {
    let globalStart = null;
    let globalEnd = null;
    
    if (appliedFilters.startMonth) {
      globalStart = new Date(`${appliedFilters.startMonth}-01T00:00:00.000Z`);
    }
    if (appliedFilters.endMonth) {
      const [y, m] = appliedFilters.endMonth.split('-');
      globalEnd = new Date(Date.UTC(parseInt(y), parseInt(m), 0, 23, 59, 59, 999));
    }
    
    if (!appliedFilters.startMonth || !appliedFilters.endMonth) {
       data.forEach(pm => {
         pm.projects.forEach(p => {
           const pStart = new Date(p.contractStart);
           const pEnd = new Date(p.contractEnd);
           if (!globalStart || pStart < globalStart) globalStart = pStart;
           if (!globalEnd || pEnd > globalEnd) globalEnd = pEnd;
         });
       });
    }

    if (!globalStart && globalEnd) {
       globalStart = new Date(globalEnd.getFullYear() - 1, globalEnd.getMonth(), 1);
    } else if (globalStart && !globalEnd) {
       globalEnd = new Date(globalStart.getFullYear() + 1, globalStart.getMonth(), 0);
    } else if (!globalStart && !globalEnd) {
       globalStart = new Date(new Date().getFullYear(), 0, 1);
       globalEnd = new Date(new Date().getFullYear(), 11, 31);
    }
    
    return generateMonths(globalStart, globalEnd);
  }, [data, appliedFilters]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-surface-900 dark:text-white">Project Resource</h2>
          <p className="text-sm text-surface-500">Resource allocation by project and month</p>
        </div>
      </div>

      <div className="glass-card p-4 flex flex-col gap-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" size={18} />
            <input
              type="text"
              placeholder="Search project ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-white/[0.06] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            />
          </div>
          <div className="relative flex-1 min-w-[200px] z-20">
            <AppSelect
              options={memberOptions}
              value={memberId}
              onChange={setMemberId}
              placeholder="All Members"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-surface-500">Start Month:</span>
            <input
              type="month"
              value={startMonth}
              onChange={(e) => setStartMonth(e.target.value)}
              className="px-3 py-2 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-white/[0.06] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-surface-500">End Month:</span>
            <input
              type="month"
              value={endMonth}
              onChange={(e) => setEndMonth(e.target.value)}
              className="px-3 py-2 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-white/[0.06] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <label className="flex items-center gap-2 text-sm cursor-pointer text-surface-700 dark:text-surface-300">
            <input 
              type="checkbox" 
              checked={activeOnly} 
              onChange={(e) => setActiveOnly(e.target.checked)}
              className="rounded border-surface-300 text-brand-500 focus:ring-brand-500 bg-transparent"
            />
            Active Projects Only
          </label>
          <div className="flex gap-2">
            <button
              onClick={handleResetFilter}
              className="px-4 py-2 text-sm font-medium text-surface-600 dark:text-surface-300 bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 rounded-xl transition-colors"
            >
              Reset
            </button>
            <button
              onClick={handleApplyFilter}
              className="px-4 py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-xl shadow-lg shadow-brand-500/20 transition-all"
            >
              Apply Filter
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="animate-spin text-brand-500" size={32} />
        </div>
      ) : error ? (
        <AppAlert type="error" title="Gagal memuat data" message={error} />
      ) : data.length === 0 ? (
        <div className="glass-card p-12 text-center text-surface-500">
          Tidak ada data resource yang sesuai kriteria.
        </div>
      ) : (
        <div className="space-y-8">
          {data.map(pm => (
            <div key={pm.id} className="space-y-4">
              <h3 className="text-lg font-bold text-surface-800 dark:text-surface-100 flex items-center gap-2 border-b border-surface-200 dark:border-white/[0.06] pb-2">
                <span className="text-brand-500">PM:</span> {pm.name}
              </h3>
              
              <div className="space-y-6 pl-0 lg:pl-4">
                {pm.projects.map(project => (
                  <div key={project.id} className="glass-card overflow-hidden">
                    <div className="p-4 border-b border-surface-200 dark:border-white/[0.06] bg-surface-50/50 dark:bg-surface-800/30">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-surface-500">Project Name</p>
                          <p className="font-semibold text-surface-900 dark:text-white">{project.name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-surface-500">Customer</p>
                          <p className="font-medium text-surface-800 dark:text-surface-200">{project.customerName || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-surface-500">WO Number</p>
                          <p className="font-medium text-surface-800 dark:text-surface-200">{project.woNumber || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-surface-500">Project Period</p>
                          <p className="font-medium text-surface-800 dark:text-surface-200">
                            {formatDate(project.contractStart)} s/d {formatDate(project.contractEnd)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left whitespace-nowrap">
                        <thead>
                          <tr className="bg-surface-100 dark:bg-surface-900/50 text-surface-600 dark:text-surface-400">
                            <th className="px-4 py-3 font-medium border-r border-b border-surface-200 dark:border-white/[0.06]">No</th>
                            <th className="px-4 py-3 font-medium border-r border-b border-surface-200 dark:border-white/[0.06]">Name</th>
                            <th className="px-4 py-3 font-medium border-r border-b border-surface-200 dark:border-white/[0.06]">Tanggal Mulai</th>
                            <th className="px-4 py-3 font-medium border-r border-b border-surface-200 dark:border-white/[0.06]">Tanggal Selesai</th>
                            <th className="px-4 py-3 font-medium border-r border-b border-surface-200 dark:border-white/[0.06]">Job Role</th>
                            {months.map(m => (
                              <th key={m.key} className="px-4 py-3 font-medium text-center border-r border-b border-surface-200 dark:border-white/[0.06] min-w-[80px]">
                                {m.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="">
                          {project.members.length === 0 ? (
                            <tr>
                              <td colSpan={5 + months.length} className="px-4 py-4 text-center text-surface-500">
                                Belum ada member di project ini
                              </td>
                            </tr>
                          ) : (
                            project.members.map((member, idx) => (
                              <tr key={member.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/30 transition-colors">
                                <td className="px-4 py-3 border-r border-b border-surface-200 dark:border-white/[0.06]">{idx + 1}</td>
                                <td className="px-4 py-3 font-medium text-surface-900 dark:text-white border-r border-b border-surface-200 dark:border-white/[0.06]">
                                  {member.name}
                                </td>
                                <td className="px-4 py-3 border-r border-b border-surface-200 dark:border-white/[0.06]">
                                  {formatDate(member.startDate)}
                                </td>
                                <td className="px-4 py-3 border-r border-b border-surface-200 dark:border-white/[0.06]">
                                  {formatDate(member.endDate)}
                                </td>
                                <td className="px-4 py-3 border-r border-b border-surface-200 dark:border-white/[0.06]">
                                  {member.jobRoleName || member.jobRoleCode || '-'}
                                </td>
                                {months.map(m => {
                                  const isActive = isMonthOverlapping(member.startDate, member.endDate, m.startDate, m.endDate);
                                  return (
                                    <td 
                                      key={m.key} 
                                      className={[
                                        'px-4 py-3 border-r border-b border-surface-200 dark:border-white/[0.06] transition-colors',
                                        isActive 
                                          ? 'bg-yellow-300 dark:bg-yellow-500/80 hover:bg-yellow-400 dark:hover:bg-yellow-400/90' 
                                          : 'bg-transparent hover:bg-surface-100/50 dark:hover:bg-surface-800/40'
                                      ].join(' ')}
                                      title={isActive ? `${member.name} active in ${m.label}` : ''}
                                    >
                                      
                                    </td>
                                  );
                                })}
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
