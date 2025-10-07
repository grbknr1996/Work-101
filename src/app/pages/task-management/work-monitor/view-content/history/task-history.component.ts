import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TaskManagementService } from 'src/app/_services/taskManagement.service';

interface TreeNode {
  label?: string;
  data?: any;
  expandedIcon?: string;
  collapsedIcon?: string;
  children?: TreeNode[];
  leaf?: boolean;
}

@Component({
  selector: 'app-task-history',
  standalone: false,
  providers: [TaskManagementService],
  templateUrl: './task-history.component.html',
})
export class TaskHistoryComponent implements OnInit {
  @Input() showLayout: boolean = true; 
  @Input() taskId: string | null = null;

  officeCode = 'default';
  langCode = 'en';
  breadcrumbItems = [];
  
workflowTree: TreeNode[] = [
  {
    label: 'TM Application Received',
    data: { status: 'Completed', assignees: ['SA'], users: 1, date: '2024-01-15', comments: ['Reviewed documents'] },
  },
  {
    label: 'Formality Examination',
    data: { status: 'Completed', assignees: ['SW','FU'], users: 2, subProcesses: 2, date: '2024-01-16' },
    children: [
      {
        label: 'TM Formality Check',
        data: { status: 'Completed', severity: 'success', assignee: 'Sarah Wilson', date: '2024-01-16' }
      }
    ]
  },
  {
    label: 'Substantive Examination',
    data: { status: 'Completed', assignees: ['TA','CE','D+3'], users: 6, subProcesses: 2, date: '2024-01-18', assignedToMe: true },
    children: [
      {
        label: 'TM Examination',
        data: { status: 'Completed', severity: 'success', assignee: 'Tom Anderson', date: '2024-01-18' }
      },
      {
        label: 'Applicant Address Change Request',
        data: {
          status: 'In Progress',
          severity: 'info',
          assignee: 'ankitakumar3', // assigned to you
          assignedToMe: true,
          description: 'Applicant requested address update from old business location',
          date: '2024-01-18'
        }
      }
    ]
  },
  {
    label: 'Publication Fee Processing',
    data: { status: 'Completed', assignees: ['MG'], users: 1, date: '2024-01-22' }
  },
  {
    label: 'Publication Processing',
    data: { status: 'In Progress', isCurrent: true, assignees: ['LB','DT','PK'], users: 3, subProcesses: 2, date: '2024-01-25' },
    children: [
      {
        label: 'Opposition Filed',
        data: {
          status: 'Completed',
          severity: 'danger',
          assignee: 'Maria Garcia',
          description: 'Opposition filed by competing brand claiming similarity',
          date: '2024-02-15'
        }
      },
      {
        label: 'Legal Analysis',
        data: {
          status: 'In Progress',
          severity: 'info',
          assignee: 'Pankaj Kumar',
          date: '2024-02-20',
          comments: ['Currently analyzing strength of opposition claims and potential defenses']
        }
      },
      {
        label: 'Applicant Nationality Request',
        data: {
          status: 'Pending',
          severity: 'warning',
          assignee: 'Jennifer Lee',
          description: 'Sent letter requesting missing nationality information from applicant',
          date: '2024-02-21'
        }
      }
    ]
  },
  {
    label: 'Opposition Period Monitoring',
    data: { status: 'Not Started', users: 0 }
  },
  {
    label: 'Registration Certificate',
    data: { status: 'Not Started', users: 0 }
  }
];

expandedKeys: { [key: string]: boolean } = {};

  constructor(
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    console.log('Task ID:', this.taskId);
    this.officeCode = this.route.snapshot.paramMap.get('officeCode') || 'default';
    this.langCode = this.route.snapshot.paramMap.get('langCode') || 'en';
    if (!this.taskId) {
      this.taskId = this.route.snapshot.paramMap.get('documentId') || '';
    }
  }

toggleComments(step: any) {
  step.showComments = !step.showComments;
}

getDotClass(step: any) {
  return step.data?.assignedToMe
    ? { 'bg-yellow-400 ring-2 ring-yellow-500': true }
    : step.data?.status === 'Completed'
    ? { 'bg-green-500 shadow-lg': true }
    : step.data?.status === 'In Progress'
    ? { 'bg-blue-500 ring-2 ring-blue-500': true }
    : (step.data?.status === 'Not Started' || step.data?.status === 'Pending')
    ? { 'bg-gray-400': true }
    : {};
}

  hasAssignedSubtask(step: any): boolean {
  if (!step.children || !Array.isArray(step.children)) return false;
  return step.children.some((child: any) => child.data?.assignedToMe);
  }

}
