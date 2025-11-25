import { environment } from '../environments/environment';

/**
 * Logger utility that respects the environment's enableLogging configuration
 * Logging can be enabled/disabled per environment by setting enableLogging in environment files
 */
class Logger {
  /**
   * Check if logging is enabled for the current environment
   */
  private isLoggingEnabled(): boolean {
    // Default to false if enableLogging is not explicitly set
    return environment.enableLogging === true;
  }

  /**
   * Log a message (only if logging is enabled)
   */
  log(...args: any[]): void {
    if (this.isLoggingEnabled()) {
      console.log(...args);
    }
  }

  /**
   * Log an error (only if logging is enabled)
   */
  error(...args: any[]): void {
    if (this.isLoggingEnabled()) {
      console.error(...args);
    }
  }

  /**
   * Log a warning (only if logging is enabled)
   */
  warn(...args: any[]): void {
    if (this.isLoggingEnabled()) {
      console.warn(...args);
    }
  }

  /**
   * Log a debug message (only if logging is enabled)
   */
  debug(...args: any[]): void {
    if (this.isLoggingEnabled()) {
      console.debug(...args);
    }
  }

  /**
   * Log an info message (only if logging is enabled)
   */
  info(...args: any[]): void {
    if (this.isLoggingEnabled()) {
      console.info(...args);
    }
  }

  /**
   * Check if logging is currently enabled (useful for conditional logic)
   */
  get enabled(): boolean {
    return this.isLoggingEnabled();
  }
}

// Export a singleton instance
export const logger = new Logger();
