/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ZoomToolsEventsService {
  private zoomIn = new Subject<string>();
  zoomIn$ = this.zoomIn.asObservable();
  emitZoomIn() {
    this.zoomIn.next('');
  }

  private zoomReset = new Subject<string>();
  zoomReset$ = this.zoomReset.asObservable();
  emitZoomReset() {
    this.zoomReset.next('');
  }

  private zoomOut = new Subject<string>();
  zoomOut$ = this.zoomOut.asObservable();
  emitZoomOut() {
    this.zoomOut.next('');
  }
}
