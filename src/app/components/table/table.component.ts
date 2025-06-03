// table.component.ts - Fixed version with cached menu items
import { CommonModule } from "@angular/common";
import {
  Component,
  ContentChild,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
  ChangeDetectorRef,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ConfirmationService, MenuItem, MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { DataViewModule } from "primeng/dataview";
import { DropdownChangeEvent, DropdownModule } from "primeng/dropdown";
import { IconFieldModule } from "primeng/iconfield";
import { InputIconModule } from "primeng/inputicon";
import { InputTextModule } from "primeng/inputtext";
import { MenuModule } from "primeng/menu";
import { Table, TableModule } from "primeng/table";
import { TagModule } from "primeng/tag";

export interface ColumnDefinition {
  field: string;
  header: string;
  filterType?:
    | "text"
    | "numeric"
    | "date"
    | "boolean"
    | "dropdown"
    | "multiselect"
    | "range"
    | "none";
  filterField?: string;
  sortable?: boolean;
  width?: string;
  display?:
    | "text"
    | "date"
    | "currency"
    | "avatar"
    | "tag"
    | "progress"
    | "icon"
    | "boolean"
    | "custom"
    | "actions";
  filterDisplay?: "menu" | "row";
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
  ) => "success" | "info" | "warn" | "danger" | "secondary" | undefined;
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
    | "success"
    | "info"
    | "warn"
    | "warning"
    | "danger"
    | "secondary"
    | "contrast"
    | "help";
  visible?: (item: any) => boolean;
}

@Component({
  selector: "app-table",
  templateUrl: "./table.component.html",
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
  ],
  standalone: true,
})
export class TableComponent implements OnInit {
  @ViewChild("dt") table!: Table;

  @Input() columns: ColumnDefinition[] = [];
  @Input() data: any[] = [];
  @Input() rows: number = 10;
  @Input() rowsPerPageOptions: number[] = [10, 25, 50];
  @Input() loading: boolean = false;
  @Input() paginator: boolean = true;
  @Input() globalFilterFields: string[] = [];
  @Input() showCurrentPageReport: boolean = false;
  @Input() currentPageReportTemplate: string =
    "Showing {first} to {last} of {totalRecords} entries";
  @Input() resizableColumns: boolean = false;
  @Input() reorderableColumns: boolean = false;
  @Input() responsive: boolean = true;
  @Input() scrollable: boolean = false;
  @Input() scrollHeight: string = "";
  @Input() lazy: boolean = false;
  @Input() totalRecords: number = 0;
  @Input() dataKey: string = "id";
  @Input() showClearButton: boolean = true;
  @Input() emptyMessage: string = "No records found.";
  @Input() showActionsColumn: boolean = false;
  @Input() customCellTemplate: any;
  @Input() actionTemplate: any;
  @Input() locale: string = "en";
  @Input() onLazyLoadEvent: EventEmitter<any> = new EventEmitter();

  @Output() actionClick = new EventEmitter<{ action: string; item: any }>();

  // Cache for menu items to prevent regeneration
  private menuItemsCache = new Map<string, MenuItem[]>();

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    if (!this.globalFilterFields.length && this.columns.length) {
      this.globalFilterFields = this.columns.map((col) => col.field);
    }
    console.log("Table component initialized");
  }

  onFilterChange(event: any, filterCallback: Function, column: string) {
    console.log(`Filtering ${column} by:`, event?.value);
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
    console.log("Global filter called");
    const value = (event.target as HTMLInputElement).value;
    this.table.filterGlobal(value, "contains");
  }

  onActionClick(action: string, item: any) {
    console.log("Action clicked:", action, "Item:", item);
    this.actionClick.emit({ action, item });
  }

  getValue(rowData: any, field: string): any {
    if (!field) {
      return null;
    }

    // Handle nested properties (e.g., 'user.name')
    const props = field.split(".");
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

  getMenuItems(actions: Action[] | undefined, rowData: any): MenuItem[] {
    if (!actions) return [];

    // Create a unique key for this row and actions combination
    const cacheKey = `${JSON.stringify(rowData[this.dataKey] || rowData)}_${
      actions.length
    }`;

    // Check if we already have cached menu items for this row
    if (this.menuItemsCache.has(cacheKey)) {
      // console.log("Using cached menu items for:", rowData);
      return this.menuItemsCache.get(cacheKey)!;
    }

    // console.log("Generating NEW menu items for:", rowData);

    const menuItems = actions
      .filter((action) => !action.visible || action.visible(rowData))
      .map((action) => {
        const menuItem: MenuItem = {
          label: action.label,
          icon: action.icon,
          command: (event: any) => {
            //  console.log("Menu command executed for:", action.action, rowData);
            this.handleMenuCommand(action.action, rowData);
          },
        };
        return menuItem;
      });

    // Cache the menu items
    this.menuItemsCache.set(cacheKey, menuItems);
    // console.log("Cached menu items:", menuItems);

    return menuItems;
  }

  // Separate method to handle menu commands
  private handleMenuCommand(action: string, rowData: any) {
    // Use microtask to ensure proper execution
    queueMicrotask(() => {
      console.log("Executing action:", action, "for item:", rowData);
      this.actionClick.emit({ action, item: rowData });
      this.cdr.detectChanges();
    });
  }

  // Method to clear cache when data changes
  ngOnChanges() {
    this.menuItemsCache.clear();
  }
}
