/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck
import '../support/commands';

describe('Test Plan for Khiops Covisualization', () => {
  const files = ['tree-education_AllReports.json'];

  files.forEach((fileName) => {
    it(`Check values for ${fileName}`, () => {
      cy.initViews();

      cy.loadFile('visualization', fileName);

      cy.readFile('./src/assets/mocks/kv/' + fileName).then(() => {
        cy.wait(500);

        cy.get('.mat-mdc-tab:contains("Tree")').first().click();
        cy.wait(500);

        cy.get('#tree-preparation-informations-block-summary').contains(
          'Classification',
        );
        cy.get('#tree-preparation-target-variable-stats').contains('1st');
        cy.get('#tree-preparation-informations-block-informations').contains(
          'Informative',
        );

        cy.get('#tree-preparation-variables-list')
          .find('.ag-row:eq(0)')
          .should('have.class', 'ag-row-selected');

        cy.get('#tree-preparation-variables-list').contains('Tree_1');

        cy.get('#tree-select-comp').contains('L61');

        cy.get('#tree-leaf-L61')
          .find('div.tree-leaf-content.tree-selected')
          .should('exist');

        cy.get('#tree-details-comp').contains('L61');
        cy.get('#tree-details-comp').contains('L91');
        cy.get('#tree-details-comp').contains('L35');
        cy.get('#tree-details-comp').contains('L40');
        cy.get('#tree-details-comp')
          .find('.ag-row:eq(0)')
          .should('have.class', 'ag-row-selected');

        cy.get('#target-distribution-chart-0').should('exist');
        cy.get('#distribution-chart-0').should('exist');
        cy.get('#target-distribution-chart-1').should('exist');

        cy.get('#tree-node-infos').contains('0.38');
        cy.get('#tree-node-infos').contains('3790');

        cy.get('.mat-mdc-tab:contains("Leaf rules")').first().click();
        cy.wait(500);

        cy.get('#tree-leaf-rules-comp').contains('workclass');
        cy.get('#tree-leaf-rules-comp').contains('Craft');

        cy.get('#hyperTree').should('exist');

        cy.get('#hyperTree').find('circle').should('have.length', 53);
      });
    });
  });
});
