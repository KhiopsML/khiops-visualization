/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Component,
  Input,
  EventEmitter,
  Output,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  ElementRef,
  OnDestroy,
} from '@angular/core';
import * as ChartJs from 'chart.js';
import type { ChartEvent, ActiveElement } from 'chart.js';

import { KhiopsLibraryService } from '../../providers/khiops-library.service';
import { ChartColorsSetI } from '../../interfaces/chart-colors-set';
import { ChartOptions } from 'chart.js';
import { ChartDatasModel } from '@khiops-library/model/chart-datas.model';
import { CHART_TYPES } from '@khiops-library/enum/chart-types';
import { ChartManagerService } from './chart-manager.service';

@Component({
  selector: 'kl-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
  standalone: false,
  providers: [ChartManagerService],
})
export class ChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() public canvasIdContainer = 'kl-chart'; // May be updated if multiple graph
  @Input() private inputDatas: ChartDatasModel | undefined;
  @Input() private activeEntries: number | undefined;
  @Input() private type: ChartJs.ChartType = CHART_TYPES.BAR;
  @Input() private chartOptions: ChartOptions | undefined;
  @Input() private colorSet: ChartColorsSetI | undefined;
  @Input() private enableSelection = true;
  @Input() private selectedLineChartItem: string | undefined;

  @Output() private selectBarIndex: EventEmitter<number> = new EventEmitter();

  public isLoading: boolean = false;

  constructor(
    private el: ElementRef,
    private khiopsLibraryService: KhiopsLibraryService,
    private chartManagerService: ChartManagerService,
  ) {
    this.colorSet = this.khiopsLibraryService.getGraphColorSet()[0];
  }

  ngOnInit() {
    // Keep a ref of instance
    this.el.nativeElement.componentInstance = this;
  }

  ngAfterViewInit(): void {
    this.initChart();
  }

  ngOnDestroy(): void {
    this.chartManagerService.destroy();
  }

  /**
   * Initializes the chart instance and sets up its configuration.
   */
  private initChart() {
    this.chartManagerService.initChart(
      this.canvasIdContainer,
      this.type,
      this.chartOptions,
      this.graphClickEvent.bind(this),
    );
  }

  /**
   * Handles changes to input properties and updates the chart accordingly.
   * @param changes - The changes detected in input properties.
   */
  ngOnChanges(changes: SimpleChanges) {
    if (
      this.chartManagerService.getChart() &&
      changes.selectedLineChartItem &&
      changes.selectedLineChartItem.currentValue !== undefined
    ) {
      // can be ''
      if (this.inputDatas) {
        this.chartManagerService.colorize(
          this.inputDatas,
          this.colorSet,
          this.selectedLineChartItem,
        );
      }
      this.chartManagerService.updateChart();
    }

    if (changes.inputDatas?.currentValue) {
      this.updateGraph();
    }

    if (changes.chartOptions?.currentValue) {
      // We must reconstruct the chart if the scale change
      this.initChart();
    }

    if (
      changes.activeEntries &&
      changes.activeEntries.currentValue !== undefined
    ) {
      // can be 0
      this.updateGraph();
    }

    if (changes.scaleValue?.currentValue && !changes.scaleValue.firstChange) {
      this.updateGraph();
    }
  }

  /**
   * Updates the chart data and refreshes the chart display.
   */
  private updateGraph() {
    if (this.inputDatas) {
      this.chartManagerService.updateGraph(
        this.inputDatas,
        this.activeEntries,
        this.colorSet,
        this.selectedLineChartItem,
        this.isLoading,
      );
      this.isLoading = false;
    }
  }

  /**
   * Hides the active entries in the chart.
   */
  public hideActiveEntries() {
    this.chartManagerService.hideActiveEntries(
      this.inputDatas,
      this.colorSet,
      this.selectedLineChartItem,
    );
  }

  /**
   * Shows the active entries in the chart.
   */
  public showActiveEntries() {
    this.chartManagerService.showActiveEntries(
      this.activeEntries,
      this.inputDatas,
      this.colorSet,
      this.selectedLineChartItem,
    );
  }

  /**
   * Handles click events on the chart and updates the selection state.
   * @param _e - The chart event.
   * @param items - The active elements clicked on the chart.
   */
  private graphClickEvent(_e: ChartEvent, items: ActiveElement[]) {
    if (this.enableSelection) {
      const l = items.length;
      if (l > 0) {
        for (let i = 0; i < l; i++) {
          // undefined if click outside bar
          const item = items[i];
          if (item && item.index !== undefined) {
            this.chartManagerService.selectCurrentBarIndex(
              item.index, 
              this.enableSelection,
              this.inputDatas,
              this.colorSet,
              this.selectedLineChartItem,
            );
            this.selectBarIndex.emit(item.index);
            this.chartManagerService.updateChart();
          }
        }
      }
    }
  }

  /**
   * Handles keyboard events to navigate through active entries in the chart.
   * @param event - The keyboard event.
   */
  onKeyUp(event: KeyboardEvent) {
    if (this.activeEntries !== undefined) {
      // can be 0
      if (event.key === 'ArrowLeft' && this.activeEntries > 0) {
        this.activeEntries = this.activeEntries - 1;
      }
      if (
        event.code === 'ArrowRight' &&
        this.activeEntries < this.inputDatas!.labels.length - 1
      ) {
        this.activeEntries = this.activeEntries + 1;
      }
      this.chartManagerService.selectCurrentBarIndex(
        this.activeEntries, 
        this.enableSelection,
        this.inputDatas,
        this.colorSet,
        this.selectedLineChartItem,
      );
      this.chartManagerService.updateChart();
      this.selectBarIndex.emit(this.activeEntries);
    }
  }
}
