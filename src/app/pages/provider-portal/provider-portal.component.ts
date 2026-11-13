import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import {
  CategoryRequest,
  ProviderBooking,
  ProviderProfile,
  ProviderProfileRequest,
  ProviderServiceOffering,
  ProviderServiceRequest,
  ProviderStats,
  Review,
  ServiceCategory
} from 'src/models/provider';
import { AuthService } from '../../services/auth.service';
import { FixnearService } from '../../services/fixnear.service';
import { ProviderPortalService } from '../../services/provider-portal.service';
import { ToastService } from '../../services/toast.service';
import { serviceImageUrl } from '../../shared/service-image';
import { mapsUrl, hasCoordinates } from '../../shared/maps';
import { titleCase } from '../../shared/text-case';

type PortalTab = 'overview' | 'bookings' | 'services' | 'categories' | 'profile' | 'reviews';

interface CompletenessItem {
  key: string;
  label: string;
  hint: string;
  done: boolean;
  tab: PortalTab;
}

interface ProfileForm {
  businessName: string;
  description: string;
  serviceArea: string;
  address: string;
  phone: string;
  experience: number;
  categoryId: number | null;
  serviceName: string;
  serviceDescription: string;
  basePrice: number;
}

interface ServiceForm {
  id: number | null;
  categoryId: number | null;
  serviceName: string;
  description: string;
  imageUrl: string | null;
  basePrice: number;
  isActive: boolean;
}

@Component({
  selector: 'app-provider-portal',
  templateUrl: './provider-portal.component.html',
  styleUrls: ['./provider-portal.component.css']
})
export class ProviderPortalComponent implements OnInit {
  tab: PortalTab = 'overview';
  loading = true;
  savingProfile = false;
  savingService = false;
  uploadingPhoto = false;
  uploadingServicePhoto = false;
  showServiceForm = false;
  bookingFilter = 'All';
  bookingSearch = '';

  profile: ProviderProfile | null = null;
  stats: ProviderStats | null = null;
  services: ProviderServiceOffering[] = [];
  bookings: ProviderBooking[] = [];
  reviews: Review[] = [];
  categories: ServiceCategory[] = [];
  categoryRequests: CategoryRequest[] = [];
  showCategoryRequest = false;
  savingCategoryRequest = false;
  categoryRequestName = '';
  categoryRequestDescription = '';
  categorySearch = '';

  profileForm: ProfileForm = this.emptyProfileForm();
  serviceForm: ServiceForm = this.emptyServiceForm();

  readonly bookingFilters = ['All', 'Pending', 'Accepted', 'Completed', 'Cancelled'];
  readonly maxDescription = 600;

  constructor(
    public authService: AuthService,
    private portal: ProviderPortalService,
    private fixnear: FixnearService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.refreshCategories();
    this.refreshAll();
  }

  refreshCategories(force = false): void {
    this.fixnear.loadCategories(force).subscribe(cats => (this.categories = cats));
  }

  refreshAll(): void {
    this.loading = true;
    forkJoin({
      profile: this.portal.getProfile(),
      stats: this.portal.getStats(),
      services: this.portal.getServices(),
      bookings: this.portal.getBookings(),
      reviews: this.portal.getReviews(),
      categoryRequests: this.portal.getCategoryRequests()
    }).subscribe(({ profile, stats, services, bookings, reviews, categoryRequests }) => {
      this.profile = profile;
      this.stats = stats;
      this.services = services;
      this.bookings = bookings;
      this.reviews = reviews;
      this.categoryRequests = categoryRequests;
      this.loading = false;

      if (profile) {
        this.profileForm = {
          businessName: profile.businessName,
          description: profile.description,
          serviceArea: profile.serviceArea,
          address: profile.address,
          phone: profile.phone,
          experience: profile.experience,
          categoryId: null,
          serviceName: '',
          serviceDescription: '',
          basePrice: 0
        };
      } else {
        this.tab = 'profile';
      }
    });
  }

  setTab(tab: PortalTab): void {
    this.tab = tab;
    if (tab === 'services') this.showServiceForm = false;
  }

  get isOnboarding(): boolean {
    return !this.profile;
  }

  get filteredBookings(): ProviderBooking[] {
    const term = this.bookingSearch.trim().toLowerCase();
    return this.bookings.filter(b => {
      if (this.bookingFilter !== 'All' && b.status !== this.bookingFilter) return false;
      if (!term) return true;
      const haystack = [
        b.id,
        b.service,
        b.customerName,
        b.customerEmail,
        b.customerPhone,
        b.address,
        b.problem,
        b.date,
        b.status,
        b.price
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(term);
    });
  }

  get bookingSearchTerm(): string {
    return this.bookingSearch.trim();
  }

  clearBookingSearch(): void {
    this.bookingSearch = '';
  }

  get completenessItems(): CompletenessItem[] {
    const p = this.profile;
    const liveServices = this.services.filter(s => s.isActive).length;

    return [
      {
        key: 'name',
        label: 'Business name',
        hint: 'Tell customers who you are',
        done: !!p?.businessName?.trim(),
        tab: 'profile'
      },
      {
        key: 'story',
        label: 'About your business',
        hint: 'Share 60+ characters about your craft',
        done: (p?.description?.length ?? 0) >= 60,
        tab: 'profile'
      },
      {
        key: 'area',
        label: 'Service area',
        hint: 'Help nearby customers find you',
        done: !!p?.serviceArea?.trim(),
        tab: 'profile'
      },
      {
        key: 'address',
        label: 'Business address',
        hint: 'Set a base for your jobs',
        done: !!p?.address?.trim(),
        tab: 'profile'
      },
      {
        key: 'phone',
        label: 'Contact number',
        hint: 'Make it easy to reach you',
        done: !!p?.phone?.trim(),
        tab: 'profile'
      },
      {
        key: 'photo',
        label: 'Storefront photo',
        hint: 'A friendly face builds trust',
        done: !!p?.image,
        tab: 'profile'
      },
      {
        key: 'services',
        label: 'Live service',
        hint: 'Give customers something to book',
        done: liveServices > 0,
        tab: 'services'
      },
      {
        key: 'reviews',
        label: 'First review',
        hint: 'Finish a job to earn your first star',
        done: (p?.reviewCount ?? 0) > 0,
        tab: 'reviews'
      }
    ];
  }

  get completenessScore(): number {
    const items = this.completenessItems;
    if (!items.length) return 0;
    return Math.round((items.filter(i => i.done).length / items.length) * 100);
  }

  get completenessDone(): number {
    return this.completenessItems.filter(i => i.done).length;
  }

  get completenessTotal(): number {
    return this.completenessItems.length;
  }

  get completenessNext(): CompletenessItem | null {
    return this.completenessItems.find(i => !i.done) ?? null;
  }

  get completenessTone(): string {
    if (this.completenessScore >= 100) return 'complete';
    if (this.completenessScore >= 70) return 'strong';
    if (this.completenessScore >= 40) return 'growing';
    return 'starting';
  }

  get completenessHeadline(): string {
    if (this.completenessScore >= 100) return 'Storefront fully polished';
    if (this.completenessScore >= 70) return 'Almost there — a few finishing touches';
    if (this.completenessScore >= 40) return 'Your storefront is taking shape';
    return 'Let’s get your storefront ready';
  }

  openCompletenessStep(item: CompletenessItem): void {
    this.setTab(item.tab);
  }

  get serviceFormImage(): string {
    const category = this.categories.find(c => c.id === this.serviceForm.categoryId);
    return serviceImageUrl(this.serviceForm.imageUrl, category?.name);
  }

  get serviceFormHasCustomImage(): boolean {
    return !!this.serviceForm.imageUrl;
  }

  get pendingCategoryRequests(): CategoryRequest[] {
    return this.categoryRequests.filter(r => r.status === 'Pending');
  }

  get latestCategoryRequests(): CategoryRequest[] {
    return this.categoryRequests.slice(0, 4);
  }

  openCategoryRequest(): void {
    this.showCategoryRequest = true;
    this.categoryRequestName = '';
    this.categoryRequestDescription = '';
  }

  cancelCategoryRequest(): void {
    this.showCategoryRequest = false;
    this.categoryRequestName = '';
    this.categoryRequestDescription = '';
  }

  submitCategoryRequest(): void {
    const name = this.categoryRequestName.trim();
    if (name.length < 2) {
      this.toast.error('Enter a category name of at least 2 characters.');
      return;
    }

    this.savingCategoryRequest = true;
    this.portal
      .requestCategory({
        name,
        description: this.categoryRequestDescription.trim()
      })
      .subscribe({
        next: request => {
          this.categoryRequests = [request, ...this.categoryRequests];
          this.savingCategoryRequest = false;
          this.showCategoryRequest = false;
          this.categoryRequestName = '';
          this.categoryRequestDescription = '';
          this.toast.success(
            `"${request.name}" was sent to the admin team for approval.`
          );
        },
        error: err => {
          this.savingCategoryRequest = false;
          this.toast.error(
            err?.error?.message || 'Could not submit the category request.'
          );
        }
      });
  }

  refreshCategoryData(): void {
    this.refreshCategories(true);
    this.portal.getCategoryRequests().subscribe(requests => {
      this.categoryRequests = requests;
      this.toast.info('Categories and approval status refreshed.');
    });
  }

  get filteredCategories(): ServiceCategory[] {
    const q = this.categorySearch.trim().toLowerCase();
    if (!q) return this.categories;
    return this.categories.filter(c =>
      c.name.toLowerCase().includes(q) || (c.description && c.description.toLowerCase().includes(q))
    );
  }

  offerServiceInCategory(category: ServiceCategory): void {
    this.setTab('services');
    this.openNewService();
    this.serviceForm.categoryId = category.id;
  }

  serviceImage(service: ProviderServiceOffering): string {
    return serviceImageUrl(service.imageUrl, service.categoryName);
  }

  formatService(name: string): string {
    return titleCase(name);
  }

  get pendingCount(): number {
    return this.bookings.filter(b => b.status === 'Pending').length;
  }

  get todayCount(): number {
    return this.todayBookings.length;
  }

  get todayBookings(): ProviderBooking[] {
    const today = new Date().toISOString().slice(0, 10);
    const priority: Record<string, number> = { Pending: 0, Accepted: 1, Completed: 2, Cancelled: 3 };
    return this.bookings
      .filter(b => b.date === today && b.status !== 'Cancelled')
      .slice()
      .sort((a, b) => (priority[a.status] ?? 9) - (priority[b.status] ?? 9));
  }

  get thisMonthEarnings(): number {
    const month = new Date().toISOString().slice(0, 7);
    return this.bookings
      .filter(b => b.status === 'Completed' && (b.date || '').startsWith(month))
      .reduce((sum, b) => sum + Number(b.price || 0), 0);
  }

  get recentBookings(): ProviderBooking[] {
    return this.bookings.slice(0, 4);
  }

  telHref(phone: string | null | undefined): string | null {
    const digits = (phone || '').replace(/[^\d+]/g, '');
    return digits ? `tel:${digits}` : null;
  }

  get activeServices(): ProviderServiceOffering[] {
    return this.services.filter(s => s.isActive);
  }

  firstName(): string {
    return this.authService.currentUser?.fullName?.split(' ')[0] || 'there';
  }

  statusCount(status: string): number {
    return this.bookings.filter(b => b.status === status).length;
  }

  saveProfile(): void {
    if (!this.profileForm.businessName.trim()) {
      this.toast.error('Business name is required.');
      return;
    }
    if (!this.profileForm.serviceArea.trim()) {
      this.toast.error('Service area is required.');
      return;
    }
    if (!this.profileForm.address.trim()) {
      this.toast.error('Business address is required.');
      return;
    }
    if (this.isOnboarding) {
      if (!this.profileForm.categoryId) {
        this.toast.error('Choose the category you work in.');
        return;
      }
      if (!this.profileForm.serviceName.trim()) {
        this.toast.error('Add the first service you offer.');
        return;
      }
    }

    const request: ProviderProfileRequest = {
      businessName: this.profileForm.businessName.trim(),
      description: this.profileForm.description.trim(),
      serviceArea: this.profileForm.serviceArea.trim(),
      address: this.profileForm.address.trim(),
      phone: this.profileForm.phone.trim(),
      experience: Number(this.profileForm.experience) || 0,
      available: this.profile ? this.profile.available : true
    };

    if (this.isOnboarding) {
      request.categoryId = this.profileForm.categoryId!;
      request.serviceName = titleCase(this.profileForm.serviceName);
      request.serviceDescription = this.profileForm.serviceDescription.trim();
      request.basePrice = Number(this.profileForm.basePrice) || 0;
    }

    this.savingProfile = true;
    this.portal.saveProfile(request).subscribe({
      next: saved => {
        this.profile = saved;
        this.savingProfile = false;
        this.toast.success(
          this.isOnboarding
            ? 'Your provider storefront is live!'
            : 'Business profile updated.'
        );
        this.refreshAll();
        this.tab = 'overview';
      },
      error: err => {
        this.savingProfile = false;
        this.toast.error(err?.error?.message || 'Could not save your profile.');
      }
    });
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!/\.(jpe?g|png|webp)$/i.test(file.name)) {
      this.toast.error('Only JPG, PNG or WEBP images are allowed.');
      return;
    }

    this.uploadingPhoto = true;
    this.portal.uploadPhoto(file).subscribe({
      next: res => {
        if (this.profile) this.profile.image = res.imageUrl;
        this.uploadingPhoto = false;
        this.toast.success('Profile photo updated.');
        input.value = '';
      },
      error: err => {
        this.uploadingPhoto = false;
        input.value = '';
        this.toast.error(err?.error?.message || 'Photo upload failed.');
      }
    });
  }

  onServicePhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!/\.(jpe?g|png|webp)$/i.test(file.name)) {
      this.toast.error('Only JPG, PNG or WEBP images are allowed.');
      input.value = '';
      return;
    }

    this.uploadingServicePhoto = true;
    this.portal.uploadServicePhoto(file).subscribe({
      next: res => {
        this.serviceForm.imageUrl = res.imageUrl;
        this.uploadingServicePhoto = false;
        this.toast.success('Service photo added.');
        input.value = '';
      },
      error: err => {
        this.uploadingServicePhoto = false;
        input.value = '';
        this.toast.error(err?.error?.message || 'Service photo upload failed.');
      }
    });
  }

  removeServicePhoto(): void {
    this.serviceForm.imageUrl = null;
    this.toast.info('Using the category photo for this service.');
  }

  toggleAvailability(): void {
    if (!this.profile) return;
    const next = !this.profile.available;
    this.portal.setAvailability(next).subscribe({
      next: res => {
        if (this.profile) this.profile.available = res.available;
        this.toast.info(
          res.available
            ? 'You are now accepting new bookings.'
            : 'You are marked unavailable for new bookings.'
        );
      },
      error: () => this.toast.error('Could not update availability.')
    });
  }

  openNewService(): void {
    this.serviceForm = this.emptyServiceForm();
    this.showServiceForm = true;
  }

  editService(service: ProviderServiceOffering): void {
    this.serviceForm = {
      id: service.id,
      categoryId: service.categoryId,
      serviceName: service.serviceName,
      description: service.description,
      imageUrl: service.imageUrl ?? null,
      basePrice: service.basePrice,
      isActive: service.isActive
    };
    this.showServiceForm = true;
  }

  cancelServiceForm(): void {
    this.showServiceForm = false;
    this.serviceForm = this.emptyServiceForm();
  }

  saveService(): void {
    if (!this.serviceForm.categoryId) {
      this.toast.error('Please choose a category.');
      return;
    }
    if (!this.serviceForm.serviceName.trim()) {
      this.toast.error('Service name is required.');
      return;
    }
    if (Number(this.serviceForm.basePrice) < 0) {
      this.toast.error('Base price cannot be negative.');
      return;
    }

    const request: ProviderServiceRequest = {
      categoryId: Number(this.serviceForm.categoryId),
      serviceName: titleCase(this.serviceForm.serviceName),
      description: this.serviceForm.description.trim(),
      imageUrl: this.serviceForm.imageUrl,
      basePrice: Number(this.serviceForm.basePrice) || 0,
      isActive: this.serviceForm.isActive
    };

    this.savingService = true;
    const done = () => {
      this.savingService = false;
      this.showServiceForm = false;
      this.serviceForm = this.emptyServiceForm();
      this.reloadServices();
    };

    if (this.serviceForm.id) {
      this.portal.updateService(this.serviceForm.id, request).subscribe({
        next: () => {
          this.toast.success('Service updated.');
          done();
        },
        error: err => {
          this.savingService = false;
          this.toast.error(err?.error?.message || 'Could not update service.');
        }
      });
    } else {
      this.portal.addService(request).subscribe({
        next: () => {
          this.toast.success('Service added to your storefront.');
          done();
        },
        error: err => {
          this.savingService = false;
          this.toast.error(err?.error?.message || 'Could not add service.');
        }
      });
    }
  }

  toggleServiceActive(service: ProviderServiceOffering): void {
    const request: ProviderServiceRequest = {
      categoryId: service.categoryId,
      serviceName: service.serviceName,
      description: service.description,
      imageUrl: service.imageUrl ?? null,
      basePrice: service.basePrice,
      isActive: !service.isActive
    };
    this.portal.updateService(service.id, request).subscribe({
      next: updated => {
        const index = this.services.findIndex(s => s.id === updated.id);
        if (index >= 0) this.services[index] = updated;
        this.toast.info(
          updated.isActive ? 'Service is now visible.' : 'Service hidden from customers.'
        );
      },
      error: () => this.toast.error('Could not update the service.')
    });
  }

  deleteService(service: ProviderServiceOffering): void {
    const label = service.bookingCount > 0 ? 'hide' : 'delete';
    if (!confirm(`Are you sure you want to ${label} "${titleCase(service.serviceName)}"?`)) return;

    this.portal.deleteService(service.id).subscribe({
      next: () => {
        this.toast.success(
          service.bookingCount > 0
            ? 'Service hidden — past bookings are preserved.'
            : 'Service deleted.'
        );
        this.reloadServices();
      },
      error: () => this.toast.error('Could not remove the service.')
    });
  }

  setBookingStatus(booking: ProviderBooking, status: string): void {
    this.portal.updateBookingStatus(booking.id, status).subscribe({
      next: updated => {
        const index = this.bookings.findIndex(b => b.id === updated.id);
        if (index >= 0) this.bookings[index] = updated;
        this.toast.success(
          status === 'Accepted'
            ? 'Booking accepted.'
            : status === 'Completed'
              ? 'Booking marked as completed.'
              : 'Booking cancelled.'
        );
        this.portal.getStats().subscribe(stats => (this.stats = stats));
      },
      error: err =>
        this.toast.error(err?.error?.message || 'Could not update booking.')
    });
  }

  reloadServices(): void {
    this.portal.getServices().subscribe(list => (this.services = list));
    this.portal.getStats().subscribe(stats => (this.stats = stats));
  }

  exportBookingsCsv(): void {
    const rows = this.filteredBookings;
    if (!rows.length) {
      this.toast.info('No bookings match your current view.');
      return;
    }

    const escape = (value: unknown): string => {
      const text = value === null || value === undefined ? '' : String(value);
      return `"${text.replace(/"/g, '""')}"`;
    };

    const header = [
      'Booking ID',
      'Customer',
      'Email',
      'Phone',
      'Service',
      'Price',
      'Scheduled date',
      'Status',
      'Address',
      'Problem'
    ];

    const lines = [header.map(escape).join(',')];
    rows.forEach(b => {
      lines.push(
        [
          b.id,
          b.customerName,
          b.customerEmail,
          b.customerPhone,
          b.service,
          b.price,
          this.prettyDate(b.date),
          b.status,
          b.address,
          b.problem
        ]
          .map(escape)
          .join(',')
      );
    });

    const csv = '\uFEFF' + lines.join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const stamp = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `fixnear-bookings-${stamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    this.toast.success(`Exported ${rows.length} booking${rows.length === 1 ? '' : 's'} to CSV.`);
  }

  money(value: number): string {
    return `₹${Number(value || 0).toLocaleString('en-IN')}`;
  }

  mapUrl(
    address: string | null | undefined,
    latitude?: number | null,
    longitude?: number | null
  ): string {
    return mapsUrl(address, latitude, longitude);
  }

  hasExactPin(booking: ProviderBooking): boolean {
    return hasCoordinates(booking.latitude, booking.longitude);
  }

  prettyDate(value: string): string {
    if (!value) return '—';
    const date = new Date(value + 'T00:00:00');
    if (isNaN(date.getTime())) return value;
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  stars(rating: number): string {
    return '★★★★★'.slice(0, Math.round(rating)) + '☆☆☆☆☆'.slice(0, 5 - Math.round(rating));
  }

  private emptyProfileForm(): ProfileForm {
    return {
      businessName: '',
      description: '',
      serviceArea: '',
      address: '',
      phone: '',
      experience: 1,
      categoryId: null,
      serviceName: '',
      serviceDescription: '',
      basePrice: 0
    };
  }

  private emptyServiceForm(): ServiceForm {
    return {
      id: null,
      categoryId: null,
      serviceName: '',
      description: '',
      imageUrl: null,
      basePrice: 0,
      isActive: true
    };
  }
}
