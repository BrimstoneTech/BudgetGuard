import React, { useState } from 'react';
import {
    TrendingUp, TrendingDown, AlertTriangle, Calendar, Plus,
    ShieldAlert, ArrowRight, PieChart, History, Settings, DollarSign,
    Info, Trash2, Wallet, Bell, X, CheckCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { format, isSameDay } from 'date-fns';
import { cn } from '../utils/theme';
import { formatMoney, EXCHANGE_RATES } from '../utils/currency';
import { Card } from '../components/ui/Card';
import { Stat } from '../components/ui/Stat';
import { useBudget } from '../context/BudgetContext';
import { Transaction, Bill, Frequency, BudgetEnvelope, IncomeSource } from '../types';

export const CATEGORIES = [
    'General', 'Food & Drinks', 'Transport', 'Shopping', 'Bills',
    'Entertainment', 'Health', 'Education', 'Personal Care', 'Other'
];

export const DashboardScreen = () => {
    const {
        balance, setBalance,
        dailyTarget, setDailyTarget,
        displayCurrency,
        transactions, setTransactions,
        bills, setBills,
        envelopes, setEnvelopes,
        incomes, setIncomes,
        notifications,
        todaySpend, yesterdaySpend, efficiency,
        currentCurrency, projectionData, daysUntilZero, alertLevel
    } = useBudget();

    const [whatIfAmount, setWhatIfAmount] = useState<number>(0);

    // Form states
    const [isAddingBill, setIsAddingBill] = useState(false);
    const [newBill, setNewBill] = useState({ name: '', amount: '', date: format(new Date(), 'yyyy-MM-dd') });
    const [isLoggingExpense, setIsLoggingExpense] = useState(false);
    const [newExpense, setNewExpense] = useState({ name: '', amount: '', currency: 'UGX', category: 'General', note: '' });
    const [isAddingIncome, setIsAddingIncome] = useState(false);
    const [newIncome, setNewIncome] = useState({ name: '', amount: '', frequency: 'monthly' as Frequency, startDate: format(new Date(), 'yyyy-MM-dd') });
    const [isAddingEnvelope, setIsAddingEnvelope] = useState(false);
    const [newEnvelope, setNewEnvelope] = useState({ name: '', limit: '', period: 'monthly' as 'weekly' | 'monthly', color: 'emerald' });

    const handleAddBill = () => {
        if (!newBill.name || !newBill.amount) return;
        const bill: Bill = {
            id: Date.now(),
            name: newBill.name,
            amount: Number(newBill.amount),
            date: new Date(newBill.date),
            category: 'General'
        };
        setBills([...bills, bill]);
        setNewBill({ name: '', amount: '', date: format(new Date(), 'yyyy-MM-dd') });
        setIsAddingBill(false);
    };

    const handleLogExpense = () => {
        if (!newExpense.name || !newExpense.amount) return;
        const rate = EXCHANGE_RATES[newExpense.currency] || 1;
        const amountInUGX = Number(newExpense.amount) * rate;
        const transaction: Transaction = {
            id: Date.now(),
            name: newExpense.name,
            amount: amountInUGX,
            originalAmount: Number(newExpense.amount),
            originalCurrency: newExpense.currency,
            date: new Date(),
            category: newExpense.category,
            note: newExpense.note
        };

        // Update envelopes
        setEnvelopes(envelopes.map(env =>
            env.name === newExpense.category
                ? { ...env, spent: env.spent + (amountInUGX / EXCHANGE_RATES.USD) }
                : env
        ));

        setTransactions([transaction, ...transactions]);
        setBalance(prev => prev - amountInUGX);
        setNewExpense({ name: '', amount: '', currency: 'UGX', category: 'General', note: '' });
        setIsLoggingExpense(false);
    };

    const handleAddEnvelope = () => {
        if (!newEnvelope.name || !newEnvelope.limit) return;
        const envelope: BudgetEnvelope = {
            id: Date.now(),
            name: newEnvelope.name,
            limit: Number(newEnvelope.limit),
            spent: 0,
            period: newEnvelope.period,
            color: newEnvelope.color
        };
        setEnvelopes([...envelopes, envelope]);
        setNewEnvelope({ name: '', limit: '', period: 'monthly', color: 'emerald' });
        setIsAddingEnvelope(false);
    };

    const handleAddIncome = () => {
        if (!newIncome.name || !newIncome.amount) return;
        const income: IncomeSource = {
            id: Date.now(),
            name: newIncome.name,
            amount: Number(newIncome.amount),
            frequency: newIncome.frequency,
            startDate: new Date(newIncome.startDate)
        };
        setIncomes([...incomes, income]);
        setNewIncome({ name: '', amount: '', frequency: 'monthly', startDate: format(new Date(), 'yyyy-MM-dd') });
        setIsAddingIncome(false);
    };

    const removeIncome = (id: number) => {
        setIncomes(incomes.filter(inc => inc.id !== id));
    };

    const AlertIcon = alertLevel.icon || ShieldAlert;

    return (
        <>
            <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                {/* Daily Focus Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <Card title="Daily Expense Log" className="h-full">
                            <div className="space-y-6">
                                <div className="p-4 bg-zinc-900 rounded-xl text-white space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Daily Target</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-mono">{currentCurrency.symbol}</span>
                                            <input
                                                type="number"
                                                value={dailyTarget / currentCurrency.rate}
                                                onChange={(e) => setDailyTarget(Number(e.target.value) * currentCurrency.rate)}
                                                className="bg-white/10 border-none text-right w-24 text-sm font-bold focus:ring-0 p-0"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Spent Today</span>
                                        <span className="text-xl font-black">{formatMoney(todaySpend, displayCurrency.code)}</span>
                                    </div>
                                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                        <div
                                            className={cn("h-full transition-all duration-500", todaySpend > dailyTarget ? "bg-rose-500" : "bg-emerald-400")}
                                            style={{ width: `${Math.min(100, (todaySpend / dailyTarget) * 100)}%` }}
                                        />
                                    </div>
                                    {todaySpend > dailyTarget && (
                                        <p className="text-[10px] text-rose-300 font-bold flex items-center gap-1 animate-pulse">
                                            <AlertTriangle size={10} /> TARGET EXCEEDED BY {formatMoney(todaySpend - dailyTarget, displayCurrency.code)}
                                        </p>
                                    )}
                                </div>

                                {isLoggingExpense ? (
                                    <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-4 animate-in fade-in zoom-in-95">
                                        <div className="space-y-3">
                                            <input type="text" placeholder="What did you buy?" value={newExpense.name} onChange={e => setNewExpense({ ...newExpense, name: e.target.value })} className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900" />
                                            <div className="flex gap-2">
                                                <input type="number" placeholder="Amount" value={newExpense.amount} onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })} className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900" />
                                                <select value={newExpense.currency} onChange={e => setNewExpense({ ...newExpense, currency: e.target.value })} className="w-24 px-2 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 bg-white">
                                                    {Object.keys(EXCHANGE_RATES).map(curr => <option key={curr} value={curr}>{curr}</option>)}
                                                </select>
                                            </div>
                                            <select value={newExpense.category} onChange={e => setNewExpense({ ...newExpense, category: e.target.value })} className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 bg-white">
                                                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                            </select>
                                            <textarea placeholder="Add a note (optional)" value={newExpense.note} onChange={e => setNewExpense({ ...newExpense, note: e.target.value })} className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 resize-none h-20" />
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={handleLogExpense} className="flex-1 py-2 bg-zinc-900 text-white text-xs font-bold uppercase tracking-wider rounded-lg">Log Expense</button>
                                            <button onClick={() => setIsLoggingExpense(false)} className="flex-1 py-2 bg-zinc-200 text-zinc-600 text-xs font-bold uppercase tracking-wider rounded-lg">Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <button onClick={() => setIsLoggingExpense(true)} className="w-full py-3 border border-dashed border-zinc-300 rounded-xl text-zinc-400 text-xs font-medium flex items-center justify-center gap-2 hover:border-zinc-900 hover:text-zinc-900 transition-all">
                                        <Plus size={16} /> Quick Log
                                    </button>
                                )}

                                <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
                                    {transactions.filter(tx => isSameDay(tx.date, new Date())).map(tx => (
                                        <div key={tx.id} className="flex items-center justify-between p-2 hover:bg-zinc-50 rounded-lg transition-colors group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-500"><History size={14} /></div>
                                                <div>
                                                    <p className="text-xs font-semibold">{tx.name}</p>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">{tx.category}</p>
                                                        <span className="text-[10px] text-zinc-300">•</span>
                                                        <p className="text-[10px] text-zinc-400">{format(tx.date, 'HH:mm')}</p>
                                                    </div>
                                                    {tx.note && <p className="text-[10px] text-zinc-500 italic mt-1 line-clamp-1">"{tx.note}"</p>}
                                                </div>
                                            </div>
                                            <p className="text-xs font-mono font-bold text-rose-600">-{formatMoney(tx.amount, displayCurrency.code)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    </div>

                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card title="Daily Assessment" className="flex flex-col justify-between">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-zinc-500">Efficiency Score</span>
                                    <span className={cn("text-lg font-black", efficiency > 0 ? "text-emerald-600" : "text-rose-600")}>
                                        {efficiency > 0 ? "+" : ""}{efficiency.toFixed(1)}%
                                    </span>
                                </div>
                                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100">
                                    <p className="text-xs text-zinc-600 leading-relaxed italic">
                                        {efficiency > 20 ? "Excellent discipline! You're significantly under your daily limit." :
                                            efficiency > 0 ? "Good job. You're staying within your planned budget." :
                                                efficiency > -20 ? "Slightly over target. Keep an eye on non-essential spending." :
                                                    "Heavy spending today. Consider scaling back tomorrow to maintain your runway."}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Current Balance</p>
                                        <p className="text-xl font-bold tracking-tight">{formatMoney(balance, displayCurrency.code)}</p>
                                    </div>
                                    <div className="w-px h-10 bg-zinc-200" />
                                    <div className="flex-1">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Safe to Spend</p>
                                        <p className="text-xl font-bold tracking-tight text-emerald-600">
                                            {formatMoney(Math.max(0, (balance - (1500 * EXCHANGE_RATES.USD)) / 30), displayCurrency.code)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card title="Spend Comparison">
                            <div className="space-y-6">
                                <div className="flex items-end gap-4 h-32">
                                    <div className="flex-1 flex flex-col items-center gap-2">
                                        <div className="w-full bg-zinc-200 rounded-t-lg transition-all duration-700" style={{ height: `${Math.min(100, (yesterdaySpend / Math.max(todaySpend, yesterdaySpend, 1)) * 100)}%` }} />
                                        <span className="text-[10px] font-bold text-zinc-400">YESTERDAY</span>
                                    </div>
                                    <div className="flex-1 flex flex-col items-center gap-2">
                                        <div className={cn("w-full rounded-t-lg transition-all duration-700", todaySpend > yesterdaySpend ? "bg-rose-500" : "bg-emerald-500")} style={{ height: `${Math.min(100, (todaySpend / Math.max(todaySpend, yesterdaySpend, 1)) * 100)}%` }} />
                                        <span className="text-[10px] font-bold text-zinc-900">TODAY</span>
                                    </div>
                                </div>
                                <div className="pt-2 border-t border-zinc-100">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-zinc-500">Difference</span>
                                        <span className={cn("text-sm font-bold", todaySpend > yesterdaySpend ? "text-rose-600" : "text-emerald-600")}>
                                            {todaySpend > yesterdaySpend ? "+" : "-"}{formatMoney(Math.abs(todaySpend - yesterdaySpend), displayCurrency.code)}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-zinc-400 mt-1">
                                        {todaySpend > yesterdaySpend ? "You've spent more today than yesterday." : "You're spending less today than yesterday. Keep it up!"}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Runout Shield Banner */}
                <div className={cn("p-6 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-500", {
                    "bg-rose-50 border-rose-200": alertLevel.color === "rose",
                    "bg-amber-50 border-amber-200": alertLevel.color === "amber",
                    "bg-emerald-50 border-emerald-200": alertLevel.color === "emerald",
                })}>
                    <div className="flex items-center gap-5">
                        <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm", {
                            "bg-rose-600 text-white": alertLevel.color === "rose",
                            "bg-amber-500 text-white": alertLevel.color === "amber",
                            "bg-emerald-600 text-white": alertLevel.color === "emerald",
                        })}>
                            <AlertIcon size={32} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase", {
                                    "bg-rose-100 text-rose-700": alertLevel.color === "rose",
                                    "bg-amber-100 text-amber-700": alertLevel.color === "amber",
                                    "bg-emerald-100 text-emerald-700": alertLevel.color === "emerald",
                                })}>{alertLevel.text}</span>
                                <h2 className="text-lg font-bold tracking-tight">Runout Shield Active</h2>
                            </div>
                            <p className="text-sm text-zinc-600 max-w-md">
                                {daysUntilZero < 30 ? `Your balance is projected to hit zero in ${daysUntilZero} days based on current spending and upcoming bills.` : "Your current financial trajectory is stable for the next 30 days."}
                            </p>
                        </div>
                    </div>
                    <div className="text-center md:text-right">
                        <p className="text-4xl font-black tracking-tighter mb-1">{daysUntilZero}<span className="text-lg font-medium tracking-normal ml-1">days</span></p>
                        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Runway Remaining</p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Stat label="Current Balance" value={formatMoney(balance, displayCurrency.code)} subValue="Across 3 accounts" icon={DollarSign} color="zinc" />
                    <Stat label="Daily Burn Rate" value={formatMoney(dailyTarget, displayCurrency.code)} subValue="From limit target" icon={TrendingDown} color="rose" />
                    <Stat label="Upcoming Bills" value={formatMoney(bills.reduce((a, b) => a + (b.amount * EXCHANGE_RATES.USD), 0), displayCurrency.code)} subValue="Next 30 days" icon={Calendar} color="amber" />
                    <Stat label="Safe to Spend" value={formatMoney(Math.max(0, (balance - (1500 * EXCHANGE_RATES.USD)) / 30), displayCurrency.code)} subValue="Daily limit for stability" icon={TrendingUp} color="emerald" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <Card title="30-Day Cash Flow Projection">
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
                                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} formatter={(v: any) => [formatMoney(v, displayCurrency.code), 'Balance']} />
                                        <Area type="monotone" dataKey="balance" stroke="#18181b" strokeWidth={2} fillOpacity={1} fill="url(#colorBalance)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        <Card title="Budget Envelopes">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {envelopes.map(env => {
                                    const limitInUGX = env.limit * EXCHANGE_RATES.USD;
                                    const spentInUGX = env.spent * EXCHANGE_RATES.USD;
                                    const percent = Math.min(100, (spentInUGX / limitInUGX) * 100);
                                    const isOver = spentInUGX > limitInUGX;

                                    return (
                                        <div key={env.id} className="space-y-2 p-3 rounded-xl border border-zinc-100 bg-zinc-50/30">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className={cn("w-2 h-2 rounded-full", {
                                                        "bg-emerald-500": env.color === 'emerald',
                                                        "bg-amber-500": env.color === 'amber',
                                                        "bg-indigo-500": env.color === 'indigo',
                                                        "bg-rose-500": env.color === 'rose',
                                                    })} />
                                                    <span className="text-sm font-semibold">{env.name}</span>
                                                    <span className="text-[10px] text-zinc-400 uppercase tracking-widest">{env.period}</span>
                                                </div>
                                                <span className="text-xs font-mono font-bold">
                                                    {formatMoney(spentInUGX, displayCurrency.code)} <span className="text-zinc-400">/ {formatMoney(limitInUGX, displayCurrency.code)}</span>
                                                </span>
                                            </div>
                                            <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                                                <div
                                                    className={cn("h-full transition-all duration-1000", {
                                                        "bg-emerald-500": !isOver && env.color === 'emerald',
                                                        "bg-amber-500": !isOver && env.color === 'amber',
                                                        "bg-indigo-500": !isOver && env.color === 'indigo',
                                                        "bg-rose-500": isOver || env.color === 'rose',
                                                    })}
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>
                                            {isOver && (
                                                <p className="text-[10px] text-rose-500 font-medium flex items-center gap-1">
                                                    <AlertTriangle size={10} /> Over budget by {formatMoney(spentInUGX - limitInUGX, displayCurrency.code)}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}

                                {isAddingEnvelope ? (
                                    <div className="p-4 bg-white rounded-xl border border-zinc-200 shadow-sm space-y-4 animate-in fade-in zoom-in-95 md:col-span-2">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-3">
                                                <input type="text" placeholder="Category Name" value={newEnvelope.name} onChange={e => setNewEnvelope({ ...newEnvelope, name: e.target.value })} className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900" />
                                                <div className="flex gap-2">
                                                    <input type="number" placeholder="Limit" value={newEnvelope.limit} onChange={e => setNewEnvelope({ ...newEnvelope, limit: e.target.value })} className="w-1/2 px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900" />
                                                    <select value={newEnvelope.period} onChange={e => setNewEnvelope({ ...newEnvelope, period: e.target.value as 'weekly' | 'monthly' })} className="w-1/2 px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900">
                                                        <option value="weekly">Weekly</option>
                                                        <option value="monthly">Monthly</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Select Color</p>
                                                <div className="flex gap-3">
                                                    {['emerald', 'amber', 'indigo', 'rose'].map(c => (
                                                        <button key={c} onClick={() => setNewEnvelope({ ...newEnvelope, color: c })} className={cn("w-8 h-8 rounded-full border-2 transition-all", { "border-zinc-900 scale-110": newEnvelope.color === c, "border-transparent": newEnvelope.color !== c, "bg-emerald-500": c === 'emerald', "bg-amber-500": c === 'amber', "bg-indigo-500": c === 'indigo', "bg-rose-500": c === 'rose' })} />
                                                    ))}
                                                </div>
                                                <div className="flex gap-2 pt-2">
                                                    <button onClick={handleAddEnvelope} className="flex-1 py-2 bg-zinc-900 text-white text-xs font-bold uppercase tracking-wider rounded-lg">Create Pot</button>
                                                    <button onClick={() => setIsAddingEnvelope(false)} className="flex-1 py-2 bg-zinc-200 text-zinc-600 text-xs font-bold uppercase tracking-wider rounded-lg">Cancel</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <button onClick={() => setIsAddingEnvelope(true)} className="w-full py-6 border border-dashed border-zinc-300 rounded-xl text-zinc-400 text-xs font-medium flex flex-col items-center justify-center gap-2 hover:border-zinc-900 hover:text-zinc-900 transition-all md:col-span-2">
                                        <Plus size={20} /><span>Create New Budget Pot</span>
                                    </button>
                                )}
                            </div>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card title="What-if Simulator">
                            <p className="text-xs text-zinc-500 mb-4">Simulate a large purchase to see its impact on your runway.</p>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1 block">Purchase Amount ({displayCurrency.code})</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">{currentCurrency.symbol}</span>
                                        <input type="number" value={whatIfAmount ? whatIfAmount / currentCurrency.rate : ''} onChange={(e) => setWhatIfAmount(Number(e.target.value) * currentCurrency.rate)} placeholder="0" className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all" />
                                    </div>
                                </div>
                                <div className="p-3 bg-zinc-900 rounded-lg text-white">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[10px] font-medium uppercase tracking-widest opacity-70">New Runway</span>
                                        <span className="text-lg font-bold">{daysUntilZero} Days</span>
                                    </div>
                                    <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden">
                                        <div className="bg-white h-full transition-all duration-500" style={{ width: `${(daysUntilZero / 30) * 100}%` }} />
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card title="Upcoming Bills">
                            <div className="space-y-3">
                                {bills.map(bill => (
                                    <div key={bill.id} className="flex items-center justify-between p-2 hover:bg-zinc-50 rounded-lg transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-500 group-hover:bg-white group-hover:shadow-sm transition-all"><Calendar size={16} /></div>
                                            <div>
                                                <p className="text-sm font-semibold">{bill.name}</p>
                                                <p className="text-[10px] text-zinc-400">{format(bill.date, 'MMM dd')}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-mono font-bold text-rose-600">-{formatMoney(bill.amount * EXCHANGE_RATES.USD, displayCurrency.code)}</p>
                                            <button onClick={() => setBills(bills.filter(b => b.id !== bill.id))} className="p-1 text-zinc-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                ))}
                                {isAddingBill ? (
                                    <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 space-y-3 animate-in fade-in slide-in-from-top-2">
                                        <input type="text" placeholder="Bill Name" value={newBill.name} onChange={e => setNewBill({ ...newBill, name: e.target.value })} className="w-full px-3 py-1.5 text-xs border border-zinc-200 rounded focus:outline-none focus:ring-1 focus:ring-zinc-900" />
                                        <div className="flex gap-2">
                                            <input type="number" placeholder="Amount" value={newBill.amount} onChange={e => setNewBill({ ...newBill, amount: e.target.value })} className="w-1/2 px-3 py-1.5 text-xs border border-zinc-200 rounded focus:outline-none focus:ring-1 focus:ring-zinc-900" />
                                            <input type="date" value={newBill.date} onChange={e => setNewBill({ ...newBill, date: e.target.value })} className="w-1/2 px-3 py-1.5 text-xs border border-zinc-200 rounded focus:outline-none focus:ring-1 focus:ring-zinc-900" />
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={handleAddBill} className="flex-1 py-1.5 bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-wider rounded">Save</button>
                                            <button onClick={() => setIsAddingBill(false)} className="flex-1 py-1.5 bg-zinc-200 text-zinc-600 text-[10px] font-bold uppercase tracking-wider rounded">Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <button onClick={() => setIsAddingBill(true)} className="w-full py-2 border border-dashed border-zinc-300 rounded-lg text-zinc-400 text-xs font-medium flex items-center justify-center gap-2 hover:border-zinc-900 hover:text-zinc-900 transition-all"><Plus size={14} /> Add Bill</button>
                                )}
                            </div>
                        </Card>

                        <Card title="Income Sources">
                            <div className="space-y-3">
                                {incomes.map(income => (
                                    <div key={income.id} className="flex items-center justify-between p-2 hover:bg-zinc-50 rounded-lg transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all"><Wallet size={16} /></div>
                                            <div>
                                                <p className="text-sm font-semibold">{income.name}</p>
                                                <p className="text-[10px] text-zinc-400 capitalize">{income.frequency} • {format(new Date(income.startDate), 'MMM dd')}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-mono font-bold text-emerald-600">+{formatMoney(income.amount * EXCHANGE_RATES.USD, displayCurrency.code)}</p>
                                            <button onClick={() => removeIncome(income.id)} className="p-1 text-zinc-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                ))}

                                {isAddingIncome ? (
                                    <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 space-y-3 animate-in fade-in slide-in-from-top-2">
                                        <input type="text" placeholder="Source Name" value={newIncome.name} onChange={e => setNewIncome({ ...newIncome, name: e.target.value })} className="w-full px-3 py-1.5 text-xs border border-zinc-200 rounded focus:outline-none focus:ring-1 focus:ring-zinc-900" />
                                        <div className="flex gap-2">
                                            <input type="number" placeholder="Amount" value={newIncome.amount} onChange={e => setNewIncome({ ...newIncome, amount: e.target.value })} className="w-1/2 px-3 py-1.5 text-xs border border-zinc-200 rounded focus:outline-none focus:ring-1 focus:ring-zinc-900" />
                                            <select value={newIncome.frequency} onChange={e => setNewIncome({ ...newIncome, frequency: e.target.value as Frequency })} className="w-1/2 px-3 py-1.5 text-xs border border-zinc-200 rounded focus:outline-none focus:ring-1 focus:ring-zinc-900">
                                                <option value="once">Once</option>
                                                <option value="weekly">Weekly</option>
                                                <option value="bi-weekly">Bi-weekly</option>
                                                <option value="monthly">Monthly</option>
                                            </select>
                                        </div>
                                        <input type="date" value={newIncome.startDate} onChange={e => setNewIncome({ ...newIncome, startDate: e.target.value })} className="w-full px-3 py-1.5 text-xs border border-zinc-200 rounded focus:outline-none focus:ring-1 focus:ring-zinc-900" />
                                        <div className="flex gap-2">
                                            <button onClick={handleAddIncome} className="flex-1 py-1.5 bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-wider rounded">Save</button>
                                            <button onClick={() => setIsAddingIncome(false)} className="flex-1 py-1.5 bg-zinc-200 text-zinc-600 text-[10px] font-bold uppercase tracking-wider rounded">Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <button onClick={() => setIsAddingIncome(true)} className="w-full py-2 border border-dashed border-zinc-300 rounded-lg text-zinc-400 text-xs font-medium flex items-center justify-center gap-2 hover:border-zinc-900 hover:text-zinc-900 transition-all"><Plus size={14} /> Add Income Source</button>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            </main>

            <button
                onClick={() => setIsLoggingExpense(true)}
                className="fixed bottom-8 right-8 w-14 h-14 bg-zinc-900 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50"
            >
                <Plus size={28} />
            </button>
        </>
    );
};
