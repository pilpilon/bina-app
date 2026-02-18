// Bina App - Service Worker for Push Notifications
const CACHE_NAME = 'bina-v1';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'Bina 📚';
    const options = {
        body: data.body || 'זמן ללמוד!',
        icon: data.icon || '/icon-192.png',
        badge: '/icon-192.png',
        tag: data.tag || 'bina-reminder',
        renotify: true,
        requireInteraction: false,
        data: { url: data.url || '/' },
        actions: [
            { action: 'open', title: 'פתח את Bina 🚀' },
            { action: 'dismiss', title: 'אחר כך' }
        ]
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'dismiss') return;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});

// Handle scheduled notification messages from the main thread
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
        const { title, body, tag } = event.data;
        self.registration.showNotification(title, {
            body,
            icon: '/icon-192.png',
            tag: tag || 'bina-reminder',
            renotify: true,
        });
    }
});
