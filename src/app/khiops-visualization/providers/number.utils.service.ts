/**
 * Lightweight number formatting utilities to replace mathjs format()
 * Reduces bundle size by ~500KB
 */
export class NumberFormatter {
  /**
   * Format number with proper precision (replaces mathjs format)
   * Handles scientific notation, decimals, and large numbers
   */
  static format(value: number | string): string {
    const num = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(num)) return '0';

    // Handle very small numbers (use scientific notation)
    if (Math.abs(num) < 0.001 && num !== 0) {
      return num.toExponential(2);
    }

    // Handle very large numbers (use scientific notation)
    if (Math.abs(num) > 1000000) {
      return num.toExponential(2);
    }

    // Handle regular numbers with appropriate decimal places
    if (num % 1 === 0) {
      // Integer
      return num.toString();
    } else {
      // Decimal - show up to 3 significant digits
      if (Math.abs(num) >= 100) {
        return num.toFixed(1);
      } else if (Math.abs(num) >= 10) {
        return num.toFixed(2);
      } else {
        return num.toFixed(3);
      }
    }
  }

  /**
   * Format with specific precision
   */
  static formatFixed(value: number, decimals: number = 2): string {
    return value.toFixed(decimals);
  }

  /**
   * Format as percentage
   */
  static formatPercent(value: number): string {
    return (value * 100).toFixed(1) + '%';
  }
}
