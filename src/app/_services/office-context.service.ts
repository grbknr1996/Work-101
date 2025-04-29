import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { configuration } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OfficeContextService {
  // Default office code
  private defaultOffice: string = 'default';

  // BehaviorSubject to track the current office code
  private currentOfficeSubject: BehaviorSubject<string> =
    new BehaviorSubject<string>(this.defaultOffice);

  // Observable of the current office that components can subscribe to
  public currentOffice$: Observable<string> =
    this.currentOfficeSubject.asObservable();

  constructor() {}

  /**
   * Get the current office code
   */
  public getCurrentOffice(): string {
    return this.currentOfficeSubject.value;
  }

  /**
   * Set the current office code
   * This should be called after login or during application initialization
   */
  public setCurrentOffice(officeCode: string): void {
    // Validate that the office exists in our configuration
    if (configuration[officeCode]) {
      this.currentOfficeSubject.next(officeCode);
    } else {
      console.warn(
        `Office code '${officeCode}' not found in configuration, using default`
      );
      this.currentOfficeSubject.next(this.defaultOffice);
    }
  }

  /**
   * Reset to default office
   * This should be called during logout
   */
  public resetOffice(): void {
    this.currentOfficeSubject.next(this.defaultOffice);
  }

  /**
   * Get the configuration for the current office
   */
  public getCurrentOfficeConfig(): any {
    return configuration[this.getCurrentOffice()];
  }

  /**
   * Get the default language for the current office
   */
  public getDefaultLanguage(): string {
    const officeConfig = this.getCurrentOfficeConfig();
    return officeConfig?.defaultLanguage || 'en';
  }

  /**
   * Get the default landing module for the current office
   */
  public getDefaultLandingModule(): string {
    const officeConfig = this.getCurrentOfficeConfig();
    return officeConfig?.defaultLandingModule || 'dashboard';
  }
}
