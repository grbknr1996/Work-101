// Package-stats.component.ts
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  Output,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { PrimeIcons } from "primeng/api";

interface PackageStat {
  label: string;
  count: number;
  percentChange: number;
  period: string;
  color: string;
  icon: string;
}

@Component({
  selector: "app-package-stats",
  templateUrl: "./package-stats.component.html",
  standalone: true,
  imports: [CommonModule],
})
export class PackageStatsComponent implements OnInit, OnChanges {
  @Input() totalPackages: number = 0;
  @Input() yearPackages: number = 0;
  @Input() monthPackages: number = 0;
  @Input() weekPackages: number = 0;

  @Input() totalPackagesPercentChange: number = 0;
  @Input() yearPackagesPercentChange: number = 0;
  @Input() monthPackagesPercentChange: number = 0;
  @Input() weekPackagesPercentChange: number = 0;

  @Input() totalPackagesPeriod: string = "last decade";
  @Input() yearPackagesPeriod: string = "last year";
  @Input() monthPackagesPeriod: string = "last month";
  @Input() weekPackagesPeriod: string = "last week";

  @Output() statSelected = new EventEmitter<string>();

  @Input() selectedStat: string | null = null;
  packageStats: PackageStat[] = [];

  ngOnInit(): void {
    this.initPackageStats();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Re-initialize stats if any input changes
    this.initPackageStats();
  }

  initPackageStats(): void {
    this.packageStats = [
      {
        label: "TOTAL COUNT",
        count: this.totalPackages,
        percentChange: this.totalPackagesPercentChange,
        period: this.totalPackagesPeriod,
        color: "#3949AB", // Indigo color
        icon: "pi pi-thumbtack",
      },
      {
        label: "TOTAL IN YEAR",
        count: this.yearPackages,
        percentChange: this.yearPackagesPercentChange,
        period: this.yearPackagesPeriod,
        color: "#2E7D32", // Green color
        icon: "pi pi-check-circle",
      },
      {
        label: "TOTAL IN MONTH",
        count: this.monthPackages,
        percentChange: this.monthPackagesPercentChange,
        period: this.monthPackagesPeriod,
        color: "#022382", // Dark blue color
        icon: "pi pi-tag",
      },
      {
        label: "TOTAL IN WEEK",
        count: this.weekPackages,
        percentChange: this.weekPackagesPercentChange,
        period: this.weekPackagesPeriod,
        color: "#0288D1", // Blue color
        icon: "pi pi-spinner",
      },
    ];
  }

  selectStat(statLabel: string): void {
    this.selectedStat = statLabel;
    console.log("Before emit ",statLabel);
    this.statSelected.emit(statLabel);
  }
}
