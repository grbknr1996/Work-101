import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
} from "@angular/core";
import {
  SidebarMenuService,
  MenuItem,
} from "../../_services/sidebar-menu.service";
import { MechanicsService } from "../../_services/mechanics.service";
import { Subscription } from "rxjs";
import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { CommonModule } from "@angular/common";
import { DividerModule } from "primeng/divider";
import { RouterModule } from "@angular/router";
import { TranslateModule } from "@ngx-translate/core";

@Component({
  selector: "app-sidebar",
  templateUrl: "./app-sidebar.component.html",
  standalone: true,
  imports: [CommonModule, DividerModule, RouterModule, TranslateModule],
})
export class AppSidebarComponent implements OnInit, OnDestroy {
  @Input() visible: boolean = true;
  @Input() fixed: boolean = true;
  @Input() items: MenuItem[] = [];
  // Output event to notify parent when compact mode is toggled internally
  @Output() compactModeChange = new EventEmitter<boolean>();

  menuItems: MenuItem[] = [];
  compactMode: boolean = false;
  isMobile: boolean = false;
  private subscriptions: Subscription[] = [];

  constructor(
    public sidebarMenuService: SidebarMenuService,
    public ms: MechanicsService,
    private breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit(): void {
    // Subscribe to menu items changes
    const menuSubscription = this.sidebarMenuService.sidebarItems$.subscribe(
      (items) => {
        // Pre-translate all menu items and their children
        this.menuItems = this.preTranslateMenuItems(items);
      }
    );
    this.subscriptions.push(menuSubscription);

    // Subscribe to compact mode changes
    const compactSubscription = this.sidebarMenuService.compactMode$.subscribe(
      (compact) => {
        this.compactMode = compact;
        // Emit the updated compact mode to parent
        this.compactModeChange.emit(compact);
      }
    );
    this.subscriptions.push(compactSubscription);

    // Subscribe to screen size changes for mobile view
    const breakpointSubscription = this.breakpointObserver
      .observe([Breakpoints.HandsetPortrait, Breakpoints.HandsetLandscape])
      .subscribe((result) => {
        this.isMobile = result.matches;
        if (this.isMobile) {
          this.sidebarMenuService.setSidebarVisibility(false);
        } else {
          this.sidebarMenuService.setSidebarVisibility(true);
        }
      });
    this.subscriptions.push(breakpointSubscription);

    // Subscribe to visibility changes from SidebarMenuService
    const visibilitySubscription =
      this.sidebarMenuService.sidebarVisible$.subscribe((visible) => {
        this.visible = visible;
      });
    this.subscriptions.push(visibilitySubscription);
  }

  // New method to pre-translate menu items and their children
  preTranslateMenuItems(items: MenuItem[]): MenuItem[] {
    return items.map((item) => {
      const translatedItem = {
        ...item,
        displayLabel: this.ms.translate(item.label),
      };

      if (item.items && item.items.length > 0) {
        translatedItem.items = this.preTranslateMenuItems(item.items);
      }

      return translatedItem;
    });
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  toggleMenuItem(item: MenuItem): void {
    this.sidebarMenuService.toggleMenuItem(item.id);
  }

  toggleCompactMode(): void {
    this.sidebarMenuService.toggleCompactMode();
  }

  closeSidebarOnMobile(): void {
    if (this.isMobile) {
      this.sidebarMenuService.setSidebarVisibility(false);
    }
  }
}
