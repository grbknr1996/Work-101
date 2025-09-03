// Multiple-stats.component.ts
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

interface MultipleStat {
  label: string;
  displayLabel: any;
  count: number;
  countLabel: string;
  percentChange: number;
  period: string;
  color: string;
  icon: string;
}

@Component({
  selector: "app-multiple-stats",
  templateUrl: "./multiple-stats.component.html",
  standalone: true,
  imports: [CommonModule],
})
export class MultipleStatsComponent implements OnInit, OnChanges {

  @Output() statSelected = new EventEmitter<string>();
  @Input() selectedStat: string | null = null;
  @Input() multipleStats: MultipleStat[] = [];

  ngOnInit(): void {
    this.initMultipleStats();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Re-initialize stats if any input changes
    this.initMultipleStats();
  }

  initMultipleStats(): void {
    
  }

  selectStat(statLabel: string): void {
    this.selectedStat = statLabel;
    console.log("Before emit ",statLabel);
    this.statSelected.emit(statLabel);
  }
}
