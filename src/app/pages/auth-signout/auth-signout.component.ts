import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../_services/auth.service';
import { MechanicsService } from '../../_services/mechanics.service';
import { configuration } from 'src/environments/environment';

@Component({
  selector: 'app-auth-signout',
  templateUrl: './auth-signout.component.html',
  standalone: false
})
export class AuthSignoutComponent implements OnInit {
  officeCode = '';
  officeConfig: any;
  langCode = '';

  constructor(private authService: AuthService, private ms: MechanicsService) {
    this.officeCode = this.authService.getCurrentOfficeCode() || 'default';
    this.officeConfig =
      configuration[this.officeCode] || configuration['default'];
    this.langCode = this.officeConfig?.defaultLanguage || 'en';
  }

  ngOnInit() {}
}
