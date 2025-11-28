import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MechanicsService } from 'src/app/_services/mechanics.service';

@Component({
  selector: 'app-bookmark-dialog',
  standalone: false,
  templateUrl: './bookmark-dialog.component.html'
})
export class BookmarkDialogComponent implements OnInit {
  visible = false;
  selectedBookmark: string | null = null;
  includeBookmarkText = false;
  qrImageUrl: string = '';
  setUpSteps: string;
  bookmarkOptions: { label: string; value: string }[] = [];
  @Output() generate = new EventEmitter<{ value: string, includeText: boolean }>();
  @Output() closed = new EventEmitter<void>();
  selectedIpType: string | null = null;
  filteredBookmarkOptions: { label: string; value: string }[] = [];
  ipTypes = [
    { label: 'Patent', value: 'PATENT' },
    { label: 'Trademark', value: 'TRADEMARK' },
    { label: 'Designs', value: 'DESIGNS' },
    { label: 'Other IP Registrations', value: 'OTHER_IP_REGISTRATIONS' },
    { label: 'Post-filing', value: 'POST_FILING' },
    { label: 'Office Documents', value: 'OFFICE_DOCUMENTS' }
  ];

    translationKeyMap: Record<string, string> = {
    "Claims": "claims",
    "Cover Letter": "coverLetter",
    "Declaration of Use": "declarationOfUse",
    "Description": "description",
    "Drawings": "drawings",
    "ID Card": "idCard",
    "Individual Passport": "individualPassport",
    "Other": "other",
    "Passport / ID Card": "passportIdCard",
    "Payment Receipt": "paymentReceipt",
    "Power of Attorney": "powerOfAttorney",
    "Priority Document": "priorityDocument",
    "Public Research Institute": "publicResearchInstitute",
    "SME Certificate": "smeCertificate"
  };
  bookmarkCategoryMap: Record<string, string[]> = {
    PATENT: [
      "Claims",
      "Cover Letter",
      "Description",
      "Drawings",
      "Other",
      "Payment Receipt",
      "Power of Attorney",
      "Priority Document"
    ],
    TRADEMARK: [
      "Cover Letter",
      "Declaration of Use",
      "Other",
      "Payment Receipt",
      "Power of Attorney",
      "SME Certificate"
    ],
    DESIGNS: [
      "Cover Letter",
      "Other",
      "Payment Receipt",
      "Power of Attorney"
    ],
    OTHER_IP_REGISTRATIONS: [
      "Cover Letter",
      "Other",
      "Payment Receipt",
      "Power of Attorney",
      "Public Research Institute"
    ],
    POST_FILING: [
      "Cover Letter",
      "Declaration of Use",
      "Other",
      "Payment Receipt",
      "Power of Attorney"
    ],
    OFFICE_DOCUMENTS: [
      "Cover Letter",
      "ID Card",
      "Individual Passport",
      "Other",
      "Passport / ID Card",
      "Payment Receipt",
      "Power of Attorney"
    ]
  };

  constructor(
    public ms: MechanicsService, 
    private cdr: ChangeDetectorRef
) { }

  ngOnInit(): void {
    console.log('BookmarkDialogComponent initialized');
    // populate translated options
    this.bookmarkOptions = Object.keys(this.translationKeyMap).map(name => ({
      label: this.ms.translate(`documentCapture.bookmarkOptions.${this.translationKeyMap[name]}`),
      value: name
    }));

  }


  open(initial?: { selectedBookmark?: string, includeText?: boolean }) {
    if (initial) {
      this.selectedBookmark = initial.selectedBookmark || null;
      this.includeBookmarkText = !!initial.includeText;
    }
    this.visible = true;
    this.cdr.markForCheck();
  }

  close() {
    this.visible = false;
    this.selectedBookmark = null;
    this.includeBookmarkText = false;
    this.qrImageUrl = '';
    this.closed.emit();
  }

  onGenerate() {
    // mock QR generation; component consumer can handle actual logic
    this.qrImageUrl = 'assets/images/qr-mock.png';
    this.generate.emit({ value: this.selectedBookmark || '', includeText: this.includeBookmarkText });
  }

  onPrint() {
    // consumer can implement printing via event or call window.print here
    window.print();
  }

  onIpTypeChange() {
    const items = this.bookmarkCategoryMap[this.selectedIpType || ''] || [];

    this.filteredBookmarkOptions = items.map(item => ({
      label: this.ms.translate('documentCapture.bookmarkOptions.' + this.translationKeyMap[item]),
      value: item
    }));
  }

}