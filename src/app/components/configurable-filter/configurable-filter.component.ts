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
import { MultiSelectModule } from 'primeng/multiselect';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ChipModule } from 'primeng/chip';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { HostListener } from '@angular/core';
import { RadioButtonModule } from 'primeng/radiobutton';

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
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MultiSelectModule,
    CalendarModule,
    InputTextModule,
    InputNumberModule,
    RadioButtonModule,
    DropdownModule,
    ButtonModule,
    CardModule,
    DividerModule,
    TooltipModule,
    CheckboxModule,
    OverlayPanelModule,
    ChipModule,
  ],
  styles: [
    `
      .radio-option {
        width: 100%;
        padding: 0.5rem 0;
      }

      .radio-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .radio-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .radio-label {
        font-size: 0.875rem;
        cursor: pointer;
        user-select: none;
        flex: 1;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class ConfigurableFilterComponent implements OnInit, OnDestroy {
  @Input() filters: FilterConfig[] = [];
  @Input() showClearAll: boolean = true;
  @Input() showApplyButton: boolean = true;
  @Input() debounceTime: number = 300;
  @Input() showSearch: boolean = true;
  @Input() searchPlaceholder: string = 'Search...';
  @Input() visible: boolean = false;

  @Output() filterChange = new EventEmitter<FilterValue[]>();
  @Output() filterCleared = new EventEmitter<void>();
  @Output() filterApplied = new EventEmitter<FilterValue[]>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() hasActiveFiltersChange = new EventEmitter<boolean>();
  @Output() appliedFiltersChange = new EventEmitter<FilterValue[]>();

  filterForm: FormGroup;
  searchTerm: string = '';
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

  private setupFilterChangeListener(): void {
    this.filterForm.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(0), // Immediate response for apply button
        distinctUntilChanged()
      )
      .subscribe((values) => {
        const filterValues = this.convertToFilterValues(values);
        this.activeFiltersCount = filterValues.length;
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

    // Add search term as a filter if it exists
    if (this.searchTerm && this.searchTerm.trim()) {
      filterValues.push({
        key: 'search',
        value: this.searchTerm.trim(),
        type: 'text',
      });
    }

    this.hasActiveFilters = filterValues.length > 0;
    this.appliedFilters = filterValues; // Store applied filters for chips
    this.filterApplied.emit(filterValues);
    this.filterChange.emit(filterValues); // Also emit filterChange for backward compatibility
    this.hasActiveFiltersChange.emit(filterValues.length > 0);
    this.appliedFiltersChange.emit(filterValues);

    this.onClose(); // Close the overlay after applying filters
  }

  onClearAll(): void {
    this.filterForm.reset();
    this.searchTerm = '';
    this.activeFiltersCount = 0;
    this.hasActiveFilters = false;
    this.appliedFilters = []; // Clear applied filters
    this.hasActiveFiltersChange.emit(false);
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

  onSearchChange(): void {
    // Don't emit search change immediately - wait for apply button
    // This method is now just for tracking the search term
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

    this.filters.forEach((filter) => {
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
    // Remove from applied filters
    this.appliedFilters = this.appliedFilters.filter(
      (f) => f.key !== filterKey
    );

    // Clear the form control or search term
    if (filterKey === 'search') {
      this.searchTerm = '';
    } else {
      this.filterForm.get(filterKey)?.reset();
    }

    // Update states
    this.hasActiveFilters = this.appliedFilters.length > 0;
    this.hasActiveFiltersChange.emit(this.appliedFilters.length > 0);
    this.appliedFiltersChange.emit(this.appliedFilters);

    // Emit the updated filters
    this.filterApplied.emit(this.appliedFilters);
    this.filterChange.emit(this.appliedFilters);
  }

  getFilterLabel(key: string): string {
    if (key === 'search') {
      return 'Search';
    }
    const filter = this.filters.find((f) => f.key === key);
    return filter ? filter.label : key;
  }

  getFilterDisplayValue(filter: FilterValue): string {
    // Handle search filter specially
    if (filter.key === 'search') {
      return `Search: "${filter.value}"`;
    }

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
