import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DataPackagesComponent } from './data-packages.component';
import { AuthorityFilesComponent } from './authority-files/authority-files.component';
import { provideHttpClient } from '@angular/common/http';
import { SelectOfficeComponent } from './select-office/select-office.component';

const routes: Routes = [
  {
    path: 'authority-files',
    component: AuthorityFilesComponent,
  },
  {
    path: 'select-office',
    component: SelectOfficeComponent,
  },
  {
    path: '',
    component: DataPackagesComponent,
  },
  {
    path: ':office',
    component: DataPackagesComponent,
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
export class DataPackageModule {}
