/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ZoomToolsEventsService {
  private readonly zoomIn = new Subject<void>();
  public readonly zoomIn$ = this.zoomIn.asObservable();

  public emitZoomIn(): void {
    this.zoomIn.next();
  }

  private readonly zoomReset = new Subject<void>();
  public readonly zoomReset$ = this.zoomReset.asObservable();

  public emitZoomReset(): void {
    this.zoomReset.next();
  }

  private readonly zoomOut = new Subject<void>();
  public readonly zoomOut$ = this.zoomOut.asObservable();

  public emitZoomOut(): void {
    this.zoomOut.next();
  }
}
