import { Component, Input } from '@angular/core';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { ICONS } from './icons.list';

@Component({
  selector: 'kl-icon',
  standalone: false,
  template: `<span [innerHTML]="svgContent"></span>`,
})
export class IconComponent {
  @Input() set name(value: string) {
    this.svgContent = this.sanitizer.bypassSecurityTrustHtml(
      ICONS[value] ?? '',
    );
  }
  @Input() size: number = 22;

  svgContent: SafeHtml = '';
  constructor(private sanitizer: DomSanitizer) {}
}
