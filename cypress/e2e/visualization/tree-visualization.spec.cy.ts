/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck
import '../../support/commands';

describe('Tree visualization Test for Khiops Visualization', () => {
  const files = ['tree-education_AllReports.json'];

  files.forEach((fileName) => {
    it(`Check values for ${fileName}`, () => {
      cy.loadFile('visualization', fileName);

      cy.readFile('./src/assets/mocks/kv/' + fileName).then(() => {
        cy.get('.mat-mdc-tab:contains("Tree")').first().click();

        cy.get('#tree-preparation-informations-block-summary').contains(
          'Classification',
        );
        // cy.get('#tree-preparation-target-variable-stats').contains('1st');
        cy.get('#tree-preparation-informations-block-informations').contains(
          'Informative',
        );

        cy.get('#tree-preparation-variables-list')
          .find('.ag-row:eq(0)')
          .should('have.class', 'ag-row-selected');

        cy.get('#tree-preparation-variables-list').contains('Tree_1');

        cy.get('#tree-select-comp').contains('L61');

        cy.get('#tree-leaf-L61')
          .find('div.tree-leaf-content.tree-selected')
          .should('exist');

        cy.get('#tree-details-comp').contains('L61');
        cy.get('#tree-details-comp').contains('L91');
        cy.get('#tree-details-comp').contains('L35');
        cy.get('#tree-details-comp').contains('L40');
        cy.get('#tree-details-comp')
          .find('.ag-row:eq(0)')
          .should('have.class', 'ag-row-selected');

        cy.get('#target-distribution-chart-0').should('exist');
        cy.get('#distribution-chart-0').should('exist');
        cy.get('#target-distribution-chart-1').should('exist');

        cy.get(
          '#tree-preparation-hyper .tree-hyper-selection #tree-hyper-selection-comp',
        ).contains('0.38');
        cy.get(
          '#tree-preparation-hyper .tree-hyper-selection #tree-hyper-selection-comp',
        ).contains('3790');

        cy.contains('.leaf-tab-btn:visible', 'Leaf rules').click();

        cy.get('#tree-leaf-rules-comp').contains('workclass');
        cy.get('#tree-leaf-rules-comp').contains('Craft');

        cy.get('#hyperTree').should('exist');

        cy.get('#hyperTree').find('circle').should('have.length', 242);

        cy.get('.mat-mdc-tab:contains("Modeling")').first().click();
        cy.checkCanvasIsNotEmpty('#distribution-chart-0');

        cy.get('#modeling-variables-list').find('.ag-row:eq(3)').click();

        cy.get('#modeling-variables-list').find('.ag-row:eq(0)').click();
        cy.checkCanvasIsNotEmpty('#distribution-chart-0');
      });
    });
  });
});

describe('Tree preparation target distribution selection', () => {
  const selectedTreeNodes = '#tree-select-comp .tree-leaf-content.tree-selected';
  const hyperSelection = '#tree-preparation-hyper .tree-hyper-selection';
  const leafChart = '#target-distribution-chart-1';
  const lastBarIndex = 7;

  function getChart(canvas: HTMLCanvasElement) {
    return canvas.closest('kl-chart').componentInstance.chartManagerService.getChart();
  }

  function clickBar(canvasSelector: string, index: number) {
    cy.get(canvasSelector)
      .scrollIntoView()
      .should('be.visible')
      .should(($canvas) => {
        const chart = getChart($canvas[0]);
        expect(chart.data.labels.length).to.be.greaterThan(index);
        expect(chart.getDatasetMeta(0).data[index].width).to.be.greaterThan(0);
      })
      .then(($canvas) => {
        const canvas = $canvas[0] as HTMLCanvasElement;
        const chart = getChart(canvas);
        const bar = chart.data.datasets
          .map((dataset, datasetIndex) => chart.getDatasetMeta(datasetIndex).data[index])
          .find((element) => element && Math.abs(element.base - element.y) > 1);
        expect(bar, 'nonempty bar to click').to.exist;
        const bounds = canvas.getBoundingClientRect();

        cy.wrap($canvas).click(
          bar.x * bounds.width / chart.width,
          (bar.y + bar.base) / 2 * bounds.height / chart.height,
        );
      });
  }

  function nodeIds(elements: JQuery<HTMLElement>) {
    return Array.from(elements, (element) => element.closest('[id^="tree-leaf-"]').id)
      .sort();
  }

  function leafDistribution(canvas: HTMLCanvasElement) {
    return getChart(canvas).data.datasets.map((dataset) => Array.from(dataset.data));
  }

  it('restores all tree views when the eighth and last target bar is clicked after another graph changes selection', () => {
    cy.loadFile('visualization', 'accidents.json');
    cy.contains('.mat-mdc-tab', 'Tree preparation').click();
    cy.checkCanvasIsNotEmpty('#target-distribution-chart-0');
    cy.get('#target-distribution-chart-0').should(($canvas) => {
      expect(getChart($canvas[0]).data.labels).to.have.length(lastBarIndex + 1);
    });

    clickBar('#target-distribution-chart-0', lastBarIndex);
    cy.get(selectedTreeNodes).should('have.length.greaterThan', 0);
    cy.get(`${hyperSelection} .lineage-chip.current`).should('not.be.empty');
    cy.checkCanvasIsNotEmpty(leafChart);

    cy.get(selectedTreeNodes).then(($nodes) => {
      const expectedNodeIds = nodeIds($nodes);

      cy.get(hyperSelection).invoke('text').then((expectedHyperText) => {
        cy.get(leafChart).then(($canvas) => {
          const expectedDistribution = leafDistribution($canvas[0]);

          clickBar('#distribution-chart-0', 0);
          cy.get(selectedTreeNodes).should(($changedNodes) => {
            expect(nodeIds($changedNodes)).not.to.deep.equal(expectedNodeIds);
          });
          cy.get(hyperSelection).should(($selection) => {
            expect($selection.text()).not.to.equal(expectedHyperText);
          });
          cy.get(leafChart).should(($changedCanvas) => {
            expect(leafDistribution($changedCanvas[0])).not.to.deep.equal(expectedDistribution);
          });

          clickBar('#target-distribution-chart-0', lastBarIndex);

          cy.get(selectedTreeNodes).should(($restoredNodes) => {
            expect(nodeIds($restoredNodes)).to.deep.equal(expectedNodeIds);
          });
          cy.get(hyperSelection).should(($selection) => {
            expect($selection.text()).to.equal(expectedHyperText);
          });
          cy.get(leafChart).should(($restoredCanvas) => {
            expect(leafDistribution($restoredCanvas[0])).to.deep.equal(expectedDistribution);
          });
          cy.checkCanvasIsNotEmpty(leafChart);
          cy.get('#tree-preparation-variables-list .ag-row-selected').should('have.length', 1);
        });
      });
    });
  });
});
