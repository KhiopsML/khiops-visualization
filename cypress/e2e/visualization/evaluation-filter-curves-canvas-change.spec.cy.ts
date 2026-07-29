/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck

import '../../support/commands';

describe('Evaluation filter curves updates lift chart canvas', () => {
  it('should change target-lift-chart after toggling second filter option', () => {
    const fileName = 'ALLREPORTS_Std_Iris_AnalysisResults.khj';

    cy.initViews();
    cy.loadFile('visualization', fileName);

    cy.get('.mat-mdc-tab:contains("Evaluation")', { timeout: 10000 })
      .first()
      .click();

    cy.get('#target-lift-chart', { timeout: 10000 }).should('be.visible');

    let beforeDataUrl: string;

    cy.get('#target-lift-chart').then(($canvas) => {
      beforeDataUrl = ($canvas[0] as HTMLCanvasElement).toDataURL('image/png');
    });

    cy.get('#target-lift-chart').screenshot('target-lift-chart-before-filter-toggle');

    cy.get('#select-toggle-button').click({ force: true });

    cy.get('.mat-mdc-menu-content .mat-mdc-menu-item', { timeout: 10000 })
      .eq(1)
      .click({ force: true });

    cy.get('body').click(0, 0, { force: true });

    cy.get('#target-lift-chart').should('be.visible');
    cy.get('#target-lift-chart').screenshot('target-lift-chart-after-filter-toggle');

    cy.get('#target-lift-chart').then(($canvas) => {
      const afterDataUrl = ($canvas[0] as HTMLCanvasElement).toDataURL('image/png');
      expect(afterDataUrl).to.not.equal(beforeDataUrl);
    });
  });
});
