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

  ngOnInit() {
    const officeCode = this.route.snapshot.params["officeCode"] || "default";
    const langCode = this.route.snapshot.params["langCode"] || "en";

    // Set the language
    this.ms.switchLang(langCode);

    // Navigate to the appropriate route
    this.router.navigate([`/${officeCode}/${langCode}/dashboard`]);
  }
}
