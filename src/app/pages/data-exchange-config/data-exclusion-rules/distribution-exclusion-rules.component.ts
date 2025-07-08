import { Component, computed, Input, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  TableComponent,
  ColumnDefinition,
  Action,
} from '../../../components/table/table.component';
import { AddExclusionRuleComponent } from '../add-exclusion-rule/add-exclusion-rule.component';

@Component({
  selector: 'app-distribution-exclusion-rules',
  templateUrl: './distribution-exclusion-rules.component.html',

  standalone: true,
  imports: [CommonModule, TableComponent, AddExclusionRuleComponent],
})
export class DistributionExclusionRulesComponent {
  showAddRuleForm = false;

  columns: ColumnDefinition[] = [
    {
      field: 'originatingOffice',
      header: 'Originating Office',
      display: 'text',
    },
    { field: 'recipientName', header: 'Recipient Name', display: 'text' },
    {
      field: 'ipCategoryTypes',
      header: 'IP Category Types',
      display: 'custom',
    },
    {
      field: 'applicationStatus',
      header: 'Application Status',
      display: 'custom',
    },
    {
      field: 'excludedEventCodes',
      header: 'Excluded Event Codes',
      display: 'custom',
    },
    {
      field: 'excludedDocuments',
      header: 'Excluded Documents',
      display: 'custom',
    },
    {
      field: 'actions',
      header: 'Actions',
      display: 'actions',
      actions: [
        {
          label: 'Delete',
          icon: 'pi pi-trash',
          action: 'delete',
          severity: 'danger',
        },
      ],
      showAsDropdown: false,
    },
  ];

  @Input({ alias: 'data', required: true }) data!: WritableSignal<any>;

  distributionExclusionRulesData = computed(() => this.data().distributionExclusionRulesData);

  addRule() {
    this.showAddRuleForm = true;
  }

  onFormSubmitted = () => {
    this.showAddRuleForm = false; // close form on submit
  }

  onActionClick(event: { action: string; item: any }) {
    if (event.action === 'delete') {
      this.data.update(current => ({
        ...current,
        distributionExclusionRulesData: current.distributionExclusionRulesData.filter(
          row => row !== event.item
        )
      }));
    }
  }
}
