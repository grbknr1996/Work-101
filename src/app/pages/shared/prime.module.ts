//ANGULAR CORE
import { NgModule } from '@angular/core';

//PRIMENG
import { ButtonModule } from 'primeng/button';

const PrimeNGModules: any[] = [
  ButtonModule
];

@NgModule({
  imports: [
    PrimeNGModules
  ],
  exports: [
    PrimeNGModules
  ]
})
export class PrimeNGModule { }