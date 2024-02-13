import { TestBed } from "@angular/core/testing";
import { AppService } from "@khiops-covisualization/providers/app.service";
import { DimensionsDatasService } from "@khiops-covisualization/providers/dimensions-datas.service";
import { HttpClientModule } from "@angular/common/http";
import { SaveService } from "@khiops-covisualization/providers/save.service";
import { TreenodesService } from "@khiops-covisualization/providers/treenodes.service";
import { DimensionVO } from "@khiops-library/model/dimension-vo";
import { DimensionsDatasVO } from "@khiops-covisualization/model/dimensions-data-vo";
import { AppConfig } from "src/environments/environment";
// import { AnnotationService } from "@khiops-covisualization/providers/annotation.service";
let appService: AppService;
let treenodesService: TreenodesService;
let dimensionsDatasService: DimensionsDatasService;
// let annotationService: AnnotationService;
let saveService: SaveService;

let result;

describe("CoVisualization", () => {
	describe("Save hierarchy : large coclustering [donotworkk10.1.1_id_feat_nospace_Coclustering.json]", () => {
		beforeEach(() => {
			TestBed.configureTestingModule({
				imports: [HttpClientModule],
			});

			treenodesService = TestBed.inject(TreenodesService);
			appService = TestBed.inject(AppService);
			// saveService = TestBed.inject(SaveService);
			dimensionsDatasService = TestBed.inject(DimensionsDatasService);
			const fileDatas = require("../../assets/mocks/kc/donotworkk10.1.1_id_feat_nospace_Coclustering.json");
			// const fileDatasUpdated = require("../mocks/covisualization/save-hierarchy/sample3.json");

			appService.setFileDatas(fileDatas);

			// const isBigJsonFile = appService.isBigJsonFile();
			// console.log('beforeEach ~ isBigJsonFile:', isBigJsonFile);

			// 	initializeDatas();
			// 	initializeSavedState();
		});

		it("Loading large coclustering : isBigJsonFile must return true", () => {
			const isBigJsonFile = appService.isBigJsonFile();
			expect(isBigJsonFile).toEqual(true);
		});

		it("Loading large coclustering : initial datas must be valid", () => {
			dimensionsDatasService.getDimensions();
			dimensionsDatasService.initSelectedDimensions();
			dimensionsDatasService.saveInitialDimension();
			dimensionsDatasService.constructDimensionsTrees();

			const dimensionsDatas: DimensionsDatasVO =
				dimensionsDatasService.getDatas();

			// dimensionsDatas.dimensionsTrees[0]
			expect(dimensionsDatas.cellPartIndexes.length).toEqual(45057);
			expect(dimensionsDatas.cellPartIndexes[0]).toEqual([1201, 624]);
			expect(dimensionsDatas.currentDimensionsClusters[0].length).toEqual(
				5071
			);
			expect(
				dimensionsDatas.currentDimensionsClusters[0][0].bounds
			).toEqual("{1040, 1719, 1720}");
			expect(dimensionsDatas.currentDimensionsClusters[1].length).toEqual(
				1253
			);
			expect(
				dimensionsDatas.currentDimensionsClusters[1][0].bounds
			).toEqual("{feat_1209}");
			expect(dimensionsDatas.currentDimensionsTrees[0][0].id).toEqual(
				2955
			);
			expect(dimensionsDatas.dimensions[0].initialParts).toEqual(2536);
		});

		// it("Loading large coclustering : computed reduced datas must be valid", () => {
		// 	dimensionsDatasService.getDimensions();
		// 	dimensionsDatasService.initSelectedDimensions();
		// 	dimensionsDatasService.saveInitialDimension();
		// 	dimensionsDatasService.constructDimensionsTrees();

		// 	const dimensionsDatas: DimensionsDatasVO =
		// 		dimensionsDatasService.getDatas();

		// 	const unfoldState =
		// 		dimensionsDatas.dimensions.length *
		// 		AppConfig.covisualizationCommon.UNFOLD_HIERARCHY
		// 			.ERGONOMIC_LIMIT;

		// 	treenodesService.setSelectedUnfoldHierarchy(unfoldState);
		// 	const collapsedNodes =
		// 		treenodesService.getLeafNodesForARank(unfoldState);
		// 	treenodesService.setSavedCollapsedNodes(collapsedNodes);

		// 	let datas = saveService.constructSavedJson(collapsedNodes);
		// 	appService.setCroppedFileDatas(datas);

		// 	// const dimensionsDatas: DimensionsDatasVO =
		// 	// 	dimensionsDatasService.getDatas();

		// 	// dimensionsDatas.dimensionsTrees[0]
		// 	expect(dimensionsDatas.cellPartIndexes.length).toEqual(45057);
		// 	expect(dimensionsDatas.cellPartIndexes[0]).toEqual([1201, 624]);
		// 	expect(dimensionsDatas.currentDimensionsClusters[0].length).toEqual(
		// 		5071
		// 	);
		// 	expect(
		// 		dimensionsDatas.currentDimensionsClusters[0][0].bounds
		// 	).toEqual("{1040, 1719, 1720}");
		// 	expect(dimensionsDatas.currentDimensionsClusters[1].length).toEqual(
		// 		1253
		// 	);
		// 	expect(
		// 		dimensionsDatas.currentDimensionsClusters[1][0].bounds
		// 	).toEqual("{feat_1209}");
		// 	expect(dimensionsDatas.currentDimensionsTrees[0][0].id).toEqual(
		// 		2955
		// 	);
		// 	expect(dimensionsDatas.dimensions[0].initialParts).toEqual(2536);
		// });

		// 	it("dimensionPartitions values must be collapsed", () => {
		// 		expect(
		// 			result.coclusteringReport.dimensionPartitions[0].valueGroups[0]
		// 				.values
		// 		).toEqual([
		// 			"Private",
		// 			"Never-worked",
		// 			"Self-emp-not-inc",
		// 			"Without-pay",
		// 			"Self-emp-inc",
		// 		]);
		// 	});

		// 	it("dimensionPartitions valueFrequencies must be collapsed", () => {
		// 		expect(
		// 			result.coclusteringReport.dimensionPartitions[0].valueGroups[0]
		// 				.valueFrequencies
		// 		).toEqual([36705, 10, 3862, 21, 1695]);
		// 	});

		// 	it("dimensionPartitions valueTypicalities must be collapsed", () => {
		// 		expect(
		// 			result.coclusteringReport.dimensionPartitions[0].valueGroups[0]
		// 				.valueTypicalities
		// 		).toEqual([1, 0.00631547, 1, 0.0170314, 1]);
		// 	});

		// 	it("cellPartIndexes must be collapsed and reorded", () => {
		// 		expect(result.coclusteringReport.cellPartIndexes).toEqual([
		// 			[0, 1, 1],
		// 			[0, 0, 1],
		// 			[0, 1, 0],
		// 			[1, 1, 1],
		// 			[1, 0, 1],
		// 			[1, 1, 0],
		// 			[0, 0, 0],
		// 			[1, 0, 0],
		// 		]);
		// 	});

		// 	it("cellFrequencies must be collapsed and reorded", () => {
		// 		expect(result.coclusteringReport.cellFrequencies).toEqual([
		// 			28864, 8962, 3964, 3109, 2346, 795, 503, 299,
		// 		]);
		// 	});

		// 	it("summary cells must be collapsed", () => {
		// 		expect(result.coclusteringReport.summary.cells).toEqual(8);
		// 	});
		// });

		// describe("Save hierarchy : Numerical [sample0.json]", () => {
		// 	beforeEach(() => {
		// 		TestBed.configureTestingModule({
		// 			imports: [HttpClientModule],
		// 		});

		// 		treenodesService = TestBed.inject(TreenodesService);
		// 		saveService = TestBed.inject(SaveService);
		// 		appService = TestBed.inject(AppService);
		// 		dimensionsDatasService = TestBed.inject(DimensionsDatasService);
		// 		const fileDatas = require("../../assets/mocks/kc/sample0.json");
		// 		const fileDatasUpdated = require("../mocks/covisualization/save-hierarchy/sample0.json");

		// 		appService.setFileDatas(fileDatas);

		// 		dimensionsDatasService.initialize();
		// 		dimensionsDatasService.getDimensions();
		// 		dimensionsDatasService.initSelectedDimensions();
		// 		dimensionsDatasService.constructDimensionsTrees();

		// 		treenodesService.initialize();

		// 		result = saveService.truncateJsonHierarchy(fileDatasUpdated);
		// 		result = saveService.updateSummariesParts(result);
		// 		result = saveService.truncateJsonPartition(result);
		// 		result = saveService.truncateJsonCells(result);
		// 		result = saveService.updateSummariesCells(result);
		// 	});

		// 	it("dimensionHierarchies must be collapsed and reorded by leaf and rank", () => {
		// 		const clusters =
		// 			result.coclusteringReport.dimensionHierarchies[0].clusters.map(
		// 				(e) => e.cluster
		// 			);
		// 		expect(clusters).toEqual([
		// 			"]-inf;1.5]",
		// 			"]1.5;+inf[",
		// 			"]-inf;+inf[",
		// 		]);
		// 	});

		// 	it("dimensionPartitions intervals bounds must be collapsed", () => {
		// 		expect(
		// 			result.coclusteringReport.dimensionPartitions[0].intervals[0]
		// 				.bounds
		// 		).toEqual([1, 1.5]);
		// 	});

		// 	it("cellPartIndexes must be collapsed and reorded", () => {
		// 		expect(result.coclusteringReport.cellPartIndexes).toEqual([
		// 			[1, 0, 0],
		// 			[0, 0, 0],
		// 			[1, 1, 0],
		// 			[0, 1, 0],
		// 		]);
		// 	});

		// 	it("cellFrequencies must be collapsed and reorded", () => {
		// 		expect(result.coclusteringReport.cellFrequencies).toEqual([
		// 			10000, 3500, 2500, 2000,
		// 		]);
		// 	});

		// 	it("summary cells must be collapsed", () => {
		// 		expect(result.coclusteringReport.summary.cells).toEqual(4);
		// 	});
	});
});
