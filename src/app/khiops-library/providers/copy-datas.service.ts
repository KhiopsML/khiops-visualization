/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { ConfigService } from './config.service';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngstack/translate';
import { UtilsService } from './utils.service';
import { DynamicI } from '@khiops-library/interfaces/globals';
import { TreeChildNode } from '@khiops-visualization/interfaces/tree-preparation-report';
import { AppConfig } from '../../../environments/environment';
import { COMPONENT_TYPES } from '@khiops-library/enum/component-types';

@Injectable({
  providedIn: 'root',
})
export class CopyDatasService {
  constructor(
    private translate: TranslateService,
    private configService: ConfigService,
  ) {}

  /**
   * Formats a numeric value with the current precision setting.
   *
   * @param value - The numeric value to format.
   * @returns The formatted value as a string with the appropriate precision.
   */
  private formatNumberWithPrecision(value: any): string {
    if (typeof value !== 'number' || !isFinite(value)) {
      return value?.toString() || '';
    }

    const precision = (AppConfig.common as any)?.GLOBAL?.TO_FIXED;
    if (precision !== undefined && precision > 0) {
      const result = UtilsService.getPrecisionNumber(value, precision);
      return typeof result === 'string' ? result : result.toString();
    }

    return value.toString();
  }

  /**
   * Copies the data from the selected area to the clipboard.
   *
   * @param selectedArea - The area containing the data to copy.
   */
  copyDatasToClipboard(selectedArea: DynamicI) {
    console.log(
      '🚀 ~ CopyDatasService ~ copyDatasToClipboard ~ selectedArea:',
      selectedArea,
    );
    // console.log(
    //   '​CopyDatasService -> copyDatasToClipboard -> selectedArea',
    //   selectedArea,
    // );
    let formattedDatas: string = '';

    switch (selectedArea.componentType) {
      case COMPONENT_TYPES.HISTOGRAM:
        formattedDatas = this.getKvHistogramDatas(selectedArea);
        break;
      case COMPONENT_TYPES.HYPER_TREE:
        formattedDatas = this.getKvTreeDatas(selectedArea);
        break;
      case COMPONENT_TYPES.KV_TREE:
        formattedDatas = this.getKvTreeDatas(selectedArea);
        break;
      case COMPONENT_TYPES.TREE:
        formattedDatas = this.getTreeDatas(selectedArea);
        break;
      case COMPONENT_TYPES.GRID:
        formattedDatas = this.getTableDatas(selectedArea);
        break;
      case COMPONENT_TYPES.DESCRIPTIONS:
        formattedDatas = this.getDescriptionsDatas(selectedArea);
        break;
      case COMPONENT_TYPES.INFORMATIONS:
        formattedDatas = this.getInformationsDatas(selectedArea);
        break;
      case COMPONENT_TYPES.ND_BAR_CHART:
        formattedDatas = this.getNdBarChartDatas(selectedArea);
        break;
      case COMPONENT_TYPES.BAR_CHART:
        formattedDatas = this.get1dBarChartDatas(selectedArea);
        break;
      case COMPONENT_TYPES.ND_LINE_CHART:
        formattedDatas = this.getNdLineChart(selectedArea);
        break;
      case COMPONENT_TYPES.MATRIX:
        formattedDatas = this.getMatrixDatas(selectedArea);
        break;
      case COMPONENT_TYPES.EXTERNAL_DATAS:
        formattedDatas = this.getExternalDatas(selectedArea);
        break;
    }

    // Create temp textarea to make copy
    if (!this.configService.getConfig().onCopyData) {
      const selBox = document.createElement('textarea');
      selBox.style.position = 'fixed';
      selBox.style.left = '0';
      selBox.style.top = '0';
      selBox.style.opacity = '0';
      selBox.value = formattedDatas;
      document.body.appendChild(selBox);
      selBox.focus();
      selBox.select();
      document.execCommand('copy');
      document.body.removeChild(selBox);
    } else {
      this.configService.getConfig().onCopyData(formattedDatas);
    }
  }

  /**
   * Formats the data for a key-value histogram.
   *
   * @param selectedArea - The area containing the histogram data.
   * @returns A formatted string representing the histogram data.
   */
  getKvHistogramDatas(selectedArea: DynamicI): string {
    let formattedDatas = '';

    // TITLE
    formattedDatas += this.translate.get('GLOBAL.DISTRIBUTION') + '\n\n';

    // HEADER
    formattedDatas += this.translate.get('GLOBAL.PARTITION') + '\t';
    formattedDatas += this.translate.get('GLOBAL.FREQUENCY') + '\t';
    formattedDatas += this.translate.get('GLOBAL.PROBABILITY') + '\t';
    formattedDatas += this.translate.get('GLOBAL.DENSITY') + '\t';
    formattedDatas += this.translate.get('GLOBAL.LOGVALUE') + '\t';
    formattedDatas += '\n';

    // CONTENT
    for (let i = 0; i < selectedArea.datas.length; i++) {
      const partition = selectedArea.datas[i].partition;
      let partitionStr = `]${partition[0]},${partition[1]}]`;
      if (i === 0) {
        // First interval is closed on the left
        partitionStr = `[${partition[0]},${partition[1]}]`;
      }

      formattedDatas += partitionStr + '\t';
      formattedDatas +=
        this.formatNumberWithPrecision(selectedArea.datas[i].frequency) + '\t';
      formattedDatas +=
        this.formatNumberWithPrecision(selectedArea.datas[i].probability) +
        '\t';
      formattedDatas +=
        this.formatNumberWithPrecision(selectedArea.datas[i].density) + '\t';
      formattedDatas +=
        this.formatNumberWithPrecision(selectedArea.datas[i].logValue) + '\t';
      formattedDatas += '\n';
    }

    return formattedDatas;
  }

  /**
   * Formats the data for a matrix.
   *
   * @param selectedArea - The area containing the matrix data.
   * @returns A formatted string representing the matrix data.
   */
  getMatrixDatas(selectedArea: DynamicI) {
    let formattedDatas = '';

    // TITLE
    if (selectedArea.xAxisLabel && selectedArea.yAxisLabel) {
      formattedDatas +=
        selectedArea.xAxisLabel + ' x ' + selectedArea.yAxisLabel + '\n';
    }

    // CONTENT
    const input = selectedArea.inputDatas.matrixCellDatas.map(
      (e: any) => e.displayedValue,
    );
    if (input) {
      formattedDatas += '\t';

      // Construct matrix x axis
      for (let i = 0; i < selectedArea.inputDatas.variable.yParts; i++) {
        formattedDatas +=
          selectedArea.inputDatas.matrixCellDatas[i].yDisplayaxisPart + '\t';
      }
      for (let i = 0; i < selectedArea.inputDatas.matrixCellDatas.length; i++) {
        if (i % selectedArea.inputDatas.variable.yParts === 0) {
          // Add y axis
          formattedDatas +=
            '\n' +
            selectedArea.inputDatas.matrixCellDatas[i].xDisplayaxisPart +
            '\t';
        }
        // Add displayed value
        formattedDatas += this.formatNumberWithPrecision(input[i].value) + '\t';
      }
    }

    return formattedDatas;
  }

  /**
   * Formats the data for a 1D bar chart.
   *
   * @param selectedArea - The area containing the 1D bar chart data.
   * @returns A formatted string representing the 1D bar chart data.
   */
  get1dBarChartDatas(selectedArea: DynamicI) {
    let formattedDatas = '';

    // TITLE
    if (selectedArea.title) {
      formattedDatas += selectedArea.title + '\n';
    }

    // CONTENT
    for (let i = 0; i < selectedArea.inputDatas.labels.length; i++) {
      formattedDatas += selectedArea.inputDatas.labels[i] + '\t';
      formattedDatas +=
        this.formatNumberWithPrecision(
          selectedArea.inputDatas.datasets[0].data[i],
        ) + '\t';
      formattedDatas += '\n';
    }

    return formattedDatas;
  }

  /**
   * Formats the data for a multi-dimensional line chart.
   *
   * @param selectedArea - The area containing the line chart data.
   * @returns A formatted string representing the line chart data.
   */
  getNdLineChart(selectedArea: any) {
    let formattedDatas = '';

    // TITLE
    if (selectedArea.title) {
      formattedDatas += selectedArea.title + '\n';
    }

    // Prepare headers: first column is "Size" (or index), then dataset labels
    const datasets = selectedArea.targetLiftAllGraph.datasets;
    if (!datasets || datasets.length === 0) {
      return formattedDatas;
    }

    // Find the maximum data length among all datasets
    const maxLength = Math.max(...datasets.map((ds: any) => ds.data.length));

    // Header row
    formattedDatas += 'Size\t';
    for (let i = 0; i < datasets.length; i++) {
      formattedDatas += datasets[i].label + '\t';
    }
    formattedDatas += '\n';

    // Data rows
    for (let row = 0; row < maxLength; row++) {
      formattedDatas += this.formatNumberWithPrecision(row) + '\t';
      for (let col = 0; col < datasets.length; col++) {
        const value = datasets[col].data[row];
        if (value !== undefined && value !== null) {
          formattedDatas += this.formatNumberWithPrecision(value) + '\t';
        } else {
          formattedDatas += '\t';
        }
      }
      formattedDatas += '\n';
    }

    return formattedDatas;
  }

  /**
   * Formats the data for a multi-dimensional bar chart.
   *
   * @param selectedArea - The area containing the bar chart data.
   * @returns A formatted string representing the bar chart data.
   */
  getNdBarChartDatas(selectedArea: DynamicI) {
    let formattedDatas = '';
    // TITLE
    if (selectedArea.title) {
      formattedDatas += selectedArea.title + '\n';
    }

    // HEADER
    if (selectedArea.graphOptions) {
      formattedDatas +=
        this.translate.get(selectedArea.graphOptions.selected) + '\t';
    }
    if (selectedArea.displayedValues) {
      for (let i = 0; i < selectedArea.displayedValues.length; i++) {
        formattedDatas += selectedArea.displayedValues[i].name + '\t';
      }
    }
    formattedDatas += '\n';

    // CONTENT
    for (let i = 0; i < selectedArea.inputDatas.labels.length; i++) {
      if (selectedArea.inputDatas.labels[i]) {
        formattedDatas += selectedArea.inputDatas.labels[i] + '\t';
      }
      for (let j = 0; j < selectedArea.inputDatas.datasets.length; j++) {
        if (selectedArea.inputDatas.datasets[j].data[i]) {
          formattedDatas +=
            this.formatNumberWithPrecision(
              selectedArea.inputDatas.datasets[j].data[i],
            ) + '\t';
        } else {
          formattedDatas += '\t';
        }
      }
      formattedDatas += '\n';
    }

    return formattedDatas;
  }

  /**
   * Formats the data for a key-value tree.
   *
   * @param selectedArea - The area containing the tree data.
   * @returns A formatted string representing the tree data.
   */
  getInformationsDatas(selectedArea: DynamicI) {
    let formattedDatas = '';

    // TITLE
    if (selectedArea.title) {
      formattedDatas += selectedArea.title + '\n';
    }

    // CONTENT
    for (let i = 0; i < selectedArea.inputDatas.length; i++) {
      formattedDatas +=
        this.translate.get(selectedArea.inputDatas[i].title) + '\t';
      formattedDatas +=
        this.formatNumberWithPrecision(selectedArea.inputDatas[i].value) + '\t';
      formattedDatas += '\n';
    }

    return formattedDatas;
  }

  /**
   * Formats the data for a key-value descriptions.
   *
   * @param selectedArea - The area containing the descriptions data.
   * @returns A formatted string representing the descriptions data.
   */
  getDescriptionsDatas(selectedArea: DynamicI) {
    let formattedDatas = '';

    formattedDatas += selectedArea.title + '\n';
    formattedDatas += selectedArea.value + '\n';

    return formattedDatas;
  }

  /**
   * Formats the data for external data.
   *
   * @param selectedArea - The area containing the external data.
   * @returns A formatted string representing the external data.
   */
  getExternalDatas(selectedArea: any) {
    let formattedDatas = '';

    formattedDatas +=
      this.translate.get('GLOBAL.EXTERNAL_DATA_OF', {
        value: selectedArea.inputValue,
      }) + '\n';
    formattedDatas += selectedArea.externalData + '\n';

    return formattedDatas;
  }

  /**
   * Formats the data for a key-value tree.
   *
   * @param selectedArea - The area containing the tree data.
   * @returns A formatted string representing the tree data.
   */
  getKvTreeDatas(selectedArea: DynamicI) {
    let formattedDatas = '';

    const currentDatas: TreeChildNode[] =
      selectedArea.treePreparationDatasService.treePreparationDatas
        .selectedFlattenTree;

    // TITLE
    formattedDatas += this.translate.get('GLOBAL.DECISION_TREE') + '\n';

    // HEADER
    formattedDatas += this.translate.get('GLOBAL.NODE') + '\t';
    formattedDatas += this.translate.get('GLOBAL.TYPE') + '\t';
    formattedDatas += this.translate.get('GLOBAL.VARIABLE') + '\n';
    // formattedDatas += this.translate.get('GLOBAL.PARTITION') + '\n';

    // CONTENT
    for (let i = 0; i < currentDatas.length; i++) {
      const data = currentDatas[i];
      formattedDatas += data!.nodeId + '\t';
      formattedDatas += data!.type ? data!.type + '\t' : '\t';
      formattedDatas += data!.variable ? data!.variable + '\n' : '\n';
      // formattedDatas += currentDatas[i].partition ? currentDatas[i].partition.toString() + '\n' : '\n';
    }

    return formattedDatas;
  }

  /**
   * Formats the data for a key-value tree.
   *
   * @param selectedArea - The area containing the tree data.
   * @returns A formatted string representing the tree data.
   */
  getTreeDatas(selectedArea: DynamicI) {
    let formattedDatas = '';

    // First flatten the tree
    const treeDatas = {
      children: selectedArea.dimensionsTree,
    };
    const flattenDatas = UtilsService.flattenUncollapsedTree([], treeDatas);

    // TITLE
    formattedDatas +=
      this.translate.get('GLOBAL.HIERARCHY') +
      '\t' +
      flattenDatas[0].hierarchy +
      '\n\n';

    // SELECTED NODE INFORMATIONS
    if (selectedArea.selectedTreeCluster) {
      formattedDatas +=
        this.translate.get('GLOBAL.TYPE') +
        ': ' +
        selectedArea.selectedTreeCluster.dimensionType +
        '\n';
      if (selectedArea.selectedTreeCluster.dimensionType === 'Numerical') {
        formattedDatas +=
          this.translate.get('GLOBAL.INTERVALS') +
          ': ' +
          selectedArea.selectedTreeCluster.intervals +
          '\n';
        formattedDatas +=
          this.translate.get('GLOBAL.INTERVAL') +
          ': ' +
          selectedArea.selectedTreeCluster.interval +
          '\n';
      } else {
        formattedDatas +=
          this.translate.get('GLOBAL.CLUSTERS') +
          ': ' +
          selectedArea.selectedTreeCluster.intervals +
          '\n';
        formattedDatas +=
          this.translate.get('GLOBAL.CLUSTER') +
          ': ' +
          selectedArea.selectedTreeCluster.interval +
          '\n';
        formattedDatas +=
          this.translate.get('GLOBAL.CLUSTER_LENGTH') +
          ': ' +
          selectedArea.selectedTreeCluster.nbClusters +
          '\n';
      }
      formattedDatas +=
        this.translate.get('GLOBAL.FREQUENCY') +
        ': ' +
        this.formatNumberWithPrecision(
          selectedArea.selectedTreeCluster.frequency,
        ) +
        '\n\n';
    }

    // HEADER
    formattedDatas += this.translate.get('GLOBAL.NAME') + '\t';
    formattedDatas += this.translate.get('GLOBAL.PARENT_CLUSTER') + '\t';
    formattedDatas += this.translate.get('GLOBAL.FREQUENCY') + '\t';
    formattedDatas += this.translate.get('GLOBAL.INTEREST') + '\t';
    formattedDatas += this.translate.get('GLOBAL.HIERARCHICAL_LEVEL') + '\t';
    formattedDatas += this.translate.get('GLOBAL.RANK') + '\t';
    formattedDatas += this.translate.get('GLOBAL.HIERARCHICAL_RANK') + '\n';

    // CONTENT
    for (let i = 0; i < flattenDatas.length; i++) {
      const treeData = flattenDatas[i];
      formattedDatas += treeData.name + '\t';
      formattedDatas += treeData.parentCluster + '\t';
      formattedDatas +=
        this.formatNumberWithPrecision(treeData.frequency) + '\t';
      formattedDatas +=
        this.formatNumberWithPrecision(treeData.interest) + '\t';
      formattedDatas += treeData.hierarchicalLevel + '\t';
      formattedDatas += treeData.rank + '\t';
      formattedDatas += treeData.hierarchicalRank + '\n';
    }

    return formattedDatas;
  }

  /**
   * Formats the data for a table or grid.
   *
   * @param selectedArea - The area containing the table or grid data.
   * @returns A formatted string representing the table or grid data.
   */
  getTableDatas(selectedArea: DynamicI) {
    let formattedDatas = '';

    // TITLE
    if (selectedArea.title) {
      formattedDatas += selectedArea.title + '\n';
    }

    // HEADER
    for (let i = 0; i < selectedArea.displayedColumns.length; i++) {
      if (selectedArea.displayedColumns[i].show !== false) {
        formattedDatas += selectedArea.displayedColumns[i].headerName + '\t';
      }
    }
    formattedDatas += '\n';

    // CONTENT
    const datas = selectedArea.dataSource || selectedArea.inputDatas; // According to table or grid component
    for (let i = 0; i < datas.length; i++) {
      for (let j = 0; j < selectedArea.displayedColumns.length; j++) {
        if (selectedArea.displayedColumns[j].show !== false) {
          if (datas[i][selectedArea.displayedColumns[j].field] !== undefined) {
            const field = selectedArea.displayedColumns[j].field;
            if (field === 'name') {
              // #85 TSV format
              formattedDatas += '"' + datas[i][field] + '"' + '\t';
            } else {
              const value = datas[i][field];
              formattedDatas += this.formatNumberWithPrecision(value) + '\t';
            }
          } else {
            formattedDatas += '\t';
          }
        }
      }
      formattedDatas += '\n';
    }

    return formattedDatas;
  }
}
