import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Shield, Scale } from 'lucide-react';

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
                        <p className="text-text-secondary text-sm">עודכן לאחרונה: אפריל 2026</p>
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
                <h2 className="text-xl font-bold text-white mb-2">1. הגדרות ופרשנות</h2>
                <p>"Bina" או "האפליקציה" — אפליקציית הווב לתרגול פסיכומטרי מבוססת בינה מלאכותית, המופעלת על ידי Bina ("החברה", "אנחנו").</p>
                <p>"משתמש/ת" — כל אדם הניגש לאפליקציה ומשתמש בשירותיה.</p>
                <p>"שירותים" — כלל התכנים, הכלים והפיצ'רים הזמינים באפליקציה, כולל תרגולים, הערכות AI, וסימולציות.</p>
            </section>

            <section>
                <h2 className="text-xl font-bold text-white mb-2">2. קבלה של התנאים</h2>
                <p>השימוש באפליקציה מהווה הסכמה לתנאי שימוש אלה. אם אינך מסכימ/ה לתנאים, אנא הפסק/י את השימוש באפליקציה.</p>
                <p>תנאים אלה כפופים לדין הישראלי, ובמיוחד לחוק הגנת הצרכן, התשמ"א-1981, וחוק הגנת הפרטיות, התשמ"א-1981.</p>
            </section>

            <section>
                <h2 className="text-xl font-bold text-white mb-2">3. השירות</h2>
                <p>Bina היא פלטפורמה ללימוד והכנה לבחינה הפסיכומטרית. השירות כולל:</p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                    <li>תרגול אוצר מילים, אנלוגיות, חשיבה כמותית ואנגלית באמצעות כרטיסיות אינטראקטיביות</li>
                    <li>הערכה אוטומטית של חיבורים באמצעות בינה מלאכותית (AI)</li>
                    <li>סימולציה מלאה של מבחן פסיכומטרי</li>
                    <li>ניתוח נתוני למידה וציון חזוי</li>
                </ul>
                <p className="mt-2"><strong className="text-white">גילוי נאות בנוגע ל-AI:</strong> הערכות חיבורים, הסברים לשאלות, ותובנות למידה מופקים על ידי מודל בינה מלאכותית (Google Gemini) ולא על ידי מורים או בוחנים אנושיים. תוצאות ההערכה הן אינדיקטיביות בלבד ואינן מחליפות הערכה מקצועית.</p>
                <p>השירות ניתן כפי שהוא (AS IS) ואינו מבטיח תוצאות ספציפיות בבחינה הפסיכומטרית.</p>
            </section>

            <section>
                <h2 className="text-xl font-bold text-white mb-2">4. מנויים ותשלומים</h2>
                <p>האפליקציה מציעה רמת שימוש חינמית ומנויי פרימיום (Plus ו-Pro) בתשלום.</p>
                <p><strong className="text-white">מחירים:</strong> כל המחירים המוצגים כוללים מע"מ (18%) אלא אם צוין אחרת. עיבוד התשלומים מבוצע באמצעות Paddle.com Market Limited ("Paddle") כסוכן תשלומים מורשה.</p>
                <p><strong className="text-white">חידוש אוטומטי:</strong> מנויים מתחדשים אוטומטית בתום כל תקופת חיוב (חודשי או סמסטריאלי). תישלח אליך הודעה לפני החיוב.</p>
                <p><strong className="text-white">ביטול מנוי:</strong> ניתן לבטל את המנוי בכל עת דרך האפליקציה, או באמצעות פניה ישירה אלינו. הביטול ייכנס לתוקף בתום התקופה שכבר שולמה.</p>
            </section>

            <section>
                <h2 className="text-xl font-bold text-white mb-2">5. זכות ביטול (חוק הגנת הצרכן)</h2>
                <p>בהתאם לחוק הגנת הצרכן, התשמ"א-1981, ולתקנות הגנת הצרכן (ביטול עסקה), התשע"א-2010:</p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                    <li>באפשרותך לבטל את המנוי תוך <strong className="text-white">14 ימים</strong> ממועד ההרשמה או מיום קבלת מסמך הגילוי (המאוחר מביניהם), ובלבד שטרם חלפו יותר מ-14 ימים מתחילת השירות.</li>
                    <li>עלויות ביטול: לא ייגבו דמי ביטול מעבר למינימום הקבוע בחוק (הנמוך מבין 100 ש"ח או 5% מסכום העסקה).</li>
                    <li>אוכלוסיות מוגנות (עולים חדשים, אנשים עם מוגבלות, אזרחים ותיקים): זכאים לתקופת ביטול של <strong className="text-white">4 חודשים</strong>.</li>
                </ul>
                <p className="mt-2">לביטול, ניתן לפנות בדוא"ל: support@bina-app.com</p>
            </section>

            <section>
                <h2 className="text-xl font-bold text-white mb-2">6. קניין רוחני</h2>
                <p>כל התכנים באפליקציה, כולל שאלות, הסברים, עיצובים וקוד מקור, הם רכוש בלעדי של Bina ומוגנים בזכויות יוצרים.</p>
            </section>

            <section>
                <h2 className="text-xl font-bold text-white mb-2">7. הגבלת אחריות</h2>
                <p>Bina אינה מתחייבת לתוצאות ספציפיות בבחינה הפסיכומטרית. השירות הוא כלי עזר ללמידה ואינו מחליף הכנה מקצועית.</p>
                <p>תוכן שמופק על ידי בינה מלאכותית עלול לכלול שגיאות. אנו ממליצים לוודא מידע קריטי ממקורות נוספים.</p>
            </section>

            <section>
                <h2 className="text-xl font-bold text-white mb-2">8. שינויים בתנאים</h2>
                <p>אנו שומרים לעצמנו את הזכות לעדכן תנאים אלה. שינויים מהותיים יפורסמו באפליקציה ויישלחו בהתראה מראש.</p>
            </section>

            <section>
                <h2 className="text-xl font-bold text-white mb-2">9. דין חל וסמכות שיפוט</h2>
                <p>תנאים אלה כפופים לדין הישראלי. סמכות השיפוט הבלעדית נתונה לבתי המשפט בתל אביב-יפו.</p>
            </section>

            <section>
                <h2 className="text-xl font-bold text-white mb-2">10. יצירת קשר</h2>
                <p>לכל שאלה או בקשה בנוגע לתנאי השימוש, ניתן ליצור קשר: support@bina-app.com</p>
            </section>
        </>
    );

    return <LegalPage title="תנאי שימוש" content={content} icon={Scale} onBack={onBack} />;
};

export const PrivacyPolicy = ({ onBack }: { onBack: () => void }) => {
    const content = (
        <>
            <section>
                <h2 className="text-xl font-bold text-white mb-2">1. מבוא</h2>
                <p>מדיניות פרטיות זו מפרטת כיצד Bina ("האפליקציה", "אנחנו") אוספת, משתמשת ומגנה על המידע האישי שלך, בהתאם לחוק הגנת הפרטיות, התשמ"א-1981, ותקנות הגנת הפרטיות (אבטחת מידע), התשע"ז-2017 (כולל תיקון 13).</p>
            </section>

            <section>
                <h2 className="text-xl font-bold text-white mb-2">2. בעל המאגר</h2>
                <p>בעל המאגר ומנהל המידע: Bina</p>
                <p>דוא"ל ליצירת קשר: support@bina-app.com</p>
            </section>

            <section>
                <h2 className="text-xl font-bold text-white mb-2">3. המידע שאנחנו אוספים</h2>
                <p>אנו אוספים את סוגי המידע הבאים:</p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                    <li><strong className="text-white">פרטי חשבון:</strong> שם, כתובת דוא"ל (באמצעות Google OAuth או הרשמה ישירה)</li>
                    <li><strong className="text-white">נתוני למידה:</strong> ציון יעד, ציון בסיס, תאריך בחינה, תשובות לתרגילים, דיוק לפי קטגוריה, היסטוריית למידה</li>
                    <li><strong className="text-white">תכנים שנכתבו:</strong> חיבורים שנשלחים להערכה אוטומטית</li>
                    <li><strong className="text-white">נתוני שימוש:</strong> זמני שימוש, התקדמות ברמות, סטריקים</li>
                    <li><strong className="text-white">נתוני תשלום:</strong> מזהה לקוח ומנוי ב-Paddle (פרטי כרטיס אשראי אינם נשמרים אצלנו)</li>
                </ul>
            </section>

            <section>
                <h2 className="text-xl font-bold text-white mb-2">4. מטרות השימוש במידע</h2>
                <ul className="list-disc list-inside space-y-1">
                    <li>אספקת השירות: התאמה אישית של תוכנית לימודים, מעקב התקדמות, חישוב ציון חזוי</li>
                    <li>שיפור השירות: ניתוח נקודות חולשה ושיפור אלגוריתמי ההוראה</li>
                    <li>ניהול חשבונות ומנויים</li>
                    <li>תמיכה טכנית</li>
                </ul>
            </section>

            <section>
                <h2 className="text-xl font-bold text-white mb-2">5. עיבוד מידע באמצעות בינה מלאכותית</h2>
                <p><strong className="text-white">גילוי נאות:</strong> חיבורים שנשלחים להערכה מעובדים על ידי מודל AI של Google Gemini. המידע מועבר לשרתי Google לצורך עיבוד ואינו נשמר על ידם לאחר מכן.</p>
                <p>תובנות שמופקות על ידי ה-AI (כגון ציונים, ניתוח חולשות, המלצות ללמידה) נחשבות מידע אישי ומוגנות בהתאם למדיניות זו.</p>
            </section>

            <section>
                <h2 className="text-xl font-bold text-white mb-2">6. שיתוף מידע עם צדדים שלישיים</h2>
                <p>אנו משתפים מידע רק עם ספקי השירות הבאים, לצורך אספקת השירות:</p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                    <li><strong className="text-white">Google Firebase:</strong> אחסון נתונים ואימות משתמשים (שרתים באירופה/ארה"ב)</li>
                    <li><strong className="text-white">Google Gemini AI:</strong> עיבוד חיבורים והסברים</li>
                    <li><strong className="text-white">Paddle:</strong> עיבוד תשלומים</li>
                    <li><strong className="text-white">Vercel:</strong> אירוח האפליקציה</li>
                </ul>
                <p className="mt-2">אנו לא מוכרים, משכירים או משתפים מידע אישי לצורכי שיווק של צדדים שלישיים.</p>
            </section>

            <section>
                <h2 className="text-xl font-bold text-white mb-2">7. העברת מידע מחוץ לישראל</h2>
                <p>המידע שלך מאוחסן בשרתי Google Cloud (אירופה / ארה"ב) ומעובד על ידי שירותים בינלאומיים. העברת מידע זו נעשית בהתאם לסעיף 2(9) לתקנות הגנת הפרטיות (העברת מידע אל מאגרי מידע שמחוץ לגבולות המדינה), ובכפוף להסכמי עיבוד מידע עם ספקי השירות.</p>
            </section>

            <section>
                <h2 className="text-xl font-bold text-white mb-2">8. תקופת שמירת מידע</h2>
                <p>אנו שומרים את המידע שלך כל עוד חשבונך פעיל. לאחר מחיקת חשבון, המידע יימחק תוך 30 יום, למעט מידע שאנו מחויבים לשמור על פי חוק.</p>
            </section>

            <section>
                <h2 className="text-xl font-bold text-white mb-2">9. זכויותיך</h2>
                <p>בהתאם לחוק הגנת הפרטיות, עומדות לך הזכויות הבאות:</p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                    <li><strong className="text-white">זכות עיון:</strong> לעיין במידע האישי שלך השמור אצלנו</li>
                    <li><strong className="text-white">זכות תיקון:</strong> לבקש תיקון מידע שגוי</li>
                    <li><strong className="text-white">זכות מחיקה:</strong> לבקש מחיקת המידע שלך ממאגרנו</li>
                    <li><strong className="text-white">זכות התנגדות:</strong> להתנגד לעיבוד מידע שלך לצורכי שיווק</li>
                </ul>
                <p className="mt-2">למימוש זכויותיך, ניתן לפנות אלינו בדוא"ל: support@bina-app.com. נשיב לפנייתך תוך 30 יום.</p>
            </section>

            <section>
                <h2 className="text-xl font-bold text-white mb-2">10. אבטחת מידע</h2>
                <p>אנו מיישמים אמצעי אבטחה טכניים וארגוניים להגנה על המידע שלך, כולל:</p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                    <li>הצפנת נתונים בהעברה (TLS/SSL)</li>
                    <li>אימות מאובטח באמצעות Google OAuth</li>
                    <li>הגבלת גישה למידע לבעלי הרשאה בלבד</li>
                    <li>כללי אבטחה ברמת מסד הנתונים (Firestore Security Rules)</li>
                </ul>
            </section>

            <section>
                <h2 className="text-xl font-bold text-white mb-2">11. קטינים</h2>
                <p>השירות מיועד גם לתלמידי תיכון. אם את/ה מתחת לגיל 18, אנו ממליצים ליידע הורה או אפוטרופוס על השימוש באפליקציה. לרכישת מנוי נדרשת הסכמת הורה.</p>
            </section>

            <section>
                <h2 className="text-xl font-bold text-white mb-2">12. שינויים במדיניות</h2>
                <p>אנו עשויים לעדכן מדיניות זו מעת לעת. שינויים מהותיים יפורסמו באפליקציה ויישלחו בהתראה מראש.</p>
            </section>

            <section>
                <h2 className="text-xl font-bold text-white mb-2">13. יצירת קשר</h2>
                <p>לכל שאלה בנוגע למדיניות פרטיות זו או למימוש זכויותיך: support@bina-app.com</p>
            </section>
        </>
    );

    return <LegalPage title="מדיניות פרטיות" content={content} icon={Shield} onBack={onBack} />;
};
