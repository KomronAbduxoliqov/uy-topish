import { RoutingService } from '../src/modules/geo/routing.service';
import { SmartNearbyService } from '../src/modules/geo/smart-nearby.service';

describe('RoutingService & SmartNearbyService — Walking Time Engine', () => {
  const routingService = new RoutingService();
  const smartNearbyService = new SmartNearbyService(routingService);

  describe('RoutingService', () => {
    it('should calculate straight-line and pedestrian road network distances accurately', async () => {
      // Novza metro (41.2925, 69.2245) to Qatortol apartment (41.2721, 69.2045)
      const origin = { lat: 41.2925, lng: 69.2245, name: 'Novza metrosi' };
      const dest = { lat: 41.2721, lng: 69.2045 };

      const route = await routingService.getWalkingRoute(origin, dest);

      expect(route.mode).toBe('WALKING');
      expect(route.isRouteAvailable).toBe(true);
      expect(route.straightLineDistanceMeters).toBeGreaterThan(1500);
      expect(route.routeDistanceMeters).toBeGreaterThan(route.straightLineDistanceMeters);
      // Route distance should incorporate realistic ~1.28x urban network factor
      expect(route.routeDistanceMeters).toBeGreaterThanOrEqual(Math.round(route.straightLineDistanceMeters * 1.2));
      expect(route.durationMinutes).toBeGreaterThan(10);
      expect(route.routeCoordinates).toBeDefined();
      expect(route.routeCoordinates?.length).toBeGreaterThanOrEqual(2);
    });

    it('should cache route results for repeated identical or near-identical coordinates', async () => {
      const origin = { lat: 41.311087, lng: 69.279737 };
      const dest = { lat: 41.3195, lng: 69.2785 };

      const firstCall = await routingService.getWalkingRoute(origin, dest);
      const secondCall = await routingService.getWalkingRoute(origin, dest);

      expect(firstCall.durationMinutes).toBe(secondCall.durationMinutes);
      expect(firstCall.calculatedAt).toBe(secondCall.calculatedAt);
    });

    it('should batch calculate walking routes and respect candidate bounds', async () => {
      const origin = { lat: 41.311087, lng: 69.279737 };
      const candidates = Array.from({ length: 45 }, (_, i) => ({
        id: `prop-${i}`,
        latitude: 41.3110 + i * 0.001,
        longitude: 69.2797 + i * 0.001,
      }));

      const batchResult = await routingService.batchCalculateWalkingRoutes(origin, candidates, 20);

      // Should limit to 20 candidates
      expect(batchResult.size).toBe(20);
      expect(batchResult.get('prop-0')).toBeDefined();
      expect(batchResult.get('prop-19')).toBeDefined();
      expect(batchResult.get('prop-20')).toBeUndefined();
    });
  });

  describe('SmartNearbyService', () => {
    it('should compute verified nearby POIs and objective category convenience scores', async () => {
      // Coordinate near Novza / Qatortol
      const lat = 41.2825;
      const lng = 69.2152;

      const context = await smartNearbyService.getNearbyContext(lat, lng);

      expect(context.overallConvenienceScore).toBeGreaterThanOrEqual(60);
      expect(context.overallConvenienceScore).toBeLessThanOrEqual(100);

      expect(context.categoryScores.transport).toBeGreaterThan(0);
      expect(context.categoryScores.education).toBeGreaterThan(0);
      expect(context.categoryScores.shopping).toBeGreaterThan(0);
      expect(context.categoryScores.healthcare).toBeGreaterThan(0);
      expect(context.categoryScores.recreation).toBeGreaterThan(0);

      expect(context.poiItems.length).toBeGreaterThan(0);
      const closest = context.poiItems[0];
      expect(closest.walkingMinutes).toBeGreaterThanOrEqual(1);
      expect(closest.routeDistanceMeters).toBeGreaterThanOrEqual(closest.straightLineMeters);
    });
  });
});
