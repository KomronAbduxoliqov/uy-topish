import { Injectable } from '@nestjs/common';
import {
  TASHKENT_DISTRICTS,
  TASHKENT_METRO_STATIONS,
  TashkentDistrict,
  MetroStation
} from '@uytop/shared-types';

@Injectable()
export class GeoService {
  getDistricts(): TashkentDistrict[] {
    return TASHKENT_DISTRICTS;
  }

  getMetroStations(): MetroStation[] {
    return TASHKENT_METRO_STATIONS;
  }

  calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c);
  }

  findNearestMetro(lat: number, lng: number): { station: MetroStation; distanceMeters: number; walkingMinutes: number } {
    let closestStation: MetroStation = TASHKENT_METRO_STATIONS[0];
    let minDistance = Infinity;

    for (const station of TASHKENT_METRO_STATIONS) {
      const distance = this.calculateDistanceMeters(lat, lng, station.lat, station.lng);
      if (distance < minDistance) {
        minDistance = distance;
        closestStation = station;
      }
    }

    // Walking speed ~ 80 meters per minute (4.8 km/h)
    const walkingMinutes = Math.max(1, Math.round(minDistance / 80));

    return {
      station: closestStation,
      distanceMeters: minDistance,
      walkingMinutes
    };
  }

  findNearestDistrict(lat: number, lng: number): TashkentDistrict {
    let closestDistrict = TASHKENT_DISTRICTS[0];
    let minDistance = Infinity;

    for (const district of TASHKENT_DISTRICTS) {
      const distance = this.calculateDistanceMeters(lat, lng, district.lat, district.lng);
      if (distance < minDistance) {
        minDistance = distance;
        closestDistrict = district;
      }
    }

    return closestDistrict;
  }
}
