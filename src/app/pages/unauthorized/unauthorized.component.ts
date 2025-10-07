import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MechanicsService } from '../../_services/mechanics.service';


@Component({
  selector: 'app-unauthorized',
  templateUrl: './unauthorized.component.html',
  standalone: false,
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
