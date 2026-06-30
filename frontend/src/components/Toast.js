import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: {
      bg: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-500/30',
      text: 'text-emerald-800 dark:text-emerald-200',
      icon: CheckCircle2,
      iconColor: 'text-emerald-500',
    },
    error: {
      bg: 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-500/30',
      text: 'text-red-800 dark:text-red-200',
      icon: XCircle,
      iconColor: 'text-red-500',
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-500/30',
      text: 'text-amber-800 dark:text-amber-200',
      icon: AlertTriangle,
      iconColor: 'text-amber-500',
    },
    info: {
      bg: 'bg-sky-50 border-sky-200 dark:bg-sky-950/20 dark:border-sky-500/30',
      text: 'text-sky-800 dark:text-sky-200',
      icon: Info,
      iconColor: 'text-sky-500',
    },
  };

  const style = config[type] || config.info;
  const Icon = style.icon;

  return (
    <div className={`p-4 rounded-xl border flex items-center gap-3 shadow-lg transition-all duration-300 animate-slide-in ${style.bg} ${style.text} max-w-sm w-full`}>
      <Icon className={`w-5 h-5 shrink-0 ${style.iconColor}`} />
      <div className="text-xs font-semibold flex-1">{message}</div>
      <button onClick={onClose} className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all text-current opacity-70 hover:opacity-100">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default Toast;
