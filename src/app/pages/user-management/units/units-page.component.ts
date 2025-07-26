import { Component, OnInit, ViewChild } from '@angular/core';
import { UnitsTreeComponent } from './units-tree.component';
import { UnitDetailsComponent } from './units-details.component';
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
  showTree = true;
  searchText = '';
  breadcrumbItems: MenuItem[] = [];
  layoutConfig: LayoutConfig;

  constructor(
    private menuService: SidebarMenuService,
    private router: Router,
    private route: ActivatedRoute,
    public ms: MechanicsService,
    private unitsService: UnitsService
  ) {}

  ngOnInit() {
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

  onNodeSelected(unit: UnitNode) {
    console.log('UnitsPageComponent: node selected', unit);
    this.selectedUnit = unit;
  }

  createNewRootUnit() {
    const unitName = prompt('Enter name for new root unit:');
    if (unitName && unitName.trim()) {
      this.unitsService.addUnit(null, unitName.trim()).subscribe((newUnit) => {
        console.log('New root unit created:', newUnit);
        if (this.unitsTree) {
          this.unitsTree.refresh();
        }
      });
    }
  }
}
