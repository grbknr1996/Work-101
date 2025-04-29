import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppWidgetComponent } from './app-widget.component';

describe('AppWidgetComponent', () => {
  let component: AppWidgetComponent;
  let fixture: ComponentFixture<AppWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppWidgetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
