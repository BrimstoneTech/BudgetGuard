import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { Transaction, Bill, IncomeSource, BudgetEnvelope, AppNotification } from '../types';
import { CURRENCIES, EXCHANGE_RATES } from '../utils/currency';
import { isSameDay, addDays, differenceInDays, format } from 'date-fns';
import { api } from '../services/api';

interface BudgetContextType {
    showSetup: boolean;
    setShowSetup: React.Dispatch<React.SetStateAction<boolean>>;
    displayCurrency: string;
    setDisplayCurrency: (val: string) => Promise<void>;
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

    todaySpend: number;
    yesterdaySpend: number;
    efficiency: number;
    currentCurrency: { code: string; symbol: string; rate: number };
    projectionData: any[];
    daysUntilZero: number;
    alertLevel: { color: string; text: string; icon: any };
    isDataLoaded: boolean;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const BudgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [showSetup, setShowSetup] = useState(true);
    const [displayCurrency, setLocalDisplayCurrency] = useState('UGX');
    const [balance, setLocalBalance] = useState(0);
    const [dailyTarget, setLocalDailyTarget] = useState(0);

    const [transactions, setLocalTransactions] = useState<Transaction[]>([]);
    const [bills, setLocalBills] = useState<Bill[]>([]);
    const [envelopes, setLocalEnvelopes] = useState<BudgetEnvelope[]>([]);
    const [incomes, setLocalIncomes] = useState<IncomeSource[]>([]);
    const [notifications, setLocalNotifications] = useState<AppNotification[]>([]);
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    // Initial Data Fetch
    const loadData = useCallback(async () => {
        try {
            const [txs, blls, envs, incs, notifs, sttngs] = await Promise.all([
                api.getTransactions(),
                api.getBills(),
                api.getEnvelopes(),
                api.getIncomes(),
                api.getNotifications(),
                api.getSettings()
            ]);

            setLocalTransactions(txs);
            setLocalBills(blls);
            setLocalEnvelopes(envs);
            setLocalIncomes(incs);
            setLocalNotifications(notifs);

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
            current -= dailyTarget;

            bills.forEach(bill => {
                if (isSameDay(new Date(bill.date), date)) current -= bill.amount;
            });

            incomes.forEach(income => {
                const start = new Date(income.startDate);
                if (income.frequency === 'once' && isSameDay(start, date)) current += income.amount;
                else if (income.frequency === 'weekly' && differenceInDays(date, start) >= 0 && differenceInDays(date, start) % 7 === 0) current += income.amount;
                else if (income.frequency === 'bi-weekly' && differenceInDays(date, start) >= 0 && differenceInDays(date, start) % 14 === 0) current += income.amount;
                else if (income.frequency === 'monthly' && date.getDate() === start.getDate()) current += income.amount;
            });

            data.push({ date: format(date, 'MMM dd'), balance: Math.max(0, current), isZero: current <= 0 });
        }
        return data;
    }, [balance, incomes, bills, dailyTarget]);

    const daysUntilZero = useMemo(() => {
        const zeroIndex = projectionData.findIndex(d => d.balance <= 0);
        return zeroIndex === -1 ? 30 : zeroIndex;
    }, [projectionData]);

    const alertLevel = useMemo(() => {
        if (daysUntilZero < 3) return { color: "rose", text: "CRITICAL", icon: null };
        if (daysUntilZero < 7) return { color: "amber", text: "WARNING", icon: null };
        return { color: "emerald", text: "HEALTHY", icon: null };
    }, [daysUntilZero]);

    return (
        <BudgetContext.Provider value={{
            showSetup, setShowSetup,
            displayCurrency, setDisplayCurrency,
            balance, setBalance,
            dailyTarget, setDailyTarget,
            transactions, addTransaction, deleteTransaction,
            bills, addBill, deleteBill,
            envelopes, addEnvelope, deleteEnvelope,
            incomes, addIncome, deleteIncome,
            notifications, addNotification, markNotificationRead, deleteNotification,
            todaySpend, yesterdaySpend, efficiency,
            currentCurrency, projectionData, daysUntilZero, alertLevel, isDataLoaded
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
