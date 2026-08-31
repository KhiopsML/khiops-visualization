/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck
import '../../support/commands';

describe('Matrix inner variables filter with a large (+20k) variable list', () => {
  const fileName = '292-Coclustering.khcj';

  const openCombo = () => {
    cy.get('.inner-variables-filter mat-select').click();
    cy.get('.inner-variables-filter-panel').should('be.visible');
  };

  beforeEach(() => {
    cy.initViews();
    cy.loadFile('covisualization', fileName);
    cy.get('.inner-variables-filter mat-select', { timeout: 15000 }).should(
      'be.visible',
    );
  });

  // Merged into a single test to avoid reloading the heavy (+20k variables) file multiple times
  it('should filter, search and select/unselect variables in a large (+20k) list', () => {
    // Should show a truncated label (with ellipsis) at init since all variables are selected
    cy.get('.inner-variables-value-overlay')
      .should('be.visible')
      .and('contain.text', '...');

    openCombo();

    // Should cap the rendered options and show the truncation hint
    cy.get('.inner-variables-filter-panel .truncated-hint').should(
      'contain.text',
      '(200 datas displayed in 20905)',
    );

    // Only the truncated hint + capped options are rendered, never the full 20905
    cy.get('.inner-variables-filter-panel mat-option').should(
      'have.length.lessThan',
      210,
    );

    // mat-select auto-scrolls the panel to reveal the active/selected option on open,
    // but that calculation ignores the prepended search/select-all rows, so the panel
    // can open already scrolled past them.
    cy.contains('.select-all-option', 'Unselect all')
      .scrollIntoView()
      .should('be.visible');

    // Should find a variable far down the alphabetical list when searching "count"
    cy.get('.inner-variables-search-input').type('count');

    cy.contains('.inner-variables-filter-panel mat-option', 'quote(account)')
      .scrollIntoView()
      .should('be.visible');

    // Every rendered option must actually match the search term
    cy.get('.inner-variables-filter-panel mat-option:not(.truncated-hint)')
      .should('have.length.greaterThan', 0)
      .each(($option) => {
        cy.wrap($option)
          .invoke('text')
          .then((text) => {
            expect(text.toLowerCase()).to.contain('count');
          });
      });

    // Should update the select-all label when unselecting a variable hidden far down the list
    cy.contains('.inner-variables-filter-panel mat-option', 'quote(account)')
      .scrollIntoView()
      .click({ force: true });

    // Unchecking a single (far/hidden) variable out of 20905 must still flip
    // the select-all row out of the "all selected" state
    cy.contains('.select-all-option', 'Select all')
      .scrollIntoView()
      .should('be.visible');

    // Reselect it and confirm the select-all label flips back
    cy.contains(
      '.inner-variables-filter-panel mat-option',
      'quote(account)',
    ).click({ force: true });

    cy.contains('.select-all-option', 'Unselect all')
      .scrollIntoView()
      .should('be.visible');

    // Should clear the search and restore the truncated hint with all options selected
    cy.get('.inner-variables-search-clear').click();

    cy.get('.inner-variables-filter-panel .truncated-hint').should(
      'contain.text',
      '(200 datas displayed in 20905)',
    );
    cy.contains('.select-all-option', 'Unselect all').should('be.visible');
  });
});
