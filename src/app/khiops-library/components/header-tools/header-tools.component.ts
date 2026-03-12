/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, Input, EventEmitter, Output } from '@angular/core';
// @ts-ignore
import { saveAs } from 'file-saver';

import { SelectableService } from '../selectable/selectable.service';
import { HotkeysService, Hotkey } from 'angular2-hotkeys';
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
    private hotkeysService: HotkeysService,
    public copyDatasService: CopyDatasService,
    public copyImageService: CopyImageService,
  ) {
    // define hotkeys - support both ctrl (Windows/Linux) and command (Mac)
    this.hotkeysService.add(
      new Hotkey(
        ['ctrl+shift+c', 'command+shift+c'],
        (_event: KeyboardEvent): boolean => {
          this.copyImage();
          return false; // Prevent bubbling
        },
      ),
    );
    this.hotkeysService.add(
      new Hotkey(
        ['ctrl+shift+d', 'command+shift+d'],
        (_event: KeyboardEvent): boolean => {
          this.copyDatas();
          return false; // Prevent bubbling
        },
      ),
    );
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
