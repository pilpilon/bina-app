import React, { useState, useMemo } from 'react';
// Triggering production deployment with latest infrastructure - Commit 96f2188++
import { Routes, Route, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Target, BookOpen, BarChart3, User, Home, Flame, ChevronRight, ChevronLeft, X, Check, TrendingUp, Calendar, Zap, Timer, Heart, Bell, BellOff, Loader } from 'lucide-react';
import SwipeCard from './components/SwipeCard';
import PerformanceChart from './components/PerformanceChart';
import vocabData from './data/vocabulary.json';
import analogiesData from './data/analogies.json';
import quantitativeData from './data/quantitative.json';
import englishData from './data/english.json';
import { useEffect } from 'react';
import { TermsOfService, PrivacyPolicy } from './components/LegalPages';
import ExamScreen from './components/ExamScreen';
import HistoryScreen from './components/HistoryScreen';
import { SimulationScreen } from './components/SimulationScreen';
import { PaywallOverlay } from './components/PaywallOverlay';
import { explainQuestion, explainTerm } from './services/aiScoring';
import OnboardingScreen, { UserProfile } from './components/OnboardingScreen';
import {
    loadNotificationSettings,
    saveNotificationSettings,
    registerServiceWorker,
    requestNotificationPermission,
    getPermissionStatus,
    showTestNotification,
    scheduleSmartNotifications,
    type NotificationSettings,
    defaultNotificationSettings,
} from './utils/notifications';
import { auth, signInWithGoogle, logout as firebaseLogout, db, doc, setDoc, getDoc, onSnapshot } from './utils/firebase';
import { openPaddleCheckout, initializePaddle } from './utils/paddle';

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

// PaywallOverlay is now imported


// --- Smart Upsell Banner ---

const SmartUpsellBanner = ({ userStats, onUpgrade }: { userStats: any; onUpgrade: () => void }) => {
    const [dismissed, setDismissed] = React.useState(false);
    const swipeLimit = 10;
    const swipesUsed = userStats.dailySwipes || 0;
    const swipePercent = swipesUsed / swipeLimit;

    // Only show if user has done at least 3 swipes (they've engaged) or is near the limit
    const shouldShow = swipesUsed >= 3 || swipePercent >= 0.5;

    if (!shouldShow || dismissed) return null;

    const isNearLimit = swipePercent >= 0.7;

    const message = isNearLimit
        ? { tag: '⚠️ כמעט הגעת לגבול', title: `נשארו לך ${swipeLimit - swipesUsed} תרגולים היום`, sub: 'שדרג ל-Plus לתרגול ללא הגבלה', color: 'from-cyber-yellow/20 to-neon-pink/20', border: 'border-cyber-yellow/30', tagColor: 'text-cyber-yellow' }
        : { tag: '✨ מומלץ עבורך', title: 'גישה לכל הסברי ה-AI', sub: 'הבן כל שאלה לעומק עם Bina Plus', color: 'from-neon-purple/15 to-electric-blue/15', border: 'border-neon-purple/20', tagColor: 'text-neon-purple' };

    return (
        <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`mb-6 rounded-2xl p-4 bg-gradient-to-r ${message.color} border ${message.border} relative overflow-hidden`}
        >
            <button
                onClick={() => setDismissed(true)}
                className="absolute top-2 left-3 text-text-muted hover:text-white text-lg leading-none"
                aria-label="סגור"
            >×</button>
            <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${message.tagColor}`}>{message.tag}</div>
                    <div className="text-sm font-black text-white leading-tight">{message.title}</div>
                    <div className="text-[11px] text-text-secondary mt-0.5">{message.sub}</div>
                </div>
                <button
                    onClick={onUpgrade}
                    className="shrink-0 bg-gradient-to-r from-electric-blue to-neon-purple text-white px-3 py-2 rounded-xl font-black text-xs shadow-glow-blue hover:scale-105 active:scale-95 transition-all"
                >
                    שדרג
                </button>
            </div>
            {isNearLimit && (
                <div className="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${swipePercent * 100}%` }}
                        className="h-full bg-gradient-to-r from-cyber-yellow to-neon-pink rounded-full"
                    />
                </div>
            )}
        </motion.div>
    );
};

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

            {/* First Mission card — only for brand new users */}
            {userStats.xp === 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 rounded-2xl p-5 bg-gradient-to-r from-emerald-500/15 to-electric-blue/15 border border-emerald-400/25 cursor-pointer"
                    onClick={() => onStartLearning('vocabulary')}
                >
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-emerald-400/15 rounded-2xl flex items-center justify-center text-2xl shrink-0">🎯</div>
                        <div className="flex-1">
                            <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-0.5">משימה ראשונה</div>
                            <div className="font-black text-white text-sm">התחל את המסע שלך!</div>
                            <div className="text-xs text-text-secondary">10 כרטיסיות ראשונות • ~3 דקות</div>
                        </div>
                        <ChevronLeft className="w-5 h-5 text-emerald-400 shrink-0" />
                    </div>
                </motion.div>
            )}

            {/* Smart Upsell Banner — only for free users, context-aware */}
            {userStats.tier === 'free' && <SmartUpsellBanner userStats={userStats} onUpgrade={() => onStartLearning('pricing')} />}

            {/* Favorites Section & History */}
            <div className="mb-8 flex gap-3">
                <GlassCard
                    className="flex-1 p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white/5 transition-all group border-neon-pink/30 shadow-glow-pink/10"
                    onClick={() => onStartLearning('favorites')}
                >
                    <Heart className="w-8 h-8 text-neon-pink group-hover:scale-110 transition-transform" />
                    <div className="font-bold text-sm">מועדפים</div>
                </GlassCard>

                <GlassCard
                    className="flex-1 p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white/5 transition-all group border-electric-blue/30 shadow-glow-blue/10"
                    onClick={() => onStartLearning('history')}
                >
                    <History className="w-8 h-8 text-electric-blue group-hover:scale-110 transition-transform" />
                    <div className="font-bold text-sm">היסטוריה</div>
                </GlassCard>
            </div>

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
                    title="סימולציה מלאה"
                    sub="8 פרקים | זמן אמת"
                    color="text-emerald-400"
                    bg="bg-emerald-400/20"
                    onClick={() => onStartLearning('simulation')}
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

const LearningScreen = ({ onBack, topic = 'vocabulary', awardXP, recordActivity, favorites = [], onToggleFavorite, userStats, onUpgrade, onRefer, history = [], onFinish, ...props }: { onBack: () => void, topic?: string, awardXP: (n: number) => void, recordActivity: (xp: number, cat: string, correct: boolean) => void, favorites?: string[], onToggleFavorite?: (id: string) => void, userStats: any, onUpgrade: () => void, onRefer: () => void, history?: any[], onFinish?: (result: any) => void, [key: string]: any }) => {
    const [index, setIndex] = useState(0);
    const [knownCount, setKnownCount] = useState(0);
    const [exitX, setExitX] = useState(0);

    const isLimitHit = userStats.tier === 'free' && (userStats.dailySwipes || 0) >= 10;

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

    const currentDataSet = useMemo(() => {
        const data = getDataSet();
        // Shuffle the data to ensure randomness
        return [...data].sort(() => Math.random() - 0.5);
    }, [topic]);
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

    const marathonQuestions = useMemo(() => {
        if (topic !== 'marathon') return [];
        const allQuestions = [...vocabData, ...analogiesData, ...quantitativeData, ...englishData];

        // Group by category for smarter distractors
        const byCategory: Record<string, any[]> = {};
        allQuestions.forEach(q => {
            const cat = q.category || 'general';
            if (!byCategory[cat]) byCategory[cat] = [];
            byCategory[cat].push(q);
        });

        // Shuffle and pick 20 questions
        const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
        const selectedQuestions = shuffled.slice(0, 20);

        return selectedQuestions.map(q => {
            const correct = (q as any).definition || (q as any).answer || (q as any).word;
            const category = q.category || 'general';

            // Get distractors from SAME category ONLY
            // We do NOT fallback to general pool to avoid mixing English/Hebrew/Analogies
            const categoryPool = byCategory[category] || [];

            const potentialDistractors = categoryPool
                .map(i => (i as any).definition || (i as any).answer || (i as any).word)
                .filter(a => a && a !== correct);

            // Shuffle and pick 3
            // If we don't have enough distractors in the category (unlikely for proper data),
            // we will have fewer options rather than bad options.
            const distractors = potentialDistractors
                .sort(() => 0.5 - Math.random())
                .slice(0, 3);

            // Should always be 3, but if data is missing, we prioritize correctness of type over quantity

            const options = [correct, ...distractors].sort(() => 0.5 - Math.random());

            return {
                ...q,
                correctAnswer: correct,
                options
            };
        });
    }, [topic]);

    if (topic === 'marathon') {
        return (
            <ExamScreen
                questions={marathonQuestions}
                onClose={onBack}
                onShowExplanation={(item) => (props as any).onShowExplanation?.(item)}
                onFinish={onFinish || (() => { })}
            />
        );
    }

    if (topic === 'simulation') {
        const allQuestions = [...vocabData, ...analogiesData, ...quantitativeData, ...englishData];
        return (
            <SimulationScreen
                isPro={userStats.tier === 'pro' || userStats.tier === 'plus'}
                onBack={onBack}
                onFinish={onFinish || (() => { })}
                onUpgrade={onUpgrade}
                userStats={userStats}
                questionsPool={allQuestions}
            />
        );
    }

    if (topic === 'history') {
        return (
            <HistoryScreen
                history={history}
                isPro={userStats.tier === 'pro' || userStats.tier === 'plus'}
                onBack={onBack}
                onUpgrade={onUpgrade}
                onRefer={onRefer}
                teacherMode={userStats.teacherMode}
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
                {isLimitHit && (
                    <PaywallOverlay
                        title="הגעת למכסה היומית! 🎯"
                        sub="השלמת 10 כרטיסיות היום. שדרוג ל-Plus לתרגול ללא הגבלה בכל הקטגוריות."
                        onUpgrade={onUpgrade}
                        onRefer={onRefer}
                    />
                )}
                {isFinished ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-[360px] text-center"
                    >
                        {/* Trophy */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', delay: 0.1 }}
                            className="text-7xl mb-4"
                        >
                            {knownCount / currentDataSet.length >= 0.8 ? '🏆' : knownCount / currentDataSet.length >= 0.2 ? '🌟' : '💪'}
                        </motion.div>

                        <h2 className="text-2xl font-black text-white mb-1">
                            {knownCount / currentDataSet.length >= 0.8 ? 'מצוין!' : knownCount / currentDataSet.length >= 0.2 ? 'עבודה טובה!' : 'לא נורא!'}
                        </h2>
                        <p className="text-text-secondary text-sm mb-6">סיימת את הסט בהצלחה</p>

                        {/* Stats row */}
                        <div className="grid grid-cols-3 gap-3 mb-6">
                            <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                                <div className="text-2xl font-black text-electric-blue">+{knownCount * 10}</div>
                                <div className="text-[10px] text-text-muted uppercase tracking-wider mt-0.5">XP</div>
                            </div>
                            <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                                <div className="text-2xl font-black text-emerald-400">{Math.round((knownCount / currentDataSet.length) * 100)}%</div>
                                <div className="text-[10px] text-text-muted uppercase tracking-wider mt-0.5">דיוק</div>
                            </div>
                            <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                                <div className="text-2xl font-black text-neon-purple">{currentDataSet.length}</div>
                                <div className="text-[10px] text-text-muted uppercase tracking-wider mt-0.5">כרטיסיות</div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setIndex(0);
                                    setKnownCount(0);
                                    awardXP(20);
                                }}
                                className="flex-1 py-3 rounded-xl font-bold text-sm bg-white/5 border border-white/10 text-text-secondary hover:bg-white/10 transition-all"
                            >
                                שוב 🔄
                            </button>
                            <button
                                onClick={() => {
                                    awardXP(knownCount * 10);
                                    onBack();
                                }}
                                className="flex-1 py-3 rounded-xl font-black text-sm bg-gradient-to-r from-electric-blue to-neon-purple text-white shadow-glow-blue hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                בית →
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <AnimatePresence mode="wait" custom={exitX}>
                        <motion.div
                            key={`${topic}-${index}`}
                            custom={exitX}
                            variants={{
                                initial: { opacity: 0, scale: 0.8, x: 0 },
                                animate: { opacity: 1, scale: 1, x: 0 },
                                exit: (x) => ({ x: x, opacity: 0, scale: 0.9, transition: { duration: 0.2 } })
                            }}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="absolute inset-0 flex items-center justify-center p-4"
                        >
                            <SwipeCard
                                {...currentWord}
                                isFavorite={favorites.includes(currentWord.id)}
                                onToggleFavorite={() => onToggleFavorite?.(currentWord.id)}
                                disabled={isLimitHit}
                                onSwipeLeft={() => {
                                    if (isLimitHit) return;
                                    setExitX(-300); // Fly left
                                    setKnownCount(prev => prev + 1);
                                    setIndex(prev => prev + 1);
                                    recordActivity(10, currentTopicInfo.category, true);
                                }}
                                onSwipeRight={() => {
                                    if (isLimitHit) return;
                                    setExitX(300); // Fly right
                                    if ((props as any).onMiss) (props as any).onMiss(currentWord);
                                    setIndex(prev => prev + 1);
                                    recordActivity(5, currentTopicInfo.category, false);
                                }}
                            />
                        </motion.div>
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

const StatsScreen = ({ userStats, userProfile, setActiveTab }: any) => {
    const accuracyData = [
        {
            label: 'כמותי',
            value: userStats.categoryTotal?.['כמותי']
                ? Math.round(((userStats.categoryTotal['כמותי'] - (userStats.categoryErrors['כמותי'] || 0)) / userStats.categoryTotal['כמותי']) * 100)
                : 0,
            color: '#00D9FF'
        },
        {
            label: 'מילולי',
            value: userStats.categoryTotal?.['מילולי']
                ? Math.round(((userStats.categoryTotal['מילולי'] - (userStats.categoryErrors['מילולי'] || 0)) / userStats.categoryTotal['מילולי']) * 100)
                : 0,
            color: '#B026FF'
        },
        {
            label: 'אנגלית',
            value: userStats.categoryTotal?.['אנגלית']
                ? Math.round(((userStats.categoryTotal['אנגלית'] - (userStats.categoryErrors['אנגלית'] || 0)) / userStats.categoryTotal['אנגלית']) * 100)
                : 0,
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
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('history')}
                        className="w-12 h-12 glass-card-dark flex items-center justify-center text-text-secondary hover:text-white border-white/10 hover:bg-white/5 transition-colors"
                    >
                        <History className="w-6 h-6" />
                    </button>
                    <div className="w-12 h-12 glass-card-dark flex items-center justify-center text-neon-purple border-neon-purple/30">
                        <BarChart3 className="w-6 h-6" />
                    </div>
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

            {/* Weakest Category Insight */}
            {(() => {
                const cats = [
                    { key: 'אוצר מילים', topic: 'vocabulary', icon: '📖' },
                    { key: 'מילולי', topic: 'analogies', icon: '🔗' },
                    { key: 'כמותי', topic: 'quantitative', icon: '📐' },
                    { key: 'אנגלית', topic: 'english', icon: '🇬🇧' },
                ];
                const withStats = cats
                    .map(c => {
                        const total = userStats.categoryTotal?.[c.key] || 0;
                        const errors = userStats.categoryErrors?.[c.key] || 0;
                        const acc = total > 0 ? Math.round(((total - errors) / total) * 100) : null;
                        return { ...c, total, errors, acc };
                    })
                    .filter(c => c.total > 0);

                if (withStats.length === 0) return null;
                const weakest = withStats.reduce((a, b) => (a.acc! < b.acc! ? a : b));

                return (
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-lg">⚠️</span>
                            <h3 className="text-xl font-bold">חולשה עיקרית</h3>
                        </div>
                        <GlassCard className="p-5 border-neon-pink/20 bg-neon-pink/5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">{weakest.icon}</span>
                                    <div>
                                        <div className="font-black text-white">{weakest.key}</div>
                                        <div className="text-xs text-neon-pink font-bold">{weakest.acc}% דיוק • {weakest.errors} שגיאות</div>
                                    </div>
                                </div>
                                {setActiveTab && (
                                    <button
                                        onClick={() => setActiveTab('home')}
                                        className="px-3 py-2 bg-neon-pink text-white font-black text-xs rounded-xl hover:scale-105 active:scale-95 transition-all"
                                    >
                                        תרגל עכשיו
                                    </button>
                                )}
                            </div>
                        </GlassCard>
                    </div>
                );
            })()}

            {/* AI Analysis CTA */}
            {setActiveTab && (
                <button
                    onClick={() => setActiveTab('ai-analysis')}
                    className="w-full mt-4 py-4 rounded-2xl bg-gradient-to-r from-electric-blue/10 to-neon-purple/10 border border-electric-blue/20 text-white font-black flex items-center justify-center gap-3 hover:from-electric-blue/20 hover:to-neon-purple/20 transition-all group"
                >
                    <Zap className="w-5 h-5 text-electric-blue group-hover:scale-110 transition-transform" />
                    ניתוח AI מלא של החולשות שלך
                    <ChevronLeft className="w-5 h-5 text-text-muted" />
                </button>
            )}
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
                {list.map((ach: any) => {
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
        </motion.div >
    );
};

const StudyPlanScreen = ({ userProfile, userStats, onBack }: any) => {
    const examDate = userProfile?.examDate ? new Date(userProfile.examDate) : new Date();
    const daysLeft = Math.max(0, Math.ceil((examDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
    const weeksLeft = Math.ceil(daysLeft / 7);
    const isFree = userStats?.tier === 'free';

    const todayFocus = [
        { day: 0, label: 'אוצר מילים', icon: '📖', sub: '10 מילים חדשות' },
        { day: 1, label: 'אנלוגיות', icon: '🔗', sub: 'חשיבה מילולית' },
        { day: 2, label: 'כמותי', icon: '📐', sub: 'אלגברה וגיאומטריה' },
        { day: 3, label: 'אנגלית', icon: '🇬🇧', sub: 'Sentence Completion' },
        { day: 4, label: 'חזרה כללית', icon: '🔄', sub: 'כל הנושאים' },
        { day: 5, label: 'מרתון', icon: '🏃', sub: 'סימולציה מלאה' },
        { day: 6, label: 'מנוחה', icon: '🙏', sub: 'יום מנוחה מומלץ' },
    ];
    const todayIdx = new Date().getDay();
    const today = todayFocus[todayIdx];

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
            <p className="text-text-secondary mb-6">נותרו {daysLeft} ימים (כא-{weeksLeft} שבועות) למבחן</p>

            {/* Today's Focus — always visible, even for free users */}
            <GlassCard className="p-5 mb-8 border-electric-blue/20 bg-electric-blue/5">
                <div className="text-[10px] font-black text-electric-blue uppercase tracking-widest mb-3">היום מתמקדים על</div>
                <div className="flex items-center gap-4">
                    <span className="text-4xl">{today.icon}</span>
                    <div>
                        <div className="font-black text-white text-lg">{today.label}</div>
                        <div className="text-xs text-text-secondary">{today.sub}</div>
                    </div>
                </div>
            </GlassCard>

            {/* Weekly roadmap — blurred for free users */}
            <div className="relative">
                <div className="space-y-6 relative">
                    <div className="absolute top-0 right-4 bottom-0 w-0.5 bg-white/5" />
                    {roadmap.map((item, idx) => (
                        <div key={idx} className={`relative pr-10 ${isFree && idx > 0 ? 'blur-sm pointer-events-none select-none' : ''}`}>
                            <div className={`absolute right-3 top-2 w-3 h-3 rounded-full border-2 ${item.status === 'completed' ? 'bg-emerald-400 border-emerald-400' : item.status === 'current' ? 'bg-neon-purple border-neon-purple shadow-glow-purple' : 'bg-charcoal border-white/20'}`} />
                            <GlassCard className={`p-4 ${item.status === 'upcoming' ? 'opacity-50' : ''}`}>
                                <h4 className="font-black text-lg">{item.title}</h4>
                                <p className="text-sm text-text-secondary">{item.desc}</p>
                            </GlassCard>
                        </div>
                    ))}
                </div>
                {isFree && (
                    <div className="absolute inset-0 flex items-center justify-center" style={{ top: '80px' }}>
                        <div className="bg-charcoal/80 backdrop-blur-sm rounded-2xl p-5 text-center border border-white/10 mx-4">
                            <div className="text-2xl mb-2">🔒</div>
                            <div className="font-black text-white mb-1">תוכנית AI מלאה</div>
                            <div className="text-xs text-text-secondary mb-3">שדרג ל-Plus לראות את כל השבועות</div>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

// ─── AI Weakness Analysis Screen ───────────────────────────────────────────

const AIAnalysisScreen = ({ userStats, weakPoints, onBack, onStartLearning }: any) => {
    const categoryErrors: Record<string, number> = userStats.categoryErrors || {};
    const categoryTotal: Record<string, number> = userStats.categoryTotal || {};

    // Build per-category stats
    const categories = [
        { key: 'אוצר מילים', label: 'אוצר מילים', icon: '📖', color: '#00D9FF', topic: 'vocabulary' },
        { key: 'אנלוגיות', label: 'אנלוגיות', icon: '🔗', color: '#B026FF', topic: 'analogies' },
        { key: 'כמותי', label: 'כמותי', icon: '📐', color: '#FFD700', topic: 'quantitative' },
        { key: 'אנגלית', label: 'אנגלית', icon: '🇬🇧', color: '#FF0077', topic: 'english' },
    ];

    const catStats = categories.map(cat => {
        // Sum all sub-categories that match this main category
        const total = Object.entries(categoryTotal)
            .filter(([k]) => k.toLowerCase().includes(cat.key.toLowerCase()) || cat.key.toLowerCase().includes(k.toLowerCase()))
            .reduce((s, [, v]) => s + (v as number), 0) || categoryTotal[cat.key] || 0;
        const errors = Object.entries(categoryErrors)
            .filter(([k]) => k.toLowerCase().includes(cat.key.toLowerCase()) || cat.key.toLowerCase().includes(k.toLowerCase()))
            .reduce((s, [, v]) => s + (v as number), 0) || categoryErrors[cat.key] || 0;
        const accuracy = total > 0 ? Math.round(((total - errors) / total) * 100) : null;
        return { ...cat, total, errors, accuracy };
    });

    // Sort by accuracy ascending (weakest first)
    const sorted = [...catStats].sort((a, b) => {
        if (a.accuracy === null && b.accuracy === null) return 0;
        if (a.accuracy === null) return 1;
        if (b.accuracy === null) return -1;
        return a.accuracy - b.accuracy;
    });

    const hasData = catStats.some(c => c.total > 0);

    // AI Insight generation
    const weakest = sorted.find(c => c.accuracy !== null);
    const strongest = [...sorted].reverse().find(c => c.accuracy !== null);

    const getInsightColor = (acc: number | null) => {
        if (acc === null) return 'text-text-muted';
        if (acc >= 85) return 'text-emerald-400';
        if (acc >= 65) return 'text-cyber-yellow';
        return 'text-neon-pink';
    };

    const getBarColor = (acc: number | null) => {
        if (acc === null) return 'bg-white/10';
        if (acc >= 85) return 'bg-emerald-400';
        if (acc >= 65) return 'bg-cyber-yellow';
        return 'bg-neon-pink';
    };

    const getGrade = (acc: number | null) => {
        if (acc === null) return '—';
        if (acc >= 90) return 'מצוין';
        if (acc >= 75) return 'טוב';
        if (acc >= 60) return 'בינוני';
        return 'חלש';
    };

    // Sub-category heatmap from weakPoints
    const subCatCounts: Record<string, number> = {};
    (weakPoints || []).forEach((card: any) => {
        const cat = card.category || 'אחר';
        subCatCounts[cat] = (subCatCounts[cat] || 0) + 1;
    });
    const topWeakSubs = Object.entries(subCatCounts)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 5);

    const isLocked = userStats.tier === 'free';

    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="px-5 pt-12 pb-32 space-y-6 relative overflow-hidden">
            {isLocked && (
                <div className="absolute inset-0 z-[40] flex flex-col items-center justify-center p-8 text-center bg-charcoal/40 backdrop-blur-md">
                    <div className="w-16 h-16 bg-neon-purple/20 rounded-2xl flex items-center justify-center mb-4 shadow-glow-purple">
                        <BarChart3 className="w-8 h-8 text-neon-purple" />
                    </div>
                    <h3 className="text-xl font-black mb-2 text-white italic">ניתוח חולשות AI 🔒</h3>
                    <p className="text-text-secondary text-sm mb-6 max-w-[220px]">
                        מגלים בדיוק איפה מאבדים נקודות וקבלת המלצות מותאמות אישית.
                    </p>
                    <button
                        onClick={() => onStartLearning?.('pricing')}
                        className="px-8 py-3 bg-neon-purple text-white font-black rounded-xl shadow-glow-purple hover:scale-105 transition-all"
                    >
                        עוברים ל-Plus
                    </button>
                </div>
            )}
            <button onClick={onBack} className="flex items-center gap-2 text-text-muted font-bold">
                <ChevronRight className="w-5 h-5" />
                <span>חזור</span>
            </button>

            <div>
                <h2 className="text-3xl font-black mb-1">ניתוח AI 🧠</h2>
                <p className="text-text-secondary text-sm">ניתוח מעמיק של החוזקות והחולשות שלך</p>
            </div>

            {/* AI Summary Card */}
            {hasData ? (
                <GlassCard className="p-5 border-electric-blue/30 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-electric-blue via-neon-purple to-neon-pink" />
                    <div className="flex items-start gap-3 mb-4">
                        <div className="w-10 h-10 bg-electric-blue/10 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Zap className="w-6 h-6 text-electric-blue" />
                        </div>
                        <div>
                            <div className="text-[10px] font-black tracking-widest text-electric-blue uppercase mb-1">Bina AI Insight</div>
                            <p className="text-sm text-text-secondary leading-relaxed">
                                {weakest && strongest && weakest.key !== strongest.key ? (
                                    <>
                                        <span className="text-white font-bold">{strongest.label}</span> היא החוזקה שלך ({strongest.accuracy}% דיוק).{' '}
                                        <span className="text-neon-pink font-bold">{weakest.label}</span> דורשת תשומת לב — {weakest.accuracy}% דיוק.{' '}
                                        מומלץ להתמקד בנושא זה בסשן הבא.
                                    </>
                                ) : weakest ? (
                                    <>
                                        ה-AI זיהה שהנושא הכי חלש שלך הוא <span className="text-neon-pink font-bold">{weakest.label}</span> עם {weakest.accuracy}% דיוק.
                                        מומלץ לתרגל אותו עכשיו!
                                    </>
                                ) : (
                                    'המשך ללמוד כדי שה-AI יוכל לנתח את הביצועים שלך.'
                                )}
                            </p>
                        </div>
                    </div>
                    {weakest && (
                        <button
                            onClick={() => onStartLearning?.(weakest.topic)}
                            className="w-full py-3 rounded-xl bg-electric-blue/10 border border-electric-blue/30 text-electric-blue font-black text-sm hover:bg-electric-blue/20 transition-colors"
                        >
                            🎯 תרגל {weakest.label} עכשיו
                        </button>
                    )}
                </GlassCard>
            ) : (
                <GlassCard className="p-6 text-center border-white/5">
                    <div className="text-4xl mb-3">🤖</div>
                    <div className="font-black text-lg mb-2">ה-AI עדיין לומד אותך</div>
                    <p className="text-text-secondary text-sm">תרגל כמה סטים כדי שנוכל לנתח את הביצועים שלך</p>
                </GlassCard>
            )}

            {/* Category Accuracy Bars */}
            <div>
                <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-neon-purple" />
                    דיוק לפי קטגוריה
                </h3>
                <div className="space-y-4">
                    {sorted.map((cat) => (
                        <GlassCard key={cat.key} className="p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">{cat.icon}</span>
                                    <div>
                                        <div className="font-black">{cat.label}</div>
                                        <div className="text-xs text-text-muted">{cat.total} שאלות | {cat.errors} טעויות</div>
                                    </div>
                                </div>
                                <div className="text-left">
                                    <div className={`text-2xl font-black ${getInsightColor(cat.accuracy)}`}>
                                        {cat.accuracy !== null ? `${cat.accuracy}%` : '—'}
                                    </div>
                                    <div className="text-xs text-text-muted text-left">{getGrade(cat.accuracy)}</div>
                                </div>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: cat.accuracy !== null ? `${cat.accuracy}%` : '0%' }}
                                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                                    className={`h-full rounded-full ${getBarColor(cat.accuracy)}`}
                                    style={{ boxShadow: cat.accuracy !== null && cat.accuracy >= 85 ? '0 0 8px rgba(52,211,153,0.5)' : undefined }}
                                />
                            </div>
                        </GlassCard>
                    ))}
                </div>
            </div>

            {/* Sub-category Heatmap */}
            {topWeakSubs.length > 0 && (
                <div>
                    <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-neon-pink" />
                        נושאים לחיזוק (מהרשימה האדומה)
                    </h3>
                    <div className="space-y-2">
                        {topWeakSubs.map(([sub, count], idx) => {
                            const maxCount = topWeakSubs[0][1] as number;
                            const pct = Math.round(((count as number) / maxCount) * 100);
                            return (
                                <div key={sub} className="flex items-center gap-3">
                                    <div className="w-6 text-xs font-black text-text-muted text-center">#{idx + 1}</div>
                                    <div className="flex-1">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-bold">{sub}</span>
                                            <span className="text-neon-pink font-black">{count as number} טעויות</span>
                                        </div>
                                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${pct}%` }}
                                                transition={{ duration: 0.6, delay: idx * 0.1 }}
                                                className="h-full bg-gradient-to-r from-neon-pink to-neon-purple rounded-full"
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Recommendations */}
            <div>
                <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-cyber-yellow" />
                    המלצות לסשן הבא
                </h3>
                <div className="space-y-3">
                    {weakest && weakest.accuracy !== null && weakest.accuracy < 75 && (
                        <GlassCard className="p-4 border-neon-pink/20 flex items-start gap-3">
                            <span className="text-2xl">🎯</span>
                            <div>
                                <div className="font-black text-sm">התמקד ב{weakest.label}</div>
                                <div className="text-xs text-text-secondary mt-1">דיוק של {weakest.accuracy}% — 15 דקות ביום יכולות לשפר ב-10%</div>
                            </div>
                        </GlassCard>
                    )}
                    {(weakPoints || []).length > 3 && (
                        <GlassCard className="p-4 border-cyber-yellow/20 flex items-start gap-3">
                            <span className="text-2xl">🔄</span>
                            <div>
                                <div className="font-black text-sm">חזור על {weakPoints.length} מילים שגויות</div>
                                <div className="text-xs text-text-secondary mt-1">הרשימה האדומה שלך מכילה פריטים שדורשים חזרה</div>
                            </div>
                        </GlassCard>
                    )}
                    {strongest && strongest.accuracy !== null && strongest.accuracy >= 85 && (
                        <GlassCard className="p-4 border-emerald-400/20 flex items-start gap-3">
                            <span className="text-2xl">⚡</span>
                            <div>
                                <div className="font-black text-sm">{strongest.label} — שמור על הרמה!</div>
                                <div className="text-xs text-text-secondary mt-1">דיוק של {strongest.accuracy}% — תרגול קצר פעמיים בשבוע מספיק</div>
                            </div>
                        </GlassCard>
                    )}
                    {!hasData && (
                        <GlassCard className="p-4 border-electric-blue/20 flex items-start gap-3">
                            <span className="text-2xl">🚀</span>
                            <div>
                                <div className="font-black text-sm">התחל לתרגל!</div>
                                <div className="text-xs text-text-secondary mt-1">לאחר 20 שאלות ה-AI יוכל לנתח את הביצועים שלך</div>
                            </div>
                        </GlassCard>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

const AISettingsScreen = ({ userStats, onBack, onUpdateStats, notifSettings, notifPermission, onUpdateNotif, onRequestPermission, onTestNotif, onUpgrade }: any) => {
    const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
        <button
            onClick={() => onChange(!value)}
            className={`w-14 h-7 rounded-full transition-all relative flex-shrink-0 ${value ? 'bg-electric-blue shadow-glow-blue' : 'bg-white/10'}`}
            style={{ direction: 'ltr' }}
        >
            <div
                className="absolute top-1.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200"
                style={{ left: value ? '28px' : '4px' }}
            />
        </button>
    );

    const permissionDenied = notifPermission === 'denied';
    const permissionGranted = notifPermission === 'granted';

    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="px-5 pt-12 pb-32 space-y-5">
            <button onClick={onBack} className="flex items-center gap-2 text-text-muted mb-2 font-bold">
                <ChevronRight className="w-5 h-5" />
                <span>חזור</span>
            </button>
            <div>
                <h2 className="text-3xl font-black mb-1 text-cyber-yellow">הגדרות AI</h2>
                <p className="text-text-secondary text-sm">התאם את Bina לסגנון הלמידה שלך</p>
            </div>

            {/* Stats summary */}
            <GlassCard className="p-5">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-text-muted text-xs uppercase font-bold mb-1">סטטוס</div>
                        <div className="text-3xl font-black">רמה {userStats.level}</div>
                        <div className="text-text-secondary text-xs mt-1">{userStats.xp} XP נצברו</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-center">
                        <div className="bg-emerald-400/10 rounded-xl p-3">
                            <div className="text-emerald-400 text-xs font-bold">חוזקה</div>
                            <div className="font-black text-sm">אנגלית</div>
                        </div>
                        <div className="bg-neon-pink/10 rounded-xl p-3">
                            <div className="text-neon-pink text-xs font-bold">לחיזוק</div>
                            <div className="font-black text-sm">אנלוגיות</div>
                        </div>
                    </div>
                </div>
            </GlassCard>

            {/* Teacher Mode */}
            <GlassCard className="p-5 border-electric-blue/20">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 bg-electric-blue/10 rounded-xl flex items-center justify-center">
                        <Zap className="w-5 h-5 text-electric-blue" />
                    </div>
                    <div>
                        <div className="font-black">AI Teacher Mode 🤖</div>
                        <div className="text-xs text-text-secondary">הסבר אוטומטי לכל טעות</div>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">הפעל הסברים אוטומטיים</span>
                    {userStats.tier !== 'pro' ? (
                        <button
                            onClick={() => onUpgrade?.()}
                            className="flex items-center gap-2 bg-neon-pink/10 border border-neon-pink/30 text-neon-pink px-3 py-1.5 rounded-xl text-xs font-black hover:bg-neon-pink/20 transition-colors"
                        >
                            🔒 PRO בלבד
                        </button>
                    ) : (
                        <Toggle
                            value={!!userStats.teacherMode}
                            onChange={(v) => onUpdateStats?.({ ...userStats, teacherMode: v })}
                        />
                    )}
                </div>
                <AnimatePresence>
                    {userStats.tier === 'pro' && userStats.teacherMode && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                            className="mt-3 text-xs text-electric-blue font-bold bg-electric-blue/10 rounded-lg p-3">
                            ✅ מצב מורה פעיל — Bina תסביר לך כל טעות!
                        </motion.div>
                    )}
                </AnimatePresence>
            </GlassCard>

            {/* Push Notifications */}
            <GlassCard className={`p-5 ${notifSettings?.enabled ? 'border-cyber-yellow/30' : ''}`}>
                <div className="flex items-center gap-3 mb-4">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${notifSettings?.enabled ? 'bg-cyber-yellow/10' : 'bg-white/5'}`}>
                        {notifSettings?.enabled ? <Bell className="w-5 h-5 text-cyber-yellow" /> : <BellOff className="w-5 h-5 text-text-muted" />}
                    </div>
                    <div>
                        <div className="font-black">התראות חכמות 🔔</div>
                        <div className="text-xs text-text-secondary">תזכורות מותאמות אישית</div>
                    </div>
                </div>

                {/* Permission status */}
                {permissionDenied && (
                    <div className="mb-4 p-3 bg-neon-pink/10 border border-neon-pink/20 rounded-xl text-xs text-neon-pink font-bold">
                        ⚠️ גישה להתראות נחסמה בדפדפן. אפשר אותה ידנית בהגדרות הדפדפן.
                    </div>
                )}

                {!permissionGranted && !permissionDenied && (
                    <button
                        onClick={onRequestPermission}
                        className="w-full mb-4 py-3 rounded-xl bg-cyber-yellow/10 border border-cyber-yellow/30 text-cyber-yellow font-bold text-sm hover:bg-cyber-yellow/20 transition-colors"
                    >
                        🔔 אפשר התראות
                    </button>
                )}

                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold">הפעל תזכורות יומיות</span>
                    <Toggle
                        value={!!notifSettings?.enabled}
                        onChange={(v: boolean) => {
                            if (v && !permissionGranted) { onRequestPermission(); return; }
                            onUpdateNotif?.({ ...notifSettings, enabled: v });
                        }}
                    />
                </div>

                <AnimatePresence>
                    {notifSettings?.enabled && permissionGranted && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4">
                            {/* Time picker */}
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-text-secondary">שעת תזכורת</span>
                                <input
                                    type="time"
                                    value={notifSettings.reminderTime}
                                    onChange={(e) => onUpdateNotif?.({ ...notifSettings, reminderTime: e.target.value })}
                                    className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-white font-mono text-sm focus:outline-none focus:border-electric-blue/50"
                                />
                            </div>

                            {/* Sub-toggles */}
                            <div className="space-y-3 pt-2 border-t border-white/5">
                                {[
                                    { key: 'streakReminder', label: '🔥 שמירת רצף יומי' },
                                    { key: 'examCountdown', label: '📅 ספירה לאחור לבחינה' },
                                    { key: 'weakPointsNudge', label: '🎯 חזרה על נקודות חלשות' },
                                ].map(({ key, label }) => (
                                    <div key={key} className="flex items-center justify-between">
                                        <span className="text-sm text-text-secondary">{label}</span>
                                        <Toggle
                                            value={!!notifSettings[key]}
                                            onChange={(v: boolean) => onUpdateNotif?.({ ...notifSettings, [key]: v })}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Test button */}
                            <button
                                onClick={onTestNotif}
                                className="w-full py-3 rounded-xl bg-electric-blue/10 border border-electric-blue/30 text-electric-blue font-bold text-sm hover:bg-electric-blue/20 transition-colors flex items-center justify-center gap-2 shadow-glow-blue"
                            >
                                <Bell className="w-4 h-4" />
                                שלח התראת בדיקה עכשיו
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </GlassCard>
        </motion.div>
    );
};

const PricingScreen = ({ onBack, currentTier = 'free', onSelectPlan, user, onLogin }: any) => {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'semester'>('semester'); // Default to semester as it's the "deal"
    const [promoCode, setPromoCode] = useState('');
    const [promoStatus, setPromoStatus] = useState<'none' | 'success' | 'info' | 'error'>('none');
    const [promoMessage, setPromoMessage] = useState('');

    const handleApplyPromo = () => {
        const code = promoCode.trim().toUpperCase();
        if (!code) return;

        // 1. Full Access Codes (Case Sensitive for added security, but here we use Upper for UX)
        if (code === 'BINA-PRO-2026' || code === 'BINA-GIFT-FREE') {
            onSelectPlan?.('pro');
            setPromoStatus('success');
            setPromoMessage('✨ קוד תקין! Bina Pro נפתח עבורך ללא הגבלה.');
            // Save to localStorage immediately via selecting plan
            return;
        }

        if (code === 'BINA-PLUS-2026') {
            onSelectPlan?.('plus');
            setPromoStatus('success');
            setPromoMessage('✨ קוד תקין! Bina Plus נפתח עבורך ללא הגבלה.');
            return;
        }

        // 2. Paddle Discount Codes (These are set up in Paddle Dashboard)
        if (code === 'OFF10' || code === 'STUDENT10' || code === 'EARLYBIRD') {
            setPromoStatus('info');
            setPromoMessage('🎫 קוד פעיל! הזינו את הקוד בשלב התשלום ב-Paddle לקבלת 10% הנחה.');
            return;
        }

        // 3. Invalid
        setPromoStatus('error');
        setPromoMessage('❌ קוד לא תקין. נסה שוב או פנה לתמיכה.');
    };

    const plans = [
        {
            id: 'free',
            name: 'חינם',
            price: '₪0',
            features: [
                '10 כרטיסיות ביום',
                'אוצר מילים ואנלוגיות',
                'סטטיסטיקה בסיסית',
                'תוכנית לימודים (חלקי)'
            ],
            cta: 'המסלול הנוכחי',
            tier: 'free'
        },
        {
            id: 'plus',
            name: 'Bina Plus',
            price: billingCycle === 'monthly' ? '₪19.90' : '₪89',
            originalPrice: billingCycle === 'monthly' ? '₪39' : '₪149',
            period: billingCycle === 'monthly' ? '/חודש' : '/6 חודשים',
            // Effective monthly price label
            save: billingCycle === 'monthly' ? 'מחיר השקה מיוחד 🔥' : 'שווה ל-14.8₪ לחודש (חסוך 25%)',
            features: [
                'תרגול ללא הגבלה',
                'כל הקטגוריות (כולל כמותי ואנגלית)',
                'ניתוח חולשות AI מלא',
                'ניטור ציון חזוי בזמן אמת',
                'מועדפים ורשימות אישיות'
            ],
            cta: 'שדרוג ל-Plus',
            popular: true,
            tier: 'plus',
            priceId: billingCycle === 'monthly' ? 'pri_01khs94ykm1pk6xv7nvsjzf3vg' : 'pri_01khsfvrx105rzeqrta7871xtt'
        },
        {
            id: 'pro',
            name: 'Bina Pro',
            price: billingCycle === 'monthly' ? '₪29.90' : '₪129',
            originalPrice: billingCycle === 'monthly' ? '₪59' : '₪199',
            period: billingCycle === 'monthly' ? '/חודש' : '/6 חודשים',
            save: billingCycle === 'monthly' ? 'מחיר השקה מיוחד 🔥' : 'שווה ל-21.5₪ לחודש (חסוך 28%)',
            features: [
                'כל מה שיש ב-Plus',
                'הסברי AI לכל טעות 🧠',
                'רשימות אישיות ללא הגבלה',
                'תמיכה בוואטסאפ תוך 24 שעות',
                'תג "ציון מובטח" בפרופיל'
            ],
            cta: 'עבור ל-Pro',
            tier: 'pro',
            priceId: billingCycle === 'monthly' ? 'pri_01khs97cjrpkr3qew3m6b6hdpw' : 'pri_01khsfya5xbqtvt3fkbj8pap0m'
        }
    ];

    return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="px-5 pt-12 pb-32 min-h-screen bg-charcoal">
            <button onClick={onBack} className="flex items-center gap-2 text-text-muted mb-6 font-bold hover:text-white transition-colors">
                <ChevronRight className="w-5 h-5" />
                <span>חזור</span>
            </button>
            <div className="text-center mb-8">
                <h2 className="text-4xl font-black mb-2 bg-gradient-to-r from-electric-blue via-neon-purple to-neon-pink bg-clip-text text-transparent italic">Bina Premium</h2>
                <p className="text-text-secondary text-sm mb-6">הדרך הכי קלה להגיע ל-800</p>

                {/* Guest Warning */}
                <AnimatePresence>
                    {!user && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                            className="max-w-[400px] mx-auto text-right"
                        >
                            <GlassCard className="p-4 border-cyber-yellow/40 bg-cyber-yellow/5 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-1.5 h-full bg-cyber-yellow" />
                                <div className="flex items-start gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 text-cyber-yellow mb-2">
                                            <Zap className="w-5 h-5" />
                                            <span className="font-black text-sm uppercase tracking-tighter">שים לב: אתה גולש כאורח</span>
                                        </div>
                                        <p className="text-xs text-text-secondary leading-relaxed mb-4">
                                            התקדמות ורכישות נשמרים כרגע <span className="text-white font-bold underline">רק על המכשיר הזה</span>.
                                            כדי להבטיח את המנוי שלך בכל מקום, מומלץ להתחבר לפני הרכישה.
                                        </p>
                                        <button
                                            onClick={onLogin}
                                            className="w-full py-2.5 bg-white text-charcoal rounded-lg font-black text-xs hover:bg-cyber-yellow transition-all flex items-center justify-center gap-2 shadow-glow-yellow"
                                        >
                                            <User className="w-4 h-4" />
                                            התחבר עם Google עכשיו
                                        </button>
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Billing Cycle Toggle */}
                <div className="grid grid-cols-2 bg-white/5 p-1 rounded-xl border border-white/10 relative w-full max-w-[340px] mx-auto">
                    <div
                        className="absolute top-1 bottom-1 rounded-lg bg-white/10 transition-all duration-300 w-[calc(50%-4px)]"
                        style={{
                            left: billingCycle === 'semester' ? '4px' : 'calc(50% + 4px)',
                        }}
                    />
                    <button
                        onClick={() => setBillingCycle('semester')}
                        className={`relative z-10 py-2 rounded-lg text-sm font-bold transition-colors w-full ${billingCycle === 'semester' ? 'text-white' : 'text-text-muted hover:text-white'}`}
                    >
                        חצי שנתי <span className="text-emerald-400 text-[10px] mr-1">-28%</span>
                    </button>
                    <button
                        onClick={() => setBillingCycle('monthly')}
                        className={`relative z-10 py-2 rounded-lg text-sm font-bold transition-colors w-full ${billingCycle === 'monthly' ? 'text-white' : 'text-text-muted hover:text-white'}`}
                    >
                        חודשי
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                {plans.map((plan: any) => {
                    const isCurrent = currentTier === plan.id;
                    return (
                        <GlassCard
                            key={plan.id}
                            className={`p-6 border-2 transition-all relative overflow-hidden ${plan.popular ? 'border-neon-purple/50 shadow-glow-purple' : isCurrent ? 'border-electric-blue/30' : 'border-white/5'}`}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 right-0 bg-neon-purple text-white px-4 py-1 rounded-bl-xl font-black text-[10px] tracking-widest uppercase">
                                    הכי פופולרי 🔥
                                </div>
                            )}
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="text-2xl font-black text-white">{plan.name}</h4>
                                    {plan.save && <div className="text-[10px] font-bold text-emerald-400 mt-1 uppercase tracking-wider">{plan.save}</div>}
                                </div>
                                <div className="text-right">
                                    {plan.originalPrice && (
                                        <div className="text-xs text-text-muted line-through mb-1">
                                            {plan.originalPrice}
                                        </div>
                                    )}
                                    <span className="text-3xl font-black text-white">{plan.price}</span>
                                    {plan.period && <span className="text-sm text-text-secondary">{plan.period}</span>}
                                </div>
                            </div>
                            <ul className="space-y-3 mb-8">
                                {plan.features.map((f: string, j: number) => (
                                    <li key={j} className="flex items-start gap-2 text-sm text-text-secondary">
                                        <div className="mt-1 flex-shrink-0">
                                            <Check className="w-4 h-4 text-emerald-400" />
                                        </div>
                                        <span>{f}</span>
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={() => {
                                    if (isCurrent) return;
                                    if (plan.id === 'free') {
                                        onSelectPlan?.(plan.tier);
                                    } else {
                                        // Trigger Paddle Checkout
                                        // @ts-ignore
                                        if (plan.priceId.includes('PLACEHOLDER')) {
                                            alert('מוצר זה עדיין לא קיים במערכת (ממתין ל-ID מ-Paddle)');
                                            return;
                                        }
                                        openPaddleCheckout(
                                            // @ts-ignore
                                            plan.priceId,
                                            user?.email
                                        );
                                    }
                                }}
                                className={`w-full py-4 rounded-xl font-black transition-all ${isCurrent ? 'bg-white/5 text-text-muted cursor-default' : plan.popular ? 'bg-neon-purple text-white shadow-glow-purple hover:scale-[1.02]' : 'bg-electric-blue text-charcoal hover:scale-[1.02]'}`}
                            >
                                {isCurrent ? plan.cta : plan.cta}
                            </button>
                        </GlassCard>
                    );
                })}
            </div>

            {/* Promo Code Section */}
            <div className="mt-12 max-w-[400px] mx-auto">
                <GlassCard className="p-5 border-white/5">
                    <div className="text-sm font-bold text-white mb-3">יש לך קוד קופון?</div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            placeholder="הכנס קוד כאן..."
                            className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-electric-blue/50"
                        />
                        <button
                            onClick={handleApplyPromo}
                            className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg text-xs font-black text-white hover:bg-white/10 transition-colors"
                        >
                            הפעל
                        </button>
                    </div>

                    <AnimatePresence>
                        {promoStatus !== 'none' && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className={`mt-3 p-3 rounded-lg text-[10px] font-bold ${promoStatus === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                    promoStatus === 'info' ? 'bg-electric-blue/10 text-electric-blue border border-electric-blue/20' :
                                        'bg-neon-pink/10 text-neon-pink border border-neon-pink/20'
                                    }`}
                            >
                                {promoMessage}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </GlassCard>
            </div>

            <p className="mt-8 text-center text-[10px] text-text-muted leading-relaxed px-8">
                ביטול בכל עת. המנוי מתחדש אוטומטית. <br />
                ההרשמה מהווה הסכמה ל
                <Link to="/terms" className="text-electric-blue hover:underline">תנאי השימוש</Link>
                ו
                <Link to="/privacy" className="text-electric-blue hover:underline">מדיניות הפרטיות</Link>.
            </p>
        </motion.div >
    );
};

const ProfileScreen = ({ userStats, userProfile, user, setActiveTab, onEditProfile, onLogout, onRedeem, onSimulateFriend, showToast, onGoogleLogin }: any) => {
    const settings = [
        { icon: User, label: 'עריכת פרופיל', color: 'text-electric-blue', action: () => onEditProfile() },
        { icon: Zap, label: 'הגדרות AI אישיות', color: 'text-cyber-yellow', action: () => setActiveTab('ai-settings') },
        { icon: Calendar, label: 'תוכנית לימודים', color: 'text-neon-purple', action: () => setActiveTab('study-plan') },
        { icon: BookOpen, label: 'הישגים', color: 'text-emerald-400', action: () => setActiveTab('achievements') },
        { icon: X, label: 'התנתקות', color: 'text-neon-pink', action: () => onLogout() }
    ];

    const examDate = userProfile?.examDate ? new Date(userProfile.examDate) : new Date();
    // Validate year to prevent "51225" bugs
    const isValidDate = !isNaN(examDate.getTime()) && examDate.getFullYear() < 2030 && examDate.getFullYear() > 2020;
    const safeExamDate = isValidDate ? examDate : new Date(new Date().setMonth(new Date().getMonth() + 3));

    const examDateStr = isValidDate ? safeExamDate.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' }) : 'תאריך לא תקין';
    const dailyMinutesMax = userProfile?.dailyMinutes || 60;
    const dailyQuestionsProgress = Math.min(100, (userStats.dailyQuestions / 50) * 100);
    const dailyTimeProgress = Math.min(100, ((userStats.activityHistory?.find((h: any) => h.day === ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'][new Date().getDay()])?.value || 0) / dailyMinutesMax) * 100);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-5 pt-12 pb-32 relative"
        >
            {/* User Header */}
            <div className="flex flex-col items-center mb-10">
                <div className="relative mb-4">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-electric-blue to-neon-purple p-1 shadow-glow-blue">
                        <div className="w-full h-full rounded-full bg-charcoal flex items-center justify-center overflow-hidden">
                            {user?.photoURL ? (
                                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-12 h-12 text-text-secondary" />
                            )}
                        </div>
                    </div>
                </div>
                <h2 className="text-2xl font-black">{user?.displayName || userProfile?.name || 'משתמש Bina'}</h2>
                <div className="flex items-center gap-2 mt-1">
                    <p className="text-text-secondary text-sm">מועד המבחן: {examDateStr}</p>
                    <span className="w-1 h-1 bg-text-muted rounded-full" />
                    <div className="flex items-center gap-1 text-cyber-yellow text-xs font-bold">
                        <Zap className="w-3 h-3 fill-cyber-yellow" />
                        <span>{userStats.credits || 0} Bina Credits</span>
                    </div>
                </div>
            </div>

            {(!user || user.isAnonymous) && (
                <GlassCard className="p-5 mb-6 mx-5 border-neon-purple/30 bg-gradient-to-r from-neon-purple/10 to-transparent">
                    <div className="flex items-center gap-4">
                        <div className="bg-white p-2 rounded-full">
                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-white">שמירת התקדמות בענן ☁️</h3>
                            <p className="text-xs text-text-secondary">התחבר כדי לגבות את הנתונים שלך</p>
                        </div>
                    </div>
                    <button
                        onClick={onGoogleLogin}
                        className="w-full mt-4 py-3 bg-white text-charcoal font-black rounded-xl hover:bg-gray-100 transition-colors shadow-glow-white"
                    >
                        התחברות עם Google
                    </button>
                </GlassCard>
            )}

            <div className="flex flex-col items-center justify-center mb-6">
                <div className="flex items-center gap-3 text-text-secondary text-sm bg-white/5 px-4 py-2 rounded-full border border-white/10">
                    <Calendar className="w-4 h-4" />
                    <span>מועד המבחן: {examDateStr}</span>
                </div>

                {/* Exam Countdown */}
                <div className="mt-6 w-full max-w-[280px]">
                    {(() => {
                        const exam = userProfile?.examDate ? new Date(userProfile.examDate) : new Date();
                        const now = new Date();
                        const safeExam = (!isNaN(exam.getTime()) && exam.getFullYear() < 2030) ? exam : new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

                        const diffTime = Math.max(0, safeExam.getTime() - now.getTime());
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        const totalDays = 90; // Assuming 3 month prep
                        const progress = Math.min(100, Math.max(0, ((totalDays - diffDays) / totalDays) * 100));

                        return (
                            <div className="relative pt-1">
                                <div className="flex mb-2 items-center justify-between">
                                    <div>
                                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-neon-purple bg-neon-purple/20">
                                            ספירה לאחור
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-semibold inline-block text-neon-purple">
                                            {diffDays} ימים
                                        </span>
                                    </div>
                                </div>
                                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-neon-purple/20">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-neon-purple shadow-glow-purple"
                                    />
                                </div>
                            </div>
                        );
                    })()}
                </div>
            </div>

            {/* Debug Crash Button (Dev only) */}
            {/* <button onClick={() => { throw new Error("Test Crash"); }} className="absolute top-4 left-4 text-[10px] text-red-500 opacity-20 hover:opacity-100">🚫</button> */}

            {/* Referral UI */}
            <div className="mb-6">
                <GlassCard className="p-5 bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 border-neon-purple/30">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-black text-white">הזמנת חברים - קבלת Plus 🎁</h3>
                        <div className="bg-neon-purple text-white px-2 py-0.5 rounded text-[10px] font-black italic">בונוס: 10 Points</div>
                    </div>
                    <p className="text-xs text-text-secondary mb-4 leading-relaxed">
                        שתף את Bina עם חברים. על כל הצטרפות תקבל 10 Bina Credits שיכולים להפתח לך ימי פרימיום!
                    </p>
                    <div className="flex gap-2 mb-4">
                        <div className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-[10px] font-mono text-text-muted flex items-center overflow-hidden">
                            bina.app/ref/{userStats.referralCode}
                        </div>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(`bina.app/ref/${userStats.referralCode}`);
                                showToast('קישור הועתק! 🚀');
                            }}
                            className="bg-neon-purple text-white px-4 py-2 rounded-lg font-black text-xs hover:scale-105 transition-all shadow-glow-purple"
                        >
                            העתק
                        </button>
                    </div>

                    <div className="space-y-2">
                        <button
                            onClick={() => onRedeem?.()}
                            disabled={userStats.credits < 10}
                            className={`w-full py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${userStats.credits >= 10 ? 'bg-cyber-yellow text-charcoal shadow-glow-yellow' : 'bg-white/5 text-text-muted opacity-50 cursor-not-allowed'}`}
                        >
                            {userStats.tier === 'plus' && userStats.tierExpiry ? (
                                <><span>Plus פעיל דרך קרדיטים</span> <div className="text-[10px] opacity-70">בקרוב יתחדש</div></>
                            ) : (
                                <>מימוש 10 קרדיטים ליום Plus ⚡️</>
                            )}
                        </button>
                    </div>
                </GlassCard>
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

const CustomListScreen = ({ initialData = [], onSave, onBack, onStartLearning }: any) => {
    const [text, setText] = useState(() => {
        if (!initialData || initialData.length === 0) return '';
        return initialData.map((item: any) => {
            if (item.example && item.example !== 'מהרשימה האישית שלך') {
                return `${item.word} : ${item.definition} : ${item.example}`;
            }
            return `${item.word} : ${item.definition}`;
        }).join('\n');
    });
    const [saved, setSaved] = useState(false);
    const [translating, setTranslating] = useState(false);
    const [preview, setPreview] = useState<{ word: string; definition: string; example?: string }[]>([]);

    // Detect if a string is Hebrew
    const isHebrew = (str: string) => /[\u05d0-\u05ea]/.test(str);

    // Translate a single word using MyMemory (free, no key needed)
    const translateWord = async (word: string): Promise<string> => {
        try {
            const isHeb = isHebrew(word);
            const langPair = isHeb ? 'he|en' : 'en|he';
            const res = await fetch(
                `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=${langPair}`
            );
            const data = await res.json();
            const translation = data?.responseData?.translatedText;
            if (translation && translation.toLowerCase() !== word.toLowerCase()) {
                return translation;
            }
        } catch {
            // Silently fail — use placeholder
        }
        return `(${word})`;
    };

    const handleImport = async () => {
        const lines = text.split('\n').map((l: string) => l.trim()).filter(Boolean);
        if (lines.length === 0) return;

        setTranslating(true);
        setPreview([]);

        const newList: WordCard[] = [];
        const previewItems: { word: string; definition: string; example?: string }[] = [];

        for (let idx = 0; idx < lines.length; idx++) {
            const line = lines[idx];
            let word = line;
            let definition = '';
            let example = '';

            // Handle multiple separators: colon (:) or dash ( - )
            const parts = line.split(/[:]| - /).map((p: string) => p.trim());
            word = parts[parts.length > 0 ? 0 : 0] || '';

            if (parts.length >= 3) {
                word = parts[0];
                definition = parts[1];
                example = parts[2];
            } else if (parts.length === 2) {
                word = parts[0];
                definition = parts[1];
            } else {
                word = parts[0];
            }

            // Auto-translate if no definition provided
            if (!definition && word) {
                definition = await translateWord(word);
            }

            const finalExample = example || `נסו להשתמש במילה "${word}" במשפט.`;

            previewItems.push({ word, definition, example: finalExample });
            setPreview([...previewItems]); // Live update

            newList.push({
                id: `custom-${Date.now()}-${idx}`,
                word,
                definition,
                example: finalExample,
                category: 'הרשימה שלי',
                difficulty: 'medium'
            });
        }

        setTranslating(false);
        if (newList.length > 0) {
            onSave(newList);
            setSaved(true);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-5 pt-8 pb-32 h-screen flex flex-col"
        >
            <div className="flex items-center justify-between mb-6">
                <button onClick={onBack} className="p-2 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                    <ChevronRight className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-black text-electric-blue">הרשימה האישית שלי</h2>
                <div className="w-10" />
            </div>

            <GlassCard className="p-5 flex-1 flex flex-col gap-4 overflow-hidden">
                <div className="text-sm text-text-secondary leading-relaxed">
                    <span className="font-bold text-white">הכנס מילים — כל מילה בשורה חדשה.</span>
                    <br />
                    <span className="text-text-muted text-xs">בעברית או באנגלית — Bina תתרגם אוטומטית! 🤖</span>
                    <br />
                    <span className="text-text-muted text-xs">אפשר גם להוסיף פירוש: <code className="text-neon-purple">Apple : תפוח</code></span>
                </div>

                {/* Input or Preview */}
                {saved ? (
                    <div className="flex-1 overflow-y-auto space-y-2">
                        {preview.map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.03 }}
                                className="flex items-center justify-between bg-black/30 rounded-xl px-4 py-3 border border-white/5"
                            >
                                <div className="flex-1">
                                    <div className="font-black text-white">{item.word}</div>
                                    {item.example && item.example !== `נסו להשתמש במילה "${item.word}" במשפט.` && (
                                        <div className="text-[10px] text-text-muted italic">"{item.example}"</div>
                                    )}
                                </div>
                                <span className="text-text-secondary text-sm">{item.definition}</span>
                            </motion.div>
                        ))}
                    </div>
                ) : translating ? (
                    <div className="flex-1 overflow-y-auto space-y-2">
                        <div className="text-center text-electric-blue font-bold text-sm mb-3 animate-pulse">
                            🤖 Bina מתרגמת את המילים שלך...
                        </div>
                        {preview.map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center justify-between bg-black/30 rounded-xl px-4 py-3 border border-white/5"
                            >
                                <div className="flex-1">
                                    <div className="font-black text-white">{item.word}</div>
                                    {item.example && item.example !== `נסו להשתמש במילה "${item.word}" במשפט.` && (
                                        <div className="text-[10px] text-text-muted italic">"{item.example}"</div>
                                    )}
                                </div>
                                <span className="text-text-secondary text-sm">{item.definition}</span>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <textarea
                        value={text}
                        onChange={(e) => { setText(e.target.value); setSaved(false); }}
                        placeholder={`Apple\nBanana\nUbiquitous\nאמפתיה\nאובייקטיבי`}
                        className="flex-1 bg-black/40 border border-white/10 rounded-xl p-4 text-text-primary font-mono text-sm focus:outline-none focus:border-electric-blue/50 transition-colors resize-none"
                        dir="auto"
                    />
                )}

                {/* Buttons */}
                {saved ? (
                    <div className="space-y-3 flex-shrink-0">
                        <div className="text-center text-emerald-400 font-bold text-sm py-1">
                            ✅ {preview.length} מילים נשמרו עם תרגום!
                        </div>
                        <button
                            onClick={onStartLearning}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-electric-blue to-neon-purple text-charcoal font-black text-lg shadow-glow-blue active:scale-95 transition-all"
                        >
                            התחל ללמוד 🚀
                        </button>
                        <button
                            onClick={() => { setSaved(false); setPreview([]); }}
                            className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-text-secondary font-bold text-sm"
                        >
                            ערוך רשימה
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={handleImport}
                        disabled={!text.trim() || translating}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-electric-blue to-neon-purple text-charcoal font-black text-lg shadow-glow-blue disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all flex-shrink-0 flex items-center justify-center gap-2"
                    >
                        {translating ? (
                            <>
                                <div className="w-5 h-5 border-2 border-charcoal/40 border-t-charcoal rounded-full animate-spin" />
                                מתרגם...
                            </>
                        ) : (
                            'שמור ותרגם ✨'
                        )}
                    </button>
                )}
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

const AIExplanationModal = ({ item, onClose, tier = 'free', onUpgrade }: { item: any, onClose: () => void, tier?: string, onUpgrade?: () => void }) => {
    const isLocked = tier !== 'pro'; // Only Pro users get AI explanations

    // Fallback to existing explanation if available (e.g. from static data)
    const [explanation, setExplanation] = useState<string | null>(item.explanation || null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // If locked or already has explanation, don't fetch
        if (isLocked || explanation) return;

        const fetchExplanation = async () => {
            setLoading(true);
            setError(null);
            try {
                let result;
                // Detect if it's a Question (has options) or a WordCard
                if (item.options) {
                    result = await explainQuestion(item, item.userAnswer || "");
                } else {
                    result = await explainTerm(item);
                }
                setExplanation(result);
            } catch (err) {
                console.error("AI Error:", err);
                setError("לא הצלחתי לייצר הסבר. נסה שוב.");
            } finally {
                setLoading(false);
            }
        };

        fetchExplanation();
    }, [item, isLocked]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-charcoal/80 backdrop-blur-xl"
            dir="rtl"
        >
            <GlassCard className="max-w-md w-full p-8 border-electric-blue/50 shadow-glow-blue overflow-hidden relative min-h-[400px] flex flex-col">
                <div className="absolute top-0 right-0 p-4 z-20">
                    <button onClick={onClose} className="text-text-muted hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-electric-blue/20 flex items-center justify-center text-electric-blue shrink-0">
                        <Zap className="w-7 h-7" />
                    </div>
                    <div>
                        <div className="text-[10px] font-black tracking-widest text-electric-blue uppercase">Bina AI Explainer</div>
                        <h3 className="text-xl font-black text-white truncate max-w-[220px]">{item.word || (item.question ? "תיקון טעות" : "הסבר מפורט")}</h3>
                    </div>
                </div>

                <div className={`flex-1 text-lg text-text-secondary leading-relaxed mb-8 pr-1 relative overflow-y-auto custom-scrollbar ${isLocked ? 'overflow-hidden' : ''}`}>
                    {isLocked ? (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center bg-charcoal/20 backdrop-blur-md rounded-xl p-4">
                            <div className="w-16 h-16 bg-neon-pink/20 rounded-full flex items-center justify-center mb-4">
                                <Zap className="w-8 h-8 text-neon-pink" />
                            </div>
                            <div className="text-lg font-black text-white mb-2 italic">הסברי Bina Pro 🔒</div>
                            <div className="text-sm text-text-secondary mb-6">השדרוג שיעזור לך להבין כל טעות לעומק</div>
                            <button
                                onClick={onUpgrade}
                                className="text-sm font-black bg-gradient-to-r from-neon-pink to-cyber-yellow text-white px-6 py-3 rounded-xl shadow-glow-pink hover:scale-105 transition-all"
                            >
                                שדרג ל-Pro
                            </button>
                        </div>
                    ) : (
                        <>
                            {loading ? (
                                <div className="flex flex-col items-center justify-center h-full opacity-70">
                                    <Loader className="w-10 h-10 text-electric-blue animate-spin mb-4" />
                                    <p className="text-sm animate-pulse">המורה בודק את התשובה...</p>
                                </div>
                            ) : error ? (
                                <div className="text-red-400 text-center py-10">
                                    <p className="font-bold mb-2">אופס!</p>
                                    <p className="text-sm">{error}</p>
                                </div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="whitespace-pre-wrap"
                                >
                                    {explanation}
                                </motion.div>
                            )}
                        </>
                    )}
                </div>

                <button
                    onClick={onClose}
                    className="w-full py-4 bg-white/5 border border-white/10 text-text-secondary font-black rounded-xl hover:bg-white/10 transition-all shrink-0"
                >
                    הבנתי, תודה
                </button>
            </GlassCard>
        </motion.div>
    );
};

// --- Main App ---

function App() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('home');
    const [globalToast, setGlobalToast] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const showGlobalToast = (msg: string) => {
        setGlobalToast(msg);
        setTimeout(() => setGlobalToast(null), 3000);
    };

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
            teacherMode: false,
            tier: 'free' as 'free' | 'plus' | 'pro',
            tierExpiry: null as string | null,
            dailySwipes: 0,
            lastSwipeDate: new Date().toISOString().split('T')[0],
            credits: 10, // Starting bonus
            referralCode: `BINA-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
        };
    });
    const [showExplanation, setShowExplanation] = useState<any>(null);
    const [notifSettings, setNotifSettings] = useState<NotificationSettings>(() => loadNotificationSettings());
    const [notifPermission, setNotifPermission] = useState<NotificationPermission>(() => getPermissionStatus());
    const [hasOnboarded, setHasOnboarded] = useState<boolean>(() => {
        return !!localStorage.getItem('bina_onboarding');
    });
    const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
        const saved = localStorage.getItem('bina_onboarding');
        return saved ? JSON.parse(saved) : null;
    });

    // History State
    const [history, setHistory] = useState<any[]>(() => {
        const saved = localStorage.getItem('examHistory');
        return saved ? JSON.parse(saved) : [];
    });

    const handleSaveExam = (result: any) => {
        const newEntry = {
            id: Date.now().toString(),
            date: Date.now(),
            score: result.score,
            total: result.total,
            details: 'מרתון כללי', // We can refine this later
            examData: result.examData // Save full data for review
        };
        const updatedHistory = [newEntry, ...history];
        setHistory(updatedHistory);
        localStorage.setItem('examHistory', JSON.stringify(updatedHistory));
        setLearningTopic('history');
        setIsLearning(true);
    };

    // Register service worker and schedule notifications on mount
    useEffect(() => {
        registerServiceWorker();
        initializePaddle();
        if (notifSettings.enabled && getPermissionStatus() === 'granted') {
            scheduleSmartNotifications(notifSettings, weakPoints.length, userProfile?.examDate);
        }

        // Firebase Auth Listener
        const unsubscribeAuth = auth.onAuthStateChanged(async (firebaseUser) => {
            setUser(firebaseUser);
            if (firebaseUser) {
                try {
                    // Fetch cloud data with a timeout to prevent hanging
                    const fetchUserData = async () => {
                        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                        if (userDoc.exists()) {
                            const cloudData = userDoc.data();
                            if (cloudData.stats) setUserStats(cloudData.stats);
                            if (cloudData.profile) {
                                setUserProfile(cloudData.profile);
                                setHasOnboarded(true);
                            }
                        } else {
                            console.log("New User or No Profile in Cloud");
                        }
                    };

                    // Race between fetch and 8s timeout
                    await Promise.race([
                        fetchUserData(),
                        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 8000))
                    ]);
                } catch (error) {
                    console.error("Error fetching user data (offline or timeout):", error);
                    // Fallback to local storage is already handled by initial state
                }
            }
            setLoading(false);
        });

        return () => unsubscribeAuth();
    }, []);

    // Sync to Firestore on change with debounce (30s)
    useEffect(() => {
        if (!user) return;

        const timer = setTimeout(() => {
            setDoc(doc(db, 'users', user.uid), {
                stats: userStats,
                profile: userProfile,
                lastUpdated: new Date().toISOString()
            }, { merge: true });
            console.log("Cloud Sync: Firestore updated (debounced)");
        }, 30000);

        return () => clearTimeout(timer);
    }, [userStats, userProfile, user]);

    // Re-schedule when settings change
    useEffect(() => {
        if (notifSettings.enabled && notifPermission === 'granted') {
            scheduleSmartNotifications(notifSettings, weakPoints.length, userProfile?.examDate);
        }
    }, [notifSettings, notifPermission]);

    const updateNotifSettings = (newSettings: NotificationSettings) => {
        setNotifSettings(newSettings);
        saveNotificationSettings(newSettings);
    };

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
                teacherMode: false,
                tier: 'free',
                tierExpiry: null,
                dailySwipes: 0,
                lastSwipeDate: new Date().toISOString().split('T')[0],
                credits: 10,
                referralCode: `BINA-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
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

    // Streak & Swipe Maintenance Logic
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        const lastDate = userStats.streak.lastDate;
        const lastSwipeDate = userStats.lastSwipeDate;
        const tierExpiry = userStats.tierExpiry;

        // Check for Tier Expiration
        if (tierExpiry && new Date() > new Date(tierExpiry)) {
            setUserStats((prev: any) => ({
                ...prev,
                tier: 'free',
                tierExpiry: null,
                teacherMode: false // Reset AI Teacher Mode on expiry
            }));
        }

        // Reset swipes if it's a new day
        if (lastSwipeDate !== today) {
            setUserStats((prev: any) => ({
                ...prev,
                dailySwipes: 0,
                lastSwipeDate: today
            }));
        }

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

            // Update activity history — deep copy each item to avoid mutation
            const dayNames = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];
            const dayIndex = new Date().getDay();
            const dayName = dayNames[dayIndex];
            const newActivityHistory = (prev.activityHistory || []).map((h: any) =>
                h.day === dayName && category
                    ? { ...h, value: (h.value || 0) + 1 } // 1 minute per question
                    : { ...h }
            );

            const updatedStats = {
                ...prev,
                xp: newXP,
                level: newLevel,
                achievements: newAchievements,
                categoryErrors: newCategoryErrors,
                categoryTotal: newCategoryTotal,
                dailyQuestions: newDailyQuestions,
                activityHistory: newActivityHistory,
                streak: { ...prev.streak, lastDate: today },
                // Only increment swipes if it was a learning activity (category present)
                dailySwipes: (category) ? (prev.dailySwipes || 0) + 1 : (prev.dailySwipes || 0),
                lastSwipeDate: today
            };

            // Persist to localStorage on every update
            localStorage.setItem('bina_user_stats', JSON.stringify(updatedStats));
            return updatedStats;
        });
    };

    const redeemCredits = () => {
        if (userStats.credits < 10) {
            showGlobalToast('חסרים לך קרדיטים! 😕');
            return;
        }

        const expiry = new Date();
        expiry.setHours(expiry.getHours() + 24);

        setUserStats((prev: any) => ({
            ...prev,
            tier: 'plus',
            tierExpiry: expiry.toISOString(),
            credits: prev.credits - 10
        }));

        showGlobalToast('מזל טוב! יש לך Plus ל-24 השעות הקרובות 🚀');
    };

    const simulateFriendSignup = () => {
        setUserStats((prev: any) => ({
            ...prev,
            credits: (prev.credits || 0) + 10
        }));
        showGlobalToast('חבר הצטרף! קיבלת 10 קרדיטים 🎁');
    };

    const handleOnboardingCancel = () => {
        setHasOnboarded(true);
    };

    const handleLogout = async () => {
        await firebaseLogout();
        localStorage.clear();
        window.location.reload();
    };

    const toggleFavorite = (id: string) => {
        setUserStats((prev: any) => {
            const favorites = prev.favorites || [];
            const newFavorites = favorites.includes(id)
                ? favorites.filter((f: string) => f !== id)
                : [...favorites, id];
            return { ...prev, favorites: newFavorites };
        });
    };

    const awardXP = (amount: number) => recordActivity(amount);


    const recordError = (category: string) => recordActivity(0, category, false);

    const getLevelName = (level: number) => {
        const names = ["מתחילים", "לומדים", "מתקדמים", "מומחים", "אלופים"];
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

        // --- Paywall Verification ---
        const isRestrictedTopic = topic === 'quantitative' || topic === 'english' || finalTopic === 'quantitative' || finalTopic === 'english';
        if (userStats.tier === 'free' && isRestrictedTopic) {
            setActiveTab('pricing');
            return;
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
            setTimeout(() => setShowSurprise(card), 15000);
        }
    };

    // Show loading screen while Firebase resolves auth state
    if (loading) {
        return (
            <div className="fixed inset-0 bg-charcoal flex items-center justify-center" dir="rtl">
                <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-electric-blue to-neon-purple flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <span className="text-3xl">🧠</span>
                    </div>
                    <p className="text-text-muted text-sm">טוען...</p>
                </div>
            </div>
        );
    }

    if (!hasOnboarded) {
        return (
            <OnboardingScreen
                onComplete={handleOnboardingComplete}
                onCancel={handleOnboardingCancel}
                onGoogleLogin={signInWithGoogle}
                initialProfile={userProfile}
                user={user}
            />
        );
    }

    return (
        <Routes>
            <Route path="/terms" element={<TermsOfService onBack={() => navigate('/')} />} />
            <Route path="/privacy" element={<PrivacyPolicy onBack={() => navigate('/')} />} />
            <Route path="*" element={
                <div className="min-h-screen bg-charcoal text-text-primary font-sans selection:bg-electric-blue/30 overflow-x-hidden scanline-overlay" dir="rtl">
                    {/* Background Particles Decoration */}
                    <div className="fixed inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-[10%] left-[5%] w-64 h-64 bg-electric-blue/10 rounded-full blur-3xl animate-float" style={{ animationDuration: '8s' }} />
                        <div className="absolute top-[60%] right-[10%] w-96 h-96 bg-neon-purple/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s', animationDuration: '10s' }} />
                        <div className="absolute bottom-[10%] left-[20%] w-48 h-48 bg-neon-pink/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s', animationDuration: '7s' }} />
                    </div>

                    <div className="relative z-10 max-w-md mx-auto min-h-screen flex flex-col">
                        <AnimatePresence>
                            {globalToast && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="fixed top-8 left-4 right-4 z-50 pointer-events-none"
                                >
                                    <GlassCard className="p-3 bg-charcoal/80 border-electric-blue/50 text-center font-bold text-sm text-electric-blue shadow-glow-blue">
                                        {globalToast}
                                    </GlassCard>
                                </motion.div>
                            )}
                        </AnimatePresence>
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
                                    key={`learning-${learningTopic}`}
                                    topic={learningTopic}
                                    onBack={() => setIsLearning(false)}
                                    weakPoints={weakPoints}
                                    customLists={customLists}
                                    history={history}
                                    onFinish={handleSaveExam}
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
                                    userStats={userStats}
                                    onUpgrade={() => {
                                        setIsLearning(false);
                                        setActiveTab('pricing');
                                    }}
                                    onRefer={() => {
                                        setIsLearning(false);
                                        setActiveTab('profile'); // Referral UI is in profile
                                    }}
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
                                            initialData={customLists}
                                            onSave={(list: WordCard[]) => {
                                                setCustomLists(list);
                                                localStorage.setItem('bina_custom_lists', JSON.stringify(list));
                                            }}
                                            onStartLearning={() => {
                                                setActiveTab('home');
                                                setTimeout(() => startLearning('custom'), 100);
                                            }}
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
                                            userStats={userStats}
                                            onUpgrade={() => {
                                                setActiveTab('pricing');
                                            }}
                                            onRefer={() => {
                                                setActiveTab('profile');
                                            }}
                                            favorites={userStats.favorites}
                                            onToggleFavorite={toggleFavorite}
                                        />
                                    )}
                                    {activeTab === 'stats' && <StatsScreen userStats={userStats} userProfile={userProfile} setActiveTab={setActiveTab} />}
                                    {activeTab === 'profile' && (
                                        <ProfileScreen
                                            userStats={userStats}
                                            userProfile={userProfile}
                                            user={user}
                                            setActiveTab={setActiveTab}
                                            onEditProfile={() => setHasOnboarded(false)}
                                            onLogout={handleLogout}
                                            onRedeem={redeemCredits}
                                            onSimulateFriend={simulateFriendSignup}
                                            showToast={showGlobalToast}
                                            onGoogleLogin={signInWithGoogle}
                                        />
                                    )}
                                    {activeTab === 'achievements' && <AchievementsScreen achievements={userStats.achievements} onBack={() => setActiveTab('profile')} />}
                                    {activeTab === 'study-plan' && <StudyPlanScreen userProfile={userProfile} userStats={userStats} onBack={() => setActiveTab('profile')} />}
                                    {activeTab === 'ai-analysis' && (
                                        <AIAnalysisScreen
                                            userStats={userStats}
                                            weakPoints={weakPoints}
                                            onBack={() => setActiveTab('stats')}
                                            onStartLearning={(topic: string) => {
                                                // Directly start learning without switching activeTab first
                                                // This prevents unmounting/remounting issues and race conditions
                                                startLearning(topic);
                                            }}
                                        />
                                    )}

                                    {activeTab === 'ai-settings' && (
                                        <AISettingsScreen
                                            userStats={userStats}
                                            onBack={() => setActiveTab('profile')}
                                            onUpdateStats={(newStats: any) => {
                                                setUserStats(newStats);
                                                localStorage.setItem('bina_user_stats', JSON.stringify(newStats));
                                            }}
                                            notifSettings={notifSettings}
                                            notifPermission={notifPermission}
                                            onUpdateNotif={updateNotifSettings}
                                            onRequestPermission={async () => {
                                                const perm = await requestNotificationPermission();
                                                setNotifPermission(perm);
                                                if (perm === 'granted') {
                                                    updateNotifSettings({ ...notifSettings, enabled: true });
                                                }
                                            }}
                                            onTestNotif={showTestNotification}
                                            onUpgrade={() => setActiveTab('pricing')}
                                        />
                                    )}

                                    {activeTab === 'pricing' && (
                                        <PricingScreen
                                            onBack={() => setActiveTab('home')}
                                            currentTier={userStats.tier}
                                            user={user}
                                            onLogin={signInWithGoogle}
                                            onSelectPlan={(tier: any) => {
                                                setUserStats((prev: any) => ({ ...prev, tier }));
                                                setActiveTab('home');
                                            }}
                                        />
                                    )}
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
                                tier={userStats.tier}
                                onUpgrade={() => {
                                    setShowExplanation(null);
                                    setIsLearning(false);
                                    setActiveTab('pricing');
                                }}
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
            } />
        </Routes>
    );
}

export default App;



