import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { filter } from 'rxjs/operators';
import { MechanicsService } from 'src/app/_services/mechanics.service';
import { Subscription } from 'rxjs';

interface BreadcrumbItem extends MenuItem {
  routerLink?: any[] | string;
  label: string;
}

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  standalone: false,
})
export class BreadcrumbsComponent implements OnInit, OnDestroy {
  @Input() home: MenuItem = { icon: 'pi pi-home', routerLink: '/' };
  @Input() items: BreadcrumbItem[] = [];
  @Input() styleClass: string = '';

  // When true, breadcrumbs will be generated automatically from the current route
  @Input() autoGenerate: boolean = false;

  private officeSubscription: Subscription | null = null;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public ms: MechanicsService
  ) {}

  ngOnInit(): void {
    this.updateHomeItem();

    // Subscribe to current office changes to update home breadcrumb
    this.officeSubscription = this.ms.currentOffice$.subscribe((officeCode) => {
      this.updateHomeItem();
      if (this.autoGenerate) {
        this.items = this.createBreadcrumbs(this.activatedRoute.root);
      }
    });

    if (this.autoGenerate) {
      this.router.events
        .pipe(filter((event) => event instanceof NavigationEnd))
        .subscribe(() => {
          this.items = this.createBreadcrumbs(this.activatedRoute.root);
        });

      // Initialize breadcrumbs on component init
      this.items = this.createBreadcrumbs(this.activatedRoute.root);
    }
  }

  ngOnDestroy(): void {
    if (this.officeSubscription) {
      this.officeSubscription.unsubscribe();
    }
  }

  private updateHomeItem(): void {
    const officeCode = this.ms.getCurrentOffice() || 'default';
    const defaultLang = this.ms.lang || this.ms.getDefaultLanguage() || 'en';
    this.home = {
      icon: 'pi pi-home',
      label: `${officeCode}`,
      routerLink: `/${officeCode}/${defaultLang}/dashboard`,
    };
  }

  private createBreadcrumbs(
    route: ActivatedRoute,
    url: string = '',
    breadcrumbs: BreadcrumbItem[] = []
  ): BreadcrumbItem[] {
    const children: ActivatedRoute[] = route.children;

    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      const routeURL: string = child.snapshot.url
        .map((segment) => segment.path)
        .join('/');
      if (routeURL !== '') {
        url += `/${routeURL}`;
      }

      const label = child.snapshot.data['breadcrumb'];
      if (label) {
        breadcrumbs.push({
          label,
          routerLink: url,
        });
      }

      return this.createBreadcrumbs(child, url, breadcrumbs);
    }

    return breadcrumbs;
  }
}
