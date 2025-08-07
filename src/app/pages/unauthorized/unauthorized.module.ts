import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UnauthorizedComponent } from './unauthorized.component';

@NgModule({
  imports: [CommonModule, RouterModule, UnauthorizedComponent],
})
export class UnauthorizedModule {}
