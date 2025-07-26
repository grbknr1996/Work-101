import {
  ChangeDetectorRef,
  Component,
  ViewEncapsulation,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Router } from '@angular/router';
import { MechanicsService } from './_services/mechanics.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  encapsulation: ViewEncapsulation.None,
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'ms.getCurrentOffice()',
  },
})
export class AppComponent implements OnInit {
  constructor(
    private router: Router,
    public ms: MechanicsService,
    public http: HttpClient
  ) {}

  async ngOnInit() {}
}
