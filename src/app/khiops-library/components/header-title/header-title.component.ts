/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Component,
  ChangeDetectionStrategy,
  computed,
  input,
} from '@angular/core';

@Component({
  selector: 'kl-header-title',
  templateUrl: './header-title.component.html',
  styleUrls: ['./header-title.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class HeaderTitleComponent {
  readonly title = input<string>('');

  readonly displayedTitle = computed(() => {
    const value = this.title().trim();
    return value ? value.split(/\s+/) : [];
  });

  readonly appName = computed(() => {
    const secondWord = this.displayedTitle()[1];
    return secondWord?.toLowerCase();
  });
}
