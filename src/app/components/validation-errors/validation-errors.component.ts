import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AbstractControl } from "@angular/forms";

@Component({
  selector: "app-validation-errors",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./validation-errors.component.html",
})
export class ValidationErrorsComponent {
  @Input() control: AbstractControl | null = null;
}
