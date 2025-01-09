/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Pipe, PipeTransform } from '@angular/core';
import { KhiopsLibraryService } from '../providers/khiops-library.service';
import { UtilsService } from '../providers/utils.service';

@Pipe({
  name: 'toPrecision',
  pure: false,
})
export class ToPrecisionPipe implements PipeTransform {
  numberPrecision: number;

  constructor(private khiopsLibraryService: KhiopsLibraryService) {
    this.numberPrecision =
      this.khiopsLibraryService.getAppConfig().common.GLOBAL.TO_FIXED;
  }

  transform(input: any, count?: number): string {
    const precision = count || this.numberPrecision;
    return UtilsService.getPrecisionNumber(input, precision);
  }
}
