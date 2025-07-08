import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { MechanicsService } from 'src/app/_services/mechanics.service';

@Component({
	selector: 'page-redirect',
	templateUrl: './page-redirect.component.html',
	standalone: false 
})
export class PageRedirectComponent implements OnInit {

	constructor(public ms: MechanicsService,
		private lc: Location,
	) { }
	private mapping = {
		'test': "https://wipo.int"
	}

	ngOnInit(): void {
		let to = ''
		Object.entries(this.mapping).forEach(
			([key, value]) => {
				if(window.location.href.includes(key))
					to = value;
			}
		  );
		console.log(to)
		this.clickMenuAction(to)
	}

	async clickMenuAction(url){
		if (url.includes('https')){
			window.open(
				url,
				'_blank' // <- This is what makes it open in a new window.
			  );			  
		}
		this.lc.back()


	}

}
