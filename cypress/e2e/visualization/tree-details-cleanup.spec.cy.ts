/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck

import '../../support/commands';

describe('Tree details component cleanup on file change #78', () => {
  it('should clear tree details when loading a file without trees after one with trees', () => {
    cy.initViews();

    // 1. Load a file WITH tree preparation data
    cy.loadFile('visualization', 'demo-visualization.json');

    // Navigate to Tree Preparation tab
    cy.get('.mat-mdc-tab:contains("Tree preparation")').first().click();

    // Verify the tree variables list shows data (first variable is Tree_6)
    cy.get('#tree-preparation-variables-list', { timeout: 10000 }).should(
      'be.visible',
    );
    cy.get('#tree-preparation-variables-list').contains('Tree_6');

    // Verify tree details grid is visible
    cy.get('#tree-details-comp').should('exist');

    // 2. Load a file WITHOUT tree preparation data
    cy.loadFile('visualization', 'AdultAllReports.json');

    // The Tree preparation tab should not exist
    cy.get('.mat-mdc-tab:contains("Tree preparation")').should('not.exist');
  });

  it('should show fresh tree details when loading a second file with trees', () => {
    cy.initViews();

    // 1. Load a file WITH tree preparation data (10 tree vars, first is Tree_6)
    cy.loadFile('visualization', 'demo-visualization.json');

    // Navigate to Tree Preparation tab
    cy.get('.mat-mdc-tab:contains("Tree preparation")').first().click();

    // Verify Tree_6 is displayed (first/selected variable)
    cy.get('#tree-preparation-variables-list', { timeout: 10000 }).should(
      'be.visible',
    );
    cy.get('#tree-preparation-variables-list').contains('Tree_6');

    // 2. Load a file WITHOUT trees, then one WITH different trees
    cy.loadFile('visualization', 'AdultAllReports.json');
    cy.get('.mat-mdc-tab:contains("Tree preparation")').should('not.exist');

    // 3. Load a different file WITH tree preparation data (1 tree var: Tree_1)
    cy.loadFile('visualization', 'tree-AllReports.json');

    // Navigate to Tree Preparation tab
    cy.get('.mat-mdc-tab:contains("Tree preparation")').first().click();

    // Verify the variables list shows Tree_1 (from the new file)
    cy.get('#tree-preparation-variables-list', { timeout: 10000 }).should(
      'be.visible',
    );
    cy.get('#tree-preparation-variables-list').contains('Tree_1');

    // Verify there is only 1 variable (not stale data from demo-visualization)
    cy.get(
      '#tree-preparation-variables-list .ag-center-cols-container .ag-row',
    ).should('have.length', 1);

    // Verify Tree_6 from the first file is NOT present
    cy.get('#tree-preparation-variables-list').should('not.contain', 'Tree_6');
  });
});
