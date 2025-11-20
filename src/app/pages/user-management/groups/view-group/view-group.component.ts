import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
} from '@angular/core';
import {
  UserService,
  GroupWithMembers,
} from '../../../../_services/user.service';
import { MechanicsService } from '../../../../_services/mechanics.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-view-group',
  standalone: false,
  templateUrl: './view-group.component.html',
})
export class ViewGroupComponent implements OnInit, OnDestroy, OnChanges {
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Input() groupId: number | null = null;
  @Input() groupType: string | null = null;

  groupDetails: GroupWithMembers | null = null;
  loading: boolean = false;
  errorMessage: string | null = null;
  private subscription: Subscription | null = null;
  private isLoading: boolean = false; // Flag to prevent multiple simultaneous calls

  constructor(
    private userService: UserService,
    public ms: MechanicsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Component initialization
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  onShow(): void {
    // Only load if not already loading and we have a groupId
    if (this.visible && this.groupId && !this.isLoading) {
      // Reset loading state when dialog opens
      this.loading = false;
      this.errorMessage = null;
      this.loadGroupDetails();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Only handle visible changes, let onShow handle the actual loading
    // This prevents duplicate calls
    if (changes['visible'] && this.visible) {
      // Reset state when dialog opens
      this.groupDetails = null;
      this.errorMessage = null;
      // Don't call loadGroupDetails here - let onShow() handle it
    }
    // Handle groupId changes while dialog is visible
    if (changes['groupId'] && this.visible && this.groupId && !this.isLoading) {
      if (!this.groupDetails || this.groupDetails.groupId !== this.groupId) {
        this.groupDetails = null;
        this.errorMessage = null;
        this.loadGroupDetails();
      }
    }
  }

  onHide(): void {
    this.groupDetails = null;
    this.errorMessage = null;
    this.loading = false;
    this.isLoading = false;
    // Cancel any ongoing subscription
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
    this.visibleChange.emit(false);
  }

  private loadGroupDetails(): void {
    // Prevent multiple simultaneous calls
    if (this.isLoading || !this.groupId) {
      return;
    }

    this.isLoading = true;
    this.loading = true;
    this.errorMessage = null;
    this.cdr.detectChanges(); // Update UI to show loading state

    // Cancel previous subscription if exists
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    this.subscription = this.userService
      .getGroupMembers(this.groupId)
      .subscribe({
        next: (groupDetails: GroupWithMembers) => {
          this.groupDetails = groupDetails;
          this.loading = false;
          this.isLoading = false;
          this.errorMessage = null;
          this.cdr.detectChanges(); // Force change detection to hide loading and show content
        },
        error: (error) => {
          console.error('Error loading group details:', error);
          this.loading = false;
          this.isLoading = false;
          this.errorMessage =
            this.ms.translate('userManagement.groups.unableToLoadGroup') ||
            'Unable to load group details. Please try again later.';
          this.groupDetails = null;
          this.cdr.detectChanges(); // Force change detection to show error
        },
      });
  }

  getMembersCount(): number {
    return this.groupDetails?.userIdBag?.length || 0;
  }

  getStatusLabel(): string {
    if (!this.groupDetails) return '';
    return this.groupDetails.isActive
      ? this.ms.translate('userManagement.groups.active') || 'Active'
      : this.ms.translate('userManagement.groups.inactive') || 'Inactive';
  }

  getStatusSeverity(): 'success' | 'info' | 'danger' | 'secondary' {
    if (!this.groupDetails) return 'secondary';
    return this.groupDetails.isActive ? 'success' : 'danger';
  }

  getStatusChipClass(): string {
    const baseClasses =
      'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border';
    const severity = this.getStatusSeverity();

    let colorClasses = '';
    switch (severity) {
      case 'success':
        colorClasses = 'bg-green-50 text-green-700 border-green-200';
        break;
      case 'info':
        colorClasses = 'bg-blue-50 text-blue-700 border-blue-200';
        break;
      case 'danger':
        colorClasses = 'bg-red-50 text-red-700 border-red-200';
        break;
      case 'secondary':
        colorClasses = 'bg-gray-50 text-gray-700 border-gray-200';
        break;
      default:
        colorClasses = 'bg-gray-50 text-gray-700 border-gray-200';
        break;
    }

    return `${baseClasses} ${colorClasses}`;
  }

  getGroupTypeLabel(): string {
    // Use input groupType if available, otherwise use groupDetails.groupType
    const typeToUse = this.groupType || this.groupDetails?.groupType;
    if (!typeToUse) return '-';
    const groupType = typeToUse.toUpperCase().trim();
    if (groupType === 'BUSINESS') {
      return this.ms.translate('userManagement.groups.business') || 'Business';
    } else if (groupType === 'USER') {
      return this.ms.translate('userManagement.groups.user') || 'User';
    }
    // Return the original value if it doesn't match known types
    return typeToUse;
  }

  getGroupTypeSeverity(): 'success' | 'info' | 'danger' | 'secondary' {
    // Use input groupType if available, otherwise use groupDetails.groupType
    const typeToUse = this.groupType || this.groupDetails?.groupType;
    if (!typeToUse) return 'secondary';
    const groupType = typeToUse.toUpperCase().trim();
    return groupType === 'BUSINESS' ? 'info' : 'success';
  }

  getGroupTypeChipClass(): string {
    const baseClasses =
      'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border';
    const severity = this.getGroupTypeSeverity();

    let colorClasses = '';
    switch (severity) {
      case 'success':
        colorClasses = 'bg-green-50 text-green-700 border-green-200';
        break;
      case 'info':
        colorClasses = 'bg-blue-50 text-blue-700 border-blue-200';
        break;
      case 'danger':
        colorClasses = 'bg-red-50 text-red-700 border-red-200';
        break;
      case 'secondary':
        colorClasses = 'bg-gray-50 text-gray-700 border-gray-200';
        break;
      default:
        colorClasses = 'bg-gray-50 text-gray-700 border-gray-200';
        break;
    }

    return `${baseClasses} ${colorClasses}`;
  }
}
