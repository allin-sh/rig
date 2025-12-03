const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export const COOKIES = {
  LEFT_PANEL_OPEN: 'left_panel_open',
} as const;

type CookieName = (typeof COOKIES)[keyof typeof COOKIES];

export const setCookie = (
  name: CookieName,
  value: string,
  maxAge: number = COOKIE_MAX_AGE,
) => {
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}`;
};
