//ANGULAR CORE
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

//PRIMENG
import { DrawerModule } from 'primeng/drawer';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';

const PrimeNGModules: any[] = [
  FormsModule,
  DrawerModule,
  RadioButtonModule,
  DatePickerModule,
  SelectModule
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