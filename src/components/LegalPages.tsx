import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Shield, Scale, FileText } from 'lucide-react';

const LegalPage = ({ title, content, icon: Icon, onBack }: { title: string, content: React.ReactNode, icon: any, onBack: () => void }) => {
    return (
        <div className="min-h-screen bg-charcoal text-text-primary p-6 font-sans rtl" dir="rtl">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto pt-12 pb-24"
            >
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-electric-blue font-bold mb-8 hover:opacity-80 transition-opacity"
                >
                    <ChevronRight className="w-5 h-5" />
                    <span>חזרה לאפליקציה</span>
                </button>

                <div className="flex items-center gap-4 mb-10">
                    <div className="w-16 h-16 rounded-2xl bg-electric-blue/10 flex items-center justify-center border border-electric-blue/20">
                        <Icon className="w-8 h-8 text-electric-blue" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-white italic">{title}</h1>
                        <p className="text-text-secondary text-sm">עודכן לאחרונה: פברואר 2024</p>
                    </div>
                </div>

                <div className="prose prose-invert max-w-none text-text-secondary leading-relaxed space-y-6">
                    {content}
                </div>
            </motion.div>
        </div>
    );
};

export const TermsOfService = ({ onBack }: { onBack: () => void }) => {
    const content = (
        <>
            <section>
                <h2 className="text-xl font-bold text-white mb-2">1. קבלה של התנאים</h2>
                <p>השימוש באפליקציית Bina (להלן: "האפליקציה") כפוף לתנאי השימוש המפורטים להלן. בעצם השימוש באפליקציה, את/ה מסכימ/ה לתנאים אלו במלואם.</p>
            </section>
            <section>
                <h2 className="text-xl font-bold text-white mb-2">2. השירות</h2>
                <p>Bina היא פלטפורמה ללימוד פסיכומטרי מבוססת בינה מלאכותית. השירות ניתן כפי שהוא (AS IS).</p>
            </section>
            <section>
                <h2 className="text-xl font-bold text-white mb-2">3. מנויים ותשלומים</h2>
                <p>האפליקציה מציעה מנויי פרימיום (Plus ו-Pro). התשלום מבוצע באמצעות Paddle. המנוי מתחדש אוטומטית אלא אם בוטל לפחות 24 שעות לפני תום התקופה.</p>
            </section>
            <section>
                <h2 className="text-xl font-bold text-white mb-2">4. קניין רוחני</h2>
                <p>כל התכנים באפליקציה, כולל שאלות, הסברים ועיצובים, הם רכוש בלעדי של Bina ומוגנים בזכויות יוצרים.</p>
            </section>
        </>
    );

    return <LegalPage title="תנאי שימוש" content={content} icon={Scale} onBack={onBack} />;
};

export const PrivacyPolicy = ({ onBack }: { onBack: () => void }) => {
    const content = (
        <>
            <section>
                <h2 className="text-xl font-bold text-white mb-2">1. איסוף מידע</h2>
                <p>אנחנו אוספים מידע אישי בסיסי (שם, אימייל) לצורך יצירת חשבון וסנכרון ההתקדמות שלך באמצעות Firebase.</p>
            </section>
            <section>
                <h2 className="text-xl font-bold text-white mb-2">2. שימוש במידע</h2>
                <p>המידע שלך משמש לשיפור חווית הלמידה, ניתוח נקודות חולשה והתאמה אישית של תוכנית הלימודים.</p>
            </section>
            <section>
                <h2 className="text-xl font-bold text-white mb-2">3. אבטחת מידע</h2>
                <p>אנחנו משתמשים בשירותים מאובטחים של Google (Firebase) ו-Paddle כדי להגן על המידע והתשלומים שלך.</p>
            </section>
        </>
    );

    return <LegalPage title="מדיניות פרטיות" content={content} icon={Shield} onBack={onBack} />;
};
