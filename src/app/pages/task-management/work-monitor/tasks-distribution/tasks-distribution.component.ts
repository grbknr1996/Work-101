import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SidebarMenuService } from 'src/app/_services/sidebar-menu.service';
import { MechanicsService } from 'src/app/_services/mechanics.service';
import { TaskManagementService } from 'src/app/_services/taskManagement.service';
import { ProcessSummary, UnitMembers, UnitWithMembers } from 'src/app/schemas/taskManageMent-schema';
import { UserAccount } from 'src/app/_services/user.service';

@Component({
  selector: 'app-tasks-distribution',
  standalone:false,
  providers: [TaskManagementService],
  templateUrl: './tasks-distribution.component.html',
})
export class TasksDistributionComponent implements OnInit {
  breadcrumbItems = [];

  selectedMembers: UnitMembers[] = [];

  selectedProcess: string = '';
  customCellTemplate: any;
  processSummaries: ProcessSummary[] = [];
  members: UnitMembers[] = [];
  unitWithMembers: UnitWithMembers[] = [];
  processGroupByName: { name: string; list: ProcessSummary[] }[] = [];
  activeTabIndex: number = 0;

  loading: boolean = true;

  searchBar: string;

  groups: any[] = [];

  selectedProcessName: string;
  stageLabel: string;
  totalTasks: number;
  assignedTasks: number;
  tasksToDistribute: number;
  avgWorkQuantity: number;
  thresholdEnabled: boolean = false;
  distributionThreshold: number = 0;


  distributionType: 'EQUAL' | 'WORK_QUANTITY' = 'EQUAL';
  distributionOptions = [
    { label: 'Equal Distribution', value: 'EQUAL' },
    { label: 'Work Quantity Based', value: 'WORK_QUANTITY' },
  ];


  selectedUnitId: string | null = null;

  // Average Work Quantity and Tasks to Assign summary
  averageWorkQuantity = 15;
  tasksToAssign = 18;


  selectedUnit: UnitWithMembers | null = null;

  tableColumns = [];

  constructor(
    private taskManagementService: TaskManagementService,
    private menuService: SidebarMenuService,
    public ms: MechanicsService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
  ) {     
    this.tableColumns = [
      { headerDisplay: 'headerCheckbox', display: 'checkbox' },
      { field: 'name', header: this.ms.translate('taskManagement.distribution.table.header.name'), display: 'text' },
      { field: 'workMode', header: this.ms.translate('taskManagement.distribution.table.header.workMode'), display: 'tag' },
      { field: 'assignedTasks', header: this.ms.translate('taskManagement.distribution.table.header.assignedTasks'), display: 'text' },
      { field: 'projectedTasks', header: this.ms.translate('taskManagement.distribution.table.header.projectedTasks'), display: 'text' },
      { field: 'totalAfter', header: this.ms.translate('taskManagement.distribution.table.header.totalAfter'), display: 'text' }
    ];
  }

  ngOnInit() {

    this.selectedMembers = [...this.members];

    if (this.processGroupByName.length) {
      this.activeTabIndex = 0;
    }

    this.taskManagementService.getUnitsWithMembers().then(units => {
      this.unitWithMembers = units;
      console.log("Units loaded: ", this.unitWithMembers);
      if (units.length > 0) {
        this.selectedUnitId = units[0].id;
        this.onUnitChange(units[0].id);
      }
    });

    const currentPath = this.router.url;
    const menuItems = this.menuService.generateTaskManagementMenu(currentPath);
    this.menuService.updateMenuItems(menuItems);
    this.route.params.subscribe((params) => {
      const officeCode =
        params['officeCode'] || this.ms.getCurrentOffice() || 'default';
      const langCode = params['langCode'] || 'en';

      this.breadcrumbItems = [
        {
          label: 'Work Monitor',
          routerLink: `/${officeCode}/${langCode}/task-management/work-monitor`,
        },
        {
          label: 'Tasks Distribution',
          routerLink: `/${officeCode}/${langCode}/task-management/work-monitor/task-distribution`,
        },
      ];

      this.cdr.markForCheck();
    });
    this.route.queryParams.subscribe(params => {
      if (params['process']) {
        const process: ProcessSummary = JSON.parse(params['process']);
        console.log('Received process data:', process);
        this.selectedProcessName = process.processName;
        this.stageLabel = process.status;
        this.assignedTasks = process.assignedTasks;
        this.tasksToDistribute = process.unassignedTasks;
        this.totalTasks = process.assignedTasks + process.unassignedTasks;
      }
    });
  }


  onCancel() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  onActionClick(action: string, item: UserAccount) {

  }
  onUnitChange(unitId: string) {
    const selected = this.unitWithMembers.find(u => u.id === unitId);
    if (selected) {
      this.selectedUnit = selected;
      this.members = selected.members.map(m => ({
        ...m,
        projectedTasks: m.projectedTasks ?? 1,
        totalAfter: (m.assignedTasks ?? 0) + (m.projectedTasks ?? 1),
      }));
      this.selectedMembers = [...this.members];
      console.log("Members assigned in onUnitChange:", this.members);
      this.updateMembersProjectedTasks();
      this.updateAverageWorkQuantity();
    }
  }

  getProjectedTasksPerMember(): number {
    if (this.thresholdEnabled) {
      return this.distributionThreshold;
    }
    if (this.members.length > 0) {
      return Math.floor(this.tasksToDistribute / this.members.length);
    }
    return 0;
  }

  getAssignedTaskTotal(): number {
    return this.members?.reduce((sum, m) => sum + (m.projectedTasks ?? 0), 0) ?? 0;
  }

  getRemainingTasks(): number {
    return this.tasksToDistribute - this.getAssignedTaskTotal();
  }

  getTotalAssignedTasksOfMembers(): number {
    return this.members?.reduce((sum, m) => sum + (m.assignedTasks ?? 0), 0) ?? 0;
  }

  updateAverageWorkQuantity() {
    const totalAssigned = this.getTotalAssignedTasksOfMembers();
    this.avgWorkQuantity = totalAssigned > 0 ? Math.floor(this.totalTasks / totalAssigned) : 0;
  }

  logRow(row: any): string {
    if (!row) {
      console.warn('Undefined row detected in memberIncludeTemplate');
    }
    return '';
  }

  updateMembersProjectedTasks() {
    const selectedIds = new Set(this.selectedMembers.map(s => s.id));
    const numSelected = selectedIds.size;

    // Case 1: no selected → reset everything
    if (numSelected === 0) {
      this.members = this.members.map(m => ({
        ...m,
        projectedTasks: 0,
        totalAfter: (m.assignedTasks ?? 0),
      }));
      this.cdr.detectChanges();
      return;
    }

    // Threshold mode
    if (this.thresholdEnabled) {
      let remaining = this.tasksToDistribute;

      this.members = this.members.map(m => {
        if (selectedIds.has(m.id)) {
          const assign = Math.min(this.distributionThreshold, remaining);
          remaining -= assign;
          return {
            ...m,
            projectedTasks: assign,
            totalAfter: (m.assignedTasks ?? 0) + assign,
          };
        } else {
          return { ...m, projectedTasks: 0, totalAfter: (m.assignedTasks ?? 0) };
        }
      });

      this.cdr.detectChanges();
      return;
    }

    // Equal distribution mode
    const base = Math.floor(this.tasksToDistribute / numSelected);
    const remainder = this.tasksToDistribute % numSelected;

    let remainderLeft = remainder;

    this.members = this.members.map(m => {
      if (selectedIds.has(m.id)) {
        // const extra = remainderLeft > 0 ? 1 : 0;
        // if (remainderLeft > 0) remainderLeft--;

        // const proj = base + extra;

        return {
          ...m,
          projectedTasks: base,
          totalAfter: (m.assignedTasks ?? 0) + base,
        };
      } else {
        return { ...m, projectedTasks: 0, totalAfter: (m.assignedTasks ?? 0) };
      }
    });

    this.cdr.detectChanges();
  }


  get maxThreshold(): number {
    return this.members.length > 0 ? Math.floor(this.tasksToDistribute / this.members.length) : 0;
  }

  get isThresholdDisabled(): boolean {
    return this.distributionThreshold >= this.maxThreshold;
  }

  onThresholdChange() {
    if (this.distributionThreshold > this.maxThreshold) {
      this.distributionThreshold = this.maxThreshold;
    }
    if (this.distributionThreshold < 1) {
      this.distributionThreshold = 1;
    }
    this.updateMembersProjectedTasks();
  }

  onSelectionChange(selected: UnitMembers[]) {
    this.selectedMembers = selected;
    console.log('Currently selected members:', this.selectedMembers);
    this.updateMembersProjectedTasks();
  }

  onConfirm() {
  if (!this.selectedMembers || this.selectedMembers.length === 0) {
    alert('Please select at least one user to distribute tasks.');
    return;
  }

  const distribution = this.members
    .filter(m => this.selectedMembers.some(s => s.id === m.id))
    .map(m => ({
      userId: m.id,
      tasksToAssign: m.projectedTasks ?? 0
    }))
    .filter(a => a.tasksToAssign > 0);

  console.log('Tasks will be distributed as follows:', distribution);

  this.taskManagementService
    .assignTasksToMembers(distribution)
    .then(response => {
      alert('Tasks distribution confirmed successfully!');
      console.log('Distribution response:', response);
    })
    .catch(error => {
      console.error('Error distributing tasks:', error);
      alert('Error distributing tasks. Check console for details.');
    });
}


}
