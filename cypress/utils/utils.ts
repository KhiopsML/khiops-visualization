export function isExplanatoryAnalysis(appDatas): boolean {
  if (
    appDatas?.preparationReport?.variablesDetailedStatistics &&
    !appDatas?.bivariatePreparationReport
  ) {
    const detailedVar =
      appDatas.preparationReport?.variablesDetailedStatistics?.R01;
    if (detailedVar && detailedVar.dataGrid) {
      const detailedVarTypes = detailedVar.dataGrid.dimensions.map(
        (e) => e.partitionType,
      );
      if (
        detailedVar.dataGrid.dimensions.length > 1 &&
        detailedVarTypes.includes('Value groups') &&
        !detailedVarTypes.includes('Values')
      ) {
        return true;
      }
    }
  }
  return false;
}

export function isRegressionAnalysis(appDatas): boolean {
  if (
    appDatas?.trainEvaluationReport?.summary?.learningTask ===
    'Regression analysis'
  ) {
    return true;
  } else if (
    appDatas?.preparationReport?.summary?.learningTask === 'Regression analysis'
  ) {
    return true;
  } else {
    return false;
  }
}

export function isNumericalDimension(appDatas, dimensionIndex): boolean {
  if (typeof appDatas === 'string') {
    appDatas = JSON.parse(appDatas);
  }
  if (
    appDatas?.coclusteringReport?.dimensionSummaries[dimensionIndex].type ===
    'Numerical'
  ) {
    return true;
  } else {
    return false;
  }
}
