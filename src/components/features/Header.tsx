import React from 'react';
import { ShieldAlert, Bell, History, Settings, Eye, EyeOff } from 'lucide-react';
import { useBudget } from '../../context/BudgetContext';
import { CURRENCIES } from '../../utils/currency';

export const Header = ({ onToggleNotifications, unreadCount }: { onToggleNotifications: () => void, unreadCount: number }) => {
    const { displayCurrency, setDisplayCurrency, privacyMode, togglePrivacyMode } = useBudget();

    return (
        <header className="sticky top-0 z-50 bg-[var(--bg-secondary)]/80 backdrop-blur-md border-b border-[var(--border-color)] px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[var(--accent-primary)] rounded-xl flex items-center justify-center text-[var(--bg-secondary)]">
                        <ShieldAlert size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">BudgetGuard</h1>
                        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Offline-First</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={togglePrivacyMode}
                        className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-500"
                        title={privacyMode ? "Show balances" : "Hide balances"}
                    >
                        {privacyMode ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                    <select
                        value={displayCurrency}
                        onChange={(e) => setDisplayCurrency(e.target.value)}
                        className="px-3 py-1.5 bg-zinc-100 border border-zinc-200 rounded-lg text-xs font-bold focus:outline-none"
                    >
                        {CURRENCIES.map(c => (
                            <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
                        ))}
                    </select>
                    <button
                        onClick={onToggleNotifications}
                        className="p-2 hover:bg-zinc-100 rounded-full transition-colors relative"
                    >
                        <Bell size={20} className="text-zinc-500" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                                {unreadCount}
                            </span>
                        )}
                    </button>
                    <button className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                        <History size={20} className="text-zinc-500" />
                    </button>
                    <button className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                        <Settings size={20} className="text-zinc-500" />
                    </button>
                    <div className="w-8 h-8 rounded-full bg-zinc-200 border border-zinc-300" />
                </div>
            </div>
        </header>
    );
};
