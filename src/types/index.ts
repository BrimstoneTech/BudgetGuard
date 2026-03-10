export interface Transaction {
    id: number;
    name: string;
    amount: number; // Stored in UGX equivalent internally
    originalAmount: number;
    originalCurrency: string;
    date: Date;
    category: string;
    note?: string;
}

export interface Bill {
    id: number;
    name: string;
    amount: number;
    date: Date;
    category: string;
}

export type Frequency = 'once' | 'weekly' | 'bi-weekly' | 'monthly';

export interface IncomeSource {
    id: number;
    name: string;
    amount: number;
    frequency: Frequency;
    startDate: Date;
}

export interface BudgetEnvelope {
    id: number;
    name: string;
    limit: number;
    spent: number;
    period: 'weekly' | 'monthly';
    color: string;
}

export interface AppNotification {
    id: number;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'critical' | 'success';
    date: Date;
    read: boolean;
}

export interface SavingsGoal {
    id: number;
    name: string;
    targetAmount: number;
    currentAmount: number;
    color: string;
    deadline?: string;
    tasks: { id: number; text: string; completed: boolean }[];
}
