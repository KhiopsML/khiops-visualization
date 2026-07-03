/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck

import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { TranslateModule } from '@ngstack/translate';
import { EventsService } from '@khiops-covisualization/providers/events.service';

let eventsService: EventsService;

describe('coVisualization', () => {
  describe('EventsService', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [TranslateModule.forRoot()],
        providers: [provideHttpClient(withXhr())],
      });

      eventsService = TestBed.inject(EventsService);
    });

    it('should be created', () => {
      expect(eventsService).toBeTruthy();
    });

    // ===== EventEmitter properties =====

    describe('EventEmitter properties', () => {
      it('should have treeSelectedNodeChanged EventEmitter', () => {
        expect(eventsService.treeSelectedNodeChanged).toBeDefined();
      });

      it('should have importedDatasChanged EventEmitter', () => {
        expect(eventsService.importedDatasChanged).toBeDefined();
      });

      it('should have conditionalOnContextChanged EventEmitter', () => {
        expect(eventsService.conditionalOnContextChanged).toBeDefined();
      });

      it('should have contextSelectionChanged EventEmitter', () => {
        expect(eventsService.contextSelectionChanged).toBeDefined();
      });
    });

    // ===== emitTreeSelectedNodeChanged =====

    describe('emitTreeSelectedNodeChanged', () => {
      it('should emit TreeNodeChangedEventI event', (done) => {
        const mockEvent = {
          hierarchyName: 'testHierarchy',
          realNodeVO: { name: 'node1' },
          selectedNode: { name: 'node2' },
          stopPropagation: false,
        };

        eventsService.treeSelectedNodeChanged.subscribe((event) => {
          expect(event).toEqual(mockEvent);
          done();
        });

        eventsService.emitTreeSelectedNodeChanged(mockEvent);
      });

      it('should emit event with selectedValue', (done) => {
        const mockEvent = {
          hierarchyName: 'hierarchy',
          realNodeVO: {},
          selectedNode: {},
          stopPropagation: true,
          selectedValue: 'testValue',
        };

        eventsService.treeSelectedNodeChanged.subscribe((event) => {
          expect(event.selectedValue).toBe('testValue');
          expect(event.stopPropagation).toBe(true);
          done();
        });

        eventsService.emitTreeSelectedNodeChanged(mockEvent);
      });

      it('should emit multiple events', () => {
        const receivedEvents = [];

        eventsService.treeSelectedNodeChanged.subscribe((event) => {
          receivedEvents.push(event);
        });

        const event1 = {
          hierarchyName: 'h1',
          realNodeVO: {},
          selectedNode: {},
          stopPropagation: false,
        };
        const event2 = {
          hierarchyName: 'h2',
          realNodeVO: {},
          selectedNode: {},
          stopPropagation: false,
        };

        eventsService.emitTreeSelectedNodeChanged(event1);
        eventsService.emitTreeSelectedNodeChanged(event2);

        expect(receivedEvents.length).toBe(2);
        expect(receivedEvents[0].hierarchyName).toBe('h1');
        expect(receivedEvents[1].hierarchyName).toBe('h2');
      });
    });

    // ===== emitImportedDatasChanged =====

    describe('emitImportedDatasChanged', () => {
      it('should emit event with provided data', (done) => {
        const mockEvent = { key: 'value', count: 5 };

        eventsService.importedDatasChanged.subscribe((event) => {
          expect(event).toEqual(mockEvent);
          done();
        });

        eventsService.emitImportedDatasChanged(mockEvent);
      });

      it('should emit event with default empty object when no argument', (done) => {
        eventsService.importedDatasChanged.subscribe((event) => {
          expect(event).toEqual({});
          done();
        });

        eventsService.emitImportedDatasChanged();
      });

      it('should emit event with complex data', (done) => {
        const complexEvent = {
          files: ['file1.csv', 'file2.csv'],
          dimensions: { dim1: 'value1' },
          count: 100,
        };

        eventsService.importedDatasChanged.subscribe((event) => {
          expect(event.files.length).toBe(2);
          expect(event.dimensions.dim1).toBe('value1');
          done();
        });

        eventsService.emitImportedDatasChanged(complexEvent);
      });
    });

    // ===== emitConditionalOnContextChanged =====

    describe('emitConditionalOnContextChanged', () => {
      it('should emit event without data', (done) => {
        eventsService.conditionalOnContextChanged.subscribe(() => {
          expect(true).toBe(true);
          done();
        });

        eventsService.emitConditionalOnContextChanged();
      });

      it('should notify multiple subscribers', () => {
        let subscriber1Called = false;
        let subscriber2Called = false;

        eventsService.conditionalOnContextChanged.subscribe(() => {
          subscriber1Called = true;
        });

        eventsService.conditionalOnContextChanged.subscribe(() => {
          subscriber2Called = true;
        });

        eventsService.emitConditionalOnContextChanged();

        expect(subscriber1Called).toBe(true);
        expect(subscriber2Called).toBe(true);
      });
    });

    // ===== emitContextSelectionChanged =====

    describe('emitContextSelectionChanged', () => {
      it('should emit event without data', (done) => {
        eventsService.contextSelectionChanged.subscribe(() => {
          expect(true).toBe(true);
          done();
        });

        eventsService.emitContextSelectionChanged();
      });

      it('should emit multiple times', () => {
        let count = 0;

        eventsService.contextSelectionChanged.subscribe(() => {
          count++;
        });

        eventsService.emitContextSelectionChanged();
        eventsService.emitContextSelectionChanged();
        eventsService.emitContextSelectionChanged();

        expect(count).toBe(3);
      });
    });

    // ===== Unsubscribe behavior =====

    describe('Unsubscribe behavior', () => {
      it('should not receive events after unsubscribing', () => {
        let count = 0;

        const subscription = eventsService.contextSelectionChanged.subscribe(
          () => {
            count++;
          },
        );

        eventsService.emitContextSelectionChanged();
        expect(count).toBe(1);

        subscription.unsubscribe();

        eventsService.emitContextSelectionChanged();
        expect(count).toBe(1); // should not increment
      });

      it('should not receive tree events after unsubscribing', () => {
        let received = false;

        const subscription = eventsService.treeSelectedNodeChanged.subscribe(
          () => {
            received = true;
          },
        );

        subscription.unsubscribe();

        eventsService.emitTreeSelectedNodeChanged({
          hierarchyName: 'test',
          realNodeVO: {},
          selectedNode: {},
          stopPropagation: false,
        });

        expect(received).toBe(false);
      });
    });
  });
});
