import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SidebarMenuService } from 'src/app/_services/sidebar-menu.service';
import { MechanicsService } from 'src/app/_services/mechanics.service';

import { TaskManagementService } from 'src/app/_services/taskManagement.service';
import { CategoryStats, ProcessSummary } from 'src/app/schemas/taskManageMent-schema';
import { ConfigurableFilterComponent, FilterConfig, FilterValue } from 'src/app/components/configurable-filter/configurable-filter.component';

@Component({
    selector: 'app-work-monitor',
    standalone: false,
    providers: [TaskManagementService],
    templateUrl: './work-monitor.component.html',
})
export class WorkMonitorComponent implements OnInit {
    @ViewChild(ConfigurableFilterComponent)
    configurableFilter!: ConfigurableFilterComponent;
    viewType: 'card' | 'list' = 'card';
    toggleView() {
        this.viewType = this.viewType === 'card' ? 'list' : 'card';
    }
    breadcrumbItems = [];

    checked: boolean = false;
    selectedProcess: string = '';

    categoriess: CategoryStats[] = [];
    processSummaries: ProcessSummary[] = [];
    processGroupByName: { name: string; list: ProcessSummary[] }[] = [];
    activeTabIndex: number = 0;

    loading: boolean = true;

    searchBar: string;

    groups: any[] = [];

    currentPage = 0;
    pageSize = 10;
    totalRecords = 0;

    tableColumns = [
        { field: 'processName', header: 'Process Name', display: 'text' },
        { field: 'status', header: 'Status', display: 'text', sortable: true, },
        { field: 'assignedTasks', header: 'Assigned', display: 'text', sortable: true, },
        { field: 'unassignedTasks', header: 'Unassigned', display: 'text', sortable: true, },
        { field: 'averageAge', header: 'Average Age (days)', display: 'text', sortable: true, },
        { field: 'responsibleGroup', header: 'Responsible Group', display: 'text', sortable: true, },
        { field: 'actions', header: 'Task Actions', display: 'actions',
            actions: [
                {
                    label: 'Task Distribution',
                    icon: 'pi pi-arrows-alt',
                    action: 'distribute',
                    severity: 'info',
                },
                {
                    label: 'Task Assignment',
                    icon: 'pi pi-user-plus',
                    action: 'assign',
                    severity: 'info',
                }
            ]
        },
    ];

    processStatuses: Record<string, string[]> = {
        "Industrial Designs": ["Examination", "Granted", "In Publication", "Published"],
        "Patents": ["PA Examination", "PA Migrated", "PA Received", "PA Patent Refused"],
        "Trademarks": ["Payment Invitation Sent", "TM Abandoned", "TM Examination", "TM Formality Check", "TM Refused"],
        "Other IP Registrations": ["OIP Examination", "OIP Granted", "OIP Registration"],
        "Post-filing": ["PF Renewal", "PF Amendment", "PF Transfer"],
        "Office Documents": ["OD Acknowledged", "OD Authorised", "OD Awaiting Notification"]
    };

    tableData: ProcessSummary[] = [];
    filterConfigs: FilterConfig[] = [];
    appliedFilters: FilterValue[] = [];


    constructor(
        private taskManagementService: TaskManagementService,
        private menuService: SidebarMenuService,
        public ms: MechanicsService,
        private cdr: ChangeDetectorRef,
        private router: Router,
        private route: ActivatedRoute,
        private mechanicsService: MechanicsService
    ) { }

    ngOnInit() {
        if (this.processGroupByName.length) {
            this.activeTabIndex = 0;
        }

        this.taskManagementService.getCategoryStats().then((data) => {
            this.categoriess = data;
        });
        // this.taskManagementService.getProcessSummaries().then((data) => {
        //   this.processSummaries = data;
        // });
        this.taskManagementService.getProcessSummaries().then((processSummaries) => {
            // Group by processName
            const map = new Map<string, ProcessSummary[]>();
            for (const p of processSummaries) {
                if (!map.has(p.processName)) map.set(p.processName, []);
                p.responsibleGroup = p.responsibleGroup || 'Unassigned';

                map.get(p.processName)!.push(p);
            }
            this.processGroupByName = Array.from(map.entries()).map(([name, list]) => ({
                name, list
            }));
            if (this.processGroupByName.length > 0 && !this.selectedProcess) {
                this.selectProcess(this.processGroupByName[0].name);
                this.tableData = [...this.selectedProcessList];
                this.totalRecords = this.tableData.length;
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
                    label: 'work-monitor',
                    routerLink: `/${officeCode}/${langCode}/task-management/work-monitor`,
                },
            ];

            this.cdr.markForCheck();
        });
    }

    trackByName(index: number, item: { name: string }): string {
        return item.name;
    }
    trackByProcessId(index: number, item: ProcessSummary): string {
        return item.id;
    }
    selectProcess(processName: string): void {
        this.selectedProcess = processName;
        this.tableData = [...this.selectedProcessList];
        this.totalRecords = this.tableData.length;

        this.filterConfigs = [
            {
                key: 'status',
                label: 'Status',
                type: 'multiSelect',
                section: 'General',
                options: (this.processStatuses[processName] || []).map(s => ({ label: s, value: s }))
            },
            {
                key: 'averageAge',
                label: 'Average Age > (Days)',
                type: 'number',
                section: 'General'
            }
        ];
        this.cdr.detectChanges();
        console.log('Selected process:', processName, 'Filter Configs:', this.filterConfigs);
    }

    navigateToDistributionScreen(process: ProcessSummary) {
        const officeCode = this.mechanicsService.getCurrentOffice() || 'default';
        const langCode = this.mechanicsService.lang || 'en';
        console.info('Navigating to task distribution screen with officeCode:', officeCode, 'and langCode:', langCode);
        this.router.navigate([`/${officeCode}/${langCode}/task-management/work-monitor/tasks-distribution`],
            {
                queryParams: { process: JSON.stringify(process) }
            }
        );
    }

    navigateToUserAssignmentScreen(id: string): void {
        const officeCode = this.mechanicsService.getCurrentOffice() || 'default';
        const langCode = this.mechanicsService.lang || 'en';
        console.info('Navigating to user assignment screen with officeCode:', officeCode, 'and langCode:', langCode);
        this.router.navigate([`/${officeCode}/${langCode}/task-management/work-monitor/task-assignment`],
            {
                queryParams: { processId: id }
            });
    }

    get selectedProcessList(): ProcessSummary[] {
        return this.processGroupByName.find(g => g.name === this.selectedProcess)?.list || [];
    }

    onActionClick(action: string, process: ProcessSummary) {
        console.log("Action clicked:", action,);
        switch (action) {
            case 'distribute':
                this.navigateToDistributionScreen(process);
                break;
            case 'assign':
                this.navigateToUserAssignmentScreen(process.id);
                break;
        }
    }

    onFilterChange(filters: FilterValue[]): void {
        this.appliedFilters = filters;
    }

    onAppliedFiltersChange(filters: FilterValue[]): void {
        this.appliedFilters = filters;
        this.cdr.detectChanges();
    }

    onFilterApplied(filters: FilterValue[]): void {
        console.log('Filters applied:', filters);
        this.appliedFilters = filters;
        this.applyFilters(this.appliedFilters);
    }

    applyFilters(filters: FilterValue[]): void {
        let filtered = [...this.selectedProcessList];
        console.log('Applying filters:', filters, 'on process list:', filtered);

        const filterMap: Record<string, any> = {};
        filters.forEach(f => {
            filterMap[f.key] = f.value;
        });

        // status filter multi-select
        if (filterMap['status'] && Array.isArray(filterMap['status']) && filterMap['status'].length > 0) {
            filtered = filtered.filter(process => filterMap['status'].includes(process.status));
        }

        // averageAge filter number
        if (filterMap['averageAge'] != null && filterMap['averageAge'] !== '') {
            const minAge = Number(filterMap['averageAge']);
            filtered = filtered.filter(proc => proc.averageAge >= minAge);
        }

        const term = this.searchBar?.trim().toLowerCase();
        console.log('Search term:', term);
        if (term) {
            filtered = filtered.filter(process =>
                this.tableColumns.some(col => {
                    const value = (process as any)[col.field];
                    return value?.toString().toLowerCase().includes(term);
                })
            );
            console.log('After search filter:', filtered);
        }

        this.tableData = filtered;
        this.totalRecords = filtered.length;
        this.cdr.detectChanges();
    }
}
