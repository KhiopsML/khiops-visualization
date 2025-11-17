/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Injectable } from '@angular/core';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root',
})
export class TrackerService {
  constructor(private configService: ConfigService) {}

  /**
   * Initializes the tracker service.
   * Always enables tracking without cookies since file:// protocol blocks cookies anyway.
   * Uses Matomo's cookieless tracking mode which complies with privacy laws when no
   * personal data is stored.
   */
  initTracker() {
    // Enable cookieless tracking mode - this automatically enables tracking
    // without cookies and without storing personal identifiers
    this.configService
      .getConfig()
      .onSendEvent?.({ message: 'requireCookieConsent' });
  }

  /**
   * Tracks an event by sending it to the config service.
   * @param category - The category of the event.
   * @param action - The action of the event.
   * @param name - The name of the event (optional).
   * @param value - The value of the event (optional).
   */
  trackEvent(category: string, action: string, name?: string, value?: any) {
    this.configService.getConfig().onSendEvent?.({
      message: 'trackEvent',
      data: {
        category: category,
        action: action,
        name: name,
        value: value,
      },
    });
  }
}
