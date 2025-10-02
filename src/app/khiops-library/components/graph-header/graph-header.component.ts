/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
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
export class GraphHeaderComponent implements OnInit {
  @Output() public toggleFullscreen?: EventEmitter<boolean> =
    new EventEmitter();
  @Output() private scaleValueChanged: EventEmitter<number> =
    new EventEmitter();

  @Input() public selectedVariable: any; // Type depends of the context
  @Input() public title: string = '';
  @Input() public smallTitle = false;
  @Input() public hideScale = false;
  @Input() public hidePersistScale = false;
  @Input() public showZoom = false;
  @Input() public subTitle?: string;

  public maxScale: number;
  public minScale: number;
  public stepScale: number;
  public scaleValue: number;
  public persistScaleOptions: boolean = false;

  constructor(
    private ls: Ls,
    private khiopsLibraryService: KhiopsLibraryService,
  ) {
    this.maxScale =
      this.khiopsLibraryService.getAppConfig().common.GLOBAL.MAX_GRAPH_SCALE;
    this.minScale =
      this.khiopsLibraryService.getAppConfig().common.GLOBAL.MIN_GRAPH_SCALE;
    this.stepScale =
      this.khiopsLibraryService.getAppConfig().common.GLOBAL.STEP_GRAPH_SCALE;
    this.scaleValue =
      this.khiopsLibraryService.getAppConfig().common.GLOBAL.DEFAULT_GRAPH_SCALE;
  }

  ngOnInit() {
    this.initializePersistScaleOptions();
    this.scaleValueChanged.emit(this.scaleValue);
  }

  /**
   * Initialize the persist scale options based on the current context
   */
  private initializePersistScaleOptions() {
    this.persistScaleOptions =
      this.ls.get(LS.SETTING_PERSIST_SCALE_OPTIONS)?.toString() === 'true' ||
      false;
  }

  /**
   * Handle changes to the persist scale options checkbox
   */
  onPersistScaleOptionsChange(checked: boolean) {
    this.persistScaleOptions = checked;
    this.ls.set(LS.SETTING_PERSIST_SCALE_OPTIONS, checked);
    this.ls.setAll();
  }

  onToggleFullscreen($event: boolean | undefined) {
    this.toggleFullscreen?.emit($event);
  }

  onScaleChanged(value: number) {
    // Save current scale value into ls
    this.scaleValueChanged.emit(value);
  }
}
