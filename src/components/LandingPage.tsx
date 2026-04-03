import React from 'react';
import { motion } from 'framer-motion';

// ─── Types ────────────────────────────────────────────────────────────────────
interface LandingPageProps {
    onStart: () => void;
}

// ─── Fade-in animation preset ─────────────────────────────────────────────────
const fadeUp = {
    initial: { opacity: 0, y: 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-60px' },
    transition: { duration: 0.55, ease: 'easeOut' },
};

// ─── Feature data ─────────────────────────────────────────────────────────────
const features = [
    {
        icon: '🤖',
        title: 'ניתוח חיבורים בינה מלאכותית',
        desc: 'Gemini מדרג את החיבור שלך בזמן אמת — ציון, משוב מפורט, ועצות לשיפור.',
        accent: '#CCFF00',
    },
    {
        icon: '🧠',
        title: 'חזרות במרווחי זמן (SRS)',
        desc: 'אלגוריתם SM-2 זוכר בדיוק איזו מילה קשה לך ומציג אותה ברגע הנכון.',
        accent: '#B026FF',
    },
    {
        icon: '🃏',
        title: 'כרטיסיות סוויפ כמו טינדר',
        desc: 'גרור שמאלה / ימינה כדי לסמן ידוע / לא ידוע. ממכר ומהיר.',
        accent: '#00D9FF',
    },
    {
        icon: '📊',
        title: 'ציון חזוי בזמן אמת',
        desc: 'הפרופיל שלך מחושב לפי ציון בסיס, ציון יעד ותאריך הבחינה. תמיד תדע כמה נשאר.',
        accent: '#FFD700',
    },
    {
        icon: '⏱️',
        title: 'סימולציה מלאה',
        desc: '8 פרקים, שעון עצור, תנאי בחינה אמיתיים — ישר מהאפליקציה, בלי להדפיס כלום.',
        accent: '#FF0077',
    },
    {
        icon: '✍️',
        title: 'תרגול כתיבה מותאם אישית',
        desc: 'ייבא מילים משלך, צור רשימות אישיות, ותרגל בדיוק את מה שמאתגר אותך.',
        accent: '#34D399',
    },
];

// ─── Comparison table data ─────────────────────────────────────────────────────
const comparison = [
    { feature: 'ניתוח חיבורים עם AI', bina: true, others: false },
    { feature: 'חזרות במרווחי זמן (SRS)', bina: true, others: false },
    { feature: 'ציון חזוי אישי', bina: true, others: false },
    { feature: 'סימולציה מלאה 8 פרקים', bina: true, others: false },
    { feature: 'כרטיסיות סוויפ אינטראקטיבי', bina: true, others: false },
    { feature: 'אוצר מילים בעברית ואנגלית', bina: true, others: true },
    { feature: 'תרגול אנלוגיות', bina: true, others: true },
    { feature: 'גישה חינמית', bina: true, others: true },
];

// ─── Testimonials ─────────────────────────────────────────────────────────────
const highlights = [
    {
        icon: '🎯',
        title: 'תרגול ממוקד',
        text: 'ה-AI מזהה את נקודות החולשה שלך ומתמקד בדיוק במה שצריך לשפר.',
    },
    {
        icon: '📈',
        title: 'מעקב התקדמות',
        text: 'ציון חזוי בזמן אמת שמתעדכן עם כל תרגול — תמיד תדע איפה אתה עומד.',
    },
    {
        icon: '🧠',
        title: 'למידה חכמה',
        text: 'אלגוריתם SRS מציג מילים בדיוק בזמן הנכון כדי שתזכור אותן לטווח ארוך.',
    },
];

// ─── Main Component ───────────────────────────────────────────────────────────
const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
    return (
        <div
            dir="rtl"
            className="min-h-screen bg-[#020817] text-white font-sans overflow-x-hidden"
            style={{ fontFamily: "'Inter', 'Heebo', sans-serif" }}
        >
            {/* ── Ambient blobs ── */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-[#CCFF00]/5 blur-[120px]" />
                <div className="absolute top-[40%] left-[-10%] w-[400px] h-[400px] rounded-full bg-[#B026FF]/8 blur-[100px]" />
                <div className="absolute bottom-[-5%] right-[20%] w-[300px] h-[300px] rounded-full bg-[#00D9FF]/6 blur-[80px]" />
            </div>

            {/* ────────────────────────────────────────────────────────────────── */}
            {/* SECTION 1 — HERO */}
            {/* ────────────────────────────────────────────────────────────────── */}
            <section className="relative z-10 px-5 pt-14 pb-16 max-w-lg mx-auto">
                {/* Social proof badge */}
                <motion.div
                    {...fadeUp}
                    className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-[#CCFF00]/30 bg-[#CCFF00]/8 text-[#CCFF00] text-xs font-black tracking-widest uppercase"
                >
                    <span>⚡</span>
                    <span>אפליקציית AI לפסיכומטרי</span>
                </motion.div>

                {/* Main H1 — primary keyword */}
                <motion.h1
                    {...fadeUp}
                    transition={{ duration: 0.55, delay: 0.05 }}
                    className="text-[2.75rem] font-black leading-tight tracking-tighter mb-4"
                    style={{ lineHeight: '1.1' }}
                >
                    <span className="text-white">האפליקציה הכי חכמה </span>
                    <br />
                    <span
                        className="bg-clip-text text-transparent"
                        style={{ backgroundImage: 'linear-gradient(135deg, #CCFF00 0%, #00D9FF 100%)' }}
                    >
                        ללימוד פסיכומטרי
                    </span>
                </motion.h1>

                {/* Sub-headline */}
                <motion.p
                    {...fadeUp}
                    transition={{ duration: 0.55, delay: 0.1 }}
                    className="text-[#94A3B8] text-lg font-medium mb-8 leading-relaxed"
                >
                    AI מנתח את החולשות שלך, מסגל את הלימוד, ומנבא את הציון — כדי שתגיע מוכן ל-100%.
                </motion.p>

                {/* Primary CTA */}
                <motion.button
                    {...fadeUp}
                    transition={{ duration: 0.55, delay: 0.15 }}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={onStart}
                    className="w-full min-h-[56px] rounded-2xl font-black text-lg text-[#020817] flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(204,255,0,0.35)] transition-all"
                    style={{ background: 'linear-gradient(135deg, #CCFF00 0%, #A3E635 100%)' }}
                >
                    <span>🚀</span>
                    התחל עכשיו — בחינם
                </motion.button>

                <motion.p
                    {...fadeUp}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="text-center text-[#475569] text-xs mt-3 font-medium"
                >
                    אין צורך בכרטיס אשראי · עובד על כל מכשיר
                </motion.p>

                {/* Platform badge */}
                <motion.div
                    {...fadeUp}
                    transition={{ duration: 0.4, delay: 0.25 }}
                    className="flex justify-center gap-3 mt-4"
                >
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-[#94A3B8]">
                        <span>🌐</span> Web App
                    </div>
                </motion.div>
            </section>

            {/* ────────────────────────────────────────────────────────────────── */}
            {/* SECTION 2 — PROBLEM / HOOK */}
            {/* ────────────────────────────────────────────────────────────────── */}
            <section className="relative z-10 px-5 py-12 max-w-lg mx-auto">
                <motion.div {...fadeUp}>
                    <div className="text-[10px] font-black text-[#CCFF00] uppercase tracking-[0.25em] mb-3">הבעיה האמיתית</div>
                    <h2 className="text-2xl font-black mb-6 leading-tight">
                        למה רוב <span className="text-[#94A3B8]">אפליקציות הפסיכומטרי</span> לא עוזרות?
                    </h2>
                </motion.div>

                <div className="space-y-3 mb-8">
                    {[
                        { icon: '❌', text: 'מציגות שאלות אקראיות — בלי להבין מה קשה לך' },
                        { icon: '❌', text: 'אין משוב אמיתי על חיבורים — רק ניחוש' },
                        { icon: '❌', text: 'אין מעקב התקדמות — אתה לא יודע אם אתה משתפר' },
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            {...fadeUp}
                            transition={{ duration: 0.45, delay: i * 0.08 }}
                            className="flex items-start gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]"
                        >
                            <span className="text-lg shrink-0 mt-0.5">{item.icon}</span>
                            <p className="text-[#94A3B8] text-sm font-medium leading-relaxed">{item.text}</p>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    {...fadeUp}
                    className="p-5 rounded-2xl border border-[#CCFF00]/20 bg-[#CCFF00]/5"
                >
                    <div className="flex items-start gap-3">
                        <span className="text-2xl shrink-0">✅</span>
                        <div>
                            <div className="font-black text-white mb-1">Bina עושה את זה אחרת</div>
                            <p className="text-[#94A3B8] text-sm leading-relaxed">
                                בינה מלאכותית מנתחת איפה אתה טועה, מסגלת את התרגול, ומספקת הסבר מפורט לכל שגיאה — בזמן אמת.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* ────────────────────────────────────────────────────────────────── */}
            {/* SECTION 3 — FEATURES GRID */}
            {/* ────────────────────────────────────────────────────────────────── */}
            <section className="relative z-10 px-5 py-12 max-w-lg mx-auto">
                <motion.div {...fadeUp}>
                    <div className="text-[10px] font-black text-[#00D9FF] uppercase tracking-[0.25em] mb-3">כל מה שצריך</div>
                    <h2 className="text-2xl font-black mb-8 leading-tight">
                        פיצ'רים שאף אפליקציה<br />
                        <span
                            className="bg-clip-text text-transparent"
                            style={{ backgroundImage: 'linear-gradient(135deg, #00D9FF, #B026FF)' }}
                        >
                            פסיכומטרי אחרת לא נותנת
                        </span>
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 gap-4">
                    {features.map((f, i) => (
                        <motion.div
                            key={i}
                            {...fadeUp}
                            transition={{ duration: 0.5, delay: i * 0.07 }}
                            className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl flex items-start gap-4"
                            style={{
                                boxShadow: `0 0 0 0px ${f.accent}`, // subtle glow on hover via filter
                            }}
                        >
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                                style={{ background: `${f.accent}18` }}
                            >
                                {f.icon}
                            </div>
                            <div>
                                <div className="font-black text-white text-base mb-1">{f.title}</div>
                                <div className="text-[#94A3B8] text-sm leading-relaxed">{f.desc}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ────────────────────────────────────────────────────────────────── */}
            {/* SECTION 4 — COMPETITOR COMPARISON */}
            {/* ────────────────────────────────────────────────────────────────── */}
            <section className="relative z-10 px-5 py-12 max-w-lg mx-auto">
                <motion.div {...fadeUp}>
                    <div className="text-[10px] font-black text-[#B026FF] uppercase tracking-[0.25em] mb-3">השוואה</div>
                    <h2 className="text-2xl font-black mb-8 leading-tight">
                        Bina vs. שאר האפליקציות
                    </h2>
                </motion.div>

                <motion.div
                    {...fadeUp}
                    className="rounded-2xl overflow-hidden border border-white/10"
                >
                    {/* Header row */}
                    <div className="grid grid-cols-3 bg-white/[0.06] px-4 py-3">
                        <div className="text-sm font-black text-[#94A3B8]">פיצ'ר</div>
                        <div className="text-sm font-black text-[#CCFF00] text-center">Bina</div>
                        <div className="text-sm font-black text-[#475569] text-center">אחרות</div>
                    </div>

                    {comparison.map((row, i) => (
                        <div
                            key={i}
                            className={`grid grid-cols-3 px-4 py-3.5 border-t border-white/[0.06] ${i % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.02]'}`}
                        >
                            <div className="text-sm text-[#CBD5E1] font-medium leading-tight pr-2">{row.feature}</div>
                            <div className="text-center">
                                {row.bina
                                    ? <span className="text-[#CCFF00] font-black">✓</span>
                                    : <span className="text-[#475569]">—</span>
                                }
                            </div>
                            <div className="text-center">
                                {row.others
                                    ? <span className="text-[#94A3B8] font-bold">✓</span>
                                    : <span className="text-[#EF4444]">✗</span>
                                }
                            </div>
                        </div>
                    ))}
                </motion.div>
            </section>

            {/* ────────────────────────────────────────────────────────────────── */}
            {/* SECTION 5 — WHY BINA */}
            {/* ────────────────────────────────────────────────────────────────── */}
            <section className="relative z-10 px-5 py-12 max-w-lg mx-auto">
                <motion.div {...fadeUp}>
                    <div className="text-[10px] font-black text-[#FFD700] uppercase tracking-[0.25em] mb-3">למה Bina</div>
                    <h2 className="text-2xl font-black mb-8 leading-tight">
                        למידה חכמה שעובדת<br />
                        <span className="text-[#FFD700]">בשבילך</span>
                    </h2>
                </motion.div>

                <div className="space-y-4">
                    {highlights.map((h, i) => (
                        <motion.div
                            key={i}
                            {...fadeUp}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center text-xl">
                                    {h.icon}
                                </div>
                                <div className="font-black text-white text-sm">{h.title}</div>
                            </div>
                            <p className="text-[#94A3B8] text-sm leading-relaxed">{h.text}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ────────────────────────────────────────────────────────────────── */}
            {/* SECTION 6 — FINAL CTA */}
            {/* ────────────────────────────────────────────────────────────────── */}
            <section className="relative z-10 px-5 pb-20 pt-8 max-w-lg mx-auto">
                <motion.div
                    {...fadeUp}
                    className="p-8 rounded-3xl text-center relative overflow-hidden"
                    style={{
                        background: 'linear-gradient(135deg, rgba(204,255,0,0.08) 0%, rgba(176,38,255,0.08) 100%)',
                        border: '1px solid rgba(204,255,0,0.2)',
                        boxShadow: '0 0 60px rgba(204,255,0,0.06)',
                    }}
                >
                    {/* Decorative glow */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-[-30%] left-[50%] -translate-x-1/2 w-[250px] h-[250px] rounded-full bg-[#CCFF00]/8 blur-[60px]" />
                    </div>

                    <div className="relative z-10">
                        <div className="text-4xl mb-4">🧠</div>
                        <h2 className="text-2xl font-black mb-3 leading-tight">
                            מוכן להתחיל{' '}
                            <span className="text-[#CCFF00]">ללמוד חכם</span>?
                        </h2>
                        <p className="text-[#94A3B8] text-sm mb-7 leading-relaxed">
                            התחל להתכונן לפסיכומטרי עם Bina — תרגול מותאם אישית עם בינה מלאכותית.
                        </p>

                        <motion.button
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={onStart}
                            className="w-full min-h-[56px] rounded-2xl font-black text-lg text-[#020817] flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(204,255,0,0.35)] mb-3 transition-all"
                            style={{ background: 'linear-gradient(135deg, #CCFF00 0%, #A3E635 100%)' }}
                        >
                            <span>🚀</span>
                            התחל עכשיו — בחינם
                        </motion.button>

                        <p className="text-[#475569] text-xs font-medium">
                            ✓ בחינם לתמיד &nbsp;·&nbsp; ✓ ללא כרטיס אשראי &nbsp;·&nbsp; ✓ Web App
                        </p>
                    </div>
                </motion.div>

                {/* Legal links */}
                <div className="flex justify-center gap-4 mt-6 text-[10px] text-[#334155]">
                    <a href="/terms" className="hover:text-[#64748B] transition-colors">תנאי שימוש</a>
                    <span>·</span>
                    <a href="/privacy" className="hover:text-[#64748B] transition-colors">מדיניות פרטיות</a>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
