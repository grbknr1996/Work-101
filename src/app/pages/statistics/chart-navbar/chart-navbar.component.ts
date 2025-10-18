//ANGULAR CORE
import { Component, OnInit, inject, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

//TRANSLATE
import { TranslateService } from '@ngx-translate/core';

//SERVICE
import { ChartService } from '../chart.service';

//COMMONS USED
import { MenuItem, SidebarMenuService } from 'src/app/_services/sidebar-menu.service';

@Component({
  standalone: false,
  selector: 'app-chart-navbar',
  templateUrl: 'chart-navbar.component.html'
})
export class ChartNavbarComponent implements OnInit {

  //DI
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private translate = inject(TranslateService);
  //SERVICE
  private chartService = inject(ChartService);
  //COMMONS USED
  private sidebarMenuService = inject(SidebarMenuService);

  //PROPERTIES
  currentID: number = -1;
  currentTheme: string = '';
  chartTopics = [];

  //NETWORKS
  @Output() onFilter = new EventEmitter<void>();
  @Output() onReset = new EventEmitter<void>();
  filter() { this.onFilter.emit(); }
  reset() { this.onReset.emit(); }

  constructor() { }

  ngOnInit() {
    let officeCode = this.route.snapshot.params['officeCode'] || 'default';
    let langCode = this.route.snapshot.params['langCode'] || 'en';
    this.translate.get([
      'charts.statistics.commons.menu1',
      'charts.statistics.commons.menu2',
      'charts.statistics.commons.menu3',
      'charts.statistics.commons.menu4',
      'charts.statistics.commons.menu5',
      'charts.statistics.commons.menu6'
    ]).subscribe((translations) => {
      this.chartTopics = [
        { id: 1, title: translations['charts.statistics.commons.menu1'], icon: 'pi pi-chart-line', route: `/${officeCode}/${langCode}/statistics/trends` },
        { id: 2, title: translations['charts.statistics.commons.menu2'], icon: 'pi pi-globe', route: `/${officeCode}/${langCode}/statistics/origins` },
        { id: 3, title: translations['charts.statistics.commons.menu3'], icon: 'pi pi-users', route: `/${officeCode}/${langCode}/statistics/applicants` },
        { id: 4, title: translations['charts.statistics.commons.menu4'], icon: 'pi pi-id-card', route: `/${officeCode}/${langCode}/statistics/representatives` },
        { id: 5, title: translations['charts.statistics.commons.menu5'], icon: 'pi pi-wallet', route: `/${officeCode}/${langCode}/statistics/fees` },
        { id: 6, title: translations['charts.statistics.commons.menu6'], icon: 'pi pi-star', route: `/${officeCode}/${langCode}/statistics/productivity` }
      ];

      this.chartService.getChartID().subscribe(data => { this.currentID = data; });
      this.chartService.getChartTheme().subscribe(data => { this.currentTheme = data; });

      //SIDEBAR MENUS
      const sidebarMenu: MenuItem[] = [
        {
          id: this.chartTopics[0].id,
          label: this.chartTopics[0].title,
          icon: this.chartTopics[0].icon,
          routerLink: this.chartTopics[0].route
        },
        {
          id: this.chartTopics[1].id,
          label: this.chartTopics[1].title,
          icon: this.chartTopics[1].icon,
          routerLink: this.chartTopics[1].route
        },
        {
          id: this.chartTopics[2].id,
          label: this.chartTopics[2].title,
          icon: this.chartTopics[2].icon,
          routerLink: this.chartTopics[2].route
        },
        {
          id: this.chartTopics[3].id,
          label: this.chartTopics[3].title,
          icon: this.chartTopics[3].icon,
          routerLink: this.chartTopics[3].route
        },
        {
          id: this.chartTopics[4].id,
          label: this.chartTopics[4].title,
          icon: this.chartTopics[4].icon,
          routerLink: this.chartTopics[4].route
        },
        {
          id: this.chartTopics[5].id,
          label: this.chartTopics[5].title,
          icon: this.chartTopics[5].icon,
          routerLink: this.chartTopics[5].route
        }
      ];
      this.sidebarMenuService.updateMenuItems(sidebarMenu);
    })
  }
}