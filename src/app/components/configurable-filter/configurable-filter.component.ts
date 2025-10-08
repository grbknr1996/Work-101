import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
} from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { HostListener } from '@angular/core';

export interface FilterConfig {
  key: string;
  label: string;
  type:
    | 'text'
    | 'number'
    | 'date'
    | 'dateRange'
    | 'multiSelect'
    | 'dropdown'
    | 'checkbox'
    | 'radio';
  placeholder?: string;
  options?: Array<{ label: string; value: any }>;
  defaultValue?: any;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  dateFormat?: string;
  showClear?: boolean;
  showFilter?: boolean;
  filterBy?: string;
  optionLabel?: string;
  optionValue?: string;
  section?: string;
}

export interface FilterValue {
  key: string;
  value: any;
  type: string;
}

@Component({
  selector: 'app-configurable-filter',
  templateUrl: './configurable-filter.component.html',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Default,
})
export class ConfigurableFilterComponent implements OnInit, OnDestroy {
  @Input() filters: FilterConfig[] = [];
  @Input() showClearAll: boolean = true;
  @Input() showApplyButton: boolean = true;
  @Input() debounceTime: number = 300;
  @Input() showFilterSelector: boolean = true;
  @Input() filterSelectorPlaceholder: string = 'Select filters to display';
  @Input() visible: boolean = false;

  @Output() filterChange = new EventEmitter<FilterValue[]>();
  @Output() filterCleared = new EventEmitter<void>();
  @Output() filterApplied = new EventEmitter<FilterValue[]>();
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() hasActiveFiltersChange = new EventEmitter<boolean>(); // Optional output
  @Output() appliedFiltersChange = new EventEmitter<FilterValue[]>();
  @Output() visibleFiltersChange = new EventEmitter<FilterConfig[]>(); // Optional output

  filterForm: FormGroup;
  selectedFilters: string[] = [];
  activeFiltersCount: number = 0;
  hasActiveFilters: boolean = false;
  appliedFilters: FilterValue[] = [];
  private destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({});
  }

  ngOnInit(): void {
    this.initializeForm();
    this.setupFilterChangeListener();
    this.initializeFilterSelector();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    const formControls: { [key: string]: any } = {};

    this.filters.forEach((filter) => {
      formControls[filter.key] = [filter.defaultValue || null];
    });

    this.filterForm = this.fb.group(formControls);
  }

  private initializeFilterSelector(): void {
    // Initially select all filters
    this.selectedFilters = this.filters.map((filter) => filter.key);
    this.emitVisibleFiltersChange();
  }

  private setupFilterChangeListener(): void {
    this.filterForm.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(0), // Immediate response for apply button
        distinctUntilChanged()
      )
      .subscribe((values) => {
        console.log('Form value changes detected:', values);
        const filterValues = this.convertToFilterValues(values);
        console.log('Converted filter values:', filterValues);
        // Don't update hasActiveFilters or emit here - only track form changes
        // The red dot should only appear after filters are actually applied
      });
  }

  private convertToFilterValues(values: any): FilterValue[] {
    const filterValues: FilterValue[] = [];

    Object.keys(values).forEach((key) => {
      const value = values[key];
      if (value !== null && value !== undefined && value !== '') {
        const filterConfig = this.filters.find((f) => f.key === key);
        if (filterConfig) {
          // Validate date ranges
          if (
            filterConfig.type === 'dateRange' &&
            Array.isArray(value) &&
            value.length === 2
          ) {
            const [startDate, endDate] = value;
            if (
              startDate &&
              endDate &&
              this.isValidDateRange(startDate, endDate)
            ) {
              filterValues.push({
                key,
                value,
                type: filterConfig.type,
              });
            }
          } else {
            filterValues.push({
              key,
              value,
              type: filterConfig.type,
            });
          }
        }
      }
    });

    return filterValues;
  }

  private isValidDateRange(startDate: Date, endDate: Date): boolean {
    return startDate <= endDate;
  }

  getDateRangeError(key: string): string | null {
    const value = this.filterForm.get(key)?.value;
    if (value && Array.isArray(value) && value.length === 2) {
      const [startDate, endDate] = value;
      if (startDate && endDate && !this.isValidDateRange(startDate, endDate)) {
        return 'End date must be greater than or equal to start date';
      }
    }
    return null;
  }

  hasDateRangeError(key: string): boolean {
    return this.getDateRangeError(key) !== null;
  }

  onApplyFilters(): void {
    const values = this.filterForm.value;
    const filterValues = this.convertToFilterValues(values);

    this.activeFiltersCount = filterValues.length;
    this.hasActiveFilters = filterValues.length > 0;
    this.appliedFilters = filterValues; // Store applied filters for chips
    this.filterApplied.emit(filterValues);
    this.filterChange.emit(filterValues); // Also emit filterChange for backward compatibility
    this.hasActiveFiltersChange.emit(this.hasActiveFilters);
    this.appliedFiltersChange.emit(filterValues);

    this.onClose(); // Close the overlay after applying filters
  }

  onClearAll(): void {
    this.filterForm.reset();
    this.activeFiltersCount = 0;
    this.hasActiveFilters = false;
    this.appliedFilters = []; // Clear applied filters
    this.hasActiveFiltersChange.emit(this.hasActiveFilters);
    this.filterCleared.emit();
    this.appliedFiltersChange.emit([]);
  }

  // Public method to clear all filters from parent component
  clearAllFilters(): void {
    this.onClearAll();
  }

  onClearFilter(key: string): void {
    this.filterForm.get(key)?.reset();
  }

  onFilterSelectorChange(): void {
    this.emitVisibleFiltersChange();
  }

  onSelectAll(): void {
    this.selectedFilters = this.filters.map((filter) => filter.key);
    this.emitVisibleFiltersChange();
  }

  onDeselectAll(): void {
    this.selectedFilters = [];
    this.emitVisibleFiltersChange();
  }

  private emitVisibleFiltersChange(): void {
    const visibleFilters = this.filters.filter((filter) =>
      this.selectedFilters.includes(filter.key)
    );
    this.visibleFiltersChange.emit(visibleFilters);
  }

  onClose(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  toggleFilter(): void {
    this.visible = !this.visible;
    this.visibleChange.emit(this.visible);
  }

  getFilterValue(key: string): any {
    return this.filterForm.get(key)?.value;
  }

  isFilterActive(key: string): boolean {
    const value = this.getFilterValue(key);
    return value !== null && value !== undefined && value !== '';
  }

  getFiltersBySection(): { [key: string]: FilterConfig[] } {
    const sections: { [key: string]: FilterConfig[] } = {};

    // Only show selected filters
    const visibleFilters = this.filters.filter((filter) =>
      this.selectedFilters.includes(filter.key)
    );

    visibleFilters.forEach((filter) => {
      const section = filter.section || 'General';
      if (!sections[section]) {
        sections[section] = [];
      }
      sections[section].push(filter);
    });

    return sections;
  }

  getSectionKeys(): string[] {
    return Object.keys(this.getFiltersBySection());
  }

  removeFilterChip(filterKey: string): void {
    console.log('removeFilterChip called with key:', filterKey);
    console.log('Applied filters before removal:', this.appliedFilters);

    // Remove from applied filters
    this.appliedFilters = this.appliedFilters.filter(
      (f) => f.key !== filterKey
    );

    console.log('Applied filters after removal:', this.appliedFilters);

    // Clear the form control
    this.filterForm.get(filterKey)?.reset();

    // Update states - sync all filter-related state variables
    this.activeFiltersCount = this.appliedFilters.length;
    this.hasActiveFilters = this.appliedFilters.length > 0;

    console.log(
      'State after removal - activeFiltersCount:',
      this.activeFiltersCount,
      'hasActiveFilters:',
      this.hasActiveFilters
    );

    // Emit state changes
    this.hasActiveFiltersChange.emit(this.hasActiveFilters);
    this.appliedFiltersChange.emit(this.appliedFilters);

    // Emit the updated filters
    this.filterApplied.emit(this.appliedFilters);
    this.filterChange.emit(this.appliedFilters);
  }

  getFilterLabel(key: string): string {
    const filter = this.filters.find((f) => f.key === key);
    return filter ? filter.label : key;
  }

  getFilterDisplayValue(filter: FilterValue): string {
    const filterLabel = this.getFilterLabel(filter.key);
    let displayValue = '';

    if (filter.type === 'checkbox') {
      displayValue = filter.value ? filterLabel : '';
    } else if (filter.type === 'radio' && filter.value) {
      // Get the filter config to access options for radio
      const filterConfig = this.filters.find((f) => f.key === filter.key);
      if (filterConfig && filterConfig.options) {
        const option = filterConfig.options.find(
          (opt) => opt.value === filter.value
        );
        displayValue = option ? option.label : filter.value;
      } else {
        displayValue = filter.value?.toString() || '';
      }
    } else if (filter.type === 'multiSelect' && Array.isArray(filter.value)) {
      // Get the filter config to access options
      const filterConfig = this.filters.find((f) => f.key === filter.key);
      if (filterConfig && filterConfig.options) {
        // Map values to their display labels
        const displayLabels = filter.value.map((value) => {
          const option = filterConfig.options?.find(
            (opt) => opt.value === value
          );
          return option ? option.label : value;
        });
        displayValue = displayLabels.join(', ');
      } else {
        displayValue = filter.value.join(', ');
      }
    } else if (filter.type === 'dateRange' && Array.isArray(filter.value)) {
      displayValue = filter.value
        .map((date: Date) => date.toLocaleDateString())
        .join(' - ');
    } else if (filter.type === 'date' && filter.value) {
      displayValue = new Date(filter.value).toLocaleDateString();
    } else if (filter.type === 'dropdown' && filter.value) {
      // Get the filter config to access options for dropdown
      const filterConfig = this.filters.find((f) => f.key === filter.key);
      if (filterConfig && filterConfig.options) {
        const option = filterConfig.options.find(
          (opt) => opt.value === filter.value
        );
        displayValue = option ? option.label : filter.value;
      } else {
        displayValue = filter.value?.toString() || '';
      }
    } else {
      displayValue = filter.value?.toString() || '';
    }

    // Return label with value for all filter types except checkbox (which already includes the label)
    return filter.type === 'checkbox'
      ? displayValue
      : `${filterLabel}: ${displayValue}`;
  }

  getFilterSelectorOptions(): Array<{ label: string; value: string }> {
    return this.filters.map((filter) => ({
      label: filter.label,
      value: filter.key,
    }));
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (this.visible) {
      const target = event.target as HTMLElement;

      // Check if click is inside the filter overlay
      const isInsideOverlay = target.closest('.filter-overlay');

      // Check if click is on the filter button itself
      const isFilterButton = target.closest('.filter-button');

      // Check if click is inside any PrimeNG calendar/dropdown panel
      const isInsideCalendar =
        target.closest('.p-calendar-panel') ||
        target.closest('.p-datepicker') ||
        target.closest('.p-calendar') ||
        target.closest('.p-datepicker-panel') ||
        target.closest('.p-dropdown-panel') ||
        target.closest('.p-multiselect-panel') ||
        target.closest('.p-overlay-panel') ||
        target.closest("[class*='p-calendar']") ||
        target.closest("[class*='p-datepicker']") ||
        target.closest("[class*='p-dropdown']") ||
        target.closest("[class*='p-multiselect']");

      // If click is outside overlay and not on the filter button or any PrimeNG panel, close the overlay
      if (!isInsideOverlay && !isFilterButton && !isInsideCalendar) {
        this.onClose();
      }
    }
  }
}
