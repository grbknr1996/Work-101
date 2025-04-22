import { NgZone } from '@angular/core';
import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import {  deepClone, generateId, instanceType, prevEndpoint, resizeImage } from '../utils';
import { MechanicsService } from './mechanics.service';

@Injectable({
	providedIn: 'root'
})
export class QueryParamsService {

	public queryParams: any 

	// these query params are to be set as arrays
	// since they correspond to multi-value selects in search forms
	public multivalueQP = [
		'designation',
		'office', // --> Jer : Ah great, so brandName is a string, but office is an array?
		'applicantCountryCode',
		"status"
	]

	public cache: any = {}; // cache for queryParams2Human

	constructor(public ms: MechanicsService,
		public ar: ActivatedRoute,
		public ngZone: NgZone,
		public router: Router) {

		
		const l = `QS constructor() - `
		this.queryParams = {}
		if (this.ms.isLocalHost || this.ms.isAwsDev) {
			// console.log(`[DEV] QS constructor - making window.queryParams available`)
			window["queryParams"] = this.queryParams // for dev
		}

		this.urlToQueryParamsObject() // At startup, reading the URL and transforming its queryParams into an object, so as to prefill the pages (in case of a page reload, for instance)
	}



	// Utility to easily get any queryParams, for instance from a template. ps.getQP('layout') == 'grid'
	getQP(which: string = '*', endpoint: string = this.ms.endpoint) {

		const l: string = `QS getQP() - `

		// if (!this.queryParams[endpoint]) this.resetQP(endpoint) --> I shouldn't have to do that. QueryPArams object is defined, initialized, and should remain defined and initialized. This is a dirty workaround, I'm working on finding what's going on.

		// console.log(`${l}this.queryParams[${endpoint}] = `, deepClone(this.queryParams[endpoint]))
		// if(which!=="*") // console.log(`${l}this.queryParams[${endpoint}][${which}] = `, deepClone(this.queryParams[endpoint][which]))

		try {
			return which === '*' ? this.queryParams[endpoint] : this.queryParams[endpoint][which]
		} catch (err) {
			console.error(`${l}Could not return queryParams['${endpoint}']['${which}']`);
			return null
		}
	}

	getFP(which: string = '*') {
		let queryParams = which === '*' ? this.getQP(which) : this.getQP(`fc${which}`)

		let facetParams = {};
		// get only params starting with fc
		Object.keys(queryParams).forEach((key) => {
			if (/^fc/.test(key))
				facetParams[key.replace('/^fc/', '')] = queryParams[key]
		});
		return facetParams
	}

	get keys(): string[] {

		const l = `qs get keys()`

		// console.log(`${l}this.queryParams[${this.ms.endpoint}]=`, deepClone(this.queryParams[this.ms.endpoint]))

		return Object.keys(this.queryParams[this.ms.endpoint]).filter(
			key => !!this.queryParams[this.ms.endpoint][key]
		)
	}

	resetQP(endpoint: string = '*', caller?: string): void {

		const l = `QS.resetQP() - `

		// console.log(`${l}endpoint='${endpoint}', caller='${caller}'`)

		if (endpoint === '*') {
			let endpoints = ['datacoverage', 'patents', 'designs', 'trademarks', 'gidatabase', 'portfolios']
			endpoints.forEach(endpoint => this.resetQP(endpoint, "resetQP recursive"))
		} else {
			this.queryParams[endpoint] = deepClone(this[`_${endpoint}_default`]);
			// console.log(`${l}Have reset queryParams[${endpoint}] to : `, deepClone(this.queryParams[endpoint] ))
		}
	}

	setQP(which: string, value: string | number | string[] | number[] | boolean, endpoint: string = this.ms.endpoint): void {

		const l: string = `QS setQP() - `

		// console.log(`${l}'${which}':`, value)

		this.queryParams[endpoint] = this.queryParams[endpoint] || {};

		let isMultiValueQP: boolean = which.startsWith('fc') || this.multivalueQP.includes(which);

		let toSet: any = (isMultiValueQP && !Array.isArray(value)) ? [value] : <any>value;

		// canceling the automatic casting to string of booleans
		if (toSet === "true") toSet = true;
		if (toSet === "false") toSet = false;

		if ((typeof (toSet) === "string") && toSet.length === 0) {
			this.rmQP(which, endpoint)
		} else {
			// console.log(`${l}Setting QP '${which}'=`, toSet)
			this.queryParams[endpoint][which] = toSet
		}
	}

	rmQP(which: string, endpoint: string = this.ms.endpoint): void {

		// rmQP removes a QueryParam.
		// popQP removes an item from a QueryParam array.

		const l = `QS rmQP() - `

		try {
			delete this.queryParams[endpoint][which]
		} catch (err) {
			if (this.ms.isLocalHost) console.warn(`${l}Could not delete queryParams[${endpoint}][${which}], it's probably not a problem as it was undefined in the first place`);
		}
	}

	popQP(which: string, valueToRemove: string | number): void {

		// rmQP removes a QueryParam.
		// popQP removes an item from a QueryParam array.

		const l = `QS popQP() - `

		let prevValue = this.getQP(which)

		if (prevValue === valueToRemove) {
			return this.rmQP(which)
		}

		if (!Array.isArray(prevValue)) {
			console.warn('Removing what does not exits.', valueToRemove, prevValue)
			return
		}

		if (!prevValue.includes(valueToRemove)) {
			console.warn('Removing what does not exits.', valueToRemove, prevValue)
			return
		}

		let newValue = prevValue.filter(v => v !== valueToRemove)

		this.setQP(which, newValue)
	}


	// clear the facets - called by the Facets component
	public clearAllFacets(): void {
		// remove the facets
		for (let key of this.keys) {
			if (/^fc/.test(key)) this.rmQP(key)
		}
	}

	public keepOnlySearchParams(clearFacets: boolean = true): void {
		// reduce queryParams to only those that correspond to search params
		// called by OnInit of search forms


		if (clearFacets) this.clearAllFacets()

		// remove the modifiers
		for (let key of this.keys) {
			if (['start', '_', 'i'].includes(key)) this.rmQP(key)
		}
		// rewrite the url
		this.queryParamsObjectToUrl()
	}

	urlToQueryParamsObject(queryParams?: any, endpoint: string = this.ms.endpoint): void {

		const l = `QS url2QueryParams() - `

		// ineffective call as the router has not yet initialized itself
		if (!endpoint) {
			// console.log(`${l} - No endpoint passed, returning void.`)
			return
		}

		if (typeof(queryParams) === "undefined" || queryParams == null) {

			// console.log(`${l}No queryParams object was passed. Attempting to read query params from the browser's URL...`)

			/*
				Usually, this function is called whenever the URL changes (search.component URL watcher subscription). In this case, the subscription passes it a queryParams object.
				But it should also be called at startup, when reloading the page for instance, so as to read the URL and convert the URL parameters into a queryParams object.
				In this case, no queryParams are passed, we must read them from the URL
			*/
			try {
				const urlParams = window.location.search.replace(/^\?/, "");
				const searchParamsObj = new URLSearchParams(urlParams)

				queryParams = {};
				for (let key of searchParamsObj.keys()) {
					// console.log(`${l}`, key, ` = `, searchParamsObj.getAll(key))

					let value: string | string[] = <string[]>searchParamsObj.getAll(key)// there can be multiples : designation=FR&designation=DE, fsstatus=Expired&fcStatus=Registered, etc. which are returned as ["FR","DE"]

					if (value.length === 1) value = value.pop(); // brandName=["apple"] ---> brandName="apple"

					queryParams[key] = value
				}

				// console.log(`${l}402 serialized queryParams from URL = `, deepClone(queryParams))
			} catch (err) {
				console.warn(`${l}Caught error - Could not transform URL params into queryParams object! err=`, err)
			}
		}

		if(window.location.href.includes('export') && endpoint !== 'reports'){
			queryParams = JSON.parse(localStorage.getItem(`${instanceType()}.download_report`));
		}

	
		this.resetQP(endpoint, l)

		// now set the new ones
		const keys = Object.keys(queryParams)

		for (let key of keys) {
			// console.log(`${l} setting key='${key}', value=`, queryParams[key])
			// setQP will take care of fc and multivalues
			this.setQP(key, queryParams[key], endpoint); // "fcstatus": "Registered" --> "fcstatus": ["Registered"]
		}
	}



	async queryParamsObjectToUrl(url?: string, forceReplace: boolean = false): Promise<void> {

		const l: string = `qs.queryParams2Url() - `

		await new Promise(r => setTimeout(r))

		if (!url) {
			this.setQP("_", Date.now());
		}
		else{
			//this.ms.clearCache()
		}

		this.ngZone.run(() => {

			const navigateTo: string[] = url ? [url] : [];
			let queryParams: any = this.getQP();
			if(queryParams){
				// There is a bug in Angular router that serializes the asStructure to "[object Object]" in the query params. I need to stringify it if I don't want it destroyed
				// Bug : https://github.com/angular/angular/issues/47307
				if (queryParams.asStructure && typeof (queryParams.asStructure) === "object") {
					try {
						queryParams.asStructure = JSON.stringify(queryParams.asStructure)
					} catch (err) {
						console.warn(`${l}Could not stringify the asStructure in order to pass it to Angular router. queryParams.asStructure=`, deepClone(queryParams.asStructure))
					}
				}

				// console.log(`${l}navigating to : '${navigateTo}', ${queryParams.asStructure} ${queryParams['_']}`)
				delete queryParams.bases64
			}
			this.router.navigate(navigateTo, {
				relativeTo: this.ar,
				queryParams,
				replaceUrl: forceReplace ? true : url ? false : true,
			})
		});

		return Promise.resolve()
	}




	removeFacet(key: string, val: string): void { // key="status", val="Registered"

		const l = `qs.removeFacet() - `


		// console.log(`${l}Popping '${key}.${val}'`);

		if (!key.startsWith("fc")) key = `fc${key}`;


		this.popQP(key, val) // Does not trigger the search nor update the URL...
		this.queryParamsObjectToUrl() // ... so I'm triggering it here
	}

}