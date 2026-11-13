import { Directive, ElementRef, AfterViewInit } from '@angular/core';

@Directive({ selector: '[appReveal]' })
export class RevealDirective implements AfterViewInit {
  constructor(private el: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    const node = this.el.nativeElement;
    node.classList.add('reveal');

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            node.classList.add('visible');
            observer.unobserve(node);
          }
        });
      },
      { threshold: 0.12 }
    );

    observer.observe(node);
  }
}
