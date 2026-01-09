'use client';
import { createContext, useContext, useState } from 'react';
import { getAllUsers } from './data';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);

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

    const logout = () => setCurrentUser(null);

    return (
        <AuthContext.Provider value={{ currentUser, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
