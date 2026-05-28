/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck

import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngstack/translate';
import { AnnotationService } from '@khiops-covisualization/providers/annotation.service';
import { AppService } from '@khiops-covisualization/providers/app.service';
import { DimensionsDatasService } from '@khiops-covisualization/providers/dimensions-datas.service';

let annotationService: AnnotationService;
let appService: AppService;
let dimensionsDatasService: DimensionsDatasService;

describe('coVisualization', () => {
  describe('AnnotationService', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [TranslateModule.forRoot()],
        providers: [provideHttpClient()],
      });

      annotationService = TestBed.inject(AnnotationService);
      appService = TestBed.inject(AppService);
      dimensionsDatasService = TestBed.inject(DimensionsDatasService);
    });

    it('should be created', () => {
      expect(annotationService).toBeTruthy();
    });

    // ===== getAnnotations =====

    describe('getAnnotations', () => {
      it('should return undefined when dimensionsDatas has no annotations', () => {
        dimensionsDatasService.dimensionsDatas.annotations = undefined;
        const result = annotationService.getAnnotations();
        expect(result).toBeUndefined();
      });

      it('should return empty object when annotations are empty', () => {
        dimensionsDatasService.dimensionsDatas.annotations = {};
        const result = annotationService.getAnnotations();
        expect(result).toEqual({});
      });

      it('should return annotations when they exist', () => {
        dimensionsDatasService.dimensionsDatas.annotations = {
          dim1: { node1: 'annotation1' },
        };
        const result = annotationService.getAnnotations();
        expect(result).toEqual({ dim1: { node1: 'annotation1' } });
      });

      it('should return undefined when dimensionsDatas is null', () => {
        dimensionsDatasService.dimensionsDatas = null;
        const result = annotationService.getAnnotations();
        expect(result).toBeUndefined();
      });
    });

    // ===== initSavedDatas =====

    describe('initSavedDatas', () => {
      it('should initialize annotations from saved data', () => {
        const savedAnnotations = { dim1: { node1: 'saved annotation' } };
        spyOn(appService, 'getSavedDatas').and.returnValue(savedAnnotations);

        annotationService.initSavedDatas();

        expect(appService.getSavedDatas).toHaveBeenCalledWith('annotations');
        expect(dimensionsDatasService.dimensionsDatas.annotations).toEqual(
          savedAnnotations,
        );
      });

      it('should initialize annotations with empty object when no saved data', () => {
        spyOn(appService, 'getSavedDatas').and.returnValue(undefined);

        annotationService.initSavedDatas();

        expect(dimensionsDatasService.dimensionsDatas.annotations).toEqual({});
      });

      it('should initialize annotations with empty object when saved data is null', () => {
        spyOn(appService, 'getSavedDatas').and.returnValue(null);

        annotationService.initSavedDatas();

        expect(dimensionsDatasService.dimensionsDatas.annotations).toEqual({});
      });

      it('should not crash when dimensionsDatas is null', () => {
        dimensionsDatasService.dimensionsDatas = null;
        spyOn(appService, 'getSavedDatas').and.returnValue({ dim1: {} });

        expect(() => annotationService.initSavedDatas()).not.toThrow();
      });
    });

    // ===== setNodeAnnotation =====

    describe('setNodeAnnotation', () => {
      it('should set annotation on an existing dimension', () => {
        dimensionsDatasService.dimensionsDatas.annotations = {
          dim1: {},
        };

        annotationService.setNodeAnnotation('dim1', 'node1', 'my annotation');

        expect(
          dimensionsDatasService.dimensionsDatas.annotations['dim1']['node1'],
        ).toBe('my annotation');
      });

      it('should create dimension entry if it does not exist', () => {
        dimensionsDatasService.dimensionsDatas.annotations = {};

        annotationService.setNodeAnnotation(
          'newDim',
          'node1',
          'new annotation',
        );

        expect(
          dimensionsDatasService.dimensionsDatas.annotations['newDim'][
            'node1'
          ],
        ).toBe('new annotation');
      });

      it('should create annotations object if it is undefined', () => {
        dimensionsDatasService.dimensionsDatas.annotations = undefined;

        annotationService.setNodeAnnotation('dim1', 'node1', 'annotation');

        expect(
          dimensionsDatasService.dimensionsDatas.annotations,
        ).toBeDefined();
        expect(
          dimensionsDatasService.dimensionsDatas.annotations['dim1']['node1'],
        ).toBe('annotation');
      });

      it('should overwrite existing annotation', () => {
        dimensionsDatasService.dimensionsDatas.annotations = {
          dim1: { node1: 'old annotation' },
        };

        annotationService.setNodeAnnotation('dim1', 'node1', 'new annotation');

        expect(
          dimensionsDatasService.dimensionsDatas.annotations['dim1']['node1'],
        ).toBe('new annotation');
      });

      it('should handle empty string annotation', () => {
        dimensionsDatasService.dimensionsDatas.annotations = {};

        annotationService.setNodeAnnotation('dim1', 'node1', '');

        expect(
          dimensionsDatasService.dimensionsDatas.annotations['dim1']['node1'],
        ).toBe('');
      });

      it('should set annotations on multiple nodes in the same dimension', () => {
        dimensionsDatasService.dimensionsDatas.annotations = {};

        annotationService.setNodeAnnotation('dim1', 'node1', 'annotation1');
        annotationService.setNodeAnnotation('dim1', 'node2', 'annotation2');

        expect(
          dimensionsDatasService.dimensionsDatas.annotations['dim1']['node1'],
        ).toBe('annotation1');
        expect(
          dimensionsDatasService.dimensionsDatas.annotations['dim1']['node2'],
        ).toBe('annotation2');
      });

      it('should set annotations on multiple dimensions', () => {
        dimensionsDatasService.dimensionsDatas.annotations = {};

        annotationService.setNodeAnnotation('dim1', 'node1', 'annotation1');
        annotationService.setNodeAnnotation('dim2', 'nodeA', 'annotation2');

        expect(
          dimensionsDatasService.dimensionsDatas.annotations['dim1']['node1'],
        ).toBe('annotation1');
        expect(
          dimensionsDatasService.dimensionsDatas.annotations['dim2']['nodeA'],
        ).toBe('annotation2');
      });

      it('should not crash when dimensionsDatas is null', () => {
        dimensionsDatasService.dimensionsDatas = null;

        expect(() =>
          annotationService.setNodeAnnotation('dim1', 'node1', 'annotation'),
        ).not.toThrow();
      });
    });

    // ===== Integration with real data =====

    describe('Integration with real data', () => {
      beforeEach(() => {
        const fileDatas = require('../../assets/mocks/kc/v4.json');
        appService.setFileDatas(fileDatas);
        dimensionsDatasService.getDimensions();
        dimensionsDatasService.initSelectedDimensions();
      });

      it('should set and retrieve annotations after loading file data', () => {
        annotationService.setNodeAnnotation(
          'occupation',
          'A1',
          'test annotation',
        );
        const annotations = annotationService.getAnnotations();

        expect(annotations['occupation']['A1']).toBe('test annotation');
      });

      it('should persist annotations through initSavedDatas round-trip', () => {
        annotationService.setNodeAnnotation(
          'occupation',
          'A1',
          'saved annotation',
        );

        const currentAnnotations = annotationService.getAnnotations();
        spyOn(appService, 'getSavedDatas').and.returnValue(currentAnnotations);

        annotationService.initSavedDatas();

        const restored = annotationService.getAnnotations();
        expect(restored['occupation']['A1']).toBe('saved annotation');
      });
    });
  });
});
