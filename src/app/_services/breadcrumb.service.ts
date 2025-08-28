import { Injectable } from '@angular/core';
import { MechanicsService } from './mechanics.service';

export interface BreadcrumbItem {
  label: string;
  url?: string;
  icon?: string;
}

@Injectable({
  providedIn: 'root',
})
export class BreadcrumbService {
  private breadcrumbs: BreadcrumbItem[] = [];

  constructor(private mechanicsService: MechanicsService) {}

  getBreadcrumbs(): BreadcrumbItem[] {
    return this.breadcrumbs;
  }

  setBreadcrumbs(items: BreadcrumbItem[]): void {
    this.breadcrumbs = items;
  }

  addBreadcrumb(item: BreadcrumbItem): void {
    this.breadcrumbs.push(item);
  }

  clearBreadcrumbs(): void {
    this.breadcrumbs = [];
  }

  getOfficeInfo(): { name: string; logo: string } {
    const effectiveOffice = this.mechanicsService.getCurrentOffice();
    const officeConfig = this.mechanicsService.getOfficeConfig(effectiveOffice);

    return {
      name: officeConfig?.name,
      logo: officeConfig?.logo,
    };
  }
}
