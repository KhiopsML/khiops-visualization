/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck
import '../../support/commands';

describe('Behaviors Test Plan for Khiops Visualization', () => {
  let files = ['000_000_10000words_AllReports.json'];

  files.forEach((fileName) => {
    it(`Check values for ${fileName}`, () => {
      cy.initViews();

      cy.loadFile('visualization', fileName);

      cy.readFile('./src/assets/mocks/kv/' + fileName).then(() => {
        cy.wait(500);

        // Move to the first matrix cell
        cy.get('#matrix-selected').should('be.visible').trigger('mousemove', {
          position: 'topRight',
        });

        cy.wait(500);

        // Check Matrix tooltip
        cy.get('.matrix-tooltip-comp').contains(122);

        // check that first .ag-row contains  .ag-row-selected
        cy.get('#preparation-variables-list')
          .find('.ag-row:eq(0)')
          .should('have.class', 'ag-row-selected');

        cy.get('#preparation-2d-current-cell-x').contains(-160.8);
        cy.get('#preparation-2d-current-cell-y').contains(80);
        cy.get('#distribution-graph-comp-0').should('be.visible');
        cy.get('#variable-stats-block-summary').contains(88.45);
        cy.get('#variable-stats-block-summary').contains(21);
        cy.get('#preparation-informations-block-summary').contains(
          'Regression',
        );
        cy.get('#preparation-informations-block-informations').contains('MODL');
        cy.get('#preparation-variables-list').contains('region_1');

        cy.get('#preparation-variables-list').find('.ag-row:eq(1)').click();
        cy.wait(500);

        // check that second .ag-row contains  .ag-row-selected
        cy.get('#preparation-variables-list')
          .find('.ag-row:eq(1)')
          .should('have.class', 'ag-row-selected');

        // Move to the first matrix cell
        cy.get('#matrix-selected').should('be.visible').trigger('mousemove', {
          position: 'topRight',
        });

        cy.wait(500);

        // Check Matrix tooltip
        cy.get('.matrix-tooltip-comp').contains(254);

        cy.get('.mat-mdc-tab:contains("Modeling")').first().click();
        cy.wait(500);

        // check that 2nd .ag-row contains  .ag-row-selected
        cy.get('#modeling-variables-list')
          .find('.ag-row:eq(1)')
          .should('have.class', 'ag-row-selected');
        cy.wait(500);

        // Move to the first matrix cell
        cy.get('#matrix-selected').should('be.visible').trigger('mousemove', {
          position: 'topRight',
        });

        // Check Matrix tooltip
        cy.get('.matrix-tooltip-comp').contains(254);

        cy.get('#modeling-informations-block-informations').contains(
          '783 Variables',
        );

        cy.get('#preparation-2d-current-cell-x').contains('Wines');
        cy.get('#preparation-2d-current-cell-x').contains(161);
        cy.get('#preparation-2d-current-cell-y').contains(80);

        cy.get('#modeling-variables-list').find('.ag-row:eq(3)').click();

        cy.get('.mat-mdc-tab:contains("Preparation")').first().click();
        cy.wait(500);

        // check that 3nd .ag-row contains  .ag-row-selected
        cy.get('#preparation-variables-list')
          .find('.ag-row:eq(2)')
          .should('have.class', 'ag-row-selected');

        cy.get('.mat-mdc-tab:contains("Text preparation")').first().click();
        cy.wait(500);

        // check that first .ag-row contains .ag-row-selected
        cy.get('#preparation-variables-list')
          .find('.ag-row:eq(0)')
          .should('have.class', 'ag-row-selected');

        // check that 3th .ag-cell-value (level) contains 0 #347
        cy.get('#preparation-variables-list')
          .find('.ag-row:eq(2) .ag-cell-value')
          .should('contain', '0');

        // Move to the first matrix cell
        cy.get('#matrix-selected').should('be.visible').trigger('mousemove', {
          position: 'topRight',
        });

        // Check Matrix tooltip
        cy.get('.matrix-tooltip-comp').contains(105);
        cy.get('#preparation-2d-current-cell-x').contains(1.5);
        cy.get('#preparation-2d-current-cell-y').contains(80);

        cy.get('#preparation-description-block-derivation').contains(
          'TextTokens',
        );
        cy.get('#preparation-informations-block-informations').contains(
          '1 083',
        );
        cy.get('#variable-stats-block-summary').contains(21);

        cy.get('.mat-mdc-tab:contains("Evaluation")').first().click();
        cy.wait(500);

        cy.get('#evaluation-types-summary').contains('Train');
        cy.get('#evaluation-types-summary').contains('Test');

        // check that 3nd .ag-row contains  .ag-row-selected
        cy.get('#evaluation-types-summary')
          .find('.ag-row:eq(0)')
          .should('have.class', 'ag-row-selected');
        cy.get('#evaluation-predictor-evaluations').contains('Train');
        cy.get('#evaluation-predictor-evaluations').contains('Test');

        // check that 3nd .ag-row contains  .ag-row-selected
        cy.get('#evaluation-predictor-evaluations')
          .find('.ag-row:eq(0)')
          .should('have.class', 'ag-row-selected');

        cy.get('.mat-mdc-tab:contains("Project")').first().click();
        cy.wait(500);

        cy.get('#project-view-comp-table').contains('Regression analysis');
        cy.get('#project-logs').contains('Variable construction');
      });
    });
  });

  files = ['2d-cells-AllReports.json'];

  files.forEach((fileName) => {
    it(`Check Matrix tooltip values if unsupervised for ${fileName}`, () => {
      cy.initViews();

      cy.loadFile('visualization', fileName);

      cy.readFile('./src/assets/mocks/kv/' + fileName).then(() => {
        cy.wait(500);

        cy.get('.mat-mdc-tab:contains("Preparation 2D")').first().click();
        cy.wait(500);

        cy.get('.matrix-mode-comp-option').first().click();
        cy.wait(200);

        // select 2nd option of menu
        cy.get('.mat-mdc-menu-item').eq(1).click();

        cy.get('#matrix-selected').should('be.visible').trigger('mousemove', {
          position: 'topLeft',
        });
        cy.get('.matrix-tooltip-comp').contains('Expected frequency');
      });
    });
  });

  files = ['iris2d.json'];

  files.forEach((fileName) => {
    it(`Check Matrix tooltip values if supervised for ${fileName}`, () => {
      cy.initViews();

      cy.loadFile('visualization', fileName);

      cy.readFile('./src/assets/mocks/kv/' + fileName).then(() => {
        cy.wait(500);

        cy.get('.mat-mdc-tab:contains("Preparation 2D")').first().click();
        cy.wait(500);

        cy.get('#preparation-2d-variables-list [row-id="19"] .ag-cell-value')
          .first()
          .click({ force: true });

        cy.get('.matrix-mode-comp-option').first().click();
        cy.wait(200);

        // select 2nd option of menu
        cy.get('.mat-mdc-menu-item').eq(1).click();

        cy.get('#matrix-selected').should('be.visible').trigger('mousemove', {
          position: 'topLeft',
        });
        cy.get('.matrix-tooltip-comp').should(
          'not.contain',
          'Expected frequency',
        );
      });
    });
  });
  files = ['irisR.json'];

  files.forEach((fileName) => {
    it(`Check Matrix tooltip values if supervised for ${fileName}`, () => {
      cy.initViews();

      cy.loadFile('visualization', fileName);

      cy.readFile('./src/assets/mocks/kv/' + fileName).then(() => {
        cy.wait(500);

        cy.get('#matrix-selected').should('be.visible').trigger('mousemove', {
          position: 'topLeft',
        });
        cy.get('.matrix-tooltip-comp').should(
          'not.contain',
          'Expected frequency',
        );
      });
    });
  });
});
