/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
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
import { ChartColorsSetI } from '../../interfaces/chart-colors-set';
import { UtilsService } from '../../providers/utils.service';
import { DynamicI } from '@khiops-library/interfaces/globals';
import { ChartDatasetModel } from '@khiops-library/model/chart-dataset.model';

@Component({
  selector: 'kl-legend',
  templateUrl: './legend.component.html',
  styleUrls: ['./legend.component.scss'],
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

  constructor(private translate: TranslateService) {}

  ngOnChanges(changes: SimpleChanges) {
    this.inputDatas = changes?.inputDatas?.currentValue;
    this.updateLegend();
  }

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
          color: UtilsService.hexToRGBa(this.colorSet?.domain[0]!, 0.3),
          borderColor: 'color(a98-rgb 0.84 0.41 0.12)',
        });
      }
    }
  }

  private updateLegend() {
    if (this.inputDatas) {
      this.legend = [];
      if (this.type === 'chart-1d') {
        if (this.inputDatas?.datasets?.[0]) {
          this.legend.push({
            name: this.translate.get(this.inputDatas.datasets[0].label),
            color: this.colorSet?.domain[0],
          });
          this.checkForDefaultGroupIndex(this.inputDatas.datasets[0]);
        } else {
          this.legend.push({
            name: this.translate.get(this.inputDatas),
            color: this.colorSet?.domain[0],
          });
        }
      } else if (this.type === 'chart-nd') {
        // compute legend items
        if (Array.isArray(this.inputDatas)) {
          const series = this.inputDatas[0].series;
          for (let i = 0; i < series.length; i++) {
            this.legend.push({
              name: series[i].name,
              color: this.colorSet?.domain[i],
            });
          }
        } else if (
          this.inputDatas.datasets &&
          this.inputDatas.datasets.length > 0
        ) {
          // new graph
          for (let i = 0; i < this.inputDatas.datasets.length; i++) {
            this.legend.push({
              name: this.inputDatas.datasets[i].label,
              color: this.colorSet?.domain[i],
            });
          }
        }
      } else if (this.type === 'chart-nd-dynamic') {
        // compute legend items
        for (let i = 0; i < this.inputDatas.length; i++) {
          if (this.inputDatas[i].show === true) {
            this.legend.push({
              name: this.inputDatas[i].name,
              color: this.colorSet?.domain[i],
            });
          }
        }
      }

      // Ellipsis long legend text
      for (let i = 0; i < this.legend.length; i++) {
        this.legend[i].shortname = UtilsService.ellipsis(
          this.legend?.[i]?.name?.toString(),
          20,
        );
      }

      // captions are not sorted in natural order #232
      this.legend.sort((a, b) =>
        a.shortname.localeCompare(b.shortname, undefined, {
          numeric: true,
          sensitivity: 'base',
        }),
      );
    }
  }
}
