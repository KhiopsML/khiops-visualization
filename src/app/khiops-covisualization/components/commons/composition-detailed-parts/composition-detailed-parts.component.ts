/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { AfterViewInit, Component, NgZone } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CompositionModel } from '@khiops-covisualization/model/composition.model';
import { SelectableComponent } from '@khiops-library/components/selectable/selectable.component';
import { SelectableService } from '@khiops-library/components/selectable/selectable.service';
import { COMPONENT_TYPES } from '@khiops-library/enum/component-types';
import { TYPES } from '@khiops-library/enum/types';
import { ConfigService } from '@khiops-library/providers/config.service';
import { TranslateService } from '@ngstack/translate';

@Component({
  selector: 'app-composition-detailed-parts',
  templateUrl: './composition-detailed-parts.component.html',
  styleUrls: ['./composition-detailed-parts.component.scss'],
  standalone: false,
})
export class CompositionDetailedPartsComponent
  extends SelectableComponent
  implements AfterViewInit
{
  /**
   * Columns configuration for data copy functionality
   * Maps grid columns to copy-friendly format with headerName and field properties
   */
  public displayedColumns: any[] = [];

  /**
   * Data source for the copy functionality
   * Contains the actual row data to be copied
   */
  public inputDatas?: any[];

  detailedParts: CompositionModel | undefined;

  // Properties needed for kl-header-tools functionality
  public componentType = COMPONENT_TYPES.GRID; // needed to copy datas
  public override id: string = 'composition-detailed-parts-comp';

  constructor(
    public override selectableService: SelectableService,
    public override ngzone: NgZone,
    public override configService: ConfigService,
    public translate: TranslateService,
    private dialogRef: MatDialogRef<CompositionDetailedPartsComponent>,
  ) {
    super(selectableService, ngzone, configService);
  }

  override ngAfterViewInit() {
    super.ngAfterViewInit();

    setTimeout(() => {
      // Trigger click event for copy functionality
      this.triggerClickEvent();
    }, 250);
  }

  ngOnInit() {
    if (this.detailedParts?.innerVariableType === TYPES.NUMERICAL) {
      // For numerical variables: Interval and Frequency columns
      this.displayedColumns = [
        {
          headerName: this.translate.get('GLOBAL.INTERVAL'),
          field: 'interval',
        },
        {
          headerName: this.translate.get('GLOBAL.FREQUENCY'),
          field: 'frequency',
        },
      ];

      this.inputDatas = (this.detailedParts?.partDetails || []).map(
        (part, index) => ({
          interval: part,
          frequency: this.detailedParts?.partFrequencies?.[index],
        }),
      );
    } else {
      // For categorical variables: Modality and Frequency columns
      this.displayedColumns = [
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
      if (this.detailedParts?.valueGroups?.values) {
        this.inputDatas = this.detailedParts.valueGroups.values.map(
          (value: string, index: number) => ({
            modality: value,
            frequency:
              this.detailedParts?.valueGroups?.valueFrequencies?.[index],
          }),
        );
      }
    }
  }

  onClickOnClose() {
    this.dialogRef.close();
  }
}
