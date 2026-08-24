import type { Metadata } from 'next';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { PropertyDetailModal } from '../../features/properties/PropertyDetailModal';
import { PropertyCompareModal } from '../../features/properties/PropertyCompareModal';
import { PropertyCreationWizard } from '../../features/wizard/PropertyCreationWizard';
import { AuthModal } from '../../features/auth/AuthModal';
import { ModerationModal } from '../../features/admin/ModerationModal';
import { AiAssistantDrawer } from '../../features/search/AiAssistantDrawer';
import { MortgageCalculatorModal } from '../../features/calculator/MortgageCalculatorModal';
import { FavoritesModal } from '../../features/properties/FavoritesModal';
import { PriceValuationModal } from '../../features/valuation/PriceValuationModal';
import { TelegramAlertModal } from '../../features/alerts/TelegramAlertModal';
import { RecentlyViewedDrawer } from '../../features/properties/RecentlyViewedDrawer';
import { AdvancedFiltersDrawer } from '../../features/search/AdvancedFiltersDrawer';
import { AiHomeFinderModal } from '../../features/ai-home-finder/AiHomeFinderModal';
import { SavedProfilesModal } from '../../features/ai-home-finder/SavedProfilesModal';
import { ReportListingModal } from '../../features/report/ReportListingModal';
import { ContractGeneratorModal } from '../../features/contract/ContractGeneratorModal';
import { ScrollToTop } from '../../components/ScrollToTop';
import { PwaRegistration } from '../../components/PwaRegistration';
import { ToastProvider } from '../../components/Toast';

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const isUz = params.locale === 'uz';
  const isRu = params.locale === 'ru';

  const defaultTitle = isUz
    ? 'UyTop — O\'zbekistonda AI va Xarita orqali Uy Topish'
    : isRu
    ? 'UyTop — Поиск недвижимости в Узбекистане с AI и на карте'
    : 'UyTop — AI-Powered Real Estate Discovery in Uzbekistan';

  const defaultDescription = isUz
    ? 'Toshkent va butun O\'zbekistonda xaritadan radius tanlang yoki sun\'iy intellekt yordamchisiga qanday uy kerakligini tabiiy tilda ayting. Tekshirilgan e\'lonlar.'
    : isRu
    ? 'Интеллектуальный поиск жилья в Ташкенте и Узбекистане. Выберите радиус на карте или задайте поиск AI на естественном языке.'
    : 'Discover properties in Tashkent and Uzbekistan using interactive map radius or natural language AI search. Verified listings.';

  return {
    title: {
      default: defaultTitle,
      template: '%s | UyTop'
    },
    description: defaultDescription,
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://uytop.uz'),
    alternates: {
      canonical: `/${params.locale}`,
      languages: {
        'uz-UZ': '/uz',
        'ru-RU': '/ru',
        'en-US': '/en',
      },
    },
    openGraph: {
      title: defaultTitle,
      description: defaultDescription,
      url: `https://uytop.uz/${params.locale}`,
      siteName: 'UyTop',
      locale: isUz ? 'uz_UZ' : isRu ? 'ru_RU' : 'en_US',
      type: 'website',
    },
  };
}

export default function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 min-h-0 flex flex-col">{children}</div>
        <Footer />

        {/* Client-Side Global Modals & Drawers */}
        <PropertyDetailModal />
        <PropertyCompareModal />
        <PropertyCreationWizard />
        <AuthModal />
        <ModerationModal />
        <AiAssistantDrawer />
        <MortgageCalculatorModal />
        <FavoritesModal />
        <PriceValuationModal />
        <TelegramAlertModal />
        <RecentlyViewedDrawer />
        <AdvancedFiltersDrawer />
        <AiHomeFinderModal />
        <SavedProfilesModal />
        <ReportListingModal />
        <ContractGeneratorModal />
        <ScrollToTop />
        <PwaRegistration />
      </div>
    </ToastProvider>
  );
}
