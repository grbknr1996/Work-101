import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, } from '@angular/router';
import { CaptureDocumentService } from '../../../_services/capture-document.service';
import { SidebarMenuService } from 'src/app/_services/sidebar-menu.service';
import { MechanicsService } from 'src/app/_services/mechanics.service';
import { BookmarkDialogComponent } from 'src/app/components/BookmarkDialog/bookmark-dialog.component';

export interface PageItem {
  type: 'page' | 'bookmark';
  label?: string;
  bookmarkText?: string;
  bookmarkPosition?: 'before' | 'after';
}

@Component({
    selector: 'app-work-monitor',
    standalone: false,
    providers: [
        CaptureDocumentService
    ],
    templateUrl: './indexation-view.component.html',
    //styleUrls: ['./indexation-view.component.css']
})
export class ViewIndexationDocumentComponent implements OnInit {
    @ViewChild('bookmarkPopover') bookmarkPopover: any;
    @ViewChild(BookmarkDialogComponent)
    bookmarkDialog!: BookmarkDialogComponent;

    breadcrumbItems: any[] = [];
    batchId = 'JO-ED6721EE-E988-4C48-BEDF-72110D984232';
    totalPages = 14;
    indexedDocs = 4;
    bookmarkedDocs = 0;
    selectedDocName: string = '';

    selectAllThumbs: boolean = false;
    selectedThumbs: boolean[] = [];
    selectedDocs: number[] = [];

    currentPage: number | null = null;

    activePageUrl: string = '';
    bookmarkPageIndex: number | null = null;
    bookmarkPosition: 'before' | 'after' | null = null;

    documents = [
        { name: 'VC-D-2022-106', pages: 4 },
        { name: 'VC-D-2022-111', pages: 3 },
        { name: 'VC-D-2022-112', pages: 5 },
        { name: 'Document 4', pages: 2 },
    ];

    pages: any[] = []; // start empty, don't pre-fill 4
    pageList: PageItem[] = [];

    selectedDoc = 0;
    selectedView = 'Manual Indexation View';
    viewOptions = [{ label: 'Manual Indexation View', value: 'Manual Indexation View' }];
    selectedDocPages: number = 0;
    showSplitDialog = false;
    splitPoints: number[] = [];
    splitPreview: { start: number; end: number; total: number }[] = [];

    constructor(
        private menuService: SidebarMenuService,
        public ms: MechanicsService,
        private cdr: ChangeDetectorRef,
        private router: Router,
        private route: ActivatedRoute,
        private captureService: CaptureDocumentService
    ) { }

    ngOnInit() {
        setTimeout(() => this.selectDoc(0));
        this.route.params.subscribe((params) => {
            const officeCode =
                params['officeCode'] || this.ms.getCurrentOffice() || 'default';
            const langCode = params['langCode'] || 'en';
            const batchIdParam = params['batchId'];
            if (batchIdParam) {
                this.batchId = batchIdParam;
            }
            this.breadcrumbItems = [
                {
                    label: 'capture-document',
                    routerLink: `/${officeCode}/${langCode}/data-capture/documents`,
                },
                {
                    label: this.batchId,
                    routerLink: `/${officeCode}/${langCode}/data-capture/documents/${this.batchId}`,
                }
            ];
            this.cdr.markForCheck();
        });
    }

    selectDoc(i: number) {
        this.selectedDoc = i;
        const doc = this.documents[i];
        if (!doc) return;

        console.log("Clicked index:", i);
        console.log("Selected doc:", doc);

        // Set selected doc name & page count
        this.selectedDocName = doc.name;
        this.selectedDocPages = doc.pages;

        // Build thumbnail list based on pages
        //this.pageList = Array.from({ length: doc.pages }, (_, idx) => idx + 1);
        this.pageList = Array.from({ length: doc.pages }, (_, idx) => ({
            type: 'page',
            label: `${idx + 1}`
        }));

        console.log("Generated pageList:", this.pageList);

        this.selectedThumbs = Array(doc.pages).fill(false);

        this.selectAllThumbs = false;
        // Setup page viewer
        //this.currentPage = 1;
        //this.totalPages = doc.pages;

        this.updateActivePageUrl();
    }


    selectThumb(pageIndex: number) {
        if (this.pageList[pageIndex]?.type === 'bookmark') {
        return;
    }

    this.currentPage = this.getPageNumber(pageIndex);
    this.updateActivePageUrl();
    }

    updateActivePageUrl() {
        const doc = this.documents[this.selectedDoc!];
        if (!doc) return;

        // mock image preview — replace with actual URL later
        this.activePageUrl = 'assets/images/mock-document.png';
    }


    closeViewer() {
        this.currentPage = null;
        this.activePageUrl = '';
    }
    onThumbChange() {
        this.selectAllThumbs = this.selectedThumbs.every(x => x);
    }
    toggleSelectAll() {
        this.pageList.forEach((_, i) => {
            this.selectedThumbs[i] = this.selectAllThumbs;
        });
    }

    cropSelectedThumb() {
        const index = this.selectedThumbs.findIndex(x => x === true);
        // your crop logic here
        console.log("Crop page index:", index);
    }

    get selectedThumbCount(): number {
        return this.selectedThumbs.filter(t => t).length;
    }

    toggleDocSelection(i: number) {
        const doc = this.documents[i];
        if (!doc) return;
        //this.pageList = Array.from({ length: doc.pages }, (_, idx) => idx + 1);
        this.pageList = Array.from({ length: doc.pages }, (_, idx) => ({
            type: 'page',
            label: `${idx + 1}`
        }));

        const idx = this.selectedDocs.indexOf(i);
        if (idx > -1) {
            this.selectedDocs.splice(idx, 1);
        } else {
            this.selectedDocs.push(i);
        }
    }

    get selectedDocCount(): number {
        return this.selectedDocs.length;
    }
    openSplitDialog() {
        this.showSplitDialog = true;
        this.splitPoints = [];
        this.updateSplitPreview();
    }

    toggleSplitPoint(index: number) {
        if (index === this.pageList.length - 1) return; // cannot mark last page

        const pos = this.splitPoints.indexOf(index);
        pos > -1 ? this.splitPoints.splice(pos, 1) : this.splitPoints.push(index);

        this.splitPoints.sort((a, b) => a - b);
        this.updateSplitPreview();
    }

    updateSplitPreview() {
        const pages = this.pageList.length;
        console.log('Updating split preview with pages:', pages, 'and split points:', pages, this.splitPoints);
        const splitIndexes = [...this.splitPoints, pages - 1];

        let start = 1;
        this.splitPreview = splitIndexes.map(idx => {
            const end = idx + 1;
            const part = { start, end, total: end - start + 1 };
            start = end + 1;
            return part;
        });
    }

    getThumbnailUrl(pageIndex: number): string {
        const doc = this.documents[this.selectedDoc];
        if (!doc) return 'assets/images/mock-document.png';

        // Temporary mock thumbnails for each page
        return `assets/images/mock-document.png`;

        // Later use:
        // return `${this.apiBase}/documents/${doc.name}/pages/${pageIndex + 1}/thumbnail`;
    }

    toggleBookmarkMenu(event: MouseEvent, pageIndex: number) {
        event.stopPropagation();
        this.bookmarkPageIndex = pageIndex;
        this.bookmarkPopover?.toggle(event);
    }

    // insertBookmark(position: 'before' | 'after') {
    //     if (this.bookmarkPageIndex === null) return;
    //     console.log(`Insert Bookmark ${position} for Page ${this.bookmarkPageIndex + 1}`);
    //     // TODO: call your actual bookmark logic here
    //     this.bookmarkPageIndex = null;
    //     this.bookmarkPopover?.hide?.(); // hide the popover after action
    //     this.bookmarkDialog.open({
    //         selectedBookmark: '',
    //         includeText: true
    //     });
    // }
    insertBookmark(event: 'before' | 'after' | { value: string; includeText: boolean }) {
    if (typeof event === 'string') {
        // when clicked "Insert Bookmark Before/After"
        if (this.bookmarkPageIndex === null) return;
        this.bookmarkPosition = event; // save for later
        this.bookmarkPopover?.hide?.();
        this.bookmarkDialog.open();
    } else {
        // event is from dialog generate
        if (this.bookmarkPageIndex === null || !this.bookmarkPosition) return;

        const newBookmark: PageItem = {
        type: 'bookmark',
        bookmarkText: event.value
        };

        const insertIndex =
        this.bookmarkPosition === 'before'
            ? this.bookmarkPageIndex
            : this.bookmarkPageIndex + 1;

        this.pageList.splice(insertIndex, 0, newBookmark);

        // reset
        this.bookmarkPageIndex = null;
        this.bookmarkPosition = null;
        this.bookmarkDialog.close();
    }
    }
    getNextPageNumber(index: number): number {
    const count = this.pageList.slice(0, index + 1).filter(p => p.type === 'page').length;
    return count + 1;
    }
    removeBookmark(index: number) {
        this.pageList.splice(index, 1);
    }
    deleteSelectedThumb() {
        
    }
    getPageNumber(index: number): number {
    return this.pageList.slice(0, index + 1).filter(p => p.type === 'page').length;
    }


}