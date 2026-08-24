import { describe, it, expect } from 'vitest';
import { Property, TransactionType, PropertyType, ListingStatus, VerificationTier, RenovationType } from '@uytop/shared-types';

describe('Property Matching & Comparison Calculations', () => {
  const mockProperties: Property[] = [
    {
      id: 'prop-1',
      ownerId: 'usr-1',
      titleUz: 'Chilonzorda 2 xonali kvartira',
      titleRu: '2-комнатная квартира на Чиланзаре',
      descriptionUz: 'Yaxshi ta\'mir',
      descriptionRu: 'Хороший ремонт',
      transactionType: TransactionType.RENT,
      propertyType: PropertyType.APARTMENT,
      status: ListingStatus.PUBLISHED,
      priceUzs: 4000000,
      priceUsd: 316,
      city: 'Toshkent',
      district: 'Chilonzor',
      addressLine: '9-mavze, 14-uy',
      latitude: 41.2745,
      longitude: 69.2065,
      rooms: 2,
      areaSqm: 60,
      floor: 3,
      totalFloors: 9,
      renovation: RenovationType.RENOVATED,
      furnished: true,
      amenities: {},
      images: [],
      viewCount: 0,
      contactClickCount: 0,
      verificationTier: VerificationTier.DOCS_VERIFIED,
      nearestMetroStation: 'Novza',
      nearestMetroDistanceMeters: 300,
      createdAt: '2026-08-01',
      updatedAt: '2026-08-01',
    },
    {
      id: 'prop-2',
      ownerId: 'usr-1',
      titleUz: 'Yunusobodda 3 xonali kvartira',
      titleRu: '3-комнатная квартира на Юнусабаде',
      descriptionUz: 'Yangi uy',
      descriptionRu: 'Новый дом',
      transactionType: TransactionType.RENT,
      propertyType: PropertyType.APARTMENT,
      status: ListingStatus.PUBLISHED,
      priceUzs: 6000000,
      priceUsd: 474,
      city: 'Toshkent',
      district: 'Yunusobod',
      addressLine: '4-mavze, 5-uy',
      latitude: 41.3650,
      longitude: 69.2850,
      rooms: 3,
      areaSqm: 90,
      floor: 5,
      totalFloors: 12,
      renovation: RenovationType.NEW,
      furnished: false,
      amenities: {},
      images: [],
      viewCount: 0,
      contactClickCount: 0,
      verificationTier: VerificationTier.INSPECTED,
      nearestMetroStation: 'Shahriston',
      nearestMetroDistanceMeters: 450,
      createdAt: '2026-08-01',
      updatedAt: '2026-08-01',
    },
  ];

  it('calculates price per square meter accurately', () => {
    const p1PricePerSqm = Math.round(mockProperties[0].priceUzs / mockProperties[0].areaSqm);
    const p2PricePerSqm = Math.round(mockProperties[1].priceUzs / mockProperties[1].areaSqm);

    expect(p1PricePerSqm).toBe(66667);
    expect(p2PricePerSqm).toBe(66667);
  });

  it('calculates walking minutes to nearest metro station based on 80m/min speed', () => {
    const walkingSpeedMetersPerMinute = 80;

    const p1WalkingMinutes = Math.max(
      1,
      Math.round((mockProperties[0].nearestMetroDistanceMeters || 0) / walkingSpeedMetersPerMinute)
    );
    const p2WalkingMinutes = Math.max(
      1,
      Math.round((mockProperties[1].nearestMetroDistanceMeters || 0) / walkingSpeedMetersPerMinute)
    );

    expect(p1WalkingMinutes).toBe(4); // 300 / 80 = 3.75 -> 4 min
    expect(p2WalkingMinutes).toBe(6); // 450 / 80 = 5.625 -> 6 min
  });

  it('filters properties by district, room count, and budget', () => {
    const targetDistrict = 'Chilonzor';
    const targetRooms = 2;
    const maxBudget = 4500000;

    const matched = mockProperties.filter(
      (p) =>
        p.district === targetDistrict &&
        p.rooms === targetRooms &&
        p.priceUzs <= maxBudget
    );

    expect(matched.length).toBe(1);
    expect(matched[0].id).toBe('prop-1');
  });
});
