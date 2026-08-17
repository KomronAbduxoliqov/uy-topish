import React from 'react';
import { X, ShieldCheck, CheckCircle, XCircle, AlertTriangle, Building, Eye } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { VerificationTier } from '@uytop/shared-types';

export const ModerationModal: React.FC = () => {
  const { isModerationModalOpen, setIsModerationModalOpen, properties, setProperties } = useAppStore();

  if (!isModerationModalOpen) return null;

  const handleApprove = (id: string) => {
    setProperties(
      properties.map((p) =>
        p.id === id ? { ...p, verificationTier: VerificationTier.DOCS_VERIFIED } : p
      )
    );
    alert("E'lon tasdiqlandi va 'Hujjati tekshirilgan' nishoni berildi.");
  };

  const handleSetInspected = (id: string) => {
    setProperties(
      properties.map((p) =>
        p.id === id ? { ...p, verificationTier: VerificationTier.INSPECTED } : p
      )
    );
    alert("E'longa eng yuqori 'Ko'rikdan o'tgan' nishoni berildi.");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <div>
              <h3 className="font-extrabold text-base">UyTop Moderatsiya & Xavfsizlik Paneli</h3>
              <p className="text-xs text-slate-400">E'lonlarni tekshirish va firibgarlik nazorati</p>
            </div>
          </div>
          <button
            onClick={() => setIsModerationModalOpen(false)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-4">
          <h4 className="font-bold text-slate-900 text-sm">Platformadagi faol e'lonlar va tekshiruv</h4>

          <div className="space-y-3">
            {properties.map((p) => (
              <div
                key={p.id}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={p.images?.[0]?.originalUrl || ''}
                    alt={p.titleUz}
                    className="w-16 h-16 object-cover rounded-xl flex-shrink-0"
                  />
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm line-clamp-1">{p.titleUz}</h5>
                    <p className="text-xs text-slate-500">{p.district} • {p.priceUzs.toLocaleString('uz-UZ')} so'm</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                        Egasi: {p.ownerName || 'Rustam K.'} ({p.ownerPhone || '+998901234567'})
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Daraja: {p.verificationTier}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(p.id)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Hujjatni tasdiqlash</span>
                  </button>
                  <button
                    onClick={() => handleSetInspected(p.id)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-1"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Ko'rikdan o'tkazish</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
