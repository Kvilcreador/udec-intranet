'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import styles from './Layout.module.css';

export default function Sidebar() {
    const pathname = usePathname();
    const { currentUser, login, logout } = useAuth(); // Ensure logout is destructured if available

    // Helper to simulate logout in this simple version
    const handleLogout = () => {
        // If logout function exists in context use it, otherwise reload
        if (logout) logout();
        else window.location.reload();
    };

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logo}>
                <div className={styles.brandIcon} />
                <div className="flex flex-col">
                    <span className="leading-tight">UDEC</span>
                    <span className="text-xs font-normal opacity-70">GESTIÓN INTEGRAL</span>
                </div>
            </div>

            <nav className={styles.nav}>
                <Link href="/" className={`${styles.navItem} ${pathname === '/' ? styles.navItemActive : ''}`}>
                    Dashboard
                </Link>
                {/* Placeholder for future module */}
                <div className={`${styles.navItem} opacity-50 cursor-not-allowed`} title="Próximamente">
                    Derivaciones
                </div>
            </nav>

            <div className={styles.user}>
                <div className={styles.avatar}>
                    {currentUser?.name?.charAt(0) || 'U'}
                </div>
                <div className={styles.userInfo}>
                    <span className="text-sm font-bold truncate max-w-[120px]" title={currentUser?.name}>
                        {currentUser?.name || 'Guest'}
                    </span>
                    <span className={styles.role}>{currentUser?.role || 'No Access'}</span>

                    <button
                        onClick={handleLogout}
                        className="text-xs text-red-500 hover:text-red-700 hover:underline mt-1 text-left flex items-center gap-1"
                    >
                        ← Cerrar Sesión
                    </button>

                    {/* Dev Tool: Hidden or kept small */}
                    {/* <button onClick={() => login(currentUser.role==='admin'?'etorres2016@udec.cl':'jourzua@udec.cl')} className="opacity-0">.</button> */}
                </div>
            </div>
        </aside>
    );
}
