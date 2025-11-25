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

/// Retry Interceptor Constants
export const DEFAULT_MAX_RETRIES = 3;
export const DEFAULT_RETRY_DELAY = 1000; // 1 second in milliseconds
export const DEFAULT_EXPONENTIAL_BACKOFF = true;
export const RETRYABLE_STATUS_CODES = [500, 502, 503, 504]; // Server errors
export const NON_RETRYABLE_STATUS_CODES = [400, 401, 403, 404, 422]; // Client errors that shouldn't be retried
export const SKIP_RETRY_HEADER = 'X-WIPO-Skip-Retry';
export const CUSTOM_RETRY_COUNT_HEADER = 'X-WIPO-Retry-Count';
export const CUSTOM_RETRY_DELAY_HEADER = 'X-WIPO-Retry-Delay';

//Auth token
export const SKIP_AUTHORIZATION_TOKEN_HEADER = 'X-WIPO-Skip-Auth-token';
export const AUTH_SKIP_ENDPOINTS: string[] = [
  'data-services',
  'distribution-rules',
];
