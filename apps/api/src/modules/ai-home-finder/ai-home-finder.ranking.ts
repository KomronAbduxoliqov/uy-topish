import {
  Property,
  UserPreferenceModel,
  PropertyRecommendation,
  ScoreBreakdown,
  VerificationTier,
  RenovationType
} from '@uytop/shared-types';

export class AiRankingEngine {
  /**
   * Calculate distance between two coordinates in meters (Haversine formula)
   */
  static calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c);
  }

  /**
   * Score and rank real properties against user preferences.
   * Generates grounded match scores and verifiable reasons.
   */
  static rankProperties(
    properties: Property[],
    preferences: UserPreferenceModel
  ): PropertyRecommendation[] {
    const weights = preferences.importanceWeights || {
      price: 30,
      location: 25,
      rooms: 15,
      metro: 10,
      area: 10,
      amenities: 5,
      verification: 5,
    };

    const recommendations: PropertyRecommendation[] = [];

    for (const property of properties) {
      // 1. Price Score (0 - 100)
      let priceScore = 100;
      if (preferences.maxPrice) {
        if (property.priceUzs <= preferences.maxPrice) {
          // If within budget, reward even more if significantly below budget
          const savingsRatio = (preferences.maxPrice - property.priceUzs) / preferences.maxPrice;
          priceScore = Math.min(100, Math.round(90 + savingsRatio * 10));
        } else {
          // Exceeds budget: decay sharply
          const overRatio = (property.priceUzs - preferences.maxPrice) / preferences.maxPrice;
          priceScore = Math.max(0, Math.round(90 - overRatio * 200));
        }
      }

      // 2. Location Score (0 - 100)
      let locationScore = 75;
      let distToWorkKm: number | undefined;
      let distToUniKm: number | undefined;

      if (preferences.workLocation) {
        const distM = this.calculateDistanceMeters(
          preferences.workLocation.lat,
          preferences.workLocation.lng,
          property.latitude,
          property.longitude
        );
        distToWorkKm = Number((distM / 1000).toFixed(1));
        if (distM <= 1500) locationScore = 100;
        else if (distM <= 3000) locationScore = 88;
        else if (distM <= 6000) locationScore = 70;
        else locationScore = Math.max(30, 70 - Math.round((distM - 6000) / 300));
      } else if (preferences.universityLocation) {
        const distM = this.calculateDistanceMeters(
          preferences.universityLocation.lat,
          preferences.universityLocation.lng,
          property.latitude,
          property.longitude
        );
        distToUniKm = Number((distM / 1000).toFixed(1));
        if (distM <= 1500) locationScore = 100;
        else if (distM <= 3000) locationScore = 85;
        else locationScore = Math.max(30, 70 - Math.round((distM - 3000) / 300));
      } else if (preferences.district) {
        if (property.district.toLowerCase().includes(preferences.district.toLowerCase())) {
          locationScore = 100;
        } else {
          locationScore = 40;
        }
      }

      // 3. Rooms Score (0 - 100)
      let roomsScore = 80;
      if (preferences.rooms && preferences.rooms.length > 0) {
        if (preferences.rooms.includes(property.rooms)) {
          roomsScore = 100;
        } else {
          const diff = Math.min(...preferences.rooms.map((r) => Math.abs(r - property.rooms)));
          roomsScore = diff === 1 ? 65 : 30;
        }
      }

      // 4. Metro Proximity Score (0 - 100)
      let metroScore = 70;
      const metroDist = property.nearestMetroDistanceMeters || 9999;
      const estimatedWalkingMin = Math.max(1, Math.round(metroDist / 80));

      if (metroDist <= 400) {
        metroScore = 100;
      } else if (metroDist <= 800) {
        metroScore = 90;
      } else if (metroDist <= 1200) {
        metroScore = 75;
      } else if (metroDist <= 2000) {
        metroScore = 55;
      } else {
        metroScore = 35;
      }

      // 5. Area Score (0 - 100)
      let areaScore = 80;
      if (preferences.minArea && property.areaSqm < preferences.minArea) {
        areaScore = Math.max(30, Math.round((property.areaSqm / preferences.minArea) * 80));
      } else if (preferences.maxArea && property.areaSqm > preferences.maxArea) {
        areaScore = 85;
      } else {
        areaScore = 100;
      }

      // 6. Amenities Score (0 - 100)
      let amenitiesScore = 70;
      let matchedAmenities = 0;
      let requestedAmenities = 0;

      if (preferences.furnished) {
        requestedAmenities++;
        if (property.furnished) matchedAmenities++;
      }
      if (preferences.renovation && preferences.renovation.length > 0) {
        requestedAmenities++;
        if (preferences.renovation.includes(property.renovation)) matchedAmenities++;
      }
      if (preferences.parking) {
        requestedAmenities++;
        if (property.amenities?.parking) matchedAmenities++;
      }
      if (preferences.elevator) {
        requestedAmenities++;
        if (property.amenities?.elevator) matchedAmenities++;
      }

      if (requestedAmenities > 0) {
        amenitiesScore = Math.round((matchedAmenities / requestedAmenities) * 100);
      } else {
        amenitiesScore = property.furnished ? 95 : 80;
      }

      // 7. Verification Score (0 - 100)
      let verificationScore = 70;
      if (property.verificationTier === VerificationTier.INSPECTED) {
        verificationScore = 100;
      } else if (property.verificationTier === VerificationTier.DOCS_VERIFIED) {
        verificationScore = 90;
      } else if (property.verificationTier === VerificationTier.PHONE_VERIFIED) {
        verificationScore = 80;
      }

      // Overall Match Score Calculation
      const totalWeight =
        weights.price +
        weights.location +
        weights.rooms +
        weights.metro +
        weights.area +
        weights.amenities +
        weights.verification;

      const weightedSum =
        priceScore * weights.price +
        locationScore * weights.location +
        roomsScore * weights.rooms +
        metroScore * weights.metro +
        areaScore * weights.area +
        amenitiesScore * weights.amenities +
        verificationScore * weights.verification;

      const finalMatchScore = Math.min(99, Math.max(45, Math.round(weightedSum / totalWeight)));

      // 8. Generate 3 to 5 Verified Match Reasons
      const matchReasons: string[] = [];

      if (preferences.maxPrice && property.priceUzs <= preferences.maxPrice) {
        matchReasons.push("Budjetingiz ichida");
      }
      if (preferences.rooms && preferences.rooms.includes(property.rooms)) {
        matchReasons.push(`${property.rooms} xonali mos xonadon`);
      }
      if (property.nearestMetroStation && metroDist <= 800) {
        matchReasons.push(`${property.nearestMetroStation} metrosiga ${estimatedWalkingMin} daqiqalik yo'l`);
      }
      if (distToWorkKm && distToWorkKm <= 3) {
        matchReasons.push(`Ish joyingizga yaqin (${distToWorkKm} km)`);
      }
      if (distToUniKm && distToUniKm <= 3) {
        matchReasons.push(`Universitetingizga yaqin (${distToUniKm} km)`);
      }
      if (property.furnished && preferences.furnished) {
        matchReasons.push("Mebellar bilan to'liq jihozlangan");
      } else if (property.furnished) {
        matchReasons.push("Mebelli");
      }
      if (property.verificationTier === VerificationTier.INSPECTED) {
        matchReasons.push("UyTop mutaxassisi ko'rigidan o'tgan");
      } else if (property.verificationTier === VerificationTier.DOCS_VERIFIED) {
        matchReasons.push("Hujjatlari to'liq tekshirilgan");
      }
      if (property.areaSqm >= 60) {
        matchReasons.push(`Keng maydon (${property.areaSqm} m²)`);
      }

      const breakdown: ScoreBreakdown = {
        priceScore,
        locationScore,
        roomsScore,
        metroScore,
        areaScore,
        amenitiesScore,
        verificationScore,
      };

      recommendations.push({
        property: {
          ...property,
          matchScore: finalMatchScore,
          matchReasons: matchReasons.slice(0, 4),
        },
        matchScore: finalMatchScore,
        matchReasons: matchReasons.slice(0, 4),
        breakdown,
        distanceToWorkKm: distToWorkKm,
        distanceToUniKm: distToUniKm,
        estimatedWalkingMinutes: estimatedWalkingMin,
      });
    }

    // Sort by final match score descending
    recommendations.sort((a, b) => b.matchScore - a.matchScore);

    return recommendations;
  }
}
