import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/_guards/auth.guard';
import { UserAccountsComponent } from './user-accounts/user-accounts.component';
import { GroupsComponent } from './groups/groups.component';
import { CreateUserAccountComponent } from './create-user-account/create-user-account.component';
import { GroupFormComponent } from './groups/group-form/group-form.component';
import { UnitsPageComponent } from './units/units-page.component';
import { CreateUnitComponent } from './units/create-unit/create-unit.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'user-accounts',
    pathMatch: 'full',
  },
  {
    path: 'user-accounts',
    component: UserAccountsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'user-accounts/create-user-account',
    component: CreateUserAccountComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'user-accounts/edit-user-account/:userId',
    component: CreateUserAccountComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'user-accounts/groups',
    component: GroupsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'user-accounts/groups/create',
    component: GroupFormComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'user-accounts/groups/edit/:groupId',
    component: GroupFormComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'units',
    component: UnitsPageComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'units/create',
    component: CreateUnitComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserManagementRoutingModule {}
