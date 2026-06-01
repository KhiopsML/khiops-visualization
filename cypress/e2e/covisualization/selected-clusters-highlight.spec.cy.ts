/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck

import '../../support/commands';

describe('Selected clusters highlighting #155', () => {
  it('should NOT highlight any row when there is no context (2 dimensions)', () => {
    cy.initViews();
    cy.loadFile('covisualization', 'adult2var.json');

    // Wait for the selected-clusters grid to be visible
    cy.get('#selected-clusters-grid', { timeout: 10000 }).should('be.visible');

    // With 2 dimensions (no context), no rows should be highlighted
    cy.get('#selected-clusters-grid .ag-row-selected').should('not.exist');

    // Verify the table still has data rows (2 dimensions displayed)
    cy.get('#selected-clusters-grid .ag-row').should('have.length.gte', 2);

    // Click on a different tree node to change the current element
    cy.get('.tree-leaf-text').eq(1).click({ force: true });

    // After changing selection, still no rows should be highlighted
    cy.get('#selected-clusters-grid .ag-row-selected').should('not.exist');
  });

  it('should highlight only axis rows when there is context (3+ dimensions)', () => {
    cy.initViews();
    cy.loadFile('covisualization', 'CC_3_Coclustering.json');

    // Wait for the selected-clusters grid to be visible
    cy.get('#selected-clusters-grid', { timeout: 10000 }).should('be.visible');

    // With 3 dimensions (context present), exactly 2 rows should be highlighted
    // (the 2 axis dimensions shown in the Axis tab)
    cy.get('#selected-clusters-grid .ag-row-selected').should('have.length', 2);

    // Total rows should be 3 (one per dimension)
    cy.get('#selected-clusters-grid .ag-row').should('have.length', 3);

    // The non-highlighted row (context dimension) should exist
    cy.get('#selected-clusters-grid .ag-row:not(.ag-row-selected)').should(
      'have.length',
      1,
    );

    // Click on a different tree node to change the current element
    cy.get('.tree-leaf-text').eq(1).click({ force: true });

    // After changing selection, still exactly 2 rows should be highlighted
    cy.get('#selected-clusters-grid .ag-row-selected').should('have.length', 2);
  });
});
