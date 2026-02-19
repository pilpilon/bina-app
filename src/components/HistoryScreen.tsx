import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Award, Lock, ChevronRight } from 'lucide-react';
import { PaywallOverlay } from './PaywallOverlay';

interface ExamResult {
    id: string;
    date: number;
    score: number;
    total: number;
    details: string; // e.g., "מרתון כללי" or specific category
}

interface HistoryScreenProps {
    history: ExamResult[];
    isPro: boolean;
    onBack: () => void;
    onUpgrade: () => void;
    onRefer: () => void;
}

const HistoryScreen: React.FC<HistoryScreenProps> = ({ history, isPro, onBack, onUpgrade, onRefer }) => {
    // Sort history by date (newest first)
    const sortedHistory = useMemo(() => {
        return [...history].sort((a, b) => b.date - a.date);
    }, [history]);

    // Format date helper
    const formatDate = (timestamp: number) => {
        return new Intl.DateTimeFormat('he-IL', {
            day: 'numeric',
            month: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(timestamp));
    };

    const [selectedExam, setSelectedExam] = React.useState<ExamResult | null>(null);

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="px-5 pt-8 pb-32 h-screen flex flex-col bg-charcoal text-white"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <button onClick={onBack} className="p-2 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                    <ChevronRight className="w-6 h-6" />
                </button>
                <div className="text-center">
                    <div className="text-xl font-black text-white">היסטוריית בחינות</div>
                    <div className="text-xs font-medium text-text-secondary">המעקב שלך אחר ההתקדמות</div>
                </div>
                <div className="w-10" /> {/* Spacer */}
            </div>

            {/* Empty State */}
            {sortedHistory.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                    <Clock className="w-16 h-16 mb-4 text-white/20" />
                    <p>עדיין לא ביצעת בחינות.</p>
                    <p className="text-sm">התחל מרתון כדי לראות תוצאות כאן!</p>
                </div>
            )}

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-4 relative">
                {sortedHistory.map((exam, index) => {
                    const isLocked = !isPro && index > 0;

                    return (
                        <div key={exam.id} className="relative">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => !isLocked && setSelectedExam(exam)}
                                className={`p-4 rounded-2xl border border-white/10 flex items-center justify-between transition-all cursor-pointer
                                    ${isLocked ? 'blur-sm opacity-50 bg-white/5 pointer-events-none select-none' : 'bg-white/5 hover:bg-white/10 hover:border-white/20 active:scale-[0.98]'}
                                `}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`p-3 rounded-xl ${exam.score >= 700 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white'}`}>
                                        <Award className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-white">{exam.details}</div>
                                        <div className="text-xs text-text-secondary flex items-center gap-1 mt-1">
                                            <Clock className="w-3 h-3" />
                                            {formatDate(exam.date)}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-black text-electric-blue">{exam.score}</div>
                                    <div className="text-[10px] text-text-muted">{exam.total} שאלות</div>
                                </div>
                            </motion.div>

                            {isLocked && (
                                <div className="absolute inset-0 z-10 flex items-center justify-center">
                                    <Lock className="w-6 h-6 text-white/50" />
                                </div>
                            )}
                        </div>
                    );
                })}

                {!isPro && sortedHistory.length > 1 && (
                    <div className="sticky bottom-4 z-30">
                        <PaywallOverlay
                            title="היסטוריה מלאה"
                            sub="שדרג ל-Plus כדי לראות את כל היסטוריית הבחינות שלך ולעקוב אחר השיפור לאורך זמן."
                            onUpgrade={onUpgrade}
                            onRefer={onRefer}
                        />
                    </div>
                )}
            </div>

            {/* Result Modal */}
            {selectedExam && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-charcoal/90 backdrop-blur-md">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-charcoal border border-white/10 p-8 rounded-3xl w-full max-w-sm text-center shadow-glass relative via-transparent"
                    >
                        <button
                            onClick={() => setSelectedExam(null)}
                            className="absolute top-4 right-4 text-text-muted hover:text-white"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>

                        <div className="w-20 h-20 bg-gradient-to-br from-electric-blue to-neon-purple rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow-blue">
                            <Award className="w-10 h-10 text-white" />
                        </div>

                        <h2 className="text-3xl font-black text-white mb-2">{selectedExam.score}</h2>
                        <div className="text-sm font-bold text-text-secondary mb-6 uppercase tracking-wider">ציון סופי</div>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                <div className="text-2xl font-black text-electric-blue">{selectedExam.total}</div>
                                <div className="text-[10px] text-text-muted mt-1">שאלות</div>
                            </div>
                            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                <div className="text-xl font-bold text-white">{new Date(selectedExam.date).toLocaleDateString('he-IL')}</div>
                                <div className="text-[10px] text-text-muted mt-1">תאריך</div>
                            </div>
                        </div>

                        <p className="text-xs text-text-muted mb-6">
                            פירוט תשובות מלא אינו זמין עבור מבחן זה.
                        </p>

                        <button
                            onClick={() => setSelectedExam(null)}
                            className="w-full py-4 rounded-xl bg-white/10 hover:bg-white/20 font-bold text-white transition-colors"
                        >
                            סגור
                        </button>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
};

export default HistoryScreen;
