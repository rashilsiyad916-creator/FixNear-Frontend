
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FixnearService } from '../../services/fixnear.service';
import { FancyOption } from '../../shared/fancy-select/fancy-select.component';
import { SearchEvent } from '../../shared/search-bar/search-bar.component';
import { serviceImageUrl } from '../../shared/service-image';
import { Provider } from 'src/models/provider';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  category = '';
  area = '';
  popularAreas: string[] = [];

  testimonials = [
    { name: 'Sarah Mathew', role: 'Customer · Tirur', rating: 5, quote: 'Booked an electrician at 9 PM, he came the next morning. FixNear made a stressful situation effortless.' },
    { name: 'Arun Pillai', role: 'Customer · Kottakkal', rating: 5, quote: 'Compared three plumbers, checked reviews, and booked in under two minutes. Leak fixed same day.' },
    { name: 'Nisha Rahman', role: 'Customer · Malappuram', rating: 4, quote: 'The upfront pricing was a lifesaver. No surprises, no haggling — just honest work.' }
  ];

  faqs = [
    { q: 'How do I book a professional?', a: 'Browse categories or search by area, open a provider profile, pick a date, describe your issue, and send a request. You\'ll get confirmation once they accept.', open: true },
    { q: 'Is FixNear free to use?', a: 'Yes. Browsing, searching, and booking requests are completely free. You only pay the provider for the service completed.' },
    { q: 'Are professionals verified?', a: 'Every provider goes through a background check and identity verification before joining the platform.' },
    { q: 'Can I cancel a booking?', a: 'Yes. Open My Bookings and cancel any Pending request before the provider confirms. Free rescheduling support is also available.' },
    { q: 'What areas do you cover?', a: 'We currently serve Tirur, Kottakkal, Malappuram, and surrounding areas — with more locations launching soon.' }
  ];

  constructor(
    public fixnearService: FixnearService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fixnearService.loadCategories().subscribe();
    // Refresh so category counts include services providers added recently.
    this.fixnearService.loadProviders(true).subscribe(() => {
      this.popularAreas = this.fixnearService.getPopularAreas().slice(0, 4);
    });
  }

  searchByArea(area: string): void {
    this.area = area;
    this.category = '';
    this.search();
  }

  get serviceOptions(): FancyOption[] {
    return [
      { value: '', label: 'All services', icon: '✨' },
      ...this.fixnearService.categories.map(c => ({
        value: c.name,
        label: c.name,
        icon: c.icon || '🛠️'
      }))
    ];
  }

  search(): void {
    this.router.navigate(['/providers'], {
      queryParams: {
        category: this.category,
        area: this.area
      }
    });
  }

  onSearch(event: SearchEvent): void {
    this.category = event.service;
    this.area = event.location;
    this.search();
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
}
