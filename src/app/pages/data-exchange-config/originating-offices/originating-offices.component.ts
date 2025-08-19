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

interface Office {
  code: string;
  name: string;
  country: string;
  status: 'active' | 'inactive';
  lastSync?: string;
  dataTypes: string[];
}

@Component({
  selector: 'app-originating-offices',
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
  templateUrl: './originating-offices.component.html',
})
export class OriginatingOfficesComponent implements OnInit {
  layoutConfig: LayoutConfig;
  officeCode: string;
  langCode: string;

  offices = signal<Office[]>([]);
  filteredOffices = computed(() => this.offices());

  // Computed properties for template expressions
  activeOfficesCount = computed(
    () => this.filteredOffices().filter((o) => o.status === 'active').length
  );

  syncedTodayCount = computed(
    () =>
      this.filteredOffices().filter((o) => o.lastSync && o.lastSync !== 'Never')
        .length
  );

  totalDataTypesCount = computed(() =>
    this.filteredOffices().reduce(
      (total, office) => total + office.dataTypes.length,
      0
    )
  );

  showAddDialog = false;
  showEditDialog = false;
  selectedOffice: Office | null = null;
  loading = false;

  officeForm: FormGroup;

  columns = [
    { field: 'code', header: 'Office Code', display: 'text' },
    { field: 'name', header: 'Office Name', display: 'text' },
    { field: 'country', header: 'Country', display: 'text' },
    {
      field: 'status',
      header: 'Status',
      display: 'custom',
      template: 'statusTemplate',
    },
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

  countries = [
    { label: 'United States', value: 'US' },
    { label: 'European Union', value: 'EU' },
    { label: 'Japan', value: 'JP' },
    { label: 'China', value: 'CN' },
    { label: 'South Korea', value: 'KR' },
    { label: 'United Kingdom', value: 'GB' },
    { label: 'Germany', value: 'DE' },
    { label: 'France', value: 'FR' },
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
      appTitle: 'Originating Offices',
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
    this.loadOffices();
  }

  private initForm(): void {
    this.officeForm = this.fb.group({
      code: ['', [Validators.required, Validators.maxLength(10)]],
      name: ['', [Validators.required, Validators.minLength(3)]],
      country: ['', Validators.required],
      status: ['active', Validators.required],
      dataTypes: [[], Validators.required],
    });
  }

  private loadOffices(): void {
    this.loading = true;

    const officesData = [];
    const offices: Office[] = officesData.map((office: any) => ({
      code: office.code,
      name: office.name,
      country: this.getCountryFromCode(office.code),
      status: 'active' as const,
      lastSync: '2 hours ago',
      dataTypes: ['patent', 'trademark'],
    }));
    this.offices.set(offices);
    this.loading = false;
  }

  private getCountryFromCode(code: string): string {
    const countryMap: { [key: string]: string } = {
      US: 'United States',
      EP: 'European Union',
      JP: 'Japan',
      CN: 'China',
      KR: 'South Korea',
    };
    return countryMap[code] || code;
  }

  onAddOffice(): void {
    this.officeForm.reset({ status: 'active', dataTypes: [] });
    this.showAddDialog = true;
  }

  onEditOffice(office: Office): void {
    this.selectedOffice = office;
    this.officeForm.patchValue({
      code: office.code,
      name: office.name,
      country: office.country,
      status: office.status,
      dataTypes: office.dataTypes,
    });
    this.showEditDialog = true;
  }

  onDeleteOffice(office: Office): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${office.name}?`,
      header: 'Delete Office',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.offices.update((offices) =>
          offices.filter((o) => o.code !== office.code)
        );
      },
    });
  }

  onSaveOffice(): void {
    if (this.officeForm.valid) {
      const formData = this.officeForm.value;

      if (this.showAddDialog) {
        const newOffice: Office = {
          ...formData,
          lastSync: 'Never',
        };
        this.offices.update((offices) => [...offices, newOffice]);
      } else if (this.selectedOffice) {
        this.offices.update((offices) =>
          offices.map((office) =>
            office.code === this.selectedOffice?.code
              ? { ...office, ...formData }
              : office
          )
        );
      }

      this.showAddDialog = false;
      this.showEditDialog = false;
      this.selectedOffice = null;
    }
  }

  onCancel(): void {
    this.showAddDialog = false;
    this.showEditDialog = false;
    this.selectedOffice = null;
  }

  onActionClick(event: { action: string; item: any }): void {
    if (event.action === 'edit') {
      this.onEditOffice(event.item);
    } else if (event.action === 'delete') {
      this.onDeleteOffice(event.item);
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
        label: 'Originating Offices',
        routerLink: `/${this.officeCode}/${this.langCode}/configuration/data-exchange/originating-offices`,
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
}
