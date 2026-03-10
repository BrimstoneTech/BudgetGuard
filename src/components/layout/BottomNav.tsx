import React from 'react';
import { Home, PieChart, ShieldCheck, Settings } from 'lucide-react';
import { cn } from '../../utils/theme';

export type TabType = 'dashboard' | 'analytics' | 'savings' | 'settings';

interface BottomNavProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
    const tabs = [
        { id: 'dashboard' as TabType, label: 'Home', icon: Home },
        { id: 'analytics' as TabType, label: 'Analytics', icon: PieChart },
        { id: 'savings' as TabType, label: 'Savings', icon: ShieldCheck },
        { id: 'settings' as TabType, label: 'Settings', icon: Settings },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-[var(--bg-secondary)]/90 backdrop-blur-lg border-t border-[var(--border-color)] px-6 py-3 pb-8 z-50 flex items-center justify-around shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.05)]">
            {tabs.map(({ id, label, icon: Icon }) => (
                <button
                    key={id}
                    onClick={() => onTabChange(id)}
                    className={cn(
                        "flex flex-col items-center gap-1 transition-all duration-300 relative group",
                        activeTab === id ? "text-[var(--text-primary)] scale-105" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    )}
                >
                    <div className={cn(
                        "p-2 rounded-xl transition-all duration-300",
                        activeTab === id ? "bg-[var(--bg-primary)] shadow-sm" : "bg-transparent"
                    )}>
                        <Icon size={24} strokeWidth={activeTab === id ? 2.5 : 2} />
                    </div>
                    <span className={cn(
                        "text-[10px] font-bold uppercase tracking-widest transition-opacity duration-300",
                        activeTab === id ? "opacity-100" : "opacity-60"
                    )}>
                        {label}
                    </span>
                    {activeTab === id && (
                        <div className="absolute -top-3 w-1.5 h-1.5 bg-zinc-900 rounded-full animate-in fade-in zoom-in duration-300" />
                    )}
                </button>
            ))}
        </nav>
    );
};
