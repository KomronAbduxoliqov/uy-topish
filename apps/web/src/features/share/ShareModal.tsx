'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  MessageCircle, 
  Copy, 
  Check, 
  Mail, 
  QrCode,
  MapPin,
  Image as ImageIcon
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: {
    id: string;
    titleUz: string;
    titleRu?: string;
    titleEn?: string;
    district: string;
    rooms: number;
    priceUzs: number;
    imageUrl?: string;
  };
}

export function ShareModal({ isOpen, onClose, property }: ShareModalProps) {
  const { language } = useAppStore();
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Format price
  const formattedPrice = property.priceUzs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const url = typeof window !== 'undefined' ? `${window.location.origin}/property/${property.id}` : `https://uytop.uz/property/${property.id}`;
  
  const title = language === 'en'
    ? (property.titleEn || property.titleUz)
    : language === 'ru'
    ? (property.titleRu || property.titleUz)
    : property.titleUz;

  const shareText = language === 'en'
    ? `Check out this ${property.rooms}-room property in ${property.district} district on UyTop for ${formattedPrice} UZS. View: ${url}`
    : language === 'ru'
    ? `Смотрите ${property.rooms}-комнатную квартиру в районе ${property.district} на UyTop за ${formattedPrice} сум. Подробнее: ${url}`
    : `UyTop da topilgan ${property.rooms} xonali kvartira - ${property.district} tumani, ${formattedPrice} so'm. Ko'rish: ${url}`;
  
  useEffect(() => {
    if (showQr && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw a simulated QR code
        const size = canvas.width;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, size, size);
        
        ctx.fillStyle = '#000000';
        const gridSize = 25;
        const cellSize = size / gridSize;
        
        // Pseudo-random generation based on property id string
        let seed = property.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        
        const random = () => {
          const x = Math.sin(seed++) * 10000;
          return x - Math.floor(x);
        };
        
        // Draw finder patterns (the 3 big squares)
        const drawFinder = (x: number, y: number) => {
          ctx.fillRect(x * cellSize, y * cellSize, 7 * cellSize, 7 * cellSize);
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect((x + 1) * cellSize, (y + 1) * cellSize, 5 * cellSize, 5 * cellSize);
          ctx.fillStyle = '#000000';
          ctx.fillRect((x + 2) * cellSize, (y + 2) * cellSize, 3 * cellSize, 3 * cellSize);
        };
        
        drawFinder(1, 1);
        drawFinder(gridSize - 8, 1);
        drawFinder(1, gridSize - 8);
        
        // Random blocks
        for (let i = 0; i < gridSize; i++) {
          for (let j = 0; j < gridSize; j++) {
            // skip finder patterns area
            if (
              (i <= 8 && j <= 8) || 
              (i >= gridSize - 9 && j <= 8) || 
              (i <= 8 && j >= gridSize - 9)
            ) continue;
            
            if (random() > 0.5) {
              ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
            }
          }
        }
      }
    }
  }, [showQr, property.id]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const shareLinks = {
    telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(shareText)}`
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
            {language === 'en' ? 'Share' : language === 'ru' ? 'Поделиться' : 'Ulashish'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Property Preview Card */}
          <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
            <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 flex-shrink-0 flex items-center justify-center">
              {property.imageUrl ? (
                <img src={property.imageUrl} alt={title} className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="text-slate-400" size={24} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-slate-900 dark:text-white truncate">{title}</h3>
              <p className="text-sm text-brand-600 dark:text-brand-400 font-semibold mt-1">
                {formattedPrice} {language === 'en' ? 'UZS' : language === 'ru' ? 'сум' : "so'm"}
              </p>
              <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mt-1 gap-1">
                <MapPin size={12} />
                <span className="truncate">
                  {property.district} {language === 'en' ? 'district' : language === 'ru' ? 'район' : 'tumani'}
                </span>
              </div>
            </div>
          </div>

          {!showQr ? (
            /* Share Grid */
            <div className="grid grid-cols-2 gap-3">
              <a 
                href={shareLinks.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/50 transition-colors"
              >
                <Send size={28} className="drop-shadow-sm" />
                <span className="text-sm font-medium">Telegram</span>
              </a>
              
              <a 
                href={shareLinks.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
              >
                <MessageCircle size={28} className="drop-shadow-sm" />
                <span className="text-sm font-medium">WhatsApp</span>
              </a>
              
              <button 
                onClick={handleCopy}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-750 transition-all active:scale-95 border border-slate-100 dark:border-slate-700"
              >
                {copied ? (
                  <Check size={28} className="text-emerald-500 drop-shadow-sm animate-in zoom-in" />
                ) : (
                  <Copy size={28} className="text-slate-600 dark:text-slate-300 drop-shadow-sm" />
                )}
                <span className="text-sm font-medium">
                  {copied
                    ? (language === 'en' ? 'Copied!' : language === 'ru' ? 'Скопировано!' : 'Nusxa olindi!')
                    : (language === 'en' ? 'Copy Link' : language === 'ru' ? 'Копировать' : 'Nusxalash')}
                </span>
              </button>
              
              <a 
                href={shareLinks.email}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors"
              >
                <Mail size={28} className="drop-shadow-sm" />
                <span className="text-sm font-medium">Email</span>
              </a>

              <button 
                onClick={() => setShowQr(true)}
                className="col-span-2 flex items-center justify-center gap-3 p-4 rounded-2xl bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 hover:bg-brand-100 dark:hover:bg-brand-900/50 transition-colors border border-brand-100 dark:border-brand-900"
              >
                <QrCode size={24} />
                <span className="font-medium">
                  {language === 'en' ? 'Share via QR Code' : language === 'ru' ? 'Поделиться через QR-код' : 'QR Kod orqali ulashish'}
                </span>
              </button>
            </div>
          ) : (
            /* QR Code View */
            <div className="flex flex-col items-center space-y-4 animate-in fade-in zoom-in duration-300">
              <div className="p-4 bg-white rounded-3xl shadow-sm border-2 border-brand-100 dark:border-brand-800">
                <canvas 
                  ref={canvasRef} 
                  width={200} 
                  height={200} 
                  className="rounded-xl"
                />
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm font-medium text-center">
                {language === 'en'
                  ? 'Scan with your phone camera'
                  : language === 'ru'
                  ? 'Отсканируйте камерой телефона'
                  : 'Telefoningiz kamerasi bilan skanerlang'}
              </p>
              <button 
                onClick={() => setShowQr(false)}
                className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 font-medium py-2 px-4 rounded-xl hover:bg-brand-50 dark:hover:bg-brand-950/40 transition-colors"
              >
                {language === 'en' ? 'Go Back' : language === 'ru' ? 'Назад' : 'Ortga qaytish'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

