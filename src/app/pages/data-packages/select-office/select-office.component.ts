import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { SidebarMenuService } from '../../../_services/sidebar-menu.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MechanicsService } from 'src/app/_services/mechanics.service';

interface Office {
    name: string;
    code: string;
}

@Component({
  selector: 'app-select-office',
  templateUrl: './select-office.component.html',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectOfficeComponent implements OnInit {

  breadcrumbItems = [];

  offices: Office[] | undefined;

  selectedOffice: Office | undefined;

  constructor(
    private menuService: SidebarMenuService,
    private router: Router,
    private route: ActivatedRoute,
    public ms: MechanicsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    this.route.params.subscribe((params) => {
      const officeCode =
        params['officeCode'] || this.ms.getCurrentOffice() || 'default';
      const langCode = params['langCode'] || 'en';

      if(officeCode=='default'){
        this.breadcrumbItems = [
          {
            label: 'Offices',
            routerLink: `/${officeCode}/${langCode}/data-packages/select-office`,
          }
        ];
      }


      // Trigger change detection after updating breadcrumbs
      this.cdr.markForCheck();
    });

    const currentPath = this.router.url;
    const menuItems = this.menuService.generateConfigurationMenu(currentPath,'');
    this.menuService.updateMenuItems(menuItems);


    this.offices = [
      { name: 'Combodia', code: 'kh' },
      { name: 'Philippines', code: 'ph' },
      { name: 'Singapore', code: 'sg' },
      { name: 'Thailand', code: 'th' },
      { name: 'Malaysia', code: 'my' },
    ];

  }

  onOfficeChange(event: any) {
    console.log('Selected Office:', this.selectedOffice);
  }

  onSelectOffice() {
    // Placeholder for create user action
    this.router.navigate(['../',this.selectedOffice.code], { relativeTo: this.route });
  }

}
