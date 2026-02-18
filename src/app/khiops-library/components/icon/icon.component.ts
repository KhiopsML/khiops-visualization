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
  inject,
} from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import { Observable, of } from 'rxjs';
import { IconCacheService } from './icon.cache.service';

@Component({
  selector: 'kl-icon',
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class IconComponent implements OnChanges {
  @Input() name!: string;
  @Input() size: number = 24;
  @Input() color: string = 'currentColor';

  svgContent$: Observable<SafeHtml> = of('');

  private iconCache = inject(IconCacheService);

  ngOnChanges() {
    if (!this.name) {
      this.svgContent$ = of('');
      return;
    }
    this.svgContent$ = this.iconCache.get(this.name);
  }
}
