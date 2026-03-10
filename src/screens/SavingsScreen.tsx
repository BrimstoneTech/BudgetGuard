import React, { useState } from 'react';
import { ShieldCheck, Plus, Trash2, Calendar, AlertTriangle, Wallet, CheckCircle2, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { useBudget } from '../context/BudgetContext';
import { formatMoney, EXCHANGE_RATES } from '../utils/currency';
import { format } from 'date-fns';
import { cn } from '../utils/theme';
import { Frequency } from '../types';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export const SavingsScreen = () => {
    const {
        savingsGoals, addSavingsGoal, addFundsToGoal, toggleSavingsTask, deleteSavingsGoal,
        envelopes, addEnvelope, deleteEnvelope,
        incomes, addIncome, deleteIncome,
        displayCurrency, privacyMode
    } = useBudget();

    const [isAddingEnvelope, setIsAddingEnvelope] = useState(false);
    const [newEnvelope, setNewEnvelope] = useState({ name: '', limit: '', period: 'monthly' as 'weekly' | 'monthly', color: 'emerald' });

    const [isAddingGoal, setIsAddingGoal] = useState(false);
    const [newGoal, setNewGoal] = useState({ name: '', targetAmount: '', color: 'indigo', deadline: '' });
    const [fundingGoalId, setFundingGoalId] = useState<number | null>(null);
    const [fundAmount, setFundAmount] = useState('');

    const [isAddingIncome, setIsAddingIncome] = useState(false);
    const [newIncome, setNewIncome] = useState({ name: '', amount: '', frequency: 'monthly' as Frequency, startDate: format(new Date(), 'yyyy-MM-dd') });

    const handleAddEnvelope = async (e: React.FormEvent) => {
        e.preventDefault();
        await addEnvelope({
            name: newEnvelope.name,
            limit: Number(newEnvelope.limit),
            period: newEnvelope.period as 'weekly' | 'monthly',
            color: newEnvelope.color
        });
        Haptics.impact({ style: ImpactStyle.Light });
        setNewEnvelope({ name: '', limit: '', period: 'monthly', color: 'emerald' });
        setIsAddingEnvelope(false);
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

    const handleAddIncome = async (e: React.FormEvent) => {
        e.preventDefault();
        await addIncome({
            name: newIncome.name,
            amount: Number(newIncome.amount),
            frequency: newIncome.frequency as Frequency,
            startDate: new Date(newIncome.startDate).toISOString()
        });
        Haptics.impact({ style: ImpactStyle.Light });
        setNewIncome({ name: '', amount: '', frequency: 'monthly', startDate: format(new Date(), 'yyyy-MM-dd') });
        setIsAddingIncome(false);
    };

    return (
        <main className="max-w-7xl mx-auto px-6 py-8 space-y-8 mb-24">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Savings & Budgets</h2>
                <p className="text-sm text-zinc-500">Manage your long-term goals and budget allocations.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <Card title="Budget Pots (Envelopes)">
                        <div className="space-y-4">
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
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-mono font-bold">
                                                    {formatMoney(spentInUGX, displayCurrency.code, privacyMode)} <span className="text-zinc-400">/ {formatMoney(limitInUGX, displayCurrency.code, privacyMode)}</span>
                                                </span>
                                                <button onClick={() => deleteEnvelope(env.id)} className="p-1 text-zinc-300 hover:text-rose-500 transition-colors"><Trash2 size={14} /></button>
                                            </div>
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
                                    </div>
                                );
                            })}

                            {isAddingEnvelope ? (
                                <form onSubmit={handleAddEnvelope} className="p-4 bg-white rounded-xl border border-zinc-200 shadow-sm space-y-3 animate-in fade-in zoom-in-95">
                                    <input type="text" placeholder="Pot Name" value={newEnvelope.name} onChange={e => setNewEnvelope({ ...newEnvelope, name: e.target.value })} className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900" />
                                    <div className="flex gap-2">
                                        <input type="number" placeholder="Limit (USD)" value={newEnvelope.limit} onChange={e => setNewEnvelope({ ...newEnvelope, limit: e.target.value })} className="w-1/2 px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900" />
                                        <select value={newEnvelope.period} onChange={e => setNewEnvelope({ ...newEnvelope, period: e.target.value as 'weekly' | 'monthly' })} className="w-1/2 px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900">
                                            <option value="weekly">Weekly</option>
                                            <option value="monthly">Monthly</option>
                                        </select>
                                    </div>
                                    <div className="flex gap-2">
                                        <button type="submit" className="flex-1 py-2 bg-zinc-900 text-white text-xs font-bold uppercase rounded-lg">Create Pot</button>
                                        <button type="button" onClick={() => setIsAddingEnvelope(false)} className="flex-1 py-2 bg-zinc-200 text-zinc-600 text-xs font-bold uppercase rounded-lg">Cancel</button>
                                    </div>
                                </form>
                            ) : (
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setIsAddingEnvelope(true)}
                                    className="w-full py-3 border border-dashed border-zinc-300 rounded-xl text-zinc-400 text-xs font-medium flex items-center justify-center gap-2 hover:border-zinc-900 hover:text-zinc-900 transition-all"
                                >
                                    <Plus size={16} /> New Budget Pot
                                </motion.button>
                            )}
                        </div>
                    </Card>

                    <Card title="Income Sources">
                        <div className="space-y-4">
                            {incomes.map(income => (
                                <div key={income.id} className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 bg-zinc-50/30">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center"><Wallet size={20} /></div>
                                        <div>
                                            <p className="text-sm font-semibold">{income.name}</p>
                                            <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest">{income.frequency}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <p className="text-sm font-black text-emerald-600">+{formatMoney(income.amount * EXCHANGE_RATES.USD, displayCurrency.code, privacyMode)}</p>
                                        <button onClick={() => deleteIncome(income.id)} className="p-1 text-zinc-300 hover:text-rose-500 transition-colors"><Trash2 size={14} /></button>
                                    </div>
                                </div>
                            ))}
                            {isAddingIncome ? (
                                <form onSubmit={handleAddIncome} className="p-4 bg-white rounded-xl border border-zinc-200 shadow-sm space-y-3 animate-in fade-in zoom-in-95">
                                    <input type="text" placeholder="Source Name" value={newIncome.name} onChange={e => setNewIncome({ ...newIncome, name: e.target.value })} className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900" />
                                    <div className="flex gap-2">
                                        <input type="number" placeholder="Amount (USD)" value={newIncome.amount} onChange={e => setNewIncome({ ...newIncome, amount: e.target.value })} className="w-1/2 px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900" />
                                        <select value={newIncome.frequency} onChange={e => setNewIncome({ ...newIncome, frequency: e.target.value as Frequency })} className="w-1/2 px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900">
                                            <option value="once">Once</option>
                                            <option value="weekly">Weekly</option>
                                            <option value="bi-weekly">Bi-weekly</option>
                                            <option value="monthly">Monthly</option>
                                        </select>
                                    </div>
                                    <div className="flex gap-2">
                                        <button type="submit" className="flex-1 py-2 bg-zinc-900 text-white text-xs font-bold uppercase rounded-lg">Add Income</button>
                                        <button type="button" onClick={() => setIsAddingIncome(false)} className="flex-1 py-2 bg-zinc-200 text-zinc-600 text-xs font-bold uppercase rounded-lg">Cancel</button>
                                    </div>
                                </form>
                            ) : (
                                <button onClick={() => setIsAddingIncome(true)} className="w-full py-3 border border-dashed border-zinc-300 rounded-xl text-zinc-400 text-xs font-medium flex items-center justify-center gap-2 hover:border-zinc-900 hover:text-zinc-900 transition-all">
                                    <Plus size={16} /> Add Income Source
                                </button>
                            )}
                        </div>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card title="Savings Goals">
                        <div className="space-y-4">
                            {savingsGoals.map(goal => {
                                const percent = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
                                return (
                                    <div key={goal.id} className="p-4 rounded-2xl border border-zinc-100 bg-zinc-50 group">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="text-lg font-bold tracking-tight">{goal.name}</h3>
                                                {goal.deadline && <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold mt-1">Target Date: {format(new Date(goal.deadline), 'MMM dd, yyyy')}</p>}
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-black text-zinc-900">{formatMoney(goal.currentAmount, displayCurrency.code, privacyMode)}</p>
                                                <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest">Goal: {formatMoney(goal.targetAmount, displayCurrency.code, privacyMode)}</p>
                                            </div>
                                        </div>
                                        <div className="h-3 bg-zinc-200 rounded-full overflow-hidden mb-6">
                                            <div className={cn("h-full transition-all duration-1000", {
                                                "bg-emerald-500": goal.color === 'emerald',
                                                "bg-amber-500": goal.color === 'amber',
                                                "bg-indigo-500": goal.color === 'indigo',
                                                "bg-rose-500": goal.color === 'rose',
                                                "bg-sky-500": goal.color === 'sky'
                                            })} style={{ width: `${percent}%` }} />
                                        </div>

                                        <div className="mb-6 space-y-2">
                                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-3">Milestone Tasks</p>
                                            <AnimatePresence>
                                                {goal.tasks.map(task => (
                                                    <motion.button
                                                        key={task.id}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        onClick={() => {
                                                            Haptics.impact({ style: ImpactStyle.Light });
                                                            toggleSavingsTask(goal.id, task.id);
                                                        }}
                                                        className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/50 transition-colors group"
                                                    >
                                                        {task.completed ? (
                                                            <CheckCircle2 size={18} className="text-emerald-500" />
                                                        ) : (
                                                            <Circle size={18} className="text-zinc-300 group-hover:text-zinc-400" />
                                                        )}
                                                        <span className={cn("text-xs font-medium", task.completed ? "text-zinc-400 line-through" : "text-zinc-700")}>
                                                            {task.text}
                                                        </span>
                                                    </motion.button>
                                                ))}
                                            </AnimatePresence>
                                            <button
                                                onClick={() => {
                                                    const text = prompt("Enter a small task toward this goal:");
                                                    if (text) {
                                                        // In a full implementation, we'd add the task to the goal
                                                        // For now, let's assume goals can be updated with tasks
                                                    }
                                                }}
                                                className="w-full py-2 border border-dashed border-zinc-200 rounded-xl text-[10px] text-zinc-400 uppercase font-black tracking-widest hover:border-zinc-400 hover:text-zinc-500 transition-all mt-2"
                                            >
                                                + Add Task
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {fundingGoalId === goal.id ? (
                                                <form onSubmit={(e) => handleFundGoal(e, goal.id)} className="flex-1 flex gap-2 animate-in fade-in slide-in-from-top-1">
                                                    <input type="number" placeholder="Amount" value={fundAmount} onChange={e => setFundAmount(e.target.value)} required className="flex-1 px-3 py-2 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-900" />
                                                    <button type="submit" className="px-4 py-2 bg-zinc-900 text-white text-xs font-bold rounded-xl shadow-lg">Save</button>
                                                    <button type="button" onClick={() => setFundingGoalId(null)} className="px-4 py-2 bg-zinc-200 text-zinc-600 text-xs font-bold rounded-xl">X</button>
                                                </form>
                                            ) : (
                                                <>
                                                    <button onClick={() => setFundingGoalId(goal.id)} className="flex-1 py-3 bg-white border border-zinc-200 text-zinc-900 text-xs font-bold uppercase tracking-wider rounded-xl shadow-sm hover:shadow-md transition-all">Add Contribution</button>
                                                    <button onClick={() => deleteSavingsGoal(goal.id)} className="p-3 text-zinc-300 hover:text-rose-500 transition-colors"><Trash2 size={20} /></button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            {isAddingGoal ? (
                                <form onSubmit={handleAddGoal} className="p-6 bg-white rounded-2xl border border-zinc-200 shadow-sm animate-in fade-in space-y-4">
                                    <input type="text" placeholder="Goal Name (e.g. New iPhone)" value={newGoal.name} onChange={e => setNewGoal({ ...newGoal, name: e.target.value })} className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900" />
                                    <div className="flex gap-2">
                                        <input type="number" placeholder="Target Amount" value={newGoal.targetAmount} onChange={e => setNewGoal({ ...newGoal, targetAmount: e.target.value })} className="w-1/2 px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900" />
                                        <input type="date" value={newGoal.deadline} onChange={e => setNewGoal({ ...newGoal, deadline: e.target.value })} className="w-1/2 px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900" />
                                    </div>
                                    <div className="flex gap-2">
                                        <button type="submit" className="flex-1 py-3 bg-zinc-900 text-white text-xs font-bold uppercase rounded-xl">Create Goal</button>
                                        <button type="button" onClick={() => setIsAddingGoal(false)} className="flex-1 py-3 bg-zinc-200 text-zinc-600 text-xs font-bold uppercase rounded-xl">Cancel</button>
                                    </div>
                                </form>
                            ) : (
                                <button onClick={() => setIsAddingGoal(true)} className="w-full py-6 border border-dashed border-zinc-300 rounded-2xl text-zinc-400 text-xs font-medium flex flex-col items-center justify-center gap-2 hover:border-zinc-900 hover:text-zinc-900 transition-all">
                                    <Plus size={24} /> <span>New Savings Goal</span>
                                </button>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </main>
    );
};
