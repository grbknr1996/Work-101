import { HttpClient } from '@angular/common/http';
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthService } from 'src/app/_services/auth.service';
import { DataExchangeConfigService } from 'src/app/_services/data-exchange-config.service';
import { LoadingService } from 'src/app/_services/loading.service';
import { MechanicsService } from 'src/app/_services/mechanics.service';
import { SidebarMenuService } from 'src/app/_services/sidebar-menu.service';
import { ToastService } from 'src/app/_services/toast.service';
import { LayoutConfig } from 'src/app/components/app-layout/app-layout.component';
import { Recipient } from 'src/app/interfaces';

@Component({
  selector: 'app-add-recipient',
  standalone: false,
  templateUrl: './add-recipient.component.html'
})
export class AddRecipientComponent implements OnInit {

  private data = signal<Recipient[]>([]);
  configData = signal<any>(null);

  // Layout configuration
  layoutConfig: LayoutConfig;
  officeCode: string;
  langCode: string;

  // Signal to track selected recipient system
  selectedSystemCode = signal<string | null>(null);
  recipientForm: FormGroup;
  isSubmitting = signal<boolean>(false);
  recipientsList: any[] = [];

  visibleDialog: boolean = false;
  recipientSaveResponse: any;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private loadingService: LoadingService,
    private http: HttpClient,
    public ms: MechanicsService,
    private dataExchangeService: DataExchangeConfigService,
    private toastService: ToastService,
    private messageService: MessageService,
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

    this.recipientForm = this.fb.group({
      recipientCode: [null, Validators.required],
      recipientName: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    const currentPath = this.router.url;
    const menuItems = this.sidebarService.generateConfigurationMenu(
      currentPath,
      ''
    );
    this.sidebarService.updateMenuItems(menuItems);
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
        label: 'Recipients',
        routerLink: `/${this.officeCode}/${this.langCode}/configuration/data-exchange/dashboard/add-recipient`,
      },
    ];
  }

  configurationPageRoute() {
    this.dataExchangeService.setTabPanel("recipients");
    this.router.navigate([
      `/${this.officeCode}/${this.langCode}/configuration/data-exchange/dashboard/distribution-rules`,
    ]);
  }

  addRecipient() {
    // Validate form data before submission
    if (!this.validateFormData()) {
      return;
    }

    // Set loading state
    this.isSubmitting.set(true);

    const formData = this.recipientForm.value;

    // Create the recipient payload
    const recipientPayload = [{
      recipientCode: formData.recipientCode,
      recipientName: formData.recipientName,
    }];

    console.log('Submitting recipient:', recipientPayload);
    this.loadingService.show('Creating new recipient...');
    this.dataExchangeService
      .postRecipientData(recipientPayload)
      .subscribe({
        next: (addedRecipient) => {
          // Reset loading state
          this.isSubmitting.set(false);

          // Show success toast message
          // this.toastService.showSuccess(
          //   'Success',
          //   'Recipient created successfully'
          // );
          this.loadingService.hide();
          if (
            addedRecipient &&
            addedRecipient.data &&
            Array.isArray(addedRecipient.data) &&
            addedRecipient.data.length) {
            console.log('Recipient created successfully:', addedRecipient);
            this.data.update((currentRecipients) => [...currentRecipients, addedRecipient]);
            this.recipientSaveResponse = addedRecipient.data[0];
          } else {
            this.recipientSaveResponse = addedRecipient;
          }
          this.visibleDialog = true;
          // Navigate back to distribution rules page after a short delay to show the toast
          // setTimeout(() => {
          //   this.distributionRulePageRoute();
          // }, 2000);
        },
        error: (error) => {
          console.error('Failed to create exclusion rule:', error);
          // Reset loading state
          this.isSubmitting.set(false);
          this.loadingService.hide();
          // You can add error handling here (show toast, error message, etc.)
        },
      });
  }

  // Validate form data before submission
  private validateFormData(): boolean {
    const formData = this.recipientForm.value;

    if (
      !formData.recipientCode ||
      !formData.recipientName
    ) {
      console.error('Form validation failed: Missing required fields');
      return false;
    }

    return true;
  }

  closeDialog() {
    this.visibleDialog = false;
    this.configurationPageRoute();
  }

  copyDivContent(element: HTMLElement): void {
    const text = element.innerText;

    navigator.clipboard.writeText(text).then(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Copied',
        detail: 'Content copied to clipboard'
      });
    }).catch(() => {
      this.messageService.add({
        severity: 'error',
        summary: 'Failed',
        detail: 'Unable to copy content'
      });
    });
  }
}
