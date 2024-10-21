import { EventEmitter, Injectable } from '@angular/core';
import { ViewLayoutVO } from '@khiops-covisualization/model/view-layout.model';
import { Ls } from '@khiops-library/providers/ls.service';
import { AppConfig } from 'src/environments/environment';
import * as _ from 'lodash'; // Important to import lodash in karma
import { AppService } from './app.service';
import { LS } from '@khiops-library/enum/ls';

@Injectable({
  providedIn: 'root',
})
export class ViewManagerService {
  viewsLayout: ViewLayoutVO;
  viewsLayoutChanged: EventEmitter<any> = new EventEmitter();

  constructor(
    private ls: Ls,
    private appService: AppService,
  ) {}

  initViewsLayout(dimensions): ViewLayoutVO {
    this.viewsLayout = new ViewLayoutVO();
    for (let i = 0; i < dimensions.length; i++) {
      const isContextView = i >= 2;
      this.viewsLayout.addDimensionViewLayout(
        dimensions[i].name,
        isContextView,
      );
    }

    // View manager behavior #129
    // Do not restore LS values because we have a save functionnality
    if (AppConfig.cypress) {
      // Do it only for cypress tests
      const lsStorage = this.ls.get(LS.VIEWS_LAYOUT);
      if (lsStorage && lsStorage !== 'undefined') {
        const lsValues = JSON.parse(lsStorage);
        // Merge current values with values from LS
        this.viewsLayout.megeWithPreviousValues(lsValues);
      }
    }

    // Then get saved json state
    const savedDatas = this.appService.getSavedDatas('viewsLayout');
    if (savedDatas) {
      // Merge current values with values from LS
      this.viewsLayout.megeWithPreviousValues(savedDatas);
    }

    return this.viewsLayout;
  }

  initSavedLayout() {
    const viewsLayout = this.appService.getSavedDatas('viewsLayout');
    if (viewsLayout !== undefined) {
      this.setViewsLayout(viewsLayout);
    }
  }

  updateViewsLayout(dimensions): ViewLayoutVO {
    const previousValues = _.cloneDeep(this.viewsLayout);
    if (previousValues) {
      this.viewsLayout = new ViewLayoutVO();
      for (let i = 0; i < dimensions.length; i++) {
        const previousLayout = previousValues.dimensionsViewsLayoutsVO.find(
          (e) => e.name === dimensions[i].name,
        );
        const isContextView = i >= 2;
        this.viewsLayout.addDimensionViewLayout(
          dimensions[i].name,
          isContextView,
          previousLayout,
        );
      }
      const lsStorage = this.ls.get(LS.VIEWS_LAYOUT);
      if (lsStorage && lsStorage !== 'undefined') {
        const lsValues = JSON.parse(lsStorage);
        // Merge current values with values from LS
        this.viewsLayout.megeWithPreviousValues(lsValues);
      }
    }
    return this.viewsLayout;
  }

  getViewsLayout(): ViewLayoutVO {
    return this.viewsLayout;
  }

  setViewsLayout(viewsLayout: ViewLayoutVO) {
    this.viewsLayout = viewsLayout;
  }

  enableExtDatasView(dimension: string) {
    const currentDim = this.viewsLayout?.dimensionsViewsLayoutsVO?.find(
      (e) => e.name === dimension,
    );
    if (currentDim) {
      currentDim.isExternalDataChecked = true;
      this.saveViewsLayout(this.viewsLayout);
    }
  }

  saveViewsLayout(viewsLayout: ViewLayoutVO) {
    this.viewsLayout = viewsLayout;
    this.ls.set(LS.VIEWS_LAYOUT, JSON.stringify(this.viewsLayout));
    this.viewsLayoutChanged.emit(this.viewsLayout);
  }
}
