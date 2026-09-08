import React, { useState } from 'react';
import { ScreenId } from '../../types';

interface SystemArchitectureScreenProps {
  onNavigateScreen: (screen: ScreenId) => void;
  onShowToast: (msg: string) => void;
}

export const SystemArchitectureScreen: React.FC<SystemArchitectureScreenProps> = ({
  onNavigateScreen,
  onShowToast
}) => {
  const [selectedNode, setSelectedNode] = useState<{
    title: string;
    layer: string;
    description: string;
    tech: string;
    latency: string;
    status: string;
  } | null>({
    title: 'Medicine & Catalog Service',
    layer: 'Application Microservices',
    description: 'Calculates real-time bio-equivalent salt substitutions between originator brands (e.g. Lipitor) and generic alternatives (Atorvastatin 20mg).',
    tech: 'Go / gRPC • FDA Orange Book Algorithmic Index',
    latency: '8ms',
    status: 'HEALTHY (99.99%)'
  });

  const [activeWorkflow, setActiveWorkflow] = useState<number>(1);

  const workflows = [
    {
      id: 1,
      title: 'Workflow 1: Brand Search & Instant Generic Substitution',
      steps: [
        'Customer enters branded medicine name (e.g. "Lipitor 20mg")',
        'API Gateway routes query to Elasticsearch Cluster with salt-matching tokenizer',
        'Catalog Microservice queries FDA Orange Book bio-equivalence database',
        'Returns 85.6% cheaper Atorvastatin Calcium 20mg with verified pharmacy stock'
      ],
      targetScreen: 'customer-app' as ScreenId
    },
    {
      id: 2,
      title: 'Workflow 2: Doctor Prescription OCR & Verification Pipeline',
      steps: [
        'Patient uploads paper prescription snapshot via mobile viewfinder',
        'Prescription Service calls Cloud Vision OCR to extract drug name & sig dosage',
        'Enterprise Gateway alerts Pharmacist review queue with 99.1% confidence score',
        'Lead Pharmacist Dr. R. Vance validates substitution and signs digital audit'
      ],
      targetScreen: 'rx-scanner' as ScreenId
    },
    {
      id: 3,
      title: 'Workflow 3: Pharmacy Fulfillment & Express 35-Min Handover',
      steps: [
        'Nearest licensed pharmacy (MetroCare Rx Store #4082) receives packing order',
        'Dispenser scans NDC barcode on generic bottle to confirm 100% lot match',
        'Tamper-evident security tape GM-SEAL-88219-BK armed on delivery parcel',
        'Courier Miguel S. is dispatched and verifies 4-digit PIN (8410) at customer doorstep'
      ],
      targetScreen: 'order-tracking' as ScreenId
    }
  ];

  return (
    <div className="bg-[#001026] text-white min-h-screen flex flex-col font-body text-sm selection:bg-[#6cf8bb] selection:text-[#002113]">
      {/* Top Banner */}
      <header className="bg-[#000d1d] border-b border-[#0b2545] px-4 lg:px-6 py-3 sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#0b2545] text-[#6cf8bb] flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-[22px]">account_tree</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-bold text-base text-white">System Architecture &amp; Service Bus</h1>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-[#006c49]/40 text-[#6cf8bb] border border-[#006c49]">
                Live Mesh Visualizer
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Interactive structural map matching production microservices and user data flows.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onShowToast('All 16 microservices reporting nominal response times (Avg: 14ms)')}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-slate-200 transition-colors flex items-center gap-1.5"
          >
            <span className="w-2 h-2 rounded-full bg-[#6cf8bb] animate-pulse"></span>
            Health Check: 100% OK
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 lg:p-6 space-y-6 max-w-[1920px] mx-auto w-full overflow-y-auto custom-scrollbar">
        {/* Architecture Grid (Layers) */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {/* Layer 1: Client Interfaces */}
          <div className="bg-[#001738]/70 rounded-2xl border border-[#0b2545] p-4 space-y-3 shadow-lg">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-bold text-[#6cf8bb] uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">devices</span> 1. Client Layer
              </span>
              <span className="text-[10px] text-slate-400 font-mono">React 19 / Vite</span>
            </div>

            <div className="space-y-2">
              <div 
                onClick={() => {
                  setSelectedNode({
                    title: 'Customer Mobile Web App',
                    layer: 'Client Layer',
                    description: 'Search & compare medicines, AI salt-matching engine, real-time express courier tracking, and prescription upload.',
                    tech: 'React 19 • Tailwind CSS • Motion',
                    latency: 'Client-side SPA',
                    status: 'ACTIVE'
                  });
                  onNavigateScreen('customer-app');
                }}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white group-hover:text-[#6cf8bb]">Customer App</span>
                  <span className="material-symbols-outlined text-[16px] text-slate-400">arrow_forward</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Search &amp; Compare • OCR Upload • Tracking</p>
              </div>

              <div 
                onClick={() => {
                  setSelectedNode({
                    title: 'Pharmacy Dispensing Portal',
                    layer: 'Client Layer',
                    description: 'Order fulfillment, barcode validation, lot # check, and courier handover bay management.',
                    tech: 'React 19 • Thermal Print Drivers',
                    latency: 'Store Local Cache',
                    status: 'ACTIVE'
                  });
                  onNavigateScreen('pharmacy-portal');
                }}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white group-hover:text-[#6cf8bb]">Pharmacy Portal</span>
                  <span className="material-symbols-outlined text-[16px] text-slate-400">arrow_forward</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Order Packing • Barcode Scanner • Handover</p>
              </div>

              <div 
                onClick={() => {
                  setSelectedNode({
                    title: 'Enterprise Multi-Tenant Gateway',
                    layer: 'Client Layer',
                    description: 'Super Admin operations, clinical bio-equivalence signoff, FDA audit reports, and tenant settlement.',
                    tech: 'Enterprise React Console • SOC-2 TIER III',
                    latency: 'Direct Secure VPN',
                    status: 'ACTIVE'
                  });
                  onNavigateScreen('enterprise-ops');
                }}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white group-hover:text-[#6cf8bb]">Enterprise Gateway</span>
                  <span className="material-symbols-outlined text-[16px] text-slate-400">arrow_forward</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Rx Verification • Multi-Tenant Matrix • Audit</p>
              </div>
            </div>
          </div>

          {/* Layer 2: Edge & Gateway */}
          <div className="bg-[#001738]/70 rounded-2xl border border-[#0b2545] p-4 space-y-3 shadow-lg">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-bold text-[#6cf8bb] uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">alt_route</span> 2. Edge &amp; API Layer
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Zero-Trust</span>
            </div>

            <div className="space-y-2">
              <div 
                onClick={() => setSelectedNode({
                  title: 'Cloudflare Anycast CDN & WAF',
                  layer: 'Edge Layer',
                  description: 'DDoS mitigation, TLS 1.3 termination, geo-routing to closest regional Kubernetes cluster.',
                  tech: 'Cloudflare Enterprise Edge',
                  latency: '< 5ms',
                  status: 'HEALTHY'
                })}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 cursor-pointer transition-all"
              >
                <div className="font-bold text-xs text-white">Edge CDN &amp; WAF</div>
                <p className="text-[11px] text-slate-400 mt-1">DDoS Mitigation • Asset Caching • SSL</p>
              </div>

              <div 
                onClick={() => setSelectedNode({
                  title: 'Kong Enterprise API Gateway',
                  layer: 'Edge Layer',
                  description: 'JWT OAuth2 authentication, rate limiting (500 req/s), API token metering, and request routing to gRPC backend mesh.',
                  tech: 'Kong Enterprise • OpenID Connect',
                  latency: '2ms overhead',
                  status: 'HEALTHY'
                })}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 cursor-pointer transition-all"
              >
                <div className="font-bold text-xs text-white">Kong API Gateway</div>
                <p className="text-[11px] text-slate-400 mt-1">OAuth2 JWT • Rate Limits • gRPC Proxy</p>
              </div>

              <div 
                onClick={() => setSelectedNode({
                  title: 'Identity & Access Management (RBAC)',
                  layer: 'Edge Layer',
                  description: 'Enforces role-based permissions across Super Admin, Dispensing Pharmacist, Courier, and Patient scopes.',
                  tech: 'Keycloak / Auth0 Enterprise',
                  latency: '4ms',
                  status: 'HEALTHY'
                })}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 cursor-pointer transition-all"
              >
                <div className="font-bold text-xs text-white">IAM &amp; Multi-Tenant RBAC</div>
                <p className="text-[11px] text-slate-400 mt-1">Role Separation • HIPAA CFR § 21</p>
              </div>
            </div>
          </div>

          {/* Layer 3: Application Microservices */}
          <div className="bg-[#001738]/70 rounded-2xl border border-[#0b2545] p-4 space-y-3 shadow-lg">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-bold text-[#6cf8bb] uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">hub</span> 3. Microservices
              </span>
              <span className="text-[10px] text-slate-400 font-mono">gRPC Mesh</span>
            </div>

            <div className="space-y-2">
              <div 
                onClick={() => setSelectedNode({
                  title: 'Medicine & Catalog Service',
                  layer: 'Application Microservices',
                  description: 'Maintains bio-equivalence matrix, Orange Book codes, therapeutic alternatives, and real-time pharmacy inventory levels.',
                  tech: 'Go • gRPC • Redis Cache',
                  latency: '8ms',
                  status: 'HEALTHY (99.99%)'
                })}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-[#6cf8bb]/40 bg-[#006c49]/10 cursor-pointer transition-all"
              >
                <div className="font-bold text-xs text-[#6cf8bb]">Medicine &amp; Catalog Service</div>
                <p className="text-[11px] text-slate-300 mt-1">Generic Matching • Orange Book • Inventory</p>
              </div>

              <div 
                onClick={() => setSelectedNode({
                  title: 'Prescription OCR Service',
                  layer: 'Application Microservices',
                  description: 'Ingests camera captures and PDFs, extracts medication entity and dosage strings with confidence scoring.',
                  tech: 'Python FastAPI • Google Cloud Vision OCR',
                  latency: '240ms OCR execution',
                  status: 'HEALTHY'
                })}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 cursor-pointer transition-all"
              >
                <div className="font-bold text-xs text-white">Prescription OCR Service</div>
                <p className="text-[11px] text-slate-400 mt-1">OCR Parser • Confidence Score • Sig Extract</p>
              </div>

              <div 
                onClick={() => setSelectedNode({
                  title: 'Order & Dispatch Service',
                  layer: 'Application Microservices',
                  description: 'Orchestrates 35-minute express local fulfillment, courier GPS routing, tamper seal generation, and doorstep OTP verification.',
                  tech: 'Node.js / TypeScript • Kafka Event Stream',
                  latency: '12ms',
                  status: 'HEALTHY'
                })}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 cursor-pointer transition-all"
              >
                <div className="font-bold text-xs text-white">Order &amp; Dispatch Service</div>
                <p className="text-[11px] text-slate-400 mt-1">Lifecycle • Rider Geofence • Handover PIN</p>
              </div>
            </div>
          </div>

          {/* Layer 4: Multi-Tenant Data Layer */}
          <div className="bg-[#001738]/70 rounded-2xl border border-[#0b2545] p-4 space-y-3 shadow-lg">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-bold text-[#6cf8bb] uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">database</span> 4. Data Layer
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Row-Isolated</span>
            </div>

            <div className="space-y-2">
              <div 
                onClick={() => setSelectedNode({
                  title: 'PostgreSQL 16 Multi-Tenant Cluster',
                  layer: 'Data Layer',
                  description: 'Primary relational database with row-level security (RLS) ensuring strict isolation across licensed dispensary tenants.',
                  tech: 'PostgreSQL 16 • PgBouncer • Read Replicas',
                  latency: '3ms',
                  status: 'HEALTHY'
                })}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 cursor-pointer transition-all"
              >
                <div className="font-bold text-xs text-white">PostgreSQL Multi-Tenant</div>
                <p className="text-[11px] text-slate-400 mt-1">Tenant Row Isolation • Transactions • RLS</p>
              </div>

              <div 
                onClick={() => setSelectedNode({
                  title: 'Elasticsearch Search Cluster',
                  layer: 'Data Layer',
                  description: '14,820 generic molecules indexed with phonetic fuzzy search and chemical salt synonym dictionaries.',
                  tech: 'Elasticsearch 8.11',
                  latency: '11ms',
                  status: 'HEALTHY'
                })}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 cursor-pointer transition-all"
              >
                <div className="font-bold text-xs text-white">Elasticsearch Index</div>
                <p className="text-[11px] text-slate-400 mt-1">Salt Tokenizer • Fuzzy Brand Search</p>
              </div>

              <div 
                onClick={() => setSelectedNode({
                  title: 'Redis In-Memory Cache & Session Bus',
                  layer: 'Data Layer',
                  description: 'Hot catalog cache, live rider GPS positions, and rate-limiting token buckets.',
                  tech: 'Redis 7.2 Cluster',
                  latency: '0.8ms',
                  status: 'HEALTHY (94.2% hit)'
                })}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 cursor-pointer transition-all"
              >
                <div className="font-bold text-xs text-white">Redis Cache &amp; GPS PubSub</div>
                <p className="text-[11px] text-slate-400 mt-1">Live Courier Telemetry • 94.2% Hit Rate</p>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Node Inspector Panel */}
        {selectedNode && (
          <div className="bg-[#000d1d] border border-[#006c49]/50 rounded-2xl p-5 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#006c49] text-white">
                  {selectedNode.layer}
                </span>
                <span className="text-xs font-mono text-[#6cf8bb]">{selectedNode.status}</span>
                <span className="text-xs text-slate-400">• Latency: <strong className="text-white font-mono">{selectedNode.latency}</strong></span>
              </div>
              <h3 className="text-lg font-display font-bold text-white">{selectedNode.title}</h3>
              <p className="text-xs text-slate-300 max-w-3xl">{selectedNode.description}</p>
              <div className="text-[11px] font-mono text-slate-400 pt-1">
                Technology Stack: <span className="text-[#6ffbbe]">{selectedNode.tech}</span>
              </div>
            </div>

            <button
              onClick={() => onShowToast(`Diagnostic telemetry pulled for ${selectedNode.title}: Zero errors logged in past 24 hours.`)}
              className="px-4 py-2 bg-[#006c49] hover:bg-[#006c49]/90 text-white rounded-xl text-xs font-bold transition-colors whitespace-nowrap"
            >
              Run Node Diagnostics
            </button>
          </div>
        )}

        {/* Section: Key End-to-End User Workflows (from image.png) */}
        <div className="bg-[#001738]/60 border border-[#0b2545] rounded-2xl p-5 lg:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div>
              <h2 className="text-base font-display font-bold text-white">
                Key User Workflows &amp; Multi-Service Sequence Execution
              </h2>
              <p className="text-xs text-slate-400">
                Click any workflow to trace the automated request propagation across client, edge, microservices, and databases.
              </p>
            </div>

            {/* Workflow Selectors */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {workflows.map((wf) => (
                <button
                  key={wf.id}
                  onClick={() => setActiveWorkflow(wf.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    activeWorkflow === wf.id
                      ? 'bg-[#006c49] text-white'
                      : 'bg-white/10 text-slate-300 hover:text-white'
                  }`}
                >
                  Workflow {wf.id}
                </button>
              ))}
            </div>
          </div>

          {/* Active Workflow Steps Display */}
          {(() => {
            const currentWf = workflows.find(w => w.id === activeWorkflow) || workflows[0];
            return (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-sm text-[#6cf8bb]">{currentWf.title}</h3>
                  <button
                    onClick={() => onNavigateScreen(currentWf.targetScreen)}
                    className="text-xs font-semibold text-white underline hover:text-[#6cf8bb] flex items-center gap-1"
                  >
                    Launch Interactive Screen <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {currentWf.steps.map((step, idx) => (
                    <div key={idx} className="p-3.5 bg-white/5 rounded-xl border border-white/10 space-y-1.5 relative">
                      <div className="w-6 h-6 rounded-full bg-[#006c49] text-white flex items-center justify-center font-bold text-xs">
                        {idx + 1}
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      </main>
    </div>
  );
};
