/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck
import '../../support/commands';
import '../../utils/utils';
import { setupPreparationTests } from '../../setups/preparation-tests';
import { setupPreparation2dTests } from '../../setups/preparation-2d-tests';
import { setupModelingTests } from '../../setups/modeling-tests';
import { setupEvaluationTests } from '../../setups/evaluation-tests';
import { setupTextPreparationTests } from '../../setups/text-preparation-tests';
import { setupTreePreparationTests } from '../../setups/tree-preparation-tests';

describe('Test Khiops Visualization sample files', () => {
  const files = [
    '000_000_10000words_AllReports.json',
    'AnalysisResults-IrisRegressionWithTree.khj',
    'CoronaWords100000_AllReports.V11.json',
    'NGrams10_AnalysisResults.json',
    'NGrams100_AnalysisResults.json',
    'Words100_AllReports.json',
    'Natives-Arbres_Paires_AllReports.json',
    'tree-AllReports.json', // old version
    'tree.json', // old version
    'bi2.json',
    'co-oc.json',
    'missing-zero.json',
    'adult-bivar.json',
    'desc-bivar.json',
    'new-hyper-tree.json',
    'bigTreeLeafs.json',
    'lift-issue.khj',
    'missing-level-parts.json',
    'tree-education_AllReports.json',
    'leafrules.khj',
    'irisR.json',
    'Regression_AllReports_All.json',
    'Regression_AllReports_PreparationOnly.json',
    'C1000_AllReports.json',
    'C100_AllReports.json',
    'AdultRegressionAllReports.json',
    'onlyEvaluationReport.json',
    'explanatory.json',
    'bi3.json',
    'ALLREPORTS_Std_Iris_AnalysisResults.khj',
    'C1_AllReports.json',
    'C0_AllReports.json',
    'analyse_supervisee_multiclasse.json',
    'reg.json',
    'copydatas.json',
    'iris2d.json',
    'mainTargetValue.json',
    'defaultGroup.json',
    'AdultAgeAllReports.json',
    'incomplete-detailed-stats.json',
    'OI_AllReports.json',
    '2d-cells-AllReports.json',
    'level.json',
    'xor.json',
    'MSE_AllReports.json',
    'marc.json',
    'marc2.json',
    'test_long_XDSL_Delc_AllReports.json',
    'Essai_1_AllReports.json',
    'typeBotnet_AllReports.json',
    'irisU.json',
    'CrirteoAllReports.json',
    'UnivariateAnalysisResults.json',
    'ylogAdultAllReports.json',
    'AdultAllReports.json',
    //
    //
    // "20NewsgroupAllReports.json", //  // Do not load it, too big and too long
    // "Natives_AllReports.json", // Do not load it, encoding issue
  ];

  files.forEach((fileName) => {
    it(`Check values for ${fileName}`, () => {
      cy.loadFile('visualization', fileName);

      cy.readFile('./src/assets/mocks/kv/' + fileName).then((datas) => {
        // if current file extension is .khj, we need to parse it into json
        if (fileName.endsWith('.khj')) {
          datas = JSON.parse(datas);
        }

        const testView = [];
        const testsValues = initTestValues();
        if (datas.preparationReport) {
          testView.push('Preparation');
          setupPreparationTests(datas, testsValues);
        }
        if (datas.modelingReport) {
          testView.push('Modeling');
          setupModelingTests(datas, testsValues);
        }
        if (datas.bivariatePreparationReport) {
          testView.push('Preparation 2D');
          setupPreparation2dTests(datas, testsValues);
        }
        if (datas.textPreparationReport) {
          testView.push('Text preparation');
          setupTextPreparationTests(datas, testsValues);
        }
        if (datas.treePreparationReport) {
          testView.push('Tree preparation');
          setupTreePreparationTests(datas, testsValues);
        }

        if (
          datas.evaluationReport ||
          datas.trainEvaluationReport ||
          datas.testEvaluationReport
        ) {
          testView.push('Evaluation');
          setupEvaluationTests(datas, testsValues);
        }

        testView.forEach((view) => {
          cy.get('.mat-mdc-tab:contains("' + view + '")')
            .first()
            .click();
          let testValue = testsValues[view];
          if (view === 'Preparation 2D') {
            testValue = testsValues.Preparation2d;
          }

          if (view === 'Text preparation') {
            testValue = testsValues.TextPreparation;
          }

          if (view === 'Tree preparation') {
            testValue = testsValues.TreePreparation;
          }

          if (testValue) {
            testValue.forEach((test) => {
              if (test) {
                cy.contains(test);
              }
            });
          }
        });
      });
    });
  });
});

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
