/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck
import '../../support/commands';

describe('Variable Search Bug Fixes Tests', () => {
  describe('Inner variable: Successive searches within same cluster', () => {
    it('Should update composition table when searching for different inner variables in the same cluster (IV-Breast.json)', () => {
      // Update current cluster in a sequence of inner variable parts search #230

      cy.initViews();
      cy.loadFile('covisualization', 'IV-Breast.json');

      cy.readFile('./src/assets/mocks/kc/IV-Breast.json').then(() => {

        // Wait for composition table to be visible
        cy.get('#cluster-composition-1', { timeout: 15000 }).should(
          'be.visible',
        );

        // Open variable search dialog
        cy.get('.variable-search-button-comp').first().click();

        // click on first button with class inner-variable-select
        cy.get('.inner-variable-select').first().click();

        // click on 6th button with class  mat-mdc-menu-item
        cy.get('.mat-mdc-menu-item').eq(5).click();

        cy.get('#variable-search-results-table').find('.ag-row:eq(1)').click();

        // check selection
        cy.get('#cluster-composition-1 [row-id="2"]').then((element) => {
          cy.wrap(element).should('have.class', 'ag-row-selected');
        });

        // Open variable search dialog
        cy.get('.variable-search-button-comp').first().click();

        // click on first button with class inner-variable-select
        cy.get('.inner-variable-select').first().click();

        // click on 6th button with class  mat-mdc-menu-item
        cy.get('.mat-mdc-menu-item').eq(6).click();

        cy.get('#variable-search-results-table').find('.ag-row:eq(1)').click();

        // check selection
        cy.get('#cluster-composition-1 [row-id="3"]').then((element) => {
          cy.wrap(element).should('have.class', 'ag-row-selected');
        });
      });
    });
  });

  describe('Search for a part of an inner variable of categorical type', () => {
    it('Should update composition table when searching for different inner variables types (IV-Glass.json)', () => {
      // Search for a part of an inner variable of categorical type #231

      cy.initViews();
      cy.loadFile('covisualization', 'IV-Glass.json');

      cy.readFile('./src/assets/mocks/kc/IV-Glass.json').then(() => {

        // Wait for composition table to be visible
        cy.get('#cluster-composition-1', { timeout: 15000 }).should(
          'be.visible',
        );

        // Open variable search dialog
        cy.get('.variable-search-button-comp').first().click();

        // click on first button with class inner-variable-select
        cy.get('.inner-variable-select').first().click();

        // click on 6th button with class  mat-mdc-menu-item
        cy.get('.mat-mdc-menu-item').eq(10).click();

        cy.get('#variable-search-results-table').find('.ag-row:eq(2)').click();

        // check selection
        cy.get('#cluster-composition-1 [row-id="8"]').then((element) => {
          cy.wrap(element).should('have.class', 'ag-row-selected');
        });
      });
    });
  });
});
