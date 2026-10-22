/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ViewContainerRef,
  ComponentRef,
  OnDestroy,
  ChangeDetectionStrategy,
  ElementRef,
  Renderer2,
} from '@angular/core';
import {
  DialogService,
  DialogContentI,
} from '@khiops-library/providers/dialog.service';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'kl-dialog-wrapper',
  templateUrl: './dialog-wrapper.component.html',
  styleUrls: ['./dialog-wrapper.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class DialogWrapperComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  public dialogContent$: Observable<DialogContentI>;
  public sidePanelHidden$: Observable<boolean>;
  public isSidePanelDragOver = false;
  private sidePanelDragCounter = 0;
  public sidePanelBounds?: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  private sidePanelResizeObserver?: ResizeObserver;
  private removeTabActivationListeners?: () => void;
  private sidePanelVisibilitySubscription?: Subscription;

  @ViewChild('dialogWrapper')
  private dialogWrapper?: ElementRef<HTMLElement>;

  @ViewChild('dynamicComponentContainer', {
    read: ViewContainerRef,
    static: false,
  })
  dynamicComponentContainer?: ViewContainerRef;

  private componentRef?: ComponentRef<any>;
  private subscription?: Subscription;

  constructor(
    private dialogService: DialogService,
    private elementRef: ElementRef<HTMLElement>,
    private renderer: Renderer2,
  ) {
    this.dialogContent$ = this.dialogService.dialogContent$;
    this.sidePanelHidden$ = this.dialogService.sidePanelHidden$;
  }

  ngOnInit(): void {
    // Don't subscribe here - wait for view initialization
  }

  ngAfterViewInit(): void {
    this.sidePanelVisibilitySubscription = this.sidePanelHidden$.subscribe(
      (hidden) => {
        if (this.dialogWrapper) {
          this.renderer.setProperty(
            this.dialogWrapper.nativeElement,
            'hidden',
            hidden || !!this.dialogService.getDialogContent().config?.hidden,
          );
        }
      },
    );
    // Now that the view is initialized, dynamicComponentContainer is available
    this.subscription = this.dialogContent$.subscribe((content) => {
      this.updateSidePanelContainer(!!content.config?.sidePanel);
      if (content.type === 'component' && content.componentType) {
        // If container not ready yet, defer to next tick
        if (!this.dynamicComponentContainer) {
          setTimeout(() => this.createDialogComponent(content), 0);
          return;
        }
        this.createDialogComponent(content);
      } else if (content.type === 'none') {
        this.sidePanelDragCounter = 0;
        this.isSidePanelDragOver = false;
        this.clearDynamicComponent();
      }
    });
  }

  private updateSidePanelContainer(isSidePanel: boolean): void {
    this.sidePanelResizeObserver?.disconnect();
    this.removeTabActivationListeners?.();
    this.removeTabActivationListeners = undefined;
    this.sidePanelBounds = undefined;
    if (!isSidePanel) {
      return;
    }

    const appElement = this.elementRef.nativeElement.closest(
      '.mat-app-background',
    );
    const tabGroup = appElement?.querySelector('#main-tab-group');
    const tabBody = tabGroup?.querySelector<HTMLElement>(
      ':scope > .mat-mdc-tab-body-wrapper',
    );
    const tabHeader = tabGroup?.querySelector<HTMLElement>(
      ':scope > mat-tab-header',
    );
    if (!appElement || !tabBody || !tabHeader) {
      return;
    }

    const onTabActivation = (event: Event) => {
      if (
        event instanceof KeyboardEvent &&
        event.key !== 'Enter' &&
        event.key !== ' '
      ) {
        return;
      }
      const tab = (event.target as Element | null)?.closest('[role="tab"]');
      if (
        tab &&
        tab.getAttribute('aria-selected') !== 'true' &&
        tab.getAttribute('aria-disabled') !== 'true'
      ) {
        this.dialogService.hideSidePanelForTabChange();
      }
    };
    tabHeader.addEventListener('click', onTabActivation, true);
    tabHeader.addEventListener('keydown', onTabActivation, true);
    this.removeTabActivationListeners = () => {
      tabHeader.removeEventListener('click', onTabActivation, true);
      tabHeader.removeEventListener('keydown', onTabActivation, true);
    };

    const updateBounds = () => {
      const wrapper = this.dialogWrapper?.nativeElement;
      const parent = wrapper?.offsetParent;
      if (!parent) {
        return;
      }
      const parentRect = parent.getBoundingClientRect();
      const bodyRect = tabBody.getBoundingClientRect();
      const headerRect = tabHeader.getBoundingClientRect();
      const appRect = appElement.getBoundingClientRect();
      const top = bodyRect.height > 0 ? bodyRect.top : headerRect.bottom;
      this.sidePanelBounds = {
        top: top - parentRect.top + parent.scrollTop - parent.clientTop,
        left:
          bodyRect.left -
          parentRect.left +
          parent.scrollLeft -
          parent.clientLeft,
        width: bodyRect.width,
        height: Math.max(
          0,
          (bodyRect.height > 0 ? bodyRect.bottom : appRect.bottom) - top,
        ),
      };
    };

    updateBounds();
    this.sidePanelResizeObserver = new ResizeObserver(updateBounds);
    this.sidePanelResizeObserver.observe(appElement);
    this.sidePanelResizeObserver.observe(tabHeader);
    this.sidePanelResizeObserver.observe(tabBody);
  }

  onSidePanelDragEnter(event: DragEvent, isSidePanel?: boolean): void {
    if (!isSidePanel) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.sidePanelDragCounter++;
    if (this.sidePanelDragCounter === 1) {
      this.isSidePanelDragOver = true;
    }
  }

  onSidePanelDragOver(event: DragEvent, isSidePanel?: boolean): void {
    if (!isSidePanel) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
  }

  onSidePanelDragLeave(event: DragEvent, isSidePanel?: boolean): void {
    if (!isSidePanel) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.sidePanelDragCounter = Math.max(0, this.sidePanelDragCounter - 1);
    if (this.sidePanelDragCounter === 0) {
      this.isSidePanelDragOver = false;
    }
  }

  onSidePanelDrop(event: DragEvent, isSidePanel?: boolean): void {
    if (!isSidePanel) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.sidePanelDragCounter = 0;
    this.isSidePanelDragOver = false;
  }

  /**
   * Create the dialog component with data
   */
  private createDialogComponent(content: DialogContentI): void {
    if (!this.dynamicComponentContainer || !content.componentType) {
      return;
    }

    // Clear previous component
    this.clearDynamicComponent();

    // Create new component dynamically
    this.componentRef = this.dynamicComponentContainer.createComponent(
      content.componentType,
    );

    // Pass data to component SYNCHRONOUSLY before change detection
    // This ensures data is available in component's ngAfterViewInit
    if (content.data && this.componentRef.instance) {
      Object.assign(this.componentRef.instance, content.data);
    }

    // Set component host element to fill available space
    const hostElement = this.componentRef.location.nativeElement as HTMLElement;
    hostElement.style.height = '100%';
    hostElement.style.width = '100%';
    hostElement.style.display = 'flex';
    hostElement.style.flexDirection = 'column';

    // Trigger change detection
    this.componentRef.changeDetectorRef.detectChanges();

    // Set component reference in service for cleanup
    this.dialogService.setComponentRef(this.componentRef);

    // Focus the primary action button after the dialog is rendered
    const hostEl = this.componentRef.location.nativeElement as HTMLElement;
    setTimeout(() => {
      const primaryBtn =
        hostEl.querySelector<HTMLElement>('button[mat-flat-button]') ??
        hostEl.querySelector<HTMLElement>('button');
      primaryBtn?.focus();
    });
  }

  ngOnDestroy(): void {
    this.sidePanelResizeObserver?.disconnect();
    this.removeTabActivationListeners?.();
    this.sidePanelVisibilitySubscription?.unsubscribe();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.clearDynamicComponent();
  }

  /**
   * Close the dialog
   */
  closeDialog(): void {
    this.sidePanelDragCounter = 0;
    this.isSidePanelDragOver = false;
    this.dialogService.closeDialog();
  }

  /**
   * Handle backdrop click with disableClose check
   */
  onBackdropClick(): void {
    const currentContent = this.dialogService.getDialogContent();
    if (!currentContent.config?.disableClose) {
      this.closeDialog();
    }
  }

  /**
   * Clear the dynamic component
   */
  private clearDynamicComponent(): void {
    if (this.componentRef) {
      this.componentRef.destroy();
      this.componentRef = undefined;
    }
    if (this.dynamicComponentContainer) {
      this.dynamicComponentContainer.clear();
    }
  }
}
