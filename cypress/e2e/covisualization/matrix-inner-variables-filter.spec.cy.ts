/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck
import '../../support/commands';

describe('Matrix inner variables filter', () => {
  const fileName = '290-Coclustering.khcj';

  const openCombo = () => {
    cy.get('.inner-variables-filter mat-select').click();
    cy.get('.inner-variables-filter-panel').should('be.visible');
  };

  beforeEach(() => {
    cy.initViews();
    cy.loadFile('covisualization', fileName);
    cy.get('.inner-variables-filter mat-select', { timeout: 10000 }).should(
      'be.visible',
    );
  });

  it('should display all inner variables (truncated) in the label at init', () => {
    cy.get('.inner-variables-value-overlay')
      .should('be.visible')
      .and('contain.text', 'Class')
      .and('contain.text', 'Count(DNA)')
      .and('contain.text', '...');
  });

  it('should open the combo and show every inner variable as checked', () => {
    openCombo();

    cy.get('.select-all-option input[type="checkbox"]').should('be.checked');
    cy.contains('.inner-variables-filter-panel mat-option', 'Class')
      .find('input[type="checkbox"]')
      .should('be.checked');
  });

  it('should update the label when unselecting then reselecting an item', () => {
    openCombo();

    // Uncheck "Class"
    cy.contains('.inner-variables-filter-panel mat-option', 'Class').click({
      force: true,
    });
    cy.get('.inner-variables-value-overlay').should(
      'not.contain.text',
      'Class',
    );
    cy.get('.select-all-option input[type="checkbox"]').should(
      ($input) => {
        expect($input[0].indeterminate).to.be.true;
      },
    );

    // Re-check "Class": the label must show it again (regression: it used to stay missing)
    cy.contains('.inner-variables-filter-panel mat-option', 'Class').click({
      force: true,
    });
    cy.get('.inner-variables-value-overlay').should('contain.text', 'Class');
    cy.get('.select-all-option input[type="checkbox"]').should('be.checked');
  });

  it('should update the label when unselecting all then reselecting one item', () => {
    openCombo();

    cy.get('.select-all-option').click({ force: true });
    cy.get('.inner-variables-value-overlay').should('not.exist');

    cy.contains('.inner-variables-filter-panel mat-option', 'Class').click({
      force: true,
    });
    cy.get('.inner-variables-value-overlay')
      .should('be.visible')
      .and('have.text', 'Class');
  });

  it('should filter the displayed options when searching, without altering the selection', () => {
    openCombo();

    cy.get('.inner-variables-search-input').type('Mode');

    // Only matching options are shown
    cy.get('.inner-variables-filter-panel mat-option').should(
      'have.length.greaterThan',
      0,
    );
    cy.get('.inner-variables-filter-panel mat-option').each(($option) => {
      cy.wrap($option).should('contain.text', 'Mode');
    });

    // The hidden "Class" variable is still selected: unselecting a visible
    // item must not drop it from the model
    cy.contains(
      '.inner-variables-filter-panel mat-option',
      'Mode(DNA.Char)',
    ).click({ force: true });

    cy.get('.inner-variables-search-clear').click({ force: true });
    cy.get('.inner-variables-filter-panel mat-option', {
      timeout: 5000,
    }).should('have.length.greaterThan', 40);
    cy.get('.inner-variables-value-overlay').should('contain.text', 'Class');
  });

  it('should show a "no data" option when the search matches nothing, and stay reopenable', () => {
    openCombo();

    cy.get('.inner-variables-search-input').type('zzz-no-match');
    cy.get('.inner-variables-filter-panel mat-option').should(
      'have.length',
      1,
    );
    cy.get('.inner-variables-filter-panel mat-option')
      .first()
      .should('have.attr', 'aria-disabled', 'true');

    // Close and reopen: the combo must not get stuck with zero options.
    // The search text persists across close/reopen, so the "no data" option
    // is still the only one shown right after reopening.
    // The search input intentionally blocks keydown propagation (so mat-select
    // doesn't hijack typing), so Escape can't reach it: close via the backdrop instead.
    cy.get('.cdk-overlay-backdrop').click({ force: true });
    cy.get('.inner-variables-filter-panel').should('not.exist');

    openCombo();
    cy.get('.inner-variables-filter-panel mat-option').should(
      'have.length',
      1,
    );

    // Clearing the search restores the full list
    cy.get('.inner-variables-search-clear').click({ force: true });
    cy.get('.inner-variables-filter-panel mat-option').should(
      'have.length.greaterThan',
      1,
    );
  });
});
