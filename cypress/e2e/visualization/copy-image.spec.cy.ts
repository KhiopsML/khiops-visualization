/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck
import '../../support/commands';

describe('Copy images Test Plan for Khiops Visualization', () => {
  const files = ['ALLREPORTS_Std_Iris_AnalysisResults.khj'];

  files.forEach((fileName) => {
    it(`Check values for ${fileName}`, () => {
      cy.initViews();

      cy.loadFile('visualization', fileName);

      cy.readFile('./src/assets/mocks/kv/' + fileName).then(() => {
        cy.wait(500);

        // Create spy once for all screenshot tests
        cy.window().then((win) => {
          cy.spy(win, 'fetch').as('fetchSpy');
        });

        // Preparation Tab Screenshots
        cy.get('.mat-mdc-tab:contains("Preparation")').first().click();
        cy.wait(500);
        cy.testComponentScreenshot('#preparation-informations-block-summary');
        cy.testComponentScreenshot('#preparation-target-variable-stats');
        cy.testComponentScreenshot(
          '#preparation-informations-block-informations',
        );
        cy.get('.level-distribution-btn').first().click({ force: true });
        cy.wait(250);
        cy.testComponentScreenshot('#level-distribution-graph-comp');
        cy.get('#level-distribution-graph-close-btn')
          .first()
          .click({ force: true });
        cy.wait(250);
        cy.testComponentScreenshot('#preparation-variables-list');
        cy.testComponentScreenshot('#distribution-graph0');
        cy.testComponentScreenshot('#target-distribution-graph0');
        cy.testComponentScreenshot('#preparation-description-block-variable');
        cy.testComponentScreenshot('#preparation-description-block-derivation');
        cy.testComponentScreenshot('#preparation-current-interval');

        // Text preparation Tab Screenshots
        cy.get('.mat-mdc-tab:contains("Text preparation")').first().click();
        cy.wait(500);
        cy.testComponentScreenshot('#preparation-informations-block-summary');
        cy.testComponentScreenshot('#preparation-target-variable-stats');
        cy.testComponentScreenshot(
          '#preparation-informations-block-informations',
        );
        cy.get('.level-distribution-btn').first().click({ force: true });
        cy.wait(250);
        cy.testComponentScreenshot('#level-distribution-graph-comp');
        cy.get('#level-distribution-graph-close-btn')
          .first()
          .click({ force: true });
        cy.wait(250);
        cy.testComponentScreenshot('#preparation-variables-list');
        cy.testComponentScreenshot('#distribution-graph0');
        cy.testComponentScreenshot('#target-distribution-graph0');
        cy.testComponentScreenshot('#preparation-description-block-variable');
        cy.testComponentScreenshot('#preparation-description-block-derivation');
        cy.testComponentScreenshot('#preparation-current-interval');

        // Tree preparation Tab Screenshots
        cy.get('.mat-mdc-tab:contains("Tree preparation")').first().click();
        cy.wait(500);
        cy.testComponentScreenshot(
          '#tree-preparation-informations-block-summary',
        );
        cy.testComponentScreenshot('#tree-preparation-target-variable-stats');
        cy.testComponentScreenshot(
          '#tree-preparation-informations-block-informations',
        );
        cy.get('.level-distribution-btn').first().click({ force: true });
        cy.wait(250);
        cy.testComponentScreenshot('#level-distribution-graph-comp');
        cy.get('#level-distribution-graph-close-btn')
          .first()
          .click({ force: true });
        cy.wait(250);
        cy.testComponentScreenshot('#tree-preparation-variables-list');
        cy.testComponentScreenshot('#distribution-graph0');
        cy.testComponentScreenshot('#target-distribution-graph0');
        cy.testComponentScreenshot('#target-distribution-graph1');
        cy.testComponentScreenshot('#tree-preparation-select');
        cy.testComponentScreenshot('#tree-details-comp');
        cy.testComponentScreenshot('#tree-preparation-hyper');

        cy.get('.mat-mdc-tab:contains("Leaf rules")').first().click();
        cy.wait(500);
        cy.testComponentScreenshot('#tree-leaf-rules-comp');

        // Preparation 2D Tab Screenshots
        cy.get('.mat-mdc-tab:contains("Preparation 2D")').first().click();
        cy.wait(500);
        cy.testComponentScreenshot(
          '#preparation-2d-informations-block-summary',
        );
        cy.get('.level-distribution-btn').first().click({ force: true });
        cy.wait(250);
        cy.testComponentScreenshot('#level-distribution-graph-comp');
        cy.get('#level-distribution-graph-close-btn')
          .first()
          .click({ force: true });
        cy.wait(250);
        cy.testComponentScreenshot('#preparation-2d-target-variable-stats');
        cy.testComponentScreenshot('#preparation-2d-variables-list');
        cy.testComponentScreenshot('#cooccurrence-matrix-comp');
        cy.testComponentScreenshot('#preparation-2d-target-distribution-graph');
        cy.testComponentScreenshot('#preparation-2d-current-cell-x');
        cy.testComponentScreenshot('#preparation-2d-current-cell-y');

        // Modeling Tab Screenshots
        cy.get('.mat-mdc-tab:contains("Modeling")').first().click();
        cy.wait(500);
        cy.testComponentScreenshot('#modeling-informations-block-summary');
        cy.testComponentScreenshot('#modeling-target-variable-stats');
        cy.testComponentScreenshot('#modeling-informations-block-informations');
        cy.testComponentScreenshot('#modeling-variables-list');
        cy.testComponentScreenshot('#distribution-graph0');
        cy.testComponentScreenshot('#target-distribution-graph0');
        cy.testComponentScreenshot('#preparation-current-interval');

        // Evaluation Tab Screenshots
        cy.get('.mat-mdc-tab:contains("Evaluation")').first().click();
        cy.wait(500);
        cy.testComponentScreenshot('#evaluation-types-summary');
        cy.testComponentScreenshot('#evaluation-predictor-evaluations');
        cy.testComponentScreenshot('#evaluation-lift-curves');
        cy.testComponentScreenshot('#evaluation-confusion-matrix');

        // Project Tab Screenshots
        cy.get('.mat-mdc-tab:contains("Project")').first().click();
        cy.wait(500);
        cy.testComponentScreenshot('#project-logs');
      });
    });
  });
});
