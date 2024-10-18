import {
  Component,
  OnInit,
  Output,
  ViewChild,
  OnDestroy,
  EventEmitter,
  Input,
} from '@angular/core';
import { SelectableTabComponent } from '@khiops-library/components/selectable-tab/selectable-tab.component';
import { AppConfig } from 'src/environments/environment';
import { AppService } from '@khiops-covisualization/providers/app.service';
import { DimensionsDatasService } from '@khiops-covisualization/providers/dimensions-datas.service';
import { ViewLayoutVO } from '@khiops-covisualization/model/viewLayout.model';
import { AxisComponent } from '../commons/axis/axis.component';
import { TreenodesService } from '@khiops-covisualization/providers/treenodes.service';
import { TranslateService } from '@ngstack/translate';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { DimensionsDatasModel } from '@khiops-covisualization/model/dimensionsData.model';
import { AnnotationService } from '@khiops-covisualization/providers/annotation.service';

@Component({
  selector: 'app-axis-view',
  templateUrl: './axis-view.component.html',
  styleUrls: ['./axis-view.component.scss'],
})
export class AxisViewComponent
  extends SelectableTabComponent
  implements OnInit, OnDestroy
{
  @ViewChild('axisAppPos0', {
    static: false,
  })
  axisAppPos0: AxisComponent;

  @ViewChild('axisAppPos1', {
    static: false,
  })
  axisAppPos1: AxisComponent;

  sizes: any;
  dimensionsDatas: DimensionsDatasModel;
  @Output() toggleContext: EventEmitter<any> = new EventEmitter();
  @Input() openContextView = false;
  viewsLayout: ViewLayoutVO;
  viewsLayoutChangedSub: Subscription;
  isBigJsonFile = false;
  override loadingView = false;

  constructor(
    private appService: AppService,
    private treenodesService: TreenodesService,
    private dimensionsDatasService: DimensionsDatasService,
    private annotationService: AnnotationService,
    private translate: TranslateService,
    private snackBar: MatSnackBar,
  ) {
    super();
  }
  ngOnInit() {
    this.initialize();
  }

  initialize() {
    this.loadingView = true;
    this.isBigJsonFile = this.appService.isBigJsonFile();

    setTimeout(() => {
      this.sizes = this.appService.getViewSplitSizes('axisView');

      // #154 initializeSavedState before datas to get saved json datas
      this.initializeSavedState();
      this.initializeDatas();

      if (this.dimensionsDatas.dimensions.length > 0) {
        const isLargeCocluster = this.dimensionsDatasService.isLargeCocluster();
        let collapsedNodes = this.appService.getSavedDatas('collapsedNodes');
        // collapsedNodes =
        //   this.appService.checkCollapsedNodesIntegrity(collapsedNodes);

        if (collapsedNodes) {
          this.computeSavedState(collapsedNodes);
        }
        // Always computeLargeCoclustering if it's a LargeCocluster
        if (isLargeCocluster) {
          this.computeLargeCoclustering(collapsedNodes);
        }

        this.dimensionsDatasService.getMatrixDatas();
        this.dimensionsDatasService.computeMatrixDataFreqMap();
        this.loadingView = false;

        this.viewsLayout = this.appService.initViewsLayout(
          this.dimensionsDatas.selectedDimensions,
        );
      }
    }, 500); // To show loader when big files

    // Listen for view layout changes
    this.viewsLayoutChangedSub = this.appService.viewsLayoutChanged.subscribe(
      (viewsLayout) => {
        this.viewsLayout = viewsLayout;
      },
    );
  }

  initializeDatas() {
    this.dimensionsDatas = this.dimensionsDatasService.getDatas();
    this.dimensionsDatasService.getDimensions();
    this.dimensionsDatasService.initSelectedDimensions();
    this.dimensionsDatasService.saveInitialDimension();
    this.dimensionsDatasService.constructDimensionsTrees();
  }

  /**
   * Init saved datas from Json savedDatas
   * nodesNames, selectedNodes, matrix states and selections, view layouts ...
   */
  initializeSavedState() {
    this.treenodesService.initSavedDatas();
    this.annotationService.initSavedDatas();
    this.dimensionsDatasService.initSavedDatas();
    this.appService.initSavedDatas();
  }

  /**
   * Recompute json when nodes have been collapsed
   * @param collapsedNodes
   */
  computeSavedState(collapsedNodes) {
    let datas = this.treenodesService.constructSavedJson(collapsedNodes);
    this.appService.setCroppedFileDatas(datas);
    this.initializeDatas();
  }

  /**
   * Recompute json for large coclustering to prevent freeze
   */
  computeLargeCoclustering(collapsedNodesSaved) {
    const unfoldState =
      this.appService.getSavedDatas('unfoldHierarchyState') ||
      this.dimensionsDatas.dimensions.length *
        AppConfig.covisualizationCommon.UNFOLD_HIERARCHY.ERGONOMIC_LIMIT;

    this.treenodesService.setSelectedUnfoldHierarchy(unfoldState);
    let collapsedNodes =
      this.treenodesService.getLeafNodesForARank(unfoldState);

    // Merge collapsed nodes
    collapsedNodes = this.treenodesService.mergeCollapsedNodes(
      collapsedNodes,
      collapsedNodesSaved,
    );

    this.treenodesService.setSavedCollapsedNodes(collapsedNodes);

    let datas = this.treenodesService.constructSavedJson(collapsedNodes);
    this.appService.setCroppedFileDatas(datas);

    this.initializeDatas();

    this.snackBar.open(
      this.translate.get('SNACKS.UNFOLDED_DATAS_PERFORMANCE_WARNING', {
        count: unfoldState,
      }),
      this.translate.get('GLOBAL.OK'),
      {
        duration: 4000,
        panelClass: 'warning',
        verticalPosition: 'bottom',
      },
    );
  }

  ngOnDestroy() {
    this.viewsLayoutChangedSub?.unsubscribe();
  }

  onSplitDragEnd(event, item) {
    this.appService.resizeAndSetSplitSizes(
      item,
      this.sizes,
      event.sizes,
      'axisView',
    );

    // Resize graph when area is resized
    this.axisAppPos0.onSplitDragEnd(null, null);
    this.axisAppPos1.onSplitDragEnd(null, null);
  }

  clickOutsideContext() {
    this.toggleContext.emit();
  }
}
