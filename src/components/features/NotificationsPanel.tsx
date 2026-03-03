import React from 'react';
import { CheckCircle, Trash2, X } from 'lucide-react';
import { useBudget } from '../../context/BudgetContext';
import { cn } from '../../utils/theme';
import { format } from 'date-fns';

export const NotificationsPanel = ({ onClose }: { onClose: () => void }) => {
    const { notifications, setNotifications } = useBudget();

    const markAsRead = (id: number) => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const dismissNotification = (id: number) => {
        setNotifications(notifications.filter(n => n.id !== id));
    };

    return (
        <div className="fixed top-20 right-6 z-[60] w-80 bg-white border border-zinc-200 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-top-4 duration-300">
            <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Notifications</h3>
                <button onClick={onClose} className="p-1 hover:bg-zinc-200 rounded-full transition-colors">
                    <X size={14} />
                </button>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="text-xs text-zinc-400">No new notifications</p>
                    </div>
                ) : (
                    <div className="divide-y divide-zinc-50">
                        {notifications.map(n => (
                            <div key={n.id} className={cn("p-4 transition-colors relative group", n.read ? "bg-white" : "bg-zinc-50/50")}>
                                <div className="flex gap-3">
                                    <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", {
                                        "bg-rose-500": n.type === 'critical',
                                        "bg-amber-500": n.type === 'warning',
                                        "bg-emerald-500": n.type === 'success',
                                        "bg-zinc-400": n.type === 'info',
                                    })} />
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-zinc-900">{n.title}</p>
                                        <p className="text-[11px] text-zinc-600 leading-relaxed">{n.message}</p>
                                        <p className="text-[9px] text-zinc-400 uppercase font-bold">{format(n.date, 'HH:mm')}</p>
                                    </div>
                                </div>
                                <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {!n.read && (
                                        <button onClick={() => markAsRead(n.id)} className="p-1 hover:bg-zinc-200 rounded-full text-zinc-400 hover:text-emerald-600">
                                            <CheckCircle size={12} />
                                        </button>
                                    )}
                                    <button onClick={() => dismissNotification(n.id)} className="p-1 hover:bg-zinc-200 rounded-full text-zinc-400 hover:text-rose-600">
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
