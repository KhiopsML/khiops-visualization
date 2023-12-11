import "../support/commands";

describe("Test Khiops Visualization sample files", () => {
	const files = [
		"new-hyper-tree.json",
		"irisR.json",
		"NGrams10_AnalysisResults.json",
		"NGrams100_AnalysisResults.json",
		"000_000_10000words_AllReports.json",
		"Regression_AllReports_All.json",
		"Regression_AllReports_PreparationOnly.json",
		"missing-zero.json",
		"C1000_AllReports.json",
		"C100_AllReports.json",
		"AdultRegressionAllReports.json",
		"onlyEvaluationReport.json",
		"explanatory.json",
		"adult-bivar.json",
		"desc-bivar.json",
		"bi2.json",
		"bi3.json",
		"Std_Iris_AnalysisResults.khj",
		"C1_AllReports.json",
		"C0_AllReports.json",
		"analyse_supervisee_multiclasse.json",
		"reg.json",
		"copydatas.json",
		"iris2d.json",
		"mainTargetValue.json",
		"leafrules.khj",
		"Filtered_Iris_AnalysisResults.khj",
		"defaultGroup.json",
		"bigTreeLeafs.json",
		"AdultAgeAllReports.json",
		"missing-level-parts.json",
		"lift-issue.khj",
		"tree-education_AllReports.json",
		"incomplete-detailed-stats.json",
		"OI_AllReports.json",
		"tree.json",
		"2d-cells-AllReports.json",
		"level.json",
		"xor.json",
		"Natives-Arbres_Paires_AllReports.json",
		"co-oc.json",
		"MSE_AllReports.json",
		"marc.json",
		"marc2.json",
		"tree-AllReports.json",
		"test_long_XDSL_Delc_AllReports.json",
		"Essai_1_AllReports.json",
		"typeBotnet_AllReports.json",
		"irisU.json",
		"CoronaWords100000_AllReports.V11.json",
		"CrirteoAllReports.json",
		"Words100_AllReports.json",
		"UnivariateAnalysisResults.json",
		"ylogAdultAllReports.json",
		"AdultAllReports.json",
		// "20NewsgroupAllReports.json", //  // Do not load it, too big and too long
		// "Natives_AllReports.json", // Do not load it, encoding issue
	];

	files.forEach((fileName, fileIndex) => {
		it(
			`Check values for ${fileName}`,
			{ defaultCommandTimeout: 10000 },
			() => {
				//@ts-ignore
				cy.loadFile(fileName);

				cy.readFile("./src/assets/mocks/kv/" + fileName).then(
					(datas) => {
						const testView = [];
						const testsValues = initTestValues();
						if (datas.preparationReport) {
							testView.push("Preparation");
							setupPreparationTests(datas, testsValues);
						}
						if (datas.modelingReport) {
							testView.push("Modeling");
							setupModelingTests(datas, testsValues);
						}
						if (datas.bivariatePreparationReport) {
							testView.push("Preparation 2D");
							setupPreparation2dTests(datas, testsValues);
						}
						// if (datas.textPreparationReport) {
						// 	testView.push("Text preparation");
						// 	setupTextPreparationTests(datas, testsValues);
						// }
						// if (datas.treePreparationReport) {
						// 	testView.push("Tree preparation");
						// 	setupTreePreparationTests(datas, testsValues);
						// }

						if (
							datas.evaluationReport ||
							datas.trainEvaluationReport ||
							datas.testEvaluationReport
						) {
							testView.push("Evaluation");
							setupEvaluationTests(datas, testsValues);
						}

						testView.forEach((view) => {
							cy.get('.mat-tab-label:contains("' + view + '")')
								.first()
								.click();
							const testValue = testsValues[view];
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

function setupPreparationTests(datas, testsValues) {
	testsValues.Preparation.push("Summary");
	testsValues.Preparation.push("Informations");
	testsValues.Preparation.push(datas.preparationReport.summary.database);
	testsValues.Preparation.push(
		datas.preparationReport.summary.discretization
	);
	testsValues.Preparation.push(
		datas.preparationReport.summary.targetValues?.values[0].slice(0, 10) // slice it because it's a legend text
	);
	testsValues.Preparation.push(
		datas.preparationReport.summary.evaluatedVariables
	);
	if (datas.preparationReport.variablesStatistics) {
		testsValues.Preparation.push(
			datas.preparationReport.variablesStatistics.length + " Variables"
		);
		testsValues.Preparation.push("Name");
		testsValues.Preparation.push("Derivation rule");

		testsValues.Preparation.push(
			datas.preparationReport.variablesStatistics[0].rank
		);
		testsValues.Preparation.push(
			datas.preparationReport.variablesStatistics[0].level
		);
	}
	if (datas.preparationReport?.variablesDetailedStatistics?.R01) {
		if (isRegressionAnalysis(datas) || isExplanatoryAnalysis(datas)) {
			// regression matrix case or explanatory
			// Check if matrix is displayed
			testsValues.Preparation.push("Target values");
			// check cell stats grid
			testsValues.Preparation.push(
				"of " + datas.preparationReport?.summary?.targetVariable
			);
		} else if (
			datas.preparationReport?.variablesDetailedStatistics?.R01.dataGrid
				?.dimensions.length > 1
		) {
			testsValues.Preparation.push("Target distribution"); // normal case
		}
		if (datas.preparationReport?.summary?.targetValues) {
			testsValues.Preparation.push("Target variable stats");
		}
		testsValues.Preparation.push("Distribution");
	}

	if (
		datas.preparationReport?.variablesStatistics &&
		datas.preparationReport?.variablesStatistics[0]?.type === "Numerical" &&
		datas.preparationReport?.variablesDetailedStatistics?.R01?.dataGrid
			?.isSupervised === false
	) {
		// histogram case
		testsValues.Preparation.push("Density");
		var index = testsValues.Preparation.indexOf("Distribution");
		if (index !== -1) {
			testsValues.Preparation.splice(index, 1);
		}
		var index = testsValues.Preparation.indexOf("Target Distribution");
		if (index !== -1) {
			testsValues.Preparation.splice(index, 1);
		}
	}
}

function setupModelingTests(datas, testsValues) {
	testsValues.Modeling.push("Summary");
	testsValues.Modeling.push("Trained predictors");
	testsValues.Modeling.push("Select trained predictor");
	testsValues.Modeling.push("Naive Bayes");
	testsValues.Modeling.push(datas.preparationReport.summary.database);
	testsValues.Modeling.push(
		datas.preparationReport.summary.targetValues?.values[0].slice(0, 10) // slice it because it's a legend text
	);
	if (datas.modelingReport.variablesStatistics) {
		testsValues.Modeling.push(
			datas.modelingReport.trainedPredictorsDetails?.R1?.selectedVariables
				.length + " Variables"
		);
		// test some grid coluns
		testsValues.Modeling.push("name");
		testsValues.Modeling.push("weight");
		// testsValues.Modeling.push("importance");

		// test some grid values
		testsValues.Modeling.push(
			datas.modelingReport.trainedPredictorsDetails?.R1.name
		);
		testsValues.Modeling.push(
			datas.modelingReport.trainedPredictorsDetails?.R1.level
		);
	}
	if (datas.preparationReport?.variablesDetailedStatistics?.R01) {
		if (isRegressionAnalysis(datas) || isExplanatoryAnalysis(datas)) {
			// regression matrix case or explanatory
			// Check if matrix is displayed
			testsValues.Modeling.push("Target values");
			// check cell stats grid
			testsValues.Modeling.push(
				datas.preparationReport?.variablesDetailedStatistics?.R01
					?.dataGrid?.dimensions[0]?.partition[0][0]
			);
		} else if (
			datas.preparationReport?.variablesDetailedStatistics?.R01?.dataGrid
				?.dimensions.length > 1
		) {
			testsValues.Modeling.push("Target distribution"); // normal case
		}
		if (datas.preparationReport?.summary?.targetValues) {
			testsValues.Modeling.push("Target variable stats");
		}
		testsValues.Modeling.push("Distribution");
	}

	if (
		datas.preparationReport?.variablesStatistics &&
		datas.preparationReport?.variablesStatistics[0]?.type === "Numerical" &&
		datas.preparationReport?.variablesDetailedStatistics?.R01?.dataGrid
			?.isSupervised === false
	) {
		// histogram case
		testsValues.Modeling.push("Density");
		var index = testsValues.Modeling.indexOf("Distribution");
		if (index !== -1) {
			testsValues.Modeling.splice(index, 1);
		}
		var index = testsValues.Modeling.indexOf("Target Distribution");
		if (index !== -1) {
			testsValues.Modeling.splice(index, 1);
		}
	}
}

function setupEvaluationTests(datas, testsValues) {
	testsValues.Evaluation.push("Evaluation type");
	testsValues.Evaluation.push("Filter curves");
	testsValues.Evaluation.push("Predictor evaluations");

	if (datas.trainEvaluationReport?.summary?.instances) {
		testsValues.Evaluation.push(
			datas.trainEvaluationReport?.summary?.instances
		);
	}

	// Test some grid datas
	if (datas.trainEvaluationReport?.predictorsPerformance?.accuracy) {
		testsValues.Evaluation.push(
			datas.trainEvaluationReport?.predictorsPerformance?.accuracy
		);
	}
	if (datas.testEvaluationReport?.predictorsPerformance?.auc) {
		testsValues.Evaluation.push(
			datas.testEvaluationReport?.predictorsPerformance?.auc
		);
	}

	if (
		(datas.trainEvaluationReport?.predictorsDetailedPerformance &&
			datas.trainEvaluationReport?.liftCurves) ||
		(datas.testEvaluationReport?.predictorsDetailedPerformance &&
			datas.testEvaluationReport?.liftCurves) ||
		(datas.evaluationReport?.predictorsDetailedPerformance &&
			datas.evaluationReport?.liftCurves)
	) {
		testsValues.Evaluation.push("Cumulative gain chart");
		testsValues.Evaluation.push("Confusion matrix");
		testsValues.Evaluation.push("Population");
		testsValues.Evaluation.push("Frequency");
		testsValues.Evaluation.push("gini");
		testsValues.Evaluation.push("accuracy");
	} else {
		testsValues.Evaluation.push("REC Curves");
		testsValues.Evaluation.push("rmse");
	}
}

function setupPreparation2dTests(datas, testsValues) {
	testsValues.Preparation2d.push("Summary");
}
function setupTextPreparationTests(datas, testsValues) {}
function setupTreePreparationTests(datas, testsValues) {}

function initTestValues() {
	const testsValues = {
		Preparation: [],
		Preparation2d: [],
		TreePreparation: [],
		TextPreparation: [],
		Modeling: [],
		Evaluation: [],
	};
	return testsValues;
}

function isExplanatoryAnalysis(appDatas): boolean {
	if (
		appDatas?.preparationReport?.variablesDetailedStatistics &&
		!appDatas?.bivariatePreparationReport
	) {
		const detailedVar =
			appDatas.preparationReport?.variablesDetailedStatistics["R01"];
		if (detailedVar && detailedVar.dataGrid) {
			const detailedVarTypes = detailedVar.dataGrid.dimensions.map(
				(e) => e.partitionType
			);
			if (
				detailedVar.dataGrid.dimensions.length > 1 &&
				detailedVarTypes.includes("Value groups") &&
				!detailedVarTypes.includes("Values")
			) {
				return true;
			}
		}
	}
	return false;
}

function isRegressionAnalysis(appDatas): boolean {
	if (
		appDatas?.trainEvaluationReport?.summary?.learningTask ===
		"Regression analysis"
	) {
		return true;
	} else if (
		appDatas?.preparationReport?.summary?.learningTask ===
		"Regression analysis"
	) {
		return true;
	} else {
		return false;
	}
}
