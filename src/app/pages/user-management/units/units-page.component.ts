import { Component, OnInit, ViewChild } from '@angular/core';
import { UnitsTreeComponent } from './units-tree/units-tree.component';
import { UnitDetailsComponent } from './units-details/units-details.component';
import { UnitNode } from 'src/app/_services/units.service';
import {
  AppLayoutComponent,
  LayoutConfig,
} from 'src/app/components/app-layout/app-layout.component';
import { CommonModule } from '@angular/common';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { BreadcrumbsComponent } from 'src/app/components/breadcrumbs/breadcrumbs.component';
import { MenuItem } from 'primeng/api';
import { SidebarMenuService } from 'src/app/_services/sidebar-menu.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MechanicsService } from 'src/app/_services/mechanics.service';
import { UnitsService } from 'src/app/_services/units.service';
import { CreateUnitStateService } from 'src/app/_services/create-unit-state.service';

@Component({
  selector: 'app-units-page',
  standalone: true,
  imports: [
    AppLayoutComponent,
    UnitsTreeComponent,
    UnitDetailsComponent,
    CommonModule,
    DividerModule,
    ButtonModule,
    BreadcrumbsComponent,
  ],
  templateUrl: './units-page.component.html',
})
export class UnitsPageComponent implements OnInit {
  @ViewChild('unitsTree') unitsTree!: UnitsTreeComponent;
  selectedUnit: UnitNode | null = null;
  selectedUnitCategory: string = '';
  showTree = true;
  searchText = '';
  breadcrumbItems: MenuItem[] = [];
  layoutConfig: LayoutConfig;
  isMobile = false;

  constructor(
    private menuService: SidebarMenuService,
    private router: Router,
    private route: ActivatedRoute,
    public ms: MechanicsService,
    private unitsService: UnitsService,
    private createUnitStateService: CreateUnitStateService
  ) {}

  ngOnInit() {
    this.checkMobileView();
    this.setupResizeListener();

    this.route.params.subscribe((params) => {
      const officeCode =
        params['officeCode'] || this.ms.getCurrentOffice() || 'default';
      const langCode = params['langCode'] || 'en';
      this.breadcrumbItems = [
        {
          label: 'User Management',
          routerLink: `/${officeCode}/${langCode}/user-management`,
        },
        {
          label: 'Units',
          routerLink: `/${officeCode}/${langCode}/user-management/units`,
        },
      ];
      const menuItems = this.menuService.generateUserManagementMenu(
        this.router.url
      );
      this.menuService.updateMenuItems(menuItems);
      this.layoutConfig = {
        sidebarItems: menuItems,
        // You can add more config options as needed
      };
    });
  }

  onNodeSelected(event: { unit: UnitNode; category: string }) {
    console.log('UnitsPageComponent: node selected', event);
    this.selectedUnit = event.unit;
    this.selectedUnitCategory = event.category;
  }

  createNewRootUnit() {
    // Clear any existing state before creating a new unit
    this.createUnitStateService.clearState();
    this.router.navigate(['create'], { relativeTo: this.route });
  }

  checkMobileView() {
    this.isMobile = window.innerWidth <= 768;
    if (this.isMobile) {
      this.showTree = false; // Hide tree by default on mobile
    }
  }

  setupResizeListener() {
    window.addEventListener('resize', () => {
      this.checkMobileView();
    });
  }

  toggleMobileMenu() {
    this.showTree = !this.showTree;
  }

  closeMobileMenu() {
    if (this.isMobile) {
      this.showTree = false;
    }
  }
}
