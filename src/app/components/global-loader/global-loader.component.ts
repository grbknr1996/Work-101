import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { LoadingService } from '../../_services/loading.service';

@Component({
  selector: 'app-global-loader',
  standalone: false,
  templateUrl: './global-loader.component.html',
})
export class GlobalLoaderComponent implements OnInit, OnDestroy {
  // Use the observable directly for better change detection
  loading$;

  constructor(private loadingService: LoadingService) {
    this.loading$ = this.loadingService.loading$;
  }

  ngOnInit() {}

  ngOnDestroy() {}
}
