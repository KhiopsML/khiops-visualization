import {
  Component,
  OnInit,
  SimpleChanges,
  OnChanges,
  Input,
} from '@angular/core'
import { trigger, transition, animate, style } from '@angular/animations'
import { DimensionVO } from '@khiops-library/model/dimension-vo'
import { DimensionsDatasService } from '@khiops-covisualization/providers/dimensions-datas.service'
import { TreenodesService } from '@khiops-covisualization/providers/treenodes.service'
import { AppService } from '@khiops-covisualization/providers/app.service'
import { TreeNodeVO } from '@khiops-covisualization/model/tree-node-vo'
import { EventsService } from '@khiops-covisualization/providers/events.service'
import { MatSnackBar } from '@angular/material/snack-bar'
import { TranslateService } from '@ngstack/translate'

@Component({
  selector: 'app-hierarchy-select',
  templateUrl: './hierarchy-select.component.html',
  styleUrls: ['./hierarchy-select.component.scss'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({
          opacity: 0,
        }),
        animate('150ms ease-in'),
      ]),
      transition(':leave', [
        animate(
          '150ms ease-in',
          style({
            opacity: 0,
          }),
        ),
      ]),
    ]),
  ],
})
export class HierarchySelectComponent implements OnInit, OnChanges {
  @Input() selectedDimension: DimensionVO
  @Input() selectedNode: TreeNodeVO
  @Input() position: number
  @Input() dimensions: DimensionVO[]
  treeCollapseChangedSub: any

  showStats = false
  intervals = 0

  constructor(
    private treenodesService: TreenodesService,
    private snackBar: MatSnackBar,
    private translate: TranslateService,
    private appService: AppService,
    private dimensionsService: DimensionsDatasService,
    private eventsService: EventsService,
  ) {
    this.treeCollapseChangedSub = this.eventsService.treeCollapseChanged.subscribe(
      (dimensionName) => {
        if (dimensionName === this.selectedDimension.name) {
          this.intervals = this.dimensionsService.getDimensionIntervals(
            this.selectedDimension.name,
          )
        }
      },
    )
  }

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.selectedDimension && changes.selectedDimension.currentValue) {
      this.intervals = this.dimensionsService.getDimensionIntervals(
        this.selectedDimension.name,
      )
    }
  }

  changeSelectedDimension(dimension, newPosition) {
    const isBigJsonFile = this.appService.isBigJsonFile()
    if (isBigJsonFile) {
      this.snackBar.open(
        this.translate.get('GLOBAL.BIG_FILES_LOADING_WARNING'),
        null,
        {
          duration: 2000,
          panelClass: 'success',
        },
      )
    }

    setTimeout(() => {
      this.appService.switchSplitSizes(this.position, newPosition)

      // Reverse selected nodes on selection changed
      this.treenodesService.updateSelectedNodes(dimension, this.position)

      // Reverse dimensions datas on selection changed
      this.dimensionsService.updateSelectedDimension(dimension, this.position)

      // Recompute datas
      this.dimensionsService.updateDimensions()

      this.treenodesService.collapseNodesSaved()
    })
  }
}
