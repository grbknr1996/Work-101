import {
  Component,
  computed,
  signal,
  OnChanges,
  SimpleChanges,
  OnInit,
  inject,
  effect,
  Signal,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataExchangeConfigService } from 'src/app/_services/data-exchange-config.service';
import { ToastService } from 'src/app/_services/toast.service';
import { ExclusionRule, Recipient } from 'src/app/interfaces';
import { Router, ActivatedRoute } from '@angular/router';
import { MechanicsService } from 'src/app/_services/mechanics.service';
import { HttpClient } from '@angular/common/http';
import { LayoutConfig } from '../../../components/app-layout/app-layout.component';
import { StepperStep } from '../../../components/configurable-stepper/configurable-stepper.component';
import { SidebarMenuService } from 'src/app/_services/sidebar-menu.service';
import { filter } from 'rxjs';
import { LoadingService } from 'src/app/_services/loading.service';
import { AuthService } from 'src/app/_services/auth.service';

@Component({
  selector: 'app-add-exclusion-rule',
  templateUrl: './add-exclusion-rule.component.html',
  standalone: false,
})
export class AddExclusionRuleComponent implements OnChanges, OnInit {
  // Remove modal-specific inputs since this is now a standalone page
  private data = signal<ExclusionRule[]>([]);
  configData = signal<any>(null);

  // Layout configuration
  layoutConfig: LayoutConfig;
  officeCode: string;
  langCode: string;

  // Signal to track selected recipient system
  selectedSystemCode = signal<string | null>(null);

  // SIgnal to track IP Type Category Bag
  ipTypeCategories = signal<any>(null);

  // Signal to track loading state
  isSubmitting = signal<boolean>(false);

  recipientsData!: Signal<Recipient[] | []>;

  // Computed properties for configuration data
  recipientOffices = computed(() => {
    const recipientsData = this.dataExchangeService.recipientsData().sort((a, b) =>
      a.recipientName.localeCompare(b.recipientName)
    );
    if (!recipientsData) {
      console.log('No recipient systems found in config');
      return [];
    }

    const offices = recipientsData.map((system: any) => ({
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
    const currentOffice = this.ms.getCurrentOffice();
    console.log('Current office from mechanics service:', currentOffice);

    if (!currentOffice) {
      console.log('No current office found in mechanics service');
      return [];
    }

    // Find the current office in the recipient systems configuration
    const recipients = this.dataExchangeService.recipientsData();
    if (recipients) {
      const currentOfficeData = recipients.find(
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
    const recipients = this.dataExchangeService.recipientsData();
    if (!selectedSystem || !recipients) {
      return null;
    }

    return recipients.find(
      (system: any) => system.recipientCode === selectedSystem
    );
  });

  // IP Categories based on selected recipient system
  ipCategories = computed(() => {
    if (!this.ipTypeCategories()) {
      return [];
    }

    return this.ipTypeCategories().ipTypeCategoryBag.map((category: any) => ({
      label: category.ipTypeLabel,
      value: category.ipTypeCategory,
    }));
  });

  // Document Types based on selected IP category
  documentTypes = computed(() => {
    const currentCategory = this.sourceCategoriesForm?.get('categories')?.value;
    if (!this.ipTypeCategories() || !currentCategory) {
      return [];
    }

    const documentsMap = new Map<string, string>();

    this.ipTypeCategories().ipTypeCategoryBag.forEach((category: any) => {
      if (category.ipTypeCategory === currentCategory) {
        category.documentTypeBag.forEach((doc: any) => {
          documentsMap.set(doc.documentCode, doc.documentName);
        });
      }
    });

    return Array.from(documentsMap.entries()).map(([code, name]) => ({
      label: `${name}`,
      value: code,
    }));
  });

  // Event Codes based on selected IP category
  eventCodes = computed(() => {
    const currentCategory = this.sourceCategoriesForm?.get('categories')?.value;
    if (!this.ipTypeCategories() || !currentCategory) {
      return [];
    }

    const eventsMap = new Map<string, string>();

    this.ipTypeCategories().eventTypeBag.forEach((events: any) => {
      events.forEach((event: any) => {
        eventsMap.set(event.eventCode, event.eventLabel);
      });
    });

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

    const ipTypesData = this.ipTypeCategories();
    if (!ipTypesData) {
      return [];
    }

    const category = ipTypesData.ipTypeCategoryBag.find(
      (cat: any) => cat.ipTypeCategory === categoryCode
    );

    if (!category) {
      return [];
    }

    const result = ipTypesData.eventTypeBag.map((event: any) => ({
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

    const ipTypesData = this.ipTypeCategories();
    if (!ipTypesData) {
      return [];
    }

    const category = ipTypesData.ipTypeCategoryBag.find(
      (cat: any) => cat.ipTypeCategory === categoryCode
    );

    if (!category) {
      return [];
    }

    const result = category.documentTypeBag.map((doc: any) => ({
      label: doc.documentName,
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
    public ms: MechanicsService,
    private dataExchangeService: DataExchangeConfigService,
    private toastService: ToastService,
    private loadingService: LoadingService,
    private authService: AuthService,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private sidebarService: SidebarMenuService
  ) {
    this.officeCode = this.route.snapshot.params['officeCode'] || 'default';
    this.langCode = this.route.snapshot.params['langCode'] || 'en';

    this.layoutConfig = {
      appTitle: '',
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

    this.recipientsData = this.dataExchangeService.recipientsData

    if (!this.recipientsData().length) {
      this.dataExchangeService.getRecipients();
    }

    // Set the originating office to the current office
    const officeCtrl = this.sourceCategoriesForm.get('office')!;
    if (!this.ms.isCurrentUserWipoAdmin()) {
      const currentOffice = this.ms.getCurrentOffice();
      officeCtrl?.enable({ emitEvent: false });
      officeCtrl?.setValue(currentOffice, { emitEvent: false });
      officeCtrl?.disable({ emitEvent: false });
    } else {
      const selectedPlatform = this.ms.getWipoPlatform();
      console.info('selectedPlatform: ', selectedPlatform);
      officeCtrl?.enable({ emitEvent: false });
      officeCtrl?.setValue(selectedPlatform, { emitEvent: false });
      officeCtrl?.disable({ emitEvent: false });
    }

    const currentSystem = this.sourceCategoriesForm?.get('system')?.value;
    if (currentSystem) {
      this.selectedSystemCode.set(currentSystem);
    }

    this.sourceCategoriesForm
      .get('system')!
      .valueChanges.subscribe((system) => {
        const match = this.dataExchangeService
          .recipientsData()
          .find((x) => x.recipientCode === system);
        const clientIdCtrl =
          this.sourceCategoriesForm.get('recipientClientId')!;
        if (match) {
          clientIdCtrl.enable({ emitEvent: false });
          clientIdCtrl.setValue(match.recipientClientId, { emitEvent: false });
          clientIdCtrl.disable({ emitEvent: false });
        } else {
          // Reset if no system
          clientIdCtrl.enable({ emitEvent: false });
          clientIdCtrl.reset('', { emitEvent: false });
          clientIdCtrl.disable({ emitEvent: false });
        }
      });

    const currentPath = this.router.url;
    const menuItems = this.sidebarService.generateConfigurationMenu(
      currentPath,
      ''
    );
    this.sidebarService.updateMenuItems(menuItems);
  }

  private loadConfigurationData(): void {
    // Load configuration data from JSON file ip-type-category
    console.log('Loading Ip Category Type data...');
    this.http
      .get<any>('/assets/configuration/ip-type-category.json')
      .subscribe({
        next: (data) => {
          console.log('JSON config loaded successfully:', data);
          if (data.ipTypeCategoryBag) {
            this.ipTypeCategories.set(data);
            console.log('ipTypeCategories signal set with:', data);
            console.log(
              'ipTypeCategories signal value after set:',
              this.ipTypeCategories()
            );
          } else {
            console.log('No ip category type found in JSON configuration');
            this.ipTypeCategories.set(null);
          }
        },
        error: (error) => {
          console.error('Error loading JSON configuration:', error);
          this.ipTypeCategories.set(null);
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

  // getOfficeLabel(value: string): string {
  //   const offices = this.recipientOffices();
  //   const found = offices.find((o) => o.value === value);
  //   return found ? found.label : value;
  // }

  getSystemLabel(value: string): string {
    const recipients = this.recipientOffices();
    const found = recipients.find((s) => s.value === value);
    return found ? found.label : value;
  }

  // Helper method to get event code label
  getEventCodeLabel(eventCode: string): string {
    return eventCode ? this.ms.translate(`addExclusionRules.categoryAndDistributionStep.eventCodes.${eventCode}`) : eventCode;
  }

  // Helper method to get document type label
  getDocumentTypeLabel(docCode: string): string {
    return docCode ? this.ms.translate(`addExclusionRules.categoryAndDistributionStep.documentCodes.${docCode}`) : docCode;
  }

  addRule() {
    // Validate form data before submission
    if (!this.validateFormData()) {
      return;
    }

    // Set loading state
    this.isSubmitting.set(true);

    // Map form data to ExclusionRule interface structure
    const formData = this.sourceCategoriesForm.getRawValue();
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
    this.loadingService.show('Creating Distribution Rule...');
    this.dataExchangeService
      .postDataExchangeData(exclusionRulePayload)
      .subscribe({
        next: (addedRule) => {
          this.loadingService.hide();
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
            this.configurationPageRoute();
          }, 2000);
        },
        error: (error) => {
          console.error('Failed to create exclusion rule:', error);
          this.loadingService.hide();
          // Reset loading state
          this.isSubmitting.set(false);
          // You can add error handling here (show toast, error message, etc.)
        },
      });
  }

  configurationPageRoute() {
    this.dataExchangeService.setTabPanel("distributionRules");
    this.router.navigate([
      `/${this.officeCode}/${this.langCode}/configuration/data-exchange/dashboard/distribution-rules`,
    ]);
  }

  // Validate form data before submission
  private validateFormData(): boolean {
    const formData = this.sourceCategoriesForm.getRawValue();
    console.info('formData: ', formData);
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
    const currentOffice = this.ms.getCurrentOffice();
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
        label: 'Data Sharing',
        routerLink: `/${this.officeCode}/${this.langCode}/configuration/data-exchange/dashboard`,
      },
      {
        label: 'Configuration',
        routerLink: `/${this.officeCode}/${this.langCode}/configuration/data-exchange/dashboard/distribution-rules`,
      },
      {
        label: 'Distribution Rules',
        routerLink: `/${this.officeCode}/${this.langCode}/configuration/data-exchange/dashboard/add-rule`,
      },
    ];
  }

  isAllSelected(cat: string): boolean {
    const eventCodes = this.getEventCodesForCategory(cat);
    const selectedEventCodes = this.eventExclusions[cat] || [];

    // Check if all event codes are selected
    return (
      eventCodes.length > 0 &&
      eventCodes.every((event) => selectedEventCodes.includes(event.code))
    );
  }

  toggleSelectAll(event: any, cat: string) {
    const eventCodes = this.getEventCodesForCategory(cat);

    // Handle different event structures from PrimeNG checkbox
    const isChecked = event?.checked !== undefined ? event.checked : event;

    if (isChecked) {
      // Select all event codes for this category
      this.eventExclusions[cat] = eventCodes.map((event) => event.code);
    } else {
      // Deselect all event codes for this category
      this.eventExclusions[cat] = [];
    }
  }
}
