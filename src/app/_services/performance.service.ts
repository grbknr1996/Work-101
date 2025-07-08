import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of } from "rxjs";
import { delay, tap, shareReplay } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class PerformanceService {
  private cache = new Map<string, any>();
  private loadingStates = new BehaviorSubject<Map<string, boolean>>(new Map());

  /**
   * Lazy load data with caching
   */
  lazyLoad<T>(
    key: string,
    loader: () => Observable<T>,
    ttl: number = 300000
  ): Observable<T> {
    const cached = this.cache.get(key);
    const now = Date.now();

    if (cached && now - cached.timestamp < ttl) {
      return of(cached.data);
    }

    this.setLoadingState(key, true);

    return loader().pipe(
      tap((data) => {
        this.cache.set(key, { data, timestamp: now });
        this.setLoadingState(key, false);
      }),
      shareReplay(1)
    );
  }

  /**
   * Clear cache for specific key or all cache
   */
  clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Get loading state for a specific operation
   */
  getLoadingState(key: string): Observable<boolean> {
    return new Observable((observer) => {
      const subscription = this.loadingStates.subscribe((states) => {
        observer.next(states.get(key) || false);
      });
      return () => subscription.unsubscribe();
    });
  }

  /**
   * Set loading state for a specific operation
   */
  private setLoadingState(key: string, loading: boolean): void {
    const currentStates = this.loadingStates.value;
    currentStates.set(key, loading);
    this.loadingStates.next(new Map(currentStates));
  }

  /**
   * Debounce function calls
   */
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  /**
   * Throttle function calls
   */
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  /**
   * Preload critical resources
   */
  preloadResources(resources: string[]): void {
    resources.forEach((resource) => {
      if (resource.endsWith(".css")) {
        this.preloadCSS(resource);
      } else if (resource.endsWith(".js")) {
        this.preloadJS(resource);
      } else {
        this.preloadImage(resource);
      }
    });
  }

  private preloadCSS(href: string): void {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "style";
    link.href = href;
    document.head.appendChild(link);
  }

  private preloadJS(src: string): void {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "script";
    link.href = src;
    document.head.appendChild(link);
  }

  private preloadImage(src: string): void {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = src;
    document.head.appendChild(link);
  }

  /**
   * Optimize images
   */
  optimizeImage(src: string, width?: number, height?: number): string {
    // Add image optimization parameters
    const url = new URL(src, window.location.origin);
    if (width) url.searchParams.set("w", width.toString());
    if (height) url.searchParams.set("h", height.toString());
    url.searchParams.set("q", "85"); // Quality
    url.searchParams.set("f", "auto"); // Format
    return url.toString();
  }

  /**
   * Track performance metrics
   */
  trackPerformance(metric: string, value: number): void {
    if (typeof window !== "undefined" && "performance" in window) {
      performance.mark(`${metric}-start`);
      performance.measure(metric, `${metric}-start`);

      // Log to console in development
      if (value > 100) {
        // Threshold for slow operations
        console.warn(`Performance warning: ${metric} took ${value}ms`);
      }
    }
  }
}
