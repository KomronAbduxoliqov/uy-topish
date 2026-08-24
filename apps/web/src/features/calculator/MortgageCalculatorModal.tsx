'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Calculator,
  Percent,
  Calendar,
  DollarSign,
  TrendingDown,
  Building,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { formatPriceUzs } from '../../lib/utils/formatters';

export const MortgageCalculatorModal: React.FC = () => {
  const {
    isMortgageModalOpen,
    setIsMortgageModalOpen,
    mortgageInitialPrice,
    language
  } = useAppStore();

  const [propertyPrice, setPropertyPrice] = useState(mortgageInitialPrice || 600000000);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20); // 20%
  const [loanYears, setLoanYears] = useState(15); // 15 years
  const [interestRate, setInterestRate] = useState(17.5); // 17.5% (State subsidy rate in UZ)
  const [paymentType, setPaymentType] = useState<'annuity' | 'differentiated'>('annuity');

  useEffect(() => {
    if (mortgageInitialPrice) {
      setPropertyPrice(mortgageInitialPrice);
    }
  }, [mortgageInitialPrice]);

  if (!isMortgageModalOpen) return null;

  const downPaymentAmount = Math.round((propertyPrice * downPaymentPercent) / 100);
  const principalLoan = Math.max(0, propertyPrice - downPaymentAmount);

  // Monthly interest rate
  const monthlyRate = interestRate / 100 / 12;
  const totalMonths = loanYears * 12;

  // Annuity monthly payment
  const annuityMonthly =
    monthlyRate > 0 && totalMonths > 0
      ? Math.round(
          (principalLoan * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
            (Math.pow(1 + monthlyRate, totalMonths) - 1)
        )
      : Math.round(principalLoan / (totalMonths || 1));

  const totalAnnuityPayment = annuityMonthly * totalMonths;
  const totalInterest = Math.max(0, totalAnnuityPayment - principalLoan);

  // Recommended monthly income (payment shouldn't exceed 50% of income)
  const suggestedMinIncome = Math.round(annuityMonthly * 2);

  const formatUzs = (num: number) => {
    return formatPriceUzs(num);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-emerald-950 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">
                {language === 'en' ? 'Mortgage & Loan Calculator' : language === 'ru' ? 'Ипотечный Калькулятор' : 'Ipoteka va Kredit Kalkulyatori'}
              </h3>
              <p className="text-xs text-emerald-300">
                {language === 'en'
                  ? 'Accurate calculation based on Uzbekistan bank terms'
                  : language === 'ru'
                  ? 'Расчет по условиям банков Узбекистана'
                  : "O'zbekiston banklari shartlari asosida aniq hisob-kitob"}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsMortgageModalOpen(false)}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Input Controls */}
            <div className="space-y-4">
              {/* Property Price */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1.5">
                  {language === 'en' ? 'Property Price (UZS)' : language === 'ru' ? 'Стоимость недвижимости (сум)' : "Mulk qiymati (so'm)"}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="5000000"
                    value={propertyPrice}
                    onChange={(e) => setPropertyPrice(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                    ≈ ${(propertyPrice / 12650).toFixed(0)}
                  </span>
                </div>
              </div>

              {/* Down Payment % */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    {language === 'en' ? 'Down payment:' : language === 'ru' ? 'Первоначальный взнос:' : "Boshlang'ich to'lov:"} {downPaymentPercent}%
                  </label>
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    {formatUzs(downPaymentAmount)}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[15, 20, 30, 50].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setDownPaymentPercent(pct)}
                      className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                        downPaymentPercent === pct
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
                <input
                  type="range"
                  min="10"
                  max="80"
                  step="5"
                  value={downPaymentPercent}
                  onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              {/* Loan Term */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    {language === 'en' ? 'Loan Term:' : language === 'ru' ? 'Срок кредита:' : 'Kredit muddati:'} {loanYears} {language === 'en' ? 'years' : language === 'ru' ? 'лет' : 'yil'}
                  </label>
                  <span className="text-xs text-slate-500 font-medium">
                    ({totalMonths} {language === 'en' ? 'months' : language === 'ru' ? 'мес.' : 'oy'})
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[5, 10, 15, 20].map((yr) => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => setLoanYears(yr)}
                      className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                        loanYears === yr
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {yr} {language === 'en' ? 'yrs' : language === 'ru' ? 'лет' : 'yil'}
                    </button>
                  ))}
                </div>
                <input
                  type="range"
                  min="3"
                  max="25"
                  value={loanYears}
                  onChange={(e) => setLoanYears(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              {/* Interest Rate */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    {language === 'en' ? 'Annual interest rate:' : language === 'ru' ? 'Годовая ставка:' : 'Yillik foiz stavkasi:'} {interestRate}%
                  </label>
                  <span className="text-xs text-slate-400 font-medium">
                    {interestRate <= 18
                      ? (language === 'en' ? 'State program' : language === 'ru' ? 'Гос. субсидия' : 'Davlat subsidiyasi')
                      : (language === 'en' ? 'Commercial loan' : language === 'ru' ? 'Коммерческий кредит' : 'Tijoriy kredit')}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: language === 'en' ? '17.5% (State)' : language === 'ru' ? '17.5% (Гос)' : '17.5% (Davlat)', val: 17.5 },
                    { label: language === 'en' ? '21% (Standard)' : language === 'ru' ? '21% (Стандарт)' : '21% (Standart)', val: 21 },
                    { label: language === 'en' ? '24% (Commercial)' : language === 'ru' ? '24% (Коммерц)' : '24% (Tijoriy)', val: 24 }
                  ].map((rate) => (
                    <button
                      key={rate.val}
                      type="button"
                      onClick={() => setInterestRate(rate.val)}
                      className={`py-1.5 px-2 text-[11px] font-bold rounded-lg border transition-all truncate ${
                        interestRate === rate.val
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {rate.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Calculation Results Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 sm:p-6 rounded-3xl flex flex-col justify-between shadow-xl">
              <div>
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block mb-1">
                  {language === 'en' ? 'Monthly Payment' : language === 'ru' ? 'Ежемесячный платеж' : "Oylik to'lov miqdori"}
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
                  {formatUzs(annuityMonthly)}
                  <span className="text-xs font-normal text-slate-400 ml-1.5">
                    {language === 'en' ? '/ month' : language === 'ru' ? '/ мес.' : '/ oy'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mb-6">
                  {language === 'en' ? 'Recommended monthly income:' : language === 'ru' ? 'Рекомендованный доход:' : 'Tavsiya etilgan oylik daromad:'}{' '}
                  <b className="text-emerald-400">{formatUzs(suggestedMinIncome)}</b>
                </p>

                {/* Breakdown List */}
                <div className="space-y-3 pt-4 border-t border-slate-700/80 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>{language === 'en' ? 'Principal loan amount:' : language === 'ru' ? 'Сумма кредита (тело):' : 'Kredit (asosiy qarz) summasi:'}</span>
                    <b className="text-white">{formatUzs(principalLoan)}</b>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>{language === 'en' ? 'Down payment' : language === 'ru' ? 'Первоначальный взнос' : "Boshlang'ich to'lov"} ({downPaymentPercent}%):</span>
                    <b className="text-emerald-400">{formatUzs(downPaymentAmount)}</b>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>{language === 'en' ? 'Total accrued interest:' : language === 'ru' ? 'Начисленные проценты:' : 'Umumiy hisoblangan foiz:'}</span>
                    <b className="text-amber-400">+{formatUzs(totalInterest)}</b>
                  </div>
                  <div className="flex items-center justify-between text-slate-300 pt-2 border-t border-slate-700/60 font-bold">
                    <span className="text-white">{language === 'en' ? 'Total payment with down payment:' : language === 'ru' ? 'Общая выплата с первым взносом:' : "Jami to'lov miqdori:"}</span>
                    <span className="text-white">{formatUzs(totalAnnuityPayment + downPaymentAmount)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-700 flex items-center gap-2 text-[11px] text-slate-400">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>
                  {language === 'en'
                    ? 'In compliance with Uzbekistan 2026 state mortgage guidelines.'
                    : language === 'ru'
                    ? 'В соответствии с нормативами ипотечных программ Узбекистана.'
                    : "O'zbekiston Respublikasining 2026-yilgi ipoteka dasturi normativlariga muvofiq."}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-slate-800 px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
            {language === 'en'
              ? 'Exact bank rates and conditions are verified at bank branches.'
              : language === 'ru'
              ? 'Точные ставки и условия уточняются в отделениях банков.'
              : "Banklar bo'yicha aniq stavkalar bank filialida tekshiriladi."}
          </span>
          <button
            onClick={() => setIsMortgageModalOpen(false)}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm ml-auto"
          >
            {language === 'en' ? 'Understood' : language === 'ru' ? 'Понятно' : 'Tushunarli'}
          </button>
        </div>
      </div>
    </div>
  );
};
