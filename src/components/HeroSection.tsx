import { FormEvent, useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  MapPin,
  Navigation,
  Play,
  RotateCcw,
  Search,
  Truck,
} from 'lucide-react';
import CompactRouteVisual from './CompactRouteVisual';
import type { Translations } from '../i18n/translations';
import {
  findTrackedShipment,
  validateHeroMeetingForm,
  type HeroMeetingForm,
  type Language,
  type SiscoreShipment,
  type SiscoreStatus,
} from '../utils/logistics';

interface HeroSectionProps {
  lang: Language;
  t: Translations['hero'];
  statusLabels: Record<SiscoreStatus, string>;
  shipments: SiscoreShipment[];
  externalTrackingTrigger?: { query: string; nonce: number } | null;
  onScrollToCalculator: () => void;
}

const POSTCARGO_CAMPAIGN_URL =
  'https://www.postcargo.co/conozca-postcargo/?utm_source=pdf&utm_medium=presentacion&utm_campaign=comercial-2026';

const INITIAL_MEETING_FORM: HeroMeetingForm = {
  fullName: '',
  company: '',
  email: '',
  phone: '',
  monthlyShipments: '',
  operationType: '',
  criticalDestinations: '',
  acceptedPolicy: false,
};

const QUICK_TRACKING_SAMPLES = ['#1024', 'REM-4091', '#8841', 'FAC-8859'];

function TrackingStatusBadge({
  status,
  label,
}: {
  status: SiscoreStatus;
  label: string;
}) {
  if (status === 'Entregado') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300">
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
        <span>{label}</span>
      </span>
    );
  }
  if (status === 'Alerta Vial') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-300">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
        <span>{label}</span>
      </span>
    );
  }
  if (status === 'En Reexpedición') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F59E0B]">
        <Navigation className="w-3.5 h-3.5 shrink-0" />
        <span>{label}</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-300">
      <Clock className="w-3.5 h-3.5 shrink-0" />
      <span>{label}</span>
    </span>
  );
}

export default function HeroSection({
  lang,
  t,
  statusLabels,
  shipments,
  externalTrackingTrigger,
  onScrollToCalculator,
}: HeroSectionProps) {
  // Real-time SISCORE Hero tracking state
  const [trackingQuery, setTrackingQuery] = useState('');
  const [trackingError, setTrackingError] = useState('');
  const [submittedTrackingQuery, setSubmittedTrackingQuery] = useState<string | null>(null);
  const trackingInputRef = useRef<HTMLInputElement | null>(null);

  // Right column 15-min meeting scheduling state
  const [meetingForm, setMeetingForm] = useState<HeroMeetingForm>(INITIAL_MEETING_FORM);
  const [meetingErrors, setMeetingErrors] = useState<
    Partial<Record<keyof HeroMeetingForm, string>>
  >({});
  const [meetingConfirmedId, setMeetingConfirmedId] = useState<string | null>(null);

  useEffect(() => {
    if (externalTrackingTrigger?.query) {
      setTrackingQuery(externalTrackingTrigger.query);
      setTrackingError('');
      setSubmittedTrackingQuery(externalTrackingTrigger.query);
    }
  }, [externalTrackingTrigger]);

  const trackedShipment = submittedTrackingQuery
    ? findTrackedShipment(shipments, submittedTrackingQuery)
    : null;

  const runTrackingLookup = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) {
      setTrackingError(t.tracking.emptyError);
      setSubmittedTrackingQuery(null);
      return;
    }
    setTrackingError('');
    setTrackingQuery(trimmed);
    setSubmittedTrackingQuery(trimmed);
  };

  const handleTrackingSubmit = (e: FormEvent) => {
    e.preventDefault();
    runTrackingLookup(trackingQuery);
  };

  const handleResetTracking = () => {
    setTrackingQuery('');
    setTrackingError('');
    setSubmittedTrackingQuery(null);
    trackingInputRef.current?.focus();
  };

  const handleMeetingSubmit = (e: FormEvent) => {
    e.preventDefault();
    const errors = validateHeroMeetingForm(meetingForm, lang);
    setMeetingErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setMeetingConfirmedId(`PC-REU-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  return (
    <section
      id="inicio"
      className="relative overflow-hidden bg-[radial-gradient(ellipse_at_top_left,_#0B3C6A_0%,_#042544_58%,_#02182E_100%)] text-white"
    >
      {/* Subtle Topographic / Route Network SVG Background */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 760"
        fill="none"
        className="absolute inset-0 w-full h-full object-cover opacity-15 pointer-events-none"
      >
        <g stroke="#38BDF8" strokeWidth="1" strokeOpacity="0.32">
          <path d="M-80 540 C 260 440, 460 180, 820 260 S 1220 120, 1520 60" strokeDasharray="6 6" />
          <path d="M120 640 C 420 500, 620 340, 960 390 S 1340 240, 1520 210" />
          <path d="M-40 220 C 280 260, 520 80, 880 150 S 1260 340, 1520 320" strokeDasharray="4 8" />
          <circle cx="480" cy="285" r="4" fill="#F59E0B" />
          <circle cx="820" cy="260" r="5" fill="#38BDF8" />
          <circle cx="1140" cy="185" r="4" fill="#F59E0B" />
        </g>
        <g stroke="#94A3B8" strokeWidth="0.7" strokeOpacity="0.18">
          <path d="M0 120 Q 360 40 720 140 T 1440 90" />
          <path d="M0 320 Q 400 220 760 340 T 1440 290" />
          <path d="M0 520 Q 340 430 780 540 T 1440 470" />
        </g>
      </svg>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 lg:pt-12 lg:pb-14 space-y-8">
        {/* 2-Column Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* LEFT COLUMN: Hook Headline, Real-Time Tracking Widget (BEFORE Video), Video, Metrics & CTA */}
          <div className="lg:col-span-7 space-y-5">
            <div>
              <h1
                className="font-display font-extrabold text-white tracking-[-0.025em] leading-[1.08]"
                style={{
                  fontSize: 'clamp(2rem, 3.65vw, 3.2rem)',
                  textWrap: 'balance',
                }}
              >
                {t.h1Start}{' '}
                <span className="text-[#F59E0B]">{t.h1Highlight}</span>
              </h1>

              <p className="mt-3.5 text-base sm:text-[17px] text-sky-100/90 leading-relaxed max-w-2xl">
                {t.subtitle}
              </p>
            </div>

            {/* COMPACT REAL-TIME TRACKING WIDGET (DIRECTLY BEFORE VIDEO) */}
            <div
              id="rastreo-hero"
              className="rounded-2xl border border-white/20 bg-[#02182E]/90 p-4 sm:p-5 shadow-xl shadow-black/30 space-y-3"
              data-testid="hero-tracking-widget"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label
                  htmlFor="hero-tracking-input"
                  className="font-display text-sm sm:text-[15px] font-bold text-white flex items-center gap-2"
                >
                  <Search className="w-4 h-4 text-[#F59E0B] shrink-0" />
                  <span>{t.tracking.title}</span>
                </label>

                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="text-slate-300">{t.tracking.quickLabel}</span>
                  {QUICK_TRACKING_SAMPLES.map((sample) => (
                    <button
                      key={sample}
                      type="button"
                      onClick={() => runTrackingLookup(sample)}
                      className="px-2 py-0.5 font-mono font-semibold text-sky-100 bg-white/10 hover:bg-[#F59E0B] hover:text-[#042544] rounded transition-colors cursor-pointer"
                    >
                      {sample}
                    </button>
                  ))}
                </div>
              </div>

              <form
                onSubmit={handleTrackingSubmit}
                className="flex flex-col sm:flex-row gap-2.5"
                noValidate
              >
                <div className="relative flex-1">
                  <input
                    ref={trackingInputRef}
                    id="hero-tracking-input"
                    type="text"
                    aria-label={t.tracking.inputAria}
                    value={trackingQuery}
                    onChange={(e) => {
                      setTrackingQuery(e.target.value);
                      if (trackingError) setTrackingError('');
                    }}
                    placeholder={t.tracking.inputPlaceholder}
                    className="w-full h-11 px-3.5 bg-white text-[#042544] placeholder:text-slate-500 border border-slate-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                  />
                </div>
                <button
                  type="submit"
                  className="h-11 px-5 bg-[#F59E0B] hover:bg-amber-400 text-[#042544] font-bold text-sm rounded-xl transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer shadow-md"
                >
                  <span>{t.tracking.submitButton}</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
              </form>

              {trackingError && (
                <p className="text-xs font-medium text-amber-300" role="alert">
                  {trackingError}
                </p>
              )}

              <p className="text-xs text-sky-100/90 leading-relaxed">
                {t.tracking.systemHint}
              </p>

              {/* REAL-TIME TRACEABILITY RESULT PANEL */}
              {submittedTrackingQuery && (
                <div
                  className="pt-3 border-t border-white/15 space-y-3"
                  data-testid="hero-tracking-result"
                >
                  {trackedShipment ? (
                    <div className="rounded-xl bg-[#042544] border border-white/15 p-4 space-y-3.5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-sky-200">
                            <span>
                              {t.tracking.invoiceLabel}:{' '}
                              <strong className="text-white">{trackedShipment.invoiceNumber}</strong>
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>
                              {t.tracking.waybillLabel}:{' '}
                              <strong className="text-white">
                                {trackedShipment.remissionNumber}
                              </strong>
                            </span>
                          </div>
                          <p className="font-display text-base font-bold text-white mt-1">
                            {trackedShipment.origin} → {trackedShipment.destination}
                          </p>
                          <p className="text-xs text-slate-300">{trackedShipment.clientName}</p>
                        </div>

                        <div className="text-right space-y-1">
                          <TrackingStatusBadge
                            status={trackedShipment.status}
                            label={statusLabels[trackedShipment.status]}
                          />
                          <p className="text-xs font-mono text-sky-200 tabular-nums">
                            {lang === 'en' && trackedShipment.etaLabelEn
                              ? trackedShipment.etaLabelEn
                              : trackedShipment.etaLabel}
                          </p>
                        </div>
                      </div>

                      {/* Progress + Active Vehicle */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#02182E]/80 border border-white/10 rounded-lg p-3 text-xs">
                        <div>
                          <div className="flex justify-between text-sky-200 mb-1">
                            <span>{t.tracking.progressLabel}</span>
                            <span className="font-mono font-bold text-[#F59E0B] tabular-nums">
                              {trackedShipment.progressPercent}%
                            </span>
                          </div>
                          <div className="w-full h-2 bg-white/15 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#F59E0B] rounded-full transition-all duration-300"
                              style={{ width: `${trackedShipment.progressPercent}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-slate-200">
                          <Truck className="w-4 h-4 text-[#F59E0B] shrink-0" />
                          <div className="min-w-0">
                            <span className="block text-[11px] text-slate-400">
                              {t.tracking.vehicleLabel}
                            </span>
                            <span className="font-semibold text-white truncate block">
                              {trackedShipment.vehicleLabel} ({trackedShipment.plate}) ·{' '}
                              {trackedShipment.carrierName}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Latest Operational Update */}
                      <div className="text-xs bg-white/[0.05] border border-white/10 rounded-lg p-2.5 text-sky-100">
                        <span className="font-semibold text-[#F59E0B]">
                          {t.tracking.latestReportLabel}:{' '}
                        </span>
                        <span>
                          {lang === 'en' && trackedShipment.realtimeAlertEn
                            ? trackedShipment.realtimeAlertEn
                            : trackedShipment.realtimeAlert}
                        </span>
                      </div>

                      {/* Real-time Checkpoints: City, Town, Warehouse, Hub, Vehicle */}
                      <div>
                        <p className="text-[11px] font-semibold text-sky-200 mb-2">
                          {t.tracking.routeTraceLabel}
                        </p>
                        <ol className="space-y-2">
                          {trackedShipment.milestones.map((m, idx) => (
                            <li key={`${m.location}-${idx}`} className="flex items-start gap-2.5 text-xs">
                              <MapPin
                                className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                                  m.completed ? 'text-[#F59E0B]' : 'text-slate-500'
                                }`}
                              />
                              <div className="min-w-0">
                                <p className="font-semibold text-white">
                                  <span className="font-mono text-sky-200 mr-1.5 tabular-nums">
                                    {lang === 'en' && m.timestampEn ? m.timestampEn : m.timestamp}
                                  </span>
                                  {m.location}
                                </p>
                                <p className="text-slate-300 leading-snug">
                                  {lang === 'en' && m.descriptionEn
                                    ? m.descriptionEn
                                    : m.description}
                                </p>
                              </div>
                            </li>
                          ))}
                        </ol>
                      </div>

                      <div className="pt-1 flex justify-end">
                        <button
                          type="button"
                          onClick={handleResetTracking}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#042544] bg-[#F59E0B] hover:bg-amber-400 rounded-lg transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>{t.tracking.tryAnotherButton}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl bg-[#042544] border border-[#F59E0B]/40 p-4 space-y-2.5">
                      <p className="text-sm font-bold text-[#F59E0B]">{t.tracking.notFoundTitle}</p>
                      <p className="text-xs text-slate-200 leading-relaxed">
                        {t.tracking.notFoundDesc}
                      </p>
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <div className="flex flex-wrap gap-1.5">
                          {QUICK_TRACKING_SAMPLES.map((sample) => (
                            <button
                              key={sample}
                              type="button"
                              onClick={() => runTrackingLookup(sample)}
                              className="px-2.5 py-1 text-xs font-mono font-semibold text-white bg-white/10 hover:bg-[#F59E0B] hover:text-[#042544] rounded-md transition-colors cursor-pointer"
                            >
                              {sample}
                            </button>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={handleResetTracking}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white border border-white/25 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>{t.tracking.tryAnotherButton}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Responsive 16:9 YouTube Commercial Video Frame */}
            <div className="rounded-2xl border border-white/15 bg-[#02182E]/90 shadow-2xl shadow-black/40 overflow-hidden">
              <div className="px-4 py-2.5 sm:px-5 border-b border-white/10 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-7 h-7 rounded-lg bg-[#F59E0B] flex items-center justify-center shrink-0">
                    <Play className="w-3.5 h-3.5 text-[#042544] fill-[#042544]" />
                  </span>
                  <p className="font-display text-sm font-bold text-white truncate">
                    {t.videoTitle}
                  </p>
                </div>
                <span className="text-xs font-medium text-sky-200">{t.videoBadge}</span>
              </div>

              <div className="relative w-full aspect-video bg-[#020B13]">
                <iframe
                  src="https://www.youtube.com/embed/vHaAG-PDqRg?rel=0"
                  title={t.videoIframeTitle}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full border-0"
                />
              </div>
            </div>

            {/* 3 Amber Impact Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/15 pt-1">
              {t.metrics.map((metric, index) => (
                <div
                  key={metric.label}
                  className={`py-2.5 sm:py-0 ${
                    index === 0 ? 'sm:pr-5' : index === 1 ? 'sm:px-5' : 'sm:pl-5'
                  }`}
                >
                  <p className="font-display text-2xl sm:text-[28px] font-extrabold text-[#F59E0B] tabular-nums leading-none">
                    {metric.value}
                  </p>
                  <p className="text-xs sm:text-[13px] text-sky-100/90 mt-1.5 leading-snug">
                    {metric.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Coverage Prompt + Dual Action */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
              <div className="text-sm text-sky-100">
                <span>{t.coveragePrompt} </span>
                <button
                  type="button"
                  onClick={onScrollToCalculator}
                  className="font-bold text-white underline decoration-[#F59E0B] decoration-2 underline-offset-4 hover:text-[#F59E0B] transition-colors cursor-pointer"
                >
                  {t.coverageCta}
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={onScrollToCalculator}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-[#042544] bg-[#F59E0B] hover:bg-amber-400 rounded-xl transition-colors shadow-lg shadow-black/25 cursor-pointer whitespace-nowrap"
                >
                  <span>{t.primaryCta}</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>

                <a
                  href={POSTCARGO_CAMPAIGN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white border border-white/25 bg-white/[0.05] hover:bg-white/[0.12] rounded-xl transition-colors whitespace-nowrap"
                >
                  <span>{t.secondaryCta}</span>
                  <ArrowUpRight className="w-4 h-4 text-[#F59E0B] shrink-0" />
                </a>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Clean White 15-Minute Consultation Scheduling Card */}
          <div className="lg:col-span-5">
            <div className="bg-white text-[#042544] rounded-2xl shadow-2xl shadow-black/35 overflow-hidden border border-slate-200/80">
              {/* Top Amber Accent Strip */}
              <div className="h-1.5 w-full bg-[#F59E0B]" aria-hidden="true" />

              <div className="p-6 sm:p-7">
                {meetingConfirmedId ? (
                  <div className="py-6 space-y-4" data-testid="hero-meeting-confirmation">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-[#B45309] flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h2 className="font-display text-xl font-bold text-[#042544]">
                      {t.meetingForm.confirmedTitle}
                    </h2>
                    <p className="text-xs font-mono font-semibold text-[#B45309]">
                      {t.meetingForm.confirmedFolioLabel}: {meetingConfirmedId}
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {t.meetingForm.confirmedBody}{' '}
                      <strong className="text-[#042544]">{meetingForm.email}</strong>.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setMeetingConfirmedId(null);
                        setMeetingForm(INITIAL_MEETING_FORM);
                        setMeetingErrors({});
                      }}
                      className="px-4 py-2.5 text-xs font-bold text-white bg-[#042544] hover:bg-[#0B3C6A] rounded-xl transition-colors cursor-pointer"
                    >
                      {t.meetingForm.resetButton}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleMeetingSubmit} className="space-y-3.5" noValidate>
                    <div>
                      <h2
                        className="font-display text-lg sm:text-xl font-bold text-[#042544] leading-snug"
                        style={{ textWrap: 'balance' }}
                      >
                        {t.meetingForm.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                        {t.meetingForm.subtitle}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label
                          htmlFor="hero-name"
                          className="block text-xs font-semibold text-[#042544] mb-1"
                        >
                          {t.meetingForm.nameLabel}
                        </label>
                        <input
                          id="hero-name"
                          type="text"
                          value={meetingForm.fullName}
                          onChange={(e) =>
                            setMeetingForm((p) => ({ ...p, fullName: e.target.value }))
                          }
                          placeholder={t.meetingForm.namePlaceholder}
                          className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-sm text-[#042544] placeholder:text-slate-400 focus:outline-none focus:border-[#042544] focus:ring-2 focus:ring-[#F59E0B]/30"
                        />
                        {meetingErrors.fullName && (
                          <p className="text-[11px] text-red-600 mt-1">{meetingErrors.fullName}</p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="hero-company"
                          className="block text-xs font-semibold text-[#042544] mb-1"
                        >
                          {t.meetingForm.companyLabel}
                        </label>
                        <input
                          id="hero-company"
                          type="text"
                          value={meetingForm.company}
                          onChange={(e) =>
                            setMeetingForm((p) => ({ ...p, company: e.target.value }))
                          }
                          placeholder={t.meetingForm.companyPlaceholder}
                          className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-sm text-[#042544] placeholder:text-slate-400 focus:outline-none focus:border-[#042544] focus:ring-2 focus:ring-[#F59E0B]/30"
                        />
                        {meetingErrors.company && (
                          <p className="text-[11px] text-red-600 mt-1">{meetingErrors.company}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label
                          htmlFor="hero-email"
                          className="block text-xs font-semibold text-[#042544] mb-1"
                        >
                          {t.meetingForm.emailLabel}
                        </label>
                        <input
                          id="hero-email"
                          type="email"
                          value={meetingForm.email}
                          onChange={(e) =>
                            setMeetingForm((p) => ({ ...p, email: e.target.value }))
                          }
                          placeholder={t.meetingForm.emailPlaceholder}
                          className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-sm text-[#042544] placeholder:text-slate-400 focus:outline-none focus:border-[#042544] focus:ring-2 focus:ring-[#F59E0B]/30"
                        />
                        {meetingErrors.email && (
                          <p className="text-[11px] text-red-600 mt-1">{meetingErrors.email}</p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="hero-phone"
                          className="block text-xs font-semibold text-[#042544] mb-1"
                        >
                          {t.meetingForm.phoneLabel}
                        </label>
                        <input
                          id="hero-phone"
                          type="tel"
                          value={meetingForm.phone}
                          onChange={(e) =>
                            setMeetingForm((p) => ({ ...p, phone: e.target.value }))
                          }
                          placeholder={t.meetingForm.phonePlaceholder}
                          className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-sm text-[#042544] placeholder:text-slate-400 focus:outline-none focus:border-[#042544] focus:ring-2 focus:ring-[#F59E0B]/30"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label
                          htmlFor="hero-shipments"
                          className="block text-xs font-semibold text-[#042544] mb-1"
                        >
                          {t.meetingForm.shipmentsLabel}
                        </label>
                        <select
                          id="hero-shipments"
                          value={meetingForm.monthlyShipments}
                          onChange={(e) =>
                            setMeetingForm((p) => ({ ...p, monthlyShipments: e.target.value }))
                          }
                          className="w-full h-10 px-2.5 bg-white border border-slate-300 rounded-lg text-sm text-[#042544] focus:outline-none focus:border-[#042544] focus:ring-2 focus:ring-[#F59E0B]/30"
                        >
                          <option value="">{t.meetingForm.selectPlaceholder}</option>
                          {t.meetingForm.shipmentsOptions.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                        {meetingErrors.monthlyShipments && (
                          <p className="text-[11px] text-red-600 mt-1">
                            {meetingErrors.monthlyShipments}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="hero-operation"
                          className="block text-xs font-semibold text-[#042544] mb-1"
                        >
                          {t.meetingForm.operationLabel}
                        </label>
                        <select
                          id="hero-operation"
                          value={meetingForm.operationType}
                          onChange={(e) =>
                            setMeetingForm((p) => ({ ...p, operationType: e.target.value }))
                          }
                          className="w-full h-10 px-2.5 bg-white border border-slate-300 rounded-lg text-sm text-[#042544] focus:outline-none focus:border-[#042544] focus:ring-2 focus:ring-[#F59E0B]/30"
                        >
                          <option value="">{t.meetingForm.selectPlaceholder}</option>
                          {t.meetingForm.operationOptions.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                        {meetingErrors.operationType && (
                          <p className="text-[11px] text-red-600 mt-1">
                            {meetingErrors.operationType}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="hero-destinations"
                        className="block text-xs font-semibold text-[#042544] mb-1"
                      >
                        {t.meetingForm.destinationsLabel}
                      </label>
                      <textarea
                        id="hero-destinations"
                        rows={2}
                        value={meetingForm.criticalDestinations}
                        onChange={(e) =>
                          setMeetingForm((p) => ({
                            ...p,
                            criticalDestinations: e.target.value,
                          }))
                        }
                        placeholder={t.meetingForm.destinationsPlaceholder}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm text-[#042544] placeholder:text-slate-400 focus:outline-none focus:border-[#042544] focus:ring-2 focus:ring-[#F59E0B]/30"
                      />
                    </div>

                    <div>
                      <label className="flex items-start gap-2.5 cursor-pointer text-[11.5px] text-slate-600 leading-snug">
                        <input
                          type="checkbox"
                          checked={meetingForm.acceptedPolicy}
                          onChange={(e) =>
                            setMeetingForm((p) => ({ ...p, acceptedPolicy: e.target.checked }))
                          }
                          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#042544] focus:ring-[#F59E0B]"
                        />
                        <span>
                          {t.meetingForm.policyPrefix}
                          <a
                            href={POSTCARGO_CAMPAIGN_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-[#0B3C6A] underline hover:text-[#042544]"
                          >
                            {t.meetingForm.policyLink}
                          </a>
                          {t.meetingForm.policySuffix}
                        </span>
                      </label>
                      {meetingErrors.acceptedPolicy && (
                        <p className="text-[11px] text-red-600 mt-1">
                          {meetingErrors.acceptedPolicy}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 px-5 bg-[#042544] hover:bg-[#0B3C6A] text-white font-bold text-sm rounded-xl transition-colors shadow-md cursor-pointer"
                    >
                      {t.meetingForm.submitButton}
                    </button>

                    <div className="pt-3 border-t border-slate-200 text-center text-xs text-slate-600">
                      <span>{t.meetingForm.whatsappPrefix} </span>
                      <a
                        href="https://wa.me/573125558901"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-[#0B3C6A] hover:text-[#B45309] transition-colors"
                      >
                        {t.meetingForm.whatsappLink}
                      </a>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Scroll-synced Route Visual */}
        <CompactRouteVisual lang={lang} />

        {/* 4 Value Pillars from PostCargo 2026 Presentation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-white/15 rounded-2xl bg-[#02182E]/50 divide-y sm:divide-y-0 sm:divide-x divide-white/15">
          {t.pillars.map((pillar) => (
            <div key={pillar.title} className="p-5">
              <h2 className="font-display text-sm sm:text-[15px] font-bold text-white flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] shrink-0" aria-hidden="true" />
                <span>{pillar.title}</span>
              </h2>
              <p className="mt-1.5 text-xs sm:text-[13px] text-slate-300 leading-relaxed">
                {pillar.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
