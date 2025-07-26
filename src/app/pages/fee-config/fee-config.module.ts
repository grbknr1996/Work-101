import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeeConfigComponent } from './fee-config.component';
import { RouterModule, Routes } from '@angular/router';
import { CustomerService } from 'src/app/_services/customerservice';
import { provideHttpClient } from '@angular/common/http';

const routes: Routes = [
  {
    path: '',
    component: FeeConfigComponent,
  },
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ],
  providers: [
    provideHttpClient(),
    CustomerService
  ]
})
export class FeeConfigModule { }
