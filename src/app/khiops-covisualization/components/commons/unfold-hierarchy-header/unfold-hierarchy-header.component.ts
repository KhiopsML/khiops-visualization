/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Component,
  input,
  output,
} from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TranslateModule } from '@ngstack/translate';
import { MatButtonModule } from '@angular/material/button';
import { KhiopsLibraryModule } from '@khiops-library/khiops-library.module';

@Component({
  selector: 'kl-unfold-hierarchy-header',
  templateUrl: './unfold-hierarchy-header.component.html',
  styleUrls: ['./unfold-hierarchy-header.component.scss'],
  imports: [
    FlexLayoutModule,
    TranslateModule,
    MatButtonModule,
    KhiopsLibraryModule,
  ],
})
export class UnfoldHierarchyHeaderComponent {
  readonly loading = input<boolean>(false);
  readonly cancel = output<void>();
  readonly save = output<void>();

  onClickOnCancel(): void {
    this.cancel.emit();
  }

  onClickOnSave(): void {
    this.save.emit();
  }
}
