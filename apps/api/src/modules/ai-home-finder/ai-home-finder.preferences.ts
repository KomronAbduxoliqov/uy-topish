import {
  UserPreferenceModel,
  TransactionType,
  PropertyType,
  RenovationType,
  TASHKENT_DISTRICTS,
  TASHKENT_METRO_STATIONS,
  TASHKENT_LANDMARKS,
  ImportanceWeights,
  HardRequirements
} from '@uytop/shared-types';

export class AiPreferencesEngine {
  /**
   * Default importance weights (Sum = 100)
   */
  static getDefaultWeights(): ImportanceWeights {
    return {
      price: 30,
      location: 25,
      rooms: 15,
      metro: 10,
      area: 10,
      amenities: 5,
      verification: 5,
    };
  }

  /**
   * Parse user natural language text into a structured preference model.
   * Understands Uzbek (Latin & Cyrillic), Russian, and colloquial expressions.
   */
  static parseTextToPreferences(text: string, existingPrefs: Partial<UserPreferenceModel> = {}): {
    preferences: UserPreferenceModel;
    detectedLanguage: 'uz' | 'ru' | 'en';
    requiresClarification: boolean;
    clarificationTopic?: 'district' | 'budget' | 'rooms' | 'school' | 'metro';
  } {
    const raw = text.toLowerCase().trim();

    // Detect language
    let detectedLanguage: 'uz' | 'ru' | 'en' = 'uz';
    if (/[а-яА-ЯёЁ]/.test(raw) && !/[a-zA-Z]/.test(raw)) {
      detectedLanguage = 'ru';
    } else if (/[a-zA-Z]/.test(raw) && (raw.includes('rent') || raw.includes('buy') || raw.includes('apartment') || raw.includes('room') || raw.includes('near') || raw.includes('furnished'))) {
      detectedLanguage = 'en';
    }

    const merged: UserPreferenceModel = {
      ...existingPrefs,
      importanceWeights: existingPrefs.importanceWeights || this.getDefaultWeights(),
      hardRequirements: existingPrefs.hardRequirements || {
        maxPrice: true,
        transactionType: true,
        rooms: false,
        district: false
      }
    };

    // 1. Transaction Type
    if (
      raw.includes('ijara') ||
      raw.includes('ijaraga') ||
      raw.includes('arenda') ||
      raw.includes('аренда') ||
      raw.includes('снять') ||
      raw.includes('snimu') ||
      raw.includes('oylik') ||
      raw.includes('yashamoqchiman')
    ) {
      merged.transactionType = TransactionType.RENT;
    } else if (
      raw.includes('sotiladi') ||
      raw.includes('sotib') ||
      raw.includes('olaman') ||
      raw.includes('olmoqchiman') ||
      raw.includes('kupit') ||
      raw.includes('купить') ||
      raw.includes('продажа') ||
      raw.includes('sotuv')
    ) {
      merged.transactionType = TransactionType.SALE;
    } else if (
      raw.includes('kunlik') ||
      raw.includes('posutochno') ||
      raw.includes('посуточно') ||
      raw.includes('sutka')
    ) {
      merged.transactionType = TransactionType.DAILY;
    } else if (!merged.transactionType) {
      merged.transactionType = TransactionType.RENT;
    }

    // 2. District Detection
    for (const d of TASHKENT_DISTRICTS) {
      const nameUz = d.nameUz.toLowerCase().replace(/['`]/g, '');
      const nameRu = d.nameRu.toLowerCase();
      const id = d.id;

      if (raw.includes(nameUz) || raw.includes(nameRu) || raw.includes(id)) {
        merged.district = d.nameUz;
        merged.centerLat = d.lat;
        merged.centerLng = d.lng;
        break;
      }
    }

    // 3. Landmark & Workplace / University Detection
    for (const lm of TASHKENT_LANDMARKS) {
      const nameUz = lm.nameUz.toLowerCase().replace(/['`]/g, '');
      const nameRu = lm.nameRu.toLowerCase();
      const id = lm.id;

      if (raw.includes(nameUz) || raw.includes(nameRu) || raw.includes(id)) {
        if (lm.category === 'university') {
          merged.universityLocation = { name: lm.nameUz, lat: lm.lat, lng: lm.lng };
        } else {
          merged.workLocation = { name: lm.nameUz, lat: lm.lat, lng: lm.lng };
        }
        if (!merged.centerLat) {
          merged.centerLat = lm.lat;
          merged.centerLng = lm.lng;
        }
        break;
      }
    }

    // 4. Metro Station Detection
    for (const m of TASHKENT_METRO_STATIONS) {
      const nameUz = m.nameUz.toLowerCase().replace(/['`]/g, '');
      const nameRu = m.nameRu.toLowerCase();

      if (raw.includes(nameUz) || raw.includes(nameRu)) {
        merged.preferredMetroStation = m.nameUz;
        merged.nearMetro = true;
        break;
      }
    }

    // Generic near metro trigger
    if (
      raw.includes('metro') ||
      raw.includes('метро') ||
      raw.includes('metroga yaqin') ||
      raw.includes('рядом с метро')
    ) {
      merged.nearMetro = true;
      merged.importanceWeights!.metro = 15; // User emphasized metro
    }

    // 5. Rooms Detection
    const roomMatch = raw.match(/(\d+)\s*(-?\s*(xona|xonali|xonalik|komnat|komnatnaya|комнат|комнатная))/);
    if (roomMatch) {
      const count = parseInt(roomMatch[1], 10);
      if (count > 0 && count <= 8) {
        merged.rooms = [count];
      }
    }

    // 6. Price Extraction (e.g. 4 mln, 5 million, 4.5M, 400$, 500 dollar, 3 800 000)
    // UZS
    const uzsMlnMatch = raw.match(/(\d+(?:[.,]\d+)?)\s*(?:mln|million|миллион|млн|m)/);
    if (uzsMlnMatch) {
      const num = parseFloat(uzsMlnMatch[1].replace(',', '.'));
      const val = Math.round(num * 1_000_000);
      if (raw.includes('kam') || raw.includes('boshlab') || raw.includes('dan')) {
        merged.minPrice = val;
      } else {
        merged.maxPrice = val;
      }
    }

    // Raw large number
    const uzsRawMatch = raw.match(/(\d{1,3}(?:[ \t]\d{3})+|\d{7,9})\s*(?:so['`]?m|сум)?/);
    if (uzsRawMatch && !uzsMlnMatch) {
      const cleanNum = parseInt(uzsRawMatch[1].replace(/\s+/g, ''), 10);
      if (cleanNum >= 500_000) {
        if (raw.includes('kam') || raw.includes('boshlab') || raw.includes('dan')) {
          merged.minPrice = cleanNum;
        } else {
          merged.maxPrice = cleanNum;
        }
      }
    }

    // USD
    const usdMatch = raw.match(/(\d+)\s*(?:\$|usd|dollar|доллар|ye|у.е)/);
    if (usdMatch) {
      const usdVal = parseInt(usdMatch[1], 10);
      const convertedUzs = usdVal * 12_650;
      if (raw.includes('kam') || raw.includes('boshlab') || raw.includes('dan')) {
        merged.minPrice = convertedUzs;
      } else {
        merged.maxPrice = convertedUzs;
      }
    }

    // 7. Amenities & Lifestyle
    if (raw.includes('mebel') || raw.includes('jihoz') || raw.includes('мебель') || raw.includes('с мебелью')) {
      merged.furnished = true;
    }
    if (raw.includes('maktab') || raw.includes('школ')) {
      merged.nearSchool = true;
    }
    if (raw.includes('bog\'cha') || raw.includes('bogcha') || raw.includes('сад') || raw.includes('садик')) {
      merged.nearKindergarten = true;
    }
    if (raw.includes('shifoxona') || raw.includes('bolnitsa') || raw.includes('больниц')) {
      merged.nearHospital = true;
    }
    if (raw.includes('supermarket') || raw.includes('korzinka') || raw.includes('bozor') || raw.includes('рынок')) {
      merged.nearSupermarket = true;
    }
    if (raw.includes('parking') || raw.includes('avtoturargoh') || raw.includes('parkovka') || raw.includes('парковка') || raw.includes('mashina')) {
      merged.parking = true;
    }
    if (raw.includes('balkon') || raw.includes('балкон')) {
      merged.balcony = true;
    }
    if (raw.includes('lift') || raw.includes('лифт')) {
      merged.elevator = true;
    }

    // 8. Family Size
    const familyMatch = raw.match(/(\d+)\s*(?:kishi|kishilik|odam|odamlik|человек|семья)/);
    if (familyMatch) {
      merged.familySize = parseInt(familyMatch[1], 10);
      if (merged.familySize >= 4 && (!merged.rooms || merged.rooms.length === 0)) {
        // Soft recommendation: family of 4+ usually needs at least 2-3 rooms
        merged.rooms = [2, 3];
      }
    }

    // 9. Walking Time Detection (e.g. 10 daqiqalik piyoda, 15 min peshkom, 5 minutda piyoda)
    const walkMatch = raw.match(/(\d+)\s*(?:daqiqa|daqiqalik|min|minut|минут|минутах)?\s*(?:piyoda|peshkom|пешком|piyoda masofada)/) ||
                      raw.match(/(?:piyoda|peshkom|пешком)\s*(\d+)\s*(?:daqiqa|daqiqalik|min|minut|минут)?/);
    if (walkMatch) {
      const minutes = parseInt(walkMatch[1], 10);
      if (minutes > 0 && minutes <= 45) {
        merged.maxWalkingMinutes = minutes;
        merged.nearMetro = true;
        merged.importanceWeights!.metro = 20;
      }
    }

    // 10. Renovation
    if (raw.includes('evro') || raw.includes('yangi remont') || raw.includes('lyuks') || raw.includes('люкс') || raw.includes('евро')) {
      merged.renovation = [RenovationType.NEW, RenovationType.RENOVATED];
    }

    // 10. Importance weight overrides from language
    if (raw.includes('narx eng muhim') || raw.includes('arzonroq') || raw.includes('цена важнее') || raw.includes('byudjet')) {
      merged.importanceWeights!.price = 45;
      merged.importanceWeights!.location = 20;
    }
    if (raw.includes('metro juda muhim') || raw.includes('faqat metro yaqinida')) {
      merged.importanceWeights!.metro = 25;
    }

    // 11. Clarification Trigger Logic
    // If user provided a district and budget, but didn't mention school/kindergarten when having a family, or didn't specify district when budget is given
    let requiresClarification = false;
    let clarificationTopic: 'district' | 'budget' | 'rooms' | 'school' | 'metro' | undefined;

    if (merged.familySize && merged.familySize >= 3 && merged.nearSchool === undefined && merged.nearKindergarten === undefined) {
      requiresClarification = true;
      clarificationTopic = 'school';
    } else if (!merged.district && !merged.workLocation && !merged.universityLocation && merged.maxPrice) {
      requiresClarification = true;
      clarificationTopic = 'district';
    } else if (!merged.maxPrice && merged.district) {
      requiresClarification = true;
      clarificationTopic = 'budget';
    } else if (!merged.rooms && merged.district) {
      requiresClarification = true;
      clarificationTopic = 'rooms';
    }

    return {
      preferences: merged,
      detectedLanguage,
      requiresClarification,
      clarificationTopic,
    };
  }

  /**
   * Apply a quick user refinement action to modify existing preferences
   */
  static applyRefinement(
    current: UserPreferenceModel,
    refinementType: string
  ): UserPreferenceModel {
    const updated = { ...current };

    switch (refinementType) {
      case 'INCREASE_BUDGET_500K':
        updated.maxPrice = (updated.maxPrice || 4_000_000) + 500_000;
        break;
      case 'INCREASE_BUDGET_1M':
        updated.maxPrice = (updated.maxPrice || 4_000_000) + 1_000_000;
        break;
      case 'CLOSER_TO_METRO':
        updated.nearMetro = true;
        updated.maxWalkingMinutes = 7;
        if (updated.importanceWeights) updated.importanceWeights.metro = 25;
        break;
      case 'ONLY_FURNISHED':
        updated.furnished = true;
        break;
      case 'ONLY_NEW_REPAIR':
        updated.renovation = [RenovationType.NEW];
        break;
      case 'CHEAPER_OPTIONS':
        if (updated.maxPrice) {
          updated.maxPrice = Math.max(2_000_000, updated.maxPrice - 500_000);
        }
        if (updated.importanceWeights) updated.importanceWeights.price = 45;
        break;
      case 'ADD_ROOM':
        const currentRooms = updated.rooms || [2];
        const maxRoom = Math.max(...currentRooms);
        updated.rooms = [maxRoom + 1];
        break;
      case 'EXPAND_RADIUS':
        updated.radiusMeters = (updated.radiusMeters || 2000) + 1500;
        break;
      default:
        break;
    }

    return updated;
  }
}
