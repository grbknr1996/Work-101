import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-review-step',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './review-step.component.html',
})
export class ReviewStepComponent {
  @Input() basicInfo: any;
  @Input() assignedGroups: any[] = [];
  @Input() security: any;
}
