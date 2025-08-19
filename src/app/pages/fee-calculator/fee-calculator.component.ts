import { CommonModule, CurrencyPipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { SelectModule } from 'primeng/select';
import { FloatLabelModule } from "primeng/floatlabel"

import { MechanicsService } from 'src/app/_services/mechanics.service';
import { SidebarMenuService } from 'src/app/_services/sidebar-menu.service';
import { AppLayoutComponent } from 'src/app/components/app-layout/app-layout.component';
import { BreadcrumbsComponent } from 'src/app/components/breadcrumbs/breadcrumbs.component';
import { FeeService } from 'src/app/_services/FeeService';

@Component({
  selector: 'app-fee-calculator',
  standalone: true,
  imports: [
    CommonModule,
    DropdownModule, 
    TableModule,
    CardModule,
    ButtonModule,
    FormsModule,
    RouterModule,
    SelectModule,
    FloatLabelModule,
    InputTextModule,
    CurrencyPipe,
    AppLayoutComponent,
    BreadcrumbsComponent,
  ],
  providers: [
    FeeService
  ],
  templateUrl: './fee-calculator.component.html'
})
export class FeeCalculatorComponent implements OnInit {

  breadcrumbItems = [];

    categories = [
    { label: 'Patent', value: 'patent' },
    { label: 'Trademark', value: 'trademark' },
  ];
  selectedCategory: string | null = null;

  services = [
    { label: 'CLM [ Patent-AppSubType_UM_NoOfClaims ]', value: 'CLM_Patent-AppSubType_UM_NoOfClaims', units: 1, rate: 100 },
    { label: 'DPG [ Patent-AppSubType_NoOfDocumentPages ]', value: 'DPG_Patent-AppSubType_NoOfDocumentPages', units: 0, rate: 50 },
  ];
  selectedService: string | null = null;

  locations = [
    { label: 'USA', value: 'usa' },
    { label: 'Canada', value: 'canada' },
  ];
  selectedLocation: string | null = null;

  discountOptions = [
    { label: '10% Discount', value: 10 },
    { label: '20% Discount', value: 20 },
  ];
  selectedDiscount: number | null = null;

  calculatedItems: { label: string; quantity: number; amount: number }[] = [];
  discounts: { rate: number; amount: number }[] = [];

  subtotal: number = 0;
  tax: number = 0;
  totalWithTax: number = 0;

  increaseUnit(service: any): void {
    service.units++;
  }

  decreaseUnit(service: any): void {
    if (service.units > 0) service.units--;
  }

  calculateTotal(): void {
    this.calculatedItems = [];
    this.subtotal = 0;
    this.tax = 0;
    this.totalWithTax = 0;
    this.discounts = [];

    for (const service of this.services) {
      if (service.units > 0) {
        const amount = service.units * service.rate;
        this.calculatedItems.push({ label: service.label, quantity: service.units, amount });
        this.subtotal += amount;
      }
    }

    if (this.selectedDiscount) {
      const discountAmount = (this.subtotal * this.selectedDiscount) / 100;
      this.discounts.push({ rate: this.selectedDiscount, amount: discountAmount });
      this.subtotal -= discountAmount;
    }

    this.tax = this.subtotal * 0.18; // 18% tax
    this.totalWithTax = this.subtotal + this.tax;
  }

  constructor(
    private menuService: SidebarMenuService,
    private feeService: FeeService,
    public ms: MechanicsService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    const currentPath = this.router.url;
    const menuItems = this.menuService.generateFeeConfigurationMenu(currentPath);
    this.menuService.updateMenuItems(menuItems);
    // Optionally, dynamically set menu items here
    this.route.params.subscribe((params) => {
      const officeCode =
        params['officeCode'] || this.ms.getCurrentOffice() || 'default';
      const langCode = params['langCode'] || 'en';

      this.breadcrumbItems = [
        {
          label: 'System Configuration',
          routerLink: `/${officeCode}/${langCode}/system-configuration`,
        },
        {
          label: 'Fees',
          routerLink: `/${officeCode}/${langCode}/system-configuration/fee-config`,
        },
        {
          label: 'Calculator',
          routerLink: `/${officeCode}/${langCode}/system-configuration/fee-config/calculator`,
        },
      ];

      // Trigger change detection after updating breadcrumbs
      this.cdr.markForCheck();
    });
    console.log("Selected Items: ", this.feeService.selectedItems())
  }

}
