/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component } from '@angular/core';
import { ProjectDatasService } from '@khiops-visualization/providers/project-datas.service';

@Component({
  selector: 'app-project-summary-panel',
  template: `
    <kl-project-summary
      fxFlexFill
      [projectDatasService]="projectDatasService"
    ></kl-project-summary>
  `,
  styles: [
    `
      :host {
        display: flex;
        height: 100%;
        width: 100%;
      }
    `,
  ],
  standalone: false,
})
export class ProjectSummaryPanelComponent {
  constructor(public projectDatasService: ProjectDatasService) {}
}
