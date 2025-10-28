import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, } from '@angular/router';
import { MechanicsService } from 'src/app/_services/mechanics.service';
import { SidebarMenuService } from 'src/app/_services/sidebar-menu.service';
import { FeeService } from 'src/app/_services/fee.service';
import { FeeBag, FeeConditions } from 'src/app/schemas/fee-schema';
import { SelectItemGroup } from 'primeng/api';

enum IpTypes {
  TRADEMARKS = 'trademarks',
  PATENTS = 'patents',
  COPYRIGHTS = 'copyrights',
  POST_FILINGS = 'post filings',
  INDUSTRIAL_DESIGNS = 'designs',
  GEOGRAPHICAL_INDICATIONS = 'geographical indications',
  TRADEMARKS_CODE = 't',
  PATENTS_CODE = 'p',
  COPYRIGHTS_CODE = 'cr',
  POST_FILINGS_CODE = 'pf',
  INDUSTRIAL_DESIGNS_CODE = 'd',
  GEOGRAPHICAL_INDICATIONS_CODE = 'gi',
}

@Component({
  selector: 'app-fee-calculator',
  standalone: false,
  providers: [
    FeeService
  ],
  templateUrl: './fee-calculator.component.html'
})
export class FeeCalculatorComponent implements OnInit {

  breadcrumbItems = [];

  currencyCode: string = "USD";

  groupedFilings: SelectItemGroup[] = [
    {
      label: 'New application',
      value: 'newApplication',
      items: [
        { label: 'Conventional patent', value: 'conventionalPatent' },
        { label: 'PCT', value: 'pct' },
        { label: 'PCT-NPE', value: 'pctNpe' },
        { label: 'Utility model', value: 'utilityModel' }
      ]
    },
    {
      label: 'Post Filing',
      value: 'postFiling',
      items: [
        { label: 'Change of owner', value: 'changeOfOwner' },
        { label: 'Change of name / address', value: 'changeOfNameOrAddress' },
        { label: 'Appointment of agent', value: 'appointmentOfAgent' },
        { label: 'Payment annuity', value: 'paymentAnnuity' },
        { label: 'Renewal', value: 'renewal' },
        { label: 'Amendment of drawing', value: 'amendmentOfDrawing' },
      ]
    }
  ]

  categories = [
    { label: IpTypes.TRADEMARKS, value: IpTypes.TRADEMARKS_CODE },
    { label: IpTypes.PATENTS, value: IpTypes.PATENTS_CODE },
    { label: IpTypes.INDUSTRIAL_DESIGNS, value: IpTypes.INDUSTRIAL_DESIGNS_CODE },
    { label: IpTypes.COPYRIGHTS, value: IpTypes.COPYRIGHTS_CODE },
    { label: IpTypes.POST_FILINGS, value: IpTypes.POST_FILINGS },
    { label: IpTypes.GEOGRAPHICAL_INDICATIONS, value: IpTypes.GEOGRAPHICAL_INDICATIONS_CODE },
  ];

  selectedCategory: any | null = null;

  services: any[] = [];
  selectedFileType: any | null = null;
  selectedServicesList: any[] = [];

  docOrigins;

  feeBag!: FeeBag[];

  selectedLocation: any | null = null;

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
    const navigation = history.state;
    if (navigation) {
      console.log('Received docData from navigation: ', navigation['docOrigins']);
      this.docOrigins = navigation['docOrigins'];
      if (!(this.docOrigins && Array.isArray(this.docOrigins) && this.docOrigins.length)) {
        this.feeService.getDocumentOrigins().subscribe((documentOrigins) => {
          console.log('Received docData from API: ', documentOrigins);
          this.docOrigins = documentOrigins;
        });
      }
    }
  }

  increaseUnit(service: any) {
    if (service.totalUnits > service.basicFeeUnitQuantity) {
      service.totalAdditionalRates += service.additionalRates;
    }
    ++service.totalUnits;
  }

  decreaseUnit(service: any) {
    if (service.totalUnits > service.basicFeeUnitQuantity && service.totalAdditionalRates > 0) {
      service.totalAdditionalRates -= service.additionalRates;
    }
    --service.totalUnits;
  }

  deleteItem(service) {
    const index = this.selectedServicesList.indexOf(service);
    if (index !== -1) { // Check if the element exists in the array
      this.selectedServicesList.splice(index, 1);
    }
  }

  calculateTotal(): void {
    console.log("Calculate Total for selected Items: ", this.selectedServicesList);
    // this.calculatedItems = [];
    // this.subtotal = 0;
    // this.tax = 0;
    // this.totalWithTax = 0;
    // this.discounts = [];

    // for (const service of this.services) {
    //   if (service.units > 0) {
    //     const amount = service.units * service.rate;
    //     this.calculatedItems.push({ label: service.label, quantity: service.units, amount });
    //     this.subtotal += amount;
    //   }
    // }

    // if (this.selectedDiscount) {
    //   const discountAmount = (this.subtotal * this.selectedDiscount) / 100;
    //   this.discounts.push({ rate: this.selectedDiscount, amount: discountAmount });
    //   this.subtotal -= discountAmount;
    // }

    // this.tax = this.subtotal * 0.18; // 18% tax
    // this.totalWithTax = this.subtotal + this.tax;
  }

  getFeeConditionsData() {
    this.feeService.getFeesConditions(this.selectedLocation.documentOriginCode, this.selectedCategory.value).subscribe((feeConditions) => {
      if (feeConditions && feeConditions.requestBag[0].feeBag && Array.isArray(feeConditions.requestBag[0].feeBag)) {
        this.currencyCode = feeConditions.currencyCode;
        this.services = feeConditions.requestBag[0].feeBag.map(item => {
          return {
            label: `${item.feeTypeCode} [ ${item.feeDescription} ]`,
            value: `${item.feeDescription}`,
            units: item.basicFeeUnitQuantity,
            rate: item.basicFeeUnitAmount,
            additionalUnits: item.additionalFeeUnitQuantity,
            additionalRates: item.additionalFeeUnitAmount,
            totalUnits: 1,
            totalBasicRates: item.basicFeeUnitAmount,
            totalAdditionalRates: item.additionalFeeUnitAmount

          }
        })
      }
    })
  }

  onSelectingService(value: any) {
    this.selectedServicesList.push(value);
    console.info(this.selectedServicesList, this.selectedLocation, this.selectedCategory);
  }

}
