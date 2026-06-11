import { Transaction, Bill, BudgetEnvelope, IncomeSource, AppNotification, SavingsGoal, SeasonalReminder } from '../types';

const DB_NAME = 'budgetguard_db';
const DB_VERSION = 2;

class LocalDB {
    private db: IDBDatabase | null = null;

    async init(): Promise<IDBDatabase> {
        if (this.db) return this.db;
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };
            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                const stores = ['transactions', 'envelopes', 'bills', 'income', 'notifications', 'savings_goals', 'seasonal_reminders'];
                for (const store of stores) {
                    if (!db.objectStoreNames.contains(store)) {
                        db.createObjectStore(store, { keyPath: 'id', autoIncrement: true });
                    }
                }
            };
        });
    }

    async getAll<T>(storeName: string): Promise<T[]> {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }

    async get<T>(storeName: string, id: number): Promise<T> {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(id);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }

    async add<T>(storeName: string, item: Omit<T, 'id'>): Promise<number> {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.add(item);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result as number);
        });
    }

    async update<T>(storeName: string, item: T): Promise<void> {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(item);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }

    async delete(storeName: string, id: number): Promise<void> {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }

    async clearStore(storeName: string): Promise<void> {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }
}

const db = new LocalDB();

const getSettingsFromStorage = (): Record<string, string> => {
    const data = localStorage.getItem('bg_settings');
    return data ? JSON.parse(data) : {};
};

const saveSettingsToStorage = (settings: Record<string, string>) => {
    localStorage.setItem('bg_settings', JSON.stringify(settings));
};

export const api = {
    getTransactions: () => db.getAll<Transaction>('transactions').then(txs => txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())),
    addTransaction: async (tx: Omit<Transaction, 'id'>) => {
        const transactionWithDefaults = {
            name: tx.name,
            amount: tx.amount,
            originalAmount: tx.originalAmount || Math.abs(tx.amount),
            originalCurrency: tx.originalCurrency || 'UGX',
            date: tx.date || new Date(),
            category: tx.category || 'General',
            subcategory: tx.subcategory,
            paymentMethod: tx.paymentMethod || 'Cash',
            transactionType: tx.transactionType || (tx.amount >= 0 ? 'Income' : 'Expense'),
            transactionId: tx.transactionId,
            recipient: tx.recipient,
            recipientPhone: tx.recipientPhone,
            fee: tx.fee || 0,
            balanceAfter: tx.balanceAfter,
            note: tx.note,
            isMobileMoney: tx.isMobileMoney || false
        };
        if (transactionWithDefaults.category) {
            const envelopes = await db.getAll<BudgetEnvelope>('envelopes');
            const env = envelopes.find(e => e.name === transactionWithDefaults.category);
            if (env) {
                await db.update('envelopes', { ...env, spent: (env.spent || 0) + Math.abs(transactionWithDefaults.amount) });
            }
        }
        return { id: await db.add('transactions', transactionWithDefaults) };
    },
    deleteTransaction: async (id: number) => {
        await db.delete('transactions', id);
        return { success: true };
    },
    getEnvelopes: () => db.getAll<BudgetEnvelope>('envelopes'),
    addEnvelope: async (env: Omit<BudgetEnvelope, 'id' | 'spent'>) => ({ id: await db.add('envelopes', { ...env, spent: 0 }) }),
    deleteEnvelope: async (id: number) => {
        await db.delete('envelopes', id);
        return { success: true };
    },
    getBills: () => db.getAll<Bill>('bills'),
    addBill: async (bill: Omit<Bill, 'id'>) => ({ id: await db.add('bills', bill) }),
    deleteBill: async (id: number) => {
        await db.delete('bills', id);
        return { success: true };
    },
    getIncomes: () => db.getAll<IncomeSource>('income'),
    addIncome: async (inc: Omit<IncomeSource, 'id'>) => ({ id: await db.add('income', inc) }),
    deleteIncome: async (id: number) => {
        await db.delete('income', id);
        return { success: true };
    },
    getNotifications: () => db.getAll<AppNotification>('notifications').then(n => n.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())),
    addNotification: async (notif: Omit<AppNotification, 'id' | 'read'>) => ({ id: await db.add('notifications', { ...notif, read: false }) }),
    markNotificationRead: async (id: number) => {
        const notif = await db.get<AppNotification>('notifications', id);
        if (notif) {
            await db.update('notifications', { ...notif, read: true });
        }
        return { success: true };
    },
    deleteNotification: async (id: number) => {
        await db.delete('notifications', id);
        return { success: true };
    },
    getSettings: async () => getSettingsFromStorage(),
    updateSettings: async (entries: Record<string, string | number | boolean>) => {
        const current = getSettingsFromStorage();
        for (const [key, value] of Object.entries(entries)) {
            current[key] = String(value);
        }
        saveSettingsToStorage(current);
        return { success: true };
    },
    getSavingsGoals: () => db.getAll<SavingsGoal>('savings_goals'),
    addSavingsGoal: async (goal: Omit<SavingsGoal, 'id' | 'currentAmount' | 'tasks'>) => {
        return { id: await db.add('savings_goals', { ...goal, currentAmount: 0, tasks: [] }) };
    },
    addFundsToGoal: async (id: number, amount: number) => {
        const goal = await db.get<SavingsGoal>('savings_goals', id);
        if (goal) {
            await db.update('savings_goals', { ...goal, currentAmount: goal.currentAmount + amount });
        }
        return { success: true };
    },
    deleteSavingsGoal: async (id: number) => {
        await db.delete('savings_goals', id);
        return { success: true };
    },
    getSeasonalReminders: async () => {
        try {
            return await db.getAll<SeasonalReminder>('seasonal_reminders');
        } catch (e) {
            return [];
        }
    },
    saveSeasonalReminders: async (reminders: SeasonalReminder[]) => {
        await db.clearStore('seasonal_reminders');
        for (const reminder of reminders) {
            await db.add('seasonal_reminders', reminder);
        }
        return { success: true };
    },
    resetDatabase: async () => {
        localStorage.removeItem('bg_settings');
        return new Promise<void>((resolve, reject) => {
            const req = indexedDB.deleteDatabase(DB_NAME);
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    }
};
