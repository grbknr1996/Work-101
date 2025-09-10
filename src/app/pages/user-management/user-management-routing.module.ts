import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/_guards/auth.guard';
import { UserAccountsComponent } from './user-accounts/user-accounts.component';
import { GroupsComponent } from './groups/groups.component';

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
    loadComponent: () =>
      import('./create-user-account/create-user-account.component').then(
        (m) => m.CreateUserAccountComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'user-accounts/edit-user-account/:userId',
    loadComponent: () =>
      import('./create-user-account/create-user-account.component').then(
        (m) => m.CreateUserAccountComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'user-accounts/groups',
    component: GroupsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'user-accounts/groups/create',
    loadComponent: () =>
      import('./groups/group-form/group-form.component').then(
        (m) => m.GroupFormComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'user-accounts/groups/edit/:groupId',
    loadComponent: () =>
      import('./groups/group-form/group-form.component').then(
        (m) => m.GroupFormComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'units',
    loadComponent: () =>
      import('./units/units-page.component').then((m) => m.UnitsPageComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'units/create',
    loadComponent: () =>
      import('./units/create-unit/create-unit.component').then(
        (m) => m.CreateUnitComponent
      ),
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserManagementRoutingModule {}
