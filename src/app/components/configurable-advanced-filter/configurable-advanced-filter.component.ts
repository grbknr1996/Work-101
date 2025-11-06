import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';
import { formatDate } from '@angular/common';
import { Subject } from 'rxjs';
import { AdvancedFilterQuery, FieldQueries, LevelQueries } from '../advanced-filter-query/advanced-filter-query.component'
import { MechanicsService } from 'src/app/_services/mechanics.service';
import { AdvancedFilterService } from 'src/app/_services/advanced-filter.service';
import { queryTemplatesFromDb } from 'src/assets/data';

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
  @Input() category: string = "all";
  @Input() categorySelection: boolean = false;
  @Input() templateSelection: boolean = true;
  @Input() levelCreationAllowed: boolean = true;

  @Output() advancedFilterSearch = new EventEmitter<AdvancedFilterQuery>();

  private destroy$ = new Subject<void>();

  templateVisible = true;
  queryTemplates: QueryTemplate[] | null = null;
  showSaveTemplate: boolean = false;
  templateTitle = "";
  templateDescripton = "";

  categories: SearchCategory[] | undefined;
  selectedCategory: SearchCategory | undefined;
  fieldOptions;
  queryOptions;
  dateQueryOptions;

  levels: LevelQueries[];

  selectedList;

  groupNumber = 1;
  levelNumber = 1;
  
  constructor(
    public ms: MechanicsService,
    private advancedService: AdvancedFilterService) {
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {

    this.queryOptions = [
      { code: 'like', name: this.ms.translate('common.components.advancedFilter.display.queryOptions.like') },
      { code: 'equals', name: this.ms.translate('common.components.advancedFilter.display.queryOptions.equals') },
      { code: 'starts', name: this.ms.translate('common.components.advancedFilter.display.queryOptions.starts') },
      { code: 'ends', name: this.ms.translate('common.components.advancedFilter.display.queryOptions.ends') }
    ];

    this.dateQueryOptions = [
      { code: 'before', name: this.ms.translate('common.components.advancedFilter.display.queryOptions.before') },
      { code: 'after', name: this.ms.translate('common.components.advancedFilter.display.queryOptions.after') },
      { code: 'exact', name: this.ms.translate('common.components.advancedFilter.display.queryOptions.exact') },
      { code: 'dateRange', name: this.ms.translate('common.components.advancedFilter.display.queryOptions.dateRange') }
    ];

    this.queryTemplates = queryTemplatesFromDb;

    this.selectedList = {"total": 0, "groups": 0, "levels": 0, groupList: [], levelList: []};
    
    this.selectedCategory = {code: 'all', name: this.ms.translate('common.components.advancedFilter.display.categoryoptions.all')};

    let categoryEnKey = 'common.components.advancedFilter.display.categoryoptions.';
    this.advancedService.getConfig().subscribe(config => {
      //console.log("config.categories "+config.categories);
      this.categories = config.categories.map(cat => {
        const translationKey = categoryEnKey + cat.code;
        const translated = this.ms.translate(translationKey);
        return {
          ...cat,
          name: translated !== translationKey ? translated : cat.name
        };
      });

      if(this.category != "all"){
        this.selectedCategory = this.categories.find(item => item.code === this.category);
        this.filterTemplates();
      } else {
        this.filterFieldOptions();
      }

    });

    this.clearSearch();
  }

  filterTemplates(): void {
    if (this.selectedCategory.code != "all") {
      this.queryTemplates = queryTemplatesFromDb.filter(item => item.category === this.selectedCategory.code);
    }else {
      this.queryTemplates = queryTemplatesFromDb;
    } 
    this.filterFieldOptions();
  }

  filterFieldOptions(): void {
    let fieldGroupEnKey = 'common.components.advancedFilter.display.fieldGroupOptions.';
    let fieldEnKey = 'common.components.advancedFilter.display.fieldOptions.';
    this.advancedService.getFieldOptionsByCategory(this.selectedCategory.code).subscribe(options => {
      this.fieldOptions = options.map(fld => {
        const translationKey = fieldGroupEnKey + fld.code;
        const translated = this.ms.translate(translationKey);
        const groupLabel = translated !== translationKey ? translated : fld.label;
        const translatedItems = fld.items.map(i => {
          const itemTranslationKey = fieldEnKey + i.code;
          const itemTranslated = this.ms.translate(itemTranslationKey);
          const itemName = itemTranslated !== itemTranslationKey ? itemTranslated : i.name;
          return {
            ...i,
            name: itemName
          }
        });

        return {
          ...fld,
          label: groupLabel,
          items: translatedItems
        };
      });
    });
  }

  clearSearch(): void {
    const fieldId = this.generateId();
    const groupId = this.generateId();
    const levelId = this.generateId();

    let fields = [{"fieldId":fieldId+"", "field":{code: "", name:""}, "connecting":{code: "", name:""}, "value":"", "operator":"","orOperator":false}];

    this.groupNumber = 1;
    let groups = [{"group":groupId+"", "group_name":this.ms.translate('common.components.advancedFilter.display.groupName')+" "+this.groupNumber, "file_list": fields, "group_operator":"","orOperator":false}];  
    this.groupNumber++;

    this.levelNumber = 1;
    this.levels = [{"level":"1","levelId":levelId+"","level_name":"","group_list": groups,"level_operator":"AND","orOperator":false}];
  }

  private generateId(): number {
    return Math.floor(Math.random() * 10000) + Date.now();
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
    this.levels = templateSelected.query.levelList;

    const levelNumbersFromName = this.levels.map(lvl => {
      const match = lvl.level_name.match(/(\d+)\s*$/);
      return match ? parseInt(match[1], 10) : 0;
    });
    this.levelNumber = levelNumbersFromName.length > 0
      ? Math.max(...levelNumbersFromName) + 1
      : 1;

    const groupNumbersFromName: number[] = [];
    this.levels.forEach(level => {
      level.group_list.forEach(group => {
        const match = group.group_name.match(/(\d+)\s*$/);
        if (match) {
          groupNumbersFromName.push(parseInt(match[1], 10));
        }
      });
    });
    this.groupNumber = groupNumbersFromName.length > 0
      ? Math.max(...groupNumbersFromName) + 1
      : 1;
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
    let nextNumber = this.generateId();

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
    //queryTemplatesFromDb.push(newTemplate);

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

    let nextNumber = this.generateId();
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
      let selectedLevel = this.levels.at(this.levels.length - 2);
      firstLevelOperator = selectedLevel.orOperator;
      this.levels = this.levels.map(l => ({ ...l, orOperator: firstLevelOperator }));
    }

    let nextNumber = this.generateId();
    let fields = [{"fieldId":nextNumber+"", "field":{code: "", name:""}, "connecting":{code: "", name:""}, "value":"", "operator":"","orOperator":false}];
    
    let groupId = this.generateId();
    let group = {"group":groupId+"", "group_name":this.ms.translate('common.components.advancedFilter.display.groupName')+" "+this.groupNumber, "file_list": fields, "group_operator":"","orOperator":firstLevelOperator};
    this.groupNumber++;

    let levelId = this.generateId();
    let level = {"level":"1","levelId":levelId+"","level_name":"","group_list": [group],"level_operator":"AND","orOperator":firstLevelOperator};

    this.levels.push(level);
  }

  removeGroup(levelId: string, groupId: string ): void {

    let selectedLevel = this.levels.find(item => item.levelId === levelId);

    const levelIndex = selectedLevel.group_list.findIndex(item => item.group === groupId);
    if (levelIndex !== -1) {
      selectedLevel.group_list.splice(levelIndex, 1);
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
    const levelSelected = this.levels.find(item => item.levelId === levelId);

    if (type === "group") {
      const groupSelected = levelSelected.group_list.find(grp => grp.group === groupId);
      groupSelected.selected = isChecked;
      //console.log(groupSelected.group_name+" "+isChecked);
      if(isChecked){
        this.selectedList.groupList = [...this.selectedList.groupList, groupSelected];
      }else{
        this.selectedList.groupList = this.selectedList.groupList.filter(g => g.group !== groupId);
      }
 
    } else if (type === "level") {
      levelSelected.selected = isChecked;
      if(isChecked){
       this.selectedList.levelList = [...this.selectedList.levelList, levelSelected];
      }else{
        this.selectedList.levelList = this.selectedList.levelList.filter(l => l.levelId !== levelId);
      }
    }

    this.selectedList.groups = this.selectedList.groupList.length;
    this.selectedList.levels = this.selectedList.levelList.length;
    this.selectedList.total = this.selectedList.groups + this.selectedList.levels;

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

      // selectedGroups = level.group_list.filter(group => group.selected);
      // const remainingGroups = level.group_list.filter(group => !group.selected);
      // selectedGroups.push(
      //   ...selectedGroups.map(g => ({ ...g, selected: false }))
      // );

      const remainingGroups = level.group_list.filter(group => {
        if (group.selected) {
          selectedGroups.push({ ...group, selected: false });
          return false;
        }
        return true;
      });

      if(firstSelectedIndex === -1 && selectedGroups.length > 0){
          firstSelectedIndex = index;
      }

      return { ...level, group_list: remainingGroups };
    });

    const newLevelId = this.generateId();
    const newLevel = {
      level: "2",
      levelId: newLevelId + "",
      level_name: this.ms.translate('common.components.advancedFilter.display.groupedLevel')+` ${this.levelNumber}`,
      group_list: selectedGroups,
      level_operator: "AND",
      orOperator: false
    };
    this.levelNumber ++;
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
      let newLevelId = this.generateId();
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
      indexToRemove ++;
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
