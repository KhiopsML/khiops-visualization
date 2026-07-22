/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck
import '../../support/commands';
import { pickRandom } from '../../utils/utils';

interface ComponentEntry {
  tab: string;
  subtab?: string;
  id: string;
  setup?: () => void;
  teardown?: () => void;
}

const levelDistributionSetup = () =>
  cy.get('.level-distribution-btn').first().click({ force: true });
const levelDistributionTeardown = () =>
  cy.get('#level-distribution-graph-close-btn').first().click({ force: true });

const allComponents: ComponentEntry[] = [
  // Preparation
  { tab: 'Preparation', id: '#preparation-informations-block-summary' },
  { tab: 'Preparation', id: '#preparation-target-variable-stats' },
  { tab: 'Preparation', id: '#preparation-informations-block-informations' },
  {
    tab: 'Preparation',
    id: '#level-distribution-graph-comp',
    setup: levelDistributionSetup,
    teardown: levelDistributionTeardown,
  },
  { tab: 'Preparation', id: '#preparation-variables-list' },
  { tab: 'Preparation', id: '#distribution-graph0' },
  { tab: 'Preparation', id: '#target-distribution-graph0' },
  { tab: 'Preparation', id: '#preparation-description-block-variable' },
  { tab: 'Preparation', id: '#preparation-description-block-derivation' },
  { tab: 'Preparation', id: '#preparation-current-interval' },

  // Text preparation
  { tab: 'Text preparation', id: '#preparation-informations-block-summary' },
  { tab: 'Text preparation', id: '#preparation-target-variable-stats' },
  {
    tab: 'Text preparation',
    id: '#preparation-informations-block-informations',
  },
  {
    tab: 'Text preparation',
    id: '#level-distribution-graph-comp',
    setup: levelDistributionSetup,
    teardown: levelDistributionTeardown,
  },
  { tab: 'Text preparation', id: '#preparation-variables-list' },
  { tab: 'Text preparation', id: '#distribution-graph0' },
  { tab: 'Text preparation', id: '#target-distribution-graph0' },
  { tab: 'Text preparation', id: '#preparation-description-block-variable' },
  { tab: 'Text preparation', id: '#preparation-description-block-derivation' },
  { tab: 'Text preparation', id: '#preparation-current-interval' },

  // Tree preparation
  {
    tab: 'Tree preparation',
    id: '#tree-preparation-informations-block-summary',
  },
  { tab: 'Tree preparation', id: '#tree-preparation-target-variable-stats' },
  {
    tab: 'Tree preparation',
    id: '#tree-preparation-informations-block-informations',
  },
  {
    tab: 'Tree preparation',
    id: '#level-distribution-graph-comp',
    setup: levelDistributionSetup,
    teardown: levelDistributionTeardown,
  },
  { tab: 'Tree preparation', id: '#tree-preparation-variables-list' },
  { tab: 'Tree preparation', id: '#distribution-graph0' },
  { tab: 'Tree preparation', id: '#target-distribution-graph0' },
  { tab: 'Tree preparation', id: '#target-distribution-graph1' },
  { tab: 'Tree preparation', id: '#tree-preparation-select' },
  { tab: 'Tree preparation', id: '#tree-details-comp' },
  { tab: 'Tree preparation', id: '#tree-preparation-hyper' },
  { tab: 'Tree preparation', subtab: 'Leaf rules', id: '#tree-leaf-rules-comp' },

  // Preparation 2D
  { tab: 'Preparation 2D', id: '#preparation-2d-informations-block-summary' },
  {
    tab: 'Preparation 2D',
    id: '#level-distribution-graph-comp',
    setup: levelDistributionSetup,
    teardown: levelDistributionTeardown,
  },
  { tab: 'Preparation 2D', id: '#preparation-2d-target-variable-stats' },
  { tab: 'Preparation 2D', id: '#preparation-2d-variables-list' },
  { tab: 'Preparation 2D', id: '#cooccurrence-matrix-comp' },
  { tab: 'Preparation 2D', id: '#preparation-2d-target-distribution-graph' },
  { tab: 'Preparation 2D', id: '#preparation-2d-current-cell-x' },
  { tab: 'Preparation 2D', id: '#preparation-2d-current-cell-y' },
  {
    tab: 'Preparation 2D',
    subtab: 'Cells',
    id: '#cooccurrence-matrix-cells-container',
  },

  // Modeling
  { tab: 'Modeling', id: '#modeling-informations-block-summary' },
  { tab: 'Modeling', id: '#modeling-target-variable-stats' },
  { tab: 'Modeling', id: '#modeling-informations-block-informations' },
  { tab: 'Modeling', id: '#modeling-variables-list' },
  { tab: 'Modeling', id: '#distribution-graph0' },
  { tab: 'Modeling', id: '#target-distribution-graph0' },
  { tab: 'Modeling', id: '#preparation-current-interval' },
  {
    tab: 'Modeling',
    id: '#importance-distribution-graph-comp',
    setup: () => cy.get('.level-distribution-btn').eq(1).click({ force: true }),
    teardown: () =>
      cy.get('#importance-distribution-graph-close-btn').first().click({ force: true }),
  },

  // Evaluation
  { tab: 'Evaluation', id: '#evaluation-types-summary' },
  { tab: 'Evaluation', id: '#evaluation-predictor-evaluations' },
  { tab: 'Evaluation', id: '#evaluation-lift-curves' },
  { tab: 'Evaluation', id: '#evaluation-confusion-matrix' },

  // Project
  { tab: 'Project', id: '#project-summary-comp' },
  { tab: 'Project', id: '#project-logs' },
];

describe('Copy images Test Plan for Khiops Visualization', () => {
  const files = ['ALLREPORTS_Std_Iris_AnalysisResults.khj'];

  files.forEach((fileName) => {
    it(`Check values for ${fileName}`, () => {

      cy.loadFile('visualization', fileName);

      cy.readFile('./src/assets/mocks/kv/' + fileName).then(() => {
        // Create spy once for all screenshot tests
        cy.window().then((win) => {
          cy.spy(win, 'fetch').as('fetchSpy');
        });

        const toTest = pickRandom(allComponents, 10);

        toTest.forEach(({ tab, subtab, id, setup, teardown }) => {
          cy.get(`.mat-mdc-tab:contains("${tab}")`).first().click();
          if (subtab) {
            cy.get(`.mat-mdc-tab:contains("${subtab}")`).first().click();
          }
          if (setup) setup();
          cy.testComponentScreenshot(id, tab);
          if (teardown) teardown();
        });
      });
    });
  });
});
