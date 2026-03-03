import { Transaction, Bill, BudgetEnvelope, IncomeSource, AppNotification } from '../types';

const API_BASE_URL = 'http://127.0.0.1:3000/api'; // Base endpoint for our Express server

async function fetcher<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options
    });
    if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
    }
    return response.json();
}

export const api = {
    // ---- Transactions ----
    getTransactions: () => fetcher<Transaction[]>('/transactions'),
    addTransaction: (tx: Omit<Transaction, 'id'>) => fetcher<{ id: number }>('/transactions', {
        method: 'POST',
        body: JSON.stringify(tx)
    }),
    deleteTransaction: (id: number) => fetcher<{ success: boolean }>(`/transactions/${id}`, { method: 'DELETE' }),

    // ---- Envelopes ----
    getEnvelopes: () => fetcher<BudgetEnvelope[]>('/envelopes'),
    addEnvelope: (env: Omit<BudgetEnvelope, 'id' | 'spent'>) => fetcher<{ id: number }>('/envelopes', {
        method: 'POST',
        body: JSON.stringify(env)
    }),
    deleteEnvelope: (id: number) => fetcher<{ success: boolean }>(`/envelopes/${id}`, { method: 'DELETE' }),

    // ---- Bills ----
    getBills: () => fetcher<Bill[]>('/bills'),
    addBill: (bill: Omit<Bill, 'id'>) => fetcher<{ id: number }>('/bills', {
        method: 'POST',
        body: JSON.stringify(bill)
    }),
    deleteBill: (id: number) => fetcher<{ success: boolean }>(`/bills/${id}`, { method: 'DELETE' }),

    // ---- Incomes ----
    getIncomes: () => fetcher<IncomeSource[]>('/income'),
    addIncome: (inc: Omit<IncomeSource, 'id'>) => fetcher<{ id: number }>('/income', {
        method: 'POST',
        body: JSON.stringify(inc)
    }),
    deleteIncome: (id: number) => fetcher<{ success: boolean }>(`/income/${id}`, { method: 'DELETE' }),

    // ---- Notifications ----
    getNotifications: () => fetcher<AppNotification[]>('/notifications'),
    addNotification: (notif: Omit<AppNotification, 'id' | 'read'>) => fetcher<{ id: number }>('/notifications', {
        method: 'POST',
        body: JSON.stringify(notif)
    }),
    markNotificationRead: (id: number) => fetcher<{ success: boolean }>(`/notifications/${id}/read`, { method: 'PATCH' }),
    deleteNotification: (id: number) => fetcher<{ success: boolean }>(`/notifications/${id}`, { method: 'DELETE' }),

    // ---- Settings (e.g. Balance, Target, Currency) ----
    getSettings: () => fetcher<Record<string, string>>('/settings'),
    updateSettings: (entries: Record<string, string | number | boolean>) => fetcher<{ success: boolean }>('/settings', {
        method: 'POST',
        body: JSON.stringify({ entries })
    })
};
