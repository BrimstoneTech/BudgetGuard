import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { Transaction, Bill, IncomeSource, BudgetEnvelope, AppNotification, SavingsGoal } from '../types';
import { CURRENCIES, EXCHANGE_RATES } from '../utils/currency';
import { isSameDay, addDays, differenceInDays, format } from 'date-fns';
import { api } from '../services/api';

interface BudgetContextType {
    showSetup: boolean;
    setShowSetup: React.Dispatch<React.SetStateAction<boolean>>;
    setDisplayCurrency: (val: string) => Promise<void>;
    privacyMode: boolean;
    togglePrivacyMode: () => void;
    balance: number;
    setBalance: (val: number) => Promise<void>;
    dailyTarget: number;
    setDailyTarget: (val: number) => Promise<void>;

    transactions: Transaction[];
    addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<void>;
    deleteTransaction: (id: number) => Promise<void>;

    bills: Bill[];
    addBill: (bill: Omit<Bill, 'id'>) => Promise<void>;
    deleteBill: (id: number) => Promise<void>;

    envelopes: BudgetEnvelope[];
    addEnvelope: (env: Omit<BudgetEnvelope, 'id' | 'spent'>) => Promise<void>;
    deleteEnvelope: (id: number) => Promise<void>;

    incomes: IncomeSource[];
    addIncome: (inc: Omit<IncomeSource, 'id'>) => Promise<void>;
    deleteIncome: (id: number) => Promise<void>;

    notifications: AppNotification[];
    addNotification: (notif: Omit<AppNotification, 'id' | 'read'>) => Promise<void>;
    markNotificationRead: (id: number) => Promise<void>;
    deleteNotification: (id: number) => Promise<void>;

    savingsGoals: SavingsGoal[];
    addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'currentAmount' | 'tasks'>) => Promise<void>;
    addFundsToGoal: (id: number, amount: number) => Promise<void>;
    toggleSavingsTask: (goalId: number, taskId: number) => Promise<void>;
    deleteSavingsGoal: (id: number) => Promise<void>;

    todaySpend: number;
    yesterdaySpend: number;
    efficiency: number;
    currentCurrency: { code: string; symbol: string; rate: number };
    projectionData: any[];
    daysUntilZero: number;
    alertLevel: { color: string; text: string; icon: any };
    isDataLoaded: boolean;
    suggestCategory: (merchantName: string) => string | null;
    settings: {
        fiscalDay: number;
        hapticsEnabled: boolean;
        biometricsEnabled: boolean;
        hideBalancesOnStartup: boolean;
        theme: 'light' | 'dark' | 'vibrant';
        securityPin: string;
    };
    updateSettings: (newSettings: any) => Promise<void>;
    resetApp: () => Promise<void>;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const BudgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [showSetup, setShowSetup] = useState(true);
    const [displayCurrency, setLocalDisplayCurrency] = useState('UGX');
    const [privacyMode, setPrivacyMode] = useState(false);
    const [balance, setLocalBalance] = useState(0);
    const [dailyTarget, setLocalDailyTarget] = useState(0);

    const [transactions, setLocalTransactions] = useState<Transaction[]>([]);
    const [bills, setLocalBills] = useState<Bill[]>([]);
    const [envelopes, setLocalEnvelopes] = useState<BudgetEnvelope[]>([]);
    const [incomes, setLocalIncomes] = useState<IncomeSource[]>([]);
    const togglePrivacyMode = () => setPrivacyMode(prev => !prev);
    const [notifications, setLocalNotifications] = useState<AppNotification[]>([]);
    const [savingsGoals, setLocalSavingsGoals] = useState<SavingsGoal[]>([]);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [settings, setSettings] = useState({
        fiscalDay: 1,
        hapticsEnabled: true,
        biometricsEnabled: true,
        hideBalancesOnStartup: false,
        theme: 'light' as 'light' | 'dark' | 'vibrant',
        securityPin: ''
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', settings.theme);
    }, [settings.theme]);

    // Initial Data Fetch
    const loadData = useCallback(async () => {
        try {
            const [txs, blls, envs, incs, notifs, sttngs, goals] = await Promise.all([
                api.getTransactions(),
                api.getBills(),
                api.getEnvelopes(),
                api.getIncomes(),
                api.getNotifications(),
                api.getSettings(),
                api.getSavingsGoals()
            ]);

            setLocalTransactions(txs);
            setLocalBills(blls);
            setLocalEnvelopes(envs);
            setLocalIncomes(incs);
            setLocalNotifications(notifs);
            setLocalSavingsGoals(goals);

            if (sttngs.balance) setLocalBalance(Number(sttngs.balance));
            if (sttngs.dailyTarget) setLocalDailyTarget(Number(sttngs.dailyTarget));
            if (sttngs.displayCurrency) setLocalDisplayCurrency(sttngs.displayCurrency);

            // If we have settings saved, hide the setup wizard
            if (sttngs.setupComplete === 'true') {
                setShowSetup(false);
            }

            setIsDataLoaded(true);
        } catch (error) {
            console.error("Failed to load initial data", error);
            // Fallback for offline mode could be added here
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Automated Reminders
    useEffect(() => {
        if (!isDataLoaded) return;

        const checkGoals = () => {
            savingsGoals.forEach(goal => {
                const percent = (goal.currentAmount / goal.targetAmount) * 100;
                if (percent >= 100) {
                    addNotification({
                        title: "Goal Reached! 🎉",
                        message: `Congratulations! You've hit your target for ${goal.name}.`,
                        type: 'success',
                        date: new Date()
                    });
                } else if (percent >= 80) {
                    addNotification({
                        title: "Almost There!",
                        message: `You're 80% of the way to your ${goal.name} goal. Keep going!`,
                        type: 'info',
                        date: new Date()
                    });
                }
            });
        };

        const timer = setTimeout(checkGoals, 5000); // Check once after load
        return () => clearTimeout(timer);
    }, [isDataLoaded, savingsGoals.length]);


    // Mutator Wrappers
    const setDisplayCurrency = async (val: string) => {
        setLocalDisplayCurrency(val);
        await api.updateSettings({ displayCurrency: val });
    };

    const setBalance = async (val: number) => {
        setLocalBalance(val);
        await api.updateSettings({ balance: val });
    };

    const setDailyTarget = async (val: number) => {
        setLocalDailyTarget(val);
        await api.updateSettings({ dailyTarget: val });
    };

    const addTransaction = async (tx: Omit<Transaction, 'id'>) => {
        try {
            const { id } = await api.addTransaction(tx);
            setLocalTransactions([{ ...tx, id }, ...transactions]);
            // If it modifies an envelope, reload envelopes
            if (tx.category) {
                const refreshedEnvs = await api.getEnvelopes();
                setLocalEnvelopes(refreshedEnvs);
            }
        } catch (e) { console.error('Failed to add transaction', e); }
    };

    const deleteTransaction = async (id: number) => {
        await api.deleteTransaction(id);
        setLocalTransactions(transactions.filter(t => t.id !== id));
    };

    const addBill = async (bill: Omit<Bill, 'id'>) => {
        const { id } = await api.addBill(bill);
        setLocalBills([...bills, { ...bill, id }]);
    };

    const deleteBill = async (id: number) => {
        await api.deleteBill(id);
        setLocalBills(bills.filter(b => b.id !== id));
    };

    const addEnvelope = async (env: Omit<BudgetEnvelope, 'id' | 'spent'>) => {
        const { id } = await api.addEnvelope(env);
        setLocalEnvelopes([...envelopes, { ...env, id, spent: 0 }]);
    };

    const deleteEnvelope = async (id: number) => {
        await api.deleteEnvelope(id);
        setLocalEnvelopes(envelopes.filter(e => e.id !== id));
    };

    const addIncome = async (inc: Omit<IncomeSource, 'id'>) => {
        const { id } = await api.addIncome(inc);
        setLocalIncomes([...incomes, { ...inc, id }]);
    };

    const deleteIncome = async (id: number) => {
        await api.deleteIncome(id);
        setLocalIncomes(incomes.filter(i => i.id !== id));
    };

    const addNotification = async (notif: Omit<AppNotification, 'id' | 'read'>) => {
        const { id } = await api.addNotification(notif);
        setLocalNotifications([{ ...notif, id, read: false }, ...notifications]);
    };

    const markNotificationRead = async (id: number) => {
        await api.markNotificationRead(id);
        setLocalNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const deleteNotification = async (id: number) => {
        await api.deleteNotification(id);
        setLocalNotifications(notifications.filter(n => n.id !== id));
    };

    const addSavingsGoal = async (goal: Omit<SavingsGoal, 'id' | 'currentAmount' | 'tasks'>) => {
        const { id } = await api.addSavingsGoal(goal);
        setLocalSavingsGoals([...savingsGoals, { ...goal, id, currentAmount: 0, tasks: [] }]);
    };

    const addFundsToGoal = async (id: number, amount: number) => {
        await api.addFundsToGoal(id, amount);
        setLocalSavingsGoals(savingsGoals.map(g => g.id === id ? { ...g, currentAmount: g.currentAmount + amount } : g));
    };

    const toggleSavingsTask = async (goalId: number, taskId: number) => {
        // Optimistic UI update
        const updatedGoals = savingsGoals.map(g => {
            if (g.id === goalId) {
                return {
                    ...g,
                    tasks: g.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
                };
            }
            return g;
        });
        setLocalSavingsGoals(updatedGoals);
        // In a real app, we'd call api.toggleTask(goalId, taskId)
    };

    const deleteSavingsGoal = async (id: number) => {
        await api.deleteSavingsGoal(id);
        setLocalSavingsGoals(savingsGoals.filter(g => g.id !== id));
    };

    // Computed Values
    const todaySpend = useMemo(() => {
        const today = new Date();
        return transactions
            .filter(tx => isSameDay(new Date(tx.date), today))
            .reduce((sum, tx) => sum + tx.amount, 0);
    }, [transactions]);

    const yesterdaySpend = useMemo(() => {
        const yesterday = addDays(new Date(), -1);
        return transactions
            .filter(tx => isSameDay(new Date(tx.date), yesterday))
            .reduce((sum, tx) => sum + tx.amount, 0);
    }, [transactions]);

    const efficiency = useMemo(() => {
        if (dailyTarget <= 0) return 100;
        const eff = ((dailyTarget - todaySpend) / dailyTarget) * 100;
        return Math.max(-100, Math.min(100, eff));
    }, [todaySpend, dailyTarget]);

    const currentCurrency = useMemo(() =>
        CURRENCIES.find(c => c.code === displayCurrency) || CURRENCIES[0],
        [displayCurrency]);

    const projectionData = useMemo(() => {
        let current = balance;
        const data = [];
        const today = new Date();

        for (let i = 0; i < 30; i++) {
            const date = addDays(today, i);

            // Only subtract daily target if it's not the first day (we might have already spent today)
            if (i > 0) current -= dailyTarget;

            // Handle bills on their specific day
            bills.forEach(bill => {
                if (isSameDay(new Date(bill.date), date)) current -= (bill.amount * EXCHANGE_RATES.USD); // Normalize to UGX
            });

            // Handle income based on frequency
            incomes.forEach(income => {
                const start = new Date(income.startDate);
                const ugxAmount = income.amount * EXCHANGE_RATES.USD; // Normalize to UGX

                if (income.frequency === 'once' && isSameDay(start, date)) {
                    current += ugxAmount;
                } else if (income.frequency === 'weekly' && differenceInDays(date, start) >= 0 && differenceInDays(date, start) % 7 === 0) {
                    current += ugxAmount;
                } else if (income.frequency === 'bi-weekly' && differenceInDays(date, start) >= 0 && differenceInDays(date, start) % 14 === 0) {
                    current += ugxAmount;
                } else if (income.frequency === 'monthly' && date.getDate() === start.getDate() && differenceInDays(date, start) >= 0) {
                    current += ugxAmount;
                }
            });

            data.push({
                date: format(date, 'MMM dd'),
                balance: Math.max(0, current),
                isZero: current <= 0
            });
        }
        return data;
    }, [balance, incomes, bills, dailyTarget]);

    const daysUntilZero = useMemo(() => {
        const zeroIndex = projectionData.findIndex(d => d.balance <= 0);
        return zeroIndex === -1 ? 30 : zeroIndex;
    }, [projectionData]);

    const alertLevel = useMemo(() => {
        if (daysUntilZero < 3) return { color: "rose", text: "CRITICAL", icon: 'AlertCircle' };
        if (daysUntilZero < 10) return { color: "amber", text: "WARNING", icon: 'AlertTriangle' };
        return { color: "emerald", text: "HEALTHY", icon: 'ShieldCheck' };
    }, [daysUntilZero]);

    const suggestCategory = useCallback((merchantName: string) => {
        if (!merchantName) return null;
        const lastTx = transactions.find(tx =>
            tx.name.toLowerCase().trim() === merchantName.toLowerCase().trim()
        );
        return lastTx ? lastTx.category : null;
    }, [transactions]);

    return (
        <BudgetContext.Provider value={{
            showSetup, setShowSetup,
            displayCurrency, setDisplayCurrency,
            privacyMode, togglePrivacyMode,
            balance, setBalance,
            dailyTarget, setDailyTarget,
            transactions, addTransaction, deleteTransaction,
            bills, addBill, deleteBill,
            envelopes, addEnvelope, deleteEnvelope,
            incomes, addIncome, deleteIncome,
            notifications, addNotification, markNotificationRead, deleteNotification,
            savingsGoals, addSavingsGoal, addFundsToGoal, toggleSavingsTask, deleteSavingsGoal,
            todaySpend, yesterdaySpend, efficiency,
            currentCurrency, projectionData, daysUntilZero, alertLevel, isDataLoaded,
            suggestCategory,
            settings,
            updateSettings: async (newSettings: any) => {
                const updated = { ...settings, ...newSettings };
                setSettings(updated);
                await api.updateSettings(newSettings);
            },
            resetApp: async () => {
                await api.resetDatabase();
                window.location.reload();
            }
        }}>
            {children}
        </BudgetContext.Provider>
    );
};

export const useBudget = () => {
    const context = useContext(BudgetContext);
    if (!context) throw new Error("useBudget must be used within BudgetProvider");
    return context;
};
