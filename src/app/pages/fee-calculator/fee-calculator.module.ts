import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FeeCalculatorComponentRoutingModule } from './fee-calculator-routing.module';
import { FeeService } from 'src/app/_services/fee.service';


@NgModule({
	declarations: [],
	imports: [
		CommonModule,
		FeeCalculatorComponentRoutingModule
	],
	providers: [
		FeeService
	]
})
export class FeeCalculatorComponentModule { }
