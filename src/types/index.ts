export type PaymentMethod = 'Cash' | 'MTN MoMo' | 'Airtel Money' | 'Bank' | 'Savings Group';
export type TransactionType = 'Expense' | 'Income' | 'Transfer';

export interface Transaction {
    id: number;
    name: string;
    amount: number; // Stored in UGX equivalent internally
    originalAmount: number;
    originalCurrency: string;
    date: Date;
    category: string;
    subcategory?: string;
    paymentMethod: PaymentMethod;
    transactionType: TransactionType;
    transactionId?: string; // For Mobile Money transactions
    recipient?: string; // Name or phone number
    recipientPhone?: string; // Phone number for Mobile Money
    fee?: number; // Mobile Money transaction fee
    balanceAfter?: number; // Balance from SMS after transaction
    note?: string;
    isMobileMoney: boolean; // Quick flag for Mobile Money transactions
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

export interface SeasonalReminder {
    id: number;
    name: string;
    description: string;
    date: string; // YYYY-MM-DD format
    enabled: boolean;
    userCreated: boolean; // true if created by user, false if default
}

export interface UserSettings {
    fiscalDay: number;
    hapticsEnabled: boolean;
    biometricsEnabled: boolean;
    hideBalancesOnStartup: boolean;
    theme: 'light' | 'dark' | 'vibrant';
    securityPin: string;
    displayCurrency: string;
    balance: number;
    dailyTarget: number;
    setupComplete: boolean;
    seasonalRemindersEnabled: boolean;
    smsAutoImport: boolean; // Enable automatic SMS transaction import
}
