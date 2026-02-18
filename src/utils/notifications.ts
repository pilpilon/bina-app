// Bina Notification Utility
// Handles service worker registration, permission requests, and smart scheduling

export const NOTIF_STORAGE_KEY = 'bina_notifications';

export interface NotificationSettings {
    enabled: boolean;
    reminderTime: string; // "HH:MM" format, e.g. "20:00"
    streakReminder: boolean;
    examCountdown: boolean;
    weakPointsNudge: boolean;
}

export const defaultNotificationSettings: NotificationSettings = {
    enabled: false,
    reminderTime: '20:00',
    streakReminder: true,
    examCountdown: true,
    weakPointsNudge: true,
};

export function loadNotificationSettings(): NotificationSettings {
    try {
        const saved = localStorage.getItem(NOTIF_STORAGE_KEY);
        return saved ? { ...defaultNotificationSettings, ...JSON.parse(saved) } : defaultNotificationSettings;
    } catch {
        return defaultNotificationSettings;
    }
}

export function saveNotificationSettings(settings: NotificationSettings) {
    localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(settings));
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) return null;
    try {
        const reg = await navigator.serviceWorker.register('/sw.js');
        return reg;
    } catch (e) {
        console.warn('SW registration failed:', e);
        return null;
    }
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) return 'denied';
    if (Notification.permission === 'granted') return 'granted';
    if (Notification.permission === 'denied') return 'denied';
    return await Notification.requestPermission();
}

export function getPermissionStatus(): NotificationPermission {
    if (!('Notification' in window)) return 'denied';
    return Notification.permission;
}

export function showTestNotification() {
    if (Notification.permission !== 'granted') return;
    const n = new Notification('Bina 📚 — בדיקת התראה', {
        body: 'מערכת ההתראות פעילה! נתראה בשעת הלמידה 🚀',
        icon: '/icon-192.png',
        tag: 'bina-test',
    });
    setTimeout(() => n.close(), 5000);
}

export function scheduleSmartNotifications(
    settings: NotificationSettings,
    weakPointsCount: number,
    examDate?: string
) {
    // Clear any existing scheduled timers (stored in window)
    const existingTimer = (window as any).__binaNotifTimer;
    if (existingTimer) clearTimeout(existingTimer);

    if (!settings.enabled || Notification.permission !== 'granted') return;

    const [hours, minutes] = settings.reminderTime.split(':').map(Number);
    const now = new Date();
    const target = new Date();
    target.setHours(hours, minutes, 0, 0);

    // If target time has already passed today, schedule for tomorrow
    if (target <= now) {
        target.setDate(target.getDate() + 1);
    }

    const msUntilTarget = target.getTime() - now.getTime();

    const timer = setTimeout(() => {
        // Build smart notification message
        let title = 'Bina 📚 — זמן ללמוד!';
        let body = 'שמור על הרצף שלך — 10 דקות ביום מספיקות!';

        if (settings.examCountdown && examDate) {
            const exam = new Date(examDate);
            const daysLeft = Math.ceil((exam.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            if (daysLeft > 0 && daysLeft <= 60) {
                title = `Bina 📚 — נותרו ${daysLeft} ימים לבחינה!`;
                body = 'כל יום שאתה לומד מקרב אותך ל-800. בוא נתחיל!';
            }
        }

        if (settings.weakPointsNudge && weakPointsCount > 0) {
            body = `יש לך ${weakPointsCount} מילים שצריכות חזרה. בוא נחזק אותן!`;
        }

        new Notification(title, {
            body,
            icon: '/icon-192.png',
            tag: 'bina-daily',
            requireInteraction: false,
        });

        // Reschedule for next day
        scheduleSmartNotifications(settings, weakPointsCount, examDate);
    }, msUntilTarget);

    (window as any).__binaNotifTimer = timer;
}
