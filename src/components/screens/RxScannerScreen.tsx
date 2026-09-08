import React, { useState } from 'react';
import { ASSET_IMAGES, CURRENT_ORDER } from '../../data/mockData';
import { ScreenId } from '../../types';

interface RxScannerScreenProps {
  onNavigateScreen: (screen: ScreenId) => void;
  onShowToast: (msg: string) => void;
  isMobileFrame?: boolean;
}

export const RxScannerScreen: React.FC<RxScannerScreenProps> = ({
  onNavigateScreen,
  onShowToast,
  isMobileFrame = false
}) => {
  const [flashOn, setFlashOn] = useState(false);
  const [scanMode, setScanMode] = useState<'auto' | 'manual' | 'pdf'>('auto');
  const [isScanning, setIsScanning] = useState(true);
  const [selectedPage, setSelectedPage] = useState(1);

  const handleCapture = () => {
    setIsScanning(false);
    onShowToast('Prescription Captured! OCR model confidence: 99.4%. Generic match found: Atorvastatin Calcium 20mg.');
  };

  const content = (
    <div className="bg-[#000d1d] text-white min-h-full flex flex-col font-body text-sm selection:bg-[#6cf8bb] selection:text-[#002113] relative overflow-hidden">
      {/* Top Controls Bar */}
      <div className="px-4 py-3 flex items-center justify-between z-30 bg-[#001026]/80 backdrop-blur-md border-b border-white/10">
        <button
          onClick={() => onNavigateScreen('customer-app')}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
        >
          <span className="material-symbols-outlined text-[20px]">chevron_left</span>
        </button>

        <div className="text-center">
          <h2 className="font-display font-bold text-sm text-white">Scan Prescription</h2>
          <p className="text-[10px] text-[#6cf8bb]">AI Salt &amp; Molecule Extraction Engine</p>
        </div>

        <button
          onClick={() => {
            setFlashOn(!flashOn);
            onShowToast(flashOn ? 'Flashlight disabled' : 'Torch enabled for low-light capture');
          }}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
            flashOn ? 'bg-[#6cf8bb] text-[#002113]' : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">
            {flashOn ? 'flash_on' : 'flash_off'}
          </span>
        </button>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center justify-center gap-2 py-2 px-4 z-30 bg-black/40 backdrop-blur-xs">
        {(['auto', 'manual', 'pdf'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => {
              setScanMode(mode);
              onShowToast(`Mode switched to: ${mode.toUpperCase()}`);
            }}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              scanMode === mode
                ? 'bg-[#006c49] text-white shadow-xs'
                : 'bg-white/10 text-slate-300 hover:text-white'
            }`}
          >
            {mode === 'auto' ? 'Auto-Scan (AI)' : mode === 'manual' ? 'Manual Shutter' : 'Upload PDF'}
          </button>
        ))}
      </div>

      {/* Quality & Alignment Pill */}
      <div className="flex justify-center py-1.5 z-20">
        <div className="bg-[#001026]/90 border border-[#6cf8bb]/40 rounded-full px-3 py-1 flex items-center gap-2 text-[11px] shadow-lg">
          <span className="w-2 h-2 rounded-full bg-[#6cf8bb] animate-ping"></span>
          <span className="font-medium text-slate-200">Ready to Capture</span>
          <span className="text-[#6ffbbe] font-bold">• 99.1% Confidence</span>
          <span className="text-white/60 hidden sm:inline">• High Light</span>
        </div>
      </div>

      {/* Camera Viewfinder Area */}
      <div className="flex-1 relative flex items-center justify-center p-4 overflow-hidden">
        {/* Prescription Doc under viewfinder */}
        <div className="relative w-full max-w-sm aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-slate-900">
          <img
            src={ASSET_IMAGES.prescriptionPad}
            alt="Doctor Prescription Target"
            className="w-full h-full object-cover opacity-85"
          />

          {/* Flashlight overlay if active */}
          {flashOn && (
            <div className="absolute inset-0 bg-yellow-100/15 pointer-events-none mix-blend-screen"></div>
          )}

          {/* Dark vignette borders outside scan zone */}
          <div className="absolute inset-0 border-[16px] border-black/40 pointer-events-none"></div>

          {/* Glowing Animated Laser Scanline */}
          <div className="absolute inset-x-4 h-0.5 bg-[#6cf8bb] shadow-[0_0_12px_#6cf8bb] animate-scan pointer-events-none"></div>

          {/* Corner Brackets */}
          <div className="absolute top-4 left-4 w-7 h-7 border-t-3 border-l-3 border-[#6cf8bb] rounded-tl-lg pointer-events-none"></div>
          <div className="absolute top-4 right-4 w-7 h-7 border-t-3 border-r-3 border-[#6cf8bb] rounded-tr-lg pointer-events-none"></div>
          <div className="absolute bottom-4 left-4 w-7 h-7 border-b-3 border-l-3 border-[#6cf8bb] rounded-bl-lg pointer-events-none"></div>
          <div className="absolute bottom-4 right-4 w-7 h-7 border-b-3 border-r-3 border-[#6cf8bb] rounded-br-lg pointer-events-none"></div>

          {/* OCR Real-Time Bounding Detection Boxes */}
          {/* Target 1: Drug Name */}
          <div className="absolute top-[38%] left-[10%] right-[10%] p-2 rounded-lg border-2 border-[#6cf8bb] bg-[#006c49]/20 backdrop-blur-xs shadow-lg animate-pulse">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#6cf8bb]">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                Lipitor 20mg
              </span>
              <span className="bg-[#6cf8bb] text-[#002113] text-[9px] px-1.5 py-0.2 rounded font-extrabold">
                85.6% Generic Match
              </span>
            </div>
          </div>

          {/* Target 2: Dosage Extract */}
          <div className="absolute top-[52%] left-[10%] right-[15%] p-1.5 rounded-lg border border-dashed border-[#6cf8bb]/80 bg-black/40 text-[10px] text-white">
            <span className="text-[#6ffbbe] font-semibold">Dosage Extracted:</span> 1 PO qHS (Bedtime)
          </div>

          {/* Target 3: Prescriber Signature */}
          <div className="absolute bottom-[16%] right-[10%] px-2 py-1 rounded border border-[#6cf8bb]/60 bg-black/40 text-[9px] text-[#6cf8bb] flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]">verified</span>
            Valid Prescriber Signature
          </div>
        </div>
      </div>

      {/* Detection Result Drawer Card */}
      <div className="z-30 px-4 pb-2">
        <div className="bg-[#001026] border border-[#0b2545] rounded-2xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#006c49]"></span>
              <span className="font-display font-bold text-xs text-white">
                1 Prescription Detected
              </span>
            </div>
            <span className="text-[10px] font-mono bg-[#0b2545] text-[#6cf8bb] px-2 py-0.5 rounded border border-[#6cf8bb]/20">
              HIPAA 256-BIT ENCRYPTED
            </span>
          </div>

          <div className="flex items-center justify-between bg-white/5 rounded-xl p-2.5 border border-white/10">
            <div>
              <div className="text-[11px] text-slate-400 line-through">Prescribed: {CURRENT_ORDER.brandPrescribed} ($98.50)</div>
              <div className="text-sm font-bold text-[#6cf8bb] flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                {CURRENT_ORDER.genericSubstitute}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400">Save 85.6%</span>
              <div className="text-base font-extrabold text-white font-display">
                $14.20
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateScreen('customer-app')}
            className="w-full py-2.5 bg-[#006c49] hover:bg-[#006c49]/90 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-colors"
          >
            <span>Confirm &amp; Proceed to Generic Comparison</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Bottom Camera Shutter Controls */}
      <div className="px-6 py-4 z-30 bg-[#001026]/90 backdrop-blur-md flex items-center justify-around border-t border-white/10">
        {/* Gallery Upload */}
        <button
          onClick={() => onShowToast('Upload prescription from Photo Gallery')}
          className="flex flex-col items-center gap-1 text-slate-300 hover:text-white"
        >
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">photo_library</span>
          </div>
          <span className="text-[10px]">Gallery</span>
        </button>

        {/* Shutter Button */}
        <div className="relative flex items-center justify-center">
          <div className="absolute w-16 h-16 rounded-full border-2 border-[#6cf8bb]/40 animate-pulse-ring pointer-events-none"></div>
          <button
            onClick={handleCapture}
            className="w-14 h-14 rounded-full bg-white text-[#001026] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-xl"
          >
            <div className="w-11 h-11 rounded-full border-2 border-[#001026] flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">camera</span>
            </div>
          </button>
        </div>

        {/* Multi-page Selector */}
        <button
          onClick={() => {
            const nextPage = selectedPage === 1 ? 2 : 1;
            setSelectedPage(nextPage);
            onShowToast(`Viewing Page ${nextPage} of 2`);
          }}
          className="flex flex-col items-center gap-1 text-slate-300 hover:text-white"
        >
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold text-xs">
            {selectedPage}/2
          </div>
          <span className="text-[10px]">Pages</span>
        </button>
      </div>
    </div>
  );

  if (isMobileFrame) {
    return (
      <div className="py-8 px-4 flex justify-center items-center min-h-[calc(100vh-60px)] bg-slate-900">
        <div className="w-[390px] h-[844px] bg-[#000d1d] rounded-[44px] shadow-2xl border-[10px] border-slate-800 overflow-hidden relative flex flex-col">
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
