import { Component, OnInit } from "@angular/core";
import { RouterModule } from "@angular/router";
import { instanceType } from "src/app/utils";
import { configuration } from "src/environments/environment";

@Component({
  selector: "app-auth-signout",
  templateUrl: "./auth-signout.component.html",
  styleUrls: ["./auth-signout.component.css"],
  imports: [RouterModule],
})
export class AuthSignoutComponent implements OnInit {
  officeCode = "";
  officeConfig;

  langCode = "";

  constructor() {
    this.officeCode = instanceType();
    this.officeConfig = configuration[this.officeCode];
    this.langCode = this.officeConfig?.defaultLanguage || "en";
  }
  ngOnInit() {
    // TODO: Replace <OIDC_PROVIDER_DOMAIN> with your actual OIDC provider's logout URL
  }
}
