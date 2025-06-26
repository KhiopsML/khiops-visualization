/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CompositionModel } from '@khiops-covisualization/model/composition.model';
import { TYPES } from '@khiops-library/enum/types';
import { GridDatasI } from '@khiops-library/interfaces/grid-datas';
import { TranslateService } from '@ngstack/translate';

@Component({
  selector: 'app-composition-detailed-parts',
  templateUrl: './composition-detailed-parts.component.html',
  styleUrls: ['./composition-detailed-parts.component.scss'],
  standalone: false,
})
export class CompositionDetailedPartsComponent {
  detailedDatas: GridDatasI | undefined;
  detailedParts: CompositionModel | undefined;

  constructor(
    public translate: TranslateService,
    private dialogRef: MatDialogRef<CompositionDetailedPartsComponent>,
  ) {
    // Initialize with default columns, will be updated in ngOnInit based on data type
    this.detailedDatas = {
      displayedColumns: [],
      values: [],
    };
  }

  ngOnInit() {
    if (this.detailedParts?.innerVariableType === TYPES.NUMERICAL) {
      // For numerical variables: Interval and Frequency columns
      this.detailedDatas!.displayedColumns = [
        {
          headerName: this.translate.get('GLOBAL.INTERVAL'),
          field: 'interval',
        },
        {
          headerName: this.translate.get('GLOBAL.FREQUENCY'),
          field: 'frequency',
        },
      ];

      this.detailedDatas!.values = this.detailedParts!.partDetails!.map(
        (part, index) => ({
          interval: part,
          frequency: this.detailedParts!.partFrequencies![index],
        }),
      );
    } else {
      // For categorical variables: Modality and Frequency columns
      this.detailedDatas!.displayedColumns = [
        {
          headerName: this.translate.get('GLOBAL.MODALITY'),
          field: 'modality',
        },
        {
          headerName: this.translate.get('GLOBAL.FREQUENCY'),
          field: 'frequency',
        },
      ];

      // Use valueGroups for categorical data
      if (this.detailedParts!.valueGroups?.values) {
        this.detailedDatas!.values =
          this.detailedParts!.valueGroups!.values.map(
            (value: string, index: number) => ({
              modality: value,
              frequency:
                this.detailedParts!.valueGroups!.valueFrequencies[index],
            }),
          );
      }
    }
  }

  onClickOnClose() {
    this.dialogRef.close();
  }
}
