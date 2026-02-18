// @ts-nocheck
/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { IconComponent } from './icon.component';

describe('IconComponent', () => {
  let component: IconComponent;
  let fixture: ComponentFixture<IconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IconComponent],
      imports: [HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(IconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default size of 24', () => {
    expect(component.size).toBe(24);
  });

  it('should have default color of currentColor', () => {
    expect(component.color).toBe('currentColor');
  });

  it('should update size when input changes', () => {
    component.size = 32;
    expect(component.size).toBe(32);
  });

  it('should update color when input changes', () => {
    component.color = '#ff0000';
    expect(component.color).toBe('#ff0000');
  });
});