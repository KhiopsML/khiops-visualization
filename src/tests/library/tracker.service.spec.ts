// @ts-nocheck

/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { of } from 'rxjs';
import { TrackerService } from '@khiops-library/providers/tracker.service';
import { LS } from '@khiops-library/enum/ls';

/**
 * Unit tests for TrackerService
 * Tests cover cookie consent management and event tracking functionality
 */
describe('TrackerService', () => {
  let service: TrackerService;
  let mockLsService: any;
  let mockConfigService: any;
  let mockTranslateService: any;
  let mockDialog: any;
  let mockDialogRef2: any;
  let mockNgZone: any;
  let mockDialogRef: any;
  let mockConfig: any;

  beforeEach(() => {
    // Create mock services
    mockLsService = {
      get: jasmine.createSpy('get'),
      set: jasmine.createSpy('set'),
    };

    mockConfigService = {
      getConfig: jasmine.createSpy('getConfig'),
    };

    mockTranslateService = {
      get: jasmine.createSpy('get').and.returnValue('mocked translation'),
    };

    mockDialogRef = {
      afterClosed: jasmine
        .createSpy('afterClosed')
        .and.returnValue(of('confirm')),
      updatePosition: jasmine.createSpy('updatePosition'),
      componentInstance: {
        message: '',
        displayRejectBtn: false,
        displayCancelBtn: false,
        confirmTranslation: '',
      },
    };

    mockDialog = {
      open: jasmine.createSpy('open').and.returnValue(mockDialogRef),
      closeAll: jasmine.createSpy('closeAll'),
    };

    mockDialogRef2 = {
      open: jasmine.createSpy('open').and.returnValue(mockDialogRef),
      closeAll: jasmine.createSpy('closeAll'),
    };

    mockNgZone = {
      run: jasmine.createSpy('run').and.callFake((fn: Function) => fn()),
    };

    mockConfig = {
      onSendEvent: jasmine.createSpy('onSendEvent'),
    };

    mockConfigService.getConfig.and.returnValue(mockConfig);

    // Create service instance with mocked dependencies
    service = new TrackerService(
      mockLsService,
      mockDialogRef2,
      mockNgZone,
      mockConfigService,
      mockDialog,
      mockTranslateService,
    );
  });

  /**
   * Test service initialization
   */
  describe('Service Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  });

  /**
   * Test getCookieStatus method
   */
  describe('getCookieStatus', () => {
    it('should return true when cookie consent is "true"', () => {
      mockLsService.get.and.returnValue('true');

      const result = service.getCookieStatus();

      expect(result).toBe(true);
      expect(mockLsService.get).toHaveBeenCalledWith(LS.COOKIE_CONSENT);
    });

    it('should return false when cookie consent is "false"', () => {
      mockLsService.get.and.returnValue('false');

      const result = service.getCookieStatus();

      expect(result).toBe(false);
      expect(mockLsService.get).toHaveBeenCalledWith(LS.COOKIE_CONSENT);
    });

    it('should return true when cookie consent is boolean true', () => {
      mockLsService.get.and.returnValue(true);

      const result = service.getCookieStatus();

      expect(result).toBe(true);
      expect(mockLsService.get).toHaveBeenCalledWith(LS.COOKIE_CONSENT);
    });

    it('should return false when cookie consent is boolean false', () => {
      mockLsService.get.and.returnValue(false);

      const result = service.getCookieStatus();

      expect(result).toBe(false);
      expect(mockLsService.get).toHaveBeenCalledWith(LS.COOKIE_CONSENT);
    });

    it('should return undefined when cookie consent is not set', () => {
      mockLsService.get.and.returnValue(undefined);

      const result = service.getCookieStatus();

      expect(result).toBeUndefined();
      expect(mockLsService.get).toHaveBeenCalledWith(LS.COOKIE_CONSENT);
    });

    it('should return undefined when cookie consent is null', () => {
      mockLsService.get.and.returnValue(null);

      expect(() => service.getCookieStatus()).toThrow();
      expect(mockLsService.get).toHaveBeenCalledWith(LS.COOKIE_CONSENT);
    });

    it('should return false when cookie consent is empty string', () => {
      mockLsService.get.and.returnValue('');

      const result = service.getCookieStatus();

      expect(result).toBe(false);
      expect(mockLsService.get).toHaveBeenCalledWith(LS.COOKIE_CONSENT);
    });

    it('should return false when cookie consent is any other string', () => {
      mockLsService.get.and.returnValue('maybe');

      const result = service.getCookieStatus();

      expect(result).toBe(false);
      expect(mockLsService.get).toHaveBeenCalledWith(LS.COOKIE_CONSENT);
    });
  });

  /**
   * Test initTracker method
   */
  describe('initTracker', () => {
    it('should show cookie consent dialog when cookie status is undefined', () => {
      mockLsService.get.and.returnValue(undefined);
      spyOn(service, 'showCookieConsentDialog');

      service.initTracker();

      expect(service.showCookieConsentDialog).toHaveBeenCalled();
      expect(mockConfig.onSendEvent).not.toHaveBeenCalled();
    });

    it('should send forgetConsentGiven event when user has refused cookies', () => {
      mockLsService.get.and.returnValue('false');

      service.initTracker();

      expect(mockConfig.onSendEvent).toHaveBeenCalledWith({
        message: 'forgetConsentGiven',
      });
    });

    it('should send setConsentGiven event when user has accepted cookies', () => {
      mockLsService.get.and.returnValue('true');

      service.initTracker();

      expect(mockConfig.onSendEvent).toHaveBeenCalledWith({
        message: 'setConsentGiven',
      });
    });

    it('should handle boolean false cookie status', () => {
      mockLsService.get.and.returnValue(false);

      service.initTracker();

      expect(mockConfig.onSendEvent).toHaveBeenCalledWith({
        message: 'forgetConsentGiven',
      });
    });

    it('should handle boolean true cookie status', () => {
      mockLsService.get.and.returnValue(true);

      service.initTracker();

      expect(mockConfig.onSendEvent).toHaveBeenCalledWith({
        message: 'setConsentGiven',
      });
    });

    it('should not send events when onSendEvent is not available', () => {
      mockConfig.onSendEvent = undefined;
      mockLsService.get.and.returnValue('true');

      expect(() => service.initTracker()).not.toThrow();
    });
  });

  /**
   * Test showCookieConsentDialog method
   */
  describe('showCookieConsentDialog', () => {
    beforeEach(() => {
      mockTranslateService.get.and.callFake((key: string) => {
        const translations: any = {
          'COOKIE_CONSENT.MESSAGE': 'We use cookies to improve your experience',
          'COOKIE_CONSENT.ALLOW': 'Allow cookies',
        };
        return translations[key] || key;
      });
    });

    it('should create and configure dialog correctly', () => {
      service.showCookieConsentDialog();

      expect(mockNgZone.run).toHaveBeenCalled();
      expect(mockDialogRef2.closeAll).toHaveBeenCalled();
      expect(mockDialog.open).toHaveBeenCalledWith(
        jasmine.any(Function),
        jasmine.objectContaining({
          width: '400px',
          hasBackdrop: false,
          disableClose: false,
        }),
      );
    });

    it('should position dialog at bottom right', () => {
      service.showCookieConsentDialog();

      expect(mockDialogRef.updatePosition).toHaveBeenCalledWith({
        bottom: '50px',
        right: '50px',
      });
    });

    it('should configure dialog component properties', () => {
      service.showCookieConsentDialog();

      expect(mockDialogRef.componentInstance.message).toBe(
        'We use cookies to improve your experience',
      );
      expect(mockDialogRef.componentInstance.displayRejectBtn).toBe(true);
      expect(mockDialogRef.componentInstance.displayCancelBtn).toBe(false);
      expect(mockDialogRef.componentInstance.confirmTranslation).toBe(
        'Allow cookies',
      );
      expect(mockTranslateService.get).toHaveBeenCalledWith(
        'COOKIE_CONSENT.MESSAGE',
      );
      expect(mockTranslateService.get).toHaveBeenCalledWith(
        'COOKIE_CONSENT.ALLOW',
      );
    });

    it('should handle confirm dialog result correctly', () => {
      mockDialogRef.afterClosed.and.returnValue(of('confirm'));
      spyOn(service, 'trackEvent');

      service.showCookieConsentDialog();

      expect(mockLsService.set).toHaveBeenCalledWith(LS.COOKIE_CONSENT, 'true');
      expect(service.trackEvent).toHaveBeenCalledWith('cookie_consent', 'true');
      expect(mockConfig.onSendEvent).toHaveBeenCalledWith({
        message: 'setConsentGiven',
      });
    });

    it('should handle reject dialog result correctly', () => {
      mockDialogRef.afterClosed.and.returnValue(of('reject'));
      spyOn(service, 'trackEvent');

      service.showCookieConsentDialog();

      expect(mockLsService.set).toHaveBeenCalledWith(
        LS.COOKIE_CONSENT,
        'false',
      );
      expect(service.trackEvent).toHaveBeenCalledWith(
        'cookie_consent',
        'false',
      );
      expect(mockConfig.onSendEvent).toHaveBeenCalledWith({
        message: 'forgetConsentGiven',
      });
    });

    it('should handle any other dialog result as rejection', () => {
      mockDialogRef.afterClosed.and.returnValue(of('cancel'));
      spyOn(service, 'trackEvent');

      service.showCookieConsentDialog();

      expect(mockLsService.set).toHaveBeenCalledWith(
        LS.COOKIE_CONSENT,
        'false',
      );
      expect(service.trackEvent).toHaveBeenCalledWith(
        'cookie_consent',
        'false',
      );
      expect(mockConfig.onSendEvent).toHaveBeenCalledWith({
        message: 'forgetConsentGiven',
      });
    });

    it('should handle null dialog result as rejection', () => {
      mockDialogRef.afterClosed.and.returnValue(of(null));
      spyOn(service, 'trackEvent');

      service.showCookieConsentDialog();

      expect(mockLsService.set).toHaveBeenCalledWith(
        LS.COOKIE_CONSENT,
        'false',
      );
      expect(service.trackEvent).toHaveBeenCalledWith(
        'cookie_consent',
        'false',
      );
      expect(mockConfig.onSendEvent).toHaveBeenCalledWith({
        message: 'forgetConsentGiven',
      });
    });

    it('should handle missing onSendEvent gracefully', () => {
      mockConfig.onSendEvent = undefined;
      mockDialogRef.afterClosed.and.returnValue(of('confirm'));
      spyOn(service, 'trackEvent');

      expect(() => service.showCookieConsentDialog()).not.toThrow();
      expect(mockLsService.set).toHaveBeenCalledWith(LS.COOKIE_CONSENT, 'true');
      expect(service.trackEvent).toHaveBeenCalledWith('cookie_consent', 'true');
    });
  });

  /**
   * Test trackEvent method
   */
  describe('trackEvent', () => {
    it('should track event with all parameters', () => {
      const category = 'user_interaction';
      const action = 'click';
      const name = 'button_1';
      const value = { id: 123 };

      service.trackEvent(category, action, name, value);

      expect(mockConfig.onSendEvent).toHaveBeenCalledWith({
        message: 'trackEvent',
        data: {
          category: category,
          action: action,
          name: name,
          value: value,
        },
      });
    });

    it('should track event with only required parameters', () => {
      const category = 'page_view';
      const action = 'load';

      service.trackEvent(category, action);

      expect(mockConfig.onSendEvent).toHaveBeenCalledWith({
        message: 'trackEvent',
        data: {
          category: category,
          action: action,
          name: undefined,
          value: undefined,
        },
      });
    });

    it('should track event with name but no value', () => {
      const category = 'form';
      const action = 'submit';
      const name = 'contact_form';

      service.trackEvent(category, action, name);

      expect(mockConfig.onSendEvent).toHaveBeenCalledWith({
        message: 'trackEvent',
        data: {
          category: category,
          action: action,
          name: name,
          value: undefined,
        },
      });
    });

    it('should handle null and undefined values', () => {
      service.trackEvent('test', 'action', null, undefined);

      expect(mockConfig.onSendEvent).toHaveBeenCalledWith({
        message: 'trackEvent',
        data: {
          category: 'test',
          action: 'action',
          name: null,
          value: undefined,
        },
      });
    });

    it('should handle empty strings', () => {
      service.trackEvent('', '', '', '');

      expect(mockConfig.onSendEvent).toHaveBeenCalledWith({
        message: 'trackEvent',
        data: {
          category: '',
          action: '',
          name: '',
          value: '',
        },
      });
    });

    it('should handle complex value objects', () => {
      const complexValue = {
        nested: { key: 'value' },
        array: [1, 2, 3],
        boolean: true,
        number: 42,
      };

      service.trackEvent('complex', 'test', 'data', complexValue);

      expect(mockConfig.onSendEvent).toHaveBeenCalledWith({
        message: 'trackEvent',
        data: {
          category: 'complex',
          action: 'test',
          name: 'data',
          value: complexValue,
        },
      });
    });

    it('should not throw when onSendEvent is not available', () => {
      mockConfig.onSendEvent = undefined;

      expect(() => service.trackEvent('test', 'action')).not.toThrow();
    });
  });

  /**
   * Integration tests
   */
  describe('Integration Tests', () => {
    it('should complete full flow from initTracker to dialog interaction', () => {
      // Setup: no existing cookie consent
      mockLsService.get.and.returnValue(undefined);
      mockDialogRef.afterClosed.and.returnValue(of('confirm'));
      spyOn(service, 'trackEvent');

      // Act: initialize tracker
      service.initTracker();

      // Assert: dialog was shown and user accepted
      expect(mockDialog.open).toHaveBeenCalled();
      expect(mockLsService.set).toHaveBeenCalledWith(LS.COOKIE_CONSENT, 'true');
      expect(service.trackEvent).toHaveBeenCalledWith('cookie_consent', 'true');
      expect(mockConfig.onSendEvent).toHaveBeenCalledWith({
        message: 'setConsentGiven',
      });
    });

    it('should handle subsequent calls after user has set preference', () => {
      // First call: user accepts
      mockLsService.get.and.returnValue(undefined);
      mockDialogRef.afterClosed.and.returnValue(of('confirm'));
      service.initTracker();

      // Reset spies
      mockConfig.onSendEvent.calls.reset();

      // Second call: preference is now saved
      mockLsService.get.and.returnValue('true');
      service.initTracker();

      // Should not show dialog again, just use saved preference
      expect(mockConfig.onSendEvent).toHaveBeenCalledWith({
        message: 'setConsentGiven',
      });
    });

    it('should maintain consistent behavior across service lifecycle', () => {
      // Test multiple tracking events
      service.trackEvent('event1', 'action1');
      service.trackEvent('event2', 'action2', 'name2');
      service.trackEvent('event3', 'action3', 'name3', { data: 'test' });

      expect(mockConfig.onSendEvent).toHaveBeenCalledTimes(3);
      expect(mockConfig.onSendEvent).toHaveBeenCalledWith({
        message: 'trackEvent',
        data: {
          category: 'event1',
          action: 'action1',
          name: undefined,
          value: undefined,
        },
      });
      expect(mockConfig.onSendEvent).toHaveBeenCalledWith({
        message: 'trackEvent',
        data: {
          category: 'event2',
          action: 'action2',
          name: 'name2',
          value: undefined,
        },
      });
      expect(mockConfig.onSendEvent).toHaveBeenCalledWith({
        message: 'trackEvent',
        data: {
          category: 'event3',
          action: 'action3',
          name: 'name3',
          value: { data: 'test' },
        },
      });
    });
  });

  /**
   * Edge cases and error handling
   */
  describe('Edge Cases and Error Handling', () => {
    it('should handle localStorage errors gracefully', () => {
      mockLsService.get.and.throwError('LocalStorage error');

      expect(() => service.getCookieStatus()).toThrow();
    });

    it('should handle config service returning undefined', () => {
      mockConfigService.getConfig.and.returnValue(undefined);

      expect(() => service.trackEvent('test', 'action')).toThrow();
    });

    it('should handle very long category and action strings', () => {
      const longString = 'a'.repeat(10000);

      expect(() => service.trackEvent(longString, longString)).not.toThrow();
      expect(mockConfig.onSendEvent).toHaveBeenCalledWith({
        message: 'trackEvent',
        data: {
          category: longString,
          action: longString,
          name: undefined,
          value: undefined,
        },
      });
    });

    it('should handle special characters in tracking parameters', () => {
      const specialChars = 'äöü!@#$%^&*()[]{}|\\:";\'<>?,./`~';

      service.trackEvent(
        specialChars,
        specialChars,
        specialChars,
        specialChars,
      );

      expect(mockConfig.onSendEvent).toHaveBeenCalledWith({
        message: 'trackEvent',
        data: {
          category: specialChars,
          action: specialChars,
          name: specialChars,
          value: specialChars,
        },
      });
    });
  });
});
