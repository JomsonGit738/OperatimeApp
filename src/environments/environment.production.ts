export const environment = {
  production: true,
  // Netlify proxies /api to Render, keeping the HttpOnly cookie same-origin.
  apiBaseUrl: '/api',
  googleClientId:
    '230963712555-9tre1716lgj5bfbhptgqabudab3jjqnf.apps.googleusercontent.com',
} as const;
