import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Timer, AlertTriangle, CheckCircle, FileText } from 'lucide-react';

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

    const handleFinish = () => {
        // Basic validation: at least 15 lines or 100 words? 
        // Real exam requires 25-50 lines. Let's be lenient for MVP.
        const isValid = lineCount >= 10 || wordCount >= 100;

        onFinish({
            score: isValid ? 100 : 50, // Participation score
            details: 'מטלת כתיבה',
            text: text,
            wordCount,
            lineCount
        });
    };

    return (
        <div className="h-screen bg-charcoal text-white flex flex-col relative">
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
                        onClick={() => {
                            if (lineCount < 10) {
                                setShowWarning(true);
                                setTimeout(() => setShowWarning(false), 3000);
                            } else {
                                handleFinish();
                            }
                        }}
                        className="px-8 py-3 bg-electric-blue text-charcoal font-black rounded-xl hover:scale-105 transition-transform shadow-glow-blue"
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
