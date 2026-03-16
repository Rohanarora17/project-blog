export const THEME_COOKIE_NAME = 'color-theme';
export const DEFAULT_THEME = 'dark';

export const THEME_INIT_SCRIPT = `
(() => {
  const COOKIE_NAME = '${THEME_COOKIE_NAME}';
  const DEFAULT_THEME = '${DEFAULT_THEME}';

  const getCookieTheme = () => {
    const match = document.cookie.match(new RegExp('(?:^|; )' + COOKIE_NAME + '=([^;]+)'));
    return match ? decodeURIComponent(match[1]) : null;
  };

  const getPreferredTheme = () => {
    const savedTheme = localStorage.getItem(COOKIE_NAME) || getCookieTheme();
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }

    if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }

    return DEFAULT_THEME;
  };

  const theme = getPreferredTheme();
  document.documentElement.setAttribute('data-color-theme', theme);
})();
`;
