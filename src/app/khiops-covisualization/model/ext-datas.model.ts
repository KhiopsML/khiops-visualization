/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { ExtDatasFieldI } from '@khiops-covisualization/interfaces/ext-datas-field';

export class ExtDatasModel {
  filename: string;
  dimension: string;
  joinKey: string;
  separator: string;
  field: ExtDatasFieldI;
  file?: File;
  path?: string;

  constructor(
    filename: string,
    dimension: string,
    joinKey: string,
    separator: string,
    field: ExtDatasFieldI,
    file?: File,
    path?: string,
  ) {
    this.filename = filename;
    this.dimension = dimension;
    this.joinKey = joinKey;
    this.separator = separator;
    this.field = field;
    this.file = file;
    this.path = path || '';
  }
}
