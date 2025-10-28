import { Component, Input, OnInit } from '@angular/core';

export interface FieldQueries {
  selected?: boolean;
  fieldId: string;
  field: {code: string; name: string;};
  connecting: {code: string; name: string;};
  value: string;
  operator: string;
  orOperator?: boolean;
}

export interface GroupQueries {
  selected?: boolean;
  group: string;
  group_name: string;
  file_list: FieldQueries[];
  group_operator: string;
  orOperator?: boolean;
}

export interface LevelQueries {
  selected?: boolean;
  level: string;
  levelId: string;
  level_name: string;
  group_list: GroupQueries[];
  level_operator: string;
  orOperator?: boolean;
}

export interface AdvancedFilterQuery {
  category: string;
  levelList: LevelQueries[];
}

@Component({
  selector: 'app-advanced-filter-query',
  templateUrl: './advanced-filter-query.component.html',
  standalone: false,
})
export class AdvancedFilterQueryComponent implements OnInit {
  
  @Input() selectedQuery: AdvancedFilterQuery | null = null;
  
  @Input() showQuery: boolean = true;

  ngOnInit(): void {
    if(!this.selectedQuery){
     this.showQuery = false
    }
  }

}
