import { Component, KeyValueDiffers, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MechanicsService } from 'src/app/_services/mechanics.service';
import { QueryParamsService } from 'src/app/_services/queryParams.service';

@Component({
	selector: 'page-notfound',
	templateUrl: './page-notfound.component.html',
	standalone: false 
})
export class PageNotfoundComponent implements OnInit {

	constructor(private ar: ActivatedRoute,
		public ms: MechanicsService,
		public qs: QueryParamsService,
		private differs: KeyValueDiffers) {

		const l = `page-notfount constructor - `

		this.ms.setEndpoint("notfound")
	}
	ngOnInit(): void {
	}

}
