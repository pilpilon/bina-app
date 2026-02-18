import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';

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
const googleProvider = new GoogleAuthProvider();

// Configure provider
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

export { auth, db, googleProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, doc, setDoc, getDoc, onSnapshot };

export const signInWithGoogle = async () => {
    try {
        // Switching to redirect for better compatibility with COOP policies on Vercel
        await signInWithRedirect(auth, googleProvider);
    } catch (error: any) {
        console.error("Error initiating Google sign-in", error);
        alert('שגיאה בגישה ל-Google: ' + error.message);
        throw error;
    }
};

export const firebaseLogout = () => signOut(auth);
export const logout = () => signOut(auth);
