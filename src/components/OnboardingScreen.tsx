import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Calendar, Zap, ChevronRight, ChevronLeft, Check, BookOpen, Brain, TrendingUp, Clock, User } from 'lucide-react';

export interface UserProfile {
    name: string;
    targetScore: number;
    examDate: string;
    dailyMinutes: number;
}

interface OnboardingScreenProps {
    onComplete: (profile: UserProfile) => void;
    onCancel?: () => void;
    initialProfile?: UserProfile | null;
}

// ─── Step 1: Welcome ────────────────────────────────────────────────────────

const WelcomeStep = ({ onNext }: { onNext: () => void }) => {
    return (
        <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="flex flex-col items-center justify-center h-full px-6 text-center"
        >
            {/* Animated logo */}
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6, type: 'spring', stiffness: 120 }}
                className="relative mb-8"
            >
                <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-electric-blue via-neon-purple to-neon-pink p-0.5 shadow-glow-blue">
                    <div className="w-full h-full rounded-3xl bg-charcoal flex items-center justify-center">
                        <span className="text-5xl">🧠</span>
                    </div>
                </div>
                {/* Orbiting dot */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0"
                    style={{ transformOrigin: 'center' }}
                >
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-electric-blue shadow-glow-blue" />
                </motion.div>
            </motion.div>

            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-5xl font-black bg-gradient-to-r from-electric-blue via-neon-purple to-neon-pink bg-clip-text text-transparent tracking-tighter mb-3"
            >
                Bina
            </motion.h1>

            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="text-xl font-bold text-text-primary mb-2"
            >
                הכנה לפסיכומטרי עם AI
            </motion.p>

            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
                className="text-text-secondary text-sm leading-relaxed mb-12 max-w-xs"
            >
                בינה לומדת את נקודות החוזק והחולשה שלך ובונה תוכנית לימודים מותאמת אישית
            </motion.p>

            {/* Feature pills */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75 }}
                className="flex flex-wrap justify-center gap-2 mb-12"
            >
                {[
                    { icon: '⚡', label: 'AI חכם' },
                    { icon: '🎯', label: 'מותאם אישית' },
                    { icon: '📈', label: 'מעקב התקדמות' },
                ].map((pill) => (
                    <div
                        key={pill.label}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-text-secondary"
                    >
                        <span>{pill.icon}</span>
                        <span>{pill.label}</span>
                    </div>
                ))}
            </motion.div>

            <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.85 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={onNext}
                className="w-full max-w-xs py-5 rounded-2xl bg-gradient-to-r from-electric-blue to-neon-purple text-charcoal font-black text-lg shadow-glow-blue flex items-center justify-center gap-3"
            >
                <span>בוא נתחיל</span>
                <ChevronRight className="w-5 h-5" />
            </motion.button>
        </motion.div>
    );
};

// ─── Step 2: Goal Setup ──────────────────────────────────────────────────────

const SCORE_MIN = 500;
const SCORE_MAX = 800;

const GoalStep = ({
    profile,
    onChange,
    onNext,
    onBack,
}: {
    profile: UserProfile;
    onChange: (p: Partial<UserProfile>) => void;
    onNext: () => void;
    onBack: () => void;
}) => {
    const scorePercent = ((profile.targetScore - SCORE_MIN) / (SCORE_MAX - SCORE_MIN)) * 100;

    const getScoreColor = (score: number) => {
        if (score >= 750) return 'from-cyber-yellow to-neon-pink';
        if (score >= 680) return 'from-electric-blue to-neon-purple';
        return 'from-neon-purple to-neon-pink';
    };

    const getScoreLabel = (score: number) => {
        if (score >= 750) return '🏆 מצטיין';
        if (score >= 700) return '🎯 גבוה מאוד';
        if (score >= 650) return '⚡ גבוה';
        return '📚 טוב';
    };

    const dailyOptions = [15, 30, 45, 60, 90];

    // Calculate days until exam
    const daysUntil = profile.examDate
        ? Math.max(0, Math.ceil((new Date(profile.examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        : null;

    const canProceed = profile.examDate && profile.targetScore && profile.name?.trim();

    return (
        <motion.div
            key="goal"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="flex flex-col h-full px-6 pt-4 pb-6 overflow-y-auto"
        >
            {/* Header */}
            <div className="mb-8">
                <button onClick={onBack} className="text-text-muted hover:text-text-primary transition-colors mb-6 text-sm font-bold flex items-center gap-1">
                    <ChevronLeft className="w-4 h-4" />
                    <span>חזור</span>
                </button>
                <h2 className="text-3xl font-black text-text-primary mb-1">הגדר את המטרה</h2>
                <p className="text-text-secondary text-sm">נבנה לך תוכנית לימודים מותאמת אישית</p>
            </div>

            {/* Name */}
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                    <User className="w-5 h-5 text-electric-blue" />
                    <span className="font-bold text-sm">שם מלא</span>
                </div>
                <input
                    type="text"
                    placeholder="איך נקרא לך?"
                    value={profile.name}
                    onChange={(e) => onChange({ name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-text-primary font-bold text-sm focus:outline-none focus:border-electric-blue/50 transition-colors"
                />
            </div>

            {/* Target Score */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-electric-blue" />
                        <span className="font-bold text-sm">ציון יעד</span>
                    </div>
                    <div className={`text-2xl font-black bg-gradient-to-r ${getScoreColor(profile.targetScore)} bg-clip-text text-transparent`}>
                        {profile.targetScore}
                    </div>
                </div>

                {/* Score slider */}
                <div className="relative mb-3">
                    <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
                        <motion.div
                            className={`h-full bg-gradient-to-r ${getScoreColor(profile.targetScore)} rounded-full shadow-glow-blue`}
                            style={{ width: `${scorePercent}%` }}
                            layout
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                    </div>
                    <input
                        type="range"
                        min={SCORE_MIN}
                        max={SCORE_MAX}
                        step={10}
                        value={profile.targetScore}
                        onChange={(e) => onChange({ targetScore: Number(e.target.value) })}
                        className="absolute inset-0 w-full opacity-0 cursor-pointer h-3"
                    />
                </div>

                <div className="flex justify-between text-xs font-bold text-text-muted">
                    <span>{SCORE_MIN}</span>
                    <span className={`font-black text-sm bg-gradient-to-r ${getScoreColor(profile.targetScore)} bg-clip-text text-transparent`}>
                        {getScoreLabel(profile.targetScore)}
                    </span>
                    <span>{SCORE_MAX}</span>
                </div>
            </div>

            {/* Exam Date */}
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-5 h-5 text-neon-purple" />
                    <span className="font-bold text-sm">תאריך הבחינה</span>
                    {daysUntil !== null && (
                        <span className="mr-auto text-xs font-bold text-neon-purple bg-neon-purple/10 px-2 py-0.5 rounded-full">
                            {daysUntil} ימים
                        </span>
                    )}
                </div>
                <input
                    type="date"
                    value={profile.examDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => onChange({ examDate: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-text-primary font-bold text-sm focus:outline-none focus:border-neon-purple/50 transition-colors [color-scheme:dark]"
                />
            </div>

            {/* Daily Study Time */}
            <div className="mb-10">
                <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-5 h-5 text-cyber-yellow" />
                    <span className="font-bold text-sm">זמן לימוד יומי</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                    {dailyOptions.map((min) => (
                        <button
                            key={min}
                            onClick={() => onChange({ dailyMinutes: min })}
                            className={`py-3 rounded-xl text-xs font-black transition-all ${profile.dailyMinutes === min
                                ? 'bg-gradient-to-b from-cyber-yellow to-neon-pink text-charcoal shadow-glow-yellow'
                                : 'bg-white/5 border border-white/10 text-text-secondary hover:bg-white/10'
                                }`}
                        >
                            {min}′
                        </button>
                    ))}
                </div>
            </div>

            {/* CTA */}
            <motion.button
                whileHover={{ scale: canProceed ? 1.03 : 1 }}
                whileTap={{ scale: canProceed ? 0.97 : 1 }}
                onClick={canProceed ? onNext : undefined}
                disabled={!canProceed}
                className={`w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all ${canProceed
                    ? 'bg-gradient-to-r from-electric-blue to-neon-purple text-charcoal shadow-glow-blue'
                    : 'bg-white/5 border border-white/10 text-text-muted cursor-not-allowed'
                    }`}
            >
                <Zap className="w-5 h-5" />
                <span>בנה לי תוכנית לימודים</span>
            </motion.button>
        </motion.div>
    );
};

// ─── Step 3: Plan Generation ─────────────────────────────────────────────────

const PLAN_STEPS = [
    { icon: Brain, label: 'מנתח את רמת הידע הנוכחית...', color: 'text-electric-blue' },
    { icon: Target, label: 'מחשב פערים לציון היעד...', color: 'text-neon-purple' },
    { icon: Calendar, label: 'בונה לוח זמנים אופטימלי...', color: 'text-cyber-yellow' },
    { icon: BookOpen, label: 'מכין חומרי לימוד מותאמים...', color: 'text-neon-pink' },
    { icon: TrendingUp, label: 'מגדיר אבני דרך ומטרות...', color: 'text-emerald-400' },
];

const PlanGenerationStep = ({
    profile,
    onComplete,
}: {
    profile: UserProfile;
    onComplete: () => void;
}) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [done, setDone] = useState(false);

    useEffect(() => {
        let step = 0;
        const interval = setInterval(() => {
            step++;
            setCurrentStep(step);
            if (step >= PLAN_STEPS.length) {
                clearInterval(interval);
                setTimeout(() => setDone(true), 600);
            }
        }, 700);
        return () => clearInterval(interval);
    }, []);

    const daysUntil = profile.examDate
        ? Math.max(0, Math.ceil((new Date(profile.examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        : 90;

    const weeksUntil = Math.ceil(daysUntil / 7);
    const questionsPerDay = Math.round((profile.dailyMinutes / 5));

    const examDateFormatted = profile.examDate
        ? new Date(profile.examDate).toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' })
        : '';

    return (
        <motion.div
            key="plan"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="flex flex-col h-full px-6 pt-8 pb-6 justify-center"
        >
            <AnimatePresence mode="wait">
                {!done ? (
                    <motion.div
                        key="generating"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex flex-col items-center"
                    >
                        {/* Pulsing brain */}
                        <motion.div
                            animate={{ scale: [1, 1.08, 1], opacity: [0.8, 1, 0.8] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                            className="w-24 h-24 rounded-3xl bg-gradient-to-br from-electric-blue/20 to-neon-purple/20 border border-electric-blue/30 flex items-center justify-center mb-8 shadow-glow-blue"
                        >
                            <span className="text-4xl">🧠</span>
                        </motion.div>

                        <h2 className="text-2xl font-black text-text-primary mb-2 text-center">
                            בינה בונה את התוכנית שלך
                        </h2>
                        <p className="text-text-secondary text-sm text-center mb-10">
                            AI מנתח את הנתונים ומכין מסלול אישי
                        </p>

                        {/* Progress steps */}
                        <div className="w-full space-y-3 mb-8">
                            {PLAN_STEPS.map((step, idx) => {
                                const Icon = step.icon;
                                const isActive = idx === currentStep - 1;
                                const isDone = idx < currentStep - 1;
                                const isPending = idx >= currentStep;

                                return (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{
                                            opacity: isPending ? 0.3 : 1,
                                            x: 0,
                                        }}
                                        transition={{ delay: idx * 0.1 }}
                                        className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isActive ? 'bg-white/5 border border-white/10' : ''
                                            }`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isDone ? 'bg-emerald-400/20' : isActive ? 'bg-white/10' : 'bg-white/5'
                                            }`}>
                                            {isDone ? (
                                                <Check className="w-4 h-4 text-emerald-400" />
                                            ) : (
                                                <Icon className={`w-4 h-4 ${isActive ? step.color : 'text-text-muted'}`} />
                                            )}
                                        </div>
                                        <span className={`text-sm font-bold ${isDone ? 'text-emerald-400' : isActive ? 'text-text-primary' : 'text-text-muted'
                                            }`}>
                                            {step.label}
                                        </span>
                                        {isActive && (
                                            <motion.div
                                                animate={{ opacity: [0, 1, 0] }}
                                                transition={{ duration: 0.8, repeat: Infinity }}
                                                className="mr-auto w-2 h-2 rounded-full bg-electric-blue"
                                            />
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Progress bar */}
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-electric-blue to-neon-purple rounded-full"
                                initial={{ width: '0%' }}
                                animate={{ width: `${(currentStep / PLAN_STEPS.length) * 100}%` }}
                                transition={{ duration: 0.5, ease: 'easeOut' }}
                            />
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}
                        className="flex flex-col items-center"
                    >
                        {/* Success badge */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                            className="w-20 h-20 rounded-full bg-gradient-to-br from-electric-blue to-neon-purple flex items-center justify-center mb-6 shadow-glow-blue"
                        >
                            <Check className="w-10 h-10 text-white" strokeWidth={3} />
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-2xl font-black text-text-primary mb-1 text-center"
                        >
                            התוכנית שלך מוכנה! 🎉
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-text-secondary text-sm text-center mb-8"
                        >
                            {weeksUntil} שבועות של לימוד מותאם אישית
                        </motion.p>

                        {/* Plan summary card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35 }}
                            className="w-full backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-5 mb-8 space-y-4"
                        >
                            {/* Target score */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-text-secondary">
                                    <Target className="w-4 h-4 text-electric-blue" />
                                    <span>ציון יעד</span>
                                </div>
                                <span className="font-black text-xl bg-gradient-to-r from-electric-blue to-neon-purple bg-clip-text text-transparent">
                                    {profile.targetScore}
                                </span>
                            </div>
                            <div className="h-px bg-white/5" />

                            {/* Exam date */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-text-secondary">
                                    <Calendar className="w-4 h-4 text-neon-purple" />
                                    <span>תאריך בחינה</span>
                                </div>
                                <span className="font-bold text-sm text-text-primary">{examDateFormatted}</span>
                            </div>
                            <div className="h-px bg-white/5" />

                            {/* Daily questions */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-text-secondary">
                                    <BookOpen className="w-4 h-4 text-cyber-yellow" />
                                    <span>שאלות ביום</span>
                                </div>
                                <span className="font-bold text-sm text-cyber-yellow">{questionsPerDay} שאלות</span>
                            </div>
                            <div className="h-px bg-white/5" />

                            {/* Daily time */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-text-secondary">
                                    <Clock className="w-4 h-4 text-neon-pink" />
                                    <span>זמן יומי</span>
                                </div>
                                <span className="font-bold text-sm text-neon-pink">{profile.dailyMinutes} דקות</span>
                            </div>
                        </motion.div>

                        {/* CTA */}
                        <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={onComplete}
                            className="w-full py-5 rounded-2xl bg-gradient-to-r from-electric-blue to-neon-purple text-charcoal font-black text-lg shadow-glow-blue flex items-center justify-center gap-3"
                        >
                            <span>בוא נתחיל ללמוד!</span>
                            <ChevronRight className="w-5 h-5" />
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// ─── Step Indicator ──────────────────────────────────────────────────────────

const StepDots = ({ step }: { step: number }) => (
    <div className="flex items-center justify-center gap-2 pt-4 pb-2">
        {[0, 1, 2].map((i) => (
            <motion.div
                key={i}
                animate={{
                    width: i === step ? 24 : 8,
                    backgroundColor: i === step ? '#00D9FF' : 'rgba(255,255,255,0.15)',
                }}
                transition={{ duration: 0.3 }}
                className="h-2 rounded-full"
            />
        ))}
    </div>
);

// ─── Main Onboarding Screen ──────────────────────────────────────────────────

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete, onCancel, initialProfile }) => {
    const [step, setStep] = useState(initialProfile ? 1 : 0);
    const [profile, setProfile] = useState<UserProfile>(initialProfile || {
        name: '',
        targetScore: 680,
        examDate: '',
        dailyMinutes: 30,
    });

    const handleBack = () => {
        if (step === 1 && initialProfile && onCancel) {
            onCancel();
        } else {
            setStep(prev => Math.max(0, prev - 1));
        }
    };

    const updateProfile = (partial: Partial<UserProfile>) => {
        setProfile((prev) => ({ ...prev, ...partial }));
    };

    return (
        <div className="fixed inset-0 bg-charcoal z-[200] flex flex-col" dir="rtl">
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[5%] left-[10%] w-72 h-72 bg-electric-blue/8 rounded-full blur-3xl animate-float" style={{ animationDuration: '8s' }} />
                <div className="absolute top-[50%] right-[5%] w-80 h-80 bg-neon-purple/8 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s', animationDuration: '10s' }} />
                <div className="absolute bottom-[10%] left-[30%] w-56 h-56 bg-neon-pink/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s', animationDuration: '7s' }} />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col max-w-md mx-auto w-full h-full">
                {/* Step dots (hidden on welcome) */}
                {step > 0 && <StepDots step={step} />}

                <div className="flex-1 overflow-hidden">
                    <AnimatePresence mode="wait">
                        {step === 0 && (
                            <WelcomeStep key="welcome" onNext={() => setStep(1)} />
                        )}
                        {step === 1 && (
                            <GoalStep
                                key="goal"
                                profile={profile}
                                onChange={updateProfile}
                                onNext={() => setStep(2)}
                                onBack={() => setStep(0)}
                            />
                        )}
                        {step === 2 && (
                            <PlanGenerationStep
                                key="plan"
                                profile={profile}
                                onComplete={() => onComplete(profile)}
                            />
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default OnboardingScreen;
