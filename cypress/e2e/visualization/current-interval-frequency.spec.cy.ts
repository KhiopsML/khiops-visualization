/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck

import '../../support/commands';

describe('Current interval Frequency column #321', () => {
  it('should display a Frequency column for numerical variables in Preparation', () => {
    
    // AdultAllReports.json has numerical variable "age" (R04)
    cy.loadFile('visualization', 'AdultAllReports.json');

    cy.get('.mat-mdc-tab:contains("Preparation")').first().click();

    // Select a numerical variable (age) from the variables list
    cy.get('#preparation-variables-list', { timeout: 10000 }).should(
      'be.visible',
    );
    cy.get('#preparation-variables-list .ag-center-cols-container').contains(
      'age',
    ).click();

    // The current interval table should have a Frequency column
    cy.get('#preparation-current-interval', { timeout: 10000 }).should(
      'be.visible',
    );
    cy.get('#preparation-current-interval .ag-header-cell').should(
      'contain',
      'Frequency',
    );
  });

  it('should display a Frequency column for categorical variables in Preparation', () => {
    
    cy.loadFile('visualization', 'AdultAllReports.json');

    cy.get('.mat-mdc-tab:contains("Preparation")').first().click();

    // Select a categorical variable from the variables list
    // The default selected variable should be the first one
    cy.get('#preparation-variables-list', { timeout: 10000 }).should(
      'be.visible',
    );
    cy.get('#preparation-variables-list .ag-center-cols-container')
      .contains('relationship')
      .click();

    // The current interval table should have a Frequency column for categorical too
    cy.get('#preparation-current-interval', { timeout: 10000 }).should(
      'be.visible',
    );
    cy.get('#preparation-current-interval .ag-header-cell').should(
      'contain',
      'Frequency',
    );
  });

  it('should display interval as [min, max] format for numerical variables', () => {
    
    cy.loadFile('visualization', 'AdultAllReports.json');

    cy.get('.mat-mdc-tab:contains("Preparation")').first().click();

    // Select age (numerical)
    cy.get('#preparation-variables-list', { timeout: 10000 }).should(
      'be.visible',
    );
    cy.get('#preparation-variables-list .ag-center-cols-container').contains(
      'age',
    ).click();

    // The interval column should show bracket format [x, y]
    cy.get('#preparation-current-interval', { timeout: 10000 }).should(
      'be.visible',
    );
    cy.get(
      '#preparation-current-interval .ag-center-cols-container .ag-row',
    )
      .first()
      .should('contain', '[');
  });
});
