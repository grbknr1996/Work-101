import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FeeConfigComponentRoutingModule } from './fee-config-routing.module';
import { FeeService } from 'src/app/_services/fee.service';


@NgModule({
	declarations: [],
	imports: [
		CommonModule,
		FeeConfigComponentRoutingModule
	],
	providers: [
		FeeService
	]
})
export class FeeConfigComponentModule { }
