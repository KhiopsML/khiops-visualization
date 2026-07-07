/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Component,
  ComponentRef,
  effect,
  inject,
  OnDestroy,
  ViewContainerRef,
  viewChild,
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
export class DialogWrapperComponent implements OnDestroy {
  private readonly dialogService = inject(DialogService);

  public readonly dialogContent = toSignal(this.dialogService.dialogContent$, {
    initialValue: { type: 'none' } as DialogContentI,
  });

  private readonly dynamicComponentContainer = viewChild(
    'dynamicComponentContainer',
    { read: ViewContainerRef },
  );

  private componentRef?: ComponentRef<any>;

  constructor() {
    effect(() => {
      const content = this.dialogContent();
      const container = this.dynamicComponentContainer();

      if (content.type === 'none') {
        this.clearDynamicComponent(container);
        return;
      }

      if (content.type === 'component' && content.componentType && container) {
        this.createDialogComponent(content, container);
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

    // Pass data via setInput() to support both @Input() and signal input()
    if (content.data && this.componentRef) {
      Object.entries(content.data).forEach(([key, value]) => {
        try {
          this.componentRef!.setInput(key, value);
        } catch {
          // Fallback for non-input properties
          (this.componentRef!.instance as Record<string, unknown>)[key] = value;
        }
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

  ngOnDestroy(): void {
    this.clearDynamicComponent(this.dynamicComponentContainer());
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
    const currentContent = this.dialogContent();
    if (!currentContent.config?.disableClose) {
      this.closeDialog();
    }
  }

  /**
   * Clear the dynamic component
   */
  private clearDynamicComponent(container?: ViewContainerRef): void {
    if (this.componentRef) {
      this.componentRef.destroy();
      this.componentRef = undefined;
    }
    if (container) {
      container.clear();
    }
  }
}
