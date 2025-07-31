import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/_guards/auth.guard';
import { DataPackagesComponent } from './data-packages.component';

const routes: Routes = [
  {
    path: 'data-packages',
    component: DataPackagesComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DataPackagesRoutingModule {}
