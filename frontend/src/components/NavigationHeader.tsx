import React, { useState, useRef, useEffect } from 'react';
import { ScreenId, UserProfile } from '../types';
import { 
  Building2, 
  Smartphone, 
  ScanLine, 
  Truck, 
  Store, 
  Factory, 
  Network, 
  Maximize2, 
  Minimize2,
  Search,
  KeyRound,
  User,
  Globe,
  ChevronDown
} from 'lucide-react';
import { useLanguage, SUPPORTED_LANGUAGES, Language } from '../i18n/LanguageContext';

interface NavigationHeaderProps {
  currentScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
  isMobileFrame: boolean;
  onToggleMobileFrame: () => void;
  onOpenSearch: () => void;
  onShowToast: (msg: string) => void;
  currentUser?: UserProfile | null;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  currentScreen,
  onSelectScreen,
  isMobileFrame,
  onToggleMobileFrame,
  onOpenSearch,
  onShowToast,
  currentUser
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  // Close language dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
        setShowLangDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const screens: { 
    id: ScreenId; 
    labelKey: string; 
    defaultLabel: string; 
    icon: React.ReactNode; 
    badge?: string; 
    category: 'Enterprise' | 'Customer' | 'Pharmacy' | 'Manufacturer' | 'Architecture' | 'Auth' 
  }[] = [
    { id: 'enterprise-ops', labelKey: 'enterpriseGateway', defaultLabel: 'Enterprise Gateway', icon: <Building2 className="w-4 h-4" />, badge: 'CDSCO', category: 'Enterprise' },
    { id: 'customer-app', labelKey: 'customerSearch', defaultLabel: 'Customer Search', icon: <Smartphone className="w-4 h-4" />, category: 'Customer' },
    { id: 'rx-scanner', labelKey: 'rxScanner', defaultLabel: 'Prescription OCR', icon: <ScanLine className="w-4 h-4" />, badge: 'AI', category: 'Customer' },
    { id: 'order-tracking', labelKey: 'liveOrderTrack', defaultLabel: 'Live Order Track', icon: <Truck className="w-4 h-4" />, badge: '8410', category: 'Customer' },
    { id: 'pharmacy-portal', labelKey: 'pharmacyWorkbench', defaultLabel: 'Pharmacy Workbench', icon: <Store className="w-4 h-4" />, badge: '18', category: 'Pharmacy' },
    { id: 'manufacturer-portal', labelKey: 'manufacturerPortal', defaultLabel: 'Manufacturer Portal', icon: <Factory className="w-4 h-4" />, category: 'Manufacturer' },
    { id: 'system-architecture', labelKey: 'systemArchitecture', defaultLabel: 'System Architecture', icon: <Network className="w-4 h-4" />, category: 'Architecture' },
    { id: 'auth', labelKey: 'signInRegister', defaultLabel: 'Login & Register', icon: <KeyRound className="w-4 h-4" />, badge: currentUser ? (currentUser.role === 'patient' ? 'Citizen' : 'Verified') : 'OTP', category: 'Auth' }
  ];

  const isConsumerScreen = currentScreen === 'customer-app' || currentScreen === 'rx-scanner' || currentScreen === 'order-tracking' || currentScreen === 'auth';

  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];

  const handleSelectLanguage = (code: Language) => {
    setLanguage(code);
    setShowLangDropdown(false);
    const selected = SUPPORTED_LANGUAGES.find(l => l.code === code);
    onShowToast(`Language switched to ${selected?.nativeName || selected?.name} (${selected?.flag})`);
  };

  return (
    <div className="bg-[#001026] text-white border-b border-[#0b2545] sticky top-0 z-50 shadow-md">
      <div className="max-w-[1920px] mx-auto px-3 sm:px-5 h-12 sm:h-13 flex items-center justify-between gap-2 sm:gap-4 overflow-hidden">
        {/* Brand & India Badge */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div 
            className="flex items-center gap-2 cursor-pointer group" 
            onClick={() => onSelectScreen('customer-app')}
            title="GenericMed Bharat - Jan Aushadhi & CDSCO Bio-Equivalence"
          >
            <div className="w-7 h-7 rounded-lg bg-[#0b2545] border border-[#6cf8bb]/40 flex items-center justify-center text-[#6cf8bb] font-bold text-sm shadow-sm group-hover:border-[#6cf8bb] transition-all">
              <span className="material-symbols-outlined text-[18px]">health_and_safety</span>
            </div>
            <div className="leading-tight">
              <span className="text-xs font-extrabold tracking-tight text-white flex items-center gap-1.5">
                <span>{t('appName', 'GenericMed Bharat')}</span>
                <span className="text-xs">🇮🇳</span>
                <span className="hidden xl:inline text-[9px] font-mono px-1.5 py-0.2 bg-[#006c49]/30 text-[#6cf8bb] border border-[#006c49]/60 rounded-full font-bold">
                  {t('badgeText', 'PMBJP & CDSCO')}
                </span>
              </span>
            </div>
          </div>

          <div className="hidden lg:block h-4 w-px bg-white/20"></div>
        </div>

        {/* Screen Tabs List - Smooth horizontal scroll */}
        <div className="flex-1 min-w-0 flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
          {screens.map((screen) => {
            const active = currentScreen === screen.id;
            const label = t(screen.labelKey, screen.defaultLabel);
            return (
              <button
                key={screen.id}
                onClick={() => onSelectScreen(screen.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150 flex-shrink-0 ${
                  active
                    ? 'bg-[#006c49] text-white font-bold shadow-sm ring-1 ring-[#6cf8bb]/50'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {screen.icon}
                <span className="hidden md:inline">{label}</span>
                <span className="md:hidden">{label.split(' ')[0]}</span>
                {screen.badge && (
                  <span className={`text-[10px] px-1 py-0.1 rounded font-mono font-bold ${
                    active ? 'bg-[#6cf8bb] text-[#002113]' : 'bg-white/15 text-slate-200'
                  }`}>
                    {screen.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right side utilities: Indian Language Switcher, User Account Pill, Frame Toggle, Search */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Multi-Language Dropdown Switcher */}
          <div className="relative" ref={langDropdownRef}>
            <button
              type="button"
              onClick={() => setShowLangDropdown(!showLangDropdown)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-[#0b2545] hover:bg-[#163a66] text-[#6cf8bb] border border-[#6cf8bb]/30 transition-all shadow-xs"
              title="Change Language / भाषा बदला / भाषा बदलें"
            >
              <Globe className="w-3.5 h-3.5 text-[#6cf8bb]" />
              <span className="font-bold text-[11px]">{currentLangObj.nativeName}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showLangDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showLangDropdown && (
              <div className="absolute right-0 mt-1 w-44 bg-[#001738] border border-[#6cf8bb]/40 rounded-xl shadow-2xl z-50 py-1 overflow-hidden backdrop-blur-md">
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-white/10">
                  Select Language / भाषा:
                </div>
                {SUPPORTED_LANGUAGES.map((langItem) => {
                  const isSelected = language === langItem.code;
                  return (
                    <button
                      key={langItem.code}
                      onClick={() => handleSelectLanguage(langItem.code)}
                      className={`w-full text-left px-2.5 py-1.5 text-xs flex items-center justify-between transition-colors ${
                        isSelected 
                          ? 'bg-[#006c49] text-white font-bold' 
                          : 'text-slate-200 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{langItem.flag}</span>
                        <span>{langItem.nativeName}</span>
                      </div>
                      <span className="text-[10px] opacity-75">{langItem.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* User Account / Sign In Pill */}
          <button
            onClick={() => onSelectScreen('auth')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
              currentScreen === 'auth'
                ? 'bg-[#006c49] border-[#6cf8bb] text-white'
                : 'bg-white/10 hover:bg-white/20 border-white/10 text-slate-200'
            }`}
            title={currentUser ? `Signed in as ${currentUser.name} (${currentUser.role})` : 'Sign In / Register'}
          >
            <User className="w-3.5 h-3.5 text-[#6cf8bb]" />
            <span className="hidden sm:inline truncate max-w-[110px]">
              {currentUser ? currentUser.name : t('signIn', 'Sign In')}
            </span>
            {currentUser && (
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#6cf8bb]/20 text-[#6cf8bb] font-bold uppercase hidden md:inline">
                {currentUser.role.replace('_', ' ')}
              </span>
            )}
          </button>

          {isConsumerScreen && (
            <button
              onClick={onToggleMobileFrame}
              title={isMobileFrame ? 'Switch to Full-Width Responsive View' : 'Switch to Mobile Portrait Device Frame'}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-slate-200 transition-colors border border-white/10"
            >
              {isMobileFrame ? (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-[#6cf8bb]" />
                  <span className="hidden sm:inline">Expanded</span>
                </>
              ) : (
                <>
                  <Minimize2 className="w-3.5 h-3.5 text-[#6cf8bb]" />
                  <span className="hidden sm:inline">Phone</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={onOpenSearch}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-white/10 hover:bg-white/20 text-slate-300 border border-white/10 transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="text-[10px] bg-white/15 px-1 rounded text-slate-300">⌘K</kbd>
          </button>
        </div>
      </div>
    </div>
  );
};
