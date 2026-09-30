/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck

import '../../support/commands';

describe('Expected Frequency in unsupervised analysis #309', () => {
  it('should show Expected Frequency in matrix tooltip for unsupervised analysis', () => {
    
    // bi2.json has learningTask = "Unsupervised analysis"
    cy.loadFile('visualization', 'bi2.json');

    // Navigate to Preparation 2D tab
    cy.get('.mat-mdc-tab:contains("Preparation 2D")').first().click();

    // Hover over the matrix to trigger tooltip
    cy.get('#matrix-selected').should('be.visible').trigger('mousemove', {
      position: 'topLeft',
    });

    // The tooltip should contain "Expected frequency" for unsupervised
    cy.get('.matrix-tooltip-comp').contains('Expected frequency');
  });

  it('should NOT show Expected Frequency in matrix tooltip for classification analysis', () => {
    
    // adult-bivar.json has learningTask = "Classification analysis"
    cy.loadFile('visualization', 'adult-bivar.json');

    // Navigate to Preparation 2D tab
    cy.get('.mat-mdc-tab:contains("Preparation 2D")').first().click();

    // Hover over the matrix to trigger tooltip
    cy.get('#matrix-selected').should('be.visible').trigger('mousemove', {
      position: 'topLeft',
    });

    // The tooltip should NOT contain "Expected frequency" for classification
    cy.get('.matrix-tooltip-comp').should('not.contain', 'Expected frequency');
  });
});
