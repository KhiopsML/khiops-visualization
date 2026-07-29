/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Component,
  input,
  output,
  signal,
  effect,
  AfterViewInit,
  ElementRef,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import * as ChartJs from 'chart.js';
import type { ChartEvent, ActiveElement } from 'chart.js';

import { KhiopsLibraryService } from '../../providers/khiops-library.service';
import { ChartColorsSetI } from '../../interfaces/chart-colors-set.interface';
import { ChartOptions } from 'chart.js';
import { ChartDatasModel } from '@khiops-library/model/chart-datas.model';
import { CHART_TYPES } from '@khiops-library/enum/chart-types';
import { ChartManagerService } from './chart-manager.service';

@Component({
  selector: 'kl-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
  standalone: true,
  imports: [FlexLayoutModule, MatProgressSpinnerModule],
  providers: [ChartManagerService],
})
export class ChartComponent implements AfterViewInit, OnDestroy {
  public canvasIdContainer = input('kl-chart'); // May be updated if multiple graph
  protected inputDatas = input<ChartDatasModel | undefined>(undefined);
  protected activeEntries = input<number | undefined>(undefined);
  protected type = input<ChartJs.ChartType>(CHART_TYPES.BAR);
  protected chartOptions = input<ChartOptions | undefined>(undefined);
  protected colorSet = input<ChartColorsSetI | undefined>(undefined);
  protected enableSelection = input(true);
  protected selectedLineChartItem = input<string | undefined>(undefined);

  protected selectBarIndex = output<number>();

  public isLoading = signal(false);
  public isChartReady = signal(false);
  private updateGraphTimeout: any;
  private chartInitialized = signal(false);
  private currentActiveEntries = signal<number | undefined>(undefined);
  private chartOptionsHandled = false;
  private readonly defaultColorSet: ChartColorsSetI | undefined;

  constructor(
    private el: ElementRef,
    private khiopsLibraryService: KhiopsLibraryService,
    private chartManagerService: ChartManagerService,
    private cdr: ChangeDetectorRef,
  ) {
    this.defaultColorSet = this.khiopsLibraryService.getGraphColorSet()[0];

    effect(() => {
      if (!this.chartInitialized()) {
        return;
      }

      const selectedLineChartItem = this.selectedLineChartItem();
      const inputDatas = this.inputDatas();

      if (
        this.chartManagerService.getChart() &&
        selectedLineChartItem !== undefined
      ) {
        if (inputDatas) {
          this.chartManagerService.colorize(
            inputDatas,
            this.getCurrentColorSet(),
            selectedLineChartItem,
          );
        }
        this.chartManagerService.updateChart();
      }
    });

    effect(() => {
      if (!this.chartInitialized()) {
        return;
      }

      const chartOptions = this.chartOptions();
      if (!this.chartOptionsHandled) {
        this.chartOptionsHandled = true;
        return;
      }

      if (chartOptions !== undefined) {
        this.isChartReady.set(false);
        this.chartManagerService.destroy();
        this.initChart();
      }
    });

    effect(() => {
      if (!this.chartInitialized()) {
        return;
      }

      const inputDatas = this.inputDatas();
      const activeEntries = this.activeEntries();
      this.currentActiveEntries.set(activeEntries);

      if (inputDatas || activeEntries !== undefined) {
        this.updateGraph();
      }
    });
  }

  ngOnInit() {
    // Keep a ref of instance
    this.el.nativeElement.componentInstance = this;
  }

  ngAfterViewInit(): void {
    this.initChart();
    this.chartInitialized.set(true);
    this.updateGraph();
  }

  ngOnDestroy(): void {
    if (this.updateGraphTimeout) {
      clearTimeout(this.updateGraphTimeout);
    }
    this.chartManagerService.destroy();
  }

  /**
   * Initializes the chart instance and sets up its configuration.
   */

  private initChart() {
    this.chartManagerService.initChart(
      this.canvasIdContainer(),
      this.type(),
      this.chartOptions(),
      this.graphClickEvent.bind(this),
      this.el.nativeElement,
    );
  }

  /**
   * Updates the chart data and refreshes the chart display.
   * Uses debounce to prevent multiple calls in the same change detection cycle.
   */
  private updateGraph() {
    // Clear any pending update
    if (this.updateGraphTimeout) {
      clearTimeout(this.updateGraphTimeout);
    }

    // Debounce the update to avoid multiple calls
    this.updateGraphTimeout = setTimeout(() => {
      const inputDatas = this.inputDatas();
      if (inputDatas) {
        this.chartManagerService.updateGraph(
          inputDatas,
          this.currentActiveEntries(),
          this.getCurrentColorSet(),
          this.selectedLineChartItem(),
          this.isLoading(),
        );
        this.isLoading.set(false);
        // Wait for Chart.js ResizeObserver to settle before revealing the chart
        if (!this.isChartReady()) {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              this.isChartReady.set(true);
              this.cdr.detectChanges();
            });
          });
        }
      }
    }, 0); // Execute on next tick
  }

  /**
   * Hides the active entries in the chart.
   */
  public hideActiveEntries() {
    this.chartManagerService.hideActiveEntries(
      this.inputDatas(),
      this.getCurrentColorSet(),
      this.selectedLineChartItem(),
    );
  }

  /**
   * Shows the active entries in the chart.
   */
  public showActiveEntries() {
    this.chartManagerService.showActiveEntries(
      this.currentActiveEntries(),
      this.inputDatas(),
      this.getCurrentColorSet(),
      this.selectedLineChartItem(),
    );
  }

  /**
   * Handles click events on the chart and updates the selection state.
   * @param _e - The chart event.
   * @param items - The active elements clicked on the chart.
   */
  private graphClickEvent(_e: ChartEvent, items: ActiveElement[]) {
    if (this.enableSelection()) {
      const l = items.length;
      if (l > 0) {
        for (let i = 0; i < l; i++) {
          // undefined if click outside bar
          const item = items[i];
          if (item && item.index !== undefined) {
            this.currentActiveEntries.set(item.index);
            this.chartManagerService.selectCurrentBarIndex(
              item.index,
              this.enableSelection(),
              this.inputDatas(),
              this.getCurrentColorSet(),
              this.selectedLineChartItem(),
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
    const activeEntries = this.currentActiveEntries();
    const inputDatas = this.inputDatas();

    if (activeEntries !== undefined && inputDatas) {
      let nextActiveEntries = activeEntries;
      // can be 0
      if (event.key === 'ArrowLeft' && nextActiveEntries > 0) {
        nextActiveEntries = nextActiveEntries - 1;
      }
      if (
        event.code === 'ArrowRight' &&
        nextActiveEntries < inputDatas.labels.length - 1
      ) {
        nextActiveEntries = nextActiveEntries + 1;
      }
      this.currentActiveEntries.set(nextActiveEntries);
      this.chartManagerService.selectCurrentBarIndex(
        nextActiveEntries,
        this.enableSelection(),
        inputDatas,
        this.getCurrentColorSet(),
        this.selectedLineChartItem(),
      );
      this.chartManagerService.updateChart();
      this.selectBarIndex.emit(nextActiveEntries);
    }
  }

  private getCurrentColorSet(): ChartColorsSetI | undefined {
    return this.colorSet() ?? this.defaultColorSet;
  }
}
