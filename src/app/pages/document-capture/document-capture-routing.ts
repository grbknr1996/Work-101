import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DocumentCaptureComponent } from './document-capture.component';

const routes: Routes = [
  { path: '', component: DocumentCaptureComponent }, // Actually a sub-path of `**`
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DocumentCaptureRoutingModule { }
