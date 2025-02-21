/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, Input } from '@angular/core';
import { ZoomToolsEventsService } from '@khiops-library/components/zoom-tools/zoom-tools.service';

@Component({
    selector: 'kl-zoom-tools',
    templateUrl: './zoom-tools.component.html',
    styleUrls: ['./zoom-tools.component.scss'],
    standalone: false
})
export class ZoomToolsComponent {
  @Input() public alignment: string = 'column';

  constructor(private zoomToolsEventsService: ZoomToolsEventsService) {}

  onClickOnZoomIn() {
    this.zoomToolsEventsService.emitZoomIn();
  }

  onClickOnResetZoom() {
    this.zoomToolsEventsService.emitZoomReset();
  }

  onClickOnZoomOut() {
    this.zoomToolsEventsService.emitZoomOut();
  }
}
