import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DataCaptureComponent } from './data-capture.component';
import { provideHttpClient } from '@angular/common/http';

const routes: Routes = [
  {
    path: '',
    component:  DataCaptureComponent,
  },
  {
    path: 'dashboard',
    component:  DataCaptureComponent,
  },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ],
  exports: [RouterModule],
  providers: [
    provideHttpClient()
  ]
})
export class  DataCaptureModule {}
