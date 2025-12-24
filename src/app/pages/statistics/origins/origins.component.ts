//ANGULAR CORE
import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

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
  selector: 'app-origins',
  templateUrl: './origins.component.html'
})
export class OriginsComponent implements OnInit {
  //ELEMENTS
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;
  @ViewChild(ChartFilterComponent, { static: false }) chartFilterC!: ChartFilterComponent;

  //DI
  private route = inject(ActivatedRoute);
  private translate = inject(TranslateService);
  private ms = inject(MechanicsService);
  private utility = inject(UtilityService);
  //SERVICE
  private chartService = inject(ChartService);

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
  currentOrigin: string = 'Residents/Non-Residents'; //TO DEVELOP
  currentMode: boolean = true;
  currentIPCategory: string = '';
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
    { include: true, key: 'compare', label: 'charts.statistics.filters.compare1', type: 'checkbox', model: true },
    { include: false, key: 'trends_theme', type: 'dropdown', model: '' },
    { include: false, key: 'origin', type: 'dropdown', model: '' }
  ];
  showFilter: boolean = true;
  //CHART-NAVBAR
  onFilter() { this.showFilter = !this.showFilter; }
  onReset() {
    this.currentOrigin = 'Residents/Non-Residents';
    this.currentMode = true;
    this.currentIPCategory = (window.innerWidth <= 768) ? this.IPCategory.keys().next().value : '';
    this.currentType = 'accounted';
    this.setSeriesData('accounted', 'R_NR'); //COMPARE-null-null-(ACCOUNTED/ACTIVE)
    if (this.showFilter) {
      this.updateFilterNGModel('compare', true);
      (window.innerWidth <= 768) ? this.updateFilterNGModel('IPType', this.currentIPCategory) : this.updateFilterNGModel('IPType', 'all');
      this.updateFilterNGModel('type', 'accounted');
      /*
      //TO DEVELOP
      this.updateFilterNGModel('origin', '?');
      */
    }
  }
  //CHART-FILTER
  anyFilterEvent(filter: any) {
    if (filter.key === 'compare') {
      this.currentMode = filter.model;
      if (this.currentMode) this.setSeriesData(this.currentType, 'R_NR');
      else console.log("RESIDENTS CHART"); //TO DEVELOP
    }
    if (filter.key === 'IPType') {
      if (filter.model === 'all') this.onReset();
      else {
        this.currentIPCategory = filter.model;
        this.setSeriesData(this.currentType, 'R_NR');
      }
    }
    if (filter.key === 'type') {
      this.currentType = filter.model;
      this.setSeriesData(this.currentType, 'R_NR');
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
    if (type === 'chartClick') {
      //IP Categories - Axis Drilldown
      if (event.componentType === 'xAxis' && this.currentIPCategory.length === 0) {
        this.currentIPCategory = '';
        this.IPCategory.forEach((value, key) => { if (value === event.value) this.currentIPCategory = key; }); //To Use Later
        this.setSeriesData(this.currentType, this.currentIPCategory); //ENTER ZOOM-IN VIEW
        if (this.showFilter) this.updateFilterNGModel('IPType', this.currentIPCategory);
      }
    }
    if (type === 'chartLegendSelectChanged') {
      let legendSelected = '';
      this.translationMap.forEach((value, key) => { if (value === event.name) legendSelected = key; });
      this.setSeriesData(this.currentType, legendSelected);
    }
  }
  chartSettings() {
    this.chartOption = {
      textStyle: {
        fontFamily: this.fontFamily,
        fontWeight: 500
      },
      grid: {
        top: '90',
        left: '15%',
        right: '15%',
        bottom: '5',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        triggerEvent: true,
        offset: 0,
        axisLabel: {
          fontWeight: 'bold',
          fontFamily: this.fontFamily,
          fontSize: 13,
          formatter: (params: string) => {
            return params.split(' ').join('\n');
          }
        },
        splitLine: {
          show: true
        }
      },
      yAxis: {
        name: 'Application Count',
        nameLocation: 'middle',
        nameGap: 10,
        nameTextStyle: {
          fontWeight: 'bold',
          fontFamily: this.fontFamily,
          fontSize: 13
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
      legend: {
        data: [],
        selected: [],
        itemGap: 10,
        textStyle: {
          fontWeight: 'bold',
          fontSize: 12
        }
      },
      label: {
        show: true,
        position: 'top',
        fontFamily: this.fontFamily,
        fontSize: 13,
        color: '#000'
      },
      tooltip: {
        trigger: 'item',
        textStyle: {
          fontFamily: this.fontFamily,
          fontSize: 15
        },
        formatter: function (params: any) {
          return `<span style="font-size:14px;">${params.seriesName}: ${params.data}</span>`
        }
      },
      series: [
        {
          name: this.translationMap.get('_R'),
          type: 'bar'
        },
        {
          name: this.translationMap.get('_NR'),
          type: 'bar'
        }
      ],
      color: ['#ffb55a', '#bd7ebe']
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
        label: this.ms.translate('charts.statistics.commons.menu2'),
        routerLink: `/${officeCode}/${langCode}/statistics/origins`
      }
    ];

    this.fontFamily = this.getGlobalFont();
    this.chartSettings();
    this.translate.get([
      'charts.statistics.application_count.D',
      'charts.statistics.application_count.P',
      'charts.statistics.application_count.T',
      'charts.statistics.origins.compare',
      'charts.statistics.origins._R',
      'charts.statistics.origins._NR'
    ]).subscribe((translations) => {
      this.translationMap.set("D", translations['charts.statistics.application_count.D']);
      this.translationMap.set("P", translations['charts.statistics.application_count.P']);
      this.translationMap.set("T", translations['charts.statistics.application_count.T']);
      this.translationMap.set("_R", translations['charts.statistics.origins._R']);
      this.translationMap.set("_NR", translations['charts.statistics.origins._NR']);

      //COMMUNICATE WITH COMMON
      this.chartService.setChartID(2);
      this.chartService.setChartTheme(translations['charts.statistics.origins.compare']);

      this.fetchOriginGroup('total_filing_origins');
      this.fetchOriginGroup('active_filing_origins');
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
      (window.innerWidth <= 768) ? this.updateFilterNGModel('IPType', this.currentIPCategory, [...this.IPCategory.keys()]) : (this.currentIPCategory.length === 0) ? this.updateFilterNGModel('IPType', 'all') : this.updateFilterNGModel('IPType', this.currentIPCategory);
      this.updateFilterNGModel('type', this.currentType, ['accounted', 'active']);
      /*
      //TO DEVELOP
      this.updateFilterNGModel('compare', true);
      */
    }
    if (this.IPCategory.size !== 0) this.previous = !this.showFilter;
  }

  fetchOriginGroup(key: any) {
    this.chartService.getOriginGroup(key).subscribe({
      next: (response) => {
        console.log("Response - fetchOriginGroup()", response);
        if (key === 'total_filing_origins') { this.accountedData = response; this.transformApplications(this.accountedData, 'accounted'); }
        if (key === 'active_filing_origins') { this.activeData = response; this.transformApplications(this.activeData, 'active'); }
      },
      error: (error) => { console.log("Error - fetchOriginGroup()", error); }
    });
  }
  fetchOrigin(key: string) {
    this.chartService.getOrigin(key).subscribe({
      next: (response) => {
        console.log("Response - fetchOrigin()", response);
        if (key === 'filing_origins_residents') { this.accountedData = response; } //TO DEVELOP
        if (key === 'filing_origins_non_residents') { this.activeData = response; } //TO DEVELOP
      },
      error: (error) => { console.log("Error - fetchOrigin()", error); }
    });
  }
  transformApplications(inputData, type: string) {
    let recordIPCategory = new Map();
    if (type === 'accounted') {
      for (let IP of inputData.applicationBag) {
        recordIPCategory.set(IP.ipCategory, this.translationMap.get(IP.ipCategory));
      }
      //SORT - IPCategory
      let order = ['T', 'P', 'D'], result1 = new Map(), result2 = new Map();
      for (let item of order) {
        if (recordIPCategory.has(item)) result1.set(item, recordIPCategory.get(item));
        else result2.set(item, recordIPCategory.get(item));
      }
      this.IPCategory = new Map([...result1, ...result2]);
    }
    if (this.IPCategory.size !== 0) {
      for (let IP of inputData.applicationBag) {
        if (type === 'accounted') this.accountedDataMap.set(IP.ipCategory, IP.totalQuantity);
        if (type === 'active') this.activeDataMap.set(IP.ipCategory, IP.totalQuantity);
        for (let applications of IP.dataBag) {
          if (type === 'accounted') (applications.applicationOrigin === 'Residents') ? this.accountedDataMap.set(IP.ipCategory + '_R', applications.quantity) : this.accountedDataMap.set(IP.ipCategory + '_NR', applications.quantity);
          if (type === 'active') (applications.applicationOrigin === 'Residents') ? this.activeDataMap.set(IP.ipCategory + '_R', applications.quantity) : this.activeDataMap.set(IP.ipCategory + '_NR', applications.quantity);
        }
      }
      //CHART1 - R vs NR Origins
      if (this.currentMode) {
        if (window.innerWidth <= 768) this.currentIPCategory = this.IPCategory.keys().next().value;
      }
      if (type === 'accounted' && this.accountedDataMap.size !== 0) this.setSeriesData('accounted', 'R_NR'); //COMPARE-null-null-(ACCOUNTED/ACTIVE)
    }
  }

  //CHART SERIES DATA
  setSeriesData(seriesCode: string, originType: string) {
    //CHART SERIES
    let seriesData1 = [], seriesData2 = [];
    let chartDataMap = (seriesCode === 'accounted') ? this.accountedDataMap : this.activeDataMap;
    if (this.currentIPCategory.length === 0) {
      for (let IP of this.IPCategory.keys()) {
        seriesData1.push(chartDataMap.get(`${IP}_R`));
        seriesData2.push(chartDataMap.get(`${IP}_NR`));
      }
    }
    else {
      seriesData1.push(chartDataMap.get(`${this.currentIPCategory}_R`));
      seriesData2.push(chartDataMap.get(`${this.currentIPCategory}_NR`));
    }

    //CHART LEGEND
    let maxList = [];
    if (originType === 'R_NR') {
      this.chartLegendSelected = {
        [this.translationMap.get('_R')]: true,
        [this.translationMap.get('_NR')]: true
      }
    }
    else {
      if (this.chartLegendSelected == null) this.chartLegendSelected = { [this.translationMap.get('_R')]: true, [this.translationMap.get('_NR')]: true }; //INITIALIZE
      this.chartLegendSelected[this.translationMap.get(originType)] = !this.chartLegendSelected[this.translationMap.get(originType)]; //TOGGLE
      let pair = (originType === '_R') ? '_NR' : '_R';
      if (this.chartLegendSelected[this.translationMap.get(originType)] && this.chartLegendSelected[this.translationMap.get(pair)]) originType = 'R_NR';
      else {
        if (originType === '_R') maxList = (this.chartLegendSelected[this.translationMap.get(originType)]) ? [...seriesData1] : [...seriesData2];
        if (originType === '_NR') maxList = (this.chartLegendSelected[this.translationMap.get(originType)]) ? [...seriesData2] : [...seriesData1];
      }
    }

    //DYNAMIC CHART HEIGHT
    this.chartHeightFunc();
    this.chartWidthFunc();

    setTimeout(() => {
      //2DBAR
      this.chartInstance.setOption({
        xAxis: {
          data: (this.currentIPCategory.length === 0) ? Array.from(this.IPCategory.values()) : [this.translationMap.get(this.currentIPCategory)]
        },
        yAxis: {
          max: (originType === 'R_NR') ? this.calculateSpacing([...seriesData1, ...seriesData2]).max : this.calculateSpacing(maxList).max,
          interval: (originType === 'R_NR') ? this.calculateSpacing([...seriesData1, ...seriesData2]).interval : this.calculateSpacing(maxList).interval
        },
        legend:
        {
          data: [this.translationMap.get('_R'), this.translationMap.get('_NR')],
          selected: this.chartLegendSelected
        },
        series: [
          { name: this.translationMap.get('_R'), data: seriesData1 },
          { name: this.translationMap.get('_NR'), data: seriesData2 }
        ],
        notMerge: false
      }, { devicePixelRatio: this.utility.findPixelRatio() })
    }, 100);
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