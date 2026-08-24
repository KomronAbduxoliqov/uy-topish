import { FraudDetectorService } from '../src/modules/fraud-protection/fraud-detector.service';
import {
  TransactionType,
  PropertyType,
  ListingStatus,
  VerificationTier,
  RenovationType,
  Property
} from '@uytop/shared-types';

describe('FraudDetectorService — Fraud, Scam & Trust Protection', () => {
  const fraudDetector = new FraudDetectorService();

  const legitimateProperty: Property = {
    id: 'prop-legit',
    ownerId: 'owner-1',
    titleUz: 'Chilonzorda 2 xonali shinam xonadon',
    descriptionUz: 'Toza, barcha sharoitlari bor. Oylik to\'lov 4 200 000 so\'m.',
    transactionType: TransactionType.RENT,
    propertyType: PropertyType.APARTMENT,
    priceUzs: 4200000,
    priceUsd: 330,
    rooms: 2,
    areaSqm: 65,
    addressLine: 'Qatortol ko\'chasi',
    city: 'Toshkent',
    district: 'Chilonzor',
    latitude: 41.2721,
    longitude: 69.2045,
    furnished: true,
    renovation: RenovationType.NEW,
    amenities: { parking: true },
    images: [{
      id: 'img-1',
      propertyId: 'prop-legit',
      originalUrl: 'https://images.unsplash.com/photo-1',
      webpUrl: 'https://images.unsplash.com/photo-1',
      thumbnailUrl: 'https://images.unsplash.com/photo-1',
      displayOrder: 0,
      isCover: true
    }],
    status: ListingStatus.PUBLISHED,
    verificationTier: VerificationTier.DOCS_VERIFIED,
    viewCount: 10,
    contactClickCount: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('should evaluate legitimate listing as LOW risk (False Positive Protection)', () => {
    const result = fraudDetector.evaluateListing(legitimateProperty, []);

    expect(result.riskScore).toBeLessThan(30);
    expect(result.riskLevel).toBe('LOW');
    expect(result.signals.length).toBe(0);
  });

  it('should detect duplicate property listings based on location, rooms, area, and price', () => {
    const duplicateCandidate: Property = {
      ...legitimateProperty,
      id: 'prop-duplicate',
      ownerId: 'owner-2', // Different owner uploading same flat
      titleUz: '2 xonali kvartira Chilonzorda',
      priceUzs: 4100000,
      areaSqm: 64,
      latitude: 41.27215, // ~6 meters away
      longitude: 69.20455,
    };

    const result = fraudDetector.evaluateListing(duplicateCandidate, [legitimateProperty]);

    expect(result.riskScore).toBeGreaterThanOrEqual(50);
    expect(result.signals.some((s) => s.type === 'DUPLICATE_SUSPECT')).toBe(true);
    expect(result.duplicateOfPropertyId).toBe('prop-legit');
  });

  it('should detect statistical price anomalies (significantly below district median)', () => {
    const abnormallyCheapProperty: Property = {
      ...legitimateProperty,
      id: 'prop-scam-price',
      priceUzs: 1000000, // 1 mln for 65m2 in Chilonzor (~15k/m2 vs 62k median)
    };

    const result = fraudDetector.evaluateListing(abnormallyCheapProperty, []);

    expect(result.riskScore).toBeGreaterThanOrEqual(40);
    expect(result.signals.some((s) => s.type === 'PRICE_ANOMALY')).toBe(true);
  });

  it('should detect price mismatch between description text and structured field', () => {
    const mismatchProperty: Property = {
      ...legitimateProperty,
      id: 'prop-mismatch',
      priceUzs: 7000000,
      descriptionUz: 'Kvartira ijaraga beriladi, narxi 3.5 mln so\'m.',
    };

    const result = fraudDetector.evaluateListing(mismatchProperty, []);

    expect(result.signals.some((s) => s.type === 'PRICE_MISMATCH')).toBe(true);
  });

  it('should detect misleading specifications (title 3 rooms vs structured 2 rooms)', () => {
    const misleadingProperty: Property = {
      ...legitimateProperty,
      id: 'prop-misleading',
      titleUz: '3 xonali yangi kvartira',
      rooms: 2, // Structured rooms is 2
    };

    const result = fraudDetector.evaluateListing(misleadingProperty, []);

    expect(result.signals.some((s) => s.type === 'MISLEADING_SPEC')).toBe(true);
  });

  it('should accumulate multiple signals into HIGH / CRITICAL risk level for human moderation', () => {
    const multiRiskProperty: Property = {
      ...legitimateProperty,
      id: 'prop-critical',
      priceUzs: 800000, // Abnormally cheap
      titleUz: '4 xonali uy', // Mismatch title
      rooms: 2,
      descriptionUz: 'Telegram orqali yozing: t.me/scam_bot va 2 mln zakalat to\'lang.', // External link spam
    };

    const result = fraudDetector.evaluateListing(multiRiskProperty, []);

    expect(result.riskScore).toBeGreaterThanOrEqual(70);
    expect(result.riskLevel === 'HIGH' || result.riskLevel === 'CRITICAL').toBe(true);
    expect(result.aiExplanation).toContain('Xavf darajasi');
  });
});
