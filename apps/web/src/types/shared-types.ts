/**
 * UyTop - Core Shared Types & Enums (Uzbekistan-First Real Estate)
 */

export enum UserRole {
  USER = 'USER',
  OWNER = 'OWNER',
  AGENT = 'AGENT',
  AGENCY = 'AGENCY',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN'
}

export enum UserVerificationStatus {
  UNVERIFIED = 'UNVERIFIED',
  PHONE_VERIFIED = 'PHONE_VERIFIED',
  IDENTITY_VERIFIED = 'IDENTITY_VERIFIED',
  AGENT_LICENSED = 'AGENT_LICENSED'
}

export enum TransactionType {
  RENT = 'RENT',             // Ijaraga beriladi (uzoq muddatli)
  SALE = 'SALE',             // Sotiladi
  DAILY = 'DAILY'            // Kunlik ijara
}

export enum PropertyType {
  APARTMENT = 'APARTMENT',   // Kvartira
  HOUSE = 'HOUSE',           // Hovli / Uy
  ROOM = 'ROOM',             // Xona
  TOWNHOUSE = 'TOWNHOUSE',   // Taunxaus
  LAND = 'LAND',             // Yer uchastkasi
  COMMERCIAL = 'COMMERCIAL'  // Tijorat ko'chmas mulki
}

export enum RenovationType {
  NEW = 'NEW',                   // Yangi / Evro ta'mir
  RENOVATED = 'RENOVATED',       // Yaxshi ta'mirlangan
  COSMETIC = 'COSMETIC',         // Kosmetik ta'mir
  AVERAGE = 'AVERAGE',           // O'rtacha ta'mir
  NEEDS_REPAIR = 'NEEDS_REPAIR'  // Ta'mirtalab
}

export enum BuildingType {
  BRICK = 'BRICK',       // G'ishtli
  MONOLITH = 'MONOLITH', // Monolit
  PANEL = 'PANEL',       // Panelli
  BLOCK = 'BLOCK'        // Blokli
}

export enum ListingStatus {
  DRAFT = 'DRAFT',
  PENDING_MODERATION = 'PENDING_MODERATION',
  PUBLISHED = 'PUBLISHED',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED',
  ARCHIVED = 'ARCHIVED',
  SOLD_RENTED = 'SOLD_RENTED'
}

export enum VerificationTier {
  UNVERIFIED = 'UNVERIFIED',
  PHONE_VERIFIED = 'PHONE_VERIFIED',
  DOCS_VERIFIED = 'DOCS_VERIFIED',
  INSPECTED = 'INSPECTED'
}

export enum Currency {
  UZS = 'UZS',
  USD = 'USD'
}

export interface AmenityDefinition {
  key: string;
  nameUz: string;
  nameRu: string;
  nameEn?: string;
  icon: string;
  category: 'comfort' | 'appliances' | 'infrastructure' | 'security';
}

export const UZBEK_AMENITIES: AmenityDefinition[] = [
  { key: 'furnished', nameUz: 'Mebellar bilan', nameRu: 'С мебелью', nameEn: 'Furnished', icon: 'Armchair', category: 'comfort' },
  { key: 'air_conditioner', nameUz: 'Konditsioner', nameRu: 'Кондиционер', nameEn: 'Air Conditioner', icon: 'AirVent', category: 'appliances' },
  { key: 'washing_machine', nameUz: 'Kir yuvish mashinasi', nameRu: 'Стиральная машина', nameEn: 'Washing Machine', icon: 'Disc3', category: 'appliances' },
  { key: 'refrigerator', nameUz: 'Muzlatgich', nameRu: 'Холодильник', nameEn: 'Refrigerator', icon: 'Refrigerator', category: 'appliances' },
  { key: 'internet', nameUz: 'Wi-Fi / Internet', nameRu: 'Wi-Fi / Интернет', nameEn: 'Wi-Fi / Internet', icon: 'Wifi', category: 'comfort' },
  { key: 'tv', nameUz: 'Televizor', nameRu: 'Телевизор', nameEn: 'TV', icon: 'Tv', category: 'appliances' },
  { key: 'balcony', nameUz: 'Balkon', nameRu: 'Балкон', nameEn: 'Balcony', icon: 'Fence', category: 'comfort' },
  { key: 'elevator', nameUz: 'Lift', nameRu: 'Лифт', nameEn: 'Elevator', icon: 'ArrowUpDown', category: 'infrastructure' },
  { key: 'parking', nameUz: 'Avtoturargoh', nameRu: 'Парковка', nameEn: 'Parking', icon: 'Car', category: 'infrastructure' },
  { key: 'security', nameUz: 'Qo\'riqlash xizmati', nameRu: 'Охрана / Консьерж', nameEn: '24/7 Security', icon: 'ShieldCheck', category: 'security' },
  { key: 'heating', nameUz: 'Avtonom isitish', nameRu: 'Автономное отопление', nameEn: 'Autonomous Heating', icon: 'Flame', category: 'comfort' },
  { key: 'playground', nameUz: 'Bolalar maydonchasi', nameRu: 'Детская площадка', nameEn: 'Children Playground', icon: 'Smile', category: 'infrastructure' }
];

// ─── Multi-City Support ───────────────────────────────────────────────────────
export enum SupportedCity {
  TASHKENT = 'TASHKENT',
  SAMARKAND = 'SAMARKAND',
  BUKHARA = 'BUKHARA',
  FERGANA = 'FERGANA',
  NAMANGAN = 'NAMANGAN',
  NUKUS = 'NUKUS',
  ANDIJAN = 'ANDIJAN',
  KARSHI = 'KARSHI',
  NAVOIY = 'NAVOIY',
  JIZZAKH = 'JIZZAKH'
}

export interface CityDefinition {
  id: SupportedCity;
  nameUz: string;
  nameRu: string;
  nameEn: string;
  lat: number;
  lng: number;
  defaultZoom: number;
  hasMetro: boolean;
  isActive: boolean;
}

export const UZBEKISTAN_CITIES: CityDefinition[] = [
  { id: SupportedCity.TASHKENT, nameUz: 'Toshkent', nameRu: 'Ташкент', nameEn: 'Tashkent', lat: 41.311087, lng: 69.279737, defaultZoom: 12, hasMetro: true, isActive: true },
  { id: SupportedCity.SAMARKAND, nameUz: 'Samarqand', nameRu: 'Самарканд', nameEn: 'Samarkand', lat: 39.6542, lng: 66.9597, defaultZoom: 13, hasMetro: false, isActive: true },
  { id: SupportedCity.BUKHARA, nameUz: 'Buxoro', nameRu: 'Бухара', nameEn: 'Bukhara', lat: 39.7747, lng: 64.4286, defaultZoom: 13, hasMetro: false, isActive: true },
  { id: SupportedCity.FERGANA, nameUz: "Farg'ona", nameRu: 'Фергана', nameEn: 'Fergana', lat: 40.3842, lng: 71.7869, defaultZoom: 13, hasMetro: false, isActive: true },
  { id: SupportedCity.NAMANGAN, nameUz: 'Namangan', nameRu: 'Наманган', nameEn: 'Namangan', lat: 40.9983, lng: 71.6726, defaultZoom: 13, hasMetro: false, isActive: true },
  { id: SupportedCity.NUKUS, nameUz: 'Nukus', nameRu: 'Нукус', nameEn: 'Nukus', lat: 42.4628, lng: 59.6003, defaultZoom: 13, hasMetro: false, isActive: false },
  { id: SupportedCity.ANDIJAN, nameUz: 'Andijon', nameRu: 'Андижан', nameEn: 'Andijan', lat: 40.7821, lng: 72.3442, defaultZoom: 13, hasMetro: false, isActive: false },
  { id: SupportedCity.KARSHI, nameUz: 'Qarshi', nameRu: 'Карши', nameEn: 'Karshi', lat: 38.8611, lng: 65.7983, defaultZoom: 13, hasMetro: false, isActive: false },
  { id: SupportedCity.NAVOIY, nameUz: 'Navoiy', nameRu: 'Навои', nameEn: 'Navoiy', lat: 40.0844, lng: 65.3792, defaultZoom: 13, hasMetro: false, isActive: false },
  { id: SupportedCity.JIZZAKH, nameUz: 'Jizzax', nameRu: 'Джизак', nameEn: 'Jizzakh', lat: 40.1158, lng: 67.8422, defaultZoom: 13, hasMetro: false, isActive: false }
];

export interface TashkentDistrict {
  id: string;
  nameUz: string;
  nameRu: string;
  nameEn?: string;
  lat: number;
  lng: number;
}

export const TASHKENT_DISTRICTS: TashkentDistrict[] = [
  { id: 'chilonzor', nameUz: 'Chilonzor', nameRu: 'Чиланзар', nameEn: 'Chilanzar', lat: 41.2721, lng: 69.2045 },
  { id: 'yunusobod', nameUz: 'Yunusobod', nameRu: 'Юнусабад', nameEn: 'Yunusabad', lat: 41.3654, lng: 69.2887 },
  { id: 'mirzo_ulugbek', nameUz: 'Mirzo Ulug\'bek', nameRu: 'Мирзо-Улугбек', nameEn: 'Mirzo Ulugbek', lat: 41.3392, lng: 69.3364 },
  { id: 'mirobod', nameUz: 'Mirobod', nameRu: 'Мирабад', nameEn: 'Mirobod', lat: 41.2883, lng: 69.2842 },
  { id: 'yakkasaroy', nameUz: 'Yakkasaroy', nameRu: 'Яккасарай', nameEn: 'Yakkasaray', lat: 41.2815, lng: 69.2497 },
  { id: 'shayxontohur', nameUz: 'Shayxontohur', nameRu: 'Шайхантахур', nameEn: 'Shaykhontokhur', lat: 41.3217, lng: 69.2384 },
  { id: 'olmazor', nameUz: 'Olmazor', nameRu: 'Алмазар', nameEn: 'Olmazor', lat: 41.3533, lng: 69.2241 },
  { id: 'sergeli', nameUz: 'Sergeli', nameRu: 'Сергели', nameEn: 'Sergeli', lat: 41.2268, lng: 69.2215 },
  { id: 'yangihayot', nameUz: 'Yangihayot', nameRu: 'Янгихаёт', nameEn: 'Yangihayot', lat: 41.1982, lng: 69.1994 },
  { id: 'uchtepa', nameUz: 'Uchtepa', nameRu: 'Учтепа', nameEn: 'Uchtepa', lat: 41.2952, lng: 69.1764 },
  { id: 'yashnobod', nameUz: 'Yashnobod', nameRu: 'Яшнабад', nameEn: 'Yashnobod', lat: 41.2965, lng: 69.3382 },
  { id: 'bektemir', nameUz: 'Bektemir', nameRu: 'Бектемир', nameEn: 'Bektemir', lat: 41.2334, lng: 69.3367 }
];

export interface MetroStation {
  id: string;
  nameUz: string;
  nameRu: string;
  nameEn?: string;
  line: 'Chilonzor' | 'O\'zbekiston' | 'Yunusobod' | 'Yerusti';
  lat: number;
  lng: number;
}

export const TASHKENT_METRO_STATIONS: MetroStation[] = [
  { id: 'buyuk_ipak_yoli', nameUz: 'Buyuk Ipak Yo\'li', nameRu: 'Буюк Ипак Йули', nameEn: 'Buyuk Ipak Yoli', line: 'Chilonzor', lat: 41.3262, lng: 69.3275 },
  { id: 'pushkin', nameUz: 'Pushkin', nameRu: 'Пушкин', nameEn: 'Pushkin', line: 'Chilonzor', lat: 41.3204, lng: 69.3097 },
  { id: 'hamid_olimjon', nameUz: 'Hamid Olimjon', nameRu: 'Хамид Олимджан', nameEn: 'Hamid Olimjon', line: 'Chilonzor', lat: 41.3175, lng: 69.2941 },
  { id: 'amir_temur_xiyoboni', nameUz: 'Amir Temur Xiyoboni', nameRu: 'Амир Темур Хиёбони', nameEn: 'Amir Temur Square', line: 'Chilonzor', lat: 41.3134, lng: 69.2796 },
  { id: 'mustaqillik_maydoni', nameUz: 'Mustaqillik Maydoni', nameRu: 'Мустакиллик Майдони', nameEn: 'Mustaqillik Maydoni', line: 'Chilonzor', lat: 41.3157, lng: 69.2678 },
  { id: 'paxtakor', nameUz: 'Paxtakor', nameRu: 'Пахтакор', nameEn: 'Pakhtakor', line: 'Chilonzor', lat: 41.3129, lng: 69.2568 },
  { id: 'xalqlar_dostligi', nameUz: 'Xalqlar Do\'stligi', nameRu: 'Дружба Народов', nameEn: 'Khalklar Dustligi', line: 'Chilonzor', lat: 41.3114, lng: 69.2415 },
  { id: 'milliy_bog', nameUz: 'Milliy Bog\'', nameRu: 'Миллий Бог', nameEn: 'Milliy Bog', line: 'Chilonzor', lat: 41.3031, lng: 69.2319 },
  { id: 'novza', nameUz: 'Novza', nameRu: 'Новза', nameEn: 'Novza', line: 'Chilonzor', lat: 41.2917, lng: 69.2227 },
  { id: 'mirzo_ulugbek_m', nameUz: 'Mirzo Ulug\'bek', nameRu: 'Мирзо Улугбек', nameEn: 'Mirzo Ulugbek', line: 'Chilonzor', lat: 41.2825, lng: 69.2132 },
  { id: 'chilonzor_m', nameUz: 'Chilonzor', nameRu: 'Чиланзар', nameEn: 'Chilanzar', line: 'Chilonzor', lat: 41.2726, lng: 69.2023 },
  { id: 'olmazor_m', nameUz: 'Olmazor', nameRu: 'Алмазар', nameEn: 'Olmazor', line: 'Chilonzor', lat: 41.2584, lng: 69.1914 },
  { id: 'beruniy', nameUz: 'Beruniy', nameRu: 'Беруни', nameEn: 'Beruniy', line: 'O\'zbekiston', lat: 41.3444, lng: 69.2057 },
  { id: 'tinchlik', nameUz: 'Tinchlik', nameRu: 'Тинчлик', nameEn: 'Tinchlik', line: 'O\'zbekiston', lat: 41.3364, lng: 69.2235 },
  { id: 'chorsu', nameUz: 'Chorsu', nameRu: 'Чорсу', nameEn: 'Chorsu', line: 'O\'zbekiston', lat: 41.3263, lng: 69.2372 },
  { id: 'kosmonavtlar', nameUz: 'Kosmonavtlar', nameRu: 'Космонавтов', nameEn: 'Kosmonavtlar', line: 'O\'zbekiston', lat: 41.3069, lng: 69.2625 },
  { id: 'oybek', nameUz: 'Oybek', nameRu: 'Ойбек', nameEn: 'Oybek', line: 'O\'zbekiston', lat: 41.2995, lng: 69.2758 },
  { id: 'toshkent', nameUz: 'Toshkent', nameRu: 'Ташкент', nameEn: 'Tashkent', line: 'O\'zbekiston', lat: 41.2934, lng: 69.2882 },
  { id: 'shahriston', nameUz: 'Shahriston', nameRu: 'Шахристан', nameEn: 'Shahriston', line: 'Yunusobod', lat: 41.3537, lng: 69.2884 },
  { id: 'bodomzor', nameUz: 'Bodomzor', nameRu: 'Бадамзар', nameEn: 'Bodomzor', line: 'Yunusobod', lat: 41.3367, lng: 69.2842 },
  { id: 'minor', nameUz: 'Minor', nameRu: 'Минор', nameEn: 'Minor', line: 'Yunusobod', lat: 41.3265, lng: 69.2818 },
  { id: 'abdulla_qodiriy', nameUz: 'Abdulla Qodiriy', nameRu: 'Абдулла Кадыри', nameEn: 'Abdulla Qodiriy', line: 'Yunusobod', lat: 41.3197, lng: 69.2801 }
];

export interface GeoLocation {
  lat: number;
  lng: number;
  addressLine?: string;
  city?: string;
  district?: string;
  mahalla?: string;
}

export interface PropertyImage {
  id: string;
  propertyId: string;
  originalUrl: string;
  webpUrl: string;
  thumbnailUrl: string;
  displayOrder: number;
  isCover: boolean;
}

export interface Property {
  id: string;
  ownerId: string;
  agentId?: string;
  agencyId?: string;
  titleUz: string;
  titleRu?: string;
  titleEn?: string;
  descriptionUz: string;
  descriptionRu?: string;
  descriptionEn?: string;
  transactionType: TransactionType;
  propertyType: PropertyType;
  priceUzs: number;
  priceUsd: number;
  rooms: number;
  bedrooms?: number;
  bathrooms?: number;
  areaSqm: number;
  livingAreaSqm?: number;
  landAreaSotix?: number;
  floor?: number;
  totalFloors?: number;
  renovation: RenovationType;
  furnished: boolean;
  buildingType?: BuildingType;
  yearBuilt?: number;
  addressLine: string;
  city: string;
  district: string;
  mahalla?: string;
  latitude: number;
  longitude: number;
  amenities: Record<string, boolean>;
  images: PropertyImage[];
  status: ListingStatus;
  verificationTier: VerificationTier;
  viewCount: number;
  contactClickCount: number;
  nearestMetroStation?: string;
  nearestMetroDistanceMeters?: number;
  travelMetadata?: RouteTravelResult;
  smartNearby?: SmartNearbyContext;
  matchScore?: number;
  matchReasons?: string[];
  ownerPhone?: string;
  ownerName?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface PropertySearchFilters {
  query?: string;
  transactionType?: TransactionType;
  propertyType?: PropertyType | PropertyType[];
  city?: string;
  district?: string;
  minPrice?: number;
  maxPrice?: number;
  currency?: Currency;
  rooms?: number[];
  minArea?: number;
  maxArea?: number;
  renovation?: RenovationType[];
  furnished?: boolean;
  buildingType?: BuildingType[];
  verificationTier?: VerificationTier[];
  
  // Geo Spatial Filters
  centerLat?: number;
  centerLng?: number;
  radiusMeters?: number; // 300, 500, 1000, 2000, 5000
  nearMetro?: boolean;
  metroStationId?: string;

  // Travel Time & Accessibility Filters
  searchMode?: 'RADIUS' | 'WALKING_TIME' | 'TRAVEL_DISTANCE';
  travelMode?: 'WALKING' | 'DRIVING' | 'TRANSIT';
  travelMinutes?: number; // 5, 10, 15, 20, 30
  originLat?: number;
  originLng?: number;
  originName?: string;
  
  // Pagination & Sorting
  page?: number;
  limit?: number;
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'distance' | 'walking_time' | 'relevance';
}

export interface ParsedAIIntent {
  rawQuery: string;
  detectedLanguage: 'uz' | 'ru' | 'en' | 'mixed';
  transactionType?: TransactionType;
  propertyType?: PropertyType;
  district?: string;
  rooms?: number;
  minPrice?: number;
  maxPrice?: number;
  furnished?: boolean;
  nearMetro?: boolean;
  metroStationName?: string;
  renovation?: RenovationType;
  minArea?: number;
  maxArea?: number;
  centerLat?: number;
  centerLng?: number;
  radiusMeters?: number;
  confidenceScore: number;
  explanationUz: string;
  explanationRu: string;
  explanationEn?: string;
}

export interface PropertyComparisonResult {
  properties: Property[];
  criteria: {
    priceComparison: { id: string; pricePerSqm: number; isLowest: boolean }[];
    areaComparison: { id: string; areaSqm: number; isLargest: boolean }[];
    locationScore: { id: string; score: number; distanceToCenterMeters: number }[];
    amenitiesDiff: { amenityKey: string; nameUz: string; availableIn: string[] }[];
  };
}

export interface UserProfile {
  id: string;
  phone: string;
  email?: string;
  fullName: string;
  role: UserRole;
  verificationStatus: UserVerificationStatus;
  avatarUrl?: string;
  agencyName?: string;
  agentLicenseNo?: string;
  rating?: number;
  activeListingsCount?: number;
  createdAt: string;
}

// ==========================================
// AI PERSONAL HOME FINDER TYPES & MODELS
// ==========================================

export interface KnownLandmark {
  id: string;
  nameUz: string;
  nameRu: string;
  nameEn?: string;
  category: 'business' | 'university' | 'mall' | 'transport' | 'park';
  lat: number;
  lng: number;
}

export const TASHKENT_LANDMARKS: KnownLandmark[] = [
  { id: 'tashkent_city', nameUz: 'Tashkent City', nameRu: 'Ташкент Сити', nameEn: 'Tashkent City', category: 'business', lat: 41.3142, lng: 69.2482 },
  { id: 'inha', nameUz: 'INHA Universiteti', nameRu: 'Университет ИНХА', nameEn: 'INHA University', category: 'university', lat: 41.3385, lng: 69.3346 },
  { id: 'wiut', nameUz: 'Westminster (WIUT)', nameRu: 'Вестминстерский университет', nameEn: 'Westminster University (WIUT)', category: 'university', lat: 41.3069, lng: 69.2831 },
  { id: 'tatu', nameUz: 'TATU', nameRu: 'ТУИТ (ТАТУ)', nameEn: 'TUIT', category: 'university', lat: 41.3411, lng: 69.2862 },
  { id: 'chorsu_bozori', nameUz: 'Chorsu Bozori', nameRu: 'Рынок Чорсу', nameEn: 'Chorsu Bazaar', category: 'mall', lat: 41.3275, lng: 69.2355 },
  { id: 'aeroport', nameUz: 'Toshkent Xalqaro Aeroporti', nameRu: 'Международный Аэропорт Ташкент', nameEn: 'Tashkent International Airport', category: 'transport', lat: 41.2579, lng: 69.2812 },
  { id: 'magic_city', nameUz: 'Magic City bog\'i', nameRu: 'Парк Magic City', nameEn: 'Magic City Park', category: 'park', lat: 41.3039, lng: 69.2488 },
  { id: 'ecopark', nameUz: 'Ecopark', nameRu: 'Экопарк', nameEn: 'Ecopark', category: 'park', lat: 41.3121, lng: 69.2985 }
];

export interface ImportanceWeights {
  price: number;        // default: 30
  location: number;     // default: 25
  rooms: number;        // default: 15
  metro: number;        // default: 10
  area: number;         // default: 10
  amenities: number;    // default: 5
  verification: number; // default: 5
}

export interface HardRequirements {
  maxPrice?: boolean;
  rooms?: boolean;
  transactionType?: boolean;
  district?: boolean;
}

export interface UserPreferenceModel {
  transactionType?: TransactionType;
  propertyType?: PropertyType;
  district?: string;
  mahalla?: string;
  rooms?: number[];
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  furnished?: boolean;
  renovation?: RenovationType[];
  nearMetro?: boolean;
  preferredMetroStation?: string;
  nearSchool?: boolean;
  nearKindergarten?: boolean;
  nearHospital?: boolean;
  nearSupermarket?: boolean;
  parking?: boolean;
  balcony?: boolean;
  elevator?: boolean;
  familySize?: number;
  workLocation?: { name: string; lat: number; lng: number };
  universityLocation?: { name: string; lat: number; lng: number };
  maxWalkingMinutes?: number;
  centerLat?: number;
  centerLng?: number;
  radiusMeters?: number;
  hardRequirements?: HardRequirements;
  importanceWeights?: ImportanceWeights;
}

export type AiFinderStep =
  | 'DISCOVERY'
  | 'CLARIFICATION'
  | 'SEARCH'
  | 'RANKING'
  | 'RECOMMENDATION'
  | 'REFINEMENT';

export interface ScoreBreakdown {
  priceScore: number;
  locationScore: number;
  roomsScore: number;
  metroScore: number;
  areaScore: number;
  amenitiesScore: number;
  verificationScore: number;
}

export interface PropertyRecommendation {
  property: Property;
  matchScore: number; // 0-100
  matchReasons: string[];
  breakdown: ScoreBreakdown;
  distanceToWorkKm?: number;
  distanceToUniKm?: number;
  estimatedWalkingMinutes?: number;
}

export interface AiFinderMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  step?: AiFinderStep;
  clarificationOptions?: string[];
  quickRefinements?: string[];
  extractedPreferences?: Partial<UserPreferenceModel>;
  recommendations?: PropertyRecommendation[];
  totalMatchesCount?: number;
  alternativeSuggestions?: string[];
}

export interface SavedSearchProfile {
  id: string;
  userId?: string;
  name: string;
  preferences: UserPreferenceModel;
  isActiveAlert: boolean;
  createdAt: string;
  updatedAt: string;
  lastMatchesCount?: number;
}

export type RecommendationFeedbackType =
  | 'LIKE'
  | 'DISLIKE'
  | 'TOO_EXPENSIVE'
  | 'BAD_LOCATION'
  | 'FEW_ROOMS';

export interface RecommendationFeedback {
  propertyId: string;
  feedbackType: RecommendationFeedbackType;
  timestamp: string;
}

// ==========================================
// WALKING-TIME & ROUTING TYPES
// ==========================================

export type TravelMode = 'WALKING' | 'DRIVING' | 'TRANSIT';
export type SearchAccessibilityMode = 'RADIUS' | 'WALKING_TIME' | 'TRAVEL_DISTANCE';

export interface RouteTravelResult {
  origin: { lat: number; lng: number; name?: string };
  destination: { lat: number; lng: number; name?: string };
  mode: TravelMode;
  straightLineDistanceMeters: number;
  routeDistanceMeters: number;
  durationMinutes: number;
  durationSeconds: number;
  routeCoordinates?: [number, number][]; // [lat, lng]
  isRouteAvailable: boolean;
  provider: string; // 'yandex_routing' | 'osrm_network' | 'approximate_fallback'
  calculatedAt: string;
}

export interface NearbyPoiItem {
  id: string;
  nameUz: string;
  nameRu: string;
  nameEn?: string;
  category: 'metro' | 'school' | 'kindergarten' | 'hospital' | 'supermarket' | 'pharmacy' | 'park';
  lat: number;
  lng: number;
  straightLineMeters: number;
  routeDistanceMeters: number;
  walkingMinutes: number;
}

export interface SmartNearbyContext {
  overallConvenienceScore: number; // 0-100
  categoryScores: {
    transport: number;    // 0-100
    education: number;    // 0-100
    shopping: number;     // 0-100
    healthcare: number;   // 0-100
    recreation: number;   // 0-100
  };
  poiItems: NearbyPoiItem[];
}

// ==========================================
// FRAUD, TRUST & SCAM PROTECTION TYPES
// ==========================================

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type FraudSignalType =
  | 'DUPLICATE_SUSPECT'
  | 'PRICE_ANOMALY'
  | 'PRICE_MISMATCH'
  | 'SPAM_TEXT'
  | 'PHONE_SHARED'
  | 'RAPID_LISTINGS'
  | 'REPORTS_ACCUMULATED'
  | 'MISLEADING_SPEC';

export interface FraudSignal {
  type: FraudSignalType;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  weight: number; // Score contribution
  messageUz: string;
  messageRu: string;
  messageEn?: string;
  evidence?: Record<string, any>;
}

export interface PropertyRiskAssessment {
  id: string;
  propertyId: string;
  riskScore: number; // 0-100 (0=safe, 100=extreme risk)
  riskLevel: RiskLevel;
  signals: FraudSignal[];
  aiExplanation?: string;
  status: 'AUTO_APPROVED' | 'PENDING_REVIEW' | 'FLAGGED' | 'RESOLVED';
  duplicateOfPropertyId?: string;
  calculatedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export type PropertyReportReason =
  | 'SCAM'
  | 'FAKE_PROPERTY'
  | 'WRONG_PRICE'
  | 'WRONG_LOCATION'
  | 'DUPLICATE'
  | 'ALREADY_RENTED'
  | 'SUSPICIOUS_OWNER'
  | 'OTHER';

export interface PropertyReport {
  id: string;
  propertyId: string;
  reporterPhone?: string;
  reason: PropertyReportReason;
  description?: string;
  status: 'OPEN' | 'REVIEWED' | 'DISMISSED';
  createdAt: string;
}

export interface TrustDetails {
  phoneVerified: boolean;
  docsVerified: boolean;
  inspected: boolean;
  verificationTier: VerificationTier;
  publicBadge: 'VERIFIED' | 'STANDARD' | 'REVIEW_RECOMMENDED';
  verifiedDate?: string;
  inspectionDate?: string;
  summaryUz: string;
  summaryRu: string;
  summaryEn?: string;
}
