/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Injectable } from '@angular/core';
import { LS } from '@khiops-library/enum/ls';
import { Ls } from '@khiops-library/providers/ls.service';

export type InfoPanelLayoutMode = 'top' | 'left';

@Injectable({
  providedIn: 'root',
})
export class ViewLayoutModeService {
  constructor(private ls: Ls) {}

  getInfoPanelLayoutMode(): InfoPanelLayoutMode {
    const mode = this.ls.get(LS.KV_INFO_PANEL_LAYOUT);
    return mode === 'left' ? 'left' : 'top';
  }

  isLeftInfoPanelLayoutMode(): boolean {
    return this.getInfoPanelLayoutMode() === 'left';
  }

  setInfoPanelLayoutMode(mode: InfoPanelLayoutMode) {
    this.ls.set(LS.KV_INFO_PANEL_LAYOUT, mode);
  }
}
