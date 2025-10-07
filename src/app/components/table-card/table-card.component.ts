// table-card.component.ts
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  Signal,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { MenuItem } from 'primeng/api';

export interface CardColumnDefinition {
  field: string;
  label: string;
  display?:
    | 'text'
    | 'date'
    | 'currency'
    | 'avatar'
    | 'tag'
    | 'progress'
    | 'icon'
    | 'boolean'
    | 'custom'
    | 'actions';
  section?: 'header' | 'body' | 'info' | 'actions';
  sortable?: boolean;
  width?: string;
  dateFormat?: string;
  currency?: string;
  customClass?: string;
  severity?: (
    value: any
  ) => 'success' | 'info' | 'warn' | 'danger' | 'secondary' | undefined;
  value?: (value: any) => string;
  customTemplate?: boolean;
  actions?: CardAction[];
  showAsDropdown?: boolean;
  showName?: boolean;
  nameField?: string;
  iconClass?: (value: any) => string;
}

export interface CardAction {
  label: string;
  icon?: string;
  action: string;
  severity?:
    | 'success'
    | 'info'
    | 'warn'
    | 'warning'
    | 'danger'
    | 'secondary'
    | 'contrast'
    | 'help';
  visible?: (item: any) => boolean;
}

export interface SortEvent {
  field: string;
  order: number;
}

export interface PageEvent {
  first: number;
  rows: number;
  page: number;
  pageCount: number;
}

@Component({
  selector: 'app-table-card',
  templateUrl: './table-card.component.html',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableCardComponent implements OnInit, OnChanges {
  @Input() columns: CardColumnDefinition[] = [];
  @Input() data: Signal<any[]> | any[] = [];
  @Input() rows: number = 12; // Cards per page
  @Input() rowsPerPageOptions: number[] = [10, 25, 50, 100];
  @Input() loading: boolean = false;
  @Input() paginator: boolean = true;
  @Input() globalFilterFields: string[] = [];
  @Input() showCurrentPageReport: boolean = false;
  @Input() currentPageReportTemplate: string =
    'common.components.table.paginationRecord';
  @Input() totalRecords: number = 0;
  @Input() dataKey: string = 'id';
  @Input() emptyMessage: string = 'common.components.table.noRecordsFound';
  @Input() showActionsColumn: boolean = false;
  @Input() customCellTemplate: any;
  @Input() actionTemplate: any;
  @Input() locale: string = 'en';
  @Input() sortField: string = '';
  @Input() sortOrder: number = 1;

  @Output() actionClick = new EventEmitter<{ action: string; item: any }>();
  @Output() onLazyLoad = new EventEmitter<any>();
  @Output() sortChange = new EventEmitter<SortEvent>();
  @Output() pageChange = new EventEmitter<PageEvent>();

  // Cache for menu items to prevent regeneration
  private menuItemsCache = new Map<string, MenuItem[]>();

  // Pagination state
  currentPage = 0;
  first = 0;

  // Sorting state
  selectedSortField: string = '';
  sortOptions: { label: string; value: string }[] = [];

  // Helper methods for card display
  getAvatarField(): string | null {
    const avatarCol = this.columns.find((col) => col.display === 'avatar');
    return avatarCol ? avatarCol.field : null;
  }

  getNameField(): string | null {
    const nameCol = this.columns.find((col) => col.nameField);
    return nameCol ? nameCol.nameField! : null;
  }

  getStatusField(): string | null {
    const statusCol = this.columns.find((col) => col.display === 'tag');
    return statusCol ? statusCol.field : null;
  }

  getStatusValue(item: any): string {
    const statusField = this.getStatusField();
    if (!statusField) return '';

    const value = this.getValue(item, statusField);
    const statusCol = this.columns.find((col) => col.display === 'tag');

    if (statusCol && statusCol.value) {
      return statusCol.value(value);
    }

    return value;
  }

  getStatusSeverity(item: any): string {
    const statusField = this.getStatusField();
    if (!statusField) return 'secondary';

    const value = this.getValue(item, statusField);
    const statusCol = this.columns.find((col) => col.display === 'tag');

    if (statusCol && statusCol.severity) {
      return statusCol.severity(value) || 'secondary';
    }

    return 'secondary';
  }

  trackByFn(index: number, item: any): any {
    return item[this.dataKey] || index;
  }

  private initSortOptions() {
    this.sortOptions = this.columns
      .filter((col) => col.sortable)
      .map((col) => ({
        label: col.label,
        value: col.field,
      }));

    // Set default sort field if available
    if (this.sortOptions.length > 0) {
      this.selectedSortField = this.sortOptions[0].value;
      this.sortField = this.selectedSortField;
    }
  }

  onSortFieldChange(event: any) {
    this.sortField = event.value;
    this.sortChange.emit({ field: this.sortField, order: this.sortOrder });
    this.changeDetector.markForCheck();
  }

  toggleSortOrder() {
    this.sortOrder = this.sortOrder === 1 ? -1 : 1;
    this.sortChange.emit({ field: this.sortField, order: this.sortOrder });
    this.changeDetector.markForCheck();
  }

  constructor(private changeDetector: ChangeDetectorRef) {}

  ngOnInit() {
    if (!this.globalFilterFields.length && this.columns.length) {
      this.globalFilterFields = this.columns.map((col) => col.field);
    }

    // Initialize sort options from sortable columns
    this.initSortOptions();

    // Initialize pagination state
    this.first = 0;
    this.currentPage = 0;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      this.menuItemsCache.clear();
      this.changeDetector.markForCheck();
    }

    // Sync pagination state when totalRecords changes
    if (changes['totalRecords'] && this.totalRecords > 0) {
      // Reset to first page when total records change
      this.first = 0;
      this.currentPage = 0;
    }
  }

  isSignal(value: any): value is Signal<any[]> {
    return typeof value === 'function';
  }

  getCurrentData(): any[] {
    const data = this.isSignal(this.data) ? this.data() : this.data;

    if (!data || !Array.isArray(data)) {
      console.log('TableCard - No data or invalid data format');
      return [];
    }

    // Apply sorting only, don't apply local pagination since data comes from parent
    let sortedData = [...data];
    if (this.sortField) {
      sortedData.sort((a, b) => {
        const aVal = this.getValue(a, this.sortField);
        const bVal = this.getValue(b, this.sortField);

        if (aVal < bVal) return -1 * this.sortOrder;
        if (aVal > bVal) return 1 * this.sortOrder;
        return 0;
      });
    }

    return sortedData;
  }

  onSort(field: string) {
    if (this.sortField === field) {
      this.sortOrder = this.sortOrder === 1 ? -1 : 1;
    } else {
      this.sortField = field;
      this.sortOrder = 1;
    }

    this.sortChange.emit({ field: this.sortField, order: this.sortOrder });
    this.changeDetector.markForCheck();
  }

  onPageChange(event: any) {
    this.first = event.first;
    this.currentPage = event.page;

    // Emit page change event
    this.pageChange.emit({
      first: event.first,
      rows: event.rows,
      page: event.page,
      pageCount: event.pageCount,
    });

    // Emit lazy load event for compatibility with table pagination
    // Convert to the format expected by the parent component
    this.onLazyLoad.emit({
      first: event.first,
      rows: event.rows,
      page: Math.floor(event.first / event.rows),
      pageCount: event.pageCount,
    });

    this.changeDetector.markForCheck();
  }

  onActionClick(action: string, item: any) {
    this.actionClick.emit({ action, item });
  }

  getValue(rowData: any, field: string): any {
    if (!field) {
      return null;
    }

    // Handle nested properties (e.g., 'user.name')
    const props = field.split('.');
    let value = rowData;

    for (const prop of props) {
      if (
        value === null ||
        value === undefined ||
        !value.hasOwnProperty(prop)
      ) {
        return null;
      }
      value = value[prop];
    }

    return value;
  }

  isValidImageUrl(value: any): boolean {
    if (!value || typeof value !== 'string') {
      return false;
    }
    // Check if it's a valid URL or data URL
    return (
      value.startsWith('http://') ||
      value.startsWith('https://') ||
      value.startsWith('data:') ||
      value.startsWith('/')
    );
  }

  getMenuItems(actions: CardAction[] | undefined, rowData: any): MenuItem[] {
    if (!actions) return [];

    // Create a cache key based on actions and row data
    const cacheKey = JSON.stringify({
      actions: actions.map((a) => ({ label: a.label, action: a.action })),
      rowId: rowData.id || rowData.username || 'unknown',
    });

    // Check if we have cached menu items
    if (this.menuItemsCache.has(cacheKey)) {
      return this.menuItemsCache.get(cacheKey)!;
    }

    // Generate menu items
    const menuItems: MenuItem[] = actions
      .filter((action) => !action.visible || action.visible(rowData))
      .map((action) => ({
        label: action.label,
        icon: action.icon,
        command: () => this.handleMenuCommand(action.action, rowData),
      }));

    // Cache the menu items
    this.menuItemsCache.set(cacheKey, menuItems);

    return menuItems;
  }

  // Helper method to get columns by section
  getColumnsBySection(section: string): CardColumnDefinition[] {
    return this.columns.filter((col) => col.section === section);
  }

  private handleMenuCommand(action: string, rowData: any) {
    this.onActionClick(action, rowData);
  }
}
