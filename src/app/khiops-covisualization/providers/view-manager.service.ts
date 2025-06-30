/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { EventEmitter, Injectable } from '@angular/core';
import { ViewLayoutVO } from '@khiops-covisualization/model/view-layout.model';
import { Ls } from '@khiops-library/providers/ls.service';
import { AppConfig } from 'src/environments/environment';
import * as _ from 'lodash'; // Important to import lodash in karma
import { AppService } from './app.service';
import { LS } from '@khiops-library/enum/ls';
import { DimensionCovisualizationModel } from '@khiops-library/model/dimension.covisualization.model';
import { initLS } from '../../khiops-library/providers/init-ls';

@Injectable({
  providedIn: 'root',
})
export class ViewManagerService {
  private viewsLayout: ViewLayoutVO | undefined;
  public viewsLayoutChanged: EventEmitter<any> = new EventEmitter();

  constructor(
    private ls: Ls,
    private appService: AppService,
  ) {}

  /**
   * Initializes the views layout based on the provided dimensions.
   *
   * This method creates a new instance of `ViewLayoutVO` and iterates over the given dimensions
   * to add dimension view layouts. It also handles specific behavior for Cypress tests and merges
   * saved values from local storage or saved JSON state.
   *
   * @param dimensions - An array of dimension objects, each containing a `name` property.
   * @returns The initialized `ViewLayoutVO` instance.
   */
  initViewsLayout(dimensions: DimensionCovisualizationModel[]): ViewLayoutVO {
    this.viewsLayout = new ViewLayoutVO();
    for (let i = 0; i < dimensions.length; i++) {
      const isContextView = i >= 2;
      this.viewsLayout.addDimensionViewLayout(
        dimensions[i]?.name!,
        isContextView,
      );
    }

    // View manager behavior #129
    // Do not restore LS values because we have a save functionnality
    if (AppConfig.cypress) {
      // Do it only for cypress tests
      const lsStorage = initLS();
      // Merge current values with values from LS
      this.viewsLayout.megeWithPreviousValues(lsStorage);
    }
    // Then get saved json state
    const savedDatas = this.appService.getSavedDatas('viewsLayout');
    if (savedDatas) {
      // Merge current values with values from LS
      this.viewsLayout.megeWithPreviousValues(savedDatas);
    }

    return this.viewsLayout;
  }

  /**
   * Initializes the saved layout by retrieving it from the app service.
   * If a saved layout is found, it sets the views layout to the saved layout.
   */
  initSavedLayout() {
    const viewsLayout = this.appService.getSavedDatas('viewsLayout');
    if (viewsLayout !== undefined) {
      this.setViewsLayout(viewsLayout);
    }
  }

  /**
   * Retrieves the current views layout.
   *
   * @returns The current `ViewLayoutVO` instance.
   */
  getViewsLayout(): ViewLayoutVO | undefined {
    return this.viewsLayout;
  }

  /**
   * Sets the views layout to the provided layout.
   *
   * @param viewsLayout - The `ViewLayoutVO` instance to set as the current views layout.
   */
  setViewsLayout(viewsLayout: ViewLayoutVO | undefined) {
    this.viewsLayout = viewsLayout;
  }

  /**
   * Enables the external data view for a specific dimension.
   *
   * @param dimension - The name of the dimension for which to enable the external data view.
   */
  enableExtDatasView(dimension: string) {
    const currentDim = this.viewsLayout?.dimensionsViewsLayoutsVO?.find(
      (e) => e.name === dimension,
    );
    if (currentDim) {
      currentDim.isExternalDataChecked = true;
      this.saveViewsLayout(this.viewsLayout);
    }
  }

  /**
   * Saves the current views layout to local storage and emits an event indicating the layout has changed.
   *
   * @param viewsLayout - The `ViewLayoutVO` instance to save.
   */
  saveViewsLayout(viewsLayout: ViewLayoutVO | undefined) {
    this.viewsLayout = viewsLayout;
    this.ls.set(LS.VIEWS_LAYOUT, this.viewsLayout);
    this.viewsLayoutChanged.emit(this.viewsLayout);
  }
}
