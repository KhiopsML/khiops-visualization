/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Component,
  Input,
  AfterViewInit,
  OnDestroy,
  HostListener,
  ChangeDetectionStrategy,
  NgZone,
} from '@angular/core';
import { WatchResizeComponent } from '../watch-resize/watch-resize.component';
import { SelectableService } from './selectable.service';
import { ConfigService } from '@khiops-library/providers/config.service';
import { Subscription } from 'rxjs';

@Component({
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class SelectableComponent
  extends WatchResizeComponent
  implements OnDestroy, AfterViewInit
{
  @Input() public override id: string | undefined = undefined;
  private selectedServiceChangeSub: Subscription;

  constructor(
    public selectableService: SelectableService,
    public override ngzone: NgZone,
    public override configService: ConfigService,
  ) {
    super(ngzone, configService);

    // watch for changes and update css
    this.selectedServiceChangeSub =
      this.selectableService.selectedServiceChange.subscribe((value) => {
        if (this.id && value?.id) {
          const rootElement = this.configService.getRootElementDom();
          if (rootElement) {
            const el = rootElement.querySelector('#' + this.id.toString());
            if (el) {
              if (value.id.toString() === this.id.toString()) {
                el.classList.add('selected');
              } else {
                if (el?.classList) {
                  el.classList.remove('selected');
                }
              }
            }
          }
        }
      });
  }

  override ngAfterViewInit(): void {
    // Call ngAfterViewInit of extend component
    super.ngAfterViewInit();
  }

  ngOnDestroy() {
    this.selectedServiceChangeSub.unsubscribe();
  }

  @HostListener('click', ['$event'])
  onClick(event: any) {
    if (event.isTrusted) {
      this.selectableService.setSelectedArea(this);
    }
  }

  @HostListener('trustedClick')
  trustedClick() {
    this.selectableService.setSelectedArea(this);
  }

  /**
   * Triggers a click event to enable copy functionality
   * @param elt Optional HTML element to dispatch the event on
   * Otherwise, uses the component's id to find the element
   */
  public triggerClickEvent(elt?: HTMLElement) {
    const trustedClick = new CustomEvent('trustedClick', {
      bubbles: true,
      cancelable: true,
      composed: true,
    });
    let element: HTMLElement | undefined = elt;
    if (!element) {
      const rootElement = this.configService.getRootElementDom();
      if (rootElement) {
        const foundElement = rootElement.querySelector('#' + this.id);
        if (foundElement instanceof HTMLElement) {
          element = foundElement;
        }
      }
    }
    element?.dispatchEvent(trustedClick);
  }
}
