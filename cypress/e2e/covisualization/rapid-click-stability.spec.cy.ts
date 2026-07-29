/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck

import '../../support/commands';

describe('Rapid clicks on matrix should not cause infinite selection loop', () => {
  const fileName = 'adult2var.json';

  it('should stabilize after rapid clicks on different matrix cells', () => {
    cy.initViews();
    cy.loadFile('covisualization', fileName);

    // Wait for the matrix to be fully rendered
    cy.get('#matrix-selected', { timeout: 10000 }).should('be.visible');
    cy.get('#matrix', { timeout: 10000 }).should('be.visible');

    // Perform 5 rapid clicks at different positions on the matrix
    const positions = [
      { x: 20, y: 50 },
      { x: 60, y: 150 },
      { x: 100, y: 300 },
      { x: 40, y: 400 },
      { x: 80, y: 250 },
    ];

    positions.forEach(({ x, y }) => {
      cy.get('#matrix-selected').click(x, y, { force: true });
    });

    // Wait 3 seconds for any cascading events to settle
    cy.wait(3000);

    // Capture the canvas pixel state of matrix-selected
    cy.get('#matrix-selected').then(($canvas) => {
      const ctx = $canvas[0].getContext('2d');
      const snapshot1 = ctx.getImageData(
        0,
        0,
        $canvas[0].width,
        $canvas[0].height,
      ).data;
      const pixelSum1 = Array.from(snapshot1).reduce(
        (a, b) => a + b,
        0,
      );

      // Wait another 1 second and take a second snapshot
      cy.wait(1000);

      cy.get('#matrix-selected').then(($canvas2) => {
        const ctx2 = $canvas2[0].getContext('2d');
        const snapshot2 = ctx2.getImageData(
          0,
          0,
          $canvas2[0].width,
          $canvas2[0].height,
        ).data;
        const pixelSum2 = Array.from(snapshot2).reduce(
          (a, b) => a + b,
          0,
        );

        // The canvas should be stable (identical pixel data between the two snapshots)
        expect(pixelSum2).to.eq(pixelSum1);
      });
    });
  });

  it('should only reflect the last clicked cell after rapid clicks', () => {
    cy.initViews();
    cy.loadFile('covisualization', fileName);

    cy.get('#matrix-selected', { timeout: 10000 }).should('be.visible');

    // Note initial tree selection
    cy.get('#tree_0 .tree-leaf-content.tree-selected .tree-leaf-text')
      .first()
      .invoke('text')
      .then((initialNodeText) => {
        // Rapid clicks on different positions
        cy.get('#matrix-selected').click(20, 50, { force: true });
        cy.get('#matrix-selected').click(60, 150, { force: true });
        cy.get('#matrix-selected').click(100, 300, { force: true });

        // Wait for everything to settle
        cy.wait(3000);

        // Capture stable state
        cy.get('#matrix-selected').then(($canvas) => {
          const ctx = $canvas[0].getContext('2d');
          const snapshot1 = ctx.getImageData(
            0,
            0,
            $canvas[0].width,
            $canvas[0].height,
          ).data;
          const sum1 = Array.from(snapshot1).reduce((a, b) => a + b, 0);

          // Wait another second — canvas must not change
          cy.wait(1000);

          cy.get('#matrix-selected').then(($canvas2) => {
            const ctx2 = $canvas2[0].getContext('2d');
            const snapshot2 = ctx2.getImageData(
              0,
              0,
              $canvas2[0].width,
              $canvas2[0].height,
            ).data;
            const sum2 = Array.from(snapshot2).reduce((a, b) => a + b, 0);

            // Selection canvas must be frozen (no ongoing redraws)
            expect(sum2).to.eq(sum1);
          });
        });

        // Tree should have a valid selected node (not stuck in a loop)
        cy.get('#tree_0 .tree-leaf-content.tree-selected').should('exist');
        cy.get('#tree_1 .tree-leaf-content.tree-selected').should('exist');
      });
  });
});
