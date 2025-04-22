import { Component, Input, Output, EventEmitter } from "@angular/core";
import { StepsModule } from "primeng/steps";
import { MenuItem } from "primeng/api";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-stepper",
  templateUrl: "./stepper.component.html",
  styleUrls: ["./stepper.component.css"],
  standalone: true,
  imports: [CommonModule, StepsModule],
})
export class StepperComponent {
  @Input() steps: MenuItem[] = [];
  @Input() activeIndex: number = 0;
  @Output() activeIndexChange = new EventEmitter<number>();

  onActiveIndexChange(index: number) {
    this.activeIndex = index;
    this.activeIndexChange.emit(index);
  }
}
