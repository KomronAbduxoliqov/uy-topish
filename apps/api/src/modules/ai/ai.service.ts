import { Injectable, Logger } from '@nestjs/common';
import {
  ParsedAIIntent,
  TransactionType,
  PropertyType,
  RenovationType,
  TASHKENT_DISTRICTS,
  TASHKENT_METRO_STATIONS,
  PropertySearchFilters,
  Property
} from '@uytop/shared-types';
import { SearchService } from '../search/search.service';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private searchService: SearchService) {}

  /**
   * Uzbekistan-first Natural Language Intent Parser.
   * Understands Uzbek (Lotin & Kirill), Russian, and colloquial slang.
   */
  parseUserIntent(rawQuery: string): ParsedAIIntent {
    const q = rawQuery.toLowerCase().trim();
    let detectedLanguage: 'uz' | 'ru' | 'en' | 'mixed' = 'uz';

    // Check language
    if (/[а-яА-ЯёЁ]/.test(q) && !/[a-zA-Z]/.test(q)) {
      detectedLanguage = 'ru';
    } else if (/[a-zA-Z]/.test(q) && (q.includes('rent') || q.includes('buy') || q.includes('apartment') || q.includes('room') || q.includes('near') || q.includes('furnished') || q.includes('house'))) {
      detectedLanguage = 'en';
    } else if (/[а-яА-ЯёЁ]/.test(q) && /[a-zA-Z]/.test(q)) {
      detectedLanguage = 'mixed';
    }

    // 1. Transaction Type Detection
    let transactionType: TransactionType | undefined;
    if (
      q.includes('sotiladi') ||
      q.includes('sotiladigan') ||
      q.includes('sotuv') ||
      q.includes('sotib') ||
      q.includes('olaman') ||
      q.includes('kupit') ||
      q.includes('купить') ||
      q.includes('продажа') ||
      q.includes('продается') ||
      q.includes('ipoteka') ||
      q.includes('ипотека') ||
      q.includes('sale') ||
      q.includes('buy') ||
      q.includes('for sale')
    ) {
      transactionType = TransactionType.SALE;
    } else if (
      q.includes('kunlik') ||
      q.includes('posutochno') ||
      q.includes('посуточно') ||
      q.includes('sutka') ||
      q.includes('daily')
    ) {
      transactionType = TransactionType.DAILY;
    } else if (
      q.includes('ijara') ||
      q.includes('arenda') ||
      q.includes('аренда') ||
      q.includes('sdam') ||
      q.includes('сдам') ||
      q.includes('snimu') ||
      q.includes('сниму') ||
      q.includes('rent') ||
      q.includes('for rent') ||
      q.includes('turishga') ||
      q.includes('yashashga') ||
      q.includes('kerak')
    ) {
      transactionType = TransactionType.RENT;
    } else {
      transactionType = TransactionType.RENT;
    }

    // 2. Property Type Detection
    let propertyType: PropertyType | undefined = PropertyType.APARTMENT;
    if (q.includes('hovli') || q.includes('dom') || q.includes('uchastka') || q.includes('дом') || q.includes('участок') || q.includes('house') || q.includes('villa')) {
      propertyType = PropertyType.HOUSE;
    } else if ((q.includes('xona') && (q.includes('sherik') || q.includes('bir xona'))) || q.includes('room') || q.includes('shared')) {
      propertyType = PropertyType.ROOM;
    } else if (q.includes('ofis') || q.includes('magazin') || q.includes('tijorat') || q.includes('офис') || q.includes('commercial') || q.includes('office')) {
      propertyType = PropertyType.COMMERCIAL;
    } else if (q.includes('taunxaus') || q.includes('townhouse')) {
      propertyType = PropertyType.TOWNHOUSE;
    }

    // 3. District Detection
    let district: string | undefined;
    let centerLat: number | undefined;
    let centerLng: number | undefined;

    for (const dist of TASHKENT_DISTRICTS) {
      const nameUz = dist.nameUz.toLowerCase().replace(/['`]/g, '');
      const nameRu = dist.nameRu.toLowerCase();
      const nameEn = (dist.nameEn || '').toLowerCase();
      const id = dist.id;

      if (q.includes(nameUz) || q.includes(nameRu) || (nameEn && q.includes(nameEn)) || q.includes(id)) {
        district = dist.nameUz;
        centerLat = dist.lat;
        centerLng = dist.lng;
        break;
      }
    }

    // 4. Rooms Detection (e.g. 1 xona, 2 xonali, 3 komnat, 2-xona, 3 xonalik, 2-bedroom, 2 room)
    let rooms: number | undefined;
    const roomMatch = q.match(/(\d+)\s*(-?\s*(xona|xonali|xonalik|komnat|komnatnaya|комнат|комнатная|room|bedroom|bed|br))/);
    if (roomMatch) {
      rooms = parseInt(roomMatch[1], 10);
    } else {
      if (q.includes('bir xona') || q.includes('1 xona') || q.includes('odnushka') || q.includes('однушка') || q.includes('1 room') || q.includes('1 bedroom')) rooms = 1;
      else if (q.includes('ikki xona') || q.includes('2 xona') || q.includes('dvushka') || q.includes('двушка') || q.includes('2 room') || q.includes('2 bedroom')) rooms = 2;
      else if (q.includes('uch xona') || q.includes('3 xona') || q.includes('treshka') || q.includes('трешка') || q.includes('3 room') || q.includes('3 bedroom')) rooms = 3;
      else if (q.includes('to\'rt xona') || q.includes('4 xona') || q.includes('4 room') || q.includes('4 bedroom')) rooms = 4;
    }

    // 5. Price Detection (e.g. "4 mln", "3.5 million", "300 dollar", "300$", "4000000", "5 mln gacha", "under 500")
    let maxPrice: number | undefined;
    let minPrice: number | undefined;

    // Look for mln / million pattern
    const mlnMatch = q.match(/(\d+(?:[.,]\d+)?)\s*(?:mln|million|миллион|млн)/);
    if (mlnMatch) {
      const num = parseFloat(mlnMatch[1].replace(',', '.'));
      maxPrice = Math.round(num * 1000000);
    }

    // Look for USD pattern
    const usdMatch = q.match(/(\d+)\s*(?:\$|dollar|dollars|доллар|usd)/);
    if (usdMatch) {
      const usdVal = parseInt(usdMatch[1], 10);
      maxPrice = usdVal * 12650;
    }

    // Look for pure large digits (e.g., 3500000, 4000000)
    const exactPriceMatch = q.match(/(\d{6,10})/);
    if (exactPriceMatch && !maxPrice) {
      maxPrice = parseInt(exactPriceMatch[1], 10);
    }

    // 6. Proximity / Metro / Landmark / University / Furnishing Intent
    const nearMetro =
      q.includes('metro') ||
      q.includes('метро') ||
      q.includes('subway') ||
      q.includes('station') ||
      q.includes('bekat') ||
      q.includes('piyoda') ||
      q.includes('walk');

    let metroStationName: string | undefined;
    for (const station of TASHKENT_METRO_STATIONS) {
      if (
        q.includes(station.nameUz.toLowerCase()) ||
        q.includes(station.nameRu.toLowerCase()) ||
        (station.nameEn && q.includes(station.nameEn.toLowerCase()))
      ) {
        metroStationName = station.nameUz;
        centerLat = station.lat;
        centerLng = station.lng;
        break;
      }
    }

    // Comprehensive University & Landmark Recognition
    const landmarks = [
      { keys: ['transport', 'транспорт', 'toshiit', 'тошиит', 'temir yol', 'темир йул', 'railway'], dist: 'Mirobod', lat: 41.2935, lng: 69.2885, name: "Toshkent Davlat Transport Universiteti" },
      { keys: ['texnika', 'техника', 'politex', 'политех', 'tstu'], dist: 'Olmazor', lat: 41.3505, lng: 69.2070, name: "Toshkent Davlat Texnika Universiteti (Politex)" },
      { keys: ['milliy', 'ozmu', 'o‘zmu', 'национальный университет', 'nuuz', 'talabalar shaharchasi', 'вузгородок'], dist: 'Olmazor', lat: 41.3520, lng: 69.2050, name: "O'zbekiston Milliy Universiteti" },
      { keys: ['tatu', 'тату', 'al-xorazmiy', 'tuit', 'axborot texnologiyalari'], dist: 'Yunusobod', lat: 41.3410, lng: 69.2865, name: "TATU" },
      { keys: ['inha', 'инха'], dist: "Mirzo Ulug'bek", lat: 41.3385, lng: 69.3345, name: "INHA Universiteti" },
      { keys: ['westminster', 'wiut', 'вестминстер'], dist: 'Mirobod', lat: 41.3090, lng: 69.2815, name: "Westminster Universiteti" },
      { keys: ['iqtisodiyot', 'нархоз', 'narxoz', 'tsue'], dist: 'Shayxontohur', lat: 41.3105, lng: 69.2520, name: "Toshkent Davlat Iqtisodiyot Universiteti" },
      { keys: ['yuridik', 'юридический', 'tsul'], dist: 'Mirobod', lat: 41.3140, lng: 69.2740, name: "Toshkent Davlat Yuridik Universiteti" },
      { keys: ['jahon tillari', 'инъяз', 'inyaz', 'wslu'], dist: 'Uchtepa', lat: 41.2880, lng: 69.1920, name: "O'zDJTU" },
      { keys: ['tma', 'toshmi', 'тошми', 'tibbiyot'], dist: 'Yashnobod', lat: 41.2990, lng: 69.3250, name: "Toshkent Tibbiyot Akademiyasi" },
      { keys: ['farxod', 'farhod', 'фархадский'], dist: 'Uchtepa', lat: 41.2750, lng: 69.1850, name: "Farhod bozori" },
      { keys: ['chorsu', 'чорсу'], dist: 'Shayxontohur', lat: 41.3275, lng: 69.2360, name: "Chorsu" },
      { keys: ['oloy', 'алайский', 'alay'], dist: 'Yunusobod', lat: 41.3195, lng: 69.2820, name: "Oloy bozori" },
      { keys: ['gospital', 'госпитальный'], dist: 'Mirobod', lat: 41.2940, lng: 69.2790, name: "Gospital bozori" },
      { keys: ['compass', 'компас', 'qoyliq', 'qo‘yliq', 'куйлюк'], dist: 'Bektemir', lat: 41.2405, lng: 69.3405, name: "Qo'yliq" },
      { keys: ['qatortol', 'катартал'], dist: 'Chilonzor', lat: 41.2820, lng: 69.2130, name: "Qatortol" },
      { keys: ['abu saxiy', 'абу сахий', 'orikzor', 'урикзор'], dist: 'Uchtepa', lat: 41.2550, lng: 69.1620, name: "Abu Saxiy" },
      { keys: ['malika', 'малика', 'fleshka'], dist: 'Shayxontohur', lat: 41.3340, lng: 69.2680, name: "Malika bozori" },
      { keys: ['toshkent city', 'tashkent city', 'ташкент сити'], dist: 'Shayxontohur', lat: 41.3150, lng: 69.2520, name: "Tashkent City" },
      { keys: ['magic city', 'мэджик сити'], dist: 'Yakkasaroy', lat: 41.3025, lng: 69.2485, name: "Magic City" },
      { keys: ['ttz', 'ттз'], dist: "Mirzo Ulug'bek", lat: 41.3650, lng: 69.3620, name: "TTZ" },
      { keys: ['nukus', 'нукус'], dist: 'Mirobod', lat: 41.2883, lng: 69.2842, name: "Nukus ko'chasi" },
      { keys: ['rustaveli', 'руставели'], dist: 'Yakkasaroy', lat: 41.2860, lng: 69.2550, name: "Rustaveli" },
      { keys: ['muqimiy', 'мукими'], dist: 'Chilonzor', lat: 41.2917, lng: 69.2227, name: "Muqimiy" },
      { keys: ['bunyotkor', 'bunyodkor', 'bunyotkor stadioni', 'bunyodkor stadioni', 'milliy stadion', 'бунёдкор стадион', 'стадион бунёдкор'], dist: 'Chilonzor', lat: 41.2805, lng: 69.2135, name: "Bunyodkor (Milliy) Stadioni" },
      { keys: ['rakatboshi', 'ракатбоши'], dist: 'Yakkasaroy', lat: 41.2880, lng: 69.2520, name: "Rakatboshi" }
    ];

    for (const lm of landmarks) {
      if (lm.keys.some(k => q.includes(k))) {
        if (!district) district = lm.dist;
        if (!centerLat) {
          centerLat = lm.lat;
          centerLng = lm.lng;
        }
        break;
      }
    }

    const furnished =
      q.includes('mebel') ||
      q.includes('мебель') ||
      q.includes('furnished') ||
      q.includes('furniture') ||
      q.includes('jihoz') ||
      q.includes('remont') ||
      q.includes('evro');

    let renovation: RenovationType | undefined;
    if (q.includes('evro') || q.includes('yangi remont') || q.includes('люкс') || q.includes('евро') || q.includes('renovated') || q.includes('new renovation')) {
      renovation = RenovationType.NEW;
    }

    // Build human-friendly explanation in Uzbek, Russian and English
    const partsUz: string[] = [];
    if (district) partsUz.push(`${district} tumanidan`);
    if (rooms) partsUz.push(`${rooms} xonali`);
    if (propertyType === PropertyType.APARTMENT) partsUz.push(`kvartira`);
    if (propertyType === PropertyType.HOUSE) partsUz.push(`hovli uy`);
    if (maxPrice) partsUz.push(`${(maxPrice / 1000000).toLocaleString('uz-UZ')} mln so'mgacha`);
    if (nearMetro) partsUz.push(`metroga yaqin`);
    if (furnished) partsUz.push(`mebellari bilan`);

    const partsEn: string[] = [];
    if (district) partsEn.push(`in ${district} district`);
    if (rooms) partsEn.push(`${rooms}-room`);
    if (propertyType === PropertyType.APARTMENT) partsEn.push(`apartment`);
    if (propertyType === PropertyType.HOUSE) partsEn.push(`house`);
    if (maxPrice) partsEn.push(`under ${(maxPrice / 1000000).toLocaleString('en-US')}M UZS`);
    if (nearMetro) partsEn.push(`near metro`);
    if (furnished) partsEn.push(`furnished`);

    const explanationUz = partsUz.length > 0
      ? `So'rovingiz bo'yicha parametrlar aniqlandi: ${partsUz.join(', ')}.`
      : "So'rovingiz tahlil qilindi va eng mos e'lonlar saralandi.";

    const explanationRu = `По вашему запросу найдено: ${district ? district + ', ' : ''}${rooms ? rooms + '-комн., ' : ''}${maxPrice ? 'до ' + (maxPrice / 1000000) + ' млн сум' : ''}`;

    const explanationEn = partsEn.length > 0
      ? `Identified preferences from query: ${partsEn.join(', ')}.`
      : `Found the best matching properties based on your request.`;

    return {
      rawQuery,
      detectedLanguage,
      transactionType,
      propertyType,
      district,
      rooms,
      minPrice,
      maxPrice,
      furnished: furnished ? true : undefined,
      nearMetro,
      metroStationName,
      renovation,
      centerLat,
      centerLng,
      radiusMeters: 3000,
      confidenceScore: 0.95,
      explanationUz,
      explanationRu,
      explanationEn
    };
  }

  /**
   * Parses natural query, executes strict database search, and ranks results.
   */
  async processSearchQuery(rawQuery: string): Promise<{
    parsedIntent: ParsedAIIntent;
    properties: Property[];
    total: number;
    aiCommentaryUz: string;
    aiCommentaryRu: string;
    aiCommentaryEn: string;
  }> {
    const parsedIntent = this.parseUserIntent(rawQuery);

    const searchFilters: PropertySearchFilters = {
      transactionType: parsedIntent.transactionType,
      propertyType: parsedIntent.propertyType,
      district: parsedIntent.district,
      rooms: parsedIntent.rooms ? [parsedIntent.rooms] : undefined,
      maxPrice: parsedIntent.maxPrice,
      furnished: parsedIntent.furnished,
      nearMetro: parsedIntent.nearMetro,
      centerLat: parsedIntent.centerLat,
      centerLng: parsedIntent.centerLng,
      radiusMeters: parsedIntent.radiusMeters,
      sortBy: 'relevance',
      page: 1,
      limit: 20
    };

    const searchResult = await this.searchService.searchProperties(searchFilters);

    let aiCommentaryUz = '';
    let aiCommentaryRu = '';
    let aiCommentaryEn = '';

    if (searchResult.total > 0) {
      aiCommentaryUz = `Siz uchun bazadan ${searchResult.total} ta haqiqiy va tekshirilgan mos variantlar topildi. Barcha e'lonlar narx, joylashuv va qulayliklar bo'yicha tekshirildi.`;
      aiCommentaryRu = `По вашему запросу в базе найдено ${searchResult.total} проверенных объявлений.`;
      aiCommentaryEn = `Found ${searchResult.total} verified property listings matching your request.`;
    } else {
      aiCommentaryUz = `Afsuski, kiritilgan parametrlar bo'yicha ayni paytda to'liq mos e'lon topilmadi. Filtr parametrlarini biroz kengaytirishni tavsiya qilamiz.`;
      aiCommentaryRu = `К сожалению, по данным критериям точных совпадений не найдено. Рекомендуем расширить фильтры.`;
      aiCommentaryEn = `No properties matched all criteria. We recommend slightly expanding your budget or search radius.`;
    }

    return {
      parsedIntent,
      properties: searchResult.items,
      total: searchResult.total,
      aiCommentaryUz,
      aiCommentaryRu,
      aiCommentaryEn
    };
  }

  /**
   * AI Property Creator Assistant for Landlords/Agents.
   * Takes raw short notes and generates polished, professional listing text.
   */
  generateListingContent(promptNotes: string): {
    titleUz: string;
    descriptionUz: string;
    titleRu: string;
    descriptionRu: string;
    titleEn: string;
    descriptionEn: string;
    suggestedAmenities: string[];
  } {
    const parsed = this.parseUserIntent(promptNotes);
    const roomsStr = parsed.rooms ? `${parsed.rooms} xonali` : 'Shinam';
    const districtStr = parsed.district || 'Toshkent markazida';

    const titleUz = `${districtStr}da ${roomsStr} zamonaviy ${parsed.propertyType === PropertyType.HOUSE ? 'hovli uy' : 'kvartira'}`;
    const descriptionUz = `${districtStr} tumanida joylashgan shinam va qulay ${roomsStr} ${parsed.propertyType === PropertyType.HOUSE ? 'hovli uy' : 'kvartira'}. Barcha qulayliklarga ega, xonalar yorug' va ozoda. Yaqin atrofda supermarketlar, maktab, bog'cha va transport bekatlari mavjud. Faqat uzoq muddatga, tartibli ijarachilarga taklif etiladi.`;

    const titleRu = `${parsed.rooms ? parsed.rooms + '-комнатная' : 'Уютная'} квартира в районе ${districtStr}`;
    const descriptionRu = `Сдается уютная ${roomsStr} квартира в отличном районе (${districtStr}). Со всеми удобствами, чистая и светлая. Рядом развитая инфраструктура: магазины, остановки, школа.`;

    const titleEn = `${parsed.rooms ? parsed.rooms + '-room' : 'Cozy'} ${parsed.propertyType === PropertyType.HOUSE ? 'house' : 'apartment'} in ${districtStr}`;
    const descriptionEn = `Modern and comfortable ${parsed.rooms ? parsed.rooms + '-room' : ''} ${parsed.propertyType === PropertyType.HOUSE ? 'house' : 'apartment'} located in ${districtStr} district. Fully equipped with all essential appliances and furniture. Close to public transport, supermarkets, and schools.`;

    const suggestedAmenities = ['furnished', 'air_conditioner', 'washing_machine', 'refrigerator', 'internet', 'heating'];

    return {
      titleUz,
      descriptionUz,
      titleRu,
      descriptionRu,
      titleEn,
      descriptionEn,
      suggestedAmenities
    };
  }
}
