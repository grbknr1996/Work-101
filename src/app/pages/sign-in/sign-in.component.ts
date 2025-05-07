import { Component } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from "@angular/forms";
import { Router, ActivatedRoute, RouterModule } from "@angular/router";
import { MessageService } from "primeng/api";
import { CommonModule, NgClass, NgIf } from "@angular/common";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { PasswordModule } from "primeng/password";
import { TranslateModule } from "@ngx-translate/core";
import { AuthService } from "../../_services/auth.service";
import { MechanicsService } from "../../_services/mechanics.service";
import { finalize } from "rxjs/operators";
import { DividerModule } from "primeng/divider";
import { MessageModule } from "primeng/message";
import { ProgressSpinnerModule } from "primeng/progressspinner";
import { CheckboxModule } from "primeng/checkbox";
import { CardModule } from "primeng/card";

@Component({
  selector: "app-sign-in",
  templateUrl: "./sign-in.component.html",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    NgClass,
    NgIf,
    InputTextModule,
    PasswordModule,
    TranslateModule,
    DividerModule,
    CardModule,
    CheckboxModule,
    ProgressSpinnerModule,
    MessageModule,
    RouterModule,
  ],
  providers: [MessageService],
})
export class SignInComponent {
  signInForm: FormGroup;
  submitted = false;
  loading = false;
  error = "";
  officeCode: string;
  langCode: string;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private authService: AuthService,
    public ms: MechanicsService
  ) {
    this.signInForm = this.formBuilder.group({
      email: ["", [Validators.required]],
      password: ["", Validators.required],
      rememberMe: [false],
    });

    // Get office code and language code from route params
    this.officeCode = this.route.snapshot.params["officeCode"] || "default";
    this.langCode = this.route.snapshot.params["langCode"] || "en";

    // Set the language
    this.ms.switchLang(this.langCode);
  }
  ngOnInit() {
    this.officeCode = this.route.snapshot.params["officeCode"] || "default";
    this.ms.setCurrentOffice(this.officeCode);
    this.ms.switchLang(this.langCode);
  }
  get email() {
    return this.signInForm.get("email");
  }

  get password() {
    return this.signInForm.get("password");
  }

  onSubmit() {
    if (this.signInForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = "";

    this.authService
      .login(this.signInForm.value.email, this.signInForm.value.password)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (response) => {
          if (response.isSignedIn) {
            // Navigate to the dashboard using current office and language codes
            this.router.navigate([
              `/${this.officeCode}/${this.langCode}/dashboard`,
            ]);
          }
        },
        error: (error) => {
          this.error = this.ms.translate(
            "auth.signIn.errors.invalidCredentials"
          );
        },
      });
  }

  get f() {
    return this.signInForm.controls;
  }
}
