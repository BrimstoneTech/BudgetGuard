import React from 'react';
import {
    User, Wallet, Bell, Lock, Database, LogOut,
    ChevronRight, Eye, EyeOff, Smartphone,
    Calendar, Shield, HardDrive, Download, Trash2
} from 'lucide-react';
import { useBudget } from '../context/BudgetContext';
import { motion } from 'framer-motion';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export const SettingsScreen: React.FC = () => {
    const { settings, updateSettings, privacyMode, togglePrivacyMode, resetApp } = useBudget();

    const handleToggle = (key: string, currentVal: boolean) => {
        Haptics.impact({ style: ImpactStyle.Light });
        updateSettings({ [key]: !currentVal });
    };

    const SettingRow = ({ icon: Icon, label, value, onClick, type = 'toggle', color = 'zinc' }: any) => (
        <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="w-full flex items-center justify-between p-4 bg-white border-b border-zinc-100 last:border-0 active:bg-zinc-50 transition-colors"
        >
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${color}-50 text-${color}-600`}>
                    <Icon size={20} />
                </div>
                <div className="text-left">
                    <p className="text-sm font-bold text-zinc-900">{label}</p>
                    {type === 'value' && <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest">{value}</p>}
                </div>
            </div>
            {type === 'toggle' ? (
                <div className={`w-12 h-6 rounded-full transition-all duration-300 p-1 ${value ? 'bg-zinc-900' : 'bg-zinc-200'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-all duration-300 ${value ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
            ) : (
                <ChevronRight size={18} className="text-zinc-300" />
            )}
        </motion.button>
    );

    return (
        <div className="pb-20">
            <header className="px-6 pt-12 pb-6 bg-white border-b border-zinc-100">
                <h1 className="text-3xl font-black tracking-tight text-zinc-900">Settings</h1>
                <p className="text-sm text-zinc-500 font-medium">Control your financial workspace</p>
            </header>

            <div className="space-y-8 mt-6">
                {/* Theme Selection */}
                <section>
                    <p className="px-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-3">App Appearance</p>
                    <div className="px-6 flex gap-3">
                        {[
                            { id: 'light', label: 'Light', bg: 'bg-[#f9fafb]', border: 'border-zinc-200' },
                            { id: 'dark', label: 'Dark', bg: 'bg-[#09090b]', border: 'border-zinc-800' },
                            { id: 'vibrant', label: 'Neon', bg: 'bg-[#0f172a]', border: 'border-sky-500/50' }
                        ].map((t) => (
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                key={t.id}
                                onClick={() => {
                                    Haptics.impact({ style: ImpactStyle.Medium });
                                    updateSettings({ theme: t.id });
                                }}
                                className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${settings.theme === t.id ? 'border-zinc-900 bg-zinc-50' : 'border-transparent bg-white'
                                    }`}
                            >
                                <div className={`w-full aspect-video rounded-lg ${t.bg} border ${t.border} shadow-sm`} />
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${settings.theme === t.id ? 'text-zinc-900' : 'text-zinc-400'}`}>
                                    {t.label}
                                </span>
                            </motion.button>
                        ))}
                    </div>
                </section>

                {/* Security & Privacy */}
                <section>
                    <p className="px-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2">Security & Privacy</p>
                    <div className="bg-white border-y border-zinc-100">
                        <SettingRow
                            icon={Lock}
                            label="Biometric Access"
                            value={settings.biometricsEnabled}
                            onClick={() => handleToggle('biometricsEnabled', settings.biometricsEnabled)}
                            color="indigo"
                        />
                        <SettingRow
                            icon={privacyMode ? EyeOff : Eye}
                            label="Always Start Private"
                            value={settings.hideBalancesOnStartup}
                            onClick={() => handleToggle('hideBalancesOnStartup', settings.hideBalancesOnStartup)}
                            color="rose"
                        />
                    </div>
                </section>

                {/* Performance & UX */}
                <section>
                    <p className="px-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2">Productivity</p>
                    <div className="bg-white border-y border-zinc-100">
                        <SettingRow
                            icon={Smartphone}
                            label="Haptic Feedback"
                            value={settings.hapticsEnabled}
                            onClick={() => handleToggle('hapticsEnabled', settings.hapticsEnabled)}
                            color="emerald"
                        />
                        <SettingRow
                            icon={Calendar}
                            label="Fiscal Month Start"
                            type="value"
                            value={`Day ${settings.fiscalDay}`}
                            onClick={() => {
                                Haptics.impact({ style: ImpactStyle.Medium });
                                const day = prompt("Enter payday of the month (1-31):", settings.fiscalDay.toString());
                                if (day) updateSettings({ fiscalDay: Math.max(1, Math.min(31, parseInt(day))) });
                            }}
                            color="amber"
                        />
                    </div>
                </section>

                {/* Data Management */}
                <section>
                    <p className="px-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2">Data Engine</p>
                    <div className="bg-white border-y border-zinc-100">
                        <SettingRow
                            icon={Download}
                            label="Export to CSV"
                            type="action"
                            onClick={() => {
                                Haptics.notification({ type: ImpactStyle.Heavy as any });
                                alert("Exporting local database to CSV...");
                            }}
                            color="blue"
                        />
                        <SettingRow
                            icon={Trash2}
                            label="Reset Application"
                            type="action"
                            onClick={async () => {
                                Haptics.notification({ type: ImpactStyle.Heavy as any });
                                if (confirm("DANGER: This will delete ALL local data. Proceed?")) {
                                    await resetApp();
                                }
                            }}
                            color="rose"
                        />
                    </div>
                </section>

                <div className="px-6 py-8 text-center space-y-2">
                    <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">BudgetGuard v1.2.0 • Premium</p>
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Created by TAISAN</p>
                    <p className="text-zinc-300 text-[9px] font-medium leading-relaxed">
                        Built for offline-first privacy.<br />
                        © BrimstoneTech • All Rights Reserved
                    </p>
                </div>
            </div>
        </div>
    );
};
