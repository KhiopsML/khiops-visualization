/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
import { Injectable, Type, ComponentRef } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

export interface DialogContentI {
  type: 'component' | 'none';
  componentType?: Type<any>;
  data?: any;
  config?: DialogConfigI;
}

export interface DialogConfigI {
  width?: string;
  height?: string;
  maxWidth?: string;
  maxHeight?: string;
  disableClose?: boolean;
  hidden?: boolean;
  panelClass?: string;
  noOverlay?: boolean;
}

export interface DialogRef<T = any> {
  afterClosed(): Observable<T>;
  close(result?: T): void;
}

@Injectable()
export class DialogService {
  private dialogContentSubject = new BehaviorSubject<DialogContentI>({
    type: 'none',
  });

  public dialogContent$: Observable<DialogContentI> =
    this.dialogContentSubject.asObservable();

  private componentRef?: ComponentRef<any>;
  private afterClosedSubject = new Subject<any>();

  constructor() {}

  /**
   * Open a dialog with any component
   * @param componentType the component type to display
   * @param config dialog configuration
   * @param data optional data to pass to the component
   */
  openDialog<T>(
    componentType: Type<T>,
    config?: DialogConfigI,
    data?: any,
  ): DialogRef<any> {
    // Reset the subject for new dialog
    this.afterClosedSubject = new Subject<any>();

    this.dialogContentSubject.next({
      type: 'component',
      componentType: componentType,
      data: data,
      config: config || {},
    });

    // Return a DialogRef object
    return {
      afterClosed: () => this.afterClosedSubject.asObservable(),
      close: (result?: any) => this.closeDialog(result),
    };
  }

  /**
   * Close the dialog
   */
  closeDialog(result?: any): void {
    if (this.componentRef) {
      this.componentRef.destroy();
      this.componentRef = undefined;
    }

    // Emit the result and complete the subject
    this.afterClosedSubject.next(result);
    this.afterClosedSubject.complete();

    this.dialogContentSubject.next({
      type: 'none',
    });
  }

  /**
   * Get current dialog content
   */
  getDialogContent(): DialogContentI {
    return this.dialogContentSubject.value;
  }

  /**
   * Set component reference for cleanup
   */
  setComponentRef(componentRef: ComponentRef<any>): void {
    this.componentRef = componentRef;
  }
}
