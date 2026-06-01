/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck

import '../../support/commands';

describe('Matrix cluster selection in trees #36', () => {
  const fileName = 'adult2var.json';

  it('should select tree nodes when CTRL+dragging on the matrix', () => {
    cy.initViews();
    cy.loadFile('covisualization', fileName);

    // Wait for the matrix to be rendered
    cy.get('#matrix-selected', { timeout: 10000 }).should('be.visible');

    // Note the initially selected tree node text
    cy.get('#tree_0 .tree-leaf-content.tree-selected .tree-leaf-text')
      .first()
      .invoke('text')
      .then((initialNodeText) => {
        // Perform CTRL+drag on the matrix to select multiple cells
        // Start from bottom-left corner area
        cy.get('#matrix-selected').trigger('mousedown', {
          position: 'bottomLeft',
          ctrlKey: true,
          force: true,
        });

        // Drag to a position that covers multiple cells
        cy.get('#matrix-selected').trigger('mousemove', {
          position: 'center',
          ctrlKey: true,
          force: true,
        });

        // Release mouse to finalize multi-selection
        cy.get('#matrix-selected').trigger('mouseup', {
          position: 'center',
          ctrlKey: true,
          force: true,
        });

        // Wait for the tree to update after selection
        cy.wait(500);

        // After multi-cell selection, the tree should have updated the selected node
        // The selected node should have changed (navigated to a common ancestor)
        cy.get('#tree_0 .tree-leaf-content.tree-selected .tree-leaf-text')
          .first()
          .invoke('text')
          .should('not.eq', initialNodeText);
      });
  });

  it('should update selected-clusters grid after matrix multi-selection', () => {
    cy.initViews();
    cy.loadFile('covisualization', fileName);

    // Wait for the matrix and selected-clusters grid
    cy.get('#matrix-selected', { timeout: 10000 }).should('be.visible');
    cy.get('#selected-clusters-grid', { timeout: 10000 }).should('be.visible');

    // Note initial cluster info
    cy.get('#selected-clusters-grid .ag-center-cols-container')
      .invoke('text')
      .then((initialText) => {
        // Perform CTRL+drag on the matrix
        cy.get('#matrix-selected').trigger('mousedown', {
          position: 'topLeft',
          ctrlKey: true,
          force: true,
        });

        cy.get('#matrix-selected').trigger('mousemove', {
          position: 'center',
          ctrlKey: true,
          force: true,
        });

        cy.get('#matrix-selected').trigger('mouseup', {
          position: 'center',
          ctrlKey: true,
          force: true,
        });

        cy.wait(500);

        // The selected-clusters grid should have been updated
        cy.get('#selected-clusters-grid .ag-center-cols-container')
          .invoke('text')
          .should('not.eq', initialText);
      });
  });

  it('should keep both trees with a valid selected node after CTRL+drag', () => {
    cy.initViews();
    cy.loadFile('covisualization', fileName);

    cy.get('#matrix-selected', { timeout: 10000 }).should('be.visible');

    // First click on a specific leaf node to set a known initial state
    cy.get('#tree_0 .tree-leaf-text').first().click({ force: true });
    cy.wait(300);

    // CTRL+drag a partial area on the matrix
    cy.get('#matrix-selected').trigger('mousedown', {
      position: 'bottomLeft',
      ctrlKey: true,
      force: true,
    });

    cy.get('#matrix-selected').trigger('mousemove', {
      position: 'center',
      ctrlKey: true,
      force: true,
    });

    cy.get('#matrix-selected').trigger('mouseup', {
      position: 'center',
      ctrlKey: true,
      force: true,
    });

    cy.wait(500);

    // Both trees should still have a valid selected node after multi-selection
    cy.get('#tree_0 .tree-leaf-content.tree-selected').should('exist');
    cy.get('#tree_1 .tree-leaf-content.tree-selected').should('exist');

    // The selected-clusters grid should reflect both dimensions
    cy.get('#selected-clusters-grid .ag-row').should('have.length.gte', 2);
  });
});
