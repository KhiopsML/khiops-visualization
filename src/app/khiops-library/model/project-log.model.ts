/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Log } from '@khiops-visualization/interfaces/app-datas';

export class ProjectLogModel {
  task: string;
  message: string;

  constructor(log: Log, message: string) {
    this.task = log.taskName;
    this.message = message;
  }
}
