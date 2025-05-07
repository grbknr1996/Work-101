import { ComponentFixture, TestBed } from "@angular/core/testing";
import { DataExchangeConfigComponent } from "./data-exchange-config.component";

describe("DataExchangeConfigComponent", () => {
  let component: DataExchangeConfigComponent;
  let fixture: ComponentFixture<DataExchangeConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataExchangeConfigComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DataExchangeConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
