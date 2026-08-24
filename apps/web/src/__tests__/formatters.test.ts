import { describe, it, expect } from 'vitest';
import { formatUzs, formatShortUzs, formatUzPhone, parseUzPhone } from '../lib/utils/formatters';

describe('Frontend Formatters & Utility Functions', () => {
  describe('formatUzs', () => {
    it('formats numbers with spaces as thousands separator and adds so\'m suffix', () => {
      expect(formatUzs(4000000)).toBe("4 000 000 so'm");
      expect(formatUzs(500000)).toBe("500 000 so'm");
      expect(formatUzs(0)).toBe("0 so'm");
    });
  });

  describe('formatShortUzs', () => {
    it('formats billions (mlrd) correctly', () => {
      expect(formatShortUzs(1500000000)).toBe('1.5 mlrd');
      expect(formatShortUzs(2000000000)).toBe('2.0 mlrd');
    });

    it('formats millions (mln) correctly', () => {
      expect(formatShortUzs(4000000)).toBe('4.0 mln');
      expect(formatShortUzs(3500000)).toBe('3.5 mln');
    });

    it('formats thousands (k) correctly', () => {
      expect(formatShortUzs(500000)).toBe('500k');
    });
  });

  describe('formatUzPhone & parseUzPhone', () => {
    it('formats raw digits into readable +998 (XX) XXX-XX-XX format', () => {
      expect(formatUzPhone('998901234567')).toBe('+998 (90) 123-45-67');
      expect(formatUzPhone('+998901234567')).toBe('+998 (90) 123-45-67');
    });

    it('cleans non-numeric characters for backend submission', () => {
      expect(parseUzPhone('+998 (90) 123-45-67')).toBe('+998901234567');
      expect(parseUzPhone('90 123 45 67')).toBe('+998901234567');
    });
  });
});
