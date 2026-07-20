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

function getCurrentMonthValue() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function generateResourceMonthsByRange(selectedMonthValue, backMonths = 6, forwardMonths = 5) {
  const [year, month] = selectedMonthValue.split('-').map(Number);
  const selected = new Date(year, month - 1, 1);
  const start = new Date(selected.getFullYear(), selected.getMonth() - Number(backMonths), 1);
  const totalMonths = Number(backMonths) + 1 + Number(forwardMonths);

  return Array.from({ length: totalMonths }, (_, index) => {
    const date = new Date(start.getFullYear(), start.getMonth() + index, 1);
    return {
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      monthLabel: date.toLocaleString('en-US', { month: 'short' }),
      yearLabel: String(date.getFullYear()),
      startDate: new Date(date.getFullYear(), date.getMonth(), 1),
      endDate: new Date(date.getFullYear(), date.getMonth() + 1, 0)
    };
  });
}

function groupYearHeaders(months) {
  const groups = [];
  months.forEach(m => {
    const last = groups[groups.length - 1];
    if (last && last.year === m.yearLabel) {
      last.span += 1;
    } else {
      groups.push({ year: m.yearLabel, span: 1 });
    }
  });
  return groups;
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
  const [memberId, setMemberId] = useState('');
  const [projectManagerId, setProjectManagerId] = useState('');
  
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthValue());
  const [backMonths, setBackMonths] = useState(6);
  const [forwardMonths, setForwardMonths] = useState(5);
  
  const [appliedMonth, setAppliedMonth] = useState(getCurrentMonthValue());
  const [appliedBackMonths, setAppliedBackMonths] = useState(6);
  const [appliedForwardMonths, setAppliedForwardMonths] = useState(5);
  
  const [memberOptions, setMemberOptions] = useState([]);
  const [pmOptions, setPmOptions] = useState([]);
  
  const [appliedFilters, setAppliedFilters] = useState({
    memberId: '',
    projectManagerId: '',
    month: getCurrentMonthValue(),
    backMonths: 6,
    forwardMonths: 5
  });
  
  const fetchData = async (overrideFilters = null) => {
    const currentSearch = overrideFilters?.search !== undefined ? overrideFilters.search : search;
    const currentActiveOnly = overrideFilters?.activeOnly !== undefined ? overrideFilters.activeOnly : activeOnly;
    const currentMemberId = overrideFilters?.memberId !== undefined ? overrideFilters.memberId : memberId;
    const currentPmId = overrideFilters?.projectManagerId !== undefined ? overrideFilters.projectManagerId : projectManagerId;
    const currentMonth = overrideFilters?.month !== undefined ? overrideFilters.month : appliedMonth;
    const currentBack = overrideFilters?.backMonths !== undefined ? overrideFilters.backMonths : appliedBackMonths;
    const currentForward = overrideFilters?.forwardMonths !== undefined ? overrideFilters.forwardMonths : appliedForwardMonths;

    setAppliedFilters({ 
      memberId: currentMemberId, 
      projectManagerId: currentPmId, 
      month: currentMonth,
      backMonths: currentBack,
      forwardMonths: currentForward
    });

    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/api/project-resources', {
        search: currentSearch,
        activeOnly: currentActiveOnly ? 'true' : 'false',
        memberId: currentMemberId,
        projectManagerId: currentPmId,
        month: currentMonth,
        backMonths: currentBack,
        forwardMonths: currentForward
      });
      
      const pmData = response.data.projectManagers || [];
      setData(pmData);
      
      if (!currentPmId) {
        const pmMap = new Map();
        pmData.forEach(pm => {
          pmMap.set(pm.id, { value: pm.id, label: pm.name });
        });
        setPmOptions([{ value: '', label: 'All Project Managers' }, ...Array.from(pmMap.values()).sort((a, b) => a.label.localeCompare(b.label))]);
      }

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
    if (!selectedMonth) {
      showToast({ type: 'error', title: 'Invalid Filter', message: 'Month cannot be empty.' });
      return;
    }
    const back = Number(backMonths);
    const forward = Number(forwardMonths);
    if (isNaN(back) || back < 0 || isNaN(forward) || forward < 0) {
      showToast({ type: 'error', title: 'Invalid Filter', message: 'Back and Forward Months must be valid numbers \u2265 0.' });
      return;
    }
    const total = back + 1 + forward;
    if (total > 24) {
      showToast({ type: 'error', title: 'Range Limit Exceeded', message: 'Maximum total months allowed is 24.' });
      return;
    }

    setAppliedMonth(selectedMonth);
    setAppliedBackMonths(back);
    setAppliedForwardMonths(forward);
    fetchData({ month: selectedMonth, backMonths: back, forwardMonths: forward });
  };

  const handleResetFilter = () => {
    setSearch('');
    setActiveOnly(true);
    setMemberId('');
    setProjectManagerId('');
    
    const currentMonth = getCurrentMonthValue();
    setSelectedMonth(currentMonth);
    setBackMonths(6);
    setForwardMonths(5);
    
    setAppliedMonth(currentMonth);
    setAppliedBackMonths(6);
    setAppliedForwardMonths(5);
    
    fetchData({ search: '', activeOnly: true, memberId: '', projectManagerId: '', month: currentMonth, backMonths: 6, forwardMonths: 5 });
  };
  
  const months = useMemo(() => {
    return generateResourceMonthsByRange(appliedMonth, appliedBackMonths, appliedForwardMonths);
  }, [appliedMonth, appliedBackMonths, appliedForwardMonths]);

  const yearGroups = useMemo(() => {
    return groupYearHeaders(months);
  }, [months]);

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
          <div className="relative flex-1 min-w-[200px] z-30">
            <AppSelect
              options={pmOptions}
              value={projectManagerId}
              onChange={setProjectManagerId}
              placeholder="All Project Managers"
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
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-surface-700 dark:text-surface-300">Month:</span>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-1.5 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-white/[0.06] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 dark:text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-surface-700 dark:text-surface-300" title="Back Months">Back:</span>
              <select
                value={backMonths}
                onChange={(e) => setBackMonths(e.target.value)}
                className="px-3 py-1.5 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-white/[0.06] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 dark:text-white"
              >
                {Array.from({ length: 25 }, (_, i) => (
                  <option key={`back-${i}`} value={i}>{i}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-surface-700 dark:text-surface-300" title="Forward Months">Forward:</span>
              <select
                value={forwardMonths}
                onChange={(e) => setForwardMonths(e.target.value)}
                className="px-3 py-1.5 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-white/[0.06] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 dark:text-white"
              >
                {Array.from({ length: 25 }, (_, i) => (
                  <option key={`fwd-${i}`} value={i}>{i}</option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer text-surface-700 dark:text-surface-300">
              <input 
                type="checkbox" 
                checked={activeOnly} 
                onChange={(e) => setActiveOnly(e.target.checked)}
                className="rounded border-surface-300 text-brand-500 focus:ring-brand-500 bg-transparent"
              />
              Active Projects Only
            </label>
          </div>
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
                  <div key={project.id} className="glass-card overflow-hidden relative">
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
                    
                    <div className="overflow-x-auto relative">
                      <table className="w-full text-sm text-left whitespace-nowrap table-fixed border-collapse" style={{ minWidth: `${596 + months.length * 40}px` }}>
                        <colgroup>
                          <col className="w-[56px] min-w-[56px]" />
                          <col className="w-[160px] min-w-[160px]" />
                          <col className="w-[110px] min-w-[110px]" />
                          <col className="w-[110px] min-w-[110px]" />
                          <col className="w-[160px] min-w-[160px]" />
                          {months.map(m => (
                            <col key={m.key} className="min-w-[40px]" />
                          ))}
                        </colgroup>
                        <thead>
                          <tr className="bg-surface-100 dark:bg-surface-900/50 text-surface-600 dark:text-surface-400">
                            <th rowSpan={2} className="w-[56px] min-w-[56px] px-2 py-2 font-medium border-b border-surface-200 dark:border-white/[0.06] sticky left-0 z-40 bg-surface-100 dark:bg-surface-900 shadow-[1px_0_0_0_#e5e7eb] dark:shadow-[1px_0_0_0_rgba(255,255,255,0.06)]">No</th>
                            <th rowSpan={2} className="w-[160px] min-w-[160px] px-2 py-2 font-medium border-b border-surface-200 dark:border-white/[0.06] sticky left-[56px] z-40 bg-surface-100 dark:bg-surface-900 shadow-[1px_0_0_0_#e5e7eb] dark:shadow-[1px_0_0_0_rgba(255,255,255,0.06)] truncate">Name</th>
                            <th rowSpan={2} className="w-[110px] min-w-[110px] px-2 py-2 font-medium border-b border-surface-200 dark:border-white/[0.06] sticky left-[216px] z-40 bg-surface-100 dark:bg-surface-900 shadow-[1px_0_0_0_#e5e7eb] dark:shadow-[1px_0_0_0_rgba(255,255,255,0.06)] truncate">Start Date</th>
                            <th rowSpan={2} className="w-[110px] min-w-[110px] px-2 py-2 font-medium border-b border-surface-200 dark:border-white/[0.06] sticky left-[326px] z-40 bg-surface-100 dark:bg-surface-900 shadow-[1px_0_0_0_#e5e7eb] dark:shadow-[1px_0_0_0_rgba(255,255,255,0.06)] truncate">End Date</th>
                            <th rowSpan={2} className="w-[160px] min-w-[160px] px-2 py-2 font-medium border-b border-surface-200 dark:border-white/[0.06] sticky left-[436px] z-40 bg-surface-100 dark:bg-surface-900 shadow-[2px_0_0_0_#cbd5e1] dark:shadow-[2px_0_0_0_rgba(255,255,255,0.12)] truncate">Job Role</th>
                            {yearGroups.map((g, i) => (
                              <th key={i} colSpan={g.span} className="px-1 py-1 font-medium text-center border-r border-b border-surface-200 dark:border-white/[0.06] text-xs sm:text-sm">
                                {g.year}
                              </th>
                            ))}
                          </tr>
                          <tr className="bg-surface-100 dark:bg-surface-900/50 text-surface-600 dark:text-surface-400">
                            {months.map(m => (
                              <th key={m.key} className="px-1 py-2 font-medium text-center border-r border-b border-surface-200 dark:border-white/[0.06] text-xs">
                                {m.monthLabel.substring(0, 3)}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {project.members.length === 0 ? (
                            <tr>
                              <td colSpan={5 + months.length} className="px-2 py-3 text-center text-surface-500 sticky left-0 z-30 bg-white dark:bg-surface-800">
                                Belum ada member di project ini
                              </td>
                            </tr>
                          ) : (
                            project.members.map((member, idx) => (
                              <tr key={member.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/30 transition-colors group/row">
                                <td className="w-[56px] min-w-[56px] px-2 py-2 border-b border-surface-200 dark:border-white/[0.06] sticky left-0 z-30 bg-white dark:bg-surface-800 group-hover/row:bg-surface-50 dark:group-hover/row:bg-surface-800/30 shadow-[1px_0_0_0_#e5e7eb] dark:shadow-[1px_0_0_0_rgba(255,255,255,0.06)]">{idx + 1}</td>
                                <td className="w-[160px] min-w-[160px] px-2 py-2 font-medium text-surface-900 dark:text-white border-b border-surface-200 dark:border-white/[0.06] sticky left-[56px] z-30 bg-white dark:bg-surface-800 group-hover/row:bg-surface-50 dark:group-hover/row:bg-surface-800/30 shadow-[1px_0_0_0_#e5e7eb] dark:shadow-[1px_0_0_0_rgba(255,255,255,0.06)] truncate">
                                  <div className="relative inline-block group w-full">
                                    <span
                                      className="cursor-help block w-full truncate"
                                      title={`Contract Start: ${formatDate(member.contractStart || member.startDate)} | Contract End: ${formatDate(member.contractEnd || member.endDate)}`}
                                    >
                                      {member.name}
                                    </span>

                                    <div className="pointer-events-none absolute left-0 top-full z-[100] mt-2 hidden min-w-[220px] rounded-lg border border-surface-200 dark:border-white/[0.1] bg-white dark:bg-surface-900 px-3 py-2 text-xs shadow-lg group-hover:block">
                                      <div className="font-semibold text-surface-900 dark:text-white">Contract Information</div>
                                      <div className="mt-1 text-surface-600 dark:text-surface-300">
                                        <div>Contract Start: {formatDate(member.contractStart || member.startDate)}</div>
                                        <div>Contract End: {formatDate(member.contractEnd || member.endDate)}</div>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="w-[110px] min-w-[110px] px-2 py-2 border-b border-surface-200 dark:border-white/[0.06] sticky left-[216px] z-30 bg-white dark:bg-surface-800 group-hover/row:bg-surface-50 dark:group-hover/row:bg-surface-800/30 shadow-[1px_0_0_0_#e5e7eb] dark:shadow-[1px_0_0_0_rgba(255,255,255,0.06)] truncate">
                                  {formatDate(member.startDate)}
                                </td>
                                <td className="w-[110px] min-w-[110px] px-2 py-2 border-b border-surface-200 dark:border-white/[0.06] sticky left-[326px] z-30 bg-white dark:bg-surface-800 group-hover/row:bg-surface-50 dark:group-hover/row:bg-surface-800/30 shadow-[1px_0_0_0_#e5e7eb] dark:shadow-[1px_0_0_0_rgba(255,255,255,0.06)] truncate">
                                  {formatDate(member.endDate)}
                                </td>
                                <td className="w-[160px] min-w-[160px] px-2 py-2 border-b border-surface-200 dark:border-white/[0.06] sticky left-[436px] z-30 bg-white dark:bg-surface-800 group-hover/row:bg-surface-50 dark:group-hover/row:bg-surface-800/30 shadow-[2px_0_0_0_#cbd5e1] dark:shadow-[2px_0_0_0_rgba(255,255,255,0.12)] truncate" title={member.jobRoleName || member.jobRoleCode || ''}>
                                  {member.jobRoleName || member.jobRoleCode || '-'}
                                </td>
                                {months.map(m => {
                                  const isActive = isMonthOverlapping(member.startDate, member.endDate, m.startDate, m.endDate);
                                  return (
                                    <td 
                                      key={m.key} 
                                      className={[
                                        'border-r border-b border-surface-200 dark:border-white/[0.06] transition-colors',
                                        isActive 
                                          ? 'bg-yellow-300 dark:bg-yellow-500/80 hover:bg-yellow-400 dark:hover:bg-yellow-400/90' 
                                          : 'bg-transparent hover:bg-surface-100/50 dark:hover:bg-surface-800/40'
                                      ].join(' ')}
                                      title={isActive ? `${member.name} active in ${m.monthLabel} ${m.yearLabel}` : ''}
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
