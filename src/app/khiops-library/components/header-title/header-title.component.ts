/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Component,
  OnInit,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';

@Component({
  selector: 'kl-header-title',
  templateUrl: './header-title.component.html',
  styleUrls: ['./header-title.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class HeaderTitleComponent implements OnInit {
  @Input() title: string = '';
  displayedTitle: string[] = [];
  appName: string | undefined;

  ngOnInit() {
    if (this.title) {
      this.displayedTitle = this.title.split(' ');
      this.appName =
        this.displayedTitle[1] && this.displayedTitle[1].toLowerCase();
    }
  }
}
