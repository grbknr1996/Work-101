import {
  Component,
  Input,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ElementRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lazy-avatar',
  template: `
    <div
      class="avatar-container"
      [class.loading]="isLoading"
      [class.error]="hasError"
    >
      <img
        #avatarImg
        [src]="currentSrc"
        [alt]="alt"
        [class.loaded]="!isLoading && !hasError"
        (load)="onImageLoad()"
        (error)="onImageError()"
        [style.width]="size + 'px'"
        [style.height]="size + 'px'"
        [style.border-radius]="size / 2 + 'px'"
        [style.object-fit]="'cover'"
      />
      <div
        *ngIf="isLoading"
        class="avatar-placeholder"
        [style.width]="size + 'px'"
        [style.height]="size + 'px'"
        [style.border-radius]="size / 2 + 'px'"
      >
        <i class="pi pi-user"></i>
      </div>
      <div
        *ngIf="hasError"
        class="avatar-error"
        [style.width]="size + 'px'"
        [style.height]="size + 'px'"
        [style.border-radius]="size / 2 + 'px'"
      >
        <i class="pi pi-user"></i>
      </div>
    </div>
  `,
  styles: [
    `
      .avatar-container {
        position: relative;
        display: inline-block;
      }

      .avatar-container img {
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .avatar-container img.loaded {
        opacity: 1;
      }

      .avatar-placeholder,
      .avatar-error {
        position: absolute;
        top: 0;
        left: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #f3f4f6;
        color: #9ca3af;
        font-size: 1.2em;
      }

      .avatar-error {
        background-color: #fee2e2;
        color: #ef4444;
      }

      .avatar-container.loading .avatar-placeholder {
        animation: pulse 1.5s ease-in-out infinite;
      }

      @keyframes pulse {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
      }
    `,
  ],
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LazyAvatarComponent implements OnInit, AfterViewInit {
  @Input() src: string = '';
  @Input() alt: string = 'Avatar';
  @Input() size: number = 32;
  @Input() fallbackSrc: string = 'assets/images/no-image.png';

  @ViewChild('avatarImg') avatarImg!: ElementRef<HTMLImageElement>;

  currentSrc: string = '';
  isLoading: boolean = true;
  hasError: boolean = false;
  private observer: IntersectionObserver | null = null;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    // Start with placeholder
    this.currentSrc = this.fallbackSrc;
  }

  ngAfterViewInit() {
    this.setupIntersectionObserver();
  }

  private setupIntersectionObserver() {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.loadImage();
              this.observer?.unobserve(entry.target);
            }
          });
        },
        {
          rootMargin: '50px', // Start loading 50px before the image comes into view
        }
      );

      if (this.avatarImg?.nativeElement) {
        this.observer.observe(this.avatarImg.nativeElement);
      }
    } else {
      // Fallback for browsers without IntersectionObserver
      this.loadImage();
    }
  }

  private loadImage() {
    if (!this.src) {
      this.hasError = true;
      this.isLoading = false;
      this.cdr.markForCheck();
      return;
    }

    this.isLoading = true;
    this.hasError = false;
    this.currentSrc = this.src;
    this.cdr.markForCheck();
  }

  onImageLoad() {
    this.isLoading = false;
    this.hasError = false;
    this.cdr.markForCheck();
  }

  onImageError() {
    this.isLoading = false;
    this.hasError = true;
    this.currentSrc = this.fallbackSrc;
    this.cdr.markForCheck();
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
