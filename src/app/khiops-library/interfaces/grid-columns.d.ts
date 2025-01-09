/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

export interface GridColumnsI {
  headerName: string;
  field: string;
  show?: boolean;
  tooltip?: string;
  cellRendererFramework?: any;
  cellRendererParams?: any;
}
