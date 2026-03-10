import React, { useState } from 'react';
import { ShieldAlert, ArrowRight, Plus } from 'lucide-react';
import { useBudget } from '../../context/BudgetContext';
import { cn } from '../../utils/theme';
import { CURRENCIES, EXCHANGE_RATES, formatMoney } from '../../utils/currency';
import { Frequency, IncomeSource, BudgetEnvelope } from '../../types';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';


export const SetupWizard = () => {
    const {
        setShowSetup,
        displayCurrency, setDisplayCurrency,
        balance, setBalance,
        dailyTarget, setDailyTarget,
        incomes, addIncome,
        envelopes, addEnvelope,
        currentCurrency,
        updateSettings
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
        { id: 7, title: "Security", description: "Protect your data with a PIN." },
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
                                    <AnimatePresence>
                                        <div className="space-y-2">
                                            {incomes.map(inc => (
                                                <motion.div
                                                    key={inc.id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl border border-zinc-100"
                                                >
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-zinc-900">{inc.name}</span>
                                                        <span className="text-[10px] text-zinc-400 uppercase font-medium tracking-wider">{inc.frequency}</span>
                                                    </div>
                                                    <span className="text-sm font-mono font-bold text-zinc-900">{formatMoney(inc.amount * EXCHANGE_RATES.USD, 'USD')}</span>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </AnimatePresence>

                                    {!isAddingIncome && (
                                        <div className="space-y-3">
                                            <button
                                                onClick={() => setIsAddingIncome(true)}
                                                className="w-full py-4 border-2 border-dashed border-zinc-200 rounded-2xl text-zinc-400 text-sm font-bold hover:border-zinc-900 hover:text-zinc-900 transition-all flex items-center justify-center gap-2 group"
                                            >
                                                <Plus size={18} className="group-hover:rotate-90 transition-transform" /> Add Custom Income
                                            </button>
                                        </div>
                                    )}

                                    {isAddingIncome && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="p-5 bg-zinc-50 rounded-2xl border-2 border-zinc-900 space-y-4 shadow-xl"
                                        >
                                            <input
                                                type="text"
                                                placeholder="e.g. Salary, Rent Income"
                                                value={newIncome.name}
                                                onChange={e => setNewIncome({ ...newIncome, name: e.target.value })}
                                                className="w-full px-4 py-3 text-sm bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10 placeholder:text-zinc-300"
                                            />
                                            <div className="flex gap-2">
                                                <div className="relative flex-1">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">$</span>
                                                    <input
                                                        type="number"
                                                        placeholder="0.00"
                                                        value={newIncome.amount}
                                                        onChange={e => setNewIncome({ ...newIncome, amount: e.target.value })}
                                                        className="w-full pl-8 pr-4 py-3 text-sm bg-white border border-zinc-200 rounded-xl focus:outline-none"
                                                    />
                                                </div>
                                                <select
                                                    value={newIncome.frequency}
                                                    onChange={e => setNewIncome({ ...newIncome, frequency: e.target.value as Frequency })}
                                                    className="w-1/3 px-3 py-3 text-sm bg-white border border-zinc-200 rounded-xl focus:outline-none appearance-none font-medium"
                                                >
                                                    <option value="monthly">Monthly</option>
                                                    <option value="weekly">Weekly</option>
                                                </select>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => setIsAddingIncome(false)} className="flex-1 py-3 text-zinc-500 text-xs font-bold font-semibold">Cancel</button>
                                                <button
                                                    onClick={handleAddIncome}
                                                    className="flex-[2] py-3 bg-zinc-900 text-white text-xs font-bold rounded-xl shadow-lg shadow-zinc-900/20"
                                                >
                                                    Confirm Income
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            )}

                            {setupStep === 5 && (
                                <div className="space-y-4">
                                    <AnimatePresence>
                                        <div className="grid grid-cols-2 gap-2">
                                            {envelopes.map(env => (
                                                <motion.div
                                                    key={env.id}
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="p-3 bg-zinc-50 rounded-xl border border-zinc-100 flex flex-col gap-1 shadow-sm"
                                                >
                                                    <span className="text-xs font-black text-zinc-900">{env.name}</span>
                                                    <span className="text-[10px] font-mono font-bold text-zinc-500">{formatMoney(env.limit * EXCHANGE_RATES.USD, 'USD')}</span>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </AnimatePresence>

                                    {!isAddingEnvelope && (
                                        <div className="space-y-3">
                                            <button
                                                onClick={() => setIsAddingEnvelope(true)}
                                                className="w-full py-4 border-2 border-dashed border-zinc-200 rounded-2xl text-zinc-400 text-sm font-bold hover:border-zinc-900 hover:text-zinc-900 transition-all flex items-center justify-center gap-2 group"
                                            >
                                                <Plus size={18} className="group-hover:rotate-90 transition-transform" /> New Budget Pot
                                            </button>
                                        </div>
                                    )}

                                    {isAddingEnvelope && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-5 bg-zinc-50 rounded-2xl border-2 border-zinc-900 space-y-4 shadow-xl"
                                        >
                                            <input
                                                type="text"
                                                placeholder="e.g. Rent, Groceries, Savings"
                                                value={newEnvelope.name}
                                                onChange={e => setNewEnvelope({ ...newEnvelope, name: e.target.value })}
                                                className="w-full px-4 py-3 text-sm bg-white border border-zinc-200 rounded-xl focus:outline-none"
                                            />
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">$</span>
                                                <input
                                                    type="number"
                                                    placeholder="Monthly Limit"
                                                    value={newEnvelope.limit}
                                                    onChange={e => setNewEnvelope({ ...newEnvelope, limit: e.target.value })}
                                                    className="w-full pl-8 pr-4 py-3 text-sm bg-white border border-zinc-200 rounded-xl focus:outline-none"
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => setIsAddingEnvelope(false)} className="flex-1 py-3 text-zinc-500 text-xs font-bold font-semibold">Cancel</button>
                                                <button
                                                    onClick={handleAddEnvelope}
                                                    className="flex-[2] py-3 bg-zinc-900 text-white text-xs font-bold rounded-xl shadow-lg shadow-zinc-900/20"
                                                >
                                                    Confirm Pot
                                                </button>
                                            </div>
                                        </motion.div>
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

                            {setupStep === 7 && (
                                <div className="space-y-4">
                                    <div className="text-center space-y-2 mb-6">
                                        <p className="text-sm text-zinc-500">Create a 4-digit PIN to secure your app.</p>
                                    </div>
                                    <div className="flex justify-center">
                                        <input
                                            type="password"
                                            maxLength={4}
                                            placeholder="****"
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (val.length === 4) {
                                                    updateSettings({ securityPin: val });
                                                }
                                            }}
                                            className="w-32 text-center py-4 bg-zinc-50 border-2 border-zinc-100 rounded-2xl text-2xl font-black tracking-[0.5em] focus:outline-none focus:border-zinc-900 transition-all"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 pt-4">
                            {setupStep > 1 && (
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={prevStep}
                                    className="flex-1 py-4 bg-zinc-100 text-zinc-600 text-sm font-bold rounded-2xl hover:bg-zinc-200 transition-all"
                                >
                                    Back
                                </motion.button>
                            )}
                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={async () => {
                                    if (setupStep === steps.length) {
                                        await updateSettings({ setupComplete: 'true' });
                                        setShowSetup(false);
                                    } else {
                                        nextStep();
                                    }
                                }}
                                className="flex-[2] py-4 bg-zinc-900 text-white text-sm font-bold rounded-2xl hover:bg-zinc-800 shadow-lg shadow-zinc-900/20 transition-all flex items-center justify-center gap-2"
                            >
                                {setupStep === steps.length ? "Finish Setup" : "Continue"}
                                <ArrowRight size={18} />
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
