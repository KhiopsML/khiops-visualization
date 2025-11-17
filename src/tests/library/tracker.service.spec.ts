/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck

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
   * Test initTracker method
   */
  describe('initTracker', () => {
    it('should enable cookieless tracking mode', () => {
      service.initTracker();

      expect(mockConfig.onSendEvent).toHaveBeenCalledTimes(1);
      expect(mockConfig.onSendEvent).toHaveBeenCalledWith({
        message: 'requireCookieConsent',
      });
    });

    it('should not send events when onSendEvent is not available', () => {
      mockConfig.onSendEvent = undefined;

      expect(() => service.initTracker()).not.toThrow();
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
    it('should initialize tracker with cookieless tracking enabled', () => {
      // Act: initialize tracker
      service.initTracker();

      // Assert: cookieless mode is enabled
      expect(mockConfig.onSendEvent).toHaveBeenCalledTimes(1);
      expect(mockConfig.onSendEvent).toHaveBeenCalledWith({
        message: 'requireCookieConsent',
      });
    });

    it('should handle multiple initialization calls consistently', () => {
      // First call
      service.initTracker();

      // Reset spies
      mockConfig.onSendEvent.calls.reset();

      // Second call
      service.initTracker();

      // Should always enable cookieless tracking
      expect(mockConfig.onSendEvent).toHaveBeenCalledTimes(1);
      expect(mockConfig.onSendEvent).toHaveBeenCalledWith({
        message: 'requireCookieConsent',
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
