import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { configuration

 } from 'src/environments/environment';
import { instanceType } from './utils';
const routes: Routes = [


	{
		path: ':lang/:office/new_link', 
		loadChildren: async () => (await import("./pages/page-redirect/page-redirect.module")).PageRedirectModule
	},


	{
		path: `:lang/about`,
		loadChildren: async () => (await import("./pages/page-about/page-about.module")).PageAboutModule
	},
	{
		path: `:lang/notfound`,
		loadChildren: async () => (await import("./pages/page-notfound/page-notfound.module")).PageNotfoundModule
	},
	/*
		REDIRECTIONS AND DEFAULT ROUTES
	*/

	{ path: ':lang', redirectTo: `:lang/${configuration[instanceType()].defaultLandingModule}`, pathMatch: 'full' },

	{ path: ':lang/', redirectTo: `:lang/${configuration[instanceType()].defaultLandingModule}`, pathMatch: 'full' },


	{ path: '', redirectTo: `${configuration[instanceType()].defaultLanguage}/${configuration[instanceType()].defaultLandingModule}`, pathMatch: 'full' },

	{
	  path: '**',
		loadChildren: async () => (await import("./pages/page-notfound/page-notfound.module")).PageNotfoundModule
	}
];

@NgModule({
	imports: [RouterModule.forRoot(routes, {
		enableTracing: false,
		initialNavigation: 'disabled' // initial navigation happens after doSSO() in auth.service
	})],
	exports: [RouterModule]
})
export class AppRoutingModule { }
