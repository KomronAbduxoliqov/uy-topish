import { describe, it, expect } from 'vitest';
import { TransactionType, PropertyType, RenovationType, BuildingType } from '@uytop/shared-types';

describe('Property Creation Wizard Validation Logic', () => {
  interface WizardPayload {
    transactionType: TransactionType;
    propertyType: PropertyType;
    titleUz: string;
    descriptionUz: string;
    district: string;
    addressLine: string;
    latitude: number;
    longitude: number;
    priceUzs: number;
    rooms: number;
    areaSqm: number;
    floor: number;
    totalFloors: number;
    ownerPhone: string;
  }

  const validateWizardForm = (data: Partial<WizardPayload>): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!data.titleUz || data.titleUz.trim().length < 5) {
      errors.push('Sarlavha kamida 5 ta belgidan iborat bo\'lishi shart');
    }
    if (!data.district) {
      errors.push('Tuman tanlanishi shart');
    }
    if (!data.addressLine || data.addressLine.trim().length < 3) {
      errors.push('Aniq manzil kiritilishi shart');
    }
    if (!data.priceUzs || data.priceUzs <= 0) {
      errors.push('Narx musbat son bo\'lishi shart');
    }
    if (!data.rooms || data.rooms < 1) {
      errors.push('Xonalar soni kamida 1 bo\'lishi shart');
    }
    if (!data.areaSqm || data.areaSqm < 10) {
      errors.push('Maydon kamida 10 m² bo\'lishi shart');
    }
    if (data.floor && data.totalFloors && data.floor > data.totalFloors) {
      errors.push('Qavat umumiy qavatlar sonidan katta bo\'lishi mumkin emas');
    }
    if (!data.ownerPhone || !/^\+?998\d{9}$/.test(data.ownerPhone.replace(/[^\d+]/g, ''))) {
      errors.push('Telefon raqam noto\'g\'ri (+998 formatda bo\'lishi kerak)');
    }

    return { isValid: errors.length === 0, errors };
  };

  it('validates complete correct listing data successfully', () => {
    const validData: WizardPayload = {
      transactionType: TransactionType.RENT,
      propertyType: PropertyType.APARTMENT,
      titleUz: 'Chilonzor 9-mavzeda 2 xonali kvartira',
      descriptionUz: 'Barcha qulayliklari bor shinam kvartira',
      district: 'Chilonzor',
      addressLine: '9-mavze, 14-uy',
      latitude: 41.2745,
      longitude: 69.2065,
      priceUzs: 4000000,
      rooms: 2,
      areaSqm: 60,
      floor: 3,
      totalFloors: 9,
      ownerPhone: '+998901234567',
    };

    const result = validateWizardForm(validData);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects invalid inputs (short title, floor exceeding totalFloors, invalid phone)', () => {
    const invalidData: Partial<WizardPayload> = {
      titleUz: 'Uy', // too short
      district: 'Chilonzor',
      addressLine: '', // empty
      priceUzs: -100, // negative price
      rooms: 0,
      areaSqm: 5,
      floor: 12,
      totalFloors: 9, // floor > totalFloors
      ownerPhone: '12345', // invalid phone
    };

    const result = validateWizardForm(invalidData);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(3);
  });
});
