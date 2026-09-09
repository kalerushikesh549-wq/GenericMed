import React, { useState } from 'react';
import { CURRENT_ORDER, ASSET_IMAGES } from '../../data/mockData';
import { ScreenId } from '../../types';

interface PharmacyPortalScreenProps {
  onNavigateScreen?: (screen: ScreenId) => void;
  onShowToast: (msg: string) => void;
}

export const PharmacyPortalScreen: React.FC<PharmacyPortalScreenProps> = ({
  onNavigateScreen,
  onShowToast
}) => {
  const [activeQueueTab, setActiveQueueTab] = useState<'all' | 'urgent' | 'cold' | 'routine'>('all');
  const [selectedOrderId, setSelectedOrderId] = useState('ord-88219');
  const [barcodeInput, setBarcodeInput] = useState('03009021944');
  const [isItemScanned, setIsItemScanned] = useState(true);
  const [isLeafletPacked, setIsLeafletPacked] = useState(true);
  const [isSealArmed, setIsSealArmed] = useState(true);
  const [isHandoverCompleted, setIsHandoverCompleted] = useState(false);
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [showRiderOtpModal, setShowRiderOtpModal] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [lastScannedBarcode, setLastScannedBarcode] = useState<string | null>('0071-0156-23');

  // USB / Bluetooth Handheld Barcode Scanner Keyboard Wedge Listener
  React.useEffect(() => {
    let buffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');

      const now = Date.now();
      const diff = now - lastKeyTime;
      lastKeyTime = now;

      if (e.key === 'Enter') {
        if (buffer.length >= 6) {
          if (!isInput) e.preventDefault();
          const code = buffer.trim();
          setBarcodeInput(code);
          setLastScannedBarcode(code);
          setIsItemScanned(true);
          onShowToast(`🟢 USB Barcode Gun Scanned [${code}]! Verified Match: 100% Cipla Atorvastatin 20mg Lot #CP-9021.`);
        }
        buffer = '';
        return;
      }

      if (diff > 120 && !isInput) {
        buffer = '';
      }

      if (e.key.length === 1) {
        buffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onShowToast]);

  const handleTriggerTestGunScan = () => {
    const testNdc = '0071-0156-23';
    setBarcodeInput(testNdc);
    setLastScannedBarcode(testNdc);
    setIsItemScanned(true);
    onShowToast(`🟢 USB Laser Gun Scanned [${testNdc}]! Verified: Atorvastatin Calcium 20mg.`);
  };

  const queueOrders = [
    {
      id: 'ord-88219',
      orderNumber: 'ORD-88219',
      patientName: 'Johnathan Doe',
      medication: 'Lipitor → Atorvastatin 20mg',
      countdown: '07:14',
      isUrgent: true,
      category: 'urgent',
      bay: 'Bay #2',
      rider: 'Miguel S.'
    },
    {
      id: 'ord-88224',
      orderNumber: 'ORD-88224',
      patientName: 'Sarah Jenkins',
      medication: 'Augmentin → Amox-Clav 625mg',
      countdown: '12:45',
      isUrgent: true,
      category: 'urgent',
      bay: 'Bay #1',
      rider: 'David K.'
    },
    {
      id: 'ord-88227',
      orderNumber: 'ORD-88227',
      patientName: 'Robert Chang',
      medication: 'Glucophage → Metformin 500mg',
      countdown: '18:20',
      isUrgent: false,
      category: 'cold',
      bay: 'Bay #3',
      rider: 'Ananya P.'
    },
    {
      id: 'ord-88231',
      orderNumber: 'ORD-88231',
      patientName: 'Eleanor Vance',
      medication: 'Crestor → Rosuvastatin 10mg',
      countdown: '24:00',
      isUrgent: false,
      category: 'routine',
      bay: 'Bay #4',
      rider: 'Pending'
    }
  ];

  const handleBarcodeScan = () => {
    if (!barcodeInput.trim()) return;
    setIsItemScanned(true);
    onShowToast(`Barcode [${barcodeInput}] Scanned! Verification Match: 100% Cipla Atorvastatin 20mg Lot #CP-9021.`);
  };

  const handleCompletePacking = () => {
    setIsHandoverCompleted(true);
    onShowToast('Order #ORD-88219 Marked as READY FOR HANDOVER at Bay #2!');
  };

  const handleConfirmOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpInput === '8410' || otpInput.length === 4) {
      setShowRiderOtpModal(false);
      onShowToast('Handover OTP 8410 Verified! Custody transferred to Rider Miguel S.');
      setOtpInput('');
    } else {
      onShowToast('Invalid OTP. Check customer tracking screen (8410).');
    }
  };

  return (
    <div className="bg-[#f8f9ff] text-[#0b1c30] min-h-screen flex flex-col font-body text-sm selection:bg-[#6cf8bb] selection:text-[#002113]">
      {/* Top Banner / Store Header */}
      <div className="bg-[#001026] text-white px-4 lg:px-6 py-2.5 border-b border-[#0b2545] flex flex-wrap items-center justify-between gap-3 sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#0b2545] text-[#6cf8bb] flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-[20px]">storefront</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-sm text-white">Store #4082 - MetroCare Central Dispensary</span>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-[#006c49]/25 text-[#6cf8bb] border border-[#006c49]/50">
                License: GDL-99201-MH
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-300">
              <span className="flex items-center gap-1 text-[#6cf8bb]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6cf8bb] animate-pulse"></span> Store Status: Open
              </span>
              <span>• Riders: 14 Live</span>
              <span>• Active Dispatches: 28</span>
              <span className="text-[#ffdad6] font-bold">• 3 Urgent Orders</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Hardware Barcode Scanner Simulator Action */}
          <button 
            onClick={handleTriggerTestGunScan}
            className="px-2.5 py-1.5 rounded-lg bg-[#0b2545] border border-[#6cf8bb]/40 text-[#6cf8bb] text-xs font-bold flex items-center gap-1.5 shadow-xs hover:bg-[#0b2545]/80 transition-colors"
            title="Simulate rapid barcode scan from USB/Bluetooth handheld gun"
          >
            <span className="material-symbols-outlined text-[16px]">barcode_scanner</span>
            <span>⚡ Test USB Gun Scan</span>
          </button>
          <button 
            onClick={() => onShowToast('Emergency hold armed. New orders paused.')}
            className="px-2.5 py-1.5 rounded-lg border border-red-500/40 text-red-300 text-xs hover:bg-red-950/40 transition-colors"
          >
            Emergency Hold
          </button>
          <button 
            onClick={() => onShowToast('Barcode Packing Mode Active • Listening for USB Scanner HID')}
            className="px-3 py-1.5 rounded-lg bg-[#006c49] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs hover:bg-[#006c49]/90 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">qr_code_scanner</span>
            HID Scanner Ready
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Side Navigation */}
        <aside className="w-60 hidden lg:flex flex-col justify-between bg-white border-r border-[#c4c6cf]/60 p-4 flex-shrink-0">
          <div className="space-y-4">
            <div className="text-xs font-bold text-[#44474e] uppercase tracking-wider pl-2">
              Dispensary Console
            </div>

            <nav className="space-y-1">
              <button className="w-full flex items-center gap-3 px-3 py-2 text-[#44474e] hover:text-[#0b1c30] hover:bg-[#eff4ff] rounded-lg text-left text-xs font-medium">
                <span className="material-symbols-outlined text-[18px]">inbox</span>
                <span className="flex-1">Incoming Orders</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#ffdad6] text-[#93000a]">18</span>
              </button>

              <button className="w-full flex items-center gap-3 px-3 py-2 bg-[#e5eeff] text-[#001026] rounded-lg text-left text-xs font-bold">
                <span className="material-symbols-outlined text-[18px]">inventory</span>
                <span className="flex-1">Packing &amp; Verification</span>
                <span className="w-2 h-2 rounded-full bg-[#001026]"></span>
              </button>

              <button 
                onClick={() => onNavigateScreen?.('manufacturer-portal')}
                className="w-full flex items-center gap-3 px-3 py-2 text-[#44474e] hover:text-[#0b1c30] hover:bg-[#eff4ff] rounded-lg text-left text-xs font-medium"
              >
                <span className="material-symbols-outlined text-[18px]">shelves</span>
                <span className="flex-1">Inventory &amp; Molecules</span>
                <span className="text-[11px] text-[#006c49] font-bold">240 btls</span>
              </button>

              <button 
                onClick={() => onShowToast('4 live dispatch bays active')}
                className="w-full flex items-center gap-3 px-3 py-2 text-[#44474e] hover:text-[#0b1c30] hover:bg-[#eff4ff] rounded-lg text-left text-xs font-medium"
              >
                <span className="material-symbols-outlined text-[18px]">two_wheeler</span>
                <span className="flex-1">Rider Handover Bay</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#6cf8bb] text-[#002113]">4 Live</span>
              </button>

              <button 
                onClick={() => onShowToast("Today's payout: $2,840.50 transferred to dispensary account")}
                className="w-full flex items-center gap-3 px-3 py-2 text-[#44474e] hover:text-[#0b1c30] hover:bg-[#eff4ff] rounded-lg text-left text-xs font-medium"
              >
                <span className="material-symbols-outlined text-[18px]">payments</span>
                <span className="flex-1">Daily Settlement</span>
              </button>

              <button 
                onClick={() => onShowToast('Compliance log: 42 generic substitutions signed off')}
                className="w-full flex items-center gap-3 px-3 py-2 text-[#44474e] hover:text-[#0b1c30] hover:bg-[#eff4ff] rounded-lg text-left text-xs font-medium"
              >
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
                <span className="flex-1">Compliance Audit</span>
              </button>
            </nav>
          </div>

          <div className="pt-4 border-t border-[#c4c6cf]/60 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#001026] text-white flex items-center justify-center font-bold text-xs">
              MV
            </div>
            <div>
              <div className="text-xs font-bold text-[#001026]">Dr. Marcus Vance</div>
              <div className="text-[10px] text-[#44474e]">Lead Pharmacist on Duty</div>
            </div>
          </div>
        </aside>

        {/* Central Workspace */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5 custom-scrollbar">
          {/* Top 4 KPI Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-3.5 bg-white rounded-xl border border-[#c4c6cf]/70 shadow-xs">
              <span className="text-[10px] font-bold text-[#44474e] uppercase">New Orders Waiting</span>
              <div className="text-xl font-display font-extrabold text-[#001026] mt-1 flex items-baseline gap-2">
                6 <span className="text-xs text-[#ba1a1a] font-bold bg-[#ffdad6] px-1.5 rounded">3 Urgent</span>
              </div>
              <p className="text-[11px] text-[#44474e] mt-1">SLA Target: &lt; 12m prep time</p>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-[#c4c6cf]/70 shadow-xs">
              <span className="text-[10px] font-bold text-[#44474e] uppercase">Packing &amp; Verification</span>
              <div className="text-xl font-display font-extrabold text-[#006c49] mt-1">
                5 Active
              </div>
              <p className="text-[11px] text-[#44474e] mt-1">2 Dispensing pharmacists</p>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-[#c4c6cf]/70 shadow-xs">
              <span className="text-[10px] font-bold text-[#44474e] uppercase">Ready for Handover</span>
              <div className="text-xl font-display font-extrabold text-[#001026] mt-1">
                7 Orders
              </div>
              <p className="text-[11px] text-[#44474e] mt-1">Waiting in Bay #1 - #4</p>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-[#c4c6cf]/70 shadow-xs">
              <span className="text-[10px] font-bold text-[#44474e] uppercase">Today&apos;s Revenue / Payout</span>
              <div className="text-xl font-display font-extrabold text-[#001026] mt-1">
                $2,840.50
              </div>
              <p className="text-[11px] text-[#006c49] font-semibold mt-1">+$255.60 dispensary take</p>
            </div>
          </div>

          {/* Dual-Pane Dispensing & Packing Workbench */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
            {/* LEFT PANE: Dispensing Queue (5 cols) */}
            <div className="xl:col-span-5 bg-white rounded-2xl border border-[#c4c6cf]/80 shadow-xs overflow-hidden flex flex-col">
              <div className="p-4 border-b border-[#c4c6cf]/70 bg-[#eff4ff]/40 flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-sm text-[#001026]">Dispensing Queue</h3>
                  <p className="text-[11px] text-[#44474e]">18 Pending Verification &amp; Packing</p>
                </div>
                <div className="flex items-center gap-1">
                  {(['all', 'urgent', 'cold', 'routine'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveQueueTab(tab)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all ${
                        activeQueueTab === tab
                          ? 'bg-[#001026] text-white'
                          : 'bg-[#e5eeff] text-[#44474e] hover:text-[#001026]'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Cards List */}
              <div className="p-3 space-y-2.5 overflow-y-auto max-h-[540px] custom-scrollbar flex-1">
                {queueOrders
                  .filter(o => activeQueueTab === 'all' || o.category === activeQueueTab)
                  .map((order) => {
                    const isSelected = selectedOrderId === order.id;
                    return (
                      <div
                        key={order.id}
                        onClick={() => setSelectedOrderId(order.id)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-2 border-[#006c49] bg-[#eff4ff]/60 shadow-xs'
                            : 'border-[#c4c6cf]/60 bg-white hover:border-[#006c49]/40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-[#001026]">
                            #{order.orderNumber}
                          </span>
                          <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                            order.isUrgent ? 'bg-[#ffdad6] text-[#ba1a1a]' : 'bg-[#e5eeff] text-[#001026]'
                          }`}>
                            ⏱ {order.countdown}
                          </span>
                        </div>

                        <div className="mt-1 flex items-baseline justify-between">
                          <span className="font-display font-bold text-sm text-[#0b1c30]">{order.patientName}</span>
                          <span className="text-[10px] text-[#006c49] font-bold">{order.bay}</span>
                        </div>

                        <div className="text-xs text-[#44474e] mt-0.5">{order.medication}</div>

                        <div className="mt-2 pt-2 border-t border-[#c4c6cf]/40 flex items-center justify-between text-[11px]">
                          <span className="text-[#44474e]">Rider: <strong className="text-[#0b1c30]">{order.rider}</strong></span>
                          <span className="text-[10px] font-semibold text-[#006c49]">Pharmacist Verified</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* RIGHT PANE: Active Order Workbench (#ORD-88219) (7 cols) */}
            <div className="xl:col-span-7 bg-white rounded-2xl border border-[#c4c6cf]/80 shadow-xs p-5 space-y-4">
              {/* Order Banner & Rider Assignment */}
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#c4c6cf]/60 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-base text-[#001026]">Order #ORD-88219</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#006c49]/15 text-[#006c49]">
                      Pharmacist Cleared
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0b2545] text-white">
                      Express 35m
                    </span>
                  </div>
                  <p className="text-xs text-[#44474e] mt-0.5">
                    Patient: <strong className="text-[#0b1c30]">{CURRENT_ORDER.patientName}</strong> (48y) • 742 Evergreen Terr, Brooklyn
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-[11px] text-[#44474e]">Assigned Rider</div>
                  <div className="text-xs font-bold text-[#001026]">Miguel S. (E-Bike #14)</div>
                  <span className="text-[10px] text-[#006c49] font-semibold">Arrived at Bay #2</span>
                </div>
              </div>

              {/* Digital Prescription Cross-Check */}
              <div className="p-3.5 rounded-xl bg-[#eff4ff]/60 border border-[#c4c6cf]/60 flex items-start gap-3">
                <img 
                  src={ASSET_IMAGES.prescriptionPad} 
                  alt="Prescription"
                  className="w-14 h-16 rounded-lg object-cover border border-[#c4c6cf] shadow-xs cursor-pointer hover:opacity-90"
                  onClick={() => setShowLabelModal(true)}
                  title="Click to zoom prescription"
                />
                <div className="flex-1 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#001026]">Prescribed by {CURRENT_ORDER.prescriber}</span>
                    <span className="text-[10px] text-[#44474e]">St. Jude Cardiovascular Clinic</span>
                  </div>
                  <div className="text-[11px] text-[#44474e]">
                    Original Rx: <span className="line-through">{CURRENT_ORDER.brandPrescribed}</span> → Authorized Substitute: <strong className="text-[#006c49]">{CURRENT_ORDER.genericSubstitute}</strong>
                  </div>
                  <div className="text-[11px] text-[#0b1c30]">
                    Sig: 1 tablet orally once daily at bedtime (qHS) • Dispense #30
                  </div>
                </div>
              </div>

              {/* Dispensing Validation Checklist & Barcode Scan */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#001026] uppercase tracking-wider">
                    Dispensing Item &amp; Barcode Verification
                  </span>
                  <span className="text-[11px] text-[#006c49] font-bold">Bin Location: Bin A-14</span>
                </div>

                {/* Barcode Scanner Input */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#74777f]">
                      <span className="material-symbols-outlined text-[18px]">barcode_scanner</span>
                    </span>
                    <input
                      type="text"
                      value={barcodeInput}
                      onChange={(e) => setBarcodeInput(e.target.value)}
                      placeholder="Scan NDC Barcode on generic bottle..."
                      className="w-full pl-9 pr-3 py-2 bg-white border border-[#c4c6cf] rounded-xl text-xs font-mono text-[#0b1c30] focus:ring-1 focus:ring-[#006c49] focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={handleBarcodeScan}
                    className="px-4 py-2 bg-[#001026] hover:bg-[#0b2545] text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Scan / Validate
                  </button>
                </div>

                {/* Scanned Items Checklist */}
                <div className="space-y-2">
                  <div className="p-3 rounded-xl border border-[#c4c6cf]/60 bg-white flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[#006c49] text-[20px]">check_circle</span>
                      <div>
                        <div className="font-bold text-[#001026]">Atorvastatin Calcium 20mg (Cipla Multi-Source)</div>
                        <div className="text-[11px] text-[#44474e]">Lot #{CURRENT_ORDER.batchNumber} • Exp: {CURRENT_ORDER.expiry} • 30 Tablets</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#006c49]/15 text-[#006c49]">
                      MATCH 100%
                    </span>
                  </div>

                  <div className="p-3 rounded-xl border border-[#c4c6cf]/60 bg-white flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[#006c49] text-[20px]">check_circle</span>
                      <div>
                        <div className="font-bold text-[#001026]">FDA Patient Safety &amp; Dosage Leaflet</div>
                        <div className="text-[11px] text-[#44474e]">Medication guide + Bio-equivalence equivalence statement</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#e5eeff] text-[#001026]">
                      INSERT PACKED
                    </span>
                  </div>
                </div>
              </div>

              {/* Security Tamper Seal Barcode */}
              <div className="p-3.5 rounded-xl bg-[#eff4ff] border border-[#c4c6cf]/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#001026] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#006c49]">lock</span>
                    Tamper-Evident Security Seal
                  </span>
                  <span className="text-[10px] font-bold text-[#006c49]">TAPE ARMED</span>
                </div>
                <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-[#c4c6cf]/50 font-mono text-xs">
                  <span className="text-[#44474e]">Seal Barcode:</span>
                  <span className="font-bold text-[#001026]">{CURRENT_ORDER.tamperSealId}</span>
                </div>
              </div>

              {/* Workbench Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => onShowToast('Clinical discrepancy form initiated')}
                    className="px-3 py-2 rounded-xl border border-[#c4c6cf] hover:bg-[#eff4ff] text-[#ba1a1a] text-xs font-semibold"
                  >
                    Flag Discrepancy
                  </button>
                  <button 
                    onClick={() => setShowLabelModal(true)}
                    className="px-3 py-2 rounded-xl border border-[#c4c6cf] hover:bg-[#eff4ff] text-[#001026] text-xs font-semibold flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">print</span>
                    Reprint Bottle Label
                  </button>
                </div>

                <button
                  onClick={handleCompletePacking}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors ${
                    isHandoverCompleted
                      ? 'bg-[#006c49] text-white'
                      : 'bg-[#001026] hover:bg-[#0b2545] text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isHandoverCompleted ? 'task_alt' : 'archive'}
                  </span>
                  {isHandoverCompleted ? 'Packed & Moved to Bay #2' : 'Complete Packing & Transfer to Rider Bay'}
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Section: Live Rider Handover & Dispatch Bay Table */}
          <div className="bg-white rounded-2xl border border-[#c4c6cf]/80 shadow-xs p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-sm text-[#001026]">Live Rider Handover &amp; Dispatch Bays</h3>
                <p className="text-xs text-[#44474e]">Express delivery couriers currently staged or arriving at loading bays</p>
              </div>
              <span className="text-xs font-bold text-[#006c49]">4 Active Bays</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#eff4ff] text-[#44474e] border-b border-[#c4c6cf]/60">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">Bay #</th>
                    <th className="px-4 py-2.5 font-semibold">Assigned Order</th>
                    <th className="px-4 py-2.5 font-semibold">Courier Name</th>
                    <th className="px-4 py-2.5 font-semibold">Vehicle Type</th>
                    <th className="px-4 py-2.5 font-semibold">Bay Status</th>
                    <th className="px-4 py-2.5 font-semibold text-right">Handover Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c4c6cf]/40 text-[#0b1c30]">
                  <tr className="hover:bg-[#eff4ff]/30">
                    <td className="px-4 py-3 font-bold text-[#001026]">Bay 2</td>
                    <td className="px-4 py-3 font-mono font-bold">#ORD-88219 (Johnathan Doe)</td>
                    <td className="px-4 py-3 font-semibold">Miguel S.</td>
                    <td className="px-4 py-3 text-[#44474e]">E-Cargo Bike #14</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#006c49]/15 text-[#006c49]">
                        Arrived &amp; Waiting
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => setShowRiderOtpModal(true)}
                        className="px-3 py-1 bg-[#006c49] hover:bg-[#006c49]/90 text-white font-bold rounded-lg text-xs"
                      >
                        Confirm OTP Handover
                      </button>
                    </td>
                  </tr>

                  <tr className="hover:bg-[#eff4ff]/30">
                    <td className="px-4 py-3 font-bold text-[#001026]">Bay 1</td>
                    <td className="px-4 py-3 font-mono font-bold">#ORD-88224 (Sarah Jenkins)</td>
                    <td className="px-4 py-3 font-semibold">David K.</td>
                    <td className="px-4 py-3 text-[#44474e]">Insulated Scooter #03</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#e5eeff] text-[#001026]">
                        En Route (2 mins)
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => onShowToast('Awaiting courier arrival at Bay 1')}
                        className="px-3 py-1 bg-white border border-[#c4c6cf] text-[#44474e] font-semibold rounded-lg text-xs"
                      >
                        Awaiting Arrival
                      </button>
                    </td>
                  </tr>

                  <tr className="hover:bg-[#eff4ff]/30">
                    <td className="px-4 py-3 font-bold text-[#001026]">Bay 3</td>
                    <td className="px-4 py-3 font-mono font-bold">#ORD-88227 (Robert Chang)</td>
                    <td className="px-4 py-3 font-semibold">Ananya P.</td>
                    <td className="px-4 py-3 text-[#44474e]">Cold-Chain Van #08</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#e5eeff] text-[#001026]">
                        En Route (6 mins)
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => onShowToast('Awaiting courier arrival at Bay 3')}
                        className="px-3 py-1 bg-white border border-[#c4c6cf] text-[#44474e] font-semibold rounded-lg text-xs"
                      >
                        Awaiting Arrival
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Thermal Label & Tamper Seal Modal */}
      {showLabelModal && (
        <div className="fixed inset-0 z-50 bg-[#001026]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-[#c4c6cf] p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <h3 className="font-display font-bold text-sm text-[#001026]">Prescription Bottle &amp; Tamper Seal Printer</h3>
                <p className="text-[11px] text-[#44474e]">Thermal Roll Output (Zebra ZD420 / ESC-POS 203 DPI)</p>
              </div>
              <button onClick={() => setShowLabelModal(false)} className="text-[#74777f] hover:text-[#001026]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Thermal Label Mockup */}
            <div className="p-4 bg-white border-2 border-black rounded-lg font-mono text-[11px] space-y-2 shadow-sm text-black">
              {/* Tamper Seal Strip Preview */}
              <div className="bg-amber-100 border border-amber-500 p-1.5 rounded flex items-center justify-between text-[10px] font-bold text-amber-900">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">lock</span>
                  TAMPER SEAL: {CURRENT_ORDER.tamperSealId}
                </span>
                <span>SECURITY LEVEL IV</span>
              </div>

              <div className="text-center font-bold border-b border-black pb-1">
                METROCARE RX DOWNTOWN • (718) 555-0192<br/>
                142 COURT ST, BROOKLYN NY 11201 • NABP #339201
              </div>

              <div className="flex justify-between pt-1 font-bold">
                <span>RX #88219-01</span>
                <span>DATE: {CURRENT_ORDER.date}</span>
              </div>
              <div className="font-bold text-sm">
                DOE, JOHNATHAN D. (AGE 48)
              </div>
              <div className="text-xs font-bold text-[#006c49]">
                ATORVASTATIN CALCIUM 20MG TAB
              </div>
              <div>SIG: TAKE 1 TABLET BY MOUTH DAILY AT BEDTIME (qHS)</div>
              <div className="text-[10px] text-gray-700">SUBSTITUTED FOR LIPITOR 20MG (PFIZER LABS) • AB RATED</div>
              <div className="flex justify-between text-[10px] pt-1 border-t border-black">
                <span>QTY: 30 TABLETS</span>
                <span>REFILLS: 3</span>
                <span>EXP: 11/2026</span>
              </div>

              {/* Barcode SVG Pattern */}
              <div className="pt-2 flex flex-col items-center">
                <svg className="w-64 h-12" viewBox="0 0 200 40">
                  <rect x="10" y="0" width="3" height="35" fill="black" />
                  <rect x="16" y="0" width="2" height="35" fill="black" />
                  <rect x="22" y="0" width="5" height="35" fill="black" />
                  <rect x="30" y="0" width="2" height="35" fill="black" />
                  <rect x="36" y="0" width="4" height="35" fill="black" />
                  <rect x="44" y="0" width="2" height="35" fill="black" />
                  <rect x="50" y="0" width="6" height="35" fill="black" />
                  <rect x="60" y="0" width="3" height="35" fill="black" />
                  <rect x="68" y="0" width="4" height="35" fill="black" />
                  <rect x="76" y="0" width="2" height="35" fill="black" />
                  <rect x="82" y="0" width="5" height="35" fill="black" />
                  <rect x="92" y="0" width="3" height="35" fill="black" />
                  <rect x="100" y="0" width="2" height="35" fill="black" />
                  <rect x="108" y="0" width="6" height="35" fill="black" />
                  <rect x="118" y="0" width="3" height="35" fill="black" />
                  <rect x="126" y="0" width="5" height="35" fill="black" />
                  <rect x="136" y="0" width="2" height="35" fill="black" />
                  <rect x="144" y="0" width="4" height="35" fill="black" />
                  <rect x="154" y="0" width="3" height="35" fill="black" />
                  <rect x="162" y="0" width="5" height="35" fill="black" />
                  <rect x="172" y="0" width="2" height="35" fill="black" />
                  <rect x="180" y="0" width="4" height="35" fill="black" />
                </svg>
                <div className="text-[10px] tracking-widest font-bold">NDC 0071-0156-23</div>
              </div>

              <div className="text-center text-[10px] font-bold pt-1 border-t border-black">
                PRESCRIBER: DR. ELENA ROSTOVA MD (NPI 18839201)
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-[11px] text-[#44474e] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#006c49]"></span>
                Printer Status: Ready (Zebra ZD420)
              </span>

              <div className="flex gap-2">
                <button 
                  onClick={() => setShowLabelModal(false)}
                  className="px-3.5 py-2 border rounded-xl text-xs text-[#44474e] hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    onShowToast('Sending label job to thermal printer spooler...');
                    window.print();
                  }}
                  className="px-4 py-2 bg-[#001026] hover:bg-[#0b2545] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">print</span>
                  Print Thermal Label
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rider OTP Modal */}
      {showRiderOtpModal && (
        <div className="fixed inset-0 z-50 bg-[#001026]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-[#c4c6cf] p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-display font-bold text-sm text-[#001026]">Confirm Handover to Miguel S.</h3>
              <button onClick={() => setShowRiderOtpModal(false)} className="text-[#74777f]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleConfirmOtp} className="space-y-3 text-xs">
              <p className="text-[#44474e]">
                Ask rider Miguel S. (Bay 2) for the 4-digit handover authorization code (or use customer pin <strong>8410</strong>):
              </p>
              <div>
                <label className="font-semibold block mb-1">Handover PIN Code:</label>
                <input
                  type="text"
                  maxLength={4}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  placeholder="e.g. 8410"
                  className="w-full text-center text-xl font-mono tracking-widest p-2 border border-[#c4c6cf] rounded-xl focus:ring-1 focus:ring-[#006c49]"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button 
                  type="button" 
                  onClick={() => setShowRiderOtpModal(false)}
                  className="px-4 py-2 border rounded-xl text-[#44474e]"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-[#006c49] text-white font-bold rounded-xl"
                >
                  Authorize Handover
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
