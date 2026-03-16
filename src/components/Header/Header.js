import React from 'react';
import dynamic from 'next/dynamic';
import clsx from 'clsx';
import { Rss, Lock } from 'react-feather';

import Logo from '@/components/Logo';
import VisuallyHidden from '@/components/VisuallyHidden';

import styles from './Header.module.css';

const ToggleTheme = dynamic(() => import('../ToggleTheme'), {
  ssr: false,
  loading: () => (
    <span
      className={styles.action}
      aria-hidden="true"
      style={{ display: 'inline-block', width: '2.5rem', height: '2.5rem' }}
    />
  ),
});

function Header({ className, ...delegated }) {
  return (
    <header
      className={clsx(styles.wrapper, className)}
      {...delegated}
    >
      <Logo />

      <div className={styles.actions}>
        <a href="/rss.xml" className={styles.action}>
          <Rss
            size="1.5rem"
            style={{
              // Optical alignment
              transform: 'translate(2px, -2px)',
            }}
          />
          <VisuallyHidden>
            View RSS feed
          </VisuallyHidden>
        </a>
        <ToggleTheme />
        <a href="/admin" className={styles.action} title="Admin">
          <Lock size="1.25rem" />
          <VisuallyHidden>
            Admin login
          </VisuallyHidden>
        </a>
      </div>
    </header>
  );
}

export default Header;
