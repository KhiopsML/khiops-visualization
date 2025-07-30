// @ts-nocheck

/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { TestBed } from '@angular/core/testing';
import { Ls } from '@khiops-library/providers/ls.service';
import { ConfigService } from '@khiops-library/providers/config.service';
import { UtilsService } from '@khiops-library/providers/utils.service';

/**
 * Unit tests for Ls service (Local Storage service)
 * Tests cover both browser localStorage and Electron storage modes
 */
describe('Ls Service', () => {
  let service: Ls;
  let configService: ConfigService;
  let mockLocalStorage: { [key: string]: string };

  beforeEach(() => {
    // Mock localStorage
    mockLocalStorage = {};
    const localStorageMock = {
      getItem: jasmine.createSpy('getItem').and.callFake((key: string) => {
        return mockLocalStorage[key] || null;
      }),
      setItem: jasmine
        .createSpy('setItem')
        .and.callFake((key: string, value: string) => {
          mockLocalStorage[key] = value;
        }),
      removeItem: jasmine
        .createSpy('removeItem')
        .and.callFake((key: string) => {
          delete mockLocalStorage[key];
        }),
      clear: jasmine.createSpy('clear').and.callFake(() => {
        mockLocalStorage = {};
      }),
      get length() {
        return Object.keys(mockLocalStorage).length;
      },
      key: jasmine.createSpy('key').and.callFake((index: number) => {
        return Object.keys(mockLocalStorage)[index] || null;
      }),
    };

    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    TestBed.configureTestingModule({
      providers: [Ls, ConfigService],
    });

    service = TestBed.inject(Ls);
    configService = TestBed.inject(ConfigService);

    // Create mock config
    spyOn(configService, 'getConfig').and.returnValue({
      onSendEvent: undefined,
    });
  });

  afterEach(() => {
    mockLocalStorage = {};
  });

  /**
   * Test service initialization
   */
  describe('Service Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize with empty LS_ID', () => {
      expect(service.LS_ID).toBe('');
    });

    it('should initialize with undefined lsDatas', () => {
      expect(service.lsDatas).toBeUndefined();
    });
  });

  /**
   * Test setLsId method
   */
  describe('setLsId', () => {
    it('should set the LS_ID correctly', () => {
      const testId = 'test-app-id';
      service.setLsId(testId);
      expect(service.LS_ID).toBe(testId);
    });

    it('should handle empty string ID', () => {
      service.setLsId('');
      expect(service.LS_ID).toBe('');
    });

    it('should handle complex ID with special characters', () => {
      const complexId = 'app-v1.2.3_test-2025';
      service.setLsId(complexId);
      expect(service.LS_ID).toBe(complexId);
    });
  });

  /**
   * Test Browser localStorage mode
   */
  describe('Browser localStorage Mode', () => {
    beforeEach(() => {
      service.setLsId('test-');
      // Mock isElectronStorage property
      Object.defineProperty(configService, 'isElectronStorage', {
        get: () => false,
        configurable: true,
      });
    });

    describe('get method', () => {
      it('should return string value from localStorage', () => {
        mockLocalStorage['test-key1'] = 'test-value';
        const result = service.get('key1');
        expect(result).toBe('test-value');
      });

      it('should return parsed JSON object from localStorage', () => {
        const testObject = { name: 'test', value: 123 };
        mockLocalStorage['test-key2'] = JSON.stringify(testObject);
        const result = service.get('key2');
        expect(result).toEqual(testObject);
      });

      it('should return default value when key does not exist', () => {
        const defaultValue = 'default';
        const result = service.get('nonexistent', defaultValue);
        expect(result).toBe(defaultValue);
      });

      it('should return undefined when key does not exist and no default provided', () => {
        const result = service.get('nonexistent');
        expect(result).toBeUndefined();
      });

      it('should handle malformed JSON gracefully', () => {
        mockLocalStorage['test-key3'] = '{ invalid json';
        const result = service.get('key3', 'fallback');
        expect(result).toBeNull();
      });

      it('should return item when it exists but is empty string', () => {
        mockLocalStorage['test-key4'] = '';
        const result = service.get('key4', 'default');
        expect(result).toBe('default');
      });
    });

    describe('set method', () => {
      beforeEach(() => {
        spyOn(UtilsService, 'roundNumbersInJson').and.callFake((obj) => obj);
      });

      it('should store string value in localStorage', () => {
        service.set('key1', 'test-value');
        expect(localStorage.setItem).toHaveBeenCalledWith(
          'test-key1',
          'test-value',
        );
      });

      it('should store number value in localStorage', () => {
        service.set('key2', 123);
        expect(localStorage.setItem).toHaveBeenCalledWith('test-key2', 123);
      });

      it('should store object as JSON in localStorage', () => {
        const testObject = { name: 'test', value: 123 };
        service.set('key3', testObject);
        expect(UtilsService.roundNumbersInJson).toHaveBeenCalledWith(
          testObject,
        );
        expect(localStorage.setItem).toHaveBeenCalledWith(
          'test-key3',
          JSON.stringify(testObject),
        );
      });

      it('should handle null object correctly', () => {
        service.set('key4', null);
        expect(localStorage.setItem).toHaveBeenCalledWith('test-key4', null);
      });

      it('should store array as JSON in localStorage', () => {
        const testArray = [1, 2, 3, { nested: true }];
        service.set('key5', testArray);
        expect(UtilsService.roundNumbersInJson).toHaveBeenCalledWith(testArray);
        expect(localStorage.setItem).toHaveBeenCalledWith(
          'test-key5',
          JSON.stringify(testArray),
        );
      });
    });

    describe('del method', () => {
      it('should remove item from localStorage', () => {
        service.del('key1');
        expect(localStorage.removeItem).toHaveBeenCalledWith('test-key1');
      });

      it('should handle deleting non-existent key', () => {
        service.del('nonexistent');
        expect(localStorage.removeItem).toHaveBeenCalledWith(
          'test-nonexistent',
        );
      });
    });

    describe('delStartWith method', () => {
      beforeEach(() => {
        mockLocalStorage['test-view-preparation'] = 'data1';
        mockLocalStorage['test-view-modeling'] = 'data2';
        mockLocalStorage['test-chart-config'] = 'config1';
        mockLocalStorage['other-key'] = 'value';
      });

      it('should delete all keys starting with specified prefix', () => {
        service.delStartWith('view-');

        expect(localStorage.removeItem).toHaveBeenCalledWith(
          'test-view-preparation',
        );
        expect(localStorage.removeItem).toHaveBeenCalledWith(
          'test-view-modeling',
        );
        expect(localStorage.removeItem).not.toHaveBeenCalledWith(
          'test-chart-config',
        );
        expect(localStorage.removeItem).not.toHaveBeenCalledWith('other-key');
      });

      it('should handle empty prefix correctly', () => {
        const initialCallCount = (
          localStorage.removeItem as jasmine.Spy
        ).calls.count();
        service.delStartWith('');

        // Should remove all items that start with LS_ID (which is 'test-')
        const finalCallCount = (
          localStorage.removeItem as jasmine.Spy
        ).calls.count();
        expect(finalCallCount).toBeGreaterThan(initialCallCount);
      });

      it('should handle non-matching prefix', () => {
        const initialCallCount = (
          localStorage.removeItem as jasmine.Spy
        ).calls.count();
        service.delStartWith('nonexistent-');
        const finalCallCount = (
          localStorage.removeItem as jasmine.Spy
        ).calls.count();
        expect(finalCallCount).toBe(initialCallCount);
      });
    });

    describe('clear method', () => {
      it('should clear all localStorage', () => {
        service.clear();
        expect(localStorage.clear).toHaveBeenCalled();
      });
    });
  });

  /**
   * Test Electron storage mode
   */
  describe('Electron Storage Mode', () => {
    beforeEach(() => {
      service.setLsId('electron-');
      // Mock isElectronStorage property
      Object.defineProperty(configService, 'isElectronStorage', {
        get: () => true,
        configurable: true,
      });
      // Initialize lsDatas for Electron mode
      service.lsDatas = {
        'existing-key': 'existing-value',
        'number-key': 42,
        'object-key': { test: true },
      };
    });

    describe('get method', () => {
      it('should return value from lsDatas when key exists', () => {
        const result = service.get('existing-key');
        expect(result).toBe('existing-value');
      });

      it('should return default value when key does not exist', () => {
        const result = service.get('nonexistent', 'default');
        expect(result).toBe('default');
      });

      it('should return default value when key value is empty string', () => {
        service.lsDatas['empty-key'] = '';
        const result = service.get('empty-key', 'default');
        expect(result).toBe('default');
      });

      it('should return actual value when it is 0 (falsy but valid)', () => {
        service.lsDatas['zero-key'] = 0;
        const result = service.get('zero-key', 'default');
        expect(result).toBe(0);
      });

      it('should return actual value when it is false (falsy but valid)', () => {
        service.lsDatas['false-key'] = false;
        const result = service.get('false-key', 'default');
        expect(result).toBe(false);
      });
    });

    describe('set method', () => {
      beforeEach(() => {
        // Ensure lsDatas is properly initialized
        if (!service.lsDatas) {
          service.lsDatas = {};
        }
      });

      it('should set value in lsDatas', () => {
        service.set('new-key', 'new-value');
        expect(service.lsDatas['new-key']).toBe('new-value');
      });

      it('should initialize undefined key before setting', () => {
        expect(service.lsDatas['uninitialized-key']).toBeUndefined();
        service.set('uninitialized-key', 'test');
        expect(service.lsDatas['uninitialized-key']).toBe('test');
      });

      it('should overwrite existing key', () => {
        expect(service.lsDatas['existing-key']).toBe('existing-value');
        service.set('existing-key', 'updated-value');
        expect(service.lsDatas['existing-key']).toBe('updated-value');
      });

      it('should handle object values', () => {
        const testObject = { complex: { nested: true }, array: [1, 2, 3] };
        service.set('object-key', testObject);
        expect(service.lsDatas['object-key']).toEqual(testObject);
      });
    });

    describe('del method', () => {
      it('should delete existing key from lsDatas', () => {
        expect(service.lsDatas['existing-key']).toBeDefined();
        service.del('existing-key');
        expect(service.lsDatas['existing-key']).toBeUndefined();
      });

      it('should handle deleting non-existent key gracefully', () => {
        const initialKeys = Object.keys(service.lsDatas);
        service.del('nonexistent');
        expect(Object.keys(service.lsDatas)).toEqual(initialKeys);
      });

      it('should not delete when lsDatas is undefined', () => {
        service.lsDatas = undefined;
        expect(() => service.del('any-key')).not.toThrow();
      });
    });

    describe('delStartWith method', () => {
      beforeEach(() => {
        service.lsDatas = {
          'key-1': 'value1',
          'key-2': 'value2',
          'key-3': { type: 'object' },
          'other-4': 'value4',
          'different-5': 'value5',
        };
      });

      it('should delete all keys starting with specified prefix', () => {
        service.delStartWith('key-');

        expect(service.lsDatas['key-1']).toBeUndefined();
        expect(service.lsDatas['key-2']).toBeUndefined();
        expect(service.lsDatas['key-3']).toBeUndefined();
        expect(service.lsDatas['other-4']).toBe('value4');
        expect(service.lsDatas['different-5']).toBe('value5');
      });

      it('should handle empty prefix', () => {
        const originalKeys = Object.keys(service.lsDatas);
        service.delStartWith('');

        // All keys should be deleted when prefix is empty
        expect(Object.keys(service.lsDatas)).toEqual([]);
      });

      it('should handle non-matching prefix', () => {
        const originalKeys = Object.keys(service.lsDatas);
        service.delStartWith('nonexistent-');
        expect(Object.keys(service.lsDatas)).toEqual(originalKeys);
      });

      it('should handle undefined lsDatas', () => {
        service.lsDatas = undefined;
        expect(() => service.delStartWith('any-')).not.toThrow();
      });
    });

    describe('clear method', () => {
      it('should set lsDatas to undefined', () => {
        expect(service.lsDatas).toBeDefined();
        service.clear();
        expect(service.lsDatas).toBeUndefined();
      });
    });

    describe('setAll method', () => {
      it('should call onSendEvent with correct parameters', () => {
        const mockOnSendEvent = jasmine.createSpy('onSendEvent');
        (configService.getConfig as jasmine.Spy).and.returnValue({
          onSendEvent: mockOnSendEvent,
        });

        service.lsDatas = { test: 'data' };
        service.setAll();

        expect(mockOnSendEvent).toHaveBeenCalledWith({
          message: 'ls.saveAll',
          data: {
            id: 'electron-',
            value: { test: 'data' },
          },
        });
      });

      it('should handle missing onSendEvent gracefully', () => {
        (configService.getConfig as jasmine.Spy).and.returnValue({});
        expect(() => service.setAll()).not.toThrow();
      });
    });

    describe('getAll method', () => {
      it('should resolve with lsDatas when onSendEvent is available', async () => {
        const mockDatas = { key1: 'value1', key2: 'value2' };
        const mockOnSendEvent = jasmine
          .createSpy('onSendEvent')
          .and.callFake((request, callback) => {
            callback(mockDatas);
          });

        (configService.getConfig as jasmine.Spy).and.returnValue({
          onSendEvent: mockOnSendEvent,
        });

        const result = await service.getAll();

        expect(mockOnSendEvent).toHaveBeenCalledWith(
          {
            message: 'ls.getAll',
            data: {
              id: 'electron-',
            },
          },
          jasmine.any(Function),
        );
        expect(result).toEqual(mockDatas);
        expect(service.lsDatas).toEqual(mockDatas);
      });

      it('should reject when onSendEvent is not available', async () => {
        (configService.getConfig as jasmine.Spy).and.returnValue({});

        try {
          await service.getAll();
          fail('Expected promise to be rejected');
        } catch (error) {
          expect(error).toBe('Failed to fetch data');
        }
      });

      it('should reject when onSendEvent returns falsy', async () => {
        const mockOnSendEvent = jasmine
          .createSpy('onSendEvent')
          .and.returnValue(false);
        (configService.getConfig as jasmine.Spy).and.returnValue({
          onSendEvent: mockOnSendEvent,
        });

        try {
          await service.getAll();
          fail('Expected promise to be rejected');
        } catch (error) {
          expect(error).toBe('Failed to fetch data');
        }
      });
    });
  });

  /**
   * Integration tests between browser and Electron modes
   */
  describe('Integration Tests', () => {
    beforeEach(() => {
      service.setLsId('integration-test-');
    });

    it('should behave differently based on isElectronStorage flag', () => {
      // Test browser mode
      Object.defineProperty(configService, 'isElectronStorage', {
        get: () => false,
        configurable: true,
      });
      service.set('test-key', 'browser-value');
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'integration-test-test-key',
        'browser-value',
      );

      // Switch to Electron mode
      Object.defineProperty(configService, 'isElectronStorage', {
        get: () => true,
        configurable: true,
      });
      service.lsDatas = {};
      service.set('test-key', 'electron-value');
      expect(service.lsDatas['test-key']).toBe('electron-value');
    });

    it('should maintain LS_ID consistency across modes', () => {
      const testId = 'consistent-id-';
      service.setLsId(testId);

      // Browser mode
      Object.defineProperty(configService, 'isElectronStorage', {
        get: () => false,
        configurable: true,
      });
      service.set('key', 'value');
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'consistent-id-key',
        'value',
      );

      // Electron mode
      Object.defineProperty(configService, 'isElectronStorage', {
        get: () => true,
        configurable: true,
      });
      const mockOnSendEvent = jasmine.createSpy('onSendEvent');
      (configService.getConfig as jasmine.Spy).and.returnValue({
        onSendEvent: mockOnSendEvent,
      });

      service.setAll();
      expect(mockOnSendEvent).toHaveBeenCalledWith(
        jasmine.objectContaining({
          data: jasmine.objectContaining({
            id: 'consistent-id-',
          }),
        }),
      );
    });
  });

  /**
   * Edge case and error handling tests
   */
  describe('Edge Cases and Error Handling', () => {
    beforeEach(() => {
      service.setLsId('edge-case-');
    });

    it('should handle localStorage quota exceeded gracefully', () => {
      Object.defineProperty(configService, 'isElectronStorage', {
        get: () => false,
        configurable: true,
      });
      (localStorage.setItem as jasmine.Spy).and.throwError(
        'QuotaExceededError',
      );

      expect(() => service.set('large-key', 'large-value')).toThrow();
    });

    it('should handle circular reference objects in Electron mode', () => {
      Object.defineProperty(configService, 'isElectronStorage', {
        get: () => true,
        configurable: true,
      });
      service.lsDatas = {};

      const circularObj: any = { name: 'test' };
      circularObj.self = circularObj;

      // Should not throw error, just store the reference
      expect(() => service.set('circular', circularObj)).not.toThrow();
      expect(service.lsDatas['circular']).toBe(circularObj);
    });

    it('should handle null and undefined values correctly', () => {
      Object.defineProperty(configService, 'isElectronStorage', {
        get: () => false,
        configurable: true,
      });

      service.set('null-key', null);
      service.set('undefined-key', undefined);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'edge-case-null-key',
        null,
      );
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'edge-case-undefined-key',
        undefined,
      );
    });

    it('should handle very long key names', () => {
      const longKey = 'a'.repeat(1000);
      Object.defineProperty(configService, 'isElectronStorage', {
        get: () => false,
        configurable: true,
      });

      service.set(longKey, 'value');
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'edge-case-' + longKey,
        'value',
      );
    });

    it('should handle special characters in keys and values', () => {
      Object.defineProperty(configService, 'isElectronStorage', {
        get: () => false,
        configurable: true,
      });
      const specialKey = 'key-with-üñîçødé-and-symbols-!@#$%^&*()';
      const specialValue = 'value-with-üñîçødé-and-symbols-!@#$%^&*()';

      service.set(specialKey, specialValue);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'edge-case-' + specialKey,
        specialValue,
      );
    });
  });
});
