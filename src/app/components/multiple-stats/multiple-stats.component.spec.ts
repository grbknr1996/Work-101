import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultipleStatsComponent } from './multiple-stats.component';

describe('MultipleStatsComponent', () => {
  let component: MultipleStatsComponent;
  let fixture: ComponentFixture<MultipleStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultipleStatsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MultipleStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
