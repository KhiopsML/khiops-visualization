// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// When a command from ./commands is ready to use, import with `import './commands'` syntax
import './commands';

// Global setup: Set number precision to 8 for all tests
beforeEach(() => {
  // Ensure number precision is set to 8 before every test
  cy.setGlobalSetting('SETTING_NUMBER_PRECISION', 8);
  cy.setGlobalAutoScale(true);
});

declare global {
  namespace Cypress {
    interface Chainable {
      loadFile(ctx: string, file: string): Chainable<Element>;
      initViews(): Chainable<Element>;
      checkCanvasIsNotEmpty(canvasSelector: string): Chainable<Element>;
      setGlobalSetting(settingKey: string, value: any): Chainable<Element>;
      setGlobalAutoScale(value: boolean): Chainable<Element>;
      testComponentCopyDatas(
        id: string,
        mockFileName: string,
      ): Chainable<Element>;
      testComponentScreenshot(id: string): Chainable<Element>;
    }
  }
}
