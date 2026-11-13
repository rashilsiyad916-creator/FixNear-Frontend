import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FancyOption } from '../fancy-select/fancy-select.component';

export interface SearchEvent {
  service: string;
  location: string;
}

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css']
})
export class SearchBarComponent {
  @Input() serviceOptions: FancyOption[] = [];
  @Input() placeholder = 'Enter your area or city';
  @Input() compact = false;

  @Output() searchTriggered = new EventEmitter<SearchEvent>();

  service = '';
  location = '';
  loading = false;
  focused = false;

  onSearch(): void {
    this.loading = true;
    this.searchTriggered.emit({
      service: this.service,
      location: this.location
    });
    // Reset spinner after a brief moment (parent navigates away)
    setTimeout(() => (this.loading = false), 1200);
  }

  onClear(): void {
    this.location = '';
  }
}
