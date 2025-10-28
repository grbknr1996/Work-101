import { Component, OnInit } from '@angular/core';
import { LayoutConfig } from '../../components/app-layout/app-layout.component';
import { Location } from '@angular/common';
import { MechanicsService } from '../../_services/mechanics.service';

@Component({
  selector: 'work-in-progress',
  templateUrl: './work-in-progress.component.html',
  standalone: false,
})
export class WorkInProgressComponent implements OnInit {
  layoutConfig: LayoutConfig;

  constructor(public ms: MechanicsService, private location: Location) {
    this.layoutConfig = {
      appTitle: this.ms.translate('common.components.app.title'),
      showHeader: true,

      showSidebar: false,
      headerItems: [],
      sidebarItems: [],
      footerText: '© WIPO ' + new Date().getFullYear(),
      fixedHeader: true,
      fixedSidebar: false,
      sidebarCollapsed: false,
      theme: 'light',
      logo: '',
    };
  }

  ngOnInit(): void {}
  goBack(): void {
    this.location.back();
  }
}
