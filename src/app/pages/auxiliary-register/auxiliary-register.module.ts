import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuxiliaryRegisterRoutingModule } from './auxiliary-register-routing.module';
import { AuxiliaryRegisterService } from 'src/app/_services/auxiliary-register.service';

@NgModule({
  declarations: [

  ],
  imports: [CommonModule, AuxiliaryRegisterRoutingModule],
  exports: [],
  providers: [
    AuxiliaryRegisterService
  ]
})
export class AuxiliaryRegisterModule { }
