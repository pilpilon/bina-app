import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, CheckCircle, XCircle, HelpCircle, Loader, Lock } from 'lucide-react';

interface ReviewScreenProps {
    examData: any[]; // The history log we saved
    onBack: () => void;
    teacherMode: boolean; // From userStats
    isPro: boolean;
    onUpgrade: () => void;
}

export const ReviewScreen: React.FC<ReviewScreenProps> = ({ examData, onBack, teacherMode, isPro, onUpgrade }) => {
    // For now, flatten all non-writing questions
    const allQuestions = examData
        .filter(c => c.type !== 'hibbur')
        .flatMap(c => c.questions.map((q: any) => ({
            ...q,
            userAnswer: c.answers[q.id],
            chapterTitle: c.type // or lookup title
        })));

    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [explanation, setExplanation] = useState<string | null>(null);
    const [isExplaining, setIsExplaining] = useState(false);

    const handleExplain = async (question: any) => {
        if (!teacherMode) return;
        setIsExplaining(true);
        setExplanation(null);

        try {
            const { explainQuestion } = await import('../services/aiScoring');
            const result = await explainQuestion(question, question.userAnswer);
            setExplanation(result);
        } catch (e) {
            setExplanation('שגיאה בקבלת הסבר. אנא נסה שנית.');
        } finally {
            setIsExplaining(false);
        }
    };

    return (
        <div className="h-screen bg-charcoal text-white flex flex-col">
            <div className="p-4 border-b border-white/10 flex items-center gap-4 bg-black/20">
                <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-lg">
                    <ChevronRight className="w-6 h-6" />
                </button>
                <div className="font-bold">חזרה למבחן ({allQuestions.length} שאלות)</div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {allQuestions.map((q, i) => {
                    const isCorrect = q.userAnswer === q.correctAnswer;
                    const isSelected = selectedIndex === i;

                    return (
                        <div key={i} className={`bg-white/5 rounded-xl border ${isCorrect ? 'border-emerald-500/20' : 'border-neon-pink/20'} overflow-hidden`}>
                            <div
                                onClick={() => setSelectedIndex(isSelected ? null : i)}
                                className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5"
                            >
                                <div className="flex items-center gap-3">
                                    {isCorrect ? <CheckCircle className="text-emerald-400 w-5 h-5" /> : <XCircle className="text-neon-pink w-5 h-5" />}
                                    <div className="text-sm font-bold truncate max-w-[200px]">{q.word || q.question || 'שאלה ' + (i + 1)}</div>
                                </div>
                                <div className="text-xs text-text-muted">{isCorrect ? 'נכון' : 'טעות'}</div>
                            </div>

                            <AnimatePresence>
                                {isSelected && (
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: 'auto' }}
                                        exit={{ height: 0 }}
                                        className="bg-black/20 border-t border-white/5"
                                    >
                                        <div className="p-4 text-sm space-y-2">
                                            <div className="font-bold text-lg mb-2">{q.word || q.question}</div>
                                            <div className="grid gap-2">
                                                {q.options.map((opt: string, idx: number) => (
                                                    <div key={idx} className={`p-2 rounded-lg border ${opt === q.correctAnswer ? 'bg-emerald-500/20 border-emerald-500/50' :
                                                        opt === q.userAnswer ? 'bg-neon-pink/20 border-neon-pink/50' :
                                                            'border-white/5 opacity-50'
                                                        }`}>
                                                        {opt}
                                                    </div>
                                                ))}
                                            </div>

                                            {/* AI Teacher Button */}
                                            {!isCorrect && (
                                                <div className="mt-4 pt-4 border-t border-white/10">
                                                    {!isPro ? (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); onUpgrade(); }}
                                                            className="w-full py-2 bg-neon-pink/10 text-neon-pink border border-neon-pink/30 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-neon-pink/20 transition-all"
                                                        >
                                                            <Lock className="w-4 h-4" />
                                                            הסברי Bina Pro 🔒
                                                        </button>
                                                    ) : teacherMode ? (
                                                        <>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleExplain(q); }}
                                                                disabled={isExplaining}
                                                                className="w-full py-2 bg-electric-blue/10 text-electric-blue border border-electric-blue/30 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-electric-blue/20"
                                                            >
                                                                {isExplaining ? <Loader className="w-4 h-4 animate-spin" /> : <HelpCircle className="w-4 h-4" />}
                                                                {isExplaining ? 'המורה חושב...' : 'למה טעיתי? (שאל את המורה)'}
                                                            </button>

                                                            {explanation && (
                                                                <motion.div
                                                                    initial={{ opacity: 0 }}
                                                                    animate={{ opacity: 1 }}
                                                                    className="mt-3 p-3 bg-electric-blue/5 border border-electric-blue/20 rounded-lg text-xs leading-relaxed"
                                                                >
                                                                    <div className="font-bold mb-1">הסבר המורה:</div>
                                                                    {explanation}
                                                                </motion.div>
                                                            )}
                                                        </>
                                                    ) : null}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
