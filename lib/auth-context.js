'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { getAllUsers } from './data';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initial Auth Check
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                login(user);
            } else {
                setCurrentUser(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const login = (userOrEmail) => {
        let email = typeof userOrEmail === 'string' ? userOrEmail : userOrEmail.email;
        const users = getAllUsers();
        let internalUser = users.find(u => u.email === email);

        if (!internalUser) {
            // Allow unknown users as Guests
            internalUser = {
                email: email,
                name: typeof userOrEmail === 'object' ? userOrEmail.displayName : email.split('@')[0],
                role: 'viewer', // Read-only or limited access
                area: 'ALL'
            };
        }

        setCurrentUser(internalUser);
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Logout Error:", error);
        }
        setCurrentUser(null);
    };

    return (
        <AuthContext.Provider value={{ currentUser, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
