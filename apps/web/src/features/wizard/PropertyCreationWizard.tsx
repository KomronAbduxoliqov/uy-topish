import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Building,
  Upload,
  Phone,
  Image as ImageIcon
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { translations } from '../../i18n';
import { apiClient } from '../../api/client';
import {
  TransactionType,
  PropertyType,
  RenovationType,
  BuildingType,
  TASHKENT_DISTRICTS,
  UZBEK_AMENITIES
} from '@uytop/shared-types';

export const PropertyCreationWizard: React.FC = () => {
  const {
    isWizardOpen,
    setIsWizardOpen,
    language,
    token,
    user,
    setProperties,
    properties
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
    ownerPhone: user?.phone || '+998901234567',
    ownerName: user?.fullName || 'Mulk Egasi',
    amenities: {} as Record<string, boolean>,
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'
  });

  if (!isWizardOpen) return null;

  const handleAiGenerate = () => {
    setIsAiGenerating(true);
    setTimeout(() => {
      const title = `${formData.district} tumanida ${formData.rooms} xonali yangi ta'mirlangan kvartira`;
      const desc = `${formData.district} tumanida joylashgan shinam va yorug' ${formData.rooms} xonali kvartira. Yangi evro-ta'mir, barcha qulayliklari, mebellar va maishiy texnikalari mavjud. Metro bekatiga juda yaqin. Uzoq muddatli ijarachilar uchun.`;
      setFormData((prev) => ({
        ...prev,
        titleUz: title,
        descriptionUz: desc,
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
    }, 600);
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
      alert("E'lon muvaffaqiyatli yaratildi va e'lonlar ro'yxatiga qo'shildi!");
      setIsWizardOpen(false);
    } catch (e) {
      console.error(e);
      alert("Xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg">{t.wizardTitle}</h3>
            <p className="text-xs text-slate-500 font-medium">Qadam {step} / 4</p>
          </div>
          <button
            onClick={() => setIsWizardOpen(false)}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5">
          <div
            className="bg-brand-600 h-1.5 transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Form Body */}
        <div className="overflow-y-auto p-6 space-y-5 flex-1">
          {/* STEP 1: Transaction & Type */}
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <h4 className="font-bold text-slate-900 text-sm">Bitim va Mulk turini tanlang</h4>

              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1.5">Bitim turi</label>
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
                          ? 'border-brand-500 bg-brand-50/80 text-brand-700 shadow-sm'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1.5">Mulk turi</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Kvartira (Ko\'p qavatli)', value: PropertyType.APARTMENT },
                    { label: 'Hovli / Uy', value: PropertyType.HOUSE },
                    { label: 'Xona (Sheriklikka)', value: PropertyType.ROOM },
                    { label: 'Tijorat maydoni', value: PropertyType.COMMERCIAL },
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, propertyType: item.value })}
                      className={`p-3 text-xs font-bold rounded-xl border text-left transition-all ${
                        formData.propertyType === item.value
                          ? 'border-brand-500 bg-brand-50/80 text-brand-700 shadow-sm'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
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
              <h4 className="font-bold text-slate-900 text-sm">Joylashuv ma'lumotlari</h4>

              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1.5">Toshkent tumani</label>
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  {TASHKENT_DISTRICTS.map((d) => (
                    <option key={d.id} value={d.nameUz}>
                      {d.nameUz} tumani
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1.5">Aniq manzil (Ko'cha, uy, kvartal)</label>
                <input
                  type="text"
                  value={formData.addressLine}
                  onChange={(e) => setFormData({ ...formData, addressLine: e.target.value })}
                  placeholder="Masalan: Chilonzor 9-mavze, 14-uy"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-brand-50 border border-brand-200 rounded-xl text-xs text-brand-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-600 flex-shrink-0" />
                <span>Tanlangan koordinatalar bo'yicha eng yaqin metro bekati avtomatik hisoblanadi.</span>
              </div>
            </div>
          )}

          {/* STEP 3: Parameters & Specs */}
          {step === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-sm">Parametrlar va Tavsif</h4>
                <button
                  type="button"
                  onClick={handleAiGenerate}
                  className="flex items-center gap-1.5 text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg border border-brand-200 transition-colors"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isAiGenerating ? 'animate-spin' : ''}`} />
                  <span>{t.aiAssistListing}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Xonalar soni</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.rooms}
                    onChange={(e) => setFormData({ ...formData, rooms: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Maydon (m²)</label>
                  <input
                    type="number"
                    min="15"
                    value={formData.areaSqm}
                    onChange={(e) => setFormData({ ...formData, areaSqm: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Qavat</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Umumiy qavatlar</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.totalFloors}
                    onChange={(e) => setFormData({ ...formData, totalFloors: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Sarlavha</label>
                <input
                  type="text"
                  value={formData.titleUz}
                  onChange={(e) => setFormData({ ...formData, titleUz: e.target.value })}
                  placeholder="Masalan: Chilonzorda 2 xonali shinam kvartira"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Batafsil tavsif</label>
                <textarea
                  rows={3}
                  value={formData.descriptionUz}
                  onChange={(e) => setFormData({ ...formData, descriptionUz: e.target.value })}
                  placeholder="Kvartira haqida batafsil ma'lumot kiriting..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none resize-none"
                />
              </div>
            </div>
          )}

          {/* STEP 4: Amenities, Price & Photo */}
          {step === 4 && (
            <div className="space-y-4 animate-fadeIn">
              <h4 className="font-bold text-slate-900 text-sm">Narx va Qulayliklar</h4>

              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">
                  Narxi (so'm / UZS)
                </label>
                <input
                  type="number"
                  step="100000"
                  value={formData.priceUzs}
                  onChange={(e) => setFormData({ ...formData, priceUzs: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-base font-bold text-brand-700"
                />
                <span className="text-xs text-slate-400 mt-1 block">
                  ≈ ${(formData.priceUzs / 12650).toFixed(0)} USD
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Rasm URL manzili</label>
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-2">Qulayliklar</label>
                <div className="grid grid-cols-2 gap-2">
                  {UZBEK_AMENITIES.slice(0, 8).map((amenity) => {
                    const isChecked = !!formData.amenities[amenity.key];
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
                        className={`p-2 rounded-xl border text-xs font-medium text-left flex items-center justify-between ${
                          isChecked ? 'border-brand-500 bg-brand-50 text-brand-800 font-bold' : 'border-slate-200 text-slate-600'
                        }`}
                      >
                        <span>{amenity.nameUz}</span>
                        {isChecked && <CheckCircle2 className="w-4 h-4 text-brand-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1 px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold text-xs rounded-xl"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Orqaga</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm"
            >
              <span>Keyingi</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md"
            >
              <span>{t.publishListing}</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
