import { Component, OnInit, OnDestroy } from '@angular/core';
import { InactivityService } from '../../_services/inactivity.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-inactivity-modal',
  standalone: false,
  templateUrl: './inactivity-modal.component.html',
})
export class InactivityModalComponent implements OnInit, OnDestroy {
  inactivity$;
  formattedTime: string = '00:00';
  private subscription?: Subscription;

  constructor(private inactivityService: InactivityService) {
    this.inactivity$ = this.inactivityService.inactivity$;
  }

  ngOnInit() {
    // Subscribe to inactivity state to update formatted time
    this.subscription = this.inactivity$.subscribe((state) => {
      this.formattedTime = this.inactivityService.getFormattedTimeRemaining();
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  onStayActive(): void {
    this.inactivityService.reset();
  }

  onLogout(): void {
    this.inactivityService.logoutNow();
  }
}
