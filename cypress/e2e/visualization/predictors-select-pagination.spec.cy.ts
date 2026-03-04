/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck
import '../../support/commands';

describe('Level distribution Test Plan for Khiops Visualization', () => {
  const files = ['nb-predictors.json'];

  files.forEach((fileName) => {
    it(`Check values for ${fileName}`, () => {
      cy.initViews();

      cy.loadFile('visualization', fileName);
      cy.wait(500);

      cy.readFile('./src/assets/mocks/kv/' + fileName).then(() => {
        cy.wait(500);
        cy.get('.mat-mdc-tab:contains("Evaluation")').first().click();
        cy.wait(500);
        cy.get('#select-toggle-button').click({ force: true });
        cy.wait(250);
        cy.get('.mat-mdc-menu-content').first().contains('Items per page');
        cy.get('.mat-mdc-menu-content').first().contains('20 of 111');
      });
    });
  });
});
