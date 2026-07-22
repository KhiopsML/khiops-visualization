/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck

import '../../support/commands';

describe('Histogram initialization with misspelled field #79', () => {
  const fileName = 'AdultAgeAllReports.json';

  it('should render the histogram canvas even when data contains intrepretableHistogramNumber typo', () => {
    
    cy.loadFile('visualization', fileName);

    // The first variable "age" (R1, Numerical) is selected by default
    // and its modlHistograms has the typo "intrepretableHistogramNumber"
    // The histogram should still be initialized and rendered
    cy.get('#app-histogram', { timeout: 10000 }).should('be.visible');
    // Wait for the canvas to be painted
    cy.wait(200);
    cy.checkCanvasIsNotEmpty('#histogram-canvas');
  });

  it('should display the interpretable histogram slider with multiple thumbs', () => {
    
    cy.loadFile('visualization', fileName);

    // The slider should be visible since histogramNumber > 1 (9 histograms)
    cy.get('#app-histogram', { timeout: 10000 }).should('be.visible');
    cy.get('.app-histogram-slider', { timeout: 10000 }).should('be.visible');
    // There should be 2 mat-sliders (default + interpretable)
    cy.get('.app-histogram-slider mat-slider').should('have.length', 2);
  });
});
