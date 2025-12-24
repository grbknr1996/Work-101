//ANGULAR CORE
import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

//TRANSLATE
import { TranslateService } from '@ngx-translate/core';
import { MechanicsService } from 'src/app/_services/mechanics.service';

//UTILITY
import { UtilityService } from 'src/app/_services/utility.service';

//CHART FILTER MODEL
import { chartFilterConfig } from '../chart-filter/chart-filter.model';
//CHART FILTER COMPONENT
import { ChartFilterComponent } from '../chart-filter/chart-filter.component';

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
  selector: 'app-top-ten',
  templateUrl: './top-ten.component.html'
})
export class TopTenComponent implements OnInit {
  //ELEMENTS
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;
  @ViewChild(ChartFilterComponent, { static: false }) chartFilterC!: ChartFilterComponent;

  //DI
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private translate = inject(TranslateService);
  private ms = inject(MechanicsService);
  private utility = inject(UtilityService);
  //SERVICE
  private chartService = inject(ChartService);

  //CONTEXT_SWITCH
  /* Applicants(1) || Representatives(2) */
  context: number = -1;

  //Header | Footer
  layout: LayoutConfig;
  //Breadcrumbs
  home: MenuItem = { icon: "pi pi-home", routerLink: "/" };
  items: BreadcrumbItem[] = [];

  //Property Declarations
  translationMap = new Map();
  accountedData: any;
  accountedDataMap = new Map();
  activeData: any;
  activeDataMap = new Map();
  IPCategory = new Map();
  //|//
  currentOrigin: string = '';
  currentType: string = 'accounted';

  fontFamily = '';
  chartHeight: any = 600;
  chartWidth: any = 1100;
  resizeObserver!: ResizeObserver;
  chartInstance: any;
  chartOption: any;
  chartLegendSelected: any;

  //COMMONS
  filters: chartFilterConfig[] = [
    { include: false, key: 'compare', type: 'checkbox', model: '' },
    { include: false, key: 'trends_theme', type: 'dropdown', model: '' },
    { include: false, key: 'IPType', type: 'dropdown', model: '' }
  ];
  showFilter: boolean = true;
  //CHART-NAVBAR
  onFilter() { this.showFilter = !this.showFilter; }
  onReset() {
    this.currentOrigin = '';
    this.currentType = 'accounted';
    this.setSeriesData(); //DEFAULT CHART DATA
  }
  //CHART-FILTER
  anyFilterEvent(filter: any) {
    if (filter.key === 'origin') {
      this.currentOrigin = filter.model;
      /*
      //TO DEVELOP
      this.fetchApplicants('top_10_applicants_non_resident');
      */
    }
    if (filter.key === 'type') {
      this.currentType = filter.model;
      this.setSeriesData();
    }
  }
  updateFilterNGModel(key: string, model: any, options?: any) {
    this.chartFilterC.updateNGModel(key, model, options);
  }

  //CHART EVENTS
  getGlobalFont(): string { return getComputedStyle(document.body).getPropertyValue('font-family').trim(); }
  onChartEvent(event: any, type: string) {
    console.log("Event, Type", event, type);

    if (type === 'chartInit') this.chartInstance = event;
    if (type === 'chartLegendSelectChanged') {
      this.chartLegendSelected = event.selected; //To Use Later
      this.setSeriesData();
    }
  }
  chartSettings() {
    this.chartOption = {
      textStyle: {
        fontFamily: this.fontFamily,
        fontWeight: 500
      },
      grid: {
        top: '60',
        left: '5',
        right: '25%',
        bottom: '30',
        containLabel: true
      },
      xAxis: {
        name: 'Quantity',
        nameLocation: 'middle',
        nameGap: 10,
        nameTextStyle: {
          fontWeight: 'bold',
          fontFamily: this.fontFamily,
          fontSize: 12
        },
        type: 'value',
        min: 0,
        max: 0,
        interval: 0,
        axisLabel: {
          fontFamily: this.fontFamily,
          fontSize: 12
        },
        splitLine: {
          show: false
        }
      },
      yAxis: [
        {
          type: 'category',
          offset: 0,
          axisLabel: {
            fontFamily: this.fontFamily,
            fontSize: 12,
            color: '#3A3A3A',
            width: 100,
            overflow: 'break',
            lineHeight: 15
          },
          splitLine: {
            show: true
          }
        }
      ],
      legend: {
        data: [],
        selected: [],
        itemGap: 10,
        textStyle: {
          fontSize: 12
        },
        itemStyle: {
          borderWidth: 0
        }
      },
      label: {
        show: true,
        position: 'right',
        fontFamily: this.fontFamily,
        fontSize: 11,
        color: '#000',
        padding: [2, 6, 2, 6],
        lineHeight: 14,
        align: 'left',
        verticalAlign: 'middle',
        offset: [0, 6]
      },
      tooltip: {
        trigger: 'item',
        textStyle: {
          fontFamily: this.fontFamily
        },
        formatter: function (params: any) {
          return `<span style="font-size:12px;">${params.name}<br>${params.seriesName} : ${params.data}</span>`
        }
      },
      series: [],
      color: ['#D6F1FF', '#B9E2F4', '#4EABD5', '#0EA5E9'] //TO DEVELOP
    };
  }
  chartHeightFunc() { return this.chartHeight; }
  chartWidthFunc() { return this.chartWidth; }
  resizeChartInDiv(chartDiv: HTMLElement) {
    this.chartHeight = chartDiv.offsetHeight;
    this.chartWidth = chartDiv.offsetWidth;
    requestAnimationFrame(() => { if (this.chartInstance) this.chartInstance.resize(); });
  }

  ngOnInit() {
    this.layout = {
      showHeader: true,
      headerItems: [],
      fixedHeader: true,
      showSidebar: true
    };
    let officeCode = this.route.snapshot.params['officeCode'] || 'default';
    let langCode = this.route.snapshot.params['langCode'] || 'en';

    //CONTEXT_SWITCH
    /* Setter */
    let requestRoute = (this.router.url).split('/');
    if (requestRoute.includes('statistics')) this.context = (requestRoute[requestRoute.length - 1] === 'applicants') ? 1 : 2;

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
      //CONTEXT_SWITCH
      {
        label: (this.context === 1) ? this.ms.translate('charts.statistics.commons.menu3') : this.ms.translate('charts.statistics.commons.menu4'),
        routerLink: `/${officeCode}/${langCode}/statistics/${requestRoute[requestRoute.length - 1]}`
      }
    ];

    this.fontFamily = this.getGlobalFont();
    this.chartSettings();
    this.translate.get([
      'charts.statistics.applicants.name',
      'charts.statistics.representatives.name',
      'charts.statistics.application_count.D',
      'charts.statistics.application_count.P',
      'charts.statistics.application_count.T'
    ]).subscribe((translations) => {
      this.translationMap.set("D", translations['charts.statistics.application_count.D']);
      this.translationMap.set("P", translations['charts.statistics.application_count.P']);
      this.translationMap.set("T", translations['charts.statistics.application_count.T']);

      //CONTEXT_SWITCH
      //COMMUNICATE WITH COMMON
      if (this.context === 1) {
        this.chartService.setChartID(3);
        this.chartService.setChartTheme(translations['charts.statistics.applicants.name']);

        this.fetchApplicants('top_10_applicants');
      }
      else {
        this.chartService.setChartID(4);
        this.chartService.setChartTheme(translations['charts.statistics.representatives.name']);

        this.fetchRepresentatives('TOP_10_REPRESENTATIVES');
      }
    })
  }
  ngAfterViewInit() {
    const chartDiv = this.chartContainer.nativeElement;
    if (chartDiv) {
      this.resizeObserver = new ResizeObserver(() => this.resizeChartInDiv(chartDiv));
      this.resizeObserver.observe(chartDiv);
      window.addEventListener('resize', () => this.resizeChartInDiv(chartDiv));
    }
  }
  previous: boolean = true;
  ngAfterViewChecked() {
    if (this.showFilter && !this.previous) {
      //HANDLE SHOW/HIDE SYNC
      (this.currentOrigin.length === 0) ? this.updateFilterNGModel('origin', 'all', ['all', '_NR']) : this.updateFilterNGModel('origin', this.currentOrigin, ['all', '_NR']);
      this.updateFilterNGModel('type', this.currentType, ['accounted', 'active']);
    }
    if (this.IPCategory.size !== 0) this.previous = !this.showFilter;
  }

  fetchApplicants(key: string) {
    this.chartService.getApplicants(key).subscribe({
      next: (response) => {
        console.log("Response - fetchApplicants()", response);
        let data: any = response;
        (data.sectionBag[0].section).forEach((item: any) => {
          if (item.dataCategory === 'total') { this.accountedData = item.data[0]; this.transformApplications(this.accountedData, 'total'); }
          if (item.dataCategory === 'active') { this.activeData = item.data[0]; this.transformApplications(this.activeData, 'active'); }
        })
      },
      error: (error) => { console.log("Error - fetchApplicants()", error); }
    });
  }
  fetchRepresentatives(key: string) {
    this.chartService.getRepresentatives(key).subscribe({
      next: (response) => {
        console.log("Response - fetchRepresentatives()", response);
        let data: any = response;
        (data.sectionBag[0].section).forEach((item: any) => {
          if (item.dataCategory === 'total') { this.accountedData = item.data[0]; this.transformApplications(this.accountedData, 'total'); }
          if (item.dataCategory === 'active') { this.activeData = item.data[0]; this.transformApplications(this.activeData, 'active'); }
        })
      },
      error: (error) => { console.log("Error - fetchRepresentatives()", error); }
    });
  }
  transformApplications(inputData, type: string) {
    //CONTEXT_SWITCH
    /* READ PROPER API DATA-KEY */
    let contextData = (this.context === 1) ? inputData.applicantOriginBag : inputData.representativeOriginBag;

    let accountedDataMap = new Map(), activeDataMap = new Map();
    if (type === 'total') {
      for (let items of contextData) {
        items.dataBag.forEach((item: any) => { this.IPCategory.set(item.ipType, `${this.translationMap.get(item.ipType)} (${item.ipType})`) });
        //SORT - IPCategory
        this.IPCategory = new Map([...this.IPCategory].sort(([a], [b]) => a.localeCompare(b)));
      }
    }
    if (this.IPCategory.size !== 0) {
      //TRANSFORM
      let xAxisMax = -1;
      let count = 1; //CONSTRUCT UNIQUE MAP KEYS
      for (let items of contextData) {
        let values = {};
        items.dataBag.forEach((item: any) => {
          if (item.quantity >= xAxisMax) xAxisMax = item.quantity;
          for (let IP of this.IPCategory.keys()) {
            if (IP === item.ipType) values[IP] = [item.quantity, item.percentage];
          }
        })
        //CONTEXT_SWITCH
        /* READ PROPER API DATA-KEY */
        if (this.context === 1) {
          if (type === 'total') accountedDataMap.set(items.applicantName, values);
          if (type === 'active') activeDataMap.set(items.applicantName, values);
        }
        else {
          if (type === 'total') accountedDataMap.set(count + '. ' + items.representativeName, values);
          if (type === 'active') activeDataMap.set(count + '. ' + items.representativeName, values);
        }
        count = count + 1;
      }
      //X-AXIS MAX
      this.translationMap.set('xAxisMax', xAxisMax);
      if (type === 'total' && accountedDataMap.size !== 0) {
        this.accountedDataMap = new Map([...accountedDataMap].reverse()); //REVERSE
        this.setSeriesData(); //DEFAULT CHART DATA
      }
      if (type === 'active' && activeDataMap.size !== 0) {
        this.activeDataMap = new Map([...activeDataMap].reverse()); //REVERSE
      }
    }
  }

  //CHART SERIES DATA
  setSeriesData() {
    //CHART SERIES
    let seriesData = (this.currentType === 'accounted') ? this.accountedDataMap : this.activeDataMap;
    let quantity = [], percentage = [], legend = [], lastLegend = '', series = [];
    this.IPCategory.forEach((value, key) => {
      quantity.push([...seriesData.values()].map(d => d[key][0]));
      percentage.push([...seriesData.values()].map(d => d[key][1]));

      //CHART LEGEND
      legend.push(`${this.translationMap.get(key)} (${key})`);
      if (this.chartLegendSelected != null) { if (this.chartLegendSelected[value]) lastLegend = value; }
      else {
        //INITIALIZE
        this.chartLegendSelected = {};
        this.IPCategory.forEach((value, key) => { this.chartLegendSelected[value] = true; lastLegend = this.IPCategory.get(key); });
      }

      //CHART SERIES - DYNAMIC
      series.push(
        {
          name: `${this.translationMap.get(key)} (${key})`,
          data: [...seriesData.values()].map(d => d[key][0]),
          type: 'bar',
          stack: 'total',
          barWidth: 25,
          barCategoryGap: '15%',
          itemStyle: {
            borderWidth: 0.5,
            borderColor: '#333'
          }
        }
      )
    })

    //DYNAMIC CHART HEIGHT
    this.chartHeightFunc();
    this.chartWidthFunc();

    setTimeout(() => {
      //2DBAR
      this.chartInstance.setOption({
        xAxis: {
          max: this.calculateSpacing([this.translationMap.get('xAxisMax')]).max,
          interval: this.calculateSpacing([this.translationMap.get('xAxisMax')]).interval
        },
        yAxis: [
          {
            data: [...seriesData.keys()]
          }
        ],
        legend: {
          data: legend
        },
        label: {
          formatter: (params: any) => {
            let data = '';
            for (let i = 0; i < quantity.length; i++) if (this.chartLegendSelected[[...this.IPCategory.values()][i]] && quantity[i][params.dataIndex]) data = data + `${[...this.IPCategory.keys()][i]} : ` + quantity[i][params.dataIndex] + ' ' + `(${percentage[i][params.dataIndex]})` + '\n';
            if (params.seriesName === lastLegend) return data; //DISPLAY FOR LAST SERIES ONLY
            else return '';
          }
        },
        series: series,
        notMerge: false
      }, { devicePixelRatio: this.utility.findPixelRatio() }),
        this.adjustChartHeight();
    }, 100);
  }

  adjustChartHeight() {
    const barWidth = 20;
    let data = 10;
    const adjustedHeight = (data * this.IPCategory.size) * barWidth + 170;
    const chartDiv = this.chartContainer.nativeElement;
    chartDiv.style.height = adjustedHeight + 'px';
    if (this.chartInstance) this.chartInstance.resize();
  }
  calculateSpacing(input: number[]) {
    if (!input || input.length === 0) return { max: 0, interval: 0 };

    const max = Math.max(...input);
    if (max === 0) return { max: 1, interval: 1 };

    if (max < 100) return { max: 100, interval: (100 / 5) };

    let scale = Math.pow(10, (max.toString().length) - 2);
    let givenHundred = max / scale;
    let check = max % scale;
    if (check !== 0) givenHundred = givenHundred + 1;
    return { max: Math.round(givenHundred * scale), interval: Math.round(givenHundred * scale) };
  }

  ngOnDestroy() {
    if (this.resizeObserver) this.resizeObserver.disconnect();
    window.removeEventListener('resize', () => this.resizeChartInDiv(this.chartContainer.nativeElement));
  }
}