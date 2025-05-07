import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  TableComponent,
  ColumnDefinition,
  Action,
} from "../../../components/table/table.component";
import { AddExclusionRuleComponent } from "../add-exclusion-rule/add-exclusion-rule.component";

@Component({
  selector: "app-distribution-exclusion-rules",
  templateUrl: "./distribution-exclusion-rules.component.html",

  standalone: true,
  imports: [CommonModule, TableComponent, AddExclusionRuleComponent],
})
export class DistributionExclusionRulesComponent {
  showAddRuleForm = false;

  columns: ColumnDefinition[] = [
    {
      field: "originatingOffice",
      header: "Originating Office",
      display: "text",
    },
    { field: "recipientName", header: "Recipient Name", display: "text" },
    {
      field: "ipCategoryTypes",
      header: "IP Category Types",
      display: "custom",
    },
    {
      field: "applicationStatus",
      header: "Application Status",
      display: "custom",
    },
    {
      field: "excludedEventCodes",
      header: "Excluded Event Codes",
      display: "custom",
    },
    {
      field: "excludedDocuments",
      header: "Excluded Documents",
      display: "custom",
    },
    {
      field: "actions",
      header: "Actions",
      display: "actions",
      actions: [
        {
          label: "Delete",
          icon: "pi pi-trash",
          action: "delete",
          severity: "danger",
        },
      ],
      showAsDropdown: false,
    },
  ];

  data = [
    {
      originatingOffice: "US",
      recipientName: "WIPO ASEAN IP Register",
      ipCategoryTypes: ["patent", "trademark"],
      applicationStatus: ["Unpublished Applications", "Unregistered Rights"],
      excludedEventCodes: "3 events",
      excludedDocuments: "2 documents",
    },
    {
      originatingOffice: "EP",
      recipientName: "WIPO Global databases",
      ipCategoryTypes: ["industrial design"],
      applicationStatus: ["Unregistered Rights"],
      excludedEventCodes: "1 events",
      excludedDocuments: "2 documents",
    },
    {
      originatingOffice: "JP",
      recipientName: "EPO Espacenet",
      ipCategoryTypes: ["patent"],
      applicationStatus: ["Unpublished Applications"],
      excludedEventCodes: "None",
      excludedDocuments: "Disabled",
    },
  ];

  onActionClick(event: { action: string; item: any }) {
    if (event.action === "delete") {
      this.data = this.data.filter((row) => row !== event.item);
    }
  }
}
