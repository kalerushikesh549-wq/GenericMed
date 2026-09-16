import React, { useEffect, useState } from 'react';
import { MEDICINES, PHARMACY_HUBS, CURRENT_ORDER } from '../../data/mockData';
import { ScreenId, CustomerTab, InsuranceAdjudicationQuote, MedicineItem, UserProfile } from '../../types';
import { paymentsApi } from '../../services/api';
import { formatINR } from '../../utils/formatters';
import { useLanguage } from '../../i18n/LanguageContext';

interface CustomerAppScreenProps {
  onNavigateScreen: (screen: ScreenId) => void;
  onShowToast: (msg: string) => void;
  isMobileFrame?: boolean;
  currentUser?: UserProfile | null;
}

export const CustomerAppScreen: React.FC<CustomerAppScreenProps> = ({
  onNavigateScreen,
  onShowToast,
  isMobileFrame = false,
  currentUser
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<CustomerTab>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPill, setSelectedPill] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(2);
  const [showBioReportModal, setShowBioReportModal] = useState<MedicineItem | null>(null);
  const [insuranceQuotes, setInsuranceQuotes] = useState<Record<string, InsuranceAdjudicationQuote>>({});

  useEffect(() => {
    let active = true;
    void Promise.all(MEDICINES.map(async medicine => [medicine.id, await paymentsApi.getInsuranceQuote(Math.round(medicine.genericPrice * 100))] as const)).then(entries => {
      if (active) setInsuranceQuotes(Object.fromEntries(entries));
    });
    return () => { active = false; };
  }, []);

  const filteredMedicines = MEDICINES.filter(med => {
    if (selectedPill) {
      return med.genericName.toLowerCase().includes(selectedPill.toLowerCase()) ||
             med.brandName.toLowerCase().includes(selectedPill.toLowerCase()) ||
             med.activeSalt.toLowerCase().includes(selectedPill.toLowerCase());
    }
    if (searchQuery.trim()) {
      return med.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
             med.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
             med.activeSalt.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const handleAddToCart = (med: MedicineItem) => {
    setCartCount(prev => prev + 1);
    onShowToast(`Added ${med.genericName} to cart (${formatINR(med.genericPrice)})!`);
  };

  const deliveryCity = currentUser?.city || 'Pune';
  const deliveryPincode = currentUser?.pincode || '411016';
  const deliveryState = currentUser?.state || 'Maharashtra';

  const content = (
    <div className="bg-[#f8f9ff] text-[#0b1c30] min-h-full flex flex-col font-body text-sm selection:bg-[#6cf8bb] selection:text-[#002113] pb-24">
      {/* Top Location / Express Ribbon */}
      <div className="bg-[#001026] text-white px-4 py-2 text-xs flex items-center justify-between border-b border-[#0b2545]">
        <div className="flex items-center gap-1.5 font-medium truncate">
          <span className="material-symbols-outlined text-[16px] text-[#6cf8bb]">location_on</span>
          <span>{t('deliveringTo', 'Delivering to')} <strong className="text-white">{deliveryCity}, {deliveryState} - {deliveryPincode}</strong></span>
          <span className="text-[#6ffbbe] hidden sm:inline">• {t('expressDelivery', '35-min Express')}</span>
        </div>
        <button 
          onClick={() => onShowToast(`Current Hub: Jan Aushadhi Kendra #108 (${deliveryCity} ${deliveryPincode}). 4 partner hubs online.`)}
          className="text-[11px] text-[#6cf8bb] hover:underline font-semibold flex items-center gap-0.5"
        >
          {t('changeLocation', 'Change')} <span className="material-symbols-outlined text-[14px]">expand_more</span>
        </button>
      </div>

      {/* Header Bar */}
      <header className="bg-white border-b border-[#c4c6cf]/60 px-4 sm:px-6 py-2.5 sticky top-0 z-30 shadow-xs">
        <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto">
          {/* Logo & Slogan */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0b2545] flex items-center justify-center text-[#6cf8bb] shadow-xs">
              <span className="material-symbols-outlined text-[20px]">health_and_safety</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-extrabold text-[#001026] text-base leading-tight">
                  {t('appName', 'GenericMed Bharat')}
                </span>
                <span className="text-xs">🇮🇳</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 bg-[#006c49]/15 text-[#006c49] rounded-full">
                  {t('badgeText', 'PMBJP & CDSCO')}
                </span>
              </div>
              <p className="hidden sm:block text-[11px] text-[#44474e]">Same active molecules (IP). Up to 80% lower cost.</p>
            </div>
          </div>

          {/* Desktop Web Nav Links */}
          <div className="hidden md:flex items-center gap-1 text-xs font-semibold text-[#44474e]">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'home' ? 'bg-[#001026] text-white' : 'hover:bg-[#eff4ff]'}`}
            >
              Browse Catalog
            </button>
            <button
              onClick={() => onNavigateScreen('rx-scanner')}
              className="px-3 py-1.5 rounded-lg hover:bg-[#eff4ff] text-[#006c49] flex items-center gap-1 transition-colors font-bold"
            >
              <span className="material-symbols-outlined text-[16px]">document_scanner</span>
              <span>AI Rx Scanner</span>
            </button>
            <button
              onClick={() => onNavigateScreen('order-tracking')}
              className="px-3 py-1.5 rounded-lg hover:bg-[#eff4ff] text-[#001026] flex items-center gap-1.5 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-[#006c49] animate-pulse"></span>
              <span>Track #{CURRENT_ORDER.orderNumber}</span>
            </button>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button 
              onClick={() => onNavigateScreen('auth')}
              className="px-2.5 py-1.5 rounded-xl bg-[#eff4ff] text-[#001026] text-xs font-semibold hover:bg-[#e5eeff] transition-colors flex items-center gap-1.5 border border-[#c4c6cf]/50"
              title={currentUser ? `Logged in as ${currentUser.name}` : 'Sign In / Register'}
            >
              <span className="material-symbols-outlined text-[16px] text-[#006c49]">account_circle</span>
              <span className="max-w-[100px] truncate">{currentUser ? currentUser.name.split(' ')[0] : t('signIn', 'Sign In')}</span>
            </button>

            <button 
              onClick={() => onShowToast(`Cart (${cartCount} items): Total ${formatINR(142.50)}. Free Jan Aushadhi express courier applied!`)}
              className="h-8 px-2.5 rounded-xl bg-[#006c49] text-white hover:bg-[#006c49]/90 flex items-center justify-center gap-1.5 text-xs font-bold shadow-xs transition-colors"
            >
              <span className="material-symbols-outlined text-[17px]">shopping_cart</span>
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="bg-[#6cf8bb] text-[#002113] text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Page Scrollable Content */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-4 space-y-4 flex-1">
        {/* Web Split Grid: Main Feed & Sticky Desktop Sidebar */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-6 items-start">
          {/* Left / Center Column (8 cols on web) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Search Bar Section */}
            <div className="space-y-2">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#74777f]">
                  <span className="material-symbols-outlined text-[20px]">search</span>
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedPill(null);
                  }}
                  placeholder={t('searchPlaceholder', 'Search Indian medicines (e.g. Dolo 650, Augmentin, generic salt, pin code)...')}
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#c4c6cf] rounded-2xl text-xs sm:text-sm text-[#0b1c30] placeholder:text-[#74777f] shadow-xs focus:ring-2 focus:ring-[#006c49]/40 focus:border-[#006c49] focus:outline-none"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#74777f] hover:text-[#0b1c30]"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                )}
              </div>

              {/* Quick Molecule Pills (Indian therapeutic categories) */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                <span className="text-[11px] font-bold text-[#44474e] whitespace-nowrap pl-1">Categories:</span>
                {[
                  { name: 'Paracetamol', label: 'Fever & Pain (75% off)' },
                  { name: 'Amoxicillin', label: 'Antibiotics (72% off)' },
                  { name: 'Pantoprazole', label: 'Acidity / Gas (75% off)' },
                  { name: 'Metformin', label: 'Diabetes Care (78% off)' },
                  { name: 'Telmisartan', label: 'BP / Heart (80% off)' },
                  { name: 'Azithromycin', label: 'Anti-Infective (71% off)' }
                ].map((pill) => {
                  const active = selectedPill === pill.name;
                  return (
                    <button
                      key={pill.name}
                      onClick={() => {
                        setSelectedPill(active ? null : pill.name);
                        setSearchQuery('');
                      }}
                      className={`px-3 py-1 rounded-full font-medium whitespace-nowrap flex items-center gap-1.5 transition-all text-xs ${
                        active
                          ? 'bg-[#001026] text-white'
                          : 'bg-white border border-[#c4c6cf]/80 text-[#0b1c30] hover:bg-[#eff4ff]'
                      }`}
                    >
                      <span>{pill.name}</span>
                      <span className={`text-[10px] font-bold ${active ? 'text-[#6cf8bb]' : 'text-[#006c49]'}`}>
                        {pill.label.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Prescription Quick Upload Banner Card */}
            <div className="bg-gradient-to-r from-[#001026] via-[#0b2545] to-[#002113] rounded-2xl p-4 text-white shadow-md relative overflow-hidden">
              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-[#6cf8bb] text-[#002113] uppercase tracking-wide">
                      AI Salt-Matching Engine
                    </span>
                    <span className="text-[10px] text-[#6ffbbe]">CDSCO Form 20/21 Verified</span>
                  </div>
                  <h2 className="text-base font-display font-bold">Have a Doctor&apos;s Prescription?</h2>
                  <p className="text-xs text-slate-300 max-w-lg">
                    Upload paper Rx from any Indian clinic or hospital. Our AI extracts active salt molecules and maps them directly to Jan Aushadhi generic equivalents, saving up to 80%.
                  </p>
                </div>

                <button
                  onClick={() => onNavigateScreen('rx-scanner')}
                  className="px-4 py-2 bg-[#006c49] hover:bg-[#006c49]/90 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-[17px]">document_scanner</span>
                  <span>Scan &amp; Upload Rx</span>
                </button>
              </div>
            </div>

            {/* Section: Live Indian Medicine Price Comparison & Jan Aushadhi Equivalence Cards */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-display font-bold text-[#001026] flex items-center gap-2">
                  <span>Jan Aushadhi Generic Substitutions</span>
                  <span className="text-xs font-normal text-[#44474e]">({filteredMedicines.length} Available in {deliveryCity})</span>
                </h3>
                <span className="text-xs text-[#006c49] font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px]">verified</span> CDSCO &amp; PMBJP Matrix
                </span>
              </div>

              {/* Cards Grid: 2 columns on tablet/desktop */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredMedicines.map((med) => (
                  <div 
                    key={med.id}
                    className="bg-white rounded-2xl border border-[#c4c6cf]/80 p-3.5 shadow-xs hover:border-[#006c49]/60 transition-all flex flex-col justify-between space-y-3"
                  >
                    {/* Card Top: Badges & Savings Pill */}
                    <div className="flex items-center justify-between flex-wrap gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#006c49]/15 text-[#006c49] border border-[#006c49]/30">
                          {med.bioEquivalenceScore}% Match
                        </span>
                        <span className="text-[10px] text-[#44474e]">{med.form}</span>
                      </div>
                      <div className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#6cf8bb] text-[#002113]">
                        {t('savingsPill', 'Save')} {med.savingsPercentage}%
                      </div>
                    </div>

                    {/* Comparison Columns */}
                    <div className="grid grid-cols-2 gap-2 pt-0.5">
                      {/* Brand Box */}
                      <div className="p-2.5 rounded-xl bg-[#f8f9ff] border border-[#c4c6cf]/50 flex flex-col justify-between">
                        <div>
                          <span className="text-[9px] font-bold text-[#74777f] uppercase tracking-wider block">
                            {t('brandName', 'Brand MRP')}
                          </span>
                          <h4 className="font-display font-bold text-[#0b1c30] text-sm mt-0.5 truncate">{med.brandName}</h4>
                          <p className="text-[10px] text-[#44474e] truncate">{med.brandManufacturer}</p>
                        </div>
                        <div className="mt-1.5 text-base font-bold text-[#74777f] line-through">
                          {formatINR(med.brandPrice)}
                        </div>
                      </div>

                      {/* Generic Box */}
                      <div className="p-2.5 rounded-xl bg-[#e5eeff]/50 border-2 border-[#006c49] relative flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold text-[#006c49] uppercase tracking-wider">
                              Jan Aushadhi
                            </span>
                            <span className="material-symbols-outlined text-[14px] text-[#006c49]">verified</span>
                          </div>
                          <h4 className="font-display font-bold text-[#001026] text-sm mt-0.5 truncate">{med.genericName}</h4>
                          <p className="text-[10px] text-[#44474e] truncate">{med.genericManufacturer}</p>
                        </div>
                        <div className="mt-1.5 text-base font-display font-extrabold text-[#006c49]">
                          {formatINR(med.genericPrice)}
                        </div>
                      </div>
                    </div>

                    {/* Active Molecule Scientific Formula */}
                    <div className="p-2 rounded-lg bg-[#eff4ff] text-[10px] text-[#0b1c30] flex items-center justify-between">
                      <div className="truncate">
                        <strong className="text-[#001026]">API Salt:</strong> {med.activeSalt}
                      </div>
                      <button 
                        onClick={() => setShowBioReportModal(med)}
                        className="text-[#001026] font-bold underline hover:text-[#006c49] whitespace-nowrap ml-2"
                      >
                        {t('clinicalReport', 'Clinical Dossier')}
                      </button>
                    </div>

                    {/* Bottom Order Bar */}
                    <div className="flex items-center justify-between pt-0.5 gap-2">
                      <div className="text-[10px] text-[#44474e] flex items-center gap-1 truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#006c49] flex-shrink-0"></span>
                        <span className="truncate">In Stock • Jan Aushadhi Hub #{deliveryPincode}</span>
                      </div>
                      <button
                        onClick={() => handleAddToCart(med)}
                        className="px-3 py-1.5 rounded-xl bg-[#001026] hover:bg-[#0b2545] text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-all flex-shrink-0"
                      >
                        <span className="material-symbols-outlined text-[15px]">add_shopping_cart</span>
                        <span>{t('addToCart', 'Add')} {formatINR(med.genericPrice)}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section: How GenericMed Works */}
            <div className="bg-[#eff4ff]/60 rounded-2xl p-4 border border-[#c4c6cf]/50 space-y-2.5">
              <h3 className="font-display font-bold text-sm text-[#001026]">How Jan Aushadhi Generic Medicine Ordering Works</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-2.5 bg-white rounded-xl border border-[#c4c6cf]/40 space-y-1">
                  <div className="w-5 h-5 rounded-md bg-[#001026] text-white flex items-center justify-center font-bold text-[10px]">1</div>
                  <div className="font-bold text-[#001026]">Search or Upload Rx</div>
                  <p className="text-[#44474e] text-[11px]">Type Indian brand names or snap doctor prescription for instant OCR extraction.</p>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-[#c4c6cf]/40 space-y-1">
                  <div className="w-5 h-5 rounded-md bg-[#006c49] text-white flex items-center justify-center font-bold text-[10px]">2</div>
                  <div className="font-bold text-[#001026]">Compare &amp; Verify</div>
                  <p className="text-[#44474e] text-[11px]">View CDSCO therapeutic equivalence and save up to 80% with Jan Aushadhi.</p>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-[#c4c6cf]/40 space-y-1">
                  <div className="w-5 h-5 rounded-md bg-[#0b2545] text-white flex items-center justify-center font-bold text-[10px]">3</div>
                  <div className="font-bold text-[#001026]">Doorstep Handover</div>
                  <p className="text-[#44474e] text-[11px]">Delivered by electric courier in 35 mins with secure 4-digit PIN handover.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar Column (4 cols on web - sticky & responsive) */}
          <div className="hidden lg:block lg:col-span-4 space-y-4 sticky top-16">
            {/* Live Order #88219 Quick Tracker Card */}
            <div className="bg-white rounded-2xl border border-[#c4c6cf]/80 p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#006c49] animate-pulse"></span>
                  <span className="font-display font-bold text-xs text-[#001026]">Active Order #{CURRENT_ORDER.orderNumber}</span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-[#006c49]/15 text-[#006c49] px-2 py-0.5 rounded-full">
                  ETA 18 MIN
                </span>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-[#44474e]">
                  <span className="font-semibold text-[#006c49]">Out for Delivery ({deliveryCity})</span>
                  <span>Courier: {CURRENT_ORDER.courierName}</span>
                </div>
                <div className="w-full h-1.5 bg-[#eff4ff] rounded-full overflow-hidden">
                  <div className="w-3/4 h-full bg-[#006c49] rounded-full"></div>
                </div>
              </div>

              {/* Courier & Handover Security PIN */}
              <div className="p-2.5 bg-[#f8f9ff] rounded-xl border border-[#c4c6cf]/40 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[9px] font-bold text-[#74777f] uppercase block">{t('deliveryPin', 'Secure Delivery PIN')}</span>
                  <span className="font-mono font-bold text-base text-[#001026] tracking-wider">{CURRENT_ORDER.deliveryPin}</span>
                </div>
                <button
                  onClick={() => onNavigateScreen('order-tracking')}
                  className="px-3 py-1.5 bg-[#001026] text-white rounded-lg text-xs font-semibold hover:bg-[#0b2545] transition-colors"
                >
                  Live GPS Track
                </button>
              </div>
            </div>

            {/* Dispensing Pharmacy Trust Card */}
            <div className="bg-white rounded-2xl border border-[#c4c6cf]/80 p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#006c49]">Dispensing Pharmacy</span>
                  <h3 className="font-display font-bold text-sm text-[#001026]">Jan Aushadhi Kendra #108</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#006c49]/15 text-[#006c49]">
                  ★ 4.9
                </span>
              </div>
              <p className="text-xs text-[#44474e]">
                Registered under Maharashtra State Pharmacy Council (Lic #MH-PUN-2018-88410). Verified by Dr. Amit Patil, D.Pharm.
              </p>
              <div className="space-y-1.5 text-xs text-[#0b1c30] pt-1">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#006c49]">bolt</span>
                  <span>35-min Courier Dispatch across {deliveryCity} ({deliveryPincode})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#006c49]">lock</span>
                  <span>Tamper-Proof Barcoded Packaging</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#006c49]">pin</span>
                  <span>Doorstep 4-Digit PIN Handover Verification</span>
                </div>
              </div>
            </div>

            {/* Quick Upload Rx Card */}
            <div className="p-4 bg-gradient-to-br from-[#eff4ff] to-white rounded-2xl border border-[#006c49]/30 text-center space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#006c49]/15 text-[#006c49] flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-[22px]">document_scanner</span>
              </div>
              <div>
                <h4 className="font-bold text-xs text-[#001026]">Prescription OCR AI Scanner</h4>
                <p className="text-[11px] text-[#44474e] mt-0.5">
                  Have a written doctor prescription? Snap a photo to find Jan Aushadhi generic matches instantly.
                </p>
              </div>
              <button
                onClick={() => onNavigateScreen('rx-scanner')}
                className="w-full py-2 bg-[#006c49] text-white rounded-xl text-xs font-bold hover:bg-[#006c49]/90 transition-colors shadow-xs"
              >
                Launch AI Scanner
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Sticky Mobile Navigation Bar (hidden on desktop) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-[#c4c6cf]/80 py-2 px-4 z-40 shadow-lg">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button 
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
              activeTab === 'home' ? 'text-[#001026]' : 'text-[#74777f]'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">home</span>
            <span>Home</span>
          </button>

          <button 
            onClick={() => setActiveTab('compare')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
              activeTab === 'compare' ? 'text-[#001026]' : 'text-[#74777f]'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">swap_horiz</span>
            <span>Compare</span>
          </button>

          {/* Floating Center Action Button */}
          <button 
            onClick={() => onNavigateScreen('rx-scanner')}
            className="flex flex-col items-center -mt-5"
          >
            <div className="w-12 h-12 rounded-full bg-[#006c49] text-white flex items-center justify-center shadow-lg border-4 border-white hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[24px]">document_scanner</span>
            </div>
            <span className="text-[10px] font-bold text-[#006c49] mt-0.5">Upload Rx</span>
          </button>

          <button 
            onClick={() => onNavigateScreen('order-tracking')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
              activeTab === 'orders' ? 'text-[#001026]' : 'text-[#74777f]'
            } relative`}
          >
            <span className="material-symbols-outlined text-[20px]">local_shipping</span>
            <span>Orders</span>
            <span className="absolute top-0 right-1 w-2 h-2 bg-[#006c49] rounded-full"></span>
          </button>

          <button 
            onClick={() => onNavigateScreen('auth')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
              activeTab === 'account' ? 'text-[#001026]' : 'text-[#74777f]'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">person</span>
            <span>{currentUser ? currentUser.name.split(' ')[0] : t('signIn', 'Sign In')}</span>
          </button>
        </div>
      </nav>

      {/* Bio-Equivalence Report Modal (Indian CDSCO & IP Standards) */}
      {showBioReportModal && (
        <div className="fixed inset-0 z-50 bg-[#001026]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-[#c4c6cf] p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#006c49] uppercase tracking-wider">CDSCO &amp; Jan Aushadhi Clinical Bio-Equivalence Dossier</span>
                <h3 className="font-display font-bold text-base text-[#001026]">{showBioReportModal.genericName}</h3>
              </div>
              <button onClick={() => setShowBioReportModal(null)} className="text-[#74777f]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-[#eff4ff] border border-[#c4c6cf]/50 space-y-1">
                <div className="font-bold text-[#001026]">Branded Reference Drug: {showBioReportModal.brandName} ({showBioReportModal.brandManufacturer})</div>
                <div className="text-[#44474e]">Active Pharmaceutical Ingredient: {showBioReportModal.activeSalt}</div>
                <div className="text-[#44474e]">Jan Aushadhi Identifier: {showBioReportModal.ndc}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-[#f8f9ff] rounded-lg border">
                  <span className="text-[#74777f] block text-[10px]">Pharmacokinetic AUC Equivalence:</span>
                  <span className="font-bold text-[#006c49] text-sm">{showBioReportModal.bioEquivalenceScore}% (Bio-Equivalent)</span>
                </div>
                <div className="p-2.5 bg-[#f8f9ff] rounded-lg border">
                  <span className="text-[#74777f] block text-[10px]">Indian Pharmacopoeia (IP) Grade:</span>
                  <span className="font-bold text-[#001026] text-sm">{showBioReportModal.fdaRating}</span>
                </div>
              </div>

              <p className="text-[11px] text-[#44474e]">
                Under Drugs &amp; Cosmetics Act (Rules 65 &amp; Form 20/21) and PMBJP standards, medicines with certified bio-equivalence produce identical therapeutic results in the human body as high-priced branded equivalents.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button 
                onClick={() => setShowBioReportModal(null)}
                className="px-4 py-2 bg-[#001026] text-white font-bold rounded-xl text-xs"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (isMobileFrame) {
    return (
      <div className="py-8 px-4 flex justify-center items-center min-h-[calc(100vh-60px)] bg-slate-900">
        <div className="w-[390px] h-[844px] bg-white rounded-[44px] shadow-2xl border-[10px] border-slate-800 overflow-hidden relative flex flex-col">
          {/* Phone Speaker & Notch bar */}
          <div className="w-full bg-[#001026] pt-3 pb-1 px-6 flex justify-between items-center text-white text-[11px] font-mono z-50">
            <span>9:41</span>
            <div className="w-20 h-4 bg-black rounded-full"></div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">signal_cellular_alt</span>
              <span className="material-symbols-outlined text-[14px]">wifi</span>
              <span className="material-symbols-outlined text-[14px]">battery_full</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar relative">
            {content}
          </div>
        </div>
      </div>
    );
  }

  return content;
};
