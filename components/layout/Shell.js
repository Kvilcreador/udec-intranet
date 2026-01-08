'use client';
import { useAuth } from '@/lib/auth-context';
import Sidebar from './Sidebar';
import styles from './Layout.module.css';
import LoginScreen from '@/components/auth/LoginScreen';

export default function Shell({ children }) {
    const { currentUser } = useAuth();

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
