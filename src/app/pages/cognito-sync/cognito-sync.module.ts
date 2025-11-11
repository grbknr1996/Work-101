import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CognitoSyncComponentRoutingModule } from './cognito-sync-routing.module';
import { CognitoSyncComponent } from './cognito-sync.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@NgModule({
  imports: [CommonModule, CognitoSyncComponentRoutingModule, ProgressSpinnerModule],
  declarations: [CognitoSyncComponent],
})
export class CognitoSyncModule {}




