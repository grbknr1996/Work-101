import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, Subject } from 'rxjs';
import { MechanicsService } from 'src/app/_services/mechanics.service';
import { TrademarkSimilaritySearchService } from 'src/app/_services/similarity-search.service';
import { ConfigurableFilterComponent, FilterConfig, FilterValue } from 'src/app/components/configurable-filter/configurable-filter.component';
import { ColumnDefinition } from 'src/app/components/table/table.component';

@Component({
  selector: 'app-trademark-similarity-search',
  standalone:false,
  providers: [TrademarkSimilaritySearchService],
  templateUrl: './similarity-search.component.html',
  //styleUrls: ['./similarity-search.component.css']
})
export class TrademarkSimilaritySearchComponent implements OnInit {
    @ViewChild(ConfigurableFilterComponent)
    configurableFilter!: ConfigurableFilterComponent;
    @ViewChild('logoInput') logoInput!: ElementRef<HTMLInputElement>;

  private searchSubject = new Subject<{query: string, modes: string[]}>();
  isLoadingImageSearch: boolean = false;

  officeCode = 'default';
  langCode = 'en';
  breadcrumbItems = [];
  logoAvailable = false;
  currentPage = 0;
  pageSize = 10;
  totalRecords = 0;
  currentCardPage =0;
  cardPageSize =20;
  listPageSize = 10;
  switchTabTable: boolean = false;
  switchListView: boolean = true;
  tableData: any[] = [];
  visibleFilters: boolean = false;
  searchBar: string;
  userStats: any[] = [];
  filters: any = { name: '', matchTypes: [], status: [], startDate: null, endDate: null };
  selectedFilterCount: number = 0;
  matchType: string = 'Exact';
  searchMode: 'name' | 'description' | 'logo' = 'name';
  selectedMatchTypes: string[] = ['Exact', 'Fuzzy', 'Phonetic', 'Semantic'];
  isLogoSearch: boolean = false;
  showDescriptionDialog: boolean = false;
  selectedDescription: string = '';
  uploadedLogoUrl!: string;
  matchedLogoUrl!: string;
  matchedTrademarkName!: string;
  matchedTrademarkNumber!: string;
  uploadedImageFile?: File;
  isAnalyzing: boolean = false;

  similarityScore: number = 0;
  similaritySummary: string = '';
  searchedDescription: string = '';
  citedTrademarks: any[] = [];
  private citedIds = new Set<string>();
  isShowingCited: boolean = false;
  private getRecordId(r: any): string {
     return r?.docId ?? r?.regNumber ?? r?.id ?? '';
   }
  citedCount: number = 0;

  //matchTypeOptions = ['Exact','Fuzzy','Phonetic' ]
  matchTypeOptions = [
  { label: 'Exact', value: 'Exact' },
  { label: 'Fuzzy', value: 'Fuzzy' },
  { label: 'Phonetic', value: 'Phonetic' },
  { label: 'Semantic', value: 'Semantic' }
];
searchOptions=[
    { label: 'Search by Name', value: 'name' },
    { label: 'Search by Description', value: 'description' },
    { label: 'Search by Logo', value: 'logo' }
  ];

  filterConfigs: FilterConfig[] = [];
  appliedFilters: FilterValue[] = [];
  allFilters: FilterValue[] = [];
  baseData: any[] = [];
  OriginalData: any[] = [];
  sortBySimilarity: boolean = true;
  currentListPage = 0;
  pagedListData: any[] = [];
  pagedCardData: any[] = [];
  pagedTableData: any[] = [];
  drawerVisible: boolean = false;
  selectedRecord: any = null; 

  tableColumns: ColumnDefinition[] = [
    { 
      field: 'logoUrl', 
      header: 'Logo', 
      display: 'avatar',
      size: 'xlarge',
      nameField: 'No Image'
    },
    { field: 'markName', header: 'Mark Name', sortable: true },

    { field: 'regNumber', header: 'Registration Number', sortable: true },
    { field: 'applicantName', header: 'Owner', sortable: true },
    {
      field: 'status',
      header: 'Status',
      display: 'tag',
      sortable: true,
      severity: (value: string) => {
        const tag = this.getTagColorValue(value);
        return tag?.severity ?? 'secondary';
      },
      value: (value: string) => {
        const tag = this.getTagColorValue(value);
        return tag?.value ?? value;
      },
    },
    {
      field: 'classes',
      header: 'Nice Classes',
      sortable: true,
    },
    {
      field: 'filingDate',
      header: 'Application Date',
      sortable: true,
    },
  ];


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public ms: MechanicsService,
    private cdr: ChangeDetectorRef,
    private service: TrademarkSimilaritySearchService
  ) { 
    this.initializeConfigurations();
          this.searchSubject.pipe(debounceTime(300)).subscribe(({query, modes}) => {
            const q = (query || '').trim();
            if (!q) {
              this.resetToOriginalData();
              return;
            }
            console.log("the search mode and length", this.searchMode, q.length)
            if (this.searchMode === 'name' && q.length > 2){
              this.performSearch(query, modes);
            }
      });
  }

    private initializeConfigurations(): void {
    this.filterConfigs = [
      {
        key: 'owners',
        label: 'OWNER',
        type: 'multiSelect',
        placeholder: 'Select owner',
        options: [],
        section: 'OWNERS'
      },
      {
        key: 'Statuses',
        label: 'Status',
        type: 'multiSelect',
        placeholder: 'Select Status',
        options: [],
        section: 'STATUS'
      },
      {
        key: 'applicationDateRange',
        label: 'Application Date Range',
        type: 'dateRange',
        section: this.ms.translate('documentCapture.filters.dateFiltersSection') || 'FILTERS'
      }
    ];

  }

  ngOnInit(): void {

    this.userStats = [
      {
        label: 'Similar Marks',
        markName: 'ABC Trademarks',
        logoUrl: 'https://asean-ipregister.wipo.net/wopublish-search/service/images/0aLPP2osudojqiPv847dDQdmRZXEBvfWYW-dfzRPQNCTMZZoFCmN98PjasDK0jTrXyTBEQv1gvLrt5zpyig6WHPWvvb9pWm_R4XGcngbc0E?noLogo=true&disclaimer=Machine',
        applicationNumber: '1234567',
        filingDate: '12 Aug 2024'
      },
    ];

    this.route.params.subscribe((params) => {
      const officeCode = params['officeCode'] || this.ms.getCurrentOffice() || 'default';
      const langCode = params['langCode'] || 'en';

      this.breadcrumbItems = [
        {
          //label: this.ms.translate('documentCapture.breadcrumb'),
          label: 'Trademark Similarity Search',
          routerLink: `/${officeCode}/${langCode}/trademark-similarity-search`,
        }];
        this.cdr.markForCheck();
        });

        this.service.getTrademarks().subscribe(data => {
        this.baseData = [...data];
        this.tableData = [...data];
        this.OriginalData = [...data];
        this.totalRecords = data.length;
        this.pagedTableData = this.tableData.slice(0, this.pageSize);
        this.updateFilters(data);
        this.syncAppliedFilters();
       
    })
    }
    private toFilterOptions(values: any[]): { label: string; value: any }[] {
      return Array.from(new Set(values))
        .filter(v => v !== null && v !== undefined)
        .map(v => ({
          label: String(v),
          value: v
        }));
    }

    updateFilters(data: any[]) {
      const owners = this.toFilterOptions(data.map(item => item.applicantName));
      const statuses = this.toFilterOptions(data.map(item => item.status));

      const ownersFilter = this.filterConfigs.find(config => config.key === 'owners');
      if (ownersFilter) {
        ownersFilter.options = owners;
      }

      const statusFilter = this.filterConfigs.find(config => config.key === 'Statuses');
      if (statusFilter) {
        statusFilter.options = statuses;
      }
    }

    getTagColorValue = (value: string) => {
    switch (value) {
      case 'Under Review':
        return { severity: 'info', value: 'Under Review' };
      case 'Approved':
        return { severity: 'success', value: 'Approved' };
      case 'Pending':
        return { severity: 'warn', value: 'Pending' };
      case 'Objection Raised':
        return { severity: 'warn', value: "Objection Raised" };
      case 'Rejected':
        return { severity: 'danger', value: "Rejected" };
      default:
        return { severity: 'secondary', value }
    }
  };
  getSearchLabel(): string {
    switch (this.searchMode) {
      case 'description':
        return 'Search by description logo';
      case 'logo':
        return 'Upload logo to search';
      default:
        return 'Mark Name';
    }
  }


  onActionClick(action: string, item: any) {
    switch (action) {

    }
  }

  onLazyLoad(event: any) {
  const first = event.first ?? event.page * event.rows;
  const rows = event.rows;

  this.currentPage = Math.floor(first / rows);
  this.pageSize = rows;

  this.pagedTableData = this.tableData.slice(first, first + rows);

  this.cdr.detectChanges();
  }

  onTemplatedUpload() {
    
  }
  tabTableSwitch() {
    this.switchListView = false;
    this.switchTabTable = !this.switchTabTable;
  }
  switchToListView() {
    this.switchListView = true;
    this.switchTabTable = false;
  }
  applyFilters(filters: FilterValue[]): void {
    let filtered = [...this.OriginalData];

    const ownerFilter = (filters || []).find(f => f.key === 'owners');
      if(ownerFilter && Array.isArray(ownerFilter.value) && ownerFilter.value.length > 0) {
        filtered = filtered.filter(item =>
          ownerFilter.value.includes(item.applicantName)
        );
      }

    const statusFilter = (filters || []).find(f => f.key === 'Statuses');
      if (statusFilter && Array.isArray(statusFilter.value) && statusFilter.value.length > 0) {
        filtered = filtered.filter(item =>
          statusFilter.value.includes(item.status)
        );
      }

    const dateFilter = (filters || []).find(f => f.key === 'applicationDateRange' && f.value);
    if (dateFilter && Array.isArray(dateFilter.value) && dateFilter.value.length === 2) {
      const [from, to] = dateFilter.value;
      const fromDate = from ? new Date(from) : null;
      const toDate = to ? new Date(to) : null;
      if (fromDate || toDate) {
        filtered = filtered.filter(item => {
          const dt = item.filingDate ? new Date(item.filingDate) : null;
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
      filtered = filtered.filter(item => (item.markName || '').toString().toLowerCase().includes(term));
    }
    this.tableData = filtered;
    this.totalRecords = filtered.length;
    this.onLazyLoad({ first: 0, rows: this.pageSize });

    this.updateListPagination();
    this.updateCardPagination();
    this.cdr.detectChanges();
  }

  clearAllFilters() {
    this.appliedFilters = [];
    this.searchBar = '';
    this.isLogoSearch = false;
    this.allFilters = this.allFilters.map(f => ({ ...f, value: false }));
    this.syncAppliedFilters();
    this.configurableFilter.clearAllFilters();
  }

  onFilterChange(event:any){

  }
  onFilterCleared(){
    this.appliedFilters = [];
    this.cdr.detectChanges();

  }

  onAppliedFiltersChange(filters: FilterValue[]): void {
    this.appliedFilters = filters || [];
    console.log(" the applied filters changes:", this.appliedFilters)
    this.applyFilters(this.appliedFilters);
    this.cdr.detectChanges();
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
  // onSearchChange(value: string) {
  //   this.searchBar = value;
  //   this.applyFilters(this.appliedFilters);
  // }
  removeFilterChip(filterKey: string) {
        const filterConfig = this.filterConfigs.find((f) => f.key === filterKey);

    console.log("filterKey value",filterKey, filterConfig)
    if (filterKey === 'imageSearch') {
      this.removeImageSearchChip();
      return;
    }

    if (filterConfig) {
      this.appliedFilters = this.appliedFilters.filter((f) => f.key !== filterKey);
      if (this.configurableFilter && typeof this.configurableFilter.removeFilterChip === 'function') {
        this.configurableFilter.removeFilterChip(filterKey);
      }
      this.cdr.detectChanges();
    }
  }

  updateListPagination() {
    const start = this.currentListPage * this.listPageSize;
    const end = start + this.listPageSize;
    this.pagedListData = this.tableData.slice(start, end);
    console.log("list page data:", this.pagedListData);
  }
  onListPageChange(event: any) {
    this.currentListPage = event.page;
    this.listPageSize = event.rows;
    this.updateListPagination();
  }

  updateCardPagination() {
    const start = this.currentCardPage * this.cardPageSize;
    const end = start + this.cardPageSize;
    this.pagedCardData = this.tableData.slice(start, end);
    console.log("card page data:", this.pagedCardData);
  }

  onCardPageChange(event: any) {
    this.currentCardPage = event.page;
    this.cardPageSize = event.rows;
    this.updateCardPagination();
  }

  openDrawer(item: any) {
    this.selectedRecord = item;
    this.drawerVisible = true;
  }

  showTrademarkDetails(data: any) {
    this.drawerVisible = true;
  }
  onSearchChange(value: string) {
    this.searchBar = value;
    const modes = (this.selectedMatchTypes && this.selectedMatchTypes.length) ? this.selectedMatchTypes : (this.matchType ? [this.matchType] : ['Exact']);
    this.searchSubject.next({ query: this.searchBar, modes });
  }

  onMatchTypeChange(event: any){
    // update selectedMatchTypes if using multiselect, otherwise use matchType
    const modes = (this.selectedMatchTypes && this.selectedMatchTypes.length) ? this.selectedMatchTypes : (this.matchType ? [this.matchType] : ['Exact']);
    //console.log("the selceted seacrh modes are", modes);
    this.searchSubject.next({ query: this.searchBar || '', modes });
  }

  private performSearch(query: string, modes: string[] = ['Exact']) {
        console.log("the selceted seacrh modes are", modes);

      if (!query || !query.trim()) {
        // clear results if empty
        this.tableData = [];
        this.OriginalData = [];
        this.totalRecords = 0;
        this.pagedTableData = [];
        this.updateListPagination();
        this.updateCardPagination();
        this.cdr.markForCheck();
        return;
      }

      this.service.searchTrademarks(query, modes).subscribe(data => {
        // ensure missing fields are marked "NA" already by service mapping
        this.tableData = data || [];
        this.OriginalData = [...this.tableData];
        this.totalRecords = this.tableData.length;
        this.pagedTableData = this.tableData.slice(0, this.pageSize);
        this.updateFilters(this.tableData);
        //this.syncAppliedFilters();
        this.updateListPagination();
        this.updateCardPagination();
        this.cdr.markForCheck();
      });
    }

    triggerLogoUpload(): void {
    if (!this.isLoadingImageSearch) {
      this.logoInput.nativeElement.click();
    }
  }

    async onImageSelect(event: any) {
      const input = event.target as HTMLInputElement;
        
        if (!input.files || input.files.length === 0) {
            console.warn('No image files selected');
            return;
        }
        const imageFile = input.files[0];

        if (!(await this.isValidImage(imageFile))) {
          console.error('Invalid or corrupted image file');
          input.value = '';
          return;
        }
        // Validate file type
        if (!imageFile.type.startsWith('image/')) {
            console.warn('Selected file is not an image');
            input.value = '';
            return;
        }

        // Validate file size (e.g., max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (imageFile.size > maxSize) {
            console.warn('Image file is too large (max 5MB)');
            return;
        }

        this.performImageSearch(imageFile);
        input.value = '';
    }
    private async isValidImage(file: File): Promise<boolean> {
      return new Promise(resolve => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = URL.createObjectURL(file);
      });
    }

    /**
     * Perform trademark search by image
     */
    private performImageSearch(imageFile: File) {
      console.log("the uploaded image url value is:", imageFile);
        this.isLoadingImageSearch = true;
        this.isLogoSearch = true;
        this.uploadedImageFile = imageFile;
        try {
          this.uploadedLogoUrl = URL.createObjectURL(imageFile);
        } catch (e) {
          this.uploadedLogoUrl = '';
        }

        this.service.searchByImage(imageFile).subscribe(
            (data: any[]) => {
                console.log('Image search results:', data);

                // Update table data with image search results
                this.tableData = data || [];
                this.OriginalData = [...this.tableData];
                this.totalRecords = this.tableData.length;
                this.pagedTableData = this.tableData.slice(0, this.pageSize);

                // Update filters with new data
                this.updateFilters(this.tableData);

                // Reset pagination
                this.currentPage = 0;
                this.currentListPage = 0;
                this.currentCardPage = 0;

                // Update paginated views
                this.updateListPagination();
                this.updateCardPagination();

                // Add search chip to show search was performed
                this.addImageSearchChip(imageFile.name);

                this.isLoadingImageSearch = false;
                this.cdr.markForCheck();
            },
            (error: any) => {
                console.error('Image search failed:', error);
                this.isLoadingImageSearch = false;
                this.cdr.markForCheck();
            }
        );
    }

    /**
     * Add a chip to indicate image search was performed
     */
    private addImageSearchChip(filename: string) {
        const chip: FilterValue = {
            key: 'imageSearch',
            value: `Image: ${filename}`,
            type: 'chip'
        };

        const exists = this.appliedFilters.some(f => f.key === 'imageSearch');
        if (!exists) {
            this.appliedFilters = [chip, ...this.appliedFilters];
            console.log('Added image search chip:', this.appliedFilters);
        }
    }

    /**
     * Remove image search chip
     */
    removeImageSearchChip() {
      this.isLogoSearch = false;
      this.uploadedLogoUrl = '';
      this.uploadedImageFile = undefined;
      this.appliedFilters = this.appliedFilters.filter(f => f.key !== 'imageSearch');
      this.tableData = [...this.baseData];
      this.totalRecords = this.tableData.length;
      this.updateListPagination();
      this.updateCardPagination();

      this.cdr.detectChanges();
    }

  onSearchModeChange(mode: 'name' | 'description') {
    this.searchMode = mode;
    this.searchBar = '';
  }

  handleSearchChange(value: string) {
    if (this.searchMode === 'name') {
      this.onSearchChange(value);
    } 
    // else {
    //   this.onDescriptionSearch(); // autosearch
    // }
  }

  onDescriptionSearch() {
      const desc = (this.searchBar || '').trim();
      if (!desc) return;
      this.isLoadingImageSearch = true;
      this.isLogoSearch = true;
      this.service.searchByDescription(desc).subscribe({
        next: (data) => {
          console.log('Text->image results:', data);
          this.handleImageLikeResults(data, `Text: ${desc}`);
          this.isLoadingImageSearch = false;
        },
        error: (err) => {
          console.error('Text->image search failed', err);
          this.isLoadingImageSearch = false;
          this.cdr.markForCheck();
        }
      });
    }

  private handleImageLikeResults(data: any[], sourceLabel?: string) {
      this.tableData = data || [];
      this.OriginalData = [...this.tableData];
      this.totalRecords = this.tableData.length;
      this.pagedTableData = this.tableData.slice(0, this.pageSize);
      this.updateFilters(this.tableData);
      this.currentPage = 0;
      this.currentListPage = 0;
      this.currentCardPage = 0;
      this.updateListPagination();
      this.updateCardPagination();
      if (sourceLabel) this.addImageSearchChip(sourceLabel);
      this.cdr.markForCheck();
  }

    private resetToOriginalData() {
      this.tableData = [...this.baseData];
      this.OriginalData = [...this.baseData];
      this.totalRecords = this.baseData.length;

      this.updateFilters(this.baseData);
      this.updateListPagination();
      this.updateCardPagination();
      this.cdr.markForCheck();
    }

      private fileToBase64(file: File): Promise<string> {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // result already contains "data:*/*;base64,..." - backend may expect raw base64 or data URI.
          // We'll strip data URI prefix to send raw base64.
          const idx = result.indexOf('base64,');
          resolve(idx >= 0 ? result.substring(idx + 7) : result);
        };
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      });
    }

openDescription(data: any): void {
      // set matched info immediately so UI can show thumbnails
      console.log('Opening description dialog for data:', data, this.searchMode);
      this.uploadedLogoUrl = this.uploadedLogoUrl || (this.uploadedImageFile ? URL.createObjectURL(this.uploadedImageFile) : '');
      this.matchedLogoUrl = data.logoUrl;
      this.matchedTrademarkName = data.markName;
      this.matchedTrademarkNumber = data.regNumber;
      this.similarityScore = Math.round(data.score * 100);
      console.log("the similarity score is", this.similarityScore);
      if (this.searchMode === 'description') {
        this.searchedDescription = this.searchBar || '';
      }

      // start analysis call
      this.isAnalyzing = true;
      this.similaritySummary = 'Analyzing similarity...';
      this.showDescriptionDialog = true;
      this.cdr.markForCheck();

      if (this.searchMode === 'logo') {
        // ensure we have the uploaded file; if not try to fetch from uploadedLogoUrl (not ideal)
        if (!this.uploadedImageFile) {
          console.warn('No uploaded image file available for analysis');
          this.similaritySummary = 'No uploaded image available for analysis.';
          this.isAnalyzing = false;
          this.cdr.markForCheck();
          return;
        }

        // convert file to base64 and call analyze
        this.fileToBase64(this.uploadedImageFile).then(base64 => {
          const payload = { query_content: base64, result_image_path: this.matchedLogoUrl, mode: 'image' as const };
          this.service.analyze(payload).subscribe({
            next: (analysis) => {
              this.similaritySummary = analysis || 'No detailed analysis returned.';
              this.isAnalyzing = false;
              this.cdr.markForCheck();
            },
            error: (err) => {
              console.error('Analyze (image) failed', err);
              this.similaritySummary = 'Analysis failed. Please try again later.';
              this.isAnalyzing = false;
              this.cdr.markForCheck();
            }
          });
        }).catch(err => {
          console.error('Failed converting image to base64', err);
          this.similaritySummary = 'Failed to prepare image for analysis.';
          this.isAnalyzing = false;
          this.cdr.markForCheck();
        });

      } else {
        // text/description mode
        const text = (this.searchBar || this.searchedDescription || '').trim();
        if (!text) {
          this.similaritySummary = 'No description provided for analysis.';
          this.isAnalyzing = false;
          this.cdr.markForCheck();
          return;
        }

        const payload = { query_content: text, result_image_path: this.matchedLogoUrl, mode: 'text' as const };
        this.service.analyze(payload).subscribe({
          next: (analysis) => {
            this.similaritySummary = analysis || 'No detailed analysis returned.';
            this.isAnalyzing = false;
            this.cdr.markForCheck();
          },
          error: (err) => {
            console.error('Analyze (text) failed', err);
            this.similaritySummary = 'Analysis failed. Please try again later.';
            this.isAnalyzing = false;
            this.cdr.markForCheck();
          }
        });
      }
    }
    selectAsCitedMark(record: any): void {
     if (!record) return;
     const id = this.getRecordId(record);
     if (!id) return;

     const alreadyCited = this.citedIds.has(id);

     if (alreadyCited) {
       this.citedTrademarks = this.citedTrademarks.filter(r => this.getRecordId(r) !== id);
       this.citedIds.delete(id);

       if (!this.baseData.some(r => this.getRecordId(r) === id)) {
         this.baseData = [record, ...this.baseData];
       }
       if (this.isShowingCited) {
         this.tableData = this.tableData.filter(r => this.getRecordId(r) !== id);
       } else {
         if (!this.tableData.some(r => this.getRecordId(r) === id)) {
           this.tableData = [record, ...this.tableData];
         }
       }
     } else {
       this.citedTrademarks = [record, ...this.citedTrademarks];
       this.citedIds.add(id);

       this.baseData = this.baseData.filter(r => this.getRecordId(r) !== id);
       this.OriginalData = this.OriginalData.filter(r => this.getRecordId(r) !== id);
       this.tableData = this.tableData.filter(r => this.getRecordId(r) !== id);
     }

     // update totals and paginations
     this.updateCitedCount();
     this.totalRecords = this.tableData.length;
     this.pagedTableData = this.tableData.slice(0, this.pageSize);
     this.updateListPagination();
     this.updateCardPagination();
     this.cdr.markForCheck();
   }

  private updateCitedCount() {
    this.citedCount = this.citedTrademarks.length;
  }

    getSitedTrademarks(): void {
      if (!this.isShowingCited) {
        if (!this.citedTrademarks || this.citedTrademarks.length === 0) {
          this.cdr.markForCheck();
          return;
        }
        this.isShowingCited = true;
        this.tableData = [...this.citedTrademarks];
      } else {
        this.isShowingCited = false;
        this.tableData = [...this.baseData];
      }

     this.totalRecords = this.tableData.length;
      this.currentPage = 0;
      this.currentListPage = 0;
      this.currentCardPage = 0;
      this.pagedTableData = this.tableData.slice(0, this.pageSize);
      this.addCitedTrademarksChip();
      this.updateListPagination();
      this.updateCardPagination();
      this.cdr.markForCheck();
    }
  isCited(record: any): boolean {
     const id = this.getRecordId(record);
     return !!id && this.citedIds.has(id);
   }

  private addCitedTrademarksChip() {
        const chip: FilterValue = {
            key: 'cited',
            value: `citedMarks`,
            type: 'chip'
        };

        const exists = this.appliedFilters.some(f => f.key === 'cited');
        if (!exists) {
            this.appliedFilters = [chip, ...this.appliedFilters];
            console.log('Added cited trademarks chip:', this.appliedFilters);
        }
    }
}