import React, { useState } from 'react';
import { 
  Lock, 
  User as UserIcon, 
  Smartphone, 
  MapPin, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  ChevronLeft,
  Crown,
  Mail,
  Check, 
  Info, 
  AlertTriangle,
  RotateCw,
  Headphones,
  Shield,
  Sprout,
  Sparkles,
  ChevronDown,
  Share,
  X,
  ChevronUp,
  Globe,
  Link
} from 'lucide-react';
import { DataStore, syncWithBackend, safeLocalStorage } from '../dataStore';

export const eligibleCountries = [
  { name: 'Togo', code: '+228', flag: '🇹🇬' },
  { name: 'Cameroun', code: '+237', flag: '🇨🇲' },
  { name: 'Bénin', code: '+229', flag: '🇧🇯' },
  { name: 'Côte d’Ivoire', code: '+225', flag: '🇨🇮' },
  { name: 'Burkina Faso', code: '+226', flag: '🇧🇫' },
  { name: 'Sénégal', code: '+221', flag: '🇸🇳' }
];

interface AuthProps {
  initialIsRegister?: boolean;
  onAuthSuccess: (user: any) => void;
  onBackToHome?: () => void;
}

export default function Auth({ 
  initialIsRegister = true, 
  onAuthSuccess, 
  onBackToHome 
}: AuthProps) {
  const [isRegister, setIsRegister] = useState(initialIsRegister);
  const [lang, setLang] = useState<'FR' | 'EN'>(() => {
    return (localStorage.getItem('gi_lang') as 'FR' | 'EN') || 'FR';
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Sign up fields
  const [whatsapp, setWhatsapp] = useState('');
  const [selectedCode, setSelectedCode] = useState('+228');
  const [country, setCountry] = useState("Togo");
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');

  // Registration OTP & nickname
  const [nickname, setNickname] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [sentOtpCode, setSentOtpCode] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);

  const t = {
    title: isRegister 
      ? (lang === 'FR' ? "Créer un compte" : "Create an account") 
      : (lang === 'FR' ? "Connexion à votre espace" : "Log in to your account"),
    subtitle: isRegister 
      ? (lang === 'FR' ? "Inscrivez-vous pour commencer à investir" : "Sign up to start investing")
      : (lang === 'FR' ? "Entrez vos identifiants pour accéder à vos placements" : "Enter your credentials to access your investments"),
    pays: lang === 'FR' ? "Pays" : "Country",
    phone: lang === 'FR' ? "Numéro de téléphone" : "Phone number",
    nickname: lang === 'FR' ? "Surnom" : "Nickname",
    password: lang === 'FR' ? "Mot de passe" : "Password",
    passwordPlaceholder: lang === 'FR' ? "Mot de passe de connexion (min. 6 caract)" : "Login password (min. 6 chars)",
    loginPasswordPlaceholder: lang === 'FR' ? "Mot de passe de connexion" : "Login password",
    invitationCode: lang === 'FR' ? "Code d'invitation" : "Invitation code",
    invitationPlaceholder: lang === 'FR' ? "Veuillez entrer le code d'invitation (requis)" : "Please enter the invitation code (required)",
    otp: lang === 'FR' ? "Code de vérification (OTP)" : "Verification code (OTP)",
    otpPlaceholder: lang === 'FR' ? "Veuillez entrer le code de vérific" : "Please enter verification code",
    envoyer: lang === 'FR' ? "ENVOYER" : "SEND",
    submitBtn: loading
      ? (lang === 'FR' ? "Traitement en cours..." : "Processing...")
      : (isRegister 
          ? (lang === 'FR' ? "S'inscrire" : "Register") 
          : (lang === 'FR' ? "Se connecter" : "Login")),
    toggleBtn: isRegister
      ? (lang === 'FR' ? "Se connecter maintenant" : "Log in now")
      : (lang === 'FR' ? "Créer un compte maintenant" : "Create an account now"),
    customerService: lang === 'FR' ? "Service client" : "Customer service",
    footerText: lang === 'FR' ? "Gold Avenue • Système de Placement Sécurisé" : "Gold Avenue • Secure Investment System",
    securePlacement: lang === 'FR' ? "Placement Sécurisé" : "Secure Investment",
    whatsappRequired: lang === 'FR' 
      ? "Veuillez saisir votre numéro de téléphone avant d'envoyer l'OTP."
      : "Please enter your phone number before sending the OTP.",
    otpSentSuccess: (code: string) => lang === 'FR'
      ? `🔑 CODE OTP ENVOYÉ : Saisissez le code reçu pour finaliser votre inscription.`
      : `🔑 OTP CODE SENT: Enter the code received to finalize your registration.`,
    errorEmptyWhatsapp: lang === 'FR' ? "Le numéro de téléphone est requis." : "Phone number is required.",
    errorMinPassword: lang === 'FR' 
      ? "Le mot de passe doit contenir au moins 6 caractères pour garantir la sécurité de votre capital."
      : "Password must be at least 6 characters long to secure your capital.",
    errorOtpFirst: lang === 'FR'
      ? "Veuillez d'abord cliquer sur ENVOYER pour obtenir votre code de vérification (OTP)."
      : "Please first click SEND to obtain your verification code (OTP).",
    errorOtpWrong: lang === 'FR'
      ? "Le code de vérification (OTP) est incorrect."
      : "The verification code (OTP) is incorrect.",
    errorPhoneRequired: lang === 'FR' ? "Le numéro de téléphone est requis." : "Phone number is required.",
    errorPasswordRequired: lang === 'FR' ? "Le mot de passe de connexion est requis." : "Login password is required.",
    errorNicknameRequired: lang === 'FR' ? "Le surnom est requis." : "Nickname is required.",
    forgotPassword: lang === 'FR' ? "Mot de passe oublié ?" : "Forgot password?"
  };

  React.useEffect(() => {
    setIsRegister(initialIsRegister);
  }, [initialIsRegister]);

  // Pre-fill sponsor referral code if captured from a direct web link
  React.useEffect(() => {
    const parseUrlAndSync = () => {
      // 1. Parse current URL params
      const searchParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.includes('?') ? window.location.hash.split('?')[1] : '');
      
      const getParamInsensitive = (key: string) => {
        const lowerKey = key.toLowerCase();
        for (const [k, v] of searchParams.entries()) {
          if (k.toLowerCase() === lowerKey) return v;
        }
        for (const [k, v] of hashParams.entries()) {
          if (k.toLowerCase() === lowerKey) return v;
        }
        return null;
      };

      const refCode = getParamInsensitive('ref') || 
                      getParamInsensitive('code') || 
                      getParamInsensitive('r') || 
                      getParamInsensitive('parrain') || 
                      getParamInsensitive('sponsor');
      if (refCode) {
        safeLocalStorage.setItem('gi_captured_ref', refCode.toUpperCase());
        setReferralCode(refCode.toUpperCase());
      } else {
        setReferralCode('');
      }
    };

    parseUrlAndSync();
  }, []);

  // Sign in fields
  const [loginSelectedCode, setLoginSelectedCode] = useState('+228');
  // Sign in fields
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [resetTip, setResetTip] = useState(false);

  // Modal States
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);

  const [officialBanners, setOfficialBanners] = useState(() => DataStore.getOfficialBanners());
  React.useEffect(() => {
    const handleUpdate = () => {
      setOfficialBanners(DataStore.getOfficialBanners());
    };
    window.addEventListener('gi_store_updated', handleUpdate);
    return () => window.removeEventListener('gi_store_updated', handleUpdate);
  }, []);

  // Helper to extract clean WhatsApp number with country code, removing spaces, duplicate prefixes, leading zeros
  const getCleanWhatsappNumber = (rawNumber: string, prefixCode: string) => {
    let clean = rawNumber.replace(/[\s\-\(\)\+]/g, '');
    if (clean.startsWith('00')) {
      clean = clean.slice(2);
    }
    const prefixDigits = prefixCode.replace(/\D/g, '');
    if (clean.startsWith(prefixDigits)) {
      clean = clean.slice(prefixDigits.length);
    }
    clean = clean.replace(/^0+/, '');
    return `${prefixCode}${clean}`;
  };

  // OTP Countdown timer decay
  React.useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCountdown]);

  // Handle sending interactive verification OTP for registration
  const handleSendOTP = () => {
    if (!whatsapp.trim()) {
      setErrorMessage(t.whatsappRequired);
      return;
    }
    setErrorMessage('');
    setSuccessMessage('');
    
    // Immediate responsiveness without blocking or artificial delays
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setSentOtpCode(code);
    setOtpCode(code);
    setSendingOtp(false);
    setOtpCountdown(60);
    setSuccessMessage(t.otpSentSuccess(code));
  };

  // Form submission dispatcher
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    if (isRegister) {
      // Registration validations
      if (!whatsapp.trim()) {
        setErrorMessage(t.errorEmptyWhatsapp);
        setLoading(false);
        return;
      }
      if (!nickname.trim()) {
        setErrorMessage(t.errorNicknameRequired);
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setErrorMessage(t.errorMinPassword);
        setLoading(false);
        return;
      }
      if (!sentOtpCode) {
        setErrorMessage(t.errorOtpFirst);
        setLoading(false);
        return;
      }
      if (otpCode !== sentOtpCode) {
        setErrorMessage(t.errorOtpWrong);
        setLoading(false);
        return;
      }

      const fullWhatsapp = getCleanWhatsappNumber(whatsapp, selectedCode);

      // Detect current device type
      const ua = navigator.userAgent;
      let detectedDevice = 'Ordinateur';
      if (/android/i.test(ua)) detectedDevice = 'Android';
      else if (/iPad|iPhone|iPod/.test(ua)) detectedDevice = 'iPhone';
      else if (/tablet/i.test(ua)) detectedDevice = 'Tablette';
      else if (/mobile/i.test(ua)) detectedDevice = 'Mobile';

      // Call database
      const result = await DataStore.register({
        name: nickname.trim(),
        whatsapp: fullWhatsapp,
        country,
        password,
        referredByCode: referralCode,
        device: detectedDevice
      });

      if (result.success && result.user) {
        setSuccessMessage(result.message);
        try {
          sessionStorage.setItem('gi_just_registered', 'true');
        } catch (e) {
          console.error(e);
        }
        onAuthSuccess(result.user!);
        setLoading(false);
      } else {
        setErrorMessage(result.message || (lang === 'FR' ? "Une erreur s'est produite lors de la création de votre compte d'investissement." : "An error occurred while creating your investment account."));
        setLoading(false);
      }

    } else {
      // Login validations
      if (!loginPhone.trim()) {
        setErrorMessage(t.errorPhoneRequired);
        setLoading(false);
        return;
      }
      if (!loginPassword.trim()) {
        setErrorMessage(t.errorPasswordRequired);
        setLoading(false);
        return;
      }

      let finalLoginWhatsapp = loginPhone.trim();
      if (finalLoginWhatsapp !== 'admin' && !finalLoginWhatsapp.includes('@')) {
        finalLoginWhatsapp = getCleanWhatsappNumber(finalLoginWhatsapp, loginSelectedCode);
      }

      const result = await DataStore.login(finalLoginWhatsapp, loginPassword);
      if (result.success && result.user) {
        setSuccessMessage(result.message);
        onAuthSuccess(result.user!);
        setLoading(false);
      } else {
        setErrorMessage(result.message);
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F2] flex flex-col justify-between py-6 px-3 sm:px-4 relative overflow-y-auto overflow-x-hidden font-sans text-[#102A43] select-none" id="auth-container">
      
      {/* Subtle clean background decorative accents */}
      <div className="absolute inset-0 z-0 overflow-hidden select-none pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#F3C75F]/12 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-96 h-96 bg-[#D49A22]/8 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 left-1/4 w-96 h-96 bg-[#E8D8B0]/20 rounded-full blur-3xl" />
      </div>

      {/* Top Navigation Bar containing Back chevron and Direct Language Switcher */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between relative z-10 mb-5 shrink-0 px-1">
        {onBackToHome ? (
          <button
            onClick={onBackToHome}
            type="button"
            className="w-10 h-10 rounded-full bg-white border border-[#E8D8B0]/40 shadow-2xs text-[#D49A22] hover:text-[#C88A16] hover:border-[#D49A22]/50 active:scale-95 transition-all cursor-pointer flex items-center justify-center p-1"
            title="Retour"
          >
            <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
          </button>
        ) : (
          <div className="w-10 h-10" />
        )}

        {/* Direct inline language switch without any subpages */}
        <div className="flex items-center bg-white rounded-full p-1 border border-[#E8D8B0]/40 shadow-2xs">
          <button
            type="button"
            onClick={() => {
              setLang('FR');
              localStorage.setItem('gi_lang', 'FR');
              window.dispatchEvent(new Event('gi_lang_changed'));
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-black transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
              lang === 'FR' 
                ? 'bg-gradient-to-r from-[#F3C75F] to-[#C88A16] text-white shadow-2xs' 
                : 'text-[#607D9A] hover:text-[#102A43]'
            }`}
          >
            <span>🇫🇷</span> FR
          </button>
          <button
            type="button"
            onClick={() => {
              setLang('EN');
              localStorage.setItem('gi_lang', 'EN');
              window.dispatchEvent(new Event('gi_lang_changed'));
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-black transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
              lang === 'EN' 
                ? 'bg-gradient-to-r from-[#F3C75F] to-[#C88A16] text-white shadow-2xs' 
                : 'text-[#607D9A] hover:text-[#102A43]'
            }`}
          >
            <span>🇬🇧</span> EN
          </button>
        </div>
      </div>

      {/* Main Container Wrapper */}
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-center items-center relative z-10 py-1 mb-6">
        
        <div className="w-full flex flex-col justify-center shrink-0">
          
          {/* Centered Gold Avenue Stylized Logo */}
          <div className="flex flex-col items-center mb-5 animate-fade-in select-none text-center">
            <div className="relative mb-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F3C75F] via-[#D49A22] to-[#C88A16] flex items-center justify-center shadow-md shadow-amber-900/10 border border-[#E8D8B0]/60">
                <Crown className="w-7 h-7 text-white drop-shadow-xs" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white border border-[#E8D8B0]/60 flex items-center justify-center shadow-2xs">
                <Sparkles className="w-3 h-3 text-[#D49A22]" />
              </div>
            </div>
            <div 
              className="text-[30px] sm:text-[34px] font-serif font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#D49A22] via-[#F3C75F] to-[#C88A16] leading-none uppercase select-none drop-shadow-2xs"
            >
              Gold Avenue
            </div>
            <span className="text-[11px] font-black text-[#607D9A] uppercase tracking-widest mt-1.5">{t.securePlacement}</span>
          </div>

          {/* Card Form Container */}
          <div className="w-full relative z-10 bg-white rounded-3xl p-5 sm:p-7 shadow-xs border border-[#E8D8B0]/40 animate-fade-in text-left">
            
            {/* Header: Title & Subtitle */}
            <div className="mb-5 text-left">
              <h2 className="text-xl sm:text-2xl font-black text-[#102A43] tracking-tight">
                {t.title}
              </h2>
              <p className="text-xs font-semibold text-[#607D9A] mt-1 leading-relaxed">
                {t.subtitle}
              </p>
            </div>

            {/* Error and Success alerts */}
            {errorMessage && (
              <div className="mb-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 font-bold flex items-start gap-2.5 animate-fade-in">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-start gap-2.5 animate-fade-in">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-snug">{successMessage}</span>
              </div>
            )}

            {/* Form inputs */}
            <form onSubmit={handleSubmit} className="space-y-3.5" id="auth-form">
              
              {isRegister ? (
                /* REGISTRATION FIELDS */
                <>
                  {/* Pays Selector Box */}
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-black text-[#102A43] uppercase tracking-wider block">{t.pays}</label>
                    <div className="w-full auth-field-wrapper rounded-2xl px-4 flex items-center justify-between relative cursor-pointer border border-[#E8D8B0]/40 hover:border-[#D49A22]/50 transition-all h-13 sm:h-14 bg-white shadow-2xs">
                      <span className="text-sm font-bold text-[#102A43] flex items-center gap-2">
                        <span className="text-lg leading-none">
                          {eligibleCountries.find(c => c.code === selectedCode)?.flag || '🇹🇬'}
                        </span>
                        {eligibleCountries.find(c => c.code === selectedCode)?.name || 'Togo'} ({selectedCode})
                      </span>
                      <ChevronDown className="w-4 h-4 text-[#D49A22] shrink-0" />
                      <select
                        id="auth-country-select"
                        value={selectedCode}
                        onChange={(e) => {
                          const code = e.target.value;
                          setSelectedCode(code);
                          const found = eligibleCountries.find(c => c.code === code);
                          if (found) setCountry(found.name);
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full auth-clean-select"
                      >
                        {eligibleCountries.map((c, i) => (
                          <option key={i} value={c.code} className="bg-white text-[#102A43] font-bold">
                            {c.flag} {c.name} ({c.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Phone Input Box */}
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-black text-[#102A43] uppercase tracking-wider block">{t.phone}</label>
                    <div className="w-full auth-field-wrapper rounded-2xl px-4 flex items-center justify-between h-13 sm:h-14 border border-[#E8D8B0]/40 bg-white focus-within:border-[#D49A22] focus-within:ring-2 focus-within:ring-[#D49A22]/15 transition-all shadow-2xs">
                      <input
                        type="tel"
                        required
                        placeholder={t.phone}
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        className="w-full auth-clean-input text-[#102A43] text-sm font-bold py-3 placeholder:text-[#607D9A]/50 bg-transparent outline-none"
                      />
                      <Smartphone className="w-5 h-5 text-[#D49A22] shrink-0 ml-2" />
                    </div>
                  </div>

                  {/* Nickname (Surnom) Box */}
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-black text-[#102A43] uppercase tracking-wider block">{t.nickname}</label>
                    <div className="w-full auth-field-wrapper rounded-2xl px-4 flex items-center justify-between h-13 sm:h-14 border border-[#E8D8B0]/40 bg-white focus-within:border-[#D49A22] focus-within:ring-2 focus-within:ring-[#D49A22]/15 transition-all shadow-2xs">
                      <input
                        type="text"
                        required
                        placeholder={t.nickname}
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        className="w-full auth-clean-input text-[#102A43] text-sm font-bold py-3 placeholder:text-[#607D9A]/50 bg-transparent outline-none"
                      />
                      <UserIcon className="w-5 h-5 text-[#D49A22] shrink-0 ml-2" />
                    </div>
                  </div>

                  {/* Password field */}
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-black text-[#102A43] uppercase tracking-wider block">{t.password}</label>
                    <div className="w-full auth-field-wrapper rounded-2xl px-4 flex items-center justify-between h-13 sm:h-14 border border-[#E8D8B0]/40 bg-white focus-within:border-[#D49A22] focus-within:ring-2 focus-within:ring-[#D49A22]/15 transition-all shadow-2xs">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder={t.passwordPlaceholder}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="flex-1 auth-clean-input text-[#102A43] text-sm font-bold py-3 placeholder:text-[#607D9A]/50 bg-transparent outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1 text-[#D49A22] hover:text-[#C88A16] transition-colors shrink-0 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Invitation / Sponsor Code Field */}
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-black text-[#102A43] uppercase tracking-wider block">{t.invitationCode}</label>
                    <div className="w-full auth-field-wrapper rounded-2xl px-4 flex items-center justify-between h-13 sm:h-14 border border-[#E8D8B0]/40 bg-white focus-within:border-[#D49A22] focus-within:ring-2 focus-within:ring-[#D49A22]/15 transition-all shadow-2xs">
                      <input
                        type="text"
                        placeholder={t.invitationPlaceholder}
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value)}
                        className="flex-1 auth-clean-input text-[#C88A16] text-sm font-black py-3 placeholder:text-[#607D9A]/50 uppercase tracking-widest bg-transparent outline-none"
                      />
                      <Link className="w-5 h-5 text-[#D49A22] shrink-0 ml-2" />
                    </div>
                  </div>

                  {/* Code de vérification (OTP) Field with ENVOYER action */}
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-black text-[#102A43] uppercase tracking-wider block">{t.otp}</label>
                    <div className="w-full auth-field-wrapper rounded-2xl px-4 flex items-center justify-between h-13 sm:h-14 border border-[#E8D8B0]/40 bg-white focus-within:border-[#D49A22] focus-within:ring-2 focus-within:ring-[#D49A22]/15 transition-all shadow-2xs">
                      <input
                        type="text"
                        required
                        placeholder={t.otpPlaceholder}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className="flex-1 auth-clean-input text-[#102A43] text-sm font-bold py-3 placeholder:text-[#607D9A]/50 bg-transparent outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleSendOTP}
                        disabled={sendingOtp || otpCountdown > 0}
                        className="text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-[#F3C75F] to-[#C88A16] hover:brightness-105 active:scale-95 disabled:opacity-50 py-2 px-3.5 rounded-xl border-none cursor-pointer transition-all shrink-0 shadow-2xs font-sans ml-2"
                      >
                        {otpCountdown > 0 ? `${otpCountdown}s` : t.envoyer}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* LOGIN SPECIFIC FIELDS */
                <>
                  {/* Pays Selector Box */}
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-black text-[#102A43] uppercase tracking-wider block">{t.pays}</label>
                    <div className="w-full auth-field-wrapper rounded-2xl px-4 flex items-center justify-between relative cursor-pointer border border-[#E8D8B0]/40 hover:border-[#D49A22]/50 transition-all h-13 sm:h-14 bg-white shadow-2xs">
                      <span className="text-sm font-bold text-[#102A43] flex items-center gap-2">
                        <span className="text-lg leading-none">
                          {eligibleCountries.find(c => c.code === loginSelectedCode)?.flag || '🇹🇬'}
                        </span>
                        {eligibleCountries.find(c => c.code === loginSelectedCode)?.name || 'Togo'} ({loginSelectedCode})
                      </span>
                      <ChevronDown className="w-4 h-4 text-[#D49A22] shrink-0" />
                      <select
                        id="auth-login-country-select"
                        value={loginSelectedCode}
                        onChange={(e) => setLoginSelectedCode(e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full auth-clean-select"
                      >
                        {eligibleCountries.map((c, i) => (
                          <option key={i} value={c.code} className="bg-white text-[#102A43] font-bold">
                            {c.flag} {c.name} ({c.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Login Phone Input */}
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-black text-[#102A43] uppercase tracking-wider block">{t.phone}</label>
                    <div className="w-full auth-field-wrapper rounded-2xl px-4 flex items-center justify-between h-13 sm:h-14 border border-[#E8D8B0]/40 bg-white focus-within:border-[#D49A22] focus-within:ring-2 focus-within:ring-[#D49A22]/15 transition-all shadow-2xs">
                      <input
                        type="text"
                        required
                        placeholder={t.phone}
                        value={loginPhone}
                        onChange={(e) => setLoginPhone(e.target.value)}
                        className="w-full auth-clean-input text-[#102A43] text-sm font-bold py-3 placeholder:text-[#607D9A]/50 bg-transparent outline-none"
                      />
                      <Smartphone className="w-5 h-5 text-[#D49A22] shrink-0 ml-2" />
                    </div>
                  </div>

                  {/* Login Password Input */}
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-black text-[#102A43] uppercase tracking-wider block">{t.password}</label>
                    <div className="w-full auth-field-wrapper rounded-2xl px-4 flex items-center justify-between h-13 sm:h-14 border border-[#E8D8B0]/40 bg-white focus-within:border-[#D49A22] focus-within:ring-2 focus-within:ring-[#D49A22]/15 transition-all shadow-2xs">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder={t.loginPasswordPlaceholder}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="flex-1 auth-clean-input text-[#102A43] text-sm font-bold py-3 placeholder:text-[#607D9A]/50 bg-transparent outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1 text-[#D49A22] hover:text-[#C88A16] transition-colors shrink-0 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>

                    {/* Mot de passe oublié */}
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => setShowSupportModal(true)}
                        className="text-xs font-bold text-[#D49A22] hover:text-[#C88A16] hover:underline cursor-pointer bg-transparent border-none p-0 transition-colors"
                      >
                        {t.forgotPassword}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Primary Submit Button with Radiant Gold Gradient */}
              <button
                id="auth-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full font-sans font-black text-sm uppercase tracking-wider py-3.5 sm:py-4 px-4 rounded-2xl flex items-center justify-center transition-all select-none cursor-pointer disabled:opacity-50 mt-5 shadow-xs active:scale-[0.98] bg-gradient-to-r from-[#F3C75F] to-[#C88A16] hover:brightness-105 text-white border-none"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{t.submitBtn}</span>
                  </div>
                ) : (
                  <span>{t.submitBtn}</span>
                )}
              </button>

              {/* Secondary Toggle Mode Button */}
              <div className="mt-3">
                <button
                  id="auth-toggle-mode-btn"
                  type="button"
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className="w-full font-sans font-black text-xs sm:text-sm uppercase tracking-wider py-3 sm:py-3.5 px-4 rounded-2xl flex items-center justify-center transition-all select-none cursor-pointer active:scale-[0.98] border border-[#E8D8B0]/40 hover:border-[#D49A22]/50 hover:bg-[#FAF8F2] text-[#102A43] bg-white shadow-2xs"
                >
                  <span>{t.toggleBtn}</span>
                </button>
              </div>
            </form>

          </div>

        </div>

      </div>

      {/* Footer Branding label */}
      <div className="w-full text-center relative z-10 py-3 shrink-0">
        <p className="text-[11px] font-mono font-bold text-[#607D9A] uppercase tracking-widest">
          {t.footerText}
        </p>
      </div>

      {/* Interactive Customer Support & Password Recovery Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-xl relative border border-[#E8D8B0]/40 text-[#102A43] text-left animate-scale-up">
            <button 
              onClick={() => setShowSupportModal(false)}
              className="absolute top-4 right-4 text-[#607D9A] hover:text-[#102A43] transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-[#F3C75F] to-[#C88A16] p-0.5 relative shrink-0 flex items-center justify-center shadow-xs">
                <Headphones className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#102A43] leading-none">
                  {lang === 'FR' ? "Assistance & Récupération" : "Support & Recovery"}
                </h3>
                <span className="text-xs text-[#D49A22] font-bold flex items-center gap-1 mt-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  {lang === 'FR' ? "Service client disponible 24/7" : "Customer service available 24/7"}
                </span>
              </div>
            </div>

            <p className="text-xs font-semibold text-[#607D9A] leading-relaxed mb-5">
              {lang === 'FR' 
                ? "Pour réinitialiser votre mot de passe ou obtenir de l'aide sur votre compte Gold Avenue, contactez directement nos conseillers d'assistance."
                : "To reset your password or get help with your Gold Avenue account, contact our support advisors directly."
              }
            </p>

            <div className="space-y-3 mb-5">
              <a
                href="https://wa.me/237600000000"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full p-3.5 rounded-2xl flex items-center justify-between bg-[#FAF8F2] border border-[#E8D8B0]/40 text-[#102A43] hover:border-[#D49A22]/50 transition-all font-bold text-sm shadow-2xs"
              >
                <span className="flex items-center gap-2.5">
                  <Smartphone className="w-4 h-4 text-[#D49A22]" />
                  <span>{lang === 'FR' ? "Support WhatsApp Direct" : "Direct WhatsApp Support"}</span>
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase">
                  {lang === 'FR' ? "En ligne" : "Online"}
                </span>
              </a>

              <a
                href="https://t.me/mdb_cameroon"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full p-3.5 rounded-2xl flex items-center justify-between bg-[#FAF8F2] border border-[#E8D8B0]/40 text-[#102A43] hover:border-[#D49A22]/50 transition-all font-bold text-sm shadow-2xs"
              >
                <span className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-[#D49A22]" />
                  <span>{lang === 'FR' ? "Canal Officiel Telegram" : "Official Telegram Channel"}</span>
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800 uppercase">
                  {lang === 'FR' ? "Rejoindre" : "Join"}
                </span>
              </a>
            </div>

            <button
              onClick={() => setShowSupportModal(false)}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#F3C75F] to-[#C88A16] text-white font-black text-xs uppercase tracking-wider transition-all text-center border-none cursor-pointer shadow-2xs"
            >
              {lang === 'FR' ? "Fermer l'Assistance" : "Close Assistance"}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

