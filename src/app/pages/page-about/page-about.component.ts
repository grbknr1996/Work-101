import { Component, KeyValueDiffers, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MechanicsService } from 'src/app/_services/mechanics.service';
import { QueryParamsService } from 'src/app/_services/queryParams.service';

@Component({
	selector: 'page-about',
	templateUrl: './page-about.component.html',
	standalone: false 
})
export class PageAboutComponent implements OnInit {

	constructor(private ar: ActivatedRoute,
		public ms: MechanicsService,
		public qs: QueryParamsService,
		private differs: KeyValueDiffers) {

		const l = `page-notfount constructor - `

		this.ms.setEndpoint("about")
	}
	ngOnInit(): void {
	}

}
