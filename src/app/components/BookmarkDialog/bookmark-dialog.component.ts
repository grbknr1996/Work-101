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

  constructor(
    public ms: MechanicsService, 
    private cdr: ChangeDetectorRef
) { }

  ngOnInit(): void {
    console.log('BookmarkDialogComponent initialized');
    // populate translated options
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
}