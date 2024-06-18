import { setupAxisTests } from 'cypress/setups/axis-tests';
import { initLS } from 'cypress/setups/init-ls';
import '../support/commands';
import '../utils/utils';
import { setupContextTests } from 'cypress/setups/context-tests';
import { setupHierarchyTests } from 'cypress/setups/hierarchy-tests';

describe('Test Khiops Covisualization sample files', () => {
  const files = [
    'co-IrisMissing.json',
    'mushroom.json',
    'irismissing.json',
    'v4.json',
    'AdultSmall.json',
    'Coclustering-100x100.json',
    'cc.json',
    'Co-simple-2vars.json',
    'Coclustering-6.json',
    'Coclustering-4.json',
    'adult2var.json',
    'sample3.json',
    'DataNoisyCorrelatedN1000000_C1000_V10_L5Coclustering.json',
    'sample0.json',
    'adultmissing.json',
    'SimplifiedCoclusteringIrisOldFormat_BugUndefined.json',
    'h-Coclustering.json',
    'zero-except.json',
    '10.1.1_id_feat_nospace_Coclustering.json',
    'co-3-num.json',
    'ext-CC_Coclustering.json',
    'ext-datas_Coclustering.json',
    'ext-CC_Coclustering.json',
    'CC_3_Coclustering.json',

    //
    //
    // TOO BIG Files
    // "NovaCoclustering4mb.json",
    // "DigitCoclustering.json",
    // "WebSpamCoclustering18mb.json",
    // "VerbNounCoclustering27mo.json",
  ];

  files.forEach((fileName, fileIndex) => {
    it(`Check values for ${fileName}`, () => {
      // Initialize ls with all views enabled
      initLS();

      //@ts-ignore
      cy.initViews();

      //@ts-ignore
      cy.loadFile('covisualization', fileName);

      cy.readFile('./src/assets/mocks/kc/' + fileName).then((datas) => {
        const testsValues = {
          Axis: [],
          Context: [],
        };

        const testView = ['Axis'];

        setupAxisTests(datas, testsValues, fileName);

        if (datas.coclusteringReport?.dimensionSummaries?.length > 2) {
          testView.push('Context');
          setupContextTests(datas, testsValues, fileName);
        }

        testView.forEach((view) => {
          cy.get('.mat-tab-label:contains("' + view + '")')
            .first()
            .click();

          let testValue = testsValues[view];

          if (testValue) {
            testValue.forEach((test) => {
              if (test) {
                cy.contains(test);
              }
            });
          }
        });

        cy.get('.mat-flat-button:contains("timeline")').first().click();

        const hierarchyTests = setupHierarchyTests(datas);

        hierarchyTests.forEach((test) => {
          if (test) {
            cy.contains(test);
          }
        });
      });
    });
  });
});
