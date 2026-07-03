/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngstack/translate';
import { ZoomToolsEventsService } from '@khiops-library/components/zoom-tools/zoom-tools.service';

@Component({
  selector: 'kl-zoom-tools',
  templateUrl: './zoom-tools.component.html',
  styleUrl: './zoom-tools.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    FlexLayoutModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    TranslateModule,
  ],
})
export class ZoomToolsComponent {
  public readonly alignment = input<string>('column');

  private readonly zoomToolsEventsService = inject(ZoomToolsEventsService);

  public onClickOnZoomIn(): void {
    this.zoomToolsEventsService.emitZoomIn();
  }

  public onClickOnResetZoom(): void {
    this.zoomToolsEventsService.emitZoomReset();
  }

  public onClickOnZoomOut(): void {
    this.zoomToolsEventsService.emitZoomOut();
  }
}
