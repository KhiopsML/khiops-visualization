/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  inject,
  computed,
  afterNextRender,
} from '@angular/core';
import { KhiopsLibraryService } from '../../providers/khiops-library.service';
import { LS } from '../../enum/ls';
import { Ls } from '@khiops-library/providers/ls.service';

@Component({
  selector: 'kl-graph-header',
  templateUrl: './graph-header.component.html',
  styleUrls: ['./graph-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class GraphHeaderComponent {
  // Inputs
  selectedVariable = input<any>(null); // Type depends on context
  title = input<string>('');
  smallTitle = input<boolean>(false);
  hideScale = input<boolean>(false);
  hidePersistScale = input<boolean>(false);
  showZoom = input<boolean>(false);
  subTitle = input<string | undefined>();

  // Outputs
  toggleFullscreen = output<boolean>();
  scaleValueChanged = output<number>();

  // Services
  private ls = inject(Ls);
  private khiopsLibraryService = inject(KhiopsLibraryService);

  // State signals
  private readonly appConfig =
    this.khiopsLibraryService.getAppConfig().common.GLOBAL;

  maxScale = signal(this.appConfig.MAX_GRAPH_SCALE);
  minScale = signal(this.appConfig.MIN_GRAPH_SCALE);
  stepScale = signal(this.appConfig.STEP_GRAPH_SCALE);
  scaleValue = signal(this.appConfig.DEFAULT_GRAPH_SCALE);

  persistScaleOptions = computed(() => {
    const stored = this.ls.get(LS.SETTING_PERSIST_SCALE_OPTIONS);
    return stored?.toString() === 'true';
  });

  constructor() {
    // Initialize: emit default scale on first render
    afterNextRender(() => {
      this.scaleValueChanged.emit(this.scaleValue());
    });
  }

  onPersistScaleOptionsChange(checked: boolean) {
    this.ls.set(LS.SETTING_PERSIST_SCALE_OPTIONS, checked);
    this.ls.setAll();
  }

  onToggleFullscreen(event: boolean) {
    this.toggleFullscreen.emit(event);
  }

  onScaleChanged(value: number) {
    this.scaleValue.set(value);
    this.scaleValueChanged.emit(value);
  }

  onScaleValueChanged(value: number) {
    this.scaleValue.set(value);
  }
}
