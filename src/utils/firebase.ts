import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, onSnapshot, enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAJzVWTH_-N-2meQ2ck7O1ah0cUJUPR4TY",
    authDomain: "bina-app-9ab6c.firebaseapp.com",
    projectId: "bina-app-9ab6c",
    storageBucket: "bina-app-9ab6c.firebasestorage.app",
    messagingSenderId: "452193156998",
    appId: "1:452193156998:web:01b0ddcf4d5bedb7ebb607"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') {
        console.warn('Persistence failed: Multiple tabs open');
    } else if (err.code == 'unimplemented') {
        console.warn('Persistence not supported by browser');
    }
});
const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({ prompt: 'select_account' });

export { auth, db, googleProvider, signInWithPopup, signOut, doc, setDoc, getDoc, onSnapshot };

export const signInWithGoogle = async () => {
    try {
        // Use popup — more reliable than redirect, works with COOP headers set in vercel.json
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    } catch (error: any) {
        console.error("Error signing in with Google", error);
        if (error.code === 'auth/popup-blocked') {
            alert('הדפדפן חסם את החלון הקופץ. אנא אפשר חלונות קופצים עבור אתר זה.');
        } else if (error.code === 'auth/unauthorized-domain') {
            alert('שגיאה: הדומיין ' + window.location.hostname + ' לא מורשה ב-Firebase Console.');
        } else if (error.code === 'auth/popup-closed-by-user') {
            // User closed the popup — silently ignore
        } else {
            console.error('Google Login Error:', error.code, error.message);
        }
        throw error;
    }
};

export const firebaseLogout = () => signOut(auth);
export const logout = () => signOut(auth);
