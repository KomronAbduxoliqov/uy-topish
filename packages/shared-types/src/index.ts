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
  icon: string;
  category: 'comfort' | 'appliances' | 'infrastructure' | 'security';
}

export const UZBEK_AMENITIES: AmenityDefinition[] = [
  { key: 'furnished', nameUz: 'Mebellar bilan', nameRu: 'С мебелью', icon: 'Armchair', category: 'comfort' },
  { key: 'air_conditioner', nameUz: 'Konditsioner', nameRu: 'Кондиционер', icon: 'AirVent', category: 'appliances' },
  { key: 'washing_machine', nameUz: 'Kir yuvish mashinasi', nameRu: 'Стиральная машина', icon: 'Disc3', category: 'appliances' },
  { key: 'refrigerator', nameUz: 'Muzlatgich', nameRu: 'Холодильник', icon: 'Refrigerator', category: 'appliances' },
  { key: 'internet', nameUz: 'Wi-Fi / Internet', nameRu: 'Wi-Fi / Интернет', icon: 'Wifi', category: 'comfort' },
  { key: 'tv', nameUz: 'Televizor', nameRu: 'Телевизор', icon: 'Tv', category: 'appliances' },
  { key: 'balcony', nameUz: 'Balkon', nameRu: 'Балкон', icon: 'Fence', category: 'comfort' },
  { key: 'elevator', nameUz: 'Lift', nameRu: 'Лифт', icon: 'ArrowUpDown', category: 'infrastructure' },
  { key: 'parking', nameUz: 'Avtoturargoh', nameRu: 'Парковка', icon: 'Car', category: 'infrastructure' },
  { key: 'security', nameUz: 'Qo\'riqlash xizmati', nameRu: 'Охрана / Консьерж', icon: 'ShieldCheck', category: 'security' },
  { key: 'heating', nameUz: 'Avtonom isitish', nameRu: 'Автономное отопление', icon: 'Flame', category: 'comfort' },
  { key: 'playground', nameUz: 'Bolalar maydonchasi', nameRu: 'Детская площадка', icon: 'Smile', category: 'infrastructure' }
];

export interface TashkentDistrict {
  id: string;
  nameUz: string;
  nameRu: string;
  lat: number;
  lng: number;
}

export const TASHKENT_DISTRICTS: TashkentDistrict[] = [
  { id: 'chilonzor', nameUz: 'Chilonzor', nameRu: 'Чиланзар', lat: 41.2721, lng: 69.2045 },
  { id: 'yunusobod', nameUz: 'Yunusobod', nameRu: 'Юнусабад', lat: 41.3654, lng: 69.2887 },
  { id: 'mirzo_ulugbek', nameUz: 'Mirzo Ulug\'bek', nameRu: 'Мирзо-Улугбек', lat: 41.3392, lng: 69.3364 },
  { id: 'mirobod', nameUz: 'Mirobod', nameRu: 'Мирабад', lat: 41.2883, lng: 69.2842 },
  { id: 'yakkasaroy', nameUz: 'Yakkasaroy', nameRu: 'Яккасарай', lat: 41.2815, lng: 69.2497 },
  { id: 'shayxontohur', nameUz: 'Shayxontohur', nameRu: 'Шайхантахур', lat: 41.3217, lng: 69.2384 },
  { id: 'olmazor', nameUz: 'Olmazor', nameRu: 'Алмазар', lat: 41.3533, lng: 69.2241 },
  { id: 'sergeli', nameUz: 'Sergeli', nameRu: 'Сергели', lat: 41.2268, lng: 69.2215 },
  { id: 'yangihayot', nameUz: 'Yangihayot', nameRu: 'Янгихаёт', lat: 41.1982, lng: 69.1994 },
  { id: 'uchtepa', nameUz: 'Uchtepa', nameRu: 'Учтепа', lat: 41.2952, lng: 69.1764 },
  { id: 'yashnobod', nameUz: 'Yashnobod', nameRu: 'Яшнабад', lat: 41.2965, lng: 69.3382 },
  { id: 'bektemir', nameUz: 'Bektemir', nameRu: 'Бектемир', lat: 41.2334, lng: 69.3367 }
];

export interface MetroStation {
  id: string;
  nameUz: string;
  nameRu: string;
  line: 'Chilonzor' | 'O\'zbekiston' | 'Yunusobod' | 'Yerusti';
  lat: number;
  lng: number;
}

export const TASHKENT_METRO_STATIONS: MetroStation[] = [
  { id: 'buyuk_ipak_yoli', nameUz: 'Buyuk Ipak Yo\'li', nameRu: 'Буюк Ипак Йули', line: 'Chilonzor', lat: 41.3262, lng: 69.3275 },
  { id: 'pushkin', nameUz: 'Pushkin', nameRu: 'Пушкин', line: 'Chilonzor', lat: 41.3204, lng: 69.3097 },
  { id: 'hamid_olimjon', nameUz: 'Hamid Olimjon', nameRu: 'Хамид Олимджан', line: 'Chilonzor', lat: 41.3175, lng: 69.2941 },
  { id: 'amir_temur_xiyoboni', nameUz: 'Amir Temur Xiyoboni', nameRu: 'Амир Темур Хиёбони', line: 'Chilonzor', lat: 41.3134, lng: 69.2796 },
  { id: 'mustaqillik_maydoni', nameUz: 'Mustaqillik Maydoni', nameRu: 'Мустакиллик Майдони', line: 'Chilonzor', lat: 41.3157, lng: 69.2678 },
  { id: 'paxtakor', nameUz: 'Paxtakor', nameRu: 'Пахтакор', line: 'Chilonzor', lat: 41.3129, lng: 69.2568 },
  { id: 'xalqlar_dostligi', nameUz: 'Xalqlar Do\'stligi', nameRu: 'Дружба Народов', line: 'Chilonzor', lat: 41.3114, lng: 69.2415 },
  { id: 'milliy_bog', nameUz: 'Milliy Bog\'', nameRu: 'Миллий Бог', line: 'Chilonzor', lat: 41.3031, lng: 69.2319 },
  { id: 'novza', nameUz: 'Novza', nameRu: 'Новза', line: 'Chilonzor', lat: 41.2917, lng: 69.2227 },
  { id: 'mirzo_ulugbek_m', nameUz: 'Mirzo Ulug\'bek', nameRu: 'Мирзо Улугбек', line: 'Chilonzor', lat: 41.2825, lng: 69.2132 },
  { id: 'chilonzor_m', nameUz: 'Chilonzor', nameRu: 'Чиланзар', line: 'Chilonzor', lat: 41.2726, lng: 69.2023 },
  { id: 'olmazor_m', nameUz: 'Olmazor', nameRu: 'Алмазар', line: 'Chilonzor', lat: 41.2584, lng: 69.1914 },
  { id: 'beruniy', nameUz: 'Beruniy', nameRu: 'Беруни', line: 'O\'zbekiston', lat: 41.3444, lng: 69.2057 },
  { id: 'tinchlik', nameUz: 'Tinchlik', nameRu: 'Тинчлик', line: 'O\'zbekiston', lat: 41.3364, lng: 69.2235 },
  { id: 'chorsu', nameUz: 'Chorsu', nameRu: 'Чорсу', line: 'O\'zbekiston', lat: 41.3263, lng: 69.2372 },
  { id: 'kosmonavtlar', nameUz: 'Kosmonavtlar', nameRu: 'Космонавтов', line: 'O\'zbekiston', lat: 41.3069, lng: 69.2625 },
  { id: 'oybek', nameUz: 'Oybek', nameRu: 'Ойбек', line: 'O\'zbekiston', lat: 41.2995, lng: 69.2758 },
  { id: 'toshkent', nameUz: 'Toshkent', nameRu: 'Ташкент', line: 'O\'zbekiston', lat: 41.2934, lng: 69.2882 },
  { id: 'shahriston', nameUz: 'Shahriston', nameRu: 'Шахристан', line: 'Yunusobod', lat: 41.3537, lng: 69.2884 },
  { id: 'bodomzor', nameUz: 'Bodomzor', nameRu: 'Бадамзар', line: 'Yunusobod', lat: 41.3367, lng: 69.2842 },
  { id: 'minor', nameUz: 'Minor', nameRu: 'Минор', line: 'Yunusobod', lat: 41.3265, lng: 69.2818 },
  { id: 'abdulla_qodiriy', nameUz: 'Abdulla Qodiriy', nameRu: 'Абдулла Кадыри', line: 'Yunusobod', lat: 41.3197, lng: 69.2801 }
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
  descriptionUz: string;
  descriptionRu?: string;
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
  
  // PostGIS Spatial Filters
  centerLat?: number;
  centerLng?: number;
  radiusMeters?: number; // 300, 500, 1000, 2000, 5000
  nearMetro?: boolean;
  metroStationId?: string;
  
  // Pagination & Sorting
  page?: number;
  limit?: number;
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'distance' | 'relevance';
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
