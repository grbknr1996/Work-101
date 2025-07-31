import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  AppLayoutComponent,
  LayoutConfig,
} from '../../../components/app-layout/app-layout.component';
import { BreadcrumbsComponent } from '../../../components/breadcrumbs/breadcrumbs.component';
import { TableComponent } from '../../../components/table/table.component';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { DialogModule } from 'primeng/dialog';
import { MessageModule } from 'primeng/message';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { DataExchangeConfigService } from '../../../_services/data-exchange-config.service';

interface RecipientSystem {
  code: string;
  name: string;
  type: 'Global' | 'Regional' | 'National';
  status: 'active' | 'inactive';
  totalRules: number;
  lastSync?: string;
  dataTypes: string[];
  endpoint?: string;
}

@Component({
  selector: 'app-recipient-systems',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AppLayoutComponent,
    BreadcrumbsComponent,
    TableComponent,
    CardModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    MultiSelectModule,
    DialogModule,
    MessageModule,
    ConfirmDialogModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './recipient-systems.component.html',
})
export class RecipientSystemsComponent implements OnInit {
  layoutConfig: LayoutConfig;
  officeCode: string;
  langCode: string;

  systems = signal<RecipientSystem[]>([]);
  filteredSystems = computed(() => this.systems());

  // Computed properties for template expressions
  activeSystemsCount = computed(
    () => this.filteredSystems().filter((s) => s.status === 'active').length
  );

  syncedTodayCount = computed(
    () =>
      this.filteredSystems().filter((s) => s.lastSync && s.lastSync !== 'Never')
        .length
  );

  totalRulesCount = computed(() =>
    this.filteredSystems().reduce(
      (total, system) => total + system.totalRules,
      0
    )
  );

  globalSystemsCount = computed(
    () => this.filteredSystems().filter((s) => s.type === 'Global').length
  );

  showAddDialog = false;
  showEditDialog = false;
  selectedSystem: RecipientSystem | null = null;
  loading = false;

  systemForm: FormGroup;

  columns = [
    { field: 'code', header: 'System Code', display: 'text' },
    { field: 'name', header: 'System Name', display: 'text' },
    { field: 'type', header: 'Type', display: 'text' },
    {
      field: 'status',
      header: 'Status',
      display: 'custom',
      template: 'statusTemplate',
    },
    { field: 'totalRules', header: 'Total Rules', display: 'text' },
    { field: 'lastSync', header: 'Last Sync', display: 'text' },
    { field: 'dataTypes', header: 'Data Types', display: 'custom' },
    {
      field: 'actions',
      header: 'Actions',
      display: 'actions',
      actions: [
        {
          label: 'Edit',
          icon: 'pi pi-pencil',
          action: 'edit',
          severity: 'info',
        },
        {
          label: 'Delete',
          icon: 'pi pi-trash',
          action: 'delete',
          severity: 'danger',
        },
      ],
      showAsDropdown: true,
    },
  ];

  systemTypes = [
    { label: 'Global', value: 'Global' },
    { label: 'Regional', value: 'Regional' },
    { label: 'National', value: 'National' },
  ];

  dataTypes = [
    { label: 'Patents', value: 'patent' },
    { label: 'Trademarks', value: 'trademark' },
    { label: 'Industrial Designs', value: 'design' },
    { label: 'Geographical Indications', value: 'gi' },
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private dataExchangeService: DataExchangeConfigService,
    private confirmationService: ConfirmationService
  ) {
    this.officeCode = this.route.snapshot.params['officeCode'] || 'default';
    this.langCode = this.route.snapshot.params['langCode'] || 'en';

    this.layoutConfig = {
      appTitle: 'Recipient Systems',
      showHeader: true,
      showSidebar: true,
      headerItems: [],
      sidebarItems: [],
      footerText: '© WIPO ' + new Date().getFullYear(),
      fixedHeader: true,
      fixedSidebar: true,
      sidebarCollapsed: false,
      theme: 'light',
      logo: '',
    };

    this.initForm();
  }

  ngOnInit(): void {
    this.loadSystems();
  }

  private initForm(): void {
    this.systemForm = this.fb.group({
      code: ['', [Validators.required, Validators.maxLength(20)]],
      name: ['', [Validators.required, Validators.minLength(3)]],
      type: ['', Validators.required],
      status: ['active', Validators.required],
      dataTypes: [[], Validators.required],
      endpoint: ['', Validators.pattern('https?://.+')],
    });
  }

  private loadSystems(): void {
    this.loading = true;
    this.dataExchangeService
      .getDataExchangeData('7bnv35u5b6j6mk5pnfb65jqqe6', 'patent', 'JP')
      .subscribe((data) => {
        const systemsData = data.recipientSystemsData || [];
        const systems: RecipientSystem[] = systemsData.map((system: any) => ({
          code: system.code,
          name: system.name,
          type: system.type as 'Global' | 'Regional' | 'National',
          status: 'active' as const,
          totalRules: system.totalRules || 0,
          lastSync: '1 hour ago',
          dataTypes: ['patent', 'trademark'],
          endpoint: `https://api.wipo.int/${system.code.toLowerCase()}`,
        }));
        this.systems.set(systems);
        this.loading = false;
      });
  }

  onAddSystem(): void {
    this.systemForm.reset({ status: 'active', dataTypes: [] });
    this.showAddDialog = true;
  }

  onEditSystem(system: RecipientSystem): void {
    this.selectedSystem = system;
    this.systemForm.patchValue({
      code: system.code,
      name: system.name,
      type: system.type,
      status: system.status,
      dataTypes: system.dataTypes,
      endpoint: system.endpoint,
    });
    this.showEditDialog = true;
  }

  onDeleteSystem(system: RecipientSystem): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${system.name}?`,
      header: 'Delete System',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.systems.update((systems) =>
          systems.filter((s) => s.code !== system.code)
        );
      },
    });
  }

  onSaveSystem(): void {
    if (this.systemForm.valid) {
      const formData = this.systemForm.value;

      if (this.showAddDialog) {
        const newSystem: RecipientSystem = {
          ...formData,
          totalRules: 0,
          lastSync: 'Never',
        };
        this.systems.update((systems) => [...systems, newSystem]);
      } else if (this.selectedSystem) {
        this.systems.update((systems) =>
          systems.map((system) =>
            system.code === this.selectedSystem?.code
              ? { ...system, ...formData }
              : system
          )
        );
      }

      this.showAddDialog = false;
      this.showEditDialog = false;
      this.selectedSystem = null;
    }
  }

  onCancel(): void {
    this.showAddDialog = false;
    this.showEditDialog = false;
    this.selectedSystem = null;
  }

  onActionClick(event: { action: string; item: any }): void {
    if (event.action === 'edit') {
      this.onEditSystem(event.item);
    } else if (event.action === 'delete') {
      this.onDeleteSystem(event.item);
    }
  }

  getBreadcrumbItems() {
    return [
      {
        label: 'Configuration',
        routerLink: `/${this.officeCode}/${this.langCode}/configuration`,
      },
      {
        label: 'Data Exchange',
        routerLink: `/${this.officeCode}/${this.langCode}/configuration/data-exchange/dashboard`,
      },
      {
        label: 'Recipient Systems',
        routerLink: `/${this.officeCode}/${this.langCode}/configuration/data-exchange/recipient-systems`,
      },
    ];
  }

  getStatusClass(status: string): string {
    return status === 'active' ? 'status-active' : 'status-inactive';
  }

  getDataTypesLabel(types: string[]): string {
    return types
      .map(
        (type) => this.dataTypes.find((dt) => dt.value === type)?.label || type
      )
      .join(', ');
  }

  getTypeClass(type: string): string {
    switch (type) {
      case 'Global':
        return 'type-global';
      case 'Regional':
        return 'type-regional';
      case 'National':
        return 'type-national';
      default:
        return 'type-default';
    }
  }
}
