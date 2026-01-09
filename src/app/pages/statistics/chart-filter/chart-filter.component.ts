//ANGULAR CORE
import { Component, OnInit, Input, Output, EventEmitter, inject } from '@angular/core';

//TRANSLATE
import { TranslateService } from '@ngx-translate/core';

//CHART FILTER MODEL
import { chartFilterConfig } from '../chart-filter/chart-filter.model';

@Component({
  standalone: false,
  selector: 'app-chart-filter',
  templateUrl: 'chart-filter.component.html'
})
export class ChartFilterComponent implements OnInit {
  //DI
  private translate = inject(TranslateService);

  //NETWORKS
  @Input() actualFilters: chartFilterConfig[];
  @Input() show: boolean;
  @Output() onHide = new EventEmitter<void>();
  hide() { this.onHide.emit(); }

  @Output() anyFilterEvent = new EventEmitter<void>();
  anyFilter(filter: any) { this.anyFilterEvent.emit(filter); }

  //PROPERTIES
  defaultFilters: chartFilterConfig[];
  finalFilters: chartFilterConfig[];
  prevFinalFilters: chartFilterConfig[]; //COPY DEFAULTS
  flag: number = -1;

  constructor() { }

  updateNGModel(key: string, model: any, options?: any, include?: any) {
    if (this.flag === 1) { this.flag = -1; this.finalFilters = this.prevFinalFilters; /* USE DEFAULTS */ }
    let target = this.finalFilters.find((item: any) => item.key === key);
    target.model = model;
    if (options) {
      target.options = (target.options).filter((item: any) => options.indexOf(item.value) !== -1);
    }
    if (include != null && include === false) {
      this.finalFilters = this.finalFilters.filter((finals) => finals.key !== key);
      this.flag = 1;
    }
  }
  ngOnInit() {
    this.translate.get([
      'charts.statistics.filters.type',
      'charts.statistics.filters.IPType',
      'charts.statistics.filters.yearRange',
      'charts.statistics.filters.origin',
      'charts.statistics.filters.all',
      'charts.statistics.filters.typeOption1',
      'charts.statistics.filters.typeOption2',
      'charts.statistics.filters.typeOption3',
      'charts.statistics.application_count.D',
      'charts.statistics.application_count.P',
      'charts.statistics.application_count.T',
      'charts.statistics.filters.originOption1',
      'charts.statistics.filters.originOption2',
      'charts.statistics.filters.compare',
      'charts.statistics.filters.compare1',
      'charts.statistics.filters.compare2',
      'charts.statistics.filters.trends_theme',
      'charts.statistics.filters.trends_theme1',
      'charts.statistics.filters.trends_theme2'
    ]).subscribe((translations) => {
      this.defaultFilters = [
        {
          include: true,
          key: 'compare',
          label: translations['charts.statistics.filters.compare'],
          type: 'checkbox',
          model: true
        },
        {
          include: true,
          key: 'trends_theme',
          label: translations['charts.statistics.filters.trends_theme'],
          type: 'dropdown',
          model: 'tech',
          options: [
            { label: translations['charts.statistics.filters.trends_theme1'], value: 'tech' },
            { label: translations['charts.statistics.filters.trends_theme2'], value: 'origin' }
          ]
        },
        {
          include: true,
          key: 'IPType',
          label: translations['charts.statistics.filters.IPType'],
          type: 'dropdown',
          model: 'all',
          options: [
            { label: translations['charts.statistics.filters.all'], value: 'all' },
            { label: translations['charts.statistics.application_count.D'], value: 'D' },
            { label: translations['charts.statistics.application_count.P'], value: 'P' },
            { label: translations['charts.statistics.application_count.T'], value: 'T' }
          ]
        },
        {
          include: true,
          key: 'yearRange',
          label: translations['charts.statistics.filters.yearRange'],
          type: 'dropdown',
          model: 'all',
          options: [
            { label: translations['charts.statistics.filters.all'], value: 'all' },
            { label: `${new Date().getFullYear() - 5} - ${new Date().getFullYear()}`, value: '5' },
            { label: `${new Date().getFullYear() - 10} - ${new Date().getFullYear()}`, value: '10' },
            { label: `${new Date().getFullYear() - 20} - ${new Date().getFullYear()}`, value: '20' },
            { label: `${new Date().getFullYear() - 30} - ${new Date().getFullYear()}`, value: '30' }
          ]
        },
        {
          include: true,
          key: 'origin',
          label: translations['charts.statistics.filters.origin'],
          type: 'dropdown',
          model: 'all',
          options: [
            { label: translations['charts.statistics.filters.all'], value: 'all' },
            { label: translations['charts.statistics.filters.originOption1'], value: '_R' },
            { label: translations['charts.statistics.filters.originOption2'], value: '_NR' }
          ]
        },
        {
          include: true,
          key: 'type',
          label: translations['charts.statistics.filters.type'],
          type: 'radio',
          model: 'accounted',
          options: [
            { label: translations['charts.statistics.filters.typeOption1'], value: 'accounted' },
            { label: translations['charts.statistics.filters.typeOption2'], value: 'active' },
            { label: translations['charts.statistics.filters.typeOption3'], value: 'inactive' }
          ]
        },
      ];

      this.finalFilters = (this.actualFilters != null) ? this.defaultFilters.map(defaults => ({
        ...defaults,
        ...this.actualFilters.find(actuals => (defaults.key === actuals.key))
      })) : this.defaultFilters
      //COMPARE MODE - CHECKBOX - SET CUSTOM LABELS
      this.finalFilters.map((finals) => { if (finals.key === 'compare' && finals.type === 'checkbox') finals.label = translations[finals.label] });
      this.finalFilters = this.finalFilters.filter((finals) => finals.include === true);
      this.prevFinalFilters = this.finalFilters; //COPY DEFAULTS
    })
  }
}