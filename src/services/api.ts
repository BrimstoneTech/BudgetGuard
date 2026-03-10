import { Transaction, Bill, BudgetEnvelope, IncomeSource, AppNotification, SavingsGoal } from '../types';

const DB_NAME = 'budgetguard_db';
const DB_VERSION = 1;

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

                const stores = [
                    'transactions',
                    'envelopes',
                    'bills',
                    'income',
                    'notifications',
                    'savings_goals'
                ];

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
}

const db = new LocalDB();

// Settings are better off in localStorage for synchronous access occasionally, but we'll use an async wrapper for compatibility.
const getSettingsFromStorage = (): Record<string, string> => {
    const data = localStorage.getItem('bg_settings');
    return data ? JSON.parse(data) : {};
};

const saveSettingsToStorage = (settings: Record<string, string>) => {
    localStorage.setItem('bg_settings', JSON.stringify(settings));
};

export const api = {
    // ---- Transactions ----
    getTransactions: () => db.getAll<Transaction>('transactions').then(txs => txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())),
    addTransaction: async (tx: Omit<Transaction, 'id'>) => {
        // Handle envelope deduction logic internally like the old backend did
        if (tx.category) {
            const envelopes = await db.getAll<BudgetEnvelope>('envelopes');
            const env = envelopes.find(e => e.name === tx.category);
            if (env) {
                await db.update('envelopes', { ...env, spent: (env.spent || 0) + tx.amount });
            }
        }
        return { id: await db.add('transactions', tx) };
    },
    deleteTransaction: async (id: number) => {
        await db.delete('transactions', id);
        return { success: true };
    },

    // ---- Envelopes ----
    getEnvelopes: () => db.getAll<BudgetEnvelope>('envelopes'),
    addEnvelope: async (env: Omit<BudgetEnvelope, 'id' | 'spent'>) => ({ id: await db.add('envelopes', { ...env, spent: 0 }) }),
    deleteEnvelope: async (id: number) => {
        await db.delete('envelopes', id);
        return { success: true };
    },

    // ---- Bills ----
    getBills: () => db.getAll<Bill>('bills'),
    addBill: async (bill: Omit<Bill, 'id'>) => ({ id: await db.add('bills', bill) }),
    deleteBill: async (id: number) => {
        await db.delete('bills', id);
        return { success: true };
    },

    // ---- Incomes ----
    getIncomes: () => db.getAll<IncomeSource>('income'),
    addIncome: async (inc: Omit<IncomeSource, 'id'>) => ({ id: await db.add('income', inc) }),
    deleteIncome: async (id: number) => {
        await db.delete('income', id);
        return { success: true };
    },

    // ---- Notifications ----
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

    // ---- Settings ----
    getSettings: async () => getSettingsFromStorage(),
    updateSettings: async (entries: Record<string, string | number | boolean>) => {
        const current = getSettingsFromStorage();
        for (const [key, value] of Object.entries(entries)) {
            current[key] = String(value);
        }
        saveSettingsToStorage(current);
        return { success: true };
    },

    // ---- Savings Goals ----
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

    // ---- Utility ----
    resetDatabase: async () => {
        localStorage.removeItem('bg_settings');
        return new Promise<void>((resolve, reject) => {
            const req = indexedDB.deleteDatabase(DB_NAME);
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    }
};
