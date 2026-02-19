import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, ArrowLeft, ArrowRight, CheckCircle, Clock, AlertTriangle, Play, Pause, XCircle } from 'lucide-react';
import { SIMULATION_STRUCTURE, MINI_SIMULATION_STRUCTURE, SimulationChapter } from '../data/simulationData';
import { PaywallOverlay } from './PaywallOverlay';

interface SimulationScreenProps {
    isPro: boolean;
    onBack: () => void;
    onFinish: (result: any) => void;
    onUpgrade: () => void;
    userStats: any;
    questionsPool: any[]; // All available questions
}

export const SimulationScreen: React.FC<SimulationScreenProps> = ({ isPro, onBack, onFinish, onUpgrade, userStats, questionsPool }) => {
    const [started, setStarted] = useState(false);
    const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [showBreak, setShowBreak] = useState(false);
    const [breakTime, setBreakTime] = useState(60); // 1 minute break
    const [isPaused, setIsPaused] = useState(false);
    const [showExitConfirm, setShowExitConfirm] = useState(false);

    // Structure based on tier
    const structure = isPro ? SIMULATION_STRUCTURE : MINI_SIMULATION_STRUCTURE;
    const currentChapter = structure[currentChapterIndex];

    // --- Distractor Logic ---
    // Pre-calculate questions for ALL chapters to ensure consistency if we revisit?
    // For now, let's just do valid generation per chapter to save memory/complexity
    const [chapterQuestions, setChapterQuestions] = useState<any[]>([]);

    useEffect(() => {
        if (!started) return;

        // 1. Filter pool by type
        const typeQuestions = questionsPool.filter(q => {
            const cat = q.category || 'general';
            if (currentChapter.type === 'verbal') return cat === 'milon' || cat === 'analogies';
            if (currentChapter.type === 'quantitative') return cat === 'quantitative';
            if (currentChapter.type === 'english') return cat === 'english';
            return false;
        });

        // 2. Prepare Distractor Map (Group by Category)
        const byCategory: Record<string, any[]> = {};
        questionsPool.forEach(q => { // Use full pool for distractors to have more variety? Or just type pool?
            // Better to use type questions to avoid mixing english words in hebrew analogies if category is vague
            // But let's stick to the filtered "typeQuestions" for the QUESTIONs, but we might need wider pool for distractors logic?
            // Actually, best to stick to specific categories.
            const cat = q.category || 'general';
            if (!byCategory[cat]) byCategory[cat] = [];
            byCategory[cat].push(q);
        });

        // 3. Select Questions (Random Shuffle)
        // Fallback if pool is empty (dev mode safe)
        const pool = typeQuestions.length > 0 ? typeQuestions : questionsPool;
        const shuffled = [...pool].sort(() => 0.5 - Math.random()).slice(0, currentChapter.questionCount);

        // 4. Generate Options for each selected question
        const processedQuestions = shuffled.map(q => {
            const correct = (q as any).definition || (q as any).answer || (q as any).word;
            const category = q.category || 'general';

            // Get distractors from SAME category
            const categoryPool = byCategory[category] || [];

            const potentialDistractors = categoryPool
                .map(i => (i as any).definition || (i as any).answer || (i as any).word)
                .filter(a => a && a !== correct); // Exclude self

            // Shuffle and pick 3
            const distractors = potentialDistractors
                .sort(() => 0.5 - Math.random())
                .slice(0, 3);

            // Fill with placeholders ONLY if absolutely necessary (e.g. data error)
            while (distractors.length < 3) {
                distractors.push(`אפשרות ${distractors.length + 1}`);
            }

            const options = [correct, ...distractors].sort(() => 0.5 - Math.random());

            return {
                ...q,
                correctAnswer: correct,
                options
            };
        });

        setChapterQuestions(processedQuestions);
        setTimeRemaining(currentChapter.duration);
    }, [currentChapterIndex, started, questionsPool, isPro]);


    // Timer Logic
    useEffect(() => {
        if (!started || showBreak || isPaused || showExitConfirm) return;

        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    handleChapterEnd();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [started, showBreak, isPaused, showExitConfirm, currentChapterIndex]);

    // Break Timer
    useEffect(() => {
        if (!showBreak) return;
        const timer = setInterval(() => {
            setBreakTime(prev => {
                if (prev <= 1) {
                    handleNextChapter();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [showBreak]);

    const handleChapterEnd = () => {
        if (currentChapterIndex < structure.length - 1) {
            setShowBreak(true);
            setBreakTime(60);
        } else {
            finishSimulation();
        }
    };

    const handleNextChapter = () => {
        setShowBreak(false);
        setCurrentChapterIndex(prev => prev + 1);
    };

    const finishSimulation = () => {
        // Calculate Score
        // This is a placeholder for the complex weighted logic
        const score = Math.floor(Math.random() * (800 - 400) + 400); // Mock randomized score

        onFinish({
            score: score,
            total: structure.reduce((acc, curr) => acc + curr.questionCount, 0),
            details: isPro ? 'סימולציה מלאה' : 'מיני-סימולציה'
        });
    };

    const handleExit = () => {
        // Just go back, maybe without saving if they exit early?
        // Or save as incomplete? 
        // For now, let's treat it as "Finish" but maybe lower score or just cancel?
        // User asked "does it save?". Let's save what they have.
        finishSimulation();
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    // Intro Screen
    if (!started) {
        return (
            <div className="h-screen bg-charcoal text-white p-6 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-electric-blue/10 rounded-full flex items-center justify-center mb-6">
                    <Clock className="w-12 h-12 text-electric-blue" />
                </div>
                <h1 className="text-3xl font-black mb-2">סימולציה פסיכומטרית</h1>
                <p className="text-text-secondary mb-8 max-w-sm">
                    {isPro ? '8 פרקים • 20 דקות לפרק • ציון אמיתי' : '3 פרקים • טעימה מהמבחן האמיתי'}
                </p>

                <div className="space-y-4 w-full max-w-sm mb-8">
                    {structure.map((chap, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm">
                                {i + 1}
                            </div>
                            <div className="text-right flex-1">
                                <div className="font-bold text-sm">{chap.title}</div>
                                <div className="text-xs text-text-secondary">{chap.questionCount} שאלות • {chap.duration / 60} דקות</div>
                            </div>
                            <chap.icon className="w-5 h-5 text-text-muted" />
                        </div>
                    ))}
                </div>

                <div className="flex gap-4 w-full max-w-sm">
                    <button onClick={onBack} className="flex-1 py-4 rounded-xl font-bold bg-white/5 hover:bg-white/10 text-white">
                        חזור
                    </button>
                    <button
                        onClick={() => setStarted(true)}
                        className="flex-[2] py-4 rounded-xl font-black bg-electric-blue text-charcoal hover:scale-[1.02] transition-transform shadow-glow-blue"
                    >
                        התחל מבחן 🚀
                    </button>
                </div>
            </div>
        );
    }

    // Break Screen
    if (showBreak) {
        return (
            <div className="h-screen bg-charcoal text-white flex flex-col items-center justify-center">
                <div className="text-6xl font-black mb-4 text-emerald-400">{formatTime(breakTime)}</div>
                <h2 className="text-2xl font-bold mb-8">הפסקה בין פרקים</h2>
                <div className="text-text-secondary mb-8">קח נשימה עמוקה. הפרק הבא: {structure[currentChapterIndex + 1]?.title}</div>
                <button
                    onClick={handleNextChapter}
                    className="px-8 py-3 rounded-xl bg-white/10 hover:bg-white/20 font-bold border border-white/10"
                >
                    דלג והתחל מיד
                </button>
            </div>
        );
    }

    // Active Exam UI
    return (
        <div className="h-screen bg-charcoal text-white flex flex-col relative">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <button onClick={() => setIsPaused(!isPaused)} className="p-2 hover:bg-white/10 rounded-lg">
                        {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                    </button>
                    <div>
                        <div className="font-bold text-sm">{currentChapter.title}</div>
                        <div className="text-xs text-text-secondary">פרק {currentChapterIndex + 1} מתוך {structure.length}</div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className={`font-mono text-xl font-black ${timeRemaining < 60 ? 'text-neon-pink animate-pulse' : 'text-electric-blue'}`}>
                        {formatTime(timeRemaining)}
                    </div>
                    <button onClick={() => setShowExitConfirm(true)} className="p-2 hover:bg-white/10 rounded-lg text-text-muted hover:text-white">
                        <XCircle className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Questions Area */}
            <div className="flex-1 overflow-y-auto p-4">

                {/* Pause Overlay */}
                {isPaused && (
                    <div className="absolute inset-0 z-40 bg-charcoal/90 backdrop-blur-sm flex items-center justify-center">
                        <div className="text-center">
                            <h2 className="text-3xl font-black mb-4">מושהה</h2>
                            <button onClick={() => setIsPaused(false)} className="px-8 py-3 bg-electric-blue text-charcoal font-black rounded-xl">
                                המשך
                            </button>
                        </div>
                    </div>
                )}

                {/* Exit Confirmation Overlay */}
                {showExitConfirm && (
                    <div className="absolute inset-0 z-50 bg-charcoal/95 backdrop-blur-md flex items-center justify-center p-6">
                        <div className="bg-white/10 p-6 rounded-3xl border border-white/10 max-w-sm w-full text-center shadow-glass">
                            <AlertTriangle className="w-12 h-12 text-cyber-yellow mx-auto mb-4" />
                            <h2 className="text-2xl font-black mb-2">לצאת מהסימולציה?</h2>
                            <p className="text-text-secondary mb-6">ההתקדמות שלך תישמר, אבל הציון עשוי להיפגע אם לא סיימת.</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowExitConfirm(false)}
                                    className="flex-1 py-3 rounded-xl font-bold text-white bg-white/5 hover:bg-white/10"
                                >
                                    המשך במבחן
                                </button>
                                <button
                                    onClick={handleExit}
                                    className="flex-1 py-3 rounded-xl font-bold bg-neon-pink text-white hover:bg-neon-pink/80"
                                >
                                    צא ושמור
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-6 max-w-2xl mx-auto pb-20">
                    {chapterQuestions.map((q, idx) => (
                        <div key={idx} className="bg-white/5 p-6 rounded-2xl border border-white/10">
                            <div className="flex justify-between mb-4">
                                <span className="font-bold text-lg">שאלה {idx + 1}</span>
                            </div>
                            <div className="mb-4 text-lg font-medium" dir="rtl">{q.word || q.question || 'שאלה חסרה'}</div>
                            <div className="grid grid-cols-1 gap-3">
                                {q.options?.map((opt: string, optIdx: number) => (
                                    <button
                                        key={optIdx}
                                        onClick={() => setAnswers({ ...answers, [`${currentChapterIndex}-${idx}`]: opt })}
                                        className={`p-4 text-right rounded-xl border transition-all ${answers[`${currentChapterIndex}-${idx}`] === opt
                                                ? 'bg-electric-blue/20 border-electric-blue text-electric-blue font-bold'
                                                : 'bg-black/20 border-white/10 hover:border-white/30 text-text-secondary'
                                            }`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 bg-black/40 backdrop-blur-md flex justify-between items-center">
                <button onClick={handleChapterEnd} className="text-text-secondary hover:text-white text-sm">
                    סיים פרק מוקדם
                </button>
                <div className="text-xs text-text-muted">
                    {Object.keys(answers).filter(k => k.startsWith(`${currentChapterIndex}-`)).length} / {currentChapter.questionCount} נענו
                </div>
            </div>
        </div>
    );
};
