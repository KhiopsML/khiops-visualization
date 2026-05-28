/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck

import { NumberFormatter } from '@khiops-visualization/providers/number.utils.service';

describe('Visualization', () => {
  describe('NumberFormatter', () => {
    // ===== format =====

    describe('format', () => {
      it('should format integer correctly', () => {
        expect(NumberFormatter.format(42)).toBe('42');
      });

      it('should format zero', () => {
        expect(NumberFormatter.format(0)).toBe('0');
      });

      it('should format negative integer', () => {
        expect(NumberFormatter.format(-5)).toBe('-5');
      });

      it('should format NaN as "0"', () => {
        expect(NumberFormatter.format(NaN)).toBe('0');
      });

      it('should format string number', () => {
        expect(NumberFormatter.format('42')).toBe('42');
      });

      it('should format string NaN as "0"', () => {
        expect(NumberFormatter.format('abc')).toBe('0');
      });

      it('should format empty string as "0"', () => {
        expect(NumberFormatter.format('')).toBe('0');
      });

      // Very small numbers -> scientific notation
      it('should use scientific notation for very small positive number', () => {
        const result = NumberFormatter.format(0.0001);
        expect(result).toBe('1.00e-4');
      });

      it('should use scientific notation for very small negative number', () => {
        const result = NumberFormatter.format(-0.0001);
        expect(result).toBe('-1.00e-4');
      });

      it('should not use scientific notation for 0.001 boundary', () => {
        const result = NumberFormatter.format(0.005);
        expect(result).toBe('0.005');
      });

      // Very large numbers -> scientific notation
      it('should use scientific notation for large positive number', () => {
        const result = NumberFormatter.format(5000000);
        expect(result).toBe('5.00e+6');
      });

      it('should use scientific notation for large negative number', () => {
        const result = NumberFormatter.format(-5000000);
        expect(result).toBe('-5.00e+6');
      });

      it('should not use scientific notation for 1000000 boundary', () => {
        const result = NumberFormatter.format(999999);
        expect(result).toContain('999999');
      });

      // Decimal formatting by magnitude
      it('should format decimal >= 100 with 1 decimal place', () => {
        expect(NumberFormatter.format(123.456)).toBe('123.5');
      });

      it('should format decimal >= 10 with 2 decimal places', () => {
        expect(NumberFormatter.format(12.3456)).toBe('12.35');
      });

      it('should format decimal < 10 with 3 decimal places', () => {
        expect(NumberFormatter.format(1.23456)).toBe('1.235');
      });

      it('should format negative decimal correctly', () => {
        expect(NumberFormatter.format(-1.23456)).toBe('-1.235');
      });

      it('should format 0.5 with 3 decimal places', () => {
        expect(NumberFormatter.format(0.5)).toBe('0.500');
      });

      it('should format string decimal', () => {
        expect(NumberFormatter.format('3.14159')).toBe('3.142');
      });

      it('should format very large integer in scientific notation', () => {
        const result = NumberFormatter.format(1e12);
        expect(result).toContain('e+');
      });

      it('should handle exactly 1000000 boundary', () => {
        const result = NumberFormatter.format(1000000);
        expect(result).toBe('1000000');
      });

      it('should handle exactly 1000001 in scientific notation', () => {
        const result = NumberFormatter.format(1000001);
        expect(result).toBe('1.00e+6');
      });
    });

    // ===== formatFixed =====

    describe('formatFixed', () => {
      it('should format with default 2 decimal places', () => {
        expect(NumberFormatter.formatFixed(3.14159)).toBe('3.14');
      });

      it('should format with 0 decimal places', () => {
        expect(NumberFormatter.formatFixed(3.14159, 0)).toBe('3');
      });

      it('should format with 4 decimal places', () => {
        expect(NumberFormatter.formatFixed(3.14159, 4)).toBe('3.1416');
      });

      it('should format integer with 2 decimal places', () => {
        expect(NumberFormatter.formatFixed(42, 2)).toBe('42.00');
      });

      it('should format zero', () => {
        expect(NumberFormatter.formatFixed(0)).toBe('0.00');
      });

      it('should format negative number', () => {
        expect(NumberFormatter.formatFixed(-2.5, 1)).toBe('-2.5');
      });

      it('should format with 1 decimal', () => {
        expect(NumberFormatter.formatFixed(1.999, 1)).toBe('2.0');
      });
    });

    // ===== formatPercent =====

    describe('formatPercent', () => {
      it('should format 0.5 as 50.0%', () => {
        expect(NumberFormatter.formatPercent(0.5)).toBe('50.0%');
      });

      it('should format 1 as 100.0%', () => {
        expect(NumberFormatter.formatPercent(1)).toBe('100.0%');
      });

      it('should format 0 as 0.0%', () => {
        expect(NumberFormatter.formatPercent(0)).toBe('0.0%');
      });

      it('should format 0.123 as 12.3%', () => {
        expect(NumberFormatter.formatPercent(0.123)).toBe('12.3%');
      });

      it('should format negative value', () => {
        expect(NumberFormatter.formatPercent(-0.05)).toBe('-5.0%');
      });

      it('should format value > 1', () => {
        expect(NumberFormatter.formatPercent(1.5)).toBe('150.0%');
      });

      it('should format very small value', () => {
        expect(NumberFormatter.formatPercent(0.001)).toBe('0.1%');
      });
    });
  });
});
