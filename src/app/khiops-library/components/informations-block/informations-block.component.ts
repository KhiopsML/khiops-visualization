/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Component,
  NgZone,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';

import { SelectableComponent } from '../../components/selectable/selectable.component';
import { SelectableService } from '../../components/selectable/selectable.service';
import { ConfigService } from '@khiops-library/providers/config.service';
import { InfosDatasI } from '@khiops-library/interfaces/infos-datas';
import { ProcessedInfoDataI } from '@khiops-library/interfaces/processed-info-data';
import { COMPONENT_TYPES } from '@khiops-library/enum/component-types';
import {
  INFO_DATA_TYPES,
  DISPLAY_TYPE,
} from '@khiops-library/enum/info-data-types';

@Component({
  selector: 'kl-informations-block',
  templateUrl: './informations-block.component.html',
  styleUrls: ['./informations-block.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class InformationsBlockComponent extends SelectableComponent {
  @Input() public inputDatas: InfosDatasI[] | undefined;
  @Input() public title: string = '';
  @Input() public icon = 'tune';
  public componentType = COMPONENT_TYPES.INFORMATIONS; // needed to copy datas

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

  /**
   * Gets gauge data (sample percentage)
   */
  get gaugeData(): ProcessedInfoDataI | undefined {
    const data = this.inputDatas?.find(
      (data) => data.title === INFO_DATA_TYPES.SAMPLE_PERCENTAGE,
    );

    if (!data) return undefined;

    return {
      ...data,
      displayType: DISPLAY_TYPE.GAUGE,
    };
  }

  /**
   * Gets metric data (instances and evaluated variables)
   */
  get metricData(): ProcessedInfoDataI[] {
    return (
      this.inputDatas
        ?.filter((data) => this.metricTypes.includes(data.title as any))
        .map((data) => ({
          ...data,
          displayType: DISPLAY_TYPE.METRIC,
        })) || []
    );
  }

  /**
   * Gets table data (all other information)
   */
  get tableData(): ProcessedInfoDataI[] {
    return (
      this.inputDatas
        ?.filter(
          (data) =>
            !this.metricTypes.includes(data.title as any) &&
            data.title !== INFO_DATA_TYPES.SAMPLE_PERCENTAGE,
        )
        .map((data) => ({
          ...data,
          displayType: DISPLAY_TYPE.TABLE,
          isImportant: data.title === INFO_DATA_TYPES.LEARNING_TASK,
        })) || []
    );
  }

  /**
   * Formats display value handling File objects and other types
   * @param value - The value to format
   * @returns Formatted string representation
   */
  formatValue(value: any): string {
    if (value instanceof File) {
      return value.name;
    }
    return String(value ?? '');
  }

  /**
   * Get the percentage value from the input data for sample percentage
   * @param value - The value to parse as percentage
   * @returns The percentage as a number (0-100)
   */
  getPercentageValue(value: any): number {
    const numValue = parseFloat(value);
    return isNaN(numValue) ? 0 : Math.max(0, Math.min(100, numValue));
  }

  /**
   * @deprecated Use formatValue instead
   */
  show_value(value: any): string {
    return this.formatValue(value);
  }
}
