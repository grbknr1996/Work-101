import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CognitoSyncComponentRoutingModule } from './cognito-sync-routing.module';

@NgModule({
  imports: [CommonModule, CognitoSyncComponentRoutingModule],
})
export class CognitoSyncModule {}
