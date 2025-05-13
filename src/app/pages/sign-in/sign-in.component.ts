import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { AuthService } from "../../_services/auth.service";
import { MechanicsService } from "src/app/_services/mechanics.service";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-sign-in",
  template: "",
  standalone: true,
})
export class SignInComponent implements OnInit {
  officeCode: string;
  langCode: string;

  constructor(
    private ms: MechanicsService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    console.log("Sign in component initialized");

    // Try to get office code from different possible locations in the route
    this.officeCode =
      this.route.snapshot.params["officeCode"] ||
      this.route.snapshot.parent?.params["officeCode"] ||
      "default";

    console.log("Setting office to:", this.officeCode);
    await this.ms.setCurrentOffice(this.officeCode);

    // Get language code from route or use default from office config
    this.langCode =
      this.route.snapshot.params["langCode"] || this.ms.getDefaultLanguage();

    await this.ms.switchLang(this.langCode);

    // Force change detection
    this.cdr.detectChanges();

    console.log("Current office before redirect:", this.ms.getCurrentOffice());
    this.authService.signInWithRedirect();
  }
}
