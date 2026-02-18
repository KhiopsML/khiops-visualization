/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ElementRef,
  Input,
  NgZone,
  ViewChild,
} from '@angular/core';
import { DistributionDatasService } from '@khiops-visualization/providers/distribution-datas.service';
import { KhiopsLibraryService } from '@khiops-library/providers/khiops-library.service';
import { SelectableService } from '@khiops-library/components/selectable/selectable.service';
import { TranslateService } from '@ngstack/translate';
import { ScrollableGraphComponent } from '@khiops-library/components/scrollable-graph/scrollable-graph.component';
import { ChartColorsSetI } from '@khiops-library/interfaces/chart-colors-set';
import { ChartDatasModel } from '@khiops-library/model/chart-datas.model';
import { ChartOptions } from 'chart.js';
import { ConfigService } from '@khiops-library/providers/config.service';
import { VariableModel } from '@khiops-visualization/model/variable.model';
import { COMPONENT_TYPES } from '@khiops-library/enum/component-types';
import { TYPES } from '@khiops-library/enum/types';
import { Variable2dModel } from '@khiops-visualization/model/variable-2d.model';
import { AppConfig } from '../../../../../environments/environment';
import { DistributionType } from '@khiops-visualization/types/distribution-type';
import { ToPrecisionPipe } from '@khiops-library/pipes/to-precision.pipe';

@Component({
  selector: 'app-level-distribution-graph',
  templateUrl: './level-distribution-graph.component.html',
  styleUrls: ['./level-distribution-graph.component.scss'],
  providers: [ToPrecisionPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class LevelDistributionGraphComponent
  extends ScrollableGraphComponent
  implements OnInit
{
  @ViewChild('levelGraph', {
    static: false,
  })
  private levelGraph?: ElementRef;

  @Input() public datas?: VariableModel[] | Variable2dModel[];
  @Input() public levelDistributionTitle?: string;
  @Input() public distributionType: DistributionType = 'level';

  public override inputDatas?: ChartDatasModel = undefined;
  public colorSet?: ChartColorsSetI;
  public componentType = COMPONENT_TYPES.BAR_CHART; // needed to copy datas
  public override graphIdContainer = 'level-distribution-graph';

  // define an id to be copied into clipboard
  public override id: string = 'level-distribution-graph-comp';

  public override maxScale: number =
    AppConfig.visualizationCommon.LEVEL_DISTRIBUTION_GRAPH.MAX_LENGTH;
  public override minScale: number =
    AppConfig.visualizationCommon.LEVEL_DISTRIBUTION_GRAPH.MIN_LENGTH;
  public stepScale: number =
    AppConfig.visualizationCommon.LEVEL_DISTRIBUTION_GRAPH.STEP;
  public chartOptions: ChartOptions;
  public showTooManyVariablesWarning: boolean = false;

  constructor(
    private distributionDatasService: DistributionDatasService,
    public override selectableService: SelectableService,
    public override ngzone: NgZone,
    public override configService: ConfigService,
    private translate: TranslateService,
    private khiopsLibraryService: KhiopsLibraryService,
    private toPrecision: ToPrecisionPipe,
  ) {
    super(selectableService, ngzone, configService);

    this.colorSet = this.khiopsLibraryService.getGraphColorSet()[2];

    // Override tooltip infos
    this.chartOptions = {
      plugins: {
        tooltip: {
          displayColors: false, // Hide color square for target value
          callbacks: {
            label: (items) => {
              if (items && items.dataset) {
                const labelKey =
                  this.distributionType === 'level'
                    ? 'GLOBAL.LEVEL'
                    : 'GLOBAL.IMPORTANCE';
                const value = this.toPrecision.transform(items.raw);
                return this.translate.get(labelKey) + ': ' + value;
              }
              return undefined;
            },
          },
        },
      },
    };
  }

  ngOnInit() {
    // Initialize dynamic properties
    this.initializeDynamicProperties();

    // load datas
    this.inputDatas = this.distributionDatasService.getDistributionGraphDatas(
      this.datas ?? [],
      this.distributionType,
    );

    // simulate click on dialog to make copy available
    setTimeout(() => {
      this.triggerClickEvent(this.levelGraph?.nativeElement);

      // Resize graph after delay to set its width
      this.resizeGraph();
    }, 500); // do it after dialog creation complete

    if (
      this.inputDatas.labels.length ===
      AppConfig.visualizationCommon.LEVEL_DISTRIBUTION_GRAPH.MAX_VARIABLES
    ) {
      this.showTooManyVariablesWarning = true;
    }

    if (
      this.levelDistributionTitle === '' ||
      this.levelDistributionTitle === undefined
    ) {
      const titleKey =
        this.distributionType === 'level'
          ? TYPES.LEVEL_DISTRIBUTION
          : TYPES.IMPORTANCE_DISTRIBUTION;
      this.levelDistributionTitle = this.translate.get(titleKey);
    }
  }

  private initializeDynamicProperties() {
    const typePrefix =
      this.distributionType === 'level' ? 'level' : 'importance';

    // Set dynamic graphIdContainer and id
    this.graphIdContainer = `${typePrefix}-distribution-graph`;
    this.id = `${typePrefix}-distribution-graph-comp`;
  }

  onScaleChanged(value: number) {
    // Save current scale value into ls
    this.scaleValue = value;
    this.resizeGraph();
  }
}
