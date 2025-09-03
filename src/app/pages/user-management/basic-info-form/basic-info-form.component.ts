import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ValidationErrorsComponent } from 'src/app/components/validation-errors/validation-errors.component';

export interface BasicInfo {
  username: string;
  email: string;
  telephone: string;
  clientId: string;
  loginAlias: string;
  signature: string;
  profilePicture: string | ArrayBuffer | null;
  signatureImage: string | ArrayBuffer | null;
  userType: boolean; // true = external user, false = office user
}

@Component({
  selector: 'app-basic-info-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ToggleSwitchModule,
    ValidationErrorsComponent,
  ],
  templateUrl: './basic-info-form.component.html',
})
export class BasicInfoFormComponent {
  @Input() formGroup: FormGroup;
  @Input() isEditMode: boolean = false;

  constructor(private cdr: ChangeDetectorRef) {}

  onProfilePictureChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = e => {
        this.formGroup.get('profilePicture').setValue(e.target?.result);
        this.cdr.detectChanges(); // Force change detection
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  onSignatureChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = e => {
        this.formGroup.get('signatureImage').setValue(e.target?.result);
        this.cdr.detectChanges(); // Force change detection
      };
      reader.readAsDataURL(input.files[0]);
    }
  }
}
