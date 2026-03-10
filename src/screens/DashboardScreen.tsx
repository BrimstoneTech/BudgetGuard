import React, { useState } from 'react';
import {
    TrendingUp, TrendingDown, AlertTriangle, Calendar, Plus,
    ShieldAlert, ArrowRight, PieChart as PieChartIcon, History, Settings, DollarSign,
    Info, Trash2, Wallet, Bell, X, CheckCircle, ShieldCheck, AlertCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isSameDay } from 'date-fns';
import { cn } from '../utils/theme';
import { formatMoney, EXCHANGE_RATES } from '../utils/currency';
import { Card } from '../components/ui/Card';
import { Stat } from '../components/ui/Stat';
import { useBudget } from '../context/BudgetContext';
import { Transaction, Bill, Frequency, BudgetEnvelope, IncomeSource, SavingsGoal } from '../types';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export const CATEGORIES = [
    'General', 'Food & Drinks', 'Transport', 'Shopping', 'Bills',
    'Entertainment', 'Health', 'Education', 'Personal Care', 'Other'
];

export const DashboardScreen = () => {
    const {
        balance, setBalance,
        dailyTarget, setDailyTarget,
        displayCurrency,
        transactions, addTransaction, deleteTransaction,
        bills, addBill, deleteBill,
        envelopes, addEnvelope, deleteEnvelope,
        incomes, addIncome, deleteIncome,
        savingsGoals, addSavingsGoal, addFundsToGoal, deleteSavingsGoal,
        notifications,
        todaySpend, yesterdaySpend, efficiency,
        currentCurrency, projectionData, daysUntilZero, alertLevel, privacyMode,
        suggestCategory
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

    const [isAddingGoal, setIsAddingGoal] = useState(false);
    const [newGoal, setNewGoal] = useState({ name: '', targetAmount: '', color: 'indigo', deadline: '' });
    const [fundingGoalId, setFundingGoalId] = useState<number | null>(null);
    const [fundAmount, setFundAmount] = useState('');

    // Assuming these states are defined elsewhere for the modals
    const [setShowBillModal] = useState(false);
    const [setShowTxModal] = useState(false);
    const [setShowEnvelopeModal] = useState(false);
    const [setShowIncomeModal] = useState(false);

    const handleAddBill = async (e: React.FormEvent) => {
        e.preventDefault();
        const bill = {
            name: newBill.name,
            amount: Number(newBill.amount),
            date: new Date(newBill.date).toISOString(),
            category: newBill.category
        };
        await addBill(bill);
        Haptics.impact({ style: ImpactStyle.Light });
        setNewBill({ name: '', amount: '', date: '', category: '' });
        setShowBillModal(false);
    };

    const handleAddTransaction = async (e: React.FormEvent) => {
        e.preventDefault();
        const amountNum = Number(newExpense.amount); // Changed from newTx to newExpense
        const rate = EXCHANGE_RATES[newExpense.currency as keyof typeof EXCHANGE_RATES] || 1; // Changed from newTx to newExpense
        const baseAmount = newExpense.currency === displayCurrency.code ? amountNum : amountNum / rate; // Changed from newTx to newExpense, and displayCurrency to displayCurrency.code

        const transaction = {
            name: newExpense.name, // Changed from newTx to newExpense
            amount: baseAmount,
            originalAmount: amountNum,
            originalCurrency: newExpense.currency, // Changed from newTx to newExpense
            date: new Date().toISOString(),
            category: newExpense.category, // Changed from newTx to newExpense
            note: newExpense.note // Changed from newTx to newExpense
        };

        await addTransaction(transaction);
        setBalance(balance - baseAmount);
        Haptics.impact({ style: ImpactStyle.Medium });

        setNewExpense({ name: '', amount: '', currency: displayCurrency.code, category: 'General', note: '' }); // Changed from newTx to newExpense, and displayCurrency to displayCurrency.code
        setShowTxModal(false);
    };

    const handleAddEnvelope = async (e: React.FormEvent) => {
        e.preventDefault();
        const envelope = {
            name: newEnvelope.name,
            limit: Number(newEnvelope.limit),
            period: newEnvelope.period as 'weekly' | 'monthly',
            color: newEnvelope.color
        };
        await addEnvelope(envelope);
        Haptics.impact({ style: ImpactStyle.Light });
        setNewEnvelope({ name: '', limit: '', period: 'monthly', color: 'emerald' }); // Changed color to 'emerald' to match initial state
        setShowEnvelopeModal(false);
    };

    const handleAddIncome = async (e: React.FormEvent) => {
        e.preventDefault();
        const income = {
            name: newIncome.name,
            amount: Number(newIncome.amount),
            frequency: newIncome.frequency as Frequency, // Changed 'any' to 'Frequency'
            startDate: new Date(newIncome.startDate).toISOString()
        };
        await addIncome(income);
        Haptics.impact({ style: ImpactStyle.Light });
        setNewIncome({ name: '', amount: '', frequency: 'monthly', startDate: format(new Date(), 'yyyy-MM-dd') }); // Changed startDate to match initial state format
        setShowIncomeModal(false);
    };

    const handleRemoveIncome = async (id: number) => {
        await deleteIncome(id);
        Haptics.impact({ style: ImpactStyle.Light });
    };

    const handleAddGoal = async (e: React.FormEvent) => {
        e.preventDefault();
        await addSavingsGoal({
            name: newGoal.name,
            targetAmount: Number(newGoal.targetAmount),
            color: newGoal.color,
            deadline: newGoal.deadline || undefined
        });
        Haptics.impact({ style: ImpactStyle.Medium });
        setNewGoal({ name: '', targetAmount: '', color: 'indigo', deadline: '' });
        setIsAddingGoal(false);
    };

    const handleFundGoal = async (e: React.FormEvent, id: number) => {
        e.preventDefault();
        await addFundsToGoal(id, Number(fundAmount));
        Haptics.impact({ style: ImpactStyle.Heavy });
        setFundingGoalId(null);
        setFundAmount('');
    };

    const AlertIcon = alertLevel.icon === 'AlertCircle' ? AlertCircle :
        alertLevel.icon === 'AlertTriangle' ? AlertTriangle :
            ShieldCheck;

    const categoryData = React.useMemo(() => {
        const mapped = transactions.reduce((acc, tx) => {
            acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(mapped).map(([name, value]) => ({ name, value }));
    }, [transactions]);

    const COLORS = ['#10b981', '#f59e0b', '#6366f1', '#f43f5e', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#3b82f6', '#0ea5e9'];

    return (
        <>
            <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                {/* Daily Focus Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <Card title="Daily Expense Log" className="h-full">
                            <div className="space-y-6">
                                <div className="p-4 bg-[var(--accent-primary)] rounded-xl text-[var(--bg-secondary)] space-y-3 shadow-[var(--neon-glow)]">
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
                                        <span className="text-xl font-black">{formatMoney(todaySpend, displayCurrency.code, privacyMode)}</span>
                                    </div>
                                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                        <div
                                            className={cn("h-full transition-all duration-500", todaySpend > dailyTarget ? "bg-rose-500" : "bg-emerald-400")}
                                            style={{ width: `${Math.min(100, (todaySpend / dailyTarget) * 100)}%` }}
                                        />
                                    </div>
                                    {todaySpend > dailyTarget && (
                                        <p className="text-[10px] text-rose-300 font-bold flex items-center gap-1 animate-pulse">
                                            <AlertTriangle size={10} /> TARGET EXCEEDED BY {formatMoney(todaySpend - dailyTarget, displayCurrency.code, privacyMode)}
                                        </p>
                                    )}
                                </div>

                                {isLoggingExpense ? (
                                    <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-4 animate-in fade-in zoom-in-95">
                                        <div className="space-y-3">
                                            <input
                                                type="text"
                                                placeholder="What did you buy?"
                                                value={newExpense.name}
                                                onChange={e => {
                                                    const name = e.target.value;
                                                    const suggested = suggestCategory(name);
                                                    setNewExpense({
                                                        ...newExpense,
                                                        name,
                                                        category: suggested || newExpense.category
                                                    });
                                                }}
                                                className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900"
                                            />
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
                                            <motion.button
                                                whileTap={{ scale: 0.95 }}
                                                onClick={handleAddTransaction}
                                                className="flex-1 py-2 bg-[var(--accent-primary)] text-[var(--bg-secondary)] text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm active:shadow-inner transition-all"
                                            >
                                                Log Expense
                                            </motion.button>
                                            <motion.button
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setIsLoggingExpense(false)}
                                                className="flex-1 py-2 bg-[var(--bg-primary)] text-[var(--text-secondary)] text-xs font-bold uppercase tracking-wider rounded-lg"
                                            >
                                                Cancel
                                            </motion.button>
                                        </div>
                                    </div>
                                ) : (
                                    <motion.button
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            Haptics.impact({ style: ImpactStyle.Light });
                                            setIsLoggingExpense(true);
                                        }}
                                        className="w-full py-3 border border-dashed border-[var(--border-color)] rounded-xl text-[var(--text-secondary)] text-xs font-medium flex items-center justify-center gap-2 hover:border-[var(--accent-primary)] hover:text-[var(--text-primary)] transition-all"
                                    >
                                        <Plus size={16} /> Quick Log
                                    </motion.button>
                                )}

                                <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 overflow-x-hidden">
                                    <AnimatePresence initial={false}>
                                        {transactions.filter(tx => isSameDay(tx.date, new Date())).map(tx => (
                                            <motion.div
                                                key={tx.id}
                                                layout
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 100 }}
                                                drag="x"
                                                dragConstraints={{ left: -100, right: 0 }}
                                                onDragEnd={(_, info) => {
                                                    if (info.offset.x < -80) {
                                                        deleteTransaction(tx.id);
                                                        Haptics.notification({ type: ImpactStyle.Heavy as any });
                                                    }
                                                }}
                                                className="relative group"
                                            >
                                                <div className="absolute inset-0 bg-rose-500 rounded-lg flex items-center justify-end px-4 text-white -z-10">
                                                    <Trash2 size={16} />
                                                </div>
                                                <div className="flex items-center justify-between p-2 bg-[var(--bg-secondary)] hover:bg-[var(--bg-primary)] rounded-lg transition-colors border border-transparent hover:border-[var(--border-color)]">
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
                                                    <div className="flex items-center gap-3">
                                                        <p className="text-xs font-mono font-bold text-rose-600">-{formatMoney(tx.amount, displayCurrency.code, privacyMode)}</p>
                                                        <button onClick={() => deleteTransaction(tx.id)} className="p-1 text-zinc-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
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
                                        <p className="text-xl font-bold tracking-tight">{formatMoney(balance, displayCurrency.code, privacyMode)}</p>
                                    </div>
                                    <div className="w-px h-10 bg-zinc-200" />
                                    <div className="flex-1">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Safe to Spend</p>
                                        <p className="text-xl font-bold tracking-tight text-emerald-600">
                                            {formatMoney(Math.max(0, (balance - (1500 * EXCHANGE_RATES.USD)) / 30), displayCurrency.code, privacyMode)}
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
                                            {todaySpend > yesterdaySpend ? "+" : "-"}{formatMoney(Math.abs(todaySpend - yesterdaySpend), displayCurrency.code, privacyMode)}
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
                    <Stat label="Current Balance" value={formatMoney(balance, displayCurrency.code, privacyMode)} subValue="Across 3 accounts" icon={DollarSign} color="zinc" />
                    <Stat label="Daily Burn Rate" value={formatMoney(dailyTarget, displayCurrency.code, privacyMode)} subValue="From limit target" icon={TrendingDown} color="rose" />
                    <Stat label="Upcoming Bills" value={formatMoney(bills.reduce((a, b) => a + (b.amount * EXCHANGE_RATES.USD), 0), displayCurrency.code, privacyMode)} subValue="Next 30 days" icon={Calendar} color="amber" />
                    <Stat label="Safe to Spend" value={formatMoney(Math.max(0, (balance - (1500 * EXCHANGE_RATES.USD)) / 30), displayCurrency.code, privacyMode)} subValue="Daily limit for stability" icon={TrendingUp} color="emerald" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                                        <p className="text-sm font-mono font-bold text-rose-600">-{formatMoney(bill.amount * EXCHANGE_RATES.USD, displayCurrency.code, privacyMode)}</p>
                                        <button onClick={() => deleteBill(bill.id)} className="p-1 text-zinc-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14} /></button>
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
                </div>
            </main>

            <button
                onClick={() => setIsLoggingExpense(true)}
                className="fixed bottom-24 right-6 w-14 h-14 bg-zinc-900 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40"
            >
                <Plus size={28} />
            </button>
        </>
    );
};
