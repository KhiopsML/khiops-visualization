import { Injectable } from '@angular/core';
import { DimensionsDatasService } from '@khiops-covisualization/providers/dimensions-datas.service';
import { DimensionsDatasModel } from '@khiops-covisualization/model/dimensionsData.model';
import { AppService } from './app.service';

@Injectable({
  providedIn: 'root',
})
export class AnnotationService {
  dimensionsDatas: DimensionsDatasModel;

  constructor(
    private appService: AppService,
    private dimensionsDatasService: DimensionsDatasService,
  ) {
    this.initialize();
  }

  initialize() {
    this.dimensionsDatas = this.dimensionsDatasService.getDatas();
  }

  getAnnotations() {
    return this.dimensionsDatas.annotations;
  }

  initSavedDatas() {
    this.dimensionsDatas.annotations =
      this.appService.getSavedDatas('annotations') || {};
  }

  setNodeAnnotation(
    dimensionName: string,
    nodeName: string,
    annotation: string,
  ) {
    if (!this.dimensionsDatas.annotations) {
      this.dimensionsDatas.annotations = {};
    }
    this.dimensionsDatas.annotations[dimensionName] =
      this.dimensionsDatas.annotations[dimensionName] || {};
    this.dimensionsDatas.annotations[dimensionName][nodeName] = annotation;
  }
}
