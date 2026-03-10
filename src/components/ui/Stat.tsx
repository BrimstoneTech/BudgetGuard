import React from 'react';
import { Card } from './Card';
import { cn } from '../../utils/theme';

interface StatProps {
    label: string;
    value: string;
    subValue?: string;
    icon: any;
    trend?: number;
    color?: 'emerald' | 'amber' | 'rose' | 'zinc';
}

export const Stat = ({ label, value, subValue, icon: Icon, trend, color = "zinc" }: StatProps) => (
    <Card className="flex-1">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-xs font-medium text-[var(--text-secondary)] mb-1 uppercase tracking-tight">{label}</p>
                <h4 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">{value}</h4>
                {subValue && <p className="text-xs text-[var(--text-secondary)] mt-1">{subValue}</p>}
            </div>
            <div className={cn("p-2 rounded-lg", {
                "bg-emerald-500/10 text-emerald-500": color === "emerald",
                "bg-amber-500/10 text-amber-500": color === "amber",
                "bg-rose-500/10 text-rose-500": color === "rose",
                "bg-[var(--bg-primary)] text-[var(--text-secondary)]": color === "zinc",
            })}>
                <Icon size={20} />
            </div>
        </div>
        {trend !== undefined && (
            <div className="mt-4 flex items-center gap-1">
                <span className={cn("text-xs font-medium", trend > 0 ? "text-emerald-600" : "text-rose-600")}>
                    {trend > 0 ? "+" : ""}{trend}%
                </span>
                <span className="text-xs text-zinc-400">vs last month</span>
            </div>
        )}
    </Card>
);
