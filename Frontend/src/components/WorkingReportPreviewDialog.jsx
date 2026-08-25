import { useEffect, useState } from 'react';
import { FileText, Loader2, MessageSquare, X } from 'lucide-react';
import { format } from 'date-fns';
import api from '../lib/api';
import SortableHeader from './SortableHeader';
import Pagination from './Pagination';
import useTableSort from '../hooks/useTableSort';

const WorkingReportPreviewDialog = ({ open, onClose, reportData, onEditComment }) => {
  const [detail, setDetail] = useState({ report: null, attendances: [] });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState({ pageNo: 1, pageSize: 10, totalPages: 1 });

  const { sortBy, sortOrder, handleSort } = useTableSort('date', 'asc');

  useEffect(() => {
    const fetchDetail = async () => {
      if (!open || !reportData) return;
      try {
        setLoading(true);
        const res = await api.get(`/api/working-reports/${reportData.userId}/${reportData.month}/${reportData.year}`, {
          params: { sortBy, sortOrder, pageNo: page.pageNo, pageSize: page.pageSize }
        });
        setDetail(res.data);
        if (res.data.totalRecords !== undefined) {
          setPage(current => ({ ...current, totalPages: Math.ceil(res.data.totalRecords / current.pageSize) }));
        }
      } catch {
        setDetail({ report: null, attendances: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [open, reportData, sortBy, sortOrder, page.pageNo, page.pageSize]);

  if (!open) return null;

  const currentReport = detail.report || reportData;
  const currentComment = detail.report?.rejectionReason || reportData?.rejectionReason;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col glass-card-light animate-scale-in overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-brand-400" />
            <h3 className="text-sm font-semibold text-white">
              Preview Working Report - {reportData?.user?.name} ({String(reportData?.month).padStart(2, '0')}/{reportData?.year})
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-surface-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {currentComment ? (
            <div className="mb-4 p-3 rounded-xl bg-surface-800/80 border border-white/10 text-sm flex items-start justify-between gap-3">
              <div>
                <span className="font-semibold text-white">Catatan / Alasan: </span>
                <span className="text-surface-300">{currentComment}</span>
              </div>
              {onEditComment && currentReport && (
                <button
                  type="button"
                  onClick={() => onEditComment(currentReport)}
                  className="badge-warning text-xs inline-flex items-center gap-1 shrink-0"
                >
                  <MessageSquare size={12} />
                  Edit Catatan
                </button>
              )}
            </div>
          ) : onEditComment && currentReport ? (
            <div className="mb-4 flex justify-end">
              <button
                type="button"
                onClick={() => onEditComment(currentReport)}
                className="badge-warning text-xs inline-flex items-center gap-1"
              >
                <MessageSquare size={12} />
                + Tambah Catatan
              </button>
            </div>
          ) : null}
          <div className="glass-card overflow-hidden">
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
                {(detail.attendances || []).length === 0 && (
                  <div className="py-12 text-center text-sm text-surface-400">
                    Tidak ada attendance pada periode ini
                  </div>
                )}
              </div>
            )}

            {detail.attendances.length > 0 && (
              <div className="p-4 border-t border-white/[0.06] flex justify-end">
                <Pagination
                  page={page}
                  doSearch={(p, s) => setPage(current => ({ ...current, pageNo: p, pageSize: s }))}
                />
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default WorkingReportPreviewDialog;
