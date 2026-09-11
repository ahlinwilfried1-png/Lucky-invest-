import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Heart,
  Calendar,
  Clock,
  Coins,
  Zap,
  ArrowRight,
  Crown,
  Headphones,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Product, Investment } from '../types';
import { DataStore } from '../dataStore';

interface ProductsTabViewProps {
  products: Product[];
  productSubTab: 'stability' | 'wellbeing';
  setProductSubTab: (tab: 'stability' | 'wellbeing') => void;
  handleBuyProduct: (product: Product) => void;
  buyingProductId: string | null;
  activeInvestments: Investment[];
  getCurrency: () => string;
  t: (fr: string, en: string) => string;
  setIsSupportPageOpen?: (open: boolean) => void;
  unreadSupportCount?: number;
}

export const ProductsTabView: React.FC<ProductsTabViewProps> = ({
  products,
  productSubTab,
  setProductSubTab,
  handleBuyProduct,
  buyingProductId,
  getCurrency,
  t,
  setIsSupportPageOpen,
  unreadSupportCount = 0
}) => {
  const stabilityProducts = products
    .filter(p => p.category === 'stability' || !p.category)
    .sort((a, b) => (a.price || 0) - (b.price || 0));

  const wellbeingProducts = products
    .filter(p => p.category === 'wellbeing')
    .sort((a, b) => (a.price || 0) - (b.price || 0));

  const [wellbeingSchedule, setWellbeingSchedule] = useState(() => DataStore.isCategoryOpen('wellbeing'));

  useEffect(() => {
    const updateSchedule = () => {
      setWellbeingSchedule(DataStore.isCategoryOpen('wellbeing'));
    };
    window.addEventListener('gi_category_schedules_updated', updateSchedule);
    window.addEventListener('gi_store_updated', updateSchedule);
    const interval = setInterval(updateSchedule, 4000);
    return () => {
      window.removeEventListener('gi_category_schedules_updated', updateSchedule);
      window.removeEventListener('gi_store_updated', updateSchedule);
      clearInterval(interval);
    };
  }, []);

  const currentProducts = productSubTab === 'stability' ? stabilityProducts : wellbeingProducts;

  const defaultGoldImage = "https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&q=80&w=800";

  return (
    <div className="bg-[#fcfaf7] -mx-2 sm:-mx-6 md:-mx-12 xl:-mx-20 -mt-2 px-3 sm:px-6 md:px-12 xl:px-20 pt-2 pb-24 text-slate-900 min-h-screen text-left animate-fadeIn relative overflow-x-hidden">
      
      {/* Decorative Golden Arc at the top right as seen in reference image */}
      <div className="absolute top-0 right-0 w-44 sm:w-60 h-24 sm:h-32 bg-gradient-to-bl from-amber-300/35 via-amber-200/15 to-transparent rounded-bl-full pointer-events-none" />

      <div className="max-w-4xl mx-auto w-full space-y-3.5 relative z-10">
        
        {/* TOP BRAND HEADER (Matching Reference Screenshot) */}
        <div className="flex items-center justify-between pt-1 pb-1">
          <div className="flex items-center gap-2.5">
            {/* Elegant Monogram Crest GA with Crown */}
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-100 via-amber-50 to-white border border-amber-300 flex items-center justify-center shadow-xs shrink-0 relative">
              <Crown className="w-4 h-4 text-amber-600 absolute -top-1" />
              <span className="font-serif font-black text-amber-800 text-lg leading-none mt-1">GA</span>
            </div>
            <div>
              <h1 className="font-serif font-black text-base sm:text-lg tracking-wider text-amber-700 uppercase leading-none">
                GOLD AVENUE
              </h1>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-1 leading-tight whitespace-pre-line">
                Investir aujourd'hui,{"\n"}construire demain.
              </p>
            </div>
          </div>
        </div>

        {/* TWO-COLUMN LAYOUT: VERTICAL TABS (LEFT) + VIP CARDS (RIGHT) */}
        <div className="flex flex-row gap-2.5 sm:gap-4 items-start">
          
          {/* LEFT SIDEBAR: STABILITÉ & BIEN-ÊTRE TABS */}
          <div className="w-[74px] min-[375px]:w-[82px] sm:w-28 shrink-0 flex flex-col gap-2.5 select-none pt-0.5">
            
            {/* TAB 1: STABILITÉ */}
            <button
              type="button"
              onClick={() => setProductSubTab('stability')}
              className={`w-full flex flex-col items-center justify-center p-2.5 py-3 rounded-2xl transition-all duration-200 shrink-0 cursor-pointer text-center outline-none ${
                productSubTab === 'stability'
                  ? 'bg-gradient-to-b from-[#e5a024] to-[#c88214] text-white shadow-sm scale-[1.02]'
                  : 'bg-white text-slate-700 border border-slate-100 shadow-xs hover:bg-slate-50'
              }`}
              id="tab-stabilite"
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mb-1 transition-all ${
                productSubTab === 'stability' 
                  ? 'bg-white/20 text-white border border-white/25 shadow-xs' 
                  : 'bg-[#fef9ed] text-amber-600 border border-amber-200/50'
              }`}>
                <TrendingUp className="w-4.5 h-4.5 stroke-[2.4]" />
              </div>
              <span className="font-sans font-black text-[9.5px] min-[375px]:text-[10.5px] uppercase tracking-wider block leading-tight">
                {t('STABILITÉ', 'STABILITY')}
              </span>
            </button>

            {/* TAB 2: BIEN-ÊTRE */}
            <button
              type="button"
              onClick={() => setProductSubTab('wellbeing')}
              className={`w-full flex flex-col items-center justify-center p-2.5 py-3 rounded-2xl transition-all duration-200 shrink-0 cursor-pointer text-center outline-none ${
                productSubTab === 'wellbeing'
                  ? 'bg-gradient-to-b from-[#e5a024] to-[#c88214] text-white shadow-sm scale-[1.02]'
                  : 'bg-white text-slate-700 border border-slate-100 shadow-xs hover:bg-slate-50'
              }`}
              id="tab-bien-etre"
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mb-1 transition-all ${
                productSubTab === 'wellbeing' 
                  ? 'bg-white/20 text-white border border-white/25 shadow-xs' 
                  : 'bg-slate-50 text-slate-500 border border-slate-200/60'
              }`}>
                <Heart className="w-4.5 h-4.5 stroke-[2.4]" />
              </div>
              <span className="font-sans font-black text-[9.5px] min-[375px]:text-[10px] uppercase tracking-wider block leading-tight">
                {t('BIEN-ÊTRE', 'WELL-BEING')}
              </span>
            </button>
          </div>

          {/* RIGHT COLUMN: VIP PRODUCT CARDS LIST */}
          <div className="flex-1 min-w-0 space-y-3">
            {/* Live Wellbeing Schedule Alert Banner */}
            {productSubTab === 'wellbeing' && (
              <div 
                className={`p-3 rounded-2xl flex items-center justify-between gap-2 border text-xs shadow-2xs transition-all ${
                  wellbeingSchedule.isOpen 
                    ? 'bg-amber-50/80 border-amber-200/80 text-amber-950' 
                    : 'bg-[#fff9f2] border-amber-300/80 text-amber-950'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                    wellbeingSchedule.isOpen ? 'bg-emerald-500/20 text-emerald-700' : 'bg-amber-500/20 text-amber-700'
                  }`}>
                    <Clock className="w-4 h-4 stroke-[2.4]" />
                  </div>
                  <div className="truncate">
                    <span className="font-bold block leading-tight">
                      {wellbeingSchedule.isOpen ? 'Achats Bien-être ouverts' : 'Achats Bien-être fermés'}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Plage horaire : {wellbeingSchedule.openTime} — {wellbeingSchedule.closeTime}
                    </span>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider font-mono shrink-0 border ${
                  wellbeingSchedule.isOpen 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                    : 'bg-amber-100 text-amber-900 border-amber-300'
                }`}>
                  {wellbeingSchedule.statusLabel}
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
              {currentProducts.map((p, index) => {
                const isBlocked = p.isBlocked === true;
                const formattedReopenTime = p.reopenDateTime 
                  ? new Date(p.reopenDateTime).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
                  : null;

                const vipLevel = p.vipLevel || (index + 1);
                const isWellbeing = p.category === 'wellbeing';
                const isWellbeingClosed = isWellbeing && !wellbeingSchedule.isOpen;
                
                // Display Title matching exact format: "Titres à revenu fixe 1", etc.
                const displayName = isWellbeing
                  ? `Gold Avenue Bien-être ${vipLevel}`
                  : `Titres à revenu fixe ${vipLevel}`;

                const totalExpectedProductPayout = p.totalReturn || (p.price + (p.dailyReturn * p.durationDays));
                const imgSrc = (p.imageUrl && p.imageUrl.trim() !== '') ? p.imageUrl : defaultGoldImage;

                return (
                  <div
                    key={p.id}
                    className="bg-white rounded-3xl shadow-xs hover:shadow-md border border-slate-100/90 overflow-hidden p-3 sm:p-3.5 space-y-2.5 transition-all duration-300 relative flex flex-col justify-between"
                    id={`product-card-${p.id}`}
                  >
                    {/* Top Section: Gold Bullion Image Banner */}
                    <div>
                      <div className="relative w-full h-32 sm:h-36 rounded-2xl overflow-hidden shadow-2xs bg-slate-900 group">
                        <img 
                          src={imgSrc} 
                          alt={displayName} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />

                        {/* Glossy subtle shine overlay */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />

                        {/* VIP Capsule Pill at Top Left (Exact style from reference screenshot) */}
                        <div className="absolute top-2 left-2 bg-black/45 backdrop-blur-xs text-white font-sans font-extrabold text-[9.5px] px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-sm border border-white/15">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          <span>VIP {vipLevel} • {isWellbeing ? 'BIEN-ÊTRE' : 'STABILITÉ'}</span>
                        </div>

                        {/* Title Overlay at Bottom of Image */}
                        <div className="absolute inset-x-0 bottom-0 pt-6 pb-2 px-3 bg-gradient-to-t from-black/85 via-black/40 to-transparent text-left">
                          <h4 className="font-sans font-black text-sm sm:text-[15px] text-white drop-shadow-sm leading-tight tracking-wide">
                            {displayName}
                          </h4>
                        </div>
                      </div>

                      {/* Details Rows on Clean White Background (White + Gold + Midnight Blue) */}
                      <div className="mt-2.5 space-y-2 text-left select-none">
                        {/* Row 1: Rendement Journalier */}
                        <div className="flex justify-between items-center text-xs sm:text-[13px]">
                          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                            <Calendar className="w-4 h-4 text-amber-500 shrink-0 stroke-[2.2]" />
                            <span>Rendement Journalier</span>
                          </div>
                          <span className="text-amber-600 font-extrabold text-sm sm:text-[15px] font-mono">
                            +{p.dailyReturn.toLocaleString()} {getCurrency()}/j
                          </span>
                        </div>

                        {/* Row 2: Durée du Cycle */}
                        <div className="flex justify-between items-center text-xs sm:text-[13px]">
                          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                            <Clock className="w-4 h-4 text-amber-500 shrink-0 stroke-[2.2]" />
                            <span>Durée du Cycle</span>
                          </div>
                          <span className="bg-[#fef9ee] text-[#b45309] font-bold text-xs sm:text-[12.5px] px-3 py-0.5 rounded-full border border-amber-200/50 font-mono">
                            {p.durationDays} Jours
                          </span>
                        </div>

                        {/* Row 3: Revenu Total Prévu */}
                        <div className="flex justify-between items-center text-xs sm:text-[13px]">
                          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                            <Coins className="w-4 h-4 text-amber-500 shrink-0 stroke-[2.2]" />
                            <span>Revenu Total Prévu</span>
                          </div>
                          <span className="text-[#0f172a] font-black text-sm sm:text-base font-mono">
                            {totalExpectedProductPayout.toLocaleString()} {getCurrency()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Area: Split Price & Investir Button (Exact Layout from Screenshot) */}
                    <div className="pt-2">
                      <div className="flex items-stretch gap-2">
                        {/* Left: Price Pill with Zap Icon */}
                        <div className="flex-1 bg-[#fef9ed] border border-amber-200/70 rounded-2xl py-2.5 px-3 flex items-center justify-center gap-1.5 shadow-2xs">
                          <span className="text-[#b45309] font-black text-xs sm:text-sm font-mono whitespace-nowrap">
                            {p.price.toLocaleString()} {getCurrency()}
                          </span>
                          <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400 shrink-0" />
                        </div>

                        {/* Right: Solid Rich Gold Investir Button */}
                        <button
                          onClick={() => handleBuyProduct(p)}
                          disabled={isBlocked || isWellbeingClosed || buyingProductId === p.id}
                          className={`flex-1 bg-gradient-to-r ${
                            isWellbeingClosed
                              ? 'from-slate-400 via-slate-400 to-slate-500 cursor-not-allowed opacity-75'
                              : 'from-[#d9962a] via-[#e5a836] to-[#f2bb45] hover:from-[#c88519] hover:to-[#dfa025] cursor-pointer'
                          } active:scale-[0.98] text-white font-black text-xs sm:text-sm uppercase tracking-wider py-2.5 px-3 rounded-2xl flex items-center justify-center gap-1.5 shadow-xs transition-all border-none outline-none ${
                            isBlocked || buyingProductId === p.id ? 'opacity-60 cursor-not-allowed' : ''
                          }`}
                        >
                          <span className="whitespace-nowrap">
                            {buyingProductId === p.id 
                              ? 'Paiement...' 
                              : isWellbeingClosed 
                                ? 'FERMÉ' 
                                : 'INVESTIR'}
                          </span>
                          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                        </button>
                      </div>

                      {isWellbeingClosed && !isBlocked && (
                        <div className="mt-2 text-[10.5px] font-medium text-amber-800 bg-amber-50/70 border border-amber-200/50 rounded-xl px-2.5 py-1 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Disponible de {wellbeingSchedule.openTime} à {wellbeingSchedule.closeTime}</span>
                        </div>
                      )}
                    </div>

                    {/* Blocked Overlay if Product is Closed */}
                    {isBlocked && (
                      <div className="absolute inset-0 rounded-3xl bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-center p-3 z-10">
                        <div className="bg-red-500 text-white font-bold text-xs uppercase px-3 py-1 rounded-full shadow-sm">
                          Fermé / Suspendu
                        </div>
                        {formattedReopenTime && (
                          <span className="text-[10px] text-white font-mono mt-1.5 bg-black/70 px-2.5 py-0.5 rounded-full">
                            Ouvre à: {formattedReopenTime}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Empty state if no products */}
              {currentProducts.length === 0 && (
                <div className="col-span-full py-12 px-4 text-center rounded-3xl bg-white border border-dashed border-amber-200/80 max-w-sm mx-auto shadow-xs">
                  <span className="text-2xl">📭</span>
                  <h5 className="font-sans font-black text-slate-800 uppercase tracking-wider text-xs mt-2">
                    Aucun produit disponible
                  </h5>
                  <p className="text-[11px] text-slate-500 font-medium mt-1">
                    Aucun plan d'investissement n'est actif dans cette catégorie pour le moment.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* FLOATING SUPPORT HEADPHONES BUTTON (As seen in the reference screenshot) */}
      {setIsSupportPageOpen && (
        <button
          onClick={() => setIsSupportPageOpen(true)}
          className="fixed bottom-18 right-4 sm:right-8 w-11 h-11 rounded-full bg-gradient-to-tr from-[#d9962a] via-[#e5a836] to-[#f2bb45] text-white flex items-center justify-center shadow-lg border-2 border-white hover:scale-105 active:scale-95 transition-all cursor-pointer z-30"
          title="Assistance en direct"
          id="floating-support-btn"
        >
          <Headphones className="w-5 h-5 stroke-[2.2]" />
          <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
        </button>
      )}

    </div>
  );
};
