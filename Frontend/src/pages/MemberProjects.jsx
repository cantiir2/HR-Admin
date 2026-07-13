import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { FolderKanban, MapPin, Calendar, Users, LayoutDashboard } from 'lucide-react';
import { format } from 'date-fns';
import Pagination from '../components/Pagination';

const statusColors = {
  active: 'badge-success',
  completed: 'badge-info',
  delayed: 'badge-danger',
  cancelled: 'badge-danger',
  planning: 'badge-warning'
};

const MemberProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState({ pageNo: 1, pageSize: 10, totalRows: 0, totalPages: 0 });

  const pageSizeRef = useRef(10);

  useEffect(() => {
    fetchProjects(1, pageSizeRef.current);
  }, []);

  const fetchProjects = async (pageNo = 1, pageSize = pageSizeRef.current) => {
    try {
      pageSizeRef.current = pageSize;
      setLoading(true);
      const res = await api.get(`/api/projects/my-projects?pageNo=${pageNo}&pageSize=${pageSize}`);
      setProjects(res.data.data || []);
      setPage(res.data.page || { pageNo, pageSize, totalRows: 0, totalPages: 0 });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const doSearch = (pageNo, pageSize) => {
    fetchProjects(pageNo, pageSize);
  };

  const changePageSize = (pageSize) => {
    pageSizeRef.current = pageSize;
    setPage(prev => ({
      ...prev,
      pageNo: 1,
      pageSize
    }));
  };

  return (
    <div className="animate-fade-in max-w-7xl mx-auto pb-8">
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FolderKanban className="text-brand-400" />
            Project Saya
          </h2>
          <p className="text-sm text-surface-400 mt-1">
            Daftar project di mana Anda ditugaskan sebagai anggota.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {!loading && projects.map(project => (
          <div key={project.id} className="glass-card p-5 hover:border-white/[0.15] transition-all flex flex-col">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-brand-500/10">
                  <FolderKanban size={16} className="text-brand-400" />
                </div>
                <h3 className="font-semibold text-white text-sm line-clamp-1" title={project.name}>{project.name}</h3>
              </div>
              <span className={statusColors[project.status] || 'badge-info'}>{project.status}</span>
            </div>

            {project.description && (
              <p className="text-xs text-surface-400 mb-3 line-clamp-2 min-h-[2rem]">{project.description}</p>
            )}

            <div className="mb-3 p-2 rounded-lg bg-surface-800/50 border border-white/[0.05]">
              <div className="flex justify-between items-center text-[11px] mb-1">
                <span className="text-surface-500">Customer Company</span>
                <span className="text-white font-medium truncate ml-2" title={project.customer || '-'}>{project.customer || '-'}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] mb-1">
                <span className="text-surface-500">Customer PIC</span>
                <span className="text-white font-medium truncate ml-2" title={project.customerName || '-'}>{project.customerName || '-'}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] mb-1">
                <span className="text-surface-500">WO Number</span>
                <span className="text-white font-medium truncate ml-2" title={project.woNumber || '-'}>{project.woNumber || '-'}</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-surface-500">Project Manager</span>
                <span className="text-brand-300 font-medium truncate ml-2" title={project.projectManager?.name || '-'}>{project.projectManager?.name || '-'}</span>
              </div>
            </div>

            <div className="space-y-1.5 mb-4 mt-auto">
              {project.location && (
                <div className="flex items-center gap-2 text-xs text-surface-400">
                  <MapPin size={12} /> <span className="truncate">{project.location}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-xs text-surface-400">
                <Calendar size={12} />
                {format(new Date(project.contractStart), 'MM/dd/yy')} — {format(new Date(project.contractEnd), 'MM/dd/yy')}
              </div>
              <div className="flex items-center gap-2 text-xs text-surface-400">
                <Users size={12} /> {project.members?.length || 0} anggota
              </div>
            </div>

            <div className="flex gap-2 mt-4 pt-4 border-t border-white/[0.05]">
              <Link to={`/member/projects/${project.id}`} className="flex-1 btn-primary text-xs text-center flex items-center justify-center gap-1">
                <LayoutDashboard size={12} /> Lihat Detail Project
              </Link>
            </div>
          </div>
        ))}

        {loading && (
          <div className="col-span-full text-center py-16 text-surface-400 text-sm">Memuat project...</div>
        )}

        {!loading && projects.length === 0 && (
          <div className="col-span-full text-center py-16 glass-card">
            <FolderKanban size={32} className="mx-auto text-surface-500 mb-3" />
            <p className="text-white font-medium mb-1">Tidak Ada Project</p>
            <p className="text-surface-400 text-sm">Anda belum ditugaskan ke project manapun.</p>
          </div>
        )}
      </div>

      {page.totalRows > 0 && !loading && (
        <div className="mt-6 glass-card p-4">
          <Pagination
            page={page}
            doSearch={doSearch}
            changePageSize={changePageSize}
            hideGoToPage={false}
          />
        </div>
      )}
    </div>
  );
};

export default MemberProjects;
