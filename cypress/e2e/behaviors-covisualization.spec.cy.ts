import '../support/commands';
import '../utils/utils';
import { initLS } from 'cypress/setups/init-ls';

describe('Behaviors tests for Khiops Covisualization', () => {
  let files = ['DigitCoclustering.json'];
  files.forEach((fileName, fileIndex) => {
    it(`Test unfold hierarchy on big datas`, () => {
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
      cy.get('#cy-unfold-value-input').clear({ force: true }).type('200', {
        force: true,
      });
      cy.get('#cy-unfold-value-button').click({
        force: true,
      });
      cy.wait(250);
      cy.get('.unfold-information-rate').contains('53790');
      cy.get('.unfold-information-rate').contains('92.5%');

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

      // Check that node has been folded
      cy.get('#tree-comp-1')
        .find('#tree-leaf-2')
        .parent()
        .should('have.css', 'display', 'none');
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
