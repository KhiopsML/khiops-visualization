/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { NgFor, NgIf, NgStyle } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostBinding,
} from '@angular/core';
import * as ChartJs from 'chart.js';

interface TooltipFontLike {
  family?: string;
  size?: number;
  weight?: string;
  lineHeight?: number | string;
}

interface TooltipBodyItemLike {
  before?: string[];
  lines?: string[];
  after?: string[];
}

interface TooltipLabelColorLike {
  borderColor?: unknown;
  backgroundColor?: unknown;
}

interface TooltipOptionsLike {
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  padding?:
    | number
    | { top?: number; right?: number; bottom?: number; left?: number };
  cornerRadius?:
    | number
    | {
        topLeft?: number;
        topRight?: number;
        bottomRight?: number;
        bottomLeft?: number;
      };
  titleFont?: TooltipFontLike;
  bodyFont?: TooltipFontLike;
  footerFont?: TooltipFontLike;
  titleMarginBottom?: number;
  titleSpacing?: number;
  bodySpacing?: number;
  footerSpacing?: number;
  boxPadding?: number;
}

interface TooltipLike {
  opacity?: number;
  caretX?: number;
  caretY?: number;
  title?: string[];
  beforeBody?: string[];
  body?: TooltipBodyItemLike[];
  afterBody?: string[];
  footer?: string[];
  labelColors?: TooltipLabelColorLike[];
  options?: TooltipOptionsLike;
}

export interface ExternalTooltipContextLike {
  chart: ChartJs.Chart;
  tooltip: TooltipLike;
}

interface TooltipPadding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface TooltipLineBlockVm {
  lines: string[];
  styles: Record<string, string>;
}

interface TooltipBodyItemVm {
  markerColor: string;
  markerMarginRight: string;
  before: TooltipLineBlockVm | null;
  lines: TooltipLineBlockVm | null;
  after: TooltipLineBlockVm | null;
}

@Component({
  selector: 'kl-chart-external-tooltip',
  standalone: true,
  imports: [NgIf, NgFor, NgStyle],
  templateUrl: './chart-external-tooltip.component.html',
  styleUrls: ['./chart-external-tooltip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartExternalTooltipComponent {
  @HostBinding('style.left.px')
  public left = 0;

  @HostBinding('style.top.px')
  public top = 0;

  @HostBinding('style.opacity')
  public opacity = '0';

  public hostStyles: Record<string, string> = {
    background: 'rgba(0, 0, 0, 0.8)',
    borderColor: 'transparent',
    borderWidth: '0px',
    borderStyle: 'solid',
    borderRadius: '5px',
    padding: '10px 10px 10px 10px',
    color: '#ffffff',
  };

  public title: TooltipLineBlockVm | null = null;
  public beforeBody: TooltipLineBlockVm | null = null;
  public bodyItems: TooltipBodyItemVm[] = [];
  public afterBody: TooltipLineBlockVm | null = null;
  public footer: TooltipLineBlockVm | null = null;

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private cdr: ChangeDetectorRef,
  ) {}

  update(context: ExternalTooltipContextLike): void {
    const { chart, tooltip } = context;

    if (!tooltip || tooltip.opacity === 0) {
      this.opacity = '0';
      this.applyHostStyle();
      this.cdr.detectChanges();
      return;
    }

    const options: TooltipOptionsLike = tooltip.options || {};
    const titleSpacing = options.titleSpacing ?? 3;
    const bodySpacing = options.bodySpacing ?? 3;
    const footerSpacing = options.footerSpacing ?? 3;
    const titleMarginBottom = options.titleMarginBottom ?? 10;
    const boxPadding = options.boxPadding ?? 10;

    this.applyContainerStyle(options);

    this.title = this.makeLineBlock(
      tooltip.title,
      this.getFontStyles(options.titleFont, true),
      titleSpacing,
      { marginBottom: `${titleMarginBottom}px` },
    );

    this.beforeBody = this.makeLineBlock(
      tooltip.beforeBody,
      this.getFontStyles(options.bodyFont, false),
      bodySpacing,
    );

    const labelColors = tooltip.labelColors || [];
    this.bodyItems = (tooltip.body || []).map((item, index) => ({
      markerColor:
        this.toCssColor(labelColors[index]?.borderColor) ||
        this.toCssColor(labelColors[index]?.backgroundColor) ||
        '#ffffff',
      markerMarginRight: `${boxPadding}px`,
      before: this.makeLineBlock(
        item.before,
        this.getFontStyles(options.bodyFont, false),
        bodySpacing,
      ),
      lines: this.makeLineBlock(
        item.lines,
        this.getFontStyles(options.bodyFont, false),
        bodySpacing,
      ),
      after: this.makeLineBlock(
        item.after,
        this.getFontStyles(options.bodyFont, false),
        bodySpacing,
      ),
    }));

    this.afterBody = this.makeLineBlock(
      tooltip.afterBody,
      this.getFontStyles(options.bodyFont, false),
      bodySpacing,
    );

    this.footer = this.makeLineBlock(
      tooltip.footer,
      this.getFontStyles(options.footerFont, false),
      footerSpacing,
      { marginTop: '4px' },
    );

    const canvasRect = chart.canvas.getBoundingClientRect();
    const tooltipOffset = 12;

    this.left = canvasRect.left + (tooltip.caretX ?? 0) + tooltipOffset;
    this.top = canvasRect.top + (tooltip.caretY ?? 0) + tooltipOffset;
    this.opacity = '1';
    this.cdr.detectChanges();

    const viewportPadding = 8;
    const tooltipRect = this.elementRef.nativeElement.getBoundingClientRect();

    this.left = Math.max(
      viewportPadding,
      Math.min(
        this.left,
        window.innerWidth - tooltipRect.width - viewportPadding,
      ),
    );
    this.top = Math.max(
      viewportPadding,
      Math.min(
        this.top,
        window.innerHeight - tooltipRect.height - viewportPadding,
      ),
    );
    this.applyHostStyle();
    this.cdr.detectChanges();
  }

  private applyHostStyle(): void {
    const element = this.elementRef.nativeElement;
    element.style.left = `${this.left}px`;
    element.style.top = `${this.top}px`;
    element.style.opacity = this.opacity;
  }

  private applyContainerStyle(options: TooltipOptionsLike): void {
    const padding = this.normalizePadding(options.padding);

    this.hostStyles = {
      background: options.backgroundColor || 'rgba(0, 0, 0, 0.8)',
      borderColor: options.borderColor || 'transparent',
      borderWidth: `${options.borderWidth ?? 0}px`,
      borderStyle: 'solid',
      borderRadius: this.normalizeCornerRadius(options.cornerRadius),
      padding: `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`,
      color: '#ffffff',
    };
  }

  private makeLineBlock(
    lines: string[] | undefined,
    fontStyles: Record<string, string>,
    spacing: number,
    extraStyles: Record<string, string> = {},
  ): TooltipLineBlockVm | null {
    if (!lines || lines.length === 0) {
      return null;
    }

    return {
      lines,
      styles: {
        ...fontStyles,
        display: 'flex',
        flexDirection: 'column',
        gap: `${spacing}px`,
        ...extraStyles,
      },
    };
  }

  private getFontStyles(
    font: TooltipFontLike | undefined,
    fallbackBold: boolean,
  ): Record<string, string> {
    return {
      fontFamily: font?.family || 'JetBrains Mono, Courier New, monospace',
      fontSize: `${font?.size ?? 12}px`,
      fontWeight: font?.weight || (fallbackBold ? 'bold' : 'normal'),
      lineHeight: `${font?.lineHeight ?? 1.2}`,
    };
  }

  private normalizePadding(value: TooltipOptionsLike['padding']): TooltipPadding {
    if (typeof value === 'number') {
      return { top: value, right: value, bottom: value, left: value };
    }

    return {
      top: value?.top ?? 10,
      right: value?.right ?? 10,
      bottom: value?.bottom ?? 10,
      left: value?.left ?? 10,
    };
  }

  private normalizeCornerRadius(
    value: TooltipOptionsLike['cornerRadius'],
  ): string {
    if (typeof value === 'number') {
      return `${value}px`;
    }

    if (value) {
      const topLeft = value.topLeft ?? 5;
      const topRight = value.topRight ?? 5;
      const bottomRight = value.bottomRight ?? 5;
      const bottomLeft = value.bottomLeft ?? 5;
      return `${topLeft}px ${topRight}px ${bottomRight}px ${bottomLeft}px`;
    }

    return '5px';
  }

  private toCssColor(value: unknown): string | null {
    return typeof value === 'string' ? value : null;
  }
}
