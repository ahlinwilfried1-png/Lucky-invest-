import React, { useState } from 'react';
import {
  Send,
  ThumbsUp,
  MessageSquare,
  Image as ImageIcon,
  X,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { User } from '../types';
import { getMaskedAnonymousId, deduplicateForumPosts } from '../lib/forumUtils';

interface ForumTabViewProps {
  userState: User;
  forumPosts: any[];
  setForumPosts: (posts: any[]) => void;
  forumMessageInput: string;
  setForumMessageInput: (val: string) => void;
  forumImage1: string | null;
  setForumImage1: (val: string | null) => void;
  forumImage2: string | null;
  setForumImage2: (val: string | null) => void;
  handlePostForumMessage: (e: React.FormEvent) => Promise<void>;
  handleLikeForumPost: (postId: string) => Promise<void>;
  handlePostForumComment?: (postId: string) => void;
  forumCommentInputs?: Record<string, string>;
  setForumCommentInputs?: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  triggerToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  maskUserPhone: (val: string) => string;
  t: (fr: string, en: string) => string;
}

export const ForumTabView: React.FC<ForumTabViewProps> = ({
  userState,
  forumPosts,
  forumMessageInput,
  setForumMessageInput,
  forumImage1,
  setForumImage1,
  forumImage2,
  setForumImage2,
  handlePostForumMessage,
  handleLikeForumPost,
  handlePostForumComment,
  forumCommentInputs = {},
  setForumCommentInputs,
  triggerToast,
  maskUserPhone,
  t
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState<boolean>(true);
  const [openCommentsPostId, setOpenCommentsPostId] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: t('⭐ Toutes', '⭐ All') },
    { id: 'withdrawals', label: t('💎 Retraits & Preuves', '💎 Withdrawals & Proofs') },
    { id: 'vip', label: t('📈 Rendements VIP', '📈 VIP Earnings') },
    { id: 'help', label: t('💬 Entraide', '💬 Community Help') }
  ];

  const toggleComments = (postId: string) => {
    setOpenCommentsPostId(prev => (prev === postId ? null : postId));
  };

  const handleCommentSubmit = (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (handlePostForumComment) {
      handlePostForumComment(postId);
    }
  };

  const currentAnonId = getMaskedAnonymousId(userState.id || userState.phone || userState.name);

  // Filter posts based on selected category (if keyword matches, otherwise show all if 'all')
  const postsToDisplay = deduplicateForumPosts(forumPosts).filter(post => {
    if (selectedCategory === 'all') return true;
    const content = ((post.text || '') + (post.title || '')).toLowerCase();
    if (selectedCategory === 'withdrawals') {
      return content.includes('retrait') || content.includes('payé') || content.includes('preuve') || post.proofImage;
    }
    if (selectedCategory === 'vip') {
      return content.includes('vip') || content.includes('or') || content.includes('gain') || content.includes('lingot');
    }
    if (selectedCategory === 'help') {
      return content.includes('aide') || content.includes('comment') || content.includes('question') || content.includes('équipe');
    }
    return true;
  });

  return (
    <div 
      className="bg-[#FAF8F2] -mx-2 sm:-mx-6 md:-mx-12 xl:-mx-20 -mt-2 px-3 sm:px-6 md:px-12 xl:px-20 pt-2 pb-24 text-slate-900 text-left animate-fadeIn relative overflow-x-hidden min-h-screen"
      id="forum-main-view"
    >
      <div className="max-w-xl mx-auto w-full space-y-4 sm:space-y-4.5">

        {/* 1. FORUM HEADER CARD (Gold Avenue Community Atmosphere) */}
        <div 
          className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E8D8B0]/80 shadow-xs relative overflow-hidden"
          id="forum-header-card"
        >
          <div className="flex items-start justify-between gap-3 relative z-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FFF5D9] border border-[#E8D8B0] flex items-center justify-center text-[#D49A22] shadow-2xs">
                  <MessageSquare className="w-4 h-4 stroke-[2.2]" />
                </div>
                <span className="text-[10px] font-sans font-black uppercase tracking-widest text-[#B8790B]">
                  {t('COMMUNAUTÉ OFFICIELLE', 'OFFICIAL COMMUNITY')}
                </span>
              </div>
              <h2 className="font-serif font-black text-[#102A43] text-lg sm:text-2xl leading-tight">
                {t('Forum Gold Avenue', 'Gold Avenue Forum')}
              </h2>
              <p className="text-xs text-[#607D9A] font-medium leading-relaxed max-w-sm">
                {t(
                  'Échangez en direct avec les investisseurs, partagez vos rendements et célébrez vos retraits.',
                  'Interact live with fellow investors, share your returns, and celebrate your withdrawals.'
                )}
              </p>
            </div>

            {/* Active Members Status Badge */}
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <div className="flex items-center gap-1.5 bg-[#FFF5D9] text-[#2E9B68] px-2.5 py-1 rounded-full border border-[#E8D8B0] shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[#2E9B68] animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-wider font-mono">
                  {t('En ligne', 'Online')}
                </span>
              </div>
              <span className="text-[10px] text-[#607D9A] font-bold">
                1 420+ {t('membres', 'members')}
              </span>
            </div>
          </div>
        </div>

        {/* 2. CATEGORIES FILTER PILLS (Crème / Or Style) */}
        <div 
          className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none select-none"
          id="forum-categories-row"
        >
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-full text-xs font-black whitespace-nowrap transition-all duration-150 cursor-pointer border outline-none shadow-2xs ${
                  isActive
                    ? 'bg-gradient-to-r from-[#B8790B] via-[#D49A22] to-[#F3C75F] text-white border-transparent shadow-xs scale-102'
                    : 'bg-white text-[#607D9A] hover:text-[#102A43] border-[#E8D8B0]/80 hover:border-[#D49A22]'
                }`}
                id={`btn-category-${cat.id}`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* 3. POST A NEW DISCUSSION FORM (White Rounded Card with Gold Accents) */}
        <div 
          className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E8D8B0]/80 shadow-xs space-y-3"
          id="forum-create-post-card"
        >
          <div className="flex items-center justify-between border-b border-[#E8D8B0]/50 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#FFF5D9] border border-[#E8D8B0] flex items-center justify-center text-[#D49A22]">
                <Sparkles className="w-3.5 h-3.5 stroke-[2.2]" />
              </div>
              <h3 className="font-serif font-black text-xs sm:text-sm text-[#102A43] uppercase tracking-wide">
                {t('Créer une discussion', 'Start a Discussion')}
              </h3>
            </div>
            
            <button
              type="button"
              onClick={() => setIsFormOpen(!isFormOpen)}
              className="text-[11px] font-bold text-[#D49A22] hover:text-[#B8790B] cursor-pointer bg-transparent border-none outline-none"
            >
              {isFormOpen ? t('Masquer', 'Hide') : t('Rédiger', 'Write')}
            </button>
          </div>

          {isFormOpen && (
            <form onSubmit={handlePostForumMessage} className="space-y-3 pt-1">
              
              {/* Author & Privacy row */}
              <div className="flex items-center justify-between text-xs px-0.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#FFF5D9] border border-[#E8D8B0] flex items-center justify-center text-[#D49A22] font-black text-xs">
                    ★
                  </div>
                  <div>
                    <span className="text-[10px] text-[#607D9A] font-medium block leading-none">
                      {t('Auteur anonymisé', 'Masked author')}
                    </span>
                    <span className="font-mono font-black text-[#102A43] text-xs leading-tight">
                      {currentAnonId}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-gradient-to-r from-[#B8790B] to-[#D49A22] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  <span>VIP {(userState as any).vipLevel || '1'}</span>
                </div>
              </div>

              {/* Message Input Textarea */}
              <div className="space-y-1">
                <textarea
                  rows={3}
                  value={forumMessageInput}
                  onChange={(e) => setForumMessageInput(e.target.value)}
                  placeholder={t(
                    "Partagez un avis, une question ou célébrez votre retrait reçu...",
                    "Share your feedback, ask a question, or celebrate your withdrawal..."
                  )}
                  maxLength={500}
                  className="w-full bg-[#FAF8F2] border border-[#E8D8B0] rounded-2xl p-3.5 text-xs text-[#102A43] placeholder-[#607D9A]/70 focus:outline-none focus:ring-1 focus:ring-[#D49A22] focus:border-[#D49A22] transition-all resize-none shadow-2xs"
                  id="input-forum-message"
                />
                <div className="flex justify-end text-[10px] text-[#607D9A] font-medium px-1">
                  <span>{forumMessageInput.length}/500</span>
                </div>
              </div>

              {/* Optional Photo Upload Selectors */}
              <div className="space-y-2 bg-[#FAF8F2] border border-[#E8D8B0]/70 p-3 rounded-2xl text-left">
                <label className="text-[10px] font-sans font-bold text-[#B8790B] uppercase tracking-wider block flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-[#D49A22]" />
                  <span>{t("Joindre des captures d'écran (optionnel)", "Attach Screenshots (Optional)")}</span>
                </label>

                <div className="grid grid-cols-2 gap-2.5">
                  {/* Image 1 Box */}
                  <div className="relative border border-dashed border-[#E8D8B0] hover:border-[#D49A22] rounded-xl bg-white p-2 flex flex-col items-center justify-center min-h-[75px] text-center cursor-pointer transition-colors group shadow-2xs">
                    {forumImage1 ? (
                      <div className="w-full h-full relative">
                        <img 
                          src={forumImage1} 
                          className="w-full h-18 object-cover rounded-lg" 
                          alt="Capture 1" 
                          referrerPolicy="no-referrer" 
                        />
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setForumImage1(null); }}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center hover:bg-red-700 transition-colors shadow-xs"
                          title="Supprimer"
                        >
                          <X className="w-3 h-3 stroke-[2.5]" />
                        </button>
                      </div>
                    ) : (
                      <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer py-2">
                        <div className="w-7 h-7 rounded-full bg-[#FFF5D9] flex items-center justify-center text-[#D49A22] mb-1">
                          <ImageIcon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[9px] font-bold text-[#607D9A] uppercase">
                          {t('Photo 1', 'Photo 1')}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                const img = new Image();
                                img.onload = () => {
                                  const canvas = document.createElement('canvas');
                                  let w = img.width, h = img.height;
                                  const maxD = 900;
                                  if (w > maxD || h > maxD) {
                                    if (w > h) { h = Math.round((h * maxD) / w); w = maxD; }
                                    else { w = Math.round((w * maxD) / h); h = maxD; }
                                  }
                                  canvas.width = w; canvas.height = h;
                                  const ctx = canvas.getContext('2d');
                                  if (ctx) {
                                    ctx.drawImage(img, 0, 0, w, h);
                                    setForumImage1(canvas.toDataURL('image/jpeg', 0.75));
                                  } else {
                                    setForumImage1(ev.target?.result as string);
                                  }
                                };
                                img.src = ev.target?.result as string;
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* Image 2 Box */}
                  <div className="relative border border-dashed border-[#E8D8B0] hover:border-[#D49A22] rounded-xl bg-white p-2 flex flex-col items-center justify-center min-h-[75px] text-center cursor-pointer transition-colors group shadow-2xs">
                    {forumImage2 ? (
                      <div className="w-full h-full relative">
                        <img 
                          src={forumImage2} 
                          className="w-full h-18 object-cover rounded-lg" 
                          alt="Capture 2" 
                          referrerPolicy="no-referrer" 
                        />
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setForumImage2(null); }}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center hover:bg-red-700 transition-colors shadow-xs"
                          title="Supprimer"
                        >
                          <X className="w-3 h-3 stroke-[2.5]" />
                        </button>
                      </div>
                    ) : (
                      <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer py-2">
                        <div className="w-7 h-7 rounded-full bg-[#FFF5D9] flex items-center justify-center text-[#D49A22] mb-1">
                          <ImageIcon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[9px] font-bold text-[#607D9A] uppercase">
                          {t('Photo 2', 'Photo 2')}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                const img = new Image();
                                img.onload = () => {
                                  const canvas = document.createElement('canvas');
                                  let w = img.width, h = img.height;
                                  const maxD = 900;
                                  if (w > maxD || h > maxD) {
                                    if (w > h) { h = Math.round((h * maxD) / w); w = maxD; }
                                    else { w = Math.round((w * maxD) / h); h = maxD; }
                                  }
                                  canvas.width = w; canvas.height = h;
                                  const ctx = canvas.getContext('2d');
                                  if (ctx) {
                                    ctx.drawImage(img, 0, 0, w, h);
                                    setForumImage2(canvas.toDataURL('image/jpeg', 0.75));
                                  } else {
                                    setForumImage2(ev.target?.result as string);
                                  }
                                };
                                img.src = ev.target?.result as string;
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button in Gold Gradient */}
              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-[#B8790B] via-[#D49A22] to-[#F3C75F] hover:brightness-105 active:scale-95 text-white font-sans font-black text-xs rounded-full shadow-xs flex items-center gap-2 duration-150 transition-all cursor-pointer select-none uppercase tracking-wider border-none outline-none"
                  id="btn-submit-forum-post"
                >
                  <Send className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{t('Publier sur le Forum', 'Post to Forum')}</span>
                </button>
              </div>

            </form>
          )}
        </div>

        {/* 4. FORUM TIMELINE OF DISCUSSION POSTS */}
        <div className="space-y-3.5" id="forum-posts-timeline">
          {postsToDisplay.length === 0 ? (
            <div className="bg-white border border-[#E8D8B0]/80 rounded-3xl p-8 text-center space-y-2 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF5D9] border border-[#E8D8B0] flex items-center justify-center text-[#D49A22] mx-auto text-2xl">
                💬
              </div>
              <h4 className="text-[#102A43] font-serif font-black text-sm uppercase">
                {t('Aucune discussion trouvée', 'No discussions found')}
              </h4>
              <p className="text-[#607D9A] font-medium text-xs max-w-xs mx-auto">
                {t(
                  'Soyez le premier à lancer une discussion ou partagez votre expérience avec la communauté !',
                  'Be the first to start a conversation or share your experience with the community!'
                )}
              </p>
            </div>
          ) : (
            postsToDisplay.map((post) => {
              const hasLiked = post.likedBy ? post.likedBy.includes(userState.id) : post.hasLiked;
              const anonId = getMaskedAnonymousId(post);
              const commentsCount = Array.isArray(post.comments) ? post.comments.length : 0;
              const isCommentsOpen = openCommentsPostId === post.id;
              const commentInputVal = forumCommentInputs[post.id] || '';

              const imagesList: string[] = [];
              if (post.image1) imagesList.push(post.image1);
              if (post.image2) imagesList.push(post.image2);
              if (post.image && !imagesList.includes(post.image)) imagesList.push(post.image);
              if (post.imageUrl && !imagesList.includes(post.imageUrl)) imagesList.push(post.imageUrl);
              if (post.proofImage && !imagesList.includes(post.proofImage)) imagesList.push(post.proofImage);

              return (
                <div
                  key={post.id}
                  className="bg-white border border-[#E8D8B0]/80 hover:border-[#D49A22] transition-all rounded-3xl p-4 sm:p-5 text-left shadow-xs space-y-3"
                  id={`post-${post.id}`}
                >
                  {/* Author Row (Avatar in circle, name in midnight blue, VIP badge in gold) */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      {/* Avatar Circle */}
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-[#FFF5D9] border border-[#E8D8B0] text-[#D49A22] font-serif font-black flex items-center justify-center text-sm shadow-2xs shrink-0">
                          {post.avatarLetter || '★'}
                        </div>
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#2E9B68] border-2 border-white" />
                      </div>

                      {/* Author Details */}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-black text-[#102A43] text-xs sm:text-sm tracking-wide">
                            {anonId}
                          </span>
                          <span className="bg-gradient-to-r from-[#B8790B] to-[#D49A22] text-white text-[8.5px] sm:text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                            VIP
                          </span>
                        </div>
                        <span className="text-[#607D9A] text-[10px] font-medium block mt-0.5">
                          {new Date(post.createdAt || Date.now()).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Share / Verification Badge */}
                    <div className="flex items-center gap-1 text-[#2E9B68] bg-[#FAF8F2] px-2.5 py-1 rounded-full border border-[#E8D8B0]/60">
                      <CheckCircle2 className="w-3 h-3 text-[#2E9B68]" />
                      <span className="text-[9.5px] font-bold uppercase tracking-wider">
                        {t('Vérifié', 'Verified')}
                      </span>
                    </div>
                  </div>

                  {/* Post Content Text (Title/Text in Midnight Blue, pleasant readability) */}
                  {post.text && (
                    <div className="bg-[#FAF8F2] border border-[#E8D8B0]/60 p-3.5 rounded-2xl">
                      <p className="text-xs sm:text-sm text-[#102A43] leading-relaxed font-medium whitespace-pre-wrap">
                        {maskUserPhone(post.text)}
                      </p>
                    </div>
                  )}

                  {/* Inline Attached Screenshots / Proof Images */}
                  {imagesList.length > 0 && (
                    <div className={`grid gap-2 pt-0.5 ${imagesList.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                      {imagesList.map((imgUrl, idx) => (
                        <div 
                          key={idx} 
                          className="rounded-2xl overflow-hidden border border-[#E8D8B0]/80 bg-[#FAF8F2] flex justify-center items-center max-h-56 sm:max-h-64 shadow-2xs"
                        >
                          <img
                            src={imgUrl}
                            alt={`Capture ${idx + 1}`}
                            className="w-full h-full max-h-56 sm:max-h-64 object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Post Footer Action Bar: Likes + Comments count */}
                  <div className="flex items-center justify-between border-t border-[#E8D8B0]/50 pt-2.5">
                    
                    {/* Left: Like Button with Golden Accent */}
                    <button
                      type="button"
                      onClick={() => handleLikeForumPost(post.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-sans font-bold tracking-wide uppercase transition-all duration-150 cursor-pointer border outline-none ${
                        hasLiked
                          ? 'bg-[#FFF5D9] text-[#B8790B] border-[#D49A22] shadow-2xs scale-102'
                          : 'bg-white text-[#607D9A] hover:text-[#102A43] hover:bg-[#FAF8F2] border-[#E8D8B0]'
                      }`}
                      id={`btn-like-${post.id}`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${hasLiked ? 'fill-[#D49A22] stroke-[#D49A22]' : 'stroke-[#607D9A]'}`} />
                      <span>{post.likes || 0} {t('J\'aime', 'Likes')}</span>
                    </button>

                    {/* Right: Comments Button with Golden Bubble */}
                    <button
                      type="button"
                      onClick={() => toggleComments(post.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-sans font-bold tracking-wide uppercase text-[#607D9A] hover:text-[#102A43] hover:bg-[#FAF8F2] border border-[#E8D8B0] bg-white transition-all cursor-pointer outline-none"
                      id={`btn-comments-${post.id}`}
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#D49A22]" />
                      <span>{commentsCount} {t('Commentaires', 'Comments')}</span>
                    </button>

                  </div>

                  {/* Expandable Comments Drawer */}
                  {isCommentsOpen && (
                    <div className="pt-2 border-t border-[#E8D8B0]/50 space-y-3 animate-fadeIn">
                      
                      {/* Comments List */}
                      {Array.isArray(post.comments) && post.comments.length > 0 ? (
                        <div className="space-y-2">
                          {post.comments.map((comm: any, cIdx: number) => (
                            <div 
                              key={comm.id || cIdx} 
                              className="bg-[#FAF8F2] p-2.5 sm:p-3 rounded-xl border border-[#E8D8B0]/60 space-y-1 text-left"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-mono font-bold text-xs text-[#102A43]">
                                  {comm.author || t('Membre', 'Member')}
                                </span>
                                <span className="text-[9px] text-[#607D9A]">
                                  {comm.date ? new Date(comm.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}
                                </span>
                              </div>
                              <p className="text-xs text-[#607D9A] font-medium leading-relaxed">
                                {comm.text}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-2 text-[11px] text-[#607D9A] italic">
                          {t('Aucun commentaire pour l\'instant. Soyez le premier à commenter !', 'No comments yet. Be the first to comment!')}
                        </div>
                      )}

                      {/* Comment Input Form */}
                      <form 
                        onSubmit={(e) => handleCommentSubmit(post.id, e)}
                        className="flex items-center gap-2 pt-1"
                      >
                        <input
                          type="text"
                          value={commentInputVal}
                          onChange={(e) => {
                            if (setForumCommentInputs) {
                              setForumCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }));
                            }
                          }}
                          placeholder={t('Écrire un commentaire...', 'Write a comment...')}
                          className="flex-1 bg-[#FAF8F2] border border-[#E8D8B0] rounded-xl px-3 py-2 text-xs text-[#102A43] placeholder-[#607D9A]/70 focus:outline-none focus:ring-1 focus:ring-[#D49A22] focus:border-[#D49A22] shadow-2xs"
                        />
                        <button
                          type="submit"
                          className="px-3.5 py-2 bg-gradient-to-r from-[#B8790B] via-[#D49A22] to-[#F3C75F] hover:brightness-105 active:scale-95 text-white rounded-xl text-xs font-black shadow-xs flex items-center justify-center cursor-pointer border-none outline-none shrink-0"
                          title="Envoyer"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </form>

                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
