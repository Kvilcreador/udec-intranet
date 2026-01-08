'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import styles from './Layout.module.css';

export default function Sidebar() {
    const pathname = usePathname();
    const { currentUser, login, logout } = useAuth();

    const handleSwitchUser = () => {
        if (currentUser?.role === 'admin') {
            login('etorres2016@udec.cl');
        } else {
            login('jourzua@udec.cl');
        }
    };

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logo}>
                <div className={styles.brandIcon} />
                <span>UDEC GESTIÓN</span>
            </div>

            <nav className={styles.nav}>
                <Link href="/dashboard" className={`${styles.navItem} ${pathname === '/dashboard' ? styles.navItemActive : ''}`}>
                    Dashboard
                </Link>
                <Link href="/referrals" className={`${styles.navItem} ${pathname.includes('referrals') ? styles.navItemActive : ''}`}>
                    Derivaciones
                </Link>
            </nav>

            <div className={styles.user}>
                <div className={styles.avatar}>
                    {currentUser?.name?.charAt(0) || 'U'}
                </div>
                <div className={styles.userInfo}>
                    <span className="text-sm font-bold">{currentUser?.name || 'Guest'}</span>
                    <span className={styles.role}>{currentUser?.role || 'No Access'}</span>
                    <button
                        onClick={handleSwitchUser}
                        className="text-sm text-blue-600 hover:underline"
                        style={{ fontSize: '0.7rem', marginTop: '0.2rem', cursor: 'pointer', border: 'none', background: 'none', textAlign: 'left', padding: 0, color: 'hsl(var(--primary))' }}
                    >
                        ⟳ Cambiar Rol
                    </button>
                </div>
            </div>
        </aside>
    );
}
