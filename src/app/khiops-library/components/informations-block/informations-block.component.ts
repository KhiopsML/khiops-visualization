/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Component,
  NgZone,
  computed,
  input,
  OnInit,
  OnDestroy,
  HostListener,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngstack/translate';

import { SelectableComponent } from '../../components/selectable/selectable.component';
import { SelectableService } from '../../components/selectable/selectable.service';
import { ConfigService } from '@khiops-library/providers/config.service';
import { InfosDatasI } from '@khiops-library/interfaces/infos-datas.interface';
import { ProcessedInfoDataI } from '@khiops-library/interfaces/processed-info-data.interface';
import { COMPONENT_TYPES } from '@khiops-library/enum/component-types';
import {
  INFO_DATA_TYPES,
  DISPLAY_TYPE,
} from '@khiops-library/enum/info-data-types';
import { UtilsService } from '@khiops-library/providers/utils.service';
import { GaugeComponent } from '../gauge/gauge.component';
import { WarningInformationComponent } from '../warning-information/warning-information.component';
import { NoDataComponent } from '../no-data/no-data.component';
import { ToPrecisionPipe } from '../../pipes/to-precision.pipe';

@Component({
  selector: 'kl-informations-block',
  templateUrl: './informations-block.component.html',
  styleUrls: ['./informations-block.component.scss'],
  imports: [
    CommonModule,
    FlexModule,
    MatIconModule,
    TranslateModule,
    GaugeComponent,
    WarningInformationComponent,
    NoDataComponent,
    ToPrecisionPipe,
  ],
})
export class InformationsBlockComponent
  extends SelectableComponent
  implements OnInit, OnDestroy
{
  readonly inputDatas = input<InfosDatasI[] | undefined>(undefined);
  readonly title = input<string>('');
  readonly icon = input<string>('tune');
  readonly showFilteredVariablesWarning = input<boolean>(false);
  public componentType = COMPONENT_TYPES.INFORMATIONS; // needed to copy datas
  readonly gaugeSize = signal<number>(0);

  metricTypes = [
    INFO_DATA_TYPES.INSTANCES,
    INFO_DATA_TYPES.VARIABLES,
    INFO_DATA_TYPES.EVALUATED_VARIABLES,
    INFO_DATA_TYPES.INFORMATIVE_VARIABLES,
    INFO_DATA_TYPES.EVALUATED_VARIABLES,
    INFO_DATA_TYPES.SELECTED_VARIABLES,
    INFO_DATA_TYPES.SELECTED_VARIABLES_PAIRS,
    INFO_DATA_TYPES.CONSTRUCTED_VARIABLES,
    INFO_DATA_TYPES.INFORMATIVE_VARIABLES_PAIRS,
    INFO_DATA_TYPES.EVALUATED_VARIABLES_PAIRS,
  ];

  constructor(
    public override selectableService: SelectableService,
    public override ngzone: NgZone,
    public override configService: ConfigService,
  ) {
    super(selectableService, ngzone, configService);
  }

  ngOnInit() {
    this.updateGaugeSize();
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
  }

  @HostListener('window:resize')
  onResize() {
    this.updateGaugeSize();
  }

  /**
   * Update gauge size based on current screen resolution
   */
  private updateGaugeSize() {
    if (typeof window !== 'undefined') {
      const newSize = UtilsService.isSmallScreen() ? 60 : 70;
      if (this.gaugeSize() !== newSize) {
        this.gaugeSize.set(newSize);
      }
    }
  }

  /**
   * Gets gauge data (sample percentage)
   */
  readonly gaugeData = computed<ProcessedInfoDataI | undefined>(() => {
    const data = this.inputDatas()?.find(
      (data) => data.title === INFO_DATA_TYPES.SAMPLE_PERCENTAGE,
    );

    if (!data) {
      return undefined;
    }

    return {
      ...data,
      displayType: DISPLAY_TYPE.GAUGE,
    };
  });

  /**
   * Gets metric data (instances and evaluated variables)
   */
  readonly metricData = computed<ProcessedInfoDataI[]>(() => {
    return (
      this.inputDatas()
        ?.filter((data) => this.metricTypes.includes(data.title as any))
        .map((data) => ({
          ...data,
          displayType: DISPLAY_TYPE.METRIC,
        })) || []
    );
  });

  /**
   * Gets table data (all other information)
   */
  readonly tableData = computed<ProcessedInfoDataI[]>(() => {
    const filteredData =
      this.inputDatas()
        ?.filter(
          (data) =>
            !this.metricTypes.includes(data.title as any) &&
            data.title !== INFO_DATA_TYPES.SAMPLE_PERCENTAGE,
        )
        .map((data) => ({
          ...data,
          displayType: DISPLAY_TYPE.TABLE,
          isImportant: data.title === INFO_DATA_TYPES.LEARNING_TASK,
        })) || [];

    // Put LEARNING_TASK at the first position if present
    const learningTaskIndex = filteredData.findIndex(
      (data) => data.title === INFO_DATA_TYPES.LEARNING_TASK,
    );

    if (learningTaskIndex > 0) {
      const learningTaskData = filteredData.splice(learningTaskIndex, 1)[0];
      if (learningTaskData) {
        filteredData.unshift(learningTaskData);
      }
    }

    return filteredData;
  });

  /**
   * Get the percentage value from the input data for sample percentage
   * @param value - The value to parse as percentage
   * @returns The percentage as a number (0-100)
   */
  getPercentageValue(value: any): number {
    const numValue = parseFloat(value);
    return isNaN(numValue) ? 0 : Math.max(0, Math.min(100, numValue));
  }
}
