import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MechanicsService } from '../../_services/mechanics.service';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { ChipModule } from 'primeng/chip';

@Component({
  selector: 'app-unauthorized',
  templateUrl: './unauthorized.component.html',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, DividerModule, ChipModule],
})
export class UnauthorizedComponent {
  constructor(
    private router: Router,
    private mechanicsService: MechanicsService
  ) {}

  goBack(): void {
    const officeCode = this.mechanicsService.getCurrentOffice() || 'default';
    const langCode = this.mechanicsService.lang || 'en';
    this.router.navigate([`/${officeCode}/${langCode}/dashboard`]);
  }

  goToHome(): void {
    const officeCode = this.mechanicsService.getCurrentOffice() || 'default';
    const langCode = this.mechanicsService.lang || 'en';
    this.router.navigate([`/${officeCode}/${langCode}/dashboard`]);
  }
}
