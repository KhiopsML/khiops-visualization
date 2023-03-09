import {
  Component,
  Input,
  OnInit,
  OnChanges,
  NgZone,
  OnDestroy,
  SimpleChanges,
} from '@angular/core'
import _ from 'lodash'
import { TranslateService } from '@ngstack/translate'
import { DimensionVO } from '@khiops-library/model/dimension-vo'
import { EventsService } from '@khiops-covisualization/providers/events.service'
import { ClustersService } from '@khiops-covisualization/providers/clusters.service'
import { TreenodesService } from '@khiops-covisualization/providers/treenodes.service'
import { ClusterDetailsVO } from '@khiops-covisualization/model/cluster-details-vo'
import { GridColumnsI } from '@khiops-library/interfaces/grid-columns'

@Component({
  selector: 'app-cluster-details',
  templateUrl: './cluster-details.component.html',
  styleUrls: ['./cluster-details.component.scss'],
})
export class ClusterDetailsComponent implements OnInit, OnChanges, OnDestroy {
  @Input() position: number
  @Input() dimensionsTree: any
  @Input() selectedDimension: DimensionVO
  @Input() selectedNode: any
  nodeToSelect: any
  clusterDisplayedColumns: GridColumnsI[] = [
    {
      headerName: 'Name',
      field: 'name',
      tooltip: this.translate.get('TOOLTIPS.AXIS.CURRENT_CLUSTERS.NAME'),
    },
    {
      headerName: 'Father',
      field: 'father',
      show: false,
      tooltip: this.translate.get('TOOLTIPS.AXIS.CURRENT_CLUSTERS.FATHER'),
    },
    {
      headerName: 'Frequency',
      field: 'frequency',
      tooltip: this.translate.get('TOOLTIPS.AXIS.CURRENT_CLUSTERS.FREQUENCY'),
    },
    {
      headerName: 'Interest',
      field: 'interest',
      tooltip: this.translate.get('TOOLTIPS.AXIS.CURRENT_CLUSTERS.INTEREST'),
    },
    {
      headerName: 'Hierarchical Level',
      field: 'hierarchicalLevel',
      show: false,
      tooltip: this.translate.get('TOOLTIPS.AXIS.CURRENT_CLUSTERS.LEVEL'),
    },
    {
      headerName: 'Rank',
      field: 'rank',
      show: false,
      tooltip: this.translate.get('TOOLTIPS.AXIS.CURRENT_CLUSTERS.RANK'),
    },
  ]

  title: string
  filteredDimensionsClusters: ClusterDetailsVO[]
  updateValues: ClusterDetailsVO[]
  treeCollapseChangedSub: any
  treeNodeNameChangedSub: any
  id: any

  constructor(
    private translate: TranslateService,
    public ngzone: NgZone,
    private treenodesService: TreenodesService,
    private clustersService: ClustersService,
    private eventsService: EventsService,
  ) {
    this.title = this.translate.get('GLOBAL.CURRENT_CLUSTERS')

    this.treeCollapseChangedSub = this.eventsService.treeCollapseChanged.subscribe(
      (dimensionName) => {
        if (dimensionName === this.selectedDimension.name) {
          this.getFilteredDimensionTree(this.dimensionsTree)
        }
        this.updateSelectedNode()
      },
    )

    this.treeNodeNameChangedSub = this.eventsService.treeNodeNameChanged.subscribe(
      (e) => {
        let selectedCluster: ClusterDetailsVO
        this.updateValues = []

        // Update the selected cluster and father
        selectedCluster = this.filteredDimensionsClusters.find(
          (cluster) => cluster._id === e.selectedNode._id,
        )
        if (selectedCluster) {
          selectedCluster.name = e.selectedNode.shortDescription
          selectedCluster.father = e.selectedNode.parentShortDescription
          this.updateValues.push(selectedCluster)
        }

        if (!e.selectedNode.isLeaf) {
          // update father of all children if it's a node
          for (let i = 0; i < e.selectedNode.children.length; i++) {
            selectedCluster = this.filteredDimensionsClusters.find(
              (cluster) => cluster._id === e.selectedNode.children[i]._id,
            )
            if (selectedCluster) {
              selectedCluster.father = e.selectedNode.shortDescription
              this.updateValues.push(selectedCluster)
            }
          }
        }
      },
    )
  }

  ngOnInit() {
    // define an id to be copied into clipboard
    this.id = 'cluster-details-grid-' + this.position

    // Insert size column if it is a categorical dimension
    if (this.selectedDimension.type === 'Categorical') {
      this.clusterDisplayedColumns.splice(2, 0, {
        headerName: 'Size',
        field: 'size',
      })
    }

    this.getFilteredDimensionTree(this.dimensionsTree)
  }

  ngOnDestroy() {
    this.treeCollapseChangedSub.unsubscribe()
    this.treeNodeNameChangedSub.unsubscribe()
  }

  ngOnChanges(changes: SimpleChanges) {
    // Keep change listen on dimension combo change
    if (changes.dimensionsTree && changes.dimensionsTree.currentValue) {
      this.getFilteredDimensionTree(this.dimensionsTree)
      this.updateSelectedNode()
    }
    if (changes.selectedNode && changes.selectedNode.currentValue) {
      this.updateSelectedNode()
    }
  }

  updateSelectedNode() {
    setTimeout(() => {
      if (this.selectedNode) {
        // Get nodes from input to update it
        this.nodeToSelect = {
          ...this.selectedNode,
        }
        const findNodeToSelect = this.filteredDimensionsClusters.find(
          (e) => e._id === this.nodeToSelect._id,
        )
        if (!findNodeToSelect) {
          // get the parent
          const parentNode: ClusterDetailsVO = this.filteredDimensionsClusters.find(
            (e) => e._id === this.nodeToSelect.parentCluster,
          )
          if (parentNode) {
            this.nodeToSelect._id = parentNode._id
          } else if (
            this.nodeToSelect.children &&
            this.nodeToSelect.children.length > 0
          ) {
            // get the first child
            this.nodeToSelect = this.getFirstNodeLeaf(this.nodeToSelect)
          }
        } else {
          if (this.nodeToSelect.isLeaf || this.nodeToSelect.isCollapsed) {
            this.nodeToSelect = this.nodeToSelect
          } else {
            this.nodeToSelect = this.getFirstNodeLeaf(this.nodeToSelect)
          }
        }
        this.nodeToSelect = {
          ...this.nodeToSelect,
        }
      }
    })
  }

  getFilteredDimensionTree(dimensionsTree) {
    if (dimensionsTree) {
      // Do it ngzone because event comes from tree component lib outsid ethe zone
      this.ngzone.run(() => {
        this.filteredDimensionsClusters = []
        const filteredDimensionsClustersDatas = [].concat(
          this.clustersService.getCurrentClusterDetailsFromNode(dimensionsTree),
        )
        for (let i = 0; i < filteredDimensionsClustersDatas.length; i++) {
          const clusterDetails: ClusterDetailsVO = new ClusterDetailsVO(
            filteredDimensionsClustersDatas[i],
          )
          this.filteredDimensionsClusters.push(clusterDetails)
        }
      })
    }
  }

  getFirstNodeLeaf(node): any {
    if (node.children.length > 0 && node.children[0].isLeaf === false) {
      return this.getFirstNodeLeaf(node.children[0])
    } else {
      return node.children[0]
    }

    // return this.treenodesService.getNodeFromName(this.selectedDimension.name, node.childrenLeafList[0]);
  }

  onSelectRowChanged(item: any) {
    this.treenodesService.setSelectedNode(
      this.selectedDimension.name,
      item._id,
      false,
    )
  }
}
