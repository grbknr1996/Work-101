import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-validation-errors',
  standalone: false,
  templateUrl: './validation-errors.component.html',
})
export class ValidationErrorsComponent {
  @Input() control: AbstractControl | null = null;
}
