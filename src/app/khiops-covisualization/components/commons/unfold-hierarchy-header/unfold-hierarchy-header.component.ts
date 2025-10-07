import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'kl-unfold-hierarchy-header',
  templateUrl: './unfold-hierarchy-header.component.html',
  styleUrls: ['./unfold-hierarchy-header.component.scss'],
  standalone: false,
})
export class UnfoldHierarchyHeaderComponent {
  @Input() loading: boolean = false;
  @Output() cancel = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();

  onClickOnCancel(): void {
    this.cancel.emit();
  }

  onClickOnSave(): void {
    this.save.emit();
  }
}
