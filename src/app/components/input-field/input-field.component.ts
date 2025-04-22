import { CommonModule } from "@angular/common";
import { Component, Input, Optional, Self, OnInit } from "@angular/core";
import {
  ControlValueAccessor,
  NgControl,
  ReactiveFormsModule,
  FormsModule,
} from "@angular/forms";
import { ButtonLabel } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { TooltipModule } from "primeng/tooltip";

@Component({
  selector: "app-input-field",
  templateUrl: "./input-field.component.html",
  styleUrls: ["./input-field.component.css"],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    InputTextModule,
    TooltipModule,
    ButtonLabel,
  ],
})
export class InputFieldComponent implements ControlValueAccessor, OnInit {
  @Input() label: string = "";
  @Input() placeholder: string = "";
  @Input() type: "text" | "password" | "email" | "number" | "tel" = "text";
  @Input() helpText: string = "";
  @Input() prefixIcon: string = "";
  @Input() suffixIcon: string = "";
  @Input() disabled: boolean = false;
  @Input() readonly: boolean = false;
  @Input() required: boolean = false;
  @Input() maxLength?: number;
  @Input() showCounter: boolean = false;
  @Input() autocomplete: string = "on";
  @Input() styleClass: string = "";
  @Input() labelClass: string = "";
  @Input() inputClass: string = "";
  @Input() errorMessages: { [key: string]: string } = {
    required: "This field is required",
    email: "Please enter a valid email",
    pattern: "The input format is invalid",
    minlength: "Input is too short",
    maxlength: "Input is too long",
  };
  showClearButton = true;
  value: any = "";
  isFocused: boolean = false;
  isDisabled: boolean = false;
  inputId: string = "input_" + Math.random().toString(36).substring(2, 11);

  // For ControlValueAccessor
  onChange: any = () => {};
  onTouched: any = () => {};

  constructor(@Optional() @Self() public ngControl: NgControl) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnInit(): void {
    this.isDisabled = this.disabled;
  }

  // ControlValueAccessor methods
  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  onInputChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.value = value;
    this.onChange(value);
  }

  onBlur(): void {
    this.isFocused = false;
    this.onTouched();
  }

  onFocus(): void {
    this.isFocused = true;
  }

  get currentCharCount(): number {
    return this.value ? this.value.length : 0;
  }

  get showErrors(): boolean {
    if (!this.ngControl) return false;

    const control = this.ngControl.control;
    return control
      ? control.invalid && (control.touched || control.dirty)
      : false;
  }

  get errorMessage(): string {
    if (!this.ngControl || !this.ngControl.errors) return "";

    const errors = this.ngControl.errors;
    const errorKeys = Object.keys(errors);

    if (errorKeys.length === 0) return "";

    const firstError = errorKeys[0];

    // Handle minlength and maxlength with dynamic values
    if (firstError === "minlength") {
      const requiredLength = errors["minlength"].requiredLength;
      return `Minimum length is ${requiredLength} characters`;
    }

    if (firstError === "maxlength") {
      const requiredLength = errors["maxlength"].requiredLength;
      return `Maximum length is ${requiredLength} characters`;
    }

    return this.errorMessages[firstError] || "Invalid input";
  }
}
