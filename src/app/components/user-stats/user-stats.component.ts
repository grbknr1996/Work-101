// user-stats.component.ts
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

interface UserStat {
  label: string;
  count: number;
  percentChange: number;
  period: string;
  color: string;
  icon: string;
}

@Component({
  selector: "app-user-stats",
  templateUrl: "./user-stats.component.html",
  standalone: true,
  imports: [CommonModule],
})
export class UserStatsComponent implements OnInit, OnChanges {
  @Input() totalUsers: number = 0;
  @Input() activeUsers: number = 0;
  @Input() inactiveUsers: number = 0;
  @Input() unconfirmedUsers: number = 0;

  @Input() totalUsersPercentChange: number = 0;
  @Input() activeUsersPercentChange: number = 0;
  @Input() inactiveUsersPercentChange: number = 0;
  @Input() unconfirmedUsersPercentChange: number = 0;

  @Input() totalUsersPeriod: string = "last month";
  @Input() activeUsersPeriod: string = "last week";
  @Input() inactiveUsersPeriod: string = "last month";
  @Input() unconfirmedUsersPeriod: string = "last week";

  @Output() statSelected = new EventEmitter<string>();

  selectedStat: string | null = null;
  userStats: UserStat[] = [];

  ngOnInit(): void {
    this.initUserStats();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Re-initialize stats if any input changes
    this.initUserStats();
  }

  initUserStats(): void {
    this.userStats = [
      {
        label: "TOTAL USERS",
        count: this.totalUsers,
        percentChange: this.totalUsersPercentChange,
        period: this.totalUsersPeriod,
        color: "#3949AB", // Indigo color
        icon: "pi pi-users",
      },
      {
        label: "ACTIVE USERS",
        count: this.activeUsers,
        percentChange: this.activeUsersPercentChange,
        period: this.activeUsersPeriod,
        color: "#2E7D32", // Green color
        icon: "pi pi-check-circle",
      },
      {
        label: "INACTIVE USERS",
        count: this.inactiveUsers,
        percentChange: this.inactiveUsersPercentChange,
        period: this.inactiveUsersPeriod,
        color: "#D32F2F", // Red color
        icon: "pi pi-times-circle",
      },
      {
        label: "UNCONFIRMED USERS",
        count: this.unconfirmedUsers,
        percentChange: this.unconfirmedUsersPercentChange,
        period: this.unconfirmedUsersPeriod,
        color: "#0288D1", // Blue color
        icon: "pi pi-user-plus",
      },
    ];
  }

  selectStat(statLabel: string): void {
    this.selectedStat = statLabel;
    this.statSelected.emit(statLabel);
  }
}
