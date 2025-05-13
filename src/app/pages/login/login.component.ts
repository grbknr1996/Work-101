import { Component, OnInit, inject } from "@angular/core";
import { AuthService } from "../../_services/auth.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
  standalone: true,
})
export class LoginComponent implements OnInit {
  private readonly authService = inject(AuthService);

  ngOnInit() {
    this.authService.login();
  }
}
