import "../utils/utils";
import { isExplanatoryAnalysis, isRegressionAnalysis } from "../utils/utils";

export function setupPreparationTests(datas, testsValues) {
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
	if (
		datas.preparationReport?.variablesDetailedStatistics?.R01 ||
		datas.preparationReport?.variablesDetailedStatistics?.R001
	) {
		if (isRegressionAnalysis(datas) || isExplanatoryAnalysis(datas)) {
			// regression matrix case or explanatory
			// Check if matrix is displayed
			testsValues.Preparation.push("Target values");
			// check cell stats grid
			testsValues.Preparation.push(
				"of " + datas.preparationReport?.summary?.targetVariable
			);
		} else if (
			datas.preparationReport?.variablesDetailedStatistics?.R01?.dataGrid
				?.dimensions.length > 1 ||
			datas.preparationReport?.variablesDetailedStatistics?.R001?.dataGrid
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
		(datas.preparationReport?.variablesDetailedStatistics?.R01?.dataGrid
			?.isSupervised === false ||
			datas.preparationReport?.variablesDetailedStatistics?.R001?.dataGrid
				?.isSupervised === false)
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
