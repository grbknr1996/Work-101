//ANGULAR CORE
import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({ providedIn: 'root' })
export class ChartService {

  //PROPERTIES
  private currentID = new BehaviorSubject<number>(-1);
  private currentTheme = new BehaviorSubject<string>('');

  getChartID() { return this.currentID.asObservable(); }
  getChartTheme() { return this.currentTheme.asObservable(); }

  setChartID(data: number) { this.currentID.next(data); }
  setChartTheme(data: string) { this.currentTheme.next(data); }

}