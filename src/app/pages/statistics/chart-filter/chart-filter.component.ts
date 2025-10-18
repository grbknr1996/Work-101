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

  //PROPERTIES
  defaultFilters: chartFilterConfig[];
  finalFilters: chartFilterConfig[];

  constructor() { }

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
      'charts.statistics.filters.originOption2'
    ]).subscribe((translations) => {
      this.defaultFilters = [
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
          type: 'yearrange',
          minDate: new Date(1990, 0, 1),
          maxDate: new Date(),
          model: [new Date(1990, 0, 1), new Date()]
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
          include: false,
          key: 'compare',
          label: 'COMPARE MODE', //TRANSLATE
          type: 'checkbox',
          model: true
        }
      ];

      this.finalFilters = (this.actualFilters != null) ? this.defaultFilters.map(defaults => ({
        ...defaults,
        ...this.actualFilters.find(actuals => (defaults.key === actuals.key))
      })) : this.defaultFilters
    })
  }
}