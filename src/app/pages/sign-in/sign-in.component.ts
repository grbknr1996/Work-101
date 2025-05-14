import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { AuthService } from "../../_services/auth.service";
import { MechanicsService } from "../../_services/mechanics.service";

@Component({
  selector: "app-sign-in",
  template: "", // Empty template since we're redirecting immediately
  standalone: true,
})
export class SignInComponent implements OnInit {
  officeCode: string;
  langCode: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    public ms: MechanicsService
  ) {
    // Get office code and language code from route params
    this.officeCode = this.route.snapshot.params["officeCode"] || "default";
    this.langCode = this.route.snapshot.params["langCode"] || "en";
  }

  ngOnInit() {
    this.ms.setCurrentOffice(this.officeCode);
    this.ms.switchLang(this.langCode);

    // Immediately trigger the hosted UI
    this.authService.login("", "").subscribe({
      error: (error) => {
        console.error("Error initiating sign in:", error);
      },
    });
  }
}
