/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, Input, EventEmitter, Output } from '@angular/core';
// @ts-ignore
import { saveAs } from 'file-saver';

import { SelectableService } from '../selectable/selectable.service';
import { HotkeysService } from '@ngneat/hotkeys';
import { CopyDatasService } from '@khiops-library/providers/copy.datas.service';
import { CopyImageService } from '@khiops-library/providers/copy.image.service';

@Component({
  selector: 'kl-header-tools',
  templateUrl: './header-tools.component.html',
  styleUrls: ['./header-tools.component.scss'],
  standalone: false,
})
export class HeaderToolsComponent {
  @Input() public showMenu = true;
  @Output() private toggleNavDrawerChanged: EventEmitter<any> =
    new EventEmitter();

  constructor(
    public selectableService: SelectableService,
    private hotkeys: HotkeysService,
    public copyDatasService: CopyDatasService,
    public copyImageService: CopyImageService,
  ) {
    // define hotkeys - support both ctrl (Windows/Linux) and command (Mac)
    // ctrl for Windows/Linux, meta for macOS
    this.hotkeys
      .addShortcut({ keys: 'ctrl.shift.c' })
      .subscribe(() => this.copyImage());
    this.hotkeys
      .addShortcut({ keys: 'meta.shift.c' })
      .subscribe(() => this.copyImage());
    this.hotkeys
      .addShortcut({ keys: 'ctrl.shift.d' })
      .subscribe(() => this.copyDatas());
    this.hotkeys
      .addShortcut({ keys: 'meta.shift.d' })
      .subscribe(() => this.copyDatas());
  }

  copyDatas() {
    // this.trackerService.trackEvent('click', 'copy_datas', 'text');

    this.copyDatasService.copyDatas();
  }

  copyImage() {
    // this.trackerService.trackEvent('click', 'copy_datas', 'image');
    this.copyImageService.copyImage();
  }

  toggleSideBar() {
    this.toggleNavDrawerChanged.emit();
  }
}
