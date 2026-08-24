import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  UserPreferenceModel,
  AiFinderStep,
  PropertyRecommendation,
  AiFinderMessage,
  SavedSearchProfile,
  PropertySearchFilters,
  RecommendationFeedbackType
} from '@uytop/shared-types';
import { AiPreferencesEngine } from './ai-home-finder.preferences';
import { AiControlledTools } from './ai-home-finder.tools';
import { UserSearchProfileEntity } from '../../database/entities/user-search-profile.entity';
import {
  ChatRequestDto,
  ChatResponseDto,
  RefineRequestDto,
  FeedbackRequestDto,
  SaveProfileDto
} from './ai-home-finder.types';

@Injectable()
export class AiHomeFinderService {
  private readonly logger = new Logger(AiHomeFinderService.name);

  constructor(
    private tools: AiControlledTools,
    @InjectRepository(UserSearchProfileEntity)
    private profileRepo: Repository<UserSearchProfileEntity>
  ) {}

  /**
   * Multi-step Conversational Assistant Handler
   */
  async processConversation(dto: ChatRequestDto, userId?: string): Promise<ChatResponseDto> {
    const isUz = dto.language === 'uz' || (!dto.language && true);
    const isRu = dto.language === 'ru';
    const isEn = dto.language === 'en';
    const text = dto.message.trim();

    // 1. Parse current intent and merge with existing preferences
    const { preferences, requiresClarification, clarificationTopic } =
      AiPreferencesEngine.parseTextToPreferences(text, dto.currentPreferences || {});

    // Attach external workplace/university if provided
    if (dto.workplaceLocation) {
      preferences.workLocation = dto.workplaceLocation;
    }
    if (dto.universityLocation) {
      preferences.universityLocation = dto.universityLocation;
    }

    // 2. Multi-turn Clarification Flow
    // If the conversation is fresh or ambiguous, ask a focused clarification question
    if (requiresClarification && (!dto.history || dto.history.length < 2)) {
      let clarificationText = '';
      let options: string[] = [];

      if (clarificationTopic === 'school') {
        clarificationText = isEn
          ? "Sure! To help refine the best listings for you, could you please clarify:\n\nIs proximity to a school or kindergarten important to you?"
          : isRu
          ? "Конечно! Чтобы подобрать идеальный вариант, уточните, пожалуйста:\n\nВажна ли для вас близость к школе или детскому саду?"
          : "Albatta! Sizga mos uylarni aniqroq saralash uchun yana bitta narsani aniqlashtiray:\n\nSizga maktab yoki bolalar bog'chasiga yaqinlik ham muhimmi?";
        options = isEn
          ? ["Yes, close to school", "Close to kindergarten", "Not important, just near metro"]
          : isRu
          ? ["Да, рядом со школой", "Рядом с садиком", "Не важно, главное метро"]
          : ["Ha, maktab yaqin bo'lsin", "Bog'chaga yaqin bo'lsin", "Muhim emas, faqat metro"];
      } else if (clarificationTopic === 'district') {
        clarificationText = isEn
          ? "Which district or metro station would you prefer to live near?"
          : isRu
          ? "В каком районе или возле какой станции метро вы хотите жить?"
          : "Qaysi tuman yoki metro bekati atrofida yashashni ma'qul ko'rasiz?";
        options = ["Chilonzor", "Yunusobod", "Mirzo Ulug'bek", "Yakkasaroy", "Oybek / Toshkent City"];
      } else if (clarificationTopic === 'budget') {
        clarificationText = isEn
          ? "What is your maximum monthly budget?"
          : isRu
          ? "Какой максимальный бюджет в месяц вы планируете?"
          : "Oylik ijara uchun maksimal qancha budjet rejalashtiryapsiz?";
        options = isEn
          ? ["Under $300", "Under $500", "Under $800", "$1000+"]
          : isRu
          ? ["до 3.5 млн", "до 5 млн", "до 8 млн", "до 12 млн"]
          : ["3.5 mln gacha", "5 mln gacha", "8 mln gacha", "12 mln gacha"];
      } else {
        clarificationText = isEn
          ? "How many rooms do you need?"
          : isRu
          ? "Сколько комнат должно быть в квартире?"
          : "Kvartira necha xonali bo'lishi kerak?";
        options = isEn
          ? ["1 room", "2 rooms", "3 rooms", "4+ rooms"]
          : ["1 xonali", "2 xonali", "3 xonali", "4+ xonali"];
      }

      const msg: AiFinderMessage = {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: clarificationText,
        timestamp: new Date().toISOString(),
        step: 'CLARIFICATION',
        clarificationOptions: options,
        extractedPreferences: preferences,
      };

      return {
        message: msg,
        updatedPreferences: preferences,
        nextStep: 'CLARIFICATION',
        recommendations: [],
        totalMatchesCount: 0,
        alternativeSuggestions: [],
      };
    }

    // 3. Execute Grounded Database Search via Controlled Tools
    const searchFilters: PropertySearchFilters = {
      transactionType: preferences.transactionType,
      district: preferences.district,
      minPrice: preferences.minPrice,
      maxPrice: preferences.maxPrice,
      rooms: preferences.rooms,
      furnished: preferences.furnished,
      nearMetro: preferences.nearMetro,
      centerLat: preferences.centerLat,
      centerLng: preferences.centerLng,
      radiusMeters: preferences.radiusMeters || 4000,
      limit: 30,
    };

    const properties = await this.tools.searchProperties(searchFilters);

    // 4. Rank Properties with Explainable Scoring
    const recommendations = this.tools.rankProperties(properties, preferences);

    // 5. Handle Results or Construct Grounded Alternatives
    let responseText = '';
    const alternativeSuggestions: string[] = [];
    const quickRefinements: string[] = isEn
      ? ["Increase budget +$50", "Closer to metro", "Only fresh renovation", "Cheaper options"]
      : isRu
      ? ["Увеличить бюджет +500K", "Ближе к метро", "Только новый ремонт", "Дешевле варианты"]
      : [
          "Budjetni +500K oshirish",
          "Metroga yaqinlashtirish",
          "Faqat yangi remont",
          "Arzonroq variantlar"
        ];

    if (recommendations.length > 0) {
      const topMatch = recommendations[0];
      responseText = isEn
        ? `Found ${recommendations.length} matching properties for you! Highest match score — ${topMatch.matchScore}%.`
        : isRu
        ? `Найдено ${recommendations.length} подходящих вариантов! Наивысший уровень совпадения — ${topMatch.matchScore}%.`
        : `Sizning talablaringizga mos ${recommendations.length} ta xonadon topildi! Eng yuqori moslik darajasi — ${topMatch.matchScore}%.`;
    } else {
      // 0 Matches: Check real database alternatives with relaxed constraints
      const moreBudgetProps = await this.tools.searchProperties({
        ...searchFilters,
        maxPrice: (preferences.maxPrice || 4_000_000) + 1_000_000,
      });

      const widerRadiusProps = await this.tools.searchProperties({
        ...searchFilters,
        radiusMeters: 8000,
      });

      const countBudget = moreBudgetProps.length;
      const countRadius = widerRadiusProps.length;

      if (countBudget > 0) {
        alternativeSuggestions.push(
          isEn
            ? `Increasing budget by +1M UZS unlocks ${countBudget} more options`
            : isRu
            ? `Если увеличить бюджет на +1 млн, появится ${countBudget} вариантов`
            : `Budjetni +1 mln so'mga oshirsangiz ${countBudget} ta yangi variant chiqadi`
        );
      }
      if (countRadius > 0) {
        alternativeSuggestions.push(
          isEn
            ? `Expanding the search radius reveals ${countRadius} suitable listings`
            : isRu
            ? `При расширении радиуса поиска появится ${countRadius} вариантов`
            : `Qidiruv radiusini kengaytirsangiz ${countRadius} ta mos variant chiqadi`
        );
      }

      responseText = isEn
        ? "No listings matched all your strict criteria. Try selecting one of the suggestions below to broaden results:"
        : isRu
        ? "По всем строгим критериям точных объявлений не найдено. Выберите один из вариантов ниже для расширения поиска:"
        : "Kiritilgan barcha qat'iy talablarga to'liq mos e'lon topilmadi. Quyidagi takliflardan birini tanlab natijalarni kengaytirishingiz mumkin:";
    }

    const assistantMsg: AiFinderMessage = {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      text: responseText,
      timestamp: new Date().toISOString(),
      step: recommendations.length > 0 ? 'RECOMMENDATION' : 'REFINEMENT',
      quickRefinements: recommendations.length > 0 ? quickRefinements : undefined,
      extractedPreferences: preferences,
      recommendations: recommendations.slice(0, 10),
      totalMatchesCount: recommendations.length,
      alternativeSuggestions,
    };

    return {
      message: assistantMsg,
      updatedPreferences: preferences,
      nextStep: recommendations.length > 0 ? 'RECOMMENDATION' : 'REFINEMENT',
      recommendations: recommendations.slice(0, 10),
      totalMatchesCount: recommendations.length,
      alternativeSuggestions,
    };
  }

  /**
   * Refine Existing Search Session with 1-Click Actions
   */
  async refineSearch(dto: RefineRequestDto): Promise<ChatResponseDto> {
    const updatedPrefs = AiPreferencesEngine.applyRefinement(
      dto.currentPreferences,
      dto.refinementType
    );

    const searchFilters: PropertySearchFilters = {
      transactionType: updatedPrefs.transactionType,
      district: updatedPrefs.district,
      minPrice: updatedPrefs.minPrice,
      maxPrice: updatedPrefs.maxPrice,
      rooms: updatedPrefs.rooms,
      furnished: updatedPrefs.furnished,
      nearMetro: updatedPrefs.nearMetro,
      centerLat: updatedPrefs.centerLat,
      centerLng: updatedPrefs.centerLng,
      radiusMeters: updatedPrefs.radiusMeters || 4000,
      limit: 30,
    };

    const properties = await this.tools.searchProperties(searchFilters);
    const recommendations = this.tools.rankProperties(properties, updatedPrefs);

    const isUz = dto.language !== 'ru';
    const responseText = isUz
      ? `Filtrlar yangilandi. ${recommendations.length} ta mos xonadon saralandi.`
      : `Фильтры обновлены. Найдено ${recommendations.length} подходящих вариантов.`;

    const assistantMsg: AiFinderMessage = {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      text: responseText,
      timestamp: new Date().toISOString(),
      step: 'RECOMMENDATION',
      quickRefinements: [
        "Budjetni +500K oshirish",
        "Metroga yaqinlashtirish",
        "Faqat yangi remont",
        "Arzonroq variantlar"
      ],
      extractedPreferences: updatedPrefs,
      recommendations: recommendations.slice(0, 10),
      totalMatchesCount: recommendations.length,
      alternativeSuggestions: [],
    };

    return {
      message: assistantMsg,
      updatedPreferences: updatedPrefs,
      nextStep: 'RECOMMENDATION',
      recommendations: recommendations.slice(0, 10),
      totalMatchesCount: recommendations.length,
      alternativeSuggestions: [],
    };
  }

  /**
   * Record User Feedback (Like, Dislike, Too Expensive, Bad Location) to adapt session weights
   */
  processFeedback(dto: FeedbackRequestDto): { success: boolean; adjustedWeights: any } {
    const weights = dto.currentPreferences?.importanceWeights || AiPreferencesEngine.getDefaultWeights();

    if (dto.feedbackType === 'TOO_EXPENSIVE') {
      weights.price = Math.min(55, weights.price + 15);
      weights.location = Math.max(10, weights.location - 5);
    } else if (dto.feedbackType === 'BAD_LOCATION') {
      weights.location = Math.min(45, weights.location + 15);
      weights.price = Math.max(15, weights.price - 5);
    } else if (dto.feedbackType === 'FEW_ROOMS') {
      weights.rooms = Math.min(35, weights.rooms + 10);
    }

    return {
      success: true,
      adjustedWeights: weights,
    };
  }

  /**
   * Saved Search Profiles
   */
  async saveProfile(dto: SaveProfileDto, userId: string): Promise<SavedSearchProfile> {
    const profile = this.profileRepo.create({
      userId,
      name: dto.name,
      preferences: dto.preferences,
      isActiveAlert: dto.isActiveAlert ?? true,
      lastMatchesCount: 0,
    });

    const saved = await this.profileRepo.save(profile);
    return {
      id: saved.id,
      userId: saved.userId,
      name: saved.name,
      preferences: saved.preferences,
      isActiveAlert: saved.isActiveAlert,
      createdAt: saved.createdAt.toISOString(),
      updatedAt: saved.updatedAt.toISOString(),
      lastMatchesCount: saved.lastMatchesCount,
    };
  }

  async getProfiles(userId: string): Promise<SavedSearchProfile[]> {
    const list = await this.profileRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    return list.map((item) => ({
      id: item.id,
      userId: item.userId,
      name: item.name,
      preferences: item.preferences,
      isActiveAlert: item.isActiveAlert,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      lastMatchesCount: item.lastMatchesCount,
    }));
  }

  async deleteProfile(id: string, userId: string): Promise<boolean> {
    const profile = await this.profileRepo.findOne({ where: { id } });
    if (!profile) throw new NotFoundException('Search profile not found');
    if (profile.userId !== userId) {
      throw new ForbiddenException("Ushbu qidiruv profilini o'chirish huquqiga ega emassiz");
    }

    await this.profileRepo.delete(id);
    return true;
  }
}
