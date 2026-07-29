/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck
import '../../support/commands';

describe('Predictor menu should not show duplicated entries', () => {
  it('shows Selective Naive Bayes only once for nb-predictors.json', () => {
    cy.loadFile('visualization', 'nb-predictors.json');

    cy.contains('.mat-mdc-tab', 'Modeling').first().click();

    cy.get('#select-trained-predictor-comp button[mat-stroked-button]')
      .first()
      .click({ force: true });

    cy.get('.mat-mdc-menu-panel .mat-mdc-menu-item .mat-mdc-menu-item-text')
      .filter((_, el) => el.textContent?.trim() === 'Selective Naive Bayes')
      .should('have.length', 1);
  });
});
