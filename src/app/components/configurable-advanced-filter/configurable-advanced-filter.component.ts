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
import { AdvancedFilterQuery, FieldQueries, LevelQueries } from '../advanced-filter-query/advanced-filter-query.component'
import { MechanicsService } from 'src/app/_services/mechanics.service';

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
  @Input() levelCreationAllowed: boolean = true;

  @Output() advancedFilterSearch = new EventEmitter<AdvancedFilterQuery>();

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
  fieldOptionsFromDb;
  queryOptions;
  dateQueryOptions;

  levels: LevelQueries[];

  groupNumber = 1;
  levelNumber = 1;

  templateVisible = true;

  selectedList;
  
  constructor(public ms: MechanicsService) {
    
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
      { code: 'datapackages', name: 'Data Packages' },
      { code: 'authorityfiles', name: 'Authority Files' },
    ];

    this.queryOptions = [
      { code: 'Like', name: 'Contains Word' },
      { code: 'Exact', name: 'Equals' },
      { code: 'Starts', name: 'Starts With' },
      { code: 'Ends', name: 'Ends With' }
    ];

    this.dateQueryOptions = [
      { code: 'before', name: 'Before' },
      { code: 'after', name: 'After' },
      { code: 'dateRange', name: 'Date Range' }
    ];

    this.fieldOptionsFromDb = [
      {
        "key": "patents",
        "options": [
          {
            "label": "Text Fields",
            "code": "TXT",
            "items": [
              { "name": "Title", "code": "TTL" },
              { "name": "Description", "code": "DESC" },
              { "name": "Mark Name", "code": "MK" },
              { "name": "Title in Other Language", "code": "TTL_EN" }
            ]
          },
          {
            "label": "Property",
            "code": "PROP",
            "items": [
              { "name": "Application Id", "code": "AFNB" },
              { "name": "Filing Date", "code": "AFDT" },
              { "name": "Application Type", "code": "APP_TYP" },
              { "name": "Status", "code": "STLB" }
            ]
          },
          {
            "label": "Classifications",
            "code": "CLS",
            "items": [
              { "name": "Nice", "code": "NCL" },
              { "name": "Vienna", "code": "VCL" },
              { "name": "Locarno", "code": "LCL" },
              { "name": "IPC", "code": "IPC" }
            ]
          },
          {
            "label": "Country",
            "code": "COUNTRY",
            "items": [
              { "name": "Applicant County", "code": "APCT" },
              { "name": "Priority Country", "code": "PCCT" },
              { "name": "Filing Country", "code": "AFCT" },
              { "name": "Publication Country", "code": "PUBCT" }
            ]
          }
        ]
      },
      {
        "key": "trademarks",
        "options": [
          {
            "label": "Text Fields",
            "code": "TXT",
            "items": [
              { "name": "Title", "code": "TTL" },
              { "name": "Description", "code": "DESC" },
              { "name": "Mark Name", "code": "MK" },
              { "name": "Title in Other Language", "code": "TTL_EN" }
            ]
          },
          {
            "label": "Property",
            "code": "PROP",
            "items": [
              { "name": "Application Id", "code": "AFNB" },
              { "name": "Filing Date", "code": "AFDT" },
              { "name": "Application Type", "code": "APP_TYP" },
              { "name": "Status", "code": "STLB" }
            ]
          },
          {
            "label": "Classifications",
            "code": "CLS",
            "items": [
              { "name": "Nice", "code": "NCL" },
              { "name": "Vienna", "code": "VCL" },
              { "name": "Locarno", "code": "LCL" },
              { "name": "IPC", "code": "IPC" }
            ]
          },
          {
            "label": "Country",
            "code": "COUNTRY",
            "items": [
              { "name": "Applicant County", "code": "APCT" },
              { "name": "Priority Country", "code": "PCCT" },
              { "name": "Filing Country", "code": "AFCT" },
              { "name": "Publication Country", "code": "PUBCT" }
            ]
          }
        ]
      },
      {
        "key": "designs",
        "options": [
          {
            "label": "Text Fields",
            "code": "TXT",
            "items": [
              { "name": "Title", "code": "TTL" },
              { "name": "Description", "code": "DESC" },
              { "name": "Mark Name", "code": "MK" },
              { "name": "Title in Other Language", "code": "TTL_EN" }
            ]
          },
          {
            "label": "Property",
            "code": "PROP",
            "items": [
              { "name": "Application Id", "code": "AFNB" },
              { "name": "Filing Date", "code": "AFDT" },
              { "name": "Application Type", "code": "APP_TYP" },
              { "name": "Status", "code": "STLB" }
            ]
          },
          {
            "label": "Classifications",
            "code": "CLS",
            "items": [
              { "name": "Nice", "code": "NCL" },
              { "name": "Vienna", "code": "VCL" },
              { "name": "Locarno", "code": "LCL" },
              { "name": "IPC", "code": "IPC" }
            ]
          },
          {
            "label": "Country",
            "code": "COUNTRY",
            "items": [
              { "name": "Applicant County", "code": "APCT" },
              { "name": "Priority Country", "code": "PCCT" },
              { "name": "Filing Country", "code": "AFCT" },
              { "name": "Publication Country", "code": "PUBCT" }
            ]
          }
        ]
      },
      {
        "key": "gazette",
        "options": [
          {
            "label": "Text Fields",
            "code": "TXT",
            "items": [
              { "name": "Title", "code": "TTL" },
              { "name": "Description", "code": "DESC" },
              { "name": "Mark Name", "code": "MK" },
              { "name": "Title in Other Language", "code": "TTL_EN" }
            ]
          },
          {
            "label": "Property",
            "code": "PROP",
            "items": [
              { "name": "Application Id", "code": "AFNB" },
              { "name": "Filing Date", "code": "AFDT" },
              { "name": "Application Type", "code": "APP_TYP" },
              { "name": "Status", "code": "STLB" }
            ]
          },
          {
            "label": "Classifications",
            "code": "CLS",
            "items": [
              { "name": "Nice", "code": "NCL" },
              { "name": "Vienna", "code": "VCL" },
              { "name": "Locarno", "code": "LCL" },
              { "name": "IPC", "code": "IPC" }
            ]
          },
          {
            "label": "Country",
            "code": "COUNTRY",
            "items": [
              { "name": "Applicant County", "code": "APCT" },
              { "name": "Priority Country", "code": "PCCT" },
              { "name": "Filing Country", "code": "AFCT" },
              { "name": "Publication Country", "code": "PUBCT" }
            ]
          }
        ]
      },
      {
        "key": "datapackages",
        "options": [
          {
            "label": "Text Fields",
            "code": "TXT",
            "items": [
              { "name": "Title", "code": "TTL" },
              { "name": "Description", "code": "DESC" },
              { "name": "Mark Name", "code": "MK" },
              { "name": "Title in Other Language", "code": "TTL_EN" }
            ]
          },
          {
            "label": "Property",
            "code": "PROP",
            "items": [
              { "name": "Application Id", "code": "AFNB" },
              { "name": "Filing Date", "code": "AFDT" },
              { "name": "Application Type", "code": "APP_TYP" },
              { "name": "Status", "code": "STLB" }
            ]
          },
          {
            "label": "Classifications",
            "code": "CLS",
            "items": [
              { "name": "Nice", "code": "NCL" },
              { "name": "Vienna", "code": "VCL" },
              { "name": "Locarno", "code": "LCL" },
              { "name": "IPC", "code": "IPC" }
            ]
          },
          {
            "label": "Country",
            "code": "COUNTRY",
            "items": [
              { "name": "Applicant County", "code": "APCT" },
              { "name": "Priority Country", "code": "PCCT" },
              { "name": "Filing Country", "code": "AFCT" },
              { "name": "Publication Country", "code": "PUBCT" }
            ]
          }
        ]
      },
      {
        "key": "authorityfiles",
        "options": [
          {
            "label": "Text Fields",
            "code": "TXT",
            "items": [
              { "name": "File Number", "code": "fileNumber", "fieldType": "text" },
              { "name": "Publication Number", "code": "publicationNumber", "fieldType": "text" }
            ]
          },
          {
            "label": "Date Fields",
            "code": "date",
            "items": [
              { "name": "Publication Date", "code": "publicationDate", "fieldType": "date" }
            ]
          }
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
      query: {"category":"patents","levelList":[{"level":"1","levelId":"1","level_name":"","group_list":[{"group":"1","group_name":"Filter Group 1","file_list":[{"fieldId":"1","field":{"name":"Description","code":"DESC"},"connecting":{"code":"Like","name":"Contains Word"},"value":"cola","operator":"AND","orOperator":false},{"fieldId":"2","field":{"name":"Nice","code":"NCL"},"connecting":{"code":"Exact","name":"Equals"},"value":"24","operator":"AND","orOperator":false}],"group_operator":"AND","orOperator":false}],"level_operator":"AND","orOperator":false},{"level":"2","levelId":"2","level_name":"Level 2 Query","group_list":[{"group":"2","group_name":"Filter Group 2","file_list":[{"fieldId":"1","field":{"name":"Applicant County","code":"APCT"},"connecting":{"code":"Exact","name":"Equals"},"value":"VC","operator":"AND","orOperator":false},{"fieldId":"2","field":{"name":"Vienna","code":"VCL"},"connecting":{"code":"Starts","name":"Starts With"},"value":"1.13","operator":"AND","orOperator":false}],"group_operator":"AND","orOperator":false},{"group":"3","group_name":"Filter Group 3","file_list":[{"fieldId":"3","field":{"name":"Mark Name","code":"MK"},"connecting":{"code":"Like","name":"Contains Word"},"value":"3D","operator":"AND","orOperator":false},{"fieldId":"4","field":{"name":"Application Type","code":"APP_TYP"},"connecting":{"code":"Like","name":"Contains Word"},"value":"premium","operator":"AND","orOperator":false}],"group_operator":"AND","orOperator":false}],"level_operator":"OR","orOperator":true},{"level":"1","levelId":"3","level_name":"","group_list":[{"group":"4","group_name":"Filter Group 4","file_list":[{"fieldId":"1","field":{"name":"Status","code":"STLB"},"connecting":{"code":"Exact","name":"Equals"},"value":"Registered","operator":"AND","orOperator":false}],"group_operator":"AND","orOperator":false}],"level_operator":"AND","orOperator":false}]}
    },
    {
      templateId: "2",
      category: "trademarks",
      title: "Trademark Brand Search",
      description: "Search for trademark brand names and goods/services",
      created: "2025-10-10",
      lastUsed: "2025-10-12",
      query: {"category":"patents","levelList":[{"level":"1","levelId":"1","level_name":"","group_list":[{"group":"1","group_name":"Filter Group 1","file_list":[{"fieldId":"1","field":{"name":"Description","code":"DESC"},"connecting":{"code":"Like","name":"Contains Word"},"value":"cola","operator":"AND","orOperator":false},{"fieldId":"2","field":{"name":"Nice","code":"NCL"},"connecting":{"code":"Exact","name":"Equals"},"value":"24","operator":"AND","orOperator":false}],"group_operator":"AND","orOperator":false}],"level_operator":"AND","orOperator":false},{"level":"2","levelId":"2","level_name":"Level 2 Query","group_list":[{"group":"2","group_name":"Filter Group 2","file_list":[{"fieldId":"1","field":{"name":"Applicant County","code":"APCT"},"connecting":{"code":"Exact","name":"Equals"},"value":"VC","operator":"AND","orOperator":false},{"fieldId":"2","field":{"name":"Vienna","code":"VCL"},"connecting":{"code":"Starts","name":"Starts With"},"value":"1.13","operator":"AND","orOperator":false}],"group_operator":"AND","orOperator":false},{"group":"3","group_name":"Filter Group 3","file_list":[{"fieldId":"3","field":{"name":"Mark Name","code":"MK"},"connecting":{"code":"Like","name":"Contains Word"},"value":"3D","operator":"AND","orOperator":false},{"fieldId":"4","field":{"name":"Application Type","code":"APP_TYP"},"connecting":{"code":"Like","name":"Contains Word"},"value":"premium","operator":"AND","orOperator":false}],"group_operator":"AND","orOperator":false}],"level_operator":"OR","orOperator":true},{"level":"1","levelId":"3","level_name":"","group_list":[{"group":"4","group_name":"Filter Group 4","file_list":[{"fieldId":"1","field":{"name":"Status","code":"STLB"},"connecting":{"code":"Exact","name":"Equals"},"value":"Registered","operator":"AND","orOperator":false}],"group_operator":"AND","orOperator":false}],"level_operator":"AND","orOperator":false}]}
    },
    {
      templateId: "3",
      category: "authorityfiles",
      title: "Authority Files Sample",
      description: "Search for Authority files related queries",
      created: "2025-10-10",
      lastUsed: "2025-10-12",
      query: {"category":"patents","levelList":[{"level":"1","levelId":"1","level_name":"","group_list":[{"group":"1","group_name":"Filter Group 1","file_list":[{"fieldId":"1","field":{"name":"Description","code":"DESC"},"connecting":{"code":"Like","name":"Contains Word"},"value":"cola","operator":"AND","orOperator":false},{"fieldId":"2","field":{"name":"Nice","code":"NCL"},"connecting":{"code":"Exact","name":"Equals"},"value":"24","operator":"AND","orOperator":false}],"group_operator":"AND","orOperator":false}],"level_operator":"AND","orOperator":false},{"level":"2","levelId":"2","level_name":"Level 2 Query","group_list":[{"group":"2","group_name":"Filter Group 2","file_list":[{"fieldId":"1","field":{"name":"Applicant County","code":"APCT"},"connecting":{"code":"Exact","name":"Equals"},"value":"VC","operator":"AND","orOperator":false},{"fieldId":"2","field":{"name":"Vienna","code":"VCL"},"connecting":{"code":"Starts","name":"Starts With"},"value":"1.13","operator":"AND","orOperator":false}],"group_operator":"AND","orOperator":false},{"group":"3","group_name":"Filter Group 3","file_list":[{"fieldId":"3","field":{"name":"Mark Name","code":"MK"},"connecting":{"code":"Like","name":"Contains Word"},"value":"3D","operator":"AND","orOperator":false},{"fieldId":"4","field":{"name":"Application Type","code":"APP_TYP"},"connecting":{"code":"Like","name":"Contains Word"},"value":"premium","operator":"AND","orOperator":false}],"group_operator":"AND","orOperator":false}],"level_operator":"OR","orOperator":true},{"level":"1","levelId":"3","level_name":"","group_list":[{"group":"4","group_name":"Filter Group 4","file_list":[{"fieldId":"1","field":{"name":"Status","code":"STLB"},"connecting":{"code":"Exact","name":"Equals"},"value":"Registered","operator":"AND","orOperator":false}],"group_operator":"AND","orOperator":false}],"level_operator":"AND","orOperator":false}]}
    }];

    this.queryTemplates = this.queryTemplatesFromDb;

    this.selectedCategory = {code: 'All', name: 'All'};
    if(this.category != "All"){
      this.selectedCategory = this.categories.find(item => item.code === this.category);
      this.filterTemplates();
    } else {
      this.filterFieldOptions();
    }

    this.clearSearch();

    this.selectedList = {"total": 0, "groups": 0, "levels": 0, groupList: [], levelList: []};
  }

  private initializeFilterSelector(): void {
    // Initially select all filters
  }

  filterFieldOptions(): void {
    let filtered;
    if (this.selectedCategory.code != "All"){
      let selectedOptions = this.fieldOptionsFromDb.find(item => item.key === this.selectedCategory.code);
      filtered = selectedOptions.options;
    }else {
      filtered = this.fieldOptionsFromDb.flatMap(entry => entry.options);
    }
    this.fieldOptions = filtered;
  }

  filterTemplates(): void {
    let filtered;
    if (this.selectedCategory.code != "All"){
      filtered = this.queryTemplatesFromDb.filter(item => item.category === this.selectedCategory.code);
    }else {
      filtered = this.queryTemplatesFromDb;
    }
    this.queryTemplates = filtered;

    this.filterFieldOptions();
  }

  clearSearch(): void {
    let nextNumber = Math.floor(Math.random() * 100) + 1;
    let fields = [{"fieldId":nextNumber+"", "field":{code: "", name:""}, "connecting":{code: "", name:""}, "value":"", "operator":"","orOperator":false}];

    this.groupNumber = 1;
    let groupId = Math.floor(Math.random() * 100) + 1;
    let groups = [{"group":groupId+"", "group_name":this.ms.translate('common.components.advancedFilter.display.groupName')+" "+this.groupNumber, "file_list": fields, "group_operator":"","orOperator":false}];  
    this.groupNumber = this.groupNumber + 1;

    this.levelNumber = 1;
    let levelId = Math.floor(Math.random() * 100) + 1;
    this.levels = [{"level":"1","levelId":levelId+"","level_name":"","group_list": groups,"level_operator":"AND","orOperator":false}];

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
    //console.log(this.levels);
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

  onFieldChange(selectedField: any, file: FieldQueries) {
    file.fieldType = selectedField.fieldType;
  }


  addField(levelId: string, groupId: string ): void {

    let selectedLevel = this.levels.find(item => item.levelId === levelId);

    const targetGroup = selectedLevel.group_list.find(item => item.group === groupId);

    let firstFieldOperator = targetGroup.file_list[0].orOperator;
    targetGroup.file_list.forEach(item => {
      item.orOperator = firstFieldOperator;
    });

    let nextNumber = Math.floor(Math.random() * 100) + 1;
    const newItemDetail: FieldQueries = {"fieldId":nextNumber+"", "field":{code: "", name:""}, "connecting":{code: "", name:""}, "value":"", "operator":"","orOperator":firstFieldOperator}
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
    let firstLevelOperator = false;
    if(this.levels.length > 1){
      let selectedLevel = this.levels.at(-2);
      firstLevelOperator = selectedLevel.orOperator;
      this.levels.forEach(item => {
        item.orOperator = firstLevelOperator;
      });
    }

    let nextNumber = Math.floor(Math.random() * 100) + 1;
    let fields = [{"fieldId":nextNumber+"", "field":{code: "", name:""}, "connecting":{code: "", name:""}, "value":"", "operator":"","orOperator":false}];
    
    let groupId = Math.floor(Math.random() * 100) + 1;
    let group = {"group":groupId+"", "group_name":this.ms.translate('common.components.advancedFilter.display.groupName')+" "+this.groupNumber, "file_list": fields, "group_operator":"","orOperator":firstLevelOperator};
    this.groupNumber = this.groupNumber + 1;

    let levelId = Math.floor(Math.random() * 100) + 1;
    let level = {"level":"1","levelId":levelId+"","level_name":"","group_list": [group],"level_operator":"AND","orOperator":firstLevelOperator};

    this.levels.push(level);
  }

  removeGroup(levelId: string, groupId: string ): void {

    let selectedLevel = this.levels.find(item => item.levelId === levelId);

    const indexToRemove = selectedLevel.group_list.findIndex(item => item.group === groupId);
    if (indexToRemove !== -1) {
      selectedLevel.group_list.splice(indexToRemove, 1);
    }

    if(selectedLevel.group_list.length === 0){
      const levelIndexToRemove = this.levels.findIndex(item => item.levelId === levelId);
      if (levelIndexToRemove !== -1) {
        this.levels.splice(levelIndexToRemove, 1);
      }
    }
  }

  onSearch(): void {

    this.visible = false;
    let advancedFilterQuery = {"category":this.selectedCategory.code, "levelList":this.levels};
    this.advancedFilterSearch.emit(advancedFilterQuery);

  }

  onSelectionChange(type: string, levelId: string, groupId: string, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;

    if (type === "group") {
      const groupSelected = this.levels.find(item => item.levelId === levelId).group_list.find(grp => grp.group === groupId);
      groupSelected.selected = isChecked;
      //console.log(groupSelected.group_name+" "+isChecked);
      if(isChecked){
        this.selectedList.total = this.selectedList.total + 1;
        this.selectedList.groups = this.selectedList.groups + 1;
        this.selectedList.groupList.push(groupSelected);
      }else{
        this.selectedList.total = this.selectedList.total - 1;
        this.selectedList.groups = this.selectedList.groups - 1;

        const indexToRemove =  this.selectedList.groupList.findIndex(item => item.group === groupId);
        if (indexToRemove !== -1) {
           this.selectedList.groupList.splice(indexToRemove, 1);
        }
      }
 
    } else if (type === "level") {
      const levelSelected = this.levels.find(item => item.levelId === levelId);
      levelSelected.selected = isChecked;

      if(isChecked){
        this.selectedList.total = this.selectedList.total + 1;
        this.selectedList.levels = this.selectedList.levels + 1;
        this.selectedList.levelList.push(levelSelected);
      }else{
        this.selectedList.total = this.selectedList.total - 1;
        this.selectedList.levels = this.selectedList.levels - 1;

        const indexToRemove = this.selectedList.levelList.findIndex(item => item.levelId === levelId);
        if (indexToRemove !== -1) {
          this.selectedList.levelList.splice(indexToRemove, 1);
        }
      }
    }
    
    //console.log(this.selectedList);
  }

  clearSelection(): void {
    this.selectedList = {"total": 0, "groups": 0, "levels": 0, groupList: [], levelList: []};
    this.levels = this.levels.map(level => ({
      ...level,
      selected: false,
      group_list: level.group_list?.map(group => ({
        ...group,
        selected: false
      })) || []
    }));

  }

  createLevel2(): void {
    //console.log(this.levels);
    //console.log(this.selectedList);
    const selectedGroups = [];
    let firstSelectedIndex = -1;

    this.levels = this.levels.map((level,index) => {
      if(firstSelectedIndex < 0) {
        let groupSelectedIndex = level.group_list.findIndex(group => group.selected);
        if(groupSelectedIndex > -1){
          firstSelectedIndex = index;
        }
      }
      const remainingGroups = level.group_list.filter(group => {
        if (group.selected) {
          selectedGroups.push({ ...group, selected: false });
          return false;
        }
        return true;
      });
      return { ...level, group_list: remainingGroups };

    });

    const newLevelId = Math.floor(Math.random() * 100) + 1;
    const newLevel = {
      level: "2",
      levelId: newLevelId + "",
      level_name: this.ms.translate('common.components.advancedFilter.display.groupedLevel')+` ${this.levelNumber}`,
      group_list: selectedGroups,
      level_operator: "AND",
      orOperator: false
    };
    this.levelNumber = this.levelNumber + 1;
    this.levels.splice(firstSelectedIndex, 0, newLevel);

    this.levels = this.levels.filter(level => level.group_list.length > 0);

    this.selectedList = {"total": 0, "groups": 0, "levels": 0, groupList: [], levelList: []};
    //console.log(this.levels);
  }

  unGroup(levelId: string): void {
    //console.log(this.levels);
    let selectedLevel = this.levels.find(item => item.levelId === levelId);

    let indexToRemove = this.levels.findIndex(item => item.levelId === levelId);
    if (indexToRemove !== -1) {
      this.levels.splice(indexToRemove, 1);
    }

    selectedLevel.group_list.forEach(group => {
      let newLevelId = Math.floor(Math.random() * 100) + 1;
      const newLevel = {
        level: "1",
        levelId: newLevelId+"",
        level_name: "",
        group_list: [
          {
            ...group
          }
        ],
        level_operator: "AND",
        orOperator: false
      };
      this.levels.splice(indexToRemove, 0, newLevel);
      indexToRemove = indexToRemove + 1;
    });
    //console.log(this.levels);
  }

  mergeWithSelectedLevel() {

    const targetIndex = this.levels.findIndex(l => l.selected);
    if (targetIndex === -1) {
      return;
    }

    const targetLevel = this.levels[targetIndex];

    const selectedGroups: any[] = [];

    this.levels.forEach((lvl, lvlIndex) => {
      if (lvlIndex === targetIndex) {
        return;
      }
      const selectedInLevel = lvl.group_list.filter(g => g.selected);
      if (selectedInLevel.length) {
        selectedGroups.push(...selectedInLevel);
        lvl.group_list = lvl.group_list.filter(g => !g.selected);
      }
    });

    if (selectedGroups.length) {
      targetLevel.group_list.push(...selectedGroups.map(g => ({ ...g, selected: false })));
    }

    this.levels = this.levels.filter(l => l.group_list.length > 0);

    this.selectedList = {"total": 0, "groups": 0, "levels": 0, groupList: [], levelList: []};
  }

}
