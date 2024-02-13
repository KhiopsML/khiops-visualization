export function setupContextTests(datas, testsValues, fileName) {
	testsValues.Context.push("Hierarchy");

	for (
		let index = 2;
		index < datas.coclusteringReport?.dimensionSummaries.length;
		index++
	) {
		testsValues.Context.push(
			datas.coclusteringReport?.dimensionSummaries[index]?.name,
		);

		if (datas.coclusteringReport?.dimensionPartitions[index]?.intervals) {
			testsValues.Context.push(
				datas.coclusteringReport?.dimensionPartitions[
					index
				]?.intervals[0]?.bounds[0]?.toString(),
			);
		}

		if (datas.coclusteringReport?.dimensionPartitions[index]?.valueGroups) {
			testsValues.Context.push(
				datas.coclusteringReport?.dimensionPartitions[
					index
				]?.valueGroups[0]?.cluster[0].toString(),
			);
		}

		if (
			datas.coclusteringReport?.dimensionSummaries[index].type ===
			"Categorical"
		) {
			testsValues.Context.push("Composition");
			testsValues.Context.push("typicality");
			testsValues.Context.push("Size");
		}
	}

	testsValues.Context.push("Name");
	testsValues.Context.push("Interest");
	testsValues.Context.push("Distribution");
	testsValues.Context.push("Selected clusters");
	testsValues.Context.push("Nb Clusters");

	if (fileName === "v4.json") {
		// test saved datas
		testsValues.Context.push("P ("); // Matrix component
	} else {
		testsValues.Context.push("I ("); // Matrix component
	}
	testsValues.Context.push("Conditional on context"); // Matrix component
	testsValues.Context.push("Cell stats"); // Matrix component
}
