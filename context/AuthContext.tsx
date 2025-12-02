import { createUserWithEmailAndPassword, signOut as fbSignOut, updateProfile as fbUpdateProfile, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../config/firebase';

import { User } from '../types';

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
                    // Split display name into first and last name if possible
                    const displayName = firebaseUser.displayName || '';
                    const parts = displayName.split(' ');
                    const firstName = parts[0] || '';
                    const lastName = parts.slice(1).join(' ') || '';

                    setUser({
                        id: firebaseUser.uid,
                        email: firebaseUser.email || '',
                        firstName: firstName,
                        lastName: lastName,
                        photoURL: firebaseUser.photoURL || '',
                        // joinDate is not in User type in types/index.ts, but createdAt is.
                        // We should probably map it or ignore it if strict.
                        // Let's assume User type has createdAt.
                        createdAt: firebaseUser.metadata.creationTime || ''
                    } as User);
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
                const newUser: User = {
                    id: auth.currentUser.uid,
                    email: auth.currentUser.email || '',
                    firstName,
                    lastName,
                    phone: phone || '',
                    createdAt: new Date().toISOString(),
                    role: 'USER' // Default role
                };
                await setDoc(doc(db, 'users', auth.currentUser.uid), newUser);
                setUser(newUser);
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

            // Construct display name if firstName or lastName is updated
            if (data.firstName || data.lastName) {
                const currentFirst = data.firstName || user?.firstName || '';
                const currentLast = data.lastName || user?.lastName || '';
                profileUpdate.displayName = `${currentFirst} ${currentLast}`.trim();
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