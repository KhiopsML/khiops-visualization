/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck
import '../../support/commands';

describe('Info panel layout toggle without reload for Khiops Visualization', () => {
  it('Should switch top/left layout immediately without reloading the page', () => {
    cy.loadFile('visualization', 'AdultAllReports.json');

    cy.get('#preparation-view-comp').should('be.visible');
    cy.get('#preparation-view-comp > as-split').first().should('exist');

    cy.window().then((initialWindow) => {
      cy.wrap(initialWindow).as('initialWindow');
    });

    // Initial mode is top => vertical split
    cy.get('#preparation-view-comp > as-split')
      .first()
      .should('have.class', 'as-vertical');

    // Switch to left mode and verify immediate layout update
    cy.get('#info-layout-left-button').click();
    cy.get('#preparation-view-comp > as-split')
      .first()
      .should('have.class', 'as-horizontal');

    // Switch back to top mode and verify immediate layout update
    cy.get('#info-layout-top-button').click();
    cy.get('#preparation-view-comp > as-split')
      .first()
      .should('have.class', 'as-vertical');

    // Verify no page reload happened (same window object)
    cy.get('@initialWindow').then((savedWindow) => {
      cy.window().should('equal', savedWindow);
    });
  });
});
