import React from 'react';
import { ScreenId } from '../types';
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
  Bell,
  Search,
  SlidersHorizontal
} from 'lucide-react';

interface NavigationHeaderProps {
  currentScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
  isMobileFrame: boolean;
  onToggleMobileFrame: () => void;
  onOpenSearch: () => void;
  onShowToast: (msg: string) => void;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  currentScreen,
  onSelectScreen,
  isMobileFrame,
  onToggleMobileFrame,
  onOpenSearch,
  onShowToast
}) => {
  const screens: { id: ScreenId; label: string; icon: React.ReactNode; badge?: string; category: 'Enterprise' | 'Customer' | 'Pharmacy' | 'Manufacturer' | 'Architecture' }[] = [
    { id: 'enterprise-ops', label: 'Enterprise Gateway', icon: <Building2 className="w-4 h-4" />, badge: 'SOC-2', category: 'Enterprise' },
    { id: 'customer-app', label: 'Customer Search', icon: <Smartphone className="w-4 h-4" />, category: 'Customer' },
    { id: 'rx-scanner', label: 'Prescription OCR', icon: <ScanLine className="w-4 h-4" />, badge: 'AI', category: 'Customer' },
    { id: 'order-tracking', label: 'Live Order Track', icon: <Truck className="w-4 h-4" />, badge: '8410', category: 'Customer' },
    { id: 'pharmacy-portal', label: 'Pharmacy Workbench', icon: <Store className="w-4 h-4" />, badge: '18', category: 'Pharmacy' },
    { id: 'manufacturer-portal', label: 'Manufacturer Portal', icon: <Factory className="w-4 h-4" />, category: 'Manufacturer' },
    { id: 'system-architecture', label: 'System Architecture', icon: <Network className="w-4 h-4" />, category: 'Architecture' }
  ];

  const isConsumerScreen = currentScreen === 'customer-app' || currentScreen === 'rx-scanner' || currentScreen === 'order-tracking';

  return (
    <div className="bg-[#001026] text-white border-b border-[#0b2545] sticky top-0 z-50 shadow-md">
      <div className="max-w-[1920px] mx-auto px-3 sm:px-5 py-2 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Mode Switcher Label */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#0b2545] border border-[#6cf8bb]/40 flex items-center justify-center text-[#6cf8bb] font-bold text-sm">
              <span className="material-symbols-outlined text-[18px]">health_and_safety</span>
            </div>
            <div className="leading-tight">
              <span className="text-xs font-extrabold tracking-tight text-white flex items-center gap-1.5">
                GenericMed
                <span className="text-[9px] font-mono px-1.5 py-0.2 bg-[#006c49]/30 text-[#6cf8bb] border border-[#006c49]/60 rounded-full font-bold">
                  MULTI-SCREEN DEMO
                </span>
              </span>
            </div>
          </div>

          <div className="hidden md:block h-4 w-px bg-white/20"></div>

          {/* Screen Tabs List */}
          <div className="flex items-center gap-1 overflow-x-auto py-0.5 max-w-full scrollbar-none">
            {screens.map((screen) => {
              const active = currentScreen === screen.id;
              return (
                <button
                  key={screen.id}
                  onClick={() => onSelectScreen(screen.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150 ${
                    active
                      ? 'bg-[#006c49] text-white font-bold shadow-sm ring-1 ring-[#6cf8bb]/50'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {screen.icon}
                  <span>{screen.label}</span>
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
        </div>

        {/* Right side utilities: Frame toggle for mobile screens, quick search, toast trigger */}
        <div className="flex items-center gap-2">
          {isConsumerScreen && (
            <button
              onClick={onToggleMobileFrame}
              title={isMobileFrame ? 'Switch to Full-Width Responsive View' : 'Switch to Mobile Portrait Device Frame'}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-slate-200 transition-colors border border-white/10"
            >
              {isMobileFrame ? (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-[#6cf8bb]" />
                  <span className="hidden sm:inline">Expanded View</span>
                </>
              ) : (
                <>
                  <Minimize2 className="w-3.5 h-3.5 text-[#6cf8bb]" />
                  <span className="hidden sm:inline">Phone Frame</span>
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
