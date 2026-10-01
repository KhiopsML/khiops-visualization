/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Component,
  OnInit,
  NgZone,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CompositionModel } from '@khiops-covisualization/model/composition.model';
import { SelectableComponent } from '@khiops-library/components/selectable/selectable.component';
import { SelectableService } from '@khiops-library/components/selectable/selectable.service';
import { DimensionCovisualizationModel } from '@khiops-library/model/dimension.covisualization.model';
import { ConfigService } from '@khiops-library/providers/config.service';
import { COMPONENT_TYPES } from '../../../../khiops-library/enum/component-types';
import { DynamicI } from '@khiops-library/interfaces/globals.interface';
import { DialogService } from '@khiops-library/providers/dialog.service';
import { ImportExtDatasListComponent } from '../import-ext-datas-list/import-ext-datas-list.component';
import { ExtDatasModel } from '@khiops-covisualization/model/ext-datas.model';
import { GridColumnsI } from '@khiops-library/interfaces/grid-columns.interface';

@Component({
  selector: 'app-external-datas',
  templateUrl: './external-datas.component.html',
  styleUrls: ['./external-datas.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class ExternalDatasComponent
  extends SelectableComponent
  implements OnInit
{
  @Input() private position: number = 0;
  @Input() private externalData: any[] | DynamicI | undefined;
  @Input() private selectedComposition: CompositionModel | undefined;
  @Input() private selectedDimension: DimensionCovisualizationModel | undefined;

  public override id: string | undefined = undefined;
  public currentExternalDatasTitle: string | undefined = '';
  public currentExternalDatas: any[] = [];
  public currentMappingSource: ExtDatasModel | undefined;
  public externalDatasDisplayedColumns: GridColumnsI[] = [];
  public externalDatasGridRows: DynamicI[] = [];
  public componentType = COMPONENT_TYPES.EXTERNAL_DATAS; // needed to copy datas

  constructor(
    public override selectableService: SelectableService,
    public override ngzone: NgZone,
    public override configService: ConfigService,
    private dialogService: DialogService,
  ) {
    super(selectableService, ngzone, configService);
  }

  ngOnInit() {
    this.id = 'external-datas-' + this.position;
  }

  ngOnChanges() {
    this.updateExternalDatas();
  }

  getNoDatasMessage() {
    if (this.selectedDimension?.isNumerical) {
      return 'NO_DATAS.NO_EXTERNAL_DATAS_FOR_NUMERICAL';
    } else {
      if (this.selectedComposition) {
        return 'NO_DATAS.NO_EXTERNAL_DATAS';
      } else {
        return 'NO_DATAS.OPEN_COMPOSITION_VIEW_TO_DISPLAY_EXTERNAL_DATAS';
      }
    }
  }

  editMapping(source?: ExtDatasModel) {
    if (!source) return;

    this.dialogService.openDialog(
      ImportExtDatasListComponent,
      {
        width: 'min(560px, 100vw)',
        maxWidth: '100vw',
        height: '100vh',
        disableClose: true,
        sidePanel: true,
      },
      { editingExtData: source },
    );
  }

  private updateExternalDatas() {
    this.currentExternalDatas = [];
    this.currentMappingSource = undefined;
    this.externalDatasDisplayedColumns = [];
    this.externalDatasGridRows = [];
    if (this.selectedComposition?.externalData) {
      // If composition is available, load datas from it (faster)
      this.currentExternalDatas.push(this.selectedComposition.externalData);
      this.currentExternalDatasTitle = this.selectedComposition.value;
    } else if (
      this.externalData &&
      Object.keys(this.externalData)[0] === this.selectedComposition?.value
    ) {
      // get first item if no composition selected
      this.currentExternalDatas = [Object.values(this.externalData)[0]];
      this.currentExternalDatasTitle = Object.keys(this.externalData)[0] || '';
    }

    this.currentMappingSource = this.currentExternalDatas
      .flatMap((datas: any) => datas || [])
      .find((data: any) => !!data?.source)?.source;

    this.buildExternalDatasGrid();
  }

  private buildExternalDatasGrid() {
    const firstDatasRow = this.currentExternalDatas?.[0];
    if (!firstDatasRow?.length) {
      return;
    }

    const keyColumnField = 'externalDataKey';
    const valueColumnPrefix = 'externalDataValue';

    this.externalDatasDisplayedColumns = [
      {
        headerName: 'key',
        field: keyColumnField,
      },
      ...this.currentExternalDatas.map((_, rowIndex) => ({
        headerName: `value`,
        field: `${valueColumnPrefix}${rowIndex + 1}`,
      })),
    ];

    this.externalDatasGridRows = firstDatasRow.map(
      (data: any, keyIndex: number) => {
        const row: DynamicI = {
          [keyColumnField]: data.key,
        };

        this.currentExternalDatas.forEach((datas: any[], rowIndex: number) => {
          row[`${valueColumnPrefix}${rowIndex + 1}`] = datas?.[keyIndex]?.value;
        });

        return row;
      },
    );
  }
}
