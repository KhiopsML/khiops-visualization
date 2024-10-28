import { Injectable } from '@angular/core';
import { DimensionsDatasService } from '@khiops-covisualization/providers/dimensions-datas.service';
import { DimensionsDatasModel } from '@khiops-covisualization/model/dimensions-data.model';
import { AppService } from './app.service';

@Injectable({
  providedIn: 'root',
})
export class AnnotationService {
  private dimensionsDatas: DimensionsDatasModel | undefined;

  constructor(
    private appService: AppService,
    private dimensionsDatasService: DimensionsDatasService,
  ) {
    this.initialize();
  }
  /**
   * Initializes the dimensions data by fetching it from the DimensionsDatasService.
   */
  initialize() {
    this.dimensionsDatas = this.dimensionsDatasService.getDatas();
  }

  /**
   * Retrieves the annotations from the dimensions data.
   *
   * @returns An object containing the annotations.
   */
  getAnnotations() {
    return this.dimensionsDatas?.annotations;
  }

  /**
   * Initializes the annotations with saved data from the AppService.
   * If no saved data is found, it initializes with an empty object.
   */
  initSavedDatas() {
    if (this.dimensionsDatas) {
      this.dimensionsDatas.annotations =
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
    if (this.dimensionsDatas) {
      if (!this.dimensionsDatas.annotations) {
        this.dimensionsDatas.annotations = {};
      }
      this.dimensionsDatas.annotations[dimensionName] =
        this.dimensionsDatas.annotations[dimensionName] || {};
      this.dimensionsDatas.annotations[dimensionName][nodeName] = annotation;
    }
  }
}
