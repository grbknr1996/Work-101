import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CognitoSyncComponent } from './cognito-sync.component';

const routes: Routes = [{ path: '', component: CognitoSyncComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CognitoSyncComponentRoutingModule {}




