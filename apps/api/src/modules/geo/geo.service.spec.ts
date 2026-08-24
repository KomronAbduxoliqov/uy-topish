import { Test, TestingModule } from '@nestjs/testing';
import { GeoService } from './geo.service';
import { TASHKENT_DISTRICTS, TASHKENT_METRO_STATIONS } from '@uytop/shared-types';

describe('GeoService (Unit Tests)', () => {
  let service: GeoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GeoService],
    }).compile();

    service = module.get<GeoService>(GeoService);
  });

  it('should return all 12 Tashkent districts with correct center coordinates', () => {
    const districts = service.getDistricts();
    expect(districts.length).toBe(12);
    expect(districts.find((d) => d.nameUz === 'Chilonzor')).toBeDefined();
    expect(districts.find((d) => d.nameUz === 'Yunusobod')).toBeDefined();
    expect(districts.find((d) => d.nameUz === "Mirzo Ulug'bek")).toBeDefined();
  });

  it('should return all key Tashkent metro stations', () => {
    const stations = service.getMetroStations();
    expect(stations.length).toBeGreaterThanOrEqual(12);
    expect(stations.find((s) => s.nameUz === 'Novza')).toBeDefined();
    expect(stations.find((s) => s.nameUz === 'Amir Temur Xiyoboni')).toBeDefined();
  });

  it('should calculate Haversine distance in meters accurately between two coordinates', () => {
    // Novza metro coords: 41.2828, 69.2132
    // Chilonzor 9-mavze coords: 41.2745, 69.2065
    const distance = service.calculateDistanceMeters(41.2828, 69.2132, 41.2745, 69.2065);
    expect(distance).toBeGreaterThan(900);
    expect(distance).toBeLessThan(1200);
  });

  it('should identify the nearest metro station and estimated walking minutes correctly', () => {
    // Point very close to Novza metro (41.2830, 69.2135)
    const result = service.findNearestMetro(41.2830, 69.2135);

    expect(result.station.nameUz).toBe('Novza');
    expect(result.distanceMeters).toBeLessThan(100);
    expect(result.walkingMinutes).toBe(1);
  });

  it('should identify nearest district based on coordinate proximity', () => {
    // Coordinates inside Yunusobod (41.3650, 69.2850)
    const district = service.findNearestDistrict(41.3650, 69.2850);
    expect(district.nameUz).toBe('Yunusobod');
  });
});
