import { AlertCircle, CheckCircle, Info } from 'lucide-react';

const toneConfig = {
  success: {
    icon: CheckCircle,
    className: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
  },
  error: {
    icon: AlertCircle,
    className: 'bg-rose-500/10 border-rose-500/20 text-rose-400'
  },
  info: {
    icon: Info,
    className: 'bg-brand-500/10 border-brand-500/20 text-brand-300'
  }
};

const AppAlert = ({ tone = 'info', message, className = '' }) => {
  if (!message) return null;

  const config = toneConfig[tone] || toneConfig.info;
  const Icon = config.icon;

  return (
    <div className={`p-4 border rounded-xl flex items-center gap-3 animate-slide-down ${config.className} ${className}`}>
      <Icon size={20} className="flex-shrink-0" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};

export default AppAlert;
