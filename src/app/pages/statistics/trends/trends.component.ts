//ANGULAR CORE
import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

//TRANSLATE
import { TranslateService } from '@ngx-translate/core';
import { MechanicsService } from 'src/app/_services/mechanics.service';

//CHART FILTER MODEL
import { chartFilterConfig } from '../chart-filter/chart-filter.model';

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
  //ELEMENTS
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;

  //DI
  private router = inject(Router);
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
  fontFamily = '';
  chartHeight: any = 600;
  chartWidth: any = 1100;
  resizeObserver!: ResizeObserver;
  chartInstance: any;
  chartOption: any;

  //COMMONS
  filters: chartFilterConfig[] = [
    { include: true, key: 'IPType', type: 'dropdown', model: 'T' },
    { include: true, key: 'compare', label: 'charts.statistics.filters.compare2', type: 'checkbox', model: true }
  ];
  showFilter: boolean = true;
  //CHART-NAVBAR
  onFilter() { this.showFilter = !this.showFilter; }
  onReset() { }

  //CHART EVENTS
  getGlobalFont(): string { return getComputedStyle(document.body).getPropertyValue('font-family').trim(); }
  onChartEvent(event: any, type: string) {
    console.log("Event, Type", event, type);

    if (type === 'chartInit') this.chartInstance = event;
    if (type === 'chartClick') {
      //Technology Sectors - Pie Drilldown
      if (event.componentType === 'series') {
        this.router.navigate(['/vc/en/statistics/trends/tech-timeline']);
      }
    }
  }
  chartSettings() {
    this.chartOption = {
      title: {
        text: 'TRADEMARKS - TOP 5 BUSINESS SECTORS',
        left: 'center',
        top: '5%',
        textStyle: {
          color: '#3f3f3f',
          fontSize: 18,
          fontWeight: 'bold'
        }
      },
      color: ['#0EA5E9', '#4EABD5', '#B9E2F4', '#D6F1FF', '#EAF8FF', '#F5FCFF'],
      colorBy: 'data',
      legend: {
        top: '15%',
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
          top: '10%',
          center: ['50%', '60%'],
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
  chartWidthFunc() { return this.chartWidth; }
  resizeChartInDiv(chartDiv: HTMLElement) {
    this.chartHeight = chartDiv.offsetHeight;
    this.chartWidth = chartDiv.offsetWidth;
    requestAnimationFrame(() => { if (this.chartInstance) this.chartInstance.resize(); });
  }

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

    this.fontFamily = this.getGlobalFont();
    this.chartSettings();
    this.translate.get([
      'charts.statistics.trends.tech'
    ]).subscribe((translations) => {

      //COMMUNICATE WITH COMMON
      this.chartService.setChartID(1);
      this.chartService.setChartTheme(translations['charts.statistics.trends.tech']);

    })

    //DYNAMIC CHART HEIGHT
    this.chartHeightFunc();
    this.chartWidthFunc();
    //RESIZE - MOCK PLACEHOLDER
    setTimeout(() => { this.chartSettings }, 200);
  }
  ngAfterViewInit() {
    const chartDiv = this.chartContainer.nativeElement;
    if (chartDiv) {
      this.resizeObserver = new ResizeObserver(() => this.resizeChartInDiv(chartDiv));
      this.resizeObserver.observe(chartDiv);
      window.addEventListener('resize', () => this.resizeChartInDiv(chartDiv));
    }
  }

  ngOnDestroy() {
    if (this.resizeObserver) this.resizeObserver.disconnect();
    window.removeEventListener('resize', () => this.resizeChartInDiv(this.chartContainer.nativeElement));
  }
}