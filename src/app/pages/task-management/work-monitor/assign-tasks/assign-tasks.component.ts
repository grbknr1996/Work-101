import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MechanicsService } from 'src/app/_services/mechanics.service';
import {
  ConfigurableFilterComponent,
  FilterConfig,
  FilterValue,
} from 'src/app/components/configurable-filter/configurable-filter.component';
import { TaskManagementService } from 'src/app/_services/taskManagement.service';
import { ProcessSummary, TasksDetails, UnitMembers, UnitWithMembers } from 'src/app/schemas/taskManageMent-schema';

@Component({
  selector: 'app-work-monitor',
  standalone: false,
  providers: [TaskManagementService],
  templateUrl: './assign-tasks.component.html',
})
export class AssignTasksComponent implements OnInit {
  @ViewChild(ConfigurableFilterComponent)
  configurableFilter!: ConfigurableFilterComponent;
  breadcrumbItems = [];
  testChecked = false;
  selectedTasks: TasksDetails[] = [];
  processSummaries: ProcessSummary[] = [];
  members: UnitMembers[] = [];
  unitWithMembers: UnitWithMembers[] = [];;

  selectedProcessName = 'Industrial Design';
  stageLabel = 'Examination';
  totalTasks = 52;
  assignedTasks = 34;
  tasksToDistribute = 18;


  selectedUnitId: string | null = null;
  selectedMemberId: string | null = null;
  selectedUnit: UnitWithMembers | null = null;
  tasksList: TasksDetails[] = [];
  // Pagination properties
  currentPage = 0;
  pageSize = 10;
  totalRecords = 0;

  tableColumnsBase = [];
  tableColumnsAssignedExtra = [];
  tableColumns = [];

  filterConfigs: FilterConfig[] = [];
  filteredGroups: any[] = [];
  appliedFilters: FilterValue[] = [];
  groups: any[] = [];
  searchBar: string;

  constructor(
    private taskManagementService: TaskManagementService,
    public ms: MechanicsService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.initializeConfigurations();
   }

  ngOnInit() {

    console.log("test data", this.selectedTasks)

    this.taskManagementService.getUnitsWithMembers().then(units => {
      this.unitWithMembers = units;
      console.log("Units loaded: ", this.unitWithMembers);
    });

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
          label: 'Tasks Assignment',
          routerLink: `/${officeCode}/${langCode}/task-management/work-monitor/task-assignment`,
        },
      ];
      this.cdr.markForCheck();
    });
    this.route.queryParams.subscribe(async (params) => {
      if (params['processId']) {
        const processId = params['processId'];
        const processWithTasks = await this.taskManagementService.getTasksByProcess(processId);
        if (processWithTasks) {
          this.selectedProcessName = processWithTasks.processName;
          this.stageLabel = processWithTasks.status;
          this.assignedTasks = processWithTasks.assignedTasks;
          this.tasksToDistribute = processWithTasks.unassignedTasks;
          this.totalTasks = processWithTasks.assignedTasks + processWithTasks.unassignedTasks;
          this.tasksList = processWithTasks.tasks ?? [];
          console.log("Tasks loaded for assignment:", this.tasksList);
          this.applyFilters(this.appliedFilters);
        }
      }
    });

  }

  private initializeConfigurations(): void {
    this.filterConfigs = [
      {
        key: 'assignmentStatus',
        label: 'Task Status',
        type: 'radio',
        options: [
          { label: 'Assigned Tasks', value: 'assigned' },
          { label: 'Unassigned Tasks', value: 'unassigned' },
        ],
        defaultValue: 'unassigned' // default = show Unassigned
      }
    ];

    this.tableColumnsBase = [
      { field: 'checkbox', header: this.ms.translate('taskManagement.assigntasks.table.header.selected'), display: 'checkbox' },
      { field: 'description', header: this.ms.translate('taskManagement.assigntasks.table.header.description'), display: 'text' },
      { field: 'documentId', header: this.ms.translate('taskManagement.assigntasks.table.header.documentId'), display: 'text' },
      { field: 'receivedOn', header: this.ms.translate('taskManagement.assigntasks.table.header.receivedOn'), sortable: true },
      { field: 'lastAction', header: this.ms.translate('taskManagement.assigntasks.table.header.lastAction'), display: 'text' },
      { field: 'age', header: this.ms.translate('taskManagement.assigntasks.table.header.age'), sortable: true, display: 'text' },
      { field: 'daysOverDue', header: this.ms.translate('taskManagement.assigntasks.table.header.daysOverDue'), sortable: true, display: 'text' },
      { field: 'lastResponsibleUser', header: this.ms.translate('taskManagement.assigntasks.table.header.lastResponsibleUser'), display: 'text' },
      {
        field: 'actions', header: this.ms.translate('taskManagement.assigntasks.table.header.actions'), display: 'actions',
        actions: [
          {
            label: this.ms.translate('taskManagement.assigntasks.table.actions.viewContent'),
            icon: 'pi pi-eye',
            action: 'viewContent',
            severity: 'info',
          },
        ]
      }
    ];

    this.tableColumnsAssignedExtra = [
      { field: 'assignedUnit', header: this.ms.translate('taskManagement.assigntasks.table.header.assignedUnit'), display: 'text' },
      { field: 'assignedUser', header: this.ms.translate('taskManagement.assigntasks.table.header.assignedUser'), display: 'text' },
    ];

    this.tableColumns = [...this.tableColumnsBase];


  }

  onUnitChange(unitId: string) {
    const selected = this.unitWithMembers.find(u => u.id === unitId);
    if (selected) {
      //this.selectedUnit = selected;
      this.members = selected.members.map(m => ({
        ...m
      }));
      console.log("Members assigned in onUnitChange:", this.members);

    }
  }

  onSelectionChange(selected: TasksDetails[]) {
    this.selectedTasks = selected;
    console.log('Currently selected tasks:', this.selectedTasks);
  }
  
  Assign() {
    console.log("Assigning tasks to user:", this.selectedMemberId, "Tasks:", this.selectedTasks);
    if (!this.selectedMemberId || this.selectedTasks.length === 0) {
      console.warn("Please select a user and tasks before assigning.");
      return;
    }
    const taskIds = this.selectedTasks.map(t => t.documentId);

    this.taskManagementService.assignTasksToUser(
      this.selectedMemberId,
      taskIds
    ).then(response => {
      console.log("Tasks successfully assigned:", response);
    }).catch(error => {
      console.error("Error assigning tasks:", error);
    });

  }

  getFilterDisplayValue(filter: FilterValue): string {
    if (filter.key === 'search') {
      return `Search: "${filter.value}"`;
    }
    const filterConfig = this.filterConfigs.find((f) => f.key === filter.key);
    if (!filterConfig) return filter.key;

    switch (filterConfig.type) {
      case 'checkbox':
        return filterConfig.label;
      case 'dateRange':
        if (Array.isArray(filter.value) && filter.value.length === 2) {
          const [startDate, endDate] = filter.value;
          return `${filterConfig.label
            }: ${startDate?.toLocaleDateString()} - ${endDate?.toLocaleDateString()}`;
        }
        return filterConfig.label;
      default:
        return `${filterConfig.label}: ${filter.value}`;
    }
  }

  onAppliedFiltersChange(filters: FilterValue[]): void {
    this.appliedFilters = filters;
    this.cdr.detectChanges();
  }

  applyFilters(filters: FilterValue[]): void {
    let filtered = [...this.tasksList];
    const statusFilter = filters.find(f => f.key === 'assignmentStatus')?.value || 'unassigned';

    if (statusFilter === 'assigned') {
      filtered = filtered.filter(task => task.assignedUser !== 'Unassigned');
      this.tableColumns = [...this.tableColumnsBase, ...this.tableColumnsAssignedExtra];
    } else {
      filtered = filtered.filter(task => task.assignedUser === 'Unassigned');
      this.tableColumns = [...this.tableColumnsBase];
    }

    const term = this.searchBar?.trim().toLowerCase();
    if (term) {
      filtered = filtered.filter(task =>
        this.tableColumns.some(col => {
          const value = task[col.field];
          return value?.toString().toLowerCase().includes(term);
        })
      );
    }

    this.filteredGroups = filtered;
    this.totalRecords = filtered.length;
    this.cdr.detectChanges();
  }



  onFilterApplied(filters: FilterValue[]): void {
    this.appliedFilters = filters;
    this.applyFilters(this.appliedFilters);
  }

  onFilterChange(filters: FilterValue[]): void {
    this.appliedFilters = filters;
  }

  onFilterCleared(): void {
    this.appliedFilters = this.filterConfigs.map(f => ({
      key: f.key,
      value: f.defaultValue ?? false,
      type: f.type
    }));

    this.applyFilters(this.appliedFilters);
  }

  // get isAssignedView(): boolean {
  //   return this.appliedFilters.some(f => f.key === 'assigned' && f.value === true) &&
  //          !this.appliedFilters.some(f => f.key === 'unassigned' && f.value === true);
  // }

  get isAssignedView(): boolean {
    return this.appliedFilters.some(f => f.key === 'assignmentStatus' && f.value === 'assigned');
  }


  unassignTasks(): void {
    if (this.selectedTasks.length === 0) return;

    const taskIds = this.selectedTasks.map(t => t.documentId);
    console.log("Unassigning tasks:", taskIds);

    this.taskManagementService.unassignTasks(taskIds)
      .then(response => {
        console.log("Tasks unassigned:", response);
        // Refresh list
        this.onFilterApplied(this.appliedFilters);
        this.selectedTasks = [];
      })
      .catch(err => console.error("Error unassigning tasks:", err));
  }

    onActionClick(action: string, task: TasksDetails) {
      console.log("Action clicked:", action, task);
        this.router.navigate(['view-content', task.documentId], {
        relativeTo: this.route       
      });
    }


}
