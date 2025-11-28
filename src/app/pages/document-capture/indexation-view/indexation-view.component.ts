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
        { documentNumber: 1, name: '', pages: 4},
        { documentNumber: 2, name: '', pages: 3},
        { documentNumber: 3, name: '', pages: 5},
        { documentNumber: 4, name: '', pages: 10},
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
    docIdExamples = [
        'VC-T-2022-201',
        'VC-T-2022-102',
        'VC-T-2022-201',
        'VC-T-2022-202',
        'VC-T-2022-203',
        'VC-T-2022-204',
        'VC-P-2022-210',
        'VC-P-2022-211',
        'VC-D-2022-111',
        'VC-D-2022-112',
        'VC-D-2022-113',
        'VC-D-2022-114',
        'VC-D-2022-115',
        'VC-D-2022-116',
    ];
    filteredDocIds: string[] = [];
    selectedThumbIndex: number | null = null;
    croppedImages: Map<string, string> = new Map();
    showMergeDialog = false;
    mergeDocIds: string[] = [];
    selectedMergeId: string = '';
    zoomLevel: number = 1;       // Default zoom
    zoomStep: number = 0.1;      // Increment step
    maxZoom: number = 3;         // Optional limit
    minZoom: number = 0.5;       // Optional limit
    completedDocuments: Set<number> = new Set();
    showAllDocuments: boolean = false;


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

        const currentPath = this.router.url;
        const menuItems = this.menuService.generateDataCaptureMenu(currentPath);
        this.menuService.updateMenuItems(menuItems);
        
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
        this.currentPage = 1;
        if (this.currentPage === 1) {
            this.zoomLevel = 3;
        }
        //this.totalPages = doc.pages;

        this.updateActivePageUrl();
    }


    selectThumb(pageIndex: number) {
        if (this.pageList[pageIndex]?.type === 'bookmark') {
            return;
        }

        this.currentPage = this.getPageNumber(pageIndex);
        this.selectedThumbIndex = pageIndex;
        this.activePageUrl = 'assets/images/mock-document.png';
        console.log("Selected thumb index:", pageIndex, "Page number:", this.selectedThumbIndex);
        this.zoomLevel = 1;
        //this.updateActivePageUrl();
    }

    updateActivePageUrl() {
        const doc = this.documents[this.selectedDoc!];
        if (!doc) return;
        const pageKeyIndex = `${this.selectedDoc}-${this.currentPage}`;
        const pageKeyName = `${doc.name}-${this.currentPage}`;
        // Try index-based key, then name-based per-page key, then document-level key, then fallback
        const croppedImageForPage =
            this.croppedImages.get(pageKeyIndex) ||
            this.croppedImages.get(pageKeyName) ||
            this.croppedImages.get(doc.name);
        if (croppedImageForPage) {
            console.log('Loading cropped image for specific page:', pageKeyIndex);
            this.activePageUrl = croppedImageForPage;
        } else {
            console.log('Loading original image for page:', pageKeyIndex);
            this.activePageUrl = 'assets/images/mock-document.png';
        }
    }


    closeViewer() {
        this.currentPage = null;
        this.activePageUrl = '';
    }

    cropSelectedThumb() {
        const index = this.selectedThumbs.findIndex(x => x === true);
        console.log('Cropping page at index:', index, 'Page number:', this.currentPage);
        if (index !== -1) {
            console.log("Crop page index:", index);
            this.selectedThumbIndex = index;
            this.cropDialog.documentIndex = this.selectedDoc;
            //this.selectedImageUrl = this.getThumbnailUrl(index);
            this.selectedImageUrl = 'assets/images/mock-document.png';
            this.cropDialog.open(this.selectedImageUrl);
        }
    }

    onNumberExtracted(event: { index: number; number: string }) {
        const { index, number } = event;
        console.log('Number extracted for document index:', index, 'Number:', number);

        // Auto-fill the document name
        if (this.documents[index]) {
            this.documents[index].name = number;
            // Mark as complete
            this.markDocumentComplete(index);
            console.log('Document auto-filled with number:', number);
            this.cdr.markForCheck();
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

        return `assets/images/mock-document.png`;
    }

    toggleBookmarkMenu(event: MouseEvent, pageIndex: number) {
        event.stopPropagation();
        this.bookmarkPageIndex = pageIndex;
        this.bookmarkPopover?.toggle(event);
    }

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
        //this.documents.splice(documentIndex, 1, ...newDocs);

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
    deleteSelectedThumb(event: any) {
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

        const selectedDocuments = this.selectedDocs
            .map(index => this.documents[index])
            .filter(doc => doc !== undefined);

        this.mergeDocIds = selectedDocuments
            .map(doc => doc.name || '')
            .filter(id => id.trim() !== '');
        console.log('Selected documents:', selectedDocuments);
        console.log('Document IDs for merge:', this.mergeDocIds);

        if (this.mergeDocIds.length === 1) {
            this.performMerge(this.mergeDocIds[0]);
        }

        if (this.mergeDocIds.length > 1) {
            this.selectedMergeId = this.mergeDocIds[0];
            this.showMergeDialog = true;
        }

        if (!this.selectedMergeId || this.selectedMergeId.trim() === '') {
            this.selectedMergeId = '';
            this.performMerge();
        }
    }

    confirmMerge() {
        if (this.selectedMergeId) {
            this.performMerge(this.selectedMergeId);
            this.showMergeDialog = false;
            this.selectedMergeId = '';
        }
    }

    cancelMerge() {
        this.showMergeDialog = false;
        this.selectedMergeId = '';
        this.mergeDocIds = [];
    }

    private performMerge(selectedDocId?: string) {
        const sortedIndices = [...this.selectedDocs].sort((a, b) => b - a);
        if (sortedIndices.length < 1) return;

        const selectedDocuments = sortedIndices.map(index => this.documents[index]).filter(Boolean);
        const candidateIds = selectedDocuments
            .map(d => (d.name || '').trim())
            .filter(id => id && id.length > 0);

        const uniqueIds = Array.from(new Set(candidateIds));
        if (uniqueIds.length === 1) {
            selectedDocId = uniqueIds[0];
        }
        if (uniqueIds.length > 1 && !selectedDocId) {
            this.mergeDocIds = uniqueIds;
            this.selectedMergeId = uniqueIds[0] || '';
            this.cdr.markForCheck();
            console.log('Multiple candidate IDs found, asking user to select:', uniqueIds);
            return;
        }

        console.log('Performing merge with selected merged ID:', selectedDocId);

        let totalPages = 0;
        selectedDocuments.forEach(doc => {
            totalPages += Number(doc.pages || 0);
        });

        const mergedDoc: any = {
            name: selectedDocId,
            pages: totalPages,
            documentNumber: this.documents.length + 1
        };

        sortedIndices.forEach(idx => {
            this.documents.splice(idx, 1);
        });

        this.documents.push(mergedDoc);

        this.selectedDocs = [];
        this.selectedThumbs = [];
        this.currentPage = null;
        this.activePageUrl = '';

        const newIndex = this.documents.length - 1;
        this.selectDoc(newIndex);

        this.showMergeDialog = false;
        this.selectedMergeId = '';

        this.cdr.markForCheck();
        console.log('Merged document created and selected:', mergedDoc);
        return;
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
        const docIndex = this.documents.indexOf(doc);
        if (docIndex !== -1 && doc.name && doc.name.trim() !== '') {
            this.markDocumentComplete(docIndex);
        }
    }

    searchDocIds(event: any) {
        const query = (event.query || '').toUpperCase();

        // Only allow suggestions if prefix matches
        const allowedPrefixes = 'VC';
        const isAllowed = query.startsWith(allowedPrefixes);

        if (!isAllowed) {
            this.filteredDocIds = [];
            return;
        }

        this.filteredDocIds = this.docIdExamples.filter(
            id => id.toUpperCase().startsWith(query)
        );
    }

    confirmMergedName(doc: any) {
        console.log("Final merged name:", doc.name);
        // optional: send to backend
    }

    onThumbChange() {
        this.cdr.markForCheck();
    }
    onImageSaved(croppedImageBase64: string) {
        if (this.selectedThumbIndex !== null) {
            const pageNumber = this.getPageNumber(this.selectedThumbIndex);
            const pageKey = `${this.selectedDoc}-${pageNumber}`;
            const docName = this.documents[this.selectedDoc]?.name;
            const pageKeyByName = docName ? `${docName}-${pageNumber}` : null;


            // Store cropped image
            if (pageKeyByName) {
                this.croppedImages.set(pageKeyByName, croppedImageBase64);
            }
            this.croppedImages.set(pageKey, croppedImageBase64);
            if (pageKeyByName) {
                this.croppedImages.set(pageKeyByName, croppedImageBase64);
                this.croppedImages.set(docName!, croppedImageBase64);
            }
            console.log('Stored cropped image for page:', pageKey);

            // Update the viewer if this page is currently selected
            if (this.currentPage === pageNumber) {
                this.activePageUrl = croppedImageBase64;
                console.log('Updated viewer with cropped image');
            }

            // If you have a pages array with image data:
            if (!this.pages[this.selectedThumbIndex]) {
                this.pages[this.selectedThumbIndex] = {};
            }
            this.pages[this.selectedThumbIndex].croppedImage = croppedImageBase64;
            this.selectedThumbs[this.selectedThumbIndex] = false;

            this.cdr.markForCheck();
        }
    }

    viewCroppedImage(doc: any, docIndex: number) {
        this.activePageUrl = '';
        const pageNumber = 1;
        this.selectedDoc = docIndex;
        this.selectedDocName = doc.name;

        // Support both index-based keys (e.g. "0-3") and name-based keys (e.g. "VC-T-2022-209-3")
        const pageKeyIndex = `${docIndex}-${pageNumber}`;
        const pageKeyName = `${doc.name}-${pageNumber}`;

        console.log('Viewing cropped image for document:', doc.name, 'page:', pageNumber, 'keys:', pageKeyIndex, pageKeyName, this.croppedImages);

        const croppedImage =
            this.croppedImages.get(pageKeyIndex) ||
            this.croppedImages.get(pageKeyName) ||
            this.croppedImages.get(doc.name);
        console.log('Cropped image found:', !!croppedImage, this.activePageUrl);

        this.activePageUrl = croppedImage || 'assets/images/mock.png';
        this.currentPage = pageNumber;
    }
    deleteCroppedImage(doc: any, docIndex: number) {
        const pageNumber = 1;

        // Support both index-based keys (e.g. "0-3") and name-based keys (e.g. "VC-T-2022-209-3")
        const pageKeyIndex = `${docIndex}-${pageNumber}`;
        const pageKeyName = `${doc.name}-${pageNumber}`;

        console.log('Deleting cropped image for document:', doc.name, 'page:', pageNumber, 'keys:', pageKeyIndex, pageKeyName, this.croppedImages);

        this.croppedImages.delete(pageKeyIndex);
        this.croppedImages.delete(pageKeyName);
        this.croppedImages.delete(doc.name);

        // If the deleted image is currently displayed, revert to original
        if (this.currentPage === pageNumber && this.selectedDoc === docIndex) {
            this.activePageUrl = 'assets/images/mock-document.png';
            console.log('Reverted viewer to original image');
        }

        // Also remove from pages array if exists
        if (this.pages[docIndex]?.croppedImage) {
            delete this.pages[docIndex].croppedImage;
        }

        this.cdr.markForCheck();
    }

    zoomIn() {
        console.log('Zoom In clicked. Current zoom level:', this.zoomLevel);
        this.zoomLevel += 0.2;
    }

    zoomOut() {
        if (this.zoomLevel > 0.3) this.zoomLevel -= 0.2;
    }

    resetZoom() {
        this.zoomLevel = 1;
    }

    onWheelZoom(event: WheelEvent) {
        event.preventDefault();
        if (event.deltaY < 0) this.zoomIn();
        else this.zoomOut();
    }

    get visibleDocuments() {
        if (this.showAllDocuments) return this.documents;

        return this.documents.filter((_, index) => !this.completedDocuments.has(index));
    }


    markDocumentComplete(index: number) {
        this.completedDocuments.add(index);
        console.log('Document marked as complete:', index, this.documents[index].name);
        this.cdr.markForCheck();
    }

    toggleShowAllDocuments() {
        this.showAllDocuments = !this.showAllDocuments;
        this.cdr.markForCheck();
    }
    onDocNameSelected(index: number, event: any) {
        const selectedName = event?.value ?? '';
        this.documents[index].name = selectedName;

        // Mark this index as completed so it hides
        this.completedDocuments.add(index);
    }

    attachLogo(doc: any) {
        // Open file picker
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';

        fileInput.onchange = (event: any) => {
            const file = event.target.files[0];
            if (!file) return;

            // Store file blob or process it
            doc.logoFile = file;

            console.log('Selected logo:', file);
        };

        fileInput.click();
    }
    isTrademark(docName: string): boolean {
        return docName?.includes('-T-');
    }
    get hiddenDocumentsCount(): number {
        if (this.showAllDocuments) return 0;
        return this.completedDocuments.size;
    }
}