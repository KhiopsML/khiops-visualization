/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type ImportantBadgeColor = 'green' | 'orange' | 'blue';

@Component({
  selector: 'kl-important-badge',
  templateUrl: './important-badge.component.html',
  styleUrls: ['./important-badge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportantBadgeComponent {
  readonly text = input<string>('');
  readonly color = input<ImportantBadgeColor | undefined>(undefined);
}
