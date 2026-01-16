/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck
import '../../support/commands';

describe('Copy images Test Plan for Khiops Covisualization', () => {
  const files = ['check-ext-datas.json'];

  describe('Copy images Test Plan for Khiops CoVisualization', () => {
    files.forEach((fileName) => {
      it(`Check values for ${fileName}`, () => {
        cy.initViews();

        cy.loadFile('covisualization', fileName);

        cy.readFile('./src/assets/mocks/kc/' + fileName).then(() => {
          cy.wait(500);

          // Create spy once for all screenshot tests
          cy.window().then((win) => {
            cy.spy(win, 'fetch').as('fetchSpy');
          });

          cy.get('.mat-mdc-tab:contains("Axis")').first().click();
          cy.wait(500);

          cy.testComponentScreenshot('#hierarchy-details-comp-0');
          cy.testComponentScreenshot('#cluster-details-grid-0');
          cy.testComponentScreenshot('#cluster-annotation-0');
          cy.testComponentScreenshot('#cluster-distribution-0');
          cy.testComponentScreenshot('#hierarchy-details-comp-1');
          cy.testComponentScreenshot('#cluster-details-grid-1');
          cy.testComponentScreenshot('#cluster-annotation-1');
          cy.testComponentScreenshot('#cluster-distribution-1');

          cy.testComponentScreenshot('#matrix-container-comp-wrapper');

          // Open unfold Hierarchy view
          cy.get('.button-unfold-hierarchy').click();
          cy.wait(500);

          cy.testComponentScreenshot('#unfold-hierarchy-table');
          cy.testComponentScreenshot('#unfold-hierarchy-info-rate');
          cy.testComponentScreenshot('#unfold-hierarchy-clusters-graph');

          // Variable Search Dialog
          cy.get('.variable-search-button-comp').first().click({ force: true });
          cy.wait(500);
          cy.testComponentScreenshot('#variable-search-dialog-comp');

          // Composition Detailed Parts
          cy.get('.kl-icon-cell-comp-btn').first().click({ force: true });
          cy.wait(500);
          cy.testComponentScreenshot('#composition-detailed-parts-comp');
        });
      });
    });
  });
});
