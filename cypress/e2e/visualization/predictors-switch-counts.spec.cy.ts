/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck
import '../../support/commands';

describe('Modeling predictor switch updates variable counts', () => {
  it('checks 791 then 6421 variables for 20NewsgroupAllReports.json', () => {
    cy.loadFile('visualization', '20NewsgroupAllReports.json');

    cy.contains('.mat-mdc-tab', 'Modeling').first().click();

    cy.get('#select-trained-predictor-comp button[mat-stroked-button]')
      .first()
      .click({ force: true });

    cy.get('.mat-mdc-menu-panel .mat-mdc-menu-item').eq(0).click({ force: true });

    cy.get('#modeling-variables-list h1')
      .should('contain.text', '791')
      .and('contain.text', 'Variables');

    cy.get('#select-trained-predictor-comp button[mat-stroked-button]')
      .first()
      .click({ force: true });

    cy.get('.mat-mdc-menu-panel .mat-mdc-menu-item').eq(1).click({ force: true });

    cy.get('#modeling-variables-list h1')
      .should('contain.text', '6421')
      .and('contain.text', 'Variables');
  });
});
