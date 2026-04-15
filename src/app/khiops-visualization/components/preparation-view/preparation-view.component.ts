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
import { PreparationSummaryPanelComponent } from './panels/preparation-summary-panel.component';
import { PreparationTargetStatsPanelComponent } from './panels/preparation-target-stats-panel.component';
import { PreparationInformationsPanelComponent } from './panels/preparation-informations-panel.component';
import { PreparationVariablesPanelComponent } from './panels/preparation-variables-panel.component';
import { PreparationDescriptionPanelComponent } from './panels/preparation-description-panel.component';
import { PreparationVarDetailsPanelComponent } from './panels/preparation-var-details-panel.component';

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
    varDetails: PreparationVarDetailsPanelComponent,
  };

  constructor(private trackerService: TrackerService) {
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

    // Middle column: Variable Details
    const varDetailsPanel = event.api.addPanel({
      id: `${this.preparationSource}-var-details`,
      component: 'varDetails',
      minimumWidth: 500,
      title: 'Variable Details',
      position: { referencePanel: variablesPanel, direction: 'right' },
      params: { preparationSource: this.preparationSource },
    });

    // Right column top: Summary (active) + Informations (inactive tab in same group)
    const summaryPanel = event.api.addPanel({
      id: `${this.preparationSource}-summary`,
      component: 'summary',
      title: 'Summary',
      minimumWidth: 400,
      position: { referencePanel: varDetailsPanel, direction: 'right' },
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
    event.api.addPanel({
      id: `${this.preparationSource}-target-stats`,
      component: 'targetStats',
      title: 'Target Stats',
      initialHeight: 200,
      position: { referencePanel: summaryPanel, direction: 'below' },
      params: { preparationSource: this.preparationSource },
    });
  }
}
