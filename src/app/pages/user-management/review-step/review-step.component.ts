import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BasicInfo } from '../basic-info-form/basic-info-form.component';
import { GroupAssignmentComponent } from 'src/app/components/group-assignment/group-assignment.component';

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
