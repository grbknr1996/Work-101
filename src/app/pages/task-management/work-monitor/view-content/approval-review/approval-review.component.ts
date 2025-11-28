import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { CaptureDocumentService } from "src/app/_services/capture-document.service";

@Component({
  selector: 'app-approval-review',
  standalone: false,
  providers: [CaptureDocumentService],
  templateUrl: './approval-review.component.html',
})

export class ApprovalReviewComponent implements OnInit {
approvalReviewData = [
  {
    reviewerName: "Daniel Cheng",
    reviewDate: "2025-05-01",
    legalBackground: "TRADE MARKS ACT CAP. 315 (Regulation 47 Part 8)",
    reviewComments:
      "The application shows strong distinctiveness and meets all formality requirements. However, there is a potential conflict with an existing registered mark in Class 25. The applicant should consider narrowing the specification or providing evidence of use to overcome this objection.",
    actionsToOvercome:
      "Submit evidence of continuous use in commerce for at least 5 years, or alternatively, amend the specification to exclude goods that conflict with the cited mark. Consider filing a statement of use with supporting documentation including sales invoices and marketing materials.",
  },
    {
    reviewerName: "Sarah Wilson",
    reviewDate: "2025-05-01",
    legalBackground: "TRADE MARKS ACT CAP. 315 (Regulation 47 Part 8)",
    reviewComments:
      "The trademark appears to be descriptive of the goods/services listed in the application. Pursuant to Section 7(1)(c) of the Trade Marks Act, marks that consist exclusively of signs or indications which may serve to designate the kind, quality, or other characteristics of goods or services are not registrable.",
  },
  {
    reviewerName: "Pankaj Kumar",
    reviewDate: "2025-05-01",
    legalBackground: "TRADE MARKS ACT CAP. 315 (Regulation 47 Part 8)",
    reviewComments:
      "The trademark appears to be descriptive of the goods/services listed in the application. Pursuant to Section 7(1)(c) of the Trade Marks Act, marks that consist exclusively of signs or indications which may serve to designate the kind, quality, or other characteristics of goods or services are not registrable.",
    actionsToOvercome:
      "Provide evidence that the mark has acquired distinctiveness through extensive use in the marketplace. Submit market surveys, advertising expenditure data, and consumer recognition studies. Alternatively, consider adding a distinctive element to the mark or filing under a different class.",
  }
];

    constructor(
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    console.log("Approval Review Component Loaded");

  }
}