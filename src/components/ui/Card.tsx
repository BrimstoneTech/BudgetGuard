import React from 'react';
import { cn } from '../../utils/theme';

export const Card = ({ children, className, title }: { children: React.ReactNode, className?: string, title?: string }) => (
    <div className={cn("bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl overflow-hidden shadow-sm", className)}>
        {title && (
            <div className="px-4 py-3 border-b border-[var(--border-color)] bg-[var(--bg-primary)] flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">{title}</h3>
            </div>
        )}
        <div className="p-4">{children}</div>
    </div>
);
