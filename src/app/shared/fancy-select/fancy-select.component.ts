import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output
} from '@angular/core';

export interface FancyOption {
  value: string;
  label: string;
  icon?: string;
}

@Component({
  selector: 'app-fancy-select',
  templateUrl: './fancy-select.component.html',
  styleUrls: ['./fancy-select.component.css']
})
export class FancySelectComponent {
  @Input() options: FancyOption[] = [];
  @Input() model = '';
  @Input() placeholder = 'Choose…';
  @Input() accent: 'violet' | 'sky' | 'pink' | 'mint' = 'violet';
  @Input() bare = false;
  @Output() modelChange = new EventEmitter<string>();

  open = false;

  constructor(private host: ElementRef<HTMLElement>) {}

  get selected(): FancyOption | undefined {
    return this.options.find(o => o.value === this.model);
  }

  toggle(): void {
    this.open = !this.open;
  }

  select(option: FancyOption): void {
    if (option.value !== this.model) {
      this.model = option.value;
      this.modelChange.emit(option.value);
    }
    this.open = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.open && !this.host.nativeElement.contains(event.target as Node)) {
      this.open = false;
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.open = false;
  }
}
