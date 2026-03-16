'use client';
import React from 'react';
import { Sun, Moon } from 'react-feather';
import Cookie from 'js-cookie';
import VisuallyHidden from '@/components/VisuallyHidden';
import { DEFAULT_THEME, THEME_COOKIE_NAME } from '@/lib/theme';

import styles from  '../Header/Header.module.css';

function ToggleTheme() {
  const [theme, setTheme] = React.useState(null);

  React.useEffect(() => {
    const root = document.documentElement;
    const activeTheme =
      root.getAttribute('data-color-theme') || DEFAULT_THEME;

    setTheme(activeTheme);
  }, []);

  function handleClick() {
    const resolvedTheme = theme || DEFAULT_THEME;
    const nextTheme = resolvedTheme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    Cookie.set(THEME_COOKIE_NAME, nextTheme, {
      expires: 1000,
    });
    window.localStorage.setItem(THEME_COOKIE_NAME, nextTheme);
    document.documentElement.setAttribute('data-color-theme', nextTheme);
  }

  return (
    <button
      className={styles.action}
      onClick={handleClick}
      aria-label="Toggle dark / light mode"
    >
      {theme === 'light' ? (
        <Sun size="1.5rem" />
      ) : theme === 'dark' ? (
        <Moon size="1.5rem" />
      ) : (
        <span
          aria-hidden="true"
          style={{ display: 'inline-block', width: '1.5rem', height: '1.5rem' }}
        />
      )}
      <VisuallyHidden>Toggle dark / light mode</VisuallyHidden>
    </button>
  );
}

export default ToggleTheme;
