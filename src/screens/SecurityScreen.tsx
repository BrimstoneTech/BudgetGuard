import React, { useState, useEffect } from 'react';
import { Shield, Fingerprint, Lock, Unlock, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

import { useBudget } from '../context/BudgetContext';

interface SecurityScreenProps {
    onUnlock: () => void;
}

export const SecurityScreen: React.FC<SecurityScreenProps> = ({ onUnlock }) => {
    const { settings } = useBudget();
    const [pin, setPin] = useState<string>('');
    const [error, setError] = useState(false);
    const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);

    useEffect(() => {
        // Since we are mocking Capacitor Biometrics to avoid native plugin overhead,
        // we will check if it's enabled in settings. If yes, show the button.
        setIsBiometricAvailable(settings.biometricsEnabled);
    }, [settings.biometricsEnabled]);

    const handleInput = (digit: string) => {
        if (pin.length < 4) {
            const newPin = pin + digit;
            setPin(newPin);
            Haptics.impact({ style: ImpactStyle.Light });

            if (newPin.length === 4) {
                const targetPin = settings.securityPin || '1234'; // Fallback if not set
                if (newPin === targetPin) {
                    Haptics.notification({ type: ImpactStyle.Heavy as any });
                    setTimeout(onUnlock, 200);
                } else {
                    setError(true);
                    Haptics.notification({ type: ImpactStyle.Medium as any });
                    setTimeout(() => {
                        setPin('');
                        setError(false);
                    }, 500);
                }
            }
        }
    };

    const handleBiometric = () => {
        Haptics.impact({ style: ImpactStyle.Medium });
        // In real app: BiometricAuth.authenticate().then(onUnlock)
        setTimeout(onUnlock, 500);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col items-center justify-between py-16 px-8 select-none">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-4"
            >
                <div className="w-20 h-20 bg-zinc-900 rounded-3xl flex items-center justify-center mx-auto border border-zinc-800 shadow-2xl">
                    <Shield className="text-zinc-100" size={32} />
                </div>
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-white tracking-tight">BudgetGuard</h1>
                    <p className="text-zinc-500 text-sm font-medium uppercase tracking-widest flex items-center justify-center gap-2">
                        <Lock size={12} /> Encrypted Session
                    </p>
                </div>
            </motion.div>

            <div className="w-full max-w-[280px] space-y-12">
                <div className="flex justify-center gap-4">
                    {[0, 1, 2, 3].map((i) => (
                        <motion.div
                            key={i}
                            animate={error ? { x: [0, -10, 10, -10, 10, 0] } : {}}
                            className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${pin.length > i
                                ? 'bg-zinc-100 border-zinc-100 scale-110 shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                                : 'border-zinc-800'
                                }`}
                        />
                    ))}
                </div>

                <div className="grid grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <button
                            key={num}
                            onClick={() => handleInput(num.toString())}
                            className="w-16 h-16 rounded-full bg-zinc-900/50 text-zinc-100 text-2xl font-semibold border border-zinc-800/50 hover:bg-zinc-800 transition-colors active:scale-95"
                        >
                            {num}
                        </button>
                    ))}
                    <div className="flex items-center justify-center">
                        {isBiometricAvailable && (
                            <button
                                onClick={handleBiometric}
                                className="w-16 h-16 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-100 transition-colors"
                            >
                                <Fingerprint size={32} />
                            </button>
                        )}
                    </div>
                    <button
                        onClick={() => handleInput('0')}
                        className="w-16 h-16 rounded-full bg-zinc-900/50 text-zinc-100 text-2xl font-semibold border border-zinc-800/50 hover:bg-zinc-800 transition-colors active:scale-95"
                    >
                        0
                    </button>
                    <div className="flex items-center justify-center">
                        <button
                            onClick={() => setPin(pin.slice(0, -1))}
                            className="text-zinc-500 font-medium hover:text-zinc-300 px-2"
                        >
                            DEL
                        </button>
                    </div>
                </div>
            </div>

            <p className="text-zinc-600 text-xs font-medium tracking-wide">
                Your financial data is protected by biometric encryption
            </p>
        </div>
    );
};
