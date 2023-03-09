import {
	Component,
	OnInit
} from '@angular/core';
import {
	DimensionsDatasService
} from '@khiops-covisualization/providers/dimensions-datas.service';
import {
	MatDialogRef
} from '@angular/material/dialog';
import {
	KhiopsLibraryService
} from '@khiops-library/providers/khiops-library.service';
import {
	TranslateService
} from '@ngstack/translate';
import {
	CheckboxCellComponent
} from '@khiops-library/components/ag-grid/checkbox-cell/checkbox-cell.component';
import * as _ from 'lodash'; // Important to import lodash in karma
import {
	TreenodesService
} from '@khiops-covisualization/providers/treenodes.service';
import {
	ClustersService
} from '@khiops-covisualization/providers/clusters.service';

@Component({
	selector: 'app-unfold-hierarchy',
	templateUrl: './unfold-hierarchy.component.html',
	styleUrls: ['./unfold-hierarchy.component.scss']
})
export class UnfoldHierarchyComponent implements OnInit {

	dimensionsDatas: any;
	currentUnfoldHierarchy = 0;
	hierarchyDatas: any;
	loadingHierarchy = false;
	clustersPerDimDatas: any;
	infoPerCluster: any;
	lineChartSeries = [];
	barChartSeries = [];
	colorSetClusterPerDim: any;
	colorSetInfoPerCluster: any;
	previousHierarchyRank: any;
	nbClusterPerDimLegend: any[];
	currentInformationPerCluster = 100;

	dimensions: any[];
	unfoldSelection: any[];

	unfoldHierarchyTableTitle = '';

	selectedLineChartItem = undefined;

	hierarchyDisplayedColumns = [{
		headerName: 'Dimension',
		field: 'name'
	},
	{
		headerName: 'Number of Cluster',
		field: 'currentHierarchyClusterCount'
	},
	{
		headerName: 'Max Number of Cluster',
		field: 'initialParts'
	},
	{
		headerName: 'FoldUnfold',
		field: 'hierarchyFold',
		cellRendererFramework: CheckboxCellComponent
	}
	];
	chartOptions = {
		elements: {
			point: {
				radius: 0
			}
		},
		plugins: {
			tooltip: {
				enabled: false
			}
		},
		scales: {
			y: {
				title: {
					display: true,
					text: ''
				},
				gridLines: {
					color: '#eeeeee'
				}
			},
			x: {
				title: {
					display: true,
					text: ''
				},
				gridLines: {
					display: false
				}
			}
		}
	};
	clustersPerDimDatasChartOptions = _.cloneDeep(this.chartOptions);
	infoPerClusterChartOptions = _.cloneDeep(this.chartOptions);
	legend: any;
	currentCellsPerCluster = 0;
	unfoldHierarchyLegend: string;

	constructor(
		private translate: TranslateService,
		private dimensionsService: DimensionsDatasService,
		private treenodesService: TreenodesService,
		private clustersService: ClustersService,
		private khiopsLibraryService: KhiopsLibraryService,
		private dialogRef: MatDialogRef<UnfoldHierarchyComponent>) {

		this.hierarchyDatas = this.treenodesService.getHierarchyDatas();

		this.unfoldHierarchyTableTitle = this.translate.get('GLOBAL.NB_OF_CLUSTERS_PER_DIM');
		this.unfoldHierarchyLegend = this.translate.get('TOOLTIPS.AXIS.UNFOLD_HIERARCHY.LEGEND');

		this.clustersPerDimDatasChartOptions.scales.x.title.text = this.translate.get('GLOBAL.TOTAL_NUMBER_OF_CLUSTERS');
		this.clustersPerDimDatasChartOptions.scales.y.title.text = this.translate.get('GLOBAL.NB_OF_CLUSTERS_PER_DIM');

		this.infoPerClusterChartOptions.scales.x.title.text = this.translate.get('GLOBAL.TOTAL_NUMBER_OF_CLUSTERS');
		this.infoPerClusterChartOptions.scales.y.title.text = this.translate.get('GLOBAL.INFORMATION_RATE');
	}

	highlightChartLine(name: string) {
		this.selectedLineChartItem = name;
	}

	ngOnInit() {

		// this.previousHierarchyRank = copy(this.hierarchyDatas.selectedUnfoldHierarchy);
		this.previousHierarchyRank = _.cloneDeep(this.hierarchyDatas.selectedUnfoldHierarchy);
		this.currentUnfoldHierarchy = this.previousHierarchyRank;

		setTimeout(() => {
			this.dimensionsDatas = this.dimensionsService.getDatas();
			this.dimensions = _.cloneDeep(this.dimensionsDatas.dimensions);

			// Reset current herarchy cluster count if modal has been dismissed
			this.treenodesService.updateCurrentHierarchyClustersCount(this.currentUnfoldHierarchy);

			// get graph details datas
			this.clustersPerDimDatas = this.clustersService.getClustersPerDimDatas(this.currentUnfoldHierarchy);
			this.currentCellsPerCluster = this.clustersService.getCurrentCellsPerCluster();

			// compute legend labels
			this.legend = [{
				series: []
			}];
			// Do not insert bar chart legend (nb of clusters)
			for (let i = 0; i < this.clustersPerDimDatas.datasets.length - 1; i++) {
				this.legend[0].series.push({
					name: this.clustersPerDimDatas.datasets[i].label
				});
			}

			this.colorSetClusterPerDim = _.cloneDeep(this.khiopsLibraryService.getGraphColorSet()[0]);
			this.colorSetInfoPerCluster = _.cloneDeep(this.khiopsLibraryService.getGraphColorSet()[0]);

			// set the current hierarchy selection to black
			this.colorSetInfoPerCluster.domain[1] = '#000000';
			this.colorSetClusterPerDim.domain[this.clustersPerDimDatas.datasets.length - 1] = '#000000';

			this.infoPerCluster = this.clustersService.getInfoPerCluster(this.currentUnfoldHierarchy);
		}); // Do not freeze ui during graph render

	}

	onClickOnSave() {
		// this.khiopsLibraryService.trackEvent('click', 'unfold_hierarchy', 'nb_clusters', this.currentUnfoldHierarchy);

		this.loadingHierarchy = true;
		setTimeout(() => {
			this.treenodesService.setSelectedUnfoldHierarchy(this.currentUnfoldHierarchy);
			this.treenodesService.unfoldHierarchy(this.previousHierarchyRank, this.currentUnfoldHierarchy);
			this.loadingHierarchy = false;
			this.dialogRef.close();
		}); // do not freeze during computing
	}

	onClickOnCancel() {
		this.treenodesService.updateCurrentHierarchyClustersCount(this.previousHierarchyRank);
		this.dialogRef.close();
	}

	yLeftTickFormat() {
		return '';
	}

	increaseUnfoldHierarchy() {
		if (this.hierarchyDatas.totalClusters > this.currentUnfoldHierarchy) {
			this.onHierarchyChanged({
				value: this.currentUnfoldHierarchy + 1
			});
		}
	}

	decreaseUnfoldHierarchy() {
		if (this.hierarchyDatas.minClusters < this.currentUnfoldHierarchy) {
			this.onHierarchyChanged({
				value: this.currentUnfoldHierarchy - 1
			});
		}
	}

	onHierarchyChanged(event) {
		this.currentUnfoldHierarchy = event.value;
		this.clustersPerDimDatas = this.clustersService.getClustersPerDimDatas(this.currentUnfoldHierarchy);
		this.infoPerCluster = this.clustersService.getInfoPerCluster(this.currentUnfoldHierarchy);
		this.currentInformationPerCluster = this.infoPerCluster.datasets[0].data[this.currentUnfoldHierarchy - this.dimensions.length];
		this.treenodesService.updateCurrentHierarchyClustersCount(this.currentUnfoldHierarchy);

		// Dimension changed, clone to update array
		this.dimensions = _.cloneDeep(this.dimensionsDatas.dimensions);

		this.currentCellsPerCluster = this.clustersService.getCurrentCellsPerCluster();

	}

	onGridCheckboxChanged(event) {
		this.treenodesService.toggleDimensionHierarchyFold(event.data.name, event.state);
	}

}
