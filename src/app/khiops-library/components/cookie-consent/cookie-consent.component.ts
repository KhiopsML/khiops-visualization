/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

@Component({
  selector: 'kl-cookie-consent',
  templateUrl: './cookie-consent.component.html',
  styleUrls: ['./cookie-consent.component.scss'],
  standalone: false,
})
export class CookieConsentComponent {
  @Input() allowCookies: boolean = false;
  @Output() allowCookiesChange = new EventEmitter<boolean>();

  onChange(newValue: MatSlideToggleChange) {
    this.allowCookies = newValue.checked;
    this.allowCookiesChange.emit(newValue.checked);
  }
}
