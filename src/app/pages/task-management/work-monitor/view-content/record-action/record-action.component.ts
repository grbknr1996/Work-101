import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskManagementService } from 'src/app/_services/taskManagement.service';
import { UnitMembers, UnitWithMembers } from 'src/app/schemas/taskManageMent-schema';

@Component({
  selector: 'app-record-actions',
  standalone:false,
  providers: [TaskManagementService],
  templateUrl: './record-action.component.html',
})
export class RecordActionComponent implements OnInit {
  @Input() showLayout: boolean = true; 
  @Input() taskId: string | null = null;

  officeCode = 'default';
  langCode = 'en';
  breadcrumbItems = [];


  checklistItems = [
    {
      label: 'Technical Requirements Verification',
      children: [
        {
          label: 'Claims Analysis',
          children: [
            { label: 'Independent claims reviewed' },
            { label: 'Dependent claims verified' },
            { label: 'Claim scope assessed' }
          ]
        },
        { label: 'Technical description completeness' },
        { label: 'Drawing quality and accuracy' }
      ]
    },
    {
      label: 'Legal Compliance Check',
      children: [
        { label: 'Formal requirements compliance' },
        {
          label: 'Patent law adherence',
          children: [
            { label: 'Novelty assessment' },
            { label: 'Inventive step evaluation' }
          ]
        }
      ]
    },
    {
      label: 'Prior Art Search',
      children: [
        { label: 'Patent database search completed' },
        { label: 'Non-patent literature reviewed' },
        { label: 'Search results documented' }
      ]
    },
    {
      label: 'Documentation Review',
      children: [
        { label: 'All required documents present' }
      ]
    }
  ];

  selectedChecklistItems: any;


  assessment = '';
  analysis = '';
  detailedReviewNotes = '';
  recommendations = '';
  additionalComments = '';

  units: UnitWithMembers[] = [];
  members: UnitMembers[] = [];
  selectedUnitId: string | null = null;
  selectedMemberId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskManagementService
  ) { }

  ngOnInit(): void {

    this.officeCode = this.route.snapshot.paramMap.get('officeCode') || 'default';
    this.langCode = this.route.snapshot.paramMap.get('langCode') || 'en';
    if(!this.taskId){
      this.taskId = this.route.snapshot.paramMap.get('taskId') || '';
    }
    this.loadUnits();
  }

  private async loadUnits() {
    try {
      this.units = await this.taskService.getUnitsWithMembers();
    } catch (e) {
      console.error('Error loading units', e);
    }
  }

  onUnitChange(unitId: string | null) {
    this.selectedUnitId = unitId;
    if (!unitId) {
      this.members = [];
      this.selectedMemberId = null;
      return;
    }
    const u = this.units.find(x => x.id === unitId);
    this.members = u ? [...u.members] : [];
    this.selectedMemberId = null;
  }



  assignAction() {
    console.log({
      assessment: this.assessment,
      analysis: this.analysis,
      detailedReviewNotes: this.detailedReviewNotes,
      recommendations: this.recommendations,
      additionalComments: this.additionalComments,
      checklist: this.selectedChecklistItems,
      unitId: this.selectedUnitId,
      memberId: this.selectedMemberId
    });
  }
  cancelAction() {
  const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
  if (returnUrl) {
    this.router.navigateByUrl(returnUrl);
  } else {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  }

}
