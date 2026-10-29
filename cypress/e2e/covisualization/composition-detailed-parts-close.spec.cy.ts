/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck

import '../../support/commands';

describe('Composition detailed parts dialog', () => {
  it('closes the dialog when clicking the close button', () => {
    cy.initViews();
    cy.loadFile('covisualization', 'Coclustering-IV-Glass.khcj');

    cy.get('.mat-mdc-tab:contains("Axis")').first().click();
    cy.get('.variable-search-button-comp').first().click({ force: true });
    cy.get('.close-btn').first().click({ force: true });
    cy.get('.kl-grid-btn-fit-columns').eq(3).click({ force: true });

    cy.get('.kl-icon-cell-comp-btn').first().click({ force: true });

    cy.get('#composition-detailed-parts-comp').should('be.visible');
    cy.get('#composition-detailed-parts-list-table .ag-row')
      .should('have.length.greaterThan', 0);

    cy.get('#composition-detailed-parts-comp .close-btn').click({
      force: true,
    });

    cy.get('#composition-detailed-parts-comp').should('not.exist');
  });
});
