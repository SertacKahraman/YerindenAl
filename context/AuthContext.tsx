import { createUserWithEmailAndPassword, signOut as fbSignOut, updateProfile as fbUpdateProfile, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../config/firebase';

interface User {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    phone?: string;
    location?: string;
    photoURL?: string;
    joinDate?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, firstName: string, lastName: string, phone?: string) => Promise<void>;
    signOut: () => Promise<void>;
    updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Firestore'dan kullanıcıyı çek
                const userRef = doc(db, 'users', firebaseUser.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    setUser(userSnap.data() as User);
                } else {
                    setUser({
                        id: firebaseUser.uid,
                        email: firebaseUser.email || '',
                        name: firebaseUser.displayName || '',
                        photoURL: firebaseUser.photoURL || '',
                        joinDate: firebaseUser.metadata.creationTime || ''
                    });
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const signIn = async (email: string, password: string) => {
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const signUp = async (email: string, password: string, firstName: string, lastName: string, phone?: string) => {
        setLoading(true);
        try {
            const cred = await createUserWithEmailAndPassword(auth, email, password);
            if (auth.currentUser) {
                await fbUpdateProfile(auth.currentUser, { displayName: `${firstName} ${lastName}` });
                // Firestore'a kullanıcıyı ekle
                await setDoc(doc(db, 'users', auth.currentUser.uid), {
                    id: auth.currentUser.uid,
                    email: auth.currentUser.email,
                    firstName,
                    lastName,
                    phone: phone || '',
                    joinDate: new Date().toISOString()
                });
            }
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        setLoading(true);
        try {
            await fbSignOut(auth);
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async (data: Partial<User>) => {
        if (auth.currentUser) {
            const profileUpdate: { displayName?: string; photoURL?: string } = {};
            if (data.name) {
                profileUpdate.displayName = data.name;
            }
            if (data.photoURL) {
                profileUpdate.photoURL = data.photoURL;
            }

            if (Object.keys(profileUpdate).length > 0) {
                await fbUpdateProfile(auth.currentUser, profileUpdate);
            }

            setUser((prev) => (prev ? { ...prev, ...data } : prev));

            await setDoc(doc(db, 'users', auth.currentUser.uid), data, { merge: true });
        }
    };

    const value = {
        user,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
} 