/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck

import '../../support/commands';
import { isNumericalDimension } from '../../utils/utils';

export interface ResultI {
  matrixTooltip: number[]; // default, after folding first 2 nodes, after unfoldHierarchy
  nodesName: string[]; // Dim nodes names (differnet for numericals)
  unfoldH: number;
  matrixValues: number; // selected cell excpected Freq
}

describe('Test Plan for Khiops Covisualization', () => {
  const files = [
    '1-Adult2varsEducationOccupation.khcj',
    'Coclustering-100x100.json',
  ];

  const expectedResults: ResultI[] = [
    {
      matrixTooltip: ['1 608', '5 097', '1 893'],
      nodesName: ['A7', 'B5'],
      unfoldH: 5,
      matrixValues: '5 097',
    },
    {
      matrixTooltip: ['3 942', '27 815', '0'],
      nodesName: ['[-0.999999999;0.57661]', '[-0.999988212;0.577313]'],
      unfoldH: 150,
      matrixValues: '27 815', // selected cell excpected Freq
    },
  ];

  files.forEach((fileName, fileIndex) => {
    it(`Check values for ${fileName}`, () => {
      cy.initViews();

      cy.loadFile('covisualization', fileName);

      const res = expectedResults[fileIndex];

      cy.readFile('./src/assets/mocks/kc/' + fileName).then((datas) => {
        cy.wait(500);

        // Move to the first matrix cell
        cy.get('#matrix-selected').should('be.visible').trigger('mousemove', {
          position: 'bottomLeft',
        });

        cy.wait(500);

        // Check Matrix tooltip
        cy.get('.matrix-tooltip-comp').contains(res.matrixTooltip[0]);

        // Fold some nodes nodes
        cy.get('#tree_0').find('.tree-expando:eq(1)').click();
        cy.get('#tree_1').find('.tree-expando:eq(1)').click();

        cy.wait(500);

        // Move to the first matrix cell
        cy.get('#matrix-selected').should('be.visible').trigger('mousemove', {
          position: 'bottomLeft',
        });

        cy.wait(500);

        // Check Matrix tooltip
        cy.get('.matrix-tooltip-comp').contains(res.matrixTooltip[1]);

        // Check Clusters table
        cy.get('#cluster-details-grid-0').contains(res.nodesName[0]);
        cy.get('#cluster-details-grid-1').contains(res.nodesName[1]);

        // Check Annotations table
        cy.get('#cluster-annotation-0').contains(res.nodesName[0]);
        cy.get('#cluster-annotation-1').contains(res.nodesName[1]);

        // Check Composition table
        if (!isNumericalDimension(datas, 0)) {
          cy.get('#cluster-composition-0').contains(res.nodesName[0]);
        }
        if (!isNumericalDimension(datas, 1)) {
          cy.get('#cluster-composition-1').contains(res.nodesName[1]);
        }

        // Check distribution update legend (canvas values does not work)
        cy.get('#cluster-distribution-0').contains(
          res.nodesName[1].substring(0, 15), // legend is cropped
        );
        cy.get('#cluster-distribution-1').contains(
          res.nodesName[0].substring(0, 15), // legend is cropped
        );

        // Check selected Clusters table
        cy.get('#selected-clusters-grid').contains(res.nodesName[0]);
        cy.get('#selected-clusters-grid').contains(res.nodesName[1]);

        // Check Matrix
        cy.get('#cell-stats-comp').contains(res.matrixValues);

        // Rename node
        cy.get('#tree_0').find('.edit-button:eq(1)').click();
        cy.get('.tree-leaf-text-input input').type('renamed');
        cy.get('#tree_0').find('.valid-rename').click();

        // Check renamed name into all components
        cy.get('#cluster-details-grid-0').contains('renamed');
        if (!isNumericalDimension(datas, 0)) {
          cy.get('#cluster-composition-0').contains('renamed');
        }
        cy.get('#cluster-distribution-1').contains('renamed');
        cy.get('#selected-clusters-grid').contains('renamed');
        cy.get('#cluster-annotation-0').contains('renamed');

        // Open unfold Hierarchy view
        cy.get('.button-unfold-hierarchy').click();

        // Reduce hierarchy
        cy.get('#cy-unfold-value-input').type(res.unfoldH.toString(), {
          force: true,
        });
        cy.get('#cy-unfold-value-button').click({
          force: true,
        });

        cy.get('.button-confirm-hierarchy').click();
        cy.wait(500);

        // Move to the last matrix cell
        cy.get('#matrix-container').should('be.visible').trigger('mousemove', {
          position: 'bottomRight',
        });
        cy.wait(500);

        // Check Matrix tooltip
        cy.get('.matrix-tooltip-comp').contains(res.matrixTooltip[2]);

        // Now reverse dimenions
        cy.get('.hierarchy-select-comp-button').first().click();
        cy.wait(200);
        cy.get('.mat-mdc-menu-item').eq(1).click();
      });
    });
  });
});
