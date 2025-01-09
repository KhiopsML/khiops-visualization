/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'rowIdentifierPipe',
})
export class RowIdentifierPipe implements PipeTransform {
  transform(value: any, ..._args: any[]): any {
    return value?.filter((e: any) => {
      return e.headerName !== '_id';
    });
  }
}
