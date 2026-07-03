/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, computed, input, output, signal } from '@angular/core';
import { TranslateService } from '@ngstack/translate';
import { ChartColorsSetI } from '../../interfaces/chart-colors-set.interface';
import { UtilsService } from '../../providers/utils.service';
import { DynamicI } from '@khiops-library/interfaces/globals.interface';
import { ChartDatasetModel } from '@khiops-library/model/chart-dataset.model';
import { HistogramType } from '@khiops-visualization/components/commons/histogram/histogram.type';
import {
  LegendItem,
  LegendInputData,
  LegendDataset,
  LegendDatasetsInput,
  LegendDataWithSeries,
  LegendDynamicItem,
} from '@khiops-library/interfaces/legend.interface';

@Component({
  selector: 'kl-legend',
  templateUrl: './legend.component.html',
  styleUrls: ['./legend.component.scss'],
  standalone: false,
})
export class LegendComponent {
  public readonly tooltip = input<string>('');
  public readonly position = input<string>('top');
  public readonly inputDatas = input<LegendInputData>(undefined, {
    alias: 'inputDatas',
  });
  public readonly type = input<string>('');
  public readonly colorSet = input<ChartColorsSetI | undefined>(undefined, {
    alias: 'colorSet',
  });

  public readonly legendItemClicked = output<string>();

  public readonly selectedItem = signal<string>('');
  public readonly defaultGroupName: string;
  public readonly legend = computed<LegendItem[]>(() => this.buildLegend());

  constructor(private translate: TranslateService) {
    this.defaultGroupName = this.translate.get('GLOBAL.DEFAULT_GROUP_INDEX');
  }

  /**
   * Selects a legend item and emits an event with the selected item.
   * If the item is already selected, it deselects it.
   * This method is used to handle user interactions with the legend items.
   *
   * @param item - The name of the legend item to select or deselect.
   */
  selectLegendItem(item: string) {
    const selectedItem = this.selectedItem() === item ? '' : item;
    this.selectedItem.set(selectedItem);
    this.legendItemClicked.emit(selectedItem);
  }

  /**
   * Checks for the default group index in the input data and adds a corresponding legend item.
   * If the input data contains an 'extra' property with an element that has a 'defaultGroupIndex',
   * a legend item with the name 'GLOBAL.DEFAULT_GROUP_INDEX' and a semi-transparent color is added.
   *
   * @param input - The input data to check for the default group index.
   */
  private checkForDefaultGroupIndex(
    input: ChartDatasetModel,
  ): LegendItem | null {
    if (input?.extra) {
      const defaultIndex = input.extra.findIndex(
        (e: DynamicI) => e.defaultGroupIndex,
      );
      if (defaultIndex !== -1) {
        return {
          name: this.translate.get('GLOBAL.DEFAULT_GROUP_INDEX'),
          borderColor: UtilsService.hexToRGBa(this.getColor(0, '#000000'), 1),
          color: UtilsService.hexToRGBa('#ff6600', 0.3),
        };
      }
    }
    return null;
  }

  /**
   * Updates the legend based on the input data.
   * It constructs the legend items based on the type of chart and the datasets provided.
   * For 'chart-1d', 'chart-nd', and 'chart-nd-dynamic' types, it populates the legend with appropriate names and colors.
   * It also applies ellipsis to long legend text.
   */
  private buildLegend(): LegendItem[] {
    const inputDatas = this.inputDatas();
    if (!inputDatas) {
      return [];
    }

    let legend: LegendItem[] = [];
    if (this.type() === 'chart-1d') {
      legend = this.buildChart1dLegend(inputDatas);
    } else if (this.type() === 'chart-nd') {
      legend = this.buildChartNdLegend(inputDatas);
    } else if (this.type() === 'chart-nd-dynamic') {
      legend = this.buildChartNdDynamicLegend(inputDatas);
    }

    return this.applyEllipsisToLegend(legend);
  }

  /**
   * Builds legend items for chart-1d type.
   * Displays the distribution label when it is not a histogram type value.
   * Also checks for a default group index entry.
   */
  private buildChart1dLegend(inputDatas: LegendInputData): LegendItem[] {
    const items: LegendItem[] = [];
    if (!this.hasDatasets(inputDatas) || !inputDatas.datasets?.[0]) {
      return items;
    }

    const firstDataset = inputDatas.datasets[0] as LegendDataset;
    if (
      firstDataset.label &&
      !(Object.values(HistogramType) as string[]).includes(firstDataset.label)
    ) {
      // Only display distribution legend on KC
      // For KV, the legend is not relevant
      items.push({
        name: this.translate.get(firstDataset.label),
        color: this.getColor(0),
      });
    }

    const defaultGroupItem = this.checkForDefaultGroupIndex(
      firstDataset as ChartDatasetModel,
    );
    if (defaultGroupItem) {
      items.push(defaultGroupItem);
    }

    return items;
  }

  /**
   * Builds legend items for chart-nd type.
   * Supports both array-based series data and dataset-based data formats.
   */
  private buildChartNdLegend(inputDatas: LegendInputData): LegendItem[] {
    const items: LegendItem[] = [];
    if (this.hasSeriesArray(inputDatas)) {
      const firstData = inputDatas[0];
      if (!firstData) {
        return items;
      }
      const series = firstData.series;
      for (let i = 0; i < series.length; i++) {
        items.push({
          name: series[i]?.name || '',
          borderColor: UtilsService.hexToRGBa(this.getColor(i, '#000000'), 0.2),
          color: this.getColor(i),
        });
      }
    } else if (this.hasDatasets(inputDatas) && inputDatas.datasets.length > 0) {
      // new graph
      for (let i = 0; i < inputDatas.datasets.length; i++) {
        items.push({
          name: inputDatas.datasets[i]?.label || '',
          borderColor: UtilsService.hexToRGBa(this.getColor(i, '#000000'), 0.2),
          color: this.getColor(i),
        });
      }
    }
    return items;
  }

  /**
   * Builds legend items for chart-nd-dynamic type.
   * Only includes items where the show flag is true.
   */
  private buildChartNdDynamicLegend(inputDatas: LegendInputData): LegendItem[] {
    const items: LegendItem[] = [];
    if (!this.hasDynamicArray(inputDatas)) {
      return items;
    }

    for (let i = 0; i < inputDatas.length; i++) {
      if (inputDatas[i]?.show === true) {
        items.push({
          name: inputDatas[i]?.name || '',
          borderColor: UtilsService.hexToRGBa(this.getColor(i, '#000000'), 0.2),
          color: this.getColor(i),
        });
      }
    }
    return items;
  }

  /**
   * Applies ellipsis truncation to long legend item names.
   * Updates each legend item in place with a shortname property.
   */
  private applyEllipsisToLegend(items: LegendItem[]): LegendItem[] {
    return items.map((item) => ({
      ...item,
      shortname: UtilsService.ellipsis(item?.name?.toString() || '', 20),
    }));
  }

  private hasDatasets(
    inputDatas: LegendInputData,
  ): inputDatas is LegendDatasetsInput {
    return (
      !!inputDatas &&
      !Array.isArray(inputDatas) &&
      Array.isArray((inputDatas as LegendDatasetsInput).datasets)
    );
  }

  private hasSeriesArray(
    inputDatas: LegendInputData,
  ): inputDatas is LegendDataWithSeries[] {
    return (
      Array.isArray(inputDatas) &&
      inputDatas.length > 0 &&
      Array.isArray((inputDatas[0] as LegendDataWithSeries).series)
    );
  }

  private hasDynamicArray(
    inputDatas: LegendInputData,
  ): inputDatas is LegendDynamicItem[] {
    return (
      Array.isArray(inputDatas) &&
      (inputDatas.length === 0 || 'show' in (inputDatas[0] as object))
    );
  }

  private getColor(index: number, fallback: string = '#666666'): string {
    return this.colorSet()?.domain?.[index] || fallback;
  }
}
