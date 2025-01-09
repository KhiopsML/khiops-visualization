/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Component,
  Input,
  OnChanges,
  ChangeDetectionStrategy,
  SimpleChanges,
} from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';

/**
 * SelectableTabComponent handles the selection of Material tabs.
 *
 * Inputs:
 * - selectedTab: MatTabChangeEvent - The event that is triggered when a tab is selected.
 *
 * Properties:
 * - tabIndex: number - The index of the currently selected tab.
 * - loadingView: boolean - A flag indicating whether the view is in a loading state.
 *
 * Methods:
 * - loaded(): void - Sets the loadingView to false after a timeout and calls loadView.
 * - loadView(): void - Dispatches a resize event to refresh the graph after the view is loaded.
 */
@Component({
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectableTabComponent implements OnChanges {
  @Input() selectedTab?: MatTabChangeEvent;
  public tabIndex?: number;
  public loadingView = true;

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes.selectedTab
        ?.firstChange /* important to do not load when tab change to context (covisu)*/
    ) {
      this.loadingView = true;

      this.loaded();
    }
  }

  loaded() {
    setTimeout(() => {
      this.loadingView = false;
      this.loadView();
    }, 150); // set > value than .mat-ink-bar transition animation to avoid freeze
  }

  loadView() {
    // on loaded, dispatch resize to refreshed graph
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    });
  }
}
