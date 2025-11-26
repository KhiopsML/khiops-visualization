import { Injectable, Type, ComponentRef } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

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
  panelClass?: string;
}

@Injectable()
export class DialogService {
  private dialogContentSubject = new BehaviorSubject<DialogContentI>({
    type: 'none',
  });

  public dialogContent$: Observable<DialogContentI> =
    this.dialogContentSubject.asObservable();

  private componentRef?: ComponentRef<any>;

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
  ): ComponentRef<T> | undefined {
    this.dialogContentSubject.next({
      type: 'component',
      componentType: componentType,
      data: data,
      config: config || {},
    });
    return this.componentRef as ComponentRef<T>;
  }

  /**
   * Close the dialog
   */
  closeDialog(): void {
    if (this.componentRef) {
      this.componentRef.destroy();
      this.componentRef = undefined;
    }
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
