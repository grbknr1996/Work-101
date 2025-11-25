//ANGULAR CORE
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

//CUSTOM IMPORT
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ChartService {
  //DI
  private http = inject(HttpClient);

  //PROPERTIES
  private currentID = new BehaviorSubject<number>(-1);
  private currentTheme = new BehaviorSubject<string>('');

  private statisticsAPIPrefix = `/services/statistics/reports`;

  getChartID() {
    return this.currentID.asObservable();
  }
  getChartTheme() {
    return this.currentTheme.asObservable();
  }

  setChartID(data: number) {
    this.currentID.next(data);
  }
  setChartTheme(data: string) {
    this.currentTheme.next(data);
  }

  getApplicationCount(key: string) {
    return this.http.get(
      `${this.statisticsAPIPrefix}/applications/counts?widgetCode=${key}`
    );
  }
}
