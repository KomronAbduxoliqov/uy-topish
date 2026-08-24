# 🏠 UyTop — AI-Powered Real Estate Discovery Platform for Uzbekistan

<p align="center">
  <img src="apps/web/public/icons/icon-512x512.png" alt="UyTop Logo" width="120" height="120" style="border-radius: 24px;" />
</p>

<p align="center">
  <b>Toshkent va butun O'zbekiston bo'ylab uylar va kvartiralarni topishning eng zamonaviy, aqlli xaritaga asoslangan platformasi.</b>
  <br />
  <i>Next.js 14 App Router • NestJS Modular Monolith • PostgreSQL 16 • Redis 7 • Yandex Maps • Gemini AI</i>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/NestJS-10.0-E0234E?style=flat-square&logo=nestjs" alt="NestJS" />
  <img src="https://img.shields.io/badge/PostgreSQL-16.0-336791?style=flat-square&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Redis-7.0-DC382D?style=flat-square&logo=redis" alt="Redis" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker" alt="Docker" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="License" />
</p>

---

## 🚀 Asosiy Imkoniyatlar (Key Features)

- 🗺️ **Map-First Discovery Canvas**: Yandex Maps SDK bilan chuqur integratsiya, narx belgilari (badges), klasterlash, radius bo'yicha qidiruv, piyoda yurish vaqti (isochrone) va xaritada chizib qidirish (polygon).
- 🤖 **AI Shaxsiy Uy Topuvchi (AI Home Finder)**: Foydalanuvchi talablari (byudjet, ish/o'qishgacha masofa, xonalar) asosida har bir e'longa shaxsiy moslik reytingini (%) hisoblovchi intellektual agent.
- 🔍 **Aqlli NLP Qidiruv**: O'zbek va Rus tillaridagi erkin matnli qidiruv ("Chilonzorda 500$ gacha 2 xonali metro yaqinida").
- 🧮 **Ipoteka Kalkulyatori**: O'zbekiston banklarining real foiz stavkalari bo'yicha oylik to'lov va dastlabki badalni hisoblash.
- 📄 **Ijara Shartnomasi Generatori**: O'zbekiston qonunchiligiga mos avtomatik ijara shartnomasini (PDF/Print) shakllantirish.
- 📊 **Bozor Narxini Baholash (AI Valuation)**: Kvadrat metr narxlari va o'rtacha bozor narxiga nisbatan arzon/qimmatlik indeksi.
- 🛡️ **Firibgarlikdan Himoya (Anti-Fraud & Trust)**: Narx anomaliyalari, soxta rieltorlar va xavf darajasini avtomatik baholash (Risk Score).
- 📢 **Telegram Xabarnomalar**: Yangi e'lonlar va narx pasayishi haqida tezkor Telegram bildirishnomalar.
- 🌓 **Zamonaviy UI/UX**: Qorong'i/Yorug' rejim (Dark Mode), to'liq ko'p tilli (O'zbek / Rus), PWA, mobil moslashuvchanlik va Toast bildirishnomalari.
- 👑 **Admin va Moderatsiya Paneli**: E'lonlarni tasdiqlash, rad etish va shikoyatlarni boshqarish.

---

## 🏗️ Arxitektura va Monorepo Strukturasi

```
uytop/
├── apps/
│   ├── api/                  # NestJS Modular Monolith API
│   │   ├── src/
│   │   │   ├── common/       # Guards (JWT, RBAC), Interceptors, Sanitizers, Filters
│   │   │   ├── database/     # TypeORM Entities (User, Property, Risk, etc.) & Seeds
│   │   │   └── modules/      # Auth, Geo, Properties, Search, AI, Fraud Protection, Admin
│   │   └── package.json
│   │
│   └── web/                  # Next.js 14 App Router Frontend
│       ├── src/
│       │   ├── app/          # [locale] Dinamik marshrutlash (/uz, /ru), SEO, OpenGraph
│       │   ├── components/   # UI komponentlar, Navbar, Footer, Toast, DarkMode
│       │   ├── features/     # Map, Search, AI Home Finder, Calculator, Contract, Wizard
│       │   └── i18n/         # O'zbek va Rus tillari lug'atlari
│       └── package.json
│
├── packages/
│   └── shared-types/         # Umumiy TypeScript Enums, DTOs & Interfaces
│
├── infrastructure/
│   ├── docker/               # Dockerfile.api, Dockerfile.web, docker-compose.prod.yml
│   ├── nginx/                # Production Reverse Proxy & SSL konfiguratsiyasi
│   └── scripts/              # backup-db.sh, restore-db.sh (Zaxiralash skriptlari)
│
├── e2e/                      # Playwright E2E Testlari (10 ta to'liq ssenariy)
├── docs/                     # ARCHITECTURE.md & PRODUCTION_RUNBOOK.md
└── .github/workflows/        # CI/CD (GitHub Actions avtomatik test va deploy)
```

---

## ⚡ Tezkor Ishga Tushirish (Quick Start)

### 1. Talablar:
- **Node.js**: `>= 20.0.0`
- **npm**: `>= 10.0.0`
- **Docker & Docker Compose** (ma'lumotlar bazasi va Redis uchun)

### 2. O'rnatish:
```bash
# Repozitoriyani klonlash
git clone https://github.com/USERNAME/uy-kvartira-topish.git
cd uy-kvartira-topish

# Bog'liqliklarni o'rnatish
npm install

# Shared types paketini build qilish
npm run build --workspace=@uytop/shared-types
```

### 3. Konfiguratsiya (.env):
```bash
cp .env.example .env
```
Faylni ochib kerakli kalitlarni kiriting (Yandex Maps API key, Gemini API key va h.k.).

### 4. Ma'lumotlar bazasini ishga tushirish (Docker):
```bash
npm run docker:up
```

### 5. Dasturiy ta'minotni dev rejimda ishga tushirish:
```bash
npm run dev
```

Platforma quyidagi manzillarda ochiladi:
* 🌐 **Frontend**: [http://localhost:3000](http://localhost:3000)
* 📡 **Backend API**: [http://localhost:4000](http://localhost:4000)
* 📚 **Swagger API Docs**: [http://localhost:4000/api/docs](http://localhost:4000/api/docs)

---

## 🐳 Production Deployment (Docker Compose)

Haqiqiy serverda (VPS/Cloud) zero-downtime rejimda ishga tushirish:

```bash
# 1. Production sozlamalarini yaratish
cp .env.production.example .env.production

# 2. To'liq stackni ko'tarish (PostgreSQL, Redis, API, Web, Nginx)
docker compose -f infrastructure/docker/docker-compose.prod.yml up -d --build

# 3. Holatni tekshirish
curl -f http://localhost:4000/api/v1/health/ready
```

Batafsil qo'llanma: [`docs/PRODUCTION_RUNBOOK.md`](docs/PRODUCTION_RUNBOOK.md).

---

## 🧪 Testlash (Testing)

```bash
# Frontend va Backend unit testlari
npm run test

# Typecheck (TypeScript xatolarini tekshirish)
npm run typecheck

# E2E testlarni ishga tushirish (Playwright)
npm run test:e2e
```

---

## 🔒 Xavfsizlik (Security)

- **Doimiy vaqtli (Constant-Time) Bcrypt solishtiruvi**: Timing attack xurujlariga qarshi himoya.
- **Brute-Force Lockout**: 5 marta ketma-ket xato parolda hisobni vaqtincha bloklash.
- **Rate Limiting & Anti-Scraping**: IP va user darajasida so'rovlar chegarasi.
- **XSS & SQL Injection himoyasi**: Class-validator, TypeORM parameterized queries va Sanitize HTML pipes.
- **Xavfsiz Geokodlash**: B-tree koordinata indekslari va Haversine formulasi orqali tezkor va xavfsiz qidiruv.

---

## 📄 Litsenziya (License)

Ushbu loyiha [MIT License](LICENSE) asosida tarqatiladi.
