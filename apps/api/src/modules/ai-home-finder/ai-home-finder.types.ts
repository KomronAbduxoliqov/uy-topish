import {
  UserPreferenceModel,
  AiFinderStep,
  PropertyRecommendation,
  RecommendationFeedbackType,
  AiFinderMessage
} from '@uytop/shared-types';

export class ChatMessageDto {
  text: string;
  sender: 'user' | 'assistant';
  timestamp?: string;
}

export class ChatRequestDto {
  message: string;
  history?: ChatMessageDto[];
  currentPreferences?: Partial<UserPreferenceModel>;
  currentStep?: AiFinderStep;
  language?: 'uz' | 'ru' | 'en';
  workplaceLocation?: { name: string; lat: number; lng: number };
  universityLocation?: { name: string; lat: number; lng: number };
}

export class ChatResponseDto {
  message: AiFinderMessage;
  updatedPreferences: UserPreferenceModel;
  nextStep: AiFinderStep;
  recommendations: PropertyRecommendation[];
  totalMatchesCount: number;
  alternativeSuggestions: string[];
}

export class RefineRequestDto {
  refinementType: string;
  currentPreferences: UserPreferenceModel;
  language?: 'uz' | 'ru' | 'en';
}

export class FeedbackRequestDto {
  propertyId: string;
  feedbackType: RecommendationFeedbackType;
  currentPreferences?: UserPreferenceModel;
}

export class SaveProfileDto {
  name: string;
  preferences: UserPreferenceModel;
  isActiveAlert?: boolean;
}
