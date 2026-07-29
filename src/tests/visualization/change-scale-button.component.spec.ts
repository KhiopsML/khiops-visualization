/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck

import { TestBed } from '@angular/core/testing';
import { ChangeScaleButtonComponent } from '@khiops-visualization/components/commons/change-scale-button/change-scale-button.component';
import { DialogService } from '@khiops-library/providers/dialog.service';
import { DistributionDatasService } from '@khiops-visualization/providers/distribution-datas.service';
import { ScaleChangeEventsService } from '@khiops-visualization/providers/scale-change-events.service';
import { VariableScaleSettingsService } from '@khiops-visualization/providers/variable-scale-settings.service';
import { AppService } from '@khiops-visualization/providers/app.service';

describe('ChangeScaleButtonComponent', () => {
  let component: ChangeScaleButtonComponent;
  let distributionDatasService: jasmine.SpyObj<DistributionDatasService>;
  let scaleChangeEventsService: jasmine.SpyObj<ScaleChangeEventsService>;
  let variableScaleSettingsService: jasmine.SpyObj<VariableScaleSettingsService>;
  let lsSpy: jasmine.SpyObj<any>;

  beforeEach(async () => {
    distributionDatasService = jasmine.createSpyObj('DistributionDatasService', [
      'updateGraphOptions',
    ]);
    scaleChangeEventsService = jasmine.createSpyObj('ScaleChangeEventsService', [
      'emitScaleChange',
    ]);
    variableScaleSettingsService = jasmine.createSpyObj(
      'VariableScaleSettingsService',
      ['clearAllVariableScaleSettings'],
    );
    lsSpy = jasmine.createSpyObj('Ls', ['set', 'del']);
    AppService.Ls = lsSpy;

    await TestBed.configureTestingModule({
      imports: [ChangeScaleButtonComponent],
      providers: [
        { provide: DialogService, useValue: jasmine.createSpyObj('DialogService', ['openDialog']) },
        { provide: DistributionDatasService, useValue: distributionDatasService },
        { provide: ScaleChangeEventsService, useValue: scaleChangeEventsService },
        { provide: VariableScaleSettingsService, useValue: variableScaleSettingsService },
      ],
    }).compileComponents();

    component = TestBed.createComponent(ChangeScaleButtonComponent).componentInstance;
  });

  it('should reapply auto mode even when dialog settings are unchanged', () => {
    const autoSettings = {
      mode: 'auto',
      xScale: 'linear',
      yScale: 'linear',
    };

    component['applyScaleSettings'](autoSettings);
    component['applyScaleSettings'](autoSettings);

    expect(variableScaleSettingsService.clearAllVariableScaleSettings).toHaveBeenCalledTimes(2);
    expect(distributionDatasService.updateGraphOptions).toHaveBeenCalledTimes(2);
    expect(scaleChangeEventsService.emitScaleChange).toHaveBeenCalledTimes(2);
    expect(scaleChangeEventsService.emitScaleChange).toHaveBeenCalledWith({
      xScale: 'auto',
      yScale: 'auto',
    });
    expect(lsSpy.set).toHaveBeenCalledWith('SETTING_AUTO_SCALE', true);
    expect(lsSpy.del).toHaveBeenCalledWith('DISTRIBUTION_GRAPH_OPTION_X');
    expect(lsSpy.del).toHaveBeenCalledWith('DISTRIBUTION_GRAPH_OPTION_Y');
  });
});