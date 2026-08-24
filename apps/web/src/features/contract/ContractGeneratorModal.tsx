'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Printer,
  Copy,
  Check,
  Send,
  Sparkles,
  Building,
  User,
  Layers,
  CheckCircle2,
  FileCheck
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { formatPriceUzs } from '../../lib/utils/formatters';

export const ContractGeneratorModal: React.FC = () => {
  const {
    isContractModalOpen,
    setIsContractModalOpen,
    contractProperty,
    setContractProperty,
    language,
    showToast
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'contract' | 'act'>('contract');
  const [docLang, setDocLang] = useState<'uz' | 'ru'>(language === 'ru' ? 'ru' : 'uz');
  const [isCopied, setIsCopied] = useState(false);

  // Landlord (Ijara beruvchi) State
  const [landlordName, setLandlordName] = useState('');
  const [landlordPassport, setLandlordPassport] = useState('AA 1234567');
  const [landlordPinfl, setLandlordPinfl] = useState('30101901234567');
  const [landlordPhone, setLandlordPhone] = useState('+998 90 123-45-67');
  const [landlordAddress, setLandlordAddress] = useState('Toshkent sh., Chilonzor tumani, 9-mavze, 14-uy, 25-xonadon');

  // Tenant (Ijarachi) State
  const [tenantName, setTenantName] = useState('');
  const [tenantPassport, setTenantPassport] = useState('AB 7654321');
  const [tenantPinfl, setTenantPinfl] = useState('31205957654321');
  const [tenantPhone, setTenantPhone] = useState('+998 99 876-54-32');
  const [tenantAddress, setTenantAddress] = useState('Samarqand viloyati, Samarqand sh., Registon ko\'chasi, 12-uy');

  // Property Details
  const [propertyAddress, setPropertyAddress] = useState('Toshkent sh., Chilonzor tumani, 9-mavze, 14-uy, 25-xonadon');
  const [roomsCount, setRoomsCount] = useState(2);
  const [areaSqm, setAreaSqm] = useState(56);
  const [cadastreNumber, setCadastreNumber] = useState('10:04:02:01:03:0124');

  // Financial & Dates
  const [rentPriceUzs, setRentPriceUzs] = useState(4000000);
  const [depositUzs, setDepositUzs] = useState(2000000);
  const [paymentDay, setPaymentDay] = useState(5);
  const [contractDurationMonths, setContractDurationMonths] = useState(12);
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [utilityPayer, setUtilityPayer] = useState<'tenant' | 'landlord' | 'split'>('tenant');

  // Equipment & Meter Readings (Akt topshirish uchun)
  const [keysCount, setKeysCount] = useState(2);
  const [hasAc, setHasAc] = useState(true);
  const [hasFridge, setHasFridge] = useState(true);
  const [hasWashingMachine, setHasWashingMachine] = useState(true);
  const [hasTv, setHasTv] = useState(true);
  const [hasFurniture, setHasFurniture] = useState(true);
  
  // Meter starting numbers
  const [meterElectric, setMeterElectric] = useState('14250');
  const [meterGas, setMeterGas] = useState('03420');
  const [meterColdWater, setMeterColdWater] = useState('00540');
  const [meterHotWater, setMeterHotWater] = useState('00310');

  const fillSampleData = () => {
    setLandlordName('Karimov Rustam Alisherovich');
    setLandlordPassport('AA 5432190');
    setLandlordPinfl('31502801234567');
    setLandlordPhone('+998 90 910-11-22');
    setLandlordAddress('Toshkent sh., Yunusobod tumani, 4-mavze, 12-uy');

    setTenantName('Toshmatov Jasur Baxtiyorovich');
    setTenantPassport('AB 9876543');
    setTenantPinfl('32008987654321');
    setTenantPhone('+998 97 700-88-99');
    setTenantAddress('Farg\'ona viloyati, Qo\'qon sh., Istiqlol ko\'chasi, 45-uy');

    setPropertyAddress('Toshkent sh., Yunusobod tumani, 4-mavze, 12-uy, 34-xonadon');
    setRoomsCount(3);
    setAreaSqm(74);
    setCadastreNumber('10:07:03:02:01:0542');
    setRentPriceUzs(5500000);
    setDepositUzs(2500000);
    setPaymentDay(5);
    setContractDurationMonths(12);
  };

  // Auto-fill from active property if available
  useEffect(() => {
    if (contractProperty) {
      setLandlordName(contractProperty.ownerName || 'Azizov Shavkat Botirovich');
      setLandlordPhone(contractProperty.ownerPhone || '+998 90 123-45-67');
      setPropertyAddress(`${contractProperty.city}, ${contractProperty.district} tumani, ${contractProperty.addressLine}`);
      setRoomsCount(contractProperty.rooms || 2);
      setAreaSqm(contractProperty.areaSqm || 50);
      setRentPriceUzs(contractProperty.priceUzs || 4000000);
      setDepositUzs(Math.round((contractProperty.priceUzs || 4000000) / 2));
      setHasAc(!!contractProperty.amenities?.air_conditioner);
      setHasFridge(!!contractProperty.amenities?.refrigerator);
      setHasWashingMachine(!!contractProperty.amenities?.washing_machine);
      setHasTv(!!contractProperty.amenities?.tv);
      setHasFurniture(!!contractProperty.furnished);
    } else if (!landlordName) {
      fillSampleData();
    }
  }, [contractProperty]);

  if (!isContractModalOpen) return null;

  // Calculate end date
  const getEndDate = () => {
    const d = new Date(startDate);
    d.setMonth(d.getMonth() + Number(contractDurationMonths));
    return d.toISOString().split('T')[0];
  };

  const endDate = getEndDate();

  // Print Document (Clean PDF print)
  const handlePrint = () => {
    window.print();
  };

  // Copy Full Text
  const handleCopy = () => {
    const textToCopy = activeTab === 'contract' ? generateContractText() : generateActText();
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    showToast(
      docLang === 'uz' ? 'Hujjat matni nusxalandi!' : 'Текст документа скопирован!',
      'success'
    );
    setTimeout(() => setIsCopied(false), 2500);
  };

  // Share to Telegram
  const handleShareTelegram = () => {
    const text = activeTab === 'contract'
      ? `📄 UyTop: Turar-joy ijarasi shartnomasi (${propertyAddress})\nOylik to'lov: ${formatPriceUzs(rentPriceUzs)} so'm.\nIjara beruvchi: ${landlordName}\nIjarachi: ${tenantName}`
      : `📋 UyTop: Topshirish-qabul qilish dalolatnomasi (${propertyAddress})\nHisoblagichlar va jihozlar ro'yxati biriktirildi.`;
    
    window.open(`https://t.me/share/url?url=${encodeURIComponent('https://uytop.uz')}&text=${encodeURIComponent(text)}`, '_blank');
  };

  // Text Generators for Plain Text Copying
  function generateContractText() {
    if (docLang === 'ru') {
      return `ДОГОВОР АРЕНДЫ ЖИЛОГО ПОМЕЩЕНИЯ № ____
г. Ташкент                                                     «____» ________ 2026 г.

1. СТОРОНЫ ДОГОВОРА
Арендодатель: ${landlordName || '________________________'}, Паспорт: ${landlordPassport}, ПИНФЛ: ${landlordPinfl}, Тел: ${landlordPhone}, Адрес: ${landlordAddress}
Арендатор: ${tenantName || '________________________'}, Паспорт: ${tenantPassport}, ПИНФЛ: ${tenantPinfl}, Тел: ${tenantPhone}, Адрес: ${tenantAddress}

2. ПРЕДМЕТ ДОГОВОРА
2.1. Арендодатель сдает, а Арендатор принимает во временное владение и пользование жилое помещение:
Адрес: ${propertyAddress}
Количество комнат: ${roomsCount}, Площадь: ${areaSqm} кв.м, Кадастровый номер: ${cadastreNumber}.

3. СРОК ДЕЙСТВИЯ И ОПЛАТА
3.1. Срок аренды: с ${startDate} по ${endDate} (${contractDurationMonths} месяцев).
3.2. Ежемесячная арендная плата: ${formatPriceUzs(rentPriceUzs)} сум.
3.3. Оплата производится ежемесячно до ${paymentDay}-го числа текущего месяца.
3.4. Гарантийный депозит: ${formatPriceUzs(depositUzs)} сум.
3.5. Оплата коммунальных услуг: ${utilityPayer === 'tenant' ? 'Оплачивает Арендатор по счетчикам' : 'Входит в стоимость аренды'}.

4. ПОДПИСИ СТОРОН:
Арендодатель: _________________ / ${landlordName}
Арендатор:    _________________ / ${tenantName}`;
    }

    return `TURAR-JOYNI IJARAGA BERISH SHARTNOMASI № ____
Toshkent shahri                                                "____" ________ 2026-yil

1. SHARTNOMA TOMONLARI
Ijara beruvchi: ${landlordName || '________________________'}, Pasport: ${landlordPassport}, JShShIR: ${landlordPinfl}, Tel: ${landlordPhone}, Manzil: ${landlordAddress}
Ijarachi: ${tenantName || '________________________'}, Pasport: ${tenantPassport}, JShShIR: ${tenantPinfl}, Tel: ${tenantPhone}, Manzil: ${tenantAddress}

2. SHARTNOMA PREDMETI
2.1. Ijara beruvchi quyidagi turar-joyni Ijarachiga vaqtincha yashash va foydalanish uchun ijaraga beradi:
Manzil: ${propertyAddress}
Xonalar soni: ${roomsCount}, Umumiy maydoni: ${areaSqm} kv.m, Kadastr raqami: ${cadastreNumber}.

3. SHARTNOMA MUDDATI VA TO'LOV SHARTLARI
3.1. Ijara muddati: ${startDate} dan ${endDate} gacha (${contractDurationMonths} oy).
3.2. Oylik ijara to'lovi miqdori: ${formatPriceUzs(rentPriceUzs)} so'm.
3.3. To'lov har oyning ${paymentDay}-sanasigacha to'lanadi.
3.4. Garov (Depozit) summasi: ${formatPriceUzs(depositUzs)} so'm.
3.5. Kommunal to'lovlar: ${utilityPayer === 'tenant' ? "Ijarachi tomonidan hisoblagich ko'rsatkichlari bo'yicha to'lanadi" : "Ijara beruvchi tomonidan qoplanadi"}.

4. TOMONLARNING IMZOLARI:
Ijara beruvchi: _________________ / ${landlordName}
Ijarachi:       _________________ / ${tenantName}`;
  }

  function generateActText() {
    if (docLang === 'ru') {
      return `АКТ ПРИЕМА-ПЕРЕДАЧИ КВАРТИРЫ И ИМУЩЕСТВА
к Договору аренды жилого помещения от ${startDate} г.

Адрес объекта: ${propertyAddress}
Арендодатель: ${landlordName}
Арендатор: ${tenantName}

1. ПОКАЗАНИЯ ПРИБОРОВ УЧЕТА НА ДЕНЬ ПЕРЕДАЧИ:
- Электроэнергия: ${meterElectric} кВт*ч
- Природный газ: ${meterGas} куб.м
- Холодная вода: ${meterColdWater} куб.м
- Горячая вода: ${meterHotWater} куб.м

2. ПЕРЕЧЕНЬ ПЕРЕДАННОГО ИМУЩЕСТВА И ТЕХНИКИ:
- Количество комплектов ключей: ${keysCount} шт.
- Мебель: ${hasFurniture ? 'В наличии, в исправном состоянии' : 'Отсутствует'}
- Кондиционер: ${hasAc ? 'В наличии, проверен' : 'Отсутствует'}
- Холодильник: ${hasFridge ? 'В наличии, рабочий' : 'Отсутствует'}
- Стиральная машина: ${hasWashingMachine ? 'В наличии, рабочая' : 'Отсутствует'}
- Телевизор: ${hasTv ? 'В наличии' : 'Отсутствует'}

Стороны подтверждают, что объект находится в надлежащем состоянии, претензий не имеется.

Арендодатель: _________________ / ${landlordName}
Арендатор:    _________________ / ${tenantName}`;
    }

    return `TURAR-JOY VA MULKLARNI TOPSHIRISH-QABUL QILISH DALOLATNOMASI
${startDate}-yildagi Ijara shartnomasiga ilova

Mulk manzili: ${propertyAddress}
Ijara beruvchi: ${landlordName}
Ijarachi: ${tenantName}

1. TOPSHIRILGAN KUNDAGI HISOBLAGICH KO'RSATKICHLARI:
- Elektr energiyasi: ${meterElectric} kVt*soat
- Tabiiy gaz: ${meterGas} m³
- Sovuq suv: ${meterColdWater} m³
- Issiq suv: ${meterHotWater} m³

2. TOPSHIRILGAN MULLAR VA MAISHIY TEXNIKALAR RO'YXATI:
- Xonadon kalitlari: ${keysCount} komplekt
- Mebellar: ${hasFurniture ? 'Mavjud, soz holatda' : 'Mavjud emas'}
- Konditsioner: ${hasAc ? 'Mavjud, ishlashi tekshirildi' : 'Mavjud emas'}
- Muzlatgich: ${hasFridge ? 'Mavjud, soz holatda' : 'Mavjud emas'}
- Kir yuvish mashinasi: ${hasWashingMachine ? 'Mavjud, soz holatda' : 'Mavjud emas'}
- Televizor: ${hasTv ? 'Mavjud, pult bilan' : 'Mavjud emas'}

Tomonlar turar-joy va undagi jihozlarning soz holatda ekanligini tasdiqlaydilar, e'tirozlar yo'q.

Ijara beruvchi: _________________ / ${landlordName}
Ijarachi:       _________________ / ${tenantName}`;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white">
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] border border-slate-200 dark:border-slate-800 print:border-none print:shadow-none print:max-h-none print:w-full print:rounded-none">
        
        {/* Header (Hidden on Print) */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-5 sm:px-6 py-4 flex items-center justify-between flex-shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight">
                  {docLang === 'uz' ? 'Ijara Shartnomasi va Dalolatnoma Generatori' : 'Генератор договора аренды и акта приема'}
                </h3>
                <span className="text-[10px] font-extrabold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 px-2 py-0.5 rounded-full">
                  ijara.soliq.uz
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                {docLang === 'uz'
                  ? 'O\'zbekiston Respublikasi Fuqarolik kodeksiga mos rasmiy shablon'
                  : 'Официальный шаблон согласно Гражданскому кодексу Республики Узбекистан'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <div className="bg-slate-800/80 p-0.5 rounded-xl border border-slate-700 flex text-xs font-bold">
              <button
                type="button"
                onClick={() => setDocLang('uz')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  docLang === 'uz' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                O'zbekcha
              </button>
              <button
                type="button"
                onClick={() => setDocLang('ru')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  docLang === 'ru' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Русский
              </button>
            </div>

            <button
              onClick={() => {
                setIsContractModalOpen(false);
                setContractProperty(null);
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selection & Quick Actions Bar (Hidden on Print) */}
        <div className="px-5 sm:px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 flex-shrink-0 print:hidden">
          {/* Tabs */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('contract')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'contract'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{docLang === 'uz' ? '1. Ijara Shartnomasi' : '1. Договор аренды'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('act')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'act'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{docLang === 'uz' ? '2. Qabul qilish dalolatnomasi (Akt)' : '2. Акт приема-передачи'}</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fillSampleData}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 rounded-xl transition-all"
              title={docLang === 'uz' ? 'Namunaviy ma\'lumotlar bilan to\'ldirish' : 'Заполнить примером'}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">{docLang === 'uz' ? 'Namuna to\'ldirish' : 'Заполнить пример'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 rounded-xl transition-all"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? (docLang === 'uz' ? 'Nusxalandi' : 'Скопировано') : (docLang === 'uz' ? 'Nusxalash' : 'Копировать')}</span>
            </button>

            <button
              type="button"
              onClick={handleShareTelegram}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 rounded-xl transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Telegram</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>{docLang === 'uz' ? 'Chop etish / PDF' : 'Печать / PDF'}</span>
            </button>
          </div>
        </div>

        {/* Content Area: Split 2-Column (Form on Left, Live Document on Right) */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 min-h-0 print:block">
          
          {/* Left Column: Form Controls (Hidden on Print) */}
          <div className="lg:col-span-5 p-5 bg-slate-50/70 dark:bg-slate-900/80 border-r border-slate-200 dark:border-slate-800 overflow-y-auto space-y-5 print:hidden">
            
            {/* 1. Landlord Information */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center gap-2 text-xs font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                <User className="w-3.5 h-3.5" />
                <span>{docLang === 'uz' ? '1. Ijara beruvchi (Uy egasi)' : '1. Арендодатель (Собственник)'}</span>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">
                  {docLang === 'uz' ? 'To\'liq F.I.Sh.' : 'Ф.И.О. полностью'}
                </label>
                <input
                  type="text"
                  value={landlordName}
                  onChange={(e) => setLandlordName(e.target.value)}
                  placeholder="Azizov Shavkat Botirovich"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">
                    {docLang === 'uz' ? 'Pasport seriya/raqami' : 'Паспорт'}
                  </label>
                  <input
                    type="text"
                    value={landlordPassport}
                    onChange={(e) => setLandlordPassport(e.target.value)}
                    placeholder="AA 1234567"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 font-medium text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">
                    {docLang === 'uz' ? 'JShShIR (PINFL)' : 'ПИНФЛ'}
                  </label>
                  <input
                    type="text"
                    value={landlordPinfl}
                    onChange={(e) => setLandlordPinfl(e.target.value)}
                    placeholder="30101901234567"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 font-medium text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">
                    {docLang === 'uz' ? 'Telefon raqami' : 'Телефон'}
                  </label>
                  <input
                    type="text"
                    value={landlordPhone}
                    onChange={(e) => setLandlordPhone(e.target.value)}
                    placeholder="+998 90 123-45-67"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 font-medium text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">
                    {docLang === 'uz' ? 'Doimiy ro\'yxat manzili' : 'Прописка'}
                  </label>
                  <input
                    type="text"
                    value={landlordAddress}
                    onChange={(e) => setLandlordAddress(e.target.value)}
                    placeholder="Toshkent sh., Chilonzor..."
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 font-medium text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* 2. Tenant Information */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                <User className="w-3.5 h-3.5" />
                <span>{docLang === 'uz' ? '2. Ijarachi (Ijara oluvchi)' : '2. Арендатор (Жилец)'}</span>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">
                  {docLang === 'uz' ? 'To\'liq F.I.Sh.' : 'Ф.И.О. полностью'}
                </label>
                <input
                  type="text"
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  placeholder="Toshmatov Jasur Baxtiyorovich"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">
                    {docLang === 'uz' ? 'Pasport seriya/raqami' : 'Паспорт'}
                  </label>
                  <input
                    type="text"
                    value={tenantPassport}
                    onChange={(e) => setTenantPassport(e.target.value)}
                    placeholder="AB 7654321"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 font-medium text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">
                    {docLang === 'uz' ? 'JShShIR (PINFL)' : 'ПИНФЛ'}
                  </label>
                  <input
                    type="text"
                    value={tenantPinfl}
                    onChange={(e) => setTenantPinfl(e.target.value)}
                    placeholder="31205957654321"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 font-medium text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">
                    {docLang === 'uz' ? 'Telefon raqami' : 'Телефон'}
                  </label>
                  <input
                    type="text"
                    value={tenantPhone}
                    onChange={(e) => setTenantPhone(e.target.value)}
                    placeholder="+998 99 876-54-32"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 font-medium text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">
                    {docLang === 'uz' ? 'Doimiy ro\'yxat manzili' : 'Прописка'}
                  </label>
                  <input
                    type="text"
                    value={tenantAddress}
                    onChange={(e) => setTenantAddress(e.target.value)}
                    placeholder="Samarqand viloyati..."
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 font-medium text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* 3. Property & Pricing Terms */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center gap-2 text-xs font-extrabold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                <Building className="w-3.5 h-3.5" />
                <span>{docLang === 'uz' ? '3. Mulk va Moliyaviy Shartlar' : '3. Недвижимость и Условия оплаты'}</span>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">
                  {docLang === 'uz' ? 'Ijaraga beriladigan uy manzili' : 'Адрес квартиры'}
                </label>
                <input
                  type="text"
                  value={propertyAddress}
                  onChange={(e) => setPropertyAddress(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 font-medium text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">
                    {docLang === 'uz' ? 'Xonalar' : 'Комнаты'}
                  </label>
                  <input
                    type="number"
                    value={roomsCount}
                    onChange={(e) => setRoomsCount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 font-medium text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">
                    {docLang === 'uz' ? 'Maydoni (m²)' : 'Площадь'}
                  </label>
                  <input
                    type="number"
                    value={areaSqm}
                    onChange={(e) => setAreaSqm(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 font-medium text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">
                    {docLang === 'uz' ? 'Muddati (oy)' : 'Срок (мес)'}
                  </label>
                  <input
                    type="number"
                    value={contractDurationMonths}
                    onChange={(e) => setContractDurationMonths(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 font-medium text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">
                    {docLang === 'uz' ? 'Oylik ijara haqi (so\'m)' : 'Аренда в месяц (сум)'}
                  </label>
                  <input
                    type="number"
                    step={100000}
                    value={rentPriceUzs}
                    onChange={(e) => setRentPriceUzs(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">
                    {docLang === 'uz' ? 'Garov (Depozit) so\'m' : 'Залог (Депозит) сум'}
                  </label>
                  <input
                    type="number"
                    step={100000}
                    value={depositUzs}
                    onChange={(e) => setDepositUzs(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 font-medium text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">
                    {docLang === 'uz' ? 'To\'lov kuni (sanasi)' : 'Оплата до числа'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={paymentDay}
                    onChange={(e) => setPaymentDay(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 font-medium text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">
                    {docLang === 'uz' ? 'Boshlanish sanasi' : 'Дата начала'}
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 font-medium text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* 4. Equipment & Meter Readings (Akt uchun) */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center gap-2 text-xs font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                <Layers className="w-3.5 h-3.5" />
                <span>{docLang === 'uz' ? '4. Dalolatnoma (Akt) jihozlari' : '4. Акт: Техника и Счетчики'}</span>
              </div>

              {/* Checkboxes */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasFurniture}
                    onChange={(e) => setHasFurniture(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>{docLang === 'uz' ? 'Mebellar mavjud' : 'Мебель'}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasAc}
                    onChange={(e) => setHasAc(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>{docLang === 'uz' ? 'Konditsioner' : 'Кондиционер'}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasFridge}
                    onChange={(e) => setHasFridge(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>{docLang === 'uz' ? 'Muzlatgich' : 'Холодильник'}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasWashingMachine}
                    onChange={(e) => setHasWashingMachine(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>{docLang === 'uz' ? 'Kir yuvish mashinasi' : 'Стиральная маш.'}</span>
                </label>
              </div>

              {/* Meter readings */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                <span className="text-[11px] font-bold text-slate-500 block mb-2">
                  {docLang === 'uz' ? 'Hisoblagichlarning dastlabki ko\'rsatkichlari:' : 'Начальные показания счетчиков:'}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block">{docLang === 'uz' ? 'Elektr (kVt/soat)' : 'Электроэнергия'}</label>
                    <input
                      type="text"
                      value={meterElectric}
                      onChange={(e) => setMeterElectric(e.target.value)}
                      className="w-full px-2 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block">{docLang === 'uz' ? 'Gaz (m³)' : 'Газ (куб.м)'}</label>
                    <input
                      type="text"
                      value={meterGas}
                      onChange={(e) => setMeterGas(e.target.value)}
                      className="w-full px-2 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block">{docLang === 'uz' ? 'Sovuq suv (m³)' : 'Холодная вода'}</label>
                    <input
                      type="text"
                      value={meterColdWater}
                      onChange={(e) => setMeterColdWater(e.target.value)}
                      className="w-full px-2 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block">{docLang === 'uz' ? 'Issiq suv (m³)' : 'Горячая вода'}</label>
                    <input
                      type="text"
                      value={meterHotWater}
                      onChange={(e) => setMeterHotWater(e.target.value)}
                      className="w-full px-2 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Printable Document Preview */}
          <div className="lg:col-span-7 p-6 sm:p-8 bg-white dark:bg-slate-950 overflow-y-auto print:p-0 print:bg-white text-slate-900 dark:text-slate-100 font-serif leading-relaxed text-xs sm:text-sm">
            
            {activeTab === 'contract' ? (
              /* TAB 1: RENTAL CONTRACT */
              <div className="space-y-4 max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-xs border border-slate-200 dark:border-slate-800 text-slate-900 print:shadow-none print:border-none print:p-0">
                
                {/* Contract Header */}
                <div className="text-center pb-4 border-b border-slate-200">
                  <h2 className="text-base sm:text-lg font-bold tracking-tight uppercase">
                    {docLang === 'uz'
                      ? 'TURAR-JOYNI IJARAGA BERISH SHARTNOMASI'
                      : 'ДОГОВОР АРЕНДЫ ЖИЛОГО ПОМЕЩЕНИЯ'}
                  </h2>
                  <div className="flex justify-between text-xs text-slate-500 font-sans mt-2">
                    <span>{docLang === 'uz' ? 'Toshkent shahri' : 'г. Ташкент'}</span>
                    <span>{startDate} {docLang === 'uz' ? 'yil' : 'г.'}</span>
                  </div>
                </div>

                {/* Section 1: Parties */}
                <div className="space-y-2">
                  <h4 className="font-bold font-sans text-xs uppercase tracking-wider text-slate-700">
                    {docLang === 'uz' ? '1. SHARTNOMA TOMONLARI' : '1. СТОРОНЫ ДОГОВОРА'}
                  </h4>
                  <p className="text-justify leading-relaxed">
                    {docLang === 'uz' ? (
                      <>
                        Kelgusida <strong>«Ijara beruvchi»</strong> deb ataluvchi fuqaro <strong>{landlordName || '________________________'}</strong> (Pasport: {landlordPassport}, JShShIR: {landlordPinfl}, yashash manzili: {landlordAddress}) bir tomondan, va kelgusida <strong>«Ijarachi»</strong> deb ataluvchi fuqaro <strong>{tenantName || '________________________'}</strong> (Pasport: {tenantPassport}, JShShIR: {tenantPinfl}, yashash manzili: {tenantAddress}) ikkinchi tomondan, O‘zbekiston Respublikasi Fuqarolik kodeksiga asosan mazkur shartnomani quyidagilar haqida tuzdilar:
                      </>
                    ) : (
                      <>
                        Гражданин <strong>{landlordName || '________________________'}</strong> (Паспорт: {landlordPassport}, ПИНФЛ: {landlordPinfl}, адрес: {landlordAddress}), именуемый в дальнейшем <strong>«Арендодатель»</strong>, с одной стороны, и гражданин <strong>{tenantName || '________________________'}</strong> (Паспорт: {tenantPassport}, ПИНФЛ: {tenantPinfl}, адрес: {tenantAddress}), именуемый в дальнейшем <strong>«Арендатор»</strong>, заключили настоящий договор о нижеследующем:
                      </>
                    )}
                  </p>
                </div>

                {/* Section 2: Subject */}
                <div className="space-y-2">
                  <h4 className="font-bold font-sans text-xs uppercase tracking-wider text-slate-700">
                    {docLang === 'uz' ? '2. SHARTNOMA PREDMETI' : '2. ПРЕДМЕТ ДОГОВОРА'}
                  </h4>
                  <p className="text-justify leading-relaxed">
                    {docLang === 'uz' ? (
                      <>
                        2.1. Ijara beruvchi o‘ziga xususiy mulk huquqi asosida tegishli bo‘lgan <strong>{propertyAddress}</strong> manzilida joylashgan, <strong>{roomsCount}</strong> xonali, umumiy maydoni <strong>{areaSqm} kv.m</strong> bo‘lgan turar-joyni Ijarachiga vaqtincha yashash uchun haq evaziga ijaraga beradi.<br />
                        2.2. Turar-joy faqat yashash maqsadida foydalaniladi. Uni uchinchi shaxslarga qayta ijaraga (subarenda) berish taqiqlanadi.
                      </>
                    ) : (
                      <>
                        2.1. Арендодатель предоставляет Арендатору за плату во временное владение и пользование жилое помещение, расположенное по адресу: <strong>{propertyAddress}</strong>, состоящее из <strong>{roomsCount}</strong> комнат, общей площадью <strong>{areaSqm} кв.м</strong>.<br />
                        2.2. Помещение предоставляется исключительно для проживания. Передача в субаренду запрещена.
                      </>
                    )}
                  </p>
                </div>

                {/* Section 3: Financials & Terms */}
                <div className="space-y-2">
                  <h4 className="font-bold font-sans text-xs uppercase tracking-wider text-slate-700">
                    {docLang === 'uz' ? '3. IJARA HAQI VA HISOB-KITOB TARTIBI' : '3. АРЕНДНАЯ ПЛАТА И ПОРЯДОК РАСЧЕТОВ'}
                  </h4>
                  <p className="text-justify leading-relaxed">
                    {docLang === 'uz' ? (
                      <>
                        3.1. Mazkur shartnoma bo‘yicha oylik ijara haqi <strong>{formatPriceUzs(rentPriceUzs)} ({rentPriceUzs.toLocaleString()} so‘m)</strong> etib belgilanadi.<br />
                        3.2. Ijara haqi har oyning <strong>{paymentDay}-sanasiga qadar</strong> oldindan to‘lanadi.<br />
                        3.3. Ijarachi tomonidan mulkning butligini kafolatlash maqsadida <strong>{formatPriceUzs(depositUzs)} so‘m</strong> miqdorida garov (depozit) to‘lovi kiritiladi. Shartnoma muddati tugab, mulk soz topshirilganda depozit to‘liq qaytariladi.<br />
                        3.4. Kommunal to‘lovlar (elektr, gaz, sovuq va issiq suv) hisoblagich ko‘rsatkichlari bo‘yicha Ijarachi tomonidan o‘z vaqtida to‘lab boriladi.
                      </>
                    ) : (
                      <>
                        3.1. Ежемесячная арендная плата составляет <strong>{formatPriceUzs(rentPriceUzs)} ({rentPriceUzs.toLocaleString()} сум)</strong>.<br />
                        3.2. Оплата производится ежемесячно не позднее <strong>{paymentDay}-го числа</strong> расчетного месяца.<br />
                        3.3. Сумма гарантийного депозита составляет <strong>{formatPriceUzs(depositUzs)} сум</strong>, возвращается Арендатору при освобождении помещения в исправном состоянии.<br />
                        3.4. Коммунальные услуги оплачиваются Арендатором ежемесячно по показаниям приборов учета.
                      </>
                    )}
                  </p>
                </div>

                {/* Section 4: Period */}
                <div className="space-y-2">
                  <h4 className="font-bold font-sans text-xs uppercase tracking-wider text-slate-700">
                    {docLang === 'uz' ? '4. SHARTNOMA MUDDATI' : '4. СРОК ДЕЙСТВИЯ ДОГОВОРА'}
                  </h4>
                  <p className="text-justify leading-relaxed">
                    {docLang === 'uz' ? (
                      <>
                        4.1. Mazkur shartnoma <strong>{startDate}</strong> dan <strong>{endDate}</strong> ga qadar (<strong>{contractDurationMonths} oy</strong> muddatga) tuzildi.<br />
                        4.2. Shartnomani muddatidan oldin bekor qilish istagida bo‘lgan tomon ikkinchi tomonni kamida 30 kun oldin yozma ravishda ogohlantirishi shart.
                      </>
                    ) : (
                      <>
                        4.1. Договор заключен сроком на <strong>{contractDurationMonths} месяцев</strong>: с <strong>{startDate}</strong> по <strong>{endDate}</strong>.<br />
                        4.2. Досрочное расторжение договора возможно с обязательным уведомлением за 30 календарных дней.
                      </>
                    )}
                  </p>
                </div>

                {/* Signatures */}
                <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-6 text-xs font-sans">
                  <div>
                    <h5 className="font-bold uppercase text-slate-700 mb-2">
                      {docLang === 'uz' ? 'IJARA BERUVCHI:' : 'АРЕНДОДАТЕЛЬ:'}
                    </h5>
                    <p className="text-[11px] leading-tight text-slate-600 mb-4">
                      {landlordName}<br />
                      Pasport: {landlordPassport}<br />
                      Tel: {landlordPhone}
                    </p>
                    <div className="pt-4 border-b border-dashed border-slate-400"></div>
                    <span className="text-[10px] text-slate-400 block mt-1">{docLang === 'uz' ? '(imzo)' : '(подпись)'}</span>
                  </div>

                  <div>
                    <h5 className="font-bold uppercase text-slate-700 mb-2">
                      {docLang === 'uz' ? 'IJARACHI:' : 'АРЕНДАТОР:'}
                    </h5>
                    <p className="text-[11px] leading-tight text-slate-600 mb-4">
                      {tenantName}<br />
                      Pasport: {tenantPassport}<br />
                      Tel: {tenantPhone}
                    </p>
                    <div className="pt-4 border-b border-dashed border-slate-400"></div>
                    <span className="text-[10px] text-slate-400 block mt-1">{docLang === 'uz' ? '(imzo)' : '(подпись)'}</span>
                  </div>
                </div>
              </div>
            ) : (
              /* TAB 2: HANDOVER ACT */
              <div className="space-y-4 max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-xs border border-slate-200 dark:border-slate-800 text-slate-900 print:shadow-none print:border-none print:p-0">
                
                {/* Act Header */}
                <div className="text-center pb-4 border-b border-slate-200">
                  <h2 className="text-base sm:text-lg font-bold tracking-tight uppercase">
                    {docLang === 'uz'
                      ? 'TURAR-JOY VA MULKLARNI TOPSHIRISH-QABUL QILISH DALOLATNOMASI'
                      : 'АКТ ПРИЕМА-ПЕРЕДАЧИ КВАРТИРЫ И ИМУЩЕСТВА'}
                  </h2>
                  <p className="text-xs text-slate-500 font-sans mt-1">
                    {docLang === 'uz'
                      ? `${startDate}-yildagi Ijara shartnomasiga 1-sonli Ilova`
                      : `Приложение №1 к Договору аренды жилого помещения от ${startDate} г.`}
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-justify leading-relaxed">
                    {docLang === 'uz' ? (
                      <>
                        Mazkur dalolatnoma Ijara beruvchi <strong>{landlordName}</strong> tomonidan Ijarachi <strong>{tenantName}</strong> ga <strong>{propertyAddress}</strong> manzilidagi turar-joy va undagi jihozlar topshirilganligini tasdiqlaydi.
                      </>
                    ) : (
                      <>
                        Настоящий Акт составлен о том, что Арендодатель <strong>{landlordName}</strong> передал, а Арендатор <strong>{tenantName}</strong> принял квартиру и имущество по адресу: <strong>{propertyAddress}</strong>.
                      </>
                    )}
                  </p>

                  {/* 1. Meter Readings Table */}
                  <div>
                    <h4 className="font-bold font-sans text-xs uppercase tracking-wider text-slate-700 mb-2">
                      {docLang === 'uz' ? '1. HISOBLAGICHLARNING BOShLANG‘ICH KO‘RSATKICHLARI' : '1. ПОКАЗАНИЯ ПРИБОРОВ УЧЕТА НА МОМЕНТ ПЕРЕДАЧИ'}
                    </h4>
                    <table className="w-full text-left border border-slate-200 text-xs font-sans">
                      <thead className="bg-slate-100">
                        <tr>
                          <th className="p-2 border-b border-r border-slate-200">{docLang === 'uz' ? 'Xizmat turi' : 'Коммунальная услуга'}</th>
                          <th className="p-2 border-b border-slate-200">{docLang === 'uz' ? 'Boshlang\'ich ko\'rsatkich' : 'Показания счетчика'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="p-2 border-b border-r border-slate-200">{docLang === 'uz' ? 'Elektr energiyasi' : 'Электроэнергия'}</td>
                          <td className="p-2 border-b border-slate-200 font-bold">{meterElectric} kVt*soat</td>
                        </tr>
                        <tr>
                          <td className="p-2 border-b border-r border-slate-200">{docLang === 'uz' ? 'Tabiiy gaz' : 'Природный gaz'}</td>
                          <td className="p-2 border-b border-slate-200 font-bold">{meterGas} m³</td>
                        </tr>
                        <tr>
                          <td className="p-2 border-b border-r border-slate-200">{docLang === 'uz' ? 'Sovuq suv' : 'Холодная вода'}</td>
                          <td className="p-2 border-b border-slate-200 font-bold">{meterColdWater} m³</td>
                        </tr>
                        <tr>
                          <td className="p-2 border-r border-slate-200">{docLang === 'uz' ? 'Issiq suv' : 'Горячая вода'}</td>
                          <td className="p-2 font-bold">{meterHotWater} m³</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* 2. Equipment Inventory */}
                  <div>
                    <h4 className="font-bold font-sans text-xs uppercase tracking-wider text-slate-700 mb-2">
                      {docLang === 'uz' ? '2. TOPSHIRILGAN JIHOZLAR VA MAISHIY TEXNIKALAR' : '2. ПЕРЕЧЕНЬ ПЕРЕДАННОГО ИМУЩЕСТВА'}
                    </h4>
                    <ul className="list-disc pl-5 space-y-1 text-xs">
                      <li>{docLang === 'uz' ? `Xonadon kalitlari: ${keysCount} komplekt` : `Ключи от квартиры: ${keysCount} компл.`}</li>
                      <li>{docLang === 'uz' ? `Mebellar to'plami: ${hasFurniture ? 'Soz va toza holatda' : 'Yo\'q'}` : `Комплект мебели: ${hasFurniture ? 'В исправном состоянии' : 'Отсутствует'}`}</li>
                      <li>{docLang === 'uz' ? `Konditsioner: ${hasAc ? 'Mavjud, pult bilan' : 'Yo\'q'}` : `Кондиционер: ${hasAc ? 'В наличии с пультом' : 'Отсутствует'}`}</li>
                      <li>{docLang === 'uz' ? `Muzlatgich: ${hasFridge ? 'Mavjud, soz holatda' : 'Yo\'q'}` : `Холодильник: ${hasFridge ? 'В рабочем состоянии' : 'Отсутствует'}`}</li>
                      <li>{docLang === 'uz' ? `Kir yuvish mashinasi: ${hasWashingMachine ? 'Mavjud, soz holatda' : 'Yo\'q'}` : `Стиральная машина: ${hasWashingMachine ? 'В рабочем состоянии' : 'Отсутствует'}`}</li>
                      <li>{docLang === 'uz' ? `Televizor: ${hasTv ? 'Mavjud, pult bilan' : 'Yo\'q'}` : `Телевизор: ${hasTv ? 'В наличии' : 'Отсутствует'}`}</li>
                    </ul>
                  </div>

                  <p className="text-xs text-slate-600 italic pt-2">
                    {docLang === 'uz'
                      ? 'Ijarachi xonadonning sanitariya va texnik holatini ko‘zdan kechirdi, uning holatiga e’tirozi yo‘q.'
                      : 'Арендатор осмотрел состояние квартиры и имущества, претензий по техническому и санитарному состоянию не имеет.'}
                  </p>
                </div>

                {/* Signatures */}
                <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-6 text-xs font-sans">
                  <div>
                    <h5 className="font-bold uppercase text-slate-700 mb-1">
                      {docLang === 'uz' ? 'TOPSHIRDI (Ijara beruvchi):' : 'СДАЛ (Арендодатель):'}
                    </h5>
                    <p className="text-[11px] text-slate-600 mb-4">{landlordName}</p>
                    <div className="pt-4 border-b border-dashed border-slate-400"></div>
                    <span className="text-[10px] text-slate-400 block mt-1">{docLang === 'uz' ? '(imzo)' : '(подпись)'}</span>
                  </div>

                  <div>
                    <h5 className="font-bold uppercase text-slate-700 mb-1">
                      {docLang === 'uz' ? 'QABUL QILDI (Ijarachi):' : 'ПРИНЯЛ (Арендатор):'}
                    </h5>
                    <p className="text-[11px] text-slate-600 mb-4">{tenantName}</p>
                    <div className="pt-4 border-b border-dashed border-slate-400"></div>
                    <span className="text-[10px] text-slate-400 block mt-1">{docLang === 'uz' ? '(imzo)' : '(подпись)'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
