import '../support/commands';
import '../utils/utils';
import { initLS } from 'cypress/setups/init-ls';

describe('Behaviors tests for Khiops Covisualization', () => {
  let files = ['DigitCoclustering.json'];
  files.forEach((fileName, fileIndex) => {
    it(`Test unfold hierarchy slider on big datas`, () => {
      // Initialize ls with all views enabled
      initLS();

      //@ts-ignore
      cy.initViews();
      //@ts-ignore
      cy.loadFile('covisualization', fileName);

      // Open unfold Hierarchy view
      cy.get('.button-unfold-hierarchy').click();

      // Reduce hierarchy and check values
      cy.wait(250);

      // force to work on hidden elt
      cy.get('#cy-unfold-value-input').clear({ force: true }).type('378', {
        force: true,
      });
      cy.get('#cy-unfold-value-button').click({
        force: true,
      });
      cy.wait(250);

      // Check table values
      cy.get('#unfold-hierarchy-table').contains('341');
      cy.get('#unfold-hierarchy-table').contains('15');
      cy.get('#unfold-hierarchy-table').contains('22');

      cy.get('.unfold-information-rate').contains('112530');
      cy.get('#unfold-hierarchy-settings').contains('Number of clusters : 378');
      cy.wait(250);

      cy.get('.button-reduce-hierarchy').click();
      cy.wait(250);
      // Check table values
      cy.get('#unfold-hierarchy-table').contains('340');

      cy.get('.unfold-information-rate').contains('112200');
      cy.get('#unfold-hierarchy-settings').contains('Number of clusters : 377');

      cy.get('.button-increase-hierarchy').click();
      cy.wait(250);

      cy.get('.unfold-information-rate').contains('112530');
      cy.get('#unfold-hierarchy-settings').contains('Number of clusters : 378');
    });
  });

  files = ['DigitCoclustering.json'];
  files.forEach((fileName, fileIndex) => {
    it(`Test unfold hierarchy on big datas`, () => {
      // Initialize ls with all views enabled
      initLS();

      //@ts-ignore
      cy.initViews();
      //@ts-ignore
      cy.loadFile('covisualization', fileName);

      // Now we check matrix values
      cy.get('#matrix-selected').trigger('mousemove', {
        position: 'center',
      });
      cy.get('.matrix-tooltip-comp').contains(2496);

      // Open unfold Hierarchy view
      cy.get('.button-unfold-hierarchy').click();

      // Reduce hierarchy and check values
      cy.wait(250);
      // force to work on hidden elt
      cy.get('#cy-unfold-value-input').clear({ force: true }).type('200', {
        force: true,
      });
      cy.get('#cy-unfold-value-button').click({
        force: true,
      });
      cy.wait(250);
      cy.get('.unfold-information-rate').contains('53790');
      cy.get('.unfold-information-rate').contains('92.4%');

      // Reduce hierarchy and check values
      cy.get('#cy-unfold-value-input').clear({ force: true }).type('60', {
        force: true,
      });
      cy.get('#cy-unfold-value-button').click({
        force: true,
      });
      cy.wait(250);
      cy.get('.unfold-information-rate').contains('5746');
      cy.get('.unfold-information-rate').contains('69.8%');

      // Close dialog
      cy.get('.button-confirm-hierarchy').click();

      // Check values
      cy.get('#tree-comp-0').contains('A214');

      // Now we check matrix values
      cy.get('#matrix-selected').trigger('mousemove', {
        position: 'center',
      });
      cy.get('.matrix-tooltip-comp').contains(221);
    });
  });

  files = ['CC_3_Coclustering.json'];
  files.forEach((fileName, fileIndex) => {
    it(`Test dimension change`, () => {
      // Initialize ls with all views enabled
      initLS();

      //@ts-ignore
      cy.initViews();

      //@ts-ignore
      cy.loadFile('covisualization', fileName);

      // Check dimension
      cy.get('.hierarchy-select-comp-button').first().contains('workclass');

      // Check matrix select
      cy.get('.matrix-mode-comp')
        .first()
        .contains(' I (workclass , education) ');

      // Now reverse dimenions
      cy.get('.hierarchy-select-comp-button').first().click();
      cy.wait(500);
      cy.get('.mat-menu-item').eq(2).click();

      // Check that dimension has been changed
      cy.get('.hierarchy-select-comp-button').first().contains('race');

      // Check if matrix select has been updated
      cy.get('.matrix-mode-comp').first().contains(' I (race , education) ');
    });
  });
});
