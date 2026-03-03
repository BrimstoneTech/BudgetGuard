import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { Transaction, Bill, IncomeSource, BudgetEnvelope, AppNotification } from '../types';
import { CURRENCIES, EXCHANGE_RATES } from '../utils/currency';
import { isSameDay, addDays, differenceInDays, format } from 'date-fns';

interface BudgetContextType {
    showSetup: boolean;
    setShowSetup: React.Dispatch<React.SetStateAction<boolean>>;
    displayCurrency: string;
    setDisplayCurrency: React.Dispatch<React.SetStateAction<string>>;
    balance: number;
    setBalance: React.Dispatch<React.SetStateAction<number>>;
    dailyTarget: number;
    setDailyTarget: React.Dispatch<React.SetStateAction<number>>;
    transactions: Transaction[];
    setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
    bills: Bill[];
    setBills: React.Dispatch<React.SetStateAction<Bill[]>>;
    envelopes: BudgetEnvelope[];
    setEnvelopes: React.Dispatch<React.SetStateAction<BudgetEnvelope[]>>;
    incomes: IncomeSource[];
    setIncomes: React.Dispatch<React.SetStateAction<IncomeSource[]>>;
    notifications: AppNotification[];
    setNotifications: React.Dispatch<React.SetStateAction<AppNotification[]>>;

    todaySpend: number;
    yesterdaySpend: number;
    efficiency: number;
    currentCurrency: { code: string; symbol: string; rate: number };
    projectionData: any[];
    daysUntilZero: number;
    alertLevel: { color: string; text: string; icon: any };
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const BudgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [showSetup, setShowSetup] = useState(true);
    const [displayCurrency, setDisplayCurrency] = useState('UGX');
    const [balance, setBalance] = useState(0);
    const [dailyTarget, setDailyTarget] = useState(0);

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [bills, setBills] = useState<Bill[]>([]);
    const [envelopes, setEnvelopes] = useState<BudgetEnvelope[]>([]);
    const [incomes, setIncomes] = useState<IncomeSource[]>([]);
    const [notifications, setNotifications] = useState<AppNotification[]>([]);

    // Computed Values
    const todaySpend = useMemo(() => {
        const today = new Date();
        return transactions
            .filter(tx => isSameDay(tx.date, today))
            .reduce((sum, tx) => sum + tx.amount, 0);
    }, [transactions]);

    const yesterdaySpend = useMemo(() => {
        const yesterday = addDays(new Date(), -1);
        return transactions
            .filter(tx => isSameDay(tx.date, yesterday))
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
            current -= dailyTarget; // Note: original code subtracted dailyTarget

            bills.forEach(bill => {
                if (isSameDay(bill.date, date)) current -= bill.amount;
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
            transactions, setTransactions,
            bills, setBills,
            envelopes, setEnvelopes,
            incomes, setIncomes,
            notifications, setNotifications,
            todaySpend, yesterdaySpend, efficiency,
            currentCurrency, projectionData, daysUntilZero, alertLevel
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
