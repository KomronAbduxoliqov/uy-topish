# UyTop Technical Architecture & Operations Guide

## 1. Executive Summary
**UyTop** is a high-performance, AI-driven, map-first real estate platform built specifically for Uzbekistan.
It replaces legacy text-only bulletin boards with spatial discovery (Yandex Maps + PostGIS) and natural-language intent processing grounded in factual database listings.

---

## 2. System Overview & Monorepo Topology
```
uy-kvartira-topish/
├── apps/
│   ├── api/                    # NestJS Core Modular Monolith API
│   │   └── src/modules/
│   │       ├── auth/           # JWT, +998 validation, RBAC
│   │       ├── geo/            # PostGIS calculations, Metro stations, Districts
│   │       ├── properties/     # Real estate CRUD, photo galleries, seeders
│   │       ├── search/         # Spatial radius, faceted & full-text search
│   │       ├── ai/             # Intent parser, grounded commentary generator
│   │       ├── favorites/      # Saved listings & property compare matrix
│   │       ├── moderation/     # Listing review queue, duplicate detection
│   │       └── admin/          # Metrics, user management
│   └── web/                    # React 18 + Vite + Tailwind Client
│       └── src/
│           ├── features/
│           │   ├── map/        # Yandex Maps SDK 2.1, Custom price badges, Radius circle
│           │   ├── search/     # Natural language AI search hero & Filter bar
│           │   ├── properties/ # Listing cards, Detail view, Compare matrix
│           │   ├── wizard/     # 10-step listing creation wizard
│           │   ├── auth/       # Phone login & registration modal
│           │   └── admin/      # Moderation control center
│           └── store/          # Zustand global state manager
├── packages/
│   └── shared-types/           # Shared TypeScript enums, models, and DTOs
└── infrastructure/
    ├── docker/                 # Dockerfiles for API, Web, and Compose
    └── nginx/                  # Nginx reverse proxy configuration
```

---

## 3. Spatial & PostGIS Implementation
Coordinates are indexed using spatial Euclidean/Spherical Great-Circle formulas.
For PostGIS SQL:
```sql
SELECT p.*,
       ST_Distance(
         ST_SetSRID(ST_MakePoint(p.longitude, p.latitude), 4326)::geography,
         ST_SetSRID(ST_MakePoint(:centerLng, :centerLat), 4326)::geography
       ) AS distance_meters
FROM properties p
WHERE p.status = 'PUBLISHED'
  AND ST_DWithin(
    ST_SetSRID(ST_MakePoint(p.longitude, p.latitude), 4326)::geography,
    ST_SetSRID(ST_MakePoint(:centerLng, :centerLat), 4326)::geography,
    :radiusMeters
  )
ORDER BY distance_meters ASC;
```

---

## 4. AI Grounding & Anti-Hallucination Pipeline
1. User enters natural query (*"Chilonzorda metroga yaqin 4 mln gacha 2 xonali mebelli"*).
2. NLP Extractor extracts structured intent: `{ district: 'Chilonzor', rooms: 2, maxPrice: 4000000, furnished: true, nearMetro: true }`.
3. Strict SQL query runs against the verified PostgreSQL database.
4. Explanations and recommendations are generated strictly from returned database records.

---

## 5. Running the Application

### Method A: Standalone Quick Run (Frontend with mock-ready backend client)
```bash
npm install
npm run build --workspace=@uytop/shared-types
npm run dev:web
```

### Method B: Full Stack Docker Compose
```bash
docker compose -f infrastructure/docker/docker-compose.yml up -d
```
API Documentation: `http://localhost:4000/api/docs`
Web Application: `http://localhost:3000` (or `http://localhost:80` via Docker)
