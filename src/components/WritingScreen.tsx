import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Timer, AlertTriangle, CheckCircle, FileText, Loader } from 'lucide-react';

interface WritingScreenProps {
    duration: number; // in seconds
    onFinish: (result: any) => void;
    onExit: () => void;
}

export const WritingScreen: React.FC<WritingScreenProps> = ({ duration, onFinish, onExit }) => {
    const [timeRemaining, setTimeRemaining] = useState(duration);
    const [text, setText] = useState('');
    const [wordCount, setWordCount] = useState(0);
    const [lineCount, setLineCount] = useState(0);
    const [showWarning, setShowWarning] = useState(false);

    // Timer Logic
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    handleFinish();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Text Analysis
    useEffect(() => {
        const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
        const lines = text.split('\n').length;
        setWordCount(words);
        setLineCount(lines);
    }, [text]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [loadingStep, setLoadingStep] = useState(0);

    const loadingSteps = [
        "קורא את החיבור...",
        "מנתח מבנה ולכידות...",
        "בודק אוצר מילים ותחביר...",
        "מחשב ציון סופי..."
    ];

    useEffect(() => {
        if (!isAnalyzing) {
            setLoadingStep(0);
            return;
        }

        // Cycle through loading steps to mask latency
        const stepInterval = setInterval(() => {
            setLoadingStep(prev => Math.min(prev + 1, loadingSteps.length - 1));
        }, 2500);

        return () => clearInterval(stepInterval);
    }, [isAnalyzing]);

    const handleFinish = async () => {
        // Basic validation
        if (lineCount < 3 && wordCount < 20) {
            setShowWarning(true);
            setTimeout(() => setShowWarning(false), 3000);
            return;
        }

        setIsAnalyzing(true);
        setLoadingStep(0);

        try {
            const { analyzeWriting } = await import('../services/aiScoring');
            const analysis = await analyzeWriting(text);

            onFinish({
                score: analysis.score,
                details: 'מטלת כתיבה (נבדק ע"י AI)',
                text: text,
                wordCount,
                feedback: analysis.feedback,
                is_valid_essay: analysis.is_valid_essay
            });
        } catch (e) {
            // Fallback if AI fails (network etc)
            onFinish({
                score: 80,
                details: 'מטלת כתיבה (שגיאה ב-AI, ציון מוערך)',
                text: text,
                wordCount
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="h-screen bg-charcoal text-white flex flex-col relative">
            {/* Loading Overlay */}
            {isAnalyzing && (
                <div className="absolute inset-0 z-50 bg-charcoal/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        className="w-16 h-16 border-4 border-electric-blue/20 border-t-electric-blue rounded-full mb-8"
                    />
                    <div className="h-8 overflow-hidden relative w-full max-w-xs">
                        {loadingSteps.map((step, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{
                                    opacity: loadingStep === idx ? 1 : 0,
                                    y: loadingStep === idx ? 0 : loadingStep > idx ? -20 : 20
                                }}
                                transition={{ duration: 0.5 }}
                                className="absolute inset-0 text-xl font-black text-white"
                            >
                                {step}
                            </motion.div>
                        ))}
                    </div>
                    <p className="text-text-secondary mt-4 max-w-xs text-sm">
                        Bina בודקת את החיבור שלך לעומק. זה עשוי לקחת כמה שניות.
                    </p>
                </div>
            )}

            {/* Header */}
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-white/5 rounded-lg">
                        <FileText className="w-5 h-5 text-neon-purple" />
                    </div>
                    <div>
                        <div className="font-bold text-sm">מטלת כתיבה</div>
                        <div className="text-xs text-text-secondary">אנא כתוב חיבור באורך 25-50 שורות</div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className={`font-mono text-xl font-black ${timeRemaining < 300 ? 'text-neon-pink animate-pulse' : 'text-electric-blue'}`}>
                        {formatTime(timeRemaining)}
                    </div>
                </div>
            </div>

            {/* Writing Area */}
            <div className="flex-1 p-6 max-w-4xl mx-auto w-full flex flex-col">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-4 flex-1 flex flex-col shadow-inner">
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="התחל לכתוב את החיבור שלך כאן..."
                        className="flex-1 bg-transparent resize-none focus:outline-none text-lg leading-relaxed text-right"
                        dir="rtl"
                        autoFocus
                        spellCheck={false}
                    />
                </div>

                {/* Status Bar */}
                <div className="flex justify-between items-center">
                    <div className="flex gap-6 text-sm text-text-secondary font-mono">
                        <div>מילים: <span className="text-white font-bold">{wordCount}</span></div>
                        <div>שורות: <span className={`font-bold ${lineCount < 25 ? 'text-cyber-yellow' : 'text-emerald-400'}`}>{lineCount}</span> / 25-50</div>
                    </div>

                    <button
                        onClick={handleFinish}
                        disabled={isAnalyzing}
                        className="px-8 py-3 bg-electric-blue text-charcoal font-black rounded-xl hover:scale-105 transition-transform shadow-glow-blue disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        הגש מטלה 📝
                    </button>
                </div>

                {/* Validation Warning */}
                {showWarning && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-neon-pink/10 border border-neon-pink/30 text-neon-pink px-6 py-3 rounded-xl flex items-center gap-3 backdrop-blur-md"
                    >
                        <AlertTriangle className="w-5 h-5" />
                        <span className="font-bold text-sm">החיבור קצר מדי! נסה לכתוב לפחות 10 שורות.</span>
                    </motion.div>
                )}
            </div>
        </div>
    );
};
