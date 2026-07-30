/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck
import '../../support/commands';

describe('Project infos gravity levels display', () => {
  const fileName = 'ALLREPORTS_Std_Iris_AnalysisResults.khj';
  const repeatedMessage =
    'Decision Tree variable creation : No enough memory to build trees (needs extra 99.4 MB)';

  it('should show warning/info/error rows with expected styles in Project infos', () => {
    cy.initViews();
    cy.loadFile('visualization', fileName);

    cy.get('.mat-mdc-tab:contains("Project infos")', { timeout: 10000 })
      .first()
      .click();

    cy.get('#project-logs', { timeout: 10000 }).should('be.visible');
    cy.get('#project-logs').contains(repeatedMessage).should('be.visible');

    cy.get('#project-logs .gravity-warning')
      .contains(/^warning$/i)
      .should('be.visible')
      .and('have.css', 'font-weight', '600');

    cy.get('#project-logs .gravity-default')
      .contains(/^info$/i)
      .should('be.visible')
      .and('have.css', 'font-weight', '400');

    cy.get('#project-logs .gravity-error')
      .contains(/^error$/i)
      .should('be.visible')
      .and('have.css', 'font-weight', '600')
      .and('have.css', 'color', 'rgb(251, 71, 58)');
  });
});
