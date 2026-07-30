/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Component,
  effect,
  inject,
  signal,
  ViewChild,
  ViewContainerRef,
  ComponentRef,
  Injector,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import {
  DialogService,
  DialogContentI,
} from '@khiops-library/providers/dialog.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'kl-dialog-wrapper',
  templateUrl: './dialog-wrapper.component.html',
  styleUrls: ['./dialog-wrapper.component.scss'],
  imports: [CommonModule, FlexLayoutModule],
})
export class DialogWrapperComponent {
  public readonly dialogContent;

  private readonly dialogService = inject(DialogService);
  private readonly injector = inject(Injector);
  private readonly dynamicComponentContainer = signal<ViewContainerRef | null>(
    null,
  );

  @ViewChild('dynamicComponentContainer', {
    read: ViewContainerRef,
    static: false,
  })
  set dynamicContainer(container: ViewContainerRef | undefined) {
    this.dynamicComponentContainer.set(container ?? null);
  }

  private componentRef?: ComponentRef<any>;

  constructor() {
    this.dialogContent = toSignal(this.dialogService.dialogContent$, {
      initialValue: this.dialogService.getDialogContent(),
      injector: this.injector,
    });

    effect(() => {
      const content = this.dialogContent();
      const container = this.dynamicComponentContainer();

      if (!container) {
        return;
      }

      if (content.type === 'component' && content.componentType) {
        this.createDialogComponent(content, container);
      } else if (content.type === 'none') {
        this.clearDynamicComponent(container);
      }
    });
  }

  /**
   * Create the dialog component with data
   */
  private createDialogComponent(
    content: DialogContentI,
    container: ViewContainerRef,
  ): void {
    if (!content.componentType) {
      return;
    }

    // Clear previous component
    this.clearDynamicComponent(container);

    // Create new component dynamically
    this.componentRef = container.createComponent(content.componentType);

    // Pass data to component SYNCHRONOUSLY before change detection
    // This ensures data is available in component's ngAfterViewInit
    if (content.data && this.componentRef.instance) {
      Object.entries(content.data).forEach(([key, value]) => {
        this.componentRef?.setInput(key, value);
      });
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
      const primaryBtn = hostEl.querySelector<HTMLElement>(
        'button[mat-flat-button], button[color="warn"]',
      );
      primaryBtn?.focus();
    });
  }

  /**
   * Close the dialog
   */
  closeDialog(): void {
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
  private clearDynamicComponent(container?: ViewContainerRef | null): void {
    if (this.componentRef) {
      this.componentRef.destroy();
      this.componentRef = undefined;
    }
    if (container) {
      container.clear();
    }
  }
}
