import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ViewChild,
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
import { RadioButtonModule } from 'primeng/radiobutton';
import { FloatLabelModule } from 'primeng/floatlabel';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import {
  ConfigurableFilterComponent,
} from '../../components/configurable-filter/configurable-filter.component';
import { FilterChipsComponent } from '../../components/filter-chips/filter-chips.component';

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
  selector: 'app-configurable-filter-bar',
  templateUrl: './configurable-filter-bar.component.html',
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
    FloatLabelModule,
    IconFieldModule,
    InputIconModule,
    ConfigurableFilterComponent,
    FilterChipsComponent,
  ],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class ConfigurableFilterBarComponent {

  @ViewChild(ConfigurableFilterComponent)
  configurableFilter!: ConfigurableFilterComponent;

  @Input() filters: FilterConfig[] = [];
  @Input() showClearAll: boolean = true;
  @Input() showApplyButton: boolean = true;
  @Input() debounceTime: number = 300;
  @Input() showFilterSelector: boolean = true;
  @Input() filterSelectorPlaceholder: string = 'Select filters to display';
  @Input() visible: boolean = false;
  @Input() searchBar: string = '';
  @Input() showDownloadIcon: boolean = false;
  @Input() showInfoIcon: boolean = false;
  @Input() showSearchBar: boolean = false;
  @Input() searchLabel: string = 'Search';

  @Output() filterChange = new EventEmitter<FilterValue[]>();
  @Output() filterCleared = new EventEmitter<void>();
  @Output() filterApplied = new EventEmitter<FilterValue[]>();
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() hasActiveFiltersChange = new EventEmitter<boolean>(); // Optional output
  @Output() appliedFiltersChange = new EventEmitter<FilterValue[]>();
  @Output() visibleFiltersChange = new EventEmitter<FilterConfig[]>(); // Optional output
  @Output() filterSearch = new EventEmitter<string>();
  @Output() downloadDetails = new EventEmitter<void>();
  @Output() infoDetails = new EventEmitter<void>();

  
  @Input() appliedFilters: FilterValue[] = [];
  //@Input() showClearAll: boolean = true;
  @Input() clearAllLabel: string = 'Clear All';
  @Input() getDisplayValue: (filter: FilterValue) => string = (filter) =>
    filter.key;

  @Output() chipRemove = new EventEmitter<string>();
  @Output() clearAll = new EventEmitter<void>();

  filterForm: FormGroup;
  selectedFilters: string[] = [];
  activeFiltersCount: number = 0;
  hasActiveFilters: boolean = false;
  //appliedFilters: FilterValue[] = [];

  clearAllFilters(): void {
    this.configurableFilter.onClearAll();
  }

  removeFilterChip(filterKey: string): void {
    this.configurableFilter.removeFilterChip(filterKey);
  }

  onFilterChange(filters: FilterValue[]): void {
    console.log('Filter changed:', filters);
    // Don't apply filters or show red dot on change - only track changes
    this.filterChange.emit(filters);
  }

  onFilterCleared(): void {
    console.log('Filters cleared');
    this.filterCleared.emit();
  }

  onFilterApplied(filters: FilterValue[]): void {
    console.log('Filters applied:', filters);
    this.filterApplied.emit(filters);
  }

  onAppliedFiltersChange(filters: FilterValue[]): void {
    this.appliedFiltersChange.emit(filters);
  }

  onFilterSearch(searchBar: string): void {
    console.log("onFilterSearch "+this.searchBar);
    this.filterSearch.emit(this.searchBar);
  }

  onDownloadDetails(): void {
    console.log("onDownloadDetails ");
    this.downloadDetails.emit();
  }

  onInfoDetails(): void {
    console.log("onInfoDetails ");
    this.infoDetails.emit();
  }

  onChipRemove(filterKey: string): void {
    console.log("filter-bar onChipRemove");
    this.chipRemove.emit(filterKey);
  }

  onClearAll(): void {
    this.clearAll.emit();
  }

  getFilterDisplayValue(filter: FilterValue): string {
    return this.getDisplayValue(filter);
  }
  
}
