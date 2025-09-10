// user-stats.component.ts
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrimeIcons } from 'primeng/api';

export interface StatItem {
  key: string;
  label: string;
  count: number;
  color: string;
  icon: string;
}

export interface UserStatsConfig {
  stats: StatItem[];
  defaultSelectedStat?: string;
  showIcons?: boolean;
  showCounts?: boolean;
}

@Component({
  selector: 'app-user-stats',
  templateUrl: './user-stats.component.html',
  standalone: true,
  imports: [CommonModule],
})
export class UserStatsComponent implements OnInit, OnChanges {
  @Input() config: UserStatsConfig = { stats: [] };
  @Input() defaultSelectedStat: string = '';

  @Output() statSelected = new EventEmitter<string>();

  selectedStat: string | null = null;
  userStats: StatItem[] = [];

  private hasEmittedInitialStat = false;

  ngOnInit(): void {
    this.initUserStats();

    // Set default selected stat from config or input
    const defaultStat =
      this.config.defaultSelectedStat || this.defaultSelectedStat;
    this.selectedStat = defaultStat;

    // Emit the default stat selection only once during initialization
    if (!this.hasEmittedInitialStat && defaultStat) {
      this.statSelected.emit(defaultStat);
      this.hasEmittedInitialStat = true;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Re-initialize stats if config changes
    if (changes['config']) {
      this.initUserStats();
    }

    // Update selected stat if defaultSelectedStat changes, but only after initialization
    if (
      changes['defaultSelectedStat'] &&
      !changes['defaultSelectedStat'].firstChange
    ) {
      this.selectedStat = this.defaultSelectedStat;
      // Only emit if this is a programmatic change after initialization
      this.statSelected.emit(this.defaultSelectedStat);
    }
  }

  initUserStats(): void {
    this.userStats = this.config.stats || [];
  }

  selectStat(statKey: string): void {
    this.selectedStat = statKey;
    this.statSelected.emit(statKey);
  }

  /**
   * Update the selected stat visually without emitting events
   * This is used when filters are applied/cleared to show the current state
   */
  updateSelectedStat(statKey: string): void {
    this.selectedStat = statKey;
  }
}
