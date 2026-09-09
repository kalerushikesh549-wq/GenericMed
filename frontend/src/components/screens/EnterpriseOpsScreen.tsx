import React, { useState } from 'react';
import { PHARMACY_HUBS, CURRENT_ORDER, ASSET_IMAGES } from '../../data/mockData';
import { ScreenId } from '../../types';

interface EnterpriseOpsScreenProps {
  onNavigateScreen?: (screen: ScreenId) => void;
  onShowToast: (msg: string) => void;
}

export const EnterpriseOpsScreen: React.FC<EnterpriseOpsScreenProps> = ({
  onNavigateScreen,
  onShowToast
}) => {
  const [selectedTenant, setSelectedTenant] = useState('Super Admin');
  const [activeSideNav, setActiveSideNav] = useState<'overview' | 'rx' | 'molecules' | 'hubs' | 'analytics' | 'microservices'>('overview');
  const [regionFilter, setRegionFilter] = useState('All Nodes');
  const [isApproved, setIsApproved] = useState(false);
  const [showPrescriberChat, setShowPrescriberChat] = useState(false);
  const [showDiscrepancyModal, setShowDiscrepancyModal] = useState(false);
  const [showFormulaModal, setShowFormulaModal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'Dr. Elena Rostova (MD)', time: '08:32 AM', text: 'Prescription issued for patient Doe. Standard hyperlipidemia protocol.' },
    { sender: 'Dr. R. Vance (Lead Pharmacist)', time: '08:34 AM', text: 'Reviewing substitution for Atorvastatin Calcium 20mg USP grade.' }
  ]);
  const [chatInput, setChatInput] = useState('');

  const handleApprove = () => {
    setIsApproved(true);
    onShowToast('Substitution Approved! Order #ORD-88219 routed to MetroCare Rx Downtown.');
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages(prev => [
      ...prev,
      { sender: 'Dr. R. Vance (Lead Pharmacist)', time: 'Just now', text: chatInput }
    ]);
    setChatInput('');
  };

  const handleExportCsv = () => {
    onShowToast('Generating compliance CSV audit report for FDA 21 CFR Part 11...');
  };

  return (
    <div className="bg-[#f8f9ff] text-[#0b1c30] antialiased min-h-screen flex flex-col font-body text-sm selection:bg-[#6cf8bb] selection:text-[#002113]">
      {/* ================= TOP NAVIGATION BAR ================= */}
      <header className="bg-white text-[#001026] sticky top-0 border-b border-[#c4c6cf]/60 shadow-xs z-30">
        <div className="flex justify-between items-center w-full px-4 lg:px-6 py-2.5">
          {/* Left: Logo & Contextual Architecture Subtitle */}
          <div className="flex items-center gap-4 lg:gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#0b2545] flex items-center justify-center text-[#6cf8bb] shadow-xs border border-white/20">
                <span className="material-symbols-outlined text-[22px]">health_and_safety</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-display font-bold text-[#001026] tracking-tight">GenericMed Enterprise</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#006c49]/15 text-[#006c49] border border-[#006c49]/30 tracking-wide">
                    SOC-2 TIER III
                  </span>
                </div>
                <p className="text-[11px] text-[#44474e]">Multi-Tenant Operations &amp; Compliance Gateway</p>
              </div>
            </div>

            {/* System Architecture Live Node Telemetry Pills */}
            <div className="hidden xl:flex items-center gap-2 border-l border-[#c4c6cf]/80 pl-5 text-[11px] text-[#44474e]">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#e5eeff] border border-[#c4c6cf]/60">
                <span className="w-2 h-2 rounded-full bg-[#006c49] inline-block animate-pulse"></span>
                <span className="text-[#0b1c30] font-semibold">API Gateway</span>
                <span className="text-[10px] text-[#006c49] font-bold">99.98%</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#e5eeff] border border-[#c4c6cf]/60">
                <span className="w-2 h-2 rounded-full bg-[#006c49] inline-block"></span>
                <span className="text-[#0b1c30] font-semibold">Redis Hit</span>
                <span className="text-[10px] text-[#006c49] font-bold">94.2%</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#e5eeff] border border-[#c4c6cf]/60">
                <span className="w-2 h-2 rounded-full bg-[#006c49] inline-block"></span>
                <span className="text-[#0b1c30] font-semibold">ElasticSync</span>
                <span className="text-[10px] text-[#006c49] font-bold">12ms</span>
              </div>
            </div>
          </div>

          {/* Center-Right: Core Nav Links & Global Search */}
          <div className="flex items-center gap-3 lg:gap-5">
            <nav className="hidden lg:flex items-center gap-5 text-[13px] font-medium">
              <button 
                onClick={() => setActiveSideNav('overview')}
                className={`${activeSideNav === 'overview' ? 'text-[#001026] font-bold border-b-2 border-[#001026] pb-1' : 'text-[#44474e] hover:text-[#0b1c30]'} transition-colors`}
              >
                Tenant Overview
              </button>
              <button 
                onClick={() => onNavigateScreen?.('customer-app')}
                className="text-[#44474e] hover:text-[#0b1c30] transition-colors"
              >
                Directory
              </button>
              <div className="relative">
                <button 
                  onClick={() => setActiveSideNav('rx')}
                  className="text-[#44474e] hover:text-[#0b1c30] transition-colors flex items-center gap-1.5"
                >
                  Rx Queue
                  <span className="bg-[#ba1a1a] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">14</span>
                </button>
              </div>
              <button 
                onClick={() => onNavigateScreen?.('manufacturer-portal')}
                className="text-[#44474e] hover:text-[#0b1c30] transition-colors"
              >
                Inventory Matrix
              </button>
              <button 
                onClick={() => onNavigateScreen?.('system-architecture')}
                className="text-[#44474e] hover:text-[#0b1c30] transition-colors"
              >
                Architecture
              </button>
            </nav>

            {/* Command / Search Bar */}
            <div className="relative hidden sm:block w-64 xl:w-72">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#74777f]">
                <span className="material-symbols-outlined text-[18px]">search</span>
              </span>
              <input
                className="w-full pl-9 pr-14 py-1.5 bg-white border border-[#c4c6cf] rounded-xl text-xs text-[#0b1c30] placeholder:text-[#74777f] focus:outline-none focus:ring-2 focus:ring-[#006c49]/40 focus:border-[#006c49] transition-all"
                placeholder="Search molecules, Rx ID, batch #..."
                type="text"
              />
              <span className="absolute inset-y-0 right-0 flex items-center pr-2">
                <kbd className="px-1.5 py-0.5 text-[10px] font-semibold text-[#44474e] bg-[#e5eeff] border border-[#c4c6cf]/60 rounded">⌘K</kbd>
              </span>
            </div>

            {/* Trailing Actions & User Profile Badge */}
            <div className="flex items-center gap-2 pl-2 border-l border-[#c4c6cf]">
              {/* Multi-Tenant Selector Pill */}
              <div 
                onClick={() => {
                  const newTenant = selectedTenant === 'Super Admin' ? 'MetroCare Rx (#HUB-104)' : 'Super Admin';
                  setSelectedTenant(newTenant);
                  onShowToast(`Active context switched to: ${newTenant}`);
                }}
                className="flex items-center gap-1.5 bg-[#dce9ff] px-2.5 py-1.5 rounded-xl border border-[#c4c6cf]/80 cursor-pointer hover:bg-[#e5eeff] transition-colors"
              >
                <span className="material-symbols-outlined text-[16px] text-[#001026]">domain</span>
                <span className="text-[11px] text-[#001026] font-semibold truncate max-w-[130px]">Tenant: {selectedTenant}</span>
                <span className="material-symbols-outlined text-[14px] text-[#74777f]">arrow_drop_down</span>
              </div>

              {/* Icon actions */}
              <div className="flex items-center gap-0.5">
                <button 
                  onClick={() => onShowToast('3 clinical alerts: 2 batch expiries pending, 1 urgent Rx review')}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#44474e] hover:bg-[#e5eeff] transition-colors relative" 
                  title="Notifications"
                >
                  <span className="material-symbols-outlined text-[20px]">notifications</span>
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ba1a1a] rounded-full"></span>
                </button>
                <button 
                  onClick={() => onNavigateScreen?.('system-architecture')}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#44474e] hover:bg-[#e5eeff] transition-colors" 
                  title="DNS Health Status"
                >
                  <span className="material-symbols-outlined text-[20px]">dns</span>
                </button>
                <button 
                  onClick={() => onShowToast('GenericMed Multi-Tenant v4.12: FDA Title 21 CFR Part 11 Electronic Records compliant.')}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#44474e] hover:bg-[#e5eeff] transition-colors" 
                  title="Documentation & Help"
                >
                  <span className="material-symbols-outlined text-[20px]">help</span>
                </button>
              </div>

              {/* Profile Avatar Cluster */}
              <div className="flex items-center gap-2 pl-1 cursor-pointer group">
                <div className="w-8 h-8 rounded-full bg-[#0b2545] text-[#6cf8bb] flex items-center justify-center font-bold text-xs ring-2 ring-[#e5eeff]">
                  RV
                </div>
                <div className="hidden xl:block text-left">
                  <div className="text-[12px] font-bold text-[#0b1c30] leading-tight">Dr. R. Vance</div>
                  <div className="text-[10px] text-[#44474e] leading-tight">Lead Pharmacist</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ================= MAIN WORKSPACE: SIDEBAR + DASHBOARD CANVAS ================= */}
      <div className="flex flex-1 overflow-hidden">
        {/* ================= SIDE NAVIGATION BAR ================= */}
        <aside className="w-64 hidden md:flex flex-col justify-between bg-white border-r border-[#c4c6cf]/60 p-4 flex-shrink-0">
          <div className="space-y-4">
            <div className="p-3 bg-[#eff4ff] rounded-xl border border-[#c4c6cf]/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#001026] text-[#6cf8bb] flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[18px]">health_and_safety</span>
                </div>
                <div>
                  <h2 className="text-sm font-display font-bold text-[#001026] leading-snug">Multi-Tenant Gateway</h2>
                  <p className="text-[11px] text-[#44474e]">Network v4.12 • Cluster Live</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setSelectedTenant(prev => prev === 'Super Admin' ? 'MetroCare Rx (#HUB-104)' : 'Super Admin');
                  onShowToast('Switched organization scope.');
                }}
                className="mt-3 w-full py-1.5 px-3 bg-[#001026] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-[#0b2545] transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
                Switch Organization
              </button>
            </div>

            {/* Primary Navigation Tabs */}
            <nav className="space-y-1">
              <button 
                onClick={() => setActiveSideNav('overview')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150 ${
                  activeSideNav === 'overview'
                    ? 'bg-[#e5eeff] text-[#001026] font-semibold'
                    : 'text-[#44474e] hover:text-[#0b1c30] hover:bg-[#eff4ff]'
                }`}
              >
                <span className="material-symbols-outlined text-[20px] text-[#001026]">domain</span>
                <span className="text-xs flex-1">Tenant Overview</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#001026]"></span>
              </button>

              <button 
                onClick={() => setActiveSideNav('rx')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150 ${
                  activeSideNav === 'rx'
                    ? 'bg-[#e5eeff] text-[#001026] font-semibold'
                    : 'text-[#44474e] hover:text-[#0b1c30] hover:bg-[#eff4ff]'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">verified</span>
                <span className="text-xs flex-1">Rx Verification</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#ffdad6] text-[#93000a]">14</span>
              </button>

              <button 
                onClick={() => onNavigateScreen?.('customer-app')}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-[#44474e] hover:text-[#0b1c30] hover:bg-[#eff4ff] rounded-lg text-left transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">science</span>
                <span className="text-xs flex-1">Molecule Database</span>
                <span className="text-[11px] text-[#006c49] font-bold">14.8k</span>
              </button>

              <button 
                onClick={() => onNavigateScreen?.('pharmacy-portal')}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-[#44474e] hover:text-[#0b1c30] hover:bg-[#eff4ff] rounded-lg text-left transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">local_pharmacy</span>
                <span className="text-xs flex-1">Pharmacy Hubs</span>
                <span className="w-2 h-2 rounded-full bg-[#006c49]"></span>
              </button>

              <button 
                onClick={() => onNavigateScreen?.('manufacturer-portal')}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-[#44474e] hover:text-[#0b1c30] hover:bg-[#eff4ff] rounded-lg text-left transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">monitoring</span>
                <span className="text-xs flex-1">Manufacturer Analytics</span>
              </button>

              <button 
                onClick={() => onNavigateScreen?.('system-architecture')}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-[#44474e] hover:text-[#0b1c30] hover:bg-[#eff4ff] rounded-lg text-left transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">hub</span>
                <span className="text-xs flex-1">System Microservices</span>
              </button>
            </nav>
          </div>

          {/* Bottom Regulatory Trust Signal */}
          <div className="pt-4 border-t border-[#c4c6cf]/60 space-y-2">
            <div className="p-2.5 rounded-lg bg-[#f8f9ff] border border-[#c4c6cf]/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-[#006c49]">lock</span>
                <span className="text-[11px] font-semibold text-[#0b1c30]">HIPAA / FDA CFR § 21</span>
              </div>
              <span className="text-[10px] text-[#006c49] font-bold">Compliant</span>
            </div>
            <nav className="space-y-0.5 text-xs">
              <button 
                onClick={handleExportCsv}
                className="w-full flex items-center gap-3 px-3 py-2 text-[#44474e] hover:text-[#0b1c30] hover:bg-[#eff4ff] rounded-lg transition-all text-left"
              >
                <span className="material-symbols-outlined text-[18px]">policy</span>
                <span>Audit Trail</span>
              </button>
              <button 
                onClick={() => onShowToast('RBAC Verified: 3 Roles active (Admin, Lead Pharmacist, Dispensing RPh)')}
                className="w-full flex items-center gap-3 px-3 py-2 text-[#44474e] hover:text-[#0b1c30] hover:bg-[#eff4ff] rounded-lg transition-all text-left"
              >
                <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                <span>Security &amp; RBAC</span>
              </button>
            </nav>
          </div>
        </aside>

        {/* ================= CANVAS AREA: MEDICAL OPERATIONS CONSOLE ================= */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 custom-scrollbar">
          {/* Top Action Bar & Real-Time Tenant Headline */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-1">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl lg:text-2xl font-display font-bold text-[#001026] tracking-tight">Enterprise Multi-Tenant Operations</h1>
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#0b2545] text-white">Cluster: US-East-1A</span>
              </div>
              <p className="text-xs lg:text-sm text-[#44474e] mt-0.5">
                Synchronized with <span className="font-semibold text-[#001026]">Microservices Mesh</span> • 14 Regional Pharmacy Hubs Active • Continuous Drug Equivalence Checking
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={handleExportCsv}
                className="px-3.5 py-2 rounded-xl bg-white border border-[#c4c6cf] hover:bg-[#e5eeff] text-[#001026] font-semibold text-xs flex items-center gap-2 shadow-xs transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                Compliance CSV Export
              </button>
              <button 
                onClick={() => setShowFormulaModal(true)}
                className="px-4 py-2 rounded-xl bg-[#006c49] text-white hover:bg-[#006c49]/90 font-semibold text-xs flex items-center gap-2 shadow-xs transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                Add Bio-Equivalent Formula
              </button>
            </div>
          </div>

          {/* SECTION 1: EXECUTIVE PLATFORM KPI GRID (BENTO TILES) */}
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Metric 1: GMV */}
            <div className="bg-white rounded-xl p-5 border border-[#c4c6cf]/70 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#44474e] uppercase tracking-wider">Total Monthly Medicine GMV</span>
                <div className="w-8 h-8 rounded-lg bg-[#e5eeff] flex items-center justify-center text-[#001026]">
                  <span className="material-symbols-outlined text-[18px]">payments</span>
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <div className="text-2xl lg:text-3xl font-display font-extrabold text-[#001026]">$1,428,950</div>
                <span className="text-[#006c49] text-xs font-bold flex items-center">
                  <span className="material-symbols-outlined text-[16px]">trending_up</span> +18.4%
                </span>
              </div>
              <p className="text-[12px] text-[#44474e] mt-1.5">Across 42,910 processed generic prescriptions</p>
              <div className="w-full bg-[#e5eeff] h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-[#001026] h-full rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>

            {/* Metric 2: Marketplace Commission */}
            <div className="bg-white rounded-xl p-5 border border-[#c4c6cf]/70 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#44474e] uppercase tracking-wider">Platform Take-Rate (Revenue)</span>
                <div className="w-8 h-8 rounded-lg bg-[#006c49]/10 flex items-center justify-center text-[#006c49]">
                  <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <div className="text-2xl lg:text-3xl font-display font-extrabold text-[#001026]">$121,460</div>
                <span className="text-[#006c49] text-xs font-bold bg-[#006c49]/15 px-2 py-0.5 rounded text-[11px]">8.5% avg</span>
              </div>
              <p className="text-[12px] text-[#44474e] mt-1.5">Settled automatically across 14 tenant hubs</p>
              <div className="w-full bg-[#e5eeff] h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-[#006c49] h-full rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>

            {/* Metric 3: Active Molecules Listed & Patient Savings */}
            <div className="bg-white rounded-xl p-5 border border-[#c4c6cf]/70 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#44474e] uppercase tracking-wider">Active Generic Molecules</span>
                <div className="w-8 h-8 rounded-lg bg-[#dce9ff] flex items-center justify-center text-[#001026]">
                  <span className="material-symbols-outlined text-[18px]">medication</span>
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <div className="text-2xl lg:text-3xl font-display font-extrabold text-[#001026]">14,820</div>
                <span className="text-[12px] font-bold text-[#006c49] bg-[#006c49]/10 px-2 py-0.5 rounded">78% Avg Savings</span>
              </div>
              <p className="text-[12px] text-[#44474e] mt-1.5">Mapped to 3,450 expensive branded formulas</p>
              <div className="w-full bg-[#e5eeff] h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-[#6cf8bb] h-full rounded-full" style={{ width: '88%' }}></div>
              </div>
            </div>

            {/* Metric 4: Rx Verification Turnaround */}
            <div className="bg-white rounded-xl p-5 border border-[#c4c6cf]/70 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#44474e] uppercase tracking-wider">Prescriptions In Review</span>
                <div className="w-8 h-8 rounded-lg bg-[#ffdad6]/60 flex items-center justify-center text-[#ba1a1a]">
                  <span className="material-symbols-outlined text-[18px]">assignment_late</span>
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <div className="text-2xl lg:text-3xl font-display font-extrabold text-[#001026]">14 <span className="text-base font-semibold text-[#ba1a1a]">Urgent</span></div>
                <span className="text-[#44474e] text-[12px]">/ 188 verified today</span>
              </div>
              <p className="text-[12px] text-[#44474e] mt-1.5">Avg Turnaround: <span className="font-bold text-[#0b1c30]">4.2 mins</span> (SLA: &lt; 15 mins)</p>
              <div className="w-full bg-[#e5eeff] h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-[#ba1a1a] h-full rounded-full" style={{ width: '25%' }}></div>
              </div>
            </div>
          </section>

          {/* SECTION 2: DIGITAL PRESCRIPTION VERIFICATION & MOLECULE COMPARISON ENGINE (SPLIT-VIEW) */}
          <section className="bg-white rounded-xl border border-[#c4c6cf]/70 shadow-xs overflow-hidden">
            {/* Header Strip */}
            <div className="px-6 py-4 border-b border-[#c4c6cf]/70 flex flex-wrap items-center justify-between gap-4 bg-[#eff4ff]/40">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#0b2545] text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">prescriptions</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base lg:text-lg font-display font-bold text-[#001026]">Live Prescription (Rx) Verification &amp; Generic Substitution</h2>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#ffdad6] text-[#93000a]">Queue Priority: #1</span>
                  </div>
                  <p className="text-xs text-[#44474e]">
                    Prescription #RX-2024-99824 • Ingested via Mobile OCR Service • Multi-Tenant Pharmacy Routing Engine
                  </p>
                </div>
              </div>

              {/* Session Controls */}
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-[#44474e]">Reviewer Time Remaining: <strong className="text-[#001026] font-mono">{CURRENT_ORDER.timeRemaining}</strong></span>
                <button 
                  onClick={() => onShowToast('Queue refreshed. 14 items pending.')}
                  className="p-1.5 hover:bg-[#e5eeff] rounded-lg text-[#74777f]" 
                  title="Refresh Feed"
                >
                  <span className="material-symbols-outlined text-[18px]">refresh</span>
                </button>
                <button 
                  onClick={() => onNavigateScreen?.('rx-scanner')}
                  className="p-1.5 hover:bg-[#e5eeff] rounded-lg text-[#74777f]" 
                  title="Open Camera Scanner"
                >
                  <span className="material-symbols-outlined text-[18px]">open_in_full</span>
                </button>
              </div>
            </div>

            {/* Split-View Grid: Left = Rx Doc Preview, Right = Substitution & Savings Calculation */}
            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#c4c6cf]/70">
              {/* LEFT: Patient & Rx Digitized Document Preview (5 cols) */}
              <div className="lg:col-span-5 p-5 lg:p-6 space-y-5 bg-[#f8f9ff]/50">
                {/* Patient Demographics Pill Box */}
                <div className="p-4 rounded-xl bg-white border border-[#c4c6cf]/60 shadow-xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-[#44474e] uppercase tracking-wider">Patient Record</span>
                      <h3 className="text-base font-display text-[#001026] font-bold">{CURRENT_ORDER.patientName}</h3>
                      <div className="text-[12px] text-[#44474e]">{CURRENT_ORDER.patientAge} Yrs • Male • DOB: {CURRENT_ORDER.patientDob}</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#006c49]/15 text-[#006c49] border border-[#006c49]/30 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">verified_user</span> KYC Verified
                    </span>
                  </div>
                  <div className="pt-2 border-t border-[#c4c6cf]/40 flex items-center justify-between text-[12px]">
                    <span className="text-[#44474e]">Prescriber: <strong className="text-[#0b1c30]">{CURRENT_ORDER.prescriber}</strong></span>
                    <span className="text-[#44474e] font-mono text-[11px]">LIC #MD-88319</span>
                  </div>
                </div>

                {/* OCR Document Inspection Frame */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="font-semibold text-[#0b1c30] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-[#001026]">document_scanner</span>
                      Prescription Document (OCR Scanned)
                    </span>
                    <span className="text-[#006c49] font-bold text-[11px] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#006c49]"></span> Confidence: 99.1%
                    </span>
                  </div>

                  {/* Prescription Scan Visual Placeholder Card */}
                  <div className="p-4 rounded-xl border border-dashed border-[#c4c6cf] bg-white relative group">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b border-[#c4c6cf]/40 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[20px] text-[#0b2545]">local_hospital</span>
                          <span className="text-[12px] font-bold text-[#001026]">ST. JUDE CARDIOVASCULAR CLINIC</span>
                        </div>
                        <span className="text-[11px] text-[#44474e]">Date: Oct 24, 2024</span>
                      </div>

                      <div className="bg-[#eff4ff]/60 p-3 rounded-lg border border-[#c4c6cf]/40">
                        <div className="text-[11px] text-[#44474e] font-semibold">PRESCRIPTION EXTRACT (RAW OCR):</div>
                        <div className="text-base font-display text-[#001026] font-bold mt-1">Rx: Lipitor 20mg</div>
                        <div className="text-[13px] text-[#0b1c30] mt-0.5">
                          Sig: 1 tablet orally once daily at bedtime for hyperlipidemia. Dispense: #30 (Thirty). Refills: 3
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-1.5 text-[11px] text-[#006c49] font-medium">
                          <span className="material-symbols-outlined text-[15px]">draw</span>
                          Physician Digital Signature Validated
                        </div>
                        <button 
                          onClick={() => setShowPdfModal(true)}
                          className="text-[11px] text-[#001026] underline font-semibold hover:text-[#006c49]"
                        >
                          Inspect Original PDF
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Safety Screening Alert */}
                <div className="p-3.5 rounded-xl bg-[#eff4ff] border border-[#c4c6cf]/50 space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#44474e] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px] text-[#006c49]">check_circle</span> Automated Safety Screening
                  </div>
                  <p className="text-[12px] text-[#0b1c30]">
                    No acute drug-drug interactions detected with patient&apos;s active medication list (Metformin 500mg, Lisinopril 10mg). Row isolation verified against Patient Tenant #T-882.
                  </p>
                </div>
              </div>

              {/* RIGHT: Bio-Equivalent Generic Substitution Matching Engine (7 cols) */}
              <div className="lg:col-span-7 p-5 lg:p-6 space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#006c49]">Generic Matching Engine v3.4</span>
                    <h3 className="text-lg font-display text-[#001026] font-bold">Bio-Equivalence Analysis &amp; Savings Matrix</h3>
                  </div>
                  <span className="px-3 py-1 rounded-full text-[12px] font-bold bg-[#6cf8bb] text-[#00714d] border border-[#006c49]">
                    85.6% Direct Savings
                  </span>
                </div>

                {/* Comparison Matrix: Brand vs Generic */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Original Brand Medicine Card */}
                  <div className="p-4 rounded-xl border border-[#c4c6cf] bg-[#eff4ff]/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#dce9ff] text-[#44474e]">ORIGINAL PRESCRIBED</span>
                      <span className="text-[11px] text-[#74777f] font-mono">NDC: 0071-0156-23</span>
                    </div>
                    <div>
                      <h4 className="text-base font-display font-bold text-[#0b1c30]">Lipitor 20mg</h4>
                      <p className="text-[12px] text-[#44474e]">Pfizer Pharmaceuticals • Film-coated</p>
                    </div>
                    <div className="pt-2 border-t border-[#c4c6cf]/40">
                      <div className="text-[11px] text-[#44474e]">Standard Pharmacy Cash Price</div>
                      <div className="text-lg font-display font-bold text-[#74777f] line-through">
                        $98.50 <span className="text-[12px] font-normal text-[#44474e]">/ 30 days</span>
                      </div>
                    </div>
                    <div className="text-[11px] text-[#44474e] bg-[#e5eeff] p-2 rounded-lg">
                      <strong>Active Salt:</strong> Atorvastatin Calcium Trihydrate (20mg equivalent)
                    </div>
                  </div>

                  {/* Algorithmic Bio-Equivalent Generic Card */}
                  <div className="p-4 rounded-xl border-2 border-[#006c49] bg-white shadow-xs space-y-3 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-[#006c49] text-white text-[10px] font-bold px-3 py-0.5 rounded-bl-lg">
                      FDA TIER-A CERTIFIED
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#006c49]/15 text-[#006c49] border border-[#006c49]/30">
                        RECOMMENDED GENERIC
                      </span>
                    </div>
                    <div>
                      <h4 className="text-base font-display font-bold text-[#001026]">Atorvastatin Calcium 20mg</h4>
                      <p className="text-[12px] text-[#44474e]">USP Grade • Cipla / Teva Multi-Source</p>
                    </div>
                    <div className="pt-2 border-t border-[#c4c6cf]/40">
                      <div className="text-[11px] text-[#006c49] font-bold">GenericMed Platform Wholesale Price</div>
                      <div className="text-lg font-display font-bold text-[#006c49]">
                        $14.20 <span className="text-[12px] font-normal text-[#44474e]">/ 30 days</span>
                      </div>
                    </div>
                    <div className="text-[11px] text-[#001026] bg-[#006c49]/10 p-2 rounded-lg border border-[#006c49]/20">
                      <strong>Bio-Equivalence AUC:</strong> 99.4% identical pharmacokinetic curve to Lipitor.
                    </div>
                  </div>
                </div>

                {/* Pharmacist Clinical Verification Criteria Checklist */}
                <div className="p-4 rounded-xl bg-[#eff4ff] border border-[#c4c6cf]/60 space-y-2.5">
                  <div className="text-[12px] font-bold text-[#001026] uppercase tracking-wider flex items-center justify-between">
                    <span>Clinical Substitution Rules Check</span>
                    <span className="text-[11px] text-[#006c49] font-semibold">All 4 Criteria Satisfied</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px]">
                    <div className="flex items-center gap-2 text-[#0b1c30]">
                      <span className="material-symbols-outlined text-[16px] text-[#006c49]">check_box</span>
                      <span>Active Pharmaceutical Ingredient (API) Match</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#0b1c30]">
                      <span className="material-symbols-outlined text-[16px] text-[#006c49]">check_box</span>
                      <span>Identical Dosage Form &amp; Route (Oral Tablet)</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#0b1c30]">
                      <span className="material-symbols-outlined text-[16px] text-[#006c49]">check_box</span>
                      <span>Bioavailability / Bioequivalence (Cmax &amp; AUC)</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#0b1c30]">
                      <span className="material-symbols-outlined text-[16px] text-[#006c49]">check_box</span>
                      <span>Patient Opt-in for Generic Savings Authorized</span>
                    </div>
                  </div>
                </div>

                {/* Automated Multi-Tenant Dispatch Routing */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="font-semibold text-[#001026]">Automated Multi-Tenant Dispatch Routing</span>
                    <span className="text-[#44474e]">3 Partner Hubs in 5-mile radius with verified stock</span>
                  </div>
                  <div className="p-3 rounded-xl border border-[#c4c6cf]/60 bg-white flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#e5eeff] flex items-center justify-center text-[#001026]">
                        <span className="material-symbols-outlined text-[18px]">storefront</span>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-[#001026]">MetroCare Rx Downtown (Tenant ID: #HUB-104)</div>
                        <div className="text-[11px] text-[#44474e]">Stock: 240 units available • Distance: 1.8 miles • ETA: 35 mins dispatch</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#006c49]/15 text-[#006c49]">Optimal Route</span>
                    </div>
                  </div>
                </div>

                {/* Action Bar: Pharmacist Sign-Off & Workflow Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#c4c6cf]/60">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setShowDiscrepancyModal(true)}
                      className="px-3.5 py-2 rounded-xl bg-white border border-[#c4c6cf] hover:bg-[#eff4ff] text-[#ba1a1a] font-semibold text-xs flex items-center gap-1.5 transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px]">report_problem</span>
                      Flag Clinical Discrepancy
                    </button>
                    <button 
                      onClick={() => setShowPrescriberChat(true)}
                      className="px-3.5 py-2 rounded-xl bg-white border border-[#c4c6cf] hover:bg-[#eff4ff] text-[#001026] font-semibold text-xs flex items-center gap-1.5 transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px]">forum</span>
                      Chat with Prescriber
                    </button>
                  </div>

                  <button 
                    onClick={handleApprove}
                    disabled={isApproved}
                    className={`px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-md transition-all ${
                      isApproved 
                        ? 'bg-[#006c49] text-white' 
                        : 'bg-[#001026] text-white hover:bg-[#0b2545]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {isApproved ? 'check_circle' : 'task_alt'}
                    </span>
                    {isApproved ? 'Approved & Dispatched to MetroCare Hub' : 'Approve Substitution & Route Order'}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 3: MULTI-TENANT PHARMACY FULFILLMENT & REVENUE COMMISSION MATRIX */}
          <section className="bg-white rounded-xl border border-[#c4c6cf]/70 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-[#c4c6cf]/70 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-display font-bold text-[#001026]">Multi-Tenant Pharmacy Fulfillment Matrix</h2>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#dce9ff] text-[#001026]">Active Tenants: 14</span>
                </div>
                <p className="text-xs text-[#44474e]">
                  Cross-tenant order allocation, delivery SLA compliance, and automated fee distribution.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-[#e5eeff] px-3 py-1.5 rounded-lg border border-[#c4c6cf]/50 text-[12px] text-[#0b1c30]">
                  <span className="material-symbols-outlined text-[16px] text-[#006c49]">filter_list</span>
                  <select 
                    value={regionFilter} 
                    onChange={(e) => setRegionFilter(e.target.value)}
                    className="bg-transparent font-medium border-none focus:ring-0 p-0 text-xs"
                  >
                    <option value="All Nodes">Filter by Region: All Nodes</option>
                    <option value="Metro Core East">Metro Core East</option>
                    <option value="Western Suburbs">Western Suburbs</option>
                    <option value="Industrial North">Industrial North</option>
                  </select>
                </div>
                <button 
                  onClick={() => onShowToast('Routing policy: Nearest inventory with >98% match rate prioritised.')}
                  className="text-[12px] text-[#001026] font-semibold hover:underline flex items-center gap-1"
                >
                  Configure Routing Rules <span className="material-symbols-outlined text-[14px]">settings</span>
                </button>
              </div>
            </div>

            {/* Dense Enterprise Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#eff4ff] text-[#44474e] border-b border-[#c4c6cf]/70">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Tenant Organization &amp; Node</th>
                    <th className="px-4 py-3 font-semibold">Assigned Region</th>
                    <th className="px-4 py-3 font-semibold">Active Orders</th>
                    <th className="px-4 py-3 font-semibold">Avg Dispatch SLA</th>
                    <th className="px-4 py-3 font-semibold">Generic Match Rate</th>
                    <th className="px-4 py-3 font-semibold">Platform Take-Rate</th>
                    <th className="px-4 py-3 font-semibold">Monthly GMV</th>
                    <th className="px-6 py-3 font-semibold text-right">Node Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c4c6cf]/50 text-[#0b1c30]">
                  {PHARMACY_HUBS
                    .filter(hub => regionFilter === 'All Nodes' || hub.region === regionFilter)
                    .map((hub) => (
                      <tr key={hub.id} className="hover:bg-[#eff4ff]/40 transition-colors">
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#e5eeff] flex items-center justify-center font-bold text-[#001026] text-xs">
                              {hub.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                            </div>
                            <div>
                              <div className="font-semibold text-[#001026]">{hub.name}</div>
                              <div className="text-[11px] text-[#44474e] font-mono">TENANT-ID: {hub.code}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#e5eeff] text-[#0b1c30]">{hub.region}</span>
                        </td>
                        <td className="px-4 py-3.5 font-bold text-[#001026]">{hub.activeOrders} in-progress</td>
                        <td className="px-4 py-3.5">
                          <span className="text-[#006c49] font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#006c49]"></span> {hub.dispatchSlaMins} mins
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{hub.genericMatchRate}%</span>
                            <div className="w-16 bg-[#e5eeff] h-1.5 rounded-full overflow-hidden">
                              <div className="bg-[#006c49] h-full" style={{ width: `${hub.genericMatchRate}%` }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-[#006c49]">{hub.platformTakeRate}%</td>
                        <td className="px-4 py-3.5 font-bold text-[#0b1c30]">${hub.monthlyGmv.toLocaleString()}</td>
                        <td className="px-6 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-[#006c49]/15 text-[#006c49] rounded">ONLINE</span>
                            <button 
                              onClick={() => onNavigateScreen?.('pharmacy-portal')}
                              className="p-1 text-[#44474e] hover:text-[#001026] rounded hover:bg-[#e5eeff]" 
                              title="Open Portal"
                            >
                              <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Table Footer Pagination */}
            <div className="px-6 py-3 bg-[#eff4ff]/50 border-t border-[#c4c6cf]/60 flex items-center justify-between text-[12px] text-[#44474e]">
              <div>Showing {PHARMACY_HUBS.length} of 14 authorized regional pharmacy hubs</div>
              <div className="flex items-center gap-2">
                <button className="px-2 py-1 bg-white border border-[#c4c6cf] rounded disabled:opacity-50" disabled>Previous</button>
                <span className="font-semibold text-[#0b1c30]">Page 1 of 5</span>
                <button 
                  onClick={() => onShowToast('Displaying page 2 of authorized tenant hubs')}
                  className="px-2 py-1 bg-white border border-[#c4c6cf] rounded hover:bg-[#e5eeff]"
                >
                  Next
                </button>
              </div>
            </div>
          </section>

          {/* SECTION 4: ARCHITECTURE MICROSERVICE LAYER STATUS STRIP */}
          <section className="bg-[#0b2545] text-white rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#6cf8bb]">account_tree</span>
                <span className="text-sm lg:text-base font-display font-bold text-white">System Architecture Real-Time Service Bus (Multi-Tenant SaaS)</span>
              </div>
              <div className="text-[12px] text-[#b1c7f0] font-mono">
                Zero-Trust Mutual TLS • Kubernetes Node Cluster Active (K8s: v1.28.4)
              </div>
            </div>

            {/* Pipeline Nodes */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
              <div 
                onClick={() => onNavigateScreen?.('system-architecture')}
                className="p-3 bg-white/5 hover:bg-white/10 cursor-pointer rounded-lg border border-white/10 flex flex-col items-center transition-colors"
              >
                <span className="material-symbols-outlined text-[22px] text-[#6cf8bb] mb-1">language</span>
                <span className="text-[12px] font-bold">Edge / DNS / CDN</span>
                <span className="text-[10px] text-[#6ffbbe] mt-0.5">Cloudflare Anycast</span>
                <span className="text-[10px] text-white/60 mt-1">TTL: 300s • Hit 94%</span>
              </div>

              <div 
                onClick={() => onNavigateScreen?.('system-architecture')}
                className="p-3 bg-white/5 hover:bg-white/10 cursor-pointer rounded-lg border border-white/10 flex flex-col items-center transition-colors"
              >
                <span className="material-symbols-outlined text-[22px] text-[#6cf8bb] mb-1">security</span>
                <span className="text-[12px] font-bold">WAF &amp; IAM Layer</span>
                <span className="text-[10px] text-[#6ffbbe] mt-0.5">JWT / OAuth2 RBAC</span>
                <span className="text-[10px] text-white/60 mt-1">0 Threats Flagged</span>
              </div>

              <div 
                onClick={() => onNavigateScreen?.('system-architecture')}
                className="p-3 bg-white/5 hover:bg-white/10 cursor-pointer rounded-lg border border-white/10 flex flex-col items-center transition-colors"
              >
                <span className="material-symbols-outlined text-[22px] text-[#6cf8bb] mb-1">alt_route</span>
                <span className="text-[12px] font-bold">API Gateway</span>
                <span className="text-[10px] text-[#6ffbbe] mt-0.5">Kong Enterprise</span>
                <span className="text-[10px] text-white/60 mt-1">Rate: 500 req/s</span>
              </div>

              <div 
                onClick={() => onNavigateScreen?.('system-architecture')}
                className="p-3 bg-white/5 hover:bg-white/10 cursor-pointer rounded-lg border border-white/10 flex flex-col items-center transition-colors"
              >
                <span className="material-symbols-outlined text-[22px] text-[#6cf8bb] mb-1">inventory_2</span>
                <span className="text-[12px] font-bold">Order &amp; Rx Mesh</span>
                <span className="text-[10px] text-[#6ffbbe] mt-0.5">gRPC Mesh</span>
                <span className="text-[10px] text-white/60 mt-1">SLA: 4.2 mins</span>
              </div>

              <div 
                onClick={() => onNavigateScreen?.('system-architecture')}
                className="p-3 bg-white/5 hover:bg-white/10 cursor-pointer rounded-lg border border-white/10 flex flex-col items-center transition-colors"
              >
                <span className="material-symbols-outlined text-[22px] text-[#6cf8bb] mb-1">database</span>
                <span className="text-[12px] font-bold">Multi-Tenant DB</span>
                <span className="text-[10px] text-[#6ffbbe] mt-0.5">Row Isolation</span>
                <span className="text-[10px] text-white/60 mt-1">PostgreSQL 16</span>
              </div>

              <div 
                onClick={() => onNavigateScreen?.('system-architecture')}
                className="p-3 bg-white/5 hover:bg-white/10 cursor-pointer rounded-lg border border-white/10 flex flex-col items-center transition-colors"
              >
                <span className="material-symbols-outlined text-[22px] text-[#6cf8bb] mb-1">manage_search</span>
                <span className="text-[12px] font-bold">Search &amp; Elastic</span>
                <span className="text-[10px] text-[#6ffbbe] mt-0.5">Molecule Index</span>
                <span className="text-[10px] text-white/60 mt-1">14,820 Synced</span>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* ================= MODALS ================= */}

      {/* Prescriber Chat Modal */}
      {showPrescriberChat && (
        <div className="fixed inset-0 z-50 bg-[#001026]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-[#c4c6cf] overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 bg-[#0b2545] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#6cf8bb] text-[#002113] flex items-center justify-center font-bold text-xs">
                  ER
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm">Dr. Elena Rostova, MD</h3>
                  <p className="text-[11px] text-[#6ffbbe]">Cardiology Specialists • NPI #18839201</p>
                </div>
              </div>
              <button 
                onClick={() => setShowPrescriberChat(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1 bg-[#f8f9ff]">
              <div className="p-2.5 rounded-lg bg-[#e5eeff] text-xs text-[#001026] border border-[#c4c6cf]/50">
                🔒 HIPAA Secure Provider Encrypted Channel. Regarding Patient: <strong>Johnathan D. Doe (#ORD-88219)</strong>.
              </div>
              {chatMessages.map((msg, i) => (
                <div key={i} className={`p-3 rounded-xl text-xs max-w-[85%] ${
                  msg.sender.includes('Vance') 
                    ? 'ml-auto bg-[#006c49] text-white' 
                    : 'bg-white border border-[#c4c6cf]/70 text-[#0b1c30]'
                }`}>
                  <div className="text-[10px] font-bold opacity-80 mb-1 flex items-center justify-between gap-4">
                    <span>{msg.sender}</span>
                    <span>{msg.time}</span>
                  </div>
                  <p>{msg.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendChatMessage} className="p-3 bg-white border-t border-[#c4c6cf] flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type clinical inquiry for Dr. Rostova..."
                className="flex-1 px-3 py-2 border border-[#c4c6cf] rounded-xl text-xs focus:ring-1 focus:ring-[#006c49] focus:outline-none"
              />
              <button type="submit" className="px-4 py-2 bg-[#001026] text-white rounded-xl text-xs font-bold hover:bg-[#0b2545]">
                Send
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Discrepancy Modal */}
      {showDiscrepancyModal && (
        <div className="fixed inset-0 z-50 bg-[#001026]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-[#c4c6cf] p-5 space-y-4">
            <div className="flex items-center gap-2 text-[#ba1a1a]">
              <span className="material-symbols-outlined text-2xl">report_problem</span>
              <h3 className="font-display font-bold text-base">Flag Clinical Discrepancy</h3>
            </div>
            <p className="text-xs text-[#44474e]">
              Flagging this prescription will halt automated substitution and trigger human clinical review queue for #ORD-88219.
            </p>
            <div className="space-y-2 text-xs">
              <label className="font-semibold block text-[#0b1c30]">Reason Category:</label>
              <select className="w-full p-2 border border-[#c4c6cf] rounded-lg text-xs">
                <option>Dosage strength ambiguity</option>
                <option>Potential drug interaction</option>
                <option>Unclear prescriber handwriting</option>
                <option>Allergic contraindication note</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button 
                onClick={() => setShowDiscrepancyModal(false)}
                className="px-4 py-2 text-xs border border-[#c4c6cf] rounded-lg text-[#44474e]"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setShowDiscrepancyModal(false);
                  onShowToast('Prescription flagged for Senior Review. Placed in Exception Queue.');
                }}
                className="px-4 py-2 text-xs bg-[#ba1a1a] text-white font-bold rounded-lg"
              >
                Confirm Flag
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Bio-Equivalent Formula Modal */}
      {showFormulaModal && (
        <div className="fixed inset-0 z-50 bg-[#001026]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-[#c4c6cf] p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 text-[#006c49]">
                <span className="material-symbols-outlined text-2xl">add_circle</span>
                <h3 className="font-display font-bold text-base text-[#001026]">Register Bio-Equivalent Formula</h3>
              </div>
              <button onClick={() => setShowFormulaModal(false)} className="text-[#74777f]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2">
                <label className="font-semibold block mb-1">Active Ingredient (API):</label>
                <input type="text" defaultValue="Atorvastatin Calcium Trihydrate" className="w-full p-2 border rounded-lg" />
              </div>
              <div>
                <label className="font-semibold block mb-1">Brand Reference:</label>
                <input type="text" defaultValue="Lipitor (Pfizer)" className="w-full p-2 border rounded-lg" />
              </div>
              <div>
                <label className="font-semibold block mb-1">Dosage Form &amp; Strength:</label>
                <input type="text" defaultValue="20mg Oral Film-Coated" className="w-full p-2 border rounded-lg" />
              </div>
              <div>
                <label className="font-semibold block mb-1">FDA Orange Book Code:</label>
                <select className="w-full p-2 border rounded-lg">
                  <option>AB (Therapeutic Equivalent)</option>
                  <option>AA (No bioequivalence problems)</option>
                  <option>AN (Aerosolization equivalent)</option>
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1">AUC Bio-Equiv Match %:</label>
                <input type="number" defaultValue="99.4" step="0.1" className="w-full p-2 border rounded-lg" />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t">
              <button onClick={() => setShowFormulaModal(false)} className="px-4 py-2 border rounded-lg text-xs text-[#44474e]">Cancel</button>
              <button 
                onClick={() => {
                  setShowFormulaModal(false);
                  onShowToast('Formula registered! Live matching engine updated to v3.5.');
                }}
                className="px-4 py-2 bg-[#006c49] text-white rounded-lg text-xs font-bold"
              >
                Save &amp; Publish Formula
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inspect PDF Modal */}
      {showPdfModal && (
        <div className="fixed inset-0 z-50 bg-[#001026]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-[#c4c6cf] overflow-hidden">
            <div className="p-4 bg-[#0b2545] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#6cf8bb]">picture_as_pdf</span>
                <span className="font-display font-bold text-sm">Original Doctor Prescription Scan #RX-2024-99824</span>
              </div>
              <button onClick={() => setShowPdfModal(false)} className="text-white hover:opacity-80">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-4 max-h-[70vh] overflow-y-auto flex flex-col items-center">
              <img 
                src={ASSET_IMAGES.prescriptionPad} 
                alt="Doctor Prescription"
                className="w-full rounded-lg border border-[#c4c6cf] shadow-md object-contain"
              />
              <div className="mt-3 p-3 bg-[#eff4ff] rounded-xl text-xs text-[#001026] w-full flex items-center justify-between">
                <span>St. Jude Cardiovascular Clinic • Dr. Elena Rostova MD</span>
                <span className="text-[#006c49] font-bold">SHA-256 Validated</span>
              </div>
            </div>
            <div className="p-3 bg-[#f8f9ff] border-t border-[#c4c6cf] flex justify-end">
              <button onClick={() => setShowPdfModal(false)} className="px-4 py-1.5 bg-[#001026] text-white rounded-lg text-xs font-semibold">
                Done Inspecting
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
