// import {
// 	TestBed
// } from "@angular/core/testing";
// import {
// 	AppService
// } from "@khiops-covisualization/providers/app.service";
// import {
// 	DimensionsDatasService
// } from "@khiops-covisualization/providers/dimensions-datas.service";
// import {
// 	HttpClientModule
// } from "@angular/common/http";

// import {
// 	SaveService
// } from "@khiops-covisualization/providers/save.service";
// import {
// 	TreenodesService
// } from "@khiops-covisualization/providers/treenodes.service";
// let appService: AppService;
// let saveService: SaveService;
// let treenodesService: TreenodesService;
// let dimensionsDatasService: DimensionsDatasService;

// let result;

// describe('CoVisualization', () => {
// describe("Save hierarchy : Categorical [sample3.json]", () => {
// 	beforeEach(() => {
// 		TestBed.configureTestingModule({
// 			imports: [HttpClientModule],
// 		});

// 		treenodesService = TestBed.inject(TreenodesService);
// 		saveService = TestBed.inject(SaveService);
// 		appService = TestBed.inject(AppService);
// 		dimensionsDatasService = TestBed.inject(DimensionsDatasService);
// 		const fileDatas = require("../mocks/covisualization/sample3.json");
// 		const fileDatasUpdated = require("../mocks/covisualization/save-hierarchy/sample3.json");

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
// 		expect(clusters).toEqual(["A4", "A10", "A1"]);
// 	});

// 	it("dimensionPartitions values must be collapsed", () => {
// 		expect(
// 			result.coclusteringReport.dimensionPartitions[0].valueGroups[0]
// 			.values
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
// 			.valueFrequencies
// 		).toEqual([36705, 10, 3862, 21, 1695]);
// 	});

// 	it("dimensionPartitions valueTypicalities must be collapsed", () => {
// 		expect(
// 			result.coclusteringReport.dimensionPartitions[0].valueGroups[0]
// 			.valueTypicalities
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
// 		const fileDatas = require("../mocks/covisualization/sample0.json");
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
// 		expect(clusters).toEqual(["]-inf;1.5]", "]1.5;+inf[", "]-inf;+inf["]);
// 	});

// 	it("dimensionPartitions intervals bounds must be collapsed", () => {
// 		expect(
// 			result.coclusteringReport.dimensionPartitions[0].intervals[0].bounds
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
// });
// });
