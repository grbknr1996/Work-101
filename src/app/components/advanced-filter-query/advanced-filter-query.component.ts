import { Component, Input } from '@angular/core';

export interface FieldQueries {
  selected?: boolean;
  fieldId: string;
  field: string;
  field_label: string;
  connecting: string; 
  connecting_key: string;
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
export class AdvancedFilterQueryComponent {
  @Input() selectedQuery: AdvancedFilterQuery | null = null;
  @Input() showQuery: boolean = false;
  //sampleQuery = {"category":"patents","levelList":[{"level":"1","level_name":"","group_list":[{"group":"1","group_name":"Group 1","file_list":[{"field":"goods_service","field_label":"Goods and Service","connecting":"contains the word","connecting_key":"%val%","value":"cola","operator":"AND"},{"field":"nice","field_label":"Nice Classifications","connecting":"equals","connecting_key":"=val","value":"24","operator":""}],"group_operator":""}],"level_operator":"AND"},{"level":"2","level_name":"Level 2 Query","group_list":[{"group":"2","group_name":"Group 2","file_list":[{"field":"office","field_label":"IP Office","connecting":"equals","connecting_key":"=val","value":"VC","operator":"AND"},{"field":"vienna","field_label":"Vienna Classifications","connecting":"contains","connecting_key":"%val%","value":"1.13","operator":""}],"group_operator":"AND"},{"group":"3","group_name":"Group 3","file_list":[{"field":"feature","field_label":"Feaure","connecting":"contains","connecting_key":"%val%","value":"3D","operator":"AND"},{"field":"brand","field_label":"Brand Name","connecting":"contains","connecting_key":"%val%","value":"premium","operator":""}],"group_operator":""}],"level_operator":"OR"},{"level":"1","level_name":"","group_list":[{"group":"4","group_name":"Group 4","file_list":[{"field":"status","field_label":"Status","connecting":"equals","connecting_key":"=val","value":"Registered","operator":""}],"group_operator":""}],"level_operator":""}]};
}
