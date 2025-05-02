import { CommonModule } from "@angular/common";
import { Component, Input, OnInit } from "@angular/core";
import {
  Router,
  NavigationEnd,
  ActivatedRoute,
  RouterModule,
} from "@angular/router";
import { BreadcrumbModule } from "primeng/breadcrumb";
import { MenuItem } from "primeng/api";
import { filter } from "rxjs/operators";
import { MechanicsService } from "src/app/_services/mechanics.service";

interface BreadcrumbItem extends MenuItem {
  routerLink?: any[] | string;
  label: string;
}

@Component({
  selector: "app-breadcrumbs",
  templateUrl: "./breadcrumbs.component.html",
  standalone: true,
  imports: [CommonModule, BreadcrumbModule, RouterModule],
})
export class BreadcrumbsComponent implements OnInit {
  @Input() home: MenuItem = { icon: "pi pi-home", routerLink: "/" };
  @Input() items: BreadcrumbItem[] = [];
  @Input() styleClass: string = "";

  // When true, breadcrumbs will be generated automatically from the current route
  @Input() autoGenerate: boolean = false;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public ms: MechanicsService
  ) {}

  ngOnInit(): void {
    const officeCode =
      this.activatedRoute.snapshot.params["officeCode"] || "default";
    this.home = {
      icon: "pi pi-home",
      label: `${officeCode}`,
      routerLink: `/${officeCode}/en/dashboard`,
    };
    if (this.autoGenerate) {
      this.router.events
        .pipe(filter((event) => event instanceof NavigationEnd))
        .subscribe(() => {
          this.items = this.createBreadcrumbs(this.activatedRoute.root);
        });

      // Initialize breadcrumbs on component init
      this.items = this.createBreadcrumbs(this.activatedRoute.root);
    }
  }

  private createBreadcrumbs(
    route: ActivatedRoute,
    url: string = "",
    breadcrumbs: BreadcrumbItem[] = []
  ): BreadcrumbItem[] {
    const children: ActivatedRoute[] = route.children;

    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      const routeURL: string = child.snapshot.url
        .map((segment) => segment.path)
        .join("/");
      if (routeURL !== "") {
        url += `/${routeURL}`;
      }

      const label = child.snapshot.data["breadcrumb"];
      if (label) {
        breadcrumbs.push({
          label,
          routerLink: url,
        });
      }

      return this.createBreadcrumbs(child, url, breadcrumbs);
    }

    return breadcrumbs;
  }
}
