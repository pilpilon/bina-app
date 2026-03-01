import { db } from '../utils/firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';

export interface SRSItem {
    id: string; // word or question ID
    topic: string; // 'vocabulary', 'english', etc.
    level: number; // Leitner box (0-5)
    nextReviewDate: string; // ISO date string
    easeFactor: number; // SM-2 ease factor (default 2.5)
    consecutiveCorrect: number;
    lastReviewed: string | null;
}

/**
 * SuperMemo-2 (SM-2) inspired SRS calculation.
 * @param item Current SRS state of the item
 * @param quality 0-5 scale of how well the user knew it (0 = complete blackout, 5 = perfect)
 */
export const calculateNextReview = (item: Partial<SRSItem>, quality: number): Partial<SRSItem> => {
    let easeFactor = item.easeFactor ?? 2.5;
    let consecutiveCorrect = item.consecutiveCorrect ?? 0;

    // Quality < 3 means incorrect/stumbled
    if (quality < 3) {
        consecutiveCorrect = 0;
    } else {
        consecutiveCorrect += 1;
    }

    // Update ease factor: EF' = EF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (easeFactor < 1.3) easeFactor = 1.3;

    // Calculate next interval in days
    let interval = 1;
    if (consecutiveCorrect === 0) {
        interval = 0; // Review same day or tomorrow
    } else if (consecutiveCorrect === 1) {
        interval = 1;
    } else if (consecutiveCorrect === 2) {
        interval = 6;
    } else {
        // We use 1 interval default if item interval was missing
        interval = Math.round((item.consecutiveCorrect === 2 ? 6 : Math.max(1, (consecutiveCorrect - 1) * easeFactor)) * easeFactor);
    }

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + interval);

    return {
        easeFactor,
        consecutiveCorrect,
        nextReviewDate: nextDate.toISOString().split('T')[0],
        level: Math.min(consecutiveCorrect, 5),
        lastReviewed: new Date().toISOString()
    };
};

// Fallback to local storage if user is not logged in
const getLocalSRS = (): Record<string, SRSItem> => {
    const data = localStorage.getItem('bina_srs_data');
    return data ? JSON.parse(data) : {};
};

const saveLocalSRS = (data: Record<string, SRSItem>) => {
    localStorage.setItem('bina_srs_data', JSON.stringify(data));
};

export const updateItemSRS = async (userId: string | null | undefined, itemId: string, topic: string, quality: number) => {
    let currentItem: Partial<SRSItem> = { id: itemId, topic };

    if (userId && window.navigator.onLine) {
        const docRef = doc(db, 'users', userId, 'srs', itemId);
        try {
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                currentItem = { ...currentItem, ...docSnap.data() };
            }
        } catch (e: any) {
            if (e?.code !== 'permission-denied') console.warn("Firebase fetch failed, using local SRS data.", e);
            const localData = getLocalSRS();
            if (localData[itemId]) {
                currentItem = { ...currentItem, ...localData[itemId] };
            }
        }
    } else {
        const localData = getLocalSRS();
        if (localData[itemId]) {
            currentItem = { ...currentItem, ...localData[itemId] };
        }
    }

    const updatedStats = calculateNextReview(currentItem, quality);
    const finalItem = { ...currentItem, ...updatedStats } as SRSItem;

    if (userId && window.navigator.onLine) {
        const docRef = doc(db, 'users', userId, 'srs', itemId);
        try {
            await setDoc(docRef, finalItem, { merge: true });
        } catch (e) {
            console.warn("Failed to save SRS to Firebase, saving locally.", e);
        }
    }

    // Always keep local storage updated as a backup
    const localData = getLocalSRS();
    localData[itemId] = finalItem;
    saveLocalSRS(localData);

    return finalItem;
};

/**
 * Returns a list of item IDs that are due for review today or earlier.
 */
export const getDueItems = async (userId: string | null | undefined, topic?: string): Promise<string[]> => {
    const today = new Date().toISOString().split('T')[0];

    if (userId && window.navigator.onLine) {
        try {
            const srsRef = collection(db, 'users', userId, 'srs');
            let q = query(srsRef, where("nextReviewDate", "<=", today));
            if (topic) {
                q = query(srsRef, where("nextReviewDate", "<=", today), where("topic", "==", topic));
            }
            const snap = await getDocs(q);
            return snap.docs.map(doc => doc.id);
        } catch (e: any) {
            if (e?.code !== 'permission-denied') console.warn("Failed to fetch due items from Firebase, falling back to local.", e);
        }
    }

    const localData = getLocalSRS();
    return Object.values(localData)
        .filter(item => item.nextReviewDate <= today && (!topic || item.topic === topic))
        .map(item => item.id);
};

/**
 * Returns a map of topic -> counts of items due
 */
export const getDueItemsCountByTopic = async (userId: string | null | undefined): Promise<Record<string, number>> => {
    const today = new Date().toISOString().split('T')[0];
    const counts: Record<string, number> = {};

    if (userId && window.navigator.onLine) {
        try {
            const srsRef = collection(db, 'users', userId, 'srs');
            const q = query(srsRef, where("nextReviewDate", "<=", today));
            const snap = await getDocs(q);
            snap.forEach(doc => {
                const topic = doc.data().topic;
                counts[topic] = (counts[topic] || 0) + 1;
            });
            return counts;
        } catch (e: any) {
            if (e?.code !== 'permission-denied') console.warn("Failed to fetch due item counts, using local.", e);
        }
    }

    const localData = getLocalSRS();
    Object.values(localData).forEach(item => {
        if (item.nextReviewDate <= today) {
            counts[item.topic] = (counts[item.topic] || 0) + 1;
        }
    });

    return counts;
};
