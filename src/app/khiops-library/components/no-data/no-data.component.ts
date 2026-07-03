/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, computed, inject, input } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TranslateService } from '@ngstack/translate';

@Component({
  selector: 'kl-no-data',
  templateUrl: './no-data.component.html',
  imports: [FlexLayoutModule],
})
export class NoDataComponent {
  private readonly translate = inject(TranslateService);
  readonly message = input<string>();

  readonly text = computed(() =>
    this.translate.get(this.message() ?? 'NO_DATAS.DEFAULT'),
  );
}
