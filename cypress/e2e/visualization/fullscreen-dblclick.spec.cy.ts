/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck
import '../../support/commands';

describe('Double click fullscreen behaviors', () => {
  const fileName = 'ALLREPORTS_Std_Iris_AnalysisResults.khj';

  it('toggles ag-grid fullscreen on header double click', () => {
    cy.loadFile('visualization', fileName);

    cy.get('.mat-mdc-tab:contains("Preparation")').first().click();

    cy.get('#preparation-variables-list .ag-grid-comp', {
      timeout: 10000,
    }).as('preparationGrid');

    cy.get('@preparationGrid').should('not.have.class', 'fullscreen');

    cy.get('#preparation-variables-list .comp-header')
      .first()
      .dblclick({ force: true });

    cy.get('@preparationGrid').should('have.class', 'fullscreen');

    cy.get('#preparation-variables-list .comp-header')
      .first()
      .dblclick({ force: true });

    cy.get('@preparationGrid').should('not.have.class', 'fullscreen');
  });

  it('does not toggle target distribution fullscreen when fullscreen button is hidden', () => {
    cy.loadFile('visualization', fileName);

    cy.get('.mat-mdc-tab:contains("Preparation")').first().click();

    cy.get('#target-distribution-graph0 .target-distribution-graph-comp', {
      timeout: 10000,
    }).as('targetDistributionWithoutButton');

    cy.get('@targetDistributionWithoutButton').should(
      'not.have.class',
      'fullscreen',
    );

    cy.get('@targetDistributionWithoutButton').dblclick({ force: true });

    cy.get('@targetDistributionWithoutButton').should(
      'not.have.class',
      'fullscreen',
    );
  });

  it('toggles target distribution fullscreen on double click when fullscreen button is visible', () => {
    cy.loadFile('visualization', fileName);

    cy.get('.mat-mdc-tab:contains("Preparation 2D")').first().click();

    cy.get(
      '#preparation-2d-target-distribution-graph .target-distribution-graph-comp',
      {
        timeout: 10000,
      },
    ).as('targetDistributionWithButton');

    cy.get('@targetDistributionWithButton').should('not.have.class', 'fullscreen');

    cy.get('@targetDistributionWithButton').dblclick({ force: true });

    cy.get('@targetDistributionWithButton').should('have.class', 'fullscreen');

    cy.get('@targetDistributionWithButton').dblclick({ force: true });

    cy.get('@targetDistributionWithButton').should('not.have.class', 'fullscreen');
  });
});
