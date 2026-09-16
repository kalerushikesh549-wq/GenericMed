import React, { useState, useEffect } from 'react';
import { ScreenId, UserRole, UserProfile } from '../../types';
import { DEMO_USERS } from '../../data/mockData';
import { useLanguage } from '../../i18n/LanguageContext';
import { formatIndianMobile, isValidIndianMobile } from '../../utils/formatters';
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
  MapPin, 
  LogOut, 
  ChevronRight,
  RefreshCw,
  Zap,
  Smartphone,
  Check
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
  const { t } = useLanguage();

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loginMethod, setLoginMethod] = useState<'otp' | 'password'>('otp');
  const [selectedRole, setSelectedRole] = useState<UserRole>('patient');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  // OTP Login states
  const [otpMobile, setOtpMobile] = useState('9823456789');
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // Password Login states
  const [loginIdentifier, setLoginIdentifier] = useState('rahul.sharma@gmail.com');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);

  // Register Form states (Indian format)
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regCity, setRegCity] = useState('Pune');
  const [regState, setRegState] = useState('Maharashtra');
  const [regPincode, setRegPincode] = useState('411016');
  const [regLicense, setRegLicense] = useState('');
  const [regFacility, setRegFacility] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Resend OTP countdown timer
  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setInterval(() => {
      setResendTimer(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendTimer]);

  // Roles definition
  const rolesList: {
    id: UserRole;
    titleKey: string;
    defaultTitle: string;
    description: string;
    icon: React.ReactNode;
    badge: string;
    defaultTargetScreen: ScreenId;
  }[] = [
    {
      id: 'patient',
      titleKey: 'patientRole',
      defaultTitle: 'Patient / Citizen',
      description: 'Search Jan Aushadhi generic substitutes and track 35-min delivery.',
      icon: <User className="w-4 h-4 text-[#006c49]" />,
      badge: 'Save 80%',
      defaultTargetScreen: 'customer-app'
    },
    {
      id: 'pharmacist',
      titleKey: 'pharmacistRole',
      defaultTitle: 'Licensed Pharmacist',
      description: 'Jan Aushadhi dispensary, batch validation, and doorstep handover.',
      icon: <Store className="w-4 h-4 text-[#0b2545]" />,
      badge: 'D.Pharm / RPh',
      defaultTargetScreen: 'pharmacy-portal'
    },
    {
      id: 'manufacturer',
      titleKey: 'manufacturerRole',
      defaultTitle: 'Pharma Manufacturer',
      description: 'B2B supply allocation, CDSCO compliance, and cGMP release dossiers.',
      icon: <Factory className="w-4 h-4 text-[#6b4700]" />,
      badge: 'CDSCO / cGMP',
      defaultTargetScreen: 'manufacturer-portal'
    },
    {
      id: 'enterprise_admin',
      titleKey: 'adminRole',
      defaultTitle: 'Enterprise Admin',
      description: 'State regulatory gateway, clinical reviews, and audit trails.',
      icon: <Building2 className="w-4 h-4 text-[#ba1a1a]" />,
      badge: 'CDSCO REG',
      defaultTargetScreen: 'enterprise-ops'
    }
  ];

  // Quick fill handler for Indian demo users
  const handleQuickFill = (user: UserProfile) => {
    setSelectedRole(user.role);
    setLoginIdentifier(user.email);
    setLoginPassword('password123');
    const cleanPhone = user.phone.replace(/\D/g, '').slice(-10);
    setOtpMobile(cleanPhone || '9823456789');
    onShowToast(`Credentials loaded for ${user.name} (${user.role.replace('_', ' ').toUpperCase()})`);
  };

  // Send OTP handler
  const handleSendOtp = () => {
    const cleanMobile = otpMobile.replace(/\D/g, '');
    if (!cleanMobile || cleanMobile.length !== 10) {
      onShowToast('Please enter a valid 10-digit Indian mobile number (e.g. 9823456789)');
      return;
    }

    // Generate random 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpSent(true);
    setResendTimer(30);
    setEnteredOtp('');

    // Simulate real SMS dispatch via toast
    onShowToast(`📲 SMS to +91 ${cleanMobile}: Your GenericMed Bharat OTP is [ ${code} ]. Valid for 10 mins.`);
  };

  // Auto-fill OTP helper for fast testing
  const handleAutoFillOtp = () => {
    if (generatedOtp) {
      setEnteredOtp(generatedOtp);
      onShowToast(`Auto-filled OTP: ${generatedOtp}`);
    }
  };

  // Verify OTP and Login
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enteredOtp.trim()) {
      onShowToast('Please enter the 6-digit OTP received via SMS');
      return;
    }

    if (enteredOtp.trim() !== generatedOtp) {
      onShowToast('Incorrect OTP. Please enter the OTP displayed in the SMS alert or click Auto-fill.');
      return;
    }

    // Find matching demo user by phone or role
    const matched = DEMO_USERS.find(u => 
      u.phone.includes(otpMobile) || u.role === selectedRole
    );

    const userToLogin: UserProfile = matched || {
      id: `user-in-${Date.now()}`,
      name: `Citizen +91-${otpMobile.slice(-4)}`,
      email: `${otpMobile}@genericmed.in`,
      phone: formatIndianMobile(otpMobile),
      role: selectedRole,
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411016',
      deliveryAddress: 'Flat 402, Shivneri Heights, SB Road, Shivaji Nagar, Pune, Maharashtra 411016',
      joinedDate: 'Today'
    };

    onLogin(userToLogin);
    onShowToast(`OTP Verified! Welcome to GenericMed Bharat, ${userToLogin.name}.`);

    const targetRole = rolesList.find(r => r.id === userToLogin.role);
    if (targetRole) {
      onNavigateScreen(targetRole.defaultTargetScreen);
    }
  };

  // Password Login submit
  const handlePasswordLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim()) {
      onShowToast('Please enter your email or mobile number');
      return;
    }

    const matched = DEMO_USERS.find(u => 
      u.email.toLowerCase() === loginIdentifier.toLowerCase() ||
      u.phone.includes(loginIdentifier) ||
      u.role === selectedRole
    );

    const userToLogin: UserProfile = matched || {
      id: `user-in-${Date.now()}`,
      name: loginIdentifier.split('@')[0] || 'GenericMed User',
      email: loginIdentifier,
      phone: '+91 98234 56789',
      role: selectedRole,
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411016',
      joinedDate: 'Today'
    };

    onLogin(userToLogin);
    onShowToast(`Welcome back, ${userToLogin.name}! Authenticated as ${userToLogin.role}.`);

    const targetRole = rolesList.find(r => r.id === userToLogin.role);
    if (targetRole) {
      onNavigateScreen(targetRole.defaultTargetScreen);
    }
  };

  // Register Form submit
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regPhone.trim() || !regPassword.trim()) {
      onShowToast('Please complete all required fields');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      onShowToast('Passwords do not match. Please verify.');
      return;
    }
    if (!agreeTerms) {
      onShowToast('Please accept the Jan Aushadhi & CDSCO terms of service');
      return;
    }

    const newUser: UserProfile = {
      id: `user-reg-${Date.now()}`,
      name: regName,
      email: regEmail || `${regPhone}@genericmed.in`,
      phone: formatIndianMobile(regPhone),
      role: selectedRole,
      licenseNumber: regLicense || undefined,
      facilityName: regFacility || undefined,
      city: regCity,
      state: regState,
      pincode: regPincode,
      deliveryAddress: regAddress || `${regCity}, ${regState} - ${regPincode}`,
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
    onShowToast(`Password recovery OTP securely dispatched to ${resetEmail}`);
    setResetEmail('');
  };

  const mainAuthContent = (
    <div className="min-h-[calc(100vh-56px)] flex flex-col justify-center bg-[#f8f9ff] text-[#0b1c30] p-3 sm:p-5 lg:p-6 selection:bg-[#6cf8bb] selection:text-[#002113]">
      <div className="max-w-5xl w-full mx-auto my-auto">
        {/* If user is ALREADY logged in */}
        {currentUser ? (
          <div className="bg-white rounded-3xl border border-[#c4c6cf]/70 shadow-xl overflow-hidden max-w-2xl mx-auto p-5 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-[#c4c6cf]/50 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#001026] text-[#6cf8bb] flex items-center justify-center font-bold text-xl shadow-md">
                  {currentUser.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display font-bold text-base sm:text-lg text-[#001026]">{currentUser.name}</h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#006c49]/15 text-[#006c49] border border-[#006c49]/30">
                      {currentUser.role.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-[#44474e]">{currentUser.email} • {currentUser.phone}</p>
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
                {t('signOut', 'Sign Out')}
              </button>
            </div>

            {/* Profile Quick Details (Indian Format) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="p-2.5 bg-[#eff4ff] rounded-xl border border-[#c4c6cf]/40 space-y-0.5">
                <span className="text-[10px] font-bold text-[#74777f] uppercase">Account ID</span>
                <div className="font-mono font-bold text-[#001026]">{currentUser.id}</div>
              </div>

              <div className="p-2.5 bg-[#eff4ff] rounded-xl border border-[#c4c6cf]/40 space-y-0.5">
                <span className="text-[10px] font-bold text-[#74777f] uppercase">Verified Mobile (+91)</span>
                <div className="font-semibold text-[#001026] flex items-center gap-1.5">
                  <span className="text-xs">🇮🇳</span>
                  <span>{currentUser.phone}</span>
                </div>
              </div>

              {currentUser.city && (
                <div className="p-2.5 bg-[#eff4ff] rounded-xl border border-[#c4c6cf]/40 space-y-0.5">
                  <span className="text-[10px] font-bold text-[#74777f] uppercase">Region / State</span>
                  <div className="font-semibold text-[#001026]">{currentUser.city}, {currentUser.state || 'India'}</div>
                </div>
              )}

              {currentUser.pincode && (
                <div className="p-2.5 bg-[#eff4ff] rounded-xl border border-[#c4c6cf]/40 space-y-0.5">
                  <span className="text-[10px] font-bold text-[#74777f] uppercase">PIN Code</span>
                  <div className="font-mono font-bold text-[#006c49]">{currentUser.pincode}</div>
                </div>
              )}

              {currentUser.licenseNumber && (
                <div className="p-2.5 bg-[#eff4ff] rounded-xl border border-[#c4c6cf]/40 space-y-0.5 sm:col-span-2">
                  <span className="text-[10px] font-bold text-[#74777f] uppercase">CDSCO / Pharmacy Council License</span>
                  <div className="font-mono font-bold text-[#006c49]">{currentUser.licenseNumber}</div>
                </div>
              )}

              {currentUser.deliveryAddress && (
                <div className="p-2.5 bg-[#eff4ff] rounded-xl border border-[#c4c6cf]/40 space-y-0.5 sm:col-span-2">
                  <span className="text-[10px] font-bold text-[#74777f] uppercase">Default Indian Delivery Address</span>
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
                    <span>Jan Aushadhi Medicine Search</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#74777f] group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={() => onNavigateScreen('pharmacy-portal')}
                  className="p-2.5 rounded-xl border border-[#c4c6cf]/60 bg-white hover:border-[#006c49] text-left text-xs font-semibold flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-[#0b2545]" />
                    <span>Jan Aushadhi Dispensary Hub</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#74777f] group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={() => onNavigateScreen('order-tracking')}
                  className="p-2.5 rounded-xl border border-[#c4c6cf]/60 bg-white hover:border-[#006c49] text-left text-xs font-semibold flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#006c49]" />
                    <span>Track Live Delivery (PIN: 8410)</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#74777f] group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={() => onNavigateScreen('enterprise-ops')}
                  className="p-2.5 rounded-xl border border-[#c4c6cf]/60 bg-white hover:border-[#006c49] text-left text-xs font-semibold flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#ba1a1a]" />
                    <span>CDSCO Enterprise Gateway</span>
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
          /* NOT LOGGED IN: Split Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl border border-[#c4c6cf]/80 shadow-xl overflow-hidden min-h-[620px]">
            {/* LEFT SIDEBAR: Brand & Clinical Highlights */}
            <div className="lg:col-span-5 bg-[#001026] text-white p-5 lg:p-6 flex flex-col justify-between relative overflow-hidden">
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
                      <span className="font-display font-extrabold text-lg text-white tracking-tight flex items-center gap-1.5">
                        <span>GenericMed Bharat</span>
                        <span className="text-sm">🇮🇳</span>
                      </span>
                      <span className="block text-[9px] font-mono text-[#6cf8bb] font-semibold">
                        PMBJP & CDSCO BIO-EQUIVALENCE PORTAL
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <h1 className="font-display font-bold text-xl lg:text-2xl text-white leading-tight">
                    Affordable Generic Healthcare for 1.4 Billion Citizens
                  </h1>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Same active pharmaceutical ingredients (APIs), identical therapeutic efficacy, up to 80% cost savings compared to branded drugs.
                  </p>
                </div>

                {/* Indian Trust Badges */}
                <div className="space-y-2 pt-1 text-xs">
                  <div className="flex items-center gap-2 text-slate-200">
                    <ShieldCheck className="w-4 h-4 text-[#6cf8bb] flex-shrink-0" />
                    <span>Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP)</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-[#6cf8bb] flex-shrink-0" />
                    <span>CDSCO Form 20/21 Verified Quality Standards</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-200">
                    <Zap className="w-4 h-4 text-[#6cf8bb] flex-shrink-0" />
                    <span>Instant SMS OTP Login with +91 Mobile Support</span>
                  </div>
                </div>

                {/* Indian Quick Demo Persona Chips */}
                <div className="pt-2 border-t border-white/10 space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {t('quickLoginAs', 'Quick Demo Sign-In as:')}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {DEMO_USERS.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleQuickFill(user)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all group"
                      >
                        <div className="font-bold text-white text-[11px] truncate flex items-center gap-1">
                          <span className="text-[10px]">🇮🇳</span>
                          <span className="truncate">{user.name.split(',')[0]}</span>
                        </div>
                        <div className="text-[10px] text-[#6cf8bb] capitalize">{user.role.replace('_', ' ')}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom footer badge */}
              <div className="relative z-10 pt-3 border-t border-white/10 text-[10px] text-slate-400 flex items-center justify-between">
                <span>National Digital Health Mission (ABDM)</span>
                <span className="font-mono text-[#6cf8bb]">256-Bit SSL India</span>
              </div>
            </div>

            {/* RIGHT COLUMN: Interactive Dual Login Form (OTP / Password) */}
            <div className="lg:col-span-7 p-5 lg:p-7 flex flex-col justify-between overflow-y-auto">
              <div>
                {/* Top Toggle: Sign In vs Create Account */}
                <div className="flex items-center justify-between border-b border-[#c4c6cf]/40 pb-3 mb-4">
                  <div className="flex items-center gap-1 bg-[#f8f9ff] p-1 rounded-2xl border border-[#c4c6cf]/50">
                    <button
                      type="button"
                      onClick={() => setAuthMode('login')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        authMode === 'login'
                          ? 'bg-[#001026] text-white shadow-sm'
                          : 'text-[#44474e] hover:text-[#001026]'
                      }`}
                    >
                      {t('signIn', 'Sign In')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthMode('register')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        authMode === 'register'
                          ? 'bg-[#001026] text-white shadow-sm'
                          : 'text-[#44474e] hover:text-[#001026]'
                      }`}
                    >
                      {t('createAccount', 'Create Account')}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onNavigateScreen('customer-app')}
                    className="text-xs text-[#74777f] hover:text-[#001026] font-semibold flex items-center gap-1"
                  >
                    <span>Browse Catalog</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Role Selector Header */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-[#001026] uppercase tracking-wider">
                      Select Access Persona / Role:
                    </label>
                    <span className="text-[10px] text-[#006c49] font-semibold">
                      {rolesList.find(r => r.id === selectedRole)?.defaultTitle}
                    </span>
                  </div>

                  {/* 4 Role Selector Cards */}
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
                            {t(role.titleKey, role.defaultTitle)}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* AUTH MODE: LOGIN */}
                {authMode === 'login' && (
                  <div className="space-y-4">
                    {/* Method Selector Tabs: Mobile OTP vs Password */}
                    <div className="grid grid-cols-2 gap-2 p-1 bg-[#eff4ff] rounded-xl border border-[#c4c6cf]/50">
                      <button
                        type="button"
                        onClick={() => setLoginMethod('otp')}
                        className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                          loginMethod === 'otp'
                            ? 'bg-white text-[#001026] shadow-sm border border-[#c4c6cf]/60'
                            : 'text-[#44474e] hover:text-[#001026]'
                        }`}
                      >
                        <Smartphone className="w-3.5 h-3.5 text-[#006c49]" />
                        <span>{t('loginWithOtp', 'Login with Mobile OTP')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setLoginMethod('password')}
                        className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                          loginMethod === 'password'
                            ? 'bg-white text-[#001026] shadow-sm border border-[#c4c6cf]/60'
                            : 'text-[#44474e] hover:text-[#001026]'
                        }`}
                      >
                        <Lock className="w-3.5 h-3.5 text-[#0b2545]" />
                        <span>{t('loginWithPassword', 'Login with Password')}</span>
                      </button>
                    </div>

                    {/* METHOD 1: LOGIN WITH MOBILE OTP */}
                    {loginMethod === 'otp' && (
                      <form onSubmit={handleVerifyOtp} className="space-y-3.5">
                        <div>
                          <label className="block text-[11px] font-semibold text-[#0b1c30] mb-1">
                            {t('enterMobileNumber', 'Enter 10-Digit Mobile Number')}:
                          </label>
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-xs font-bold text-[#001026]">
                                <span>🇮🇳 +91</span>
                              </span>
                              <input
                                type="tel"
                                maxLength={10}
                                required
                                value={otpMobile}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/\D/g, '');
                                  setOtpMobile(val);
                                }}
                                placeholder="9823456789"
                                className="w-full pl-16 pr-3 py-2 bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl text-xs font-mono font-bold text-[#0b1c30] focus:ring-2 focus:ring-[#006c49] focus:bg-white focus:outline-none transition-all"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={handleSendOtp}
                              disabled={resendTimer > 0}
                              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all flex-shrink-0 ${
                                resendTimer > 0
                                  ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                                  : 'bg-[#006c49] hover:bg-[#005237] text-white shadow-xs'
                              }`}
                            >
                              <RefreshCw className={`w-3.5 h-3.5 ${resendTimer > 0 ? 'animate-spin' : ''}`} />
                              <span>{resendTimer > 0 ? `${resendTimer}s` : (otpSent ? t('resendOtp', 'Resend OTP') : t('getOtp', 'Get OTP'))}</span>
                            </button>
                          </div>
                        </div>

                        {/* OTP Input Fields (Rendered once OTP is dispatched) */}
                        {otpSent && (
                          <div className="p-3 bg-[#e6f7ef] rounded-2xl border border-[#006c49]/40 space-y-2.5 animate-fadeIn">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-[#006c49]">
                                {t('otpSentTo', 'OTP sent to')}: +91 {otpMobile}
                              </span>
                              {generatedOtp && (
                                <button
                                  type="button"
                                  onClick={handleAutoFillOtp}
                                  className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#006c49] text-white hover:bg-[#005237] transition-all flex items-center gap-1"
                                  title="Click to automatically fill code"
                                >
                                  <Zap className="w-3 h-3 text-[#6cf8bb]" />
                                  <span>{t('autoFillOtp', 'Auto-fill')} ({generatedOtp})</span>
                                </button>
                              )}
                            </div>

                            <div className="relative">
                              <input
                                type="text"
                                maxLength={6}
                                required
                                value={enteredOtp}
                                onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                                placeholder="Enter 6-digit OTP (e.g. 482910)"
                                className="w-full text-center tracking-[0.4em] font-mono text-base font-extrabold py-2 bg-white border-2 border-[#006c49] rounded-xl text-[#001026] focus:ring-2 focus:ring-[#006c49] focus:outline-none"
                              />
                            </div>

                            <div className="text-[10px] text-[#44474e] flex items-center justify-between">
                              <span>Valid for 10 minutes</span>
                              <span className="text-[#006c49] font-semibold">Test Code: {generatedOtp}</span>
                            </div>

                            <button
                              type="submit"
                              className="w-full py-2.5 px-4 bg-[#001026] hover:bg-[#0b2545] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                            >
                              <span>{t('verifyOtp', 'Verify OTP & Sign In')}</span>
                              <ArrowRight className="w-3.5 h-3.5 text-[#6cf8bb]" />
                            </button>
                          </div>
                        )}

                        {!otpSent && (
                          <div className="p-3 bg-[#eff4ff] rounded-xl text-xs text-[#44474e] flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px] text-[#006c49]">sms</span>
                            <span>Click <strong>"Get OTP"</strong> to receive an instant verification SMS code on your Indian mobile number.</span>
                          </div>
                        )}
                      </form>
                    )}

                    {/* METHOD 2: LOGIN WITH PASSWORD */}
                    {loginMethod === 'password' && (
                      <form onSubmit={handlePasswordLoginSubmit} className="space-y-3">
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
                              placeholder="e.g. rahul.sharma@gmail.com or 9823456789"
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
                          <span className="text-[10px] text-[#74777f] font-mono">CDSCO / 256-Bit</span>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2.5 px-4 bg-[#001026] hover:bg-[#0b2545] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                        >
                          <span>Sign In to {rolesList.find(r => r.id === selectedRole)?.defaultTitle}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#6cf8bb]" />
                        </button>
                      </form>
                    )}
                  </div>
                )}

                {/* AUTH MODE: REGISTER (Indian Format) */}
                {authMode === 'register' && (
                  <form onSubmit={handleRegisterSubmit} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#0b1c30] mb-1">
                          Full Name:
                        </label>
                        <input
                          type="text"
                          required
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="e.g. Rahul Sharma"
                          className="w-full px-3 py-1.5 bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl text-xs text-[#0b1c30] focus:ring-2 focus:ring-[#006c49] focus:bg-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#0b1c30] mb-1">
                          Mobile (+91):
                        </label>
                        <input
                          type="tel"
                          maxLength={10}
                          required
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, ''))}
                          placeholder="10-digit mobile"
                          className="w-full px-3 py-1.5 bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl text-xs font-mono text-[#0b1c30] focus:ring-2 focus:ring-[#006c49] focus:bg-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#0b1c30] mb-1">
                          Email Address:
                        </label>
                        <input
                          type="email"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="rahul@example.com"
                          className="w-full px-3 py-1.5 bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl text-xs text-[#0b1c30] focus:ring-2 focus:ring-[#006c49] focus:bg-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#0b1c30] mb-1">
                          PIN Code (6 Digits):
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          required
                          value={regPincode}
                          onChange={(e) => setRegPincode(e.target.value.replace(/\D/g, ''))}
                          placeholder="411016"
                          className="w-full px-3 py-1.5 bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl text-xs font-mono text-[#0b1c30] focus:ring-2 focus:ring-[#006c49] focus:bg-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#0b1c30] mb-1">
                          City / District:
                        </label>
                        <input
                          type="text"
                          required
                          value={regCity}
                          onChange={(e) => setRegCity(e.target.value)}
                          placeholder="Pune"
                          className="w-full px-3 py-1.5 bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl text-xs text-[#0b1c30] focus:ring-2 focus:ring-[#006c49] focus:bg-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#0b1c30] mb-1">
                          State:
                        </label>
                        <input
                          type="text"
                          required
                          value={regState}
                          onChange={(e) => setRegState(e.target.value)}
                          placeholder="Maharashtra"
                          className="w-full px-3 py-1.5 bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl text-xs text-[#0b1c30] focus:ring-2 focus:ring-[#006c49] focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Role-specific registration fields */}
                    {selectedRole === 'pharmacist' && (
                      <div className="p-2.5 bg-[#eff4ff] rounded-xl border border-[#c4c6cf]/40 space-y-2">
                        <div className="text-[10px] font-bold uppercase text-[#006c49]">Pharmacist Credentials (Form 20/21)</div>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            required
                            value={regLicense}
                            onChange={(e) => setRegLicense(e.target.value)}
                            placeholder="State Pharmacy Council Reg No."
                            className="px-2.5 py-1.5 bg-white border border-[#c4c6cf] rounded-lg text-xs"
                          />
                          <input
                            type="text"
                            value={regFacility}
                            onChange={(e) => setRegFacility(e.target.value)}
                            placeholder="Jan Aushadhi Kendra Name"
                            className="px-2.5 py-1.5 bg-white border border-[#c4c6cf] rounded-lg text-xs"
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#0b1c30] mb-1">
                          Password:
                        </label>
                        <input
                          type="password"
                          required
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full px-3 py-1.5 bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl text-xs text-[#0b1c30] focus:ring-2 focus:ring-[#006c49] focus:bg-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#0b1c30] mb-1">
                          Confirm Password:
                        </label>
                        <input
                          type="password"
                          required
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full px-3 py-1.5 bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl text-xs text-[#0b1c30] focus:ring-2 focus:ring-[#006c49] focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer text-xs text-[#44474e] pt-1">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="w-3.5 h-3.5 rounded text-[#006c49] focus:ring-[#006c49] border-[#c4c6cf]"
                      />
                      <span className="text-[11px]">I agree to Jan Aushadhi, CDSCO, and ABDM terms of service</span>
                    </label>

                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 bg-[#001026] hover:bg-[#0b2545] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                      <span>Create {rolesList.find(r => r.id === selectedRole)?.defaultTitle} Account</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#6cf8bb]" />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl border border-[#c4c6cf]">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-display font-bold text-sm text-[#001026]">Password Recovery via Mobile / Email</h3>
              <button onClick={() => setShowForgotPasswordModal(false)} className="text-slate-400 hover:text-black">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <p className="text-xs text-[#44474e]">
              Enter your registered Indian mobile number or email to receive a password reset verification code.
            </p>
            <form onSubmit={handleForgotPassword} className="space-y-3">
              <input
                type="text"
                required
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="e.g. 9823456789 or rahul.sharma@gmail.com"
                className="w-full px-3 py-2 bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl text-xs"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForgotPasswordModal(false)}
                  className="px-3 py-1.5 rounded-xl border text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[#006c49] text-white text-xs font-bold"
                >
                  Send Reset OTP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  return isMobileFrame ? (
    <div className="max-w-[420px] mx-auto rounded-[40px] shadow-2xl border-[8px] border-[#1e293b] overflow-hidden my-4 bg-white">
      {mainAuthContent}
    </div>
  ) : (
    mainAuthContent
  );
};
