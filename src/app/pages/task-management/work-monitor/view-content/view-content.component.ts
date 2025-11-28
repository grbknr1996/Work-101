import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TaskManagementService } from 'src/app/_services/taskManagement.service';
import { MechanicsService } from 'src/app/_services/mechanics.service';
import { ActivatedRoute, Router } from '@angular/router';

import { SidebarMenuService } from 'src/app/_services/sidebar-menu.service';


@Component({
    selector: 'app-view-content',
    standalone: false,
    providers: [TaskManagementService],
    templateUrl: './view-content.component.html'
})
export class ViewContentComponent implements OnInit {

    panelTypes = [
        { type: 'File History', icon: 'pi-history', tooltip: 'History' },
        { type: 'Document Viewer', icon: 'pi-eye', tooltip: 'View Document' },
        { type: 'Bibliographic Data', icon: 'pi-book', tooltip: 'Bibliographic Data' },
        { type: 'Action Recorder', icon: 'pi-comment', tooltip: 'Action Record' },
        { type: 'Approval Review', icon: 'pi-check-circle', tooltip: 'Approval Review' },
        { type: 'Expand Panel', icon: 'pi-window-maximize clickable-icon', tooltip: 'Expand Panel' },
    ];

    breadcrumbItems: any[] = [];
    expandedPanelIndex: number | null = null;

    layoutMode: 'four' | 'three-hv' | 'three-v' | 'two' | 'approveAction' = 'four';
    leftSideFirst: boolean = true;

    panelsThreeV = ['File History', 'Bibliographic Data', 'Action Recorder'];
    panelsThreeHv = ['File History', 'Bibliographic Data', 'Action Recorder'];
    panelsFour = ['File History', 'Bibliographic Data', 'Document Viewer', 'Action Recorder'];
    panelsTwo = ['File History', 'Document Viewer'];
    reviewerpanel = ['Action Recorder', 'Bibliographic Data', 'Approval Review'];
    approveActionPanel = ['Approval Review', 'Action Recorder'];


    panelContents: string[] = ['File History', 'Bibliographic Data', 'Document Viewer', 'Action Recorder'];
    documentId: string | null = null;


    constructor(
        public ms: MechanicsService,
        private route: ActivatedRoute,
        private cdr: ChangeDetectorRef,
        private menuService: SidebarMenuService,
        private router: Router
    ) { }


    ngOnInit() {
    const currentPath = this.router.url;
    const menuItems = this.menuService.generateTaskManagementMenu(currentPath);
    this.menuService.updateMenuItems(menuItems);
        this.route.params.subscribe((params) => {
            const officeCode =
            params['officeCode'] || this.ms.getCurrentOffice() || 'default';
            const langCode = params['langCode'] || 'en';
            this.documentId = params['documentId'];
            if(this.documentId) {
                console.log(`As of now mock data is only defined for ${this.documentId} document`);
            }
      this.breadcrumbItems = [
        {
          label: 'Work Monitor',
          routerLink: `/${officeCode}/${langCode}/task-management/work-monitor`,
        },
        {
          label: 'Tasks Assignment',
          routerLink: `/${officeCode}/${langCode}/task-management/work-monitor/task-assignment`,
        },
        {
          label: 'View Content: ' + this.documentId,
          routerLink: `/${officeCode}/${langCode}/task-management/work-monitor/task-assignment/view-content/${this.documentId}`,
        },
      ];
            this.cdr.markForCheck();
        });
    }

    changeLayout(mode: 'four' | 'three-hv' | 'three-v' | 'two' | 'approveAction') {
        this.expandedPanelIndex = null;
        console.log("the selected mode:", mode)
        this.layoutMode = mode;
        if (mode === 'three-v') {
            this.panelContents = [...this.panelsThreeV];
        } else if (mode === 'three-hv') {
            this.panelContents = [...this.panelsThreeHv];
        } else if (mode === 'four') {
            this.panelContents = [...this.panelsFour];
        } else if (mode === 'two') {
            this.panelContents = [...this.panelsTwo];
        } else if (mode === 'approveAction') {
            this.panelContents = [...this.approveActionPanel];
        }
        this.cdr.detectChanges();
    }

    switchSides() {
        if (this.panelContents.length === 2) {
            this.panelContents.reverse();
        } else if (this.panelContents.length > 2) {
            this.panelContents.push(this.panelContents.shift()!);
        }
    }

    switchPanelContent(panelIndex: number, newContent: string) {
          if (newContent === 'Approval Review' && this.layoutMode === 'four') {
            this.layoutMode = 'three-hv';
            this.panelContents = [...this.reviewerpanel];
            this.cdr.detectChanges();
            return;
        }
        const targetIndex = this.expandedPanelIndex !== null ? this.expandedPanelIndex : panelIndex;
        if (this.panelContents[targetIndex] === newContent) return;

        const existingIndex = this.panelContents.findIndex(
            (p, idx) => p === newContent && idx !== targetIndex
        );

        if (existingIndex !== -1) {
            [this.panelContents[targetIndex], this.panelContents[existingIndex]] =
                [this.panelContents[existingIndex], this.panelContents[targetIndex]];
        } else {
            this.panelContents[targetIndex] = newContent;
        }

        this.cdr.detectChanges();
    }


    expandPanel(index: number) {
        this.expandedPanelIndex = index;
    }
    closeExpandedPanel() {
        this.expandedPanelIndex = null;
    }

    toggleExpandPanel(index: number) {
        if (this.expandedPanelIndex === index) {
            this.expandedPanelIndex = null;
        } else {
            this.expandedPanelIndex = index;
        }
    }

}