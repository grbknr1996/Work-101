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
} from '@angular/forms';
import { formatDate } from '@angular/common';
import { Subject } from 'rxjs';
import { AdvancedFilterQuery, FieldQueries, GroupQueries, LevelQueries } from '../advanced-filter-query/advanced-filter-query.component'

export interface SearchCategory {
  code: string;
  name: string;
}

export interface QueryTemplate{
  templateId: string;
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
  @Input() category: string = "All";
  @Input() categorySelection: boolean = false;
  @Input() templateSelection: boolean = true;

  queryTemplatesFromDb: QueryTemplate[] | null = null;
  queryTemplates: QueryTemplate[] | null = null;

  showSaveTemplate: boolean = false;
  templateTitle = "";
  templateDescripton = "";

  activeFiltersCount: number = 0;
  hasActiveFilters: boolean = false;
  private destroy$ = new Subject<void>();

  categories: SearchCategory[] | undefined;
  selectedCategory: SearchCategory | undefined;

  fieldOptions;
  queryOptions;

  //fields: FieldQueries[];
  //groups: GroupQueries[];
  levels: LevelQueries[];

  groupNumber = 1;
  levelNumber = 1;

  templateVisible = true;
  
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

    this.queryOptions = [
      { code: 'Like', name: 'Contains Word' },
      { code: 'Exact', name: 'Equals' },
      { code: 'Starts', name: 'Starts With' },
      { code: 'Ends', name: 'Ends With' }
    ];

    this.fieldOptions = [
      {
        label: 'Free Text',
        value: 'TXT',
        items: [
          { label: 'Title', value: 'TTL' },
          { label: 'Description', value: 'DESC' },
          { label: 'Mark Name', value: 'MK' },
          { label: 'Title in Other Language', value: 'TTL_EN' }
        ]
      },
      {
        label: 'Property',
        value: 'PROP',
        items: [
          { label: 'Application Id', value: 'AFNB' },
          { label: 'Filing Date', value: 'AFDT' },
          { label: 'Application Type', value: 'APP_TYP' },
          { label: 'Status', value: 'STLB' }
        ]
      },
      {
        label: 'Classifications',
        value: 'CLS',
        items: [
          { label: 'Nice', value: 'NCL' },
          { label: 'Vienna', value: 'VCL' },
          { label: 'Locarno', value: 'LCL' },
          { label: 'IPC', value: 'IPC' }
        ]
      },
      {
        label: 'Country',
        value: 'COUNTRY',
        items: [
          { label: 'Applicant County', value: 'APCT' },
          { label: 'Priority Country', value: 'PCCT' },
          { label: 'Filing Country', value: 'AFCT' },
          { label: 'Publication Country', value: 'PUBCT' }
        ]
      }
    ];

    this.queryTemplatesFromDb = [{
      templateId: "1",
      category: "patents",
      title: "Patent Search - US Filed",
      description: "Common search for US filed patents with specific status",
      created: "2025-10-10",
      lastUsed: "2025-10-12",
      query: {"category":"patents","levelList":[{"level":"1","levelId":"1","level_name":"","group_list":[{"group":"1","group_name":"Group 1","file_list":[{"fieldId":"1","field":"goods_service","field_label":"Goods and Service","connecting":"contains the word","connecting_key":"%val%","value":"cola","operator":"AND","orOperator":false},{"fieldId":"2","field":"nice","field_label":"Nice Classifications","connecting":"equals","connecting_key":"=val","value":"24","operator":"AND","orOperator":false}],"group_operator":"AND","orOperator":false}],"level_operator":"AND","orOperator":false},{"level":"2","levelId":"2","level_name":"Level 2 Query","group_list":[{"group":"2","group_name":"Group 2","file_list":[{"fieldId":"1","field":"office","field_label":"IP Office","connecting":"equals","connecting_key":"=val","value":"VC","operator":"AND","orOperator":false},{"fieldId":"2","field":"vienna","field_label":"Vienna Classifications","connecting":"contains","connecting_key":"%val%","value":"1.13","operator":"AND","orOperator":false}],"group_operator":"AND","orOperator":false},{"group":"3","group_name":"Group 3","file_list":[{"fieldId":"3","field":"feature","field_label":"Feaure","connecting":"contains","connecting_key":"%val%","value":"3D","operator":"AND","orOperator":false},{"fieldId":"4","field":"brand","field_label":"Brand Name","connecting":"contains","connecting_key":"%val%","value":"premium","operator":"AND","orOperator":false}],"group_operator":"AND","orOperator":false}],"level_operator":"OR","orOperator":true},{"level":"1","levelId":"3","level_name":"","group_list":[{"group":"4","group_name":"Group 4","file_list":[{"fieldId":"1","field":"status","field_label":"Status","connecting":"equals","connecting_key":"=val","value":"Registered","operator":"AND","orOperator":false}],"group_operator":"AND","orOperator":false}],"level_operator":"AND","orOperator":false}]}
    },
    {
      templateId: "2",
      category: "trademarks",
      title: "Trademark Brand Search",
      description: "Search for trademark brand names and goods/services",
      created: "2025-10-10",
      lastUsed: "2025-10-12",
      query: {"category":"patents","levelList":[{"level":"1","levelId":"1","level_name":"","group_list":[{"group":"1","group_name":"Group 1","file_list":[{"fieldId":"1","field":"goods_service","field_label":"Goods and Service","connecting":"contains the word","connecting_key":"%val%","value":"cola","operator":"AND","orOperator":false},{"fieldId":"2","field":"nice","field_label":"Nice Classifications","connecting":"equals","connecting_key":"=val","value":"24","operator":"AND","orOperator":false}],"group_operator":"AND","orOperator":false}],"level_operator":"AND","orOperator":false},{"level":"2","levelId":"2","level_name":"Level 2 Query","group_list":[{"group":"2","group_name":"Group 2","file_list":[{"fieldId":"1","field":"office","field_label":"IP Office","connecting":"equals","connecting_key":"=val","value":"VC","operator":"AND","orOperator":false},{"fieldId":"2","field":"vienna","field_label":"Vienna Classifications","connecting":"contains","connecting_key":"%val%","value":"1.13","operator":"AND","orOperator":false}],"group_operator":"AND","orOperator":false},{"group":"3","group_name":"Group 3","file_list":[{"fieldId":"3","field":"feature","field_label":"Feaure","connecting":"contains","connecting_key":"%val%","value":"3D","operator":"AND","orOperator":false},{"fieldId":"4","field":"brand","field_label":"Brand Name","connecting":"contains","connecting_key":"%val%","value":"premium","operator":"AND","orOperator":false}],"group_operator":"AND","orOperator":false}],"level_operator":"OR","orOperator":true},{"level":"1","levelId":"3","level_name":"","group_list":[{"group":"4","group_name":"Group 4","file_list":[{"fieldId":"1","field":"status","field_label":"Status","connecting":"equals","connecting_key":"=val","value":"Registered","operator":"AND","orOperator":false}],"group_operator":"AND","orOperator":false}],"level_operator":"AND","orOperator":false}]}
    }];

    this.queryTemplates = this.queryTemplatesFromDb;

    this.selectedCategory = {code: 'All', name: 'All'};
    if(this.category != "All"){
      this.selectedCategory = this.categories.find(item => item.code === this.category);
      this.filterTemplates();
    }


    this.clearSearch();
    
  }

  private initializeFilterSelector(): void {
    // Initially select all filters
  }

  filterTemplates(): void {
    let filtered;
    if (this.selectedCategory.code != "All"){
      filtered = this.queryTemplatesFromDb.filter(item => item.category === this.selectedCategory.code);
    }else {
      filtered = this.queryTemplatesFromDb;
    }
    this.queryTemplates = filtered;
  }

  clearSearch(): void {
    let nextNumber = Math.floor(Math.random() * 100) + 1;
    let fields = [{"fieldId":nextNumber+"", "field":"", "field_label":"", "connecting":"", "connecting_key":"", "value":"", "operator":"","orOperator":false}];

    this.groupNumber = 1;
    let groups = [{"group":this.groupNumber+"", "group_name":"Group "+this.groupNumber, "file_list": fields, "group_operator":"","orOperator":false}];  
    this.groupNumber = this.groupNumber + 1;

    this.levelNumber = 1;
    this.levels = [{"level":"1","levelId":"1","level_name":"","group_list": groups,"level_operator":"AND","orOperator":false}]
    this.levelNumber = this.levelNumber + 1;
  }

  onClose(): void {
    this.visible = false;
  }

  toggleFilter(): void {
    this.visible = true;
  }

  toggleTemplate(): void {
    this.templateVisible = !this.templateVisible;
  }

  loadTemplate(templateId: string): void {
    const templateSelected = this.queryTemplates.find(temp => temp.templateId === templateId);
    //TODO SET group number and level number based on the existing query
    this.levels = templateSelected.query.levelList;
  }

  deleteTemplate(templateId: string): void {
    const indexToRemove = this.queryTemplates.findIndex(temp => temp.templateId === templateId);

      if (indexToRemove !== -1) {
        this.queryTemplates.splice(indexToRemove, 1);
      }
  }

  openSaveTemplate(): void {
    this.showSaveTemplate = true;
  }

  closeSaveTemplate(): void {
    this.showSaveTemplate = false;
  }

  saveAsTemplate(): void {
    let nextNumber = Math.floor(Math.random() * 100) + 1;

    let newTemplate = {
      templateId: nextNumber+"",
      category: this.selectedCategory.code,
      title: this.templateTitle,
      description: this.templateDescripton,
      created: formatDate(new Date(), 'yyyy-MM-dd', 'en-US'),
      lastUsed: "",
      query: {"category":this.selectedCategory.code,"levelList":this.levels}
    }

    this.queryTemplates.push(newTemplate);
    this.queryTemplatesFromDb.push(newTemplate);

    this.showSaveTemplate = false
  }

  addField(levelId: string, groupId: string ): void {

    let selectedLevel = this.levels.find(item => item.levelId === levelId);

    const targetGroup = selectedLevel.group_list.find(item => item.group === groupId);

    let firstFieldOperator = targetGroup.file_list[0].orOperator;
    targetGroup.file_list.forEach(item => {
      item.orOperator = firstFieldOperator;
    });

    let nextNumber = Math.floor(Math.random() * 100) + 1;
    const newItemDetail: FieldQueries = {"fieldId":nextNumber+"", "field":"", "field_label":"", "connecting":"", "connecting_key":"", "value":"", "operator":"","orOperator":firstFieldOperator}
    targetGroup.file_list.push(newItemDetail);

  }

  removeField(levelId: string, groupId: string, fileId: string ): void {

    let selectedLevel = this.levels.find(item => item.levelId === levelId);

    const targetGroup = selectedLevel.group_list.find(item => item.group === groupId);

    const indexToRemove = targetGroup.file_list.findIndex(item => item.fieldId === fileId);

    if (indexToRemove !== -1) {
      targetGroup.file_list.splice(indexToRemove, 1);
    }

    if(targetGroup.file_list.length === 0){
      this.removeGroup(levelId, groupId);
    }
      
  }


  addGroup(): void {

    let selectedLevel = this.levels.at(-1);

    let firstGroupOperator = false;
    if(selectedLevel.group_list.length > 0){
      firstGroupOperator = selectedLevel.group_list[0].orOperator;
      selectedLevel.group_list.forEach(item => {
        item.orOperator = firstGroupOperator;
      });
    }

    let nextNumber = Math.floor(Math.random() * 100) + 1;
    let fields = [{"fieldId":nextNumber+"", "field":"", "field_label":"", "connecting":"", "connecting_key":"", "value":"", "operator":"","orOperator":false}];
    let group = {"group":this.groupNumber+"", "group_name":"Group "+this.groupNumber, "file_list": fields, "group_operator":"","orOperator":firstGroupOperator};
    this.groupNumber = this.groupNumber + 1;

    selectedLevel.group_list.push(group);
  }

  removeGroup(levelId: string, groupId: string ): void {

    let selectedLevel = this.levels.find(item => item.levelId === levelId);

    const indexToRemove = selectedLevel.group_list.findIndex(item => item.group === groupId);
    if (indexToRemove !== -1) {
      selectedLevel.group_list.splice(indexToRemove, 1);
    }
  }

}
