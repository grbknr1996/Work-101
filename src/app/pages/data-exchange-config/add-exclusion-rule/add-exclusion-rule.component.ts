import {
  Component,
  Input,
  WritableSignal,
  computed,
  signal,
  OnChanges,
  SimpleChanges,
  OnInit,
  inject,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { TabViewModule } from 'primeng/tabview';
import { CheckboxModule } from 'primeng/checkbox';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataExchangeConfigService } from 'src/app/_services/data-exchange-config.service';
import { ToastService } from 'src/app/_services/toast.service';
import { ExclusionRule } from 'src/app/interfaces';
import { Router, ActivatedRoute } from '@angular/router';
import { MechanicsService } from 'src/app/_services/mechanics.service';
import { AuthService } from 'src/app/_services/auth.service';
import { HttpClient } from '@angular/common/http';
import {
  AppLayoutComponent,
  LayoutConfig,
} from '../../../components/app-layout/app-layout.component';
import { BreadcrumbsComponent } from '../../../components/breadcrumbs/breadcrumbs.component';
import {
  ConfigurableStepperComponent,
  StepperStep,
} from '../../../components/configurable-stepper/configurable-stepper.component';

@Component({
  selector: 'app-add-exclusion-rule',
  templateUrl: './add-exclusion-rule.component.html',
  styles: [``],
  standalone: true,
  imports: [
    CommonModule,
    DropdownModule,
    MultiSelectModule,
    TabViewModule,
    CheckboxModule,
    AccordionModule,
    ButtonModule,
    MessageModule,
    FormsModule,
    ReactiveFormsModule,
    AppLayoutComponent,
    BreadcrumbsComponent,
    ConfigurableStepperComponent,
  ],
})
export class AddExclusionRuleComponent implements OnChanges, OnInit {
  // Remove modal-specific inputs since this is now a standalone page
  private data = signal<ExclusionRule[]>([]);
  configData = signal<any>(null);

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private mechanicsService = inject(MechanicsService);
  private authService = inject(AuthService);
  private http = inject(HttpClient);

  // Layout configuration
  layoutConfig: LayoutConfig;
  officeCode: string;
  langCode: string;

  // Signal to track selected recipient system
  selectedSystemCode = signal<string | null>(null);

  // Signal to track loading state
  isSubmitting = signal<boolean>(false);

  // Computed properties for configuration data
  recipientOffices = computed(() => {
    const config = this.configData();
    console.log('recipientOffices computed - config:', config);
    if (!config?.recipientSystems) {
      console.log('No recipient systems found in config');
      return [];
    }

    const offices = config.recipientSystems.map((system: any) => ({
      label: system.recipientName,
      value: system.recipientCode,
      clientId: system.recipientClientId,
      data: system,
    }));
    console.log('Mapped offices:', offices);
    return offices;
  });

  // Computed property for originating office - only shows current office
  originatingOffices = computed(() => {
    const currentOffice = this.authService.getCurrentOfficeCode();
    console.log('Current office from auth service:', currentOffice);

    if (!currentOffice) {
      console.log('No current office found in auth service');
      return [];
    }

    // Find the current office in the recipient systems configuration
    const config = this.configData();
    if (config?.recipientSystems) {
      const currentOfficeData = config.recipientSystems.find(
        (system: any) => system.recipientCode === currentOffice
      );

      if (currentOfficeData) {
        console.log('Found current office in config:', currentOfficeData);
        return [
          {
            label: currentOfficeData.recipientName,
            value: currentOfficeData.recipientCode,
            clientId: currentOfficeData.recipientClientId,
            data: currentOfficeData,
          },
        ];
      }
    }

    // Fallback: create a simple option if not found in config
    console.log('Creating fallback option for current office:', currentOffice);
    return [
      {
        label: currentOffice.toUpperCase(),
        value: currentOffice,
        clientId: `${currentOffice}-app-client`,
        data: null,
      },
    ];
  });

  // Get selected recipient system data
  selectedRecipientSystem = computed(() => {
    const selectedSystem = this.selectedSystemCode();
    const config = this.configData();
    if (!selectedSystem || !config?.recipientSystems) {
      return null;
    }

    return config.recipientSystems.find(
      (system: any) => system.recipientCode === selectedSystem
    );
  });

  // IP Categories based on selected recipient system
  ipCategories = computed(() => {
    if (!this.selectedRecipientSystem()) {
      return [];
    }

    return this.selectedRecipientSystem().ipTypeCategoryBag.map(
      (category: any) => ({
        label: category.ipTypeLabel,
        value: category.ipTypeCategory,
      })
    );
  });

  // Document Types based on selected IP category
  documentTypes = computed(() => {
    const currentCategory = this.sourceCategoriesForm?.get('categories')?.value;
    if (!this.selectedRecipientSystem() || !currentCategory) {
      return [];
    }

    const documentsMap = new Map<string, string>();

    this.selectedRecipientSystem().ipTypeCategoryBag.forEach(
      (category: any) => {
        if (category.ipTypeCategory === currentCategory) {
          category.documentTypeBag.forEach((doc: any) => {
            documentsMap.set(doc.documentCode, doc.documentName);
          });
        }
      }
    );

    return Array.from(documentsMap.entries()).map(([code, name]) => ({
      label: `${code}: ${name}`,
      value: code,
    }));
  });

  // Event Codes based on selected IP category
  eventCodes = computed(() => {
    const currentCategory = this.sourceCategoriesForm?.get('categories')?.value;
    if (!this.selectedRecipientSystem() || !currentCategory) {
      return [];
    }

    const eventsMap = new Map<string, string>();

    this.selectedRecipientSystem().ipTypeCategoryBag.forEach(
      (category: any) => {
        if (category.ipTypeCategory === currentCategory) {
          category.eventTypes.forEach((event: any) => {
            eventsMap.set(event.eventCode, event.eventLabel);
          });
        }
      }
    );

    return Array.from(eventsMap.entries()).map(([code, label]) => ({
      code: code,
      value: code,
      label: label,
    }));
  });

  // Get event codes for a specific category - memoized to prevent re-renders
  private eventCodesCache = new Map<string, any[]>();

  getEventCodesForCategory(categoryCode: string) {
    const cacheKey = `${this.selectedSystemCode()}-${categoryCode}`;

    if (this.eventCodesCache.has(cacheKey)) {
      return this.eventCodesCache.get(cacheKey)!;
    }

    const selectedSystem = this.selectedRecipientSystem();
    if (!selectedSystem) {
      return [];
    }

    const category = selectedSystem.ipTypeCategoryBag.find(
      (cat: any) => cat.ipTypeCategory === categoryCode
    );

    if (!category) {
      return [];
    }

    const result = category.eventTypes.map((event: any) => ({
      code: event.eventCode,
      label: event.eventLabel,
    }));

    this.eventCodesCache.set(cacheKey, result);
    return result;
  }

  // Get document types for a specific category - memoized to prevent re-renders
  private documentTypesCache = new Map<string, any[]>();

  getDocumentTypesForCategory(categoryCode: string) {
    const cacheKey = `${this.selectedSystemCode()}-${categoryCode}`;

    if (this.documentTypesCache.has(cacheKey)) {
      return this.documentTypesCache.get(cacheKey)!;
    }

    const selectedSystem = this.selectedRecipientSystem();
    if (!selectedSystem) {
      return [];
    }

    const category = selectedSystem.ipTypeCategoryBag.find(
      (cat: any) => cat.ipTypeCategory === categoryCode
    );

    if (!category) {
      return [];
    }

    const result = category.documentTypeBag.map((doc: any) => ({
      label: `${doc.documentCode}: ${doc.documentName}`,
      value: doc.documentCode,
    }));

    this.documentTypesCache.set(cacheKey, result);
    return result;
  }

  step = 0;
  steps: StepperStep[] = [
    { value: 0, icon: 'pi pi-home', label: 'Source & Categories' },
    { value: 1, icon: 'pi pi-cog', label: 'Category Distributions' },
    { value: 2, icon: 'pi pi-check-circle', label: 'Review' },
  ];

  // Step 1 form - Source and Categories selection
  sourceCategoriesForm: FormGroup;
  // Step 2/3/4 data
  selectedCategories: string[] = [];
  includeUnpublishedApplications: boolean = false; // Default to false
  eventExclusions: any = {};
  documentExclusions: any = {};
  enableDocumentExclusions: any = {};

  constructor(
    private fb: FormBuilder,
    private dataExchaneService: DataExchangeConfigService,
    private toastService: ToastService
  ) {
    this.officeCode = this.route.snapshot.params['officeCode'] || 'default';
    this.langCode = this.route.snapshot.params['langCode'] || 'en';

    this.layoutConfig = {
      appTitle: 'Create Exclusion Rule',
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

    this.sourceCategoriesForm = this.fb.group({
      office: [null, Validators.required],
      system: [null, Validators.required],
      categories: [null, Validators.required],
      recipientClientId: ['', Validators.required],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Handle configData changes if needed
  }

  ngOnInit(): void {
    // Always load configuration data since this is now a standalone page
    this.loadConfigurationData();

    // Set the originating office to the current office
    const currentOffice = this.authService.getCurrentOfficeCode();
    if (currentOffice) {
      this.sourceCategoriesForm.patchValue({
        office: currentOffice,
      });
    }

    const currentSystem = this.sourceCategoriesForm?.get('system')?.value;
    if (currentSystem) {
      this.selectedSystemCode.set(currentSystem);
    }
  }

  private loadConfigurationData(): void {
    // Load configuration data from JSON file
    console.log('Loading configuration data...');
    this.http.get<any>('/assets/configuration/data-exchange.json').subscribe({
      next: (data) => {
        console.log('JSON config loaded successfully:', data);
        if (data.recipientSystems) {
          this.configData.set(data);
          console.log('ConfigData signal set with:', data);
          console.log('ConfigData signal value after set:', this.configData());
        } else {
          console.log('No recipient systems found in JSON configuration');
          this.configData.set(null);
        }
      },
      error: (error) => {
        console.error('Error loading JSON configuration:', error);
        this.configData.set(null);
      },
    });
  }

  // Method to handle recipient system change
  onRecipientSystemChange(): void {
    const selectedValue = this.sourceCategoriesForm.get('system')?.value;
    this.selectedSystemCode.set(selectedValue);

    // Clear categories when recipient system changes
    this.sourceCategoriesForm.patchValue({
      categories: null,
    });

    // Clear caches when system changes
    this.eventCodesCache.clear();
    this.documentTypesCache.clear();

    // Clear selected categories array and reset exclusions
    this.selectedCategories = [];
    this.eventExclusions = {};
    this.documentExclusions = {};
    this.enableDocumentExclusions = {};
  }

  // Method to handle IP category change
  onIpCategoryChange(): void {
    const selectedCategory = this.sourceCategoriesForm.get('categories')?.value;

    // Clear caches when category changes
    this.eventCodesCache.clear();
    this.documentTypesCache.clear();

    // Reset exclusions for the new category and set everything to be checked by default
    if (selectedCategory) {
      // Get all event codes for this category and check them all by default
      const eventCodes = this.getEventCodesForCategory(selectedCategory);
      this.eventExclusions[selectedCategory] = eventCodes.map(
        (event) => event.code
      );

      // Get all document types for this category and check them all by default
      const documentTypes = this.getDocumentTypesForCategory(selectedCategory);
      this.documentExclusions[selectedCategory] = documentTypes.map(
        (doc) => doc.value
      );

      // Enable document exclusions by default
      this.enableDocumentExclusions[selectedCategory] = true;
    }
  }

  nextStep() {
    if (this.step === 0) {
      const selectedCategory = this.sourceCategoriesForm.value.categories;
      this.selectedCategories = selectedCategory ? [selectedCategory] : [];

      // Initialize exclusions for the selected category with everything checked by default
      if (selectedCategory) {
        // Get all event codes for this category and check them all by default
        const eventCodes = this.getEventCodesForCategory(selectedCategory);
        this.eventExclusions[selectedCategory] = eventCodes.map(
          (event) => event.code
        );

        // Get all document types for this category and check them all by default
        const documentTypes =
          this.getDocumentTypesForCategory(selectedCategory);
        this.documentExclusions[selectedCategory] = documentTypes.map(
          (doc) => doc.value
        );

        // Enable document exclusions by default
        this.enableDocumentExclusions[selectedCategory] = true;
      }

      // Clear caches when categories change
      this.eventCodesCache.clear();
      this.documentTypesCache.clear();
    }

    this.step++;
  }

  prevStep() {
    this.step--;
  }

  onStepChange(stepValue: number): void {
    // Only allow navigation to completed steps or the next step
    if (stepValue <= this.step + 1) {
      this.step = stepValue;
    }
  }

  getCategoryLabel(cat: string): string {
    const categories = this.ipCategories();
    const found = categories.find((c) => c.value === cat);
    return found ? found.label : cat;
  }

  getOfficeLabel(value: string): string {
    const offices = this.recipientOffices();
    const found = offices.find((o) => o.value === value);
    return found ? found.label : value;
  }

  getSystemLabel(value: string): string {
    const systems = this.recipientOffices();
    const found = systems.find((s) => s.value === value);
    return found ? found.label : value;
  }

  // Helper method to get event code label
  getEventCodeLabel(eventCode: string): string {
    const selectedSystem = this.selectedRecipientSystem();
    if (!selectedSystem) return eventCode;

    for (const category of selectedSystem.ipTypeCategoryBag) {
      const event = category.eventTypes.find(
        (e: any) => e.eventCode === eventCode
      );
      if (event) {
        return `${eventCode}: ${event.eventLabel}`;
      }
    }
    return eventCode;
  }

  // Helper method to get document type label
  getDocumentTypeLabel(docCode: string): string {
    const selectedSystem = this.selectedRecipientSystem();
    if (!selectedSystem) return docCode;

    for (const category of selectedSystem.ipTypeCategoryBag) {
      const doc = category.documentTypeBag.find(
        (d: any) => d.documentCode === docCode
      );
      if (doc) {
        return `${docCode}: ${doc.documentName}`;
      }
    }
    return docCode;
  }

  addRule() {
    // Validate form data before submission
    if (!this.validateFormData()) {
      return;
    }

    // Set loading state
    this.isSubmitting.set(true);

    // Map form data to ExclusionRule interface structure
    const formData = this.sourceCategoriesForm.value;
    const selectedSystem = this.selectedRecipientSystem();

    // Create the exclusion rule payload
    const exclusionRulePayload = {
      recipientClientId: formData.recipientClientId,
      recipientCode: formData.system,
      originatingOfficeCode: formData.office,
      ipCategory: formData.categories, // Keep as single string value
      documentList: this.getDocumentList(),
      unpublishedApplication: !this.includeUnpublishedApplications,
      keyEventsCodes: this.getKeyEventsCodes(),
      recipientName: selectedSystem?.recipientName || '',
      originatingOfficeName: this.getOriginatingOfficeName(formData.office),
    };

    console.log('Submitting exclusion rule:', exclusionRulePayload);

    this.dataExchaneService
      .postDataExchangeData(exclusionRulePayload)
      .subscribe({
        next: (addedRule) => {
          console.log('Distribution rule created successfully:', addedRule);

          this.data.update((currentRules) => [...currentRules, addedRule]);

          // Reset loading state
          this.isSubmitting.set(false);

          // Show success toast message
          this.toastService.showSuccess(
            'Success',
            'Distribution rule created successfully'
          );

          // Navigate back to distribution rules page after a short delay to show the toast
          setTimeout(() => {
            this.router.navigate([
              `/${this.officeCode}/${this.langCode}/configuration/data-exchange/dashboard/distribution-rules`,
            ]);
          }, 2000);
        },
        error: (error) => {
          console.error('Failed to create exclusion rule:', error);
          // Reset loading state
          this.isSubmitting.set(false);
          // You can add error handling here (show toast, error message, etc.)
        },
      });
  }

  // Validate form data before submission
  private validateFormData(): boolean {
    const formData = this.sourceCategoriesForm.value;

    if (
      !formData.recipientClientId ||
      !formData.system ||
      !formData.office ||
      !formData.categories
    ) {
      console.error('Form validation failed: Missing required fields');
      return false;
    }

    if (!this.selectedRecipientSystem()) {
      console.error('Form validation failed: No recipient system selected');
      return false;
    }

    // Check if at least one category has some exclusion rules configured
    let hasExclusions = false;
    for (const category of this.selectedCategories) {
      if (
        this.eventExclusions[category]?.length > 0 ||
        (this.enableDocumentExclusions[category] &&
          this.documentExclusions[category]?.length > 0)
      ) {
        hasExclusions = true;
        break;
      }
    }

    if (!hasExclusions) {
      console.warn('No exclusion rules configured for any category');
      // You might want to show a warning to the user here
    }

    return true;
  }

  // Helper method to get document list for all categories
  private getDocumentList(): string[] {
    const documentList: string[] = [];

    for (const category of this.selectedCategories) {
      if (
        this.enableDocumentExclusions[category] &&
        this.documentExclusions[category]?.length
      ) {
        // Add document codes directly to the array
        documentList.push(...this.documentExclusions[category]);
      }
    }

    return documentList;
  }

  // Note: unpublishedApplication is derived directly from includeUnpublishedApplications in payload

  // Helper method to get key events codes
  private getKeyEventsCodes(): string[] {
    const keyEventsCodes: string[] = [];

    for (const category of this.selectedCategories) {
      if (this.eventExclusions[category]?.length) {
        // Add event codes directly to the array
        keyEventsCodes.push(...this.eventExclusions[category]);
      }
    }

    return keyEventsCodes;
  }

  // Helper method to get originating office name
  private getOriginatingOfficeName(officeCode: string): string {
    const currentOffice = this.authService.getCurrentOfficeCode();
    if (officeCode === currentOffice) {
      // Find the current office in the recipient systems configuration
      const config = this.configData();
      if (config?.recipientSystems) {
        const currentOfficeData = config.recipientSystems.find(
          (system: any) => system.recipientCode === currentOffice
        );
        if (currentOfficeData) {
          return currentOfficeData.recipientName;
        }
      }
      // Fallback
      return officeCode.toUpperCase();
    }
    return officeCode.toUpperCase();
  }

  cancel() {
    // Navigate back to distribution rules page
    this.router.navigate([
      `/${this.officeCode}/${this.langCode}/configuration/data-exchange/dashboard/distribution-rules`,
    ]);
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
        label: 'Distribution Rules',
        routerLink: `/${this.officeCode}/${this.langCode}/configuration/data-exchange/dashboard/distribution-rules`,
      },
      {
        label: 'Create Exclusion Rule',
        routerLink: `/${this.officeCode}/${this.langCode}/configuration/data-exchange/dashboard/add-rule`,
      },
    ];
  }
}
