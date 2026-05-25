import { Loader2, X } from 'lucide-react';

const ConfirmDialog = ({
  open,
  title = 'Konfirmasi',
  message,
  confirmLabel = 'Konfirmasi',
  cancelLabel = 'Batal',
  tone = 'brand',
  loading = false,
  onConfirm,
  onCancel
}) => {
  if (!open) return null;

  const buttonClass = tone === 'danger'
    ? 'bg-rose-600 hover:bg-rose-500 text-white'
    : 'btn-primary';

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-md glass-card-light p-6 animate-scale-in">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            {message && <p className="text-sm text-surface-400 mt-1">{message}</p>}
          </div>
          <button onClick={onCancel} className="p-1 text-surface-400 hover:text-white" disabled={loading}>
            <X size={20} />
          </button>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onCancel} className="flex-1 btn-ghost text-sm text-center" disabled={loading}>
            {cancelLabel}
          </button>
          <button type="button" onClick={onConfirm} disabled={loading} className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${buttonClass}`}>
            {loading && <Loader2 size={15} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
