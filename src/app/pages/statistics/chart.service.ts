//ANGULAR CORE
import { inject, Injectable } from "@angular/core";
import { BehaviorSubject, switchMap } from "rxjs";

//CUSTOM IMPORT
import { HttpClient } from "@angular/common/http";

//?
import { getAuthHeaders } from "src/app/utils";
import { AuthService } from "src/app/_services/auth.service";

@Injectable({ providedIn: 'root' })
export class ChartService {
  //DI
  private http = inject(HttpClient);
  //?
  private auth = inject(AuthService);

  //PROPERTIES
  private currentID = new BehaviorSubject<number>(-1);
  private currentTheme = new BehaviorSubject<string>('');

  private statisticsAPIPrefix = `/services/statistics/reports`;

  getChartID() { return this.currentID.asObservable(); }
  getChartTheme() { return this.currentTheme.asObservable(); }

  setChartID(data: number) { this.currentID.next(data); }
  setChartTheme(data: string) { this.currentTheme.next(data); }

  getApplicationCount(key: string) {
    return getAuthHeaders(this.auth).pipe(switchMap((response) => {
      return this.http.get(`${this.statisticsAPIPrefix}/applications/counts?widgetCode=${key}`, { headers: response });
    }))
  }
}