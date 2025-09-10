import {
  Component,
  HostListener,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-scroller',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './scroller.component.html',
  styleUrls: ['./scroller.component.css'],
})
export class ScrollerComponent implements OnInit, OnDestroy {
  @ViewChild('scrollerButton', { static: false }) scrollerButton!: ElementRef;

  showScroller: boolean = false;
  private scrollThreshold: number = 300;
  private scrollListener?: () => void;

  ngOnInit() {
    this.addScrollListener();
  }

  ngOnDestroy() {
    this.removeScrollListener();
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    this.checkScrollPosition();
  }

  private addScrollListener() {
    this.scrollListener = () => this.checkScrollPosition();
    window.addEventListener('scroll', this.scrollListener, { passive: true });
  }

  private removeScrollListener() {
    if (this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener);
    }
  }

  private checkScrollPosition() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    this.showScroller = scrollTop > this.scrollThreshold;
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  isContentScrollable(): boolean {
    return document.body.scrollHeight > window.innerHeight;
  }
}
