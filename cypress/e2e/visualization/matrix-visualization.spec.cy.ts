/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck
import '../../support/commands';

describe('Matrix visualization Test Plan for Khiops Visualization', () => {
  it(`Check matrix in cooccurrence`, () => {
    cy.loadFile('visualization', 'co-oc.json');
    cy.readFile('./src/assets/mocks/kv/co-oc.json').then(() => {
      cy.get('.mat-mdc-tab:contains("Preparation 2D")').first().click();
      cy.get('app-cooccurrence-matrix').contains('Co-occurrence');

      // Move to the first matrix cell
      cy.get('#matrix-selected').should('be.visible').trigger('mousemove', {
        position: 'topLeft',
      });
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
    cy.loadFile('visualization', 'reg.json');
    cy.readFile('./src/assets/mocks/kv/reg.json').then(() => {
      cy.get('app-regression-matrix').contains('Target values');

      // Move to the first matrix cell
      cy.get('#matrix-selected').should('be.visible').trigger('mousemove', {
        position: 'topLeft',
      });
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

  it(`Regression matrix cell selection persistence across tabs`, () => {
    cy.loadFile('visualization', 'reg.json');
    cy.readFile('./src/assets/mocks/kv/reg.json').then(() => {
      cy.get('app-regression-matrix').contains('Target values');

      // Click invert axis button
      cy.get('button.invert-axis').should('be.visible').click();

      // Wait for axis inversion
      cy.wait(500);

      // Click on matrix at coordinates 0,0
      cy.get('#matrix-selected').should('be.visible').click(0, 0);

      // Verify the current cell values
      cy.get('#preparation-2d-current-cell-x').should('contain', '23');
      cy.get('#preparation-2d-current-cell-y').should('contain', '1 746');

      // Switch to Modeling tab
      cy.get('.mdc-tab').contains('Modeling').click();

      cy.wait(500);

      // Return to Preparation tab
      cy.get('.mdc-tab').contains('Preparation').click();

      cy.wait(500);

      // Verify that cell selection is still persisted
      cy.get('#preparation-2d-current-cell-x').should('contain', '23');
      cy.get('#preparation-2d-current-cell-y').should('contain', '1 746');
    });
  });

  it(`Cooccurrence matrix cell selection persistence across tabs`, () => {
    cy.loadFile('visualization', 'co-oc.json');
    cy.readFile('./src/assets/mocks/kv/co-oc.json').then(() => {
      cy.get('.mdc-tab').contains('Preparation 2D').click();
      cy.get('app-cooccurrence-matrix').contains('Co-occurrence');

      // Click on matrix at coordinates 0,0
      cy.get('#matrix-selected').should('be.visible').click(0, 0);

      // Verify selected current cell values
      cy.get('#preparation-2d-current-cell-y').should('contain', '680');

      // Switch to Preparation tab
      cy.get('.mdc-tab').contains('Preparation').click();
      cy.wait(500);

      // Return to Preparation 2D tab
      cy.get('.mdc-tab').contains('Preparation 2D').click();
      cy.wait(500);

      // Verify value still persisted
      cy.get('#preparation-2d-current-cell-y').should('contain', '680');
    });
  });
});
