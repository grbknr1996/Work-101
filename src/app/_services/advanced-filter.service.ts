import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';


@Injectable({ 
    providedIn: 'root' 
})
export class AdvancedFilterService {
  private config$?: Observable<any>;

  constructor(private http: HttpClient) {}

  getConfig() {
    if (!this.config$) {
      this.config$ = this.http.get('/assets/configuration/advanced-filter.json').pipe(shareReplay(1));
    }
    //console.log("config "+this.config$);
    return this.config$;
  }

  getFieldOptions(categoryKey: string): Observable<any[]> {
    return this.getConfig().pipe(
      map(config => {
        const entry = config.fieldOptionsFromDb.find((f: any) => f.key === categoryKey);
        return entry ? entry.options : [];
      })
    );
  }

  getFieldOptionsByCategory(categoryCode: string) {
    if (categoryCode !== 'all') {
        return this.getFieldOptions(categoryCode);
    } else {
        return this.getConfig().pipe(
            map(config => config.fieldOptionsFromDb.flatMap(entry => entry.options))
        );
    }
    }
}
