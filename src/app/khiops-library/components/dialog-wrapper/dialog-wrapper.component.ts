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
  standalone: false,
})
export class DialogWrapperComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  public dialogContent$: Observable<DialogContentI>;

  @ViewChild('dynamicComponentContainer', {
    read: ViewContainerRef,
    static: false,
  })
  dynamicComponentContainer?: ViewContainerRef;

  private componentRef?: ComponentRef<any>;
  private subscription?: Subscription;

  constructor(private dialogService: DialogService) {
    this.dialogContent$ = this.dialogService.dialogContent$;
  }

  ngOnInit(): void {
    // Don't subscribe here - wait for view initialization
  }

  ngAfterViewInit(): void {
    // Now that the view is initialized, dynamicComponentContainer is available
    this.subscription = this.dialogContent$.subscribe((content) => {
      if (content.type === 'component' && content.componentType) {
        // If container not ready yet, defer to next tick
        if (!this.dynamicComponentContainer) {
          setTimeout(() => this.createDialogComponent(content), 0);
          return;
        }
        this.createDialogComponent(content);
      } else if (content.type === 'none') {
        this.clearDynamicComponent();
      }
    });
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
    const hostElement = this.componentRef.location
      .nativeElement as HTMLElement;
    hostElement.style.height = '100%';
    hostElement.style.width = '100%';
    hostElement.style.display = 'flex';
    hostElement.style.flexDirection = 'column';

    // Trigger change detection
    this.componentRef.changeDetectorRef.detectChanges();

    // Set component reference in service for cleanup
    this.dialogService.setComponentRef(this.componentRef);
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.clearDynamicComponent();
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
