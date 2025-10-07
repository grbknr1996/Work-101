import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { TabsModule } from 'primeng/tabs';
import { CardModule } from 'primeng/card';
import { PopoverModule } from 'primeng/popover';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TableComponent } from 'src/app/components/table/table.component';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TooltipModule } from 'primeng/tooltip';
import { InputNumberModule } from 'primeng/inputnumber';
import { AppLayoutComponent } from 'src/app/components/app-layout/app-layout.component';
import { BreadcrumbsComponent } from 'src/app/components/breadcrumbs/breadcrumbs.component';
import { MechanicsService } from 'src/app/_services/mechanics.service';
import {
  ConfigurableFilterComponent,
  FilterConfig,
  FilterValue,
} from 'src/app/components/configurable-filter/configurable-filter.component';
import { FilterChipsComponent } from 'src/app/components/filter-chips/filter-chips.component';
import { TaskManagementService } from 'src/app/_services/taskManagement.service';
import { ProcessSummary, ProcessWithTasks, TasksDetails, UnitMembers, UnitWithMembers } from 'src/app/schemas/taskManageMent-schema';
import { SidebarMenuService } from 'src/app/_services/sidebar-menu.service';
import { SidebarModule } from 'primeng/sidebar';
import { TaskHistoryComponent } from '../work-monitor/view-content/history/task-history.component';
import { RecordActionComponent } from '../work-monitor/view-content/record-action/record-action.component';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-my-tasks',
  standalone: false,
  providers: [TaskManagementService],
  templateUrl: './my-tasks.component.html',
})
export class MyPendingTasksComponent implements OnInit {
  @ViewChild(ConfigurableFilterComponent)
  configurableFilter!: ConfigurableFilterComponent;
  breadcrumbItems = [];
  testChecked = false;
  selectedTasks: any[] = [];
  processSummaries: ProcessSummary[] = [];
  members: UnitMembers[] = [];
  unitWithMembers: UnitWithMembers[] = [];;
  selectedUnitId: string | null = null;
  selectedMemberId: string | null = null;
  selectedUnit: UnitWithMembers | null = null;
  tasksList: ProcessWithTasks[] = [];
  tableData: TasksDetails[] = [];
  isMaximized = false;

  currentPage = 0;
  pageSize = 10;
  totalRecords = 0;

  tableColumns = [
    { headerDisplay: 'headerCheckbox', display: 'checkbox' },
    { field: 'processName', header: 'Process Name', display: 'text' },
    { field: 'description', header: 'Description', display: 'text' },
    { field: 'documentId', header: 'Document/File Id', display: 'text' },
    { field: 'receivedOn', header: 'Received On', sortable: true },
    { field: 'lastAction', header: 'Last Action', display: 'text' },
    { field: 'age', header: 'Age(days)', sortable: true, display: 'text' },
    { field: 'daysOverDue', header: 'Days Overdue(days)', sortable: true, display: 'text' },
    { field: 'lastResponsibleUser', header: 'Last Responsible User', display: 'text' },
    {
      field: 'actions', header: 'Actions', display: 'actions',
      actions: [
        {
          label: 'Approve',
          icon: 'pi pi-check',
          action: 'approve',
          severity: 'warning',
        },
        {
          label: 'History',
          icon: 'pi pi-clock',
          action: 'history',
          severity: 'info',
        },
        {
          label: 'Document',
          icon: 'pi pi-file',
          action: 'document',
          severity: 'info',
        }
      ]
    },
  ];


  filterConfigs: FilterConfig[] = [
    {
      key: 'Industrial Designs',
      label: 'Industrial Designs',
      type: 'checkbox',
      section: 'PROCESS TYPE',
    },
    {
      key: 'Patents',
      label: 'Patents',
      type: 'checkbox',
      section: 'PROCESS TYPE',
    },
    {
      key: 'Trademarks',
      label: 'Trademarks',
      type: 'checkbox',
      section: 'PROCESS TYPE',
    },
    {
      key: 'Other IP Registrations',
      label: 'Other IP Registrations',
      type: 'checkbox',
      section: 'PROCESS TYPE',
    },
    {
      key: 'Post Filing',
      label: 'Post Filing',
      type: 'checkbox',
      section: 'PROCESS TYPE',
    },
    {
      key: 'Office Documents',
      label: 'Office Documents',
      type: 'checkbox',
      section: 'PROCESS TYPE',
    }
  ];

  filteredGroups: any[] = [];
  appliedFilters: FilterValue[] = [];
  groups: any[] = [];
  searchBar: string;
  allFilters: FilterValue[] = [];
  selectedRows: any[] = [];
  approvalBucket: any[] = [];
  showApprovalBucket = false;
  showSlider = false;
  sliderTitle = '';
  sliderAction: string | null = null;
  selectedTask: TasksDetails | null = null;


  constructor(
    private taskManagementService: TaskManagementService,
    public ms: MechanicsService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    private menuService: SidebarMenuService,

  ) { }

  ngOnInit() {

    const currentPath = this.router.url;
    const menuItems = this.menuService.generateTaskManagementMenu(currentPath);
    this.menuService.updateMenuItems(menuItems);

    console.log("test data", this.selectedTasks)
    this.allFilters = this.filterConfigs.map(f => ({
      key: f.key,
      value: true,
      type: f.type
    }));
    this.syncAppliedFilters();;

    this.taskManagementService.getMyTasks().then(processes => {
      this.tasksList = processes;
      this.tableData = this.tasksList.flatMap(p => p.tasks
        .map((task: any) => ({
          processName: p.processName,
          ...task
        }))
      );
      console.log("Tasks loaded:", this.tasksList);
    });

    this.route.params.subscribe((params) => {
      const officeCode =
        params['officeCode'] || this.ms.getCurrentOffice() || 'default';
      const langCode = params['langCode'] || 'en';

      this.breadcrumbItems = [
        {
          label: 'My Tasks',
          routerLink: `/${officeCode}/${langCode}/task-management/my-tasks`,
        },
      ];

      this.cdr.markForCheck();
    });

  }

  onSelectionChange(selected: TasksDetails[]) {
    this.selectedTasks = selected;
    console.log('Currently selected tasks:', this.selectedTasks);
    selected.forEach(task => {
      if (!this.approvalBucket.some(t => t.documentId === task.documentId)) {
        this.approvalBucket.push(task);
      }
    });
    this.approvalBucket = [...selected];
    console.log('Approval Bucket:', this.approvalBucket);
  }
  onBucketSelectionChange(selected: any[]) {

    this.selectedTasks = selected;

  console.log('Bucket selection:', selected);
}


  clearAllFilters(): void {
    this.allFilters = this.allFilters.map(f => ({ ...f, value: false }));
    this.syncAppliedFilters();
    this.configurableFilter.clearAllFilters();
    this.cdr.detectChanges();
  }

  removeFilterChip(filterKey: string): void {
    console.log("Removing filter chip:", filterKey);
    this.allFilters = this.allFilters.map(f =>
      f.key === filterKey ? { ...f, value: false } : f
    );
    this.configurableFilter.removeFilterChip(filterKey);
    this.syncAppliedFilters();
    this.cdr.detectChanges();
  }


  onAppliedFiltersChange(filters: FilterValue[]): void {
    this.appliedFilters = filters;
    this.cdr.detectChanges();
  }


  applyFilters(filters: FilterValue[]): void {
    let filtered = this.tasksList.flatMap(p =>
      p.tasks.map((task: any) => ({
        processName: p.processName,
        ...task
      }))
    );

    const activeProcessKeys = filters
      .filter(f => f.value === true)
      .map(f => f.key);

    if (activeProcessKeys.length > 0) {
      filtered = filtered.filter(task => {
        if (!task.processName) return false;
        const normalized = task.processName.toLowerCase();
        return activeProcessKeys.some(key => normalized.includes(key.toLowerCase()));
      });
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

    this.tableData = filtered;
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

  syncAppliedFilters() {
    this.appliedFilters = this.allFilters.filter(f => f.value === true);
    this.applyFilters(this.allFilters);
  }

  onActionClick(action: string, item: TasksDetails) {
  this.selectedTask = item;
  console.log("Action clicked:", this.selectedTask);
  this.sliderAction = action;
    switch (action) {
      case 'approve':
        this.ApproveTask(item);
        break;
      case 'history':
        this.ViewHistory(item);
        break;
    }

    this.showSlider = true;

  }

  ApproveTask(task: TasksDetails) {
  this.sliderTitle = 'Approve Task: ' + task.documentId;
  this.isMaximized = false;
  this.selectedTask = task;
  this.showSlider = true;
        console.log("Action clicked for approve task:", task.documentId, this.showSlider,  this.selectedTask);

  }

  ViewHistory(task: TasksDetails) {
  this.sliderTitle = 'Task History: ' + task.documentId;
  this.isMaximized = false;
  this.selectedTask = task;
  this.showSlider = true;
      console.log("Action clicked:", task.documentId, this.showSlider,  this.selectedTask);

    // const officeCode = this.route.snapshot.paramMap.get('officeCode') || 'default';
    // const langCode = this.route.snapshot.paramMap.get('langCode') || 'en';
    // console.log('Navigating to history:', `/${officeCode}/${langCode}/task-management/work-monitor/task-assignment/${task.documentId}/history`);
    // this.router.navigate([
    //   `/${officeCode}/${langCode}/task-management/work-monitor/task-assignment/${task.documentId}/history`
    // ]);
  }

  myTasksList() {
    this.showApprovalBucket = false;
    console.log('Switched to My Tasks view. Selected tasks:', this.selectedTasks);
  }

  approvalbucketList() {
    this.showApprovalBucket = true;
    this.selectedTasks = [...this.approvalBucket];
    console.log('Switched to Approval Bucket view. Selected tasks:', this.selectedTasks);
  }

  bulkApprove() {
  if (this.selectedTasks.length === 0) {
    console.warn("No tasks selected for bulk approval.");
    return;
  }
  const officeCode = this.route.snapshot.paramMap.get('officeCode') || 'default';
  const langCode = this.route.snapshot.paramMap.get('langCode') || 'en';
    // Build the approval bucket URL with query params
  const selectedIds = this.selectedTasks.map(t => t.documentId).join(',');
  const approvalBucketUrl = this.router.createUrlTree(
    [`/${officeCode}/${langCode}/task-management/my-tasks`],
    { queryParams: { approvalBucket: true, selectedIds } }
  ).toString();
  console.log("Approval bucket URL:", approvalBucketUrl, selectedIds);

  this.router.navigate([
    `/${officeCode}/${langCode}/task-management/work-monitor/task-assignment/record-action`
  ], {
    queryParams: {
      returnUrl: approvalBucketUrl,
      approvalBucket: true,
      selectedIds
    }
  });
  const taskIds = this.selectedTasks.map(t => t.documentId);

  this.taskManagementService.bulkApproveTasks(taskIds)
    .then(response => {
      console.log("Bulk approval successful:", response);
      // Optionally refresh tasks or show toast
    })
    .catch(error => {
      console.error("Error during bulk approval:", error);
    });
  }

  closeSlider() {
    this.showSlider = false;
    this.selectedTask = null;
    this.sliderAction = null;
  }



toggleMaximize() {
  this.isMaximized = !this.isMaximized;
}


}
