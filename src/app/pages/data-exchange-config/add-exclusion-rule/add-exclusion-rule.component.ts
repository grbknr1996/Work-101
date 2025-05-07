import { Component, Output, EventEmitter } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { DropdownModule } from "primeng/dropdown";
import { MultiSelectModule } from "primeng/multiselect";
import { TabViewModule } from "primeng/tabview";
import { CheckboxModule } from "primeng/checkbox";
import { AccordionModule } from "primeng/accordion";
import { ButtonModule } from "primeng/button";
import { MessageModule } from "primeng/message";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { StepsModule } from "primeng/steps";

@Component({
  selector: "app-add-exclusion-rule",
  templateUrl: "./add-exclusion-rule.component.html",
  //styleUrls: ["./add-exclusion-rule.component.css"],
  standalone: true,
  imports: [
    CommonModule,
    DropdownModule,
    MultiSelectModule,
    TabViewModule,
    CheckboxModule,
    AccordionModule,
    ButtonModule,
    MessageModule,
    FormsModule,
    ReactiveFormsModule,
    StepsModule,
  ],
})
export class AddExclusionRuleComponent {
  @Output() close = new EventEmitter<void>();
  step = 0;
  steps = [
    { label: "Source & Categories" },
    { label: "Status Exclusions" },
    { label: "Category Exclusions" },
    { label: "Review" },
  ];

  offices = [
    { label: "United States Patent and Trademark Office", value: "uspto" },
    { label: "European Patent Office", value: "epo" },
  ];
  systems = [
    { label: "WIPO PATENTSCOPE (Global)", value: "patentscope" },
    { label: "WIPO ASEAN IP Register", value: "asean" },
  ];
  ipCategories = [
    { label: "Patent", value: "patent" },
    { label: "Trademark", value: "trademark" },
    { label: "Industrial Design", value: "industrial_design" },
  ];
  documentTypes = [
    { label: "search_report", value: "search_report" },
    { label: "priority_document", value: "priority_document" },
    { label: "publication_notice", value: "publication_notice" },
  ];
  eventCodes = [
    { code: "W10", label: "Application received" },
    { code: "D10", label: "Application published" },
    { code: "E10", label: "Registration expired" },
    { code: "G10", label: "Application rejected" },
    { code: "Z10", label: "Division/Continuation" },
    { code: "B20", label: "Extension requested" },
    { code: "U10", label: "Formality check passed" },
    { code: "Q10", label: "Registration granted" },
    { code: "F10", label: "Application withdrawn" },
    { code: "Y10", label: "Priority claimed" },
    { code: "A20", label: "Supplementary protection" },
    { code: "E20", label: "Renewal/Maintenance" },
  ];

  // Step 1 form
  form1: FormGroup;
  // Step 2/3/4 data
  selectedCategories: string[] = [];
  statusExclusions: any = {};
  eventExclusions: any = {};
  documentExclusions: any = {};
  enableDocumentExclusions: any = {};

  constructor(private fb: FormBuilder) {
    this.form1 = this.fb.group({
      office: [null, Validators.required],
      system: [null, Validators.required],
      categories: [[], Validators.required],
    });
  }

  nextStep() {
    if (this.step === 0) {
      this.selectedCategories = this.form1.value.categories;
      // Initialize exclusions for each category
      for (const cat of this.selectedCategories) {
        if (!this.statusExclusions[cat]) {
          this.statusExclusions[cat] = {
            unpublished: false,
            unregistered: false,
          };
        }
        if (!this.eventExclusions[cat]) {
          this.eventExclusions[cat] = [];
        }
        if (!this.documentExclusions[cat]) {
          this.documentExclusions[cat] = [];
        }
        if (this.enableDocumentExclusions[cat] === undefined) {
          this.enableDocumentExclusions[cat] = false;
        }
      }
    }
    this.step++;
  }
  prevStep() {
    this.step--;
  }

  getCategoryLabel(cat: string): string {
    const found = this.ipCategories.find((c) => c.value === cat);
    return found ? found.label : cat;
  }

  getOfficeLabel(value: string): string {
    const found = this.offices.find((o) => o.value === value);
    return found ? found.label : value;
  }

  getSystemLabel(value: string): string {
    const found = this.systems.find((s) => s.value === value);
    return found ? found.label : value;
  }
}
