import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
export interface BasicInfo {
  username: string;
  email: string;
  telephone: string;
  clientId: string;
  loginId: string;
  profilePicture: string | ArrayBuffer | null;
  signaturePicture: string | ArrayBuffer | null;
  signatureType: string;
  userType: boolean; // true = external user, false = office user
  isActive: boolean;
  lean; // true = active, false = inactive
}

@Component({
  selector: 'app-basic-info-form',
  standalone: false,
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
      reader.onload = (e) => {
        this.formGroup.get('profilePicture').setValue(e.target?.result);
        this.cdr.detectChanges(); // Force change detection
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  onSignatureChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.formGroup.get('signaturePicture').setValue(e.target?.result);
        const fileExtension =
          file.name.split('.').pop()?.toLowerCase() || 'jpg';
        this.formGroup.get('signatureType').setValue(fileExtension);
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }
}
