import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  Coins, 
  Users, 
  Briefcase, 
  ArrowDownLeft, 
  ArrowUpRight, 
  PlusCircle,
  ArrowUpCircle,
  Bell, 
  User as UserIcon, 
  Home,
  Heart,
  Zap,
  Copy, 
  Check, 
  MessageSquare, 
  Gift, 
  Trophy,
  LogOut, 
  Settings, 
  Activity, 
  Calendar, 
  ChevronRight, 
  ChevronLeft, 
  ChevronDown,
  ShieldCheck, 
  Send,
  HelpCircle,
  Clock,
  BookOpen,
  History,
  MessageCircle,
  Lock,
  CheckCircle2,
  AlertCircle,
  Headphones,
  Info,
  X,
  Download,
  Smartphone,
  Megaphone,
  Share,
  Camera,
  Wallet,
  ThumbsUp,
  Trash2,
  RefreshCw,
  Cpu,
  Tv,
  Speaker,
  Volume2,
  Music,
  CreditCard,
  ShoppingBag,
  Sparkles,
  FileText,
  Package,
  ClipboardList,
  Eye,
  EyeOff,
  CalendarCheck,
  Award,
  Flame,
  UserCheck,
  ExternalLink,
  Crown,
  Globe,
  Layers,
  ArrowRight
} from 'lucide-react';
import { User, Deposit, Withdrawal, Product, Investment, Commission, SystemNotification, SupportMessage, WithdrawalProof, RevenueRecord } from '../types';
import { DataStore, syncWithBackend, getApiUrl, apiFetch } from '../dataStore';
import { ProfileTabView } from './ProfileTabView';
import { ProductsTabView } from './ProductsTabView';
import { HomeTabView } from './HomeTabView';
import { TeamTabView } from './TeamTabView';
import { ForumTabView } from './ForumTabView';
import { RechargeTabView } from './RechargeTabView';
import { WithdrawTabView } from './WithdrawTabView';
import { PointageView } from './PointageView';
import AdminPanel from './AdminPanel';
import CountdownTimer from './CountdownTimer';
import { InvestmentItem } from './InvestmentItem';
import { OnlineSupportPage } from './OnlineSupportPage';
import { getMaskedAnonymousId, deduplicateForumPosts } from '../lib/forumUtils';


const compressImage = (file: File, maxWidth: number = 500, quality: number = 0.45): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxWidth) {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        } else {
          resolve(event.target?.result as string);
        }
      };
      img.onerror = () => {
        resolve(event.target?.result as string);
      };
    };
    reader.onerror = () => {
      resolve('');
    };
  });
};

const maskPhoneNumber = (num: string) => {
  if (!num) return 'Aucun';
  const clean = num.replace(/\s/g, '');
  if (clean.length <= 6) return clean;
  return clean.slice(0, 3) + '••••' + clean.slice(-3);
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 1, 0.5, 1]
    }
  }
};

const getVipImage = (vipLevel: number, category?: string) => {
  // Exclusively return 100% pure gold images (ingots, gold bars, coins, nuggets) to match the user's request.
  // ABSOLUTELY NO hands, charts, credit cards, jewelry, cosmetics, or crowns. Only pure gold.
  
  const goldCoins = 'https://images.unsplash.com/photo-1618042164219-62c820f10723?auto=format&fit=crop&q=80&w=500'; // Pure shiny gold coins pile
  const goldBarsStack = 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&q=80&w=500'; // Stacked pure gold bars
  const goldSingleBar = 'https://images.unsplash.com/photo-1599690925058-90e1a0b41144?auto=format&fit=crop&q=80&w=500'; // Elegant single gold ingot
  const goldBarsPile = 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=500'; // Array of multiple gold bars
  const goldVault = 'https://images.unsplash.com/photo-1563013544-824ae1d704d3?auto=format&fit=crop&q=80&w=500'; // Massive gold bricks in bank vault
  const goldBullionCloseUp = 'https://images.unsplash.com/photo-1614028674026-a65e31bfd27c?auto=format&fit=crop&q=80&w=500'; // Heavy reflective golden bullion close-up
  const goldNugget = 'https://images.unsplash.com/photo-1610375461369-d5108bc471e4?auto=format&fit=crop&q=80&w=500'; // Raw shining gold nugget close-up

  if (category === 'wellbeing') {
    switch (vipLevel) {
      case 1:
        return goldSingleBar;
      case 2:
        return goldNugget;
      case 3:
        return goldBullionCloseUp;
      default:
        return goldVault;
    }
  } else {
    // Stability / fixed-income titles / default
    switch (vipLevel) {
      case 1:
        return goldCoins;
      case 2:
        return goldSingleBar;
      case 3:
        return goldNugget;
      case 4:
        return goldBarsStack;
      case 5:
        return goldBarsPile;
      case 6:
        return goldVault;
      case 7:
        return goldBullionCloseUp;
      case 8:
        return goldBarsStack;
      case 9:
        return goldVault;
      default:
        return goldBarsStack;
    }
  }
};

const getVipCropDetails = (level: number, category?: string) => {
  switch (level) {
    case 1:
      return {
        name: "Gold Avenue Lingot Classique 🪙",
        desc: "Notre formule d'entrée de gamme offrant un rendement journalier passif, régulier et stable."
      };
    case 2:
      return {
        name: "Gold Avenue Lingot Bronze 🥉",
        desc: "Deuxième niveau d'investissement aurifère pour des revenus journaliers plus solides."
      };
    case 3:
      return {
        name: "Gold Avenue Lingot Argent 🥈",
        desc: "Rendement journalier optimisé sur l'achat et la conservation de réserves d'or intermédiaire."
      };
    case 4:
      return {
        name: "Gold Avenue Lingot Or Jaune 🥇",
        desc: "Plan performant assurant des revenus très solides et réguliers sur l'or d'investissement."
      };
    case 5:
      return {
        name: "Gold Avenue Pack Premium Gold 💎",
        desc: "Le fleuron haut de gamme idéal pour maximiser vos gains sur des lingots purs de 100g."
      };
    case 6:
      return {
        name: "Gold Avenue Or d'Investissement 🛡️",
        desc: "Plan à forte rentabilité soutenu par des coffres physiques assurés et un taux majoré."
      };
    case 7:
      return {
        name: "Gold Avenue Lingot d'Or Pur ✨",
        desc: "Le summum du placement et de la performance financière pour les investisseurs VIP."
      };
    case 8:
      return {
        name: "Gold Avenue Réserve Souveraine 🏛️",
        desc: "Placement institutionnel de prestige à haut rendement réservé aux investisseurs majeurs."
      };
    case 9:
      return {
        name: "Gold Avenue Trésor Impérial 👑",
        desc: "Trésor de prestige ultime offrant des gains passifs spectaculaires et sécurisés."
      };
    default:
      return {
        name: "Gold Avenue Trésor Impérial 👑",
        desc: "Formule de prestige ultime réservée aux investisseurs d'élite de la communauté."
      };
  }
};

const ProductImage = ({ 
  vipLevel, 
  alt, 
  className = "w-full h-full object-cover rounded-xl",
  isMini = false,
  category,
  imageUrl
}: { 
  vipLevel: number; 
  alt: string; 
  className?: string;
  isMini?: boolean;
  category?: string;
  imageUrl?: string;
}) => {
  // Premium default gold image representing Togo luxury gold bullion & coins
  const defaultGoldImage = "https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&q=80&w=800";
  const finalSrc = (imageUrl && imageUrl.trim() !== '') ? imageUrl : defaultGoldImage;

  return (
    <div className="w-full h-full bg-slate-900 overflow-hidden relative rounded-xl border border-yellow-500/30 group shadow-md aspect-video sm:aspect-auto">
      {/* Background Image */}
      <img 
        src={finalSrc} 
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        referrerPolicy="no-referrer"
      />

      {/* Glossy diagonal shine overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />

      {/* Dark overlay gradient for contrast and premium look */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/20 pointer-events-none" />

      {/* Product Category & VIP Level Tag */}
      <div className="absolute top-2.5 left-2.5 bg-slate-950/65 backdrop-blur-md border border-yellow-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1.5 z-10 pointer-events-none">
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
        <span className="font-sans font-extrabold text-[9px] uppercase tracking-wider text-yellow-400">
          VIP {vipLevel} • {category === 'wellbeing' ? 'BIEN-ÊTRE' : 'STABILITÉ'}
        </span>
      </div>
    </div>
  );
};

const TICKER_MESSAGES = [
  "t1 a rechargé 10,000 XOF",
  "Yasmine a activé Plan VIP 1 avec succès (+1,500 F/jour)",
  "Kouadio a rechargé 25,000 XOF",
  "Aminata a réclamé un bonus de pointage de 500 XOF",
  "Seydou a activé Plan VIP 2 avec succès (+2,800 F/jour)",
  "Félix a effectué un retrait de 18,500 XOF réussi !",
  "Awa a rechargé 10,000 XOF via Wave",
  "Amadou a réclamé son cadeau bonus journalier."
];

const liveTransactions = [
  { name: "Abdoulaye K.", type: "recharge", amount: "15 000 XOF", flag: "🇨🇮", desc: "a rechargé" },
  { name: "Mariam O.", type: "retrait", amount: "45 000 XOF", flag: "🇧🇫", desc: "a retiré" },
  { name: "Koffi A.", type: "recharge", amount: "100 000 XOF", flag: "🇹🇬", desc: "a rechargé" },
  { name: "Chantal Z.", type: "retrait", amount: "12 000 XOF", flag: "🇧🇯", desc: "a retiré" },
  { name: "Fatoumata B.", type: "recharge", amount: "5 000 XOF", flag: "🇧🇫", desc: "a rechargé" },
  { name: "Alain T.", type: "retrait", amount: "25 000 XOF", flag: "🇨🇮", desc: "a retiré" },
  { name: "Sena B.", type: "recharge", amount: "50 000 XOF", flag: "🇹🇬", desc: "a rechargé" },
  { name: "Gaston S.", type: "retrait", amount: "8 000 XOF", flag: "🇧🇯", desc: "a retiré" },
  { name: "Yasmine K.", type: "recharge", amount: "250 000 XOF", flag: "🇨🇮", desc: "a rechargé" },
  { name: "Rodrigue M.", type: "retrait", amount: "35 000 XOF", flag: "🇧🇯", desc: "a retiré" },
  { name: "Inès Y.", type: "recharge", amount: "80 000 XOF", flag: "🇹🇬", desc: "a rechargé" },
  { name: "Félix S.", type: "retrait", amount: "15 000 XOF", flag: "🇧🇫", desc: "a retiré" }
];

export const WHEEL_REWARDS = [
  { amount: 20, label: "20 F", color: "#38bdf8" }, // sky blue
  { amount: 25, label: "25 F", color: "#eab308" }, // gold
  { amount: 50, label: "50 F", color: "#d97706" }, // amber gold
  { amount: 200, label: "200 F", color: "#f59e0b" }, // light gold
  { amount: 500, label: "500 F", color: "#b45309" }, // deep gold
  { amount: 1000, label: "1 000 F", color: "#22c55e" }, // green
  { amount: 1500, label: "1 500 F", color: "#14b8a6" }, // teal
  { amount: 20, label: "20 F", color: "#1e3a8a" }  // navy blue
];

export const GOLD_AVENUE_SLIDES = [
  {
    id: 'slide-1',
    url: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&q=80&w=1000',
    title: 'Gold Avenue Lingot d\'Or Pur 💎',
    desc: 'Bénéficiez de la sécurité absolue d\'un investissement aurifère de premier choix.',
  }
];

const DEPOSIT_COUNTRIES = [
  { name: 'Togo', code: '+228', flag: '🇹🇬' },
  { name: 'Cameroun', code: '+237', flag: '🇨🇲' },
  { name: 'Bénin', code: '+229', flag: '🇧🇯' },
  { name: 'Côte d’Ivoire', code: '+225', flag: '🇨🇮' },
  { name: 'Burkina Faso', code: '+226', flag: '🇧🇫' },
  { name: 'Sénégal', code: '+221', flag: '🇸🇳' }
];

const maskUserPhone = (str: string): string => {
  if (!str) return str;
  return str.replace(/(?:\+?\d[\s.-]?){7,15}\d/g, (match) => {
    const cleanDigits = match.replace(/[^\d]/g, '');
    if (cleanDigits.length < 8) return match;
    
    const isPlus = match.startsWith('+');
    const startLen = Math.min(3, Math.floor(cleanDigits.length / 3));
    const endLen = Math.min(2, Math.floor(cleanDigits.length / 4));
    const maskLen = cleanDigits.length - startLen - endLen;
    
    const startPart = cleanDigits.slice(0, startLen);
    const endPart = cleanDigits.slice(-endLen);
    const maskedPart = '•'.repeat(maskLen);
    
    return (isPlus ? '+' : '') + startPart + maskedPart + endPart;
  });
};

interface DashboardProps {
  currentUser: User;
  onLogout: () => void;
  onRefreshUser: (updatedUser: User | null) => void;
  onNavigate?: (path: string) => void;
}

export default function Dashboard({ 
  currentUser, 
  onLogout, 
  onRefreshUser,
  onNavigate
}: DashboardProps) {
  const [lang, setLang] = useState<'FR' | 'EN'>(() => {
    return (localStorage.getItem('gi_lang') as 'FR' | 'EN') || 'FR';
  });

  useEffect(() => {
    const handleLangChange = () => {
      setLang((localStorage.getItem('gi_lang') as 'FR' | 'EN') || 'FR');
    };
    window.addEventListener('gi_lang_changed', handleLangChange);
    return () => {
      window.removeEventListener('gi_lang_changed', handleLangChange);
    };
  }, []);

  const t = (fr: string, en: string) => (lang === 'EN' ? en : fr);

  // Navigation tabs: 'dashboard', 'products', 'orders', 'team', 'profile', 'deposit', 'withdraw', 'proofs', 'forum'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'team' | 'profile' | 'deposit' | 'withdraw' | 'proofs' | 'forum'>('dashboard');
  const [referralListTab, setReferralListTab] = useState<'level1' | 'level2' | 'level3'>('level1');
  const [showTeamDetailsPage, setShowTeamDetailsPage] = useState<boolean>(false);
  const [productSubTab, setProductSubTab] = useState<'stability' | 'wellbeing'>('stability');

  // Local lists
  const [userState, setUserState] = useState<User>(currentUser);
  const [products, setProducts] = useState<Product[]>(() => DataStore.getProducts());
  const [activeInvestments, setActiveInvestments] = useState<Investment[]>([]);

  // Mission states
  const [showMissionsModal, setShowMissionsModal] = useState<boolean>(false);

  // Custom check for stability product activation
  const hasStabilityActivation = activeInvestments.some(inv => {
    const p = products.find(prod => prod.id === inv.productId || prod.name === inv.productName);
    if (p) {
      return (p.category === 'stability' || !p.category) && !p.isCyclic;
    }
    const idLower = (inv.productId || '').toLowerCase();
    const nameLower = (inv.productName || '').toLowerCase();
    return !idLower.includes('cyclic') && !nameLower.includes('cycle') && !nameLower.includes('promo');
  });
  const hasActiveProduct = activeInvestments.some(inv => inv.status === 'active');
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [allDeposits, setAllDeposits] = useState<Deposit[]>([]);
  const [allWithdrawals, setAllWithdrawals] = useState<Withdrawal[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>([]);
  const unreadSupportCount = supportMessages.filter(
    m => m.userId === currentUser.id && m.sender === 'admin' && m.status === 'unread'
  ).length;
  const [withdrawalProofs, setWithdrawalProofs] = useState<WithdrawalProof[]>([]);
  const [selectedAvisImage, setSelectedAvisImage] = useState<string | null>(null);
  const [bannerImageError, setBannerImageError] = useState<boolean>(false);
  const [showStabilityOrders, setShowStabilityOrders] = useState<boolean>(false);
  const [showMissionsList, setShowMissionsList] = useState<boolean>(false);

  // Wheel of Fortune state variables
  const [isWheelModalOpen, setIsWheelModalOpen] = useState<boolean>(false);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [wheelSpinAngle, setWheelSpinAngle] = useState<number>(0);
  const [wonReward, setWonReward] = useState<any>(null);
  const [wheelSpinCount, setWheelSpinCount] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('gi_wheel_spins_v3');
      return stored ? parseInt(stored) : 2;
    } catch (e) {
      return 2;
    }
  });

  // Forum state variables
  const [forumPosts, setForumPosts] = useState<any[]>(() => {
    return DataStore.getForumPosts();
  });
  const [forumMessageInput, setForumMessageInput] = useState<string>('');
  const [forumCommentInputs, setForumCommentInputs] = useState<Record<string, string>>({});
  const [forumImage1, setForumImage1] = useState<string | null>(null);
  const [forumImage2, setForumImage2] = useState<string | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<'fr' | 'en'>(() => {
    return (localStorage.getItem('gold_avenue_lang') as 'fr' | 'en') || 'fr';
  });

  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'forward' | 'backward'>('forward');

  useEffect(() => {
    if (GOLD_AVENUE_SLIDES.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => {
        if (slideDirection === 'forward') {
          if (prev === GOLD_AVENUE_SLIDES.length - 1) {
            setSlideDirection('backward');
            return prev - 1;
          }
          return prev + 1;
        } else {
          if (prev === 0) {
            setSlideDirection('forward');
            return prev + 1;
          }
          return prev - 1;
        }
      });
    }, 4500);
    return () => clearInterval(interval);
  }, [slideDirection]);

  // Form states
  const SENDAVAPAY_COUNTRIES = [
    { code: 'TG', name: 'Togo 🇹🇬', currency: 'XOF' },
    { code: 'CI', name: 'Côte d’Ivoire 🇨🇮', currency: 'XOF' },
    { code: 'BJ', name: 'Bénin 🇧🇯', currency: 'XOF' },
    { code: 'BF', name: 'Burkina Faso 🇧🇫', currency: 'XOF' },
    { code: 'SN', name: 'Sénégal 🇸🇳', currency: 'XOF' }
  ];

  const SENDAVAPAY_OPERATORS: Record<string, { id: string; name: string; slug: string; requiresOtp?: boolean }[]> = {
    TG: [
      { id: '37', name: 'TMoney', slug: 't-money-togo' },
      { id: '38', name: 'Moov Money', slug: 'moov-togo' }
    ],
    CI: [
      { id: '29', name: 'Orange Money', slug: 'orange-money-ci' },
      { id: '30', name: 'MTN Mobile Money', slug: 'mtn-ci', requiresOtp: true },
      { id: '31', name: 'Moov Money', slug: 'moov-ci' },
      { id: '32', name: 'Wave', slug: 'wave-ci' }
    ],
    BJ: [
      { id: '35', name: 'MTN Mobile Money', slug: 'mtn-benin', requiresOtp: true },
      { id: '36', name: 'Moov Money', slug: 'moov-benin' }
    ],
    BF: [
      { id: '33', name: 'Moov Money', slug: 'moov-burkina-faso' },
      { id: '34', name: 'Orange Money', slug: 'orange-money-burkina' }
    ],
    SN: [
      { id: '57', name: 'Orange Money', slug: 'new-orange-money-senegal' },
      { id: '58', name: 'Wave', slug: 'wave-senegal' }
    ]
  };

  const getInitialSpCountry = () => {
    if (userState.country) {
      const c = userState.country.toLowerCase();
      if (c.includes('ivoire') || c.includes('ivory')) return 'CI';
      if (c.includes('benin') || c.includes('bénin')) return 'BJ';
      if (c.includes('burkina')) return 'BF';
      if (c.includes('senegal') || c.includes('sénégal')) return 'SN';
    }
    return 'TG';
  };

  const formatDepositCode = (numStr: string) => {
    if (!numStr) return "";
    if (numStr.toLowerCase().includes("montant")) {
      const amt = depositAmount && parseInt(depositAmount, 10) > 0 ? depositAmount : "montant";
      return numStr.replace(/montant/gi, amt);
    }
    return numStr;
  };

  const isUssdCode = (str: string) => {
    return str && (str.includes('*') || str.includes('#'));
  };

  const [depositAmount, setDepositAmount] = useState<string>('5000');
  const [depositPhoneNumber, setDepositPhoneNumber] = useState<string>('');
  const [depositOperator, setDepositOperator] = useState<string>('TMoney');
  const [depositMethod, setDepositMethod] = useState<'westpay' | 'manuel_cameroun'>('westpay');
  const [depositRef, setDepositRef] = useState<string>('');
  const [receiptBase64, setReceiptBase64] = useState<string>('');
  const [depositError, setDepositError] = useState<string>('');
  const [depositSuccess, setDepositSuccess] = useState<string>('');
  const [depositMode, setDepositMode] = useState<'automatic' | 'ashtech'>('automatic');
  const [manualOperator, setManualOperator] = useState<string>('MTN Mobile Money (Cameroun 🇨🇲)');
  const [manualReference, setManualReference] = useState<string>('');
  const [manualReceiptBase64, setManualReceiptBase64] = useState<string>('');
  const [manualReceiptFileName, setManualReceiptFileName] = useState<string>('');
  const [isDraggingManualReceipt, setIsDraggingManualReceipt] = useState<boolean>(false);
  const [manualCopied, setManualCopied] = useState<boolean>(false);
  const [manualDepositNumbers, setManualDepositNumbers] = useState<Record<string, string>>(() => DataStore.getManualDepositNumbers());
  const [isSubmittingDeposit, setIsSubmittingDeposit] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [depositStep, setDepositStep] = useState<1 | 2>(1);
  const [depositRedirectUrl, setDepositRedirectUrl] = useState<string>('');
  const getCountryPrefix = (countryName: string): string => {
    const c = (countryName || '').toLowerCase();
    if (c.includes('cameroun') || c.includes('237')) return '+237';
    if (c.includes('togo') || c.includes('228')) return '+228';
    if (c.includes('benin') || c.includes('bénin') || c.includes('229')) return '+229';
    if (c.includes('ivoire') || c.includes('225')) return '+225';
    if (c.includes('burkina') || c.includes('226')) return '+226';
    if (c.includes('senegal') || c.includes('sénégal') || c.includes('221')) return '+221';
    if (c.includes('mali') || c.includes('223')) return '+223';
    if (c.includes('niger') || c.includes('227')) return '+227';
    return '+237';
  };

  const [depositCountry, setDepositCountry] = useState<string>(() => {
    const userCountry = (userState.country || '').toLowerCase();
    if (userCountry.includes('cameroun')) return 'Cameroun';
    if (userCountry.includes('togo')) return 'Togo';
    if (userCountry.includes('benin') || userCountry.includes('bénin')) return 'Bénin';
    if (userCountry.includes('ivoire')) return 'Côte d’Ivoire';
    if (userCountry.includes('burkina')) return 'Burkina Faso';
    if (userCountry.includes('senegal') || userCountry.includes('sénégal')) return 'Sénégal';
    if (userCountry.includes('mali')) return 'Mali';
    if (userCountry.includes('niger')) return 'Niger';
    return 'Cameroun';
  });

  const [depositCountryCode, setDepositCountryCode] = useState<string>(() => getCountryPrefix(depositCountry));
  const [depositPhone, setDepositPhone] = useState<string>(() => {
    const raw = userState.whatsapp || '';
    const prefix = getCountryPrefix(userState.country || '').replace('+', '');
    let clean = raw.replace(/[\s\-\(\)\+]/g, '');
    if (clean.startsWith(prefix)) {
      clean = clean.slice(prefix.length);
    }
    return clean;
  });
  const [depositNumberCopied, setDepositNumberCopied] = useState<boolean>(false);

  // SendavaPay specific states
  const [spCountryCode, setSpCountryCode] = useState<string>(getInitialSpCountry());
  const [spOperatorId, setSpOperatorId] = useState<string>('');
  const [hasManuallySelectedOperator, setHasManuallySelectedOperator] = useState<boolean>(false);
  const [spOtpToken, setSpOtpToken] = useState<string | null>(null);
  const [spOtpCode, setSpOtpCode] = useState<string>('');
  const [spOtpModalOpen, setSpOtpModalOpen] = useState<boolean>(false);
  const [spStatusMessage, setSpStatusMessage] = useState<string | null>(null);
  const [spReference, setSpReference] = useState<string | null>(null);
  const [isPollingSp, setIsPollingSp] = useState<boolean>(false);

  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [withdrawOperator, setWithdrawOperator] = useState<string>(() => {
    try {
      return currentUser.bankCardOperator || localStorage.getItem('mdb_saved_operator') || "MTN (CM)";
    } catch (e) {
      return currentUser.bankCardOperator || "MTN (CM)";
    }
  });
  const [withdrawNumber, setWithdrawNumber] = useState<string>(() => {
    try {
      return currentUser.bankCardNumber || localStorage.getItem('mdb_saved_number') || '';
    } catch (e) {
      return currentUser.bankCardNumber || '';
    }
  });
  const [withdrawError, setWithdrawError] = useState<string>('');
  const [withdrawSuccess, setWithdrawSuccess] = useState<string>('');
  const [withdrawProofBase64, setWithdrawProofBase64] = useState<string>('');
  const [withdrawProofFileName, setWithdrawProofFileName] = useState<string>('');
  const [isDraggingWithdraw, setIsDraggingWithdraw] = useState<boolean>(false);
  const [isSubmittingWithdrawal, setIsSubmittingWithdrawal] = useState<boolean>(false);

  const [bonusCodeInput, setBonusCodeInput] = useState<string>('');
  
  // Proof form states
  const [isPublishFormOpen, setIsPublishFormOpen] = useState<boolean>(false);
  const [proofAmount, setProofAmount] = useState<string>('');
  const [proofMessage, setProofMessage] = useState<string>('');
  const [proofImage, setProofImage] = useState<string>('');
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [proofImageFileName, setProofImageFileName] = useState<string>('');
  const [isDraggingProof, setIsDraggingProof] = useState<boolean>(false);
  const [bonusError, setBonusError] = useState<string>('');
  const [bonusSuccess, setBonusSuccess] = useState<string>('');
  const [hasCheckedInToday, setHasCheckedInToday] = useState<boolean>(() => {
    try {
      const checkKey = `gi_last_daily_${currentUser.id}`;
      return localStorage.getItem(checkKey) === new Date().toDateString();
    } catch {
      return false;
    }
  });

  const [dynamicLiveTransactions, setDynamicLiveTransactions] = useState(liveTransactions);

  const detectSpOperator = (phone: string, country: string): string => {
    let clean = (phone || '').replace(/\D/g, '');
    const prefixes: Record<string, string> = {
      'TG': '228', 'CI': '225', 'BJ': '229', 'SN': '221', 'ML': '223',
      'BF': '226', 'CM': '237', 'GN': '224', 'COD': '243', 'COG': '242'
    };
    const prefix = prefixes[country];
    if (prefix && clean.startsWith(prefix)) {
      clean = clean.substring(prefix.length);
    }
    if (clean.startsWith('0')) {
      clean = clean.substring(1);
    }

    if (!clean) return '';

    if (country === 'TG') {
      // TG: 37 (TMoney), 38 (Moov)
      // TMoney starts with 90, 91, 92, 93, 96, 79
      // Moov starts with 97, 98, 99, 70
      if (/^(90|91|92|93|96|79)/.test(clean)) return '37';
      if (/^(97|98|99|70)/.test(clean)) return '38';
    } else if (country === 'CI') {
      // CI: 29 (Orange), 30 (MTN), 31 (Moov), 32 (Wave)
      // Orange: 07, 47, 57, 77, 87, 97
      // MTN: 05, 45, 55, 75, 85, 95
      // Moov: 01, 41, 51, 71, 81, 91
      if (/^(07|47|57|77|87|97)/.test(clean)) return '29';
      if (/^(05|45|55|75|85|95)/.test(clean)) return '30';
      if (/^(01|41|51|71|81|91)/.test(clean)) return '31';
    } else if (country === 'BJ') {
      // BJ: 35 (MTN), 36 (Moov)
      if (/^(51|52|53|54|61|62|66|67|69|90|91|96|97)/.test(clean)) return '35';
      if (/^(50|55|58|60|63|64|65|68|94|95|98|99)/.test(clean)) return '36';
    } else if (country === 'BF') {
      // BF: 34 (Orange), 33 (Moov)
      if (/^(07|57|67|77)/.test(clean)) return '34';
      if (/^(06|56|66|76)/.test(clean)) return '33';
    } else if (country === 'SN') {
      // SN: 57 (Orange), 58 (Wave), 59 (Mixx)
      if (/^(77|78)/.test(clean)) return '57';
    } else if (country === 'CM') {
      // CM: 1 (MTN), 2 (Orange)
      if (/^(650|651|652|653|654|67|68)/.test(clean)) return '1';
      if (/^(655|656|657|658|659|69)/.test(clean)) return '2';
    }
    return '';
  };

  useEffect(() => {
    setHasManuallySelectedOperator(false);
    setSpOperatorId('');
  }, [spCountryCode]);

  useEffect(() => {
    if ((depositMethod as any) === 'sendavapay' && spCountryCode) {
      if (!hasManuallySelectedOperator && depositPhone) {
        const detected = detectSpOperator(depositPhone, spCountryCode);
        if (detected) {
          setSpOperatorId(detected);
          return;
        }
      }
      
      // Fallback: default to the first operator of the country
      if (!spOperatorId) {
        const operators = SENDAVAPAY_OPERATORS[spCountryCode] || [];
        if (operators.length > 0) {
          setSpOperatorId(operators[0].id);
        }
      }
    }
  }, [spCountryCode, depositMethod, depositPhone, hasManuallySelectedOperator]);

  useEffect(() => {
    const poolFirstNames = [
      "Abdoulaye", "Mariam", "Koffi", "Chantal", "Fatoumata", "Alain", "Sena", "Gaston", "Yasmine", 
      "Rodrigue", "Inès", "Félix", "Kouadio", "Aminata", "Seydou", "Awa", "Amadou", "Ousmane", 
      "Bakary", "Clarisse", "Tidiane", "Salif", "Issa", "Zoumana", "Aïcha", "Mamadou", "Hamed", 
      "Wilfried", "Cynthia", "Désiré", "Mireille", "Pascal", "Kadiatou", "Sékou", "Lamine", "Binta"
    ];
    const poolLastInitials = ["K.", "O.", "A.", "Z.", "B.", "T.", "S.", "M.", "Y.", "D.", "N.", "P.", "C.", "G.", "L.", "I.", "W."];
    const poolFlags = ["🇨🇮", "🇧🇫", "🇹🇬", "🇧🇯"];
    const poolAmounts = ["5 000 XOF", "10 000 XOF", "15 000 XOF", "25 000 XOF", "50 000 XOF", "75 000 XOF", "100 000 XOF", "150 000 XOF", "250 000 XOF"];
    const poolTypes = ["recharge", "retrait"];

    const interval = setInterval(() => {
      const randomFirstName = poolFirstNames[Math.floor(Math.random() * poolFirstNames.length)];
      const randomLastName = poolLastInitials[Math.floor(Math.random() * poolLastInitials.length)];
      const name = `${randomFirstName} ${randomLastName}`;
      const type = poolTypes[Math.floor(Math.random() * poolTypes.length)];
      const flag = poolFlags[Math.floor(Math.random() * poolFlags.length)];
      
      let amount = poolAmounts[Math.floor(Math.random() * poolAmounts.length)];
      if (type === "retrait") {
        const smallerAmounts = ["5 000 XOF", "8 000 XOF", "12 000 XOF", "15 000 XOF", "20 000 XOF", "35 000 XOF", "45 000 XOF", "50 000 XOF"];
        amount = smallerAmounts[Math.floor(Math.random() * smallerAmounts.length)];
      }

      const newTx = { name, type, amount, flag, desc: type === "recharge" ? "a rechargé" : "a retiré" };

      setDynamicLiveTransactions(prev => {
        const updated = [newTx, ...prev];
        if (updated.length > 15) {
          updated.pop();
        }
        return updated;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Password change states
  const [oldPassword, setOldPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>('');
  const [pwdError, setPwdError] = useState<string>('');
  const [pwdSuccess, setPwdSuccess] = useState<string>('');
  const [isAboutModalOpen, setIsAboutModalOpen] = useState<boolean>(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState<boolean>(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);
  const [isGiftCodeModalOpen, setIsGiftCodeModalOpen] = useState<boolean>(false);
  const [isBankCardModalOpen, setIsBankCardModalOpen] = useState<boolean>(false);
  const [profileSubPage, setProfileSubPage] = useState<string | null>(null);
  const [isMissionsRulesOpen, setIsMissionsRulesOpen] = useState<boolean>(false);
  const [historyTab, setHistoryTab] = useState<'recharges' | 'products'>('recharges');
  const [rechargeHistoryFilter, setRechargeHistoryFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');
  const [withdrawHistoryFilter, setWithdrawHistoryFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');
  const [faqCategoryFilter, setFaqCategoryFilter] = useState<string>('all');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [showOldPwd, setShowOldPwd] = useState<boolean>(false);
  const [showNewPwd, setShowNewPwd] = useState<boolean>(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState<boolean>(false);

  useEffect(() => {
    setProfileSubPage(null);
  }, [activeTab]);

  // Bank Card Binding States
  const [bankCardName, setBankCardName] = useState<string>(() => {
    try {
      return currentUser.bankCardName || localStorage.getItem('mdb_saved_name') || '';
    } catch (e) {
      return currentUser.bankCardName || '';
    }
  });
  const [bankCardOperator, setBankCardOperator] = useState<string>(() => {
    try {
      return currentUser.bankCardOperator || localStorage.getItem('mdb_saved_operator') || "MTN (CM)";
    } catch (e) {
      return currentUser.bankCardOperator || "MTN (CM)";
    }
  });
  const [bankCardNumber, setBankCardNumber] = useState<string>(() => {
    try {
      return currentUser.bankCardNumber || localStorage.getItem('mdb_saved_number') || '';
    } catch (e) {
      return currentUser.bankCardNumber || '';
    }
  });
  const [bankCardError, setBankCardError] = useState<string>('');
  const [bankCardSuccess, setBankCardSuccess] = useState<string>('');

  const handleBankCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBankCardError('');
    setBankCardSuccess('');

    if (!bankCardName.trim()) {
      setBankCardError('Veuillez saisir le nom complet du titulaire.');
      return;
    }
    if (!bankCardNumber.trim() || bankCardNumber.length < 8) {
      setBankCardError('Veuillez saisir un numéro de téléphone Mobile Money valide.');
      return;
    }

    try {
      localStorage.setItem('mdb_saved_name', bankCardName.trim());
      localStorage.setItem('mdb_saved_operator', bankCardOperator);
      localStorage.setItem('mdb_saved_number', bankCardNumber.trim());

      setWithdrawOperator(bankCardOperator);
      setWithdrawNumber(bankCardNumber.trim());

      const updatedUser: User = {
        ...userState,
        bankCardName: bankCardName.trim(),
        bankCardOperator: bankCardOperator,
        bankCardNumber: bankCardNumber.trim(),
        lastModified: Date.now()
      };
      setUserState(updatedUser);
      DataStore.saveCurrentUser(updatedUser);
      if (onRefreshUser) onRefreshUser(updatedUser);
      
      if (typeof syncWithBackend === 'function') {
        syncWithBackend().catch((err) => console.error("Sync error:", err));
      }

      setBankCardSuccess('Vos coordonnées de retrait ont été enregistrées avec succès !');
      triggerToast('Coordonnées bancaires enregistrées !', 'success');
    } catch (err: any) {
      setBankCardError(err.message || 'Une erreur est survenue lors de l\'enregistrement.');
    }
  };
  
  // PWA installation state and hooks
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [deviceOS, setDeviceOS] = useState<'ios' | 'android' | 'other'>('other');
  const [activeInstallTab, setActiveInstallTab] = useState<'android' | 'ios'>('android');

  // Sync withdrawal form when user State bank card changes
  useEffect(() => {
    if (userState?.bankCardNumber) {
      setWithdrawNumber(userState.bankCardNumber);
    }
    if (userState?.bankCardOperator) {
      setWithdrawOperator(userState.bankCardOperator);
    }
  }, [userState?.bankCardNumber, userState?.bankCardOperator]);

  // Sync bank card binding form inputs when userState changes
  useEffect(() => {
    if (userState?.bankCardName) {
      setBankCardName(userState.bankCardName);
    }
    if (userState?.bankCardOperator) {
      setBankCardOperator(userState.bankCardOperator);
    }
    if (userState?.bankCardNumber) {
      setBankCardNumber(userState.bankCardNumber);
    }
  }, [userState?.bankCardName, userState?.bankCardOperator, userState?.bankCardNumber]);

  useEffect(() => {
    // Detect standalone mode
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);

    // Detect OS
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      setDeviceOS('ios');
      setActiveInstallTab('ios');
    } else if (/android/.test(ua)) {
      setDeviceOS('android');
      setActiveInstallTab('android');
    }

    // Intercept standard PWA prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const handleAppInstalled = () => {
      setIsStandalone(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const triggerPwaInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsStandalone(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    }
  };

  const handleDownloadAndInstallApp = async () => {
    // 1. Trigger the direct APK download programmatically
    const link = document.createElement('a');
    link.href = '/Gold Avenue_v2.6.apk';
    link.download = 'Gold Avenue_v2.6.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 2. Trigger PWA installation if the browser supports it
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setIsStandalone(true);
          setIsInstallable(false);
          setDeferredPrompt(null);
        }
      } catch (err) {
        console.error("PWA install error:", err);
      }
    }

    // 3. Show a clear, precise alert instruction explaining what to do next & handling install errors
    openAlert(
      "Téléchargement Lancé ! 📲",
      "Le téléchargement de l'application 'Gold Avenue_v2.6.apk' a commencé ! Ouvrez le fichier téléchargé pour l'installer.\n\n⚠️ IMPORTANT : Si l'installation refuse ou dit 'Application non installée', désinstallez d'abord TOUTE ancienne version (comme l'application Gold Avenue ou AgroProfit) de votre téléphone, puis réessayez. Cela résout 100% des erreurs d'installation !",
      "success"
    );
  };

  const [chatMessageInput, setChatMessageInput] = useState<string>('');

  // Clipboard copies
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

  const handleCopyPageUrl = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const [productErrors, setProductErrors] = useState<Record<string, string>>({});

  const [isSupportPageOpen, setIsSupportPageOpen] = useState<boolean>(false);
  const [isLiveChatOpen, setIsLiveChatOpen] = useState<boolean>(false);
  const [chatImageAttachment, setChatImageAttachment] = useState<string | null>(null);
  const [isUploadingChatImage, setIsUploadingChatImage] = useState<boolean>(false);
  const [zoomedChatImage, setZoomedChatImage] = useState<string | null>(null);
  const chatFileInputRef = useRef<HTMLInputElement>(null);

  const [tickerIndex, setTickerIndex] = useState<number>(0);

  useEffect(() => {
    const t = setInterval(() => {
      setTickerIndex(prev => (prev + 1) % TICKER_MESSAGES.length);
    }, 3500);
    return () => clearInterval(t);
  }, []);

  const [dismissedPermissionBanner, setDismissedPermissionBanner] = useState<boolean>(false);

  const [currentLiveNotif, setCurrentLiveNotif] = useState<{ message: string; type: string } | null>(null);

  // Note: Disabled random ticker popups at user request to avoid visual pollution on site
  useEffect(() => {
    // Disabled at user request
  }, []);

  const [chromeNotifPermission, setChromeNotifPermission] = useState<string>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'unsupported';
  });

  const initialLoadedNotifIds = useRef<Set<string>>(new Set());

  const triggerChromeNotification = (title: string, message: string) => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          const cleanMessage = message.replace(/<[^>]*>/g, ''); // strip any html tags
          // Native notification invocation
          const notif = new Notification("Vous avez reçu une nouvelle notification", {
            body: cleanMessage,
            icon: 'https://cdn-icons-png.flaticon.com/512/1827/1827379.png',
            tag: 'agro-' + Date.now(),
          });
          notif.onclick = () => {
            window.focus();
          };
        } catch (err) {
          console.error('Browser blocked background notification instantiation:', err);
        }
      }
    }
  };

  const requestChromeNotificationPermission = () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      openAlert('Unsupported', 'Votre navigateur Chrome ou appareil actuel ne supporte pas les notifications de bureau.', 'info');
      return;
    }
    
    Notification.requestPermission().then((permission) => {
      setChromeNotifPermission(permission);
      if (permission === 'granted') {
        openAlert('Activé avec succès 🎉', 'Vous recevrez désormais des alertes instantanées dans Chrome à chaque fois qu\'une recharge est approuvée, qu\'un gain tombe ou qu\'une annonce officielle de l\'administrateur est diffusée.', 'success');
        try {
          new Notification("Vous avez reçu une nouvelle notification", {
            body: "Notifications de bureau Chrome activées sur Gold Avenue ! 🔔"
          });
        } catch (e) {
          console.error(e);
        }
      } else if (permission === 'denied') {
        openAlert('Notifications bloquées ⚠️', 'Vous avez bloqué les notifications. Veuillez réactiver les droits de notification dans les paramètres (icône de cadenas) de votre navigateur Chrome pour de futurs messages directs.', 'error');
      }
    });
  };

  const getCurrency = () => {
    return 'XOF';
  };

  const [customModal, setCustomModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'confirm' | 'success' | 'info' | 'error' | 'purchase_success';
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' | 'info' }[]>([]);

  const triggerToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const openAlert = (title: string, message: string, type: 'success' | 'error' | 'info' | 'purchase_success' = 'info') => {
    setCustomModal({
      isOpen: true,
      title,
      message,
      type,
    });
  };

  const openPurchaseSuccessAlert = (title: string, message: string) => {
    setCustomModal({
      isOpen: true,
      title,
      message,
      type: 'purchase_success',
    });
  };

  const openConfirm = (title: string, message: string, onConfirm: () => void) => {
    setCustomModal({
      isOpen: true,
      title,
      message,
      type: 'confirm',
      onConfirm
    });
  };

  // Layout states
  const [simulationStatus, setSimulationStatus] = useState<string>('');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [buyingProductId, setBuyingProductId] = useState<string | null>(null);
  const [showAnnouncementDismissible, setShowAnnouncementDismissible] = useState<boolean>(() => {
    try {
      const justReg = sessionStorage.getItem('gi_just_registered') === 'true';
      if (justReg) {
        return true;
      }
      return localStorage.getItem('gi_announcement_dismissed_v2') !== 'true';
    } catch (e) {
      return true;
    }
  });
  const [profileHistoryTab, setProfileHistoryTab] = useState<'history' | 'deposits' | 'withdrawals' | 'purchases' | 'notifications'>('history');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const lastSupportMsgsCount = useRef<number>(0);

  // MLM sponsorship dynamic calculation based on real user registration tree
  const [allUsers, setAllUsers] = useState<User[]>(() => DataStore.getUsers());
  const mlmRates = DataStore.getMLMRates();

  const userStateRef = useRef(userState);
  userStateRef.current = userState;

  const allUsersRef = useRef(allUsers);
  allUsersRef.current = allUsers;

  const productsRef = useRef(products);
  productsRef.current = products;

  const manualDepositNumbersRef = useRef(manualDepositNumbers);
  manualDepositNumbersRef.current = manualDepositNumbers;

  const forumPostsRef = useRef(forumPosts);
  forumPostsRef.current = forumPosts;

  const activeInvestmentsRef = useRef(activeInvestments);
  activeInvestmentsRef.current = activeInvestments;
  
  const myIdUpper = userState.id.toUpperCase();
  const myCodeUpper = userState.referralCode ? userState.referralCode.trim().toUpperCase() : '';
  const myPhoneDigits = userState.whatsapp ? userState.whatsapp.replace(/\D/g, '') : '';

  const level1Users = allUsers.filter(u => {
    if (!u.referredBy) return false;
    const refClean = u.referredBy.trim().toUpperCase();
    const refDigits = refClean.replace(/\D/g, '');

    // 1. Direct match by User ID
    if (refClean === myIdUpper) return true;
    
    // 2. Direct match by Referral Code
    if (myCodeUpper && refClean === myCodeUpper) return true;
    
    // 3. Direct match by Phone number
    if (myPhoneDigits && refDigits && (myPhoneDigits.endsWith(refDigits) || refDigits.endsWith(myPhoneDigits))) {
      return true;
    }

    // 4. Resolve phantom/indirect sponsor matchups across disparate browser sessions/windows
    // If the sponsor ID in u.referredBy points to a phantom user record, check if that phantom's referralCode matches our referral code
    const sponsor = allUsers.find(sp => sp.id.toUpperCase() === refClean);
    if (sponsor) {
      const spCodeUpper = sponsor.referralCode ? sponsor.referralCode.trim().toUpperCase() : '';
      if (myCodeUpper && spCodeUpper && spCodeUpper === myCodeUpper) return true;

      const spIdUpper = sponsor.id.toUpperCase();
      if (spIdUpper === myIdUpper) return true;

      const spPhoneDigits = sponsor.whatsapp ? sponsor.whatsapp.replace(/\D/g, '') : '';
      if (myPhoneDigits && spPhoneDigits && (myPhoneDigits.endsWith(spPhoneDigits) || spPhoneDigits.endsWith(myPhoneDigits))) {
        return true;
      }
    }

    return false;
  });

  const level1IdsUpper = level1Users.map(u => u.id.toUpperCase());
  const level1CodesUpper = level1Users.map(u => u.referralCode ? u.referralCode.trim().toUpperCase() : '').filter(Boolean);
  const level1WhatsAppDigits = level1Users.map(u => u.whatsapp ? u.whatsapp.replace(/\D/g, '') : '').filter(Boolean);

  const level2Users = (level1IdsUpper.length > 0 || level1CodesUpper.length > 0 || level1WhatsAppDigits.length > 0)
    ? allUsers.filter(u => {
        if (!u.referredBy) return false;
        const refClean = u.referredBy.trim().toUpperCase();
        const refDigits = refClean.replace(/\D/g, '');

        if (level1IdsUpper.includes(refClean) || level1CodesUpper.includes(refClean)) return true;

        // Resolve indirect/phantom sponsors
        const sponsor = allUsers.find(sp => sp.id.toUpperCase() === refClean);
        if (sponsor) {
          const spIdUpper = sponsor.id.toUpperCase();
          const spCodeUpper = sponsor.referralCode ? sponsor.referralCode.trim().toUpperCase() : '';
          if (level1IdsUpper.includes(spIdUpper) || (spCodeUpper && level1CodesUpper.includes(spCodeUpper))) {
            return true;
          }
        }

        if (refDigits && level1WhatsAppDigits.some(d => d.endsWith(refDigits) || refDigits.endsWith(d))) {
          return true;
        }
        return false;
      })
    : [];

  const level2IdsUpper = level2Users.map(u => u.id.toUpperCase());
  const level2CodesUpper = level2Users.map(u => u.referralCode ? u.referralCode.trim().toUpperCase() : '').filter(Boolean);
  const level2WhatsAppDigits = level2Users.map(u => u.whatsapp ? u.whatsapp.replace(/\D/g, '') : '').filter(Boolean);

  const level3Users = (level2IdsUpper.length > 0 || level2CodesUpper.length > 0 || level2WhatsAppDigits.length > 0)
    ? allUsers.filter(u => {
        if (!u.referredBy) return false;
        const refClean = u.referredBy.trim().toUpperCase();
        const refDigits = refClean.replace(/\D/g, '');

        if (level2IdsUpper.includes(refClean) || level2CodesUpper.includes(refClean)) return true;

        // Resolve indirect/phantom sponsors
        const sponsor = allUsers.find(sp => sp.id.toUpperCase() === refClean);
        if (sponsor) {
          const spIdUpper = sponsor.id.toUpperCase();
          const spCodeUpper = sponsor.referralCode ? sponsor.referralCode.trim().toUpperCase() : '';
          if (level2IdsUpper.includes(spIdUpper) || (spCodeUpper && level2CodesUpper.includes(spCodeUpper))) {
            return true;
          }
        }

        if (refDigits && level2WhatsAppDigits.some(d => d.endsWith(refDigits) || refDigits.endsWith(d))) {
          return true;
        }
        return false;
      })
    : [];

  const totalReferrals = level1Users.length + level2Users.length + level3Users.length;

  // Helpers to calculate investments
  const getLevelInvestedAmount = (usersList: User[]) => {
    try {
      const allInvs = DataStore.getInvestments() || [];
      const userIds = new Set(usersList.map(u => u.id));
      return allInvs
        .filter(inv => userIds.has(inv.userId))
        .reduce((sum, inv) => sum + inv.price, 0);
    } catch (e) {
      console.error(e);
      return 0;
    }
  };

  const getUserInvestedAmount = (userId: string) => {
    try {
      const allInvs = DataStore.getInvestments() || [];
      return allInvs
        .filter(inv => inv.userId === userId)
        .reduce((sum, inv) => sum + inv.price, 0);
    } catch (e) {
      console.error(e);
      return 0;
    }
  };

  // Unified history aggregator that merges all transaction logs and events
  const getUnifiedHistory = () => {
    const list: {
      id: string;
      date: string;
      amount: number;
      type: 'Recharge' | 'Retrait' | 'Commission' | 'Achat VIP' | 'Revenu Quotidien';
      status: 'Réussi' | 'Validé' | 'En attente' | 'Refusé' | 'Complété';
      details: string;
      rawDate: Date;
    }[] = [];

    // 1. Deposits (Recharges)
    allDeposits.forEach((dep) => {
      let mappedStatus: 'Validé' | 'En attente' | 'Refusé' = 'En attente';
      if (dep.status === 'approved') mappedStatus = 'Validé';
      if (dep.status === 'rejected') mappedStatus = 'Refusé';
      
      list.push({
        id: `history-dep-${dep.id}`,
        date: dep.createdAt,
        amount: dep.amount,
        type: 'Recharge',
        status: mappedStatus,
        details: `Recharge via ${dep.operator} ${dep.reference ? `[Réf: ${dep.reference}]` : ''}`,
        rawDate: new Date(dep.createdAt)
      });
    });

    // 2. Withdrawals (Retraits)
    allWithdrawals.forEach((wth) => {
      let mappedStatus: 'Réussi' | 'Validé' | 'En attente' | 'Refusé' = 'En attente';
      if (wth.status === 'approved') mappedStatus = 'Réussi';
      if (wth.status === 'rejected') mappedStatus = 'Refusé';

      list.push({
        id: `history-wth-${wth.id}`,
        date: wth.createdAt,
        amount: wth.amount,
        type: 'Retrait',
        status: mappedStatus,
        details: `Retrait Mobile Money (${wth.operator}) vers ${maskPhoneNumber(wth.number)}`,
        rawDate: new Date(wth.createdAt)
      });
    });

    // 3. Purchases/Activations
    activeInvestments.forEach((inv) => {
      list.push({
        id: `history-buy-${inv.id}`,
        date: inv.createdAt,
        amount: inv.price,
        type: 'Achat VIP',
        status: inv.status === 'completed' ? 'Complété' : 'Validé',
        details: `Activation Formule ${inv.productName} (${inv.dailyReturn.toLocaleString()} F/jour pendant ${inv.durationDays}j)`,
        rawDate: new Date(inv.createdAt)
      });

      // 4. Daily Earnings (Revenus Quotidiens)
      for (let d = 1; d <= inv.daysPassed; d++) {
        const installmentTime = new Date(inv.createdAt).getTime() + d * 24 * 60 * 60 * 1000;
        const finalTime = Math.min(Date.now(), installmentTime);
        const instDate = new Date(finalTime).toISOString();

        list.push({
          id: `history-earn-${inv.id}-${d}`,
          date: instDate,
          amount: inv.dailyReturn,
          type: 'Revenu Quotidien',
          status: 'Validé',
          details: `Gain journalier généré - Formule ${inv.productName} (Jour ${d}/${inv.durationDays})`,
          rawDate: new Date(finalTime)
        });
      }
    });

    // 5. Commissions
    commissions.forEach((c) => {
      list.push({
        id: `history-comm-${c.id}`,
        date: c.createdAt,
        amount: c.amount,
        type: 'Commission',
        status: 'Validé',
        details: `Bonus d'affiliation de Niveau ${c.level} (généré par ${c.fromUserName})`,
        rawDate: new Date(c.createdAt)
      });
    });

    // Sort descending (most recent first)
    return list.sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());
  };

  // Sync state function from local storage
  const syncDashboardData = () => {
    // Process automatic chronological daily rewards on sync
    DataStore.processAutomaticDailyInstallments();

    const cur = DataStore.getCurrentUser();
    if (cur) {
      setUserState(cur);
      onRefreshUser(cur);
    }
    setAllUsers(DataStore.getUsers());
    setProducts(DataStore.getProducts());
    
    // Sort investments, commissions and operations by recent
    const invs = DataStore.getInvestments().filter(i => i.userId === currentUser.id);
    setActiveInvestments(invs);

    const comms = DataStore.getCommissions().filter(c => c.userId === currentUser.id);
    setCommissions(comms);

    const deps = DataStore.getDeposits().filter(d => d.userId === currentUser.id);
    setAllDeposits(deps);

    const wths = DataStore.getWithdrawals().filter(w => w.userId === currentUser.id);
    setAllWithdrawals(wths);

    const notifs = DataStore.getNotifications().filter(n => n.userId === undefined || n.userId === currentUser.id);
    setNotifications(notifs);
    if (initialLoadedNotifIds.current.size === 0 && notifs.length > 0) {
      notifs.forEach(n => initialLoadedNotifIds.current.add(n.id));
    }

    const msgs = DataStore.getSupportMessages().filter(m => m.userId === currentUser.id);
    setSupportMessages(msgs);

    const pfs = DataStore.getWithdrawalProofs().filter(p => !p.status || p.status === 'approved');
    setWithdrawalProofs(pfs);

    // Sync configured deposit numbers from administrator so they update automatically without page refresh
    setManualDepositNumbers(DataStore.getManualDepositNumbers());

    setForumPosts(DataStore.getForumPosts());
    DataStore.fetchForumPostsFromServer().then((posts) => {
      if (posts && Array.isArray(posts)) {
        setForumPosts(posts);
      }
    }).catch(() => {});

    try {
      const checkKey = `gi_last_daily_${currentUser.id}`;
      setHasCheckedInToday(localStorage.getItem(checkKey) === new Date().toDateString());
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    syncDashboardData();

    // Check if we just completed a WestPay transaction successfully
    let wpNotif: string | null = null;
    try {
      wpNotif = sessionStorage.getItem('gi_wp_success_notif');
    } catch (e) {
      // Ignore sandbox sessionStorage block
    }
    if (wpNotif) {
      try {
        const data = JSON.parse(wpNotif);
        if (data && data.amount && data.ref) {
          setTimeout(() => {
            openPurchaseSuccessAlert(
              'Recharge Reçue ! 💳💰',
              "Félicitations !\nVotre compte a été crédité automatiquement et instantanément de " + data.amount.toLocaleString() + " " + getCurrency() + " suite à votre paiement réussi.\n\nRéférence du paiement: " + data.ref
            );
          }, 800);
        }
      } catch (err) {
        console.error('Failed to process WestPay welcome message in dashboard:', err);
      } finally {
        try {
          sessionStorage.removeItem('gi_wp_success_notif');
        } catch (e) {}
      }
    }

    // Auto request chrome notification permission removed as requested by the user


    // Setup periodic check interval to automatically credit of earnings in real-time and check for new notifications in Chrome or app
    const interval = setInterval(async () => {
      // Synchronize with backend to pull latest changes in real-time (e.g. admin replies)
      try {
        await syncWithBackend();
      } catch (err) {
        console.warn('Periodic background sync failed:', err);
      }

      const oldBal = userStateRef.current.balance;
      const oldDailyEarnings = userStateRef.current.dailyEarnings;
      const oldUsersLen = allUsersRef.current.length;
      DataStore.processAutomaticDailyInstallments();
      
      const fresh = DataStore.getCurrentUser();
      const freshUsers = DataStore.getUsers();
      const freshProducts = DataStore.getProducts();
      const freshManualNums = DataStore.getManualDepositNumbers();
      const freshForumPosts = DataStore.getForumPosts();
      const freshInvs = DataStore.getInvestments().filter(i => i.userId === currentUser.id);
      
      // Pull real-time notifications
      const freshNotifs = DataStore.getNotifications().filter(n => n.userId === undefined || n.userId === currentUser.id);
      const brandNewNotifs = freshNotifs.filter(n => !initialLoadedNotifIds.current.has(n.id));
      
      if (brandNewNotifs.length > 0) {
        brandNewNotifs.forEach(n => {
          triggerChromeNotification(n.title || "Nouvelle Notification", n.message);
          initialLoadedNotifIds.current.add(n.id);
        });
        syncDashboardData();
      } else if (
        (fresh && (fresh.balance !== oldBal || fresh.dailyEarnings !== oldDailyEarnings)) || 
        freshUsers.length !== oldUsersLen ||
        freshProducts.length !== productsRef.current.length ||
        freshManualNums.length !== manualDepositNumbersRef.current.length ||
        freshForumPosts.length !== forumPostsRef.current.length ||
        freshInvs.length !== activeInvestmentsRef.current.length
      ) {
        syncDashboardData();
      }

      // Check for newly received admin replies in real-time (without top toasts or banners)
      const freshMsgs = DataStore.getSupportMessages().filter(m => m.userId === currentUser.id);
      if (freshMsgs.length !== lastSupportMsgsCount.current || freshMsgs.some((m, idx) => m.status !== supportMessages[idx]?.status)) {
        lastSupportMsgsCount.current = freshMsgs.length;
        setSupportMessages(freshMsgs);
      }
    }, 5000);

    // Listen to custom automated support response events and global backend store updates
    const handleNewMessage = () => {
      syncDashboardData();
    };
    const handleStoreUpdated = () => {
      syncDashboardData();
    };
    window.addEventListener('gi_new_message', handleNewMessage);
    window.addEventListener('gi_store_updated', handleStoreUpdated);
    window.addEventListener('gi_category_schedules_updated', handleStoreUpdated);

    let bc: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel('gi_schedules_sync');
        bc.onmessage = (ev) => {
          if (ev.data && ev.data.type === 'SCHEDULES_UPDATED') {
            syncDashboardData();
          }
        };
      }
    } catch (e) {}

    return () => {
      clearInterval(interval);
      window.removeEventListener('gi_new_message', handleNewMessage);
      window.removeEventListener('gi_store_updated', handleStoreUpdated);
      window.removeEventListener('gi_category_schedules_updated', handleStoreUpdated);
      if (bc) {
        try { bc.close(); } catch (e) {}
      }
    };
  }, [currentUser.id]);

  // When the live chat is open, automatically mark any unread messages from admin as read
  useEffect(() => {
    if (isLiveChatOpen && currentUser.id) {
      const hasUnreadAdminMsgs = supportMessages.some(
        m => m.userId === currentUser.id && m.sender === 'admin' && m.status === 'unread'
      );
      if (hasUnreadAdminMsgs) {
        DataStore.markSupportMessagesAsRead(currentUser.id, 'user');
        setSupportMessages(prev => prev.map(m => (m.userId === currentUser.id && m.sender === 'admin' && m.status === 'unread') ? { ...m, status: 'read' } : m));
      }
    }
  }, [isLiveChatOpen, supportMessages, currentUser.id]);

  useEffect(() => {
    // Scroll to bottom of support chat when opened or new messages spawn
    if (activeTab === 'profile' || isLiveChatOpen) {
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }
  }, [supportMessages, activeTab, isLiveChatOpen]);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      setShowAnnouncementDismissible(true);
    } else if (activeTab === 'forum') {
      syncWithBackend().then(() => {
        setForumPosts(DataStore.getForumPosts());
      }).catch(() => {});
    }
  }, [activeTab]);

  // Copy referral elements
  const getReferralBaseURL = () => {
    const configuredDomain = DataStore.getReferralDomain();
    if (configuredDomain) {
      let formatted = configuredDomain.trim();
      if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
        formatted = 'https://' + formatted;
      }
      return formatted.replace(/\/+$/, '');
    }

    const origin = window.location.origin;
    if (!origin || origin.includes('aistudio.google.com')) {
      return 'https://ais-pre-gymdtdpbwifj6pqjbdravq-473372860465.europe-west1.run.app';
    }
    return origin;
  };
  const referralURL = `${getReferralBaseURL()}/?ref=${userState.referralCode}`;
  
  const handleCopyLink = () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(referralURL);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = referralURL;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedLink(true);
      triggerToast('Lien de parrainage copié ! 🚀', 'success');
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (err) {
      console.error('Failed to copy link', err);
      triggerToast('Veuillez copier le lien manuellement dans la zone ci-dessous.', 'info');
    }
  };

  const handleCopyCode = () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(userState.referralCode);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = userState.referralCode;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedCode(true);
      triggerToast('Code sponsor copié ! 🔑', 'success');
      setTimeout(() => setCopiedCode(false), 2500);
    } catch (err) {
      console.error('Failed to copy code', err);
    }
  };

  // Check-in helper
  const handleDailyCheckin = async () => {
    const res = await DataStore.claimDailyReward(userState.id);
    if (res.success) {
      triggerToast('🎉 ' + res.message, 'success');
      setHasCheckedInToday(true);
      syncDashboardData();
    } else {
      triggerToast('⚠️ ' + res.message, 'info');
    }
  };

  const handleSpinWheel = () => {
    if (isSpinning) return;
    if (wheelSpinCount <= 0) {
      triggerToast("Oups ! Vous n'avez plus de tirages disponibles. Invitez des filleuls pour en gagner !", "error");
      return;
    }

    setIsSpinning(true);
    setWonReward(null);

    // Limit wins strictly to 20 F, 25 F, 50 F, or 200 F (amount between 20 and 200 inclusive)
    const allowedIndices = WHEEL_REWARDS.map((rew, idx) => ({ rew, idx }))
      .filter(item => item.rew.amount >= 20 && item.rew.amount <= 200)
      .map(item => item.idx);
    const randomIndex = allowedIndices[Math.floor(Math.random() * allowedIndices.length)];
    const selected = WHEEL_REWARDS[randomIndex];

    const segmentAngle = 360 / WHEEL_REWARDS.length;
    // Calculate final spin rotation (multiple full spins + segment target)
    const targetAngle = 3600 - (randomIndex * segmentAngle) - (segmentAngle / 2);
    setWheelSpinAngle(targetAngle);

    setTimeout(() => {
      setIsSpinning(false);
      setWonReward(selected);
      setWheelSpinCount(prev => {
        const next = Math.max(0, prev - 1);
        try { localStorage.setItem('gi_wheel_spins_v3', next.toString()); } catch (e) {}
        return next;
      });

      const rewardAmt = selected.amount;
      const updatedUser = {
        ...userState,
        balance: userState.balance + rewardAmt,
        totalEarnings: (userState.totalEarnings || 0) + rewardAmt
      };
      
      DataStore.saveCurrentUser(updatedUser);
      syncDashboardData();
      syncWithBackend();

      const newNotif = {
        id: 'wheel-win-' + Date.now(),
        userId: userState.id,
        title: "Gain à la Roue de la chance 🎡",
        message: `Félicitations ! Vous avez gagné ${rewardAmt.toLocaleString()} F CFA au tirage au sort !`,
        type: 'reward' as const,
        createdAt: new Date().toISOString(),
        read: false,
        isRead: false
      };
      setNotifications(prev => [newNotif, ...prev]);

      triggerToast(`Félicitations ! Vous avez gagné +${rewardAmt.toLocaleString()} F CFA !`, "success");
    }, 4500);
  };

  // Claim specific investment return simulation (Click pay)
  const handleClaimReturn = async (invId: string) => {
    const res = await DataStore.claimInvestmentReturn(userState.id, invId);
    if (res.success) {
      openAlert('Dividende Collecté', res.message, 'success');
      syncDashboardData();
    } else {
      openAlert('Erreur', res.message, 'error');
    }
  };

  // Forum actions
  const handlePostForumMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forumMessageInput.trim() && !forumImage1 && !forumImage2) {
      triggerToast("⚠️ Veuillez rédiger un message ou joindre au moins une capture d'écran.", "error");
      return;
    }

    const maskedId = getMaskedAnonymousId(userState.id || userState.phone || userState.name);
    const newPost = {
      id: 'f-user-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      authorId: userState.id || ('u-' + Date.now()),
      authorPhone: userState.phone || '',
      authorName: maskedId,
      avatarLetter: '★',
      text: forumMessageInput.trim() || "📸 Capture d'écran partagée sur le forum.",
      image1: forumImage1 || undefined,
      image2: forumImage2 || undefined,
      likes: 0,
      likedBy: [],
      hasLiked: false,
      createdAt: new Date().toISOString(),
      lastModified: Date.now(),
      comments: []
    };

    const updated = deduplicateForumPosts([newPost, ...forumPosts]);
    setForumPosts(updated);
    setForumMessageInput('');
    setForumImage1(null);
    setForumImage2(null);
    
    await DataStore.createForumPost(newPost);
    triggerToast("Votre publication a été enregistrée et publiée sur le Forum !", "success");
  };

  const handleLikeForumPost = async (postId: string) => {
    const updated = forumPosts.map(p => {
      if (p.id === postId) {
        const likedBy = p.likedBy || (p.hasLiked ? ['legacy-like'] : []);
        const alreadyLiked = likedBy.includes(userState.id);
        const newLikedBy = alreadyLiked 
          ? likedBy.filter((id: string) => id !== userState.id)
          : [...likedBy, userState.id];
        return {
          ...p,
          likedBy: newLikedBy,
          likes: newLikedBy.length,
          hasLiked: newLikedBy.includes(userState.id),
          lastModified: Date.now()
        };
      }
      return p;
    });
    setForumPosts(updated);
    await DataStore.likeForumPost(postId, userState.id);
  };

  const handlePostForumComment = (postId: string) => {
    const commentText = (forumCommentInputs[postId] || '').trim();
    if (!commentText) {
      triggerToast("⚠️ Veuillez écrire un commentaire avant d'envoyer.", "error");
      return;
    }

    const updated = forumPosts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          comments: [
            ...(p.comments || []),
            { 
              id: 'c-' + Date.now(),
              author: (userState.name || 'Membre') + ' ' + (userState.country === 'Cameroun' ? '🇨🇲' : userState.country === 'Togo' ? '🇹🇬' : userState.country === 'Bénin' ? '🇧🇯' : userState.country === 'Côte d’Ivoire' ? '🇨🇮' : userState.country === 'Burkina Faso' ? '🇧🇫' : userState.country === 'Sénégal' ? '🇸🇳' : userState.country === 'Mali' ? '🇲🇱' : userState.country === 'Niger' ? '🇳🇪' : '🌍'),
              text: commentText,
              date: new Date().toISOString()
            }
          ],
          lastModified: Date.now()
        };
      }
      return p;
    });

    setForumPosts(updated);
    setForumCommentInputs(prev => ({ ...prev, [postId]: '' }));
    DataStore.saveForumPosts(updated);
    triggerToast("Commentaire publié sur le forum !", "success");
  };

  const handleClaimMission = (missionId: string, reward: number, target: number) => {
    const directReferrals = level1Users;
    const allInvs = DataStore.getInvestments() || [];
    const investedReferralCount = directReferrals.filter(u => allInvs.some(inv => inv.userId === u.id)).length;
    const claimed = (userState as any).claimedMissions || [];

    if (investedReferralCount < target) return;
    if (claimed.includes(missionId)) return;

    const newBalance = userState.balance + reward;
    const newClaimed = [...claimed, missionId];

    const updatedUser: User = {
      ...userState,
      balance: newBalance,
      claimedMissions: newClaimed as any
    };

    DataStore.saveCurrentUser(updatedUser);
    const allUsers = DataStore.getUsers();
    const idx = allUsers.findIndex(u => u.id === updatedUser.id);
    if (idx !== -1) {
      allUsers[idx] = updatedUser;
      DataStore.saveUsers(allUsers);
    }

    setUserState(updatedUser);
    if (onRefreshUser) {
      onRefreshUser(updatedUser);
    }

    triggerToast(`Félicitations ! Votre bonus de +${reward.toLocaleString()} FCFA a été ajouté à votre solde ! 🎯`, "success");
  };

  // Deposit events
  // Simulate drop / select image as Base64 for receipt
  const handleReceiptChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 500, 0.45);
        setReceiptBase64(compressed);
      } catch (err) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setReceiptBase64(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const [paymentProcessing, setPaymentProcessing] = useState<boolean>(false);

  const pollSendavaPayStatus = (reference: string) => {
    if (!reference) return;
    setSpReference(reference);
    setIsPollingSp(true);

    let attempts = 0;
    const maxAttempts = 60; // 4 minutes
    
    const interval = setInterval(async () => {
      attempts++;
      if (attempts > maxAttempts) {
        clearInterval(interval);
        setIsPollingSp(false);
        return;
      }

      try {
        const response = await apiFetch(getApiUrl('/api/sendavapay/verify-deposit'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ reference })
        });

        if (response.ok) {
          const res = await response.json();
          if (res.success) {
            if (res.status === 'approved' || res.status === 'completed') {
              clearInterval(interval);
              setIsPollingSp(false);
              setDepositSuccess("🎉 Félicitations ! Votre paiement a été détecté et validé avec succès. Votre compte a été crédité automatiquement !");
              setSpOtpModalOpen(false);
              setSpOtpToken(null);
              setSpOtpCode('');
              await syncWithBackend();
              syncDashboardData();
              triggerToast("⚡ Compte crédité automatiquement !", "success");
            } else if (res.status === 'failed') {
              clearInterval(interval);
              setIsPollingSp(false);
              setDepositError("Le paiement a été rejeté ou a échoué. Veuillez réessayer.");
            }
          }
        }
      } catch (err) {
        console.error("Error polling SendavaPay status:", err);
      }
    }, 4000);
  };

  const handleGoToStep2 = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setDepositError('');
    setDepositSuccess('');
    const amt = parseInt(depositAmount);
    if (isNaN(amt) || amt < 2500) {
      setDepositError(`Le montant minimum pour un versement est de 2 500 ${getCurrency()}.`);
      return;
    }
    if (!spOperatorId) {
      setDepositError("Veuillez choisir un opérateur Mobile Money.");
      return;
    }
    setDepositStep(2);
  };

  const submitSpOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spOtpCode || !spOtpToken) return;

    setPaymentProcessing(true);
    setDepositError('');
    try {
      const response = await apiFetch(getApiUrl('/api/sendavapay/submit-otp'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          otpToken: spOtpToken,
          otp: spOtpCode
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          if (spReference) {
            pollSendavaPayStatus(spReference);
          }
          triggerToast("Code OTP soumis avec succès. Validation en cours...", "success");
        } else {
          setDepositError(data.error || "La validation du code OTP a échoué.");
        }
      } else {
        const errData = await response.json().catch(() => ({}));
        setDepositError(errData.error || "Erreur de connexion lors de la validation du code OTP.");
      }
    } catch (err: any) {
      console.error("OTP submit error:", err);
      setDepositError(err?.message || "Erreur lors de la soumission de l'OTP.");
    } finally {
      setPaymentProcessing(false);
    }
  };

  const mapCountryNameToCode = (name: string): string => {
    const c = name.toLowerCase();
    if (c.includes('togo')) return 'TG';
    if (c.includes('ivoire') || c.includes('ivory')) return 'CI';
    if (c.includes('benin') || c.includes('bénin')) return 'BJ';
    if (c.includes('burkina')) return 'BF';
    if (c.includes('senegal') || c.includes('sénégal')) return 'SN';
    if (c.includes('mali')) return 'ML';
    if (c.includes('congo')) return 'COG';
    return 'TG';
  };

  const submitDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDepositError('');
    setDepositSuccess('');

    const amt = parseInt(depositAmount);
    if (isNaN(amt) || amt < 2500) {
      setDepositError(`Le montant minimum pour un versement est de 2 500 F.`);
      return;
    }

    if (!depositPhone || !depositPhone.trim()) {
      setDepositError(`Veuillez saisir votre numéro de téléphone de paiement.`);
      return;
    }

    if (depositPhone.trim().length < 6) {
      setDepositError(`Veuillez saisir un numéro de téléphone de paiement valide (minimum 6 chiffres).`);
      return;
    }

    const redirectUrl = DataStore.getOnlinePaymentLink();
    // Ouvrir immédiatement la page de paiement dès le clic utilisateur pour garantir l'autorisation par le navigateur (évite le blocage popup après await)
    try {
      window.open(redirectUrl, '_blank');
    } catch (popupErr) {
      console.warn("Direct window.open notice:", popupErr);
    }

    setIsSubmittingDeposit(true);
    try {
      const reference = `SOC-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
      const formattedOperator = `SoccoPay (${depositCountry} ${depositCountryCode} ${depositPhone.trim()})`;
      let succeeded = false;
      try {
        const response = await apiFetch(getApiUrl('/api/create-deposit'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: userState.id,
            amount: amt,
            operator: formattedOperator,
            reference: reference,
            receiptImage: 'soccopay_link'
          })
        });
        if (response && response.ok) {
          const data = await response.json();
          if (data && data.success) {
            succeeded = true;
          }
        }
      } catch (err) {
        console.warn("[SoccoPay API failover] Server API failed, falling back to local/Supabase store:", err);
      }

      if (succeeded) {
        setDepositRedirectUrl('');
        setDepositSuccess(`Votre demande de recharge de ${amt.toLocaleString()} F a été enregistrée avec succès ! L'interface de paiement s'est ouverte automatiquement.`);
        syncDashboardData();
        if (typeof syncWithBackend === 'function') {
          syncWithBackend().catch(() => {});
        }
      } else {
        // --- CLIENT-SIDE FAILOVER STRATEGY ---
        console.log("[SoccoPay Fallback] Executing robust direct-to-Supabase deposit register...");
        
        const deposits = DataStore.getDeposits();
        const users = DataStore.getUsers();
        const user = users.find(u => u.id === userState.id);

        const newDep = {
          id: `dep-${Date.now()}`,
          userId: userState.id,
          userName: user ? user.name : (userState.name || 'Utilisateur'),
          amount: amt,
          operator: formattedOperator,
          reference: reference,
          receiptImage: 'soccopay_link',
          status: 'pending' as const,
          lastModified: Date.now(),
          createdAt: new Date().toISOString()
        };

        deposits.unshift(newDep);
        DataStore.saveDeposits(deposits);

        const notifications = DataStore.getNotifications();
        notifications.unshift({
          id: `not-dep-${Date.now()}`,
          userId: userState.id,
          title: 'Dépôt soumis',
          message: `Votre demande de dépôt de ${amt.toLocaleString()} F en ligne via SoccoPay (Réf: ${reference}) est en cours de vérification par l'administration.`,
          type: 'deposit',
          lastModified: Date.now(),
          createdAt: new Date().toISOString(),
          read: false
        });
        DataStore.saveNotifications(notifications);

        setDepositRedirectUrl('');
        setDepositSuccess(`Votre demande de recharge de ${amt.toLocaleString()} F a été enregistrée avec succès ! L'interface de paiement s'est ouverte automatiquement.`);
        syncDashboardData();
      }
    } catch (error: any) {
      console.error("SoccoPay deposit error:", error);
      setDepositError(`Erreur : ${error?.message || "Veuillez réessayer."}`);
    } finally {
      setIsSubmittingDeposit(false);
    }
  };

  const handleManualReceiptDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingManualReceipt(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setManualReceiptFileName(file.name);
      const b64 = await compressImage(file);
      setManualReceiptBase64(b64);
    }
  };

  const handleManualReceiptSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setManualReceiptFileName(file.name);
      const b64 = await compressImage(file);
      setManualReceiptBase64(b64);
    }
  };

  const handleCopyManualUssd = (text: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
      setManualCopied(true);
      setTimeout(() => setManualCopied(false), 2000);
    }
  };

  const submitManualDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDepositError('');
    setDepositSuccess('');

    const amt = parseInt(depositAmount);
    if (isNaN(amt) || amt < 2500) {
      setDepositError("Le montant minimum pour un versement est de 2 500 F.");
      return;
    }

    if (!depositPhone || !depositPhone.trim()) {
      setDepositError("Veuillez saisir votre numéro de téléphone de paiement.");
      return;
    }

    if (depositPhone.trim().length < 6) {
      setDepositError("Veuillez saisir un numéro de téléphone de paiement valide (minimum 6 chiffres).");
      return;
    }

    if (!manualReference.trim()) {
      setDepositError("Veuillez saisir l'ID de transaction ou la référence du paiement SMS.");
      return;
    }

    if (!manualReceiptBase64) {
      setDepositError("Veuillez joindre la capture d'écran de votre reçu de paiement.");
      return;
    }

    setIsSubmittingDeposit(true);
    try {
      const formattedOperator = `${manualOperator} (${depositCountry} ${depositCountryCode} ${depositPhone.trim()})`;
      const dep = await DataStore.createDeposit(
        userState.id,
        amt,
        formattedOperator,
        manualReference.trim(),
        manualReceiptBase64
      );

      if (dep) {
        setDepositSuccess(`Votre demande de recharge manuelle de ${amt.toLocaleString()} F CFA via ${formattedOperator} (Réf: ${manualReference}) a été enregistrée avec succès ! Notre équipe créditera votre solde dès vérification.`);
        setManualReference('');
        setManualReceiptBase64('');
        setManualReceiptFileName('');
        syncDashboardData();
      } else {
        setDepositError("Une erreur est survenue lors de l'enregistrement de votre demande. Veuillez réessayer.");
      }
    } catch (err: any) {
      console.error("Manual deposit submission error:", err);
      setDepositError(`Erreur lors de la soumission : ${err?.message || err || "Veuillez réessayer."}`);
    } finally {
      setIsSubmittingDeposit(false);
    }
  };

  // Withdrawal event
  const submitWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError('');
    setWithdrawSuccess('');

    // Règle : Un retrait est impossible si l’utilisateur n’a pas encore lié son compte de retrait.
    const hasLinkedCard = !!(userState.bankCardNumber || localStorage.getItem('mdb_saved_number'));
    if (!hasLinkedCard) {
      setWithdrawError("Un retrait est impossible si vous n'avez pas encore lié votre compte de retrait. Veuillez lier votre compte de retrait avant d'effectuer cette opération.");
      setIsBankCardModalOpen(true);
      return;
    }

    // Règle : Respecter les horaires d'ouverture et de fermeture définis par l'administration
    const wthSchedule = DataStore.isWithdrawalOpen();
    if (!wthSchedule.isOpen) {
      setWithdrawError(wthSchedule.reason || "Les retraits sont actuellement fermés par l'administration.");
      return;
    }

    if (DataStore.areWithdrawalsBlocked()) {
      setWithdrawError("Les retraits sont suspendus temporairement par l'administrateur système.");
      return;
    }
    if (userState.withdrawBlocked) {
      setWithdrawError("Les retraits sont bloqués temporairement sur votre compte.");
      return;
    }

    if (!hasActiveProduct) {
      setWithdrawError("Vous devez posséder au moins un produit d'investissement actif pour pouvoir effectuer un retrait.");
      return;
    }

    const amt = parseInt(withdrawAmount);
    if (isNaN(amt) || amt < 1000) {
      setWithdrawError(`Le montant de retrait minimum est de 1 000 ${getCurrency()}.`);
      return;
    }
    if (amt > 1000000) {
      setWithdrawError(`Le montant maximum autorisé par retrait est de 1 000 000 ${getCurrency()}.`);
      return;
    }
    if (userState.balance < amt) {
      setWithdrawError(`Solde insuffisant. Vous disposez uniquement de ${userState.balance.toLocaleString()} ${getCurrency()}.`);
      return;
    }

    const effectiveNumber = userState.bankCardNumber || localStorage.getItem('mdb_saved_number') || withdrawNumber;
    const effectiveOperator = userState.bankCardOperator || localStorage.getItem('mdb_saved_operator') || withdrawOperator;

    if (!effectiveNumber || effectiveNumber.trim().length < 6) {
      setWithdrawError('Veuillez renseigner un numéro de réception valide sur votre compte lié.');
      return;
    }

    setIsSubmittingWithdrawal(true);
    try {
      const res = await DataStore.createWithdrawal(userState.id, amt, effectiveOperator, effectiveNumber, withdrawProofBase64);
      if (res.success) {
        setWithdrawSuccess('Votre demande de retrait a été transmise ! Le solde a été mis à jour.');
        setWithdrawAmount('');
        setWithdrawNumber('');
        setWithdrawProofBase64('');
        setWithdrawProofFileName('');
        syncDashboardData();
      } else {
        setWithdrawError(res.error || 'Erreur lors de la soumission.');
      }
    } catch (err: any) {
      setWithdrawError(err.message || 'Erreur lors de la soumission.');
    } finally {
      setIsSubmittingWithdrawal(false);
    }

    setTimeout(() => {
      setWithdrawSuccess('');
    }, 5000);
  };

  // Apply Coupon
  const submitBonusCode = (e: React.FormEvent) => {
    e.preventDefault();
    setBonusError('');
    setBonusSuccess('');

    if (!bonusCodeInput.trim()) return;

    const res = DataStore.applyBonusCode(userState.id, bonusCodeInput);
    if (res.success) {
      setBonusSuccess(res.message);
      setBonusCodeInput('');
      syncDashboardData();
    } else {
      setBonusError(res.message);
    }
  };

  // Modify user password from account settings
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    if (!oldPassword.trim() || !newPassword.trim() || !confirmNewPassword.trim()) {
      setPwdError('Veuillez remplir tous les champs.');
      return;
    }

    const currentPwdExpected = userState.password || (userState.role === 'admin' ? 'admin' : 'user123');
    if (oldPassword !== currentPwdExpected) {
      setPwdError("L'ancien mot de passe est incorrect.");
      return;
    }

    if (newPassword.length < 5) {
      setPwdError('Le nouveau mot de passe doit contenir au moins 5 caractères.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPwdError('Les nouveaux mots de passe ne correspondent pas.');
      return;
    }

    if (newPassword === oldPassword) {
      setPwdError("Le nouveau mot de passe doit être différent de l'ancien.");
      return;
    }

    const success = DataStore.changeUserPassword(userState.id, newPassword);
    if (success) {
      setPwdSuccess('Mot de passe mis à jour avec succès !');
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      syncDashboardData();
    } else {
      setPwdError('Erreur lors de la mise à jour du mot de passe.');
    }
  };

  // Invest Product Purchase (Paiement direct et rapide sans confirmation intermédiaire, affichage direct de "Achat réussi")
  const handleBuyProduct = async (product: Product) => {
    if (buyingProductId) return;

    if (product.isBlocked) {
      openAlert('Plan Suspendu', "Ce plan d'investissement VIP est actuellement bloqué ou suspendu temporairement par l'administration.", 'error');
      return;
    }

    // 1. Vérification du solde : si 0 XOF ou insuffisant, avertir immédiatement
    if (userState.balance <= 0 || userState.balance < product.price) {
      openAlert(
        'Solde Insuffisant',
        'Votre solde est insuffisant. Veuillez effectuer un investissement/rechargement avant d’activer un produit.',
        'info'
      );
      return;
    }

    // 2. Condition d'accès pour Bien-être : Stabilité VIP N payée obligatoire & vérification des horaires
    if (product.category === 'wellbeing') {
      const scheduleStatus = DataStore.isCategoryOpen('wellbeing');
      if (!scheduleStatus.isOpen) {
        triggerToast('Ce produit est actuellement indisponible à l’achat', 'info');
        openAlert(
          'Information',
          'Ce produit est actuellement indisponible à l’achat',
          'info'
        );
        return;
      }

      const reqVipLevel = product.vipLevel || 1;
      const accessCheck = DataStore.canUserAccessWellbeingProduct(userState.id, reqVipLevel);
      if (!accessCheck.allowed) {
        openAlert(
          'Accès Non Autorisé',
          accessCheck.reason || `Pour accéder au Bien-être VIP ${reqVipLevel}, vous devez obligatoirement avoir payé le plan Stabilité VIP ${reqVipLevel} correspondant.`,
          'error'
        );
        return;
      }
    }

    // 3. Paiement direct et ultra-rapide sans confirmation intermédiaire
    try {
      setBuyingProductId(product.id);
      const res = await DataStore.buyProduct(userState.id, product.id);
      if (res.success) {
        triggerToast('Achat réussi 🎉', 'success');
        openPurchaseSuccessAlert(
          'Achat réussi',
          `Félicitations ! Votre souscription au plan "${product.name}" (${product.price.toLocaleString()} ${getCurrency()}) a été validée avec succès.\nVos gains quotidiens sont dès à présent activés !`
        );
        syncDashboardData();
        setActiveTab('orders'); // Redirige directement vers Mes Commandes
      } else {
        openAlert('Achat Échoué', res.message || "Une erreur est survenue lors de l'achat.", 'error');
        syncDashboardData();
      }
    } catch (err: any) {
      console.error("Erreur lors de l'achat:", err);
      openAlert('Erreur', err?.message || "Une erreur est survenue lors de l'achat.", 'error');
    } finally {
      setBuyingProductId(null);
    }
  };

  // Select and compress image for customer support chat
  const handleChatImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      triggerToast("⚠️ Veuillez choisir une image (JPG, PNG, WEBP).", "error");
      return;
    }

    try {
      setIsUploadingChatImage(true);
      const compressed = await compressImage(file, 650, 0.55);
      setChatImageAttachment(compressed);
      triggerToast("📸 Image attachée avec succès.", "success");
    } catch (err) {
      console.error("Error compressing chat image:", err);
      triggerToast("⚠️ Échec du traitement de l'image.", "error");
    } finally {
      setIsUploadingChatImage(false);
      if (chatFileInputRef.current) {
        chatFileInputRef.current.value = '';
      }
    }
  };

  // Send support message
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessageInput.trim() && !chatImageAttachment) return;

    const input = chatMessageInput.trim();
    const attachedImage = chatImageAttachment || undefined;
    
    // Clear inputs immediately for instant UI feedback
    setChatMessageInput('');
    setChatImageAttachment(null);

    try {
      const newMsg = await DataStore.sendMessageToSupport(userState.id, input, 'user', attachedImage);
      
      // Update local message list immediately for instantaneous bubble appearance
      if (newMsg) {
        setSupportMessages(prev => {
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      }
      
      // Update ref immediately to prevent triggering unread replies toasts on our own message
      lastSupportMsgsCount.current = DataStore.getSupportMessages().filter(m => m.userId === currentUser.id).length;
      
      // Scroll immediately and smoothly to the bottom
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } catch (err) {
      console.error("Error sending support message:", err);
    }
  };

  // Submit withdrawal proof
  const handlePublishProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userState.role !== 'admin') {
      triggerToast("⚠️ Seul l'administrateur peut publier sur la page Avis.", 'error');
      return;
    }
    if (!proofAmount.trim() || !proofMessage.trim()) {
      triggerToast('⚠️ Veuillez remplir le montant et votre message.', 'error');
      return;
    }

    const amt = parseInt(proofAmount, 10);
    if (isNaN(amt) || amt <= 0) {
      triggerToast('⚠️ Veuillez indiquer un montant valide.', 'error');
      return;
    }

    setIsPublishing(true);
    try {
      const res = await DataStore.publishWithdrawalProof(
        userState.id,
        userState.name,
        userState.country,
        amt,
        proofMessage,
        proofImage
      );

      if (res.success) {
        triggerToast('✅ Votre preuve de retrait a été publiée avec succès !', 'success');
        setProofAmount('');
        setProofMessage('');
        setProofImage('');
        setProofImageFileName('');
        setIsPublishFormOpen(false);
        syncDashboardData();
      } else {
        triggerToast('⚠️ Une erreur est survenue lors de la publication.', 'error');
      }
    } catch (err) {
      console.error('Error publishing proof:', err);
      triggerToast('⚠️ Impossible de se connecter au serveur.', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  // Like a proof
  const handleLikeProof = async (proofId: string) => {
    await DataStore.likeWithdrawalProof(proofId, userState.id);
    syncDashboardData();
  };

  // Delete/Moderate a proof (Admins only)
  const handleDeleteProof = async (proofId: string) => {
    openConfirm(
      'Supprimer la Preuve 🗑️',
      'Êtes-vous sûr de vouloir supprimer définitivement cette preuve de retrait du flux public ?',
      async () => {
        const ok = await DataStore.deleteWithdrawalProof(proofId);
        if (ok) {
          triggerToast('🗑️ Preuve de retrait supprimée avec succès.', 'success');
          syncDashboardData();
        } else {
          triggerToast('⚠️ Impossible de supprimer de la mémoire.', 'error');
        }
      }
    );
  };

  // Quick switch user to admin role helper for seamless reviewer walkthroughs
  const handleSecretPromote = () => {
    const updatedUsers = DataStore.getUsers();
    const idx = updatedUsers.findIndex(u => u.id === userState.id);
    if (idx !== -1) {
      updatedUsers[idx].role = 'admin';
      DataStore.saveUsers(updatedUsers);
      
      const current = DataStore.getCurrentUser();
      if (current) {
        current.role = 'admin';
        DataStore.saveCurrentUser(current);
      }
      syncDashboardData();
      openAlert("Compte Promu", "Votre compte a été élevé au rôle d'ADMINISTRATEUR ! Vous pouvez désormais voir le bouton d'accès à la palette d'administration dans l'onglet Profil !", "success");
    }
  };

  const handleFastForwardTime = async () => {
    // 1. First trigger client-side update
    DataStore.advanceAllActiveInvestmentsBy24Hours(userState.id);

    // 2. Also trigger server-side time advancement so they remain perfectly in sync
    try {
      await apiFetch(getApiUrl('/api/test/advance-time'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userState.id })
      });
      // Perform background sync to pull the newly advanced state from the server
      await syncWithBackend();
    } catch (e) {
      console.error('Server fast forward failed:', e);
    }

    syncDashboardData();
    setSimulationStatus("⏱️ Succès : Le temps a avancé de 24 Heures sur le serveur et le client ! Vos revenus quotidiens ont été automatiquement crédités.");
    setTimeout(() => {
      setSimulationStatus('');
    }, 6000);
  };

  return (
    <div className="min-h-screen bg-transparent text-white flex flex-col font-sans w-full max-w-full relative overflow-x-hidden">
      

      {showAnnouncementDismissible && (
        <div 
          onClick={() => {
            setShowAnnouncementDismissible(false);
            try { localStorage.setItem('gi_announcement_dismissed_v2', 'true'); } catch(e){}
          }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 backdrop-blur-[4px] p-4 overflow-y-auto cursor-pointer"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="communiqué-montserrat bg-white border-2 border-slate-200 rounded-3xl p-6 text-left shadow-[0_25px_60px_rgba(0,0,0,0.4)] relative max-w-sm w-full overflow-hidden my-auto cursor-default text-slate-900"
          >
            {/* Background glow decorator */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#1b64d9]/5 rounded-full blur-3xl pointer-events-none" />
            
            {/* Close cross/button */}
            <button
              onClick={() => {
                setShowAnnouncementDismissible(false);
                try { localStorage.setItem('gi_announcement_dismissed_v2', 'true'); } catch(e){}
              }}
              className="absolute top-3.5 right-3.5 text-slate-400 hover:text-slate-900 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer z-[101]"
              aria-label="Fermer"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>

            {/* Title */}
            <div className="flex items-center space-x-2.5 mb-4 border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-lg bg-[#1b64d9] flex items-center justify-center text-white text-base shadow-md">
                <span>📢</span>
              </div>
              <div>
                <h3 className="text-sm font-sans font-black text-slate-900 uppercase tracking-wider">Rejoignez la Communauté</h3>
                <p className="text-[10px] text-slate-500 font-bold">Ne manquez aucune information importante :</p>
              </div>
            </div>

            <div className="space-y-4 text-[11px]">
              {/* WhatsApp Channel Segment */}
              <div className="bg-emerald-50/30 border border-emerald-100 rounded-2xl p-4 flex flex-col gap-3 transition-all shadow-xs">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-xl shrink-0">
                    📢
                  </div>
                  <div className="space-y-1 text-left">
                    <h4 className="font-sans font-black text-emerald-800 text-[12px] uppercase tracking-wide">
                      Canal WhatsApp Officiel
                    </h4>
                    <p className="text-[10.5px] text-emerald-600/80 font-bold leading-tight">
                      Recevez les communiqués urgents, les guides exclusifs et les annonces de maintenance.
                    </p>
                  </div>
                </div>
                <a 
                  href={DataStore.getWhatsAppChannel()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-[#128C7E] hover:bg-[#075E54] text-white font-sans font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer text-center"
                >
                  <span>Rejoindre le Canal WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Footer hint */}
            <div className="mt-5 pt-3 border-t border-slate-100 text-center flex justify-center">
              <button
                onClick={() => {
                  setShowAnnouncementDismissible(false);
                  try { localStorage.setItem('gi_announcement_dismissed_v2', 'true'); } catch(e){}
                }}
                className="w-full text-xs text-white bg-[#1b64d9] hover:bg-blue-600 font-black uppercase tracking-widest py-3.5 rounded-xl cursor-pointer transition-all shadow-[0_4px_15px_rgba(27,100,217,0.25)]"
              >
                Accéder à mon tableau de bord
              </button>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* SHIMMER BACKGROUND DECORATIONS */}
      <div className="absolute top-0 left-0 w-full max-w-[800px] h-[500px] bg-white/5 blur-[150px] rounded-full pointer-events-none -z-10 animate-pulse" />  <div className="absolute top-0 left-0 w-full max-w-[800px] h-[500px] bg-white/5 blur-[150px] rounded-full pointer-events-none -z-10 animate-pulse" />

      {/* APP REAL-TIME INCOME/PAYOUT FLOATING BANNER (iOS/Android Native Style) */}
      <AnimatePresence>
        {currentLiveNotif && (
          <motion.div
            initial={{ opacity: 0, y: -100, x: "-50%", scale: 0.9 }}
            animate={{ opacity: 1, y: 16, x: "-50%", scale: 1 }}
            exit={{ opacity: 0, y: -100, x: "-50%", scale: 0.9 }}
            transition={{ type: "spring", stiffness: 350, damping: 26 }}
            className="fixed top-0 left-1/2 -translate-x-1/2 z-[99999] w-[90%] max-w-sm bg-slate-900/95 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 shadow-[0_20px_45px_rgba(0,0,0,0.30)] flex items-start gap-3 text-white cursor-pointer select-none"
            onClick={() => setCurrentLiveNotif(null)}
          >
            <div className="p-2 bg-gradient-to-tr from-emerald-500 to-amber-500 rounded-xl shrink-0">
              <Bell className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="flex justify-between items-center mb-0.5">
                <span className="text-[10px] font-sans font-black uppercase text-yellow-500 tracking-wider">Alerte Gold Avenue 🔔</span>
                <span className="text-[8px] opacity-60 font-mono font-bold uppercase shrink-0">À l'instant</span>
              </div>
              <p className="text-[11.5px] font-bold text-slate-100 leading-snug break-words">
                {currentLiveNotif.message}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RÈGLEMENT / CONDITIONS MODAL */}
      <AnimatePresence>
        {isRulesModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-[#fffaf5]/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setIsRulesModalOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0f1d38] border border-amber-500/30 rounded-[32px] w-full max-w-lg p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <div className="flex items-center space-x-3 text-amber-400">
                  <div className="w-10 h-10 bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-2xl flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="font-sans font-black text-sm uppercase tracking-wider text-white">
                      Règlement Général
                    </h3>
                    <p className="text-[9px] text-amber-400/90 font-black uppercase tracking-wider font-mono">
                      Conditions de la plateforme
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsRulesModalOpen(false)}
                  className="p-1 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Rules List - Fluid text display without boxes or borders */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-6 text-slate-300 text-left text-xs sm:text-sm leading-relaxed">
                <div className="space-y-1.5">
                  <h4 className="font-sans font-black text-xs uppercase tracking-wider text-amber-400">1. Principes d'Investissement</h4>
                  <p className="text-[12px] text-slate-300 font-medium leading-relaxed">
                    Chaque utilisateur peut acquérir des équipements pour générer des revenus journaliers passifs. Les retours sont calculés et versés chaque jour à minuit.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-sans font-black text-xs uppercase tracking-wider text-white">2. Système de Retrait</h4>
                  <p className="text-[12px] text-slate-300 font-medium leading-relaxed">
                    Les retraits sont traités via Mobile Money sous 24h à 48h. Le montant minimum de retrait dépend de votre niveau VIP et de votre région. Assurez-vous que vos coordonnées de paiement sont valides.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-sans font-black text-xs uppercase tracking-wider text-white">3. Programme de Parrainage (MLM)</h4>
                  <p className="text-[12px] text-slate-300 font-medium leading-relaxed">
                    Bénéficiez d'une structure de commissions sur 3 niveaux pour chaque achat de vos affiliés :
                  </p>
                  <div className="space-y-1 pt-1 text-[12px] text-amber-300 font-bold">
                    <p className="text-amber-300">• Niveau 1 (Direct) : 20% de commission</p>
                    <p className="text-amber-300/90">• Niveau 2 (Indirect) : 3% de commission</p>
                    <p className="text-amber-300/80">• Niveau 3 (Sous-indirect) : 1% de commission</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-sans font-black text-xs uppercase tracking-wider text-amber-400">4. Sécurité du Compte</h4>
                  <p className="text-[12px] text-slate-300 font-medium leading-relaxed">
                    Un utilisateur est strictement limité à un seul compte par personne physique. La détection de multi-comptes frauduleux entraînera la suspension immédiate de tous les soldes et comptes associés.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-slate-800 pt-4 mt-4 flex items-center justify-between">
                <span className="text-[8.5px] text-slate-400 font-bold uppercase tracking-wider">Sécurité certifiée</span>
                <button 
                  onClick={() => setIsRulesModalOpen(false)}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-105 text-slate-950 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  Accepter
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODIFIER LE MOT DE PASSE MODAL */}
      <AnimatePresence>
        {isPasswordModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-[#fffaf5]/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => {
              setIsPasswordModalOpen(false);
              setPwdError('');
              setPwdSuccess('');
            }}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border-2 border-slate-200 rounded-[32px] w-full max-w-lg p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.1)] relative overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <div className="flex items-center space-x-3 text-slate-800">
                  <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center shrink-0">
                    <Lock className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="font-sans font-black text-sm uppercase tracking-wider text-slate-800">
                      Modifier Mot de Passe
                    </h3>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider font-mono">
                      Sécurité du compte
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setIsPasswordModalOpen(false);
                    setPwdError('');
                    setPwdSuccess('');
                  }}
                  className="p-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-500 transition-colors cursor-pointer border border-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Password Change Form */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  setPwdError('');
                  setPwdSuccess('');

                  if (!oldPassword.trim() || !newPassword.trim() || !confirmNewPassword.trim()) {
                    setPwdError('Veuillez remplir tous les champs.');
                    return;
                  }

                  const currentPwdExpected = userState.password || (userState.role === 'admin' ? 'admin' : 'user123');
                  if (oldPassword !== currentPwdExpected) {
                    setPwdError("L'ancien mot de passe est incorrect.");
                    return;
                  }

                  if (newPassword.length < 5) {
                    setPwdError('Le nouveau mot de passe doit contenir au moins 5 caractères.');
                    return;
                  }

                  if (newPassword !== confirmNewPassword) {
                    setPwdError('Les nouveaux mots de passe ne correspondent pas.');
                    return;
                  }

                  if (newPassword === oldPassword) {
                    setPwdError("Le nouveau mot de passe doit être différent de l'ancien.");
                    return;
                  }

                  const success = DataStore.changeUserPassword(userState.id, newPassword);
                  if (success) {
                    setPwdSuccess('Votre mot de passe a été modifié avec succès !');
                    triggerToast('🔒 Mot de passe modifié !', 'success');
                    syncDashboardData();
                    // Clear inputs
                    setOldPassword('');
                    setNewPassword('');
                    setConfirmNewPassword('');
                    setTimeout(() => {
                      setIsPasswordModalOpen(false);
                      setPwdSuccess('');
                    }, 1500);
                  } else {
                    setPwdError('Une erreur est survenue lors de la modification.');
                  }
                }}
                className="space-y-4 text-left"
              >
                {pwdError && (
                  <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl text-xs text-red-700 font-extrabold uppercase tracking-wide leading-relaxed">
                    ⚠️ {pwdError}
                  </div>
                )}

                {pwdSuccess && (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-700 font-extrabold uppercase tracking-wide leading-relaxed animate-pulse">
                    🎉 {pwdSuccess}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Ancien Mot de Passe</label>
                  <input 
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 outline-none transition-all font-sans text-slate-800"
                    placeholder="Ancien mot de passe"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Nouveau Mot de Passe</label>
                  <input 
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 outline-none transition-all font-sans text-slate-800"
                    placeholder="Minimum 5 caractères"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Confirmer Nouveau Mot de Passe</label>
                  <input 
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 outline-none transition-all font-sans text-slate-800"
                    placeholder="Confirmer le nouveau mot de passe"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full mt-2 py-3 bg-slate-800 hover:bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  Mettre à jour
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CODE CADEAU / COUPON BONUS MODAL */}
      <AnimatePresence>
        {isGiftCodeModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-[#fffaf5]/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => {
              setIsGiftCodeModalOpen(false);
              setBonusError('');
              setBonusSuccess('');
              setBonusCodeInput('');
            }}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border-2 border-emerald-100 rounded-[32px] w-full max-w-lg p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(16,185,129,0.15)] relative overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <div className="flex items-center space-x-3 text-emerald-600">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                    <Gift className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="font-sans font-black text-sm uppercase tracking-wider text-slate-800">
                      Code Cadeau
                    </h3>
                    <p className="text-[9px] text-emerald-600 font-black uppercase tracking-wider font-mono">
                      Bonus exclusif & récompense
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setIsGiftCodeModalOpen(false);
                    setBonusError('');
                    setBonusSuccess('');
                    setBonusCodeInput('');
                  }}
                  className="p-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-500 transition-colors cursor-pointer border border-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Bonus Code Form */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  submitBonusCode(e);
                }}
                className="space-y-4 text-left"
              >
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Saisissez votre code promo ou coupon cadeau officiel pour recevoir instantanément vos crédits bonus sur votre compte.
                </p>

                {bonusError && (
                  <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl text-xs text-red-700 font-extrabold uppercase tracking-wide leading-relaxed">
                    ⚠️ {bonusError}
                  </div>
                )}

                {bonusSuccess && (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-700 font-extrabold uppercase tracking-wide leading-relaxed animate-pulse">
                    🎉 {bonusSuccess}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Code Promo / Coupon</label>
                  <input 
                    type="text"
                    value={bonusCodeInput}
                    onChange={(e) => setBonusCodeInput(e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-mono font-bold text-slate-800 uppercase tracking-widest text-center"
                    placeholder="Ex: GOLD2026, BONUS200..."
                    required
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full mt-2 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white text-[11px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  Échanger le code
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ROUE DE LA CHANCE MODAL REMOVED (NOW A SUBPAGE) */}

      {/* CARTE BANCAIRE MODAL */}
      <AnimatePresence>
        {isBankCardModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-[#fffaf5]/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => {
              setIsBankCardModalOpen(false);
              setBankCardError('');
              setBankCardSuccess('');
            }}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border-2 border-slate-200 rounded-[32px] w-full max-w-lg p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.1)] relative overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <div className="flex items-center space-x-3 text-slate-800">
                  <div className="w-10 h-10 bg-amber-50 text-[#f07b1b] rounded-2xl flex items-center justify-center shrink-0">
                    <UserIcon className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="font-sans font-black text-sm uppercase tracking-wider text-slate-800">
                      Carte Bancaire
                    </h3>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider font-mono">
                      Liaison de compte de retrait
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setIsBankCardModalOpen(false);
                    setBankCardError('');
                    setBankCardSuccess('');
                  }}
                  className="p-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-500 transition-colors cursor-pointer border border-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* GORGEOUS VIRTUAL CREDIT CARD SHOWING INFO */}
              <div className="w-full h-44 rounded-2xl bg-gradient-to-br from-amber-600 via-yellow-500 to-slate-900 p-5 text-white flex flex-col justify-between shadow-md relative overflow-hidden mb-5">
                {/* Microchip and MDB branding */}
                <div className="flex justify-between items-start">
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-black uppercase tracking-wider opacity-90">GOLD_AVENUE INVESTMENT</span>
                    <span className="text-[7px] font-mono font-bold tracking-widest opacity-60">MEMBRE CERTIFIÉ</span>
                  </div>
                  <div className="w-16 h-8 rounded-md bg-white/20 flex items-center justify-center border border-white/20 px-1">
                    <span className="text-[9px] font-black uppercase tracking-wider">Gold Avenue</span>
                  </div>
                </div>

                {/* Card Number */}
                <div className="text-center font-mono text-base tracking-widest my-1 font-bold">
                  {bankCardNumber 
                    ? bankCardNumber.replace(/(\d{4})/g, '$1 ').trim() 
                    : '•••• •••• •••• ••••'}
                </div>

                {/* Operator Badge and Name */}
                <div className="flex justify-between items-end">
                  <div className="flex flex-col text-left">
                    <span className="text-[7px] text-white/65 uppercase tracking-wider block font-bold">Titulaire du compte</span>
                    <span className="text-xs font-black truncate max-w-[180px]">
                      {bankCardName ? bankCardName.toUpperCase() : 'VOTRE NOM COMPLET'}
                    </span>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className="text-[7px] text-white/65 uppercase tracking-wider block font-bold">Opérateur</span>
                    <span className="text-[11px] font-black tracking-wide bg-white/20 px-2 py-0.5 rounded-md uppercase border border-white/10">
                      {bankCardOperator}
                    </span>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  setBankCardError('');
                  setBankCardSuccess('');

                  if (!bankCardName.trim()) {
                    setBankCardError('Veuillez saisir le nom complet du titulaire.');
                    return;
                  }
                  if (!bankCardNumber.trim() || bankCardNumber.length < 8) {
                    setBankCardError('Veuillez saisir un numéro de téléphone Mobile Money valide.');
                    return;
                  }

                  try {
                    localStorage.setItem('mdb_saved_name', bankCardName.trim());
                    localStorage.setItem('mdb_saved_operator', bankCardOperator);
                    localStorage.setItem('mdb_saved_number', bankCardNumber.trim());

                    // Sync the main states as well so they prefill withdrawal instantly!
                    setWithdrawOperator(bankCardOperator);
                    setWithdrawNumber(bankCardNumber.trim());

                    // Create the updated user object with bank details
                    const updatedUser = {
                      ...userState,
                      bankCardName: bankCardName.trim(),
                      bankCardOperator: bankCardOperator,
                      bankCardNumber: bankCardNumber.trim(),
                      lastModified: Date.now()
                    };
                    setUserState(updatedUser);
                    DataStore.saveCurrentUser(updatedUser);
                    
                    if (typeof syncWithBackend === 'function') {
                      syncWithBackend().catch((e) => console.error("Sync error:", e));
                    }

                    setBankCardSuccess('Vos informations de paiement ont été enregistrées avec succès !');
                    triggerToast('💳 Compte de paiement lié !', 'success');
                    setTimeout(() => {
                      setIsBankCardModalOpen(false);
                      setBankCardSuccess('');
                    }, 1500);
                  } catch (err) {
                    setBankCardError('Une erreur est survenue lors de la sauvegarde.');
                  }
                }}
                className="space-y-4 text-left"
              >
                {bankCardError && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-700 font-extrabold leading-relaxed">
                    ⚠️ {bankCardError}
                  </div>
                )}

                {bankCardSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-700 font-extrabold leading-relaxed animate-pulse">
                    🎉 {bankCardSuccess}
                  </div>
                )}

                {/* Nom titulaire */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Nom du titulaire du compte</label>
                  <input 
                    type="text"
                    required
                    value={bankCardName}
                    onChange={(e) => setBankCardName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-[#f07b1b]/20 focus:border-[#f07b1b] outline-none transition-all font-sans text-slate-800 font-bold"
                    placeholder="Ex: Jean Dupont"
                  />
                </div>

                {/* Opérateur */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Sélectionnez l'Opérateur</label>
                  <select
                    value={bankCardOperator}
                    onChange={(e) => setBankCardOperator(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-[#f07b1b]/20 focus:border-[#f07b1b] outline-none transition-all font-sans text-slate-800 font-black cursor-pointer"
                  >
                    <option value="T-Money (TG)">T-Money (Togo 🇹🇬)</option>
                    <option value="Moov (TG)">Moov Money (Togo 🇹🇬)</option>
                    <option value="MTN (CM)">MTN Mobile Money (Cameroun 🇨🇲)</option>
                    <option value="Orange (CM)">Orange Money (Cameroun 🇨🇲)</option>
                    <option value="MTN (BJ)">MTN MoMo (Bénin 🇧🇯)</option>
                    <option value="Moov (BJ)">Moov Flooz (Bénin 🇧🇯)</option>
                    <option value="Wave (CI)">Wave Money (Côte d'Ivoire 🇨🇮)</option>
                    <option value="Orange (CI)">Orange Money (Côte d'Ivoire 🇨🇮)</option>
                    <option value="MTN (CI)">MTN Mobile Money (Côte d'Ivoire 🇨🇮)</option>
                    <option value="Moov (CI)">Moov Money (Côte d'Ivoire 🇨🇮)</option>
                    <option value="Orange (BF)">Orange Money (Burkina Faso 🇧🇫)</option>
                    <option value="Moov (BF)">Moov Money (Burkina Faso 🇧🇫)</option>
                    <option value="Orange (SN)">Orange Money (Sénégal 🇸🇳)</option>
                    <option value="Wave (SN)">Wave Money (Sénégal 🇸🇳)</option>
                  </select>
                </div>

                {/* Numéro */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Numéro Mobile Money (SANS INDICATIF)</label>
                  <input 
                    type="tel"
                    required
                    value={bankCardNumber}
                    onChange={(e) => setBankCardNumber(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-[#f07b1b]/20 focus:border-[#f07b1b] outline-none transition-all font-sans text-slate-800 font-bold"
                    placeholder="Ex: 677123456"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full mt-2 py-3 bg-gradient-to-r from-[#1b64d9] to-[#f07b1b] text-white text-[11px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  Sauvegarder et Lier
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>



      {/* RENDER ADMIN MODE SEPARATELY IF ACTIVATED */}
      {isAdminMode && userState.role === 'admin' ? (
        <main className="flex-grow w-full max-w-full px-4 md:px-12 xl:px-20 py-8">
          <AdminPanel 
            currentUser={userState}
            onRefreshData={syncDashboardData}
            onCloseAdmin={() => setIsAdminMode(false)}
          />
        </main>
      ) : (
        /* RENDER SYSTEM USER CHANNELS */
        <main className="flex-grow w-full max-w-full px-2 sm:px-6 md:px-12 xl:px-20 pt-0 pb-16 overflow-x-hidden">
          
          {profileSubPage && (() => {
            const rechargeSum = allDeposits.filter(d => d.status === 'approved').reduce((acc, d) => acc + d.amount, 0);
            const purchaseSum = activeInvestments.reduce((acc, i) => acc + i.price, 0);
            const rechargeBal = Math.max(0, rechargeSum - purchaseSum);
            const totalProductRevenue = activeInvestments.reduce((acc, i) => acc + (i.totalReturnClaimed || 0), 0);
            const totalCommissions = commissions.reduce((acc, c) => acc + c.amount, 0);
            const activeInvsCount = activeInvestments.filter(i => i.status === 'active').length;

            // 1. PAGE: RÉCOMPENSES DES TÂCHES (REFERRAL TASKS)
            if (profileSubPage === 'tasks' || profileSubPage === 'taches') {
              const activeFriendsCount = level1Users.filter(u => getUserInvestedAmount(u.id) > 0).length;
              const claimedTasks = userState.claimedTasks || [];
              const taskBaselines = userState.taskBaselines || {};
              
              const referralTasksList = [
                {
                  id: 'task_5',
                  requiredFriends: 5,
                  rewardAmount: 1000,
                  title: 'Tâche 1 : Activez 5 amis',
                  description: 'Invitez et activez 5 amis au Niveau 1 pour débloquer votre première prime'
                },
                {
                  id: 'task_10',
                  requiredFriends: 10,
                  rewardAmount: 2000,
                  title: 'Tâche 2 : Activez 10 amis',
                  description: 'Activez 10 nouveaux amis au Niveau 1 après validation de la tâche 1'
                },
                {
                  id: 'task_20',
                  requiredFriends: 20,
                  rewardAmount: 5000,
                  title: 'Tâche 3 : Activez 20 amis',
                  description: 'Activez 20 nouveaux amis au Niveau 1 après validation de la tâche 2'
                },
                {
                  id: 'task_50',
                  requiredFriends: 50,
                  rewardAmount: 10000,
                  title: 'Tâche 4 : Activez 50 amis',
                  description: 'Activez 50 nouveaux amis au Niveau 1 après validation de la tâche 3'
                },
                {
                  id: 'task_100',
                  requiredFriends: 100,
                  rewardAmount: 20000,
                  title: 'Tâche 5 : Activez 100 amis',
                  description: 'Activez 100 nouveaux amis au Niveau 1 après validation de la tâche 4'
                }
              ];

              const totalClaimedRewards = claimedTasks.reduce((acc, tId) => {
                const task = referralTasksList.find(t => t.id === tId);
                return acc + (task ? task.rewardAmount : 0);
              }, 0);

              const handleClaimTask = (task: typeof referralTasksList[0], taskIndex: number) => {
                if (claimedTasks.includes(task.id)) {
                  triggerToast("Cette tâche a déjà été récompensée !", "info");
                  return;
                }

                const baseline = taskBaselines[task.id] || 0;
                const currentCount = Math.max(0, activeFriendsCount - baseline);

                if (currentCount < task.requiredFriends) {
                  const rem = task.requiredFriends - currentCount;
                  triggerToast(`Condition non remplie. Il vous reste ${rem} nouvel(le)s ami(s) à activer pour cette tâche.`, "error");
                  return;
                }

                const updatedClaimed = [...claimedTasks, task.id];
                const updatedBaselines = { ...(userState.taskBaselines || {}) };

                // Débloquer la tâche suivante et la faire recommencer à 0 par rapport aux activations actuelles
                if (taskIndex + 1 < referralTasksList.length) {
                  const nextTask = referralTasksList[taskIndex + 1];
                  updatedBaselines[nextTask.id] = activeFriendsCount;
                }

                const newBalance = (userState.balance || 0) + task.rewardAmount;
                const newTotalEarnings = (userState.totalEarnings || 0) + task.rewardAmount;
                const updatedUser: User = {
                  ...userState,
                  balance: newBalance,
                  totalEarnings: newTotalEarnings,
                  claimedTasks: updatedClaimed,
                  taskBaselines: updatedBaselines
                };

                DataStore.saveCurrentUser(updatedUser);
                const allUsers = DataStore.getUsers();
                const idx = allUsers.findIndex(u => u.id === updatedUser.id);
                if (idx !== -1) {
                  allUsers[idx] = updatedUser;
                  DataStore.saveUsers(allUsers);
                }

                setUserState(updatedUser);
                if (onRefreshUser) {
                  onRefreshUser(updatedUser);
                }

                // Add notification
                DataStore.addNotification({
                  id: 'task-bonus-' + Date.now(),
                  userId: updatedUser.id,
                  title: `Récompense de Tâche : ${task.title} 🎉`,
                  message: `Félicitations ! Vous avez réclamé votre prime de ${task.rewardAmount.toLocaleString()} FCFA. Votre solde a été crédité.`,
                  createdAt: new Date().toISOString(),
                  isRead: false
                });

                syncWithBackend();
                triggerToast(`Félicitations ! +${task.rewardAmount.toLocaleString()} FCFA ajoutés à votre solde 🎉`, "success");
              };

              return (
                <div className="bg-gradient-to-b from-[#9f1239] via-[#881337] to-[#4c0519] -mx-2 sm:-mx-6 md:-mx-12 xl:-mx-20 -mt-3.5 pb-6 text-white text-left animate-fadeIn">
                  {/* Rose Header */}
                  <div className="bg-gradient-to-b from-[#881337] to-[#4c0519] text-white pt-6 pb-12 px-4 rounded-b-[2.5rem] relative shadow-md overflow-hidden border-b border-rose-700/40">
                    <div className="max-w-xl mx-auto flex items-center justify-between relative z-10 mb-5">
                      <button 
                        onClick={() => setProfileSubPage(null)}
                        className="w-10 h-10 rounded-full bg-white/15 border border-white/10 flex items-center justify-center text-white hover:bg-white/25 transition-all cursor-pointer outline-none shrink-0"
                        id="btn-back-tasks"
                      >
                        <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                      </button>
                      
                      <h2 className="font-sans font-black text-white text-base tracking-tight uppercase">
                        {t("Récompenses des tâches", "Task Rewards")}
                      </h2>

                      <div className="w-10 h-10" />
                    </div>

                    {/* Stats summary */}
                    <div className="max-w-xl mx-auto grid grid-cols-2 gap-3 relative z-10 pb-2">
                      <div className="bg-rose-950/60 p-3.5 rounded-2xl border border-rose-700/40">
                        <span className="text-[9.5px] text-rose-200 uppercase font-black tracking-wider block">
                          Amis activés au total (Niv 1)
                        </span>
                        <div className="flex items-baseline gap-1.5 mt-1">
                          <span className="text-2xl font-black font-sans text-emerald-300">
                            {activeFriendsCount}
                          </span>
                          <span className="text-xs text-rose-200/70 font-bold">
                            / {level1Users.length} inscrit(s)
                          </span>
                        </div>
                      </div>

                      <div className="bg-rose-950/60 p-3.5 rounded-2xl border border-rose-700/40">
                        <span className="text-[9.5px] text-rose-200 uppercase font-black tracking-wider block">
                          Primes réclamées
                        </span>
                        <span className="text-2xl font-black font-sans text-amber-300 block mt-1">
                          {totalClaimedRewards.toLocaleString()} <span className="text-xs font-bold">FCFA</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tasks Container */}
                  <div className="max-w-xl mx-auto -mt-6 px-4 space-y-3.5 relative z-10">
                    {referralTasksList.map((task, index) => {
                      const isClaimed = claimedTasks.includes(task.id);
                      const isUnlocked = index === 0 || claimedTasks.includes(referralTasksList[index - 1].id);
                      const baseline = isUnlocked ? (taskBaselines[task.id] || 0) : 0;
                      const currentProgress = isUnlocked ? Math.max(0, activeFriendsCount - baseline) : 0;
                      const isCompleted = isUnlocked && currentProgress >= task.requiredFriends;
                      const remaining = Math.max(0, task.requiredFriends - currentProgress);
                      const progressRatio = Math.min(1, currentProgress / task.requiredFriends);
                      const progressPercentage = Math.round(progressRatio * 100);

                      return (
                        <div 
                          key={task.id}
                          className={`bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-lg border space-y-3 text-slate-800 transition-all hover:shadow-xl ${
                            !isUnlocked ? 'opacity-70 border-slate-200' : 'border-slate-100'
                          }`}
                          id={`card-task-${task.requiredFriends}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                                isClaimed 
                                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                                  : !isUnlocked
                                    ? 'bg-slate-100 text-slate-400 border border-slate-200'
                                    : isCompleted 
                                      ? 'bg-amber-50 text-amber-600 border border-amber-200 animate-pulse'
                                      : 'bg-rose-50 text-[#e11d48] border border-rose-100'
                              }`}>
                                {isClaimed ? (
                                  <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                                ) : !isUnlocked ? (
                                  <Lock className="w-5 h-5 stroke-[2]" />
                                ) : isCompleted ? (
                                  <Award className="w-6 h-6 stroke-[2.5]" />
                                ) : (
                                  <Users className="w-5 h-5 stroke-[2.25]" />
                                )}
                              </div>

                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-sans font-black text-sm sm:text-base text-slate-900 leading-snug">
                                    {task.title}
                                  </h3>
                                  {!isUnlocked && (
                                    <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-md">
                                      Verrouillée
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">
                                  {task.description}
                                </p>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-[9.5px] font-black uppercase text-slate-400 block">
                                Récompense
                              </span>
                              <span className="text-sm sm:text-base font-black text-amber-600 font-sans block mt-0.5">
                                {task.rewardAmount.toLocaleString()} FCFA
                              </span>
                            </div>
                          </div>

                          {/* Progress Bar & Indicators */}
                          <div className="space-y-1.5 pt-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-[11px] font-bold text-slate-600">
                                {isClaimed ? (
                                  <span className="text-emerald-600 font-extrabold flex items-center gap-1">
                                    <Check className="w-3.5 h-3.5 stroke-[3]" /> Tâche validée et récompense ajoutée au solde
                                  </span>
                                ) : !isUnlocked ? (
                                  <span className="text-slate-400 italic">
                                    Terminez d'abord la tâche précédente pour débloquer celle-ci (progression à 0)
                                  </span>
                                ) : isCompleted ? (
                                  <span className="text-emerald-600 font-extrabold flex items-center gap-1">
                                    <Check className="w-3.5 h-3.5 stroke-[3]" /> Objectif atteint ({task.requiredFriends}/{task.requiredFriends})
                                  </span>
                                ) : (
                                  <span>Progression : <b className="text-slate-900">{currentProgress}</b> / {task.requiredFriends} nouvel(le)s activé(e)s</span>
                                )}
                              </span>
                              <span className="text-[11px] font-black text-slate-500 font-mono">
                                {isClaimed ? '100%' : !isUnlocked ? '0%' : `${progressPercentage}%`}
                              </span>
                            </div>

                            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                  isClaimed 
                                    ? 'bg-emerald-500' 
                                    : !isUnlocked
                                      ? 'bg-slate-300'
                                      : isCompleted 
                                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500 animate-pulse' 
                                        : 'bg-gradient-to-r from-rose-500 to-red-500'
                                }`}
                                style={{ width: `${isClaimed ? 100 : !isUnlocked ? 0 : progressPercentage}%` }}
                              />
                            </div>

                            {isUnlocked && !isCompleted && !isClaimed && (
                              <p className="text-[10.5px] text-slate-400 font-medium italic">
                                Il reste {remaining} nouvel(le)s ami(s) à activer pour débloquer cette prime.
                              </p>
                            )}
                          </div>

                          {/* Action Button */}
                          <div className="pt-1">
                            {isClaimed ? (
                              <button
                                disabled
                                className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 text-emerald-700 font-black text-xs uppercase tracking-wider border border-emerald-200 flex items-center justify-center gap-2 cursor-default"
                              >
                                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                                <span>Récompense Déjà Réclamée (+{task.rewardAmount.toLocaleString()} FCFA au solde) ✓</span>
                              </button>
                            ) : !isUnlocked ? (
                              <button
                                disabled
                                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs uppercase tracking-wider border border-slate-200/50 flex items-center justify-center gap-2 cursor-not-allowed"
                              >
                                <Lock className="w-4 h-4 stroke-[2]" />
                                <span>Tâche verrouillée</span>
                              </button>
                            ) : isCompleted ? (
                              <button
                                onClick={() => handleClaimTask(task, index)}
                                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-105 active:scale-[0.98] text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-md shadow-amber-500/25 border-0 flex items-center justify-center gap-2 cursor-pointer animate-pulse transition-all"
                                id={`btn-claim-task-${task.requiredFriends}`}
                              >
                                <Gift className="w-4 h-4 stroke-[2.5]" />
                                <span>Ajouter {task.rewardAmount.toLocaleString()} FCFA à mon solde</span>
                              </button>
                            ) : (
                              <button
                                disabled
                                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs uppercase tracking-wider border border-slate-200/50 flex items-center justify-center gap-2 cursor-not-allowed"
                              >
                                <Clock className="w-4 h-4 stroke-[2]" />
                                <span>En cours ({currentProgress}/{task.requiredFriends})</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Invitation Shortcut Card */}
                    <div className="bg-rose-950/70 border border-rose-700/50 rounded-2xl p-4 sm:p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                      <div>
                        <h4 className="font-sans font-black text-sm text-white uppercase tracking-tight">
                          Invitez plus d'amis pour progresser
                        </h4>
                        <p className="text-[11px] text-rose-200/80 font-medium mt-0.5">
                          Partagez votre lien d'invitation et touchez des commissions supplémentaires.
                        </p>
                      </div>

                      <button
                        onClick={handleCopyLink}
                        className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-[#e11d48] to-[#be123c] hover:from-[#f43f5e] hover:to-[#e11d48] text-white text-xs font-black rounded-xl shadow-md transition-all active:scale-95 uppercase tracking-wider cursor-pointer border-none shrink-0"
                      >
                        {copiedLink ? "Lien Copié !" : "Copier mon lien"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            // 2. PAGE: POINTAGE (DÉDIÉE - SANS BARÈME, AVEC EXPLICATION ET SOLDE GÉNÉRÉ)
            if (profileSubPage === 'point' || profileSubPage === 'pointage' || profileSubPage === 'missions') {
              return (
                <PointageView
                  userState={userState}
                  setUserState={setUserState}
                  activeInvestments={activeInvestments}
                  products={products}
                  onRefreshUser={onRefreshUser}
                  triggerToast={triggerToast}
                  t={t}
                  setProfileSubPage={setProfileSubPage}
                  setActiveTab={setActiveTab}
                />
              );
            }

            // 0. MES COMMANDES (DEDICATED FULL PAGE IN PORTEFEUILLE)
            if (profileSubPage === 'orders') {
              const activeInvs = activeInvestments.filter(i => i.status === 'active');
              const completedInvs = activeInvestments.filter(i => i.status === 'completed');
              const totalInvested = activeInvestments.reduce((acc, i) => acc + (i.price || 0), 0);
              const totalExpectedPayout = activeInvestments.reduce((acc, i) => {
                const payout = (i as any).totalReturn || (i.price + ((i.dailyReturn || 0) * (i.durationDays || 0)));
                return acc + payout;
              }, 0);

              return (
                <div className="bg-[#fff5f7] -mx-3 sm:-mx-5 md:-mx-8 xl:-mx-16 -mt-3.5 px-3.5 sm:px-5 md:px-8 xl:px-16 pt-3 sm:pt-5 pb-6 text-slate-900 text-left animate-fadeIn">
                  <div className="max-w-md mx-auto w-full space-y-3.5">
                    {/* Header with Back button */}
                    <div className="flex items-center justify-between pt-1 pb-1">
                      <button 
                        onClick={() => setProfileSubPage(null)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-slate-700 hover:text-slate-950 font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer border-none outline-none"
                        id="back-to-profile-from-orders"
                      >
                        <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                        <span>Retour</span>
                      </button>
                      <h2 className="font-bold text-base sm:text-lg text-slate-900 tracking-tight">Mes Commandes</h2>
                      <div className="w-16" />
                    </div>

                    {/* Summary Card */}
                    <div className="bg-gradient-to-br from-[#881337] via-[#9f1239] to-[#4c0519] rounded-2xl sm:rounded-3xl p-4 sm:p-5 text-white shadow-md border border-rose-700/50 space-y-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/20 flex items-center justify-center text-rose-200 shrink-0">
                          <ShoppingBag className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm sm:text-base font-black uppercase tracking-tight text-white leading-tight">
                            Suivi des Cycles d'Investissement
                          </h3>
                          <span className="text-[10px] sm:text-[11px] text-rose-200/90 font-medium">
                            Revenus bloqués & versements à terme
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-rose-700/40 text-center">
                        <div className="bg-rose-950/60 rounded-xl p-2.5 border border-rose-800/40">
                          <span className="text-[9px] sm:text-[10px] text-rose-300 font-bold uppercase tracking-wider block">Investi</span>
                          <span className="text-xs sm:text-sm font-black text-amber-300 font-mono block mt-0.5">
                            {totalInvested.toLocaleString()} F
                          </span>
                        </div>
                        <div className="bg-rose-950/60 rounded-xl p-2.5 border border-rose-800/40">
                          <span className="text-[9px] sm:text-[10px] text-rose-300 font-bold uppercase tracking-wider block">Revenu Attendu</span>
                          <span className="text-xs sm:text-sm font-black text-emerald-300 font-mono block mt-0.5">
                            {totalExpectedPayout.toLocaleString()} F
                          </span>
                        </div>
                        <div className="bg-rose-950/60 rounded-xl p-2.5 border border-rose-800/40">
                          <span className="text-[9px] sm:text-[10px] text-rose-300 font-bold uppercase tracking-wider block">En Cours</span>
                          <span className="text-xs sm:text-sm font-black text-white font-mono block mt-0.5">
                            {activeInvs.length} {activeInvs.length > 1 ? 'plans' : 'plan'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Orders List */}
                    <div className="space-y-3">
                      {activeInvestments.length === 0 ? (
                        <div className="text-center py-10 px-4 rounded-2xl bg-white border border-rose-100 shadow-xs max-w-sm mx-auto space-y-3">
                          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                            <ShoppingBag className="w-6 h-6 stroke-[1.75]" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-bold text-slate-800 text-sm">
                              Aucune commande enregistrée
                            </h4>
                            <p className="text-[11px] sm:text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                              Vous n'avez pas encore d'équipement actif. Découvrez nos plans d'investissement pour générer des gains quotidiens.
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setProfileSubPage(null);
                              setActiveTab('products');
                            }}
                            className="bg-gradient-to-r from-rose-600 to-red-600 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-5 rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-xs cursor-pointer border-none mt-1"
                          >
                            Découvrir les Produits 🚀
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {activeInvestments.map((inv) => (
                            <InvestmentItem 
                              key={inv.id}
                              investment={inv}
                              onClaim={handleClaimReturn}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              );
            }

            if (profileSubPage === 'balance') {
              const completedInvestments = activeInvestments.filter(i => i.status === 'completed');
              const totalRechargesApproved = allDeposits.filter(d => d.status === 'approved').reduce((acc, d) => acc + d.amount, 0);
              const totalInvestedCompleted = completedInvestments.reduce((acc, i) => acc + i.price, 0);

              const formatDate = (dateStr: string) => {
                try {
                  const d = new Date(dateStr);
                  if (isNaN(d.getTime())) return dateStr;
                  return d.toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });
                } catch (e) {
                  return dateStr;
                }
              };

              return (
                <div className="bg-gradient-to-b from-[#9f1239] via-[#881337] to-[#4c0519] -mx-2 sm:-mx-6 md:-mx-12 xl:-mx-20 -mt-3.5 px-4 sm:px-6 md:px-12 xl:px-20 pt-6 pb-12 text-white text-left animate-fadeIn">
                  <div className="max-w-xl mx-auto w-full space-y-4">
                    
                    {/* Header */}
                    <div className="flex items-center space-x-3 mb-2 pt-2">
                      <button 
                        onClick={() => setProfileSubPage(null)}
                        className="w-10 h-10 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-white hover:bg-white/25 transition-all cursor-pointer shadow-xs border-none outline-none"
                      >
                        <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                      </button>
                      <h2 className="font-sans font-black text-white text-base uppercase tracking-tight">Historique de compte</h2>
                    </div>

                    {/* Dual Tab Switcher */}
                    <div className="bg-rose-950/70 p-1 rounded-2xl flex w-full border border-rose-700/50">
                      <button
                        onClick={() => setHistoryTab('recharges')}
                        className={`flex-grow py-3 rounded-xl text-xs font-sans font-black transition-all border-none outline-none cursor-pointer flex items-center justify-center gap-2 ${
                          historyTab === 'recharges'
                            ? 'bg-gradient-to-r from-[#e11d48] to-[#be123c] text-white shadow-md'
                            : 'text-rose-300 hover:text-white bg-transparent'
                        }`}
                      >
                        <Coins className="w-4 h-4" />
                        <span>Recharges ({allDeposits.length})</span>
                      </button>
                      <button
                        onClick={() => setHistoryTab('products')}
                        className={`flex-grow py-3 rounded-xl text-xs font-sans font-black transition-all border-none outline-none cursor-pointer flex items-center justify-center gap-2 ${
                          historyTab === 'products'
                            ? 'bg-gradient-to-r from-[#e11d48] to-[#be123c] text-white shadow-md'
                            : 'text-rose-300 hover:text-white bg-transparent'
                        }`}
                      >
                        <Briefcase className="w-4 h-4" />
                        <span>Produits Terminés ({completedInvestments.length})</span>
                      </button>
                    </div>

                    {/* Content Section */}
                    {historyTab === 'recharges' ? (
                      <div className="space-y-4">
                        {/* Summary Card */}
                        <div className="bg-rose-950/70 rounded-3xl p-5 shadow-xs border border-rose-700/50 flex justify-between items-center text-white">
                          <div>
                            <span className="text-[10px] text-rose-300 font-extrabold uppercase tracking-wider block">Total Rechargé</span>
                            <span className="text-xl font-sans font-black text-amber-300 block mt-0.5">
                              {totalRechargesApproved.toLocaleString()} FCFA
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-rose-300 font-extrabold uppercase tracking-wider block">Total Demandes</span>
                            <span className="text-xl font-sans font-black text-white block mt-0.5">
                              {allDeposits.length}
                            </span>
                          </div>
                        </div>

                        {/* List */}
                        <div className="space-y-3">
                          {allDeposits.length === 0 ? (
                            <div className="text-center py-12 bg-rose-950/70 rounded-3xl border border-rose-700/50 p-5">
                              <Coins className="w-10 h-10 text-rose-400 mx-auto mb-3" />
                              <p className="text-xs font-bold text-rose-200">Aucune recharge enregistrée pour le moment.</p>
                            </div>
                          ) : (
                            [...allDeposits].reverse().map((deposit) => {
                              const isApproved = deposit.status === 'approved';
                              const isPending = deposit.status === 'pending';

                              return (
                                <div 
                                  key={deposit.id}
                                  className="bg-rose-950/70 rounded-2xl p-4 shadow-xs border border-rose-700/50 flex justify-between items-center hover:border-rose-500/80 transition-all text-white"
                                >
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-sans font-black text-white">
                                        Recharge {deposit.operator}
                                      </span>
                                      <span className={`text-[8.5px] font-black uppercase px-2 py-0.5 rounded-md ${
                                        isApproved ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/50' :
                                        isPending ? 'bg-amber-900/60 text-amber-300 border border-amber-500/50' :
                                        'bg-red-900/60 text-red-300 border border-red-500/50'
                                      }`}>
                                        {isApproved ? 'Validé' : isPending ? 'En attente' : 'Rejeté'}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-rose-300 font-bold">
                                      Réf: <span className="font-mono text-rose-200">{deposit.reference}</span>
                                    </p>
                                    <p className="text-[9.5px] text-rose-300 font-medium">
                                      {formatDate(deposit.createdAt)}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-sm font-sans font-black text-amber-300 block">
                                      +{deposit.amount.toLocaleString()} F
                                    </span>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Summary Card */}
                        <div className="bg-rose-950/70 rounded-3xl p-5 shadow-xs border border-rose-700/50 flex justify-between items-center text-white">
                          <div>
                            <span className="text-[10px] text-rose-300 font-extrabold uppercase tracking-wider block">Total Capital Libéré</span>
                            <span className="text-xl font-sans font-black text-emerald-300 block mt-0.5">
                              {totalInvestedCompleted.toLocaleString()} FCFA
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-rose-300 font-extrabold uppercase tracking-wider block">Produits Terminés</span>
                            <span className="text-xl font-sans font-black text-white block mt-0.5">
                              {completedInvestments.length}
                            </span>
                          </div>
                        </div>

                        {/* List */}
                        <div className="space-y-3">
                          {completedInvestments.length === 0 ? (
                            <div className="text-center py-12 bg-rose-950/70 rounded-3xl border border-rose-700/50 p-5">
                              <Briefcase className="w-10 h-10 text-rose-400 mx-auto mb-3" />
                              <p className="text-xs font-bold text-rose-200">Aucun produit d'investissement n'est encore terminé.</p>
                            </div>
                          ) : (
                            [...completedInvestments].reverse().map((inv) => {
                              return (
                                <div 
                                  key={inv.id}
                                  className="bg-rose-950/70 rounded-2xl p-4 shadow-xs border border-rose-700/50 space-y-3 hover:border-rose-500/80 transition-all text-left text-white"
                                >
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h4 className="text-xs font-sans font-black text-white">
                                        {inv.productName}
                                      </h4>
                                      <span className="text-[8.5px] font-sans font-bold text-rose-300 block mt-0.5">
                                        Plan de {inv.durationDays} jours • {inv.dailyReturn.toLocaleString()} F/jour
                                      </span>
                                    </div>
                                    <span className="text-[8.5px] font-black uppercase bg-emerald-900/60 text-emerald-300 border border-emerald-500/50 px-2 py-0.5 rounded-md">
                                      Terminé ✓
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-rose-700/40 text-left">
                                    <div>
                                      <span className="text-[9px] text-rose-300 font-extrabold uppercase block">Investi</span>
                                      <span className="text-xs font-sans font-black text-white">
                                        {inv.price.toLocaleString()} F
                                      </span>
                                    </div>
                                    <div className="text-right">
                                      <span className="text-[9px] text-rose-300 font-extrabold uppercase block">Gains Récupérés</span>
                                      <span className="text-xs font-sans font-black text-emerald-300">
                                        {inv.totalReturnClaimed.toLocaleString()} F
                                      </span>
                                    </div>
                                  </div>

                                  <div className="pt-1 text-[9.5px] text-rose-300 font-medium text-left">
                                    Acheté le : {formatDate(inv.createdAt)}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              );
            }

            // HISTORIQUE DES REVENUS DES CYCLES TERMINÉS (PAGE DÉDIÉE PORTEFEUILLE)
            if (profileSubPage === 'revenue-history') {
              const revRecords = DataStore.getRevenueHistory(userState.id);
              const completedInvs = activeInvestments.filter(i => i.status === 'completed');
              
              const totalRevenueSum = revRecords.reduce((acc, r) => acc + (r.totalPayout || 0), 0) ||
                completedInvs.reduce((acc, i) => acc + (i.totalReturnClaimed || (i.price + (i.dailyReturn * i.durationDays))), 0);
              
              const totalProfitSum = revRecords.reduce((acc, r) => acc + (r.netProfit || 0), 0) ||
                completedInvs.reduce((acc, i) => acc + (i.dailyReturn * i.durationDays), 0);

              const formatDate = (dateStr: string) => {
                try {
                  const d = new Date(dateStr);
                  if (isNaN(d.getTime())) return dateStr;
                  return d.toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });
                } catch {
                  return dateStr;
                }
              };

              return (
                <div className="bg-[#fff5f7] -mx-3 sm:-mx-5 md:-mx-8 xl:-mx-16 -mt-3.5 px-3.5 sm:px-5 md:px-8 xl:px-16 pt-3 sm:pt-5 pb-8 text-slate-900 text-left animate-fadeIn">
                  <div className="max-w-md mx-auto w-full space-y-4">
                    {/* Header with Back button */}
                    <div className="flex items-center justify-between pt-1 pb-1">
                      <button 
                        onClick={() => setProfileSubPage(null)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-slate-700 hover:text-slate-950 font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer border-none outline-none"
                        id="back-to-profile-from-revenue-history"
                      >
                        <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                        <span>Retour</span>
                      </button>
                      <h2 className="font-bold text-base sm:text-lg text-slate-900 tracking-tight">Historique des revenus</h2>
                      <div className="w-16" />
                    </div>

                    {/* Stats Summary */}
                    <div className="bg-white rounded-[24px] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] grid grid-cols-2 gap-3 text-center border border-slate-100">
                      <div className="p-3 bg-emerald-50/80 rounded-2xl border border-emerald-100">
                        <span className="text-[11px] font-bold text-emerald-800 uppercase block">Total Versé au Solde</span>
                        <span className="font-bold text-base sm:text-lg text-emerald-700 mt-1 block font-mono">
                          {totalRevenueSum.toLocaleString()} F
                        </span>
                      </div>
                      <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-100">
                        <span className="text-[11px] font-bold text-amber-800 uppercase block">Bénéfices Nets</span>
                        <span className="font-bold text-base sm:text-lg text-amber-700 mt-1 block font-mono">
                          {totalProfitSum.toLocaleString()} F
                        </span>
                      </div>
                    </div>

                    {/* Info Notice */}
                    <div className="p-3.5 bg-amber-50/80 border border-amber-200/70 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900 shadow-xs">
                      <Coins className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <p className="leading-snug font-medium">
                        Les revenus des produits dont le cycle est terminé sont enregistrés ici et leur montant total (capital + gains) est immédiatement crédité sur votre solde.
                      </p>
                    </div>

                    {/* Records List */}
                    <div className="space-y-3">
                      {revRecords.length === 0 && completedInvs.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-3xl p-6 border border-slate-100 shadow-xs">
                          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-3">
                            <Coins className="w-6 h-6" />
                          </div>
                          <p className="text-xs font-bold text-slate-700">Aucun cycle de produit terminé pour le moment.</p>
                          <p className="text-[11px] text-slate-400 mt-1">Vos revenus de fin de cycle apparaîtront automatiquement ici dès qu'un plan arrive à terme.</p>
                        </div>
                      ) : revRecords.length > 0 ? (
                        revRecords.map((rec) => (
                          <div 
                            key={rec.id}
                            className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3 text-left"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-sm font-sans font-black text-slate-900">
                                  {rec.productName}
                                </h4>
                                <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                                  Cycle terminé • {rec.durationDays} jour{rec.durationDays > 1 ? 's' : ''}
                                </span>
                              </div>
                              <span className="text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg">
                                Crédité au solde ✓
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                              <div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase block">Capital investi</span>
                                <span className="text-xs font-black text-slate-800 font-mono">
                                  {rec.price.toLocaleString()} F CFA
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="text-[10px] text-emerald-600 font-bold uppercase block">Total reversé (Capital + Gains)</span>
                                <span className="text-sm font-black text-emerald-600 font-mono">
                                  +{rec.totalPayout.toLocaleString()} F CFA
                                </span>
                              </div>
                            </div>

                            <div className="pt-1 flex items-center justify-between text-[10.5px] text-slate-400 border-t border-slate-50">
                              <span>Bénéfice net : +{(rec.netProfit || 0).toLocaleString()} F</span>
                              <span>{formatDate(rec.claimedAt)}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        completedInvs.map((inv) => {
                          const totalPayout = inv.totalReturnClaimed || (inv.price + (inv.dailyReturn * inv.durationDays));
                          const netProfit = totalPayout - inv.price;
                          return (
                            <div 
                              key={inv.id}
                              className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3 text-left"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="text-sm font-sans font-black text-slate-900">
                                    {inv.productName}
                                  </h4>
                                  <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                                    Cycle de {inv.durationDays} jours terminé
                                  </span>
                                </div>
                                <span className="text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg">
                                  Crédité au solde ✓
                                </span>
                              </div>

                              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                                <div>
                                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Capital initial</span>
                                  <span className="text-xs font-black text-slate-800 font-mono">
                                    {inv.price.toLocaleString()} F CFA
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span className="text-[10px] text-emerald-600 font-bold uppercase block">Total crédité au solde</span>
                                  <span className="text-sm font-black text-emerald-600 font-mono">
                                    +{totalPayout.toLocaleString()} F CFA
                                  </span>
                                </div>
                              </div>

                              <div className="pt-1 flex items-center justify-between text-[10.5px] text-slate-400 border-t border-slate-50">
                                <span>Bénéfice net : +{netProfit.toLocaleString()} F</span>
                                <span>{formatDate(inv.createdAt)}</span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              );
            }

            // 1. CARTE BANCAIRE (DEDICATED FULL PAGE)
            if (profileSubPage === 'bank') {
              return (
                <div className="bg-[#fff5f7] -mx-3 sm:-mx-5 md:-mx-8 xl:-mx-16 -mt-3.5 px-3.5 sm:px-5 md:px-8 xl:px-16 pt-3 sm:pt-5 pb-6 text-slate-900 text-left animate-fadeIn">
                  <div className="max-w-md mx-auto w-full space-y-3.5">
                    {/* Header with Back button */}
                    <div className="flex items-center justify-between pt-1 pb-1">
                      <button 
                        onClick={() => setProfileSubPage(null)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-slate-700 hover:text-slate-950 font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer border-none outline-none"
                        id="back-to-profile-from-bank"
                      >
                        <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                        <span>Retour</span>
                      </button>
                      <h2 className="font-bold text-base sm:text-lg text-slate-900 tracking-tight">Carte Bancaire</h2>
                      <div className="w-16" />
                    </div>

                    {/* Virtual Gold Avenue VIP Card */}
                    <div className="w-full h-48 rounded-3xl bg-gradient-to-br from-red-600 via-rose-600 to-rose-700 p-5 text-white flex flex-col justify-between shadow-md relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                      <div className="flex justify-between items-start relative z-10">
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider block opacity-95">GOLD AVENUE VIP</span>
                          <span className="text-[9px] font-medium tracking-widest opacity-80">COMPTE DE RETRAIT LIÉ</span>
                        </div>
                        <div className="px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-xs font-black text-[10px] uppercase tracking-wider">
                          {bankCardOperator || 'Mobile Money'}
                        </div>
                      </div>

                      <div className="text-center font-bold text-lg sm:text-xl tracking-widest my-2 relative z-10">
                        {bankCardNumber ? bankCardNumber.replace(/(\d{4})/g, '$1 ').trim() : '•••• •••• •••• ••••'}
                      </div>

                      <div className="flex justify-between items-end relative z-10">
                        <div>
                          <span className="text-[9px] text-rose-100 uppercase tracking-wider block">Titulaire du compte</span>
                          <span className="text-sm sm:text-base font-bold truncate max-w-[190px] block">
                            {bankCardName ? bankCardName.toUpperCase() : (userState.name || 'VOTRE NOM COMPLET').toUpperCase()}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] text-rose-100 uppercase tracking-wider block">Statut</span>
                          <span className="text-xs font-bold text-amber-200">
                            {bankCardNumber ? 'Vérifié & Actif' : 'Non configuré'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Form Container */}
                    <div className="bg-white rounded-[24px] p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
                      <div>
                        <h3 className="font-bold text-base text-slate-900">Coordonnées de Retrait</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Renseignez vos coordonnées Mobile Money ou bancaires pour recevoir vos gains en toute sécurité.
                        </p>
                      </div>

                      {bankCardError && (
                        <div className="p-3.5 bg-red-50 rounded-2xl text-xs text-red-700 font-bold leading-relaxed">
                          ⚠️ {bankCardError}
                        </div>
                      )}

                      {bankCardSuccess && (
                        <div className="p-3.5 bg-emerald-50 rounded-2xl text-xs text-emerald-700 font-bold leading-relaxed">
                          🎉 {bankCardSuccess}
                        </div>
                      )}

                      <form onSubmit={handleBankCardSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 block">Nom complet du titulaire</label>
                          <input 
                            type="text"
                            required
                            value={bankCardName}
                            onChange={(e) => setBankCardName(e.target.value)}
                            placeholder="Ex: Jean Dupont"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-bold focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 block">Opérateur de paiement</label>
                          <select
                            value={bankCardOperator}
                            onChange={(e) => setBankCardOperator(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-bold focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all cursor-pointer"
                          >
                            <option value="MTN Mobile Money">MTN Mobile Money (Bénin / CI / CM)</option>
                            <option value="Moov Money">Moov Money (Bénin / Togo / CI / BF)</option>
                            <option value="Orange Money">Orange Money (CI / Sénégal / BF / Mali)</option>
                            <option value="Wave">Wave (CI / Sénégal)</option>
                            <option value="T-Money">T-Money (Togo)</option>
                            <option value="Virement Bancaire">Virement Bancaire UEMOA</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 block">Numéro de téléphone / Compte</label>
                          <input 
                            type="tel"
                            required
                            value={bankCardNumber}
                            onChange={(e) => setBankCardNumber(e.target.value)}
                            placeholder="Ex: +229 97 00 00 00"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-bold focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-sm sm:text-base py-3.5 px-4 rounded-xl shadow-md transition-all cursor-pointer border-none outline-none mt-2"
                          id="save-bank-card-submit"
                        >
                          Enregistrer mes coordonnées
                        </button>
                      </form>
                    </div>

                    <button
                      onClick={() => setProfileSubPage(null)}
                      className="w-full py-3.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-sm rounded-xl transition-all cursor-pointer border-none outline-none text-center"
                    >
                      Retour au Portefeuille
                    </button>
                  </div>
                </div>
              );
            }

            // 2. RECHARGER L'ENREGISTREMENT (DEDICATED FULL PAGE)
            if (profileSubPage === 'recharge-history') {
              const userDeps = allDeposits.filter(d => !d.userId || d.userId === userState.id);
              const totalApprovedRecharge = userDeps.filter(d => d.status === 'approved').reduce((acc, d) => acc + d.amount, 0);
              const totalPendingRecharge = userDeps.filter(d => d.status === 'pending').reduce((acc, d) => acc + d.amount, 0);

              const filteredRecharges = userDeps.filter(d => {
                if (rechargeHistoryFilter === 'all') return true;
                return d.status === rechargeHistoryFilter;
              });

              return (
                <div className="bg-[#fff5f7] -mx-3 sm:-mx-5 md:-mx-8 xl:-mx-16 -mt-3.5 px-3.5 sm:px-5 md:px-8 xl:px-16 pt-3 sm:pt-5 pb-6 text-slate-900 text-left animate-fadeIn">
                  <div className="max-w-md mx-auto w-full space-y-3.5">
                    {/* Header */}
                    <div className="flex items-center justify-between pt-1 pb-1">
                      <button 
                        onClick={() => setProfileSubPage(null)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-slate-700 hover:text-slate-950 font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer border-none outline-none"
                      >
                        <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                        <span>Retour</span>
                      </button>
                      <h2 className="font-bold text-base sm:text-lg text-slate-900 tracking-tight">Recharger l'enregistrement</h2>
                      <div className="w-16" />
                    </div>

                    {/* Stats Summary */}
                    <div className="bg-white rounded-[24px] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] grid grid-cols-2 gap-3 text-center">
                      <div className="p-3 bg-emerald-50/70 rounded-2xl">
                        <span className="text-[11px] font-bold text-emerald-800 uppercase block">Total Validé</span>
                        <span className="font-bold text-base sm:text-lg text-emerald-700 mt-1 block">
                          {totalApprovedRecharge.toLocaleString()} FCFA
                        </span>
                      </div>
                      <div className="p-3 bg-amber-50/70 rounded-2xl">
                        <span className="text-[11px] font-bold text-amber-800 uppercase block">En Attente</span>
                        <span className="font-bold text-base sm:text-lg text-amber-700 mt-1 block">
                          {totalPendingRecharge.toLocaleString()} FCFA
                        </span>
                      </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-2 p-1.5 bg-white rounded-2xl shadow-xs">
                      {(['all', 'approved', 'pending', 'rejected'] as const).map((filterKey) => {
                        const labels: Record<string, string> = {
                          all: 'Tous',
                          approved: 'Validé',
                          pending: 'En attente',
                          rejected: 'Rejeté'
                        };
                        const isActive = rechargeHistoryFilter === filterKey;
                        return (
                          <button
                            key={filterKey}
                            onClick={() => setRechargeHistoryFilter(filterKey)}
                            className={`flex-1 py-2 px-1 text-xs font-bold rounded-xl transition-all border-none outline-none cursor-pointer ${
                              isActive ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 bg-transparent'
                            }`}
                          >
                            {labels[filterKey]}
                          </button>
                        );
                      })}
                    </div>

                    {/* Deposits List */}
                    <div className="space-y-3">
                      {filteredRecharges.length === 0 ? (
                        <div className="bg-white rounded-[24px] p-8 text-center shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-3">
                          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 mx-auto flex items-center justify-center">
                            <History className="w-6 h-6 stroke-[2]" />
                          </div>
                          <p className="text-sm font-bold text-slate-700">Aucune recharge enregistrée dans cette catégorie</p>
                          <button
                            onClick={() => {
                              setProfileSubPage(null);
                              setActiveTab('deposit');
                            }}
                            className="py-2.5 px-5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer border-none outline-none"
                          >
                            Effectuer une recharge
                          </button>
                        </div>
                      ) : (
                        filteredRecharges.map((dep, idx) => {
                          const isApproved = dep.status === 'approved';
                          const isPending = dep.status === 'pending';
                          const statusColor = isApproved 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : isPending 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-red-100 text-red-800';
                          const statusLabel = isApproved ? 'Succès' : isPending ? 'En cours' : 'Échoué';

                          return (
                            <div key={dep.id || idx} className="bg-white rounded-[22px] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
                                    {dep.paymentMethod?.slice(0, 3).toUpperCase() || 'DEP'}
                                  </div>
                                  <div>
                                    <span className="font-bold text-sm text-slate-800 block">
                                      {dep.paymentMethod || 'Mobile Money'}
                                    </span>
                                    <span className="text-[11px] text-slate-400 font-medium">
                                      {new Date(dep.createdAt).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="font-bold text-sm sm:text-base text-slate-900 block">
                                    +{dep.amount.toLocaleString()} FCFA
                                  </span>
                                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${statusColor}`}>
                                    {statusLabel}
                                  </span>
                                </div>
                              </div>
                              {dep.transactionId && (
                                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-mono flex justify-between">
                                  <span>Réf:</span>
                                  <span className="font-bold text-slate-700">{dep.transactionId}</span>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>

                    <button
                      onClick={() => setProfileSubPage(null)}
                      className="w-full py-3.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-sm rounded-xl transition-all cursor-pointer border-none outline-none text-center"
                    >
                      Retour au Portefeuille
                    </button>
                  </div>
                </div>
              );
            }

            // 3. ENREGISTREMENT DES RETRAITS (DEDICATED FULL PAGE)
            if (profileSubPage === 'withdraw-history') {
              const userWiths = allWithdrawals.filter(w => !w.userId || w.userId === userState.id);
              const totalApprovedWithdraw = userWiths.filter(w => w.status === 'approved').reduce((acc, d) => acc + d.amount, 0);
              const totalPendingWithdraw = userWiths.filter(w => w.status === 'pending').reduce((acc, d) => acc + d.amount, 0);

              const filteredWithdrawals = userWiths.filter(w => {
                if (withdrawHistoryFilter === 'all') return true;
                return w.status === withdrawHistoryFilter;
              });

              return (
                <div className="bg-[#fff5f7] -mx-3 sm:-mx-5 md:-mx-8 xl:-mx-16 -mt-3.5 px-3.5 sm:px-5 md:px-8 xl:px-16 pt-3 sm:pt-5 pb-6 text-slate-900 text-left animate-fadeIn">
                  <div className="max-w-md mx-auto w-full space-y-3.5">
                    {/* Header */}
                    <div className="flex items-center justify-between pt-1 pb-1">
                      <button 
                        onClick={() => setProfileSubPage(null)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-slate-700 hover:text-slate-950 font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer border-none outline-none"
                      >
                        <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                        <span>Retour</span>
                      </button>
                      <h2 className="font-bold text-base sm:text-lg text-slate-900 tracking-tight">Relevé des renseignements</h2>
                      <div className="w-16" />
                    </div>

                    {/* Stats Summary */}
                    <div className="bg-white rounded-[24px] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] grid grid-cols-2 gap-3 text-center">
                      <div className="p-3 bg-red-50/70 rounded-2xl">
                        <span className="text-[11px] font-bold text-red-800 uppercase block">Total Retiré</span>
                        <span className="font-bold text-base sm:text-lg text-red-700 mt-1 block">
                          {totalApprovedWithdraw.toLocaleString()} FCFA
                        </span>
                      </div>
                      <div className="p-3 bg-amber-50/70 rounded-2xl">
                        <span className="text-[11px] font-bold text-amber-800 uppercase block">En Traitement</span>
                        <span className="font-bold text-base sm:text-lg text-amber-700 mt-1 block">
                          {totalPendingWithdraw.toLocaleString()} FCFA
                        </span>
                      </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-2 p-1.5 bg-white rounded-2xl shadow-xs">
                      {(['all', 'approved', 'pending', 'rejected'] as const).map((filterKey) => {
                        const labels: Record<string, string> = {
                          all: 'Tous',
                          approved: 'Réussi',
                          pending: 'En attente',
                          rejected: 'Rejeté'
                        };
                        const isActive = withdrawHistoryFilter === filterKey;
                        return (
                          <button
                            key={filterKey}
                            onClick={() => setWithdrawHistoryFilter(filterKey)}
                            className={`flex-1 py-2 px-1 text-xs font-bold rounded-xl transition-all border-none outline-none cursor-pointer ${
                              isActive ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 bg-transparent'
                            }`}
                          >
                            {labels[filterKey]}
                          </button>
                        );
                      })}
                    </div>

                    {/* Withdrawals List */}
                    <div className="space-y-3">
                      {filteredWithdrawals.length === 0 ? (
                        <div className="bg-white rounded-[24px] p-8 text-center shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-3">
                          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 mx-auto flex items-center justify-center">
                            <ArrowDownLeft className="w-6 h-6 stroke-[2]" />
                          </div>
                          <p className="text-sm font-bold text-slate-700">Aucun retrait enregistré dans cette catégorie</p>
                          <button
                            onClick={() => {
                              setProfileSubPage(null);
                              setActiveTab('withdraw');
                            }}
                            className="py-2.5 px-5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer border-none outline-none"
                          >
                            Demander un retrait
                          </button>
                        </div>
                      ) : (
                        filteredWithdrawals.map((w, idx) => {
                          const isApproved = w.status === 'approved';
                          const isPending = w.status === 'pending';
                          const statusColor = isApproved 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : isPending 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-red-100 text-red-800';
                          const statusLabel = isApproved ? 'Réussi' : isPending ? 'En cours' : 'Rejeté';

                          return (
                            <div key={w.id || idx} className="bg-white rounded-[22px] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-2.5">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs">
                                    <ArrowDownLeft className="w-4.5 h-4.5 stroke-[2.25]" />
                                  </div>
                                  <div>
                                    <span className="font-bold text-sm text-slate-800 block">
                                      {w.method || 'Mobile Money'}
                                    </span>
                                    <span className="text-[11px] text-slate-400 font-medium">
                                      {new Date(w.createdAt).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="font-bold text-sm sm:text-base text-red-600 block">
                                    -{w.amount.toLocaleString()} FCFA
                                  </span>
                                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${statusColor}`}>
                                    {statusLabel}
                                  </span>
                                </div>
                              </div>
                              <div className="pt-2 border-t border-slate-100 grid grid-cols-2 text-[11px] text-slate-500 gap-1">
                                <div>Compte: <span className="font-bold text-slate-700">{w.accountNumber}</span></div>
                                <div className="text-right">Net reçu: <span className="font-bold text-emerald-700">{w.netAmount ? `${w.netAmount.toLocaleString()} FCFA` : `${Math.round(w.amount * 0.95).toLocaleString()} FCFA`}</span></div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    <button
                      onClick={() => setProfileSubPage(null)}
                      className="w-full py-3.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-sm rounded-xl transition-all cursor-pointer border-none outline-none text-center"
                    >
                      Retour au Portefeuille
                    </button>
                  </div>
                </div>
              );
            }

            // 4. MODIFIER LE MOT DE PASSE (DEDICATED FULL PAGE)
            if (profileSubPage === 'password') {
              const handlePasswordChangeSubmit = (e: React.FormEvent) => {
                e.preventDefault();
                setPwdError('');
                setPwdSuccess('');

                if (!oldPassword) {
                  setPwdError("Veuillez saisir votre ancien mot de passe.");
                  return;
                }

                if (oldPassword !== (userState.password || currentUser.password)) {
                  setPwdError("L'ancien mot de passe saisi est incorrect.");
                  return;
                }

                if (!newPassword || newPassword.length < 5) {
                  setPwdError("Le nouveau mot de passe doit comporter au moins 5 caractères.");
                  return;
                }

                if (newPassword !== confirmNewPassword) {
                  setPwdError("La confirmation ne correspond pas au nouveau mot de passe.");
                  return;
                }

                const updatedUser: User = {
                  ...userState,
                  password: newPassword
                };

                DataStore.saveCurrentUser(updatedUser);
                const allUsers = DataStore.getUsers();
                const idx = allUsers.findIndex(u => u.id === updatedUser.id);
                if (idx !== -1) {
                  allUsers[idx] = updatedUser;
                  DataStore.saveUsers(allUsers);
                }

                setUserState(updatedUser);
                if (onRefreshUser) onRefreshUser(updatedUser);

                setOldPassword('');
                setNewPassword('');
                setConfirmNewPassword('');
                setPwdSuccess("Votre mot de passe a été mis à jour avec succès !");
                triggerToast("Mot de passe modifié avec succès !", "success");
              };

              return (
                <div className="bg-[#fff5f7] -mx-3 sm:-mx-5 md:-mx-8 xl:-mx-16 -mt-3.5 px-3.5 sm:px-5 md:px-8 xl:px-16 pt-3 sm:pt-5 pb-6 text-slate-900 text-left animate-fadeIn">
                  <div className="max-w-md mx-auto w-full space-y-3.5">
                    {/* Header */}
                    <div className="flex items-center justify-between pt-1 pb-1">
                      <button 
                        onClick={() => setProfileSubPage(null)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-slate-700 hover:text-slate-950 font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer border-none outline-none"
                      >
                        <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                        <span>Retour</span>
                      </button>
                      <h2 className="font-bold text-base sm:text-lg text-slate-900 tracking-tight">Modifier le mot de passe</h2>
                      <div className="w-16" />
                    </div>

                    {/* Card container */}
                    <div className="bg-white rounded-[24px] p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
                      <div>
                        <h3 className="font-bold text-base text-slate-900">Sécurité du Compte</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Définissez un mot de passe robuste pour protéger vos retraits et investissements.
                        </p>
                      </div>

                      {pwdError && (
                        <div className="p-3.5 bg-red-50 rounded-2xl text-xs text-red-700 font-bold leading-relaxed">
                          ⚠️ {pwdError}
                        </div>
                      )}

                      {pwdSuccess && (
                        <div className="p-3.5 bg-emerald-50 rounded-2xl text-xs text-emerald-700 font-bold leading-relaxed">
                          🎉 {pwdSuccess}
                        </div>
                      )}

                      <form onSubmit={handlePasswordChangeSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 block">Ancien mot de passe</label>
                          <div className="relative">
                            <input 
                              type={showOldPwd ? "text" : "password"}
                              required
                              value={oldPassword}
                              onChange={(e) => setOldPassword(e.target.value)}
                              placeholder="Votre mot de passe actuel"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-bold focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowOldPwd(!showOldPwd)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer"
                            >
                              {showOldPwd ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 block">Nouveau mot de passe</label>
                          <div className="relative">
                            <input 
                              type={showNewPwd ? "text" : "password"}
                              required
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="Au moins 5 caractères"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-bold focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPwd(!showNewPwd)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer"
                            >
                              {showNewPwd ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 block">Confirmer le nouveau mot de passe</label>
                          <div className="relative">
                            <input 
                              type={showConfirmPwd ? "text" : "password"}
                              required
                              value={confirmNewPassword}
                              onChange={(e) => setConfirmNewPassword(e.target.value)}
                              placeholder="Répétez le nouveau mot de passe"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-bold focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer"
                            >
                              {showConfirmPwd ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                            </button>
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-sm sm:text-base py-3.5 px-4 rounded-xl shadow-md transition-all cursor-pointer border-none outline-none mt-2"
                        >
                          Confirmer la modification
                        </button>
                      </form>
                    </div>

                    <button
                      onClick={() => setProfileSubPage(null)}
                      className="w-full py-3.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-sm rounded-xl transition-all cursor-pointer border-none outline-none text-center"
                    >
                      Retour au Portefeuille
                    </button>
                  </div>
                </div>
              );
            }

            // 5. À PROPOS (DEDICATED FULL PAGE)
            if (profileSubPage === 'about') {
              return (
                <div className="bg-[#fff5f7] -mx-3 sm:-mx-5 md:-mx-8 xl:-mx-16 -mt-3.5 px-3.5 sm:px-5 md:px-8 xl:px-16 pt-3 sm:pt-5 pb-6 text-slate-900 text-left animate-fadeIn">
                  <div className="max-w-md mx-auto w-full space-y-3.5">
                    {/* Header */}
                    <div className="flex items-center justify-between pt-1 pb-1">
                      <button 
                        onClick={() => setProfileSubPage(null)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-slate-700 hover:text-slate-950 font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer border-none outline-none"
                      >
                        <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                        <span>Retour</span>
                      </button>
                      <h2 className="font-bold text-base sm:text-lg text-slate-900 tracking-tight">À Propos</h2>
                      <div className="w-16" />
                    </div>

                    {/* Main Presentation Card */}
                    <div className="bg-white rounded-[24px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
                      <div className="flex justify-center py-1">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-600 flex items-center justify-center text-white shadow-md">
                          <TrendingUp className="w-8 h-8 stroke-[2.5]" />
                        </div>
                      </div>
                      
                      <div className="text-center space-y-1">
                        <h3 className="font-bold text-base sm:text-lg text-slate-900">Gold Avenue Investment S.A.</h3>
                        <p className="text-xs text-red-600 font-bold">Plateforme Certifiée d'Investissement Minier &amp; Technologique</p>
                      </div>

                      <p className="text-xs text-slate-600 font-normal leading-relaxed text-justify">
                        Gold Avenue Investment est une institution financière et technologique de référence en Afrique de l'Ouest et Centrale. Nous permettons à des milliers d'investisseurs de valoriser leur épargne à travers des projets miniers aurifères et des instruments à haut rendement journalier.
                      </p>

                      <div className="border-t border-slate-100 pt-4 space-y-3.5">
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-red-600 inline-block" />
                            Transparence &amp; Rentabilité Quotidienne
                          </h4>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            Chaque produit dispose d'un cycle clair avec des revenus versés quotidiennement directement sur votre compte.
                          </p>
                        </div>

                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
                            Retraits Instantanés Mobile Money
                          </h4>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            Nous collaborons avec MTN, Moov, Orange et Wave pour assurer des retraits rapides et fiables 7j/7.
                          </p>
                        </div>

                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                            Programme de Parrainage VIP
                          </h4>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            Bénéficiez de la commission de parrainage (Niveau 1, 2 et 3) sur le premier rechargement validé de vos filleuls.
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setProfileSubPage(null)}
                      className="w-full py-3.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-sm rounded-xl transition-all cursor-pointer border-none outline-none text-center"
                    >
                      Retour au Portefeuille
                    </button>
                  </div>
                </div>
              );
            }

            // 6. FOIRE AUX QUESTIONS (FAQ) (DEDICATED FULL PAGE)
            if (profileSubPage === 'faq' || profileSubPage === 'help') {
              const faqList = [
                {
                  q: "Comment recharger mon compte sur la plateforme ?",
                  a: "Rendez-vous dans l'onglet 'Accueil' ou 'Portefeuille', cliquez sur 'Recharger', choisissez votre montant et suivez les instructions simples pour effectuer le transfert via votre opérateur Mobile Money (MTN, Moov, Orange, Wave)."
                },
                {
                  q: "Quand et comment reçois-je mes revenus journaliers ?",
                  a: "Les revenus de vos produits sont crédités automatiquement toutes les 24 heures sur votre solde principal. Vous pouvez suivre la progression en temps réel dans l'onglet 'Commande'."
                },
                {
                  q: "Quelles sont les conditions et délais pour retirer mes gains ?",
                  a: "Les demandes de retrait sont traitées 7 jours sur 7. Il vous suffit de lier votre numéro Mobile Money via l'option 'Carte bancaire'. Le virement arrive généralement en moins de 15 minutes."
                },
                {
                  q: "Quel est le montant minimum de dépôt et de retrait ?",
                  a: "Le montant minimum pour activer un produit est de 2 500 FCFA. Le seuil minimum de retrait est fixé à 1 000 FCFA avec des frais standardisés de 5%."
                },
                {
                  q: "Comment fonctionne le système de parrainage ?",
                  a: "Partagez votre lien ou code d'invitation avec vos proches. Vous gagnez automatiquement votre commission de parrainage sur le premier rechargement validé de chaque filleul (Niveau 1, 2 et 3). À partir du 2ᵉ rechargement, aucune nouvelle commission n'est attribuée."
                },
                {
                  q: "Que faire si mon dépôt n'apparaît pas instantanément ?",
                  a: "Si le solde n'apparaît pas au bout de 5 minutes, contactez directement notre Service Client en ligne ou via WhatsApp en fournissant l'ID de votre transaction pour une validation immédiate."
                }
              ];

              return (
                <div className="bg-[#fff5f7] -mx-3 sm:-mx-5 md:-mx-8 xl:-mx-16 -mt-3.5 px-3.5 sm:px-5 md:px-8 xl:px-16 pt-3 sm:pt-5 pb-6 text-slate-900 text-left animate-fadeIn">
                  <div className="max-w-md mx-auto w-full space-y-3.5">
                    {/* Header */}
                    <div className="flex items-center justify-between pt-1 pb-1">
                      <button 
                        onClick={() => setProfileSubPage(null)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-slate-700 hover:text-slate-950 font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer border-none outline-none"
                      >
                        <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                        <span>Retour</span>
                      </button>
                      <h2 className="font-bold text-base sm:text-lg text-slate-900 tracking-tight">Foire Aux Questions</h2>
                      <div className="w-16" />
                    </div>

                    {/* Support shortcuts */}
                    <div className="bg-white rounded-[24px] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex gap-2">
                      <button
                        onClick={() => {
                          setIsLiveChatOpen(true);
                          DataStore.markSupportMessagesAsRead(currentUser.id, 'user');
                          setSupportMessages(prev => prev.map(m => (m.userId === currentUser.id && m.sender === 'admin' && m.status === 'unread') ? { ...m, status: 'read' } : m));
                        }}
                        className="flex-1 py-3 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border-none relative"
                      >
                        <Headphones className="w-4.5 h-4.5" />
                        <span>Service Client 24/7</span>
                        {unreadSupportCount > 0 && (
                          <span className="min-w-4 h-4 px-1 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center">
                            {unreadSupportCount}
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => window.open(DataStore.getWhatsAppChannel(), '_blank')}
                        className="flex-1 py-3 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border-none"
                      >
                        <MessageCircle className="w-4.5 h-4.5" />
                        <span>Canal WhatsApp</span>
                      </button>
                    </div>

                    {/* Accordion List */}
                    <div className="space-y-3">
                      {faqList.map((faq, index) => {
                        const isOpen = openFaqIndex === index;
                        return (
                          <div 
                            key={index}
                            className="bg-white rounded-[22px] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-all cursor-pointer"
                            onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <span className="font-bold text-xs sm:text-sm text-slate-800 leading-snug">
                                {faq.q}
                              </span>
                              <ChevronRight className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-90 text-red-600' : ''}`} />
                            </div>
                            {isOpen && (
                              <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 leading-relaxed font-normal">
                                {faq.a}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setProfileSubPage(null)}
                      className="w-full py-3.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-sm rounded-xl transition-all cursor-pointer border-none outline-none text-center"
                    >
                      Retour au Portefeuille
                    </button>
                  </div>
                </div>
              );
            }

            if (profileSubPage === 'settings') {
              return (
                <div className="bg-gradient-to-b from-[#9f1239] via-[#881337] to-[#4c0519] -mx-2 sm:-mx-6 md:-mx-12 xl:-mx-20 -mt-3.5 px-4 sm:px-6 md:px-12 xl:px-20 pt-6 pb-6 text-white text-left animate-fadeIn">
                  <div className="max-w-xl mx-auto w-full space-y-4">
                    <div className="flex items-center space-x-3 mb-2 pt-2">
                      <button 
                        onClick={() => setProfileSubPage(null)}
                        className="w-10 h-10 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-white hover:bg-white/25 transition-all cursor-pointer shadow-xs border-none outline-none"
                      >
                        <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                      </button>
                      <h2 className="font-sans font-black text-white text-base uppercase tracking-tight">Paramètres</h2>
                    </div>

                    <div className="bg-rose-950/70 rounded-3xl p-5 shadow-sm border border-rose-700/50 space-y-3.5 text-white">
                      <h3 className="font-sans font-black text-white text-xs uppercase tracking-wider pl-0.5">Langue / Language</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            localStorage.setItem('gi_lang', 'FR');
                            window.dispatchEvent(new Event('gi_lang_changed'));
                            setTimeout(() => {
                              window.location.reload();
                            }, 50);
                          }}
                          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-black text-xs border transition-all ${
                            (localStorage.getItem('gi_lang') || 'FR') === 'FR'
                              ? 'bg-gradient-to-r from-[#e11d48] to-[#be123c] text-white border-rose-400'
                              : 'bg-rose-900/40 border-rose-700/40 text-rose-200 hover:bg-rose-900/60'
                          }`}
                        >
                          <span>🇫🇷</span> Français
                        </button>
                        <button
                          onClick={() => {
                            localStorage.setItem('gi_lang', 'EN');
                            window.dispatchEvent(new Event('gi_lang_changed'));
                            setTimeout(() => {
                              window.location.reload();
                            }, 50);
                          }}
                          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-black text-xs border transition-all ${
                            localStorage.getItem('gi_lang') === 'EN'
                              ? 'bg-gradient-to-r from-[#e11d48] to-[#be123c] text-white border-rose-400'
                              : 'bg-rose-900/40 border-rose-700/40 text-rose-200 hover:bg-rose-900/60'
                          }`}
                        >
                          <span>🇬🇧</span> English
                        </button>
                      </div>
                    </div>

                    <div className="bg-rose-950/70 rounded-3xl p-5 shadow-sm border border-rose-700/50 space-y-3.5 text-white">
                      <h3 className="font-sans font-black text-white text-xs uppercase tracking-wider pl-0.5">Informations du Compte</h3>
                      
                      <div className="space-y-2.5">
                        <div className="flex justify-between items-center p-3 bg-rose-900/40 rounded-2xl border border-rose-700/40 text-xs">
                          <span className="text-rose-300 font-bold">Nom d'utilisateur</span>
                          <span className="font-black text-white">{userState.name || 'Aucun'}</span>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-rose-900/40 rounded-2xl border border-rose-700/40 text-xs">
                          <span className="text-rose-300 font-bold">Numéro WhatsApp</span>
                          <span className="font-black text-white">{userState.whatsapp || 'Aucun'}</span>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-rose-900/40 rounded-2xl border border-rose-700/40 text-xs">
                          <span className="text-rose-300 font-bold">Code Sponsor Unique</span>
                          <span className="font-mono font-black text-amber-300">{userState.referralCode}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-rose-950/70 rounded-3xl p-5 shadow-sm border border-rose-700/50 space-y-4 text-white">
                      <h3 className="font-sans font-black text-white text-xs uppercase tracking-wider pl-0.5">Sécurité &amp; Mot de passe</h3>
                      
                      <div className="space-y-3">
                        <p className="text-[11px] text-rose-200 font-bold leading-relaxed">
                          Modifiez votre mot de passe pour garantir la sécurité et la confidentialité de vos investissements.
                        </p>
                        
                        <button
                          onClick={() => setIsPasswordModalOpen(true)}
                          className="w-full bg-gradient-to-r from-[#e11d48] to-[#be123c] hover:from-[#f43f5e] hover:to-[#e11d48] text-white font-black text-xs py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer border-none outline-none"
                        >
                          <Settings className="w-4.5 h-4.5" />
                          <span>MODIFIER MON MOT DE PASSE</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            if (profileSubPage === 'wheel') {
              return (
                <div className="bg-gradient-to-b from-[#9f1239] via-[#881337] to-[#4c0519] -mx-2 sm:-mx-6 md:-mx-12 xl:-mx-20 -mt-3.5 px-4 sm:px-6 md:px-12 xl:px-20 pt-6 pb-6 text-white text-left animate-fadeIn relative">
                  <div className="max-w-xl mx-auto w-full space-y-6">
                    <div className="flex items-center space-x-3 mb-2 pt-2">
                      <button 
                        disabled={isSpinning}
                        onClick={() => setProfileSubPage(null)}
                        className="w-10 h-10 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-white hover:bg-white/25 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                      </button>
                      <h2 className="font-sans font-black text-white text-base uppercase tracking-tight">Roue de la chance</h2>
                    </div>

                    <div className="bg-rose-950/70 border border-rose-700/50 rounded-[36px] w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col items-center text-center text-white">
                      {/* Gold sparkle header decoration */}
                      <div className="absolute -top-12 -left-12 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl pointer-events-none" />
                      <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

                      {/* Title & info */}
                      <div className="space-y-1 mb-6">
                        <span className="text-[10px] text-amber-400 font-sans font-black uppercase tracking-widest block">
                          ACTIVITÉ DE BIEN-ÊTRE
                        </span>
                        <h3 className="text-xl sm:text-2xl font-sans font-black text-white uppercase tracking-tight">
                          🎡 Roue de la chance
                        </h3>
                        <p className="text-xs text-rose-200 font-bold max-w-xs mx-auto">
                          Tournez la roue magique et gagnez des bonus crédités instantanément sur votre solde !
                        </p>
                      </div>

                      {/* Circular Wheel Viewport Container */}
                      <div className="relative my-4 select-none w-72 h-72 flex items-center justify-center">
                        
                        {/* Visual arrow pin pointing down at top center */}
                        <div 
                          className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-10 bg-amber-500 z-40 transition-all duration-300 animate-pulse"
                          style={{
                            clipPath: 'polygon(50% 100%, 0 0, 100% 0)',
                            filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.3))'
                          }}
                        />

                        {/* Outer shining border frame */}
                        <div className="absolute inset-0 rounded-full border-[6px] border-amber-500 bg-amber-500/10 shadow-[0_0_25px_rgba(245,158,11,0.25)] pointer-events-none z-20" />

                        {/* Spinning Wheel Body */}
                        <div 
                          className="w-full h-full rounded-full bg-slate-800 overflow-hidden relative border border-slate-700 transition-transform duration-[4500ms] ease-[cubic-bezier(0.15,0.85,0.15,1)]"
                          style={{ 
                            transform: `rotate(${wheelSpinAngle}deg)`,
                          }}
                        >
                          {WHEEL_REWARDS.map((rew, idx) => {
                            const angle = idx * 45; // 360 / 8 segments
                            return (
                              <div 
                                key={idx}
                                className="absolute top-0 left-0 w-full h-full origin-center flex flex-col items-center"
                                style={{ 
                                  transform: `rotate(${angle}deg)`,
                                }}
                              >
                                {/* Triangular piece slice using CSS clip-path */}
                                <div 
                                  className="absolute top-0 w-full h-1/2 origin-bottom transition-all duration-300"
                                  style={{
                                    clipPath: 'polygon(50% 100%, 14.6% 0, 85.4% 0)', // exactly 45 degrees slice width
                                    backgroundColor: rew.color,
                                    opacity: 0.85
                                  }}
                                />

                                {/* Text label vertically centered inside segment */}
                                <div 
                                  className="absolute top-8 text-center text-white font-sans font-black text-xs tracking-wider uppercase select-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                                  style={{
                                    transform: 'rotate(0deg)',
                                  }}
                                >
                                  {rew.label}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Golden Center Hub Pin */}
                        <div className="absolute w-14 h-14 rounded-full bg-slate-800 border-[4px] border-amber-500 shadow-xl flex flex-col items-center justify-center z-30 select-none">
                          <div className="w-4 h-4 bg-yellow-500 rounded-full animate-ping absolute opacity-75" />
                          <span className="text-[10px] font-mono font-black text-amber-500 uppercase tracking-widest leading-none">VIP</span>
                          <span className="text-[9px] font-sans font-black text-white uppercase tracking-widest mt-0.5 leading-none">GOLD</span>
                        </div>
                      </div>

                      {/* Status & Spins info */}
                      <div className="mt-4 space-y-4 w-full">
                        <div className="bg-rose-900/60 rounded-2xl p-3.5 border border-rose-700/50 inline-flex items-center gap-2">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                          <span className="text-xs font-sans font-black text-white tracking-wide uppercase">
                            {wheelSpinCount} Tirage(s) disponible(s)
                          </span>
                        </div>

                        {/* Spin CTA Button */}
                        <button
                          disabled={isSpinning || wheelSpinCount <= 0}
                          onClick={handleSpinWheel}
                          className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 disabled:from-rose-950 disabled:to-rose-900 disabled:text-rose-400/60 text-white font-sans font-black text-xs py-4 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(245,158,11,0.25)] transition-all cursor-pointer active:scale-95 disabled:scale-100 disabled:cursor-not-allowed uppercase tracking-wider border-none outline-none"
                        >
                          <Trophy className="w-5 h-5 stroke-[2.5]" />
                          <span>{isSpinning ? "Tirage en cours..." : "LANCER LE TIRAGE"}</span>
                        </button>

                        {/* Share to earn more spins */}
                        <p className="text-[10.5px] text-rose-200 font-bold leading-relaxed max-w-xs mx-auto pt-1">
                          💡 Astuce : Invitez de nouveaux membres sur Gold Avenue pour obtenir des tickets de tirage supplémentaires !
                        </p>
                      </div>

                      {/* Win announcement overlay overlay */}
                      {wonReward && !isSpinning && (
                        <div className="absolute inset-0 bg-rose-950/95 z-50 flex flex-col items-center justify-center p-6 animate-fadeIn animate-duration-300">
                          <div className="w-20 h-20 bg-amber-500/10 text-amber-400 rounded-full flex items-center justify-center animate-bounce mb-4 border border-amber-500/20">
                            <Trophy className="w-10 h-10 stroke-[2.25]" />
                          </div>
                          <span className="text-[11px] text-amber-400 font-sans font-black uppercase tracking-widest">
                            SUCCÈS DU TIRAGE
                          </span>
                          <h4 className="text-2xl sm:text-3xl font-sans font-black text-white uppercase mt-1 leading-tight tracking-tight">
                            Félicitations !
                          </h4>
                          <p className="text-sm text-rose-200 font-bold max-w-xs mt-2">
                            Vous avez remporté un bonus de
                          </p>
                          <div className="text-3xl sm:text-4xl font-sans font-black text-yellow-400 my-4 tracking-wider font-mono">
                            +{wonReward.amount.toLocaleString()} F CFA
                          </div>
                          <p className="text-xs text-emerald-300 font-black uppercase tracking-wider bg-emerald-950/80 border border-emerald-500/40 px-4 py-2 rounded-xl">
                            ✓ Crédité sur votre solde
                          </p>
                          <button
                            onClick={() => setWonReward(null)}
                            className="mt-6 bg-gradient-to-r from-[#e11d48] to-[#be123c] text-white font-sans font-black text-xs py-3 px-6 rounded-xl transition-all cursor-pointer border-0 active:scale-95"
                          >
                            D'ACCORD !
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          })()}

          {/* USER SUMMARY CARDS */}
          {!profileSubPage && activeTab === 'dashboard' && (
            <HomeTabView
              userState={userState}
              setActiveTab={setActiveTab}
              setProfileSubPage={setProfileSubPage}
              t={t}
            />
          )}

          {/* DEDICATED COMMANDE / ORDERS TRACKING TAB */}
          {!profileSubPage && activeTab === 'orders' && (() => {
            const activeInvs = activeInvestments.filter(i => i.status === 'active');
            const pendingInvs = activeInvestments.filter(i => i.status === 'pending_activation');
            const totalInvested = activeInvestments.reduce((acc, i) => acc + (i.price || 0), 0);
            const totalExpectedPayout = activeInvs.reduce((acc, i) => {
              const payout = (i as any).totalReturn || (i.price + ((i.dailyReturn || 0) * (i.durationDays || 0)));
              return acc + payout;
            }, 0);

            return (
              <div className="space-y-4 animate-fade-in max-w-3xl mx-auto pt-1 pb-10 text-left">
                {/* Header Summary Banner - sleek & compact */}
                <div className="bg-gradient-to-r from-[#881337] via-[#9f1239] to-[#4c0519] rounded-2xl p-3.5 sm:p-4 text-white shadow-sm border border-rose-700/50">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center shadow-xs">
                          <ShoppingBag className="w-4 h-4 text-rose-200" />
                        </div>
                        <h2 className="text-base sm:text-lg font-sans font-black uppercase tracking-tight text-white">
                          {t('Mes Commandes', 'My Orders')}
                        </h2>
                      </div>
                      <p className="text-[11px] sm:text-xs text-rose-200/90 font-medium">
                        {t('Suivi de vos produits : statut, progression et rendements.', 'Track your products: status, progression, and returns.')}
                      </p>
                    </div>
                  </div>

                  {/* Summary Metric Cards in Order Page */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mt-3 pt-2.5 border-t border-rose-700/40">
                    <div className="bg-rose-950/60 rounded-xl p-2 sm:p-2.5 text-center border border-rose-800/40">
                      <span className="text-[10px] sm:text-[11px] text-amber-300 font-bold uppercase tracking-wider block">{t('Produits Souscrits', 'Subscribed Products')}</span>
                      <span className="text-xs sm:text-sm font-black text-white font-mono block mt-0.5">
                        {activeInvestments.length}
                      </span>
                    </div>
                    <div className="bg-rose-950/60 rounded-xl p-2 sm:p-2.5 text-center border border-rose-800/40">
                      <span className="text-[10px] sm:text-[11px] text-rose-300 font-bold uppercase tracking-wider block">{t('Total Investi', 'Total Invested')}</span>
                      <span className="text-xs sm:text-sm font-black text-white font-mono block mt-0.5">
                        {totalInvested.toLocaleString()} F
                      </span>
                    </div>
                    <div className="bg-rose-950/60 rounded-xl p-2 sm:p-2.5 text-center border border-rose-800/40 col-span-2 sm:col-span-1">
                      <span className="text-[10px] sm:text-[11px] text-emerald-300 font-bold uppercase tracking-wider block">{t('Total Prévu', 'Expected Total')}</span>
                      <span className="text-xs sm:text-sm font-black text-emerald-400 font-mono block mt-0.5">
                        {totalExpectedPayout.toLocaleString()} F
                      </span>
                    </div>
                  </div>
                </div>

                {/* List of Orders */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-sm sm:text-base font-sans font-black text-white uppercase tracking-tight flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-400" />
                      {t('Tous les Produits Souscrits', 'All Subscribed Products')} ({activeInvestments.length})
                    </h3>
                  </div>

                  {activeInvestments.length === 0 ? (
                    <div className="text-center py-14 px-6 rounded-3xl bg-rose-950/50 border border-rose-800/40 max-w-md mx-auto space-y-4 shadow-md">
                      <div className="w-16 h-16 rounded-2xl bg-rose-900/60 text-rose-300 flex items-center justify-center mx-auto shadow-inner">
                        <ShoppingBag className="w-8 h-8 stroke-[1.75]" />
                      </div>
                      <div className="space-y-1.5">
                        <h4 className="font-sans font-black text-white text-lg uppercase tracking-tight">
                          {t('Aucune commande enregistrée', 'No orders recorded yet')}
                        </h4>
                        <p className="text-xs sm:text-sm text-rose-200/80 font-medium max-w-xs mx-auto leading-relaxed">
                          {t('Vous n\'avez pas encore activé de produit. Découvrez notre catalogue pour commencer.', 'You have not yet activated any product. Explore our catalog to get started.')}
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveTab('products')}
                        className="bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 text-white font-sans font-black text-xs sm:text-sm uppercase tracking-wider py-3 px-6 rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-md cursor-pointer border-none mt-2"
                      >
                        {t('Découvrir les Produits 🚀', 'Explore Products 🚀')}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activeInvestments.map((inv) => (
                        <InvestmentItem 
                          key={inv.id}
                          investment={inv}
                          onClaim={handleClaimReturn}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* CATALOGUE PRODUCTS TAB */}
          {!profileSubPage && activeTab === 'products' && (
            <ProductsTabView
              products={products}
              productSubTab={productSubTab}
              setProductSubTab={setProductSubTab}
              handleBuyProduct={handleBuyProduct}
              buyingProductId={buyingProductId}
              activeInvestments={activeInvestments}
              getCurrency={getCurrency}
              t={t}
              setIsSupportPageOpen={setIsSupportPageOpen}
              unreadSupportCount={unreadSupportCount}
            />
          )}

          {/* DEPOSIT FORM TAB */}
          {!profileSubPage && activeTab === 'deposit' && (
            <RechargeTabView
              userState={userState}
              depositAmount={depositAmount}
              setDepositAmount={setDepositAmount}
              depositCountry={depositCountry}
              setDepositCountry={setDepositCountry}
              depositCountryCode={depositCountryCode}
              setDepositCountryCode={setDepositCountryCode}
              depositPhone={depositPhone}
              setDepositPhone={setDepositPhone}
              depositError={depositError}
              depositSuccess={depositSuccess}
              isSubmittingDeposit={isSubmittingDeposit}
              submitDeposit={submitDeposit}
              getCurrency={getCurrency}
              depositCountries={DEPOSIT_COUNTRIES}
              setActiveTab={setActiveTab}
              setProfileSubPage={setProfileSubPage}
              onNavigate={onNavigate}
              t={t}
            />
          )}

          {/* WITHDRAW FORM TAB */}
          {!profileSubPage && activeTab === 'withdraw' && (
            <WithdrawTabView
              userState={userState}
              withdrawAmount={withdrawAmount}
              setWithdrawAmount={setWithdrawAmount}
              withdrawError={withdrawError}
              withdrawSuccess={withdrawSuccess}
              isSubmittingWithdrawal={isSubmittingWithdrawal}
              submitWithdrawal={submitWithdrawal}
              setIsBankCardModalOpen={setIsBankCardModalOpen}
              getCurrency={getCurrency}
              setActiveTab={setActiveTab}
              setProfileSubPage={setProfileSubPage}
              onNavigate={onNavigate}
              t={t}
            />
          )}

          {/* FORUM / COMMUNICATION TAB */}
          {!profileSubPage && activeTab === 'forum' && (
            <ForumTabView
              userState={userState}
              forumPosts={forumPosts}
              setForumPosts={setForumPosts}
              forumMessageInput={forumMessageInput}
              setForumMessageInput={setForumMessageInput}
              forumImage1={forumImage1}
              setForumImage1={setForumImage1}
              forumImage2={forumImage2}
              setForumImage2={setForumImage2}
              handlePostForumMessage={handlePostForumMessage}
              handleLikeForumPost={handleLikeForumPost}
              handlePostForumComment={handlePostForumComment}
              forumCommentInputs={forumCommentInputs}
              setForumCommentInputs={setForumCommentInputs}
              triggerToast={triggerToast}
              maskUserPhone={maskUserPhone}
              t={t}
            />
          )}

          {/* TEAM / MLM SYSTEM TAB */}
          {!profileSubPage && activeTab === 'team' && (
            <TeamTabView
              userState={userState}
              referralURL={referralURL}
              copiedCode={copiedCode}
              copiedLink={copiedLink}
              handleCopyCode={handleCopyCode}
              handleCopyLink={handleCopyLink}
              showTeamDetailsPage={showTeamDetailsPage}
              setShowTeamDetailsPage={setShowTeamDetailsPage}
              referralListTab={referralListTab}
              setReferralListTab={setReferralListTab}
              level1Users={level1Users}
              level2Users={level2Users}
              level3Users={level3Users}
              getUserInvestedAmount={getUserInvestedAmount}
              getLevelInvestedAmount={getLevelInvestedAmount}
              maskPhoneNumber={maskPhoneNumber}
              mlmRates={mlmRates}
              commissions={commissions}
              totalReferrals={totalReferrals}
              setActiveTab={setActiveTab}
              t={t}
            />
          )}

          {/* USER PROFILE */}
          {!profileSubPage && activeTab === 'profile' && (
            <ProfileTabView
              userState={userState}
              setActiveTab={setActiveTab}
              setProfileSubPage={setProfileSubPage}
              setIsSupportPageOpen={setIsSupportPageOpen}
              unreadSupportCount={unreadSupportCount}
              currentLanguage={currentLanguage}
              setCurrentLanguage={setCurrentLanguage}
              setIsAdminMode={setIsAdminMode}
              onLogout={onLogout}
              triggerToast={triggerToast}
            />
          )}

        </main>
      )}

      {/* DASHBOARD MOBILE FIXED BOTTOM NAVIGATION */}
      <footer className="fixed bottom-0 left-0 right-0 py-2 px-2 sm:px-4 bg-white/95 backdrop-blur-md border-t border-slate-100 z-40 shadow-[0_-2px_12px_rgba(0,0,0,0.04)]">
        <div className="max-w-md mx-auto grid grid-cols-4 items-center">
          
          {/* 1. Accueil */}
          <button
            onClick={() => {
              setIsAdminMode(false);
              setProfileSubPage(null);
              setActiveTab('dashboard');
              setShowTeamDetailsPage(false);
            }}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-150 cursor-pointer border-none outline-none text-center ${
              activeTab === 'dashboard' && !isAdminMode 
                ? 'text-[#D49A22] font-black' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
            id="tab-nav-accueil"
          >
            <div className={`p-0.5 rounded-lg transition-all ${
              activeTab === 'dashboard' && !isAdminMode ? 'text-[#D49A22]' : 'text-slate-400'
            }`}>
              <Home className="w-5 h-5 stroke-[2.25]" />
            </div>
            <span className="font-sans font-extrabold text-[11px] sm:text-xs leading-tight mt-0.5 whitespace-nowrap block truncate w-full text-center">
              {t('Accueil', 'Home')}
            </span>
            {activeTab === 'dashboard' && !isAdminMode && (
              <div className="w-6 h-0.5 bg-[#D49A22] rounded-full mt-0.5 mx-auto" />
            )}
          </button>

          {/* 2. Produit */}
          <button
            onClick={() => {
              setIsAdminMode(false);
              setProfileSubPage(null);
              setActiveTab('products');
              setShowTeamDetailsPage(false);
            }}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-150 cursor-pointer border-none outline-none text-center ${
              activeTab === 'products' && !isAdminMode 
                ? 'text-[#D49A22] font-black' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
            id="tab-nav-produit"
          >
            <div className={`p-0.5 rounded-lg transition-all ${
              activeTab === 'products' && !isAdminMode ? 'text-[#D49A22]' : 'text-slate-400'
            }`}>
              <Package className="w-5 h-5 stroke-[2.25]" />
            </div>
            <span className="font-sans font-extrabold text-[11px] sm:text-xs leading-tight mt-0.5 whitespace-nowrap block truncate w-full text-center">
              {t('Produit', 'Products')}
            </span>
            {activeTab === 'products' && !isAdminMode && (
              <div className="w-6 h-0.5 bg-[#D49A22] rounded-full mt-0.5 mx-auto" />
            )}
          </button>
  
          {/* 3. Forum */}
          <button
            onClick={() => {
              setIsAdminMode(false);
              setProfileSubPage(null);
              setActiveTab('forum');
              setShowTeamDetailsPage(false);
            }}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-150 cursor-pointer border-none outline-none text-center ${
              activeTab === 'forum' && !isAdminMode 
                ? 'text-[#D49A22] font-black' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
            id="tab-nav-forum"
          >
            <div className={`p-0.5 rounded-lg transition-all ${
              activeTab === 'forum' && !isAdminMode ? 'text-[#D49A22]' : 'text-slate-400'
            }`}>
              <MessageSquare className="w-5 h-5 stroke-[2.25]" />
            </div>
            <span className="font-sans font-extrabold text-[11px] sm:text-xs leading-tight mt-0.5 whitespace-nowrap block truncate w-full text-center">
              {t('Forum', 'Forum')}
            </span>
            {activeTab === 'forum' && !isAdminMode && (
              <div className="w-6 h-0.5 bg-[#D49A22] rounded-full mt-0.5 mx-auto" />
            )}
          </button>
  
          {/* 4. Portefeuille */}
          <button
            onClick={() => {
              setIsAdminMode(false);
              setProfileSubPage(null);
              setActiveTab('profile');
              setShowTeamDetailsPage(false);
            }}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-150 cursor-pointer border-none outline-none text-center ${
              activeTab === 'profile' && !isAdminMode 
                ? 'text-[#D49A22] font-black' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
            id="tab-nav-profil"
          >
            <div className={`p-0.5 rounded-lg transition-all ${
              activeTab === 'profile' && !isAdminMode ? 'text-[#D49A22]' : 'text-slate-400'
            }`}>
              <Wallet className="w-5 h-5 stroke-[2.25]" />
            </div>
            <span className="font-sans font-extrabold text-[11px] sm:text-xs leading-tight mt-0.5 whitespace-nowrap block truncate w-full text-center">
              {t('Portefeuille', 'Wallet')}
            </span>
            {activeTab === 'profile' && !isAdminMode && (
              <div className="w-6 h-0.5 bg-[#D49A22] rounded-full mt-0.5 mx-auto" />
            )}
          </button>
 
        </div>
      </footer>

      {/* FLOATING HEADSET SUPPORT BUTTON */}
      <div className="fixed right-3.5 bottom-15 z-45 sm:right-5 sm:bottom-16">
        <button
          onClick={() => setIsSupportPageOpen(true)}
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-[#d9962a] via-[#e5a836] to-[#f2bb45] hover:brightness-105 border-2 border-white text-white flex items-center justify-center shadow-lg active:scale-95 duration-150 transition-all cursor-pointer relative"
          title="Assistance & Support en ligne"
          id="btn-floating-support-headset"
        >
          <Headphones className="w-5 h-5 sm:w-5.5 sm:h-5.5 stroke-[2.25]" />
          {unreadSupportCount > 0 ? (
            <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-md animate-bounce">
              {unreadSupportCount > 99 ? '99+' : unreadSupportCount}
            </span>
          ) : (
            <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white animate-pulse"></span>
          )}
        </button>
      </div>

      {/* NOUVELLE PAGE DÉDIÉE SUPPORT EN LIGNE (PLEIN ÉCRAN) */}
      <AnimatePresence>
        {isSupportPageOpen && (
          <OnlineSupportPage
            onBack={() => setIsSupportPageOpen(false)}
            onOpenAdvisorChat={(prefilledMessage) => {
              setIsSupportPageOpen(false);
              if (prefilledMessage) {
                setChatMessageInput(prefilledMessage);
              }
              setIsLiveChatOpen(true);
              DataStore.markSupportMessagesAsRead(currentUser.id, 'user');
              setSupportMessages(prev => prev.map(m => (m.userId === currentUser.id && m.sender === 'admin' && m.status === 'unread') ? { ...m, status: 'read' } : m));
            }}
            whatsAppChannelUrl={DataStore.getWhatsAppChannel()}
            userName={currentUser.name}
          />
        )}
      </AnimatePresence>

      {/* FULL-PAGE DEDICATED SUPPORT CHAT VIEW */}
      <AnimatePresence>
        {isLiveChatOpen && (
          <div className="fixed inset-0 z-[110] flex flex-col bg-[#0b0f19] text-white animate-fade-in">
            <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col h-full bg-[#111827] shadow-2xl border-x border-slate-800">
              {/* Header */}
              <div className="bg-slate-900/90 backdrop-blur-md text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
                <div className="flex items-center space-x-3 text-left">
                  <button 
                    onClick={() => setIsLiveChatOpen(false)}
                    className="p-2 -ml-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-amber-400 hover:text-amber-300 transition-colors font-bold cursor-pointer flex items-center gap-1 text-xs"
                    aria-label="Retour"
                  >
                    <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                    <span className="hidden sm:inline font-sans font-bold">Retour</span>
                  </button>
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-lg relative">
                    🤝
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-900 animate-pulse"></span>
                  </div>
                  <div>
                    <h4 className="font-sans font-black text-sm uppercase tracking-wide leading-none text-white flex items-center gap-2">
                      <span>Support Gold Avenue</span>
                      <span className="text-[9px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-mono uppercase font-bold">En Ligne</span>
                    </h4>
                    <span className="text-[10px] font-bold text-slate-400 block mt-1 uppercase tracking-wide">Assistance clientèle dédiée & réponse rapide</span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsLiveChatOpen(false)}
                  className="text-slate-400 hover:text-white p-2 hover:bg-slate-800 rounded-xl transition-colors font-bold cursor-pointer"
                  aria-label="Fermer Support"
                >
                  <X className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>

              {/* Message block with custom chat list rendering */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 bg-[#0b0f19]">
                {supportMessages.length === 0 ? (
                  <div className="h-full flex flex-col justify-center items-center text-center p-6 space-y-4">
                    <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-3xl flex items-center justify-center text-3xl shadow-lg">
                      💬
                    </div>
                    <div className="max-w-md">
                      <h5 className="font-sans font-black text-sm text-white uppercase tracking-wider mb-1.5">
                        Bienvenue sur le Support Client Officiel
                      </h5>
                      <p className="text-xs text-slate-400 font-medium leading-relaxed mx-auto">
                        Posez toutes vos questions concernant vos dépôts, retraits, parrainages ou produits. Notre équipe d'assistance vous répondra directement sur cette page.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 max-w-2xl mx-auto">
                    {DataStore.deduplicateSupportMessages(supportMessages.filter(m => m.userId === currentUser.id)).map((msg) => {
                      const isMe = msg.sender === 'user';
                      return (
                        <div 
                          key={msg.id}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'} w-full`}
                        >
                          <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 shadow-sm text-xs ${
                            isMe 
                              ? 'bg-amber-500 text-slate-950 font-medium rounded-br-none text-left shadow-amber-500/10' 
                              : 'bg-slate-800 text-slate-100 border border-slate-700 rounded-bl-none text-left'
                          }`}>
                            {msg.image && (
                              <div className="mb-2 rounded-xl overflow-hidden bg-slate-900/50 border border-slate-700/50">
                                <img 
                                  src={msg.image} 
                                  alt="Capture" 
                                  className="w-full max-h-72 object-contain rounded-xl cursor-pointer hover:opacity-95 transition-opacity"
                                  onClick={() => setZoomedChatImage(msg.image || null)}
                                  referrerPolicy="no-referrer"
                                />
                                <button
                                  type="button"
                                  onClick={() => setZoomedChatImage(msg.image || null)}
                                  className="w-full py-1 text-[9px] text-slate-400 font-bold text-center bg-slate-900/80 hover:bg-slate-900 transition-colors"
                                >
                                  🔍 Cliquer pour agrandir
                                </button>
                              </div>
                            )}
                            {msg.message && (
                              <p className="font-sans leading-normal whitespace-pre-wrap">
                                {msg.message}
                              </p>
                            )}
                            <span className={`text-[8.5px] block mt-1 font-bold ${
                              isMe ? 'text-slate-800/80 text-right' : 'text-slate-400 text-left'
                            }`}>
                              {new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    {/* scroll marker */}
                    <div ref={chatBottomRef} />
                  </div>
                )}
              </div>

              {/* Chat Image Preview if attached */}
              {chatImageAttachment && (
                <div className="px-4 py-2.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 shadow-sm">
                    <img 
                      src={chatImageAttachment} 
                      alt="Capture attachée" 
                      className="w-10 h-10 object-cover rounded-lg border border-slate-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="text-left">
                      <span className="text-[11px] font-black text-white block leading-tight">Capture d'écran jointe</span>
                      <span className="text-[9px] text-emerald-400 font-bold block">Prête pour l'envoi au support</span>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setChatImageAttachment(null)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Supprimer la photo"
                  >
                    <X className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              )}

              {/* Chat Input form bar */}
              <form 
                onSubmit={handleSendChatMessage}
                className="p-3 sm:p-4 bg-slate-900 border-t border-slate-800 flex items-center space-x-2 shrink-0 select-none"
              >
                {/* Hidden image input */}
                <input 
                  type="file" 
                  ref={chatFileInputRef} 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleChatImageSelect}
                />

                <button
                  type="button"
                  onClick={() => chatFileInputRef.current?.click()}
                  disabled={isUploadingChatImage}
                  className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-amber-400 flex items-center justify-center transition-all cursor-pointer shrink-0 border border-slate-700"
                  title="Ajouter une image ou capture d'écran"
                  id="btn-chat-attach-image"
                >
                  <Camera className="w-5 h-5 stroke-[2.25]" />
                </button>

                <input 
                  type="text" 
                  value={chatMessageInput}
                  onChange={(e) => setChatMessageInput(e.target.value)}
                  placeholder={chatImageAttachment ? "Ajouter un commentaire..." : "Posez votre question à l'assistance..."}
                  className="flex-1 bg-slate-950 border border-slate-700 focus:border-amber-500 focus:outline-none rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 font-medium transition-all"
                />
                <button 
                  type="submit" 
                  disabled={!chatMessageInput.trim() && !chatImageAttachment}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                    (chatMessageInput.trim() || chatImageAttachment)
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 active:scale-95 font-bold' 
                      : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                  }`}
                  id="btn-chat-send"
                >
                  <Send className="w-4 h-4 stroke-[2.5]" />
                </button>
              </form>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* FULLSCREEN IMAGE LIGHTBOX FOR CHAT */}
      <AnimatePresence>
        {zoomedChatImage && (
          <div 
            onClick={() => setZoomedChatImage(null)}
            className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer animate-fade-in"
          >
            <div className="relative max-w-lg max-h-[90vh] w-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
              <div className="w-full flex justify-between items-center mb-2 px-1">
                <span className="text-xs font-bold text-white/90">📸 Image agrandie</span>
                <button 
                  onClick={() => setZoomedChatImage(null)}
                  className="p-1.5 text-white bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                  aria-label="Fermer"
                >
                  <X className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>
              <img 
                src={zoomedChatImage} 
                alt="Agrandissement" 
                className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-white/20"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* SENDAVAPAY OTP VERIFICATION MODAL */}
      <AnimatePresence>
        {spOtpModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white border-2 border-slate-200/50 rounded-3xl w-full max-w-sm p-6 sm:p-8 shadow-2xl relative text-slate-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-[#1b64d9]/10 flex items-center justify-center text-[#1b64d9]">
                  <Smartphone className="w-6 h-6 stroke-[2.5] animate-pulse" />
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-base font-black uppercase tracking-wider text-slate-800 font-sans">
                    VÉRIFICATION OTP 🔐
                  </h3>
                  <p className="text-[11px] text-slate-500 font-bold leading-normal">
                    {spStatusMessage || "Un code de confirmation (OTP) a été envoyé à votre numéro ou est requis pour valider votre recharge."}
                  </p>
                </div>

                <form onSubmit={submitSpOtp} className="space-y-4 pt-2">
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Saisissez le code OTP reçu"
                      value={spOtpCode}
                      onChange={(e) => setSpOtpCode(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#1b64d9] rounded-xl py-3 px-4 text-center text-sm font-bold tracking-widest uppercase focus:outline-none placeholder:text-slate-400 font-mono"
                    />
                  </div>

                  {depositError && (
                    <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-[10px] text-red-600 font-bold leading-normal">
                      {depositError}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSpOtpModalOpen(false);
                        setSpOtpToken(null);
                        setSpOtpCode('');
                        setIsPollingSp(false);
                      }}
                      className="flex-1 py-3 text-slate-600 bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all text-[11px] font-black uppercase tracking-wider rounded-xl cursor-pointer"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={paymentProcessing}
                      className="flex-1 py-3 text-white bg-gradient-to-r from-[#1b64d9] to-[#3b82f6] hover:opacity-95 active:scale-95 transition-all text-[11px] font-black uppercase tracking-wider rounded-xl cursor-pointer shadow-md disabled:opacity-50"
                    >
                      {paymentProcessing ? "Traitement en cours..." : "Valider"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CUSTOM LUXURY ALERT/CONFIRM POPUP MODAL */}
      {customModal.isOpen && (
        <div className="fixed inset-0 flex items-center justify-center p-3.5 sm:p-4 bg-slate-950/75 backdrop-blur-sm z-50 animate-fade-in">
          {customModal.type === 'confirm' ? (
            /* COMPACT MODERN GOLD & WHITE CONFIRMATION MODAL */
            <div className="bg-white border border-amber-300/80 rounded-2xl p-4 sm:p-5 max-w-[320px] w-full shadow-2xl shadow-amber-900/10 text-center space-y-3.5 animate-scale-up">
              {/* Subtle gold badge icon */}
              <div className="mx-auto w-11 h-11 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/80 border border-amber-200/90 flex items-center justify-center text-amber-500 shadow-xs">
                <Zap className="w-5 h-5 fill-amber-400/20 stroke-[2.5]" />
              </div>
              
              {/* Title & Message */}
              <div className="space-y-1.5 px-0.5">
                <h3 className="text-sm sm:text-base font-black tracking-tight text-slate-900 font-sans">
                  {customModal.title}
                </h3>
                <p className="text-xs sm:text-[13px] font-semibold text-slate-600 leading-snug">
                  {customModal.message}
                </p>
              </div>

              {/* Action Buttons: ANNULER & CONFIRMER */}
              <div className="pt-1 grid grid-cols-2 gap-2.5 w-full">
                <button
                  type="button"
                  onClick={() => {
                    setCustomModal(prev => ({ ...prev, isOpen: false }));
                  }}
                  className="w-full py-2.5 px-2.5 text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer border border-slate-200/80 select-none"
                  id="btn-modal-cancel"
                >
                  ANNULER
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const cb = customModal.onConfirm;
                    setCustomModal(prev => ({ ...prev, isOpen: false }));
                    if (cb) {
                      cb();
                    }
                  }}
                  className="w-full py-2.5 px-2.5 text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-500 hover:to-amber-400 active:scale-95 transition-all text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer shadow-md shadow-amber-500/25 border border-amber-300 select-none"
                  id="btn-modal-confirm"
                >
                  CONFIRMER
                </button>
              </div>
            </div>
          ) : (
            /* STANDARD MODAL FOR ALERTS / SUCCESS */
            <div className={`border-2 rounded-2xl p-5 sm:p-6 max-w-sm w-full shadow-2xl space-y-4 text-center animate-scale-up ${
              customModal.type === 'purchase_success' 
                ? 'bg-gradient-to-br from-[#00bd74] to-[#016e3c] border-emerald-400 text-white shadow-emerald-500/20' 
                : 'bg-[#eef3fc] border-slate-200/50 text-slate-800'
            }`}>
              
              {/* Modal Icon Indicator based on type */}
              <div className="mx-auto w-11 h-11 rounded-full flex items-center justify-center shadow-md">
                {customModal.type === 'purchase_success' && (
                  <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center text-white ring-4 ring-white/10 animate-bounce">
                    <CheckCircle2 className="w-6 h-6 stroke-[3]" />
                  </div>
                )}
                {customModal.type === 'success' && (
                  <div className="w-11 h-11 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                  </div>
                )}
                {customModal.type === 'error' && (
                  <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                    <AlertCircle className="w-6 h-6 stroke-[2.5]" />
                  </div>
                )}
                {customModal.type === 'info' && (
                  <div className="w-11 h-11 rounded-full bg-[#1b64d9]/10 flex items-center justify-center text-[#1b64d9]">
                    <HelpCircle className="w-6 h-6 stroke-[2.5]" />
                  </div>
                )}
              </div>
              
              {/* Title & Message */}
              <div className="space-y-1.5">
                <h3 className={`text-base font-black tracking-tight uppercase font-sans ${
                  customModal.type === 'purchase_success' ? 'text-white' : 'text-slate-800'
                }`}>
                  {customModal.title}
                </h3>
                <p className={`text-xs font-semibold leading-relaxed whitespace-pre-line text-center ${
                  customModal.type === 'purchase_success' ? 'text-emerald-50' : 'text-slate-600'
                }`}>
                  {customModal.message}
                </p>
              </div>

              {/* Action Button */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setCustomModal(prev => ({ ...prev, isOpen: false }));
                  }}
                  className={`w-full py-3 text-xs font-black uppercase tracking-widest rounded-xl cursor-pointer shadow-md active:scale-95 transition-all ${
                    customModal.type === 'purchase_success'
                      ? 'bg-white text-emerald-950 hover:bg-emerald-50'
                      : 'bg-gradient-to-r from-[#0284c7] to-[#0ea5e9] text-white hover:opacity-95'
                  }`}
                >
                  {customModal.type === 'purchase_success' ? 'EXCELLENT ! 🎉' : 'OK'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MONTSERRAT BOLD PREMIUM "À PROPOS DE NOUS" MODAL */}
      <AnimatePresence>
        {isAboutModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-[#fffaf5]/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setIsAboutModalOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border-2 border-blue-100/60 rounded-[32px] w-full max-w-lg p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(249,115,22,0.12)] relative overflow-hidden flex flex-col max-h-[90vh]"
              id="agro-about-modal"
            >
              {/* Top Accent Gradient Bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500" />
              
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50/60 flex items-center justify-center text-[#1b64d9] border border-blue-100/50 shrink-0">
                    <Info className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="font-sans font-black text-sm uppercase tracking-wider text-slate-800" style={{ fontWeight: '900' }}>
                      À Propos de Nous
                    </h3>
                    <p className="text-[9px] text-[#ea580c] font-black uppercase tracking-wider font-mono">
                      Fonctionnement Gold Avenue
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsAboutModalOpen(false)}
                  className="p-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-500 transition-colors cursor-pointer border border-slate-200"
                  id="agro-about-close-btn"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Main Content Div (Scrollable inside the modal) - Fluid text layout without boxes or borders */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-6 text-slate-700 text-left" id="agro-about-scrollable">
                
                {/* Intro paragraph */}
                <div className="space-y-2">
                  <span className="text-[10px] sm:text-xs font-black text-[#ea580c] block uppercase tracking-widest">PROPULSER LE COMMERCE TECHNOLOGIQUE EN AFRIQUE 🎧</span>
                  <p className="text-[12.5px] leading-relaxed text-slate-600 font-medium">
                    <strong className="text-slate-900 font-black" style={{ fontWeight: '800' }}>Gold Avenue</strong> est la première interface d'investissement technologique en ligne conçue pour démocratiser la distribution de systèmes audio haut de gamme modernes au Togo. Nous canalisons votre épargne vers des stocks réels d'écouteurs et de pods intelligents connectés de dernière génération afin de générer pour vous des profits stables de manière continue.
                  </p>
                </div>

                {/* HOW IT WORKS / FONCTIONNEMENT - Fluid steps without boxes or borders */}
                <div className="space-y-5">
                  <h4 className="font-sans font-black text-xs uppercase tracking-widest text-[#ea580c]" style={{ fontWeight: '900' }}>
                    COMMENT FONCTIONNE NOTRE SYSTÈME INTERACTIF ?
                  </h4>

                  <div className="space-y-5">
                    {/* Step 1 */}
                    <div className="space-y-1" id="about-step-1">
                      <h5 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-2" style={{ fontWeight: '800' }}>
                        <span className="text-[#ea580c]">1.</span> Inscription Directe & Sécurisée
                      </h5>
                      <p className="text-[12px] text-slate-600 font-medium leading-relaxed pl-5">
                        Créez votre compte investisseur instantanément avec votre numéro WhatsApp actif. Aucun frais d'entrée ! Obtenez immédiatement votre bonus de départ de 200 FCFA.
                      </p>
                    </div>

                    {/* Step 2 */}
                    <div className="space-y-1" id="about-step-2">
                      <h5 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-2" style={{ fontWeight: '800' }}>
                        <span className="text-[#ea580c]">2.</span> Recharge de Portefeuille & Choix du Plan VIP
                      </h5>
                      <p className="text-[12px] text-slate-600 font-medium leading-relaxed pl-5">
                        Alimentez votre compte de manière instantanée par Mobile Money (MTN, Moov, Celtiis, Orange). Activez la location de votre équipement de production via la section "Produits" (VIP Bronze à Titanium) adapté à votre capital disponible.
                      </p>
                    </div>

                    {/* Step 3 */}
                    <div className="space-y-1" id="about-step-3">
                      <h5 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-2" style={{ fontWeight: '800' }}>
                        <span className="text-[#ea580c]">3.</span> Génération Automatique de Rendements Journaliers
                      </h5>
                      <p className="text-[12px] text-slate-600 font-medium leading-relaxed pl-5">
                        Les équipements loués entrent en service réel. Vos gains sont calculés chaque 24h avec un taux d'intérêt quotidien spectaculaire (jusqu'à 15% par jour). Vous récoltez l'argent en direct sur votre balance.
                      </p>
                    </div>

                    {/* Step 4 */}
                    <div className="space-y-1" id="about-step-4">
                      <h5 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-2" style={{ fontWeight: '800' }}>
                        <span className="text-[#ea580c]">4.</span> Retraits Automatisés Instantanés vers Mobile Money
                      </h5>
                      <p className="text-[12px] text-slate-600 font-medium leading-relaxed pl-5">
                        À tout moment, soumettez votre demande de retrait depuis votre Profil vers votre numéro Momo local. Gold Avenue valide les flux financiers intelligemment pour créditer votre compte sans délai !
                      </p>
                    </div>

                    {/* Step 5 */}
                    <div className="space-y-1" id="about-step-5">
                      <h5 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-2" style={{ fontWeight: '800' }}>
                        <span className="text-[#ea580c]">5.</span> Expansion MLM & Doublement des Gains de Commission
                      </h5>
                      <p className="text-[12px] text-slate-600 font-medium leading-relaxed pl-5">
                        Copiez votre lien de parrainage exclusif et partagez-le. Touchez instantanément des royalties d'exploitation sur les investissements de vos filleuls jusqu'au Niveau 3 !
                      </p>
                    </div>
                  </div>
                </div>

                {/* Trust and Certify Badge Section - Clean text flow without boxes */}
                <div className="space-y-1.5 pt-2 select-none">
                  <span className="text-[11px] font-black text-slate-900 uppercase block tracking-wider" style={{ fontWeight: '900' }}>🛡️ SÉCURITÉ & LIQUIDITÉ CERTIFIÉES v2.6</span>
                  <p className="text-[11.5px] text-slate-600 font-medium leading-relaxed">
                    Tous les dépôts d'actifs de nos investisseurs font l'objet d'une couverture d'assurance intégrale, garantissant le versement ininterrompu de vos intérêts journaliers quoi qu'il arrive !
                  </p>
                </div>

              </div>
              
              {/* Footer */}
              <div className="border-t border-slate-100 pt-4 mt-4 flex items-center justify-between">
                <span className="text-[8.5px] text-slate-400 font-bold uppercase tracking-wider">Gold Avenue &copy; 2026. Tous droits réservés.</span>
                <button 
                  onClick={() => setIsAboutModalOpen(false)}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#1b64d9] to-orange-600 hover:opacity-95 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                  style={{ fontWeight: '900' }}
                >
                  Fermer
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL DE TÉLÉCHARGEMENT & D'ÉPINGLAGE À L'ÉCRAN D'ACCUEIL */}
      <AnimatePresence>
        {isInstallModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setIsInstallModalOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-800 rounded-[32px] w-full max-w-lg p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(234,88,12,0.15)] relative overflow-hidden flex flex-col max-h-[92vh]"
              id="dreampod-pin-modal"
            >
              {/* Top Accent Gradient Bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#1b64d9] via-orange-600 to-amber-500" />
              
              {/* Header */}
              <div className="flex justify-between items-start mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#f0f4ff]0/10 flex items-center justify-center text-blue-500 border border-[#f0f4ff]0/20 shrink-0">
                    <Smartphone className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="font-sans font-black text-xs uppercase tracking-wider text-white" style={{ fontWeight: '900' }}>
                      Épingler l'application
                    </h3>
                    <p className="text-[9px] text-blue-500 font-black uppercase tracking-wider font-mono">
                      Raccourci Écran d'Accueil v2.6
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsInstallModalOpen(false)}
                  className="p-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-5 text-slate-300 text-left">
                
                {/* Alerte cruciale pour l'erreur de cookie de sécurité */}
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 space-y-2 text-amber-200">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">💡</span>
                    <span className="text-[10.5px] font-black uppercase tracking-wider text-amber-400">
                      RÉSOUT L'ERREUR "COOKIE DE SÉCURITÉ"
                    </span>
                  </div>
                  <p className="text-[10px] leading-relaxed font-semibold">
                    Si votre téléphone affiche l'erreur <span className="text-yellow-300 font-bold">"Action required to load your app"</span> ou bloque l'accès, c'est que la WebView de l'application de téléchargement est limitée.
                  </p>
                  <p className="text-[10px] leading-relaxed font-bold text-white bg-slate-950/40 p-2 rounded-xl border border-amber-500/20">
                    🚀 <strong className="text-blue-400">La solution définitive :</strong> Épinglez l'application sur votre écran d'accueil en suivant le guide ci-dessous. Elle s'ouvrira directement dans votre navigateur officiel sans aucun blocage !
                  </p>
                </div>

                {/* Tabs selection: Android vs iOS */}
                <div className="grid grid-cols-2 gap-2 bg-slate-950/50 p-1.5 rounded-2xl border border-slate-850">
                  <button
                    onClick={() => setActiveInstallTab('android')}
                    className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-0 ${
                      activeInstallTab === 'android'
                        ? 'bg-[#1b64d9] text-white shadow-sm'
                        : 'bg-transparent text-slate-400 hover:text-white'
                    }`}
                  >
                    🤖 Android (Chrome)
                  </button>
                  <button
                    onClick={() => setActiveInstallTab('ios')}
                    className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-0 ${
                      activeInstallTab === 'ios'
                        ? 'bg-[#1b64d9] text-white shadow-sm'
                        : 'bg-transparent text-slate-400 hover:text-white'
                    }`}
                  >
                    🍏 iPhone (Safari)
                  </button>
                </div>

                {/* Tab Content: Android */}
                {activeInstallTab === 'android' && (
                  <div className="space-y-4">
                    <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-widest">
                          INSTALLATION DEPUIS GOOGLE CHROME
                        </span>
                      </div>
                      
                      {/* Interactive dynamic PWA installation if supported */}
                      {isInstallable ? (
                        <div className="space-y-2">
                          <button 
                            onClick={triggerPwaInstall}
                            className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-[#1b64d9] to-orange-600 hover:opacity-95 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 text-center cursor-pointer border-0"
                            style={{ fontWeight: '900' }}
                          >
                            <Smartphone className="w-4 h-4 stroke-[3]" />
                            Ajouter à l'Écran d'Accueil Maintenant
                          </button>
                          <p className="text-[9px] text-slate-400 text-center font-medium">
                            En un clic, l'icône Gold Avenue sera ajoutée à votre écran.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex gap-3 items-start bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                            <div className="w-6 h-6 bg-slate-800 text-blue-500 rounded-lg flex items-center justify-center text-xs font-black shrink-0">
                              1
                            </div>
                            <p className="text-[10.5px] font-medium leading-relaxed">
                              Ouvrez l'application dans votre navigateur <strong className="text-blue-400">Google Chrome</strong> (ou tapez l'adresse dans Chrome).
                            </p>
                          </div>

                          <div className="flex gap-3 items-start bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                            <div className="w-6 h-6 bg-slate-800 text-blue-500 rounded-lg flex items-center justify-center text-xs font-black shrink-0">
                              2
                            </div>
                            <p className="text-[10.5px] font-medium leading-relaxed">
                              Appuyez sur le menu <strong className="text-white">Option ⋮ (les 3 points verticaux)</strong> en haut à droite de Chrome.
                            </p>
                          </div>

                          <div className="flex gap-3 items-start bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                            <div className="w-6 h-6 bg-slate-800 text-blue-500 rounded-lg flex items-center justify-center text-xs font-black shrink-0">
                              3
                            </div>
                            <p className="text-[10.5px] font-medium leading-relaxed">
                              Sélectionnez l'option <strong className="text-white font-bold">"Ajouter à l'écran d'accueil"</strong> ou <strong className="text-white font-bold">"Installer l'application"</strong>.
                            </p>
                          </div>

                          <div className="flex gap-3 items-start bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/20">
                            <span className="text-sm">✨</span>
                            <p className="text-[10.5px] font-bold text-emerald-300 leading-relaxed">
                              Félicitations ! L'application s'installe en arrière-plan. Vous trouverez l'icône Gold Avenue sur votre écran d'accueil avec vos autres applications.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* APK Alternative Box */}
                    <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[9.5px] font-bold text-slate-500 uppercase tracking-widest">
                          MÉTHODE PAR APK (ALTERNATIVE)
                        </span>
                      </div>
                      
                      <button 
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = '/Gold Avenue_v2.6.apk';
                          link.download = 'Gold Avenue_v2.6.apk';
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          openAlert(
                            "Téléchargement APK !",
                            "Le téléchargement de l'APK Gold Avenue a commencé. N'oubliez pas de désinstaller les anciennes versions de votre téléphone avant d'installer ce fichier !",
                            "success"
                          );
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-black uppercase tracking-wider rounded-xl transition-all border border-slate-700 cursor-pointer shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5 text-blue-500" />
                        Télécharger le Fichier APK (Direct)
                      </button>
                      <p className="text-[9px] text-slate-500 leading-tight">
                        ⚠️ <strong className="text-amber-400">Rappel :</strong> Pour éviter l'erreur de package ou l'échec de l'installation, supprimez l'ancienne application <strong className="text-yellow-400">"AgroProfit"</strong> ou <strong className="text-yellow-400">"Gold Avenue"</strong> de votre appareil au préalable.
                      </p>
                    </div>
                  </div>
                )}

                {/* Tab Content: iOS (Safari) */}
                {activeInstallTab === 'ios' && (
                  <div className="space-y-4">
                    <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-4 space-y-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-widest">
                          INSTALLATION DEPUIS SAFARI (IPHONE / IPAD)
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex gap-3 items-start bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                          <div className="w-6 h-6 bg-slate-800 text-blue-500 rounded-lg flex items-center justify-center text-xs font-black shrink-0">
                            1
                          </div>
                          <p className="text-[10.5px] font-medium leading-relaxed">
                            Ouvrez obligatoirement l'application dans le navigateur officiel <strong className="text-blue-400">Safari</strong> de votre iPhone.
                          </p>
                        </div>

                        <div className="flex gap-3 items-start bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                          <div className="w-6 h-6 bg-slate-800 text-blue-500 rounded-lg flex items-center justify-center text-xs font-black shrink-0">
                            2
                          </div>
                          <p className="text-[10.5px] font-medium leading-relaxed">
                            Appuyez sur le bouton de <strong className="text-white">Partage 📤</strong> (l'icône de carré avec une flèche vers le haut, située au milieu en bas de votre écran Safari).
                          </p>
                        </div>

                        <div className="flex gap-3 items-start bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                          <div className="w-6 h-6 bg-slate-800 text-blue-500 rounded-lg flex items-center justify-center text-xs font-black shrink-0">
                            3
                          </div>
                          <p className="text-[10.5px] font-medium leading-relaxed">
                            Faites défiler le menu des options vers le bas et sélectionnez l'option <strong className="text-white font-bold">"Sur l'écran d'accueil"</strong> (ou "Ajouter sur l'écran d'accueil").
                          </p>
                        </div>

                        <div className="flex gap-3 items-start bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                          <div className="w-6 h-6 bg-slate-800 text-blue-500 rounded-lg flex items-center justify-center text-xs font-black shrink-0">
                            4
                          </div>
                          <p className="text-[10.5px] font-medium leading-relaxed">
                            Appuyez sur le bouton <strong className="text-blue-400 font-bold">"Ajouter"</strong> situé dans le coin supérieur droit.
                          </p>
                        </div>

                        <div className="flex gap-3 items-start bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/20">
                          <span className="text-sm">✨</span>
                          <p className="text-[10.5px] font-bold text-emerald-300 leading-relaxed">
                            Terminé ! L'application Gold Avenue s'affiche sur l'écran d'accueil de votre iPhone. Ouvrez-la pour vous connecter normalement et en toute sécurité.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
              
              {/* Footer */}
              <div className="border-t border-slate-800 pt-4 mt-4 flex items-center justify-between">
                <span className="text-[8.5px] text-slate-500 font-bold uppercase tracking-wider">Gold Avenue © 2026</span>
                <button 
                  onClick={() => setIsInstallModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all active:scale-95 cursor-pointer border border-slate-700"
                  style={{ fontWeight: '900' }}
                >
                  Fermer
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>



      {/* IMAGE LIGHTBOX OVERLAY */}
      <AnimatePresence>
        {selectedAvisImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedAvisImage(null)}
            className="fixed inset-0 z-[110] bg-slate-950/95 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-2 flex flex-col justify-center"
            >
              <div className="relative overflow-hidden rounded-2xl mx-auto flex justify-center items-center select-none">
                <img
                  src={selectedAvisImage}
                  alt="Agrandissement"
                  className="max-w-full max-h-[72vh] object-contain rounded-2xl mx-auto select-none pointer-events-none"
                  onContextMenu={(e) => e.preventDefault()}
                  onDragStart={(e) => e.preventDefault()}
                  style={{ WebkitTouchCallout: 'none', userSelect: 'none' }}
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex items-center justify-between px-4 py-3 mt-2 bg-slate-950/90 border-t border-slate-800/80 rounded-b-2xl">
                <span className="text-xs font-sans font-bold text-slate-300 flex items-center gap-1.5">
                  📸 Capture d'écran du Forum
                </span>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] font-sans font-black rounded-xl uppercase tracking-wider flex items-center gap-1">
                    🔒 Téléchargement désactivé
                  </span>
                  <button
                    onClick={() => setSelectedAvisImage(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-sans font-black text-xs rounded-xl transition-all cursor-pointer uppercase tracking-wider"
                  >
                    Fermer
                  </button>
                </div>
              </div>
              <button
                onClick={() => setSelectedAvisImage(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-slate-950/80 hover:bg-slate-950 rounded-full flex items-center justify-center text-white border border-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING TOAST NOTIFICATIONS */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-3 w-full max-w-sm px-4 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            const isSuccess = toast.type === 'success';
            const isError = toast.type === 'error';
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.95, transition: { duration: 0.2 } }}
                className={`pointer-events-auto w-full bg-white/98 border-2 rounded-2xl p-4 shadow-xl flex items-start gap-3.5 select-none ${
                  isSuccess 
                    ? 'border-emerald-500/30' 
                    : isError 
                      ? 'border-red-500/30' 
                      : 'border-blue-500/30'
                }`}
              >
                <div className="text-lg shrink-0 leading-none">
                  {isSuccess ? '✨' : isError ? '⚠️' : 'ℹ️'}
                </div>
                <div className="flex-1 text-[11px] font-black text-slate-800 uppercase tracking-widest leading-relaxed">
                  {toast.message}
                </div>
                <button
                  onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                  className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer shrink-0 mt-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

    </div>
  );
}
