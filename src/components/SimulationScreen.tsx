import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, ArrowLeft, ArrowRight, CheckCircle, Clock, AlertTriangle, Play, Pause } from 'lucide-react';
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

    // Structure based on tier
    const structure = isPro ? SIMULATION_STRUCTURE : MINI_SIMULATION_STRUCTURE;
    const currentChapter = structure[currentChapterIndex];

    // Generate questions for the current chapter
    // Memoize this so it doesn't regenerate on every render
    const [chapterQuestions, setChapterQuestions] = useState<any[]>([]);

    useEffect(() => {
        if (!started) return;

        // Filter pool by type
        const typeQuestions = questionsPool.filter(q => {
            const cat = q.category || 'general';
            if (currentChapter.type === 'verbal') return cat === 'milon' || cat === 'analogies';
            if (currentChapter.type === 'quantitative') return cat === 'quantitative';
            if (currentChapter.type === 'english') return cat === 'english';
            return false;
        });

        // Fallback if pool is empty (dev mode safe)
        const pool = typeQuestions.length > 0 ? typeQuestions : questionsPool;

        // Shuffle and slice
        const shuffled = [...pool].sort(() => 0.5 - Math.random()).slice(0, currentChapter.questionCount);

        // Map to standardized format if needed
        const questions = shuffled.map(q => ({
            ...q,
            options: q.options || [q.correctAnswer || q.word, 'Option 2', 'Option 3', 'Option 4'].sort(() => 0.5 - Math.random())
        }));

        setChapterQuestions(questions);
        setTimeRemaining(currentChapter.duration);
    }, [currentChapterIndex, started]);


    // Timer Logic
    useEffect(() => {
        if (!started || showBreak || isPaused) return;

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
    }, [started, showBreak, isPaused, currentChapterIndex]);

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
        let correctCount = 0;
        let totalCount = 0;

        // We need to track actual correctness per question
        // For MVP, we pass simple stats
        onFinish({
            score: 720, // Mock score for now
            total: structure.reduce((acc, curr) => acc + curr.questionCount, 0),
            details: isPro ? 'סימולציה מלאה' : 'מיני-סימולציה'
        });
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
        <div className="h-screen bg-charcoal text-white flex flex-col">
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
                <div className={`font-mono text-xl font-black ${timeRemaining < 60 ? 'text-neon-pink animate-pulse' : 'text-electric-blue'}`}>
                    {formatTime(timeRemaining)}
                </div>
            </div>

            {/* Questions Area (Placeholder for actual question rendering logic) */}
            <div className="flex-1 overflow-y-auto p-4">
                {isPaused && (
                    <div className="absolute inset-0 z-50 bg-charcoal/90 backdrop-blur-sm flex items-center justify-center">
                        <div className="text-center">
                            <h2 className="text-3xl font-black mb-4">מושהה</h2>
                            <button onClick={() => setIsPaused(false)} className="px-8 py-3 bg-electric-blue text-charcoal font-black rounded-xl">
                                המשך
                            </button>
                        </div>
                    </div>
                )}

                {/* Temporary: reusing generic list for visual check */}
                <div className="space-y-6 max-w-2xl mx-auto">
                    {chapterQuestions.map((q, idx) => (
                        <div key={idx} className="bg-white/5 p-6 rounded-2xl border border-white/10">
                            <div className="flex justify-between mb-4">
                                <span className="font-bold text-lg">שאלה {idx + 1}</span>
                            </div>
                            <div className="mb-4 text-lg">{q.word || q.question || 'Example Question Text'}</div>
                            <div className="grid grid-cols-1 gap-3">
                                {q.options?.map((opt: string, optIdx: number) => (
                                    <button
                                        key={optIdx}
                                        onClick={() => setAnswers({ ...answers, [`${currentChapterIndex}-${idx}`]: opt })}
                                        className={`p-4 text-right rounded-xl border transition-all ${answers[`${currentChapterIndex}-${idx}`] === opt
                                                ? 'bg-electric-blue/20 border-electric-blue text-electric-blue'
                                                : 'bg-black/20 border-white/10 hover:border-white/30'
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
                <div className="flex gap-2">
                    {/* Pagination bubbles could go here */}
                </div>
            </div>

            {/* Paywall for Free users trying to access Pro content? 
                Actually the logic handles this by shortening the structure. 
                But we might want a banner at the end.
            */}
        </div>
    );
};
