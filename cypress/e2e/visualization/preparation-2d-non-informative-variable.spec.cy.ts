/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck
import '../../support/commands';

describe('Preparation 2D non-informative variable display', () => {
  it('should show non-informative message for dummy variable and details for informative variable', () => {
    cy.initViews();
    cy.loadFile('visualization', 'iris2d.json');

    cy.get('.mat-mdc-tab:contains("Preparation 2D")').first().click();

    // Initial selection (R01 Dummy2/PetalWidth) shows non-informative
    cy.get('#preparation-2d-view-comp').contains('Non-informative variable');

    // Click R10 (SepalWidth / UpperPetalWidth) — informative variable
    cy.get('#preparation-2d-variables-list')
      .find('.ag-row:eq(9)')
      .click();

    // Details component visible, no non-informative message
    cy.get('app-var-details-preparation-2d').should('be.visible');
    cy.get('#preparation-2d-view-comp').should(
      'not.contain',
      'Non-informative variable',
    );

    // Click R01 (Dummy2 / PetalWidth) — non-informative variable
    cy.get('#preparation-2d-variables-list')
      .find('.ag-row:eq(0)')
      .click();

    // Non-informative message displayed again
    cy.get('#preparation-2d-view-comp').contains('Non-informative variable');
  });

  it('should show details for R001 and non-informative for R002 in missing-zero.json', () => {
    cy.initViews();
    cy.loadFile('visualization', 'missing-zero.json');

    cy.get('.mat-mdc-tab:contains("Preparation 2D")').first().click();

    // R001 (index 0) is informative — details component visible
    cy.get('#preparation-2d-variables-list').find('.ag-row:eq(0)').click();
    cy.get('app-var-details-preparation-2d').should('be.visible');
    cy.get('#preparation-2d-view-comp').should(
      'not.contain',
      'Non-informative variable',
    );

    // R002 (index 1) has level=0 — non-informative
    cy.get('#preparation-2d-variables-list').find('.ag-row:eq(1)').click();
    cy.get('#preparation-2d-view-comp').contains('Non-informative variable');
  });
});
