/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck
import '../../support/commands';

describe('Test Plan for Khiops Covisualization', () => {
  const files = ['ALLREPORTS_Std_Iris_AnalysisResults.khj'];

  files.forEach((fileName) => {
    it(`Check values for ${fileName}`, () => {
      cy.initViews();

      cy.loadFile('visualization', fileName);

      cy.readFile('./src/assets/mocks/kv/' + fileName).then(() => {
        cy.wait(500);

        cy.get('.mat-mdc-tab:contains("Preparation")').first().click();
        cy.wait(500);

        // Create spy once for all screenshot tests
        cy.window().then((win) => {
          cy.spy(win, 'fetch').as('fetchSpy');
        });

        // Test the informations block component screenshot
        cy.testComponentScreenshot('#preparation-informations-block-summary');
        cy.testComponentScreenshot('#preparation-target-variable-stats');
        cy.testComponentScreenshot(
          '#preparation-informations-block-informations',
        );
        cy.testComponentScreenshot('#preparation-variables-list');
        cy.testComponentScreenshot('#distribution-graph0');
        cy.testComponentScreenshot('#target-distribution-graph0');
        cy.testComponentScreenshot('#preparation-description-block-variable');
        cy.testComponentScreenshot('#preparation-description-block-derivation');
        cy.testComponentScreenshot('#preparation-current-interval');
      });
    });
  });
});
