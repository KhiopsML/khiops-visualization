/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck
import '../../support/commands';

describe('Copy datas Test Plan for Khiops Covisualization', () => {
  let files = ['check-ext-datas.json'];

  describe('Copy datas Test Plan for Khiops CoVisualization', () => {
    files.forEach((fileName) => {
      it(`Check values for ${fileName}`, () => {
        cy.initViews();

        cy.loadFile('covisualization', fileName);

        cy.readFile('./src/assets/mocks/kc/' + fileName).then(() => {
          cy.wait(250);

          cy.get('.mat-mdc-tab:contains("Axis")').first().click();
          cy.wait(250);

          // Open statistics panels
          cy.get('.hierarchy-infos-button').eq(0).click({ force: true });
          cy.wait(250);

          cy.testComponentCopyDatas(
            '#hierarchy-details-comp-0',
            'kc-hierarchy-details-comp-0.txt',
          );
          cy.testComponentCopyDatas(
            '#cluster-details-grid-0',
            'kc-cluster-details-grid-0.txt',
          );
          cy.testComponentCopyDatas(
            '#cluster-annotation-0',
            'kc-cluster-annotation-0.txt',
          );
          cy.testComponentCopyDatas(
            '#cluster-composition-0',
            'kc-cluster-composition-0.txt',
          );
          cy.testComponentCopyDatas(
            '#cluster-distribution-0',
            'kc-cluster-distribution-0.txt',
          );
          cy.testComponentCopyDatas(
            '#hierarchy-details-comp-1',
            'kc-hierarchy-details-comp-1.txt',
          );
          cy.testComponentCopyDatas(
            '#cluster-details-grid-1',
            'kc-cluster-details-grid-1.txt',
          );
          cy.testComponentCopyDatas(
            '#cluster-annotation-1',
            'kc-cluster-annotation-1.txt',
          );
          cy.testComponentCopyDatas(
            '#cluster-composition-1',
            'kc-cluster-composition-1.txt',
          );
          cy.testComponentCopyDatas(
            '#cluster-distribution-1',
            'kc-cluster-distribution-1.txt',
          );
          cy.testComponentCopyDatas(
            '#external-datas-1',
            'kc-external-datas-1.txt',
          );

          cy.testComponentCopyDatas(
            '#selected-clusters-grid',
            'kc-selected-clusters-grid.txt',
          );
          cy.testComponentCopyDatas(
            '#matrix-container-comp-wrapper',
            'kc-matrix-container-comp-wrapper.txt',
          );

          // Open unfold Hierarchy view
          cy.get('.button-unfold-hierarchy').click();
          cy.wait(250);

          cy.testComponentCopyDatas(
            '#unfold-hierarchy-table',
            'kc-unfold-hierarchy-table.txt',
          );
          cy.testComponentCopyDatas(
            '#unfold-hierarchy-info-rate',
            'kc-unfold-hierarchy-info-rate.txt',
          );
          cy.testComponentCopyDatas(
            '#unfold-hierarchy-clusters-graph',
            'kc-unfold-hierarchy-clusters-graph.txt',
          );

          cy.get('.button-confirm-hierarchy').first().click({ force: true });
        });
      });
    });
  });

  files = ['Coclustering-IV-Glass.khcj'];
  describe('Copy datas Test Plan for Khiops CoVisualization inner variables', () => {
    files.forEach((fileName) => {
      it(`Check values for ${fileName}`, () => {
        cy.initViews();

        cy.loadFile('covisualization', fileName);

        cy.readFile('./src/assets/mocks/kc/' + fileName).then(() => {
          cy.wait(250);

          cy.get('.mat-mdc-tab:contains("Axis")').first().click();
          cy.wait(250);

          // // Variable Search Dialog
          cy.get('.variable-search-button-comp').first().click({ force: true });
          cy.get('#variable-search-dialog-comp', { timeout: 5000 })
            .should('exist')
            .should('be.visible');
          cy.testComponentCopyDatas(
            '#variable-search-dialog-comp',
            'kc-variable-search-dialog-comp.txt',
          );
        });
      });
    });
  });
});
