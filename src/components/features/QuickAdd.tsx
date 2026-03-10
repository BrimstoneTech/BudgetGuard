import React, { useState } from 'react';
import { Mic, Plus, X, Command, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useBudget } from '../../context/BudgetContext';

export const QuickAdd: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [command, setCommand] = useState('');
    const { addTransaction, suggestCategory } = useBudget();

    const handleVoice = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('Speech recognition is not supported in this browser/device.');
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
            Haptics.notification({ type: ImpactStyle.Medium as any });
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setCommand(transcript);
            Haptics.notification({ type: ImpactStyle.Light as any });
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

    const processCommand = async () => {
        if (!command) return;

        // Simulating basic NLP
        const amountMatch = command.match(/\d+/);
        const nameMatch = command.replace(/Add|\d+|for/gi, '').trim();

        if (amountMatch && nameMatch) {
            const amount = parseInt(amountMatch[0]);
            const category = suggestCategory(nameMatch) || 'General';

            await addTransaction({
                name: nameMatch,
                amount: amount,
                category: category,
                date: new Date(),
                currency: 'UGX',
                note: 'Added via Voice'
            });

            Haptics.notification({ type: ImpactStyle.Heavy as any });
            setIsOpen(false);
            setCommand('');
        }
    };

    return (
        <>
            <div className="fixed bottom-24 right-6 z-50">
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 bg-zinc-900 text-white rounded-full flex items-center justify-center shadow-xl border border-zinc-800 active:scale-95 transition-transform"
                >
                    <Plus size={24} />
                </button>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 bg-black/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            className="bg-white w-full max-w-md rounded-t-[32px] p-8 pb-12 shadow-2xl relative"
                        >
                            <button
                                onClick={() => setIsOpen(false)}
                                className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-900 transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <div className="space-y-6 text-center">
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-zinc-900">Intelligent Add</h3>
                                    <p className="text-zinc-500 text-sm italic">"Add 50000 for lunch"</p>
                                </div>

                                <div className="relative group">
                                    <input
                                        type="text"
                                        value={command}
                                        onChange={e => setCommand(e.target.value)}
                                        placeholder="Type or speak a command..."
                                        className="w-full pl-12 pr-4 py-4 bg-zinc-50 border-2 border-zinc-100 rounded-2xl focus:outline-none focus:border-zinc-900 transition-all font-medium"
                                    />
                                    <Command className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />

                                    <button
                                        onClick={processCommand}
                                        disabled={!command}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-zinc-900 text-white rounded-xl flex items-center justify-center disabled:opacity-50 transition-opacity"
                                    >
                                        <Send size={18} />
                                    </button>
                                </div>

                                <div className="flex justify-center">
                                    <button
                                        onClick={handleVoice}
                                        className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${isListening
                                            ? 'bg-rose-500 scale-110 shadow-[0_0_20px_rgba(244,63,94,0.4)]'
                                            : 'bg-zinc-100 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200'
                                            }`}
                                    >
                                        <Mic size={32} className={isListening ? 'animate-pulse text-white' : ''} />
                                    </button>
                                </div>

                                {isListening && (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-rose-500 font-bold text-sm uppercase tracking-widest animate-pulse"
                                    >
                                        Listening...
                                    </motion.p>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};
