'use client';

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  MapPin
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { translations } from '../../i18n';
import { apiClient } from '../../lib/api/client';
import {
  TransactionType,
  PropertyType,
  RenovationType,
  BuildingType,
  TASHKENT_DISTRICTS,
  UZBEK_AMENITIES
} from '@uytop/shared-types';
import { LocationPickerMap } from '../map/LocationPickerMap';

export const PropertyCreationWizard: React.FC = () => {
  const {
    isWizardOpen,
    setIsWizardOpen,
    language,
    token,
    user,
    setProperties,
    properties,
    showToast
  } = useAppStore();

  const t = translations[language];

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    transactionType: TransactionType.RENT,
    propertyType: PropertyType.APARTMENT,
    titleUz: '',
    descriptionUz: '',
    district: 'Chilonzor',
    addressLine: '',
    latitude: 41.2745,
    longitude: 69.2065,
    priceUzs: 4000000,
    rooms: 2,
    areaSqm: 60,
    floor: 3,
    totalFloors: 9,
    renovation: RenovationType.NEW,
    furnished: true,
    buildingType: BuildingType.BRICK,
    amenities: {} as Record<string, boolean>,
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'
  });

  if (!isWizardOpen) return null;

  const handleAiGenerate = () => {
    setIsAiGenerating(true);
    setTimeout(() => {
      const isHouse = formData.propertyType === PropertyType.HOUSE;
      const typeLabelUz = isHouse ? 'hovli uy' : 'kvartira';
      const typeLabelRu = isHouse ? 'дом' : 'квартира';
      const typeLabelEn = isHouse ? 'house' : 'apartment';

      const actionLabelUz = formData.transactionType === TransactionType.SALE ? 'sotiladi' : formData.transactionType === TransactionType.DAILY ? 'kunlik ijaraga beriladi' : 'ijaraga beriladi';
      const actionLabelRu = formData.transactionType === TransactionType.SALE ? 'продается' : formData.transactionType === TransactionType.DAILY ? 'посуточная аренда' : 'сдается в аренду';
      const actionLabelEn = formData.transactionType === TransactionType.SALE ? 'for sale' : formData.transactionType === TransactionType.DAILY ? 'daily rent' : 'for rent';

      const renoLabelUz = formData.renovation === RenovationType.NEW ? 'yangi evro-ta\'mirlangan' : 'toza ta\'mirlangan';
      const renoLabelRu = formData.renovation === RenovationType.NEW ? 'с новым евроремонтом' : 'с хорошим ремонтом';
      const renoLabelEn = formData.renovation === RenovationType.NEW ? 'newly renovated' : 'well maintained';

      const titleUz = `${formData.district}da ${formData.rooms} xonali ${renoLabelUz} ${typeLabelUz} (${actionLabelUz})`;
      const titleRu = `${formData.rooms}-комн. ${typeLabelRu} ${renoLabelRu} в районе ${formData.district} (${actionLabelRu})`;
      const titleEn = `${formData.rooms}-Room ${renoLabelEn} ${typeLabelEn} in ${formData.district} (${actionLabelEn})`;

      const descUz = `${formData.district} tumanida, ${formData.addressLine ? formData.addressLine + ' manzilida' : 'qulay joylashuvda'} joylashgan ${formData.rooms} xonali shinam ${typeLabelUz}. Umumiy maydoni ${formData.areaSqm} m², ${formData.floor}/${formData.totalFloors}-qavatda joylashgan.\n\n` +
        `✅ Afzalliklari:\n` +
        `• ${formData.renovation === RenovationType.NEW ? 'Zamonaviy evro-ta\'mir, sifatli materiallar' : 'Toza va ozoda holatda'}\n` +
        `• Barcha zaruriy mebellar, maishiy texnika (konditsioner, kir yuvish mashinasi, muzlatgich)\n` +
        `• Yuqori tezlikdagi internet va kabel TV\n` +
        `• Yaqin atrofda supermarketlar, maktab, bog'cha va jamoat transporti bekatlari\n\n` +
        `${formData.transactionType === TransactionType.RENT ? 'Faqat uzoq muddatga, tartibli ijarachilarga taklif etiladi.' : 'Hujjatlari to\'liq rasmiylashtirishga tayyor.'}`;

      const descRu = `Уютная ${formData.rooms}-комнатная ${typeLabelRu} в районе ${formData.district}${formData.addressLine ? ', ' + formData.addressLine : ''}. Общая площадь ${formData.areaSqm} м², ${formData.floor}/${formData.totalFloors} этаж.\n\n` +
        `✅ Преимущества:\n` +
        `• ${formData.renovation === RenovationType.NEW ? 'Качественный евроремонт' : 'Хорошее чистое состояние'}\n` +
        `• Полностью укомплектована мебелью и техникой (кондиционер, стиральная машина, холодильник)\n` +
        `• Высокоскоростной интернет\n` +
        `• Развитая инфраструктура: магазины, школы, транспорт рядом.`;

      const descEn = `Cozy ${formData.rooms}-room ${typeLabelEn} located in ${formData.district} district${formData.addressLine ? ', ' + formData.addressLine : ''}. Total area ${formData.areaSqm} sqm, ${formData.floor}/${formData.totalFloors} floor.\n\n` +
        `✅ Features & Amenities:\n` +
        `• ${formData.renovation === RenovationType.NEW ? 'Modern high-standard renovation' : 'Clean & well maintained'}\n` +
        `• Fully furnished with home appliances (AC, washing machine, refrigerator)\n` +
        `• High-speed Wi-Fi internet\n` +
        `• Supermarkets, transit, and schools located nearby.`;

      setFormData((prev) => ({
        ...prev,
        titleUz,
        titleRu,
        titleEn,
        descriptionUz: descUz,
        descriptionRu: descRu,
        descriptionEn: descEn,
        amenities: {
          furnished: true,
          air_conditioner: true,
          washing_machine: true,
          refrigerator: true,
          internet: true,
          heating: true
        }
      }));
      setIsAiGenerating(false);
      showToast(
        language === 'en'
          ? "Professional description generated by AI!"
          : language === 'ru'
          ? "Профессиональный текст объявления создан с помощью AI!"
          : "AI orqali professional e'lon matni yaratildi!",
        'success'
      );
    }, 500);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        priceUzs: Number(formData.priceUzs),
        rooms: Number(formData.rooms),
        areaSqm: Number(formData.areaSqm),
        floor: Number(formData.floor),
        totalFloors: Number(formData.totalFloors),
        images: [
          {
            originalUrl: formData.imageUrl,
            webpUrl: formData.imageUrl,
            thumbnailUrl: formData.imageUrl,
            displayOrder: 0,
            isCover: true
          }
        ]
      };

      const created = await apiClient.createProperty(payload, token || undefined);
      setProperties([created, ...properties]);
      showToast(
        language === 'en'
          ? "Listing created successfully! 🎉"
          : language === 'ru'
          ? "Объявление успешно создано! 🎉"
          : "E'lon muvaffaqiyatli yaratildi va e'lonlar ro'yxatiga qo'shildi! 🎉",
        'success'
      );
      setIsWizardOpen(false);
    } catch (e) {
      console.error(e);
      showToast(
        language === 'en'
          ? "An error occurred. Please try again."
          : language === 'ru'
          ? "Произошла ошибка. Пожалуйста, попробуйте снова."
          : "Xatolik yuz berdi. Iltimos qayta urinib ko'ring.",
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">{t.wizardTitle}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {language === 'en' ? 'Step' : language === 'ru' ? 'Шаг' : 'Qadam'} {step} / 4
            </p>
          </div>
          <button
            onClick={() => setIsWizardOpen(false)}
            className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5">
          <div
            className="bg-brand-600 h-1.5 transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Form Body */}
        <div className="overflow-y-auto p-6 space-y-5 flex-1 bg-white dark:bg-slate-900">
          {/* STEP 1: Transaction & Type */}
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                {language === 'en' ? 'Select Deal and Property Type' : language === 'ru' ? 'Выберите тип сделки и недвижимости' : 'Bitim va Mulk turini tanlang'}
              </h4>

              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">
                  {language === 'en' ? 'Deal Type' : language === 'ru' ? 'Тип сделки' : 'Bitim turi'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: t.rent, value: TransactionType.RENT },
                    { label: t.sale, value: TransactionType.SALE },
                    { label: t.daily, value: TransactionType.DAILY },
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, transactionType: item.value })}
                      className={`p-3 text-xs font-bold rounded-xl border text-center transition-all ${
                        formData.transactionType === item.value
                          ? 'border-brand-500 bg-brand-50/80 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 shadow-sm'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">
                  {language === 'en' ? 'Property Type' : language === 'ru' ? 'Тип недвижимости' : 'Mulk turi'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: language === 'en' ? 'Apartment (Multi-story)' : language === 'ru' ? 'Квартира' : "Kvartira (Ko'p qavatli)", value: PropertyType.APARTMENT },
                    { label: language === 'en' ? 'House / Yard' : language === 'ru' ? 'Дом / Участок' : 'Hovli / Uy', value: PropertyType.HOUSE },
                    { label: language === 'en' ? 'Room (Shared)' : language === 'ru' ? 'Комната' : 'Xona (Sheriklikka)', value: PropertyType.ROOM },
                    { label: language === 'en' ? 'Commercial Space' : language === 'ru' ? 'Коммерческое помещение' : 'Tijorat maydoni', value: PropertyType.COMMERCIAL },
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, propertyType: item.value })}
                      className={`p-3 text-xs font-bold rounded-xl border text-left transition-all ${
                        formData.propertyType === item.value
                          ? 'border-brand-500 bg-brand-50/80 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 shadow-sm'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Location & Address */}
          {step === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                {language === 'en' ? 'Location and Address' : language === 'ru' ? 'Локация и адрес' : "Joylashuv ma'lumotlari"}
              </h4>

              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">
                  {language === 'en' ? 'Tashkent District' : language === 'ru' ? 'Район Ташкента' : 'Toshkent tumani'}
                </label>
                <select
                  value={formData.district}
                  onChange={(e) => {
                    const dist = TASHKENT_DISTRICTS.find((d) => d.nameUz === e.target.value);
                    setFormData({
                      ...formData,
                      district: e.target.value,
                      latitude: dist?.lat || formData.latitude,
                      longitude: dist?.lng || formData.longitude
                    });
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  {TASHKENT_DISTRICTS.map((d) => (
                    <option key={d.id} value={d.nameUz}>
                      {language === 'en' ? (d.nameEn || d.nameUz) : language === 'ru' ? d.nameRu : d.nameUz}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">
                  {language === 'en' ? 'Exact Address (Street, Building)' : language === 'ru' ? 'Точный адрес (Улица, дом)' : "Aniq manzil (Ko'cha, uy, kvartal)"}
                </label>
                <input
                  type="text"
                  value={formData.addressLine}
                  onChange={(e) => setFormData({ ...formData, addressLine: e.target.value })}
                  placeholder={language === 'en' ? 'e.g. Chilanzar block 9, bld 14' : language === 'ru' ? 'Например: Чиланзар 9 квартал, дом 14' : 'Masalan: Chilonzor 9-mavze, 14-uy'}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none placeholder:text-slate-400"
                />
              </div>

              {/* Interactive Location Picker Map */}
              <div className="pt-1">
                <LocationPickerMap
                  latitude={formData.latitude}
                  longitude={formData.longitude}
                  district={formData.district}
                  onLocationChange={(lat, lng, detectedDistrict) => {
                    setFormData((prev) => ({
                      ...prev,
                      latitude: lat,
                      longitude: lng,
                      district: detectedDistrict || prev.district
                    }));
                  }}
                />
              </div>
            </div>
          )}

          {/* STEP 3: Parameters & Specs */}
          {step === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  {language === 'en' ? 'Parameters & Description' : language === 'ru' ? 'Параметры и описание' : 'Parametrlar va Tavsif'}
                </h4>
                <button
                  type="button"
                  onClick={handleAiGenerate}
                  className="flex items-center gap-1.5 text-xs font-bold text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/60 hover:bg-brand-100 dark:hover:bg-brand-900 px-3 py-1.5 rounded-lg border border-brand-200 dark:border-brand-800 transition-colors"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isAiGenerating ? 'animate-spin' : ''}`} />
                  <span>{t.aiAssistListing}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                    {language === 'en' ? 'Rooms' : language === 'ru' ? 'Комнаты' : 'Xonalar soni'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.rooms}
                    onChange={(e) => setFormData({ ...formData, rooms: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-medium text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                    {language === 'en' ? 'Total Area (m²)' : language === 'ru' ? 'Площадь (м²)' : 'Maydon (m²)'}
                  </label>
                  <input
                    type="number"
                    min="15"
                    value={formData.areaSqm}
                    onChange={(e) => setFormData({ ...formData, areaSqm: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-medium text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                    {language === 'en' ? 'Floor' : language === 'ru' ? 'Этаж' : 'Qavat'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-medium text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                    {language === 'en' ? 'Total Floors' : language === 'ru' ? 'Всего этажей' : 'Umumiy qavatlar'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.totalFloors}
                    onChange={(e) => setFormData({ ...formData, totalFloors: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-medium text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                  {language === 'en' ? 'Title' : language === 'ru' ? 'Заголовок' : 'Sarlavha'}
                </label>
                <input
                  type="text"
                  value={formData.titleUz}
                  onChange={(e) => setFormData({ ...formData, titleUz: e.target.value })}
                  placeholder={language === 'en' ? 'e.g. Cozy 2-room apartment in Chilanzar' : language === 'ru' ? 'Например: Уютная 2-комнатная квартира на Чиланзаре' : 'Masalan: Chilonzorda 2 xonali shinam kvartira'}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                  {language === 'en' ? 'Description' : language === 'ru' ? 'Описание' : 'Batafsil tavsif'}
                </label>
                <textarea
                  rows={4}
                  value={formData.descriptionUz}
                  onChange={(e) => setFormData({ ...formData, descriptionUz: e.target.value })}
                  placeholder={language === 'en' ? 'Enter detailed property description...' : language === 'ru' ? 'Введите подробное описание объекта...' : "Kvartira haqida batafsil ma'lumot kiriting..."}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none resize-none placeholder:text-slate-400"
                />
              </div>
            </div>
          )}

          {/* STEP 4: Amenities, Price & Photo */}
          {step === 4 && (
            <div className="space-y-4 animate-fadeIn">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                {language === 'en' ? 'Price & Amenities' : language === 'ru' ? 'Цена и удобства' : 'Narx va Qulayliklar'}
              </h4>

              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                  {language === 'en' ? 'Price (UZS)' : language === 'ru' ? 'Цена (сум / UZS)' : "Narxi (so'm / UZS)"}
                </label>
                <input
                  type="number"
                  step="100000"
                  value={formData.priceUzs}
                  onChange={(e) => setFormData({ ...formData, priceUzs: Number(e.target.value) })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-base font-bold text-brand-700 dark:text-brand-400"
                />
                <span className="text-xs text-slate-400 dark:text-slate-500 mt-1 block font-medium">
                  ≈ ${(formData.priceUzs / 12650).toFixed(0)} USD
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                  {language === 'en' ? 'Photo Image URL' : language === 'ru' ? 'URL фотографии' : 'Rasm URL manzili'}
                </label>
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-2">
                  {language === 'en' ? 'Amenities & Features' : language === 'ru' ? 'Удобства' : 'Qulayliklar'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {UZBEK_AMENITIES.slice(0, 8).map((amenity) => {
                    const isChecked = !!formData.amenities[amenity.key];
                    const amenityName = language === 'en' ? (amenity.nameEn || amenity.nameUz) : language === 'ru' ? amenity.nameRu : amenity.nameUz;
                    return (
                      <button
                        key={amenity.key}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            amenities: { ...formData.amenities, [amenity.key]: !isChecked }
                          })
                        }
                        className={`p-2 rounded-xl border text-xs font-medium text-left flex items-center justify-between transition-colors ${
                          isChecked
                            ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/60 text-brand-800 dark:text-brand-300 font-bold'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span>{amenityName}</span>
                        {isChecked && <CheckCircle2 className="w-4 h-4 text-brand-600 dark:text-brand-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="bg-slate-50 dark:bg-slate-900 px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1 px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-semibold text-xs rounded-xl transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{language === 'en' ? 'Back' : language === 'ru' ? 'Назад' : 'Orqaga'}</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all active:scale-95"
            >
              <span>{language === 'en' ? 'Next' : language === 'ru' ? 'Далее' : 'Keyingi'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? (language === 'en' ? 'Publishing...' : language === 'ru' ? 'Публикация...' : 'Saqlanmoqda...')
                  : (language === 'en' ? 'Publish Listing' : language === 'ru' ? 'Опубликовать объявление' : "E'lonni joylashtirish")}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
