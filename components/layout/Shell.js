'use client';
import { useAuth } from '@/lib/auth-context';
import Sidebar from './Sidebar';
import styles from './Layout.module.css';
import LoginScreen from '@/components/auth/LoginScreen';

export default function Shell({ children }) {
    const { currentUser, loading } = useAuth();

    // Loading Screen
    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <h2 className="text-xl font-bold text-gray-700 mb-2">Cargando Sesión...</h2>
                <p className="text-gray-500 text-sm">Verificando credenciales de acceso</p>
            </div>
        </div>
    );

    // Debug logging
    if (typeof window !== 'undefined') {
        console.log("Shell Render: User is", currentUser ? currentUser.email : "null");
    }

    if (!currentUser) return <LoginScreen />;

    return (
        <div className="flex">
            <Sidebar />
            <main className={styles.main} style={{ flex: 1, width: '100%' }}>
                {children}
            </main>
        </div>
    );
}
