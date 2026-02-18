import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, BookOpen, BarChart3, User, Home, Flame, ChevronRight, ChevronLeft, X, Check, TrendingUp, Calendar, Zap, Timer, Heart } from 'lucide-react';
import SwipeCard from './components/SwipeCard';
import PerformanceChart from './components/PerformanceChart';
import vocabData from './data/vocabulary.json';
import analogiesData from './data/analogies.json';
import quantitativeData from './data/quantitative.json';
import englishData from './data/english.json';
import { useEffect } from 'react';
import ExamScreen from './components/ExamScreen';
import OnboardingScreen, { UserProfile } from './components/OnboardingScreen';

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

const HomeScreen = ({ onStartLearning, userProfile, userStats, getLevelName }: any) => {
    const totalQuestions = Object.values(userStats.categoryTotal || {}).reduce((a: any, b: any) => a + Number(b), 0) as number;
    const totalErrors = Object.values(userStats.categoryErrors || {}).reduce((a: any, b: any) => a + Number(b), 0) as number;
    const accuracy = totalQuestions > 0 ? Math.round(((totalQuestions - totalErrors) / totalQuestions) * 100) : 0;
    const wordsLearned = Math.floor(userStats.xp / 10);

    return (
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
                    <span>{userStats.streak.count} ימים ברצף</span>
                </motion.div>
            </div>

            <div className="mb-8 px-2">
                <div className="flex justify-between items-center mb-2">
                    <div className="text-sm font-black text-white/70 uppercase tracking-wider">רמה {userStats.level}: {getLevelName(userStats.level)}</div>
                    <div className="text-sm font-black text-electric-blue">{userStats.xp} / {userStats.level * 500} XP</div>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden border border-white/5">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(userStats.xp % 500) / 5}%` }}
                        className="h-full bg-gradient-to-r from-electric-blue to-neon-purple"
                    />
                </div>
            </div>

            <SmartCTA onClick={onStartLearning} />

            {/* Pro Banner */}
            <GlassCard
                className="p-5 mb-8 bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 border-neon-purple/30 cursor-pointer overflow-hidden relative group"
                onClick={() => onStartLearning('pricing')}
            >
                <motion.div
                    animate={{ x: [0, 50, 0] }}
                    transition={{ duration: 10, repeat: Infinity }}
                    className="absolute -top-10 -right-10 w-32 h-32 bg-neon-pink/10 blur-3xl rounded-full"
                />
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <div className="text-xs font-black text-neon-pink uppercase tracking-widest mb-1">מבצע זמן מוגבל</div>
                        <div className="text-lg font-black text-white">קבל Bina Pro ב-30% הנחה!</div>
                        <div className="text-xs text-text-secondary">גישה חופשית לכל הסברי ה-AI</div>
                    </div>
                    <div className="bg-neon-pink text-white px-3 py-1 rounded-lg font-black text-sm">שדרוג</div>
                </div>
            </GlassCard>

            {/* Favorites Section */}
            {userStats.favorites?.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-xl font-bold mb-4 pr-1">מועדפים שלי ({userStats.favorites.length})</h3>
                    <GlassCard
                        className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-all group border-neon-pink/30 shadow-glow-pink/10"
                        onClick={() => onStartLearning('favorites')}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-neon-pink/10 rounded-xl flex items-center justify-center text-neon-pink group-hover:scale-110 transition-transform">
                                <Heart className="w-7 h-7 fill-neon-pink" />
                            </div>
                            <div>
                                <div className="font-bold text-lg">חזרה על המועדפים</div>
                                <div className="text-xs text-text-secondary">מבחן ממוקד על המילים ששמרת</div>
                            </div>
                        </div>
                        <ChevronLeft className="w-6 h-6 text-neon-pink" />
                    </GlassCard>
                </div>
            )}

            <h3 className="text-xl font-bold mb-4 pr-1">סטטיסטיקה בזמן אמת</h3>
            <div className="grid grid-cols-2 gap-4 mb-10">
                <StatCard label="ציון יעד" value={userProfile?.targetScore ?? '687'} colorClass="bg-gradient-to-r from-electric-blue to-cyber-yellow bg-clip-text text-transparent" />
                <StatCard label="תרגילים היום" value={userStats.dailyQuestions || '0'} />
                <StatCard label="דיוק כללי" value={`${accuracy}%`} />
                <StatCard label="מילים נלמדו" value={wordsLearned} />
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
                <TopicCard
                    icon={Timer}
                    title="מרתון - סימולציה"
                    sub="20 דקות | 20 שאלות"
                    color="text-emerald-400"
                    bg="bg-emerald-400/20"
                    onClick={() => onStartLearning('marathon')}
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
                <ChevronLeft className="w-6 h-6 text-text-muted group-hover:text-electric-blue" />
            </GlassCard>
        </motion.div>
    );
};

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

const LearningScreen = ({ onBack, topic = 'vocabulary', awardXP, recordActivity, favorites = [], onToggleFavorite, ...props }: { onBack: () => void, topic?: string, awardXP: (n: number) => void, recordActivity: (xp: number, cat: string, correct: boolean) => void, favorites?: string[], onToggleFavorite?: (id: string) => void, [key: string]: any }) => {
    const [index, setIndex] = useState(0);
    const [knownCount, setKnownCount] = useState(0);

    const getDataSet = () => {
        switch (topic) {
            case 'analogies': return analogiesData;
            case 'quantitative': return quantitativeData;
            case 'english': return englishData;
            case 'weakPoints': return (props as any).weakPoints || [];
            case 'custom': return (props as any).customLists || [];
            case 'favorites': {
                const allData = [...vocabData, ...analogiesData, ...quantitativeData, ...englishData];
                return allData.filter(item => favorites.includes(item.id));
            }
            default: return vocabData;
        }
    };

    const currentDataSet = getDataSet();
    const isFinished = index >= currentDataSet.length;
    const currentWord = !isFinished ? currentDataSet[index] : currentDataSet[0];

    const topicTitles: Record<string, { title: string, sub: string, category: string }> = {
        vocabulary: { title: 'אוצר מילים', sub: 'רמה מתקדמת', category: 'אוצר מילים' },
        analogies: { title: 'אנלוגיות', sub: 'חשיבה מילולית', category: 'מילולי' },
        quantitative: { title: 'חשיבה כמותית', sub: 'אלגברה וגיאומטריה', category: 'כמותי' },
        english: { title: 'אנגלית', sub: 'Sentence Completion', category: 'אנגלית' },
        weakPoints: { title: 'חיזוק חולשות', sub: 'מבוסס על ביצועים', category: 'חיזוק' },
        custom: { title: 'הרשימה שלי', sub: 'מילים שייבאת', category: 'אישי' },
        favorites: { title: 'מועדפים', sub: 'מילים ששמרת', category: 'מועדפים' }
    };

    const currentTopicInfo = topicTitles[topic] || topicTitles.vocabulary;

    if (topic === 'marathon') {
        // Generate 20 questions for the marathon
        const allQuestions = [...vocabData, ...analogiesData, ...quantitativeData, ...englishData];
        const shuffled = allQuestions.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 20).map(q => ({
            ...q,
            correctAnswer: (q as any).definition || (q as any).answer || (q as any).word // Simple mapping for demo
        }));

        return (
            <ExamScreen
                questions={selected}
                onClose={onBack}
                onShowExplanation={(item) => (props as any).onShowExplanation?.(item)}
            />
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="px-5 pt-8 pb-32 h-screen flex flex-col"
        >
            <div className="flex items-center justify-between mb-8">
                <button onClick={onBack} className="p-2 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                    <ChevronRight className="w-6 h-6" />
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
                                onClick={() => {
                                    setIndex(0);
                                    setKnownCount(0);
                                    awardXP(20);
                                }}
                                className="px-6 py-3 rounded-xl font-bold bg-electric-blue/20 border border-electric-blue text-electric-blue hover:bg-electric-blue/30 transition-all"
                            >
                                שוב 🔄
                            </button>
                            <button
                                onClick={() => {
                                    awardXP(20);
                                    onBack();
                                }}
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
                            isFavorite={favorites.includes(currentWord.id)}
                            onToggleFavorite={() => onToggleFavorite?.(currentWord.id)}
                            onSwipeLeft={() => {
                                setKnownCount(prev => prev + 1);
                                setIndex(prev => prev + 1);
                                recordActivity(10, currentTopicInfo.category, true);
                            }}
                            onSwipeRight={() => {
                                if ((props as any).onMiss) (props as any).onMiss(currentWord);
                                setIndex(prev => prev + 1);
                                recordActivity(5, currentTopicInfo.category, false);
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

const StatsScreen = ({ userStats, userProfile }: any) => {
    const accuracyData = [
        {
            label: 'כמותי',
            value: userStats.categoryTotal?.['כמותי']
                ? Math.round(((userStats.categoryTotal['כמותי'] - (userStats.categoryErrors['כמותי'] || 0)) / userStats.categoryTotal['כמותי']) * 100)
                : 82,
            color: '#00D9FF'
        },
        {
            label: 'מילולי',
            value: userStats.categoryTotal?.['מילולי']
                ? Math.round(((userStats.categoryTotal['מילולי'] - (userStats.categoryErrors['מילולי'] || 0)) / userStats.categoryTotal['מילולי']) * 100)
                : 75,
            color: '#B026FF'
        },
        {
            label: 'אנגלית',
            value: userStats.categoryTotal?.['אנגלית']
                ? Math.round(((userStats.categoryTotal['אנגלית'] - (userStats.categoryErrors['אנגלית'] || 0)) / userStats.categoryTotal['אנגלית']) * 100)
                : 91,
            color: '#FFD700'
        }
    ];

    const weeklyActivity = userStats.activityHistory || [
        { day: 'א', value: 45 },
        { day: 'ב', value: 60 },
        { day: 'ג', value: 30 },
        { day: 'ד', value: 85 },
        { day: 'ה', value: 40 },
        { day: 'ו', value: 20 },
        { day: 'ש', value: 10 },
    ];

    // Simple predicted score logic: targetScore adjusted by XP and accuracy
    const totalQuestions = Object.values(userStats.categoryTotal || {}).reduce((a: any, b: any) => a + b, 0) as number;
    const totalErrors = Object.values(userStats.categoryErrors || {}).reduce((a: any, b: any) => a + b, 0) as number;
    const accuracy = totalQuestions > 0 ? (totalQuestions - totalErrors) / totalQuestions : 0.8;

    const baseScore = userProfile?.targetScore || 687;
    const xpBonus = Math.min(50, (userStats.xp / 100));
    const accuracyBonus = (accuracy - 0.7) * 100;
    const predictedScore = Math.min(800, Math.round(baseScore + xpBonus + accuracyBonus));

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
                        {predictedScore}
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-4 text-emerald-400 font-bold">
                        <TrendingUp className="w-4 h-4" />
                        <span>+{Math.round(xpBonus + accuracyBonus)} נקודות השבוע</span>
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
                    {weeklyActivity.map((day: any, idx: number) => (
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

const AchievementsScreen = ({ achievements, onBack }: { achievements: string[], onBack: () => void }) => {
    const list = [
        { id: 'centurion', name: '🌟 הצעד הראשון', desc: 'הגעת ל-100 XP ראשונים', icon: '🎯' },
        { id: 'streak3', name: '🔥 התמדה', desc: '3 ימים ברצף', icon: '⚡' },
        { id: 'marathon', name: '🏃 מרתוניסט', desc: 'סיימת סימולציה מלאה', icon: '🏆' },
        { id: 'perfect', name: '💎 שלמות', desc: '100% דיוק בסט של 20', icon: '✨' }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="px-5 pt-12 pb-32"
        >
            <button onClick={onBack} className="flex items-center gap-2 text-text-muted mb-8 font-bold">
                <ChevronRight className="w-5 h-5" />
                <span>חזור</span>
            </button>
            <h1 className="text-3xl font-black mb-6">הישגים ותארים</h1>
            <div className="grid grid-cols-1 gap-4">
                {list.map(ach => {
                    const unlocked = achievements.includes(ach.id);
                    return (
                        <GlassCard key={ach.id} className={`p-4 flex items-center gap-4 ${unlocked ? 'border-electric-blue/40' : 'opacity-40 grayscale'}`}>
                            <div className="text-4xl">{ach.icon}</div>
                            <div>
                                <div className="font-black text-lg">{ach.name}</div>
                                <div className="text-sm text-text-secondary">{ach.desc}</div>
                            </div>
                        </GlassCard>
                    );
                })}
            </div>
        </motion.div>
    );
};

const StudyPlanScreen = ({ userProfile, onBack }: any) => {
    const examDate = userProfile?.examDate ? new Date(userProfile.examDate) : new Date();
    const daysLeft = Math.max(0, Math.ceil((examDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
    const weeksLeft = Math.ceil(daysLeft / 7);

    const roadmap = [
        { title: 'שבוע יישור קו', desc: 'חזרה על יסודות האלגברה ואוצר מילים בסיסי', status: 'completed' },
        { title: 'שבוע חיזוקים', desc: 'אנלוגיות מורכבות ובעיות תנועה', status: 'current' },
        { title: 'שבוע אנגלית', desc: 'קריאת טקסטים ושיפור מהירות', status: 'upcoming' },
        { title: 'שבוע מרתון', desc: 'סימולציות מלאות וניהול זמנים', status: 'upcoming' }
    ];

    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="px-5 pt-12 pb-32">
            <button onClick={onBack} className="flex items-center gap-2 text-text-muted mb-8 font-bold">
                <ChevronRight className="w-5 h-5" />
                <span>חזור</span>
            </button>
            <h2 className="text-3xl font-black mb-2 text-neon-purple">תוכנית הלימודים</h2>
            <p className="text-text-secondary mb-8">נותרו {daysLeft} ימים (כ-{weeksLeft} שבועות) למבחן</p>

            <div className="space-y-6 relative">
                <div className="absolute top-0 right-4 bottom-0 w-0.5 bg-white/5" />
                {roadmap.map((item, idx) => (
                    <div key={idx} className="relative pr-10">
                        <div className={`absolute right-3 top-2 w-3 h-3 rounded-full border-2 ${item.status === 'completed' ? 'bg-emerald-400 border-emerald-400' : item.status === 'current' ? 'bg-neon-purple border-neon-purple shadow-glow-purple' : 'bg-charcoal border-white/20'}`} />
                        <GlassCard className={`p-4 ${item.status === 'upcoming' ? 'opacity-50' : ''}`}>
                            <h4 className="font-black text-lg">{item.title}</h4>
                            <p className="text-sm text-text-secondary">{item.desc}</p>
                        </GlassCard>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

const AISettingsScreen = ({ userStats, onBack, onUpdateStats }: any) => {
    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="px-5 pt-12 pb-32">
            <button onClick={onBack} className="flex items-center gap-2 text-text-muted mb-8 font-bold">
                <ChevronRight className="w-5 h-5" />
                <span>חזור</span>
            </button>
            <h2 className="text-3xl font-black mb-2 text-cyber-yellow">הגדרות AI אישיות</h2>
            <p className="text-text-secondary mb-8">ה-Bina לומדת את החוזקות והחולשות שלך</p>

            <div className="grid grid-cols-1 gap-4">
                <GlassCard className="p-6">
                    <h4 className="font-bold text-cyber-yellow mb-2 text-sm uppercase tracking-wider">סטטוס למידה</h4>
                    <div className="text-4xl font-black mb-1">רמה {userStats.level}</div>
                    <div className="text-text-secondary text-sm">{userStats.xp} XP נצברו עד כה</div>
                </GlassCard>

                <div className="grid grid-cols-2 gap-4">
                    <GlassCard className="p-4">
                        <div className="text-emerald-400 font-bold text-xs mb-1 uppercase">חוזקה עיקרית</div>
                        <div className="font-black text-xl">אנגלית</div>
                    </GlassCard>
                    <GlassCard className="p-4">
                        <div className="text-neon-pink font-bold text-xs mb-1 uppercase">לחיזוק</div>
                        <div className="font-black text-xl">אנלוגיות</div>
                    </GlassCard>
                </div>

                {/* Teacher Mode Toggle */}
                <GlassCard className="p-5 border-electric-blue/30">
                    <h4 className="font-bold text-white/70 mb-4 text-sm uppercase">AI Teacher Mode 🤖</h4>
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <div className="font-bold">הסבר אוטומטי לטעויות</div>
                            <div className="text-xs text-text-secondary mt-1">Bina תסביר כל טעות מיד לאחר שתבצע אותה</div>
                        </div>
                        <button
                            onClick={() => onUpdateStats?.({ ...userStats, teacherMode: !userStats.teacherMode })}
                            className={`w-14 h-7 rounded-full transition-colors relative flex-shrink-0 ${userStats.teacherMode ? 'bg-electric-blue shadow-glow-blue' : 'bg-white/10'}`}
                        >
                            <motion.div
                                animate={{ x: userStats.teacherMode ? 28 : 4 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                className="absolute top-1.5 w-4 h-4 bg-white rounded-full shadow-sm"
                            />
                        </button>
                    </div>
                    {userStats.teacherMode && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-4 text-xs text-electric-blue font-bold bg-electric-blue/10 rounded-lg p-3"
                        >
                            ✅ מצב מורה פעיל — Bina תסביר לך כל טעות!
                        </motion.div>
                    )}
                </GlassCard>

                <GlassCard className="p-6">
                    <h4 className="font-bold text-white/70 mb-4 text-sm uppercase">התראות חכמות</h4>
                    <div className="flex items-center justify-between">
                        <span className="font-bold">תזכורת תרגול יומית</span>
                        <div className="w-12 h-6 bg-electric-blue/20 rounded-full relative">
                            <div className="absolute left-1 top-1 w-4 h-4 bg-electric-blue rounded-full" />
                        </div>
                    </div>
                </GlassCard>
            </div>
        </motion.div>
    );
};

const PricingScreen = ({ onBack }: any) => {
    const plans = [
        { name: 'חינם', price: '0₪', features: ['גישה לבנק שאלות בסיסי', 'סטטיסטיקה יומית', 'תמיכה בקהילה'], active: true },
        { name: 'Bina Pro', price: '49₪', period: '/חודש', features: ['הסברי AI לכל שאלה', 'תוכנית לימודים דינמית', 'גישה לכל הקטגוריות', 'ניתוח חולשות מתקדם'], popular: true },
        { name: 'Elite', price: '499₪', period: ' חד פעמי', features: ['גישה לכל החיים', 'מפגש ייעוץ אישי עם AI', '20 סימולציות מלאות', 'ליווי עד הבחינה'] }
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, x: 0 }} className="px-5 pt-12 pb-32">
            <button onClick={onBack} className="flex items-center gap-2 text-text-muted mb-8 font-bold">
                <ChevronRight className="w-5 h-5" />
                <span>חזור</span>
            </button>
            <h2 className="text-3xl font-black mb-2 text-white">בחר את המסלול שלך</h2>
            <p className="text-text-secondary mb-8">כל מה שצריך כדי להגיע ל-800</p>

            <div className="space-y-4">
                {plans.map((plan, i) => (
                    <GlassCard key={i} className={`p-6 border-2 transition-all ${plan.popular ? 'border-electric-blue shadow-glow-blue scale-[1.02]' : 'border-white/5'}`}>
                        {plan.popular && <div className="text-[10px] font-black text-electric-blue uppercase mb-2 tracking-widest">הכי פופולרי</div>}
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <h4 className="text-xl font-black text-white">{plan.name}</h4>
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-black text-white">{plan.price}</span>
                                <span className="text-xs text-text-secondary">{plan.period}</span>
                            </div>
                        </div>
                        <ul className="space-y-2 mb-6">
                            {plan.features.map((f, j) => (
                                <li key={j} className="flex items-center gap-2 text-sm text-text-secondary">
                                    <Check className="w-4 h-4 text-emerald-400" />
                                    <span>{f}</span>
                                </li>
                            ))}
                        </ul>
                        <button className={`w-full py-3 rounded-xl font-black transition-all ${plan.popular ? 'bg-electric-blue text-charcoal' : 'bg-white/5 border border-white/10 text-white'}`}>
                            {plan.active ? 'המסלול הנוכחי' : 'הצטרף עכשיו'}
                        </button>
                    </GlassCard>
                ))}
            </div>
        </motion.div>
    );
};

const ProfileScreen = ({ userStats, userProfile, setActiveTab, onEditProfile, onLogout }: any) => {
    const [toast, setToast] = useState<string | null>(null);

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    const settings = [
        { icon: User, label: 'עריכת פרופיל', color: 'text-electric-blue', action: () => onEditProfile() },
        { icon: Zap, label: 'הגדרות AI אישיות', color: 'text-cyber-yellow', action: () => setActiveTab('ai-settings') },
        { icon: Calendar, label: 'תוכנית לימודים', color: 'text-neon-purple', action: () => setActiveTab('study-plan') },
        { icon: BookOpen, label: 'הישגים', color: 'text-emerald-400', action: () => setActiveTab('achievements') },
        { icon: X, label: 'התנתקות', color: 'text-neon-pink', action: () => onLogout() }
    ];

    const examDateStr = userProfile?.examDate ? new Date(userProfile.examDate).toLocaleDateString('he-IL', { month: 'long', year: 'numeric' }) : 'מועד לא מוגדר';
    const dailyMinutesMax = userProfile?.dailyMinutes || 60;
    const dailyQuestionsProgress = Math.min(100, (userStats.dailyQuestions / 50) * 100);
    const dailyTimeProgress = Math.min(100, ((userStats.activityHistory?.find((h: any) => h.day === ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'][new Date().getDay()])?.value || 0) / dailyMinutesMax) * 100);

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
                <h2 className="text-2xl font-black">{userProfile?.name || 'משתמש Bina'}</h2>
                <p className="text-text-secondary">נבחן במועד {examDateStr}</p>
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
                        <span className="text-electric-blue font-black">{userStats.dailyQuestions || 0}/50</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${dailyQuestionsProgress}%` }}
                            className="h-full bg-electric-blue shadow-glow-blue"
                        />
                    </div>

                    <div className="pt-2 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Zap className="w-5 h-5 text-cyber-yellow" />
                            <span className="font-bold text-sm">זמן למידה</span>
                        </div>
                        <span className="text-cyber-yellow font-black">{userStats.activityHistory?.find((h: any) => h.day === ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'][new Date().getDay()])?.value || 0}/{dailyMinutesMax} דק'</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${dailyTimeProgress}%` }}
                            className="h-full bg-cyber-yellow shadow-glow-yellow"
                        />
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
                        <ChevronLeft className="w-5 h-5 text-text-muted group-hover:text-text-primary transition-colors" />
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

const AIExplanationModal = ({ item, onClose }: { item: any, onClose: () => void }) => {
    const text = item.explanation || `כרגע אין הסבר מפורט ל"${item.word || item.id}", אבל ה-Bina ממליצה לחזור על הנושא ${item.category}.`;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-charcoal/80 backdrop-blur-xl"
        >
            <GlassCard className="max-w-md w-full p-8 border-electric-blue/50 shadow-glow-blue overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4">
                    <button onClick={onClose} className="text-text-muted hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-electric-blue/20 flex items-center justify-center text-electric-blue">
                        <Zap className="w-7 h-7" />
                    </div>
                    <div>
                        <div className="text-[10px] font-black tracking-widest text-electric-blue uppercase">Bina AI Explainer</div>
                        <h3 className="text-xl font-black text-white">{item.word || "הסבר לוגי"}</h3>
                    </div>
                </div>

                <div className="text-lg text-text-secondary leading-relaxed mb-8 pr-1 min-h-[100px]">
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        {text}
                    </motion.p>
                </div>

                <button
                    onClick={onClose}
                    className="w-full py-4 bg-electric-blue text-charcoal font-black rounded-xl hover:scale-[1.02] transition-all shadow-glow-blue"
                >
                    הבנתי, תודה!
                </button>
            </GlassCard>
        </motion.div>
    );
};

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
    const [achievementToast, setAchievementToast] = useState<string | null>(null);

    const showAchievementToast = (msg: string) => {
        setAchievementToast(msg);
        setTimeout(() => setAchievementToast(null), 4000);
    };
    const [userStats, setUserStats] = useState(() => {
        const saved = localStorage.getItem('bina_user_stats');
        if (saved) return JSON.parse(saved);
        return {
            xp: 0,
            level: 1,
            streak: { count: 1, lastDate: new Date().toISOString().split('T')[0] },
            achievements: [] as string[],
            categoryErrors: {} as Record<string, number>,
            categoryTotal: {} as Record<string, number>,
            dailyQuestions: 0,
            activityHistory: [
                { day: 'א', value: 0 },
                { day: 'ב', value: 0 },
                { day: 'ג', value: 0 },
                { day: 'ד', value: 0 },
                { day: 'ו', value: 0 },
                { day: 'ש', value: 0 },
            ],
            favorites: [] as string[],
            teacherMode: false
        };
    });
    const [showExplanation, setShowExplanation] = useState<any>(null);
    const [hasOnboarded, setHasOnboarded] = useState<boolean>(() => {
        return !!localStorage.getItem('bina_onboarding');
    });
    const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
        const saved = localStorage.getItem('bina_onboarding');
        return saved ? JSON.parse(saved) : null;
    });

    const handleOnboardingComplete = (profile: UserProfile) => {
        const isFirstTime = !localStorage.getItem('bina_onboarding');
        localStorage.setItem('bina_onboarding', JSON.stringify(profile));
        setUserProfile(profile);
        setHasOnboarded(true);

        if (isFirstTime) {
            // Ensure stats are clean for new users
            const cleanStats = {
                xp: 0,
                level: 1,
                streak: { count: 1, lastDate: new Date().toISOString().split('T')[0] },
                achievements: [],
                categoryErrors: {},
                categoryTotal: {},
                dailyQuestions: 0,
                activityHistory: [
                    { day: 'א', value: 0 }, { day: 'ב', value: 0 }, { day: 'ג', value: 0 },
                    { day: 'ד', value: 0 }, { day: 'ה', value: 0 }, { day: 'ו', value: 0 }, { day: 'ש', value: 0 },
                ],
                favorites: [],
                teacherMode: false
            };
            setUserStats(cleanStats);
            localStorage.setItem('bina_user_stats', JSON.stringify(cleanStats));
        }
    };

    useEffect(() => {
        localStorage.setItem('bina_custom_lists', JSON.stringify(customLists));
    }, [customLists]);

    useEffect(() => {
        localStorage.setItem('bina_weak_points', JSON.stringify(weakPoints));
    }, [weakPoints]);

    useEffect(() => {
        localStorage.setItem('bina_user_stats', JSON.stringify(userStats));
    }, [userStats]);

    // Streak Maintenance Logic
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        const lastDate = userStats.streak.lastDate;

        if (lastDate !== today) {
            const last = new Date(lastDate);
            const now = new Date(today);
            const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 3600 * 24));

            if (diffDays === 1) {
                // Consecutive day
                setUserStats((prev: any) => ({
                    ...prev,
                    streak: { count: prev.streak.count + 1, lastDate: today }
                }));
            } else if (diffDays > 1) {
                // Streak broken
                setUserStats((prev: any) => ({
                    ...prev,
                    streak: { count: 1, lastDate: today }
                }));
            }
        }
    }, []);

    const recordActivity = (amount: number, category?: string, isCorrect?: boolean) => {
        setUserStats((prev: any) => {
            const newXP = prev.xp + amount;
            const newLevel = Math.floor(newXP / 500) + 1;
            const today = new Date().toISOString().split('T')[0];
            const isNewDay = prev.streak.lastDate !== today;

            // Check for achievements
            let newAchievements = [...prev.achievements];
            if (newXP >= 100 && !newAchievements.includes('centurion')) {
                newAchievements.push('centurion');
                setTimeout(() => showAchievementToast('🌟 הצעד הראשון: הגעת ל-100 XP!'), 500);
            }

            let newCategoryErrors = { ...prev.categoryErrors };
            let newCategoryTotal = { ...prev.categoryTotal };
            let newDailyQuestions = isNewDay ? (category ? 1 : 0) : (prev.dailyQuestions || 0) + (category ? 1 : 0);

            if (category) {
                newCategoryTotal[category] = (newCategoryTotal[category] || 0) + 1;
                if (isCorrect === false) {
                    newCategoryErrors[category] = (newCategoryErrors[category] || 0) + 1;
                }
            }

            // Update activity history (simulated minutes based on work)
            let newActivityHistory = [...(prev.activityHistory || [])];
            if (newActivityHistory.length > 0) {
                const dayNames = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];
                const dayIndex = new Date().getDay();
                const dayName = dayNames[dayIndex];
                const histIndex = newActivityHistory.findIndex(h => h.day === dayName);
                if (histIndex !== -1) {
                    newActivityHistory[histIndex].value += category ? 1 : 0; // 1 minute per question for demo
                }
            }

            return {
                ...prev,
                xp: newXP,
                level: newLevel,
                achievements: newAchievements,
                categoryErrors: newCategoryErrors,
                categoryTotal: newCategoryTotal,
                dailyQuestions: newDailyQuestions,
                activityHistory: newActivityHistory,
                streak: { ...prev.streak, lastDate: today }
            };
        });
    };

    const handleOnboardingCancel = () => {
        setHasOnboarded(true);
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.reload();
    };

    const awardXP = (amount: number) => recordActivity(amount);

    const toggleFavorite = (id: string) => {
        setUserStats((prev: any) => {
            const currentFavs = prev.favorites || [];
            const isFav = currentFavs.includes(id);
            const newFavs = isFav
                ? currentFavs.filter((fid: string) => fid !== id)
                : [...currentFavs, id];
            return { ...prev, favorites: newFavs };
        });
    };

    const recordError = (category: string) => recordActivity(0, category, false);

    const getLevelName = (level: number) => {
        const names = ["מתחיל", "לומד", "מתקדם", "מומחה", "אלוף"];
        return names[Math.min(level - 1, names.length - 1)];
    };

    const startLearning = (topic = 'vocabulary') => {
        let finalTopic = topic;

        if (topic === 'smart') {
            const topics = ['vocabulary', 'analogies', 'quantitative', 'english'];

            // Smarter AI: Look for category with most errors
            const errors = userStats.categoryErrors;
            const categoriesWithErrors = Object.keys(errors).filter(cat => errors[cat] > 0);

            if (categoriesWithErrors.length > 0) {
                // Find category with max errors
                const weakestCategory = categoriesWithErrors.reduce((a, b) => errors[a] > errors[b] ? a : b);

                // Map the sub-category back to the main topic
                if (vocabData.some(c => c.category === weakestCategory)) finalTopic = 'vocabulary';
                else if (analogiesData.some(c => c.category === weakestCategory)) finalTopic = 'analogies';
                else if (quantitativeData.some(c => c.category === weakestCategory)) finalTopic = 'quantitative';
                else if (englishData.some(c => c.category === weakestCategory)) finalTopic = 'english';
                else finalTopic = topics[Math.floor(Math.random() * topics.length)];
            } else if (weakPoints.length > 0 && Math.random() > 0.6) {
                finalTopic = 'weakPoints';
            } else {
                finalTopic = topics[Math.floor(Math.random() * topics.length)];
            }
        }

        if (topic === 'favorites') finalTopic = 'favorites';

        if (topic === 'marathon') {
            setLearningTopic('marathon');
            setIsLearning(true);
            return;
        }

        setLearningTopic(finalTopic);
        setIsLearning(true);
    };

    const addToWeakPoints = (card: WordCard) => {
        setWeakPoints(prev => {
            if (prev.find(p => p.id === card.id)) return prev;
            return [...prev, card].slice(-20); // Keep last 20 weak points
        });

        // Smart AI: Record error for this sub-category
        recordError(card.category);
        awardXP(5); // Small XP for practicing difficult items

        // Randomly trigger surprise after swiping unknown (higher chance for demo)
        if (Math.random() > 0.4) {
            setTimeout(() => setShowSurprise(card), 1500);
        }
    };

    if (!hasOnboarded) {
        return (
            <OnboardingScreen
                onComplete={handleOnboardingComplete}
                onCancel={handleOnboardingCancel}
                initialProfile={userProfile}
            />
        );
    }

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

                <AnimatePresence>
                    {achievementToast && (
                        <motion.div
                            initial={{ opacity: 0, y: -50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -50 }}
                            className="fixed top-20 left-4 right-4 z-[110] pointer-events-none"
                        >
                            <div className="bg-gradient-to-r from-cyber-yellow to-neon-pink p-px rounded-xl shadow-glow-purple">
                                <div className="bg-charcoal p-4 rounded-xl flex items-center gap-4">
                                    <div className="text-2xl">🏆</div>
                                    <div className="font-black text-white">{achievementToast}</div>
                                </div>
                            </div>
                        </motion.div>
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
                            onMiss={(card: WordCard) => {
                                addToWeakPoints(card);
                                if (userStats.teacherMode) {
                                    setShowExplanation(card);
                                }
                            }}
                            awardXP={awardXP}
                            recordActivity={recordActivity}
                            favorites={userStats.favorites}
                            onToggleFavorite={toggleFavorite}
                            onShowExplanation={setShowExplanation}
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
                                        else if (topic === 'pricing') setActiveTab('pricing');
                                        else startLearning(topic);
                                    }}
                                    userProfile={userProfile}
                                    userStats={userStats}
                                    getLevelName={getLevelName}
                                />
                            )}
                            {activeTab === 'custom-edit' && (
                                <CustomListScreen
                                    onSave={(list: WordCard[]) => setCustomLists(list)}
                                    onBack={() => setActiveTab('home')}
                                />
                            )}
                            {activeTab === 'learning' && (
                                <LearningScreen
                                    topic="vocabulary"
                                    onBack={() => setActiveTab('home')}
                                    awardXP={awardXP}
                                    recordActivity={recordActivity}
                                    onMiss={addToWeakPoints}
                                />
                            )}
                            {activeTab === 'stats' && <StatsScreen userStats={userStats} userProfile={userProfile} />}
                            {activeTab === 'profile' && (
                                <ProfileScreen
                                    userStats={userStats}
                                    userProfile={userProfile}
                                    setActiveTab={setActiveTab}
                                    onEditProfile={() => setHasOnboarded(false)}
                                    onLogout={handleLogout}
                                />
                            )}
                            {activeTab === 'achievements' && <AchievementsScreen achievements={userStats.achievements} onBack={() => setActiveTab('profile')} />}
                            {activeTab === 'study-plan' && <StudyPlanScreen userProfile={userProfile} onBack={() => setActiveTab('profile')} />}
                            {activeTab === 'ai-settings' && <AISettingsScreen userStats={userStats} onBack={() => setActiveTab('profile')} onUpdateStats={(newStats: any) => { setUserStats(newStats); localStorage.setItem('bina_user_stats', JSON.stringify(newStats)); }} />}
                            {activeTab === 'pricing' && <PricingScreen onBack={() => setActiveTab('home')} />}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* AI Explanation Modal */}
            <AnimatePresence>
                {showExplanation && (
                    <AIExplanationModal
                        item={showExplanation}
                        onClose={() => setShowExplanation(null)}
                    />
                )}
            </AnimatePresence>

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



