import { Component, Input, AfterViewInit, NgZone } from '@angular/core';
import { ConfigService } from '@khiops-library/providers/config.service';

/**
 * Component that watches for resize events on a specified element.
 *
 * This component uses the ResizeObserver API to monitor changes in the size of an element
 * and triggers a callback when the size changes.
 *
 * @remarks
 * The component requires an element ID to be provided via the `id` input property.
 * The `watchResize` input property enables or disables the resize observation.
 *
 * @property {any} id - The ID of the element to observe for resize events.
 * @property {boolean} watchResize - Flag to enable or disable resize observation.
 *
 */
@Component({
  template: '',
})
export class WatchResizeComponent implements AfterViewInit {
  [sizeChanged: string]: any; // Index signature for sizeChanged callback

  @Input() public id: any;
  @Input() private watchResize = true;
  private el: HTMLElement | null;

  constructor(
    public ngzone: NgZone,
    public configService: ConfigService,
  ) {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.watchResize && this.id) {
        // @ts-ignore
        const observer = new ResizeObserver((entries) => {
          entries.forEach((entry) => {
            this.ngzone.run(() => {
              try {
                this.sizeChanged(entry.contentRect.width);
              } catch (e) {}
            });
          });
        });
        this.el = this.configService
          .getRootElementDom()
          .querySelector<HTMLElement>('#' + this.id);
        if (this.el) {
          observer.observe(this.el);
        }
      }
    });
  }
}
