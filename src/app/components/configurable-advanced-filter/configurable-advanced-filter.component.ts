import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
} from '@angular/forms';
import { Subject } from 'rxjs';
import { AdvancedFilterQuery, FieldQueries, GroupQueries } from '../advanced-filter-query/advanced-filter-query.component'

export interface SearchCategory {
  code: string;
  name: string;
}

export interface QueryTemplate{
  category: string;
  title: string;
  description: string;
  created: string;
  lastUsed: string;
  query: AdvancedFilterQuery;
}

@Component({
  selector: 'app-configurable-advanced-filter',
  templateUrl: './configurable-advanced-filter.component.html',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Default,
})
export class ConfigurableAdvancedFilterComponent implements OnInit, OnDestroy {

  @Input() visible: boolean = false;
  @Input() queryTemplates: QueryTemplate[] | null = null;

  activeFiltersCount: number = 0;
  hasActiveFilters: boolean = false;
  private destroy$ = new Subject<void>();

  categories: SearchCategory[] | undefined;
  selectedCategories: SearchCategory | undefined;


  fields: FieldQueries[];
  groups: GroupQueries[];
  
  constructor(private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.initializeForm();
    this.initializeFilterSelector();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {

    this.categories = [
      { code: 'All', name: 'All' },
      { code: 'patents', name: 'Patents' },
      { code: 'trademarks', name: 'Trademarks' },
      { code: 'designs', name: 'Designs' },
      { code: 'gazette', name: 'Gazette' },
      { code: 'data-packages', name: 'Data Packages' },
      { code: 'authority-files', name: 'Authority Files' },
    ];

    this.queryTemplates = [{
      category: "patents",
      title: "Patent Search - US Filed",
      description: "Common search for US filed patents with specific status",
      created: "2025-10-10",
      lastUsed: "2025-10-12",
      query: {"category":"patents","levelList":[{"level":"1","level_name":"","group_list":[{"group":"1","group_name":"Group 1","file_list":[{"field":"goods_service","field_label":"Goods and Service","connecting":"contains the word","connecting_key":"%val%","value":"cola","operator":"AND"},{"field":"nice","field_label":"Nice Classifications","connecting":"equals","connecting_key":"=val","value":"24","operator":""}],"group_operator":""}],"level_operator":"AND"},{"level":"2","level_name":"Level 2 Query","group_list":[{"group":"2","group_name":"Group 2","file_list":[{"field":"office","field_label":"IP Office","connecting":"equals","connecting_key":"=val","value":"VC","operator":"AND"},{"field":"vienna","field_label":"Vienna Classifications","connecting":"contains","connecting_key":"%val%","value":"1.13","operator":""}],"group_operator":"AND"},{"group":"3","group_name":"Group 3","file_list":[{"field":"feature","field_label":"Feaure","connecting":"contains","connecting_key":"%val%","value":"3D","operator":"AND"},{"field":"brand","field_label":"Brand Name","connecting":"contains","connecting_key":"%val%","value":"premium","operator":""}],"group_operator":""}],"level_operator":"OR"},{"level":"1","level_name":"","group_list":[{"group":"4","group_name":"Group 4","file_list":[{"field":"status","field_label":"Status","connecting":"equals","connecting_key":"=val","value":"Registered","operator":""}],"group_operator":""}],"level_operator":""}]}
    },
    {
      category: "trademarks",
      title: "Trademark Brand Search",
      description: "Search for trademark brand names and goods/services",
      created: "2025-10-10",
      lastUsed: "2025-10-12",
      query: {"category":"patents","levelList":[{"level":"1","level_name":"","group_list":[{"group":"1","group_name":"Group 1","file_list":[{"field":"goods_service","field_label":"Goods and Service","connecting":"contains the word","connecting_key":"%val%","value":"cola","operator":"AND"},{"field":"nice","field_label":"Nice Classifications","connecting":"equals","connecting_key":"=val","value":"24","operator":""}],"group_operator":""}],"level_operator":"AND"},{"level":"2","level_name":"Level 2 Query","group_list":[{"group":"2","group_name":"Group 2","file_list":[{"field":"office","field_label":"IP Office","connecting":"equals","connecting_key":"=val","value":"VC","operator":"AND"},{"field":"vienna","field_label":"Vienna Classifications","connecting":"contains","connecting_key":"%val%","value":"1.13","operator":""}],"group_operator":"AND"},{"group":"3","group_name":"Group 3","file_list":[{"field":"feature","field_label":"Feaure","connecting":"contains","connecting_key":"%val%","value":"3D","operator":"AND"},{"field":"brand","field_label":"Brand Name","connecting":"contains","connecting_key":"%val%","value":"premium","operator":""}],"group_operator":""}],"level_operator":"OR"},{"level":"1","level_name":"","group_list":[{"group":"4","group_name":"Group 4","file_list":[{"field":"status","field_label":"Status","connecting":"equals","connecting_key":"=val","value":"Registered","operator":""}],"group_operator":""}],"level_operator":""}]}
    }];

    this.fields = [{"field":"", "field_label":"", "connecting":"", "connecting_key":"", "value":"", "operator":""}];

    this.groups = [{"group":"1", "group_name":"Group 1", "file_list": this.fields, "group_operator":""}];
  

    //const formControls: { [key: string]: any } = {};

    //this.filterForm = this.fb.group(formControls);
  }

  private initializeFilterSelector(): void {
    // Initially select all filters
  }


  onClose(): void {
    this.visible = false;
  }

  toggleFilter(): void {
    this.visible = true;
  }

}
