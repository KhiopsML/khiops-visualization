/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck
import '../../support/commands';

describe('Matrix visualization Test Plan for Khiops Visualization', () => {
  it(`Check matrix in cooccurrence`, () => {
    cy.initViews();
    cy.loadFile('visualization', 'co-oc.json');
    cy.readFile('./src/assets/mocks/kv/co-oc.json').then(() => {
      cy.wait(500);

      cy.get('.mat-mdc-tab:contains("Preparation 2D")').first().click();
      cy.wait(500);
      cy.get('app-cooccurrence-matrix').contains('Co-occurrence');

      // Move to the first matrix cell
      cy.get('#matrix-selected').should('be.visible').trigger('mousemove', {
        position: 'topLeft',
      });
      cy.wait(500);
      // Check Matrix tooltip
      cy.get('.matrix-tooltip-comp').contains('config/batch_size: [128,1088]');
      cy.get('.matrix-tooltip-comp').contains('config/lr: ]0');
      cy.get('.matrix-tooltip-comp').contains('Frequency');
      cy.get('.matrix-tooltip-comp').contains(341);
      cy.get('.matrix-mode-comp').contains('Frequency');
      cy.get('.matrix-mode-comp').first().click();
      cy.get('.mat-mdc-menu-content').first().contains('Target Frequency');
      cy.get('.mat-mdc-menu-content').first().contains('P (Target');
      cy.get('.mat-mdc-menu-content').first().contains('P (config');
    });
  });
  it(`Check matrix in regression`, () => {
    cy.initViews();
    cy.loadFile('visualization', 'reg.json');
    cy.readFile('./src/assets/mocks/kv/reg.json').then(() => {
      cy.wait(500);

      cy.get('app-regression-matrix').contains('Target values');

      // Move to the first matrix cell
      cy.get('#matrix-selected').should('be.visible').trigger('mousemove', {
        position: 'topLeft',
      });
      cy.wait(500);
      // Check Matrix tooltip
      cy.get('.matrix-tooltip-comp').contains(973);
      cy.get('.matrix-mode-comp').contains('I (marital_status , age)');
      cy.get('.matrix-mode-comp').first().click();
      cy.get('.mat-mdc-menu-content').first().contains('Frequency');
      cy.get('.mat-mdc-menu-content')
        .first()
        .contains('P (marital_status | age)');
      cy.get('.mat-mdc-menu-content')
        .first()
        .contains('P (age | marital_status)');
    });
  });
});
