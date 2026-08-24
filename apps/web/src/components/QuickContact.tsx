'use client';

import React from 'react';
import { Phone } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export interface QuickContactProps {
  phone: string;
  ownerName?: string;
  propertyTitle: string;
  compact?: boolean;
  className?: string;
}

/**
 * Normalizes phone numbers to standard Uzbekistan format (998XXXXXXXXX).
 * Strips all non-digit characters and ensures country code 998.
 */
export function cleanUzbekPhone(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');

  if (digits.startsWith('998') && digits.length === 12) {
    return digits;
  }
  if (digits.length === 9) {
    return `998${digits}`;
  }
  if (digits.startsWith('8') && digits.length === 10) {
    return `998${digits.slice(1)}`;
  }
  if (digits.startsWith('998')) {
    return digits;
  }
  return digits.length > 0 ? (digits.length <= 9 ? `998${digits}` : digits) : '';
}

/**
 * Formats a phone number in human-readable Uzbekistan format: +998 90 123-45-67
 */
export function formatUzbekPhone(phone: string): string {
  const cleaned = cleanUzbekPhone(phone);
  if (cleaned.length === 12 && cleaned.startsWith('998')) {
    const code = cleaned.slice(3, 5);
    const p1 = cleaned.slice(5, 8);
    const p2 = cleaned.slice(8, 10);
    const p3 = cleaned.slice(10, 12);
    return `+998 ${code} ${p1}-${p2}-${p3}`;
  }
  return phone ? phone.trim() : '';
}

/**
 * WhatsApp SVG icon
 */
const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0012.04 2zm0 18.15c-1.52 0-3.01-.41-4.31-1.18l-.31-.18-3.2.84.85-3.12-.2-.32a8.19 8.19 0 01-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 012.41 5.83c0 4.54-3.7 8.23-8.25 8.23zm4.52-6.17c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.98-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.43s-.56-1.35-.77-1.85c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.05s.88 2.38 1 2.54c.12.17 1.73 2.64 4.19 3.7.59.25 1.04.41 1.4.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.07-.1-.23-.17-.48-.3z" />
  </svg>
);

export const QuickContact: React.FC<QuickContactProps> = ({
  phone,
  ownerName,
  propertyTitle,
  compact = false,
  className = '',
}) => {
  const { language } = useAppStore();
  const cleanPhone = cleanUzbekPhone(phone);
  const rawMessage = language === 'en'
    ? `Hello! I saw your listing '${propertyTitle}' on UyTop. Is it still available?`
    : language === 'ru'
    ? `Здравствуйте! Я увидел ваше объявление '${propertyTitle}' на UyTop. Оно еще актуально?`
    : `Assalomu alaykum! UyTop platformasida '${propertyTitle}' e'loningizni ko'rdim. Hali aktualmi?`;

  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(rawMessage)}`;
  const callUrl = `tel:+${cleanPhone || phone.replace(/\D/g, '')}`;

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (compact) {
    return (
      <div
        className={`flex items-center gap-1.5 ${className}`}
        onClick={handleActionClick}
      >
        {/* WhatsApp Button */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          title={`WhatsApp: ${ownerName || (language === 'en' ? 'Owner' : language === 'ru' ? 'Владелец' : 'Egasi')}`}
          aria-label={language === 'en' ? 'Contact via WhatsApp' : language === 'ru' ? 'Связаться через WhatsApp' : "WhatsApp orqali bog'lanish"}
          className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white transition-all shadow-sm hover:shadow"
        >
          <WhatsAppIcon className="w-4 h-4" />
        </a>

        {/* Call Button */}
        <a
          href={callUrl}
          title={`${language === 'en' ? 'Call' : language === 'ru' ? 'Позвонить' : "Qo'ng'iroq"}: ${formatUzbekPhone(phone)}`}
          aria-label={language === 'en' ? 'Call' : language === 'ru' ? 'Позвонить' : "Qo'ng'iroq qilish"}
          className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-sky-600 hover:bg-sky-700 active:scale-95 text-white transition-all shadow-sm hover:shadow"
        >
          <Phone className="w-3.5 h-3.5" />
        </a>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-2.5 w-full ${className}`}
      onClick={handleActionClick}
    >
      {/* WhatsApp Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={language === 'en' ? 'Contact via WhatsApp' : language === 'ru' ? 'Связаться через WhatsApp' : "WhatsApp orqali bog'lanish"}
        className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-sm transition-all shadow-sm hover:shadow-md"
      >
        <WhatsAppIcon className="w-4 h-4 shrink-0" />
        <span>WhatsApp</span>
      </a>

      {/* Call Button */}
      <a
        href={callUrl}
        aria-label={language === 'en' ? 'Call' : language === 'ru' ? 'Позвонить' : "Qo'ng'iroq qilish"}
        className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 active:scale-[0.98] text-white font-bold text-sm transition-all shadow-sm hover:shadow-md"
      >
        <Phone className="w-4 h-4 shrink-0" />
        <span>{language === 'en' ? 'Call' : language === 'ru' ? 'Позвонить' : "Qo'ng'iroq"}</span>
      </a>
    </div>
  );
};
