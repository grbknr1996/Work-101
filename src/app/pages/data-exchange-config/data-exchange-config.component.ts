import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import {
  AppLayoutComponent,
  LayoutConfig,
} from "../../components/app-layout/app-layout.component";
import { DistributionExclusionRulesComponent } from "./data-exclusion-rules/distribution-exclusion-rules.component";
import { TableComponent } from "../../components/table/table.component";

@Component({
  selector: "app-data-exchange-config",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    AppLayoutComponent,
    DistributionExclusionRulesComponent,
    TableComponent,
  ],
  templateUrl: "./data-exchange-config.component.html",
})
export class DataExchangeConfigComponent implements OnInit {
  layoutConfig: LayoutConfig;
  summaryCards = [
    {
      icon: "pi pi-building",
      title: "Originating Offices",
      count: 5,
      description: "IP offices providing data to the WIPO system",
      color: "#1976d2",
    },
    {
      icon: "pi pi-database",
      title: "Recipient Systems",
      count: 5,
      description: "IP Offices / WIPO Databases",
      color: "#e91e63",
    },
    {
      icon: "pi pi-shield",
      title: "Distribution Exclusion Rules",
      count: 3,
      description: "Rules defining data distribution exceptions",
      color: "#222",
    },
  ];

  showExclusionRules = false;
  showOriginatingOffices = false;
  showRecipientSystems = false;

  originatingOfficesColumns = [
    { field: "code", header: "Office Code", display: "text" },
    { field: "name", header: "Office Name", display: "text" },
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
  originatingOfficesData = [
    { code: "US", name: "United States Patent and Trademark Office" },
    { code: "EP", name: "European Patent Office" },
    { code: "JP", name: "Japan Patent Office" },
    { code: "CN", name: "China National Intellectual Property Administration" },
    { code: "KR", name: "Korean Intellectual Property Office" },
  ];

  showAddOffice = false;

  recipientSystemsColumns = [
    { field: "code", header: "Office Code", display: "custom" },
    { field: "name", header: "Recipient Name", display: "text" },
    { field: "type", header: "Type", display: "text" },
    { field: "totalRules", header: "Total Rules", display: "text" },
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
  recipientSystemsData = [
    {
      code: "PATENTSCOPE",
      name: "WIPO PATENTSCOPE",
      type: "Global",
      totalRules: 5,
    },
    {
      code: "GBDB",
      name: "Global Brand Database",
      type: "Global",
      totalRules: 3,
    },
    {
      code: "GIDB",
      name: "Global Design Database",
      type: "Global",
      totalRules: 2,
    },
    {
      code: "GGIDB",
      name: "Global Geographical Indication Database",
      type: "Global",
      totalRules: 1,
    },
    { code: "WIPO_CASE", name: "WIPO CASE", type: "Regional", totalRules: 4 },
  ];

  constructor() {
    this.layoutConfig = {
      appTitle: "Data Exchange Configuration",
      showHeader: true,
      showSidebar: false,
      headerItems: [],
      sidebarItems: [],
      footerText: "© WIPO " + new Date().getFullYear(),
      fixedHeader: true,
      fixedSidebar: true,
      sidebarCollapsed: false,
      theme: "light",
      logo: "",
    };
  }

  ngOnInit(): void {}

  onOriginatingOfficeAction(event: { action: string; item: any }) {
    if (event.action === "delete") {
      this.originatingOfficesData = this.originatingOfficesData.filter(
        (row) => row !== event.item
      );
    }
  }

  onRecipientSystemAction(event: { action: string; item: any }) {
    if (event.action === "delete") {
      this.recipientSystemsData = this.recipientSystemsData.filter(
        (row) => row !== event.item
      );
    }
  }

  onSummaryCardClick(card: any) {
    if (card.title === "Distribution Exclusion Rules") {
      this.showExclusionRules = true;
      this.showOriginatingOffices = false;
      this.showRecipientSystems = false;
    } else if (card.title === "Originating Offices") {
      this.showOriginatingOffices = true;
      this.showExclusionRules = false;
      this.showRecipientSystems = false;
    } else if (card.title === "Recipient Systems") {
      this.showRecipientSystems = true;
      this.showOriginatingOffices = false;
      this.showExclusionRules = false;
    }
  }

  onAddOfficeClick() {
    this.showAddOffice = true;
    // Placeholder for add office logic
  }

  onAddSystemClick() {
    // Placeholder for add system logic
  }

  deleteOriginatingOffice(row: any) {
    this.originatingOfficesData = this.originatingOfficesData.filter(
      (r) => r !== row
    );
  }
}
