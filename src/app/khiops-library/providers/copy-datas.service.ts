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

@Injectable({
  providedIn: 'root',
})
export class CopyDatasService {
  constructor(
    private translate: TranslateService,
    private configService: ConfigService,
  ) {}

  copyDatasToClipboard(selectedArea: DynamicI) {
    // console.log(
    //   '​CopyDatasService -> copyDatasToClipboard -> selectedArea',
    //   selectedArea,
    // );
    let formattedDatas: string = '';

    switch (selectedArea.componentType) {
      case 'histogram':
        formattedDatas = this.getKvHistogramDatas(selectedArea);
        break;
      case 'hyptree':
        formattedDatas = this.getKvTreeDatas(selectedArea);
        break;
      case 'kvtree':
        formattedDatas = this.getKvTreeDatas(selectedArea);
        break;
      case 'tree':
        formattedDatas = this.getTreeDatas(selectedArea);
        break;
      case 'table':
      case 'grid':
        formattedDatas = this.getTableDatas(selectedArea);
        break;
      case 'descriptions':
        formattedDatas = this.getDescriptionsDatas(selectedArea);
        break;
      case 'informations':
        formattedDatas = this.getInformationsDatas(selectedArea);
        break;
      case 'ndBarChart':
        formattedDatas = this.getNdBarChartDatas(selectedArea);
        break;
      case '1dBarChart':
        formattedDatas = this.get1dBarChartDatas(selectedArea);
        break;
      case 'ndLineChart':
        formattedDatas = this.getNdLineChart(selectedArea);
        break;
      case 'matrix':
        formattedDatas = this.getMatrixDatas(selectedArea);
        break;
      case 'external-datas':
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

  getKvHistogramDatas(selectedArea: DynamicI): string {
    let formattedDatas = '';

    // TITLE
    formattedDatas += this.translate.get('GLOBAL.DISTRIBUTION') + '\n\n';

    // HEADER
    formattedDatas += this.translate.get('GLOBAL.PARTITION') + '\t';
    formattedDatas += this.translate.get('GLOBAL.LOGVALUE') + '\t';
    formattedDatas += this.translate.get('GLOBAL.VALUE') + '\t';
    formattedDatas += '\n';

    // CONTENT
    for (let i = 0; i < selectedArea.datas.length; i++) {
      formattedDatas += selectedArea.datas[i].partition + '\t';
      formattedDatas += selectedArea.datas[i].logValue + '\t';
      formattedDatas += selectedArea.datas[i].value + '\t';
      formattedDatas += '\n';
    }

    return formattedDatas;
  }

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
        formattedDatas += input[i].value + '\t';
      }
    }

    return formattedDatas;
  }

  get1dBarChartDatas(selectedArea: DynamicI) {
    let formattedDatas = '';

    // TITLE
    if (selectedArea.title) {
      formattedDatas += selectedArea.title + '\n';
    }

    // CONTENT
    for (let i = 0; i < selectedArea.inputDatas.labels.length; i++) {
      formattedDatas += selectedArea.inputDatas.labels[i] + '\t';
      formattedDatas += selectedArea.inputDatas.datasets[0].data[i] + '\t';
      formattedDatas += '\n';
    }

    return formattedDatas;
  }

  getNdLineChart(selectedArea: any) {
    let formattedDatas = '';

    // TITLE
    if (selectedArea.title) {
      formattedDatas += selectedArea.title + '\n';
    }

    // CONTENT
    for (let i = 0; i < selectedArea.targetLiftAllGraph.length; i++) {
      formattedDatas += selectedArea.targetLiftAllGraph[i].name + '\t';
      for (
        let j = 0;
        j < selectedArea.targetLiftAllGraph[i].series.length;
        j++
      ) {
        if (selectedArea.targetLiftAllGraph[i].series[j]) {
          formattedDatas +=
            selectedArea.targetLiftAllGraph[i].series[j].value + '\t';
        } else {
          formattedDatas += '\t';
        }
      }
      formattedDatas += '\n';
    }

    return formattedDatas;
  }

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
          formattedDatas += selectedArea.inputDatas.datasets[j].data[i] + '\t';
        } else {
          formattedDatas += '\t';
        }
      }
      formattedDatas += '\n';
    }

    return formattedDatas;
  }

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
      formattedDatas += selectedArea.inputDatas[i].value + '\t';
      formattedDatas += '\n';
    }

    return formattedDatas;
  }

  getDescriptionsDatas(selectedArea: DynamicI) {
    let formattedDatas = '';

    formattedDatas += selectedArea.title + '\n';
    formattedDatas += selectedArea.value + '\n';

    return formattedDatas;
  }

  getExternalDatas(selectedArea: any) {
    let formattedDatas = '';

    formattedDatas +=
      this.translate.get('GLOBAL.EXTERNAL_DATA_OF', {
        value: selectedArea.inputValue,
      }) + '\n';
    formattedDatas += selectedArea.externalData + '\n';

    return formattedDatas;
  }

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
        selectedArea.selectedTreeCluster.frequency +
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
      formattedDatas += treeData.frequency + '\t';
      formattedDatas += treeData.interest + '\t';
      formattedDatas += treeData.hierarchicalLevel + '\t';
      formattedDatas += treeData.rank + '\t';
      formattedDatas += treeData.hierarchicalRank + '\n';
    }

    return formattedDatas;
  }

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
              formattedDatas += datas[i][field] + '\t';
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
