//ANGULAR CORE
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-stat-card',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: 'stat-card.component.html',
  styles: [`
    .stat-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      width: 80px;
      background: transparent !important;
      border: none !important;
      padding: 0;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .stat-card.selected .icon-label-box {
      border-color: #007ad9;
      box-shadow: 0px 2px 6px rgba(0, 122, 217, 0.3);
    }

    .icon-label-box {
      display: flex;
      flex-direction: column;
      width: 80px;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      overflow: hidden;
      background: #fff;
      box-shadow: 0px 1px 2px rgba(0,0,0,0.05);
      transition: all 0.3s ease;
    }

    .icon-label-box:hover {
      background: #f5f5f5 !important;
      box-shadow: 0px 3px 8px rgba(0,0,0,0.1);
    }

    .icon-area {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 60px;
    }

    .label-area {
      background: #f8f8f8 !important;
      text-align: center;
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      color: #444 !important;
      padding: 4px 0;
      line-height: 1.1;
    }

    :host ::ng-deep .stat-icon {
      background: none !important;
      border: none !important;
      color: #666 !important;
      padding: 0 !important;
      font-size: 24px;
      font-weight: normal;
    }
  `]
})

export class StatCardComponent {
  @Input() icon!: string;
  @Input() label!: string;
  @Input() current: boolean = false;
  @Output() cardClick = new EventEmitter<string>();

  onCardClick() {
    this.cardClick.emit(this.label);
  }
}