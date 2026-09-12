import React, { useState, useEffect } from 'react';
import { 
  Megaphone, 
  ChevronLeft, 
  Pin, 
  CheckCheck, 
  Clock, 
  ShieldAlert, 
  Sparkles, 
  Info, 
  Wrench, 
  Award,
  BellRing
} from 'lucide-react';
import { Announcement } from '../types';
import { DataStore } from '../dataStore';

interface AnnoncesViewProps {
  userState: {
    id?: string;
    phone?: string;
    name?: string;
    role?: string;
  };
  onBack: () => void;
  triggerToast?: (message: string, type: 'success' | 'error' | 'info') => void;
  t?: (fr: string, en?: string) => string;
}

export const AnnoncesView: React.FC<AnnoncesViewProps> = ({
  userState,
  onBack,
  triggerToast,
}) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => DataStore.getAnnouncements());
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [readIds, setReadIds] = useState<string[]>(() => DataStore.getReadAnnouncementIds(userState.id));

  // Auto-refresh when announcements are updated or store changes
  useEffect(() => {
    const handleUpdate = () => {
      setAnnouncements(DataStore.getAnnouncements());
      setReadIds(DataStore.getReadAnnouncementIds(userState.id));
    };

    window.addEventListener('gi_announcements_updated', handleUpdate);
    window.addEventListener('gi_read_announcements_updated', handleUpdate);
    window.addEventListener('gi_store_updated', handleUpdate);

    return () => {
      window.removeEventListener('gi_announcements_updated', handleUpdate);
      window.removeEventListener('gi_read_announcements_updated', handleUpdate);
      window.removeEventListener('gi_store_updated', handleUpdate);
    };
  }, [userState.id]);

  // Mark all announcements as read when user views this screen
  useEffect(() => {
    if (userState.id) {
      DataStore.markAllAnnouncementsAsRead(userState.id);
      setReadIds(DataStore.getReadAnnouncementIds(userState.id));
    }
  }, [userState.id]);

  const handleMarkAllAsRead = () => {
    if (userState.id) {
      DataStore.markAllAnnouncementsAsRead(userState.id);
      setReadIds(DataStore.getReadAnnouncementIds(userState.id));
      if (triggerToast) {
        triggerToast('Toutes les annonces ont été marquées comme lues', 'success');
      }
    }
  };

  const filteredAnnouncements = announcements.filter(ann => {
    if (activeCategory === 'all') return true;
    return (ann.category || 'officiel') === activeCategory;
  });

  const unreadCount = announcements.filter(a => !readIds.includes(a.id)).length;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const getCategoryBadge = (category?: string) => {
    const cat = category?.toLowerCase() || 'officiel';
    switch (cat) {
      case 'important':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-700 border border-rose-200">
            <ShieldAlert className="w-3 h-3" />
            Important
          </span>
        );
      case 'promotion':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200">
            <Sparkles className="w-3 h-3" />
            Promotion
          </span>
        );
      case 'maintenance':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
            <Wrench className="w-3 h-3" />
            Maintenance
          </span>
        );
      case 'info':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-100 text-sky-700 border border-sky-200">
            <Info className="w-3 h-3" />
            Information
          </span>
        );
      case 'officiel':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-300">
            <Award className="w-3 h-3 text-amber-600" />
            Officiel
          </span>
        );
    }
  };

  return (
    <div className="bg-[#f8f9fa] -mx-3 sm:-mx-5 md:-mx-8 xl:-mx-16 -mt-3.5 px-3 sm:px-4 md:px-6 xl:px-12 pt-3 pb-20 text-slate-900 min-h-screen text-left animate-fadeIn">
      <div className="max-w-xl mx-auto w-full space-y-4">
        
        {/* HEADER SECTION */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer border border-slate-200/60"
              aria-label="Retour au profil"
              id="annonces-back-button"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
                  <Megaphone className="w-4 h-4" />
                </div>
                <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Annonces Officielles
                </h1>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Communications et actualités publiées par l'administration
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-[10.5px] font-bold border border-amber-200/60 flex items-center gap-1 transition-colors cursor-pointer"
              title="Tout marquer comme lu"
            >
              <CheckCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>Tout lu</span>
            </button>
          )}
        </div>

        {/* HERO INFORMATIONAL CARD */}
        <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-2xl p-4 text-white shadow-sm border border-slate-800 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-1.5 text-amber-400 text-[10px] font-black uppercase tracking-widest">
              <BellRing className="w-3.5 h-3.5" />
              <span>Canal Officiel Gold Avenue</span>
            </div>
            <h2 className="text-sm font-bold text-white mt-1">
              Restez informé en temps réel
            </h2>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
              Consultez régulièrement les messages officiels pour ne manquer aucune mise à jour, événement ou promotion exclusive.
            </p>
          </div>
          <div className="absolute -right-4 -bottom-6 opacity-10 text-amber-400 pointer-events-none">
            <Megaphone className="w-32 h-32" />
          </div>
        </div>

        {/* CATEGORY FILTER PILLS */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-semibold">
          {[
            { id: 'all', label: 'Toutes', count: announcements.length },
            { id: 'officiel', label: 'Officielles', count: announcements.filter(a => (a.category || 'officiel') === 'officiel').length },
            { id: 'important', label: 'Importantes', count: announcements.filter(a => a.category === 'important').length },
            { id: 'promotion', label: 'Promotions', count: announcements.filter(a => a.category === 'promotion').length },
            { id: 'info', label: 'Infos', count: announcements.filter(a => a.category === 'info').length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeCategory === tab.id
                  ? 'bg-amber-500 text-white shadow-xs font-black'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeCategory === tab.id ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* ANNOUNCEMENTS LIST */}
        <div className="space-y-3">
          {filteredAnnouncements.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <Megaphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Aucune annonce pour le moment
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Les prochaines communications de l'administration s'afficheront ici automatiquement.
                </p>
              </div>
            </div>
          ) : (
            filteredAnnouncements.map((ann) => {
              const isUnread = !readIds.includes(ann.id);
              return (
                <article
                  key={ann.id}
                  id={`announcement-card-${ann.id}`}
                  className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all duration-200 shadow-xs hover:shadow-sm relative overflow-hidden ${
                    ann.pinned
                      ? 'border-amber-300/80 bg-gradient-to-b from-amber-50/20 to-white'
                      : isUnread
                      ? 'border-amber-400/60 bg-amber-50/10'
                      : 'border-slate-100'
                  }`}
                >
                  {/* Top indicators */}
                  <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getCategoryBadge(ann.category)}
                      {ann.pinned && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white">
                          <Pin className="w-2.5 h-2.5" />
                          Épinglé
                        </span>
                      )}
                      {isUnread && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-rose-500 text-white animate-pulse">
                          Nouveau
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 whitespace-nowrap">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(ann.createdAt)}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm sm:text-base font-black text-slate-900 mt-3 leading-snug tracking-tight">
                    {ann.title}
                  </h3>

                  {/* Content text */}
                  <div className="mt-2 text-xs sm:text-[13px] text-slate-700 leading-relaxed font-normal whitespace-pre-line space-y-2">
                    {ann.content}
                  </div>

                  {/* Optional Image */}
                  {ann.imageUrl && (
                    <div className="mt-3 rounded-xl overflow-hidden border border-slate-100 max-h-60 bg-slate-50">
                      <img
                        src={ann.imageUrl}
                        alt={ann.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}

                  {/* Author / Signature Footer */}
                  <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded-full bg-amber-500/10 text-amber-700 flex items-center justify-center text-[9px] font-black">
                        ✓
                      </div>
                      <span className="font-semibold text-slate-600">
                        {ann.author || 'Administration Gold Avenue'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Gold Avenue Officiel
                    </span>
                  </div>
                </article>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
