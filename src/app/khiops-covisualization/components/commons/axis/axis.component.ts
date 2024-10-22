import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { CompositionModel } from '@khiops-covisualization/model/composition.model';
import { DimensionsDatasModel } from '@khiops-covisualization/model/dimensions-data.model';
import { LayoutService } from '@khiops-library/providers/layout.service';
import { ViewManagerService } from '@khiops-covisualization/providers/view-manager.service';
import { DimensionViewLayoutModel } from '@khiops-covisualization/model/dimension-view-layout.model';

@Component({
  selector: 'app-axis',
  templateUrl: './axis.component.html',
  styleUrls: ['./axis.component.scss'],
})
export class AxisComponent implements OnInit {
  @Input() public sizeId: string;
  @Input() public position: number;
  @Input() public dimensionsDatas: DimensionsDatasModel;
  @Input() public axisLayout: DimensionViewLayoutModel;
  @Input() private viewId: string;

  public sizes: any;
  public column0Index = 0;
  public column1Index = 1;
  public column2Index = 2;
  public column3Index = 3;
  public column4Index = 4;
  public invertedPosition: number;
  public selectedComposition: CompositionModel;
  private viewLayout: DimensionViewLayoutModel;

  constructor(
    private layoutService: LayoutService,
    private viewManagerService: ViewManagerService,
  ) {}

  ngOnInit() {
    this.initializeView();
  }

  onSplitDragEnd(event, item) {
    if (event && item) {
      this.layoutService.resizeAndSetSplitSizes(
        item,
        this.sizes,
        event.sizes,
        this.viewId,
        true,
      );
      this.computeComponentsSizes();
    }
  }

  selectedCompositionChanged(composition: CompositionModel) {
    this.selectedComposition = composition;
  }

  private initializeView() {
    this.sizes = this.layoutService.getViewSplitSizes(this.viewId);
    this.computeComponentsSizes();
    this.invertedPosition = this.position === 0 ? 1 : 0;
  }

  /**
   * Compute the index of visible components
   * to get correct width split value from local storage
   * because sizes[sizeId] is an array of visible components length
   */
  private computeComponentsSizes() {
    this.viewLayout =
      this.viewManagerService.getViewsLayout().dimensionsViewsLayoutsVO[
        this.position
      ];
    if (this.viewLayout) {
      let i = 0;
      if (this.viewLayout.isHierarchyChecked) {
        this.column0Index = i;
        i++;
      }
      if (this.viewLayout.isClustersChecked) {
        this.column1Index = i;
        i++;
      }
      if (
        this.viewLayout.isAnnotationChecked ||
        this.viewLayout.isCompositionChecked
      ) {
        this.column2Index = i;
        i++;
      }
      if (this.viewLayout.isExternalDataChecked) {
        this.column3Index = i;
        i++;
      }
      if (this.viewLayout.isDistributionChecked) {
        this.column4Index = i;
        i++;
      }
    }
  }
}
