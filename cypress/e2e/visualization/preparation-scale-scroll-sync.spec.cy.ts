/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck

import '../../support/commands';

describe('Preparation graph scale and synchronized scroll', () => {
  it('shows horizontal scrollbar after scale change and syncs scroll between graphs', () => {
    cy.initViews();
    cy.loadFile('visualization', 'C100_AllReports.json');

    cy.get('.mat-mdc-tab:contains("Preparation")', { timeout: 20000 })
      .first()
      .click();

    cy.get('#preparation-variables-list', { timeout: 20000 }).should(
      'be.visible',
    );

    cy.get('#preparation-variables-list .ag-row-selected').then(
      ($selectedRows) => {
        if ($selectedRows.length === 0) {
          cy.get('#preparation-variables-list .ag-row').first().click({
            force: true,
          });
        }
      },
    );

    cy.get('#distribution-chart-0', { timeout: 20000 }).should('be.visible');
    cy.get('#target-distribution-chart-0', { timeout: 20000 }).should(
      'be.visible',
    );

    cy.get('mat-slider[aria-label="Update graph scale"] input[type="range"]')
      .first()
      .then(($input) => {
        const input = $input[0] as HTMLInputElement;
        input.value = '400';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });

    const distributionScroller = '#distribution-graph0 .chart-comp';
    const targetScroller = '#target-distribution-graph0 .chart-comp';

    cy.get(distributionScroller).should(($el) => {
      const node = $el[0] as HTMLElement;
      expect(node.scrollWidth).to.be.greaterThan(node.clientWidth);
    });

    cy.get(targetScroller).should(($el) => {
      const node = $el[0] as HTMLElement;
      expect(node.scrollWidth).to.be.greaterThan(node.clientWidth);
    });

    cy.get(distributionScroller).then(($distribution) => {
      const distributionNode = $distribution[0] as HTMLElement;
      distributionNode.scrollLeft = 600;
      distributionNode.dispatchEvent(new Event('scroll', { bubbles: true }));
    });

    cy.get(distributionScroller).then(($distribution) => {
      const distributionScrollLeft = ($distribution[0] as HTMLElement).scrollLeft;

      cy.get(targetScroller).should(($target) => {
        const targetScrollLeft = ($target[0] as HTMLElement).scrollLeft;
        expect(Math.abs(distributionScrollLeft - targetScrollLeft)).to.be.at.most(
          2,
        );
      });
    });

    cy.get(targetScroller).then(($target) => {
      const targetNode = $target[0] as HTMLElement;
      targetNode.scrollLeft = 950;
      targetNode.dispatchEvent(new Event('scroll', { bubbles: true }));
    });

    cy.get(targetScroller).then(($target) => {
      const targetScrollLeft = ($target[0] as HTMLElement).scrollLeft;

      cy.get(distributionScroller).should(($distribution) => {
        const distributionScrollLeft = ($distribution[0] as HTMLElement)
          .scrollLeft;
        expect(Math.abs(distributionScrollLeft - targetScrollLeft)).to.be.at.most(
          2,
        );
      });
    });
  });
});
