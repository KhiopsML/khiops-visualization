/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck
import '../../support/commands';

describe('Copy datas Test Plan for Khiops Visualization', () => {
  const files = ['ALLREPORTS_Std_Iris_AnalysisResults.khj'];
  describe('Copy datas Test Plan for Khiops CoVisualization', () => {
    files.forEach((fileName) => {
      it(`Check values for ${fileName}`, () => {
        cy.initViews();

        cy.loadFile('visualization', fileName);

        cy.readFile('./src/assets/mocks/kv/' + fileName).then(() => {
          cy.wait(500);

          // Preparation Tab datas
          cy.get('.mat-mdc-tab:contains("Preparation")').first().click();
          cy.wait(500);

          cy.testComponentCopyDatas(
            '#preparation-informations-block-summary',
            'kv-preparation-informations-block-summary.txt',
          );
          cy.testComponentCopyDatas(
            '#preparation-target-variable-stats',
            'kv-preparation-target-variable-stats.txt',
          );
          cy.testComponentCopyDatas(
            '#preparation-informations-block-informations',
            'kv-preparation-informations-block-informations.txt',
          );
          cy.get('.level-distribution-btn').first().click({ force: true });
          cy.wait(250);
          cy.testComponentCopyDatas(
            '#level-distribution-graph-comp',
            'kv-level-distribution-graph-comp.txt',
          );
          cy.get('#level-distribution-graph-close-btn')
            .first()
            .click({ force: true });
          cy.wait(250);
          cy.testComponentCopyDatas(
            '#preparation-variables-list',
            'kv-preparation-variables-list.txt',
          );
          cy.testComponentCopyDatas(
            '#distribution-graph0',
            'kv-distribution-graph0.txt',
          );
          cy.testComponentCopyDatas(
            '#target-distribution-graph0',
            'kv-target-distribution-graph0.txt',
          );
          cy.testComponentCopyDatas(
            '#preparation-description-block-variable',
            'kv-preparation-description-block-variable.txt',
          );
          cy.testComponentCopyDatas(
            '#preparation-description-block-derivation',
            'kv-preparation-description-block-derivation.txt',
          );
          cy.testComponentCopyDatas(
            '#preparation-current-interval',
            'kv-preparation-current-interval.txt',
          );

          // Tree preparation Tab datas
          cy.get('.mat-mdc-tab:contains("Tree preparation")').first().click();
          cy.wait(500);
          cy.testComponentCopyDatas(
            '#target-distribution-graph1',
            'kv-target-distribution-graph1.txt',
          );

          cy.testComponentCopyDatas(
            '#tree-preparation-select',
            'kv-tree-preparation-select.txt',
          );
          cy.testComponentCopyDatas(
            '#tree-details-comp',
            'kv-tree-details-comp.txt',
          );
          cy.testComponentCopyDatas(
            '#tree-preparation-hyper',
            'kv-tree-preparation-hyper.txt',
          );

          cy.get('.mat-mdc-tab:contains("Leaf rules")').first().click();
          cy.wait(500);
          cy.testComponentCopyDatas(
            '#tree-leaf-rules-comp',
            'kv-tree-leaf-rules-comp.txt',
          );

          // Preparation 2D Tab datas
          cy.get('.mat-mdc-tab:contains("Preparation 2D")').first().click();
          cy.wait(500);

          cy.testComponentCopyDatas(
            '#cooccurrence-matrix-comp',
            'kv-cooccurrence-matrix-comp.txt',
          );
          cy.testComponentCopyDatas(
            '#preparation-2d-target-distribution-graph',
            'kv-preparation-2d-target-distribution-graph.txt',
          );
          cy.testComponentCopyDatas(
            '#preparation-2d-current-cell-x',
            'kv-preparation-2d-current-cell-x.txt',
          );
          cy.testComponentCopyDatas(
            '#preparation-2d-current-cell-y',
            'kv-preparation-2d-current-cell-y.txt',
          );

          cy.get('.mat-mdc-tab:contains("Cells")').first().click();
          cy.wait(500);

          cy.testComponentCopyDatas(
            '#cooccurrence-matrix-cells-container',
            'kv-cooccurrence-matrix-cells-container.txt',
          );

          // Modeling Tab datas
          cy.get('.mat-mdc-tab:contains("Modeling")').first().click();
          cy.wait(500);
          cy.get('.level-distribution-btn').eq(1).click({ force: true });
          cy.wait(250);
          cy.testComponentCopyDatas(
            '#importance-distribution-graph-comp',
            'kv-importance-distribution-graph-comp.txt',
          );
          cy.get('#importance-distribution-graph-close-btn')
            .first()
            .click({ force: true });
          cy.wait(250);

          // Evaluation Tab datas
          cy.get('.mat-mdc-tab:contains("Evaluation")').first().click();
          cy.wait(500);
          cy.testComponentCopyDatas(
            '#evaluation-types-summary',
            'kv-evaluation-types-summary.txt',
          );
          cy.testComponentCopyDatas(
            '#evaluation-predictor-evaluations',
            'kv-evaluation-predictor-evaluations.txt',
          );
          cy.testComponentCopyDatas(
            '#evaluation-lift-curves',
            'kv-evaluation-lift-curves.txt',
          );
          cy.testComponentCopyDatas(
            '#evaluation-confusion-matrix',
            'kv-evaluation-confusion-matrix.txt',
          );

          // Project Tab datas
          cy.get('.mat-mdc-tab:contains("Project")').first().click();
          cy.wait(500);

          cy.testComponentCopyDatas(
            '#project-summary-comp',
            'kv-project-summary.txt',
          );
          cy.testComponentCopyDatas('#project-logs', 'kv-project-logs.txt');
        });
      });
    });
  });
});
