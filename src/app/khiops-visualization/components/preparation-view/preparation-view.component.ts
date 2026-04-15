/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, Input, Type } from '@angular/core';
import { SelectableTabComponent } from '@khiops-library/components/selectable-tab/selectable-tab.component';
import { REPORT } from '@khiops-library/enum/report';
import { TrackerService } from '@khiops-library/providers/tracker.service';
import { DockviewReadyEvent } from 'dockview-angular';
import { themeLightSpaced } from 'dockview-core';
import { BehaviorSubject } from 'rxjs';
import { PreparationDatasService } from '@khiops-visualization/providers/preparation-datas.service';
import { EvaluationDatasService } from '@khiops-visualization/providers/evaluation-datas.service';
import { PreparationSummaryPanelComponent } from './panels/preparation-summary-panel.component';
import { PreparationTargetStatsPanelComponent } from './panels/preparation-target-stats-panel.component';
import { PreparationInformationsPanelComponent } from './panels/preparation-informations-panel.component';
import { PreparationVariablesPanelComponent } from './panels/preparation-variables-panel.component';
import { PreparationDescriptionPanelComponent } from './panels/preparation-description-panel.component';
import { PreparationGraphPanelComponent } from './panels/preparation-graph-panel.component';
import { PreparationMatrixPanelComponent } from './panels/preparation-matrix-panel.component';
import { PreparationIntervalPanelComponent } from './panels/preparation-interval-panel.component';

@Component({
  selector: 'app-preparation-view',
  templateUrl: './preparation-view.component.html',
  styleUrls: ['./preparation-view.component.scss'],
  standalone: false,
})
export class PreparationViewComponent extends SelectableTabComponent {
  @Input() public preparationSource = REPORT.PREPARATION_REPORT;

  public override tabIndex = 1; // managed by selectable-tab component

  public dockviewComponents: Record<string, Type<any>> = {
    summary: PreparationSummaryPanelComponent,
    targetStats: PreparationTargetStatsPanelComponent,
    informations: PreparationInformationsPanelComponent,
    variables: PreparationVariablesPanelComponent,
    description: PreparationDescriptionPanelComponent,
    graph: PreparationGraphPanelComponent,
    matrix: PreparationMatrixPanelComponent,
    interval: PreparationIntervalPanelComponent,
  };

  constructor(
    private trackerService: TrackerService,
    private preparationDatasService: PreparationDatasService,
    private evaluationDatasService: EvaluationDatasService,
  ) {
    super();
  }

  ngOnInit() {
    const trackView =
      this.preparationSource === REPORT.PREPARATION_REPORT
        ? 'preparation'
        : 'textPreparation';
    this.trackerService.trackEvent('page_view', trackView);
  }

  onDockviewReady(event: DockviewReadyEvent) {
    event.api.updateOptions({
      theme: { ...themeLightSpaced, gap: 10 },
      tabAnimation: 'default',
    });

    const isRegressionOrExplanatoryAnalysis =
      this.preparationDatasService.isExplanatoryAnalysis() ||
      this.evaluationDatasService.isRegressionAnalysis();

    // Shared state for graph <-> matrix synchronization
    const state = {
      distributionSelectedBarIndex$: new BehaviorSubject<number>(0),
      matrixRegSelectedCell$: new BehaviorSubject<number>(0),
    };

    const varParams = {
      preparationSource: this.preparationSource,
      isRegressionOrExplanatoryAnalysis,
      state,
    };

    // Left column: Variables (active) + Description (inactive tab in same group)
    const variablesPanel = event.api.addPanel({
      id: `${this.preparationSource}-variables`,
      component: 'variables',
      title: 'Variables',
      minimumWidth: 400,
      params: { preparationSource: this.preparationSource },
    });

    event.api.addPanel({
      id: `${this.preparationSource}-description`,
      component: 'description',
      title: 'Description',
      position: { referencePanel: variablesPanel, direction: 'within' },
      inactive: true,
      params: { preparationSource: this.preparationSource },
    });

    const graphPanel = event.api.addPanel({
      id: `${this.preparationSource}-graph`,
      component: 'graph',
      title: 'Graph',
      minimumWidth: 500,
      position: { referencePanel: variablesPanel, direction: 'right' },
      params: varParams,
    });

    // Middle column: Matrix panel (only for regression/explanatory analysis)
    if (isRegressionOrExplanatoryAnalysis) {
      event.api.addPanel({
        id: `${this.preparationSource}-matrix`,
        component: 'matrix',
        title: 'Matrix',
        position: { referencePanel: graphPanel, direction: 'below' },
        params: varParams,
      });
    }

    // Right column top: Summary (active) + Informations (inactive tab in same group)
    const summaryPanel = event.api.addPanel({
      id: `${this.preparationSource}-summary`,
      component: 'summary',
      title: 'Summary',
      minimumWidth: 400,
      position: { referencePanel: graphPanel, direction: 'right' },
      params: { preparationSource: this.preparationSource },
    });

    event.api.addPanel({
      id: `${this.preparationSource}-informations`,
      component: 'informations',
      title: 'Informations',
      position: { referencePanel: summaryPanel, direction: 'within' },
      inactive: true,
      params: { preparationSource: this.preparationSource },
    });

    // Right column bottom: Target Stats (below Summary/Informations group)
    const targetStatsPanel = event.api.addPanel({
      id: `${this.preparationSource}-target-stats`,
      component: 'targetStats',
      title: 'Target Stats',
      initialHeight: 200,
      position: { referencePanel: summaryPanel, direction: 'below' },
      params: { preparationSource: this.preparationSource },
    });

    // Right column bottom: Interval panel (below Target Stats)
    event.api.addPanel({
      id: `${this.preparationSource}-interval`,
      component: 'interval',
      title: 'Interval',
      position: { referencePanel: targetStatsPanel, direction: 'below' },
      params: varParams,
    });
  }
}
