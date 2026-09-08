import React, { useState } from 'react';
import { MEDICINES, PHARMACY_HUBS } from '../../data/mockData';
import { ScreenId, CustomerTab, MedicineItem } from '../../types';

interface CustomerAppScreenProps {
  onNavigateScreen: (screen: ScreenId) => void;
  onShowToast: (msg: string) => void;
  isMobileFrame?: boolean;
}

export const CustomerAppScreen: React.FC<CustomerAppScreenProps> = ({
  onNavigateScreen,
  onShowToast,
  isMobileFrame = false
}) => {
  const [activeTab, setActiveTab] = useState<CustomerTab>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPill, setSelectedPill] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(2);
  const [showBioReportModal, setShowBioReportModal] = useState<MedicineItem | null>(null);

  const filteredMedicines = MEDICINES.filter(med => {
    if (selectedPill) {
      return med.genericName.toLowerCase().includes(selectedPill.toLowerCase()) ||
             med.brandName.toLowerCase().includes(selectedPill.toLowerCase());
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
    onShowToast(`Added ${med.genericName} to cart ($${med.genericPrice.toFixed(2)})!`);
  };

  const content = (
    <div className="bg-[#f8f9ff] text-[#0b1c30] min-h-full flex flex-col font-body text-sm selection:bg-[#6cf8bb] selection:text-[#002113] pb-24">
      {/* Top Location / Express Ribbon */}
      <div className="bg-[#001026] text-white px-4 py-2 text-xs flex items-center justify-between border-b border-[#0b2545]">
        <div className="flex items-center gap-1.5 font-medium truncate">
          <span className="material-symbols-outlined text-[16px] text-[#6cf8bb]">location_on</span>
          <span>Delivering to <strong className="text-white">Brooklyn, NY 11201</strong></span>
          <span className="text-[#6ffbbe] hidden sm:inline">• 35-min Express</span>
        </div>
        <button 
          onClick={() => onShowToast('Current location: Brooklyn 11201. 3 partner pharmacies online.')}
          className="text-[11px] text-[#6cf8bb] hover:underline font-semibold flex items-center gap-0.5"
        >
          Change <span className="material-symbols-outlined text-[14px]">expand_more</span>
        </button>
      </div>

      {/* Header Bar */}
      <header className="bg-white border-b border-[#c4c6cf]/60 px-4 py-3 sticky top-0 z-30 shadow-xs">
        <div className="flex items-center justify-between gap-3 max-w-4xl mx-auto">
          {/* Logo & Slogan */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0b2545] flex items-center justify-center text-[#6cf8bb]">
              <span className="material-symbols-outlined text-[20px]">health_and_safety</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-extrabold text-[#001026] text-base leading-tight">GenericMed</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 bg-[#006c49]/15 text-[#006c49] rounded-full">
                  FDA Verified
                </span>
              </div>
              <p className="text-[11px] text-[#44474e]">Same active molecules. 80%+ lower price.</p>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onNavigateScreen('order-tracking')}
              className="px-2.5 py-1 rounded-lg bg-[#eff4ff] text-[#001026] text-xs font-semibold hover:bg-[#e5eeff] transition-colors flex items-center gap-1 border border-[#c4c6cf]/50"
              title="Track Active Order #ORD-88219"
            >
              <span className="w-2 h-2 rounded-full bg-[#006c49] animate-pulse"></span>
              <span className="hidden sm:inline">Track</span> #88219
            </button>

            <button 
              onClick={() => onShowToast(`Cart (${cartCount} items): Total $22.70. Free express courier applied!`)}
              className="w-9 h-9 rounded-xl bg-[#eff4ff] hover:bg-[#e5eeff] flex items-center justify-center relative text-[#001026] border border-[#c4c6cf]/50 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#006c49] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Page Scrollable Content */}
      <main className="max-w-4xl mx-auto w-full px-4 pt-4 space-y-5 flex-1">
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
              placeholder="Search branded medicine (e.g. Lipitor, Augmentin)..."
              className="w-full pl-10 pr-10 py-3 bg-white border border-[#c4c6cf] rounded-2xl text-xs sm:text-sm text-[#0b1c30] placeholder:text-[#74777f] shadow-xs focus:ring-2 focus:ring-[#006c49]/40 focus:border-[#006c49] focus:outline-none"
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

          {/* Quick Molecule Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-[11px] font-bold text-[#44474e] whitespace-nowrap pl-1">Popular:</span>
            {[
              { name: 'Atorvastatin', discount: '85% off' },
              { name: 'Amoxicillin', discount: '80% off' },
              { name: 'Metformin', discount: '88% off' },
              { name: 'Omeprazole', discount: '79% off' },
              { name: 'Rosuvastatin', discount: '85% off' }
            ].map((pill) => {
              const active = selectedPill === pill.name;
              return (
                <button
                  key={pill.name}
                  onClick={() => {
                    setSelectedPill(active ? null : pill.name);
                    setSearchQuery('');
                  }}
                  className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap flex items-center gap-1.5 transition-all ${
                    active
                      ? 'bg-[#001026] text-white'
                      : 'bg-white border border-[#c4c6cf]/80 text-[#0b1c30] hover:bg-[#eff4ff]'
                  }`}
                >
                  <span>{pill.name}</span>
                  <span className={`text-[10px] font-bold ${active ? 'text-[#6cf8bb]' : 'text-[#006c49]'}`}>
                    {pill.discount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Prescription Quick Upload Banner Card */}
        <div className="bg-gradient-to-r from-[#001026] via-[#0b2545] to-[#002113] rounded-2xl p-4 sm:p-5 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#6cf8bb] text-[#002113] uppercase tracking-wide">
                  AI Salt-Matching Engine
                </span>
                <span className="text-[11px] text-[#6ffbbe]">100% HIPAA &amp; FDA Compliant</span>
              </div>
              <h2 className="text-base sm:text-lg font-display font-bold">Have a Doctor&apos;s Prescription?</h2>
              <p className="text-xs text-slate-300 max-w-md">
                Upload or snap your paper Rx. Our OCR instantly finds FDA-approved equivalent generics and calculates exact savings.
              </p>
            </div>

            <button
              onClick={() => onNavigateScreen('rx-scanner')}
              className="px-4 py-2.5 bg-[#006c49] hover:bg-[#006c49]/90 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[18px]">document_scanner</span>
              Scan &amp; Upload Rx
            </button>
          </div>
        </div>

        {/* Section: Live Medicine Price Comparison & Bio-Equivalence Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-display font-bold text-[#001026] flex items-center gap-2">
              <span>Bio-Equivalent Price Comparisons</span>
              <span className="text-xs font-normal text-[#44474e]">({filteredMedicines.length} Available)</span>
            </h3>
            <span className="text-xs text-[#006c49] font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px]">verified</span> Real-Time FDA Orange Book
            </span>
          </div>

          {/* Cards List */}
          <div className="space-y-4">
            {filteredMedicines.map((med) => (
              <div 
                key={med.id}
                className="bg-white rounded-2xl border border-[#c4c6cf]/80 p-4 sm:p-5 shadow-xs hover:border-[#006c49]/60 transition-all space-y-4"
              >
                {/* Card Top: Badges & Savings Pill */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#006c49]/15 text-[#006c49] border border-[#006c49]/30">
                      {med.fdaRating} • {med.bioEquivalenceScore}% Match
                    </span>
                    <span className="text-[11px] text-[#44474e]">{med.form}</span>
                  </div>
                  <div className="px-3 py-1 rounded-full text-xs font-bold bg-[#6cf8bb] text-[#002113]">
                    Save {med.savingsPercentage}% (${(med.brandPrice - med.genericPrice).toFixed(2)})
                  </div>
                </div>

                {/* Comparison Columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Brand Box */}
                  <div className="p-3.5 rounded-xl bg-[#f8f9ff] border border-[#c4c6cf]/50">
                    <span className="text-[10px] font-bold text-[#44474e] uppercase tracking-wider block">
                      Expensive Brand Name
                    </span>
                    <h4 className="font-display font-bold text-[#0b1c30] text-base mt-0.5">{med.brandName}</h4>
                    <p className="text-[11px] text-[#44474e]">{med.brandManufacturer}</p>
                    <div className="mt-2 text-lg font-bold text-[#74777f] line-through">
                      ${med.brandPrice.toFixed(2)}
                    </div>
                  </div>

                  {/* Generic Box */}
                  <div className="p-3.5 rounded-xl bg-[#e5eeff]/50 border-2 border-[#006c49] relative">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#006c49] uppercase tracking-wider">
                        Bio-Equivalent Generic
                      </span>
                      <span className="material-symbols-outlined text-[16px] text-[#006c49]">verified</span>
                    </div>
                    <h4 className="font-display font-bold text-[#001026] text-base mt-0.5">{med.genericName}</h4>
                    <p className="text-[11px] text-[#44474e]">{med.genericManufacturer}</p>
                    <div className="mt-2 text-xl font-display font-extrabold text-[#006c49]">
                      ${med.genericPrice.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Active Molecule Scientific Formula */}
                <div className="p-2.5 rounded-lg bg-[#eff4ff] text-[11px] text-[#0b1c30] flex items-center justify-between">
                  <div>
                    <strong className="text-[#001026]">Active Pharmaceutical Ingredient:</strong> {med.activeSalt}
                  </div>
                  <button 
                    onClick={() => setShowBioReportModal(med)}
                    className="text-[#001026] font-semibold underline hover:text-[#006c49] whitespace-nowrap ml-2"
                  >
                    Clinical Report
                  </button>
                </div>

                {/* Bottom Order Bar */}
                <div className="flex items-center justify-between pt-1 gap-2">
                  <div className="text-[11px] text-[#44474e] flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#006c49]"></span>
                    In Stock at MetroCare Rx (1.8 mi away)
                  </div>
                  <button
                    onClick={() => handleAddToCart(med)}
                    className="px-4 py-2 rounded-xl bg-[#001026] hover:bg-[#0b2545] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
                  >
                    <span className="material-symbols-outlined text-[16px]">add_shopping_cart</span>
                    Add Generic • ${med.genericPrice.toFixed(2)}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section: Fulfilled By Licensed Pharmacy */}
        <div className="bg-white rounded-2xl border border-[#c4c6cf]/70 p-4 sm:p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#006c49]">Dispensing Pharmacy</span>
              <h3 className="font-display font-bold text-sm sm:text-base text-[#001026]">MetroCare Rx Downtown Hub</h3>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#006c49]/15 text-[#006c49]">
              ★ 4.9 (1,840 reviews)
            </span>
          </div>
          <p className="text-xs text-[#44474e]">
            Licensed under State Board #GDL-99201-MH. All generic substitutions are strictly checked by licensed PharmD pharmacists before dispatch.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-[#0b1c30]">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-[#006c49]">bolt</span>
              <span>35-min Courier Dispatch</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-[#006c49]">lock</span>
              <span>Tamper-Evident Tape Security</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-[#006c49]">pin</span>
              <span>4-Digit Handover PIN</span>
            </div>
          </div>
        </div>

        {/* Section: How GenericMed Works */}
        <div className="bg-[#eff4ff]/60 rounded-2xl p-4 sm:p-5 border border-[#c4c6cf]/50 space-y-3">
          <h3 className="font-display font-bold text-sm text-[#001026]">How GenericMed Works</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-white rounded-xl border border-[#c4c6cf]/40 space-y-1">
              <div className="w-6 h-6 rounded-md bg-[#001026] text-white flex items-center justify-center font-bold text-xs">1</div>
              <div className="font-bold text-[#001026]">Search or Upload Rx</div>
              <p className="text-[#44474e] text-[11px]">Type any branded drug or snap a picture of your prescription.</p>
            </div>
            <div className="p-3 bg-white rounded-xl border border-[#c4c6cf]/40 space-y-1">
              <div className="w-6 h-6 rounded-md bg-[#006c49] text-white flex items-center justify-center font-bold text-xs">2</div>
              <div className="font-bold text-[#001026]">Compare &amp; Verify</div>
              <p className="text-[#44474e] text-[11px]">We match FDA-approved identical active molecules and savings.</p>
            </div>
            <div className="p-3 bg-white rounded-xl border border-[#c4c6cf]/40 space-y-1">
              <div className="w-6 h-6 rounded-md bg-[#0b2545] text-white flex items-center justify-center font-bold text-xs">3</div>
              <div className="font-bold text-[#001026]">Express Local Delivery</div>
              <p className="text-[#44474e] text-[11px]">Partner dispensary packs and delivers to your door in 35 mins.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Sticky Mobile Navigation Bar */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-[#c4c6cf]/80 py-2 px-4 z-40 shadow-lg">
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
            onClick={() => onNavigateScreen('enterprise-ops')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
              activeTab === 'account' ? 'text-[#001026]' : 'text-[#74777f]'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">person</span>
            <span>Profile</span>
          </button>
        </div>
      </nav>

      {/* Bio-Equivalence Report Modal */}
      {showBioReportModal && (
        <div className="fixed inset-0 z-50 bg-[#001026]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-[#c4c6cf] p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#006c49] uppercase tracking-wider">FDA Clinical Bio-Equivalence Dossier</span>
                <h3 className="font-display font-bold text-base text-[#001026]">{showBioReportModal.genericName}</h3>
              </div>
              <button onClick={() => setShowBioReportModal(null)} className="text-[#74777f]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-[#eff4ff] border border-[#c4c6cf]/50 space-y-1">
                <div className="font-bold text-[#001026]">Brand Reference Drug: {showBioReportModal.brandName}</div>
                <div className="text-[#44474e]">Active Pharmaceutical Ingredient: {showBioReportModal.activeSalt}</div>
                <div className="text-[#44474e]">NDC Reference: {showBioReportModal.ndc}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-[#f8f9ff] rounded-lg border">
                  <span className="text-[#74777f] block text-[10px]">Pharmacokinetic AUC Match:</span>
                  <span className="font-bold text-[#006c49] text-sm">{showBioReportModal.bioEquivalenceScore}% (FDA Approved)</span>
                </div>
                <div className="p-2.5 bg-[#f8f9ff] rounded-lg border">
                  <span className="text-[#74777f] block text-[10px]">Therapeutic Rating:</span>
                  <span className="font-bold text-[#001026] text-sm">{showBioReportModal.fdaRating} (Therapeutic Substitute)</span>
                </div>
              </div>

              <p className="text-[11px] text-[#44474e]">
                Under FDA Title 21 CFR § 320, products classified as AB are considered therapeutically equivalent and can be substituted with the full expectation that the generic product will produce the same clinical effect and safety profile as the prescribed branded product.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button 
                onClick={() => setShowBioReportModal(null)}
                className="px-4 py-2 bg-[#001026] text-white font-bold rounded-xl text-xs"
              >
                Close Report
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
