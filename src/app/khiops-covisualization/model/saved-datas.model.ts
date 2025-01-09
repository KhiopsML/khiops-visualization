/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { ViewLayoutVO } from './view-layout.model';

export class SavedDatasModel {
  viewsLayout: ViewLayoutVO | undefined;
  splitSizes: {};
  selectedNodes: string[];
  selectedDimensions: { name: string }[];
  collapsedNodes: {} | undefined;
  nodesNames: {};
  annotations: {} | undefined;
  importedDatas: {};
  unfoldHierarchyState: number | undefined;
  matrixContrast: number | undefined;
  conditionalOnContext: boolean | undefined;
  isAxisInverted: boolean | undefined;
  matrixOption: string | undefined;
  matrixMode: number | undefined;

  constructor(
    viewsLayout: ViewLayoutVO | undefined,
    splitSizes: {},
    selectedNodes: string[],
    selectedDimensions: { name: string }[],
    collapsedNodes: {} | undefined,
    nodesNames: {},
    annotations: {} | undefined,
    importedDatas: {},
    matrixContrast?: number,
    unfoldHierarchyState?: number,
    conditionalOnContext?: boolean,
    matrixOption?: string,
    matrixMode?: number,
    isAxisInverted?: boolean,
  ) {
    this.viewsLayout = viewsLayout;
    this.splitSizes = splitSizes;
    this.selectedNodes = selectedNodes;
    this.selectedDimensions = selectedDimensions;
    this.collapsedNodes = collapsedNodes;
    this.nodesNames = nodesNames;
    this.annotations = annotations;
    this.importedDatas = importedDatas;
    this.matrixContrast = matrixContrast || undefined;
    this.unfoldHierarchyState = unfoldHierarchyState || undefined;
    this.conditionalOnContext = conditionalOnContext || undefined;
    this.matrixOption = matrixOption || undefined;
    this.matrixMode = matrixMode || undefined;
    this.isAxisInverted = isAxisInverted || undefined;
  }
}
