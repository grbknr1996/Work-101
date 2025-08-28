//ANGULAR CORE
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

//PRIMENG
import { DrawerModule } from 'primeng/drawer';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { TabsModule } from 'primeng/tabs';

const PrimeNGModules: any[] = [
  CommonModule,
  FormsModule,
  DrawerModule,
  RadioButtonModule,
  DatePickerModule,
  SelectModule,
  ButtonModule,
  TabsModule
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