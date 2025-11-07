import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, } from '@angular/router';
import { ConfigurableFilterComponent, FilterConfig, FilterValue } from 'src/app/components/configurable-filter/configurable-filter.component';
import { SidebarMenuService } from 'src/app/_services/sidebar-menu.service';
import { MechanicsService } from 'src/app/_services/mechanics.service';
import { BatchItem, CaptureDocumentService } from 'src/app/_services/capture-document.service';


interface UploadEvent {
  originalEvent: Event;
  files: File[];
}

@Component({
  selector: 'app-work-monitor',
  standalone: false,
  providers: [
    CaptureDocumentService
  ],
  templateUrl: './document-capture.component.html'
})
export class DocumentCaptureComponent implements OnInit {
  @ViewChild(ConfigurableFilterComponent)
  configurableFilter!: ConfigurableFilterComponent;
  @ViewChild('fileUploadSection') fileUploadSection!: ElementRef;

  breadcrumbItems = [];
  packageStats = [];
  statSelected;
  indexationStats = [];
  searchBar: string;
  tableData: any[] = [];
  // Pagination properties
  currentPage = 0;
  pageSize = 10;
  totalRecords = 0;
  originalBatchTableData: BatchItem[] = [];


  filterConfigs: FilterConfig[] = [];
  appliedFilters: FilterValue[] = [];
  allFilters: FilterValue[] = [];
  tableColumns = [];
  batchTableData = [];
  separatorDialogVisible: boolean = false;
  bookmarkDialogVisible: boolean = false;
  selectedBookmark: string | null = null;
  includeBookmarkText = false;
  qrCodeImage: string | null = null;
  qrValue: string = '';
  qrImageUrl: string = '';
  selectedFiles: File[] = [];
  uploadedFiles: any[] = [];
  setUpSteps: string;
  bookmarkOptions: { label: string; value: string }[] = [];
  bookmarkDialogInfo: string = '';


  constructor(
    private menuService: SidebarMenuService,
    public ms: MechanicsService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
    private CaptureDocumentService: CaptureDocumentService
  ) {
    this.initializeConfigurations();
  }

  private initializeConfigurations(): void {
    this.setUpSteps = this.ms.translate('documentCapture.bookmark.setupSteps');

    this.bookmarkOptions = [
      { label: this.ms.translate('documentCapture.bookmarkOptions.claims'), value: 'Claims' },
      { label: this.ms.translate('documentCapture.bookmarkOptions.coverLetter'), value: 'Cover Letter' },
      { label: this.ms.translate('documentCapture.bookmarkOptions.declarationOfUse'), value: 'Declaration of Use' },
      { label: this.ms.translate('documentCapture.bookmarkOptions.description'), value: 'Description' },
      { label: this.ms.translate('documentCapture.bookmarkOptions.drawings'), value: 'Drawings' },
      { label: this.ms.translate('documentCapture.bookmarkOptions.idCard'), value: 'ID Card' },
      { label: this.ms.translate('documentCapture.bookmarkOptions.individualPassport'), value: 'Individual passport' },
      { label: this.ms.translate('documentCapture.bookmarkOptions.other'), value: 'Other' },
      { label: this.ms.translate('documentCapture.bookmarkOptions.passportIdCard'), value: 'Passport / Id Card' },
      { label: this.ms.translate('documentCapture.bookmarkOptions.paymentReceipt'), value: 'Payment Receipt' },
      { label: this.ms.translate('documentCapture.bookmarkOptions.powerOfAttorney'), value: 'Power of Attorney' },
      { label: this.ms.translate('documentCapture.bookmarkOptions.priorityDocument'), value: 'Priority Document' },
      { label: this.ms.translate('documentCapture.bookmarkOptions.publicResearchInstitute'), value: 'Public Research Institute' },
      { label: this.ms.translate('documentCapture.bookmarkOptions.smeCertificate'), value: 'SME Certificate' }
    ];

    this.bookmarkDialogInfo = this.ms.translate('documentCapture.bookmark.previewHeader') || '';
    this.filterConfigs = [
      {
        key: 'admin',
        label: this.ms.translate('documentCapture.filters.lockedBy') + ' - Admin',
        type: 'checkbox',
        section: this.ms.translate('documentCapture.filters.dateFiltersSection') || 'FILTERS'
      },
      {
        key: 'user',
        label: this.ms.translate('documentCapture.filters.lockedBy') + ' - User',
        type: 'checkbox',
        section: this.ms.translate('documentCapture.filters.dateFiltersSection') || 'FILTERS'
      }
    ];

    // table columns - headers come from translations
    this.tableColumns = [
      { field: 'batchId', header: this.ms.translate('documentCapture.table.batchId'), sortable: false, display: 'url' },
      { field: 'capturedOn', header: this.ms.translate('documentCapture.table.capturedOn'), sortable: false, display: 'text' },
      { field: 'modifiedOn', header: this.ms.translate('documentCapture.table.modifiedOn'), sortable: false, display: 'text' },
      { field: 'lockedBy', header: this.ms.translate('documentCapture.table.lockedBy'), sortable: false, display: 'chip' },
      { field: 'noOfDocs', header: this.ms.translate('documentCapture.table.noOfDocs'), sortable: false, display: 'text' },
      { field: 'noOfPages', header: this.ms.translate('documentCapture.table.noOfPages'), sortable: false, display: 'text' },
      { field: 'status', header: this.ms.translate('documentCapture.table.status'), sortable: false, display: 'text' },
      {
        field: 'action', header: this.ms.translate('documentCapture.table.action'), sortable: false, display: 'actions',
        actions: [
          {
            label: this.ms.translate('documentCapture.table.indexationView'),
            icon: 'pi pi-eye',
            action: 'view',
            severity: 'info',
          },
          {
            label: this.ms.translate('documentCapture.table.download'),
            icon: 'pi pi-download',
            action: 'download',
            severity: 'info',
          },
          {
            label: this.ms.translate('documentCapture.table.delete'),
            icon: 'pi pi-trash',
            action: 'delete',
            severity: 'info',
          }
        ]
      },
    ];
  }
  ngOnInit() {

    this.CaptureDocumentService.getBatches().then(batches => {
      this.batchTableData = batches || [];
      this.originalBatchTableData = (batches || []).slice();
      this.totalRecords = this.batchTableData.length;
      this.cdr.markForCheck();
    });

    this.CaptureDocumentService.getIndexationStats().then(stats => {
      this.indexationStats = stats || [];
      this.cdr.markForCheck();
    });

    // initialize allFilters so chip list and syncing works
    this.allFilters = this.filterConfigs.map(f => ({
      key: f.key,
      value: f.type === 'checkbox' ? false : null,
      type: f.type
    }));
    this.syncAppliedFilters();

    this.route.params.subscribe((params) => {
      const officeCode =
        params['officeCode'] || this.ms.getCurrentOffice() || 'default';
      const langCode = params['langCode'] || 'en';

      this.breadcrumbItems = [
        {
          label: this.ms.translate('documentCapture.breadcrumb'),
          routerLink: `/${officeCode}/${langCode}/document-capture`,
        }
      ];
      this.cdr.markForCheck();
    });
  }

  applyFilters(filters: FilterValue[]): void {
    let filtered = this.originalBatchTableData.slice();

    // locked by - checkbox keys 'admin' and 'user'
    const activeLockedBy = (filters || [])
      .filter(f => f.type === 'checkbox' && f.value === true)
      .map(f => f.key.toLowerCase());

    if (activeLockedBy.length > 0) {
      filtered = filtered.filter(item => {
        const locked = (item.lockedBy || '').toString().toLowerCase();
        return activeLockedBy.includes(locked);
      });
    }

    // captured date range filter
    const dateFilter = (filters || []).find(f => f.key === 'capturedDateRange' && f.value);
    if (dateFilter && Array.isArray(dateFilter.value) && dateFilter.value.length === 2) {
      const [from, to] = dateFilter.value;
      const fromDate = from ? new Date(from) : null;
      const toDate = to ? new Date(to) : null;
      if (fromDate || toDate) {
        filtered = filtered.filter(item => {
          const dt = item.capturedOn ? new Date(item.capturedOn) : null;
          if (!dt || isNaN(dt.getTime())) return false;
          if (fromDate && dt < fromDate) return false;
          if (toDate && dt > new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate(), 23, 59, 59)) return false;
          return true;
        });
      }
    }

    // search by batchId
    const term = (this.searchBar || '').trim().toLowerCase();
    if (term) {
      filtered = filtered.filter(item => (item.batchId || '').toString().toLowerCase().includes(term));
    }

    this.batchTableData = filtered;
    this.totalRecords = filtered.length;
    this.cdr.detectChanges();
  }

  onStatSelect(statLabel: string) {
    console.log('Stats Selected:', statLabel);
    this.statSelected = statLabel;
    //this.applyFilters();
  }

  onFilterCleared(): void {
    console.log('Filters cleared');
    this.appliedFilters = [];
    this.batchTableData = this.originalBatchTableData.slice();
    this.totalRecords = this.batchTableData.length;
    this.cdr.detectChanges();
  }

  onFilterChange(filters: FilterValue[]): void {
    console.log('Filter changed:', filters);
    // Don't apply filters or show red dot on change - only track changes
  }

  onFilterApplied(filters: FilterValue[]): void {
    console.log('Filters applied:', filters);
    this.appliedFilters = filters || [];
    this.applyFilters(this.appliedFilters);
    this.cdr.detectChanges();
  }

  syncAppliedFilters() {
    this.appliedFilters = this.allFilters.filter(f => f.value === true);
    this.applyFilters(this.appliedFilters);
  }

  onAppliedFiltersChange(filters: FilterValue[]): void {
    this.appliedFilters = filters || [];
    this.applyFilters(this.appliedFilters);
    this.cdr.detectChanges();
  }

  removeFilterChip(filterKey: string) {
    const filterConfig = this.filterConfigs.find((f) => f.key === filterKey);
    if (filterConfig) {
      this.appliedFilters = this.appliedFilters.filter((f) => f.key !== filterKey);
      if (this.configurableFilter && typeof this.configurableFilter.removeFilterChip === 'function') {
        this.configurableFilter.removeFilterChip(filterKey);
      }
      this.cdr.detectChanges();
    }
  }


  clearAllFilters(): void {
    this.appliedFilters = [];
    this.searchBar = '';
    this.allFilters = this.allFilters.map(f => ({ ...f, value: false }));
    this.syncAppliedFilters();
    this.configurableFilter.clearAllFilters();
    this.batchTableData = this.originalBatchTableData.slice();
    this.cdr.detectChanges();
    this.totalRecords = this.batchTableData.length;
  }

  // small helper used by getFilterDisplayValue
  private formatDateForDisplay(date: Date | string) {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (!d || isNaN(d.getTime())) return '';
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  }

  onActionClick(action: string, item: any) {
    console.log("action: ", action, " item: ", item);
    if (action === 'view' && item && item.batchId) {
     // navigate to indexation view for this batch
      const officeCode = this.route.snapshot.params['officeCode'] || this.ms.getCurrentOffice() || 'default';
      const langCode = this.route.snapshot.params['langCode'] || 'en';
      this.router.navigate(['/', officeCode, langCode, 'data-capture', 'documents', item.batchId]);
    }
  }

  onUrlClick(rowData: any, col: any) {
    const batchId = rowData['batchId'];
    console.log("url click: ", batchId);
    if (batchId) {
      const officeCode = this.route.snapshot.params['officeCode'] || this.ms.getCurrentOffice() || 'default';
      const langCode = this.route.snapshot.params['langCode'] || 'en';
      this.router.navigate(['/', officeCode, langCode, 'data-capture', 'documents', batchId]);
    }
  }

  showSeparatorDialog() {
    this.separatorDialogVisible = true;
  }

  downloadSeparator() {

  }

  printSeparator() {
    console.log("Print separator sheet");
  }
  showBookmarkDialog() {
    this.bookmarkDialogVisible = true;
  }

  generateQRCode() {
    if (this.selectedBookmark) {
      console.log("Generate QR Code for bookmark: ", this.selectedBookmark);
      this.qrValue = this.selectedBookmark;
      //this.qrImageUrl = `https://quickchart.io/qr?text=${encodeURIComponent(this.selectedBookmark)}&size=200`;
      this.qrImageUrl = 'assets/images/qr-mock.png';
      console.log("Generated QR Code URL: ", this.qrImageUrl);
    }
  }

  printBookmarkPage() {
    console.log("Print bookmark page with QR Code: ", this.qrValue);
  }

  onFileUpload(event: UploadEvent) {
    //this.selectedFiles = [...this.selectedFiles, ...event.files];
    for (let file of event.files) {
      this.uploadedFiles.push(file);
    }
    //this.messageService.add({severity: 'info', summary: 'File Uploaded', detail: ''});
  }

  indexFiles() {
    console.log('Indexing files:', this.selectedFiles);
    this.selectedFiles = [];
  }

  showFileUploadArea() {
    this.bookmarkDialogVisible = false;
    this.separatorDialogVisible = false;

    setTimeout(() => {
      this.fileUploadSection.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
  }

  onSearchChange(value: string) {
    this.searchBar = value;
    this.applyFilters(this.appliedFilters);
  }
}
