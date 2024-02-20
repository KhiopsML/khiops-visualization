import '../support/commands';
import '../utils/utils';

describe('Test Plan for Khiops Covisualization', () => {
  const files = ['1-Adult2varsEducationOccupation.khcj'];

  const expectedResults = [
    {
      node0: 'A7',
      node1: 'B5',
      matrixValues: [5097, 2404],
    },
  ];

  files.forEach((fileName, fileIndex) => {
    it(
      `Check values for ${fileName}`,
      {
        defaultCommandTimeout: 10000,
      },
      () => {
        //@ts-ignore
        cy.initViews();

        //@ts-ignore
        cy.loadFile('covisualization', fileName);

        cy.readFile('./src/assets/mocks/kc/' + fileName).then((datas) => {
          // Fold some nodes nodes
          cy.get('#tree_0').find('.tree-expando:eq(1)').click();
          cy.get('#tree_1').find('.tree-expando:eq(1)').click();

          // Check Clusters table
          cy.get('#cluster-details-grid-0').contains(
            expectedResults[fileIndex].node0,
          );
          cy.get('#cluster-details-grid-1').contains(
            expectedResults[fileIndex].node1,
          );

          // Check Annotations table
          cy.get('#cluster-annotation-0').contains(
            expectedResults[fileIndex].node0,
          );
          cy.get('#cluster-annotation-1').contains(
            expectedResults[fileIndex].node1,
          );

          // Check Composition table
          cy.get('#cluster-composition-0').contains(
            expectedResults[fileIndex].node0,
          );
          cy.get('#cluster-composition-1').contains(
            expectedResults[fileIndex].node1,
          );

          // Check distribution update
          cy.get('#cluster-distribution-0').contains(
            expectedResults[fileIndex].node0,
          );
          cy.get('#cluster-distribution-1').contains(
            expectedResults[fileIndex].node1,
          );

          // Check selected Clusters table
          cy.get('#selected-clusters-grid').contains(
            expectedResults[fileIndex].node0,
          );
          cy.get('#selected-clusters-grid').contains(
            expectedResults[fileIndex].node1,
          );

          // Check Matrix
          cy.get('#cell-stats-comp').contains(
            expectedResults[fileIndex].matrixValues[0],
          );
          cy.get('#cell-stats-comp').contains(
            expectedResults[fileIndex].matrixValues[1],
          );

          // Rename node
          cy.get('#tree_0').find('.tree-leaf-text:eq(1)').dblclick();
          cy.get('.tree-leaf-text-input input').type('renamed');
          cy.get('#tree_0').find('.valid-rename').dblclick();

          // Check renamed name into all components
          cy.get('#cluster-details-grid-0').contains('renamed');
          cy.get('#cluster-composition-0').contains('renamed');
          cy.get('#cluster-distribution-0').contains('renamed');
          cy.get('#selected-clusters-grid').contains('renamed');
          cy.get('#cluster-annotation-0').contains('renamed');
        });
      },
    );
  });
});
