export function setupAxisTests(datas, testsValues, fileName) {
	testsValues.Axis.push("Hierarchy");
	testsValues.Axis.push(
		datas.coclusteringReport?.dimensionSummaries[0]?.name
	);
	testsValues.Axis.push(
		datas.coclusteringReport?.dimensionSummaries[1]?.name
	);
	if (datas.coclusteringReport?.dimensionPartitions[0]?.intervals) {
		testsValues.Axis.push(
			datas.coclusteringReport?.dimensionPartitions[0]?.intervals[0]?.bounds[0]?.toString()
		);
	}

	if (datas.coclusteringReport?.dimensionPartitions[1]?.intervals) {
		testsValues.Axis.push(
			datas.coclusteringReport?.dimensionPartitions[1]?.intervals[0]?.bounds[0]?.toString()
		);
	}

	if (datas.coclusteringReport?.dimensionPartitions[0]?.valueGroups) {
		testsValues.Axis.push(
			datas.coclusteringReport?.dimensionPartitions[0]?.valueGroups[0]?.cluster[0].toString()
		);
	}

	if (datas.coclusteringReport?.dimensionPartitions[1]?.valueGroups) {
		testsValues.Axis.push(
			datas.coclusteringReport?.dimensionPartitions[1]?.valueGroups[0]?.cluster[0].toString()
		);
	}

	if (
		datas.coclusteringReport?.dimensionSummaries[0].type ===
			"Categorical" ||
		datas.coclusteringReport?.dimensionSummaries[1].type === "Categorical"
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
	if (datas.coclusteringReport?.dimensionSummaries?.length > 2) {
		testsValues.Axis.push("Conditional on context"); // Matrix component
	}
	testsValues.Axis.push("Cell stats"); // Matrix component
}
