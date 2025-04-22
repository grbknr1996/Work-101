import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { formatDate } from '@angular/common';

import { MechanicsService } from 'src/app/_services/mechanics.service';
import { instanceType } from 'src/app/utils';
import { environment, configuration} from 'src/environments/environment';
import { QueryParamsService } from 'src/app/_services/queryParams.service';

@Component({
	selector: 'nav-bar',
	templateUrl: './comp-nav-bar.component.html',
	standalone: false,
	encapsulation: ViewEncapsulation.None
})
export class CompMenuBar implements OnInit {


	public active = 1
	public selectedCity;
	public availableLangs;
	public navigationItems: any[] = []
	public navigationItemsRight: any[] = []

	public hide_title = false
	constructor(private ar: ActivatedRoute,
		public ms: MechanicsService,
		public qp: QueryParamsService,
		private router: Router
	) { }

	ngOnInit() {
		this.buildNavigation()
	}


	public makeRouterLink(endpoint: string): string {

		const l = `MenuBar makeRouterLink() - `

		const route = this.ms.makeRoute({ path: endpoint, subpath: '', caller: l })

		// console.log(`${l}route for '${endpoint}' = `, route)

		return route
	}

	private labels_map = {
		'datacoverage': 'home.link.label'
	}

	get title(){
		if((configuration[instanceType()].order + 'datacoverage').includes(this.ms.endpoint))
			return this.ms.translate(this.labels_map[this.ms.endpoint] || `module.${this.ms.endpoint}.label`)
		return ''
	}

	addItemToMenu(module){
		if (configuration[instanceType()]['module'][module]){
			this.navigationItems.push(
				{
					label: this.ms.translate(this.labels_map[module] || `module.${module}.label`),
					routerLink: this.makeRouterLink(module)
				}
			)
		}
	}

	async onChangeLang(event){
		const l = `MenuBar onChangeLang() - `
		this.ms.switchLang(this.ms.lang)
		let path = this.ms.makeRoute({ path: this.ms.endpoint, subpath: '', caller: l })
		await this.qp.queryParamsObjectToUrl(path, true)
		window.location.reload()
	}

	async buildNavigation(): Promise<void> {

		const l: string = `app buildNavigation() - `
		// console.log(`${l}`);

		while (!this.ms.translations) {
			await new Promise(r => setTimeout(r, 10))
		}

		this.availableLangs = this.ms.availableLangs
			.map((lang: string) => ({
				value: lang,
				label: this.ms.translate(`language.display.label.${lang}`)
			}));
		this.navigationItems = []
		this.addItemToMenu('datacoverage')

		for(let item of configuration[instanceType()].order){
			this.addItemToMenu(item)
		}


		this.navigationItemsRight.push(
			{
				label: this.ms.translate(`wipo.publish.about.label`),
				routerLink: this.makeRouterLink('about')
			}
		)

	
	}
}

