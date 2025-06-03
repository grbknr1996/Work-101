import { Component, OnInit } from "@angular/core";
import {
  GroupAssignmentComponent,
  GroupItem,
} from "src/app/components/group-assignment.component";
import { StepsModule } from "primeng/steps";
import { ButtonModule } from "primeng/button";
import { CommonModule } from "@angular/common";
import { BasicInfoFormComponent } from "../basic-info-form/basic-info-form.component";
import { AppLayoutComponent } from "../../../components/app-layout/app-layout.component";
import { BreadcrumbsComponent } from "../../../components/breadcrumbs/breadcrumbs.component";
import { ReviewStepComponent } from "../review-step/review-step.component";
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-create-user-account",
  imports: [
    GroupAssignmentComponent,
    StepsModule,
    ButtonModule,
    CommonModule,
    BasicInfoFormComponent,
    AppLayoutComponent,
    BreadcrumbsComponent,
    ReviewStepComponent,
    FormsModule,
    ReactiveFormsModule,
  ],
  standalone: true,
  templateUrl: "./create-user-account.component.html",
})
export class CreateUserAccountComponent implements OnInit {
  steps = [
    { label: "Basic Info" },
    { label: "Groups" },
    { label: "Unit" },
    { label: "Security" },
    { label: "Review" },
  ];
  activeStep = 0;
  isEditMode = false;
  userId: string | null = null;

  userForm: FormGroup;

  availableGroups: GroupItem[] = [
    { id: "1", name: "testzee", type: "USER" },
    { id: "2", name: "PATENT_STAFF", type: "BUSINESS" },
    { id: "3", name: "SYSTEM_ADMINISTRATOR", type: "BUSINESS" },
    { id: "4", name: "VC_Administrator", type: "USER" },
  ];

  breadcrumbItems = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    const officeCode = this.route.snapshot.params["officeCode"];
    const langCode = this.route.snapshot.params["langCode"];
    this.userId = this.route.snapshot.params["userId"];
    this.isEditMode = !!this.userId;

    this.breadcrumbItems = [
      {
        label: "User Management",
        routerLink: `/${officeCode}/${langCode}/user-management/user-accounts`,
      },
      {
        label: this.isEditMode ? "Edit User" : "Create User",
        routerLink: this.isEditMode
          ? `/${officeCode}/${langCode}/user-management/user-accounts/edit-user-account/${this.userId}`
          : `/${officeCode}/${langCode}/user-management/user-accounts/create-user-account`,
      },
    ];

    this.initForm();
    if (this.isEditMode) {
      this.loadUserData();
    }
  }

  private initForm() {
    this.userForm = this.fb.group({
      basicInfo: this.fb.group({
        username: ["", [Validators.required, Validators.minLength(3)]],
        email: ["", [Validators.required, Validators.email]],
        telephone: ["", [Validators.pattern("^[0-9-+() ]*$")]],
        clientId: [""],
        loginAlias: ["", [Validators.minLength(3)]],
        signature: [""],
        profilePicture: [null],
        signatureImage: [null],
      }),
      assignedGroups: [[]],
      unit: [""],
      security: this.fb.group({
        requirePasswordChange: [false],
        enableTwoFactor: [false],
      }),
    });
  }

  private loadUserData() {
    // TODO: Replace with actual API call
    // This is a mock implementation
    const mockUserData = {
      basicInfo: {
        username: "john.doe",
        email: "john.doe@example.com",
        telephone: "+1234567890",
        clientId: "CLI123",
        loginAlias: "jdoe",
        profilePicture: null,
        signatureImage: null,
      },
      assignedGroups: [
        { id: "2", name: "PATENT_STAFF", type: "BUSINESS" },
        { id: "4", name: "VC_Administrator", type: "USER" },
      ],
      unit: "Patent Division",
      security: {
        requirePasswordChange: true,
        enableTwoFactor: false,
      },
    };

    this.userForm.patchValue(mockUserData);
  }

  onAssignedGroupsChange(groups: GroupItem[]) {
    this.userForm.get("assignedGroups").setValue(groups);
  }

  canProceed(): boolean {
    switch (this.activeStep) {
      case 0:
        return this.userForm.get("basicInfo").valid;
      case 1:
        return true;
      case 2:
        return true;
      case 3:
        return true;
      default:
        return true;
    }
  }

  nextStep() {
    if (this.activeStep < this.steps.length - 1 && this.canProceed()) {
      this.activeStep++;
    }
  }

  prevStep() {
    if (this.activeStep > 0) {
      this.activeStep--;
    }
  }

  saveUser() {
    if (this.userForm.valid) {
      const userData = this.userForm.value;
      if (this.isEditMode) {
        // TODO: Implement update user API call
        console.log("Updating user with data:", userData);
      } else {
        // TODO: Implement create user API call
        console.log("Creating user with data:", userData);
      }
      // Navigate back to user accounts list
      this.router.navigate(["../"], { relativeTo: this.route });
    } else {
      this.userForm.markAllAsTouched();
    }
  }
}
