import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { JournalPublicationComponentRoutingModule } from './journal-publication-routing.module';
import { CapitalizeWordsPipe } from 'src/app/_pipes/capitalize-words.pipe';


@NgModule({
	declarations: [],
	imports: [
		CommonModule,
		JournalPublicationComponentRoutingModule
	],
	providers: [
		CapitalizeWordsPipe
	]
})
export class JournalPublicationComponentModule { }
