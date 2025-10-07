import {
  Component,
  HostListener,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-scroller',
  standalone: false,
  templateUrl: './scroller.component.html',
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
