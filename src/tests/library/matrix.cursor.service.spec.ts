/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

// @ts-nocheck

import { TestBed } from '@angular/core/testing';
import {
  MatrixCursorService,
  MatrixCursorType,
} from '../../app/khiops-library/components/matrix/matrix.cursor.service';
import { UtilsService } from '../../app/khiops-library/providers/utils.service';

describe('MatrixCursorService', () => {
  let service: MatrixCursorService;
  let container: HTMLElement;
  let updateCallbackSpy: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MatrixCursorService],
    });
    service = TestBed.inject(MatrixCursorService);

    container = document.createElement('div');
    updateCallbackSpy = jasmine.createSpy('updateCallback');
  });

  afterEach(() => {
    service.destroy();
  });

  // ─── initialize ──────────────────────────────────────────────────────

  describe('initialize', () => {
    it('should set up keyboard listeners and respond to Control key on non-Mac', () => {
      spyOn(UtilsService, 'isMac').and.returnValue(false);
      service.initialize(container, updateCallbackSpy);

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Control' }));
      expect(updateCallbackSpy).toHaveBeenCalledTimes(1);
      expect(service.isCtrlKeyPressed()).toBe(true);

      window.dispatchEvent(new KeyboardEvent('keyup', { key: 'Control' }));
      expect(updateCallbackSpy).toHaveBeenCalledTimes(2);
      expect(service.isCtrlKeyPressed()).toBe(false);
    });

    it('should respond to Meta key on Mac', () => {
      spyOn(UtilsService, 'isMac').and.returnValue(true);
      service.initialize(container, updateCallbackSpy);

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Meta' }));
      expect(updateCallbackSpy).toHaveBeenCalledTimes(1);
      expect(service.isCtrlKeyPressed()).toBe(true);

      window.dispatchEvent(new KeyboardEvent('keyup', { key: 'Meta' }));
      expect(updateCallbackSpy).toHaveBeenCalledTimes(2);
      expect(service.isCtrlKeyPressed()).toBe(false);
    });

    it('should not trigger callback for non-modifier keys', () => {
      spyOn(UtilsService, 'isMac').and.returnValue(false);
      service.initialize(container, updateCallbackSpy);

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
      expect(updateCallbackSpy).not.toHaveBeenCalled();
    });

    it('should not trigger callback on repeated keydown', () => {
      spyOn(UtilsService, 'isMac').and.returnValue(false);
      service.initialize(container, updateCallbackSpy);

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Control' }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Control' }));
      // Only first keydown triggers callback
      expect(updateCallbackSpy).toHaveBeenCalledTimes(1);
    });

    it('should not trigger callback on keyup when ctrl is not pressed', () => {
      spyOn(UtilsService, 'isMac').and.returnValue(false);
      service.initialize(container, updateCallbackSpy);

      // keyup without prior keydown
      window.dispatchEvent(new KeyboardEvent('keyup', { key: 'Control' }));
      expect(updateCallbackSpy).not.toHaveBeenCalled();
    });
  });

  // ─── destroy ─────────────────────────────────────────────────────────

  describe('destroy', () => {
    it('should remove keyboard listeners', () => {
      spyOn(UtilsService, 'isMac').and.returnValue(false);
      service.initialize(container, updateCallbackSpy);

      service.destroy();

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Control' }));
      expect(updateCallbackSpy).not.toHaveBeenCalled();
    });

    it('should reset all state', () => {
      spyOn(UtilsService, 'isMac').and.returnValue(false);
      service.initialize(container, updateCallbackSpy);
      service.onMouseDown();
      service.setPaning(true);
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Control' }));

      service.destroy();

      expect(service.isCtrlKeyPressed()).toBe(false);
      expect(service.isMouseButtonDown()).toBe(false);
      expect(service.isPanningAllowed()).toBe(true);
    });

    it('should handle destroy without prior initialize', () => {
      // Should not throw
      expect(() => service.destroy()).not.toThrow();
    });
  });

  // ─── reset ───────────────────────────────────────────────────────────

  describe('reset', () => {
    it('should reset ctrl, mouse down, and panning states', () => {
      spyOn(UtilsService, 'isMac').and.returnValue(false);
      service.initialize(container, updateCallbackSpy);

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Control' }));
      service.onMouseDown();
      service.setPaning(true);

      service.reset();

      expect(service.isCtrlKeyPressed()).toBe(false);
      expect(service.isMouseButtonDown()).toBe(false);
      expect(service.isPanningAllowed()).toBe(true);
    });
  });

  // ─── onMouseDown / onMouseUp ─────────────────────────────────────────

  describe('onMouseDown', () => {
    it('should set mouse button down state to true', () => {
      service.onMouseDown();
      expect(service.isMouseButtonDown()).toBe(true);
    });
  });

  describe('onMouseUp', () => {
    it('should set mouse button down state to false and reset panning', () => {
      service.onMouseDown();
      service.setPaning(true);
      service.onMouseUp();
      expect(service.isMouseButtonDown()).toBe(false);
      // After onMouseUp, isPaning is reset, so isPanningAllowed should be true
      expect(service.isPanningAllowed()).toBe(true);
    });
  });

  // ─── setPaning ───────────────────────────────────────────────────────

  describe('setPaning', () => {
    it('should set panning state', () => {
      service.setPaning(true);
      // We can't directly check isPaning, but we can test via updateCursor behavior
      // isPanningAllowed checks isCtrlPressed, not isPaning
      expect(service.isPanningAllowed()).toBe(true);
    });
  });

  // ─── isCtrlKeyPressed ────────────────────────────────────────────────

  describe('isCtrlKeyPressed', () => {
    it('should return false by default', () => {
      expect(service.isCtrlKeyPressed()).toBe(false);
    });
  });

  // ─── isMouseButtonDown ───────────────────────────────────────────────

  describe('isMouseButtonDown', () => {
    it('should return false by default', () => {
      expect(service.isMouseButtonDown()).toBe(false);
    });
  });

  // ─── isPanningAllowed ────────────────────────────────────────────────

  describe('isPanningAllowed', () => {
    it('should return true when ctrl is not pressed', () => {
      expect(service.isPanningAllowed()).toBe(true);
    });

    it('should return false when ctrl is pressed', () => {
      spyOn(UtilsService, 'isMac').and.returnValue(false);
      service.initialize(container, updateCallbackSpy);
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Control' }));
      expect(service.isPanningAllowed()).toBe(false);
    });
  });

  // ─── updateCursor ────────────────────────────────────────────────────

  describe('updateCursor', () => {
    beforeEach(() => {
      spyOn(UtilsService, 'isMac').and.returnValue(false);
      service.initialize(container, updateCallbackSpy);
    });

    it('should do nothing if containerElement is null', () => {
      service.destroy();
      // Re-create service without container
      service = TestBed.inject(MatrixCursorService);
      expect(() => service.updateCursor(false)).not.toThrow();
    });

    it('should show pointer cursor by default (no mouse down, no ctrl)', () => {
      service.updateCursor(false);
      expect(container.classList.contains(MatrixCursorType.POINTER)).toBe(true);
      expect(container.classList.contains(MatrixCursorType.MOVE)).toBe(false);
      expect(container.classList.contains(MatrixCursorType.CELL)).toBe(false);
    });

    it('should show cell cursor when ctrl is pressed and isKhiopsCovisu is true', () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Control' }));
      service.updateCursor(true);
      expect(container.classList.contains(MatrixCursorType.CELL)).toBe(true);
    });

    it('should show pointer cursor when ctrl is pressed but isKhiopsCovisu is false', () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Control' }));
      service.updateCursor(false);
      expect(container.classList.contains(MatrixCursorType.POINTER)).toBe(true);
    });

    it('should show cell cursor during ctrl+drag when isKhiopsCovisu is true', () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Control' }));
      service.onMouseDown();
      service.updateCursor(true);
      expect(container.classList.contains(MatrixCursorType.CELL)).toBe(true);
    });

    it('should show move cursor when mouse is down and panning', () => {
      service.onMouseDown();
      service.setPaning(true);
      service.updateCursor(false);
      expect(container.classList.contains(MatrixCursorType.MOVE)).toBe(true);
    });

    it('should show pointer cursor when mouse is down but not ctrl and not panning', () => {
      service.onMouseDown();
      service.updateCursor(false);
      expect(container.classList.contains(MatrixCursorType.POINTER)).toBe(true);
    });

    it('should remove previous cursor class before adding new one', () => {
      service.updateCursor(false);
      expect(container.classList.contains(MatrixCursorType.POINTER)).toBe(true);

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Control' }));
      service.updateCursor(true);
      expect(container.classList.contains(MatrixCursorType.POINTER)).toBe(
        false,
      );
      expect(container.classList.contains(MatrixCursorType.CELL)).toBe(true);
    });
  });

  // ─── MatrixCursorType enum ───────────────────────────────────────────

  describe('MatrixCursorType', () => {
    it('should have correct values', () => {
      expect(MatrixCursorType.POINTER).toBe('cursor-pointer');
      expect(MatrixCursorType.MOVE).toBe('cursor-move');
      expect(MatrixCursorType.CELL).toBe('cursor-cell');
    });
  });
});
