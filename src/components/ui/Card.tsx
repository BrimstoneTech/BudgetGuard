import React from 'react';
import { cn } from '../../utils/theme';

export const Card = ({ children, className, title }: { children: React.ReactNode, className?: string, title?: string }) => (
    <div className={cn("bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm", className)}>
        {title && (
            <div className="px-4 py-3 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{title}</h3>
            </div>
        )}
        <div className="p-4">{children}</div>
    </div>
);
