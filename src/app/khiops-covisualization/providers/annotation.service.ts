/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Injectable } from '@angular/core';
import { DimensionsDatasService } from '@khiops-covisualization/providers/dimensions-datas.service';
import { AppService } from './app.service';

@Injectable({
  providedIn: 'root',
})
export class AnnotationService {
  constructor(
    private appService: AppService,
    private dimensionsDatasService: DimensionsDatasService,
  ) {}

  /**
   * Retrieves the annotations from the dimensions data.
   *
   * @returns An object containing the annotations.
   */
  getAnnotations() {
    return this.dimensionsDatasService.dimensionsDatas?.annotations;
  }

  /**
   * Initializes the annotations with saved data from the AppService.
   * If no saved data is found, it initializes with an empty object.
   */
  initSavedDatas() {
    if (this.dimensionsDatasService.dimensionsDatas) {
      this.dimensionsDatasService.dimensionsDatas.annotations =
        this.appService.getSavedDatas('annotations') || {};
    }
  }

  /**
   * Sets an annotation for a specific node within a given dimension.
   * If the annotations object or the specific dimension does not exist, they are initialized.
   *
   * @param dimensionName - The name of the dimension.
   * @param nodeName - The name of the node within the dimension.
   * @param annotation - The annotation to set for the node.
   */
  setNodeAnnotation(
    dimensionName: string,
    nodeName: string,
    annotation: string,
  ) {
    if (this.dimensionsDatasService.dimensionsDatas) {
      if (!this.dimensionsDatasService.dimensionsDatas.annotations) {
        this.dimensionsDatasService.dimensionsDatas.annotations = {};
      }
      this.dimensionsDatasService.dimensionsDatas.annotations[dimensionName] =
        this.dimensionsDatasService.dimensionsDatas.annotations[
          dimensionName
        ] || {};
      this.dimensionsDatasService.dimensionsDatas.annotations[dimensionName][
        nodeName
      ] = annotation;
    }
  }
}
