import { ChangeDetectorRef, Component, ElementRef, OnInit, viewChild, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, } from '@angular/router';
import { CaptureDocumentService } from '../../../_services/capture-document.service';
import { SidebarMenuService } from 'src/app/_services/sidebar-menu.service';
import { MechanicsService } from 'src/app/_services/mechanics.service';
import { BookmarkDialogComponent } from 'src/app/components/BookmarkDialog/bookmark-dialog.component';
import { CropDialogComponent } from 'src/app/components/crop-dialog/crop-dialog.component';

export interface PageItem {
    type: 'page' | 'bookmark';
    label?: string;
    bookmarkText?: string;
    bookmarkPosition?: 'before' | 'after';
}

@Component({
    selector: 'app-indexation-view',
    standalone: false,
    providers: [
        CaptureDocumentService
    ],
    templateUrl: './indexation-view.component.html'
})
export class ViewIndexationDocumentComponent implements OnInit {
    @ViewChild('bookmarkPopover') bookmarkPopover: any;
    @ViewChild(BookmarkDialogComponent)
    bookmarkDialog!: BookmarkDialogComponent;
    @ViewChild(CropDialogComponent)
    cropDialog!: CropDialogComponent;

    breadcrumbItems: any[] = [];
    batchId = 'JO-ED6721EE-E988-4C48-BEDF-72110D984232';
    totalPages = 14;
    indexedDocs = 4;
    bookmarkedDocs = 0;
    selectedDocName: string = '';

    selectedThumbs: boolean[] = [];
    selectedDocs: number[] = [];
    splitMode = false;
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
    showDeleteDialog = false;
    deleteType: 'page' | 'document' = 'page';
    showCropDialog = false;
    selectedImageUrl: string = '';

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

    cropSelectedThumb() {
        const index = this.selectedThumbs.findIndex(x => x === true);
        if (index !== -1) {
            console.log("Crop page index:", index);
            //this.selectedImageUrl = this.getThumbnailUrl(index);
            this.selectedImageUrl = 'assets/images/mock-document.png';
            this.cropDialog.open(this.selectedImageUrl);
        }
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

    getPageNumber(index: number): number {
        return this.pageList.slice(0, index + 1).filter(p => p.type === 'page').length;
    }
    onSplitClick(event: MouseEvent, index: number) {
        event.stopPropagation();
        event.preventDefault();
        console.log('Split clicked at index', index);
        this.toggleSplitPoints(index);
    }

    toggleSplitPoints(index: number) {
        const i = this.splitPoints.indexOf(index);
        if (i >= 0) this.splitPoints.splice(i, 1);
        else this.splitPoints.push(index);
        console.log('Split points:', this.splitPoints);
    }

    getDividerPosition(index: number): string {
        const perThumb = 100 / 4;
        const positionInRow = (index % 4) + 1;
        const position = perThumb * positionInRow;
        return `calc(${position}% - 18px)`;
    }

    applySplit() {
        const documentIndex = this.selectedDocs[0];
        const splitIndexes = this.splitPoints
        console.log("indexs for split", documentIndex, splitIndexes)
        const doc = this.documents[documentIndex];
        const totalPages = doc.pages;
        const docName = doc.name;

        // Sort and sanitize split positions
        const sortedSplits = [...new Set(splitIndexes)].sort((a, b) => a - b);

        // Compute page ranges
        const parts: { start: number; end: number }[] = [];
        let start = 1;
        for (const split of sortedSplits) {
            const end = split === 0 ? 1 : split + 1;
            parts.push({ start, end });
            start = end + 1;
        }
        parts.push({ start, end: totalPages }); // last segment

        // Create new documents
        const newDocs = parts.map((p, i) => ({
            name: `${docName}-part${i + 1}`,
            pages: p.end - p.start + 1
        }));

        // Replace old doc with new ones in UI
        this.documents.splice(documentIndex, 1, ...newDocs);

        // Reset selections
        this.selectedDocs = [];
        this.selectedThumbs = [];
        this.splitMode = false;
        this.showSplitDialog = false;
        this.selectDoc(documentIndex);
    }


    cancelSplitMode() {
        this.splitPoints = [];
        this.showSplitDialog = false;
    }

    confirmDeletePage() {
        this.showDeleteDialog = false;
        this.pageList = this.pageList.filter((_, i) => !this.selectedThumbs[i]);
        this.selectedThumbs = [];
    }
    deleteSelectedThumb() {
        if (this.selectedThumbCount > 0) {
            this.deleteType = 'page';
            this.showDeleteDialog = true;
        }
    }
    confirmDeleteDocument() {
        if (this.selectedDocCount > 0) {
            this.deleteType = 'document';
            this.showDeleteDialog = true;
        }
    }
    proceedDelete() {
        if (this.deleteType === 'page') {
            this.confirmDeletePage();
        } else if (this.deleteType === 'document') {
            this.documents = this.documents.filter((_, i) => !this.selectedDocs.includes(i));
            this.selectedDocs = [];
        }
        this.showDeleteDialog = false;
    }

    mergeSelectedDocuments() {
        if (this.selectedDocs.length < 2) return;

        const selected = this.selectedDocs.map(i => this.documents[i]);
        const totalPages = selected.reduce((sum, doc) => sum + doc.pages, 0);

        const mergedName = selected.map(d => d.name).join('-') + '-merged';
        const mergedDoc = { name: mergedName, pages: totalPages };
        this.updateMergedDocsUI(mergedDoc);
        /* placeholder for backend call
        const mergePayload = {
            documentIds: this.selectedDocs.map(i => this.documents[i].name),
            mergedDocumentName: mergedName,
            totalPages
          };
          const response = await this.captureService.mergeDocuments(mergePayload);
          const mergedDoc = response.data; */
    }

    private updateMergedDocsUI(mergedDoc: any) {
        this.documents = this.documents.filter((_, i) => !this.selectedDocs.includes(i));
        this.documents.push(mergedDoc);
        this.selectedDocs = [];
        this.selectDoc(this.documents.length - 1);
        this.selectedThumbs = [];
        console.log('Merged docs into:', mergedDoc);
    }

    SaveBatch() {

    }
    cancelIndexation() {
        this.router.navigate(['../'], { relativeTo: this.route });
    }

    insertNewPageBetween(index: number) {
        console.log('Insert page after', index);
        // Your logic to insert new page/bookmark
    }

    enableEditing(doc: any) {
        doc.isEditing = true;
        setTimeout(() => {
            const input = document.querySelector('input.p-inputtext') as HTMLInputElement;
            input?.focus();
        });
    }

    disableEditing(doc: any) {
        doc.isEditing = false;
        // optional: trigger save logic here
    }
}