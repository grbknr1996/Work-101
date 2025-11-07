import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentCaptureRoutingModule } from './document-capture-routing';
import { CaptureDocumentService } from 'src/app/_services/capture-document.service';


@NgModule({
	declarations: [],
	imports: [
		CommonModule,
		DocumentCaptureRoutingModule
	],
	providers: [
		CaptureDocumentService
	]
})
export class DocumentCaptureModule { }
