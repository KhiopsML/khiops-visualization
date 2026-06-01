/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck
import '../../support/commands';

describe('Copy images Test Plan for Khiops Covisualization', () => {
  let files = ['check-ext-datas.json'];

  describe('Copy images Test Plan for Khiops CoVisualization', () => {
    files.forEach((fileName) => {
      it(`Check values for ${fileName}`, () => {
        cy.initViews();

        cy.loadFile('covisualization', fileName);

        cy.readFile('./src/assets/mocks/kc/' + fileName).then(() => {

          // Create spy once for all screenshot tests
          cy.window().then((win) => {
            cy.spy(win, 'fetch').as('fetchSpy');
          });

          cy.get('.mat-mdc-tab:contains("Axis")').first().click();

          cy.testComponentScreenshot('#hierarchy-details-comp-0', 'Axis');
          cy.testComponentScreenshot('#cluster-details-grid-0', 'Axis');
          cy.testComponentScreenshot('#cluster-annotation-0', 'Axis');
          cy.testComponentScreenshot('#cluster-distribution-0', 'Axis');
          cy.testComponentScreenshot('#hierarchy-details-comp-1', 'Axis');
          cy.testComponentScreenshot('#cluster-details-grid-1', 'Axis');
          cy.testComponentScreenshot('#cluster-annotation-1', 'Axis');
          cy.testComponentScreenshot('#cluster-distribution-1', 'Axis');
          cy.testComponentScreenshot('#external-datas-1', 'Axis');

          cy.testComponentScreenshot('#selected-clusters-grid', 'Axis');
          cy.testComponentScreenshot('#matrix-container-comp-wrapper', 'Axis');

          // Open unfold Hierarchy view
          cy.get('.button-unfold-hierarchy').click();

          cy.testComponentScreenshot('#unfold-hierarchy-table', 'Unfold Hierarchy');
          cy.testComponentScreenshot('#unfold-hierarchy-info-rate', 'Unfold Hierarchy');
          cy.testComponentScreenshot('#unfold-hierarchy-clusters-graph', 'Unfold Hierarchy');

          cy.get('.button-confirm-hierarchy').first().click({ force: true });
        });
      });
    });
  });

  files = ['Coclustering-IV-Glass.khcj'];
  describe('Copy images Test Plan for Khiops CoVisualization inner variables', () => {
    files.forEach((fileName) => {
      it(`Check values for ${fileName}`, () => {
        cy.initViews();

        cy.loadFile('covisualization', fileName);

        cy.readFile('./src/assets/mocks/kc/' + fileName).then(() => {

          // Create spy once for all screenshot tests
          cy.window().then((win) => {
            cy.spy(win, 'fetch').as('fetchSpy');
          });

          cy.get('.mat-mdc-tab:contains("Axis")').first().click();

          // Variable Search Dialog
          cy.get('.variable-search-button-comp').first().click({ force: true });
          cy.testComponentScreenshot('#variable-search-dialog-comp', 'Axis');

          cy.get('.close-btn').first().click({ force: true });

          cy.get('.kl-grid-btn-fit-columns').eq(3).click({ force: true });

          // Composition Detailed Parts
          cy.get('.kl-icon-cell-comp-btn').eq(0).click({ force: true });
          cy.testComponentScreenshot('#composition-detailed-parts-comp', 'Axis');
        });
      });
    });
  });
});
