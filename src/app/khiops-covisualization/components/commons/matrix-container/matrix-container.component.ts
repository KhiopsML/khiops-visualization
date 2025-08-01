/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Component,
  OnInit,
  ViewChild,
  OnDestroy,
  Input,
  SimpleChanges,
  OnChanges,
} from '@angular/core';
import { DimensionsDatasService } from '@khiops-covisualization/providers/dimensions-datas.service';
import { MatrixComponent } from '@khiops-library/components/matrix/matrix.component';
import { ViewLayoutVO } from '@khiops-covisualization/model/view-layout.model';
import { EventsService } from '@khiops-covisualization/providers/events.service';
import { TreenodesService } from '@khiops-covisualization/providers/treenodes.service';
import { Subscription } from 'rxjs';
import { DimensionsDatasModel } from '@khiops-covisualization/model/dimensions-data.model';
import { MatrixModesModel } from '@khiops-library/model/matrix-modes.model';
import { MatrixOptionsModel } from '@khiops-library/model/matrix-options.model';
import { MatrixModeI } from '@khiops-library/interfaces/matrix-mode';
import { CellModel } from '@khiops-library/model/cell.model';
import { TranslateService } from '@ngstack/translate';
import { LayoutService } from '@khiops-library/providers/layout.service';
import { ViewManagerService } from '@khiops-covisualization/providers/view-manager.service';
import { MATRIX_MODES } from '@khiops-library/enum/matrix-modes';
import { SplitGutterInteractionEvent } from 'angular-split';
import { TreeNodeChangedEventI } from '@khiops-covisualization/interfaces/events';
import { DynamicI } from '@khiops-library/interfaces/globals';
import { DimensionCovisualizationModel } from '@khiops-library/model/dimension.covisualization.model';

@Component({
  selector: 'app-matrix-container',
  templateUrl: './matrix-container.component.html',
  styleUrls: ['./matrix-container.component.scss'],
  standalone: false,
})
export class MatrixContainerComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild('matrix', {
    static: false,
  })
  private matrix: MatrixComponent | undefined;

  @Input() public sizeId: string = '';
  @Input() public viewsLayout: ViewLayoutVO | undefined;
  @Input() private viewId: string = '';
  @Input() selectedDimensions: DimensionCovisualizationModel[] | undefined; // Used to check for dim change
  @Input() public dimensionsDatas: DimensionsDatasModel | undefined;

  public sizes: DynamicI | undefined;
  public matrixModes: MatrixModesModel = new MatrixModesModel();
  public matrixOptions: MatrixOptionsModel = new MatrixOptionsModel();
  public initNodesEvents = 0; // improve draw matrix perf
  public isFullscreen = false;

  private treeSelectedNodeChangedSub: Subscription;
  private viewsLayoutChangedSub: Subscription;
  private isFirstLoad = true;

  constructor(
    private viewManagerService: ViewManagerService,
    private translate: TranslateService,
    private treenodesService: TreenodesService,
    private eventsService: EventsService,
    private dimensionsDatasService: DimensionsDatasService,
    private layoutService: LayoutService,
  ) {
    this.treeSelectedNodeChangedSub =
      this.eventsService.treeSelectedNodeChanged.subscribe(
        (e: TreeNodeChangedEventI) => {
          this.onTreeSelectedNodeChanged(e);
        },
      );

    this.viewsLayoutChangedSub =
      this.viewManagerService.viewsLayoutChanged.subscribe((viewsLayout) => {
        this.viewsLayout = viewsLayout;

        // Redraw matrix event to resize cells
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
        });
      });
  }

  ngOnInit() {
    this.sizes = this.layoutService.getViewSplitSizes(this.viewId);
    this.constructModeSelectBox();

    // Check if saved into json
    if (this.dimensionsDatas?.matrixOption !== undefined) {
      this.matrixOptions.selected = this.dimensionsDatas.matrixOption;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // #141 Update combobox on selection change
    if (changes.selectedDimensions) {
      this.constructModeSelectBox();
    }
  }

  ngOnDestroy() {
    this.viewsLayoutChangedSub?.unsubscribe();
    this.treeSelectedNodeChangedSub?.unsubscribe();
  }

  onToggleFullscreen(isFullscreen: boolean) {
    this.isFullscreen = isFullscreen;
    setTimeout(() => {
      this.matrix?.drawMatrix();
    });
  }

  onSplitDragEnd(event: SplitGutterInteractionEvent, item: string) {
    this.layoutService.resizeAndSetSplitSizes(
      item,
      this.sizes,
      event.sizes,
      this.viewId,
    );
  }

  onCellSelected(event: { datas: CellModel }) {
    this.treenodesService.setSelectedNode(
      event.datas.xnamePart ?? '',
      event.datas.xaxisPart ?? '',
    );
    this.treenodesService.setSelectedNode(
      event.datas.ynamePart ?? '',
      event.datas.yaxisPart ?? '',
    );
  }

  onMatrixAxisInverted() {
    this.dimensionsDatasService.toggleIsAxisInverted();
  }

  changeMatrixType(type: string) {
    if (this.dimensionsDatas) {
      this.dimensionsDatas.matrixOption = type; // Save it into the global model to keep it into saved datas
    }
  }

  changeMatrixMode(_mode: MatrixModeI) {
    if (this.dimensionsDatas) {
      this.dimensionsDatas.matrixMode = this.matrixModes.selectedIndex; // Save it into the global model to keep it into saved datas
    }
  }

  changeConditionalOnContext() {
    // this.trackerService.trackEvent('click', 'matrix_conditionnal_on_context');
    if (this.dimensionsDatas) {
      this.dimensionsDatas.conditionalOnContext =
        !this.dimensionsDatas.conditionalOnContext;
    }
    this.treenodesService.initConditionalOnContextNodes();
    this.eventsService.emitConditionalOnContextChanged();
  }

  private constructModeSelectBox() {
    if (this.dimensionsDatas?.selectedDimensions) {
      const varName1 = this.dimensionsDatas?.selectedDimensions[0]?.name;
      const varName2 = this.dimensionsDatas?.selectedDimensions[1]?.name;

      this.matrixModes.types = [
        {
          mode: MATRIX_MODES.MUTUAL_INFO,
          title: 'I (' + varName1 + ' , ' + varName2 + ')',
          tooltip: this.translate.get('TOOLTIPS.AXIS.MATRIX.I'),
        },
        {
          mode: MATRIX_MODES.FREQUENCY,
          title: 'Frequency',
          tooltip: this.translate.get('TOOLTIPS.AXIS.MATRIX.F'),
        },
        {
          mode: MATRIX_MODES.PROB_CELL,
          title: 'P (' + varName2 + ' | ' + varName1 + ')',
          tooltip: this.translate.get('TOOLTIPS.AXIS.MATRIX.P'),
        },
        {
          mode: MATRIX_MODES.PROB_CELL_REVERSE,
          title: 'P (' + varName1 + ' | ' + varName2 + ')',
          tooltip: this.translate.get('TOOLTIPS.AXIS.MATRIX.P'),
        },
        {
          mode: MATRIX_MODES.HELLINGER,
          title: 'H (' + varName1 + ' , ' + varName2 + ')',
          tooltip: this.translate.get('TOOLTIPS.AXIS.MATRIX.H'),
        },
      ];
      this.matrixModes = { ...this.matrixModes };

      // Check if saved into json
      if (
        this.dimensionsDatas?.matrixMode !== undefined &&
        this.dimensionsDatas.matrixMode < this.matrixModes.types.length
      ) {
        this.matrixModes.selected =
          this.matrixModes.types[this.dimensionsDatas?.matrixMode];
        this.matrixModes.selectedIndex = this.dimensionsDatas?.matrixMode;
      }
    }
  }

  /**
   * Handles the event when a tree node is selected.
   * Increments the initNodesEvents counter to improve matrix drawing performance.
   * On the first load, it collapses saved collapsed nodes.
   * If it's not the first load, it checks if the selected node is a context dimension.
   * If the event should propagate and all nodes are initialized, or if it's a context dimension,
   * it redraws the matrix. Otherwise, it redraws only the selected nodes.
   *
   * @param e - The event object containing details about the selected node.
   */
  private onTreeSelectedNodeChanged(e: TreeNodeChangedEventI) {
    this.initNodesEvents++;
    if (this.isFirstLoad) {
      // At first launch collapse saved collapsed nodes
      this.isFirstLoad = false;
    } else {
      // check if it's a context selection to redraw matrix
      const isContextDimension = this.dimensionsDatasService.isContextDimension(
        e.hierarchyName,
      );

      if (
        (!e.stopPropagation &&
          this.initNodesEvents === this.dimensionsDatas?.dimensions.length) ||
        isContextDimension
      ) {
        this.matrix?.drawMatrix();
      } else if (
        !e.stopPropagation &&
        this.initNodesEvents > (this.dimensionsDatas?.dimensions.length ?? 0)
      ) {
        this.matrix?.drawSelectedNodes();
      }
    }
  }
}
