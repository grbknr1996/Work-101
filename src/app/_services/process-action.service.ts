import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map, shareReplay, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { logger } from '../logger';
import { handleError } from '../utils';
import { ToastService } from './toast.service';
import { MechanicsService } from './mechanics.service';

export interface ProcessType {
  id: string;
  map: { [key: string]: string };
}

export interface ProcessAction {
  actionType: string;
  actionTypeGroup: string | null;
  actionTypeName: string;
  processType: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProcessActionService {
  // Cache for process types
  private processTypesCache$: Observable<ProcessType> | null = null;

  // Cache for grouped actions
  private groupedActionsCache$: Observable<{
    [processType: string]: ProcessAction[];
  }> | null = null;

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
    private ms: MechanicsService
  ) {}

  /**
   * Get process types from the configuration API
   * Based on API endpoint: {{configUrl}}/configurations/process-category/process-types
   * Uses caching to prevent duplicate API calls
   */
  getProcessTypes(): Observable<ProcessType> {
    // Return cached observable if it exists
    if (this.processTypesCache$) {
      logger.log('Returning cached process types');
      return this.processTypesCache$;
    }

    logger.log('Fetching process types from API...');
    const configUrl = `${environment.configUrl}/configurations/process-category/process-types`;

    this.processTypesCache$ = this.http.get<ProcessType>(configUrl).pipe(
      map((response) => {
        logger.log('Process types response received:', response);
        return response;
      }),
      catchError((error) =>
        handleError(error, 'Loading process types', this.toastService, this.ms)
      ),
      shareReplay(1) // Cache the result and share it with all subscribers
    );

    return this.processTypesCache$;
  }

  /**
   * Get process actions from the configuration API
   * Based on API endpoint: {{configUrl}}/configurations/process-category/process-types/action-types
   */
  getProcessActions(): Observable<ProcessAction[]> {
    const configUrl = `${environment.configUrl}/configurations/process-category/process-types/action-types`;

    return this.http.get<ProcessAction[]>(configUrl).pipe(
      map((response) => {
        logger.log('Process actions response received:', response);
        return response;
      }),
      catchError((error) =>
        handleError(
          error,
          'Loading process actions',
          this.toastService,
          this.ms
        )
      )
    );
  }

  /**
   * Get grouped actions by process type
   * Uses caching to prevent duplicate API calls
   */
  getGroupedActions(): Observable<{ [processType: string]: ProcessAction[] }> {
    // Return cached observable if it exists
    if (this.groupedActionsCache$) {
      logger.log('Returning cached grouped actions');
      return this.groupedActionsCache$;
    }

    logger.log('Fetching grouped actions from API...');
    this.groupedActionsCache$ = this.getProcessActions().pipe(
      map((actions) => {
        const grouped: { [processType: string]: ProcessAction[] } = {};
        actions.forEach((action) => {
          // Handle null or empty process types
          const processType = action.processType || 'null';
          if (!grouped[processType]) {
            grouped[processType] = [];
          }
          grouped[processType].push(action);
        });
        logger.log('Grouped actions processed:', grouped);
        return grouped;
      }),
      shareReplay(1) // Cache the result and share it with all subscribers
    );

    return this.groupedActionsCache$;
  }

  /**
   * Clear the cache for process types and grouped actions
   * Useful when data needs to be refreshed
   */
  clearCache(): void {
    logger.log('Clearing process action service cache');
    this.processTypesCache$ = null;
    this.groupedActionsCache$ = null;
  }
}
