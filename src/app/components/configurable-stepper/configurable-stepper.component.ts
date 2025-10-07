import { Component, Input, Output, EventEmitter } from '@angular/core';

export interface StepperStep {
  value: number;
  icon: string;
  label: string;
  completed?: boolean;
}

@Component({
  selector: 'app-configurable-stepper',
  standalone: false,
  templateUrl: './configurable-stepper.component.html',
})
export class ConfigurableStepperComponent {
  @Input() steps: StepperStep[] = [];
  @Input() activeStep: number = 0;
  @Output() stepChange = new EventEmitter<number>();

  onStepClick(stepValue: number): void {
    if (stepValue <= this.activeStep) {
      this.stepChange.emit(stepValue);
    }
  }

  isStepActive(stepValue: number): boolean {
    return stepValue === this.activeStep;
  }

  isStepCompleted(stepValue: number): boolean {
    return stepValue < this.activeStep;
  }

  isStepClickable(stepValue: number): boolean {
    return stepValue <= this.activeStep;
  }
}
