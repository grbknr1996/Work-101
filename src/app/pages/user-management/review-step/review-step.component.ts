import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-review-step',
  standalone: false,
  templateUrl: './review-step.component.html',
})
export class ReviewStepComponent {
  @Input() basicInfo: any;
  @Input() assignedGroups: any[] = [];
  @Input() security: any;
  @Input() isEditMode: boolean = false;
}
