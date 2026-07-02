import { useState, useEffect, useCallback } from 'react';
import { format as formatDate } from 'date-fns';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/api';
import { ArrowLeft, Plus, Calendar as CalendarIcon, LayoutDashboard, Clock, X, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import idLocale from 'date-fns/locale/id';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useAuth } from '../context/AuthContext';
import AppSelect from '../components/AppSelect';
import { useToast } from '../context/ToastContext';

const locales = { 'id': idLocale };
const localizer = dateFnsLocalizer({
  format, parse, startOfWeek, getDay, locales,
});

const COLUMNS = [
  { id: 'TODO', title: 'To Do', color: 'border-surface-700 bg-surface-800/50' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'border-brand-800/50 bg-brand-900/20' },
  { id: 'REVIEW', title: 'Review', color: 'border-amber-800/50 bg-amber-900/20' },
  { id: 'DONE', title: 'Done', color: 'border-emerald-800/50 bg-emerald-900/20' }
];

const makeDroppableId = (milestoneId, status) => JSON.stringify({ milestoneId, status });

const readDroppableId = (droppableId) => {
  try {
    const parsed = JSON.parse(droppableId);
    if (!parsed?.milestoneId || !parsed?.status) return null;
    return parsed;
  } catch (error) {
    console.error('Droppable ID tidak valid', error);
    return null;
  }
};

const toDateInputValue = (value) => value ? value.split('T')[0] : '';

const isDateInRange = (value, min, max) => {
  if (!value) return true;
  if (min && value < min) return false;
  if (max && value > max) return false;
  return true;
};

const clampDate = (value, min, max) => {
  if (!value) return '';
  if (min && value < min) return min;
  if (max && value > max) return max;
  return value;
};

const addDateDays = (value, days) => {
  const result = new Date(`${value}T00:00:00Z`);
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().split('T')[0];
};

const formatMonthYearShort = (date) => {
  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = String(date.getFullYear()).slice(-2);
  return `${month}${year}`;
};

const formatTwoDigitDay = (date) => {
  return String(date.getDate()).padStart(2, '0');
};

const buildMonthGroups = (weeks) => {
  const groups = [];
  weeks.forEach((week) => {
    const label = formatMonthYearShort(week.date);
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.label === label) {
      lastGroup.span += 1;
    } else {
      groups.push({ label, span: 1 });
    }
  });
  return groups;
};

const getTotalWeeks = (projectStartDate, projectEndDate) => {
  const start = new Date(`${toDateInputValue(projectStartDate)}T00:00:00Z`);
  const end = new Date(`${toDateInputValue(projectEndDate)}T00:00:00Z`);
  const totalDays = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, Math.ceil(totalDays / 7));
};

const getWeekStartDate = (projectStartDate, weekIndex) => {
  const start = new Date(`${toDateInputValue(projectStartDate)}T00:00:00Z`);
  start.setUTCDate(start.getUTCDate() + (weekIndex * 7));
  return start;
};

const getMilestoneWeekRange = (projectStartDate, milestoneStartDate, milestoneEndDate) => {
  const projectStart = new Date(`${toDateInputValue(projectStartDate)}T00:00:00Z`);
  const milestoneStart = new Date(`${toDateInputValue(milestoneStartDate)}T00:00:00Z`);
  const milestoneEnd = new Date(`${toDateInputValue(milestoneEndDate)}T00:00:00Z`);
  return {
    startWeek: Math.floor((milestoneStart - projectStart) / (7 * 24 * 60 * 60 * 1000)) + 1,
    endWeek: Math.floor((milestoneEnd - projectStart) / (7 * 24 * 60 * 60 * 1000)) + 1
  };
};

const isRangeOverlappingMonth = (start, end, monthStart, monthEnd) => (
  start <= monthEnd && end >= monthStart
);

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [activeTab, setActiveTab] = useState('board'); // 'board' or 'calendar'
  const [calendarMode, setCalendarMode] = useState('month');
  const [calendarDate, setCalendarDate] = useState(new Date());

  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const { showToast } = useToast();

  const [milestoneForm, setMilestoneForm] = useState({ name: '', startDate: '', endDate: '', status: 'pending' });
  const [taskForm, setTaskForm] = useState({ title: '', description: '', assignedToId: '', startDate: '', dueDate: '', status: 'TODO' });

  const fetchProject = useCallback(async () => {
    try {
      const res = await api.get(`/api/projects/${id}`);
      console.log('Fetched project data:', res.data);
      setProject(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [id]);

  useEffect(() => {
    const timer = setTimeout(fetchProject, 0);
    return () => clearTimeout(timer);
  }, [fetchProject]);

  const findMilestoneByTaskId = (taskId) => (
    project?.milestones?.find(milestone => milestone.tasks?.some(task => task.id === taskId))
  );

  const getMilestoneDateBounds = (milestoneId) => {
    const milestone = project?.milestones?.find(m => m.id === milestoneId);
    return {
      min: toDateInputValue(milestone?.startDate),
      max: toDateInputValue(milestone?.endDate)
    };
  };

  const taskMilestoneId = editingTask
    ? findMilestoneByTaskId(editingTask.id)?.id || selectedMilestoneId
    : selectedMilestoneId;
  const taskDateBounds = getMilestoneDateBounds(taskMilestoneId);

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;

    const sourceDrop = readDroppableId(source.droppableId);
    const destinationDrop = readDroppableId(destination.droppableId);
    if (!sourceDrop || !destinationDrop) return;

    const { milestoneId: srcMilestoneId, status: srcStatus } = sourceDrop;
    const { milestoneId: destMilestoneId, status: destStatus } = destinationDrop;

    // Deep clone the project milestones array so React knows to re-render properly
    const newProject = {
      ...project,
      milestones: project.milestones?.map(m => ({
        ...m,
        tasks: [...(m.tasks || [])]
      })) || []
    };

    const srcMilestone = newProject.milestones.find(m => m.id === srcMilestoneId);
    const destMilestone = newProject.milestones.find(m => m.id === destMilestoneId);
    if (!srcMilestone || !destMilestone) return;

    const taskIndex = srcMilestone.tasks.findIndex(t => t.id === draggableId);
    if (taskIndex === -1) return;

    const [movedTask] = srcMilestone.tasks.splice(taskIndex, 1);
    const updatedTask = {
      ...movedTask,
      status: destStatus,
      milestoneId: destMilestoneId
    };

    const destinationTasksInStatus = destMilestone.tasks.filter(t => t.status === destStatus);
    const taskAfterDestination = destinationTasksInStatus[destination.index];
    const insertIndex = taskAfterDestination
      ? destMilestone.tasks.findIndex(t => t.id === taskAfterDestination.id)
      : destMilestone.tasks.length;

    destMilestone.tasks.splice(insertIndex, 0, updatedTask);
    setProject(newProject);

    if (srcMilestoneId === destMilestoneId && srcStatus === destStatus) {
      return;
    }

    try {
      await api.put(`/api/tasks/${draggableId}`, { status: destStatus, milestoneId: destMilestoneId });
      fetchProject();
    } catch (err) {
      showToast({ type: 'error', title: 'Gagal', message: 'Gagal update task' });
      fetchProject(); // revert
    }
  };

  const submitMilestone = async (e) => {
    e.preventDefault();
    const projectStart = toDateInputValue(project.contractStart);
    const projectEnd = toDateInputValue(project.contractEnd);
    if (milestoneForm.startDate > milestoneForm.endDate) {
      showToast({ type: 'error', title: 'Validasi Gagal', message: 'Tanggal mulai milestone tidak boleh melebihi tanggal selesai.' });
      return;
    }
    if (!isDateInRange(milestoneForm.startDate, projectStart, projectEnd) || !isDateInRange(milestoneForm.endDate, projectStart, projectEnd)) {
      showToast({ type: 'error', title: 'Validasi Gagal', message: `Tanggal milestone harus berada dalam periode project (${projectStart} sampai ${projectEnd}).` });
      return;
    }
    try {
      if (editingMilestone) {
        await api.put(`/api/projects/${id}/milestones/${editingMilestone.id}`, milestoneForm);
      } else {
        await api.post(`/api/projects/${id}/milestones`, milestoneForm);
      }
      showToast({ type: 'success', title: 'Berhasil', message: 'Milestone berhasil disimpan' });
      setShowMilestoneModal(false);
      setEditingMilestone(null);
      setMilestoneForm({ name: '', startDate: '', endDate: '', status: 'pending' });
      fetchProject();
    } catch (err) {
      showToast({ type: 'error', title: 'Gagal', message: err.response?.data?.error || 'Gagal menyimpan milestone' });
    }
  };

  const openMilestoneModal = () => {
    const latest = [...(project.milestones || [])].sort((a, b) => new Date(b.endDate || 0) - new Date(a.endDate || 0))[0];
    const start = latest?.endDate ? addDateDays(toDateInputValue(latest.endDate), 1) : toDateInputValue(project.contractStart);
    const end = [addDateDays(start, 6), toDateInputValue(project.contractEnd)].sort()[0];
    setEditingMilestone(null);
    setMilestoneForm({ name: '', startDate: start, endDate: end, status: 'pending' });
    setShowMilestoneModal(true);
  };

  const openEditMilestone = (milestone) => {
    setEditingMilestone(milestone);
    setMilestoneForm({
      name: milestone.name,
      startDate: toDateInputValue(milestone.startDate),
      endDate: toDateInputValue(milestone.endDate),
      status: milestone.status || 'pending'
    });
    setShowMilestoneModal(true);
  };

  const submitTask = async (e) => {
    e.preventDefault();
    const { min, max } = taskDateBounds;
    if (!isDateInRange(taskForm.startDate, min, max) || !isDateInRange(taskForm.dueDate, min, max)) {
      showToast({ type: 'error', title: 'Validasi Gagal', message: `Tanggal task harus berada dalam rentang milestone${min ? ` mulai ${format(new Date(min), 'dd MMM yyyy')}` : ''}${max ? ` sampai ${format(new Date(max), 'dd MMM yyyy')}` : ''}.` });
      return;
    }
    if (taskForm.startDate && taskForm.dueDate && taskForm.startDate > taskForm.dueDate) {
      showToast({ type: 'error', title: 'Validasi Gagal', message: 'Tanggal mulai task tidak boleh melebihi batas waktu.' });
      return;
    }

    try {
      if (editingTask) {
        await api.put(`/api/tasks/${editingTask.id}`, taskForm);
      } else {
        await api.post(`/api/projects/${id}/milestones/${selectedMilestoneId}/tasks`, taskForm);
      }
      showToast({ type: 'success', title: 'Berhasil', message: 'Task berhasil disimpan' });
      setShowTaskModal(false);
      setEditingTask(null);
      setTaskForm({ title: '', description: '', assignedToId: '', startDate: '', dueDate: '', status: 'TODO' });
      fetchProject();
    } catch (err) {
      showToast({ type: 'error', title: 'Gagal', message: 'Gagal menyimpan task' });
    }
  };

  const openTaskModal = (milestoneId) => {
    setEditingTask(null);
    setSelectedMilestoneId(milestoneId);
    setTaskForm({ title: '', description: '', assignedToId: '', startDate: '', dueDate: '', status: 'TODO' });
    setShowTaskModal(true);
  };

  const openEditTask = (task) => {
    const milestone = findMilestoneByTaskId(task.id);
    const bounds = getMilestoneDateBounds(milestone?.id);
    setEditingTask(task);
    setSelectedMilestoneId(milestone?.id || null);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      assignedToId: task.assignedToId || '',
      startDate: clampDate(toDateInputValue(task.startDate), bounds.min, bounds.max),
      dueDate: clampDate(toDateInputValue(task.dueDate), bounds.min, bounds.max),
      status: task.status || 'TODO'
    });
    setShowTaskModal(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Hapus task ini?')) return;
    try {
      await api.delete(`/api/projects/${id}/tasks/${taskId}`);
      showToast({ type: 'success', title: 'Berhasil', message: 'Task dihapus' });
      fetchProject();
    } catch (err) {
      showToast({ type: 'error', title: 'Gagal', message: 'Gagal menghapus task' });
    }
  };

  if (!project) return <div className="p-8 text-center text-surface-400">Loading...</div>;

  // Prepare Calendar Events
  const events = [];
  project.milestones?.forEach(m => {
    if (m.startDate && m.endDate) {
      events.push({
        id: m.id,
        title: `🚩 ${m.name}`,
        start: new Date(m.startDate),
        end: new Date(m.endDate),
        allDay: true,
        resource: 'milestone'
      });
    }
    m.tasks?.forEach(t => {
      if (t.startDate || t.dueDate) {
        const minDate = toDateInputValue(m.startDate);
        const maxDate = toDateInputValue(m.endDate);
        const startDate = clampDate(toDateInputValue(t.startDate || t.dueDate), minDate, maxDate);
        const endDate = clampDate(toDateInputValue(t.dueDate || t.startDate), minDate, maxDate);
        events.push({
          id: t.id,
          title: `✓ ${t.title}`,
          start: new Date(startDate),
          end: new Date(endDate),
          allDay: true,
          resource: 'task'
        });
      }
    });
  });

  const isAdmin = user?.role === 'ADMIN';
  const totalWeeks = getTotalWeeks(project.contractStart, project.contractEnd);
  
  const weeks = Array.from({ length: totalWeeks }, (_, index) => {
    return {
      index,
      weekNumber: index + 1,
      date: getWeekStartDate(project.contractStart, index),
      key: index
    };
  });
  const monthGroups = weeks.length > 0 ? buildMonthGroups(weeks) : [];

  const today = toDateInputValue(new Date().toISOString());
  const withinProjectToday = isDateInRange(today, toDateInputValue(project.contractStart), toDateInputValue(project.contractEnd));
  const todayWeek = withinProjectToday ? getMilestoneWeekRange(project.contractStart, today, today).startWeek : null;
  const year = calendarDate.getFullYear();
  const monthSummaries = Array.from({ length: 12 }, (_, monthIndex) => {
    const monthStart = new Date(year, monthIndex, 1);
    const monthEnd = new Date(year, monthIndex + 1, 0);
    const milestones = project.milestones?.filter(m => {
      if (!m.startDate && !m.endDate) return false;
      const start = new Date(m.startDate || m.endDate);
      const end = new Date(m.endDate || m.startDate);
      return isRangeOverlappingMonth(start, end, monthStart, monthEnd);
    }) || [];
    const tasks = milestones.flatMap(m => (
      m.tasks?.filter(t => {
        if (!t.startDate && !t.dueDate) return false;
        const start = new Date(t.startDate || t.dueDate);
        const end = new Date(t.dueDate || t.startDate);
        return isRangeOverlappingMonth(start, end, monthStart, monthEnd);
      }) || []
    ));
    return { monthStart, milestones, tasks };
  });

  const navigateCalendar = (direction) => {
    setCalendarDate(current => {
      const next = new Date(current);
      if (calendarMode === 'year') {
        next.setFullYear(current.getFullYear() + direction);
      } else {
        next.setMonth(current.getMonth() + direction);
      }
      return next;
    });
  };

  return (
    <div className="animate-fade-in flex flex-col h-[calc(100vh-6rem)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 shrink-0">
        <div>
          <Link to={isAdmin ? "/admin/projects" : "/member"} className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1 mb-2">
            <ArrowLeft size={14} /> Kembali
          </Link>
          <h2 className="text-2xl font-bold text-white">{project.name}</h2>
          <p className="text-sm text-surface-400 mt-1">{project.description}</p>
          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs">
            <div className="flex items-center gap-1.5 bg-surface-800/50 px-2 py-1 rounded-lg border border-white/[0.05]">
              <span className="text-surface-500">Project Start - End:</span>
              <span className="text-with font-medium">{project.contractStart && project.contractEnd ? `${toDateInputValue(project.contractStart)} to ${toDateInputValue(project.contractEnd)}` : '-'}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-surface-800/50 px-2 py-1 rounded-lg border border-white/[0.05]">
              <span className="text-surface-500">Customer Company:</span>
              <span className="text-white font-medium">{project.customer || '-'}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-surface-800/50 px-2 py-1 rounded-lg border border-white/[0.05]">
              <span className="text-surface-500">Customer PIC:</span>
              <span className="text-white font-medium">{project.customerName || '-'}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-surface-800/50 px-2 py-1 rounded-lg border border-white/[0.05]">
              <span className="text-surface-500">WO Number:</span>
              <span className="text-white font-medium">{project.woNumber || '-'}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-surface-800/50 px-2 py-1 rounded-lg border border-white/[0.05]">
              <span className="text-surface-500">PM:</span>
              <span className="text-brand-300 font-medium">{project.projectManager?.name || '-'}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 p-1 bg-surface-900 rounded-xl border border-surface-800">
          <button
            onClick={() => setActiveTab('board')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${activeTab === 'board' ? 'bg-surface-800 text-white shadow-sm' : 'text-surface-400 hover:text-white'}`}
          >
            <LayoutDashboard size={16} /> Board
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${activeTab === 'calendar' ? 'bg-surface-800 text-white shadow-sm' : 'text-surface-400 hover:text-white'}`}
          >
            <CalendarIcon size={16} /> Calendar
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'board' ? (
          <div className="flex-1 pr-2 pb-8 custom-scrollbar space-y-8 overflow-y-auto">
            {isAdmin && (
              <button onClick={openMilestoneModal} className="btn-ghost border border-dashed border-surface-600 text-surface-400 w-full py-4 rounded-xl flex items-center justify-center gap-2 hover:border-brand-500 hover:text-brand-400 transition-colors">
                <Plus size={18} /> Tambah Milestone
              </button>
            )}

            <div className="glass-card p-5 space-y-4">
              <div>
                <h3 className="text-base font-semibold text-white">Project Milestone Timeline</h3>
                <p className="text-xs text-surface-400 mt-1">Timeline mingguan dihitung dari tanggal mulai project.</p>
              </div>
              <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
                <div className="min-w-max p-4 space-y-2">
                  <div className="flex">
                    <div className="w-60 shrink-0 px-3 py-3 text-xs font-semibold uppercase text-surface-400">Milestone</div>
                      <div>
                        <div className="grid border-b border-white/[0.06]" style={{ gridTemplateColumns: `repeat(${totalWeeks}, minmax(55px, 1fr))` }}>
                          {monthGroups.map((group) => (
                            <div
                              key={group.label}
                              className="text-center text-[10px] font-semibold py-1.5 text-surface-300 border-l border-white/[0.06]"
                              style={{ gridColumn: `span ${group.span}` }}
                            >
                              {group.label}
                            </div>
                          ))}
                        </div>
                        <div className="grid border-b border-white/[0.06]" style={{ gridTemplateColumns: `repeat(${totalWeeks}, minmax(55px, 1fr))` }}>
                          {weeks.map((week) => (
                            <div
                              key={week.key}
                              className={`text-center text-[10px] py-1.5 border-l border-white/[0.06] ${todayWeek === week.weekNumber ? 'text-brand-300 bg-brand-500/10' : 'text-surface-400'}`}
                            >
                              W{week.weekNumber}
                            </div>
                          ))}
                        </div>
                        <div className="grid" style={{ gridTemplateColumns: `repeat(${totalWeeks}, minmax(55px, 1fr))` }}>
                          {weeks.map((week) => (
                            <div
                              key={week.key}
                              className={`text-center text-xs font-bold py-1.5 border-l border-white/[0.06] ${todayWeek === week.weekNumber ? 'text-brand-300 bg-brand-500/10' : 'text-surface-300'}`}
                            >
                              {formatTwoDigitDay(week.date)}
                              {todayWeek === week.weekNumber && <span className="block text-[8px] text-brand-400 mt-0.5 font-normal">Today</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                  </div>
                  {project.milestones?.map(milestone => {
                    if (!milestone.startDate || !milestone.endDate) return null;
                    const { startWeek, endWeek } = getMilestoneWeekRange(project.contractStart, milestone.startDate, milestone.endDate);
                    const barColor = milestone.status === 'completed'
                      ? 'bg-emerald-500/80'
                      : milestone.status === 'active'
                        ? 'bg-brand-500/80'
                        : 'bg-amber-500/80';
                    return (
                      <div key={milestone.id}>
                        <div className="flex items-center">
                          <div className="w-60 shrink-0 px-3 py-3">
                            <p className="text-sm font-medium text-white">{milestone.name}</p>
                            <p className="text-[11px] text-surface-500">{format(new Date(milestone.startDate), 'dd MMM yyyy')} - {format(new Date(milestone.endDate), 'dd MMM yyyy')}</p>
                          </div>
                          <div className="grid items-center min-h-[54px]" style={{ gridTemplateColumns: `repeat(${totalWeeks}, minmax(55px, 1fr))` }}>
                            <div
                              title={`${milestone.name}: ${format(new Date(milestone.startDate), 'dd MMM yyyy')} - ${format(new Date(milestone.endDate), 'dd MMM yyyy')}`}
                              className={`h-8 rounded-lg mx-2 flex items-center px-3 text-xs font-medium text-white shadow-sm ${barColor}`}
                              style={{ gridColumn: `${startWeek} / ${endWeek + 1}` }}
                            >
                              {milestone.name}
                            </div>
                          </div>
                        </div>
                        {milestone.tasks?.filter(task => task.startDate || task.dueDate).map(task => {
                          const taskStart = task.startDate || task.dueDate;
                          const taskEnd = task.dueDate || task.startDate;
                          const range = getMilestoneWeekRange(project.contractStart, taskStart, taskEnd);
                          return (
                            <div key={task.id} className="flex items-center bg-white/[0.01]">
                              <div className="w-60 shrink-0 px-6 py-2">
                                <p className="text-xs text-surface-300">{task.title}</p>
                                <p className="text-[10px] text-surface-500">Task</p>
                              </div>
                              <div className="grid items-center min-h-[40px]" style={{ gridTemplateColumns: `repeat(${totalWeeks}, minmax(55px, 1fr))` }}>
                                <div className="h-5 rounded-md mx-3 bg-surface-500/70" style={{ gridColumn: `${range.startWeek} / ${range.endWeek + 1}` }} title={task.title} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                  {!project.milestones?.length && <p className="text-sm text-surface-500 text-center py-8">Belum ada milestone untuk ditampilkan.</p>}
                </div>
              </div>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
              {project.milestones?.map(milestone => (
                <div key={milestone.id} className="glass-card p-5">
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/[0.05]">
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-500"></span>
                        {milestone.name}
                      </h3>
                      {milestone.startDate && milestone.endDate && (
                        <p className="text-xs text-surface-400 mt-1 flex items-center gap-1">
                          <Clock size={12} /> {format(new Date(milestone.startDate), 'dd MMM')} - {format(new Date(milestone.endDate), 'dd MMM yyyy')}
                        </p>
                      )}
                    </div>
                    {isAdmin && (
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEditMilestone(milestone)} className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1"><Pencil size={13} /> Edit</button>
                        <button onClick={() => openTaskModal(milestone.id)} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1">
                          <Plus size={14} /> Task
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {COLUMNS.map(col => (
                      <Droppable key={`${milestone.id}-${col.id}`} droppableId={makeDroppableId(milestone.id, col.id)}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`rounded-xl p-3 border min-h-[150px] transition-colors ${col.color} ${snapshot.isDraggingOver ? 'ring-2 ring-brand-500/50' : ''}`}
                          >
                            <h4 className="text-xs font-semibold text-surface-300 uppercase tracking-wider mb-3 px-1">{col.title}</h4>
                            <div className="space-y-2">
                              {milestone.tasks?.filter(t => t.status === col.id).map((task, index) => (
                                <Draggable key={task.id} draggableId={task.id} index={index}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={`p-3 rounded-lg bg-surface-900 border border-white/[0.05] shadow-sm group ${snapshot.isDragging ? 'shadow-brand-500/20 ring-1 ring-brand-500' : 'hover:border-white/[0.1]'} transition-all`}
                                    >
                                      <div className="flex justify-between items-start mb-2">
                                        <p className="text-sm font-medium text-white">{task.title}</p>
                                        {(isAdmin || user?.id === task.assignedToId) && (
                                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex">
                                            <button onClick={() => openEditTask(task)} className="p-1 text-surface-400 hover:text-brand-400">
                                              <Pencil size={12} />
                                            </button>
                                            {isAdmin && (
                                              <button onClick={() => handleDeleteTask(task.id)} className="p-1 text-surface-400 hover:text-rose-400">
                                                <Trash2 size={12} />
                                              </button>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                      {task.assignedTo && (
                                        <div className="flex items-center gap-1.5 text-xs text-surface-400">
                                          <div className="w-5 h-5 rounded-full gradient-brand flex items-center justify-center text-[9px] font-bold text-white">
                                            {task.assignedTo.name.charAt(0).toUpperCase()}
                                          </div>
                                          <span className="truncate">{task.assignedTo.name}</span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          </div>
                        )}
                      </Droppable>
                    ))}
                  </div>
                </div>
              ))}
              {project.milestones?.length === 0 && (
                <div className="text-center py-12 text-surface-400">
                  Belum ada milestone di project ini.
                </div>
              )}
            </DragDropContext>
          </div>
        ) : (
          <div className="flex-1 glass-card p-4 overflow-hidden flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => navigateCalendar(-1)} className="p-2 rounded-lg border border-surface-700 text-surface-300 hover:text-white hover:bg-surface-800">
                  <ChevronLeft size={16} />
                </button>
                <button type="button" onClick={() => setCalendarDate(new Date())} className="px-3 py-2 rounded-lg border border-surface-700 text-sm text-surface-300 hover:text-white hover:bg-surface-800">
                  Hari ini
                </button>
                <button type="button" onClick={() => navigateCalendar(1)} className="p-2 rounded-lg border border-surface-700 text-surface-300 hover:text-white hover:bg-surface-800">
                  <ChevronRight size={16} />
                </button>
                <h3 className="text-sm font-semibold text-white ml-1">
                  {calendarMode === 'year' ? year : format(calendarDate, 'MMMM yyyy', { locale: idLocale })}
                </h3>
              </div>
              <div className="flex gap-1 p-1 bg-surface-900 rounded-xl border border-surface-800">
                <button type="button" onClick={() => setCalendarMode('month')} className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${calendarMode === 'month' ? 'bg-surface-800 text-white' : 'text-surface-400 hover:text-white'}`}>
                  Bulan
                </button>
                <button type="button" onClick={() => setCalendarMode('year')} className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${calendarMode === 'year' ? 'bg-surface-800 text-white' : 'text-surface-400 hover:text-white'}`}>
                  Tahun
                </button>
              </div>
            </div>

            {calendarMode === 'month' ? (
              <div className="flex-1 overflow-hidden [&_.rbc-calendar]:text-sm [&_.rbc-toolbar]:hidden [&_.rbc-event]:bg-brand-500 [&_.rbc-event]:rounded-md [&_.rbc-today]:bg-surface-800/50 [&_.rbc-off-range-bg]:bg-surface-900/30 [&_.rbc-header]:py-2 [&_.rbc-header]:border-white/[0.05] [&_.rbc-month-view]:border-white/[0.05] [&_.rbc-day-bg]:border-white/[0.05] [&_.rbc-month-row]:border-white/[0.05]">
                <Calendar
                  localizer={localizer}
                  events={events}
                  startAccessor="start"
                  endAccessor="end"
                  culture="id"
                  date={calendarDate}
                  view="month"
                  views={['month']}
                  onNavigate={setCalendarDate}
                  eventPropGetter={(event) => ({
                    className: event.resource === 'milestone' ? '!bg-amber-600 !border-amber-700' : '!bg-brand-500 !border-brand-600'
                  })}
                />
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto custom-scrollbar grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pr-2">
                {monthSummaries.map(({ monthStart, milestones, tasks }) => (
                  <div key={monthStart.toISOString()} className="rounded-xl border border-surface-800 bg-surface-900/60 p-4 min-h-[170px]">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-white">{format(monthStart, 'MMMM', { locale: idLocale })}</h4>
                      <span className="text-[11px] text-surface-500">{milestones.length} milestone</span>
                    </div>
                    <div className="space-y-2">
                      {milestones.slice(0, 4).map(milestone => (
                        <div key={milestone.id} className="rounded-lg border border-amber-700/40 bg-amber-900/20 p-2">
                          <p className="text-xs font-medium text-amber-100 truncate">{milestone.name}</p>
                          <p className="text-[11px] text-amber-200/70 mt-1">
                            {toDateInputValue(milestone.startDate) || '-'} - {toDateInputValue(milestone.endDate) || '-'}
                          </p>
                        </div>
                      ))}
                      {milestones.length === 0 && (
                        <p className="text-xs text-surface-500 py-6 text-center">Tidak ada milestone</p>
                      )}
                    </div>
                    {tasks.length > 0 && (
                      <div className="mt-3 text-[11px] text-brand-200">
                        {tasks.length} task dalam bulan ini
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals for Milestone and Task */}
      {showMilestoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md glass-card-light p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-white">{editingMilestone ? 'Edit Milestone' : 'Tambah Milestone'}</h3>
              <button onClick={() => setShowMilestoneModal(false)} className="p-1 text-surface-400 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={submitMilestone} className="space-y-4">
              <div>
                <label className="block text-sm text-surface-300 mb-1">Nama Milestone *</label>
                <input type="text" required className="input-dark text-sm" value={milestoneForm.name} onChange={e => setMilestoneForm({ ...milestoneForm, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-surface-300 mb-1">Mulai</label>
                  <input type="date" min={toDateInputValue(project.contractStart)} max={toDateInputValue(project.contractEnd)} className="input-dark text-sm" value={milestoneForm.startDate} onChange={e => setMilestoneForm({ ...milestoneForm, startDate: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm text-surface-300 mb-1">Selesai</label>
                  <input type="date" min={milestoneForm.startDate || toDateInputValue(project.contractStart)} max={toDateInputValue(project.contractEnd)} className="input-dark text-sm" value={milestoneForm.endDate} onChange={e => setMilestoneForm({ ...milestoneForm, endDate: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm text-surface-300 mb-1">Status</label>
                <AppSelect value={milestoneForm.status} onChange={value => setMilestoneForm({ ...milestoneForm, status: value })} options={[['pending', 'Pending'], ['active', 'In Progress'], ['completed', 'Completed']]} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowMilestoneModal(false)} className="flex-1 btn-ghost text-sm">Batal</button>
                <button type="submit" className="flex-1 btn-primary text-sm">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md glass-card-light p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-white">{editingTask ? 'Edit Task' : 'Tambah Task'}</h3>
              <button onClick={() => setShowTaskModal(false)} className="p-1 text-surface-400 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={submitTask} className="space-y-4">
              <div>
                <label className="block text-sm text-surface-300 mb-1">Judul Task *</label>
                <input type="text" required className="input-dark text-sm" value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-surface-300 mb-1">Status</label>
                  <AppSelect value={taskForm.status} onChange={value => setTaskForm({ ...taskForm, status: value })} options={COLUMNS.map(col => [col.id, col.title])} />
                </div>
                <div>
                  <label className="block text-sm text-surface-300 mb-1">Assign Ke</label>
                  <AppSelect value={taskForm.assignedToId} onChange={value => setTaskForm({ ...taskForm, assignedToId: value })} options={[['', 'Tidak ada'], ...(project.members?.map(m => [m.userId, m.user.name]) || [])]} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-surface-300 mb-1">Mulai</label>
                  <input type="date" className="input-dark text-sm" min={taskDateBounds.min} max={taskDateBounds.max} value={taskForm.startDate} onChange={e => setTaskForm({ ...taskForm, startDate: clampDate(e.target.value, taskDateBounds.min, taskDateBounds.max) })} />
                </div>
                <div>
                  <label className="block text-sm text-surface-300 mb-1">Batas Waktu</label>
                  <input type="date" className="input-dark text-sm" min={taskDateBounds.min || taskForm.startDate} max={taskDateBounds.max} value={taskForm.dueDate} onChange={e => setTaskForm({ ...taskForm, dueDate: clampDate(e.target.value, taskDateBounds.min, taskDateBounds.max) })} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowTaskModal(false)} className="flex-1 btn-ghost text-sm">Batal</button>
                <button type="submit" className="flex-1 btn-primary text-sm">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
