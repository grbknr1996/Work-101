import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PendingPublicationsRoutingModule } from './pending-publications-journals-routing.module';
import { CapitalizeWordsPipe } from 'src/app/_pipes/capitalize-words.pipe';


@NgModule({
	declarations: [],
	imports: [
		CommonModule,
		PendingPublicationsRoutingModule
	],
	providers: [
		CapitalizeWordsPipe
	]
})
export class PendingPublicationsModule { }
