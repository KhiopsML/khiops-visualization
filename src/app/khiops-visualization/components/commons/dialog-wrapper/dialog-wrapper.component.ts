import { 
  Component, 
  OnInit, 
  ViewChild, 
  ViewContainerRef, 
  ComponentRef, 
  OnDestroy 
} from '@angular/core';
import { DialogService, DialogContentI } from '@khiops-library/providers/dialog.service';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-dialog-wrapper',
  templateUrl: './dialog-wrapper.component.html',
  styleUrls: ['./dialog-wrapper.component.scss'],
  standalone: false,
})
export class DialogWrapperComponent implements OnInit, OnDestroy {
  public dialogContent$: Observable<DialogContentI>;

  @ViewChild('dynamicComponentContainer', { read: ViewContainerRef, static: false })
  dynamicComponentContainer?: ViewContainerRef;

  private componentRef?: ComponentRef<any>;
  private subscription?: Subscription;

  constructor(private dialogService: DialogService) {
    this.dialogContent$ = this.dialogService.dialogContent$;
  }

  ngOnInit(): void {
    this.subscription = this.dialogContent$.subscribe((content) => {
      console.log('🚀 Dialog content changed:', content);
      
      if (content.type === 'component' && content.componentType) {
        // Wait for view to be ready
        setTimeout(() => {
          if (this.dynamicComponentContainer && content.componentType) {
            console.log('✅ Container found, creating component');
            // Clear previous component
            this.clearDynamicComponent();
            
            // Create new component dynamically
            this.componentRef = this.dynamicComponentContainer.createComponent(content.componentType);
            console.log('✅ Component created:', this.componentRef.instance);
            
            // Pass data to component if it exists
            if (content.data && this.componentRef.instance) {
              Object.assign(this.componentRef.instance, content.data);
              console.log('✅ Data assigned:', content.data);
            }
            
            // Trigger change detection
            this.componentRef.changeDetectorRef.detectChanges();
            
            // Set component reference in service for cleanup
            this.dialogService.setComponentRef(this.componentRef);
          } else {
            console.error('❌ dynamicComponentContainer not found!');
          }
        }, 0);
      } else if (content.type === 'none') {
        this.clearDynamicComponent();
      }
    });
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
