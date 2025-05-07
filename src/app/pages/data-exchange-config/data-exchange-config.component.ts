import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import {
  AppLayoutComponent,
  LayoutConfig,
} from "../../components/app-layout/app-layout.component";
import { DistributionExclusionRulesComponent } from "./data-exclusion-rules/distribution-exclusion-rules.component";

@Component({
  selector: "app-data-exchange-config",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    AppLayoutComponent,
    DistributionExclusionRulesComponent,
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

  onSummaryCardClick(card: any) {
    if (card.title === "Distribution Exclusion Rules") {
      this.showExclusionRules = true;
    }
  }
}
