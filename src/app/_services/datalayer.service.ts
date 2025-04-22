
import { Injectable } from '@angular/core';
import queryString from 'query-string';

import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { environment } from "../../environments/environment"
import { MechanicsService } from './mechanics.service';
import { lastValueFrom, Observable, of, delay } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { decrypt, deepClone, instanceType } from '../utils';
import { ActivatedRoute } from '@angular/router';
import { ResponeData } from '../interfaces';


@Injectable({
	providedIn: 'root'
})
export class DataLayerService {


	constructor(private ms: MechanicsService,
		public ar: ActivatedRoute,
		public http: HttpClient) {

		const l = `dls.constructor - `


	}


}
