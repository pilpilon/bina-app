import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, BookOpen, BarChart3, User, Home, Flame, ChevronRight, ChevronLeft, X, Check, TrendingUp, Calendar, Zap } from 'lucide-react';
import SwipeCard from './components/SwipeCard';
import PerformanceChart from './components/PerformanceChart';
import vocabData from './data/vocabulary.json';
import analogiesData from './data/analogies.json';
import quantitativeData from './data/quantitative.json';
import englishData from './data/english.json';
import { useEffect } from 'react';

// --- Types ---
interface WordCard {
    id: string;
    word: string;
    definition: string;
    example: string;
    category: string;
    difficulty: string;
}

// --- UI Components ---

const GlassCard = ({ children, className = "", variant = "white", ...props }: any) => {
    const bgClass = variant === "white" ? "bg-white/10" : "bg-black/40";
    return (
        <div
            className={`backdrop-blur-xl border border-white/10 rounded-2xl shadow-glass ${bgClass} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

// ... existing components (SmartCTA, StatCard, NavItem) ...

const SmartCTA = ({ onClick }: any) => {
    // Component content (lines 16-29) - using existing logic
    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onClick('smart')}
            className="w-full p-5 mb-8 rounded-2xl bg-electric-blue text-charcoal shadow-glow-blue flex items-center justify-center gap-4 group"
        >
            <div className="bg-charcoal/10 p-2 rounded-lg group-hover:bg-charcoal/20 transition-colors">
                <Target className="w-8 h-8" />
            </div>
            <div className="text-right">
                <div className="text-xl font-black">תרגול חכם - 5 דקות</div>
                <div className="text-sm font-medium opacity-80">ה-AI ימצא את נקודות התורפה שלך</div>
            </div>
        </motion.button>
    );
};

const StatCard = ({ label, value, colorClass = "text-electric-blue" }: any) => (
    <GlassCard className="p-6 text-center flex flex-col items-center justify-center gap-1 hover:border-white/20 transition-colors">
        <div className={`text-3xl font-black ${colorClass}`}>{value}</div>
        <div className="text-sm font-medium text-text-secondary">{label}</div>
    </GlassCard>
);

const NavItem = ({ icon: Icon, label, active = false, onClick }: any) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${active ? 'bg-electric-blue/20 text-electric-blue' : 'text-text-secondary hover:bg-white/5'}`}
    >
        <Icon className="w-6 h-6" />
        <span className="text-[10px] font-bold">{label}</span>
    </button>
);

// --- Screen Components ---

const HomeScreen = ({ onStartLearning }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="px-5 pt-8 pb-32"
    >
        <header className="text-center mb-8">
            <div className="flex justify-center items-center gap-3 mb-2">
                <h1 className="text-5xl font-black bg-gradient-to-r from-electric-blue to-neon-purple bg-clip-text text-transparent tracking-tighter">
                    Bina
                </h1>
                <div className="w-12 h-12 bg-white/5 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10">
                    <span className="text-2xl">🧠</span>
                </div>
            </div>
            <p className="text-text-secondary font-medium">AI מותאם אישית לפסיכומטרי שלך</p>
        </header>

        <div className="flex justify-center mb-8">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-neon-purple to-neon-pink shadow-glow-purple font-black text-xl"
            >
                <Flame className="w-6 h-6 fill-white" />
                <span>7 ימים ברצף</span>
            </motion.div>
        </div>

        <SmartCTA onClick={onStartLearning} />

        <h3 className="text-xl font-bold mb-4 pr-1">סטטיסטיקה בזמן אמת</h3>
        <div className="grid grid-cols-2 gap-4 mb-10">
            <StatCard label="ציון חזוי" value="687" colorClass="bg-gradient-to-r from-electric-blue to-cyber-yellow bg-clip-text text-transparent" />
            <StatCard label="תרגילים היום" value="23" />
            <StatCard label="דיוק כללי" value="89%" />
            <StatCard label="מילים נלמדו" value="142" />
        </div>

        <h3 className="text-xl font-bold mb-4 pr-1">נושאים מומלצים</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TopicCard
                icon={BookOpen}
                title="אנלוגיות מורכבות"
                sub="דיוק נוכחי: 72%"
                color="text-neon-purple"
                bg="bg-neon-purple/20"
                onClick={() => onStartLearning('analogies')}
            />
            <TopicCard
                icon={Target}
                title="חשיבה כמותית"
                sub="אלגברה וגיאומטריה"
                color="text-cyber-yellow"
                bg="bg-cyber-yellow/20"
                onClick={() => onStartLearning('quantitative')}
            />
            <TopicCard
                icon={Zap}
                title="אנגלית"
                sub="אוצר מילים וניסוח"
                color="text-electric-blue"
                bg="bg-electric-blue/20"
                onClick={() => onStartLearning('english')}
            />
            <TopicCard
                icon={Flame}
                title="אוצר מילים"
                sub="רמה מתקדמת"
                color="text-neon-pink"
                bg="bg-neon-pink/20"
                onClick={() => onStartLearning('vocabulary')}
            />
        </div>

        <div className="mt-8 mb-4 flex items-center justify-between">
            <h3 className="text-xl font-bold pr-1">מילים שלי</h3>
            <button
                onClick={() => onStartLearning('custom-edit')}
                className="text-xs font-black text-electric-blue uppercase tracking-wider hover:underline"
            >
                + ערוך רשימה
            </button>
        </div>
        <GlassCard
            className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-all group border-dashed border-white/20"
            onClick={() => onStartLearning('custom')}
        >
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-text-muted group-hover:text-electric-blue transition-colors">
                    <BarChart3 className="w-7 h-7" />
                </div>
                <div>
                    <div className="font-bold text-lg">הרשימה האישית שלי</div>
                    <div className="text-xs text-text-secondary">ייבא מילים משלך למבחן מהיר</div>
                </div>
            </div>
            <ChevronRight className="w-6 h-6 text-text-muted group-hover:text-electric-blue" />
        </GlassCard>
    </motion.div>
);

const TopicCard = ({ icon: Icon, title, sub, color, bg, onClick }: any) => (
    <GlassCard
        className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors group cursor-pointer"
        onClick={onClick}
    >
        <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center ${color}`}>
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <div className="font-bold">{title}</div>
                <div className="text-xs text-text-secondary">{sub}</div>
            </div>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onClick(); }} className="text-electric-blue font-bold text-sm">תרגל</button>
    </GlassCard>
);

const LearningScreen = ({ onBack, topic = 'vocabulary', ...props }: { onBack: () => void, topic?: string, [key: string]: any }) => {
    const [index, setIndex] = useState(0);
    const [knownCount, setKnownCount] = useState(0);

    const getDataSet = () => {
        switch (topic) {
            case 'analogies': return analogiesData;
            case 'quantitative': return quantitativeData;
            case 'english': return englishData;
            case 'weakPoints': return (props as any).weakPoints || [];
            case 'custom': return (props as any).customLists || [];
            default: return vocabData;
        }
    };

    const currentDataSet = getDataSet();
    const isFinished = index >= currentDataSet.length;
    const currentWord = !isFinished ? currentDataSet[index] : currentDataSet[0];

    const topicTitles: Record<string, { title: string, sub: string }> = {
        vocabulary: { title: 'אוצר מילים', sub: 'רמה מתקדמת' },
        analogies: { title: 'אנלוגיות', sub: 'חשיבה מילולית' },
        quantitative: { title: 'חשיבה כמותית', sub: 'אלגברה וגיאומטריה' },
        english: { title: 'אנגלית', sub: 'Sentence Completion' },
        weakPoints: { title: 'חיזוק חולשות', sub: 'מבוסס על ביצועים' },
        custom: { title: 'הרשימה שלי', sub: 'מילים שייבאת' }
    };

    const currentTopicInfo = topicTitles[topic] || topicTitles.vocabulary;

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="px-5 pt-8 pb-32 h-screen flex flex-col"
        >
            <div className="flex items-center justify-between mb-8">
                <button onClick={onBack} className="p-2 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="text-center">
                    <div className="text-xs font-bold text-text-muted uppercase tracking-widest">{currentTopicInfo.title}</div>
                    <div className="text-sm font-black text-electric-blue">{currentTopicInfo.sub}</div>
                </div>
                <div className="w-10" /> {/* Spacer */}
            </div>

            <div className="mb-8">
                <div className="flex justify-between items-center mb-2 text-xs font-bold text-text-secondary">
                    <span>תהליך למידה</span>
                    <span>{Math.min(index + 1, currentDataSet.length)}/{currentDataSet.length}</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(Math.min(index + 1, currentDataSet.length) / currentDataSet.length) * 100}%` }}
                        className="h-full bg-gradient-to-r from-neon-purple to-electric-blue shadow-glow-blue"
                    />
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center relative">
                {isFinished ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card p-8 text-center flex flex-col items-center gap-6 w-full max-w-[360px]"
                    >
                        <div className="text-6xl">🎉</div>
                        <h2 className="text-2xl font-black text-electric-blue">סיימת את הסט!</h2>
                        <p className="text-text-secondary">ידעת <span className="text-electric-blue font-bold">{knownCount}</span> מתוך <span className="font-bold">{currentDataSet.length}</span> כרטיסיות</p>
                        <div className="flex gap-4 mt-2">
                            <button
                                onClick={() => { setIndex(0); setKnownCount(0); }}
                                className="px-6 py-3 rounded-xl font-bold bg-electric-blue/20 border border-electric-blue text-electric-blue hover:bg-electric-blue/30 transition-all"
                            >
                                שוב 🔄
                            </button>
                            <button
                                onClick={onBack}
                                className="px-6 py-3 rounded-xl font-bold bg-white/5 border border-white/10 text-text-secondary hover:bg-white/10 transition-all"
                            >
                                חזור
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <AnimatePresence mode="wait">
                        <SwipeCard
                            key={`${topic}-${index}`}
                            {...currentWord}
                            onSwipeLeft={() => { setKnownCount(prev => prev + 1); setIndex(prev => prev + 1); }}
                            onSwipeRight={() => {
                                if ((props as any).onMiss) (props as any).onMiss(currentWord);
                                setIndex(prev => prev + 1);
                            }}
                        />
                    </AnimatePresence>
                )}
            </div>

            <div className="flex justify-between px-8 mt-8">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-full border-2 border-neon-pink flex items-center justify-center text-neon-pink bg-neon-pink/10 shadow-glow-purple">
                        <X className="w-8 h-8" />
                    </div>
                    <span className="text-xs font-bold text-text-secondary">לא יודע</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-full border-2 border-electric-blue flex items-center justify-center text-electric-blue bg-electric-blue/10 shadow-glow-blue">
                        <Check className="w-8 h-8" />
                    </div>
                    <span className="text-xs font-bold text-text-secondary">יודע</span>
                </div>
            </div>
        </motion.div>
    );
};

const StatsScreen = () => {
    const accuracyData = [
        { label: 'כמותי', value: 82, color: '#00D9FF' },
        { label: 'מילולי', value: 75, color: '#B026FF' },
        { label: 'אנגלית', value: 91, color: '#FFD700' }
    ];

    const weeklyActivity = [
        { day: 'א', value: 45 },
        { day: 'ב', value: 60 },
        { day: 'ג', value: 30 },
        { day: 'ד', value: 85 },
        { day: 'ה', value: 40 },
        { day: 'ו', value: 20 },
        { day: 'ש', value: 10 },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-5 pt-8 pb-32"
        >
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-text-primary">סטטיסטיקה</h1>
                    <p className="text-sm text-text-secondary">התקדמות אישית וניתוח AI</p>
                </div>
                <div className="w-12 h-12 glass-card-dark flex items-center justify-center text-neon-purple border-neon-purple/30">
                    <BarChart3 className="w-6 h-6" />
                </div>
            </header>

            {/* Predicted Score Overview */}
            <GlassCard className="p-8 mb-8 text-center relative overflow-hidden group">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-24 -right-24 w-48 h-48 bg-electric-blue/10 rounded-full blur-3xl"
                />
                <div className="relative z-10">
                    <div className="text-sm font-bold text-text-secondary uppercase tracking-[0.2em] mb-2">ציון חזוי נוכחי</div>
                    <div className="text-6xl font-black bg-gradient-to-r from-electric-blue via-cyber-yellow to-neon-purple bg-clip-text text-transparent filter drop-shadow-[0_0_15px_rgba(0,217,255,0.4)]">
                        687
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-4 text-emerald-400 font-bold">
                        <TrendingUp className="w-4 h-4" />
                        <span>+12 נקודות השבוע</span>
                    </div>
                </div>
            </GlassCard>

            {/* Accuracy Section */}
            <div className="mb-10">
                <div className="flex items-center gap-2 mb-6">
                    <Zap className="w-5 h-5 text-cyber-yellow" />
                    <h3 className="text-xl font-bold">דיוק לפי קטגוריות</h3>
                </div>
                <PerformanceChart data={accuracyData} max={100} />
            </div>

            {/* Weekly Activity */}
            <div>
                <div className="flex items-center gap-2 mb-6">
                    <Calendar className="w-5 h-5 text-neon-purple" />
                    <h3 className="text-xl font-bold">פעילות שבועית (דקות)</h3>
                </div>
                <div className="flex items-end justify-between h-32 px-2">
                    {weeklyActivity.map((day, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-2 h-full">
                            <div className="flex-1 w-6 flex items-end">
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${(day.value / 90) * 100}%` }}
                                    className="w-full bg-white/10 rounded-t-sm border-t border-white/20 hover:bg-neon-purple/20 transition-colors"
                                />
                            </div>
                            <span className="text-xs font-bold text-text-muted">{day.day}</span>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

const ProfileScreen = () => {
    const [toast, setToast] = useState<string | null>(null);

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    const settings = [
        { icon: User, label: 'עריכת פרופיל', color: 'text-electric-blue', action: () => showToast('עריכת פרופיל תהיה זמינה בגרסה הבאה 🚀') },
        { icon: Zap, label: 'הגדרות AI אישיות', color: 'text-cyber-yellow', action: () => showToast('הגדרות ה-AI שלך בקינפוג...') },
        { icon: Calendar, label: 'תוכנית לימודים', color: 'text-neon-purple', action: () => showToast('מחשב מסלול מחדש... 📅') },
        { icon: Check, label: 'התראות', color: 'text-emerald-400', action: () => showToast('מערכת ההתראות פעילה!') },
        { icon: X, label: 'התנתקות', color: 'text-neon-pink', action: () => window.location.reload() }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-5 pt-12 pb-32 relative"
        >
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-8 left-4 right-4 z-50 pointer-events-none"
                    >
                        <GlassCard className="p-3 bg-charcoal/80 border-electric-blue/50 text-center font-bold text-sm text-electric-blue shadow-glow-blue">
                            {toast}
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* User Header */}
            <div className="flex flex-col items-center mb-10">
                <div className="relative mb-4">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-electric-blue to-neon-purple p-1 shadow-glow-blue">
                        <div className="w-full h-full rounded-full bg-charcoal flex items-center justify-center overflow-hidden">
                            <User className="w-12 h-12 text-text-secondary" />
                        </div>
                    </div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 bg-cyber-yellow rounded-full border-4 border-charcoal flex items-center justify-center text-charcoal font-black text-xs">
                        Pro
                    </div>
                </div>
                <h2 className="text-2xl font-black">יונתן ישראלי</h2>
                <p className="text-text-secondary">נבחן במועד אפריל 2026</p>
            </div>

            {/* Daily Goals */}
            <div className="mb-8">
                <h3 className="text-xl font-bold mb-4 pr-1">מטרות יומיות</h3>
                <GlassCard className="p-6 space-y-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <BookOpen className="w-5 h-5 text-electric-blue" />
                            <span className="font-bold text-sm">שאלות לתרגול</span>
                        </div>
                        <span className="text-electric-blue font-black">23/50</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-electric-blue w-[46%] shadow-glow-blue" />
                    </div>

                    <div className="pt-2 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Zap className="w-5 h-5 text-cyber-yellow" />
                            <span className="font-bold text-sm">זמן למידה</span>
                        </div>
                        <span className="text-cyber-yellow font-black">45/60 דק'</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-cyber-yellow w-[75%] shadow-glow-yellow" />
                    </div>
                </GlassCard>
            </div>

            {/* Settings List */}
            <div className="space-y-3">
                <h3 className="text-xl font-bold mb-4 pr-1">הגדרות וחשבון</h3>
                {settings.map((item, idx) => (
                    <GlassCard
                        key={idx}
                        className="p-4 flex items-center justify-between hover:bg-white/5 cursor-pointer transition-colors group"
                        onClick={item.action}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg bg-white/5 ${item.color}`}>
                                <item.icon className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-sm">{item.label}</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-text-primary transition-colors" />
                    </GlassCard>
                ))}
            </div>
        </motion.div>
    );
};

const CustomListScreen = ({ onSave, onBack }: any) => {
    const [text, setText] = useState('');

    const handleImport = () => {
        const lines = text.split('\n');
        const newList: WordCard[] = lines
            .filter(line => line.includes(':') || line.includes('-'))
            .map((line, idx) => {
                const [word, ...defParts] = line.split(/[:\-]/);
                return {
                    id: `custom-${Date.now()}-${idx}`,
                    word: word.trim(),
                    definition: defParts.join(':').trim(),
                    example: 'נוסף על ידי היוזר',
                    category: 'הרשימה שלי',
                    difficulty: 'medium'
                };
            });

        if (newList.length > 0) {
            onSave(newList);
            onBack();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-5 pt-8 pb-32 h-screen flex flex-col"
        >
            <div className="flex items-center justify-between mb-8">
                <button onClick={onBack} className="p-2 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-black text-electric-blue">ייבוא אוצר מילים</h2>
                <div className="w-10" />
            </div>

            <GlassCard className="p-6 flex-1 flex flex-col gap-4">
                <div className="text-sm text-text-secondary leading-relaxed mb-2">
                    הכנס מילים בפורמט: <code className="text-neon-purple font-mono">מילה : פירוש</code>
                    <br />ערוך כל מילה בשורה חדשה.
                </div>
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Apple : תפוח&#10;Banana : בננה"
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl p-4 text-text-primary font-mono text-sm focus:outline-none focus:border-electric-blue/50 transition-colors resize-none mb-4"
                />
                <button
                    onClick={handleImport}
                    disabled={!text.trim()}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-electric-blue to-neon-purple text-charcoal font-black text-lg shadow-glow-blue disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all"
                >
                    צור מבחן כרטיסיות 🚀
                </button>
            </GlassCard>
        </motion.div>
    );
};

const SmartAlert = ({ card, onClose, onAction }: any) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="fixed top-8 left-4 right-4 z-[100]"
    >
        <GlassCard className="p-4 border-electric-blue/50 shadow-glow-blue relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-electric-blue animate-pulse" />
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-electric-blue/20 flex items-center justify-center text-electric-blue">
                    <Zap className="w-7 h-7" />
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <div className="text-[10px] font-black tracking-widest text-electric-blue mb-1 uppercase">Surprise AI Challenge</div>
                        <button onClick={onClose} className="text-text-muted hover:text-white transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="text-base font-bold text-white mb-2">זוכר מה זה <span className="text-electric-blue">"{card.word}"</span>?</div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onAction()}
                            className="text-xs font-black bg-electric-blue/10 text-electric-blue px-3 py-1.5 rounded-lg border border-electric-blue/30 hover:bg-electric-blue/20 transition-all"
                        >
                            בדוק אותי
                        </button>
                    </div>
                </div>
            </div>
        </GlassCard>
    </motion.div>
);

// --- Main App ---

function App() {
    const [activeTab, setActiveTab] = useState('home');
    const [isLearning, setIsLearning] = useState(false);
    const [learningTopic, setLearningTopic] = useState('vocabulary');
    const [customLists, setCustomLists] = useState<WordCard[]>(() => {
        const saved = localStorage.getItem('bina_custom_lists');
        return saved ? JSON.parse(saved) : [];
    });
    const [weakPoints, setWeakPoints] = useState<WordCard[]>(() => {
        const saved = localStorage.getItem('bina_weak_points');
        return saved ? JSON.parse(saved) : [];
    });
    const [showSurprise, setShowSurprise] = useState<WordCard | null>(null);

    useEffect(() => {
        localStorage.setItem('bina_custom_lists', JSON.stringify(customLists));
    }, [customLists]);

    useEffect(() => {
        localStorage.setItem('bina_weak_points', JSON.stringify(weakPoints));
    }, [weakPoints]);

    const startLearning = (topic = 'vocabulary') => {
        let finalTopic = topic;

        if (topic === 'smart') {
            const topics = ['vocabulary', 'analogies', 'quantitative', 'english'];
            // If we have weak points, 50% chance to pick from them
            if (weakPoints.length > 0 && Math.random() > 0.5) {
                finalTopic = 'weakPoints';
            } else {
                finalTopic = topics[Math.floor(Math.random() * topics.length)];
            }
        }

        setLearningTopic(finalTopic);
        setIsLearning(true);
    };

    const addToWeakPoints = (card: WordCard) => {
        setWeakPoints(prev => {
            if (prev.find(p => p.id === card.id)) return prev;
            return [...prev, card].slice(-20); // Keep last 20 weak points
        });

        // Randomly trigger surprise after swiping unknown (higher chance for demo)
        if (Math.random() > 0.4) {
            setTimeout(() => setShowSurprise(card), 1500);
        }
    };

    return (
        <div className="min-h-screen bg-charcoal text-text-primary font-sans selection:bg-electric-blue/30 overflow-x-hidden scanline-overlay" dir="rtl">
            {/* Background Particles Decoration */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[10%] left-[5%] w-64 h-64 bg-electric-blue/10 rounded-full blur-3xl animate-float" style={{ animationDuration: '8s' }} />
                <div className="absolute top-[60%] right-[10%] w-96 h-96 bg-neon-purple/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s', animationDuration: '10s' }} />
                <div className="absolute bottom-[10%] left-[20%] w-48 h-48 bg-neon-pink/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s', animationDuration: '7s' }} />
            </div>

            <div className="relative z-10 max-w-md mx-auto min-h-screen flex flex-col">
                <AnimatePresence mode="wait">
                    {showSurprise && (
                        <SmartAlert
                            key="surprise"
                            card={showSurprise}
                            onClose={() => setShowSurprise(null)}
                            onAction={() => {
                                startLearning('weakPoints');
                                setShowSurprise(null);
                            }}
                        />
                    )}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                    {isLearning ? (
                        <LearningScreen
                            key="learning"
                            topic={learningTopic}
                            onBack={() => setIsLearning(false)}
                            weakPoints={weakPoints}
                            customLists={customLists}
                            onMiss={addToWeakPoints}
                        />
                    ) : (
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="flex-1"
                        >
                            {activeTab === 'home' && (
                                <HomeScreen
                                    onStartLearning={(topic: string) => {
                                        if (topic === 'custom-edit') setActiveTab('custom-edit');
                                        else startLearning(topic);
                                    }}
                                />
                            )}
                            {activeTab === 'custom-edit' && (
                                <CustomListScreen
                                    onSave={(list: WordCard[]) => setCustomLists(list)}
                                    onBack={() => setActiveTab('home')}
                                />
                            )}
                            {activeTab === 'learning' && <LearningScreen topic="vocabulary" onBack={() => setActiveTab('home')} />}
                            {activeTab === 'stats' && <StatsScreen />}
                            {activeTab === 'profile' && <ProfileScreen />}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Navigation Bar */}
            {!isLearning && (
                <nav className="fixed bottom-0 left-0 right-0 bg-black/60 backdrop-blur-2xl border-t border-white/10 px-4 py-4 flex justify-around items-center z-50">
                    <NavItem icon={Home} label="בית" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
                    <NavItem icon={BookOpen} label="למידה" active={activeTab === 'learning'} onClick={() => setActiveTab('learning')} />
                    <NavItem icon={BarChart3} label="נתונים" active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} />
                    <NavItem icon={User} label="פרופיל" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
                </nav>
            )}
        </div>
    );
}

export default App;



