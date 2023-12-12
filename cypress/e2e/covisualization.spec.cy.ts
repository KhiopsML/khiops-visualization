import "../support/commands";
import "../utils/utils";

describe("Test Khiops Covisualization sample files", () => {
	const files = [
		"v4.json",
		"AdultSmall.json",
		"Coclustering-100x100.json",
		"cc.json",
		"Co-simple-2vars.json",
		"Coclustering-6.json",
		"Coclustering-4.json",
		"co-IrisMissing.json",
		"adult2var.json",
		"sample3.json",
		"DataNoisyCorrelatedN1000000_C1000_V10_L5Coclustering.json",
		"sample0.json",
		"adultmissing.json",
		"mushroom.json",
		"SimplifiedCoclusteringIrisOldFormat_BugUndefined.json",
		"h-Coclustering.json",
		"irismissing.json",
		"zero-except.json",
		"donotworkk10.1.1_id_feat_nospace_Coclustering.json",
		"co-3-num.json",
		"h-Coclustering-2-2.json",
		"ext-CC_Coclustering.json",
		"ext-datas_Coclustering.json",
		"ext-CC_Coclustering.json",
		"CC_3_Coclustering.json",

		//
		//
		// TOO BIG Files
		// "NovaCoclustering4mb.json",
		// "DigitCoclustering.json",
		// "WebSpamCoclustering18mb.json",
		// "VerbNounCoclustering27mo.json",
	];

	files.forEach((fileName, fileIndex) => {
		it(
			`Check values for ${fileName}`,
			{ defaultCommandTimeout: 10000 },
			() => {
				//@ts-ignore
				cy.initViews();

				//@ts-ignore
				cy.loadFile("covisualization", fileName);

				cy.readFile("./src/assets/mocks/kc/" + fileName).then(
					(datas) => {
						console.log(
							"file: covisualization.spec.cy.ts:48 ~ files.forEach ~ datas:",
							datas
						);

						const testView = ["Axis"];
						if (
							datas.coclusteringReport?.dimensionSummaries
								?.length > 2
						) {
							testView.push("Context");
						}
						const testsValues = {
							Axis: [],
							Context: [],
						};

						testsValues.Axis.push("Hierarchy");
						testsValues.Axis.push(
							datas.coclusteringReport?.dimensionSummaries[0]
								?.name
						);
						testsValues.Axis.push(
							datas.coclusteringReport?.dimensionSummaries[1]
								?.name
						);
						if (
							datas.coclusteringReport?.dimensionPartitions[0]
								?.intervals
						) {
							testsValues.Axis.push(
								datas.coclusteringReport?.dimensionPartitions[0]?.intervals[0]?.bounds[0]?.toString()
							);
						}

						if (
							datas.coclusteringReport?.dimensionPartitions[1]
								?.intervals
						) {
							testsValues.Axis.push(
								datas.coclusteringReport?.dimensionPartitions[1]?.intervals[0]?.bounds[0]?.toString()
							);
						}

						if (
							datas.coclusteringReport?.dimensionPartitions[0]
								?.valueGroups
						) {
							testsValues.Axis.push(
								datas.coclusteringReport?.dimensionPartitions[0]?.valueGroups[0]?.cluster[0].toString()
							);
						}

						if (
							datas.coclusteringReport?.dimensionPartitions[1]
								?.valueGroups
						) {
							testsValues.Axis.push(
								datas.coclusteringReport?.dimensionPartitions[1]?.valueGroups[0]?.cluster[0].toString()
							);
						}

						if (
							datas.coclusteringReport?.dimensionSummaries[0]
								.type === "Categorical" ||
							datas.coclusteringReport?.dimensionSummaries[1]
								.type === "Categorical"
						) {
							testsValues.Axis.push("Composition");
							testsValues.Axis.push("typicality");
							testsValues.Axis.push("Size");
						}

						testsValues.Axis.push("Name");
						testsValues.Axis.push("Interest");
						testsValues.Axis.push("Distribution");
						testsValues.Axis.push("Selected clusters");
						testsValues.Axis.push("Nb Clusters");

						if (fileName === "v4.json") {
							// test saved datas
							testsValues.Axis.push("P ("); // Matrix component
						} else {
							testsValues.Axis.push("I ("); // Matrix component
						}
						if (
							datas.coclusteringReport?.dimensionSummaries
								?.length > 2
						) {
							testsValues.Axis.push("Conditional on context"); // Matrix component
						}
						testsValues.Axis.push("Cell stats"); // Matrix component

						testView.forEach((view) => {
							cy.get('.mat-tab-label:contains("' + view + '")')
								.first()
								.click();
							let testValue = testsValues[view];

							if (testValue) {
								testValue.forEach((test) => {
									if (test) {
										cy.contains(test);
									}
								});
							}
						});
					}
				);
			}
		);
	});
});
