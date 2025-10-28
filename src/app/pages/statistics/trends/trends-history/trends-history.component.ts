//ANGULAR CORE
import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

//TRANSLATE
import { TranslateService } from '@ngx-translate/core';
import { MechanicsService } from 'src/app/_services/mechanics.service';

//CHART FILTER MODEL
import { chartFilterConfig } from '../../chart-filter/chart-filter.model';

//CUSTOM INTERFACES
import { LayoutConfig } from 'src/app/components/app-layout/app-layout.component';
import { MenuItem } from 'primeng/api';
interface BreadcrumbItem extends MenuItem {
  routerLink?: any[] | string;
  label: string;
}

//SERVICE
import { ChartService } from '../../chart.service';

@Component({
  standalone: false,
  selector: 'app-trends-history',
  templateUrl: './trends-history.component.html'
})
export class TrendsHistoryComponent implements OnInit {
  //ELEMENTS
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;

  //DI
  private http = inject(HttpClient);
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
  chartData: any;

  fontFamily = '';
  chartHeight: any = 700;
  chartWidth: any = 1100;
  resizeObserver!: ResizeObserver;
  chartInstance: any;
  chartOption: any;

  //COMMONS
  filters: chartFilterConfig[] = [
    { include: true, key: 'IPType', type: 'dropdown', model: 'T' },
    { include: true, key: 'yearRange', type: 'yearrange', minDate: new Date(2004, 0, 1), maxDate: new Date(2024, 0, 1), model: [new Date(2004, 0, 1), new Date(2024, 0, 1)] },
    { include: false, key: 'compare', type: 'checkbox', model: '' }
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
  }
  chartSettings() {
    this.chartOption = {
      textStyle: {
        fontFamily: this.fontFamily,
        fontWeight: 500
      },
      grid: {
        top: '28%',
        left: '10%',
        right: '10%',
        bottom: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: [
          '2004', '2005', '2006', '2007', '2008', '2009', '2010',
          '2011', '2012', '2013', '2014', '2015', '2016', '2017',
          '2018', '2019', '2020', '2021', '2022', '2023', '2024'
        ],
        axisLabel: {
          fontFamily: this.fontFamily,
          fontSize: 16
        }
      },
      yAxis: {
        type: 'value',
        name: 'FILING %',
        nameLocation: 'middle',
        nameGap: 45,
        nameRotate: 90,
        nameTextStyle: {
          fontFamily: this.fontFamily,
          fontSize: 16
        },
        min: 0,
        max: 100,
        axisLabel: {
          fontFamily: this.fontFamily,
          fontSize: 16,
          formatter: '{value}%'
        }
      },
      legend: {
        data: ['COMPUTER TECHNOLOGY', 'DIGITAL COMMUNICATION', 'ELECTRICAL MACHINERY', 'MEDICAL TECHNOLOGY', 'SEMICONDUCTORS'],
        top: '15%',
        itemGap: 15,
        textStyle: {
          fontSize: 15
        }
      },
      title: {
        text: 'TRADEMARKS - TOP 5 BUSINESS SECTORS - HISTORY',
        left: 'center',
        top: '5%',
        textStyle: {
          color: '#3f3f3f',
          fontSize: 18
        }
      },
      tooltip: {
        trigger: 'axis',
        textStyle: {
          fontFamily: this.fontFamily,
          fontSize: 13
        },
        formatter: (params: any) => {
          let data = '';
          for (let item of params) {
            data = data + `${item.seriesName} - ${item.value}%<br>`;
          }
          return data;
        }
      },
      series: [
        {
          name: 'COMPUTER TECHNOLOGY',
          type: 'line',
          //stack: 'total',
          smooth: false,
          data: this.chartData?.filter(d => d.techCategory === 'C').map(d => d.count)
        },
        {
          name: 'DIGITAL COMMUNICATION',
          type: 'line',
          //stack: 'total',
          smooth: false,
          data: this.chartData?.filter(d => d.techCategory === 'D').map(d => d.count)
        },
        {
          name: 'ELECTRICAL MACHINERY',
          type: 'line',
          //stack: 'total',
          smooth: false,
          data: this.chartData?.filter(d => d.techCategory === 'E').map(d => d.count)
        },
        {
          name: 'MEDICAL TECHNOLOGY',
          type: 'line',
          //stack: 'total',
          smooth: false,
          data: this.chartData?.filter(d => d.techCategory === 'M').map(d => d.count)
        },
        {
          name: 'SEMICONDUCTORS',
          type: 'line',
          //stack: 'total',
          smooth: false,
          data: this.chartData?.filter(d => d.techCategory === 'S').map(d => d.count)
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

    this.http.get<any>('assets/statistics-data/jo-app-techtrends-history.json').subscribe({
      next: (response) => {
        console.log("Tech Trends Mock Response", response);
        this.chartData = response.data.map((item: any) => {
          let percent = Math.floor(((item.count - 10) / (1000 - 10)) * 90 + 10);
          if (percent > 100) percent = 75;
          return { ...item, count: percent };
        })
        this.chartSettings();
      }
    })

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