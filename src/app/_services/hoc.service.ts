import { Component, OnInit, ViewContainerRef, Input } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { MechanicsService } from '../_services/mechanics.service';
import { QueryParamsService } from '../_services/queryParams.service';
import { decrypt, deepClone, setPrevEnpoint } from '../utils';

@Component({
	selector: 'hoc-search',
	template: '',
})
export class HOCSearchComponent implements OnInit {


	private urlchangeSubscription: any;
	private endpoint: string;

	constructor(
		private viewContainerRef: ViewContainerRef,
		private ar: ActivatedRoute,
		private ms: MechanicsService,
		private qs: QueryParamsService) {

		const l = `HOCSearchComponent constructor() - `

		// console.log(`${l}page=`, this.page)

		this.endpoint = this.ar.snapshot.params.endpoint;

		this.ms.setEndpoint(this.endpoint);

	}

	ngOnInit() {

		const l = `HOCsearchComponent ngOnInit() - `

		// console.log(`${l}page=`, this.page)

		this.viewContainerRef.clear();
		

		this.urlchangeSubscription = this.ar.queryParams.subscribe((urlQueryParams:Params) => {
			const l = `HOCSearchComponent urlchangeSubscription - `;
			console.log(`03 - ${l}this.queryParams[${this.endpoint}] before urlToQueryParamsObject = `, deepClone(this.qs.getQP())) //  --> no office
			this.qs.urlToQueryParamsObject(urlQueryParams, this.endpoint);
			console.log(`04 - ${l}this.queryParams[${this.endpoint}] after urlToQueryParamsObject= `, deepClone(this.qs.getQP())) //  --> office:['DZ'], OK
		});
	}

	ngOnDestroy() {
		this.ms.unsetEndpoint()
		this.urlchangeSubscription.unsubscribe();
	}



}

