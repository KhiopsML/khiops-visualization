/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Log } from '../../khiops-visualization/interfaces/app-datas';

export class ProjectLogModel {
  task: string;
  message: string;
  gravity: string;

  constructor(log: Log, message: string) {
    this.task = log.taskName;
    // Extraction of gravity (before the ':')
    const match = message ? message.match(/^([\w-]+)\s*:(.*)$/) : null;
    this.gravity = match && match[1] ? match[1].toLowerCase() : '';
    // Remove gravity from message if present
    this.message = match && match[2] ? match[2].trim() : message;
  }
}
