import React, { useState } from 'react';
import { BATCH_DOSSIER, WHOLESALE_ORDERS } from '../../data/mockData';
import { ScreenId } from '../../types';
import { marketplaceApi } from '../../services/api';

interface ManufacturerPortalScreenProps {
  onNavigateScreen?: (screen: ScreenId) => void;
  onShowToast: (msg: string) => void;
}

export const ManufacturerPortalScreen: React.FC<ManufacturerPortalScreenProps> = ({
  onNavigateScreen,
  onShowToast
}) => {
  const [activeTherapeutic, setActiveTherapeutic] = useState('All');
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [showCoaModal, setShowCoaModal] = useState(false);
  const [showAllocateModal, setShowAllocateModal] = useState<string | null>(null);
  const [isBatchReleased, setIsBatchReleased] = useState(false);
  const [allocationQuantity, setAllocationQuantity] = useState(2500);
  const [coldChainStatus, setColdChainStatus] = useState<'in_transit' | 'quarantined'>('in_transit');

  const therapeuticFilters = [
    { name: 'All', count: 48 },
    { name: 'Cardiovascular', count: 16 },
    { name: 'Antibiotics', count: 12 },
    { name: 'Diabetes', count: 11 },
    { name: 'Analgesics', count: 9 }
  ];

  const formulas = [
    {
      id: 'f-1',
      molecule: 'Atorvastatin Calcium Trihydrate',
      brandEquivalent: 'Lipitor (Pfizer) 20mg',
      baseCost: '$2.40',
      tier1: '$12.50',
      tier2: '$11.00',
      tier3: '$9.20',
      available: '45,000 btls',
      category: 'Cardiovascular'
    },
    {
      id: 'f-2',
      molecule: 'Amoxicillin + Pot. Clavulanate',
      brandEquivalent: 'Augmentin (GSK) 625mg',
      baseCost: '$1.80',
      tier1: '$7.20',
      tier2: '$6.10',
      tier3: '$5.00',
      available: '28,000 btls',
      category: 'Antibiotics'
    },
    {
      id: 'f-3',
      molecule: 'Metformin HCl Extended-Release',
      brandEquivalent: 'Glucophage XR (BMS) 500mg',
      baseCost: '$1.10',
      tier1: '$5.00',
      tier2: '$4.20',
      tier3: '$3.50',
      available: '60,000 btls',
      category: 'Diabetes'
    },
    {
      id: 'f-4',
      molecule: 'Rosuvastatin Calcium',
      brandEquivalent: 'Crestor (AstraZeneca) 10mg',
      baseCost: '$2.80',
      tier1: '$14.00',
      tier2: '$12.50',
      tier3: '$10.80',
      available: '32,000 btls',
      category: 'Cardiovascular'
    }
  ];

  const handleReleaseBatch = () => {
    setIsBatchReleased(true);
    setShowReleaseModal(false);
    onShowToast(`Batch ${BATCH_DOSSIER.batchNumber} Released to Platform! 45,000 units published to partner pharmacies.`);
  };

  return (
    <div className="bg-[#f8f9ff] text-[#0b1c30] min-h-screen flex flex-col font-body text-sm selection:bg-[#6cf8bb] selection:text-[#002113]">
      {/* Top Header */}
      <header className="bg-[#001026] text-white px-4 lg:px-6 py-3 border-b border-[#0b2545] sticky top-0 z-30 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0b2545] text-[#6cf8bb] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[22px]">precision_manufacturing</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-base text-white">Apex BioPharma Labs</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#006c49]/30 text-[#6cf8bb] border border-[#006c49]/60">
                  Plant 4 • cGMP • Active
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-300">
                <span className="text-[#6ffbbe]">Cold-Chain: 99.4% Capacity</span>
                <span>• Live Batches: 38</span>
                <span>• ERP Synced: 3 mins ago</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => onShowToast('Validating manufacturer wholesale pricing schedules against Orange Book...')}
              className="px-3 py-1.5 rounded-xl border border-white/20 hover:bg-white/10 text-slate-200 text-xs font-semibold transition-colors"
            >
              Validate Pricing Schedule
            </button>
            <button 
              onClick={() => onShowToast('Exporting B2B bulk purchase manifest for FDA reporting...')}
              className="px-3 py-1.5 rounded-xl border border-white/20 hover:bg-white/10 text-slate-200 text-xs font-semibold transition-colors"
            >
              Export Bulk Manifest
            </button>
            <button 
              onClick={() => setShowReleaseModal(true)}
              className="px-4 py-1.5 rounded-xl bg-[#006c49] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-[#006c49]/90 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">verified</span>
              Release New Batch
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 p-4 lg:p-6 space-y-6 max-w-[1920px] mx-auto w-full custom-scrollbar">
        {/* SECTION 1: 4 EXECUTIVE KPI METRICS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded-xl border border-[#c4c6cf]/70 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#44474e] uppercase tracking-wider">Monthly Wholesale Supply GMV</span>
              <span className="material-symbols-outlined text-[#006c49] text-[20px]">account_balance</span>
            </div>
            <div className="text-2xl font-display font-extrabold text-[#001026] mt-2 flex items-baseline gap-2">
              $3,842,500 <span className="text-xs text-[#006c49] font-bold">+14.2%</span>
            </div>
            <p className="text-xs text-[#44474e] mt-1">Supplied across 18 regional distribution hubs</p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-[#c4c6cf]/70 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#44474e] uppercase tracking-wider">Active Production Batches</span>
              <span className="material-symbols-outlined text-[#001026] text-[20px]">biotech</span>
            </div>
            <div className="text-2xl font-display font-extrabold text-[#001026] mt-2">
              42 Batches
            </div>
            <p className="text-xs text-[#44474e] mt-1">34 released • 6 QA in-progress • 2 quarantine</p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-[#c4c6cf]/70 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#44474e] uppercase tracking-wider">Platform Wholesale Discount</span>
              <span className="material-symbols-outlined text-[#006c49] text-[20px]">savings</span>
            </div>
            <div className="text-2xl font-display font-extrabold text-[#006c49] mt-2">
              84.2%
            </div>
            <p className="text-xs text-[#44474e] mt-1">Average generic price cut below originator brand</p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-[#c4c6cf]/70 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#44474e] uppercase tracking-wider">Pending Regional PO Orders</span>
              <span className="material-symbols-outlined text-[#001026] text-[20px]">local_shipping</span>
            </div>
            <div className="text-2xl font-display font-extrabold text-[#001026] mt-2">
              18 POs
            </div>
            <p className="text-xs text-[#44474e] mt-1">$412.8k awaiting cold-chain dispatch</p>
          </div>
        </div>

        <div className={`rounded-xl border p-3 flex flex-wrap items-center justify-between gap-3 ${coldChainStatus === 'quarantined' ? 'bg-[#ba1a1a]/10 border-[#ba1a1a]/40' : 'bg-[#006c49]/5 border-[#006c49]/25'}`}>
          <div className="flex items-center gap-2">
            <span className={`material-symbols-outlined ${coldChainStatus === 'quarantined' ? 'text-[#ba1a1a]' : 'text-[#006c49]'}`}>{coldChainStatus === 'quarantined' ? 'warning' : 'device_thermostat'}</span>
            <div><strong className="text-xs">Pallet SHIP-DEMO-9021 · sensor TEMP-DEMO-01</strong><p className="text-[11px] text-[#44474e]">Allowed transit range: 2°C–8°C. Excursions automatically quarantine the batch.</p></div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => void marketplaceApi.ingestTelemetry(5.2).then(result => { setColdChainStatus(result.status === 'quarantined' ? 'quarantined' : 'in_transit'); onShowToast('Cold-chain reading accepted: 5.2°C within range.'); })} className="px-3 py-1.5 rounded-lg bg-white border text-xs font-bold">Simulate 5.2°C</button>
            <button onClick={() => void marketplaceApi.ingestTelemetry(9.1).then(result => { setColdChainStatus(result.status === 'quarantined' ? 'quarantined' : 'in_transit'); onShowToast(result.alert ?? 'Telemetry recorded.'); })} className="px-3 py-1.5 rounded-lg bg-[#ba1a1a] text-white text-xs font-bold">Test excursion</button>
          </div>
        </div>

        {/* SECTION 2: BIO-EQUIVALENT FORMULATIONS & DYNAMIC PRICING MATRIX */}
        <div className="bg-white rounded-2xl border border-[#c4c6cf]/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-[#c4c6cf]/70 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display font-bold text-base text-[#001026]">Bio-Equivalent Generic Formulations &amp; Dynamic Pricing Matrix</h2>
              <p className="text-xs text-[#44474e]">Tiered wholesale volume discounts and regional inventory allocation</p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {therapeuticFilters.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setActiveTherapeutic(cat.name)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    activeTherapeutic === cat.name
                      ? 'bg-[#001026] text-white'
                      : 'bg-[#eff4ff] text-[#44474e] hover:bg-[#e5eeff]'
                  }`}
                >
                  {cat.name} ({cat.count})
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#eff4ff] text-[#44474e] border-b border-[#c4c6cf]/60">
                <tr>
                  <th className="px-6 py-3 font-semibold">Active Generic Molecule &amp; Reference Brand</th>
                  <th className="px-4 py-3 font-semibold">Base Lab Cost</th>
                  <th className="px-4 py-3 font-semibold">Tier 1 (1k - 5k)</th>
                  <th className="px-4 py-3 font-semibold">Tier 2 (5k - 20k)</th>
                  <th className="px-4 py-3 font-semibold">Tier 3 (20k+)</th>
                  <th className="px-4 py-3 font-semibold">Available Batch Inventory</th>
                  <th className="px-6 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c4c6cf]/40 text-[#0b1c30]">
                {formulas
                  .filter(f => activeTherapeutic === 'All' || f.category === activeTherapeutic)
                  .map((formula) => (
                    <tr key={formula.id} className="hover:bg-[#eff4ff]/30 transition-colors">
                      <td className="px-6 py-3.5">
                        <div className="font-bold text-[#001026]">{formula.molecule}</div>
                        <div className="text-[11px] text-[#44474e]">Ref: {formula.brandEquivalent}</div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[#74777f]">{formula.baseCost}</td>
                      <td className="px-4 py-3.5 font-mono">{formula.tier1}</td>
                      <td className="px-4 py-3.5 font-mono font-bold text-[#006c49]">
                        {formula.tier2} <span className="text-[9px] bg-[#006c49]/15 px-1 rounded text-[#006c49]">MetroCare Rate</span>
                      </td>
                      <td className="px-4 py-3.5 font-mono">{formula.tier3}</td>
                      <td className="px-4 py-3.5">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#e5eeff] text-[#001026]">
                          {formula.available}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <button
                          onClick={() => setShowAllocateModal(formula.molecule)}
                          className="px-3 py-1.5 rounded-lg bg-[#001026] text-white text-xs font-bold hover:bg-[#0b2545] transition-colors"
                        >
                          Allocate Stock
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 3: LIVE QUALITY DOSSIER & ANALYTICAL TESTING */}
        <div className="bg-white rounded-2xl border border-[#c4c6cf]/80 shadow-xs p-5 lg:p-6 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#c4c6cf]/60 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-base text-[#001026]">
                  Analytical Testing &amp; Quality Release Dossier
                </h2>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#006c49]/15 text-[#006c49]">
                  {BATCH_DOSSIER.status}
                </span>
              </div>
              <p className="text-xs text-[#44474e] mt-0.5">
                Batch Lot <strong className="font-mono text-[#001026]">{BATCH_DOSSIER.batchNumber}</strong> • {BATCH_DOSSIER.molecule} ({BATCH_DOSSIER.yieldUnits.toLocaleString()} units) • {BATCH_DOSSIER.reactor}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCoaModal(true)}
                className="px-3.5 py-1.5 rounded-xl border border-[#c4c6cf] hover:bg-[#eff4ff] text-[#001026] text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">description</span>
                Download COA
              </button>
              <button
                onClick={() => setShowReleaseModal(true)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors ${
                  isBatchReleased
                    ? 'bg-[#006c49] text-white'
                    : 'bg-[#001026] hover:bg-[#0b2545] text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isBatchReleased ? 'check_circle' : 'publish'}
                </span>
                {isBatchReleased ? 'Released to Platform' : 'Release Batch to Platform'}
              </button>
            </div>
          </div>

          {/* 4 Analytical Parameters Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3.5 bg-[#eff4ff]/60 rounded-xl border border-[#c4c6cf]/60 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-[#44474e]">
                <span>HPLC Purity Assay</span>
                <span className="text-[#006c49] font-bold">PASSED</span>
              </div>
              <div className="text-xl font-display font-extrabold text-[#001026]">{BATCH_DOSSIER.hplcAssay}%</div>
              <div className="text-[10px] text-[#74777f]">Specification: &gt; 98.0%</div>
            </div>

            <div className="p-3.5 bg-[#eff4ff]/60 rounded-xl border border-[#c4c6cf]/60 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-[#44474e]">
                <span>Dissolution Rate (30m)</span>
                <span className="text-[#006c49] font-bold">PASSED</span>
              </div>
              <div className="text-xl font-display font-extrabold text-[#001026]">{BATCH_DOSSIER.dissolution}%</div>
              <div className="text-[10px] text-[#74777f]">Specification: &gt; 85.0%</div>
            </div>

            <div className="p-3.5 bg-[#eff4ff]/60 rounded-xl border border-[#c4c6cf]/60 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-[#44474e]">
                <span>Bio-Equiv AUC Match</span>
                <span className="text-[#006c49] font-bold">FDA TIER-A</span>
              </div>
              <div className="text-xl font-display font-extrabold text-[#006c49]">{BATCH_DOSSIER.bioEquivAuc}%</div>
              <div className="text-[10px] text-[#74777f]">Orange Book AB standard</div>
            </div>

            <div className="p-3.5 bg-[#eff4ff]/60 rounded-xl border border-[#c4c6cf]/60 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-[#44474e]">
                <span>Residual Solvents</span>
                <span className="text-[#006c49] font-bold">CLEAN</span>
              </div>
              <div className="text-xl font-display font-extrabold text-[#001026]">{BATCH_DOSSIER.residualSolvents}</div>
              <div className="text-[10px] text-[#74777f]">USP &lt;467&gt; compliant</div>
            </div>
          </div>

          <div className="p-3 bg-[#e5eeff] rounded-xl text-xs flex flex-wrap items-center justify-between gap-2 text-[#001026]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#006c49]">verified_user</span>
              <span>Audited by <strong>{BATCH_DOSSIER.auditor}</strong> (Token: {BATCH_DOSSIER.token})</span>
            </div>
            <span className="text-[11px] text-[#44474e]">Stored at 20°C - 25°C in Nitrogen Inert Vault</span>
          </div>
        </div>

        {/* SECTION 4: REGIONAL PHARMACY WHOLESALE PURCHASE ORDERS */}
        <div className="bg-white rounded-2xl border border-[#c4c6cf]/80 shadow-xs p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-base text-[#001026]">
                Regional Pharmacy Wholesale Purchase Orders &amp; Allocation Bus
              </h2>
              <p className="text-xs text-[#44474e]">B2B dispatch pipelines supplying licensed dispensary tenants</p>
            </div>
            <span className="text-xs font-bold text-[#006c49]">3 Pending Shipments</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#eff4ff] text-[#44474e] border-b border-[#c4c6cf]/60">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">PO #</th>
                  <th className="px-4 py-2.5 font-semibold">Destination Pharmacy Hub</th>
                  <th className="px-4 py-2.5 font-semibold">Allocated Molecule</th>
                  <th className="px-4 py-2.5 font-semibold">Units</th>
                  <th className="px-4 py-2.5 font-semibold">Pricing Tier</th>
                  <th className="px-4 py-2.5 font-semibold">Contract Value</th>
                  <th className="px-4 py-2.5 font-semibold">Status</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Dock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c4c6cf]/40 text-[#0b1c30]">
                {WHOLESALE_ORDERS.map((po) => (
                  <tr key={po.poNumber} className="hover:bg-[#eff4ff]/30">
                    <td className="px-4 py-3 font-mono font-bold text-[#001026]">{po.poNumber}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-[#001026]">{po.hubName}</div>
                      <div className="text-[10px] text-[#44474e]">{po.storeCode}</div>
                    </td>
                    <td className="px-4 py-3">{po.molecule}</td>
                    <td className="px-4 py-3 font-bold">{po.quantityUnits.toLocaleString()}</td>
                    <td className="px-4 py-3 text-[#006c49] font-medium">{po.tierRate}</td>
                    <td className="px-4 py-3 font-display font-bold text-[#001026]">${po.contractValue.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#006c49]/15 text-[#006c49]">
                        {po.fulfillmentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-[11px] text-[#44474e]">{po.dock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Release Batch Modal */}
      {showReleaseModal && (
        <div className="fixed inset-0 z-50 bg-[#001026]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-[#c4c6cf] p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-display font-bold text-base text-[#001026]">Release Batch Lot #CP-9021</h3>
              <button onClick={() => setShowReleaseModal(false)} className="text-[#74777f]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p className="text-xs text-[#44474e]">
              Releasing this lot makes <strong>45,000 bottles of Atorvastatin 20mg</strong> available for automated dispatch allocation to licensed pharmacy tenants (including MetroCare Rx #HUB-104).
            </p>
            <div className="p-3 bg-[#eff4ff] rounded-xl text-xs space-y-1">
              <div>✓ HPLC Assay Verified (99.82%)</div>
              <div>✓ Bio-Equivalence AUC 99.4% (FDA Tier-A Approved)</div>
              <div>✓ Cold-Chain Storage Confirmed (20°C - 25°C)</div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowReleaseModal(false)} className="px-4 py-2 border rounded-xl text-xs text-[#44474e]">Cancel</button>
              <button 
                onClick={handleReleaseBatch}
                className="px-4 py-2 bg-[#006c49] text-white font-bold rounded-xl text-xs"
              >
                Sign &amp; Release Batch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COA Modal */}
      {showCoaModal && (
        <div className="fixed inset-0 z-50 bg-[#001026]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-[#c4c6cf] p-5 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <h3 className="font-display font-bold text-sm text-[#001026]">CERTIFICATE OF ANALYSIS (COA)</h3>
                <span className="text-[10px] text-[#74777f]">FDA 21 CFR § 211.165 COMPLIANT</span>
              </div>
              <button onClick={() => setShowCoaModal(false)} className="text-[#74777f]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-2 bg-[#f8f9ff] p-3 rounded-xl border">
              <div>PRODUCT: Atorvastatin Calcium Trihydrate 20mg USP</div>
              <div>BATCH NUMBER: #CP-9021</div>
              <div>MANUFACTURE DATE: 10/2024 • EXPIRY DATE: 11/2026</div>
              <div>EQUIVALENCE: Lipitor 20mg (Pfizer)</div>
              <div>ASSAY RESULT: 99.82% (Standard: 98.0% - 102.0%)</div>
              <div>DISSOLUTION: 96.4% in 30 mins</div>
              <div>MICROBIAL LIMITS: Complies with USP &lt;61&gt;</div>
            </div>

            <div className="text-right text-[10px] text-[#44474e]">
              Electronically Certified by Dr. Alistair Vance, Lead QA Auditor
            </div>

            <div className="flex justify-end gap-2 pt-1 border-t">
              <button 
                onClick={() => setShowCoaModal(false)}
                className="px-4 py-2 bg-[#001026] text-white rounded-xl text-xs font-bold"
              >
                Close Certificate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Allocation Modal */}
      {showAllocateModal && (
        <div className="fixed inset-0 z-50 bg-[#001026]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-[#c4c6cf] p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-display font-bold text-sm text-[#001026]">Allocate Stock: {showAllocateModal}</h3>
              <button onClick={() => setShowAllocateModal(null)} className="text-[#74777f]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Target Pharmacy Hub:</label>
                <select className="w-full p-2 border rounded-xl">
                  <option>MetroCare Rx Downtown (#HUB-104)</option>
                  <option>HealthPlus Express Hub West (#HUB-108)</option>
                  <option>Apollo Generic Dispatch Depot (#HUB-214)</option>
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1">Quantity (Units/Bottles):</label>
                <input type="number" min={1000} value={allocationQuantity} onChange={(event) => setAllocationQuantity(Number(event.target.value))} className="w-full p-2 border rounded-xl" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button onClick={() => setShowAllocateModal(null)} className="px-4 py-2 border rounded-xl text-xs text-[#44474e]">Cancel</button>
              <button 
                onClick={() => void marketplaceApi.createPurchaseOrder(allocationQuantity, 'MetroCare Rx Downtown (#HUB-104)').then(order => {
                  setShowAllocateModal(null);
                  onShowToast(`Stock allocated: ${order.poNumber} (${order.tier.replace('_', ' ')}). ${order.availableUnitsAfterAllocation.toLocaleString()} units remain.`);
                })}
                className="px-4 py-2 bg-[#006c49] text-white font-bold rounded-xl text-xs"
              >
                Confirm Allocation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
