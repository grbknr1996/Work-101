// table.component.ts - Fixed version with cached menu items
import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { Signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DataViewModule } from 'primeng/dataview';
import { DropdownModule } from 'primeng/dropdown';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';

export interface ColumnDefinition {
  field: string;
  header: string;
  filterType?:
    | 'text'
    | 'numeric'
    | 'date'
    | 'boolean'
    | 'dropdown'
    | 'multiselect'
    | 'range'
    | 'none';
  filterField?: string;
  sortable?: boolean;
  width?: string;
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
  filterDisplay?: 'menu' | 'row';
  filterMatchMode?: string;
  dateFormat?: string;
  currency?: string;
  customClass?: string;
  showClearButton?: boolean;
  dropdownOptions?: any[];
  optionLabel?: string;
  filterOptions?: any;
  severity?: (
    value: any
  ) => 'success' | 'info' | 'warn' | 'danger' | 'secondary' | undefined;
  value?: (value: any) => string; // Custom value formatter for display
  customTemplate?: boolean;
  actions?: Action[];
  showAsDropdown?: boolean;
  showName?: boolean;
  nameField?: string;
  iconClass?: (value: any) => string;
}

export interface Action {
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

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  imports: [
    CommonModule,
    TableModule,
    DataViewModule,
    ButtonModule,
    DropdownModule,
    MenuModule,
    TagModule,
    InputTextModule,
    FormsModule,
    IconFieldModule,
    InputIconModule,
    AvatarModule,
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent implements OnInit, OnChanges {
  @ViewChild('dt') table!: Table;

  @Input() columns: ColumnDefinition[] = [];
  @Input() data: Signal<any[]> | any[] = [];
  @Input() rows: number = 10;
  @Input() rowsPerPageOptions: number[] = [10, 25, 50];
  @Input() loading: boolean = false;
  @Input() paginator: boolean = true;
  @Input() globalFilterFields: string[] = [];
  @Input() showCurrentPageReport: boolean = false;
  @Input() currentPageReportTemplate: string =
    'Showing {first} to {last} of {totalRecords} entries';
  @Input() resizableColumns: boolean = false;
  @Input() reorderableColumns: boolean = false;
  @Input() responsive: boolean = true;
  @Input() scrollable: boolean = false;
  @Input() scrollHeight: string = '';
  @Input() lazy: boolean = false;
  @Input() totalRecords: number = 0;
  @Input() dataKey: string = 'id';
  @Input() showClearButton: boolean = true;
  @Input() showSearch: boolean = true;
  @Input() emptyMessage: string = 'No records found.';
  @Input() showActionsColumn: boolean = false;
  @Input() customCellTemplate: any;
  @Input() actionTemplate: any;
  @Input() locale: string = 'en';
  @Input() showSearchButton: boolean = false;
  @Input() searchPlaceHolder: string = 'Search keyword';
  @Input() clearButton: string = 'Clear';
  @Input() onLazyLoadEvent: EventEmitter<any> = new EventEmitter();

  @Output() actionClick = new EventEmitter<{ action: string; item: any }>();
  @Output() onLazyLoad = new EventEmitter<any>();

  @Input() showPdf: string = '';

  // Cache for menu items to prevent regeneration
  private menuItemsCache = new Map<string, MenuItem[]>();

  constructor(private changeDetector: ChangeDetectorRef) {}

  ngOnInit() {
    if (!this.globalFilterFields.length && this.columns.length) {
      this.globalFilterFields = this.columns.map((col) => col.field);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      this.menuItemsCache.clear();
      this.changeDetector.markForCheck();
    }
  }

  isSignal(value: any): value is Signal<any[]> {
    return typeof value === 'function';
  }

  onFilterChange(event: any, filterCallback: Function, column: string) {
    filterCallback(event?.value?.value || event?.value);
  }

  isArray(value: any): boolean {
    return Array.isArray(value);
  }

  clear(table: Table) {
    table.clear();
    // Clear menu cache when table is cleared
    this.menuItemsCache.clear();
  }

  filterGlobal(event: Event, table?: Table) {
    const value = (event.target as HTMLInputElement).value;
    this.table.filterGlobal(value, 'contains');
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

  getMenuItems(actions: Action[] | undefined, rowData: any): MenuItem[] {
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

  private handleMenuCommand(action: string, rowData: any) {
    this.onActionClick(action, rowData);
  }
}
