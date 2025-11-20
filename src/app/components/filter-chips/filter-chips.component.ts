import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FilterValue } from '../configurable-filter/configurable-filter.component';

@Component({
  selector: 'app-filter-chips',
  templateUrl: './filter-chips.component.html',
  standalone: false,
})
export class FilterChipsComponent {
  @Input() appliedFilters: FilterValue[] = [];
  @Input() showClearAll: boolean = true;
  @Input() clearAllLabel: string = 'Clear All';
  @Input() getDisplayValue: (filter: FilterValue) => string = (filter) =>
    filter.key;

  @Output() chipRemove = new EventEmitter<string>();
  @Output() clearAll = new EventEmitter<void>();

  onChipRemove(filterKey: string): void {
    this.chipRemove.emit(filterKey);
  }

  onClearAll(): void {
    this.clearAll.emit();
  }

  getFilterDisplayValue(filter: FilterValue): string {
    return this.getDisplayValue(filter);
  }

  get displayedFilters() {
    return this.appliedFilters.filter(f => f.type !== 'checkbox' || f.value !== false);
  }
}
