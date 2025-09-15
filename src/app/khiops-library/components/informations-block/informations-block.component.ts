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
import { COMPONENT_TYPES } from '@khiops-library/enum/component-types';

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

  constructor(
    public override selectableService: SelectableService,
    public override ngzone: NgZone,
    public override configService: ConfigService,
  ) {
    super(selectableService, ngzone, configService);
  }

  show_value(value: any) {
    if (value instanceof File) return value.name;
    return value;
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
}
