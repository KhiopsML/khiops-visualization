import '../utils/utils';
import { isExplanatoryAnalysis, isRegressionAnalysis } from '../utils/utils';

export function setupTextPreparationTests(datas, testsValues) {
  testsValues.TextPreparation.push('Summary');
  testsValues.TextPreparation.push('Informations');
  testsValues.TextPreparation.push(datas.preparationReport.summary.database);
  testsValues.TextPreparation.push(
    datas.textPreparationReport.summary.targetValues?.values[0].slice(0, 10), // slice it because it's a legend text
  );
  if (datas.textPreparationReport.variablesStatistics) {
    testsValues.TextPreparation.push(
      datas.textPreparationReport.variablesStatistics?.length + ' Variables',
    );
    // test some grid coluns
    testsValues.TextPreparation.push('Name');
    testsValues.TextPreparation.push('Parts');

    // test some grid values
    testsValues.TextPreparation.push(
      datas.textPreparationReport.variablesStatistics[0].name,
    );
    testsValues.TextPreparation.push(
      datas.textPreparationReport.variablesStatistics[0].level,
    );

    const firstItem = Object.values(
      datas.textPreparationReport?.variablesDetailedStatistics,
    )[0];

    if (firstItem) {
      testsValues.TextPreparation.push('Distribution');
      testsValues.TextPreparation.push('Derivation rule');

      if (isRegressionAnalysis(datas) || isExplanatoryAnalysis(datas)) {
        // Check if matrix is displayed
        testsValues.Preparation.push('Target values');
      }
    }
  }
}
