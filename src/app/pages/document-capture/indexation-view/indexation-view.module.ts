import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewIndexationDocumentRoutingModule } from './indexation-view-routing.module';
import { CaptureDocumentService } from '../../../_services/capture-document.service';



@NgModule({
	declarations: [],
	imports: [
		CommonModule,
		ViewIndexationDocumentRoutingModule
	],
	providers: [
		CaptureDocumentService
	]
})
export class ViewIndexationDocumentModule { }
