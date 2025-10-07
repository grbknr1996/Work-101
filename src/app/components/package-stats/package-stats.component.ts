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
  standalone: false,
})
export class PackageStatsComponent implements OnInit, OnChanges {

  @Output() statSelected = new EventEmitter<string>();
  @Input() selectedStat: string | null = null;
  @Input() packageStats: PackageStat[] = [];

  ngOnInit(): void {
    this.initPackageStats();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Re-initialize stats if any input changes
    this.initPackageStats();
  }

  initPackageStats(): void {
    
  }

  selectStat(statLabel: string): void {
    this.selectedStat = statLabel;
    console.log("Before emit ",statLabel);
    this.statSelected.emit(statLabel);
  }
}
