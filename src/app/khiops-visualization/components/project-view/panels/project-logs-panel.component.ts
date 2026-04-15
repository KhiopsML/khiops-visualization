/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component } from '@angular/core';

@Component({
  selector: 'app-project-logs-panel',
  template: `<app-project-logs></app-project-logs>`,
  styles: [
    `
      :host {
        display: flex;
        height: 100%;
        width: 100%;
      }
      app-project-logs {
        flex: 1;
      }
    `,
  ],
  standalone: false,
})
export class ProjectLogsPanelComponent {}
