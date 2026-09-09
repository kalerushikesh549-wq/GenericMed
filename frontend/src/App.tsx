import React, { useState, useEffect } from 'react';
import { ScreenId, UserProfile } from './types';
import { NavigationHeader } from './components/NavigationHeader';
import { EnterpriseOpsScreen } from './components/screens/EnterpriseOpsScreen';
import { CustomerAppScreen } from './components/screens/CustomerAppScreen';
import { RxScannerScreen } from './components/screens/RxScannerScreen';
import { OrderTrackingScreen } from './components/screens/OrderTrackingScreen';
import { PharmacyPortalScreen } from './components/screens/PharmacyPortalScreen';
import { ManufacturerPortalScreen } from './components/screens/ManufacturerPortalScreen';
import { SystemArchitectureScreen } from './components/screens/SystemArchitectureScreen';
import { AuthScreen } from './components/screens/AuthScreen';
import { MEDICINES, DEMO_USERS } from './data/mockData';

export function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('enterprise-ops');
  const [isMobileFrame, setIsMobileFrame] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(DEMO_USERS[0]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [globalSearchInput, setGlobalSearchInput] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
  };

  const handleRegister = (newUser: UserProfile) => {
    setCurrentUser(newUser);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // Auto-dismiss toast
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Global ⌘K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowGlobalSearch(prev => !prev);
      }
      if (e.key === 'Escape') {
        setShowGlobalSearch(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectScreen = (screen: ScreenId) => {
    setCurrentScreen(screen);
    // If switching to mobile screens, default to phone frame on desktop screens
    if ((screen === 'customer-app' || screen === 'rx-scanner' || screen === 'order-tracking') && window.innerWidth > 1024) {
      // keep user frame preference
    }
  };

  const filteredMedicines = MEDICINES.filter(m => 
    m.brandName.toLowerCase().includes(globalSearchInput.toLowerCase()) ||
    m.genericName.toLowerCase().includes(globalSearchInput.toLowerCase()) ||
    m.activeSalt.toLowerCase().includes(globalSearchInput.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9ff] text-[#0b1c30]">
      {/* Top Universal Screen/Role Navigation Header */}
      <NavigationHeader
        currentScreen={currentScreen}
        onSelectScreen={handleSelectScreen}
        isMobileFrame={isMobileFrame}
        onToggleMobileFrame={() => setIsMobileFrame(!isMobileFrame)}
        onOpenSearch={() => setShowGlobalSearch(true)}
        onShowToast={showToast}
        currentUser={currentUser}
      />

      {/* Screen View Canvas */}
      <div className="flex-1 flex flex-col">
        {currentScreen === 'enterprise-ops' && (
          <EnterpriseOpsScreen
            onNavigateScreen={handleSelectScreen}
            onShowToast={showToast}
          />
        )}

        {currentScreen === 'customer-app' && (
          <CustomerAppScreen
            onNavigateScreen={handleSelectScreen}
            onShowToast={showToast}
            isMobileFrame={isMobileFrame}
            currentUser={currentUser}
          />
        )}

        {currentScreen === 'rx-scanner' && (
          <RxScannerScreen
            onNavigateScreen={handleSelectScreen}
            onShowToast={showToast}
            isMobileFrame={isMobileFrame}
          />
        )}

        {currentScreen === 'order-tracking' && (
          <OrderTrackingScreen
            onNavigateScreen={handleSelectScreen}
            onShowToast={showToast}
            isMobileFrame={isMobileFrame}
          />
        )}

        {currentScreen === 'pharmacy-portal' && (
          <PharmacyPortalScreen
            onNavigateScreen={handleSelectScreen}
            onShowToast={showToast}
          />
        )}

        {currentScreen === 'manufacturer-portal' && (
          <ManufacturerPortalScreen
            onNavigateScreen={handleSelectScreen}
            onShowToast={showToast}
          />
        )}

        {currentScreen === 'system-architecture' && (
          <SystemArchitectureScreen
            onNavigateScreen={handleSelectScreen}
            onShowToast={showToast}
          />
        )}

        {currentScreen === 'auth' && (
          <AuthScreen
            currentUser={currentUser}
            onLogin={handleLogin}
            onRegister={handleRegister}
            onLogout={handleLogout}
            onNavigateScreen={handleSelectScreen}
            onShowToast={showToast}
            isMobileFrame={isMobileFrame}
          />
        )}
      </div>

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce">
          <div className="bg-[#001026] text-white px-4 py-3 rounded-2xl shadow-2xl border border-[#6cf8bb]/40 flex items-center gap-3 max-w-md">
            <span className="material-symbols-outlined text-[#6cf8bb] text-[20px]">info</span>
            <span className="text-xs font-medium text-slate-100">{toastMessage}</span>
            <button 
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white ml-2"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        </div>
      )}

      {/* Global ⌘K Command Search Modal */}
      {showGlobalSearch && (
        <div className="fixed inset-0 z-50 bg-[#001026]/70 backdrop-blur-xs flex items-start justify-center pt-20 p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-[#c4c6cf] overflow-hidden">
            <div className="p-3 border-b flex items-center gap-2 bg-[#f8f9ff]">
              <span className="material-symbols-outlined text-[#74777f]">search</span>
              <input
                type="text"
                autoFocus
                value={globalSearchInput}
                onChange={(e) => setGlobalSearchInput(e.target.value)}
                placeholder="Search medicines, NDC, prescriptions, or screens..."
                className="flex-1 bg-transparent border-none text-xs sm:text-sm text-[#0b1c30] focus:ring-0 focus:outline-none"
              />
              <kbd className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-700">ESC</kbd>
            </div>

            <div className="p-3 max-h-80 overflow-y-auto space-y-2 text-xs">
              <div className="text-[10px] font-bold uppercase text-[#74777f] px-2">Navigate Screens:</div>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'enterprise-ops' as ScreenId, name: '🏢 Enterprise Gateway' },
                  { id: 'customer-app' as ScreenId, name: '📱 Customer Search & Compare' },
                  { id: 'rx-scanner' as ScreenId, name: '📷 Prescription OCR Scanner' },
                  { id: 'order-tracking' as ScreenId, name: '🚚 Live Order Tracking' },
                  { id: 'pharmacy-portal' as ScreenId, name: '🏥 Pharmacy Workbench' },
                  { id: 'manufacturer-portal' as ScreenId, name: '🏭 Manufacturer Portal' },
                  { id: 'system-architecture' as ScreenId, name: '🗺️ System Architecture' },
                  { id: 'auth' as ScreenId, name: '🔐 Login & Register / Account' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentScreen(item.id);
                      setShowGlobalSearch(false);
                      showToast(`Navigated to ${item.name}`);
                    }}
                    className="p-2 text-left rounded-lg bg-[#eff4ff] hover:bg-[#dce9ff] text-[#001026] font-semibold"
                  >
                    {item.name}
                  </button>
                ))}
              </div>

              <div className="text-[10px] font-bold uppercase text-[#74777f] px-2 pt-2">Molecules &amp; Medications:</div>
              <div className="space-y-1">
                {filteredMedicines.map(med => (
                  <div
                    key={med.id}
                    onClick={() => {
                      setCurrentScreen('customer-app');
                      setShowGlobalSearch(false);
                      showToast(`Viewing generic substitution for ${med.brandName}`);
                    }}
                    className="p-2 rounded-lg hover:bg-[#eff4ff] cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-[#001026]">{med.brandName} → {med.genericName}</div>
                      <div className="text-[11px] text-[#44474e]">{med.activeSalt}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-[#006c49] bg-[#006c49]/10 px-2 py-0.5 rounded">
                        Save {med.savingsPercentage}%
                      </span>
                      <div className="text-xs font-bold text-[#001026] mt-0.5">${med.genericPrice.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
