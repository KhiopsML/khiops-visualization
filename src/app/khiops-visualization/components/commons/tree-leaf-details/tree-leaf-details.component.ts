import {
	Component,
	OnInit,
	NgZone,
	OnDestroy,
	OnChanges,
	SimpleChanges,
	AfterViewInit,
	Input,
} from '@angular/core';
import _ from 'lodash';
import {
	SelectableService
} from '@khiops-library/components/selectable/selectable.service';
import {
	DistributionDatasService
} from '@khiops-visualization/providers/distribution-datas.service';
import {
	TranslateService
} from '@ngstack/translate';
import {
	TreePreparationDatasService
} from '@khiops-visualization/providers/tree-preparation-datas.service';
import {
	GridDatasI
} from '@khiops-library/interfaces/grid-datas';
import {
	TreePreparationDatasVO
} from '@khiops-visualization/model/tree-preparation-datas-vo';
import {
	DistributionDatasVO
} from '@khiops-visualization/model/distribution-datas-vo';
import {
	UtilsService
} from '@khiops-library/providers/utils.service';

@Component({
	selector: 'app-tree-leaf-details',
	templateUrl: './tree-leaf-details.component.html',
	styleUrls: ['./tree-leaf-details.component.scss'],
})
export class TreeLeafDetailsComponent
	implements OnInit, AfterViewInit, OnChanges, OnDestroy {
	@Input() selectedNode: any;
	@Input() displayedValues: any;

	populationCount = 10;

	treePreparationDatas: TreePreparationDatasVO;
	distributionDatas: DistributionDatasVO;
	position = 1; // to change graph id

	treeLeafRules: GridDatasI;
	distributionGraphType: string;
	treeNodeTargetDistributionGraphType: string;

	constructor(
		public ngzone: NgZone,
		public selectableService: SelectableService,
		private treePreparationDatasService: TreePreparationDatasService,
		private distributionDatasService: DistributionDatasService,
		public translate: TranslateService
	) { }

	ngOnInit() {
		this.treePreparationDatas = this.treePreparationDatasService.getDatas();
		this.distributionDatas = this.distributionDatasService.getDatas();
	}

	ngAfterViewInit() { }

	ngOnDestroy() { }

	updateComponentDatas() {
		setTimeout(() => {
			this.distributionDatasService.getTreeNodeTargetDistributionGraphDatas(
				this.selectedNode
			);
			//Set the same as other components at init
			this.distributionDatasService.setTreeHyperDisplayedValues(
				this.distributionDatas.treeNodeTargetDistributionDisplayedValues
			);
			this.treeLeafRules =
				this.treePreparationDatasService.getTreeLeafRules();

			this.populationCount = UtilsService.arraySum(
				this.selectedNode.targetValues.frequencies
			);
		});
	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes.selectedNode && changes.selectedNode.currentValue) {
			this.updateComponentDatas();
		}
	}

	onSelectedTreeLeafDetailsTabChanged(e) { }

	onTreeNodeTargetDistributionGraphTypeChanged(type: any) {
		this.treeNodeTargetDistributionGraphType = type;
		this.distributionDatasService.getTreeNodeTargetDistributionGraphDatas(
			this.selectedNode,
			this.treeNodeTargetDistributionGraphType
		);
	}

	onSelectedTreeNodeDistributionGraphItemChanged(index: any) { }

	onSelectedTreeNodeTargetDistributionGraphItemChanged(index: any) { }

	onTreeNodeTargetDistributionGraphDisplayedValuesChanged(displayedValues) {
		this.distributionDatasService.setTreeNodeTargetDistributionDisplayedValues(
			displayedValues
		);
		this.distributionDatasService.getTreeNodeTargetDistributionGraphDatas(
			this.selectedNode,
			this.treeNodeTargetDistributionGraphType
		);
	}

	onTreeHyperValuesChanged(displayedValues) {
		this.distributionDatasService.setTreeHyperDisplayedValues(
			displayedValues
		);
	}
}
