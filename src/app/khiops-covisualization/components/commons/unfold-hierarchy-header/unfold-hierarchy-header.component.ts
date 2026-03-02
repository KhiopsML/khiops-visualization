/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

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
