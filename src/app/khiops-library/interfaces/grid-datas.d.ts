/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { DynamicI } from './globals';
import { GridColumnsI } from './grid-columns';

export interface GridDatasI {
  title?: string;
  values: DynamicI | undefined;
  displayedColumns: GridColumnsI[] | undefined;
}
