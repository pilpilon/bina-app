import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, ChevronRight, ChevronLeft, CheckCircle2, XCircle, AlertCircle, Trophy, BarChart3, Home } from 'lucide-react';

interface Question {
    id: string;
    word?: string; // For vocabulary/English
    question?: string; // For quantitative/analogies
    definition?: string;
    options?: string[]; // Multiple choice options
    correctAnswer?: string;
    category: string;
}

interface ExamScreenProps {
    questions: Question[];
    onClose: () => void;
    onShowExplanation?: (item: any) => void;
}

const ExamScreen: React.FC<ExamScreenProps> = ({ questions, onClose, onShowExplanation }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [timeLeft, setTimeLeft] = useState(1200); // 20 minutes in seconds
    const [isFinished, setIsFinished] = useState(false);

    // Create a pool of distractors from all questions to avoid "buggy" placeholders
    const distractorPool = useMemo(() => {
        return questions
            .map(q => q.definition || q.word || (q as any).answer || '')
            .filter(Boolean);
    }, [questions]);

    // Timer logic - refactored to be more stable
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    setIsFinished(true);
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAnswerSelection = (answer: string) => {
        setAnswers({
            ...answers,
            [questions[currentIndex].id]: answer
        });
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setIsFinished(true);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const calculateScore = () => {
        let correct = 0;
        questions.forEach((q) => {
            if (answers[q.id] === q.correctAnswer) {
                correct++;
            }
        });
        return {
            correct,
            total: questions.length,
            percentage: Math.round((correct / questions.length) * 100)
        };
    };

    if (isFinished) {
        const stats = calculateScore();
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-5 pt-12 pb-32 flex flex-col items-center gap-8 text-center"
            >
                <div className="w-24 h-24 bg-gradient-to-br from-electric-blue to-neon-purple rounded-3xl flex items-center justify-center shadow-glow-blue rotate-3">
                    <Trophy className="w-12 h-12 text-white" />
                </div>

                <div>
                    <h2 className="text-4xl font-black text-white mb-2">המרתון הושלם!</h2>
                    <p className="text-text-secondary">הנה ניתוח הביצועים שלך תחת לחץ</p>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                        <div className="text-3xl font-black text-electric-blue">{stats.correct}/{stats.total}</div>
                        <div className="text-sm text-text-secondary">תשובות נכונות</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                        <div className="text-3xl font-black text-neon-purple">{stats.percentage}%</div>
                        <div className="text-sm text-text-secondary">דיוק כללי</div>
                    </div>
                </div>

                <div className="w-full space-y-3 mt-4">
                    <h3 className="text-right font-bold text-lg pr-1">פירוט תשובות</h3>
                    <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {questions.map((q, idx) => {
                            const isCorrect = answers[q.id] === q.correctAnswer;
                            const isAnswered = !!answers[q.id];
                            return (
                                <div key={q.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 group">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${isCorrect ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-neon-pink shadow-[0_0_8px_rgba(255,0,119,0.5)]'}`} />
                                        <span className="font-bold text-sm">שאלה {idx + 1}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {!isCorrect && isAnswered && (
                                            <button
                                                onClick={() => onShowExplanation?.(q)}
                                                className="text-[10px] font-black text-electric-blue hover:text-white transition-colors bg-electric-blue/10 px-2 py-1 rounded-md border border-electric-blue/30"
                                            >
                                                למה טעיתי? 🤖
                                            </button>
                                        )}
                                        <div className="text-xs font-medium text-text-secondary">
                                            {isAnswered ? (isCorrect ? 'נכון' : 'טעות') : 'לא נענה'}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="w-full py-4 mt-8 rounded-2xl bg-gradient-to-r from-electric-blue to-neon-purple text-charcoal font-black text-lg shadow-glow-blue flex items-center justify-center gap-3"
                >
                    <Home className="w-6 h-6" />
                    חזרה למסך הבית
                </button>
            </motion.div>
        );
    }

    const currentQuestion = questions[currentIndex];

    // Stabilize options to avoid re-shuffling on every timer tick
    const options = useMemo(() => {
        if (currentQuestion.options && currentQuestion.options.length > 0) return currentQuestion.options;

        const correct = currentQuestion.definition || currentQuestion.correctAnswer || '';

        // Pick 3 random distractors that aren't the correct answer from the whole pool
        const distractors = [...distractorPool]
            .filter(d => d !== correct)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);

        return [correct, ...distractors].sort(() => Math.random() - 0.5);
    }, [currentIndex, currentQuestion.id, distractorPool]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-5 pt-8 pb-32 min-h-screen flex flex-col"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <button onClick={onClose} className="flex items-center gap-2 text-text-muted font-bold hover:text-white transition-colors">
                    <ChevronRight className="w-5 h-5 translate-x-1" />
                    <span>יציאה מהמרתון</span>
                </button>
                <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                    <Timer className={`w-5 h-5 ${timeLeft < 60 ? 'text-neon-pink animate-pulse' : 'text-electric-blue'}`} />
                    <span className={`font-mono text-xl font-bold ${timeLeft < 60 ? 'text-neon-pink' : 'text-white'}`}>
                        {formatTime(timeLeft)}
                    </span>
                </div>
            </div>

            {/* Progress */}
            <div className="mb-10">
                <div className="flex justify-between text-xs font-black text-text-muted mb-2 uppercase tracking-widest">
                    <span>שאלה {currentIndex + 1} מתוך {questions.length}</span>
                    <span>{Math.round(((currentIndex + 1) / questions.length) * 100)}%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                        className="h-full bg-gradient-to-r from-neon-purple to-electric-blue shadow-glow-blue"
                    />
                </div>
            </div>

            {/* Question Card */}
            <div className="flex-1 flex flex-col pt-4">
                <div className="text-center mb-12">
                    <div className="text-sm font-bold text-neon-purple uppercase tracking-[0.2em] mb-4">
                        {currentQuestion.category}
                    </div>
                    <h2 className="text-4xl font-black text-white mb-6 leading-tight">
                        {currentQuestion.word || currentQuestion.question}
                    </h2>
                </div>

                <div className="space-y-4">
                    {options.map((option, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleAnswerSelection(option)}
                            className={`w-full p-5 rounded-2xl border transition-all text-right flex items-center justify-between group ${answers[currentQuestion.id] === option
                                ? 'bg-electric-blue/20 border-electric-blue text-white shadow-glow-blue'
                                : 'bg-white/5 border-white/10 text-text-secondary hover:bg-white/10 hover:border-white/20'
                                }`}
                        >
                            <span className="font-bold text-lg leading-relaxed">{option}</span>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${answers[currentQuestion.id] === option
                                ? 'bg-electric-blue border-electric-blue text-charcoal'
                                : 'border-white/20 group-hover:border-white/40'
                                }`}>
                                {answers[currentQuestion.id] === option && <CheckCircle2 className="w-4 h-4" />}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Navigation Controls */}
            <div className="mt-12 flex gap-4">
                <button
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-2 font-bold text-text-secondary disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                    הקודם
                </button>
                <button
                    onClick={handleNext}
                    className="flex-[2] py-4 bg-gradient-to-r from-electric-blue to-neon-purple rounded-2xl flex items-center justify-center gap-2 font-black text-charcoal shadow-glow-blue hover:brightness-110 active:scale-95 transition-all"
                >
                    {currentIndex === questions.length - 1 ? 'סיים מבחן' : 'השאלה הבאה'}
                    {currentIndex !== questions.length - 1 && <ChevronLeft className="w-5 h-5" />}
                </button>
            </div>
        </motion.div>
    );
};

export default ExamScreen;
