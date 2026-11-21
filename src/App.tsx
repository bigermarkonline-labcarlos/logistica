import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  FileCheck2,
  Globe,
  Lock,
  Menu,
  MessageSquare,
  Mic,
  MicOff,
  Send,
  Truck,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import HeroSection from './components/HeroSection';
import LastMileVasSection from './components/LastMileVasSection';
import LogisticsCalculator from './components/LogisticsCalculator';
import MultiCarrierComparator from './components/MultiCarrierComparator';
import SiscoreModal from './components/SiscoreModal';
import { INITIAL_SISCORE_SHIPMENTS } from './data/mockSiscore';
import { TRANSLATIONS } from './i18n/translations';
import {
  calculateShippingEstimate,
  formatCop,
  formatUsd,
  getAssistantSmartResponse,
  validateCarrierApplication,
  validateQuoteLead,
  type CarrierApplicationForm,
  type Language,
  type QuoteLeadForm,
  type VehicleTypeId,
} from './utils/logistics';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestedAction?: 'calculator' | 'siscore' | 'carrier' | null;
}

function PostCargoLogo({
  dark = false,
  compact = false,
}: {
  dark?: boolean;
  compact?: boolean;
}) {
  return (
    <div className="inline-flex items-center gap-2.5 shrink-0 select-none">
      <svg
        width="44"
        height="44"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="w-9 h-9 sm:w-10 sm:h-10 shrink-0"
      >
        <defs>
          <radialGradient id="pcSphere" cx="38%" cy="32%" r="65%">
            <stop offset="0%" stopColor="#F8FAFC" />
            <stop offset="48%" stopColor="#CBD5E1" />
            <stop offset="82%" stopColor="#5E85A4" />
            <stop offset="100%" stopColor="#0B3C6A" />
          </radialGradient>
          <linearGradient
            id="pcArrowMain"
            x1="8"
            y1="52"
            x2="58"
            y2="10"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#042544" />
            <stop offset="55%" stopColor="#0B3C6A" />
            <stop offset="100%" stopColor="#0EA5E9" />
          </linearGradient>
        </defs>
        <circle cx="31" cy="32" r="22" fill="url(#pcSphere)" />
        <path
          d="M11 40C15 50 26 56 38 53"
          stroke="#F59E0B"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M11 26C17 15 30 9 45 10L42 5.5L56 11.5L43 18L45 14C32 13 21 18 15 28L11 26Z"
          fill="url(#pcArrowMain)"
        />
        <path
          d="M7 36C16 23 32 17 49 18.5L46.5 13.5L60 21L46 27.5L48.5 23C33 22 19 27 11 39L7 36Z"
          fill="#042544"
          stroke="#0EA5E9"
          strokeWidth="0.7"
        />
        <path
          d="M14 48C23 36 37 31 51 32L49 27.5L61 34.5L48 41L50.5 36.5C38 35.5 26 40 18 50.5L14 48Z"
          fill="url(#pcArrowMain)"
        />
      </svg>

      <div className="leading-none">
        <span
          className={`block font-display font-extrabold italic tracking-tight text-xl sm:text-[22px] ${
            dark ? 'text-white' : 'text-[#042544]'
          }`}
        >
          Post<span className={dark ? 'text-[#F59E0B]' : 'text-[#0B3C6A]'}>Cargo</span>
        </span>
        {!compact && (
          <span
            className={`block text-[10.5px] font-semibold tracking-wide mt-0.5 ${
              dark ? 'text-sky-200' : 'text-[#0B3C6A]'
            }`}
          >
            Reexpediciones &amp; Logística
          </span>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [lang, setLang] = useState<Language>('es');
  const t = TRANSLATIONS[lang];

  // Navigation, Modal & Hero Tracking Trigger States
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [siscoreModalOpen, setSiscoreModalOpen] = useState(false);
  const [externalTrackingTrigger, setExternalTrackingTrigger] = useState<{
    query: string;
    nonce: number;
  } | null>(null);

  // Calculator State (Connected to 1,255-route TARIFAS 2026 matrix)
  const [originId, setOriginId] = useState('BOGOTA');
  const [destinationId, setDestinationId] = useState('SAN JOSE DEL GUAVIARE|GUAVIARE');
  const [vehicleId, setVehicleId] = useState<VehicleTypeId>('campero_4x4');
  const [weightKg, setWeightKg] = useState(40);
  const [quantity, setQuantity] = useState(1);
  const [declaredValueCop, setDeclaredValueCop] = useState(400000);
  const [secopInsured, setSecopInsured] = useState(false);

  // Lead Capture Modal State (Triggered from Calculator)
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [leadForm, setLeadForm] = useState<QuoteLeadForm>({
    companyOrName: '',
    phone: '',
    email: '',
    notes: '',
  });
  const [leadErrors, setLeadErrors] = useState<Partial<Record<keyof QuoteLeadForm, string>>>({});
  const [leadConfirmedFolio, setLeadConfirmedFolio] = useState<string | null>(null);

  // Carrier Registration State
  const [carrierForm, setCarrierForm] = useState<CarrierApplicationForm>({
    fullName: '',
    documentId: '',
    phone: '',
    vehicleType: 'Campero 4x4',
    plate: '',
    baseDepartment: 'Antioquia / Urabá',
  });
  const [carrierErrors, setCarrierErrors] = useState<
    Partial<Record<keyof CarrierApplicationForm, string>>
  >({});
  const [carrierConfirmedId, setCarrierConfirmedId] = useState<string | null>(null);

  // Image Error Fallbacks
  const [b2bImgError, setB2bImgError] = useState(false);
  const [carrierImgError, setCarrierImgError] = useState(false);
  const [avatarImgError, setAvatarImgError] = useState(false);

  // Floating AI Assistant State
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantInput, setAssistantInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speakResponses, setSpeakResponses] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: TRANSLATIONS.es.assistant.welcomeMessage,
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = t.htmlTitle;
    setChatMessages((prev) =>
      prev.map((m) =>
        m.id === 'welcome' ? { ...m, content: t.assistant.welcomeMessage } : m
      )
    );
  }, [lang, t.htmlTitle, t.assistant.welcomeMessage]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('siscore') === '1' || params.get('autostart') === '1') {
      setSiscoreModalOpen(true);
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, assistantOpen]);

  // Real-time matrix calculator result
  const estimate = useMemo(
    () =>
      calculateShippingEstimate({
        originId,
        destinationId,
        vehicleId,
        weightKg,
        declaredValueCop,
        secopInsured,
        lang,
      }),
    [originId, destinationId, vehicleId, weightKg, declaredValueCop, secopInsured, lang]
  );

  const scrollToSection = (sectionId: string) => {
    setMobileMenuOpen(false);
    setSiscoreModalOpen(false);
    requestAnimationFrame(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const openSiscoreModal = () => {
    setMobileMenuOpen(false);
    setSiscoreModalOpen(true);
  };

  const triggerHeroTracking = (presetQuery = '') => {
    setMobileMenuOpen(false);
    setSiscoreModalOpen(false);
    if (presetQuery) {
      setExternalTrackingTrigger({ query: presetQuery, nonce: Date.now() });
    }
    requestAnimationFrame(() => {
      document.getElementById('rastreo-hero')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    });
  };

  const handleSubmitLead = (e: FormEvent) => {
    e.preventDefault();
    const errs = validateQuoteLead(leadForm, lang);
    setLeadErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setLeadConfirmedFolio(`PC-COT-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  const handleSubmitCarrier = (e: FormEvent) => {
    e.preventDefault();
    const errs = validateCarrierApplication(carrierForm, lang);
    setCarrierErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setCarrierConfirmedId(`ALIADO-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  const sendAssistantMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const reply = getAssistantSmartResponse(trimmed, lang);
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', content: trimmed };
    const botMsg: ChatMessage = {
      id: `a-${Date.now() + 1}`,
      role: 'assistant',
      content: reply.text,
      suggestedAction: reply.suggestedAction,
    };

    setChatMessages((prev) => [...prev, userMsg, botMsg]);
    setAssistantInput('');
    setIsListening(false);

    if (speakResponses && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(reply.text);
        utter.lang = lang === 'en' ? 'en-US' : 'es-CO';
        window.speechSynthesis.speak(utter);
      } catch {
        // Ignore speech synthesis restrictions
      }
    }
  };

  const handleToggleVoice = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }
    setIsListening(true);

    const win = window as unknown as {
      SpeechRecognition?: new () => {
        lang: string;
        interimResults: boolean;
        start: () => void;
        onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
        onerror: (() => void) | null;
      };
      webkitSpeechRecognition?: new () => {
        lang: string;
        interimResults: boolean;
        start: () => void;
        onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
        onerror: (() => void) | null;
      };
    };

    const Rec = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (Rec) {
      try {
        const rec = new Rec();
        rec.lang = lang === 'en' ? 'en-US' : 'es-CO';
        rec.interimResults = false;
        rec.onresult = (event) => {
          const transcript = event.results?.[0]?.[0]?.transcript;
          setIsListening(false);
          if (transcript) sendAssistantMessage(transcript);
        };
        rec.onerror = () => {
          // Keep visual voice-wave simulation active
        };
        rec.start();
      } catch {
        // Keep simulated voice-wave UI active
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F8FB] text-[#042544]">
      {/* TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-[72px] flex items-center justify-between gap-2 sm:gap-4 md:gap-8">
          <a
            href="#inicio"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('inicio');
            }}
            aria-label={t.nav.homeAria}
            className="focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F59E0B] rounded"
          >
            <PostCargoLogo compact />
          </a>

          <nav
            aria-label={lang === 'en' ? 'Main navigation' : 'Navegación principal'}
            className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600"
          >
            <button
              type="button"
              onClick={() => scrollToSection('calculadora')}
              className="hover:text-[#042544] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {t.nav.calculator}
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('comparador')}
              className="hover:text-[#042544] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {t.nav.compare}
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('ultima-milla')}
              className="hover:text-[#042544] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {t.nav.lastMile}
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('soluciones-b2b')}
              className="hover:text-[#042544] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {t.nav.solutions}
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('transportistas')}
              className="hover:text-[#042544] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {t.nav.carriers}
            </button>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Language Switcher ES / EN */}
            <div
              role="group"
              aria-label={lang === 'en' ? 'Language selector' : 'Selector de idioma'}
              className="inline-flex items-center rounded-lg border border-slate-300 bg-[#F6F8FB] p-0.5 text-xs font-semibold"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500 ml-1.5 mr-1 hidden sm:block" aria-hidden="true" />
              <button
                type="button"
                onClick={() => setLang('es')}
                aria-pressed={lang === 'es'}
                className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                  lang === 'es'
                    ? 'bg-[#042544] text-white ring-1 ring-[#F59E0B]'
                    : 'text-slate-600 hover:text-[#042544]'
                }`}
              >
                ES
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                aria-pressed={lang === 'en'}
                className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                  lang === 'en'
                    ? 'bg-[#042544] text-white ring-1 ring-[#F59E0B]'
                    : 'text-slate-600 hover:text-[#042544]'
                }`}
              >
                EN
              </button>
            </div>

            <button
              type="button"
              onClick={openSiscoreModal}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#042544] hover:bg-[#0B3C6A] rounded-lg transition-colors shadow-sm whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span className="hidden md:inline">{t.nav.siscoreAccess}</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? t.nav.closeMenu : t.nav.openMenu}
              aria-expanded={mobileMenuOpen}
              className="lg:hidden p-2 text-[#042544] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav
            aria-label={lang === 'en' ? 'Mobile menu' : 'Menú móvil'}
            className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1"
          >
            <button
              type="button"
              onClick={() => scrollToSection('calculadora')}
              className="block w-full text-left px-3 py-2.5 text-sm font-medium text-[#042544] hover:bg-slate-50 rounded-lg"
            >
              {t.nav.calculator}
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('comparador')}
              className="block w-full text-left px-3 py-2.5 text-sm font-medium text-[#042544] hover:bg-slate-50 rounded-lg"
            >
              {t.nav.compare}
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('ultima-milla')}
              className="block w-full text-left px-3 py-2.5 text-sm font-medium text-[#042544] hover:bg-slate-50 rounded-lg"
            >
              {t.nav.lastMile}
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('soluciones-b2b')}
              className="block w-full text-left px-3 py-2.5 text-sm font-medium text-[#042544] hover:bg-slate-50 rounded-lg"
            >
              {t.nav.solutions}
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('transportistas')}
              className="block w-full text-left px-3 py-2.5 text-sm font-medium text-[#042544] hover:bg-slate-50 rounded-lg"
            >
              {t.nav.carriers}
            </button>
            <button
              type="button"
              onClick={() => triggerHeroTracking('#1024')}
              className="block w-full text-left px-3 py-2.5 text-sm font-semibold text-[#B45309] hover:bg-amber-50 rounded-lg"
            >
              {t.nav.tracking}
            </button>
          </nav>
        )}
      </header>

      <main className="flex-1">
        {/* CENTERED HIGH-IMPACT HERO + REAL-TIME TRACKING + YOUTUBE PRESENTATION */}
        <HeroSection
          lang={lang}
          t={t.hero}
          statusLabels={t.statusLabels}
          shipments={INITIAL_SISCORE_SHIPMENTS}
          externalTrackingTrigger={externalTrackingTrigger}
          onScrollToCalculator={() => scrollToSection('calculadora')}
        />

        {/* MODULE 1: MATRIX-CONNECTED LOGISTICS CALCULATOR (1,255 CORRIDORS) */}
        <LogisticsCalculator
          lang={lang}
          t={t.calculator}
          originId={originId}
          destinationId={destinationId}
          vehicleId={vehicleId}
          weightKg={weightKg}
          quantity={quantity}
          declaredValueCop={declaredValueCop}
          secopInsured={secopInsured}
          estimate={estimate}
          onChangeOrigin={setOriginId}
          onChangeDestination={setDestinationId}
          onChangeVehicle={setVehicleId}
          onChangeWeight={setWeightKg}
          onChangeQuantity={setQuantity}
          onChangeDeclaredValue={setDeclaredValueCop}
          onChangeSecopInsured={setSecopInsured}
          onRequestQuote={() => {
            setLeadConfirmedFolio(null);
            setLeadErrors({});
            setLeadModalOpen(true);
          }}
        />

        {/* MODULE 1B: NATIONAL MULTI-CARRIER RATE & COVERAGE COMPARATOR */}
        <MultiCarrierComparator
          lang={lang}
          estimate={estimate}
          weightKg={weightKg}
          quantity={quantity}
          declaredValueCop={declaredValueCop}
          onChangeWeight={setWeightKg}
          onChangeQuantity={setQuantity}
          onRequestQuote={(note) => {
            if (note) {
              setLeadForm((prev) => ({ ...prev, notes: note }));
            }
            setLeadConfirmedFolio(null);
            setLeadErrors({});
            setLeadModalOpen(true);
          }}
        />

        {/* MODULE 1C: LAST-MILE VALUE-ADDED SERVICES (ÚLTIMA MILLA ASISTIDA) */}
        <LastMileVasSection
          lang={lang}
          onRequestVasPilot={(summary) => {
            setLeadForm((prev) => ({ ...prev, notes: summary }));
            setLeadConfirmedFolio(null);
            setLeadErrors({});
            setLeadModalOpen(true);
          }}
        />

        {/* MODULE 2A: B2B & SECOP ENTERPRISE CAPABILITIES */}
        <section id="soluciones-b2b" className="py-16 lg:py-20 bg-white border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
              <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
                <div>
                  <h2
                    className="font-display text-2xl sm:text-3xl font-bold text-[#042544]"
                    style={{ textWrap: 'balance' }}
                  >
                    {t.b2b.title}
                  </h2>
                  <p className="text-slate-600 mt-3 text-base leading-relaxed">
                    {t.b2b.subtitle}
                  </p>
                </div>

                <div className="divide-y divide-slate-200 border-y border-slate-200">
                  {t.b2b.items.map((item) => (
                    <div key={item.title} className="py-4">
                      <h3 className="font-display font-bold text-[#042544] text-base flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] shrink-0" aria-hidden="true" />
                        <span>{item.title}</span>
                      </h3>
                      <p className="text-sm text-slate-600 mt-1 leading-relaxed pl-3.5">{item.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => triggerHeroTracking('#1024')}
                    className="inline-flex items-center gap-2 px-5 py-3 text-sm font-bold text-white bg-[#042544] hover:bg-[#0B3C6A] rounded-xl transition-colors cursor-pointer shadow-sm"
                  >
                    <span>{t.b2b.cta}</span>
                    <ArrowUpRight className="w-4 h-4 text-[#F59E0B]" />
                  </button>
                  <span className="text-xs text-[#B45309] font-semibold">{t.b2b.proofNote}</span>
                </div>
              </div>

              <div className="lg:col-span-6 flex">
                <div className="relative w-full min-h-[280px] lg:h-full rounded-2xl overflow-hidden border border-slate-200/80 shadow-xl shadow-slate-900/5 bg-[#042544]">
                  <div className="absolute inset-x-0 top-0 h-1.5 bg-[#F59E0B] z-10" aria-hidden="true" />
                  {!b2bImgError ? (
                    <img
                      src="/src/assets/images/b2b_distribution_hub_1794927823422.jpg"
                      alt={t.b2b.imgAlt}
                      referrerPolicy="no-referrer"
                      onError={() => setB2bImgError(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-[#042544] text-white">
                      <FileCheck2 className="w-10 h-10 text-[#F59E0B] mb-2" />
                      <p className="font-display font-bold">{t.b2b.imgFallback}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MODULE 2B: PARTNER CARRIER NETWORK */}
        <section id="transportistas" className="py-16 lg:py-20 bg-[#F6F8FB] border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
              <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
                <div>
                  <h2
                    className="font-display text-2xl sm:text-3xl font-bold text-[#042544]"
                    style={{ textWrap: 'balance' }}
                  >
                    {t.carriers.title}
                  </h2>
                  <p className="text-slate-600 mt-3 text-base leading-relaxed">
                    {t.carriers.subtitle}
                  </p>
                </div>

                <div className="relative h-64 rounded-2xl overflow-hidden border border-slate-200/80 shadow-xl shadow-slate-900/5 bg-[#042544]">
                  <div className="absolute inset-x-0 top-0 h-1.5 bg-[#F59E0B] z-10" aria-hidden="true" />
                  {!carrierImgError ? (
                    <img
                      src="/src/assets/images/carrier_rural_4x4_1794927825341.jpg"
                      alt={t.carriers.imgAlt}
                      referrerPolicy="no-referrer"
                      onError={() => setCarrierImgError(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#0B3C6A] text-white">
                      <Truck className="w-10 h-10 text-[#F59E0B]" />
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xl shadow-slate-900/5 flex flex-col justify-center">
                <div className="h-1.5 w-full bg-[#F59E0B]" aria-hidden="true" />
                <div className="p-6 sm:p-8">
                {carrierConfirmedId ? (
                  <div className="py-6 space-y-4" data-testid="carrier-confirmation">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-[#B45309] flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h3 className="font-display text-2xl font-bold text-[#042544]">
                      {t.carriers.confirmedTitle}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {t.carriers.confirmedPrefix}{' '}
                      <strong className="font-mono text-[#042544]">{carrierConfirmedId}</strong>.{' '}
                      {t.carriers.confirmedMid1}{' '}
                      <strong className="font-mono uppercase">{carrierForm.plate}</strong> (
                      {carrierForm.vehicleType}) {t.carriers.confirmedMid2}{' '}
                      <strong>{carrierForm.phone}</strong> {t.carriers.confirmedSuffix}
                    </p>
                    <button
                      type="button"
                      onClick={() => setCarrierConfirmedId(null)}
                      className="px-4 py-2.5 text-sm font-semibold text-[#042544] border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer"
                    >
                      {t.carriers.registerAnother}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitCarrier} className="space-y-4">
                    <div>
                      <h3 className="font-display text-xl font-bold text-[#042544]">
                        {t.carriers.formTitle}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">{t.carriers.formSubtitle}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="carrier-name"
                          className="block text-xs font-semibold text-[#042544] mb-1.5"
                        >
                          {t.carriers.fullNameLabel}
                        </label>
                        <input
                          id="carrier-name"
                          type="text"
                          placeholder={t.carriers.fullNamePlaceholder}
                          value={carrierForm.fullName}
                          onChange={(e) =>
                            setCarrierForm((p) => ({ ...p, fullName: e.target.value }))
                          }
                          className="w-full h-11 px-3.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#042544] focus:ring-2 focus:ring-[#F59E0B]/30"
                        />
                        {carrierErrors.fullName && (
                          <p className="text-xs text-red-600 mt-1">{carrierErrors.fullName}</p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="carrier-doc"
                          className="block text-xs font-semibold text-[#042544] mb-1.5"
                        >
                          {t.carriers.documentLabel}
                        </label>
                        <input
                          id="carrier-doc"
                          type="text"
                          placeholder={t.carriers.documentPlaceholder}
                          value={carrierForm.documentId}
                          onChange={(e) =>
                            setCarrierForm((p) => ({ ...p, documentId: e.target.value }))
                          }
                          className="w-full h-11 px-3.5 border border-slate-300 rounded-lg text-sm font-mono tabular-nums focus:outline-none focus:border-[#042544] focus:ring-2 focus:ring-[#F59E0B]/30"
                        />
                        {carrierErrors.documentId && (
                          <p className="text-xs text-red-600 mt-1">{carrierErrors.documentId}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="carrier-phone"
                          className="block text-xs font-semibold text-[#042544] mb-1.5"
                        >
                          {t.carriers.phoneLabel}
                        </label>
                        <input
                          id="carrier-phone"
                          type="tel"
                          placeholder={t.carriers.phonePlaceholder}
                          value={carrierForm.phone}
                          onChange={(e) =>
                            setCarrierForm((p) => ({ ...p, phone: e.target.value }))
                          }
                          className="w-full h-11 px-3.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#042544] focus:ring-2 focus:ring-[#F59E0B]/30"
                        />
                        {carrierErrors.phone && (
                          <p className="text-xs text-red-600 mt-1">{carrierErrors.phone}</p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="carrier-vehicle"
                          className="block text-xs font-semibold text-[#042544] mb-1.5"
                        >
                          {t.carriers.vehicleLabel}
                        </label>
                        <select
                          id="carrier-vehicle"
                          value={carrierForm.vehicleType}
                          onChange={(e) =>
                            setCarrierForm((p) => ({ ...p, vehicleType: e.target.value }))
                          }
                          className="w-full h-11 px-3.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#042544] focus:ring-2 focus:ring-[#F59E0B]/30"
                        >
                          <option value="Campero 4x4">Campero 4x4</option>
                          <option value="Estacas">Estacas</option>
                          <option value="Turbo">Turbo (3.5 Ton)</option>
                          <option value="NPR">NPR (5 Ton)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="carrier-plate"
                          className="block text-xs font-semibold text-[#042544] mb-1.5"
                        >
                          {t.carriers.plateLabel}
                        </label>
                        <input
                          id="carrier-plate"
                          type="text"
                          placeholder={t.carriers.platePlaceholder}
                          value={carrierForm.plate}
                          onChange={(e) =>
                            setCarrierForm((p) => ({
                              ...p,
                              plate: e.target.value.toUpperCase(),
                            }))
                          }
                          className="w-full h-11 px-3.5 border border-slate-300 rounded-lg text-sm font-mono uppercase focus:outline-none focus:border-[#042544] focus:ring-2 focus:ring-[#F59E0B]/30"
                        />
                        {carrierErrors.plate && (
                          <p className="text-xs text-red-600 mt-1">{carrierErrors.plate}</p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="carrier-region"
                          className="block text-xs font-semibold text-[#042544] mb-1.5"
                        >
                          {t.carriers.regionLabel}
                        </label>
                        <input
                          id="carrier-region"
                          type="text"
                          placeholder={t.carriers.regionPlaceholder}
                          value={carrierForm.baseDepartment}
                          onChange={(e) =>
                            setCarrierForm((p) => ({ ...p, baseDepartment: e.target.value }))
                          }
                          className="w-full h-11 px-3.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#042544] focus:ring-2 focus:ring-[#F59E0B]/30"
                        />
                        {carrierErrors.baseDepartment && (
                          <p className="text-xs text-red-600 mt-1">
                            {carrierErrors.baseDepartment}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 px-6 text-sm font-bold text-[#042544] bg-[#F59E0B] hover:bg-amber-400 rounded-xl transition-colors cursor-pointer shadow-sm"
                    >
                      {t.carriers.submitButton}
                    </button>
                  </form>
                )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#042544] text-white py-12 border-t-2 border-[#F59E0B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-white/15">
            <div className="md:col-span-5 space-y-3">
              <PostCargoLogo dark />
              <p className="text-sm text-slate-300 max-w-sm leading-relaxed">
                {t.footer.description}
              </p>
            </div>

            <div className="md:col-span-3 space-y-2 text-sm">
              <p className="font-semibold text-[#F59E0B]">{t.footer.modulesTitle}</p>
              <ul className="space-y-1.5 text-slate-300">
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('calculadora')}
                    className="hover:text-white cursor-pointer"
                  >
                    {t.nav.calculator}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('comparador')}
                    className="hover:text-white cursor-pointer"
                  >
                    {t.nav.compare}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('ultima-milla')}
                    className="hover:text-white cursor-pointer"
                  >
                    {t.nav.lastMile}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('soluciones-b2b')}
                    className="hover:text-white cursor-pointer"
                  >
                    {t.nav.solutions}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('transportistas')}
                    className="hover:text-white cursor-pointer"
                  >
                    {t.nav.carriers}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={openSiscoreModal}
                    className="hover:text-white cursor-pointer"
                  >
                    {t.nav.siscoreAccess}
                  </button>
                </li>
              </ul>
            </div>

            <div className="md:col-span-4 space-y-2 text-sm text-slate-300">
              <p className="font-semibold text-[#F59E0B]">{t.footer.networkTitle}</p>
              <p>{t.footer.networkCities}</p>
              <p className="font-mono text-xs text-slate-400">
                comercial@postcargo.co · PBX (601) 745 9200
              </p>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-400">
            <p>
              © {new Date().getFullYear()} {t.footer.rights}
            </p>
            <p>{t.footer.secopBadge}</p>
          </div>
        </div>
      </footer>

      {/* MODAL: LEAD CAPTURE FROM CALCULATOR */}
      {leadModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#042544]/75 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="lead-modal-title"
        >
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="h-1.5 w-full bg-[#F59E0B]" aria-hidden="true" />
            <div className="p-6 sm:p-8 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-[#B45309]">
                  {estimate.origin.name} → {estimate.destination.displayName} ·{' '}
                  {estimate.found
                    ? formatCop(estimate.estimatedCostCop)
                    : t.leadModal.specialQuoteTag}
                </p>
                {estimate.found && (
                  <p className="text-[11px] font-mono text-slate-500 tabular-nums mt-0.5">
                    ≈ {formatUsd(estimate.estimatedCostCop)}
                  </p>
                )}
                <h3
                  id="lead-modal-title"
                  className="font-display text-xl font-bold text-[#042544] mt-1"
                >
                  {estimate.found ? t.leadModal.title : t.leadModal.specialTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setLeadModalOpen(false)}
                aria-label={t.leadModal.closeAria}
                className="p-1.5 text-slate-500 hover:text-[#042544] rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {leadConfirmedFolio ? (
              <div
                className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3"
                data-testid="quote-confirmation"
              >
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>
                    {t.leadModal.confirmedPrefix} {leadConfirmedFolio}
                  </span>
                </div>
                <p className="text-sm text-emerald-900 leading-relaxed">
                  {estimate.found ? (
                    <>
                      {t.leadModal.confirmedBodyMatrix}{' '}
                      <strong>{leadForm.companyOrName}</strong> ({leadForm.email}).
                    </>
                  ) : (
                    <>
                      {t.leadModal.confirmedBodySpecial} <strong>{leadForm.email}</strong>.
                    </>
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => setLeadModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#042544] rounded-lg cursor-pointer"
                >
                  {t.leadModal.backButton}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitLead} className="space-y-4">
                <div>
                  <label
                    htmlFor="lead-company"
                    className="block text-xs font-semibold text-[#042544] mb-1"
                  >
                    {t.leadModal.companyLabel}
                  </label>
                  <input
                    id="lead-company"
                    type="text"
                    value={leadForm.companyOrName}
                    onChange={(e) =>
                      setLeadForm((p) => ({ ...p, companyOrName: e.target.value }))
                    }
                    placeholder={t.leadModal.companyPlaceholder}
                    className="w-full h-11 px-3.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#042544] focus:ring-2 focus:ring-[#F59E0B]/30"
                  />
                  {leadErrors.companyOrName && (
                    <p className="text-xs text-red-600 mt-1">{leadErrors.companyOrName}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="lead-phone"
                      className="block text-xs font-semibold text-[#042544] mb-1"
                    >
                      {t.leadModal.phoneLabel}
                    </label>
                    <input
                      id="lead-phone"
                      type="tel"
                      value={leadForm.phone}
                      onChange={(e) => setLeadForm((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="310 456 7890"
                      className="w-full h-11 px-3.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#042544] focus:ring-2 focus:ring-[#F59E0B]/30"
                    />
                    {leadErrors.phone && (
                      <p className="text-xs text-red-600 mt-1">{leadErrors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="lead-email"
                      className="block text-xs font-semibold text-[#042544] mb-1"
                    >
                      {t.leadModal.emailLabel}
                    </label>
                    <input
                      id="lead-email"
                      type="email"
                      value={leadForm.email}
                      onChange={(e) => setLeadForm((p) => ({ ...p, email: e.target.value }))}
                      placeholder="logistica@empresa.co"
                      className="w-full h-11 px-3.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#042544] focus:ring-2 focus:ring-[#F59E0B]/30"
                    />
                    {leadErrors.email && (
                      <p className="text-xs text-red-600 mt-1">{leadErrors.email}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="lead-notes"
                    className="block text-xs font-semibold text-[#042544] mb-1"
                  >
                    {t.leadModal.notesLabel}
                  </label>
                  <textarea
                    id="lead-notes"
                    rows={2}
                    value={leadForm.notes}
                    onChange={(e) => setLeadForm((p) => ({ ...p, notes: e.target.value }))}
                    placeholder={t.leadModal.notesPlaceholder}
                    className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#042544] focus:ring-2 focus:ring-[#F59E0B]/30"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 text-sm font-bold text-[#042544] bg-[#F59E0B] hover:bg-amber-400 rounded-xl transition-colors cursor-pointer"
                >
                  {estimate.found ? t.leadModal.submitButton : t.leadModal.submitSpecialButton}
                </button>
              </form>
            )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PRIVATE EXTERNAL SISCORE ACCESS */}
      <SiscoreModal
        open={siscoreModalOpen}
        lang={lang}
        t={t.siscoreModal}
        onClose={() => setSiscoreModalOpen(false)}
      />

      {/* FLOATING AI ASSISTANT WIDGET (TEXT + VOICE SIMULATION) */}
      <div className="fixed bottom-3 right-3 z-50 flex flex-col items-end sm:bottom-4 sm:right-4">
        {assistantOpen && (
          <section
            aria-label={t.assistant.ariaLabel}
            className="fixed inset-x-2 bottom-[4.75rem] max-h-[min(72dvh,620px)] rounded-2xl border border-slate-200 bg-white shadow-2xl flex flex-col overflow-hidden transition-all duration-300 sm:relative sm:inset-auto sm:mb-3 sm:w-[390px] sm:max-h-[78vh]"
          >
            <div className="bg-[#042544] text-white px-4 py-3.5 flex items-center justify-between gap-3 border-b-2 border-[#F59E0B]">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#F59E0B] bg-[#0B3C6A] shrink-0">
                  {!avatarImgError ? (
                    <img
                      src="/src/assets/images/avatar_camila_diadema_gorra_1794928428906.jpg"
                      alt="Camila PostCargo AI"
                      referrerPolicy="no-referrer"
                      onError={() => setAvatarImgError(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold">
                      AI
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="font-display font-bold text-sm truncate">{t.assistant.title}</h2>
                  <p className="text-xs text-sky-200 truncate">{t.assistant.subtitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setSpeakResponses((prev) => !prev)}
                  aria-label={speakResponses ? t.assistant.muteAria : t.assistant.unmuteAria}
                  className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                >
                  {speakResponses ? (
                    <Volume2 className="w-4 h-4" />
                  ) : (
                    <VolumeX className="w-4 h-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setAssistantOpen(false)}
                  aria-label={t.assistant.closeAria}
                  className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-[#F6F8FB] overscroll-contain">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[#042544] text-white'
                        : 'bg-white text-[#042544] border border-slate-200/80 shadow-xs'
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.suggestedAction && (
                    <button
                      type="button"
                      onClick={() => {
                        if (msg.suggestedAction === 'siscore') {
                          triggerHeroTracking('#1024');
                        } else if (msg.suggestedAction === 'carrier') {
                          scrollToSection('transportistas');
                        } else {
                          scrollToSection('calculadora');
                        }
                      }}
                      className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-[#B45309] hover:text-[#042544] cursor-pointer"
                    >
                      <span>
                        {msg.suggestedAction === 'siscore'
                          ? t.assistant.actionSiscore
                          : msg.suggestedAction === 'carrier'
                            ? t.assistant.actionCarrier
                            : t.assistant.actionCalculator}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {isListening && (
              <div
                className="px-4 py-3 bg-amber-50 border-t border-amber-200 flex items-center justify-between gap-3"
                data-testid="voice-listening-indicator"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1 h-5" aria-hidden="true">
                    {[0, 1, 2, 3, 4, 5].map((bar) => (
                      <span
                        key={bar}
                        className="w-1 h-4 bg-[#F59E0B] rounded-full voice-wave-bar"
                        style={{ animationDelay: `${bar * 100}ms` }}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-[#042544]">
                    {t.assistant.listeningText}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsListening(false)}
                  className="text-xs font-semibold text-[#B45309] hover:underline cursor-pointer"
                >
                  {t.assistant.stopListening}
                </button>
              </div>
            )}

            <div className="px-3 py-2 bg-white border-t border-slate-200 flex flex-wrap gap-1.5">
              {t.assistant.starterPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendAssistantMessage(prompt)}
                  className="px-2.5 py-1 text-[11px] font-medium text-[#042544] bg-[#F6F8FB] hover:bg-amber-50 border border-slate-200 rounded-lg whitespace-nowrap transition-colors cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendAssistantMessage(assistantInput);
              }}
              className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
            >
              <button
                type="button"
                onClick={handleToggleVoice}
                aria-label={isListening ? t.assistant.micStopAria : t.assistant.micStartAria}
                className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                  isListening
                    ? 'bg-[#F59E0B] text-[#042544]'
                    : 'bg-slate-100 text-[#042544] hover:bg-slate-200'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <label htmlFor="assistant-input" className="sr-only">
                {t.assistant.inputPlaceholder}
              </label>
              <input
                id="assistant-input"
                type="text"
                value={assistantInput}
                onChange={(e) => setAssistantInput(e.target.value)}
                placeholder={t.assistant.inputPlaceholder}
                className="flex-1 h-10 px-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-[#042544]"
              />

              <button
                type="submit"
                disabled={!assistantInput.trim()}
                aria-label={t.assistant.sendAria}
                className="h-10 w-10 rounded-xl bg-[#042544] hover:bg-[#0B3C6A] disabled:opacity-40 text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </section>
        )}

        <button
          type="button"
          onClick={() => setAssistantOpen((prev) => !prev)}
          aria-label={assistantOpen ? t.assistant.launcherClose : t.assistant.launcherOpen}
          className="flex h-12 items-center gap-2.5 rounded-full border border-[#F59E0B]/60 bg-[#042544] py-1.5 pl-1.5 pr-2 text-white shadow-xl transition-colors hover:bg-[#0B3C6A] sm:pr-4 cursor-pointer"
        >
          <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-[#F59E0B] bg-[#0B3C6A] shrink-0">
            {!avatarImgError ? (
              <img
                src="/src/assets/images/avatar_camila_diadema_gorra_1794928428906.jpg"
                alt="Camila PostCargo AI"
                referrerPolicy="no-referrer"
                onError={() => setAvatarImgError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
            )}
          </div>
          <span className="hidden text-sm font-semibold whitespace-nowrap sm:inline">
            {assistantOpen ? t.assistant.launcherClose : t.assistant.launcherOpen}
          </span>
        </button>
      </div>
    </div>
  );
}
