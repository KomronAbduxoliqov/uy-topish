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

    if (/[а-яА-ЯёЁ]/.test(q) && !/[a-zA-Z]/.test(q)) {
      detectedLanguage = 'ru';
    } else if (/[а-яА-ЯёЁ]/.test(q) && /[a-zA-Z]/.test(q)) {
      detectedLanguage = 'mixed';
    }

    // 1. Transaction Type Detection
    let transactionType: TransactionType | undefined;
    if (
      q.includes('ijara') ||
      q.includes('ijaraga') ||
      q.includes('arenda') ||
      q.includes('аренда') ||
      q.includes('снять') ||
      q.includes('snimu') ||
      q.includes('kerak')
    ) {
      transactionType = TransactionType.RENT;
    } else if (
      q.includes('sotiladi') ||
      q.includes('sotib') ||
      q.includes('olaman') ||
      q.includes('kupit') ||
      q.includes('купить') ||
      q.includes('продажа')
    ) {
      transactionType = TransactionType.SALE;
    } else if (
      q.includes('kunlik') ||
      q.includes('posutochno') ||
      q.includes('посуточно') ||
      q.includes('sutka')
    ) {
      transactionType = TransactionType.DAILY;
    } else {
      // Default intent when asking for living space is rent
      transactionType = TransactionType.RENT;
    }

    // 2. Property Type Detection
    let propertyType: PropertyType | undefined = PropertyType.APARTMENT;
    if (q.includes('hovli') || q.includes('dom') || q.includes('uchastka') || q.includes('дом') || q.includes('участок')) {
      propertyType = PropertyType.HOUSE;
    } else if (q.includes('xona') && (q.includes('sherik') || q.includes('bir xona'))) {
      propertyType = PropertyType.ROOM;
    } else if (q.includes('ofis') || q.includes('magazin') || q.includes('tijorat') || q.includes('офис')) {
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
      const id = dist.id;

      if (q.includes(nameUz) || q.includes(nameRu) || q.includes(id)) {
        district = dist.nameUz;
        centerLat = dist.lat;
        centerLng = dist.lng;
        break;
      }
    }

    // 4. Rooms Detection (e.g. 1 xona, 2 xonali, 3 komnat, 2-xona, 3 xonalik)
    let rooms: number | undefined;
    const roomMatch = q.match(/(\d+)\s*(-?\s*(xona|xonali|xonalik|komnat|komnatnaya|комнат|комнатная))/);
    if (roomMatch) {
      rooms = parseInt(roomMatch[1], 10);
    } else {
      if (q.includes('bir xona') || q.includes('1 xona') || q.includes('odnushka') || q.includes('однушка')) rooms = 1;
      else if (q.includes('ikki xona') || q.includes('2 xona') || q.includes('dvushka') || q.includes('двушка')) rooms = 2;
      else if (q.includes('uch xona') || q.includes('3 xona') || q.includes('treshka') || q.includes('трешка')) rooms = 3;
      else if (q.includes('to\'rt xona') || q.includes('4 xona')) rooms = 4;
    }

    // 5. Price Detection (e.g. "4 mln", "3.5 million", "300 dollar", "300$", "4000000", "5 mln gacha")
    let maxPrice: number | undefined;
    let minPrice: number | undefined;

    // Look for mln / million pattern
    const mlnMatch = q.match(/(\d+(?:[.,]\d+)?)\s*(?:mln|million|миллион|млн)/);
    if (mlnMatch) {
      const num = parseFloat(mlnMatch[1].replace(',', '.'));
      maxPrice = Math.round(num * 1000000);
    }

    // Look for USD pattern
    const usdMatch = q.match(/(\d+)\s*(?:\$|dollar|доллар|usd)/);
    if (usdMatch) {
      const usdVal = parseInt(usdMatch[1], 10);
      maxPrice = usdVal * 12650;
    }

    // Look for pure large digits (e.g., 3500000, 4000000)
    const exactPriceMatch = q.match(/(\d{6,10})/);
    if (exactPriceMatch && !maxPrice) {
      maxPrice = parseInt(exactPriceMatch[1], 10);
    }

    // 6. Proximity / Metro / Furnishing Intent
    const nearMetro =
      q.includes('metro') ||
      q.includes('метро') ||
      q.includes('bekat') ||
      q.includes('piyoda');

    let metroStationName: string | undefined;
    for (const station of TASHKENT_METRO_STATIONS) {
      if (q.includes(station.nameUz.toLowerCase()) || q.includes(station.nameRu.toLowerCase())) {
        metroStationName = station.nameUz;
        centerLat = station.lat;
        centerLng = station.lng;
        break;
      }
    }

    const furnished =
      q.includes('mebel') ||
      q.includes('мебель') ||
      q.includes('jihoz') ||
      q.includes('remont') ||
      q.includes('evro');

    let renovation: RenovationType | undefined;
    if (q.includes('evro') || q.includes('yangi remont') || q.includes('люкс') || q.includes('евро')) {
      renovation = RenovationType.NEW;
    }

    // Build human-friendly explanation in Uzbek and Russian
    const partsUz: string[] = [];
    if (district) partsUz.push(`${district} tumanidan`);
    if (rooms) partsUz.push(`${rooms} xonali`);
    if (propertyType === PropertyType.APARTMENT) partsUz.push(`kvartira`);
    if (propertyType === PropertyType.HOUSE) partsUz.push(`hovli uy`);
    if (maxPrice) partsUz.push(`${(maxPrice / 1000000).toLocaleString('uz-UZ')} mln so'mgacha`);
    if (nearMetro) partsUz.push(`metroga yaqin`);
    if (furnished) partsUz.push(`mebellari bilan`);

    const explanationUz = partsUz.length > 0
      ? `So'rovingiz bo'yicha parametrlar aniqlandi: ${partsUz.join(', ')}.`
      : "So'rovingiz tahlil qilindi va eng mos e'lonlar saralandi.";

    const explanationRu = `По вашему запросу найдено: ${district ? district + ', ' : ''}${rooms ? rooms + '-комн., ' : ''}${maxPrice ? 'до ' + (maxPrice / 1000000) + ' млн сум' : ''}`;

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
      explanationRu
    };
  }

  /**
   * Parses natural query, executes strict PostGIS database search, and ranks results.
   */
  async processSearchQuery(rawQuery: string): Promise<{
    parsedIntent: ParsedAIIntent;
    properties: Property[];
    total: number;
    aiCommentaryUz: string;
    aiCommentaryRu: string;
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

    if (searchResult.total > 0) {
      aiCommentaryUz = `Siz uchun bazadan ${searchResult.total} ta haqiqiy va tekshirilgan mos variantlar topildi. Barcha e'lonlar narx, joylashuv va qulayliklar bo'yicha tekshirildi.`;
      aiCommentaryRu = `По вашему запросу в базе найдено ${searchResult.total} проверенных объявлений.`;
    } else {
      aiCommentaryUz = `Afsuski, kiritilgan parametrlar bo'yicha ayni paytda to'liq mos e'lon topilmadi. Filtr parametrlarini biroz kengaytirishni tavsiya qilamiz.`;
      aiCommentaryRu = `К сожалению, по данным критериям точных совпадений не найдено. Рекомендуем расширить фильтры.`;
    }

    return {
      parsedIntent,
      properties: searchResult.items,
      total: searchResult.total,
      aiCommentaryUz,
      aiCommentaryRu
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
    suggestedAmenities: string[];
  } {
    const parsed = this.parseUserIntent(promptNotes);
    const roomsStr = parsed.rooms ? `${parsed.rooms} xonali` : 'Shinam';
    const districtStr = parsed.district || 'Toshkent markazida';

    const titleUz = `${districtStr}da ${roomsStr} zamonaviy ${parsed.propertyType === PropertyType.HOUSE ? 'hovli uy' : 'kvartira'}`;
    const descriptionUz = `${districtStr} tumanida joylashgan shinam va qulay ${roomsStr} ${parsed.propertyType === PropertyType.HOUSE ? 'hovli uy' : 'kvartira'}. Barcha qulayliklarga ega, xonalar yorug' va ozoda. Yaqin atrofda supermarketlar, maktab, bog'cha va transport bekatlari mavjud. Faqat uzoq muddatga, tartibli ijarachilarga taklif etiladi.`;

    const titleRu = `${parsed.rooms ? parsed.rooms + '-комнатная' : 'Уютная'} квартира в районе ${districtStr}`;
    const descriptionRu = `Сдается уютная ${roomsStr} квартира в отличном районе (${districtStr}). Со всеми удобствами, чистая и светлая. Рядом развитая инфраструктура: магазины, остановки, школа.`;

    const suggestedAmenities = ['furnished', 'air_conditioner', 'washing_machine', 'refrigerator', 'internet', 'heating'];

    return {
      titleUz,
      descriptionUz,
      titleRu,
      descriptionRu,
      suggestedAmenities
    };
  }
}
