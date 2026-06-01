/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck

import '../../support/commands';

describe('Zero values displayed in variables table #347', () => {
  it('should display 0 for Level when value is zero', () => {
    cy.initViews();
    // AdultAllReports.json has variables with level=0 (Label at row 13)
    cy.loadFile('visualization', 'AdultAllReports.json');

    cy.get('#preparation-variables-list', { timeout: 10000 }).should(
      'be.visible',
    );

    // Label is at row index 13, with level=0
    // col-id uses the translated headerName ("Level"), not the field name
    cy.get(
      '#preparation-variables-list .ag-center-cols-container [row-id="13"]',
    ).should('contain', 'Label');
    cy.get(
      '#preparation-variables-list .ag-center-cols-container [row-id="13"] .ag-cell[col-id="Level"]',
    ).should('contain', '0');
  });

  it('should display 0 for Min when value is zero', () => {
    cy.initViews();
    // AdultAllReports.json has capital_gain with min=0
    cy.loadFile('visualization', 'AdultAllReports.json');

    cy.get('#preparation-variables-list', { timeout: 10000 }).should(
      'be.visible',
    );

    // Min column is hidden by default, enable it via the filter menu
    cy.get(
      '#preparation-variables-list button[aria-label="Filter datas in the grid"]',
    ).click();
    // Click the "Min" checkbox in the filter menu (force because menu may need scrolling)
    cy.get('.mat-mdc-menu-content mat-checkbox')
      .contains('Min')
      .click({ force: true });
    // Close the menu by clicking elsewhere
    cy.get('body').click(0, 0);

    // capital_gain is at row index 2, with min=0
    cy.get(
      '#preparation-variables-list .ag-center-cols-container [row-id="2"]',
    ).should('contain', 'capital_gain');
    cy.get(
      '#preparation-variables-list .ag-center-cols-container [row-id="2"] .ag-cell[col-id="Min"]',
    ).should('contain', '0');
  });
});
