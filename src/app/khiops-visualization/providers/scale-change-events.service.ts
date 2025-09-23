/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ScaleChangeEvent {
  xScale: string;
  yScale: string;
}

@Injectable({
  providedIn: 'root',
})
export class ScaleChangeEventsService {
  private scaleChangeSubject = new Subject<ScaleChangeEvent>();

  public scaleChange$ = this.scaleChangeSubject.asObservable();

  /**
   * Emit a scale change event
   */
  emitScaleChange(event: ScaleChangeEvent): void {
    this.scaleChangeSubject.next(event);
  }
}
