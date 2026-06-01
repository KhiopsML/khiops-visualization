/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck

import '../../support/commands';

describe('Filtered variables warning #351', () => {
  it('should display warning when evaluatedVariables > displayed variables', () => {
    cy.initViews();
    // NGrams10_AnalysisResults.9vars.json has preparationReport with
    // evaluatedVariables=10 but only 9 variablesStatistics entries
    cy.loadFile('visualization', 'NGrams10_AnalysisResults.9vars.json');

    // Navigate to Preparation tab (default tab, should already be there)
    cy.get('.mat-mdc-tab:contains("Preparation")').first().click();

    // The informations block should show the filtered variables warning
    cy.get('#preparation-informations-block-informations', {
      timeout: 10000,
    }).should('be.visible');
    cy.get(
      '#preparation-informations-block-informations kl-warning-information',
    ).should('exist');
    cy.get(
      '#preparation-informations-block-informations .kl-warning-information',
    ).should('be.visible');
  });

  it('should also display warning in Text preparation tab', () => {
    cy.initViews();
    cy.loadFile('visualization', 'NGrams10_AnalysisResults.9vars.json');

    // Navigate to Text preparation tab
    cy.get('.mat-mdc-tab:contains("Text preparation")').first().click();

    // The informations block in Text preparation should also show the warning
    cy.get('kl-warning-information', { timeout: 10000 }).should('exist');
    cy.get('.kl-warning-information').should('be.visible');
  });

  it('should NOT display warning when all variables are shown', () => {
    cy.initViews();
    // AdultAllReports.json has evaluatedVariables == variablesStatistics.length
    cy.loadFile('visualization', 'AdultAllReports.json');

    cy.get('.mat-mdc-tab:contains("Preparation")').first().click();

    cy.get('#preparation-informations-block-informations', {
      timeout: 10000,
    }).should('be.visible');
    cy.get(
      '#preparation-informations-block-informations kl-warning-information',
    ).should('not.exist');
  });
});
