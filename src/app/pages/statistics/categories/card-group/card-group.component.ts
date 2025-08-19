//ANGULAR CORE
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';

//RxJS
import { filter } from 'rxjs/operators';

//STATS-CARD
import { StatCardComponent } from '../card/stat-card.component';

@Component({
  standalone: true,
  selector: 'app-card-group',
  imports: [
    CommonModule,
    FormsModule,
    StatCardComponent
  ],
  templateUrl: 'card-group.component.html',
  styles: [`
    .card-group {
      display: grid;
      grid-template-columns: repeat(10, minmax(0, 1fr));
      gap: 6px;
      padding: 8px;
      background: #ffffff;
      border-bottom: 1px solid #ddd;
    }
  `]
})
export class CardGroupComponent {

  //DI
  private router = inject(Router);

  cards = [
    { icon: 'pi-chart-line', label: 'TRENDS', route: '/vc/en/statistics/trends' },
    { icon: 'pi-globe', label: 'ORIGINS', route: '/vc/en/statistics/origins' },
    { icon: 'pi-users', label: 'APPLICANTS', route: '/vc/en/statistics/applicants' },
    { icon: 'pi-id-card', label: 'REPRESENTATIVES', route: '/vc/en/statistics/representatives' },
    { icon: 'pi-book', label: 'PATENTS', route: '/vc/en/statistics/patents' },
    { icon: 'pi-pencil', label: 'INDUSTRIAL DESIGNS', route: '/vc/en/statistics/industrial-designs' },
    { icon: 'pi-tags', label: 'TRADEMARKS', route: '/vc/en/statistics/trademarks' },
    { icon: 'pi-wallet', label: 'FEES', route: '/vc/en/statistics/fees' },
    { icon: 'pi-star', label: 'CATEGORY X', route: '/vc/en/statistics/category-x' },
    { icon: 'pi-cog', label: 'CATEGORY Y', route: '/vc/en/statistics/category-y' }
  ];
  selectedCard: string = '';

  constructor() {
    this.highlightCard(this.router.url);

    // update highlight on every navigation
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        this.highlightCard(e.url);
      });
  }

  private highlightCard(currentRoute: string) {
    const match = this.cards.find(item => currentRoute === item.route);
    this.selectedCard = match ? match.label : '';
  }
  handleCardClick(card: { label: string; route: string }) {
    this.selectedCard = card.label; //Instant Highlight
    this.router.navigate([card.route]);
  }
}