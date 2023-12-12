export function setupHierarchyTests(datas) {
	const testsValues = [];

	testsValues.push("UNFOLD HIERARCHY");
	testsValues.push("Cells");
	testsValues.push("Information rate");
	testsValues.push("Nb of clusters per dimension");
	// testsValues.push("Total Number of Clusters"); // can't get canvas value
	testsValues.push("Max Number of Cluster");
	testsValues.push("FoldUnfold");

	for (
		let index = 2;
		index < datas.coclusteringReport?.dimensionSummaries.length;
		index++
	) {
		testsValues.push(
			datas.coclusteringReport?.dimensionSummaries[index]?.name
		);
	}

	return testsValues;
}
