// src/app/components/default-redirect/default-redirect.component.ts
import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { AuthService } from "../../_services/auth.service";
import { MechanicsService } from "../../_services/mechanics.service";

@Component({
  selector: "app-default-redirect",
  template: "",
})
export class DefaultRedirectComponent implements OnInit {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private ms: MechanicsService
  ) {}

  async ngOnInit() {
    const officeCode = this.route.snapshot.params["officeCode"] || "default";
    const langCode = this.route.snapshot.params["langCode"] || "en";
    const queryParams = this.route.snapshot.queryParams;

    // Set the language
    await this.ms.switchLang(langCode);

    // Check if this is a post-authentication redirect (has code parameter)
    if (queryParams["code"]) {
      // After successful authentication, redirect to dashboard
      this.router.navigate([`/${officeCode}/${langCode}/dashboard`]);
    } else {
      // Normal redirect to dashboard
      this.router.navigate([`/${officeCode}/${langCode}/dashboard`]);
    }
  }
}
