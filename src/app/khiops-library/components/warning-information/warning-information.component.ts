/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'kl-warning-information',
  templateUrl: './warning-information.component.html',
  styleUrls: ['./warning-information.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class WarningInformationComponent {
  @Input() text: string = '';
  @Input() tooltipText: string = '';
  @Input() variant: 'default' | 'inline' = 'default';
}
