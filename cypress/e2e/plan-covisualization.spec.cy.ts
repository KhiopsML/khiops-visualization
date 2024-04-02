import '../support/commands';
import '../utils/utils';
import { initLS } from 'cypress/setups/init-ls';
import { isNumericalDimension } from '../utils/utils';

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
      matrixTooltip: [1608, 5097, 3596],
      nodesName: ['A7', 'B5'],
      unfoldH: 6,
      matrixValues: 5097,
    },
    {
      matrixTooltip: [3942, 27815, 17],
      nodesName: ['[-0.999999999;0.57661]', '[-0.999988212;0.577313]'],
      unfoldH: 150,
      matrixValues: 27815, // selected cell excpected Freq
    },
  ];

  files.forEach((fileName, fileIndex) => {
    it(
      `Check values for ${fileName}`,
      {
        defaultCommandTimeout: 10000,
      },
      () => {
        // Initialize ls with all views enabled
        initLS();

        //@ts-ignore
        cy.initViews();

        //@ts-ignore
        cy.loadFile('covisualization', fileName);

        const res = expectedResults[fileIndex];

        cy.readFile('./src/assets/mocks/kc/' + fileName).then((datas) => {
          // Move to the first matrix cell
          //@ts-ignore
          cy.get('#matrix-selected').trigger('mousemove', {
            position: 'bottomLeft',
          });

          // Check Matrix tooltip
          cy.get('.matrix-tooltip-comp').contains(res.matrixTooltip[0]);

          // Fold some nodes nodes
          cy.get('#tree_0').find('.tree-expando:eq(1)').click();
          cy.get('#tree_1').find('.tree-expando:eq(1)').click();

          // Move to the first matrix cell
          //@ts-ignore
          cy.get('#matrix-selected').trigger('mousemove', {
            position: 'bottomLeft',
          });

          // Check MAtrix tooltip
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
          cy.get('#tree_0').find('.tree-leaf-text:eq(1)').dblclick();
          cy.get('.tree-leaf-text-input input').type('renamed');
          cy.get('#tree_0').find('.valid-rename').dblclick();

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

          // Move to the last matrix cell
          //@ts-ignore
          cy.get('#matrix-selected').trigger('mousemove', {
            position: 'topRight',
          });

          // Check Matrix tooltip
          cy.get('.matrix-tooltip-comp').contains(res.matrixTooltip[2]);
        });
      },
    );
  });
});
