import { Router } from 'express';
import db from '../db.js';

const router = Router();

// --- Transactions ---
router.get('/transactions', (req, res) => {
    const transactions = db.prepare('SELECT * FROM transactions ORDER BY date DESC').all();
    res.json(transactions);
});

router.post('/transactions', (req, res) => {
    const { name, amount, originalAmount, originalCurrency, date, category, note } = req.body;
    const stmt = db.prepare('INSERT INTO transactions (name, amount, originalAmount, originalCurrency, date, category, note) VALUES (?, ?, ?, ?, ?, ?, ?)');
    const result = stmt.run(name, amount, originalAmount, originalCurrency, date, category, note);

    if (category) {
        db.prepare('UPDATE budget_envelopes SET spent = spent + ? WHERE name = ?').run(amount, category);
    }

    res.json({ id: result.lastInsertRowid });
});

router.delete('/transactions/:id', (req, res) => {
    const { id } = req.params;
    db.prepare('DELETE FROM transactions WHERE id = ?').run(id);
    res.json({ success: true });
});

// --- Bills ---
router.get('/bills', (req, res) => {
    const bills = db.prepare('SELECT * FROM bills ORDER BY date ASC').all();
    res.json(bills);
});

router.post('/bills', (req, res) => {
    const { name, amount, date, category } = req.body;
    const stmt = db.prepare('INSERT INTO bills (name, amount, date, category) VALUES (?, ?, ?, ?)');
    const result = stmt.run(name, amount, date, category);
    res.json({ id: result.lastInsertRowid });
});

router.delete('/bills/:id', (req, res) => {
    db.prepare('DELETE FROM bills WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

// --- Envelopes ---
router.get('/envelopes', (req, res) => {
    const envelopes = db.prepare('SELECT * FROM budget_envelopes').all() as any[];
    res.json(envelopes.map(e => ({ ...e, limit: e.envelope_limit })));
});

router.post('/envelopes', (req, res) => {
    const { name, limit, period, color } = req.body;
    const stmt = db.prepare('INSERT INTO budget_envelopes (name, envelope_limit, spent, period, color) VALUES (?, ?, 0, ?, ?)');
    const result = stmt.run(name, limit, period, color);
    res.json({ id: result.lastInsertRowid });
});

router.delete('/envelopes/:id', (req, res) => {
    db.prepare('DELETE FROM budget_envelopes WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

// --- Income ---
router.get('/income', (req, res) => {
    const income = db.prepare('SELECT * FROM income_sources').all();
    res.json(income);
});

router.post('/income', (req, res) => {
    const { name, amount, frequency, startDate } = req.body;
    const stmt = db.prepare('INSERT INTO income_sources (name, amount, frequency, startDate) VALUES (?, ?, ?, ?)');
    const result = stmt.run(name, amount, frequency, startDate);
    res.json({ id: result.lastInsertRowid });
});

router.delete('/income/:id', (req, res) => {
    db.prepare('DELETE FROM income_sources WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

// --- Settings ---
router.get('/settings', (req, res) => {
    const settings = db.prepare('SELECT * FROM settings').all() as { key: string, value: string }[];
    const settingsObj = Object.fromEntries(settings.map(s => [s.key, s.value]));
    res.json(settingsObj);
});

router.post('/settings', (req, res) => {
    const { entries } = req.body; // { key1: val1, key2: val2 }
    const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    const insertMany = db.transaction((items: Record<string, string>) => {
        for (const [key, value] of Object.entries(items)) {
            stmt.run(key, String(value));
        }
    });
    insertMany(entries);
    res.json({ success: true });
});

// --- Notifications ---
router.get('/notifications', (req, res) => {
    const notifs = db.prepare('SELECT * FROM app_notifications ORDER BY date DESC').all();
    res.json(notifs);
});

router.post('/notifications', (req, res) => {
    const { title, message, type, date } = req.body;
    const stmt = db.prepare('INSERT INTO app_notifications (title, message, type, date) VALUES (?, ?, ?, ?)');
    const result = stmt.run(title, message, type, date);
    res.json({ id: result.lastInsertRowid });
});

router.patch('/notifications/:id/read', (req, res) => {
    db.prepare('UPDATE app_notifications SET read = 1 WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

router.delete('/notifications/:id', (req, res) => {
    db.prepare('DELETE FROM app_notifications WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

// --- Savings Goals ---
router.get('/savings_goals', (req, res) => {
    const goals = db.prepare('SELECT id, name, target_amount as targetAmount, current_amount as currentAmount, color, deadline FROM savings_goals').all();
    res.json(goals);
});

router.post('/savings_goals', (req, res) => {
    const { name, targetAmount, color, deadline } = req.body;
    const stmt = db.prepare('INSERT INTO savings_goals (name, target_amount, current_amount, color, deadline) VALUES (?, ?, 0, ?, ?)');
    const result = stmt.run(name, targetAmount, color, deadline);
    res.json({ id: result.lastInsertRowid });
});

router.patch('/savings_goals/:id/fund', (req, res) => {
    const { amount } = req.body;
    db.prepare('UPDATE savings_goals SET current_amount = current_amount + ? WHERE id = ?').run(amount, req.params.id);
    res.json({ success: true });
});

router.delete('/savings_goals/:id', (req, res) => {
    db.prepare('DELETE FROM savings_goals WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

export default router;
