import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MechanicsService } from 'src/app/_services/mechanics.service';
import { OnlinePublicationJournalService } from 'src/app/_services/online-publication-journal.service';
import { SidebarMenuService } from 'src/app/_services/sidebar-menu.service';

@Component({
  selector: 'app-online-publication-journal',
  standalone: false,
  templateUrl: './online-publication-journals.component.html'
})
export class OnlinePublicationJournalsComponent implements OnInit {

  breadcrumbItems;
  visible: boolean = false;

  ipTypes = ["trademarks", "patents", "industrial designs"];
  selectedIpTypes: any[] = [];
  startDate;
  endDate;

  executions: any;

  constructor(
    private menuService: SidebarMenuService,
    public ms: MechanicsService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
    private onlinePublicationService: OnlinePublicationJournalService
  ) { }

  ngOnInit(): void {
    const currentPath = this.router.url;
    const menuItems =
      this.menuService.generatePublicationJournalMenu(currentPath);
    this.menuService.updateMenuItems(menuItems);
    // Optionally, dynamically set menu items here
    this.route.params.subscribe((params) => {
      const officeCode =
        params['officeCode'] || this.ms.getCurrentOffice() || 'default';
      const langCode = params['langCode'] || 'en';

      this.breadcrumbItems = [
        {
          label: 'Publication',
          routerLink: `/${officeCode}/${langCode}/publications`,
        },
        {
          label: 'Online Journals',
          routerLink: `/${officeCode}/${langCode}/publications/online-journals`,
        },
      ];

      // Trigger change detection after updating breadcrumbs
      this.cdr.markForCheck();
    });

    this.onlinePublicationService.getOnlinePublicationJournalData()
      .subscribe((data: any) => {
        this.executions = data;
      })
  }

  showDialog() {
    this.visible = true;
  }
}
