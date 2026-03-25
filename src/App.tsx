/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Save, 
  CheckCircle, 
  User, 
  Users, 
  Target, 
  DollarSign, 
  ShieldCheck, 
  Briefcase, 
  FileText, 
  AlertCircle,
  Plus,
  Trash2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Globe,
  Heart,
  Home,
  GraduationCap,
  TrendingUp,
  History,
  Lock,
  Share2,
  PenTool,
  LayoutDashboard,
  FileBarChart,
  Download,
  RefreshCw,
  Sun,
  Moon,
  BookOpen,
  Layout,
  Search,
  Filter,
  MoreVertical,
  PlayCircle,
  Book,
  Video,
  Settings,
  Copy,
  Github
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  auth, 
  db, 
  googleProvider, 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot 
} from './firebase';
import { 
  signInWithPopup, 
  onAuthStateChanged, 
  signOut, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from 'firebase/auth';
import { serverTimestamp } from 'firebase/firestore';

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';

interface Dependent {
  id: string;
  name: string;
  dob: string;
  currentSchool: string;
  futureSchool: string;
}

interface Goal {
  id: string;
  label: string;
  timeframe: string;
}

interface CashFlowItem {
  id: string;
  label: string;
  monthly: number | string;
  annual: number | string;
}

interface AssetLiabilityItem {
  id: string;
  label: string;
  value: number | string;
}

interface InsurancePolicy {
  id: string;
  policyType: string;
  company: string;
  sumAssured: string;
  premium: string;
  frequency: string;
  paidBy: string;
  maturityDate: string;
}

interface Referral {
  id: string;
  name: string;
  jobTitle: string;
  employer: string;
  tel: string;
  married: string;
  childrenAges: string;
  howKnown: string;
}

interface FormData {
  // Cover
  clientName: string;
  spouseName: string;
  date: string;

  // Personal Info
  client: {
    name: string;
    postalAddress: string;
    residentialAddress: string;
    telWork: string;
    telMobile: string;
    email: string;
    countryOfBirth: string;
    dob: string;
    idNo: string;
    occupation: string;
    employer: string;
    employmentLength: string;
    maritalStatus: string;
  };
  spouse: {
    name: string;
    postalAddress: string;
    residentialAddress: string;
    telWork: string;
    telMobile: string;
    email: string;
    countryOfBirth: string;
    dob: string;
    idNo: string;
    occupation: string;
    employer: string;
    employmentLength: string;
    maritalStatus: string;
  };

  // Dependents
  dependents: Dependent[];

  // Goals
  goals: Goal[];
  workSituationChange: string;
  workSituationWhen: string;

  // Cash Flow
  income: CashFlowItem[];
  expenditure: CashFlowItem[];

  // Financial Position
  cashAssets: AssetLiabilityItem[];
  investedAssets: AssetLiabilityItem[];
  personalAssets: AssetLiabilityItem[];
  liabilities: AssetLiabilityItem[];
  financialNotes: string;

  // Insurance
  lifeInsurance: InsurancePolicy[];
  medicalInsurance: InsurancePolicy[];
  accidentCover: InsurancePolicy[];
  generalInsurance: InsurancePolicy[];
  doYouSmoke: string;
  beneficiaries: string;

  // Retirement & Education
  retirementAge: string;
  retirementActivities: string;
  retirementIncomeEstimate: string;
  retirementYears: string;
  retirementSavingsMade: string;
  retirementVehicles: string;
  collegeIntent: string;
  costAnalysisDone: string;
  educationSavingsMade: string;
  lumpSumInvestment: string;
  monthlyInvestment: string;
  preferredCurrency: string;

  // Risk Tolerance
  riskScore: number;
  riskAnswers: Record<string, string>;

  // Estate & Storage
  hasWill: string;
  discussedInheritance: string;
  hasGuardian: string;
  funeralPreferencesKnown: string;
  documentStorage: Record<string, string>;

  // Referrals
  referrals: Referral[];
  qualityOfInfo: string;
}

interface Client {
  id: string;
  empId: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  hireDate: string;
  photo: string;
  onboarding: string;
  trainingMail: string;
}

interface Recruit {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  experience: string;
  status: 'Applied' | 'Interviewing' | 'Offered' | 'Onboarded' | 'Rejected';
  appliedDate: string;
  source: string;
  notes: string;
}

interface AcademyContent {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'article' | 'course' | 'guide';
  duration: string;
  thumbnail: string;
  content: string;
}

const INITIAL_DATA: FormData = {
  clientName: '', spouseName: '', date: new Date().toISOString().split('T')[0],
  client: { name: '', postalAddress: '', residentialAddress: '', telWork: '', telMobile: '', email: '', countryOfBirth: '', dob: '', idNo: '', occupation: '', employer: '', employmentLength: '', maritalStatus: '' },
  spouse: { name: '', postalAddress: '', residentialAddress: '', telWork: '', telMobile: '', email: '', countryOfBirth: '', dob: '', idNo: '', occupation: '', employer: '', employmentLength: '', maritalStatus: '' },
  dependents: [],
  goals: [
    { id: 'edu', label: 'Planning for children education', timeframe: '' },
    { id: 'ret', label: 'Planning for Retirement', timeframe: '' },
    { id: 'aging', label: 'Providing support for an aging parent/relative', timeframe: '' },
    { id: 'estate', label: 'Planning for your estate', timeframe: '' },
    { id: 'home', label: 'Owning a home', timeframe: '' },
  ],
  workSituationChange: '', workSituationWhen: '',
  income: [
    { id: 'sal', label: 'Salaries (Gross)', monthly: '', annual: '' },
    { id: 'bon', label: 'Bonuses', monthly: '', annual: '' },
    { id: 'bus', label: 'Businesses', monthly: '', annual: '' },
    { id: 'rent', label: 'Rental Income', monthly: '', annual: '' },
    { id: 'other', label: 'Other Income (Allowances)', monthly: '', annual: '' },
  ],
  expenditure: [
    { id: 'tithe', label: 'Tithes/Gift/Charity', monthly: '', annual: '' },
    { id: 'pen', label: 'Pensions Contributions', monthly: '', annual: '' },
    { id: 'sav_l', label: 'Savings - Local', monthly: '', annual: '' },
    { id: 'sav_o', label: 'Savings - Offshore', monthly: '', annual: '' },
    { id: 'rent_m', label: 'Rent/Mortgage', monthly: '', annual: '' },
    { id: 'prop_r', label: 'Property Rent/Rates', monthly: '', annual: '' },
    { id: 'staff', label: 'Domestic staff', monthly: '', annual: '' },
    { id: 'food', label: 'Food/Groceries', monthly: '', annual: '' },
    { id: 'med', label: 'Medical expenses', monthly: '', annual: '' },
    { id: 'cloth', label: 'Clothing', monthly: '', annual: '' },
    { id: 'util', label: 'Utilities- elec, water, etc', monthly: '', annual: '' },
    { id: 'tel', label: 'Telephones', monthly: '', annual: '' },
    { id: 'fuel', label: 'Car-fuel', monthly: '', annual: '' },
    { id: 'serv', label: 'Car- Service/ repair', monthly: '', annual: '' },
    { id: 'edu_f', label: 'Education/ School fees', monthly: '', annual: '' },
    { id: 'ins_l', label: 'Life Insurance', monthly: '', annual: '' },
    { id: 'ins_m', label: 'Medical Insurance', monthly: '', annual: '' },
    { id: 'loan_c', label: 'Car loan(s)', monthly: '', annual: '' },
    { id: 'loan_p', label: 'Personal Loan(s)', monthly: '', annual: '' },
  ],
  cashAssets: [
    { id: 'inst', label: 'Institutions', value: '' },
    { id: 'curr', label: 'Current Accounts Bal', value: '' },
    { id: 'sav', label: 'Savings Account Bal', value: '' },
    { id: 'fixed', label: 'Fixed Deposits', value: '' },
    { id: 'life_c', label: 'Life Insurance cash value', value: '' },
    { id: 'coop', label: 'Co-op Savings', value: '' },
  ],
  investedAssets: [
    { id: 'stock', label: 'Stock market investments', value: '' },
    { id: 'treas', label: 'Treasury Bills/Bonds', value: '' },
    { id: 'unit', label: 'Unit trusts', value: '' },
    { id: 'off', label: 'Offshore Investments', value: '' },
    { id: 'bus_i', label: 'Business Interests', value: '' },
    { id: 'pen_b', label: 'Pension plan Balance', value: '' },
    { id: 'real', label: 'Real estate', value: '' },
    { id: 'land', label: 'Undeveloped land', value: '' },
  ],
  personalAssets: [
    { id: 'res', label: 'Residence', value: '' },
    { id: 'veh', label: 'Motor Vehicle', value: '' },
    { id: 'prop', label: 'Household Property', value: '' },
  ],
  liabilities: [
    { id: 'mort', label: 'Mortgage Loan Bal', value: '' },
    { id: 'bank', label: 'Bank Loan Bal', value: '' },
    { id: 'credit', label: 'Credit Card Bal', value: '' },
    { id: 'car_l', label: 'Car Loan', value: '' },
    { id: 'coop_l', label: 'Co-op Loan Bal', value: '' },
  ],
  financialNotes: '',
  lifeInsurance: [], medicalInsurance: [], accidentCover: [], generalInsurance: [],
  doYouSmoke: '', beneficiaries: '',
  retirementAge: '', retirementActivities: '', retirementIncomeEstimate: '', retirementYears: '', retirementSavingsMade: '', retirementVehicles: '',
  collegeIntent: '', costAnalysisDone: '', educationSavingsMade: '',
  lumpSumInvestment: '', monthlyInvestment: '', preferredCurrency: '',
  riskScore: 0, riskAnswers: {},
  hasWill: '', discussedInheritance: '', hasGuardian: '', funeralPreferencesKnown: '',
  documentStorage: {},
  referrals: [], qualityOfInfo: ''
};

const INITIAL_CLIENTS: Client[] = [
  { id: '1005', empId: 'EMP1005', fullName: 'Homi Shaw', email: 'test@test.com', phone: '(111) 222 3333', role: 'Sales Executive', hireDate: '1/2/2022', photo: 'https://picsum.photos/seed/m8/200', onboarding: '', trainingMail: '' },
  { id: '1010', empId: 'EMP1010', fullName: 'Francine Liew', email: 'test2@test.com', phone: '(111) 222 1111', role: 'Sales Support', hireDate: '1/7/2022', photo: 'https://picsum.photos/seed/staff20/200', onboarding: '', trainingMail: '' },
  { id: '1011', empId: 'EMP1011', fullName: 'Timothy Porter', email: 'test3@test.com', phone: '(111) 222 2222', role: 'Cashier', hireDate: '1/8/2022', photo: 'https://picsum.photos/seed/m4/200', onboarding: '', trainingMail: '' },
  { id: '1013', empId: 'EMP1013', fullName: 'Tony Smith', email: 'test4@test.com', phone: '(111) 222 0000', role: 'Security Guard', hireDate: '1/10/2022', photo: 'https://picsum.photos/seed/img3/200', onboarding: '', trainingMail: '' },
  { id: '1016', empId: 'EMP1016', fullName: 'Maya Glow', email: 'test5@test.com', phone: '(111) 222 4444', role: 'Customer Specialist', hireDate: '1/11/2022', photo: 'https://picsum.photos/seed/staff25/200', onboarding: '', trainingMail: '' },
  { id: '1017', empId: 'EMP1017', fullName: 'Elinor Lee', email: 'Elinor@xyz.com', phone: '(111) 222 5555', role: 'Cashier', hireDate: '6/8/2022', photo: 'https://picsum.photos/seed/staff15/200', onboarding: 'Yes', trainingMail: '' },
  { id: '1018', empId: 'EMP1018', fullName: 'Hannah Molly', email: 'test6@test.com', phone: '(111) 222 6666', role: 'Cashier', hireDate: '8/5/2022', photo: 'https://picsum.photos/seed/img2/200', onboarding: '', trainingMail: '' },
];

const INITIAL_RECRUITS: Recruit[] = [
  { id: '1', fullName: 'James Wilson', email: 'james.w@example.com', phone: '+254 711 222 333', experience: '5 years', status: 'Interviewing', appliedDate: '2024-03-10', source: 'LinkedIn', notes: 'Strong background in wealth management.' },
  { id: '2', fullName: 'Sarah Mbeki', email: 'sarah.m@example.com', phone: '+254 722 333 444', experience: '3 years', status: 'Applied', appliedDate: '2024-03-15', source: 'Referral', notes: 'Highly recommended by current staff.' },
  { id: '3', fullName: 'Robert Chen', email: 'robert.c@example.com', phone: '+254 733 444 555', experience: '8 years', status: 'Offered', appliedDate: '2024-03-05', source: 'Indeed', notes: 'Expert in corporate financial planning.' },
];

const ACADEMY_CONTENT: AcademyContent[] = [
  { 
    id: '1', 
    title: 'Introduction to Financial Planning', 
    description: 'Learn the process of successfully meeting financial needs through proper management of finances.', 
    type: 'guide', 
    duration: '45 mins', 
    thumbnail: 'https://picsum.photos/seed/finance1/400/225', 
    content: 'Financial planning is your roadmap to Financial Health & Sustainable Wealth creation. It is the process of successfully meeting financial needs of life through the proper management of finances. Regardless of the level of your income or assets, you need financial planning. Myth: Only rich people need financial planning.' 
  },
  { 
    id: '2', 
    title: 'The Financial Planning Process', 
    description: 'A step-by-step guide to creating and implementing your financial action plan.', 
    type: 'guide', 
    duration: '60 mins', 
    thumbnail: 'https://picsum.photos/seed/process/400/225', 
    content: 'Steps in Personal Financial Planning Process: 1. Determine current financial situation. 2. Develop Financial Goals. 3. Identify alternative courses of action. 4. Evaluate Alternatives. 5. Create and implement a financial action plan. 6. Evaluate, monitor and revise financial plan.' 
  },
  { 
    id: '3', 
    title: 'Asset Allocation Strategies', 
    description: 'Why 94% of your portfolio return depends on asset allocation only.', 
    type: 'video', 
    duration: '15 mins', 
    thumbnail: 'https://picsum.photos/seed/allocation/400/225', 
    content: 'Asset allocation is investing a predefined percentage of your savings in different Asset classes. Diversification is key: Never put all your eggs in one basket. Different asset classes give better return for specific time duration. Asset classes include: Gold, Debt, Equity, Real Estate, Commodities, Insurance, and Art.' 
  },
  { 
    id: '4', 
    title: 'Risk Profiling & Management', 
    description: 'Understanding your financial capacity and mental temperament for risk.', 
    type: 'article', 
    duration: '12 mins', 
    thumbnail: 'https://picsum.photos/seed/risk/400/225', 
    content: 'There are two types of Risk in any investment: Risk of Purchasing power loss and Risk of Capital loss. There is a strong correlation between risk & reward. The aim of financial planning is to get maximum return with minimum risk. Risk profile includes Financial Capacity, Mental capacity (Temperament), and Technical Knowledge.' 
  },
  { 
    id: '5', 
    title: 'Insurance & Emergency Kits', 
    description: 'Protecting your current financial status with the right coverage.', 
    type: 'guide', 
    duration: '50 mins', 
    thumbnail: 'https://picsum.photos/seed/insurance/400/225', 
    content: 'Before planning new investment, it is very important to prepare an emergency kit to protect your current financial status. 3-6 months of total monthly expenses is the recommended emergency kitty size. Insurance is the first & vital step in any financial planning. Types of Risk: Personal Risks, Property Risks, Liability Risks.' 
  },
  { 
    id: '6', 
    title: 'Wealth Creation & Real Estate', 
    description: 'Building long-term wealth through capital appreciation assets.', 
    type: 'article', 
    duration: '10 mins', 
    thumbnail: 'https://picsum.photos/seed/realestate/400/225', 
    content: 'The investment which brings cash in your pocket is an Asset. The investment which takes out cash from your pocket is a Liability. Equity & Real Estate are best long term Wealth creators. Real Estate Advantages: One good investment can change your financial life. Real estate backed financial instruments like the Centum Real Estate Bond are now available.' 
  },
  { 
    id: '7', 
    title: 'The Magic of Compounding', 
    description: 'How regular, consistent investing leads to exponential growth.', 
    type: 'video', 
    duration: '8 mins', 
    thumbnail: 'https://picsum.photos/seed/compound/400/225', 
    content: 'Compound interest is interest earned on money that was previously earned as interest. This cycle leads to increasing interest and account balances at an increasing rate, sometimes known as exponential growth. When you get into a pattern of regular, consistent investing, the power of compounding interest can prove an effective growth strategy.' 
  },
  { 
    id: '8', 
    title: 'Retirement Planning Masterclass', 
    description: 'Achieving financial freedom and the longest holiday of your life.', 
    type: 'course', 
    duration: '90 mins', 
    thumbnail: 'https://picsum.photos/seed/retirement/400/225', 
    content: 'Retirement doesn\'t mean stoppage of work; it means freedom from compulsion to work for money – Financial freedom. It is also known as the longest holiday of your life. Retirement planning includes identifying sources of income, sizing up expenses, implementing a savings program, and managing assets and risk. Rule of thumb: By 67, have 10 times your salary saved.' 
  },
];

// --- Components ---

const Logo = () => (
  <div className="flex items-center space-x-1">
    <span className="text-2xl font-bold text-navy dark:text-white">Acuity</span>
    <div className="flex -space-x-2">
      <ChevronRight className="text-blue" size={28} strokeWidth={3} />
      <ChevronRight className="text-blue opacity-60" size={28} strokeWidth={3} />
    </div>
    <span className="ml-2 text-xs font-bold text-blue uppercase tracking-widest hidden sm:inline">Academy</span>
  </div>
);

const StepIndicator = ({ current, total }: { current: number; total: number }) => {
  return (
    <div className="flex items-center justify-center space-x-2 mb-8 overflow-x-auto pb-2">
      {Array.from({ length: total }).map((_, i) => (
        <div 
          key={i}
          className={`h-2 w-8 rounded-full transition-all duration-300 ${
            i <= current ? 'bg-blue' : 'bg-gray-200'
          } ${i === current ? 'w-12' : 'w-8'}`}
        />
      ))}
    </div>
  );
};

const SectionHeader = ({ icon: Icon, title, description }: { icon: any; title: string; description?: string }) => (
  <div className="mb-6">
    <div className="flex items-center space-x-3 mb-1">
      <div className="p-2 bg-blue/10 dark:bg-blue/20 rounded-lg text-blue">
        <Icon size={24} />
      </div>
      <h2 className="text-2xl font-bold text-navy dark:text-white">{title}</h2>
    </div>
    {description && <p className="text-gray-500 dark:text-gray-400 ml-12">{description}</p>}
  </div>
);

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, value, onChange, type = "text", placeholder = "" }) => (
  <div className="flex flex-col space-y-1">
    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
    <input 
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
    />
  </div>
);

interface TableInputProps {
  label: string;
  monthly: string | number;
  annual: string | number;
  onMonthlyChange: (v: string) => void;
  onAnnualChange: (v: string) => void;
}

const TableInput: React.FC<TableInputProps> = ({ label, monthly, annual, onMonthlyChange, onAnnualChange }) => (
  <div className="grid grid-cols-12 gap-4 items-center py-2 border-b border-gray-100 last:border-0">
    <div className="col-span-6 text-sm font-medium text-gray-700">{label}</div>
    <div className="col-span-3">
      <input 
        type="number"
        value={monthly}
        onChange={(e) => onMonthlyChange(e.target.value)}
        className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 outline-none"
        placeholder="Monthly"
      />
    </div>
    <div className="col-span-3">
      <input 
        type="number"
        value={annual}
        onChange={(e) => onAnnualChange(e.target.value)}
        className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 outline-none"
        placeholder="Annual"
      />
    </div>
  </div>
);

export default function App() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(INITIAL_DATA);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [view, setView] = useState<'questionnaire' | 'dashboard' | 'report'>('questionnaire');
  const [activeModule, setActiveModule] = useState<'planner' | 'clients' | 'academy' | 'recruitment' | 'system'>('planner');
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('acuity_theme') === 'dark');
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [recruits, setRecruits] = useState<Recruit[]>(INITIAL_RECRUITS);
  const [academyContent] = useState<AcademyContent[]>(ACADEMY_CONTENT);
  const [searchQuery, setSearchQuery] = useState('');

  const totalSteps = 11;

  // Theme effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('acuity_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('acuity_theme', 'light');
    }
  }, [isDarkMode]);

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
      
      if (currentUser) {
        // Load data from Firestore if it exists
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.formData) setFormData(data.formData);
          if (data.currentStep !== undefined) setStep(data.currentStep);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync progress to Firestore
  const syncToFirestore = async (data: FormData, currentStep: number) => {
    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'users', auth.currentUser.uid), {
          uid: auth.currentUser.uid,
          email: auth.currentUser.email,
          displayName: auth.currentUser.displayName,
          formData: data,
          currentStep: currentStep,
          updatedAt: serverTimestamp()
        }, { merge: true });
        setLastSaved(new Date().toLocaleTimeString());
      } catch (error) {
        console.error("Error syncing to Firestore", error);
      }
    }
  };

  // Auto-save progress
  useEffect(() => {
    if (isAuthReady) {
      localStorage.setItem('acuity_financial_planner_data', JSON.stringify(formData));
      localStorage.setItem('acuity_financial_planner_step', step.toString());
      if (user) {
        syncToFirestore(formData, step);
      }
    }
  }, [formData, step, user, isAuthReady]);

  const saveProgress = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    syncToFirestore(formData, step);
  };

  const handleGoogleSignIn = async () => {
    if (authLoading) return;
    setAuthLoading(true);
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error("Google Auth Error:", err);
      if (err.code === 'auth/popup-blocked') {
        setAuthError("Popup was blocked. Please allow popups for this site.");
      } else if (err.code === 'auth/cancelled-popup-request') {
        // Ignore, user just closed it or another one was opened
      } else {
        setAuthError(err.message);
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const nextStep = () => setStep(s => Math.min(s + 1, totalSteps - 1));
  const prevStep = () => setStep(s => Math.max(s - 1, 0));

  const updateField = (path: string, value: any) => {
    const keys = path.split('.');
    setFormData(prev => {
      const newData = { ...prev };
      let current: any = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const handleRiskAnswer = (qId: string, val: string) => {
    setFormData(prev => ({
      ...prev,
      riskAnswers: { ...prev.riskAnswers, [qId]: val }
    }));
  };

  const handleSubmit = () => {
    console.log('Final Questionnaire Data:', formData);
    setIsSubmitted(true);
    setView('dashboard');
  };

  // --- Dashboard Logic ---
  const calculateTotal = (items: (CashFlowItem | AssetLiabilityItem)[], field: 'monthly' | 'annual' | 'value') => {
    return items.reduce((acc, item) => acc + (Number(item[field]) || 0), 0);
  };

  const totalMonthlyIncome = calculateTotal(formData.income, 'monthly');
  const totalMonthlyExpense = calculateTotal(formData.expenditure, 'monthly');
  const monthlySurplus = totalMonthlyIncome - totalMonthlyExpense;

  const totalCashAssets = calculateTotal(formData.cashAssets, 'value');
  const totalInvestedAssets = calculateTotal(formData.investedAssets, 'value');
  const totalPersonalAssets = calculateTotal(formData.personalAssets, 'value');
  const totalLiabilities = calculateTotal(formData.liabilities, 'value');
  const netWorth = (totalCashAssets + totalInvestedAssets + totalPersonalAssets) - totalLiabilities;

  const assetData = [
    { name: 'Cash', value: totalCashAssets, color: '#3b82f6' },
    { name: 'Investments', value: totalInvestedAssets, color: '#10b981' },
    { name: 'Personal', value: totalPersonalAssets, color: '#6366f1' },
  ].filter(d => d.value > 0);

  const cashFlowData = [
    { name: 'Income', amount: totalMonthlyIncome },
    { name: 'Expenses', amount: totalMonthlyExpense },
  ];

  if (isSubmitted && view === 'dashboard') {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <Logo />
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setView('report')}
                className="flex items-center space-x-2 px-4 py-2 bg-blue text-white rounded-lg font-medium hover:bg-blue/90 transition-colors"
              >
                <FileBarChart size={18} />
                <span>View Full Report</span>
              </button>
              <button 
                onClick={() => { setIsSubmitted(false); setView('questionnaire'); setStep(0); }}
                className="text-gray-500 hover:text-gray-700 font-medium"
              >
                Edit Data
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-navy">Financial Dashboard</h1>
            <p className="text-gray-500">A snapshot of your current financial health based on your input.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <p className="text-sm font-medium text-gray-500 mb-1">Net Worth</p>
              <p className={`text-2xl font-bold ${netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${netWorth.toLocaleString()}
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <p className="text-sm font-medium text-gray-500 mb-1">Monthly Surplus</p>
              <p className={`text-2xl font-bold ${monthlySurplus >= 0 ? 'text-blue' : 'text-red-600'}`}>
                ${monthlySurplus.toLocaleString()}
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <p className="text-sm font-medium text-gray-500 mb-1">Total Assets</p>
              <p className="text-2xl font-bold text-navy">
                ${(totalCashAssets + totalInvestedAssets + totalPersonalAssets).toLocaleString()}
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <p className="text-sm font-medium text-gray-500 mb-1">Total Liabilities</p>
              <p className="text-2xl font-bold text-red-600">
                ${totalLiabilities.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold mb-6 flex items-center space-x-2">
                <TrendingUp size={20} className="text-blue" />
                <span>Monthly Cash Flow</span>
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cashFlowData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="amount" fill="#48A9D6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold mb-6 flex items-center space-x-2">
                <History size={20} className="text-green-600" />
                <span>Asset Allocation</span>
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={assetData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {assetData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (isSubmitted && view === 'report') {
    const pillars = [
      { 
        title: "01. Debt to Asset Ratio", 
        icon: History, 
        status: (totalLiabilities / (totalCashAssets + totalInvestedAssets + totalPersonalAssets)) < 1 ? "Healthy" : "Needs Attention",
        content: `Conventional wisdom dictates that this specific metric should empirically be below 1. You meet this metric ${ (totalLiabilities / (totalCashAssets + totalInvestedAssets + totalPersonalAssets)) < 1 ? 'satisfactorily' : 'with some concern' }. Your ratio is ${((totalLiabilities / (totalCashAssets + totalInvestedAssets + totalPersonalAssets)) || 0).toFixed(2)}.`
      },
      { 
        title: "02. Debt Repayment Ratio", 
        icon: DollarSign, 
        status: (totalMonthlyExpense / totalMonthlyIncome) < 0.3 ? "Excellent" : "Reason for Concern",
        content: `Allowances are made up to a level of about 30% of your income. In your case, the concern is that at about ${( (totalMonthlyExpense / totalMonthlyIncome) * 100 ).toFixed(0)}% we do have reason for concern.`
      },
      { 
        title: "03. Emergency Funds", 
        icon: AlertCircle, 
        status: totalCashAssets > (totalMonthlyExpense * 3) ? "Strong" : "Inadequate",
        content: `Typically 3-6 months is adequate and unfortunately cash and cash equivalents fall ${ totalCashAssets > (totalMonthlyExpense * 3) ? 'well within' : 'below' } this threshold. This needs to be addressed with a target of KES 3M over 2026.`
      },
      { 
        title: "04. General Savings", 
        icon: TrendingUp, 
        status: "Review Required",
        content: "The rule of thumb is that 10-30% of income should be directed to savings to contribute to emergency funds and investments."
      },
      { 
        title: "05. Life Cover", 
        icon: ShieldCheck, 
        status: formData.lifeInsurance.length > 0 ? "Properly Covered" : "Review Due",
        content: `Currently properly covered across employment and personal liability covers on all debts. This is reassuring for now but a review is due in 2026.`
      },
      { 
        title: "06. Medical Cover", 
        icon: Heart, 
        status: formData.medicalInsurance.length > 0 ? "Covered" : "Action Required",
        content: "Dancan's employer currently has this covered. No action is required at the moment, however we should be preparing for post-employment."
      },
      { 
        title: "07. General Insurance", 
        icon: Home, 
        status: formData.generalInsurance.length > 0 ? "Sufficient" : "Needs Review",
        content: "The current domestic cover is sufficient and the property in Nanyuki is covered by the bank."
      },
      { 
        title: "08. Retirement Planning", 
        icon: Briefcase, 
        status: totalInvestedAssets > 25000000 ? "Growing" : "Starting Phase",
        content: `At KES ${totalInvestedAssets.toLocaleString()} and growing, this nest egg is growing at acceptable levels and can be used in the future as annuity payments.`
      },
      { 
        title: "09. Education Planning", 
        icon: GraduationCap, 
        status: "Significant Expenditure",
        content: `This is not a current issue though it is a significant monthly expenditure at KES 80,000 per month (22% of all expenses) and a huge budgetary concern.`
      },
      { 
        title: "10. Estate & Investment Planning", 
        icon: Lock, 
        status: formData.hasWill === 'Yes' ? "Protected" : "Vulnerable",
        content: "Considering the current levels of net worth, a family trust will be a handy tool to hold assets and avoid inheritance tax as well as updating and execution of both living and final wills."
      }
    ];

    const investmentUniverse = [
      { name: "MONEY MARKET FUNDS", details: "Already have an Old Mutual Asset Managers MMF. Recommend opening Britam, Nabo or CIC. Initial Investment KES 1,500,000.", link: "https://www.britam.com/asset-management" },
      { name: "MANSA X", details: "Mansa-X is a Multi-Asset Strategy Fund that you already have exposure in. I recommend that you hold this position for now.", link: "https://standardinvestmentbank.com/mansax/" },
      { name: "NCBA GLOBAL EQUITIES", details: "Global equities exposure similar to Mansa X but with more transparency. Wait for entry level to drop form $10,000 to $1,000 in 2026.", link: "https://ncbagroup.com/asset-management/" },
      { name: "DOMINION CAPITAL", details: "Offers secure principle protected offshore dollar based investments starting from $250 a month or $10,000 lumpsum.", link: "https://dominion-cs.com/" },
      { name: "VUKA", details: "Vuka is a CMA licensed REIT (Real Estate Investment Trust) underlying assets are the Qwetu hostels target return is 12% p.a.", link: "https://vuka.co.ke/" },
      { name: "BRITAM FAMILY TRUST", details: "Estate planning mechanism made easy by Britam Trust services. Can hold any assets in trust on behalf of loved ones.", link: "https://www.britam.com/trust-services" },
    ];

    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 print:hidden">
          <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
            <Logo />
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setView('dashboard')}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </button>
              <button 
                onClick={() => window.print()}
                className="flex items-center space-x-2 px-4 py-2 bg-blue text-white rounded-lg font-medium hover:bg-blue/90 transition-colors"
              >
                <Download size={18} />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-black text-navy mb-4 uppercase tracking-tight">Financial Plan 2026</h1>
            <p className="text-xl text-gray-500">Prepared for {formData.clientName} {formData.spouseName && `& ${formData.spouseName}`}</p>
            <div className="mt-8 p-4 border-y border-gray-200 inline-block">
              <p className="text-sm font-bold text-navy uppercase tracking-widest">Presented By: Alex Kadzitu</p>
              <p className="text-xs text-blue font-medium mt-1">www.acuity.co.ke</p>
            </div>
          </div>

          <div className="mb-16">
            <h2 className="text-2xl font-bold text-navy mb-8 border-b-2 border-blue pb-2">FINANCIAL HEALTH CHECKLIST</h2>
            <div className="space-y-6">
              {pillars.map((pillar, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-start space-x-6"
                >
                  <div className="text-4xl font-black text-blue/20 w-12 flex-shrink-0">{(idx + 1).toString().padStart(2, '0')}</div>
                  <div className="flex-grow">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-navy uppercase">{pillar.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        pillar.status === 'Healthy' || pillar.status === 'Strong' || pillar.status === 'Excellent' || pillar.status === 'Properly Covered' || pillar.status === 'Covered' || pillar.status === 'Sufficient' || pillar.status === 'Protected'
                        ? 'bg-green-100 text-green-700' 
                        : pillar.status === 'Review Required' || pillar.status === 'Needs Attention' || pillar.status === 'Needs Review' || pillar.status === 'Reason for Concern' || pillar.status === 'Significant Expenditure'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                      }`}>
                        {pillar.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {pillar.content}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mb-16">
            <h2 className="text-2xl font-bold text-navy mb-8 border-b-2 border-blue pb-2 uppercase tracking-tight">Debt Restructure Strategy</h2>
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-navy text-white text-[10px] uppercase tracking-widest">
                    <th className="px-6 py-4 font-bold">Institution / Liability</th>
                    <th className="px-6 py-4 font-bold text-right">Current Monthly Repayment</th>
                    <th className="px-6 py-4 font-bold text-right">Target Monthly Repayment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {formData.liabilities.filter(l => Number(l.value) > 0).map((liab, idx) => {
                    const current = Number(liab.value) * 0.02;
                    const target = Number(liab.value) * 0.012;
                    return (
                      <tr key={idx} className="text-sm">
                        <td className="px-6 py-4 font-medium text-navy">{liab.label}</td>
                        <td className="px-6 py-4 text-right text-gray-600">KES {current.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right text-blue font-bold">KES {target.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                  <tr className="bg-gray-50 font-bold text-navy">
                    <td className="px-6 py-4">TOTAL REPAYMENTS</td>
                    <td className="px-6 py-4 text-right">
                      KES {formData.liabilities.reduce((acc, l) => acc + (Number(l.value) * 0.02), 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right text-blue">
                      KES {formData.liabilities.reduce((acc, l) => acc + (Number(l.value) * 0.012), 0).toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="p-6 bg-blue/5 border-t border-gray-100">
                <p className="text-xs text-gray-600 leading-relaxed italic">
                  * Our target strategy aims for a 40% reduction in monthly debt obligations through restructuring, consolidation, or negotiation. This frees up significant cash flow for emergency funds and long-term investments.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-16">
            <h2 className="text-2xl font-bold text-navy mb-8 border-b-2 border-blue pb-2">INVESTMENT UNIVERSE SUMMARIES</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {investmentUniverse.map((item, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-200 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-black text-blue mb-2">{item.name}</h3>
                    <p className="text-xs text-gray-600 leading-relaxed mb-4">{item.details}</p>
                  </div>
                  <a 
                    href={item.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-auto inline-flex items-center justify-center px-4 py-2 bg-navy text-white text-xs font-bold rounded-lg hover:bg-navy/90 transition-colors"
                  >
                    Apply Now
                  </a>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-16 p-8 bg-navy text-white rounded-3xl text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue/20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue/20 rounded-full -ml-16 -mb-16 blur-3xl"></div>
            <h3 className="text-2xl font-bold mb-4">Next Steps</h3>
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
              This report provides a high-level overview. We recommend a detailed consultation to dive deeper into each pillar and refine your strategy.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="px-8 py-3 bg-blue text-white font-bold rounded-xl hover:bg-blue/90 transition-colors shadow-lg shadow-blue/20">
                Schedule Consultation
              </button>
              {!user && (
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="px-8 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors border border-white/20"
                >
                  Create Account
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans selection:bg-blue/10">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="h-16 flex items-center justify-between">
            <Logo />
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {[
                { id: 'planner', label: 'Planner', icon: Target },
                { id: 'clients', label: 'Clients', icon: Users },
                { id: 'recruitment', label: 'Recruitment', icon: Briefcase },
                { id: 'academy', label: 'Academy', icon: GraduationCap },
                { id: 'system', label: 'System', icon: Settings },
              ].filter(item => (item.id !== 'clients' && item.id !== 'recruitment' && item.id !== 'system') || (user && user.email === 'akadzitu@gmail.com')).map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveModule(item.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    activeModule === item.id 
                      ? 'bg-blue text-white shadow-lg shadow-blue/20' 
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 text-gray-400 hover:text-blue dark:hover:text-blue transition-colors rounded-lg bg-gray-100 dark:bg-gray-800"
                title="Toggle Dark Mode"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              
              {activeModule === 'planner' && (
                <div className="hidden sm:flex items-center space-x-2">
                  <button 
                    onClick={() => {
                      if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
                        localStorage.removeItem('acuity_financial_planner_data');
                        localStorage.removeItem('acuity_financial_planner_step');
                        setFormData(INITIAL_DATA);
                        setStep(0);
                        setLastSaved(null);
                      }
                    }}
                    className="text-gray-400 hover:text-red-500 transition-colors p-2"
                    title="Reset Progress"
                  >
                    <RefreshCw size={16} />
                  </button>
                  <button 
                    onClick={saveProgress}
                    className="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Save size={16} />
                    <span className="hidden lg:inline">{user ? `Saved` : 'Save'}</span>
                  </button>
                </div>
              )}
              
              {user && (
                <div className="flex items-center space-x-2 pl-2 border-l border-gray-200 dark:border-gray-700">
                  <div className="w-8 h-8 bg-blue text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {user.email?.[0].toUpperCase() || 'U'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeModule === 'planner' && (
          <>
            <StepIndicator current={step} total={totalSteps} />
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="p-6 md:p-10"
                >
                  {/* Step 0: Real Sign-Up / Login */}
                  {step === 0 && (
                    <div className="space-y-8 py-10">
                      <div className="text-center mb-12">
                        <Logo />
                        <h1 className="text-4xl font-black text-navy dark:text-white mt-6 mb-4 uppercase tracking-tight">Welcome to Acuity Consulting</h1>
                        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
                          To begin your comprehensive financial plan and ensure your progress is saved, please sign up or log in.
                        </p>
                      </div>
                      
                      <div className="max-w-md mx-auto space-y-6">
                        {user ? (
                          <div className="bg-green-50 dark:bg-green-900/20 p-8 rounded-3xl border border-green-100 dark:border-green-900/30 text-center">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                              <CheckCircle size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-navy dark:text-white mb-2">Logged in as {user.email || user.phoneNumber || 'Guest'}</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">You're all set to continue your financial plan.</p>
                            <button 
                              onClick={nextStep}
                              className="w-full py-4 bg-blue text-white font-bold rounded-2xl hover:bg-blue/90 transition-all shadow-lg shadow-blue/20 flex items-center justify-center space-x-2"
                            >
                              <span>Continue to Questionnaire</span>
                              <ChevronRight size={20} />
                            </button>
                            <button 
                              onClick={() => signOut(auth)}
                              className="mt-4 text-sm text-gray-400 hover:text-red-500 font-medium transition-colors"
                            >
                              Sign Out
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {authError && (
                              <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-2xl border border-red-100 dark:border-red-900/30 flex items-center space-x-2">
                                <AlertCircle size={18} />
                                <span>{authError}</span>
                              </div>
                            )}
                            <button 
                              onClick={handleGoogleSignIn}
                              disabled={authLoading}
                              className="w-full py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-navy dark:text-white font-bold rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center space-x-3 shadow-sm disabled:opacity-50"
                            >
                              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                              <span>{authLoading ? 'Connecting...' : 'Continue with Google'}</span>
                            </button>
                            
                            <div className="relative py-4">
                              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100 dark:border-gray-800"></div></div>
                              <div className="relative flex justify-center text-xs uppercase tracking-widest text-gray-400"><span className="bg-white dark:bg-gray-900 px-4">Or use email</span></div>
                            </div>
                            
                            <div className="space-y-3">
                              <InputField label="Email Address" value={formData.client.email} onChange={(v) => updateField('client.email', v)} type="email" placeholder="you@example.com" />
                              <button 
                                onClick={() => setShowAuthModal(true)}
                                className="w-full py-4 bg-navy dark:bg-blue text-white font-bold rounded-2xl hover:bg-navy/90 dark:hover:bg-blue/90 transition-all shadow-lg shadow-navy/20 dark:shadow-blue/20"
                              >
                                Sign Up / Login with Email
                              </button>
                            </div>
                            
                            <button 
                              onClick={nextStep}
                              className="w-full py-3 text-gray-400 font-medium hover:text-navy dark:hover:text-white transition-colors text-sm"
                            >
                              Continue as Guest (Progress won't be synced)
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

              {/* Step 1: Cover */}
              {step === 1 && (
                <div className="space-y-8">
                  <div className="text-center mb-12">
                    <Logo />
                    <h1 className="text-4xl font-black text-navy dark:text-white mt-6 mb-4 uppercase tracking-tight">Financial Planning Questionnaire</h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
                      Please complete the following information as completely and accurately as you can to help us build your comprehensive financial plan.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Client Name" value={formData.clientName} onChange={(v) => updateField('clientName', v)} placeholder="Primary Client" />
                    <InputField label="Client/Spouse Name" value={formData.spouseName} onChange={(v) => updateField('spouseName', v)} placeholder="Partner/Spouse" />
                    <InputField label="Date" value={formData.date} onChange={(v) => updateField('date', v)} type="date" />
                  </div>
                  <div className="bg-blue/5 dark:bg-blue/10 p-6 rounded-xl border border-blue/10 dark:border-blue/20 flex items-start space-x-4">
                    <AlertCircle className="text-blue mt-1 flex-shrink-0" size={20} />
                    <p className="text-sm text-blue dark:text-blue-300 leading-relaxed">
                      All information provided is treated with the strictest confidence. Your data is used solely for the purpose of providing professional financial advice.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 2: Personal Info */}
              {step === 2 && (
                <div className="space-y-10">
                  <SectionHeader icon={User} title="Personal Information" description="Details for both Client and Spouse" />
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Client Column */}
                    <div className="space-y-4">
                      <h3 className="font-bold text-blue-600 uppercase tracking-wider text-xs">Primary Client</h3>
                      <InputField label="Full Name" value={formData.client.name} onChange={(v) => updateField('client.name', v)} />
                      <InputField label="Postal Address" value={formData.client.postalAddress} onChange={(v) => updateField('client.postalAddress', v)} />
                      <InputField label="Residential Address" value={formData.client.residentialAddress} onChange={(v) => updateField('client.residentialAddress', v)} />
                      <div className="grid grid-cols-2 gap-4">
                        <InputField label="Tel: Work" value={formData.client.telWork} onChange={(v) => updateField('client.telWork', v)} />
                        <InputField label="Tel: Mobile" value={formData.client.telMobile} onChange={(v) => updateField('client.telMobile', v)} />
                      </div>
                      <InputField label="Email" value={formData.client.email} onChange={(v) => updateField('client.email', v)} type="email" />
                      <div className="grid grid-cols-2 gap-4">
                        <InputField label="Country of Birth" value={formData.client.countryOfBirth} onChange={(v) => updateField('client.countryOfBirth', v)} />
                        <InputField label="Date of Birth" value={formData.client.dob} onChange={(v) => updateField('client.dob', v)} type="date" />
                      </div>
                      <InputField label="ID/Passport No." value={formData.client.idNo} onChange={(v) => updateField('client.idNo', v)} />
                      <InputField label="Occupation" value={formData.client.occupation} onChange={(v) => updateField('client.occupation', v)} />
                      <InputField label="Employer" value={formData.client.employer} onChange={(v) => updateField('client.employer', v)} />
                      <div className="grid grid-cols-2 gap-4">
                        <InputField label="Employment Length" value={formData.client.employmentLength} onChange={(v) => updateField('client.employmentLength', v)} />
                        <InputField label="Marital Status" value={formData.client.maritalStatus} onChange={(v) => updateField('client.maritalStatus', v)} />
                      </div>
                    </div>

                    {/* Spouse Column */}
                    <div className="space-y-4">
                      <h3 className="font-bold text-blue-600 uppercase tracking-wider text-xs">Spouse / Partner</h3>
                      <InputField label="Full Name" value={formData.spouse.name} onChange={(v) => updateField('spouse.name', v)} />
                      <InputField label="Postal Address" value={formData.spouse.postalAddress} onChange={(v) => updateField('spouse.postalAddress', v)} />
                      <InputField label="Residential Address" value={formData.spouse.residentialAddress} onChange={(v) => updateField('spouse.residentialAddress', v)} />
                      <div className="grid grid-cols-2 gap-4">
                        <InputField label="Tel: Work" value={formData.spouse.telWork} onChange={(v) => updateField('spouse.telWork', v)} />
                        <InputField label="Tel: Mobile" value={formData.spouse.telMobile} onChange={(v) => updateField('spouse.telMobile', v)} />
                      </div>
                      <InputField label="Email" value={formData.spouse.email} onChange={(v) => updateField('spouse.email', v)} type="email" />
                      <div className="grid grid-cols-2 gap-4">
                        <InputField label="Country of Birth" value={formData.spouse.countryOfBirth} onChange={(v) => updateField('spouse.countryOfBirth', v)} />
                        <InputField label="Date of Birth" value={formData.spouse.dob} onChange={(v) => updateField('spouse.dob', v)} type="date" />
                      </div>
                      <InputField label="ID/Passport No." value={formData.spouse.idNo} onChange={(v) => updateField('spouse.idNo', v)} />
                      <InputField label="Occupation" value={formData.spouse.occupation} onChange={(v) => updateField('spouse.occupation', v)} />
                      <InputField label="Employer" value={formData.spouse.employer} onChange={(v) => updateField('spouse.employer', v)} />
                      <div className="grid grid-cols-2 gap-4">
                        <InputField label="Employment Length" value={formData.spouse.employmentLength} onChange={(v) => updateField('spouse.employmentLength', v)} />
                        <InputField label="Marital Status" value={formData.spouse.maritalStatus} onChange={(v) => updateField('spouse.maritalStatus', v)} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Dependents & Goals */}
              {step === 3 && (
                <div className="space-y-10">
                  <div>
                    <SectionHeader icon={Users} title="Children & Dependents" description="Please provide names and birthdays for all children and dependents" />
                    <div className="space-y-4">
                      {formData.dependents.map((dep, idx) => (
                        <div key={dep.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                          <div className="md:col-span-2">
                            <InputField label="Child's Name" value={dep.name} onChange={(v) => {
                              const newDeps = [...formData.dependents];
                              newDeps[idx].name = v;
                              updateField('dependents', newDeps);
                            }} />
                          </div>
                          <div>
                            <InputField label="Birthday" value={dep.dob} type="date" onChange={(v) => {
                              const newDeps = [...formData.dependents];
                              newDeps[idx].dob = v;
                              updateField('dependents', newDeps);
                            }} />
                          </div>
                          <div>
                            <InputField label="Current School" value={dep.currentSchool} onChange={(v) => {
                              const newDeps = [...formData.dependents];
                              newDeps[idx].currentSchool = v;
                              updateField('dependents', newDeps);
                            }} />
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex-grow">
                              <InputField label="Future School" value={dep.futureSchool} onChange={(v) => {
                                const newDeps = [...formData.dependents];
                                newDeps[idx].futureSchool = v;
                                updateField('dependents', newDeps);
                              }} />
                            </div>
                            <button 
                              onClick={() => updateField('dependents', formData.dependents.filter((_, i) => i !== idx))}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </div>
                      ))}
                      <button 
                        onClick={() => updateField('dependents', [...formData.dependents, { id: Math.random().toString(), name: '', dob: '', currentSchool: '', futureSchool: '' }])}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors"
                      >
                        <Plus size={20} />
                        <span>Add Dependent</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <SectionHeader icon={Target} title="Family Summary & Goals" description="Timeframe for achieving your financial goals" />
                    <div className="space-y-2">
                      <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-gray-100 rounded-t-lg text-xs font-bold uppercase text-gray-500">
                        <div className="col-span-8">Goal</div>
                        <div className="col-span-4">Timeframe (Years)</div>
                      </div>
                      {formData.goals.map((goal, idx) => (
                        <div key={goal.id} className="grid grid-cols-12 gap-4 items-center p-4 border-b border-gray-100 last:border-0">
                          <div className="col-span-8 text-sm font-medium text-gray-700">{goal.label}</div>
                          <div className="col-span-4">
                            <select 
                              value={goal.timeframe}
                              onChange={(e) => {
                                const newGoals = [...formData.goals];
                                newGoals[idx].timeframe = e.target.value;
                                updateField('goals', newGoals);
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                            >
                              <option value="">Select Timeframe</option>
                              <option value="1">Within 1 year</option>
                              <option value="5">5 - 10 years</option>
                              <option value="10">More than 10 years</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 bg-yellow-50 rounded-xl border border-yellow-100 space-y-4">
                    <h4 className="font-bold text-yellow-800 flex items-center space-x-2">
                      <Briefcase size={20} />
                      <span>Work Situation</span>
                    </h4>
                    <InputField 
                      label="Do you anticipate any changes in your current work/employment situation?" 
                      value={formData.workSituationChange} 
                      onChange={(v) => updateField('workSituationChange', v)} 
                      placeholder="e.g. Retirement, Promotion, Business venture..."
                    />
                    <InputField 
                      label="When?" 
                      value={formData.workSituationWhen} 
                      onChange={(v) => updateField('workSituationWhen', v)} 
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Cash Flow */}
              {step === 4 && (
                <div className="space-y-10">
                  <div>
                    <SectionHeader icon={DollarSign} title="Cash Flow Analysis" description="Monthly and Annual Income" />
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                      <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-blue-600 text-white text-xs font-bold uppercase">
                        <div className="col-span-6">Income Source</div>
                        <div className="col-span-3">Monthly</div>
                        <div className="col-span-3">Annual</div>
                      </div>
                      <div className="p-2 space-y-1">
                        {formData.income.map((item, idx) => (
                          <TableInput 
                            key={item.id}
                            label={item.label}
                            monthly={item.monthly}
                            annual={item.annual}
                            onMonthlyChange={(v) => {
                              const newIncome = [...formData.income];
                              newIncome[idx].monthly = v;
                              newIncome[idx].annual = v ? Number(v) * 12 : '';
                              updateField('income', newIncome);
                            }}
                            onAnnualChange={(v) => {
                              const newIncome = [...formData.income];
                              newIncome[idx].annual = v;
                              updateField('income', newIncome);
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <SectionHeader icon={TrendingUp} title="Expenditure" description="Monthly and Annual Expenses" />
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                      <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-red-600 text-white text-xs font-bold uppercase">
                        <div className="col-span-6">Expense Category</div>
                        <div className="col-span-3">Monthly</div>
                        <div className="col-span-3">Annual</div>
                      </div>
                      <div className="p-2 space-y-1 max-h-[400px] overflow-y-auto">
                        {formData.expenditure.map((item, idx) => (
                          <TableInput 
                            key={item.id}
                            label={item.label}
                            monthly={item.monthly}
                            annual={item.annual}
                            onMonthlyChange={(v) => {
                              const newExp = [...formData.expenditure];
                              newExp[idx].monthly = v;
                              newExp[idx].annual = v ? Number(v) * 12 : '';
                              updateField('expenditure', newExp);
                            }}
                            onAnnualChange={(v) => {
                              const newExp = [...formData.expenditure];
                              newExp[idx].annual = v;
                              updateField('expenditure', newExp);
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Financial Position */}
              {step === 5 && (
                <div className="space-y-10">
                  <SectionHeader icon={History} title="Statement of Financial Position" description="Assets and Liabilities" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Assets */}
                    <div className="space-y-6">
                      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                        <div className="px-4 py-3 bg-green-600 text-white text-sm font-bold uppercase">Cash & Equivalents</div>
                        <div className="p-4 space-y-3">
                          {formData.cashAssets.map((item, idx) => (
                            <div key={item.id} className="flex flex-col space-y-1">
                              <label className="text-xs font-medium text-gray-500">{item.label}</label>
                              <input 
                                type="number" 
                                value={item.value} 
                                onChange={(e) => {
                                  const newAssets = [...formData.cashAssets];
                                  newAssets[idx].value = e.target.value;
                                  updateField('cashAssets', newAssets);
                                }}
                                className="px-3 py-1.5 border border-gray-200 rounded focus:ring-1 focus:ring-green-500 outline-none text-sm"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                        <div className="px-4 py-3 bg-green-700 text-white text-sm font-bold uppercase">Invested Assets</div>
                        <div className="p-4 space-y-3">
                          {formData.investedAssets.map((item, idx) => (
                            <div key={item.id} className="flex flex-col space-y-1">
                              <label className="text-xs font-medium text-gray-500">{item.label}</label>
                              <input 
                                type="number" 
                                value={item.value} 
                                onChange={(e) => {
                                  const newAssets = [...formData.investedAssets];
                                  newAssets[idx].value = e.target.value;
                                  updateField('investedAssets', newAssets);
                                }}
                                className="px-3 py-1.5 border border-gray-200 rounded focus:ring-1 focus:ring-green-500 outline-none text-sm"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Liabilities */}
                    <div className="space-y-6">
                      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                        <div className="px-4 py-3 bg-red-700 text-white text-sm font-bold uppercase">Liabilities</div>
                        <div className="p-4 space-y-3">
                          {formData.liabilities.map((item, idx) => (
                            <div key={item.id} className="flex flex-col space-y-1">
                              <label className="text-xs font-medium text-gray-500">{item.label}</label>
                              <input 
                                type="number" 
                                value={item.value} 
                                onChange={(e) => {
                                  const newLiab = [...formData.liabilities];
                                  newLiab[idx].value = e.target.value;
                                  updateField('liabilities', newLiab);
                                }}
                                className="px-3 py-1.5 border border-gray-200 rounded focus:ring-1 focus:ring-red-500 outline-none text-sm"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                        <div className="px-4 py-3 bg-blue-700 text-white text-sm font-bold uppercase">Personal Use Assets</div>
                        <div className="p-4 space-y-3">
                          {formData.personalAssets.map((item, idx) => (
                            <div key={item.id} className="flex flex-col space-y-1">
                              <label className="text-xs font-medium text-gray-500">{item.label}</label>
                              <input 
                                type="number" 
                                value={item.value} 
                                onChange={(e) => {
                                  const newAssets = [...formData.personalAssets];
                                  newAssets[idx].value = e.target.value;
                                  updateField('personalAssets', newAssets);
                                }}
                                className="px-3 py-1.5 border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes / Comments</label>
                    <textarea 
                      value={formData.financialNotes}
                      onChange={(e) => updateField('financialNotes', e.target.value)}
                      className="w-full h-32 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                      placeholder="Any additional details regarding your financial position..."
                    />
                  </div>
                </div>
              )}

              {/* Step 6: Insurance */}
              {step === 6 && (
                <div className="space-y-10">
                  <SectionHeader icon={ShieldCheck} title="Insurance Coverage Review" description="Details of your current insurance policies" />
                  
                  {['Life Insurance', 'Medical Insurance', 'Personal Accident Cover', 'General Insurance'].map((type) => {
                    const field = type === 'Life Insurance' ? 'lifeInsurance' : 
                                  type === 'Medical Insurance' ? 'medicalInsurance' :
                                  type === 'Personal Accident Cover' ? 'accidentCover' : 'generalInsurance';
                    const policies = (formData as any)[field] as InsurancePolicy[];

                    return (
                      <div key={type} className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-gray-800">{type}</h3>
                          <button 
                            onClick={() => updateField(field, [...policies, { id: Math.random().toString(), policyType: '', company: '', sumAssured: '', premium: '', frequency: '', paidBy: '', maturityDate: '' }])}
                            className="text-sm text-blue-600 font-medium hover:underline flex items-center space-x-1"
                          >
                            <Plus size={16} />
                            <span>Add Policy</span>
                          </button>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left border-collapse">
                            <thead>
                              <tr className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold">
                                <th className="p-3 border">Type/Company</th>
                                <th className="p-3 border">Sum Assured</th>
                                <th className="p-3 border">Premium</th>
                                <th className="p-3 border">Frequency</th>
                                <th className="p-3 border">Paid By</th>
                                <th className="p-3 border">Maturity</th>
                                <th className="p-3 border w-10"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {policies.map((p, idx) => (
                                <tr key={p.id}>
                                  <td className="p-2 border">
                                    <input value={p.company} onChange={(e) => {
                                      const newP = [...policies]; newP[idx].company = e.target.value; updateField(field, newP);
                                    }} className="w-full outline-none bg-transparent" placeholder="Company" />
                                  </td>
                                  <td className="p-2 border">
                                    <input value={p.sumAssured} onChange={(e) => {
                                      const newP = [...policies]; newP[idx].sumAssured = e.target.value; updateField(field, newP);
                                    }} className="w-full outline-none bg-transparent" placeholder="Amount" />
                                  </td>
                                  <td className="p-2 border">
                                    <input value={p.premium} onChange={(e) => {
                                      const newP = [...policies]; newP[idx].premium = e.target.value; updateField(field, newP);
                                    }} className="w-full outline-none bg-transparent" placeholder="Premium" />
                                  </td>
                                  <td className="p-2 border">
                                    <input value={p.frequency} onChange={(e) => {
                                      const newP = [...policies]; newP[idx].frequency = e.target.value; updateField(field, newP);
                                    }} className="w-full outline-none bg-transparent" placeholder="Monthly/Annual" />
                                  </td>
                                  <td className="p-2 border">
                                    <input value={p.paidBy} onChange={(e) => {
                                      const newP = [...policies]; newP[idx].paidBy = e.target.value; updateField(field, newP);
                                    }} className="w-full outline-none bg-transparent" placeholder="Self/Employer" />
                                  </td>
                                  <td className="p-2 border">
                                    <input type="date" value={p.maturityDate} onChange={(e) => {
                                      const newP = [...policies]; newP[idx].maturityDate = e.target.value; updateField(field, newP);
                                    }} className="w-full outline-none bg-transparent" />
                                  </td>
                                  <td className="p-2 border text-center">
                                    <button onClick={() => updateField(field, policies.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600">
                                      <Trash2 size={16} />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                              {policies.length === 0 && (
                                <tr>
                                  <td colSpan={7} className="p-4 text-center text-gray-400 italic">No policies added</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-blue-800">Do you Smoke?</label>
                      <div className="flex space-x-4">
                        {['Yes', 'No'].map(opt => (
                          <label key={opt} className="flex items-center space-x-2 cursor-pointer">
                            <input type="radio" name="smoke" value={opt} checked={formData.doYouSmoke === opt} onChange={(e) => updateField('doYouSmoke', e.target.value)} className="text-blue-600" />
                            <span className="text-sm font-medium">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <InputField label="Beneficiaries (Company Sponsored)" value={formData.beneficiaries} onChange={(v) => updateField('beneficiaries', v)} placeholder="Who are the beneficiaries?" />
                  </div>
                </div>
              )}

              {/* Step 7: Retirement & Education */}
              {step === 7 && (
                <div className="space-y-12">
                  <div>
                    <SectionHeader icon={Home} title="Retirement Planning" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputField label="At what age do you plan to retire?" value={formData.retirementAge} onChange={(v) => updateField('retirementAge', v)} />
                      <InputField label="How many years do you anticipate living in retirement?" value={formData.retirementYears} onChange={(v) => updateField('retirementYears', v)} />
                      <div className="md:col-span-2">
                        <InputField label="What would you like to do in retirement?" value={formData.retirementActivities} onChange={(v) => updateField('retirementActivities', v)} />
                      </div>
                      <InputField label="Estimated income required in retirement?" value={formData.retirementIncomeEstimate} onChange={(v) => updateField('retirementIncomeEstimate', v)} />
                      <InputField label="Savings already made towards retirement?" value={formData.retirementSavingsMade} onChange={(v) => updateField('retirementSavingsMade', v)} />
                      <div className="md:col-span-2">
                        <InputField label="What savings vehicles are available through your employer?" value={formData.retirementVehicles} onChange={(v) => updateField('retirementVehicles', v)} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <SectionHeader icon={GraduationCap} title="Education Planning" />
                    <div className="space-y-6">
                      <InputField label="Where do you intend to send your children to college?" value={formData.collegeIntent} onChange={(v) => updateField('collegeIntent', v)} />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Have you completed an education cost needs analysis?</label>
                          <div className="flex space-x-4">
                            {['Yes', 'No'].map(opt => (
                              <label key={opt} className="flex items-center space-x-2 cursor-pointer">
                                <input type="radio" name="costAnalysis" value={opt} checked={formData.costAnalysisDone === opt} onChange={(e) => updateField('costAnalysisDone', e.target.value)} />
                                <span className="text-sm">{opt}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <InputField label="Savings already made for children's education?" value={formData.educationSavingsMade} onChange={(v) => updateField('educationSavingsMade', v)} />
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                    <h4 className="font-bold text-gray-800 mb-4">Financial Commitment</h4>
                    <p className="text-sm text-gray-500 mb-6">Bearing in mind your present income and monthly commitments, how much money are you prepared to set aside now to achieve your financial goals?</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <InputField label="Lump Sum" value={formData.lumpSumInvestment} onChange={(v) => updateField('lumpSumInvestment', v)} />
                      <InputField label="Monthly" value={formData.monthlyInvestment} onChange={(v) => updateField('monthlyInvestment', v)} />
                      <InputField label="Preferred Currency" value={formData.preferredCurrency} onChange={(v) => updateField('preferredCurrency', v)} placeholder="e.g. USD, EUR, GBP" />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 8: Risk Tolerance */}
              {step === 8 && (
                <div className="space-y-10">
                  <SectionHeader icon={AlertCircle} title="Investment Risk Tolerance" description="Help us understand your attitude towards investment risk" />
                  
                  <div className="space-y-8">
                    {[
                      {
                        id: 'q1',
                        text: '1. How would you describe your knowledge of investments?',
                        options: ['No understanding/ Knowledge', 'Very little understanding', 'About as much understanding as the next person', 'A fair degree of understanding', 'A high degree of understanding']
                      },
                      {
                        id: 'q2',
                        text: '2. If your investments dropped in value by 20%, how would you react?',
                        options: ['Sell all of the remaining investments', 'Sell a proportion of the remaining investments', 'Hold the investments and sell nothing', 'Buy more of the same investments']
                      },
                      {
                        id: 'q3',
                        text: '3. What are your main savings and investment goals?',
                        options: ['Immediate income', 'Goals in 5-7 years', 'Goals in 8-10 years', 'Longer term growth (over 10 years)']
                      },
                      {
                        id: 'q4',
                        text: '4. How would you compare yourself to others in your willingness to take financial risks?',
                        options: ['Much less willing than average', 'Slightly less willing than average', 'No more or less willing than average', 'Slightly more willing than average', 'Much more willing than average']
                      },
                      {
                        id: 'q5',
                        text: '5. When you make a significant financial decision how do you normally feel afterwards?',
                        options: ['Very concerned', 'Slightly concerned', 'A little uneasy', 'Confident', 'Very confident']
                      },
                      {
                        id: 'q6',
                        text: '6. If you had to choose one of the investments below, which would it be?',
                        options: [
                          'Investment A: 0% to 3% returns (Stable)',
                          'Investment B: -1% to 7% returns (Low Volatility)',
                          'Investment C: -3% to 11% returns (Moderate)',
                          'Investment D: -4% to 13% returns (Growth)',
                          'Investment E: -4% to 13% returns (High Volatility)',
                          'Investment F: -5% to 15% returns (Aggressive)'
                        ]
                      }
                    ].map((q) => (
                      <div key={q.id} className="space-y-3">
                        <p className="font-bold text-gray-800">{q.text}</p>
                        <div className="grid grid-cols-1 gap-2">
                          {q.options.map(opt => (
                            <label key={opt} className={`flex items-center space-x-3 p-3 rounded-xl border transition-all cursor-pointer ${
                              formData.riskAnswers[q.id] === opt ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-300' : 'bg-white border-gray-200 hover:border-blue-200'
                            }`}>
                              <input 
                                type="radio" 
                                name={q.id} 
                                value={opt} 
                                checked={formData.riskAnswers[q.id] === opt} 
                                onChange={(e) => handleRiskAnswer(q.id, e.target.value)}
                                className="text-blue-600"
                              />
                              <span className="text-sm text-gray-700">{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-6 bg-blue-600 rounded-2xl text-white">
                    <h4 className="font-bold mb-2 flex items-center space-x-2">
                      <ShieldCheck size={20} />
                      <span>Risk Disclosure</span>
                    </h4>
                    <ul className="text-sm space-y-2 opacity-90">
                      <li className="flex items-start space-x-2">
                        <span className="mt-1">•</span>
                        <span>Past performance of investments is no guarantee of future performance.</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="mt-1">•</span>
                        <span>The value of investments may go up as well as down.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Step 9: Estate & Storage */}
              {step === 9 && (
                <div className="space-y-10">
                  <div>
                    <SectionHeader icon={Lock} title="Estate Planning" description="Planning for the future and your legacy" />
                    <div className="space-y-6">
                      {[
                        { id: 'hasWill', label: 'Do you have a current will?' },
                        { id: 'discussedInheritance', label: 'Have you discussed your inheritance plan with your adult children and other potential heirs?' },
                        { id: 'hasGuardian', label: 'Have you identified a guardian for your (minor) children?' },
                        { id: 'funeralPreferencesKnown', label: 'Have you made known (or communicated) to others your preferences for funeral arrangements?' }
                      ].map(q => (
                        <div key={q.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2 md:space-y-0">
                          <span className="text-sm font-medium text-gray-700">{q.label}</span>
                          <div className="flex space-x-4">
                            {['Yes', 'No'].map(opt => (
                              <label key={opt} className="flex items-center space-x-2 cursor-pointer">
                                <input type="radio" name={q.id} value={opt} checked={(formData as any)[q.id] === opt} onChange={(e) => updateField(q.id, e.target.value)} />
                                <span className="text-sm">{opt}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <SectionHeader icon={FileText} title="Document Storage" description="Where are your important documents located?" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        'Bank statements', 'Birth certificates and passports', 'Business documents', 'Credit card statements',
                        'Insurance policies', 'Inventory of household furnishings', 'Investment statements', 'Loan documents',
                        'Marriage certificate', 'Property titles', 'Pension plan statements', 'Wills'
                      ].map(doc => (
                        <div key={doc} className="space-y-1">
                          <label className="text-xs font-bold text-gray-500 uppercase">{doc}</label>
                          <input 
                            value={formData.documentStorage[doc] || ''} 
                            onChange={(e) => updateField('documentStorage', { ...formData.documentStorage, [doc]: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                            placeholder="Storage location..."
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 10: Referrals & Declaration */}
              {step === 10 && (
                <div className="space-y-10">
                  <div>
                    <SectionHeader icon={Share2} title="Referrals" description="Friends or family who might benefit from our services" />
                    <div className="space-y-6">
                      {formData.referrals.map((ref, idx) => (
                        <div key={ref.id} className="p-6 bg-gray-50 rounded-2xl border border-gray-200 space-y-4 relative">
                          <button 
                            onClick={() => updateField('referrals', formData.referrals.filter((_, i) => i !== idx))}
                            className="absolute top-4 right-4 text-red-400 hover:text-red-600"
                          >
                            <Trash2 size={20} />
                          </button>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Name" value={ref.name} onChange={(v) => { const r = [...formData.referrals]; r[idx].name = v; updateField('referrals', r); }} />
                            <InputField label="Employer" value={ref.employer} onChange={(v) => { const r = [...formData.referrals]; r[idx].employer = v; updateField('referrals', r); }} />
                            <InputField label="Job Title" value={ref.jobTitle} onChange={(v) => { const r = [...formData.referrals]; r[idx].jobTitle = v; updateField('referrals', r); }} />
                            <InputField label="Telephone" value={ref.tel} onChange={(v) => { const r = [...formData.referrals]; r[idx].tel = v; updateField('referrals', r); }} />
                            <InputField label="Married?" value={ref.married} onChange={(v) => { const r = [...formData.referrals]; r[idx].married = v; updateField('referrals', r); }} />
                            <InputField label="Children & Ages" value={ref.childrenAges} onChange={(v) => { const r = [...formData.referrals]; r[idx].childrenAges = v; updateField('referrals', r); }} />
                          </div>
                          <InputField label="How do you know them?" value={ref.howKnown} onChange={(v) => { const r = [...formData.referrals]; r[idx].howKnown = v; updateField('referrals', r); }} />
                        </div>
                      ))}
                      <button 
                        onClick={() => updateField('referrals', [...formData.referrals, { id: Math.random().toString(), name: '', jobTitle: '', employer: '', tel: '', married: '', childrenAges: '', howKnown: '' }])}
                        className="flex items-center space-x-2 px-6 py-3 bg-blue-50 text-blue-600 rounded-xl font-bold hover:bg-blue-100 transition-colors"
                      >
                        <Plus size={20} />
                        <span>Add Referral</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <SectionHeader icon={PenTool} title="Declaration" />
                    <div className="p-6 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200">
                      <p className="text-lg font-medium leading-relaxed italic">
                        "This information has been provided by me/us in the strictest confidence. I understand that recommendations and advice provided by my advisor will only be based on this information and should be updated in future as my circumstances change. It places me/us under no obligation to take up any recommendation."
                      </p>
                    </div>

                    <div className="space-y-4">
                      <p className="text-sm font-bold text-gray-700">How would you characterise the quality of the information you provided?</p>
                      <div className="grid grid-cols-1 gap-2">
                        {['Very accurate', 'Based on estimates that are reasonably accurate', 'Based on rough estimates'].map(opt => (
                          <label key={opt} className={`flex items-center space-x-3 p-4 rounded-xl border transition-all cursor-pointer ${
                            formData.qualityOfInfo === opt ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'
                          }`}>
                            <input type="radio" name="quality" value={opt} checked={formData.qualityOfInfo === opt} onChange={(e) => updateField('qualityOfInfo', e.target.value)} />
                            <span className="text-sm font-medium">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Footer Controls */}
          <div className="p-6 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <button 
              onClick={prevStep}
              disabled={step === 0}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-bold transition-all ${
                step === 0 ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <ChevronLeft size={20} />
              <span>Back</span>
            </button>
            
            {step < totalSteps - 1 ? (
              <button 
                onClick={nextStep}
                className="flex items-center space-x-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
              >
                <span>Next Step</span>
                <ChevronRight size={20} />
              </button>
            ) : (
              <button 
                onClick={handleSubmit}
                className="flex items-center space-x-2 px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-200"
              >
                <Save size={20} />
                <span>Submit Questionnaire</span>
              </button>
            )}
          </div>
        </div>
      </>
    )}

    {activeModule === 'clients' && (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-navy dark:text-white uppercase tracking-tight">Client Management</h1>
            <p className="text-gray-500 dark:text-gray-400">Manage your clients and their financial journey.</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text"
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all w-full md:w-64"
              />
            </div>
            <button className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 hover:text-blue transition-colors">
              <Filter size={20} />
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue text-white rounded-xl font-bold hover:bg-blue/90 transition-all shadow-lg shadow-blue/20">
              <Plus size={18} />
              <span>Add Client</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.filter(c => c.fullName.toLowerCase().includes(searchQuery.toLowerCase())).map((client) => (
            <motion.div 
              key={client.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <img src={client.photo} alt={client.fullName} className="w-12 h-12 rounded-full object-cover border-2 border-blue/20" />
                  <div>
                    <h3 className="font-bold text-navy dark:text-white">{client.fullName}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{client.role}</p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  <MoreVertical size={18} />
                </button>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                  <Mail size={14} className="text-blue" />
                  <span>{client.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                  <Phone size={14} className="text-blue" />
                  <span>{client.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                  <Calendar size={14} className="text-blue" />
                  <span>Hired: {client.hireDate}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center space-x-1">
                  <span className={`w-2 h-2 rounded-full ${client.onboarding === 'Yes' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                  <span className="text-[10px] font-bold uppercase text-gray-400">{client.onboarding === 'Yes' ? 'Onboarded' : 'Pending'}</span>
                </div>
                <button className="text-xs font-bold text-blue hover:underline">View Profile</button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    )}

    {activeModule === 'academy' && (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-navy dark:text-white uppercase tracking-tight">Financial Academy</h1>
            <p className="text-gray-500 dark:text-gray-400">Educational resources to master your finances.</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-1">
              {['All', 'Guides', 'Videos', 'Articles'].map(tab => (
                <button key={tab} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${tab === 'All' ? 'bg-blue text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {academyContent.map((item) => (
            <motion.div 
              key={item.id}
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-xl transition-all"
            >
              <div className="relative aspect-video">
                <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <PlayCircle className="text-white" size={48} />
                </div>
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white ${
                    item.type === 'guide' ? 'bg-blue' : item.type === 'video' ? 'bg-red-500' : 'bg-green-500'
                  }`}>
                    {item.type}
                  </span>
                </div>
                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded">
                  {item.duration}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-navy dark:text-white mb-2 leading-tight">{item.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 line-clamp-2">{item.description}</p>
                <button className="w-full py-3 bg-gray-100 dark:bg-gray-800 text-navy dark:text-white font-bold rounded-xl hover:bg-blue hover:text-white transition-all flex items-center justify-center space-x-2">
                  {item.type === 'video' ? <Video size={18} /> : item.type === 'article' ? <Book size={18} /> : <BookOpen size={18} />}
                  <span>{item.type === 'video' ? 'Watch Video' : item.type === 'article' ? 'Read Article' : 'View Guide'}</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="bg-navy dark:bg-blue p-10 rounded-[2.5rem] text-white relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-3xl font-black mb-4 uppercase tracking-tight">Personalized Learning Path</h2>
            <p className="text-blue-100 mb-8">Based on your financial questionnaire, we've curated a specific set of resources to help you achieve your goals faster.</p>
            <button className="px-8 py-4 bg-white text-navy font-bold rounded-2xl hover:bg-blue-50 transition-all shadow-xl">
              View My Path
            </button>
          </div>
          <BookOpen className="absolute -right-10 -bottom-10 text-white/10 w-64 h-64 rotate-12" />
        </div>
      </div>
    )}

    {activeModule === 'recruitment' && (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-navy dark:text-white uppercase tracking-tight">Broker Recruitment</h1>
            <p className="text-gray-500 dark:text-gray-400">Track and manage potential broker recruits.</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text"
                placeholder="Search recruits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all w-full md:w-64"
              />
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue text-white rounded-xl font-bold hover:bg-blue/90 transition-all shadow-lg shadow-blue/20">
              <Plus size={18} />
              <span>New Recruit</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Applied', value: recruits.length, color: 'bg-blue' },
            { label: 'Interviewing', value: recruits.filter(r => r.status === 'Interviewing').length, color: 'bg-yellow-500' },
            { label: 'Offered', value: recruits.filter(r => r.status === 'Offered').length, color: 'bg-purple-500' },
            { label: 'Onboarded', value: recruits.filter(r => r.status === 'Onboarded').length, color: 'bg-green-500' },
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-black text-navy dark:text-white">{stat.value}</p>
                <div className={`w-8 h-1 rounded-full ${stat.color}`}></div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Recruit</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Experience</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Applied Date</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Source</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {recruits.filter(r => r.fullName.toLowerCase().includes(searchQuery.toLowerCase())).map((recruit) => (
                  <tr key={recruit.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue/10 dark:bg-blue/20 rounded-full flex items-center justify-center text-blue font-bold">
                          {recruit.fullName[0]}
                        </div>
                        <div>
                          <p className="font-bold text-navy dark:text-white">{recruit.fullName}</p>
                          <p className="text-xs text-gray-500">{recruit.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{recruit.experience}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        recruit.status === 'Onboarded' ? 'bg-green-100 text-green-600' :
                        recruit.status === 'Interviewing' ? 'bg-yellow-100 text-yellow-600' :
                        recruit.status === 'Offered' ? 'bg-purple-100 text-purple-600' :
                        recruit.status === 'Rejected' ? 'bg-red-100 text-red-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {recruit.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{recruit.appliedDate}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{recruit.source}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-gray-400 hover:text-blue transition-colors">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <h3 className="text-xl font-bold text-navy dark:text-white mb-6">Recruitment Funnel</h3>
            <div className="space-y-4">
              {[
                { label: 'Applied', count: recruits.length, total: recruits.length, color: 'bg-blue' },
                { label: 'Interviewing', count: recruits.filter(r => r.status === 'Interviewing').length, total: recruits.length, color: 'bg-yellow-500' },
                { label: 'Offered', count: recruits.filter(r => r.status === 'Offered').length, total: recruits.length, color: 'bg-purple-500' },
                { label: 'Onboarded', count: recruits.filter(r => r.status === 'Onboarded').length, total: recruits.length, color: 'bg-green-500' },
              ].map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-400">
                    <span>{item.label}</span>
                    <span>{item.count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.count / item.total) * 100}%` }}
                      className={`h-full ${item.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-600 p-8 rounded-3xl text-white shadow-xl shadow-blue-200 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-2xl font-black mb-4 uppercase tracking-tight">Recruitment Drive</h3>
              <p className="text-blue-100 mb-8">We are currently looking for experienced financial advisors to join our growing team. Share the recruitment link with your network.</p>
              <div className="flex items-center space-x-2 bg-white/10 p-2 rounded-xl border border-white/20 mb-6">
                <input 
                  readOnly 
                  value="acuity.academy/recruit" 
                  className="bg-transparent border-none outline-none text-sm font-medium flex-1 px-2"
                />
                <button className="px-4 py-2 bg-white text-blue font-bold rounded-lg text-xs hover:bg-blue-50 transition-all">
                  Copy Link
                </button>
              </div>
              <button className="w-full py-4 bg-navy text-white font-bold rounded-2xl hover:bg-navy/90 transition-all">
                Generate Recruitment Ad
              </button>
            </div>
            <Briefcase className="absolute -right-10 -bottom-10 text-white/10 w-64 h-64 -rotate-12" />
          </div>
        </div>
      </div>
    )}

    {activeModule === 'system' && (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-navy dark:text-white uppercase tracking-tight">System Status</h1>
            <p className="text-gray-500 dark:text-gray-400">Monitor your deployment, sync, and Cloudflare status.</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
          >
            <RefreshCw size={18} />
            <span>Refresh Status</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Deployment Status */}
          <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-navy dark:text-white">Deployment</h3>
              <div className="px-3 py-1 bg-green-100 text-green-600 text-[10px] font-bold rounded-full uppercase">Live</div>
            </div>
            <div className="space-y-6">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">App URL</p>
                <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                  <code className="text-xs text-blue truncate flex-1">{window.location.origin}</code>
                  <button 
                    onClick={() => navigator.clipboard.writeText(window.location.origin)}
                    className="p-1.5 text-gray-400 hover:text-blue transition-colors"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Environment</p>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="w-2 h-2 bg-blue rounded-full"></div>
                  <span>Google AI Studio Build (Cloud Run)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cloudflare Connection */}
          <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-navy dark:text-white">Cloudflare</h3>
              <div className="px-3 py-1 bg-green-100 text-green-600 text-[10px] font-bold rounded-full uppercase">Connected</div>
            </div>
            <div className="space-y-6">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-50 text-green-600 rounded-lg flex items-center justify-center shrink-0">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-navy dark:text-white">Secrets Configured</p>
                  <p className="text-xs text-gray-500">API Token and Account ID are successfully linked.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue/10 text-blue rounded-lg flex items-center justify-center shrink-0">
                  <Globe size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-navy dark:text-white">Worker Ready</p>
                  <p className="text-xs text-gray-500">Wrangler is ready to deploy your academy worker.</p>
                </div>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                  Your worker is now ready for deployment. You can trigger a deploy directly from the terminal or via GitHub sync.
                </p>
              </div>
            </div>
          </div>

          {/* GitHub Sync */}
          <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-navy dark:text-white">GitHub Sync</h3>
              <div className="px-3 py-1 bg-purple-100 text-purple-600 text-[10px] font-bold rounded-full uppercase">Manual</div>
            </div>
            <div className="space-y-6">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple/10 text-purple-600 rounded-lg flex items-center justify-center shrink-0">
                  <Github size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-navy dark:text-white">Repository</p>
                  <p className="text-xs text-gray-500">Linked to: github.com/daos</p>
                </div>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl border border-purple-100 dark:border-purple-900/30">
                <p className="text-xs text-purple-700 dark:text-purple-300 leading-relaxed">
                  To push the latest changes (Recruitment module, Worker setup) to GitHub, use the <strong>Sync with GitHub</strong> option in the AI Studio Settings menu.
                </p>
              </div>
              <button className="w-full py-3 bg-navy text-white font-bold rounded-xl hover:bg-navy/90 transition-all text-sm">
                Open GitHub Repo
              </button>
            </div>
          </div>
        </div>

        <div className="bg-navy dark:bg-blue p-10 rounded-[2.5rem] text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-black mb-4 uppercase tracking-tight">Cloudflare Tunnel Setup</h2>
            <p className="text-blue-100 mb-8 max-w-2xl">
              To use a custom domain, point your Cloudflare Tunnel to the <strong>App URL</strong> shown above. This creates a secure bridge between your AI Studio preview and your public domain.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="px-8 py-4 bg-white text-navy font-bold rounded-2xl hover:bg-blue-50 transition-all shadow-xl">
                Tunnel Documentation
              </button>
              <button className="px-8 py-4 bg-white/10 text-white font-bold rounded-2xl hover:bg-white/20 transition-all border border-white/20">
                Copy App URL
              </button>
            </div>
          </div>
          <Settings className="absolute -right-10 -bottom-10 text-white/10 w-64 h-64 rotate-12" />
        </div>
      </div>
    )}

        <p className="mt-8 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Acuity Consulting Financial Planning. All rights reserved.
        </p>
      </main>
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        onLogin={(email) => {
          setUser({ email });
          setShowAuthModal(false);
          // Auto-save after login
          localStorage.setItem('acuity_financial_planner_data', JSON.stringify(formData));
          localStorage.setItem('acuity_financial_planner_step', step.toString());
          setLastSaved(new Date().toLocaleTimeString());
        }} 
      />
    </div>
  );
}

const AuthModal = ({ isOpen, onClose, onLogin }: { isOpen: boolean; onClose: () => void; onLogin: (email: string) => void }) => {
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const setupRecaptcha = () => {
    if ((window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier.clear();
    }
    (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
      }
    });
  };

  const handleEmailAuth = async () => {
    setLoading(true);
    setError('');
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onLogin(email);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneAuth = async () => {
    setLoading(true);
    setError('');
    try {
      setupRecaptcha();
      const appVerifier = (window as any).recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(auth, phone, appVerifier);
      setVerificationId(confirmationResult.verificationId);
      (window as any).confirmationResult = confirmationResult;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    setError('');
    try {
      const confirmationResult = (window as any).confirmationResult;
      await confirmationResult.confirm(otp);
      onLogin(phone);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-800"
      >
        <div className="text-center mb-8">
          <div className="flex justify-center"><Logo /></div>
          <h2 className="text-2xl font-bold text-navy dark:text-white mt-4">{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Access your financial plan from any device.</p>
        </div>

        <div className="flex space-x-2 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          <button 
            onClick={() => setMethod('email')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${method === 'email' ? 'bg-white dark:bg-gray-700 text-blue shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            Email
          </button>
          <button 
            onClick={() => setMethod('phone')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${method === 'phone' ? 'bg-white dark:bg-gray-700 text-blue shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            Phone
          </button>
        </div>
        
        <div className="space-y-4">
          {error && <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded-lg border border-red-100 dark:border-red-900/30">{error}</div>}
          
          {method === 'email' ? (
            <>
              <InputField label="Email Address" value={email} onChange={setEmail} type="email" placeholder="you@example.com" />
              <InputField label="Password" value={password} onChange={setPassword} type="password" placeholder="••••••••" />
              <button 
                onClick={handleEmailAuth}
                disabled={loading}
                className="w-full py-4 bg-blue text-white font-bold rounded-2xl hover:bg-blue/90 transition-all shadow-lg shadow-blue/20 disabled:opacity-50"
              >
                {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Login')}
              </button>
            </>
          ) : (
            <>
              {!verificationId ? (
                <>
                  <InputField label="Phone Number" value={phone} onChange={setPhone} type="tel" placeholder="+254 700 000 000" />
                  <div id="recaptcha-container"></div>
                  <button 
                    onClick={handlePhoneAuth}
                    disabled={loading}
                    className="w-full py-4 bg-blue text-white font-bold rounded-2xl hover:bg-blue/90 transition-all shadow-lg shadow-blue/20 disabled:opacity-50"
                  >
                    {loading ? 'Sending OTP...' : 'Send Verification Code'}
                  </button>
                </>
              ) : (
                <>
                  <InputField label="Verification Code" value={otp} onChange={setOtp} type="text" placeholder="123456" />
                  <button 
                    onClick={handleVerifyOtp}
                    disabled={loading}
                    className="w-full py-4 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 transition-all shadow-lg shadow-green-200 disabled:opacity-50"
                  >
                    {loading ? 'Verifying...' : 'Verify & Continue'}
                  </button>
                  <button onClick={() => setVerificationId('')} className="w-full text-xs text-blue font-bold hover:underline">Change Phone Number</button>
                </>
              )}
            </>
          )}
          
          <div className="text-center">
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-blue font-bold hover:underline"
            >
              {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
            </button>
          </div>
          
          <button 
            onClick={onClose}
            className="w-full py-3 text-gray-400 font-medium hover:text-navy dark:hover:text-white transition-colors text-sm"
          >
            Continue as Guest
          </button>
        </div>
        
        <p className="text-[10px] text-center text-gray-400 mt-8 uppercase tracking-widest">
          By continuing, you agree to Acuity Consulting's Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
};
