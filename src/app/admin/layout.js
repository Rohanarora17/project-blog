'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './admin.module.css';

export default function AdminLayout({ children }) {
    const pathname = usePathname();
    const router = useRouter();

    // Don't show sidebar on login page
    if (pathname === '/admin/login') {
        return children;
    }

    async function handleLogout() {
        await fetch('/api/admin/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'logout' }),
        });
        router.push('/admin/login');
        router.refresh();
    }

    const navItems = [
        { href: '/admin', label: 'Dashboard', icon: '📊' },
        { href: '/admin/posts', label: 'Posts', icon: '📝' },
        { href: '/admin/posts/new', label: 'New Post', icon: '✍️' },
        { href: '/admin/subscribers', label: 'Subscribers', icon: '👥' },
    ];

    return (
        <div className={styles.layout}>
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <Link href="/" className={styles.brand}>
                        <span className={styles.brandIcon}>⚙️</span>
                        <span className={styles.brandText}>Admin</span>
                    </Link>
                </div>

                <nav className={styles.nav}>
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${styles.navItem} ${pathname === item.href ? styles.navItemActive : ''
                                }`}
                        >
                            <span className={styles.navIcon}>{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className={styles.sidebarFooter}>
                    <Link href="/" className={styles.viewSite}>
                        ↗ View Site
                    </Link>
                    <button onClick={handleLogout} className={styles.logoutBtn}>
                        Sign Out
                    </button>
                </div>
            </aside>

            <main className={styles.main}>{children}</main>
        </div>
    );
}
