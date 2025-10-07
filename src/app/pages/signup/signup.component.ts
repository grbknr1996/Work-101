import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MechanicsService } from '../../_services/mechanics.service';
import { AuthService } from '../../_services/auth.service';

interface RoleOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-signup',
  standalone: false,
  templateUrl: './signup.component.html',
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup;
  officeCode: string;
  langCode: string;
  officeLogo: string;
  officeName: string;
  loading = false;
  errorMessage = '';
  successMessage = '';

  roleOptions: RoleOption[] = [
    { label: 'Administrator', value: 'admin' },
    { label: 'User', value: 'user' },
    { label: 'Manager', value: 'manager' },
    { label: 'Viewer', value: 'viewer' },
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    public ms: MechanicsService,
    private authService: AuthService
  ) {
    this.officeCode = this.route.snapshot.params['officeCode'] || 'default';
    this.langCode = this.route.snapshot.params['langCode'] || 'en';
  }

  ngOnInit() {
    // Set office context
    this.ms.setCurrentOffice(this.officeCode);
    this.ms.switchLang(this.langCode);

    // Get office logo and name
    this.officeLogo = this.ms.getLogo();
    this.officeName = this.ms.getOfficeName();

    this.initForm();
  }

  private initForm() {
    this.signupForm = this.fb.group({
      givenName: ['', [Validators.required, Validators.minLength(2)]],
      familyName: ['', [Validators.required, Validators.minLength(2)]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
      agreeToTerms: [false, Validators.requiredTrue],
    });
  }

  onSubmit() {
    if (this.signupForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const formData = this.signupForm.value;

      // Here you would typically call your auth service to register the user
      // For now, we'll simulate the registration process
      setTimeout(() => {
        this.loading = false;
        this.successMessage =
          'Account created successfully! Please check your email for verification.';

        // Redirect to sign-in page after successful registration
        setTimeout(() => {
          this.router.navigate([
            `/${this.officeCode}/${this.langCode}/sign-in`,
          ]);
        }, 2000);
      }, 1500);
    } else {
      this.signupForm.markAllAsTouched();
    }
  }

  onSignIn() {
    this.router.navigate([`/${this.officeCode}/${this.langCode}/sign-in`]);
  }

  getFieldError(fieldName: string): string {
    const field = this.signupForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['minlength']) {
        return `${this.getFieldLabel(fieldName)} must be at least ${
          field.errors['minlength'].requiredLength
        } characters`;
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      givenName: 'Given Name',
      familyName: 'Family Name',
      username: 'Username',
      email: 'Email',
      role: 'Role/Position',
    };
    return labels[fieldName] || fieldName;
  }
}
