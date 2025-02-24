import '../support/commands';
import '../utils/utils';
import { initLS } from 'cypress/setups/init-ls';

describe('Behaviors tests for Khiops Covisualization', () => {
  let files = ['DigitCoclustering.json'];
  // files.forEach((fileName, fileIndex) => {
  //   it(`Test unfold hierarchy slider on big datas and hierarchy checkboxes`, () => {
  //     // Initialize ls with all views enabled
  //     initLS();

  //     //@ts-ignore
  //     cy.initViews();
  //     //@ts-ignore
  //     cy.loadFile('covisualization', fileName);

  //     // Open unfold Hierarchy view
  //     cy.get('.button-unfold-hierarchy').click();

  //     // Reduce hierarchy and check values
  //     cy.wait(250);

  //     // force to work on hidden elt
  //     cy.get('#cy-unfold-value-input').clear({ force: true }).type('20', {
  //       force: true,
  //     });
  //     cy.wait(250);

  //     cy.get('#cy-unfold-value-button').click({
  //       force: true,
  //     });
  //     cy.wait(250);
  //     cy.get('.button-reduce-hierarchy').click();
  //     cy.wait(250);

  //     cy.get('kl-checkbox-cell').first().find('input').click({ force: true });
  //     cy.wait(250);

  //     // Close dialog
  //     cy.get('.button-confirm-hierarchy').click();

  //     // Open statistics panels
  //     cy.get('.hierarchy-infos-button').eq(0).click({ force: true });
  //     cy.get('.hierarchy-infos-button').eq(1).click({ force: true });
  //     cy.wait(250);

  //     // Check values
  //     cy.get('.hierarchy-select-comp').eq(0).contains('473');
  //     cy.get('.hierarchy-select-comp').eq(0).contains('19275');

  //     cy.get('.hierarchy-select-comp').eq(1).contains(']-inf;9.5]');
  //     cy.get('.hierarchy-select-comp').eq(1).contains('623752');
  //   });

  //   it(`Test unfold hierarchy slider on big datas`, () => {
  //     // Initialize ls with all views enabled
  //     initLS();

  //     //@ts-ignore
  //     cy.initViews();
  //     //@ts-ignore
  //     cy.loadFile('covisualization', fileName);

  //     // Open unfold Hierarchy view
  //     cy.get('.button-unfold-hierarchy').click();

  //     // Reduce hierarchy and check values
  //     cy.wait(250);

  //     // force to work on hidden elt
  //     cy.get('#cy-unfold-value-input').clear({ force: true }).type('378', {
  //       force: true,
  //     });
  //     cy.get('#cy-unfold-value-button').click({
  //       force: true,
  //     });
  //     cy.wait(250);

  //     // Check table values
  //     cy.get('#unfold-hierarchy-table').contains('341');
  //     cy.get('#unfold-hierarchy-table').contains('15');
  //     cy.get('#unfold-hierarchy-table').contains('22');

  //     cy.get('.unfold-information-rate').contains('112530');
  //     cy.get('#unfold-hierarchy-settings').contains('Number of clusters : 378');
  //     cy.wait(250);

  //     cy.get('.button-reduce-hierarchy').click();
  //     cy.wait(250);
  //     // Check table values
  //     cy.get('#unfold-hierarchy-table').contains('340');

  //     cy.get('.unfold-information-rate').contains('112200');
  //     cy.get('#unfold-hierarchy-settings').contains('Number of clusters : 377');

  //     cy.get('.button-increase-hierarchy').click();
  //     cy.wait(250);

  //     cy.get('.unfold-information-rate').contains('112530');
  //     cy.get('#unfold-hierarchy-settings').contains('Number of clusters : 378');
  //   });
  // });

  // files = ['DigitCoclustering.json'];
  // files.forEach((fileName, fileIndex) => {
  //   it(`Test unfold hierarchy on big datas`, () => {
  //     // Initialize ls with all views enabled
  //     initLS();

  //     //@ts-ignore
  //     cy.initViews();
  //     //@ts-ignore
  //     cy.loadFile('covisualization', fileName);

  //     // Now we check matrix values
  //     cy.get('#matrix-selected').should('be.visible').trigger('mousemove', {
  //       position: 'center',
  //     });
  //     cy.wait(500);
  //     cy.get('.matrix-tooltip-comp').contains(2496);

  //     // Open unfold Hierarchy view
  //     cy.get('.button-unfold-hierarchy').click();

  //     // Reduce hierarchy and check values
  //     cy.wait(250);
  //     // force to work on hidden elt
  //     cy.get('#cy-unfold-value-input').clear({ force: true }).type('200', {
  //       force: true,
  //     });
  //     cy.get('#cy-unfold-value-button').click({
  //       force: true,
  //     });
  //     cy.wait(250);
  //     cy.get('.unfold-information-rate').contains('53790');
  //     cy.get('.unfold-information-rate').contains('92.4%');

  //     // Reduce hierarchy and check values
  //     cy.get('#cy-unfold-value-input').clear({ force: true }).type('60', {
  //       force: true,
  //     });
  //     cy.get('#cy-unfold-value-button').click({
  //       force: true,
  //     });
  //     cy.wait(250);
  //     cy.get('.unfold-information-rate').contains('5746');
  //     cy.get('.unfold-information-rate').contains('69.8%');

  //     // Close dialog
  //     cy.get('.button-confirm-hierarchy').click();

  //     // Check values
  //     cy.get('#tree-comp-0').contains('A214');

  //     cy.wait(500);

  //     // Now we check matrix values
  //     cy.get('#matrix-selected').should('be.visible').trigger('mousemove', {
  //       position: 'bottomRight',
  //     });
  //     cy.wait(500);
  //     cy.get('.matrix-tooltip-comp').contains(23);
  //   });
  // });

  // files = ['CC_3_Coclustering.json'];
  // files.forEach((fileName, fileIndex) => {
  //   it(`Test dimension change`, () => {
  //     // Initialize ls with all views enabled
  //     initLS();

  //     //@ts-ignore
  //     cy.initViews();

  //     //@ts-ignore
  //     cy.loadFile('covisualization', fileName);

  //     // Check dimension
  //     cy.get('.hierarchy-select-comp-button').first().contains('workclass');

  //     // Check matrix select
  //     cy.get('.matrix-mode-comp')
  //       .first()
  //       .contains(' I (workclass , education) ');

  //     // Now reverse dimenions
  //     cy.get('.hierarchy-select-comp-button').first().click();
  //     cy.wait(500);
  //     cy.get('.mat-mdc-menu-item').eq(2).click();

  //     // Check that dimension has been changed
  //     cy.get('.hierarchy-select-comp-button').first().contains('race');

  //     // Check if matrix select has been updated
  //     cy.get('.matrix-mode-comp').first().contains(' I (race , education) ');
  //   });
  // });

  files = ['CC_3_Coclustering.json'];
  files.forEach((fileName, fileIndex) => {
    it(`Test behaviors clicks`, () => {
      // Initialize ls with all views enabled
      initLS();

      //@ts-ignore
      cy.initViews();

      //@ts-ignore
      cy.loadFile('covisualization', fileName);

      // ### Collapse and select a node
      cy.get('#tree-expando-8').first().click();

      // Check values
      cy.get('#tree-expando-8')
        .parent()
        .then((parent) => {
          cy.wrap(parent).should('have.class', 'selected');
        });
      cy.get('#cluster-details-grid-0').contains('A10');
      cy.get('#tree-expando-8')
        .parent()
        .then((parent) => {
          cy.wrap(parent).should('have.class', 'selected');
        });

      cy.get('#cluster-details-grid-0 [row-id="3"]').then((element) => {
        cy.wrap(element).should('have.class', 'ag-row-selected');
      });

      cy.get('#cluster-composition-0').contains('A10');
      cy.get('.annotation-comp').first().contains('A10');
      cy.get('#cluster-distribution-1').contains('A10');
      cy.get('#matrix-selected').should('be.visible').trigger('mousemove', {
        position: 'bottomRight',
      });
      cy.get('.matrix-tooltip-comp').contains('A10');
      cy.get('#selected-clusters-grid').contains('A10');

      // ### Click on matrix cell
      cy.get('#matrix-selected')
        .should('be.visible')
        .trigger('mousemove', {
          position: 'topLeft',
        })
        .click(10, 10, { force: true });

      // Check values
      cy.get('.matrix-tooltip-comp').contains('Private');
      cy.get('#cluster-distribution-1').contains('Private');
      cy.get('#selected-clusters-grid').contains('Private');
      cy.get('#cluster-composition-0').contains('Private');
      cy.get('.annotation-comp').first().contains('Private');

      // ### Click on first cluster
      cy.get('#cluster-details-grid-0 [row-id="1"]')
        .first()
        .click({ force: true });

      // Check values
      cy.get('#tree-expando-0')
        .parent()
        .then((parent) => {
          cy.wrap(parent).should('have.class', 'selected');
        });
      cy.get('#cluster-composition-0').contains('Self');
      cy.get('.annotation-comp').first().contains('Self');
    });
  });
});
