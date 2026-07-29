/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck
import '../../support/commands';

describe('Distribution canvas updates when Y scale changes', () => {
  const fileName = 'ALLREPORTS_Std_Iris_AnalysisResults.khj';

  it('should render different canvas content between yLin and yLog in Preparation view', () => {
    cy.initViews();
    cy.loadFile('visualization', fileName);

    cy.get('.mat-mdc-tab:contains("Preparation")').first().click();
    cy.get('#distribution-chart-0', { timeout: 10000 }).should('be.visible');
    cy.checkCanvasIsNotEmpty('#distribution-chart-0');

    cy.get('.graph-options-menu-comp').contains('button', 'yLin').click();
    cy.get('.mat-mdc-menu-panel').contains('button', 'yLin').click();
    cy.get('.graph-options-menu-comp').contains('button', 'yLin');

    let yLinPixels: number;
    cy.get('#distribution-chart-0').then(($canvas) => {
      const ctx = $canvas[0].getContext('2d');
      const data = ctx.getImageData(
        0,
        0,
        $canvas[0].width,
        $canvas[0].height,
      ).data;
      yLinPixels = Array.from(data).reduce((sum: number, value: number) => {
        return sum + value;
      }, 0);
    });

    cy.get('.graph-options-menu-comp').contains('button', 'yLin').click();
    cy.get('.mat-mdc-menu-panel').contains('button', 'yLog').click();
    cy.get('.graph-options-menu-comp').contains('button', 'yLog');
    cy.checkCanvasIsNotEmpty('#distribution-chart-0');

    cy.get('#distribution-chart-0').then(($canvas) => {
      const ctx = $canvas[0].getContext('2d');
      const data = ctx.getImageData(
        0,
        0,
        $canvas[0].width,
        $canvas[0].height,
      ).data;
      const yLogPixels = Array.from(data).reduce(
        (sum: number, value: number) => sum + value,
        0,
      );

      expect(yLogPixels).not.to.eq(yLinPixels);
    });
  });
});