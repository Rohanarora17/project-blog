'use client';
import React from 'react';
import { Sun, Moon } from 'react-feather';
import Cookie from 'js-cookie';

import { LIGHT_TOKENS, DARK_TOKENS } from '@/constants';
import VisuallyHidden from '@/components/VisuallyHidden';

import styles from  '../Header/Header.module.css';

function ToggleTheme({ initialTheme }) {
  const [theme, setTheme] = React.useState(initialTheme);

  function handleClick() {
    const nextTheme = theme === 'light' ? 'dark' : 'light';

    
    setTheme(nextTheme);

    
    Cookie.set('color-theme', nextTheme, {
      expires: 1000,
    });

    
    const root = document.documentElement;
    const colors = nextTheme === 'light' ? LIGHT_TOKENS : DARK_TOKENS;

    
    root.setAttribute('data-color-theme', nextTheme);

  
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }

  return (
    <button className={styles.action} onClick={handleClick}>
      {theme === 'light' ? (
        <Sun size="1.5rem" />
      ) : (
        <Moon size="1.5rem" />
      )}
      <VisuallyHidden>Toggle dark / light mode</VisuallyHidden>
    </button>
  );
}

export default ToggleTheme;