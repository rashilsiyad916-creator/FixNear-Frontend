
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Provider } from 'src/models/provider';
import { FixnearService, providerCategories } from '../../services/fixnear.service';
import { ToastService } from '../../services/toast.service';
import { FancyOption } from '../../shared/fancy-select/fancy-select.component';
import { SearchEvent } from '../../shared/search-bar/search-bar.component';
import { titleCase } from '../../shared/text-case';
import { serviceImageUrl } from '../../shared/service-image';

@Component({
  selector: 'app-providers',
  templateUrl: './providers.component.html',
  styleUrls: ['./providers.component.css']
})
export class ProvidersComponent implements OnInit, OnDestroy {
  category = '';
  area = '';
  sort = '';
  availableOnly = false;
  favoritesOnly = false;
  providers: Provider[] = [];
  favCount = 0;
  private favSub?: Subscription;

  quickCategories = [
    { name: 'Home Nursing', icon: '🩺' },
    { name: 'Pet Grooming', icon: '🐾' },
    { name: 'Salon at Home', icon: '💇‍♀️' },
    { name: 'Electrician', icon: '⚡' },
    { name: 'Plumber', icon: '🔧' },
    { name: 'AC Repair', icon: '❄️' },
    { name: 'Inverter Service', icon: '🔋' },
    { name: 'Cleaning', icon: '🧹' }
  ];

  constructor(
    private route: ActivatedRoute,
    public fixnearService: FixnearService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.fixnearService.loadCategories().subscribe();
    // Always refresh discovery so a service a provider just added appears
    // under its own category without needing a full page reload.
    this.fixnearService.loadProviders(true).subscribe(() => this.search());
    this.route.queryParams.subscribe(params => {
      this.category = params['category'] || '';
      this.area = params['area'] || '';
      this.search();
    });
    this.favSub = this.fixnearService.favorites$.subscribe(favs => {
      this.favCount = favs.length;
      if (this.favoritesOnly) {
        this.search();
      }
    });
  }

  ngOnDestroy(): void {
    this.favSub?.unsubscribe();
  }

  toggleCategory(name: string): void {
    this.category = this.category === name ? '' : name;
    this.search();
  }

  get categoryOptions(): FancyOption[] {
    return [
      { value: '', label: 'All categories', icon: '✨' },
      ...this.fixnearService.categories.map(c => ({
        value: c.name,
        label: c.name,
        icon: c.icon || '🛠️'
      }))
    ];
  }

  categoriesFor(provider: Provider): string[] {
    return providerCategories(provider);
  }

  extraCategories(provider: Provider, limit = 2): string[] {
    return this.categoriesFor(provider).slice(1, limit + 1);
  }

  /** Services that belong to the category currently being filtered. */
  matchedServices(provider: Provider): string[] {
    if (!this.category) return [];
    const target = this.category.toLowerCase();
    return (provider.services || [])
      .filter(s => s.category.toLowerCase() === target)
      .map(s => s.serviceName);
  }

  cardServices(provider: Provider, limit = 2): string[] {
    const names = this.category
      ? this.matchedServices(provider)
      : (provider.services || []).map(s => s.serviceName);
    return names.slice(0, limit).map(titleCase);
  }

  hiddenServiceCount(provider: Provider, limit = 2): number {
    const total = this.category
      ? this.matchedServices(provider).length
      : (provider.services || []).length;
    return Math.max(0, total - limit);
  }

  formatService(name: string): string {
    return titleCase(name);
  }

  providerImage(provider: Provider): string {
    return serviceImageUrl(provider.image, provider.category);
  }

  onProviderImageError(provider: Provider, event: Event): void {
    const img = event.target as HTMLImageElement;
    const fallback = serviceImageUrl(null, provider.category);
    if (img && img.src !== new URL(fallback, document.baseURI).href) {
      img.src = fallback;
    }
  }

  get sortOptions(): FancyOption[] {
    return [
      { value: '', label: 'Recommended', icon: '✨' },
      { value: 'rating', label: 'Top rated', icon: '⭐' },
      { value: 'price-asc', label: 'Price: low to high', icon: '💸' },
      { value: 'price-desc', label: 'Price: high to low', icon: '💰' },
      { value: 'experience', label: 'Most experienced', icon: '🏆' }
    ];
  }

  onCategoryChange(value: string): void {
    this.category = value;
    this.search();
  }

  onSortChange(value: string): void {
    this.sort = value;
    this.search();
  }

  onSearchBar(event: SearchEvent): void {
    this.category = event.service;
    this.area = event.location;
    this.search();
  }

  search(): void {
    let results = this.fixnearService.searchProviders(
      this.category,
      this.area
    );

    if (this.availableOnly) {
      results = results.filter(p => p.available);
    }

    if (this.favoritesOnly) {
      results = results.filter(p => this.fixnearService.isFavorite(p.id));
    }

    this.providers = this.sortProviders(results);
  }

  sortProviders(list: Provider[]): Provider[] {
    switch (this.sort) {
      case 'rating':
        return [...list].sort((a, b) => b.rating - a.rating);
      case 'price-asc':
        return [...list].sort((a, b) => a.price - b.price);
      case 'price-desc':
        return [...list].sort((a, b) => b.price - a.price);
      case 'experience':
        return [...list].sort((a, b) => b.experience - a.experience);
      default:
        return list;
    }
  }

  isFavorite(id: number): boolean {
    return this.fixnearService.isFavorite(id);
  }

  toggleFavorite(provider: Provider, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    const added = this.fixnearService.toggleFavorite(provider.id);
    this.toast.info(
      added
        ? `♥ ${provider.name} saved to favorites`
        : `Removed ${provider.name} from favorites`
    );
  }

  clearFilters(): void {
    this.category = '';
    this.area = '';
    this.sort = '';
    this.availableOnly = false;
    this.favoritesOnly = false;
    this.search();
  }

  get hasActiveFilters(): boolean {
    return !!(this.category || this.area || this.availableOnly ||
              this.favoritesOnly || this.sort);
  }

  get hasOtherFilters(): boolean {
    return !!(this.category || this.area || this.availableOnly || this.sort);
  }
}
