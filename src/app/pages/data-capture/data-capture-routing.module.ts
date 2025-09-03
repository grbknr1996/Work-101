import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/_guards/auth.guard';
import { DataCaptureComponent } from './data-capture.component';

const routes: Routes = [
  {
    path: 'data-capture',
    component: DataCaptureComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class  DataCaptureRoutingModule {}
