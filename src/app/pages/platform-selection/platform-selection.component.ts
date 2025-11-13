import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { Router } from '@angular/router';
import { MechanicsService } from '../../_services/mechanics.service';
import { AuthService } from '../../_services/auth.service';

@Component({
  selector: 'app-platform-selection',
  templateUrl: './platform-selection.component.html',
  standalone: false,
})
export class PlatformSelectionComponent implements OnInit, OnChanges {
  @Input() isModal: boolean = false;
  @Input() currentPlatform: string | null = null;
  @Output() platformSelected = new EventEmitter<string>();
  @Output() modalClosed = new EventEmitter<void>();

  availablePlatforms: any[] = [];
  selectedPlatform: string | null = null;
  searchTerm: string = '';
  filteredPlatforms: any[] = [];
  isSearchCollapsed: boolean = false;

  constructor(
    private mechanicsService: MechanicsService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    console.log('PlatformSelectionComponent - ngOnChanges called:', changes);

    if (changes['currentPlatform'] && !changes['currentPlatform'].firstChange) {
      console.log(
        'PlatformSelectionComponent - currentPlatform changed to:',
        this.currentPlatform
      );
      this.selectedPlatform =
        this.currentPlatform || this.mechanicsService.getWipoPlatform();
      console.log(
        'PlatformSelectionComponent - Updated selectedPlatform to:',
        this.selectedPlatform
      );
    }
  }

  ngOnInit(): void {
    console.log('PlatformSelectionComponent - ngOnInit called');
    console.log('PlatformSelectionComponent - isModal:', this.isModal);
    console.log(
      'PlatformSelectionComponent - currentPlatform input:',
      this.currentPlatform
    );
    console.log(
      'PlatformSelectionComponent - Component should be visible:',
      true
    );

    // Check if user is WIPO admin
    if (!this.mechanicsService.isCurrentUserWipoAdmin()) {
      console.log(
        'PlatformSelectionComponent - User is not WIPO admin, closing modal'
      );
      if (this.isModal) {
        this.modalClosed.emit();
      } else {
        this.redirectToDashboard();
      }
      return;
    }

    // Get available platforms (including 'xx' for IPAS Central)
    this.availablePlatforms = this.mechanicsService.getAvailablePlatforms();
    this.filteredPlatforms = [...this.availablePlatforms];
    console.log(
      'PlatformSelectionComponent - Available platforms:',
      this.availablePlatforms
    );

    // Get previously selected platform or use the current platform from input
    this.selectedPlatform =
      this.currentPlatform || this.mechanicsService.getWipoPlatform();
    console.log(
      'PlatformSelectionComponent - Selected platform:',
      this.selectedPlatform
    );
  }

  onPlatformSelect(platformCode: string): void {
    this.selectedPlatform = platformCode;
  }

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredPlatforms = [...this.availablePlatforms];
    } else {
      this.filteredPlatforms = this.availablePlatforms.filter(
        (platform) =>
          platform.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          platform.officeCode
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase())
      );
    }
  }

  toggleSearch(): void {
    this.isSearchCollapsed = !this.isSearchCollapsed;
  }

  onContinue(): void {
    console.log(
      'PlatformSelectionComponent - onContinue called with selectedPlatform:',
      this.selectedPlatform
    );
    console.log('PlatformSelectionComponent - isModal:', this.isModal);

    if (!this.selectedPlatform) {
      console.log(
        'PlatformSelectionComponent - No platform selected, returning'
      );
      return;
    }

    if (this.isModal) {
      // If in modal mode, set the platform in the service first, then emit the event
      console.log(
        'PlatformSelectionComponent - Modal mode: Setting WIPO platform to:',
        this.selectedPlatform
      );
      this.mechanicsService.setWipoPlatform(this.selectedPlatform);

      console.log(
        'PlatformSelectionComponent - Emitting platformSelected event with:',
        this.selectedPlatform
      );
      this.platformSelected.emit(this.selectedPlatform);
      return;
    }

    this.mechanicsService.setWipoPlatform(this.selectedPlatform);

    // Redirect to cognito-sync route after platform selection
    this.router.navigate(['/cognito-sync']);
  }

  onLogout(): void {
    if (this.isModal) {
      this.modalClosed.emit();
    } else {
      this.authService.logout().subscribe();
    }
  }

  onClose(): void {
    if (this.isModal) {
      this.modalClosed.emit();
    }
  }

  private redirectToDashboard(): void {
    const currentOffice = this.mechanicsService.getCurrentOffice();
    const officeConfig = this.mechanicsService.getCurrentOfficeConfig();
    const langCode = officeConfig?.defaultLanguage || 'en';
    this.router.navigate([`/${currentOffice}/${langCode}/dashboard`]);
  }
}
