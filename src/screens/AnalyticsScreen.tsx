import React from 'react';
import { PieChart as PieChartIcon, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card } from '../components/ui/Card';
import { useBudget } from '../context/BudgetContext';
import { formatMoney } from '../utils/currency';

const COLORS = ['#10b981', '#f59e0b', '#6366f1', '#f43f5e', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#3b82f6', '#0ea5e9'];

export const AnalyticsScreen = () => {
    const {
        transactions,
        projectionData,
        displayCurrency,
        currentCurrency,
        privacyMode,
        efficiency
    } = useBudget();

    const categoryData = React.useMemo(() => {
        const mapped = transactions.reduce((acc, tx) => {
            acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(mapped).map(([name, value]) => ({ name, value }));
    }, [transactions]);

    return (
        <main className="max-w-7xl mx-auto px-6 py-8 space-y-8 mb-24">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Finanical Insights</h2>
                    <p className="text-sm text-zinc-500">Analyze your spending patterns and future cash flow.</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Efficiency</p>
                    <p className={`text-xl font-bold ${efficiency > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {efficiency > 0 ? '+' : ''}{efficiency.toFixed(1)}%
                    </p>
                </div>
            </div>

            <Card title="Cash Flow Projection (30 Days)">
                <div className="h-[350px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={projectionData}>
                            <defs>
                                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#18181b" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#18181b" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#71717a' }} interval={4} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#71717a' }} tickFormatter={(v) => `${currentCurrency.symbol}${v.toLocaleString()}`} />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} formatter={(v: any) => [formatMoney(v, displayCurrency.code, privacyMode), 'Balance']} />
                            <Area type="monotone" dataKey="balance" stroke="#18181b" strokeWidth={2} fillOpacity={1} fill="url(#colorBalance)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card title="Spending by Category">
                    <div className="h-[300px] w-full flex items-center justify-center">
                        {categoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={110}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: number) => formatMoney(value, displayCurrency.code, privacyMode)}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-zinc-400 text-sm flex flex-col items-center">
                                <PieChartIcon size={48} className="mb-2 opacity-50" />
                                <p>No data to analyze</p>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4 justify-center">
                        {categoryData.map((entry, index) => (
                            <div key={entry.name} className="flex items-center gap-1.5 text-[10px] text-zinc-600 font-bold uppercase tracking-wider">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                {entry.name}
                            </div>
                        ))}
                    </div>
                </Card>

                <Card title="Spending Dynamics">
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                            <div className="flex items-center gap-3">
                                <TrendingDown className="text-rose-500" size={20} />
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Highest Category</p>
                                    <p className="text-lg font-bold">{categoryData.length > 0 ? categoryData.sort((a, b) => b.value - a.value)[0].name : 'N/A'}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-black text-rose-600">
                                    {categoryData.length > 0 ? formatMoney(categoryData.sort((a, b) => b.value - a.value)[0].value, displayCurrency.code, privacyMode) : '-'}
                                </p>
                            </div>
                        </div>

                        <div className="p-4 bg-zinc-900 rounded-xl text-white">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-3">Optimization Tip</h4>
                            <p className="text-xs leading-relaxed">
                                {efficiency > 0
                                    ? "You're spending less than planned. This extra buffer increases your runway. Consider moving some to your Savings Goals."
                                    : "You're exceeding your daily target. Try reducing non-essential spending in your highest category to stabilize your runway."
                                }
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </main>
    );
};
