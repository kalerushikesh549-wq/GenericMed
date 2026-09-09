import React, { useState } from 'react';
import { ScreenId, UserRole, UserProfile } from '../../types';
import { DEMO_USERS } from '../../data/mockData';
import { 
  User, 
  Lock, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Building2, 
  Store, 
  Factory, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  FileText,
  MapPin,
  HelpCircle,
  KeyRound,
  LogOut,
  ChevronRight,
  Stethoscope
} from 'lucide-react';

interface AuthScreenProps {
  currentUser: UserProfile | null;
  onLogin: (user: UserProfile) => void;
  onRegister: (newUser: UserProfile) => void;
  onLogout: () => void;
  onNavigateScreen: (screen: ScreenId) => void;
  onShowToast: (msg: string) => void;
  isMobileFrame?: boolean;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  currentUser,
  onLogin,
  onRegister,
  onLogout,
  onNavigateScreen,
  onShowToast,
  isMobileFrame = false
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole>('patient');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  // Form states for Login
  const [loginIdentifier, setLoginIdentifier] = useState('johnathan.doe@gmail.com');
  const [loginPassword, setLoginPassword] = useState('••••••••••');
  const [rememberMe, setRememberMe] = useState(true);

  // Form states for Register
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regLicense, setRegLicense] = useState('');
  const [regFacility, setRegFacility] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [enable2FA, setEnable2FA] = useState(true);

  // Role info definition
  const rolesList: {
    id: UserRole;
    title: string;
    description: string;
    icon: React.ReactNode;
    badge: string;
    defaultTargetScreen: ScreenId;
  }[] = [
    {
      id: 'patient',
      title: 'Patient / Consumer',
      description: 'Search bio-equivalents, compare drug prices, and track 35-min delivery.',
      icon: <User className="w-4 h-4 text-[#006c49]" />,
      badge: 'Save 85%',
      defaultTargetScreen: 'customer-app'
    },
    {
      id: 'pharmacist',
      title: 'Licensed Pharmacist',
      description: 'Dispensary workbench, batch scan validation, and courier handover bay.',
      icon: <Store className="w-4 h-4 text-[#0b2545]" />,
      badge: 'RPh / PharmD',
      defaultTargetScreen: 'pharmacy-portal'
    },
    {
      id: 'manufacturer',
      title: 'Pharma Manufacturer',
      description: 'B2B supply allocation, Orange Book compliance, and QA release dossiers.',
      icon: <Factory className="w-4 h-4 text-[#6b4700]" />,
      badge: 'cGMP / FDA',
      defaultTargetScreen: 'manufacturer-portal'
    },
    {
      id: 'enterprise_admin',
      title: 'Enterprise Admin',
      description: 'Super-admin multi-tenant matrix, clinical review, and compliance audit.',
      icon: <Building2 className="w-4 h-4 text-[#ba1a1a]" />,
      badge: 'SOC-2 TIER III',
      defaultTargetScreen: 'enterprise-ops'
    }
  ];

  // Quick fill handler for demo users
  const handleQuickFill = (user: UserProfile) => {
    setSelectedRole(user.role);
    setLoginIdentifier(user.email);
    setLoginPassword('password123');
    onShowToast(`Credentials loaded for ${user.name} (${user.role.replace('_', ' ').toUpperCase()})`);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim()) {
      onShowToast('Please enter your email or phone number');
      return;
    }

    // Match existing demo user or create session user
    const matched = DEMO_USERS.find(u => 
      u.email.toLowerCase() === loginIdentifier.toLowerCase() ||
      u.role === selectedRole
    );

    const userToLogin: UserProfile = matched || {
      id: `user-${Date.now()}`,
      name: loginIdentifier.split('@')[0] || 'GenericMed User',
      email: loginIdentifier,
      phone: '+1 (718) 555-0100',
      role: selectedRole,
      joinedDate: 'Today'
    };

    onLogin(userToLogin);
    onShowToast(`Welcome back, ${userToLogin.name}! Authenticated as ${userToLogin.role}.`);

    // Direct user to their native screen
    const targetRole = rolesList.find(r => r.id === userToLogin.role);
    if (targetRole) {
      onNavigateScreen(targetRole.defaultTargetScreen);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      onShowToast('Please complete all required fields');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      onShowToast('Passwords do not match. Please verify.');
      return;
    }
    if (!agreeTerms) {
      onShowToast('Please accept the HIPAA & Terms of Service agreement');
      return;
    }

    const newUser: UserProfile = {
      id: `user-reg-${Date.now()}`,
      name: regName,
      email: regEmail,
      phone: regPhone || '+1 (718) 555-0199',
      role: selectedRole,
      licenseNumber: regLicense || undefined,
      facilityName: regFacility || undefined,
      deliveryAddress: regAddress || '742 Evergreen Terr, Brooklyn NY 11201',
      activePrescriptionsCount: selectedRole === 'patient' ? 1 : 0,
      joinedDate: 'Just now'
    };

    onRegister(newUser);
    onShowToast(`Account successfully created for ${newUser.name}!`);

    const targetRole = rolesList.find(r => r.id === selectedRole);
    if (targetRole) {
      onNavigateScreen(targetRole.defaultTargetScreen);
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    setShowForgotPasswordModal(false);
    onShowToast(`Password recovery link securely dispatched to ${resetEmail}`);
    setResetEmail('');
  };

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: 'Empty', color: 'bg-slate-200' };
    let s = 0;
    if (pwd.length >= 8) s += 1;
    if (/[A-Z]/.test(pwd)) s += 1;
    if (/[0-9]/.test(pwd)) s += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) s += 1;
    if (s <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500' };
    if (s <= 3) return { score: 2, label: 'Good', color: 'bg-amber-500' };
    return { score: 3, label: 'Strong', color: 'bg-[#006c49]' };
  };

  const pwdStrength = getPasswordStrength(regPassword);

  const mainAuthContent = (
    <div className="min-h-[calc(100vh-56px)] flex flex-col justify-center bg-[#f8f9ff] text-[#0b1c30] p-3 sm:p-5 lg:p-6 selection:bg-[#6cf8bb] selection:text-[#002113]">
      <div className="max-w-5xl w-full mx-auto my-auto">
        {/* If user is ALREADY logged in, show Profile Summary with direct dashboard jump */}
        {currentUser ? (
          <div className="bg-white rounded-3xl border border-[#c4c6cf]/70 shadow-xl overflow-hidden max-w-2xl mx-auto p-5 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-[#c4c6cf]/50 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#001026] text-[#6cf8bb] flex items-center justify-center font-bold text-lg shadow-md">
                  {currentUser.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display font-bold text-base sm:text-lg text-[#001026]">{currentUser.name}</h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#006c49]/15 text-[#006c49] border border-[#006c49]/30">
                      {currentUser.role.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-[#44474e]">{currentUser.email}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  onLogout();
                  onShowToast('You have been logged out.');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>

            {/* Profile Quick Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="p-2.5 bg-[#eff4ff] rounded-xl border border-[#c4c6cf]/40 space-y-0.5">
                <span className="text-[10px] font-bold text-[#74777f] uppercase">Account ID</span>
                <div className="font-mono font-bold text-[#001026]">{currentUser.id}</div>
              </div>

              <div className="p-2.5 bg-[#eff4ff] rounded-xl border border-[#c4c6cf]/40 space-y-0.5">
                <span className="text-[10px] font-bold text-[#74777f] uppercase">Phone Verified</span>
                <div className="font-semibold text-[#001026]">{currentUser.phone}</div>
              </div>

              {currentUser.licenseNumber && (
                <div className="p-2.5 bg-[#eff4ff] rounded-xl border border-[#c4c6cf]/40 space-y-0.5 sm:col-span-2">
                  <span className="text-[10px] font-bold text-[#74777f] uppercase">Verified License / NPI</span>
                  <div className="font-mono font-bold text-[#006c49]">{currentUser.licenseNumber}</div>
                </div>
              )}

              {currentUser.deliveryAddress && (
                <div className="p-2.5 bg-[#eff4ff] rounded-xl border border-[#c4c6cf]/40 space-y-0.5 sm:col-span-2">
                  <span className="text-[10px] font-bold text-[#74777f] uppercase">Default Delivery Address</span>
                  <div className="font-medium text-[#001026] flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-[#006c49] flex-shrink-0" />
                    <span className="truncate">{currentUser.deliveryAddress}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation to active role workspace */}
            <div className="pt-2 border-t border-[#c4c6cf]/40 space-y-2.5">
              <div className="text-xs font-bold text-[#001026]">Direct Workspace Access:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => onNavigateScreen('customer-app')}
                  className="p-2.5 rounded-xl border border-[#c4c6cf]/60 bg-white hover:border-[#006c49] text-left text-xs font-semibold flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#006c49]" />
                    <span>Customer Medicine Search</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#74777f] group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={() => onNavigateScreen('pharmacy-portal')}
                  className="p-2.5 rounded-xl border border-[#c4c6cf]/60 bg-white hover:border-[#006c49] text-left text-xs font-semibold flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-[#0b2545]" />
                    <span>Pharmacy Fulfillment Workbench</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#74777f] group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={() => onNavigateScreen('order-tracking')}
                  className="p-2.5 rounded-xl border border-[#c4c6cf]/60 bg-white hover:border-[#006c49] text-left text-xs font-semibold flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#006c49]" />
                    <span>Active Order #88219 Status</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#74777f] group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={() => onNavigateScreen('enterprise-ops')}
                  className="p-2.5 rounded-xl border border-[#c4c6cf]/60 bg-white hover:border-[#006c49] text-left text-xs font-semibold flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#ba1a1a]" />
                    <span>Enterprise Operations Gateway</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#74777f] group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

              {/* Demo Switch User Banner */}
              <div className="p-2.5 bg-[#eff4ff] rounded-xl text-xs flex items-center justify-between text-[#44474e]">
                <span>Want to test another persona?</span>
                <button
                  onClick={() => {
                    onLogout();
                    setAuthMode('login');
                  }}
                  className="text-[#006c49] font-bold hover:underline"
                >
                  Switch Role / Login Again
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* NOT LOGGED IN: Split Desktop Layout & Responsive Mobile View */
          <div className="grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl border border-[#c4c6cf]/80 shadow-xl overflow-hidden lg:h-[630px] lg:max-h-[86vh]">
            {/* LEFT SIDEBAR: Brand & Clinical Highlights (Visible on desktop) */}
            <div className="lg:col-span-5 bg-[#001026] text-white p-5 lg:p-6 flex flex-col justify-between relative overflow-hidden">
              {/* Subtle background glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#006c49]/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#6cf8bb]/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

              <div className="relative z-10 space-y-4">
                {/* Logo & Healthcare Trust Stamp */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#0b2545] border border-[#6cf8bb]/40 flex items-center justify-center text-[#6cf8bb]">
                      <span className="material-symbols-outlined text-[20px]">health_and_safety</span>
                    </div>
                    <div>
                      <span className="font-display font-extrabold text-lg text-white tracking-tight">GenericMed</span>
                      <span className="block text-[9px] font-mono text-[#6cf8bb] font-semibold">
                        FDA BIO-EQUIVALENCE PORTAL
                      </span>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#006c49]/30 text-[#6cf8bb] border border-[#006c49]/60">
                    SOC-2 • HIPAA
                  </span>
                </div>

                {/* Main Headline */}
                <div className="space-y-1.5 pt-1">
                  <h1 className="font-display font-bold text-xl sm:text-2xl text-white leading-tight">
                    Same active molecule.<br />
                    <span className="text-[#6cf8bb]">Up to 85% lower cost.</span>
                  </h1>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
                    Access certified FDA Orange Book bio-equivalent medicines dispensed by licensed neighborhood pharmacies and delivered in 35 minutes.
                  </p>
                </div>

                {/* Key Pillars / Badges - Compact for web view height */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/5 border border-white/10">
                    <div className="w-7 h-7 rounded-lg bg-[#006c49]/30 text-[#6cf8bb] flex items-center justify-center flex-shrink-0">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-xs">
                      <div className="font-bold text-white text-[11px]">FDA Therapeutic Equivalence (AB)</div>
                      <p className="text-slate-400 text-[10px]">Identical AUC rate &amp; clinical efficacy to branded originators.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/5 border border-white/10">
                    <div className="w-7 h-7 rounded-lg bg-[#006c49]/30 text-[#6cf8bb] flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-xs">
                      <div className="font-bold text-white text-[11px]">AI Prescription OCR Scanner</div>
                      <p className="text-slate-400 text-[10px]">Instant salt extraction from paper doctor notes in seconds.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/5 border border-white/10">
                    <div className="w-7 h-7 rounded-lg bg-[#006c49]/30 text-[#6cf8bb] flex items-center justify-center flex-shrink-0">
                      <KeyRound className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-xs">
                      <div className="font-bold text-white text-[11px]">Cryptographic Tamper-Tape</div>
                      <p className="text-slate-400 text-[10px]">Chain-of-custody sealed parcel with 4-digit door PIN handover.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Test Credential Trigger */}
              <div className="relative z-10 pt-3 mt-2 border-t border-white/10">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>1-Click Demo Profiles:</span>
                  <span className="text-[#6cf8bb] text-[9px]">Click to auto-fill</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {DEMO_USERS.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleQuickFill(user)}
                      className="p-1.5 bg-white/10 hover:bg-white/20 text-left rounded-lg border border-white/10 transition-colors group"
                    >
                      <div className="text-[11px] font-bold text-white group-hover:text-[#6cf8bb] truncate">
                        {user.name.split(' ')[0]} ({user.role.replace('_', ' ')})
                      </div>
                      <div className="text-[9px] text-slate-400 truncate">{user.email}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT SIDEBAR: The Interactive Form (Login or Register) */}
            <div className="lg:col-span-7 p-4 sm:p-6 flex flex-col justify-between overflow-y-auto custom-scrollbar">
              <div>
                {/* Mode Switcher Tabs (Sign In vs Register) */}
                <div className="flex items-center justify-between border-b border-[#c4c6cf]/60 pb-2.5 mb-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAuthMode('login')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        authMode === 'login'
                          ? 'bg-[#001026] text-white shadow-sm'
                          : 'bg-[#eff4ff] text-[#44474e] hover:text-[#001026]'
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthMode('register')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        authMode === 'register'
                          ? 'bg-[#001026] text-white shadow-sm'
                          : 'bg-[#eff4ff] text-[#44474e] hover:text-[#001026]'
                      }`}
                    >
                      Create Account
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onNavigateScreen('customer-app')}
                    className="text-xs text-[#74777f] hover:text-[#001026] font-semibold flex items-center gap-1"
                  >
                    <span>Browse as Guest</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Role Selector Header */}
                <div className="space-y-1.5 mb-3.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-[#001026] uppercase tracking-wider">
                      Select Access Persona / Role:
                    </label>
                    <span className="text-[10px] text-[#006c49] font-semibold">
                      {rolesList.find(r => r.id === selectedRole)?.title}
                    </span>
                  </div>

                  {/* 4 Role Selector Cards - Compact */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {rolesList.map((role) => {
                      const isSelected = selectedRole === role.id;
                      return (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() => setSelectedRole(role.id)}
                          className={`p-2 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                            isSelected
                              ? 'border-2 border-[#006c49] bg-[#eff4ff]/80 shadow-xs'
                              : 'border-[#c4c6cf]/60 bg-white hover:border-[#006c49]/40'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="p-0.5 rounded-md bg-white border border-[#c4c6cf]/40">
                              {role.icon}
                            </div>
                            <span className="text-[8px] font-bold px-1.5 py-0.2 rounded-full bg-[#006c49]/15 text-[#006c49]">
                              {role.badge}
                            </span>
                          </div>
                          <div className="font-bold text-[10px] text-[#001026] leading-tight">
                            {role.title}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* FORM VIEW: LOGIN */}
                {authMode === 'login' && (
                  <form onSubmit={handleLoginSubmit} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#0b1c30] mb-1">
                        Email Address or Mobile Number:
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#74777f]">
                          <Mail className="w-3.5 h-3.5" />
                        </span>
                        <input
                          type="text"
                          required
                          value={loginIdentifier}
                          onChange={(e) => setLoginIdentifier(e.target.value)}
                          placeholder="e.g. johnathan.doe@gmail.com"
                          className="w-full pl-9 pr-3 py-2 bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl text-xs text-[#0b1c30] focus:ring-2 focus:ring-[#006c49] focus:bg-white focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-semibold text-[#0b1c30]">
                          Password:
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowForgotPasswordModal(true)}
                          className="text-[10px] text-[#006c49] hover:underline font-semibold"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#74777f]">
                          <Lock className="w-3.5 h-3.5" />
                        </span>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full pl-9 pr-10 py-2 bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl text-xs text-[#0b1c30] focus:ring-2 focus:ring-[#006c49] focus:bg-white focus:outline-none transition-all font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#74777f] hover:text-[#001026]"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-0.5">
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-[#44474e]">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-3.5 h-3.5 rounded text-[#006c49] focus:ring-[#006c49] border-[#c4c6cf]"
                        />
                        <span className="text-[11px]">Remember device for 30 days</span>
                      </label>
                      <span className="text-[10px] text-[#74777f] font-mono">256-Bit SSL</span>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 bg-[#001026] hover:bg-[#0b2545] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99]"
                    >
                      <span>Sign In to {rolesList.find(r => r.id === selectedRole)?.title}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#6cf8bb]" />
                    </button>

                    {/* Social SSO Buttons */}
                    <div className="pt-1">
                      <div className="relative flex items-center justify-center my-2">
                        <div className="border-t border-[#c4c6cf]/60 w-full"></div>
                        <span className="bg-white px-2 text-[9px] uppercase font-bold text-[#74777f] absolute">
                          Or Continue With
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const demoPatient = DEMO_USERS[0];
                            onLogin(demoPatient);
                            onShowToast(`Signed in with Google Health ID as ${demoPatient.name}!`);
                            onNavigateScreen('customer-app');
                          }}
                          className="py-1.5 px-2.5 border border-[#c4c6cf] hover:bg-[#eff4ff] rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <span className="font-bold text-[#ba1a1a]">G</span>
                          <span className="truncate">Google Health ID</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const demoPharmacist = DEMO_USERS[1];
                            onLogin(demoPharmacist);
                            onShowToast(`Signed in with Provider SSO as ${demoPharmacist.name}!`);
                            onNavigateScreen('pharmacy-portal');
                          }}
                          className="py-1.5 px-2.5 border border-[#c4c6cf] hover:bg-[#eff4ff] rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Stethoscope className="w-3 h-3 text-[#006c49]" />
                          <span className="truncate">Provider NPI SSO</span>
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {/* FORM VIEW: REGISTER */}
                {authMode === 'register' && (
                  <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                          Full Legal Name: <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#74777f]">
                            <User className="w-4 h-4" />
                          </span>
                          <input
                            type="text"
                            required
                            value={regName}
                            onChange={(e) => setRegName(e.target.value)}
                            placeholder="e.g. Sarah Jenkins"
                            className="w-full pl-9 pr-3 py-2 bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl text-xs text-[#0b1c30] focus:ring-2 focus:ring-[#006c49] focus:bg-white focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                          Mobile Number: <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#74777f]">
                            <Phone className="w-4 h-4" />
                          </span>
                          <input
                            type="tel"
                            required
                            value={regPhone}
                            onChange={(e) => setRegPhone(e.target.value)}
                            placeholder="e.g. +1 (718) 555-0199"
                            className="w-full pl-9 pr-3 py-2 bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl text-xs text-[#0b1c30] focus:ring-2 focus:ring-[#006c49] focus:bg-white focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                        Email Address: <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#74777f]">
                          <Mail className="w-4 h-4" />
                        </span>
                        <input
                          type="email"
                          required
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="e.g. sarah.jenkins@example.com"
                          className="w-full pl-9 pr-3 py-2 bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl text-xs text-[#0b1c30] focus:ring-2 focus:ring-[#006c49] focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Role-specific conditional fields */}
                    {selectedRole === 'pharmacist' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#eff4ff] rounded-xl border border-[#c4c6cf]/60">
                        <div>
                          <label className="block text-[11px] font-bold text-[#001026] mb-1">
                            RPh License # / State Board:
                          </label>
                          <input
                            type="text"
                            required
                            value={regLicense}
                            onChange={(e) => setRegLicense(e.target.value)}
                            placeholder="e.g. PH-88201-NY"
                            className="w-full px-3 py-1.5 bg-white border border-[#c4c6cf] rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-[#001026] mb-1">
                            Dispensary / Store Hub Name:
                          </label>
                          <input
                            type="text"
                            required
                            value={regFacility}
                            onChange={(e) => setRegFacility(e.target.value)}
                            placeholder="e.g. MetroCare Hub #104"
                            className="w-full px-3 py-1.5 bg-white border border-[#c4c6cf] rounded-lg text-xs"
                          />
                        </div>
                      </div>
                    )}

                    {selectedRole === 'manufacturer' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#eff4ff] rounded-xl border border-[#c4c6cf]/60">
                        <div>
                          <label className="block text-[11px] font-bold text-[#001026] mb-1">
                            FDA Establishment ID (FEI):
                          </label>
                          <input
                            type="text"
                            required
                            value={regLicense}
                            onChange={(e) => setRegLicense(e.target.value)}
                            placeholder="e.g. FEI-30048291"
                            className="w-full px-3 py-1.5 bg-white border border-[#c4c6cf] rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-[#001026] mb-1">
                            Pharmaceutical Manufacturer:
                          </label>
                          <input
                            type="text"
                            required
                            value={regFacility}
                            onChange={(e) => setRegFacility(e.target.value)}
                            placeholder="e.g. Sandoz BioPharma Plant 2"
                            className="w-full px-3 py-1.5 bg-white border border-[#c4c6cf] rounded-lg text-xs"
                          />
                        </div>
                      </div>
                    )}

                    {selectedRole === 'patient' && (
                      <div>
                        <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                          Delivery Street Address (Brooklyn Express Zone):
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#74777f]">
                            <MapPin className="w-4 h-4" />
                          </span>
                          <input
                            type="text"
                            value={regAddress}
                            onChange={(e) => setRegAddress(e.target.value)}
                            placeholder="e.g. 742 Evergreen Terr, Brooklyn NY 11201"
                            className="w-full pl-9 pr-3 py-2 bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl text-xs text-[#0b1c30] focus:ring-2 focus:ring-[#006c49] focus:bg-white focus:outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {/* Passwords */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                          Create Password:
                        </label>
                        <input
                          type="password"
                          required
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Min 8 characters"
                          className="w-full px-3 py-2 bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl text-xs text-[#0b1c30] focus:ring-2 focus:ring-[#006c49] focus:bg-white focus:outline-none font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                          Confirm Password:
                        </label>
                        <input
                          type="password"
                          required
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          placeholder="Re-enter password"
                          className="w-full px-3 py-2 bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl text-xs text-[#0b1c30] focus:ring-2 focus:ring-[#006c49] focus:bg-white focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    {/* Password strength indicator */}
                    {regPassword && (
                      <div className="flex items-center gap-2 text-[11px] text-[#44474e]">
                        <span>Strength:</span>
                        <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden flex gap-1">
                          <div className={`h-full flex-1 ${pwdStrength.score >= 1 ? pwdStrength.color : 'bg-slate-200'}`}></div>
                          <div className={`h-full flex-1 ${pwdStrength.score >= 2 ? pwdStrength.color : 'bg-slate-200'}`}></div>
                          <div className={`h-full flex-1 ${pwdStrength.score >= 3 ? pwdStrength.color : 'bg-slate-200'}`}></div>
                        </div>
                        <span className="font-bold">{pwdStrength.label}</span>
                      </div>
                    )}

                    {/* Checkboxes */}
                    <div className="space-y-1.5 pt-1 text-xs text-[#44474e]">
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={agreeTerms}
                          onChange={(e) => setAgreeTerms(e.target.checked)}
                          className="w-4 h-4 rounded text-[#006c49] focus:ring-[#006c49] border-[#c4c6cf] mt-0.5"
                        />
                        <span>
                          I agree to GenericMed <strong className="text-[#001026]">Terms of Service</strong> and consent to <strong className="text-[#001026]">HIPAA Electronic Data Privacy</strong> regulations.
                        </span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={enable2FA}
                          onChange={(e) => setEnable2FA(e.target.checked)}
                          className="w-4 h-4 rounded text-[#006c49] focus:ring-[#006c49] border-[#c4c6cf]"
                        />
                        <span>Enable SMS 2-factor authentication &amp; 35-min delivery PIN notifications</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 bg-[#006c49] hover:bg-[#006c49]/90 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99] mt-1.5"
                    >
                      <span>Create My {rolesList.find(r => r.id === selectedRole)?.title} Account</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#6cf8bb]" />
                    </button>
                  </form>
                )}
              </div>

              {/* Bottom Footer Note */}
              <div className="pt-3 mt-3 border-t border-[#c4c6cf]/50 text-center text-xs text-[#74777f]">
                {authMode === 'login' ? (
                  <p>
                    Don&apos;t have an account yet?{' '}
                    <button
                      type="button"
                      onClick={() => setAuthMode('register')}
                      className="text-[#006c49] font-bold hover:underline"
                    >
                      Register in under 2 minutes
                    </button>
                  </p>
                ) : (
                  <p>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setAuthMode('login')}
                      className="text-[#006c49] font-bold hover:underline"
                    >
                      Sign In here
                    </button>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-50 bg-[#001026]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-[#c4c6cf] p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#006c49]/20 text-[#006c49] flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <h3 className="font-display font-bold text-base text-[#001026]">Reset Your Password</h3>
              </div>
              <button onClick={() => setShowForgotPasswordModal(false)} className="text-[#74777f]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <p className="text-xs text-[#44474e] leading-relaxed">
              Enter the email address or phone number registered with your GenericMed account. We will send a secure one-time verification token.
            </p>

            <form onSubmit={handleForgotPassword} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#001026] mb-1">
                  Registered Email Address:
                </label>
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="e.g. johnathan.doe@gmail.com"
                  className="w-full p-2.5 bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl text-xs text-[#001026] focus:ring-2 focus:ring-[#006c49] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowForgotPasswordModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-[#44474e]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#001026] text-white rounded-xl text-xs font-bold hover:bg-[#0b2545] transition-colors"
                >
                  Send Reset Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  // If user selected mobile device frame mode, wrap in realistic iPhone viewport
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
          <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-[#f8f9ff]">
            {mainAuthContent}
          </div>
        </div>
      </div>
    );
  }

  // Full-width Responsive Website View
  return mainAuthContent;
};
