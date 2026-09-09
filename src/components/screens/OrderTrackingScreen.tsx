import React, { useState, useEffect } from 'react';
import { CURRENT_ORDER, ASSET_IMAGES } from '../../data/mockData';
import { ScreenId } from '../../types';
import { telemetryService, CourierTelemetry } from '../../services/telemetry';

interface OrderTrackingScreenProps {
  onNavigateScreen: (screen: ScreenId) => void;
  onShowToast: (msg: string) => void;
  isMobileFrame?: boolean;
}

export const OrderTrackingScreen: React.FC<OrderTrackingScreenProps> = ({
  onNavigateScreen,
  onShowToast,
  isMobileFrame = false
}) => {
  const [showQrModal, setShowQrModal] = useState(false);
  const [showConsultModal, setShowConsultModal] = useState(false);
  const [consultQuestion, setConsultQuestion] = useState('');
  const [telemetry, setTelemetry] = useState<CourierTelemetry>(telemetryService.getCurrentTelemetry());

  useEffect(() => {
    const unsubscribe = telemetryService.subscribe((data) => {
      setTelemetry(data);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const handleConsultSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consultQuestion.trim()) return;
    setShowConsultModal(false);
    onShowToast('Inquiry sent to MetroCare Pharmacist! Dr. Marcus Vance will call or reply in 2 mins.');
    setConsultQuestion('');
  };

  const content = (
    <div className="bg-[#f8f9ff] text-[#0b1c30] min-h-full flex flex-col font-body text-sm selection:bg-[#6cf8bb] selection:text-[#002113] pb-12">
      {/* Header */}
      <header className="bg-white border-b border-[#c4c6cf]/60 px-4 py-3 sticky top-0 z-30 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigateScreen('customer-app')}
            className="w-8 h-8 rounded-lg hover:bg-[#eff4ff] flex items-center justify-center text-[#001026]"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-bold text-sm sm:text-base text-[#001026]">Live Order Tracking</h1>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#0b2545] text-white font-bold">
                #{CURRENT_ORDER.orderNumber}
              </span>
            </div>
            <p className="text-[11px] text-[#44474e]">MetroCare Rx Downtown Hub • Verified Chain of Custody</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button 
            onClick={() => setShowConsultModal(true)}
            className="w-8 h-8 rounded-lg hover:bg-[#eff4ff] flex items-center justify-center text-[#006c49]"
            title="Call Pharmacist"
          >
            <span className="material-symbols-outlined text-[20px]">support_agent</span>
          </button>
          <button 
            onClick={() => onShowToast('Order options: Download invoice, Delivery instructions, Report issue')}
            className="w-8 h-8 rounded-lg hover:bg-[#eff4ff] flex items-center justify-center text-[#44474e]"
          >
            <span className="material-symbols-outlined text-[20px]">more_vert</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-4 flex-1">
        {/* Web Split Grid Layout: Left Map & Route, Right Audit & Details */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-6 items-start">
          {/* Left Column (7 cols on web) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Dynamic Status Progress Card */}
            <div className="bg-[#001026] text-white rounded-2xl p-4 sm:p-5 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#6cf8bb] animate-ping"></span>
                  <span className="font-display font-bold text-base text-white">
                    Arriving in {Math.floor(telemetry.timeRemainingSeconds / 60)}m {telemetry.timeRemainingSeconds % 60 < 10 ? '0' : ''}{telemetry.timeRemainingSeconds % 60}s
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#006c49] text-white">
                  35-min Express
                </span>
              </div>

              <div>
                <div className="text-xs text-slate-300">Delivering to:</div>
                <div className="font-bold text-white text-sm mt-0.5">{CURRENT_ORDER.deliveryAddress}</div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-[11px] text-slate-300">
                  <span>Dispatched • {telemetry.distanceRemainingMiles} miles remaining</span>
                  <span className="font-bold text-[#6cf8bb]">{telemetry.progressPct}% Completed</span>
                </div>
                <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#6cf8bb] h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${Math.max(5, telemetry.progressPct)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Live GPS Map Box */}
            <div className="bg-white rounded-2xl border border-[#c4c6cf]/80 overflow-hidden shadow-xs relative">
              <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-100">
                {/* Real Brooklyn Map visual */}
                <img 
                  src={ASSET_IMAGES.brooklynMap} 
                  alt="Live Delivery Map"
                  className="w-full h-full object-cover"
                />

                {/* Simulated Live Route Path SVG Overlay */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <path 
                    d="M 60 180 Q 140 120 200 130 T 320 80" 
                    fill="none" 
                    stroke="#006c49" 
                    strokeWidth="4" 
                    strokeDasharray="6,4"
                  />
                </svg>

                {/* Hub Origin Pin */}
                <div className="absolute left-[50px] top-[165px] bg-[#001026] text-white p-1 rounded-full shadow-lg border border-white flex items-center gap-1 text-[10px] px-2">
                  <span className="material-symbols-outlined text-[14px] text-[#6cf8bb]">local_pharmacy</span>
                  <span className="font-bold">Hub #104</span>
                </div>

                {/* Courier Live Pin with dynamic GPS tracking */}
                <div
                  className="absolute z-10 flex flex-col items-center transition-all duration-1000 ease-linear pointer-events-none"
                  style={{
                    left: `${Math.min(310, Math.max(60, 60 + (telemetry.progressPct / 100) * 260))}px`,
                    top: `${Math.min(180, Math.max(70, 175 - (telemetry.progressPct / 100) * 100))}px`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <div className="w-8 h-8 rounded-full bg-[#006c49] text-white flex items-center justify-center shadow-xl border-2 border-white animate-bounce">
                    <span className="material-symbols-outlined text-[16px]">pedal_bike</span>
                  </div>
                  <span className="mt-1 px-2 py-0.5 rounded-full bg-[#001026] text-white text-[9px] font-bold shadow-md whitespace-nowrap">
                    {telemetry.courierName} • {telemetry.distanceRemainingMiles} mi away
                  </span>
                </div>

                {/* Destination Pin */}
                <div className="absolute right-[50px] top-[65px] bg-[#ba1a1a] text-white p-1 rounded-full shadow-lg border border-white flex items-center gap-1 text-[10px] px-2">
                  <span className="material-symbols-outlined text-[14px]">home</span>
                  <span className="font-bold">You</span>
                </div>

                {/* Floating Live Telemetry Badge HUD */}
                <div className="absolute top-3 left-3 bg-[#001026]/90 backdrop-blur-xs text-white px-3 py-1.5 rounded-xl border border-white/10 text-xs flex items-center gap-2 shadow-md">
                  <span className="w-2 h-2 rounded-full bg-[#6cf8bb] animate-pulse"></span>
                  <span className="text-[11px] font-mono">Telemetry: {telemetry.speedKmh} km/h</span>
                  <span className="text-[11px] text-[#6ffbbe] font-mono">• Head: {telemetry.heading}°</span>
                  <span className="text-[11px] text-slate-300 font-mono hidden sm:inline">• Bat: {telemetry.batteryPct}%</span>
                </div>

                {/* Live GPS Coordinates Pill */}
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-xs text-white px-2.5 py-1 rounded-lg text-[10px] font-mono">
                  GPS: {telemetry.latitude}, {telemetry.longitude}
                </div>
              </div>

              {/* Courier Card & Secure Delivery PIN */}
              <div className="p-4 bg-white border-t border-[#c4c6cf]/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#0b2545] text-[#6cf8bb] flex items-center justify-center font-bold text-sm">
                    MS
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-display font-bold text-[#001026] text-sm">{CURRENT_ORDER.courierName}</h3>
                      <span className="text-[11px] text-[#006c49] font-bold">★ 4.9</span>
                    </div>
                    <p className="text-[11px] text-[#44474e]">{CURRENT_ORDER.courierVehicle}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <button 
                        onClick={() => onShowToast('Calling courier Miguel S...')}
                        className="text-[11px] text-[#001026] font-semibold flex items-center gap-0.5 hover:underline"
                      >
                        <span className="material-symbols-outlined text-[14px]">call</span> Call
                      </button>
                      <span className="text-slate-300">•</span>
                      <button 
                        onClick={() => onShowToast('Opening direct dispatch chat with Miguel')}
                        className="text-[11px] text-[#001026] font-semibold flex items-center gap-0.5 hover:underline"
                      >
                        <span className="material-symbols-outlined text-[14px]">chat</span> Chat
                      </button>
                    </div>
                  </div>
                </div>

                {/* Handover Security PIN */}
                <div className="p-2.5 rounded-xl bg-[#eff4ff] border border-[#c4c6cf]/80 text-right w-full sm:w-auto">
                  <span className="text-[10px] font-bold text-[#44474e] uppercase tracking-wider block">
                    Secure Delivery PIN
                  </span>
                  <div className="font-mono text-xl font-extrabold text-[#001026] tracking-widest flex items-center justify-end gap-1">
                    <span className="material-symbols-outlined text-[16px] text-[#006c49]">lock</span>
                    {CURRENT_ORDER.deliveryPin}
                  </div>
                  <span className="text-[9px] text-[#44474e]">Share with courier at doorstep</span>
                </div>
              </div>
            </div>

            {/* Prescription Fulfillment Audit Chain of Custody (5-step timeline) */}
            <div className="bg-white rounded-2xl border border-[#c4c6cf]/80 p-4 sm:p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-[#001026] text-sm sm:text-base flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#006c49]">verified</span>
                  Prescription Fulfillment Audit Trail
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-[#006c49]/15 text-[#006c49] font-bold rounded-full">
                  CFR § 21 Logged
                </span>
              </div>

              <div className="space-y-3 relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#c4c6cf]">
                {/* Step 1 */}
                <div className="relative">
                  <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-[#006c49] border-2 border-white"></div>
                  <div className="text-xs font-bold text-[#001026]">Rx Verified &amp; Generic Substituted</div>
                  <p className="text-[11px] text-[#44474e]">08:35 AM • Verified by Dr. Elena Rostova MD &amp; Lead RPh</p>
                </div>

                {/* Step 2 */}
                <div className="relative">
                  <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-[#006c49] border-2 border-white"></div>
                  <div className="text-xs font-bold text-[#001026]">Formulated &amp; Packed</div>
                  <p className="text-[11px] text-[#44474e]">08:44 AM • MetroCare Central #4082 • Bin A-14 • Lot #CP-9021</p>
                </div>

                {/* Step 3 */}
                <div className="relative">
                  <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-[#006c49] border-2 border-white"></div>
                  <div className="text-xs font-bold text-[#001026]">Tamper-Evident Tape Applied</div>
                  <p className="text-[11px] text-[#44474e]">
                    08:49 AM • Security Seal ID: <strong className="font-mono text-[#001026]">{CURRENT_ORDER.tamperSealId}</strong>
                  </p>
                </div>

                {/* Step 4 */}
                <div className="relative">
                  <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-[#006c49] border-2 border-white"></div>
                  <div className="text-xs font-bold text-[#001026]">Out for Express Delivery</div>
                  <p className="text-[11px] text-[#44474e]">08:52 AM • Handed over to Miguel S. (E-Bike #14)</p>
                </div>

                {/* Step 5 */}
                <div className="relative">
                  <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-[#6cf8bb] border-2 border-[#001026] animate-pulse"></div>
                  <div className="text-xs font-bold text-[#006c49]">Doorstep Delivery Est. 09:06 AM</div>
                  <p className="text-[11px] text-[#44474e]">En route to 742 Evergreen Terr • PIN Required</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols on web - sticky) */}
          <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-16">
            {/* Prescribed Medicine & Bio-Equivalence Summary Card */}
            <div className="bg-white rounded-2xl border border-[#c4c6cf]/80 p-4 sm:p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#006c49]">Dispensed Medication</span>
                <span className="text-[11px] font-bold text-[#006c49] bg-[#006c49]/15 px-2 py-0.5 rounded">
                  Saved $84.30 (85.6%)
                </span>
              </div>

              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-display font-bold text-[#001026] text-base">{CURRENT_ORDER.genericSubstitute}</h4>
                  <p className="text-xs text-[#44474e]">Bio-Equivalent to prescribed {CURRENT_ORDER.brandPrescribed}</p>
                  <div className="mt-1 text-xs text-[#001026]">
                    Sig: 1 tablet orally once daily at bedtime (qHS) • Dispense #30
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs line-through text-[#74777f]">${CURRENT_ORDER.priceBrand.toFixed(2)}</span>
                  <div className="text-lg font-display font-extrabold text-[#006c49]">${CURRENT_ORDER.priceGeneric.toFixed(2)}</div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#c4c6cf]/50 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-[#44474e]">
                  <span className="material-symbols-outlined text-[16px] text-[#006c49]">security</span>
                  <span>Tamper-Proof Hologram Armed</span>
                </div>
                <button 
                  onClick={() => setShowQrModal(true)}
                  className="text-[#001026] font-bold underline hover:text-[#006c49]"
                >
                  Verify Tamper Seal QR
                </button>
              </div>
            </div>

            {/* Dispensing Pharmacy & Pharmacist Signoff */}
            <div className="bg-white rounded-2xl border border-[#c4c6cf]/80 p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#006c49]">Dispensing Pharmacy</span>
                <span className="text-[10px] font-mono bg-[#eff4ff] text-[#001026] px-2 py-0.5 rounded font-bold">
                  LIC #GDL-99201
                </span>
              </div>
              <div>
                <h4 className="font-display font-bold text-[#001026] text-sm">MetroCare Rx Downtown Hub</h4>
                <p className="text-xs text-[#44474e]">104 Court St, Brooklyn, NY 11201 • (718) 555-0192</p>
              </div>
              <div className="p-2.5 rounded-xl bg-[#eff4ff] text-xs space-y-1">
                <div className="flex justify-between font-semibold text-[#001026]">
                  <span>Lead Pharmacist:</span>
                  <span>Dr. Marcus Vance, PharmD</span>
                </div>
                <div className="flex justify-between text-[11px] text-[#44474e]">
                  <span>FDA Equivalence Rating:</span>
                  <span className="font-mono text-[#006c49] font-bold">AB Certified</span>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={() => setShowConsultModal(true)}
                className="flex-1 py-2.5 rounded-xl border border-[#c4c6cf] bg-white text-[#001026] hover:bg-[#eff4ff] font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">support_agent</span>
                Consult Pharmacist
              </button>

              <button
                onClick={() => onNavigateScreen('customer-app')}
                className="flex-1 py-2.5 rounded-xl bg-[#001026] hover:bg-[#0b2545] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                Browse Catalog
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Verify Tamper Seal QR Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-[#001026]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-[#c4c6cf] p-5 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-[#006c49]/15 text-[#006c49] flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[28px]">qr_code_scanner</span>
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-[#001026]">Tamper-Evident Tape Verification</h3>
              <p className="text-xs text-[#44474e] mt-1">
                Scan the QR printed on the box security tape to verify cryptographic pharmacist clearance.
              </p>
            </div>

            <div className="p-4 bg-[#eff4ff] rounded-xl border border-[#c4c6cf]/60 space-y-1 font-mono text-xs">
              <div className="text-[10px] text-[#74777f]">SEAL BARCODE NUMBER:</div>
              <div className="font-bold text-[#001026] text-sm">{CURRENT_ORDER.tamperSealId}</div>
              <div className="text-[#006c49] font-bold text-[11px] pt-1">STATUS: SEAL INTACT &amp; VERIFIED</div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => setShowQrModal(false)}
                className="w-full py-2 bg-[#001026] text-white rounded-xl text-xs font-bold"
              >
                Close Verification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Consult Pharmacist Modal */}
      {showConsultModal && (
        <div className="fixed inset-0 z-50 bg-[#001026]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-[#c4c6cf] p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 text-[#006c49]">
                <span className="material-symbols-outlined text-[24px]">support_agent</span>
                <div>
                  <h3 className="font-display font-bold text-sm sm:text-base text-[#001026]">Consult Dispensing Pharmacist</h3>
                  <p className="text-[11px] text-[#44474e]">Dr. Marcus Vance, PharmD (MetroCare Rx)</p>
                </div>
              </div>
              <button onClick={() => setShowConsultModal(false)} className="text-[#74777f]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleConsultSubmit} className="space-y-3 text-xs">
              <p className="text-[#44474e]">
                Have questions about dosage, generic substitution equivalence, or drug interactions for <strong>Atorvastatin 20mg</strong>?
              </p>
              <div>
                <label className="font-semibold block text-[#0b1c30] mb-1">Your Question or Consultation Request:</label>
                <textarea
                  rows={3}
                  value={consultQuestion}
                  onChange={(e) => setConsultQuestion(e.target.value)}
                  placeholder="e.g. Can I take this with my current morning vitamins?"
                  className="w-full p-2.5 border border-[#c4c6cf] rounded-xl text-xs focus:ring-1 focus:ring-[#006c49] focus:outline-none"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button 
                  type="button" 
                  onClick={() => setShowConsultModal(false)}
                  className="px-4 py-2 border rounded-xl text-[#44474e]"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-[#006c49] text-white font-bold rounded-xl"
                >
                  Submit Inquiry
                </button>
              </div>
            </form>
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
