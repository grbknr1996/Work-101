import { Component, Input, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { MechanicsService } from '../../_services/mechanics.service';
import { SidebarMenuService } from 'src/app/_services/sidebar-menu.service';


export interface LayoutConfig {
  appTitle?: string;
  showHeader?: boolean;
  showSidebar?: boolean;
  headerItems?: MenuItem[];
  sidebarItems?: MenuItem[];
  footerText?: string;
  fixedHeader?: boolean;
  fixedSidebar?: boolean;
  sidebarCollapsed?: boolean;
  theme?: 'light' | 'dark';
  logo?: string;
}


@Component({
  selector: 'app-layout',
  standalone: false,
  templateUrl: './app-layout.component.html',
})
export class AppLayoutComponent implements OnInit {
  sidebarVisible: boolean = false;
  @Input() config: LayoutConfig;
  constructor(
    public ms: MechanicsService,
    private sidebarMenuService: SidebarMenuService
  ) {}

  ngOnInit() {
    this.sidebarMenuService.setCompactMode(true);
    // Make sure config is initialized with defaults if not provided
    const officeCode = this.ms.getCurrentOffice() || 'default';
    const langCode = this.ms.lang;
    this.config = this.config || {
      appTitle: 'IPAS Central',
      showHeader: true,
      showSidebar: true,
      headerItems: [
        {
          label: this.ms.translate('home.link.label'),
          icon: 'pi pi-home',
          routerLink: [`/${officeCode}/${langCode}/dashboard`],
        },
      ],
      sidebarItems: [
        {
          label: 'Home',
          icon: 'pi pi-home',
          routerLink: '/datacoverage',
        },
      ],
      footerText: '© WIPO ' + new Date().getFullYear(),
      fixedHeader: true,
      fixedSidebar: false,
      sidebarCollapsed: false,
      theme: 'light',
      logo: '',
    };
  }

  toggleSidebar(flag: boolean) {
    console.log('toggleSidebar', flag);
    this.sidebarMenuService.setSidebarVisibility(flag);
    this.sidebarMenuService.toggleCompactMode();
  }
}
