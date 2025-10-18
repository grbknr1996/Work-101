//ANGULAR CORE
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

//TRANSLATE
import { TranslateService } from '@ngx-translate/core';
import { MechanicsService } from 'src/app/_services/mechanics.service';

//CUSTOM INTERFACES
import { LayoutConfig } from 'src/app/components/app-layout/app-layout.component';
import { MenuItem } from 'primeng/api';
interface BreadcrumbItem extends MenuItem {
  routerLink?: any[] | string;
  label: string;
}

//SERVICE
import { ChartService } from '../chart.service';

@Component({
  standalone: false,
  selector: 'app-trends',
  templateUrl: './trends.component.html'
})
export class TrendsComponent implements OnInit {

  //DI
  private route = inject(ActivatedRoute);
  private translate = inject(TranslateService);
  private ms = inject(MechanicsService);
  //SERVICE
  private chartService = inject(ChartService);

  //Header | Footer
  layout: LayoutConfig;
  //Breadcrumbs
  home: MenuItem = { icon: "pi pi-home", routerLink: "/" };
  items: BreadcrumbItem[] = [];

  //Property Declarations
  chartHeight: any;
  chartInstance: any;
  chartOption: any;

  //CHART EVENTS
  onChartEvent(event: any, type: string) {
    console.log("Event, Type", event, type);

    if (type === 'chartInit') this.chartInstance = event;
  }
  chartSettings() {
    this.chartOption = {
      title: {
        text: `TOTAL\n\nWORLD TRADEMARKS\n\n3,552,000`,
        left: '31%',
        top: 'middle',
        textStyle: {
          fontSize: 11,
          fontWeight: 'bold'
        }
      },
      color: ['#0EA5E9', '#4EABD5', '#B9E2F4', '#D6F1FF', '#EAF8FF', '#F5FCFF'],
      colorBy: 'data',
      legend: {
        orient: 'vertical',
        top: 'center',
        right: '30%',
        itemGap: 30
      },
      tooltip: {
        trigger: 'item',
        formatter: function (params: any) {
          return `<span style="font-size:12px;">${params.name}: ${params.value}%</span>`
        }
      },
      series: [
        {
          name: 'T_tech',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['35%', '50%'],
          avoidLabelOverlap: false,
          label: {
            show: true,
            position: 'inside',
            formatter: '{c}%',
            color: '#3f3f3f',
            fontWeight: 'bold'
          },
          labelLine: {
            show: false
          },
          data: [
            { value: 47.2, name: 'COMPUTER TECHNOLOGY' },
            { value: 16.8, name: 'DIGITAL COMMUNICATION' },
            { value: 8.4, name: 'ELECTRICAL MACHINERY' },
            { value: 6.8, name: 'MEDICAL TECHNOLOGY' },
            { value: 5.6, name: 'SEMICONDUCTORS' }
          ]
        }
      ]
    };
  }
  chartHeightFunc() { return this.chartHeight; }

  ngOnInit(): void {
    this.layout = {
      showHeader: true,
      headerItems: [],
      fixedHeader: true,
      showSidebar: true
    };
    let officeCode = this.route.snapshot.params['officeCode'] || 'default';
    let langCode = this.route.snapshot.params['langCode'] || 'en';
    this.home = {
      icon: "pi pi-home",
      label: `${officeCode}`,
      routerLink: `/${officeCode}/${langCode}/dashboard`
    };
    this.items = [
      {
        label: this.ms.translate('charts.statistics.commons.menu'),
        routerLink: `/${officeCode}/${langCode}/statistics`
      },
      {
        label: this.ms.translate('charts.statistics.commons.menu1'),
        routerLink: `/${officeCode}/${langCode}/statistics/trends`
      }
    ];

    this.chartSettings();
    this.translate.get([
      'charts.statistics.trends.tech'
    ]).subscribe((translations) => {

      //COMMUNICATE WITH COMMON
      this.chartService.setChartID(1);
      this.chartService.setChartTheme(translations['charts.statistics.trends.tech']);

    })

    //DYNAMIC CHART HEIGHT
    this.chartHeight = 500;
    this.chartHeightFunc();
    setTimeout(() => { this.chartInstance.resize(); }, 100);
  }
}