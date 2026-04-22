/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Component,
  SimpleChanges,
  Input,
  OnChanges,
  Output,
  EventEmitter,
} from '@angular/core';
import { TranslateService } from '@ngstack/translate';
import { ChartColorsSetI } from '../../interfaces/chart-colors-set.interface';
import { UtilsService } from '../../providers/utils.service';
import { DynamicI } from '@khiops-library/interfaces/globals.interface';
import { ChartDatasetModel } from '@khiops-library/model/chart-dataset.model';
import { HistogramType } from '@khiops-visualization/components/commons/histogram/histogram.type';

@Component({
  selector: 'kl-legend',
  templateUrl: './legend.component.html',
  styleUrls: ['./legend.component.scss'],
  standalone: false,
})
export class LegendComponent implements OnChanges {
  @Input() public tooltip: string = '';
  @Input() public position = 'top';
  @Input() private inputDatas: any; // change according to the chart type
  @Input() private type: string = '';
  @Input() private colorSet: ChartColorsSetI | undefined;

  @Output() private legendItemClicked: EventEmitter<string> =
    new EventEmitter();

  public legend: any[] = [];
  public selectedItem: string | undefined;
  public defaultGroupName: string = '';

  constructor(private translate: TranslateService) {
    this.defaultGroupName = this.translate.get('GLOBAL.DEFAULT_GROUP_INDEX');
  }

  ngOnChanges(changes: SimpleChanges) {
    this.inputDatas = changes?.inputDatas?.currentValue;
    this.updateLegend();
  }

  /**
   * Selects a legend item and emits an event with the selected item.
   * If the item is already selected, it deselects it.
   * This method is used to handle user interactions with the legend items.
   *
   * @param item - The name of the legend item to select or deselect.
   */
  selectLegendItem(item: string) {
    if (this.legendItemClicked.observers.length > 0) {
      if (this.selectedItem === item) {
        this.selectedItem = '';
      } else {
        this.selectedItem = item;
      }
      this.legendItemClicked.emit(this.selectedItem);
    }
  }

  /**
   * Checks for the default group index in the input data and adds a corresponding legend item.
   * If the input data contains an 'extra' property with an element that has a 'defaultGroupIndex',
   * a legend item with the name 'GLOBAL.DEFAULT_GROUP_INDEX' and a semi-transparent color is added.
   *
   * @param input - The input data to check for the default group index.
   */
  private checkForDefaultGroupIndex(input: ChartDatasetModel) {
    if (input?.extra) {
      const defaultIndex = input.extra.findIndex(
        (e: DynamicI) => e.defaultGroupIndex,
      );
      if (defaultIndex !== -1) {
        this.legend.push({
          name: this.translate.get('GLOBAL.DEFAULT_GROUP_INDEX'),
          borderColor: UtilsService.hexToRGBa(this.colorSet?.domain[0]!, 1),
          color: UtilsService.hexToRGBa('#ff6600', 0.3),
        });
      }
    }
  }

  /**
   * Updates the legend based on the input data.
   * It constructs the legend items based on the type of chart and the datasets provided.
   * For 'chart-1d', 'chart-nd', and 'chart-nd-dynamic' types, it populates the legend with appropriate names and colors.
   * It also applies ellipsis to long legend text.
   */
  private updateLegend() {
    if (this.inputDatas) {
      this.legend = [];
      if (this.type === 'chart-1d') {
        this.legend = this.buildChart1dLegend();
      } else if (this.type === 'chart-nd') {
        this.legend = this.buildChartNdLegend();
      } else if (this.type === 'chart-nd-dynamic') {
        this.legend = this.buildChartNdDynamicLegend();
      }
      this.applyEllipsisToLegend();
    }
  }

  /**
   * Builds legend items for chart-1d type.
   * Displays the distribution label when it is not a histogram type value.
   * Also checks for a default group index entry.
   */
  private buildChart1dLegend(): any[] {
    const items: any[] = [];
    if (this.inputDatas?.datasets?.[0]) {
      if (
        this.inputDatas.datasets[0].label &&
        !(Object.values(HistogramType) as string[]).includes(
          this.inputDatas.datasets[0].label,
        )
      ) {
        // Only display distribution legend on KC
        // For KV, the legend is not relevant
        items.push({
          name: this.translate.get(this.inputDatas.datasets[0].label),
          color: this.colorSet?.domain[0],
        });
      }
      this.legend = items;
      this.checkForDefaultGroupIndex(this.inputDatas.datasets[0]);
      return this.legend;
    }
    return items;
  }

  /**
   * Builds legend items for chart-nd type.
   * Supports both array-based series data and dataset-based data formats.
   */
  private buildChartNdLegend(): any[] {
    const items: any[] = [];
    if (Array.isArray(this.inputDatas)) {
      const series = this.inputDatas[0].series;
      for (let i = 0; i < series.length; i++) {
        items.push({
          name: series[i].name,
          borderColor: UtilsService.hexToRGBa(this.colorSet?.domain[i]!, 0.2),
          color: this.colorSet?.domain[i],
        });
      }
    } else if (
      this.inputDatas.datasets &&
      this.inputDatas.datasets.length > 0
    ) {
      // new graph
      for (let i = 0; i < this.inputDatas.datasets.length; i++) {
        items.push({
          name: this.inputDatas.datasets[i].label,
          borderColor: UtilsService.hexToRGBa(this.colorSet?.domain[i]!, 0.2),
          color: this.colorSet?.domain[i],
        });
      }
    }
    return items;
  }

  /**
   * Builds legend items for chart-nd-dynamic type.
   * Only includes items where the show flag is true.
   */
  private buildChartNdDynamicLegend(): any[] {
    const items: any[] = [];
    for (let i = 0; i < this.inputDatas.length; i++) {
      if (this.inputDatas[i].show === true) {
        items.push({
          name: this.inputDatas[i].name,
          borderColor: UtilsService.hexToRGBa(this.colorSet?.domain[i]!, 0.2),
          color: this.colorSet?.domain[i],
        });
      }
    }
    return items;
  }

  /**
   * Applies ellipsis truncation to long legend item names.
   * Updates each legend item in place with a shortname property.
   */
  private applyEllipsisToLegend() {
    for (let i = 0; i < this.legend.length; i++) {
      this.legend[i].shortname = UtilsService.ellipsis(
        this.legend?.[i]?.name?.toString(),
        20,
      );
    }
  }
}
