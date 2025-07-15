import '../support/commands';
// import { isNumericalDimension } from '../utils/utils';

export interface ResultI {
  matrixTooltip: number[]; // default, after folding first 2 nodes, after unfoldHierarchy
  nodesName: string[]; // Dim nodes names (differnet for numericals)
  unfoldH: number;
  matrixValues: number; // selected cell excpected Freq
}

describe('Test Plan for Khiops Covisualization', () => {
  const files = ['000_000_10000words_AllReports.json'];

  files.forEach((fileName, fileIndex) => {
    it(`Check values for ${fileName}`, () => {
      //@ts-ignore
      cy.initViews();

      //@ts-ignore
      cy.loadFile('visualization', fileName);

      cy.readFile('./src/assets/mocks/kv/' + fileName).then((datas) => {
        cy.wait(500);

        // Move to the first matrix cell
        cy.get('#matrix-selected').should('be.visible').trigger('mousemove', {
          position: 'bottomLeft',
        });

        cy.wait(500);

        // Check Matrix tooltip
        cy.get('.matrix-tooltip-comp').contains(146);
        cy.wait(500);

        // cy.get('#regression-matrix-comp')
        //   .find('.mat-button-toggle:eq(1)')
        //   .click({
        //     force: true,
        //   });
        // cy.wait(500);

        // // Move to the first matrix cell
        // cy.get('#matrix-selected').should('be.visible').trigger('mousemove', {
        //   position: 'bottomLeft',
        // });

        // cy.wait(500);

        // // Check Matrix tooltip
        // cy.get('.matrix-tooltip-comp').contains(698);

        cy.get('#preparation-2d-current-cell-x').contains(-160.8);
        cy.get('#preparation-2d-current-cell-y').contains(80);
        cy.get('#distribution-graph-comp-0').should('be.visible');
        cy.get('#variable-stats-block-summary').contains(88.45);
        cy.get('#variable-stats-block-summary').contains(21);
        cy.get('#preparation-informations-block-summary').contains(
          'Regression',
        );
        cy.get('#preparation-informations-block-informations').contains('MODL');
        cy.get('#preparation-variables-list').contains('region_1');

        cy.get('#preparation-variables-list').find('.ag-row:eq(1)').click();
        cy.wait(500);

        // Move to the first matrix cell
        cy.get('#matrix-selected').should('be.visible').trigger('mousemove', {
          position: 'bottomLeft',
        });

        cy.wait(500);

        // Check Matrix tooltip
        cy.get('.matrix-tooltip-comp').contains(2444);

        cy.get('.mat-mdc-tab:contains("Text preparation")').first().click();

        // // Fold some nodes nodes
        // cy.get('#tree_0').find('.tree-expando:eq(1)').click();
        // cy.get('#tree_1').find('.tree-expando:eq(1)').click();

        // cy.wait(500);

        // // Move to the first matrix cell
        // cy.get('#matrix-selected').should('be.visible').trigger('mousemove', {
        //   position: 'bottomLeft',
        // });

        // cy.wait(500);

        // // Check Matrix tooltip
        // cy.get('.matrix-tooltip-comp').contains(res.matrixTooltip[1]);

        // // Check Clusters table
        // cy.get('#cluster-details-grid-0').contains(res.nodesName[0]);
        // cy.get('#cluster-details-grid-1').contains(res.nodesName[1]);

        // // Check Annotations table
        // cy.get('#cluster-annotation-0').contains(res.nodesName[0]);
        // cy.get('#cluster-annotation-1').contains(res.nodesName[1]);

        // // Check Composition table
        // if (!isNumericalDimension(datas, 0)) {
        //   cy.get('#cluster-composition-0').contains(res.nodesName[0]);
        // }
        // if (!isNumericalDimension(datas, 1)) {
        //   cy.get('#cluster-composition-1').contains(res.nodesName[1]);
        // }

        // // Check distribution update legend (canvas values does not work)
        // cy.get('#cluster-distribution-0').contains(
        //   res.nodesName[1].substring(0, 15), // legend is cropped
        // );
        // cy.get('#cluster-distribution-1').contains(
        //   res.nodesName[0].substring(0, 15), // legend is cropped
        // );

        // // Check selected Clusters table
        // cy.get('#selected-clusters-grid').contains(res.nodesName[0]);
        // cy.get('#selected-clusters-grid').contains(res.nodesName[1]);

        // // Check Matrix
        // cy.get('#cell-stats-comp').contains(res.matrixValues);

        // // Rename node
        // cy.get('#tree_0').find('.edit-button:eq(1)').click();
        // cy.get('.tree-leaf-text-input input').type('renamed');
        // cy.get('#tree_0').find('.valid-rename').click();

        // // Check renamed name into all components
        // cy.get('#cluster-details-grid-0').contains('renamed');
        // if (!isNumericalDimension(datas, 0)) {
        //   cy.get('#cluster-composition-0').contains('renamed');
        // }
        // cy.get('#cluster-distribution-1').contains('renamed');
        // cy.get('#selected-clusters-grid').contains('renamed');
        // cy.get('#cluster-annotation-0').contains('renamed');

        // // Open unfold Hierarchy view
        // cy.get('.button-unfold-hierarchy').click();

        // // Reduce hierarchy
        // cy.get('#cy-unfold-value-input').type(res.unfoldH.toString(), {
        //   force: true,
        // });
        // cy.get('#cy-unfold-value-button').click({
        //   force: true,
        // });

        // cy.get('.button-confirm-hierarchy').click();

        // // Move to the last matrix cell
        // cy.get('#matrix-container').should('be.visible').trigger('mousemove', {
        //   position: 'topRight',
        // });
        // cy.wait(500);
        // // Move to the last matrix cell
        // cy.get('#matrix-container').should('be.visible').trigger('mousemove', {
        //   position: 'topRight',
        // });
        // cy.wait(500);

        // // Check Matrix tooltip
        // cy.get('.matrix-tooltip-comp').contains(res.matrixTooltip[2]);

        // // Now reverse dimenions
        // cy.get('.hierarchy-select-comp-button').first().click();
        // cy.wait(200);
        // cy.get('.mat-mdc-menu-item').eq(1).click();
      });
    });
  });
});
