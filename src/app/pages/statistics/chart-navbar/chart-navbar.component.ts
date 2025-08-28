//ANGULAR CORE
import { Component, OnInit, inject, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';

//PRIME MODULE
import { PrimeNGModule } from '../../shared/prime.module';

//TRANSLATE
import { TranslateService } from '@ngx-translate/core';

//CUSTOM COMPONENT
import { ConfigurableFilterComponent } from 'src/app/components/configurable-filter/configurable-filter.component';

//CUSTOM INTERFACE
import { FilterConfig } from 'src/app/components/configurable-filter/configurable-filter.component';

//SERVICE
import { ChartService } from '../chart.service';

@Component({
  standalone: true,
  selector: 'app-chart-navbar',
  imports: [
    PrimeNGModule,
    ConfigurableFilterComponent
  ],
  templateUrl: 'chart-navbar.component.html'
})
export class ChartNavbarComponent implements OnInit {

  //DI
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private translate = inject(TranslateService);
  //SERVICE
  private chartService = inject(ChartService);

  //Filters
  filters: FilterConfig[] = [
    {
      key: 'range',
      label: 'YEAR RANGE',
      type: 'dateRange'
    }
  ];

  //PROPERTIES
  currentID: number = 0;
  currentTheme: string = 'STATISTICS OVERVIEW';
  @Output() onReset = new EventEmitter<void>();
  chartTopics = [];

  setChartCommons(data: any) {
    this.chartTopics.forEach((item: any) => {
      this.router.navigate([data]);
      if (data === item.route) {
        this.chartService.setChartID(item.id);
        this.chartService.setChartTheme('TRADEMARKS - TOP 5 TECHNOLOGIES');
      }
    })
  }
  reset() { this.onReset.emit(); }

  constructor() { }

  ngOnInit() {
    let officeCode = this.route.snapshot.params['officeCode'] || 'default';
    let langCode = this.route.snapshot.params['langCode'] || 'en';
    this.chartTopics = [
      { id: 1, title: "Trends", icon: 'pi pi-chart-line', route: `/${officeCode}/${langCode}/statistics/trends` },
      { id: 2, title: "Origins", icon: 'pi pi-globe', route: `/${officeCode}/${langCode}/statistics/origins` },
      { id: 3, title: "Applicants", icon: 'pi pi-users', route: `/${officeCode}/${langCode}/statistics/applicants` },
      { id: 4, title: "Representatives", icon: 'pi pi-id-card', route: `/${officeCode}/${langCode}/statistics/representatives` },
      { id: 5, title: "Fees", icon: 'pi pi-wallet', route: `/${officeCode}/${langCode}/statistics/fees` },
      { id: 6, title: "Productivity", icon: 'pi pi-star', route: `/${officeCode}/${langCode}/statistics/productivity` }
    ];

    this.chartService.getChartID().subscribe(data => { this.currentID = data; });
    this.chartService.getChartTheme().subscribe(data => { this.currentTheme = data; });
  }
}