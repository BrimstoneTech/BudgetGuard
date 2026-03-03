import React, { useState } from 'react';
import { ShieldAlert, ArrowRight, Plus } from 'lucide-react';
import { useBudget } from '../../context/BudgetContext';
import { cn } from '../../utils/theme';
import { CURRENCIES, EXCHANGE_RATES, formatMoney } from '../../utils/currency';
import { Frequency, IncomeSource, BudgetEnvelope } from '../../types';
import { format } from 'date-fns';

export const SetupWizard = () => {
    const {
        setShowSetup,
        displayCurrency, setDisplayCurrency,
        balance, setBalance,
        dailyTarget, setDailyTarget,
        incomes, addIncome,
        envelopes, addEnvelope,
        currentCurrency
    } = useBudget();

    const [setupStep, setSetupStep] = useState(1);
    const [isAddingIncome, setIsAddingIncome] = useState(false);
    const [newIncome, setNewIncome] = useState({ name: '', amount: '', frequency: 'monthly' as Frequency, startDate: format(new Date(), 'yyyy-MM-dd') });
    const [isAddingEnvelope, setIsAddingEnvelope] = useState(false);
    const [newEnvelope, setNewEnvelope] = useState({ name: '', limit: '', period: 'monthly' as 'monthly' | 'weekly', color: 'emerald' });

    const handleAddIncome = async () => {
        if (!newIncome.name || !newIncome.amount) return;
        const income = {
            name: newIncome.name,
            amount: Number(newIncome.amount),
            frequency: newIncome.frequency as any,
            startDate: new Date().toISOString()
        };
        await addIncome(income);
        setNewIncome({ name: '', amount: '', frequency: 'monthly', startDate: format(new Date(), 'yyyy-MM-dd') });
        setIsAddingIncome(false);
    };

    const handleAddEnvelope = async () => {
        if (!newEnvelope.name || !newEnvelope.limit) return;
        const envelope = {
            name: newEnvelope.name,
            limit: Number(newEnvelope.limit),
            period: 'monthly' as const,
            color: 'blue'
        };
        await addEnvelope(envelope);
        setNewEnvelope({ name: '', limit: '', period: 'monthly', color: 'emerald' });
        setIsAddingEnvelope(false);
    };

    const steps = [
        { id: 1, title: "Welcome", description: "Let's get your BudgetGuard ready." },
        { id: 2, title: "Currency", description: "Choose your primary currency." },
        { id: 3, title: "Balance", description: "What's your current total balance?" },
        { id: 4, title: "Income", description: "Add your main income sources." },
        { id: 5, title: "Budgets", description: "Set up your first budget pots." },
        { id: 6, title: "Target", description: "Set your daily spending goal." },
    ];

    const nextStep = () => setSetupStep(prev => Math.min(steps.length, prev + 1));
    const prevStep = () => setSetupStep(prev => Math.max(1, prev - 1));

    return (
        <div className="fixed inset-0 z-[100] bg-zinc-900/90 backdrop-blur-xl flex items-center justify-center p-6">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                <div className="p-8">
                    <div className="flex gap-1 mb-8">
                        {steps.map(s => (
                            <div
                                key={s.id}
                                className={cn("h-1 flex-1 rounded-full transition-all duration-500",
                                    s.id <= setupStep ? "bg-zinc-900" : "bg-zinc-100"
                                )}
                            />
                        ))}
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-black tracking-tight text-zinc-900">{steps[setupStep - 1].title}</h2>
                            <p className="text-sm text-zinc-500">{steps[setupStep - 1].description}</p>
                        </div>

                        <div className="py-4 min-h-[200px] flex flex-col justify-center">
                            {setupStep === 1 && (
                                <div className="text-center space-y-4">
                                    <div className="w-20 h-20 bg-zinc-900 rounded-3xl mx-auto flex items-center justify-center text-white shadow-xl rotate-3">
                                        <ShieldAlert size={40} />
                                    </div>
                                    <p className="text-sm text-zinc-600 leading-relaxed">
                                        BudgetGuard helps you stay ahead of your expenses with offline-first intelligence.
                                        Follow this quick guide to set up your financial dashboard.
                                    </p>
                                </div>
                            )}

                            {setupStep === 2 && (
                                <div className="grid grid-cols-2 gap-3">
                                    {CURRENCIES.map(c => (
                                        <button
                                            key={c.code}
                                            onClick={() => setDisplayCurrency(c.code)}
                                            className={cn("p-4 rounded-2xl border-2 text-left transition-all",
                                                displayCurrency === c.code ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-100 hover:border-zinc-200"
                                            )}
                                        >
                                            <p className="text-xs font-bold opacity-60">{c.symbol}</p>
                                            <p className="text-lg font-black">{c.code}</p>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {setupStep === 3 && (
                                <div className="space-y-4">
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">{currentCurrency.symbol}</span>
                                        <input
                                            type="number"
                                            value={balance / currentCurrency.rate || ''}
                                            onChange={(e) => setBalance(Number(e.target.value) * currentCurrency.rate)}
                                            placeholder="0"
                                            className="w-full pl-12 pr-4 py-4 bg-zinc-50 border-2 border-zinc-100 rounded-2xl text-xl font-bold focus:outline-none focus:border-zinc-900 transition-all"
                                        />
                                    </div>
                                </div>
                            )}

                            {setupStep === 4 && (
                                <div className="space-y-4">
                                    <div className="space-y-3">
                                        {incomes.map(inc => (
                                            <div key={inc.id} className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                                                <span className="text-sm font-bold">{inc.name}</span>
                                                <span className="text-sm font-mono">{formatMoney(inc.amount * EXCHANGE_RATES.USD, 'USD')}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setIsAddingIncome(true)}
                                        className="w-full py-3 border-2 border-dashed border-zinc-200 rounded-2xl text-zinc-400 text-sm font-bold hover:border-zinc-900 hover:text-zinc-900 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Plus size={18} /> Add Income Source
                                    </button>
                                    {isAddingIncome && (
                                        <div className="p-4 bg-zinc-50 rounded-2xl border-2 border-zinc-900 space-y-3">
                                            <input
                                                type="text"
                                                placeholder="Salary, Freelance, etc."
                                                value={newIncome.name}
                                                onChange={e => setNewIncome({ ...newIncome, name: e.target.value })}
                                                className="w-full px-4 py-2 text-sm border border-zinc-200 rounded-xl focus:outline-none"
                                            />
                                            <div className="flex gap-2">
                                                <input
                                                    type="number"
                                                    placeholder="Amount"
                                                    value={newIncome.amount}
                                                    onChange={e => setNewIncome({ ...newIncome, amount: e.target.value })}
                                                    className="w-1/2 px-4 py-2 text-sm border border-zinc-200 rounded-xl focus:outline-none"
                                                />
                                                <select
                                                    value={newIncome.frequency}
                                                    onChange={e => setNewIncome({ ...newIncome, frequency: e.target.value as Frequency })}
                                                    className="w-1/2 px-4 py-2 text-sm border border-zinc-200 rounded-xl focus:outline-none"
                                                >
                                                    <option value="monthly">Monthly</option>
                                                    <option value="weekly">Weekly</option>
                                                </select>
                                            </div>
                                            <button
                                                onClick={handleAddIncome}
                                                className="w-full py-2 bg-zinc-900 text-white text-xs font-bold rounded-xl"
                                            >
                                                Save Income
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {setupStep === 5 && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-2">
                                        {envelopes.map(env => (
                                            <div key={env.id} className="p-3 bg-zinc-50 rounded-xl border border-zinc-100 flex flex-col gap-1">
                                                <span className="text-xs font-bold">{env.name}</span>
                                                <span className="text-[10px] font-mono opacity-60">{formatMoney(env.limit * EXCHANGE_RATES.USD, 'USD')}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setIsAddingEnvelope(true)}
                                        className="w-full py-3 border-2 border-dashed border-zinc-200 rounded-2xl text-zinc-400 text-sm font-bold hover:border-zinc-900 hover:text-zinc-900 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Plus size={18} /> Create Budget Pot
                                    </button>
                                    {isAddingEnvelope && (
                                        <div className="p-4 bg-zinc-50 rounded-2xl border-2 border-zinc-900 space-y-3">
                                            <input
                                                type="text"
                                                placeholder="Groceries, Rent, etc."
                                                value={newEnvelope.name}
                                                onChange={e => setNewEnvelope({ ...newEnvelope, name: e.target.value })}
                                                className="w-full px-4 py-2 text-sm border border-zinc-200 rounded-xl focus:outline-none"
                                            />
                                            <input
                                                type="number"
                                                placeholder="Limit"
                                                value={newEnvelope.limit}
                                                onChange={e => setNewEnvelope({ ...newEnvelope, limit: e.target.value })}
                                                className="w-full px-4 py-2 text-sm border border-zinc-200 rounded-xl focus:outline-none"
                                            />
                                            <button
                                                onClick={handleAddEnvelope}
                                                className="w-full py-2 bg-zinc-900 text-white text-xs font-bold rounded-xl"
                                            >
                                                Save Pot
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {setupStep === 6 && (
                                <div className="space-y-4">
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">{currentCurrency.symbol}</span>
                                        <input
                                            type="number"
                                            value={dailyTarget / currentCurrency.rate || ''}
                                            onChange={(e) => setDailyTarget(Number(e.target.value) * currentCurrency.rate)}
                                            placeholder="0"
                                            className="w-full pl-12 pr-4 py-4 bg-zinc-50 border-2 border-zinc-100 rounded-2xl text-xl font-bold focus:outline-none focus:border-zinc-900 transition-all"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 pt-4">
                            {setupStep > 1 && (
                                <button
                                    onClick={prevStep}
                                    className="flex-1 py-4 bg-zinc-100 text-zinc-600 text-sm font-bold rounded-2xl hover:bg-zinc-200 transition-all"
                                >
                                    Back
                                </button>
                            )}
                            <button
                                onClick={setupStep === steps.length ? () => setShowSetup(false) : nextStep}
                                className="flex-[2] py-4 bg-zinc-900 text-white text-sm font-bold rounded-2xl hover:bg-zinc-800 shadow-lg shadow-zinc-900/20 transition-all flex items-center justify-center gap-2"
                            >
                                {setupStep === steps.length ? "Finish Setup" : "Continue"}
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
