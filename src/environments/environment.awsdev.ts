
// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
	installedInstances:['asean'],

	env: "awsDev",
	appUrl: "http://localhost:4200",
	backendUrl: "https://asean.wipopublish-webapp-dev.ipobs.dev.web1.wipo.int/api/",		
};


export const configuration = {
	default: {
		module: {
			edms: true,
			patents:true,
			designs:true,
			trademarks:true,
			datacoverage:true,
			gidatabase:true,
			portfolios:true,
		},
		order: ['patents','designs','trademarks','gidatabase', 'portfolios'],
		availableLangs: ['ar','en', 'fr', 'id', 'jp', 'kh','ms','vi'],
		defaultLanguage: 'en',
		defaultLandingModule:'about',
		

	},
	asean: {
		module: {
			edms: true,
			patents:true,
			designs:true,
			trademarks:true,
			datacoverage:true,
			gidatabase:true,
			portfolios:true,
		},
		order: ['patents','designs','trademarks','gidatabase', 'portfolios'],
		availableLangs: ['ar','en', 'fr', 'id', 'jp', 'kh','ms','vi'],
		defaultLanguage: 'fr',
		defaultLandingModule:'about',
	}
}