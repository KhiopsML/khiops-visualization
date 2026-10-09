/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck

import { EventEmitter } from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';
import { AppConfig } from '../../environments/environment';
import { ChartDatasModel } from '../../app/khiops-library/model/chart-datas.model';
import { VariableGraphDetailsComponent } from '../../app/khiops-covisualization/components/commons/variable-graph-details/variable-graph-details.component';

describe('Covisualization VariableGraphDetailsComponent', () => {
  const createComponent = () => {
    const translateService = {
      get: (key: string) => key,
    };

    const treenodesService = {
      setSelectedNode: jasmine.createSpy('setSelectedNode'),
    };

    const configService = {
      getRootElementDom: () => undefined,
    };

    const clustersService = {
      getDistributionDetailsFromNode: jasmine.createSpy(
        'getDistributionDetailsFromNode',
      ),
    };

    const eventsService = {
      treeSelectedNodeChanged: new EventEmitter<any>(),
      conditionalOnContextChanged: new EventEmitter<void>(),
    };

    const dimensionsDatasService = {
      dimensionsDatas: {
        conditionalOnContext: false,
        contextDimensionCount: 0,
      },
    };

    const component = new VariableGraphDetailsComponent(
      translateService as any,
      treenodesService as any,
      configService as any,
      clustersService as any,
      eventsService as any,
      dimensionsDatasService as any,
    );

    return {
      component,
      clustersService,
    };
  };

  it('should force min scale and resize when scale control is hidden', fakeAsync(() => {
    const { component, clustersService } = createComponent();

    const graphDetails = new ChartDatasModel();
    graphDetails.labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
    graphDetails.datasets = [];

    clustersService.getDistributionDetailsFromNode.and.returnValue(
      graphDetails,
    );

    component['dimensionsTree'] = [{} as any];
    component.scaleValue = 10;
    component.distributionGraph = {
      resizeGraph: jasmine.createSpy('resizeGraph'),
    } as any;

    component['getFilteredDistribution']();
    tick();

    expect(component.scaleValue).toBe(
      AppConfig.covisualizationCommon.GLOBAL.MIN_GRAPH_SCALE,
    );
    expect(component.distributionGraph?.resizeGraph).toHaveBeenCalled();
  }));

  it('should keep current scale when scale control stays visible', fakeAsync(() => {
    const { component, clustersService } = createComponent();

    const graphDetails = new ChartDatasModel();
    graphDetails.labels = [
      'A',
      'B',
      'C',
      'D',
      'E',
      'F',
      'G',
      'H',
      'I',
      'J',
      'K',
    ];
    graphDetails.datasets = [];

    clustersService.getDistributionDetailsFromNode.and.returnValue(
      graphDetails,
    );

    component['dimensionsTree'] = [{} as any];
    component.scaleValue = 170;
    component.distributionGraph = {
      resizeGraph: jasmine.createSpy('resizeGraph'),
    } as any;

    component['getFilteredDistribution']();
    tick();

    expect(component.scaleValue).toBe(170);
    expect(component.distributionGraph?.resizeGraph).toHaveBeenCalled();
  }));
});
