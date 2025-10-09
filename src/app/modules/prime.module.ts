//ANGULAR CORE
import { NgModule } from '@angular/core';

//PRIMENG
import { DrawerModule } from 'primeng/drawer';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { TabsModule } from 'primeng/tabs';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { MenubarModule } from 'primeng/menubar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { BlockUIModule } from 'primeng/blockui';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { SidebarModule } from 'primeng/sidebar';
import { MenuModule } from 'primeng/menu';
import { ToastModule } from 'primeng/toast';
import { BadgeModule } from 'primeng/badge';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { DividerModule } from "primeng/divider";
import { FloatLabelModule } from 'primeng/floatlabel';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DataViewModule } from 'primeng/dataview';
import { CalendarModule } from 'primeng/calendar';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { ChipModule } from 'primeng/chip';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { PaginatorModule } from 'primeng/paginator';
import { ProgressBarModule } from 'primeng/progressbar';
// import { TabViewModule } from 'primeng/tabview';
import { ButtonGroupModule } from 'primeng/buttongroup';
import { AccordionModule } from 'primeng/accordion';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { TreeModule } from 'primeng/tree';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { PopoverModule } from 'primeng/popover';
import { ToolbarModule } from 'primeng/toolbar';
import { ScrollTopModule } from 'primeng/scrolltop';
import { EditorModule } from 'primeng/editor';
import { Listbox } from 'primeng/listbox';
import { FieldsetModule } from 'primeng/fieldset';

const PrimeNGModules: any[] = [
  //PrimeNG
  DrawerModule,
  RadioButtonModule,
  DatePickerModule,
  SelectModule,
  ButtonModule,
  TabsModule,
  MultiSelectModule,
  DropdownModule,
  MenubarModule,
  ProgressSpinnerModule,
  BlockUIModule,
  TableModule,
  CardModule,
  SidebarModule,
  MenuModule,
  ToastModule,
  BadgeModule,
  OverlayPanelModule,
  DividerModule,
  FloatLabelModule,
  IconFieldModule,
  InputIconModule,
  DialogModule,
  ConfirmDialogModule,
  DataViewModule,
  CalendarModule,
  BreadcrumbModule,
  InputTextModule,
  TooltipModule,
  TagModule,
  AvatarModule,
  ChipModule,
  InputNumberModule,
  CheckboxModule,
  PaginatorModule,
  ProgressBarModule,
  // TabViewModule,
  ButtonGroupModule,
  AccordionModule,
  ScrollPanelModule,
  TreeModule,
  ToggleSwitchModule,
  PopoverModule,
  ToolbarModule,
  ScrollTopModule,
  EditorModule,
  Listbox,
  FieldsetModule
];

@NgModule({
  imports: [
    PrimeNGModules
  ],
  exports: [
    PrimeNGModules
  ]
})
export class PrimeNGModule { }