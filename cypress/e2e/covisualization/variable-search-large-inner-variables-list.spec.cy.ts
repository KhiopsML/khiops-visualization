/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck
import '../../support/commands';

describe('Variable Search: large inner variables list (292-Coclustering.khcj)', () => {
  const fileName = '292-Coclustering.khcj';

  // Single it() on purpose: this fixture is heavy to load (20905 inner variables),
  // so all assertions are chained here to avoid reloading it per test case.
  it('Should handle truncation, filtering, selection and combo label updates', () => {
    cy.initViews();
    cy.loadFile('covisualization', fileName);

    // Wait for composition table to be visible
    cy.get('#cluster-composition-1', { timeout: 15000 }).should('be.visible');

    // Open variable search dialog
    cy.get('.variable-search-button-comp').first().click();
    cy.get('#variable-search-dialog-comp', { timeout: 10000 }).should(
      'be.visible',
    );

    // Default selection is "label"
    cy.get('.inner-variable-select').first().should('contain.text', 'label');

    // No filter applied: truncated to 200 out of 20905
    cy.get('.inner-variable-select').first().click();
    cy.get('.truncated-hint').should(
      'contain.text',
      '200 datas displayed in 20905',
    );

    // Filter on "count": 56 matches, below the 200 cap, no truncation hint
    cy.get('.inner-variable-search-input').type('count');
    cy.get('.truncated-hint').should('not.exist');
    cy.get('.mat-mdc-menu-item').contains('quote(count)').should('exist');

    // Select "quote(count)": combo label updates accordingly
    cy.get('.mat-mdc-menu-item').contains('quote(count)').click();
    cy.get('.inner-variable-select')
      .first()
      .should('contain.text', 'quote(count)');

    // Reopen with same filter: selected item is highlighted
    cy.get('.inner-variable-select').first().click();
    cy.get('.inner-variable-search-input').type('count');
    cy.get('.mat-mdc-menu-item')
      .contains('quote(count)')
      .closest('button.mat-mdc-menu-item')
      .should('have.class', 'selected-item');

    // Clear the filter: input resets and truncated hint reappears
    cy.get('.inner-variable-search-clear').click();
    cy.get('.inner-variable-search-input').should('have.value', '');
    cy.get('.truncated-hint').should(
      'contain.text',
      '200 datas displayed in 20905',
    );

    // Select "label" back: combo label updates back
    cy.get('.inner-variable-search-input').type('label');
    cy.get('.mat-mdc-menu-item').contains('label').first().click();
    cy.get('.inner-variable-select').first().should('contain.text', 'label');
  });
});
