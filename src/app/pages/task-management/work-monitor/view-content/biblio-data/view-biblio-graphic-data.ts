import { Component, OnInit } from '@angular/core';
import { ActivatedRoute} from '@angular/router';
import {
  TaskManagementService,
  MOCK_BIBLIOGRAPHIC_DATA,
} from 'src/app/_services/taskManagement.service';
import { BibliographicData } from 'src/app/schemas/taskManageMent-schema';

@Component({
  selector: 'app-biblio-data',
  standalone: false,
  providers: [TaskManagementService],
  templateUrl: './view-biblio-graphic-data.html',
})
export class ViewBiblioGraphicData implements OnInit {
  officeCode = 'default';
  langCode = 'en';
  taskId!: string;
  breadcrumbItems = [];

  data: BibliographicData;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    console.log('BiblioGraphic data called');
    this.data = MOCK_BIBLIOGRAPHIC_DATA;
    this.officeCode =
      this.route.snapshot.paramMap.get('officeCode') || 'default';
    this.langCode = this.route.snapshot.paramMap.get('langCode') || 'en';
    this.taskId = this.route.snapshot.paramMap.get('taskId') || '';
  }
}
