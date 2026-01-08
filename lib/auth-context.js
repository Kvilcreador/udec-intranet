'use client';
import { createContext, useContext, useState } from 'react';
import { getAllUsers } from './data';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);

    const login = (email) => {
        const users = getAllUsers();
        const user = users.find(u => u.email === email);
        if (user) setCurrentUser(user);
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
