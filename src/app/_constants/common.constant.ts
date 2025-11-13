export const LOADER_URL_PATTERNS = [
  '/dev/',
  '/api/',
  'services/',
  'permissions',
];
export const SKIP_GLOBAL_LOADER_HEADER = '--skip-global-loader';

export const INACTIVITY_EXCLUSION_ROUTES = [
  '/logged-out',
  '/sign-in',
  '/auth-callback',
];

export const INACTIVITY_CHECK_INTERVAL = 10 * 60 * 1000; // 10 minutes
export const INACTIVITY_TIMER_DURATION = 10 * 60 * 1000; // 10 minutes

// HTTP Cache Headers
export const CACHE_HEADERS = {
  NO_CACHE: 'X-WIPO-Cache-Control',
  CACHE_TTL: 'X-WIPO-Cache-TTL',
  CACHE_INVALIDATE: 'X-WIPO-Cache-Invalidate',
} as const;

/**
 * Routes that handle their own navigation flow and should not be interrupted
 * by the Hub listener's automatic navigation after sign-in
 */
export const AUTH_FLOW_ROUTES = [
  '/auth-callback',
  '/cognito-sync',
  '/platform-selection',
  '/mfa-registration',
] as const;
