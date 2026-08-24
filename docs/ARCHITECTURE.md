# UyTop — Production Technical Architecture & Operations Guide
**Next.js App Router + NestJS Modular Monolith + PostgreSQL 16 + Redis**

---

## 1. Executive Overview
**UyTop** is an AI-powered, map-first real estate discovery platform built specifically for Uzbekistan.
The platform uses **Next.js 14 App Router** for the frontend client/SSR layer, **NestJS** for the backend domain monolith, **PostgreSQL 16** with indexed geographical coordinates for fast radius and bounding queries, and **Redis 7** for caching and rate limiting.

---

## 2. Production Topology & Monorepo Structure

```
uy-kvartira-topish/
├── apps/
│   ├── api/                                  # NestJS Modular Monolith API
│   │   ├── src/
│   │   │   ├── common/                       # Guards (JWT, Roles RBAC), Interceptors, Exception Filters
│   │   │   ├── database/                     # Entities (User, Property, Image, Favorite, Moderation), Seeds
│   │   │   ├── modules/                      # Auth, Geo, Properties, Search, AI, Favorites, Moderation, Admin
│   │   │   ├── app.module.ts
│   │   │   └── main.ts                       # Swagger OpenAPI v3 docs (/api/docs), Validation Pipes
│   │   └── package.json
│   │
│   └── web/                                  # Next.js 14 App Router Frontend
│       ├── src/
│       │   ├── app/
│       │   │   ├── [locale]/                 # Dynamic Locale Routing (/uz, /ru)
│       │   │   │   ├── layout.tsx            # Server Layout (Metadata, Google Fonts, Yandex Maps SDK)
│       │   │   │   ├── page.tsx              # Discovery Canvas (Map + AI Search + Filters + Property Cards)
│       │   │   │   └── properties/[id]/
│       │   │   │       └── page.tsx          # Dynamic SEO Property Page (OpenGraph, Schema.org JSON-LD)
│       │   │   ├── globals.css               # Design tokens & custom Yandex Map price badge styles
│       │   │   ├── page.tsx                  # Locale redirector (/ -> /uz)
│       │   │   ├── robots.ts                 # Dynamic robots.txt
│       │   │   └── sitemap.ts                # Dynamic sitemap.xml
│       │   ├── components/                   # Navbar, UI Controls, Modals
│       │   ├── features/                     # Map (Yandex SDK), Search, Properties, Wizard, Auth, Admin
│       │   ├── lib/api/client.ts             # Typed Isomorphic API Client
│       │   ├── store/useAppStore.ts          # SSR-safe Zustand Global Store
│       │   └── i18n/index.ts                 # Uzbek & Russian Localization Dictionaries
│       ├── next.config.mjs                   # API Proxy Rewrites to NestJS & Image Domains
│       └── package.json
│
├── packages/
│   └── shared-types/                         # Shared TypeScript Enums, DTOs & Domain Models
│
├── infrastructure/
│   ├── docker/
│   │   ├── Dockerfile.api                    # Multi-stage Alpine Container for NestJS
│   │   ├── Dockerfile.web                    # Multi-stage Alpine Container for Next.js
│   │   └── docker-compose.yml                # Full Stack Orchestration (PostgreSQL, Redis, API, Web, Nginx)
│   └── nginx/
│       └── default.conf                      # Production Reverse Proxy & SSL Gateway
│
├── .github/workflows/                        # GitHub Actions CI/CD Workflows
├── .env.example
└── package.json
```

---

## 3. High-Performance Spatial & Radius Strategy

Properties store high-precision geographical coordinates (`latitude`, `longitude`) with composite B-Tree indexing.
Radius queries use the standard Great-Circle Haversine formula and bounding boxes:

```sql
SELECT p.*,
       (6371000 * acos(
         cos(radians(:centerLat)) * cos(radians(p.latitude)) *
         cos(radians(p.longitude) - radians(:centerLng)) +
         sin(radians(:centerLat)) * sin(radians(p.latitude))
       )) AS distance_meters
FROM properties p
WHERE p.status = 'PUBLISHED'
  AND p.latitude BETWEEN :minLat AND :maxLat
  AND p.longitude BETWEEN :minLng AND :maxLng
ORDER BY distance_meters ASC;
```

---

## 4. Running the Full Production Stack

### Full Stack Docker Orchestration:
```bash
docker compose -f infrastructure/docker/docker-compose.yml up -d
```
* **Web Frontend**: `http://localhost:80` (or `http://localhost:3000`)
* **API Swagger Docs**: `http://localhost:4000/api/docs`
* **Health Check**: `http://localhost:4000/api/v1/geo/districts`

### Local Development:
```bash
# 1. Install dependencies
npm install

# 2. Build shared types
npm run build --workspace=@uytop/shared-types

# 3. Start development servers concurrently
npm run dev
```
