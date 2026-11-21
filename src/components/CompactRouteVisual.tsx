import { useCallback, useEffect, useRef, useState } from 'react';
import { Clock, Compass, Mountain, Navigation, Truck } from 'lucide-react';
import type { Language } from '../utils/logistics';
import {
  ROUTE_AREA_PATH,
  ROUTE_STOPS,
  ROUTE_SVG_PATH,
  clamp,
  computeRouteTelemetry,
} from '../utils/routeAnimation';

export default function CompactRouteVisual({ lang = 'es' }: { lang?: Language }) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const routeRef = useRef<HTMLElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [scrollDistancePx, setScrollDistancePx] = useState(560);

  useEffect(() => {
    let frame = 0;

    const updateProgress = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
          const stage = stageRef.current;
          if (!stage) return;

          const rect = stage.getBoundingClientRect();
          const stickyTop = window.innerWidth < 640 ? 64 : 72;
          const visualHeight = routeRef.current?.offsetHeight ?? window.innerHeight * 0.65;
          const distance = Math.max(
            220,
            rect.height - visualHeight - stickyTop
          );
          setScrollDistancePx((prev) => (Math.abs(prev - distance) < 2 ? prev : distance));

          const nextProgress = clamp((stickyTop - rect.top) / distance, 0, 1);
        setProgress((current) =>
          Math.abs(current - nextProgress) < 0.0015 ? current : nextProgress
        );
      });
    };

    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);

    return () => {
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
      cancelAnimationFrame(frame);
    };
  }, []);

  const handleJumpToStop = useCallback(
    (targetProgress: number) => {
      const stageTop =
        (stageRef.current?.getBoundingClientRect().top ?? 0) + window.scrollY;
      const stickyTop = window.innerWidth < 640 ? 64 : 72;
      const targetScroll = Math.round(stageTop - stickyTop + targetProgress * scrollDistancePx);
      window.scrollTo({ top: targetScroll, behavior: 'smooth' });
    },
    [scrollDistancePx]
  );

  const telemetry = computeRouteTelemetry(progress, lang);
  const revealClipWidth = Math.max(82, telemetry.point.x + 18);
  const wheelAngle = Math.round(telemetry.progress * 1080);

  const stageTheme =
    telemetry.stage === 'trunk_truck'
      ? {
          pillClass: 'border-sky-400/45 bg-sky-500/15 text-sky-200',
          accentHex: '#38BDF8',
          badgeTitle:
            lang === 'en' ? 'Trunk Truck NPR' : 'Camión Troncal NPR',
        }
      : telemetry.stage === 'nkr_truck'
        ? {
            pillClass: 'border-[#F59E0B]/60 bg-[#F59E0B]/20 text-amber-200',
            accentHex: '#F59E0B',
            badgeTitle: lang === 'en' ? 'NKR Regional Relay' : 'Relevo Regional NKR',
          }
        : telemetry.stage === 'jeep'
          ? {
              pillClass: 'border-orange-400/60 bg-orange-500/20 text-orange-200',
              accentHex: '#FB923C',
              badgeTitle: lang === 'en' ? 'Jeep 4x4 Rural Access' : 'Jeep 4x4 Acceso Rural',
            }
        : {
            pillClass: 'border-emerald-400/60 bg-emerald-500/20 text-emerald-200',
            accentHex: '#10B981',
            badgeTitle: lang === 'en'
              ? 'Final Last-Mile Motorcycle'
              : 'Motocicleta Última Milla',
          };

  return (
    <div
      ref={stageRef}
      className="relative h-[115svh] sm:h-[125svh]"
    >
      <section
      ref={routeRef}
      aria-label={
        lang === 'en'
          ? 'Animated mountain & last-mile reexpedition route from Bogotá to San José del Guaviare'
          : 'Gráfico animado de elevación y relevo de carga de Bogotá a San José del Guaviare'
      }
      className="sticky top-[64px] sm:top-[72px] relative max-h-[calc(100dvh-72px)] sm:max-h-[calc(100dvh-88px)] rounded-2xl border border-white/15 bg-[linear-gradient(180deg,rgba(4,37,68,0.88)_0%,rgba(2,24,46,0.96)_100%)] px-3 py-3 sm:px-6 sm:py-5 shadow-2xl shadow-black/40 overflow-hidden"
      data-testid="scroll-route-visual"
      data-stage={telemetry.stage}
      data-progress={telemetry.progress.toFixed(2)}
    >
      {/* Subtle top edge glow bar synced to route completion */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[2px] bg-white/10"
      >
        <div
          className="h-full bg-gradient-to-r from-[#38BDF8] via-[#F59E0B] to-[#10B981] transition-[width] duration-75"
          style={{ width: `${Math.round(telemetry.progress * 100)}%` }}
        />
      </div>

      {/* Header & Live Telemetry HUD */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <h2 className="font-display text-sm sm:text-base font-bold text-[#F59E0B] flex items-center gap-2">
            <Compass className="w-4 h-4 shrink-0" />
            <span>
              {lang === 'en'
                ? 'How your cargo reaches the final destination'
                : 'Así llega su carga al destino final'}
            </span>
          </h2>
          <p className="text-xs text-slate-300">
            {telemetry.terrainNotice} ·{' '}
            <span className="text-sky-200 font-medium">
              {lang === 'en'
                ? 'Scroll to drive the route or tap any checkpoint'
                : 'Haz scroll para avanzar el trayecto o toca un punto'}
            </span>
          </p>
        </div>

        {/* Live Telemetry Readouts */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs font-mono tabular-nums">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-white/15 bg-white/[0.04] text-slate-200">
            <Mountain className="w-3.5 h-3.5 text-sky-300 shrink-0" />
            <span>{telemetry.altitudeMeters.toLocaleString('es-CO')} m</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-white/15 bg-white/[0.04] text-amber-200">
            <Clock className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />
            <span>{telemetry.elapsedLabel}</span>
          </div>

          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-sans font-bold transition-colors duration-200 ${stageTheme.pillClass}`}
            data-testid="route-active-vehicle-badge"
          >
            <Truck className="w-3.5 h-3.5 shrink-0" />
            <span>{telemetry.stageBadge}</span>
          </div>
        </div>
      </div>

      {/* Cinematic Layered Elevation & Reexpedition SVG Canvas */}
      <div className="relative mt-3 rounded-xl border border-white/10 bg-[#021222]/85 overflow-hidden">
        <svg
          aria-labelledby="compact-route-title compact-route-description"
          className="block h-[160px] w-full sm:h-[210px] lg:h-[230px]"
          fill="none"
          role="img"
          viewBox="0 0 960 210"
          preserveAspectRatio="xMidYMid meet"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title id="compact-route-title">
            {lang === 'en'
              ? 'Animated multi-vehicle rural reexpedition corridor'
              : 'Corredor animado de reexpedición rural con cambio de vehículo'}
          </title>
          <desc id="compact-route-description">
            {lang === 'en'
              ? 'Interactive elevation profile: a trunk truck climbs the Andes from Bogotá and descends to Villavicencio, transfers cargo to a 4x4 utility, and switches to a specialized last-mile unit in Granada before reaching San José del Guaviare.'
              : 'Perfil de elevación animado: un camión troncal sube la cordillera desde Bogotá y desciende a Villavicencio, realiza relevo cross-docking a un campero 4x4 y cambia a unidad ágil de última milla en Granada hasta entregar en San José del Guaviare.'}
          </desc>

          <defs>
            {/* Atmospheric sky depth */}
            <linearGradient id="route-sky-grad" x1="0" y1="0" x2="0" y2="210">
              <stop offset="0%" stopColor="#07284A" stopOpacity="0.55" />
              <stop offset="65%" stopColor="#03192E" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#021222" stopOpacity="0.9" />
            </linearGradient>

            {/* Progressive terrain fill gradient */}
            <linearGradient id="route-terrain-fill" x1="76" y1="45" x2="884" y2="210" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.26" />
              <stop offset="0.38" stopColor="#F59E0B" stopOpacity="0.24" />
              <stop offset="0.72" stopColor="#F59E0B" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.28" />
            </linearGradient>

            {/* Active road stroke gradient */}
            <linearGradient id="route-road-active" x1="76" y1="100" x2="884" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="0.38" stopColor="#F59E0B" />
              <stop offset="0.72" stopColor="#FB923C" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>

            {/* Ambient vehicle spotlight */}
            <radialGradient id="vehicle-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={stageTheme.accentHex} stopOpacity="0.45" />
              <stop offset="60%" stopColor={stageTheme.accentHex} stopOpacity="0.12" />
              <stop offset="100%" stopColor={stageTheme.accentHex} stopOpacity="0" />
            </radialGradient>

            {/* Progressive horizontal reveal clip */}
            <clipPath id="route-reveal-clip">
              <rect x="0" y="0" width={revealClipWidth} height="210" />
            </clipPath>
          </defs>

          {/* Background Sky & Topographic Altitude Grid */}
          <rect x="0" y="0" width="960" height="210" fill="url(#route-sky-grad)" />
          <g stroke="white" strokeOpacity="0.06" strokeDasharray="3 6">
            <line x1="20" y1="42" x2="940" y2="42" />
            <line x1="20" y1="98" x2="940" y2="98" />
            <line x1="20" y1="184" x2="940" y2="184" />
          </g>
          <g fill="#94A3B8" fillOpacity="0.5" fontSize="9" fontFamily="monospace">
            <text x="14" y="38">3.200 m</text>
            <text x="14" y="94">2.600 m</text>
            <text x="14" y="180">200 m</text>
          </g>

          {/* Far Mountain Range Backdrop (Subtle Parallax Silhouette) */}
          <path
            d="M 0 165 L 88 92 L 176 42 L 265 112 L 355 128 L 448 64 L 542 122 L 642 132 L 732 82 L 826 118 L 960 98 L 960 210 L 0 210 Z"
            fill="#072F54"
            fillOpacity="0.45"
          />
          <path
            d="M 0 182 L 118 118 L 210 68 L 315 142 L 420 112 L 515 148 L 620 138 L 728 96 L 842 130 L 960 116 L 960 210 L 0 210 Z"
            fill="#041F3A"
            fillOpacity="0.72"
          />

          {/* Ghost Preview of Full Mountain Road (Before Vehicle Reaches It) */}
          <path
            d={ROUTE_AREA_PATH}
            fill="#0B3C6A"
            fillOpacity="0.14"
          />
          <path
            d={ROUTE_SVG_PATH}
            stroke="white"
            strokeOpacity="0.14"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d={ROUTE_SVG_PATH}
            stroke="white"
            strokeDasharray="4 8"
            strokeOpacity="0.28"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* PROGRESSIVELY ILLUMINATED TERRAIN, VIADUCTS & ROAD (Reveals as Transport Advances) */}
          <g clipPath="url(#route-reveal-clip)">
            {/* Illuminated terrain volume underneath route */}
            <path d={ROUTE_AREA_PATH} fill="url(#route-terrain-fill)" />

            {/* Cordillera viaduct pillars & mountain bridge piers */}
            <g stroke="#38BDF8" strokeOpacity="0.32" strokeWidth="2">
              <line x1="168" y1="68" x2="168" y2="195" />
              <line x1="202" y1="84" x2="202" y2="195" />
              <line x1="452" y1="108" x2="452" y2="195" />
              <line x1="484" y1="115" x2="484" y2="195" />
              <line x1="726" y1="118" x2="726" y2="195" />
            </g>

            {/* Dark Asphalt Highway Base */}
            <path
              d={ROUTE_SVG_PATH}
              stroke="#081A2E"
              strokeWidth="11"
              strokeLinecap="round"
            />

            {/* Illuminated Colored Highway Core */}
            <path
              d={ROUTE_SVG_PATH}
              stroke="url(#route-road-active)"
              strokeWidth="4.5"
              strokeLinecap="round"
            />

            {/* Bright Highway Center Dashed Markings */}
            <path
              d={ROUTE_SVG_PATH}
              stroke="#F8FAFC"
              strokeDasharray="6 9"
              strokeOpacity="0.7"
              strokeWidth="1.2"
              strokeLinecap="round"
            />

            {/* Last-Mile Rural / Unpaved Zone Highlight Markers (Granada -> Guaviare) */}
            <g fill="#10B981" fillOpacity="0.55">
              <circle cx="678" cy="130" r="1.8" />
              <circle cx="705" cy="121" r="2" />
              <circle cx="746" cy="117" r="1.8" />
              <circle cx="792" cy="126" r="2" />
              <circle cx="838" cy="131" r="1.8" />
            </g>
          </g>

          {/* Zone Segment Architectural Labels Inside Top Band (Zero Overlap With Vehicle Callout) */}
          <g fontFamily="sans-serif" fontSize="10" fontWeight="700">
            <text
              x="212"
              y="22"
              textAnchor="middle"
              fill={progress > 0.08 ? '#7DD3FC' : '#64748B'}
            >
              {lang === 'en' ? '1. Cordillera · Trunk NPR' : '1. Cordillera · Troncal NPR'}
            </text>
            <text
              x="500"
              y="22"
              textAnchor="middle"
              fill={progress >= 0.36 ? '#FCD34D' : '#64748B'}
            >
              {lang === 'en' ? '2. Piedemonte · 4x4 Traction' : '2. Piedemonte · Tracción 4x4'}
            </text>
            <text
              x="772"
              y="22"
              textAnchor="middle"
              fill={progress >= 0.72 ? '#6EE7B7' : '#64748B'}
            >
              {lang === 'en' ? '3. Last-Mile Unit Switch' : '3. Cambio a Última Milla'}
            </text>
          </g>

          {/* Checkpoint Stations & Progressive Landmark Illumination */}
          {ROUTE_STOPS.map((stop, idx) => {
            const reached = progress >= stop.progress;
            const isCurrent = telemetry.activeStopIndex === idx;
            const ringColor =
              idx === 0
                ? '#38BDF8'
                : idx === 1 || idx === 2
                  ? '#F59E0B'
                  : '#10B981';

            return (
              <g
                key={stop.id}
                transform={`translate(${stop.point.x} ${stop.point.y})`}
                className="transition-opacity duration-300"
                opacity={reached ? 1 : 0.42}
              >
                {/* Vertical beacon stem to label */}
                <line
                  x1="0"
                  y1="0"
                  x2="0"
                  y2={idx % 2 === 0 ? 30 : 28}
                  stroke={reached ? ringColor : '#475569'}
                  strokeWidth="1.5"
                  strokeDasharray={reached ? undefined : '2 3'}
                />

                {/* Pulse halo on active checkpoint */}
                {isCurrent && (
                  <circle
                    r="21"
                    fill={ringColor}
                    fillOpacity="0.22"
                    stroke={ringColor}
                    strokeOpacity="0.65"
                    strokeWidth="1.2"
                  />
                )}

                <circle
                  r="13"
                  fill={reached ? '#042544' : '#02182E'}
                  stroke={reached ? ringColor : '#64748B'}
                  strokeWidth={reached ? '2.5' : '1.5'}
                />

                {/* Distinct Landmark Icon inside each station node */}
                {idx === 0 && (
                  <path
                    d="M-6 4V-2l6-4 6 4v6h-4V0h-4v4H-6Z"
                    fill={reached ? '#F8FAFC' : '#94A3B8'}
                  />
                )}
                {idx === 1 && (
                  <path
                    d="M-6-2h12M-4-5l-3 3 3 3M4 5l3-3-3-3M-6 2h12"
                    stroke={reached ? '#FCD34D' : '#94A3B8'}
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
                {idx === 2 && (
                  <path
                    d="M-6 4 0-5l6 9M-3.5 1h7"
                    stroke={reached ? '#FCD34D' : '#94A3B8'}
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
                {idx === 3 && (
                  <path
                    d="M-5 0.5 1.5 4.5 6 -4"
                    stroke={reached ? '#6EE7B7' : '#94A3B8'}
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Station Callout Pill Directly Below Node */}
                <g transform={`translate(0 ${idx % 2 === 0 ? 44 : 42})`}>
                  <text
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="700"
                    fill={reached ? '#FFFFFF' : '#94A3B8'}
                  >
                    {stop[lang].place.split(' / ')[0]}
                  </text>
                  <text
                    y="12"
                    textAnchor="middle"
                    fontSize="8.5"
                    fontFamily="monospace"
                    fill={reached ? ringColor : '#64748B'}
                  >
                    {stop[lang].time}
                  </text>
                </g>
              </g>
            );
          })}

          {/* AMBIENT VEHICLE TRACKING SPOTLIGHT + SLOPE-ROTATED VEHICLES */}
          <g
            transform={`translate(${telemetry.point.x} ${telemetry.point.y})`}
          >
            <circle r="44" fill="url(#vehicle-glow)" />

            {/* Unified Vehicle & Transition Tag Floating Above Active Vehicle */}
            <g transform="translate(0 -34)">
              <rect
                x="-64"
                y="-12"
                width="128"
                height="18"
                rx="5"
                fill="#02182E"
                fillOpacity="0.94"
                stroke={stageTheme.accentHex}
                strokeWidth="1.3"
              />
              <text
                y="0"
                textAnchor="middle"
                fontSize="8.5"
                fontWeight="700"
                fill="#FFFFFF"
              >
                {stageTheme.badgeTitle}
              </text>
            </g>

            {/* Slope-Tilted Vehicle Rig */}
            <g transform={`translate(0 -8) rotate(${telemetry.angleDeg.toFixed(2)})`}>
              {/* VEHICLE 1: TRUNK TRUCK NPR / TURBO (Bogotá -> Villavicencio) */}
              <g data-testid="route-truck" opacity={telemetry.trunkOpacity}>
                {/* Headlight beam cone */}
                <polygon
                  points="24,-7 62,-16 62,2 24,-2"
                  fill="#38BDF8"
                  fillOpacity="0.22"
                />
                {/* Chassis shadow */}
                <ellipse cx="0" cy="4" rx="28" ry="3.5" fill="#000000" fillOpacity="0.45" />
                {/* Insulated cargo box */}
                <rect x="-26" y="-20" width="33" height="19" rx="2" fill="#F8FAFC" />
                <rect x="-26" y="-12" width="33" height="3.5" fill="#0B3C6A" />
                <rect x="-26" y="-8.5" width="33" height="2" fill="#F59E0B" />
                {/* Aerodynamic NPR cab */}
                <path d="M8 -16 H20 L27 -7 V-1 H8 Z" fill="#38BDF8" />
                <path d="M11 -13 H18 L23 -7 H11 Z" fill="#042544" />
                <rect x="25" y="-5" width="2.5" height="2.5" fill="#FEF08A" />
                <path d="M-26 -1 H27" stroke="#1E293B" strokeWidth="3" />
                {/* Rotating Wheels */}
                <g transform={`translate(-16 2) rotate(${wheelAngle})`}>
                  <circle r="4.5" fill="#042544" stroke="#F8FAFC" strokeWidth="1.8" />
                  <line x1="-2.5" y1="0" x2="2.5" y2="0" stroke="#38BDF8" strokeWidth="1.2" />
                </g>
                <g transform={`translate(17 2) rotate(${wheelAngle})`}>
                  <circle r="4.5" fill="#042544" stroke="#F8FAFC" strokeWidth="1.8" />
                  <line x1="-2.5" y1="0" x2="2.5" y2="0" stroke="#38BDF8" strokeWidth="1.2" />
                </g>
              </g>

              {/* VEHICLE 2: NKR REGIONAL TRUCK (Villavicencio -> Granada) */}
              <g data-testid="route-nkr" opacity={telemetry.nkrTruckOpacity}>
                {/* Warm amber off-road beam */}
                <polygon
                  points="21,-6 58,-15 58,3 21,-1"
                  fill="#F59E0B"
                  fillOpacity="0.25"
                />
                <ellipse cx="0" cy="4.5" rx="25" ry="3.5" fill="#000000" fillOpacity="0.45" />
                {/* NKR cargo box with visible package */}
                <rect x="-21" y="-23" width="27" height="18" rx="2" fill="#F8FAFC" stroke="#F59E0B" strokeWidth="1.5" />
                <rect x="-16" y="-18" width="8" height="7" rx="1" fill="#F59E0B" />
                <path d="M-12 -18v7M-16 -14h8" stroke="#042544" strokeWidth="1" />
                {/* NKR cab */}
                <path d="M6 -16 H18 L24 -8 V-1 H6 Z" fill="#F59E0B" />
                <path d="M9 -13 H16 L21 -8 H9 Z" fill="#042544" />
                <circle cx="-6" cy="-21" r="1.8" fill="#FEF08A" />
                <path d="M2 -14 H10 L15 -8 H2 Z" fill="#042544" />
                <rect x="17" y="-5" width="2.5" height="2.5" fill="#FEF08A" />
                <path d="M-22 -1 H19" stroke="#0F172A" strokeWidth="3.2" />
                {/* High-clearance rugged 4x4 tires */}
                <g transform={`translate(-13 2) rotate(${wheelAngle})`}>
                  <circle r="5" fill="#042544" stroke="#F8FAFC" strokeWidth="2" />
                  <line x1="-3" y1="0" x2="3" y2="0" stroke="#F59E0B" strokeWidth="1.4" />
                </g>
                <g transform={`translate(12 2) rotate(${wheelAngle})`}>
                  <circle r="5" fill="#042544" stroke="#F8FAFC" strokeWidth="2" />
                  <line x1="-3" y1="0" x2="3" y2="0" stroke="#F59E0B" strokeWidth="1.4" />
                </g>
              </g>

              {/* VEHICLE 3: JEEP 4x4 (Granada -> Last-Mile relay) */}
              <g data-testid="route-jeep" opacity={telemetry.jeepOpacity}>
                {/* Emerald-white last-mile headlight */}
                <polygon
                  points="19,-6 54,-14 54,3 19,-1"
                  fill="#10B981"
                  fillOpacity="0.24"
                />
                <ellipse cx="0" cy="4" rx="22" ry="3.2" fill="#000000" fillOpacity="0.45" />
                {/* Compact high-roof agile Last-Mile Van / Delivery Unit */}
                <path
                  d="M-19 -18 H6 L16 -9 V-1 H-19 Z"
                  fill="#F8FAFC"
                  stroke="#10B981"
                  strokeWidth="1.6"
                />
                <rect x="-19" y="-9" width="35" height="4" fill="#10B981" />
                {/* Side package & check emblem */}
                <rect x="-14" y="-15" width="9" height="6" rx="1" fill="#F59E0B" />
                {/* Windshield */}
                <path d="M4 -15 H8 L13 -9 H4 Z" fill="#042544" />
                {/* Rooftop Active Last-Mile GPS Beacon */}
                <circle cx="-4" cy="-21" r="2.5" fill="#10B981" stroke="#F8FAFC" strokeWidth="1.2" />
                <rect x="14.5" y="-5" width="2.5" height="2.2" fill="#FEF08A" />
                {/* Nimble Wheels */}
                <g transform={`translate(-11 2) rotate(${wheelAngle})`}>
                  <circle r="4.2" fill="#042544" stroke="#F8FAFC" strokeWidth="1.8" />
                  <line x1="-2.2" y1="0" x2="2.2" y2="0" stroke="#10B981" strokeWidth="1.4" />
                </g>
                <g transform={`translate(10 2) rotate(${wheelAngle})`}>
                  <circle r="4.2" fill="#042544" stroke="#F8FAFC" strokeWidth="1.8" />
                  <line x1="-2.2" y1="0" x2="2.2" y2="0" stroke="#10B981" strokeWidth="1.4" />
                </g>
              </g>

              {/* VEHICLE 4: MOTORCYCLE WITH PACKAGE (final last mile) */}
              <g data-testid="route-motorcycle" opacity={telemetry.motorcycleOpacity}>
                <polygon
                  points="18,-5 48,-12 48,3 18,-1"
                  fill="#10B981"
                  fillOpacity="0.22"
                />
                <ellipse cx="0" cy="5" rx="18" ry="2.8" fill="#000000" fillOpacity="0.45" />
                <g transform={`translate(-12 3) rotate(${wheelAngle})`}>
                  <circle r="4.5" fill="#042544" stroke="#F8FAFC" strokeWidth="1.5" />
                  <circle r="1" fill="#10B981" />
                </g>
                <g transform={`translate(12 3) rotate(${wheelAngle})`}>
                  <circle r="4.5" fill="#042544" stroke="#F8FAFC" strokeWidth="1.5" />
                  <circle r="1" fill="#10B981" />
                </g>
                <path d="M-9 1 0-7 9 1" fill="none" stroke="#F8FAFC" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M-1 -7H7" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
                {/* Package remains visible on every last-mile stage */}
                <rect x="-5" y="-18" width="10" height="9" rx="1.5" fill="#F59E0B" stroke="#F8FAFC" strokeWidth="1" />
                <path d="M0 -18v9M-5 -14h10" stroke="#042544" strokeWidth="1" />
              </g>
            </g>
          </g>
        </svg>
      </div>

      {/* Mobile route stages stay compact and visible while the visual remains sticky */}
      <div className="mt-2 sm:hidden">
        <div className="grid grid-cols-4 gap-1.5" aria-label={lang === 'en' ? 'Route stages' : 'Etapas de ruta'}>
          {[
            lang === 'en' ? 'NPR' : 'NPR',
            'NKR',
            '4x4',
            lang === 'en' ? 'Moto' : 'Moto',
          ].map((label, index) => (
            <div
              key={label}
              className={`rounded-md border px-1 py-1.5 text-center text-[9px] font-bold ${
                telemetry.progress >= [0, 0.36, 0.58, 0.72][index]
                  ? 'border-[#F59E0B]/70 bg-[#F59E0B]/15 text-amber-200'
                  : 'border-white/10 bg-white/[0.03] text-slate-500'
              }`}
            >
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* PROGRESSIVELY ILLUMINATED MILESTONE TIMELINE CARDS */}
      <div className="relative mt-4 hidden space-y-2.5 sm:block">
        {/* Clean Step Connector Rail Above Cards */}
        <div className="hidden sm:block relative h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
          <div
            aria-hidden="true"
            className="h-full bg-gradient-to-r from-[#38BDF8] via-[#F59E0B] to-[#10B981] rounded-full transition-[width] duration-75"
            style={{ width: `${Math.round(telemetry.progress * 100)}%` }}
          />
        </div>

        <ol
          aria-label={lang === 'en' ? 'Route checkpoints timeline' : 'Línea de tiempo de puntos de control'}
          className="relative grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3"
        >
          {ROUTE_STOPS.map((stop, index) => {
            const reached = telemetry.progress >= stop.progress;
            const current = index === telemetry.activeStopIndex;
            const copy = stop[lang];

            const cardBorder = current
              ? index === 3
                ? 'border-emerald-400 bg-emerald-500/15 shadow-lg shadow-emerald-950/40'
                : index === 0
                  ? 'border-sky-400 bg-sky-500/15 shadow-lg shadow-sky-950/40'
                  : 'border-[#F59E0B] bg-[#F59E0B]/15 shadow-lg shadow-amber-950/40'
              : reached
                ? 'border-white/25 bg-white/[0.06]'
                : 'border-white/10 bg-[#02182E]/50 opacity-45';

            const dotStyle = current
              ? index === 3
                ? 'border-emerald-300 bg-emerald-400 ring-4 ring-emerald-400/25'
                : index === 0
                  ? 'border-sky-300 bg-sky-400 ring-4 ring-sky-400/25'
                  : 'border-amber-200 bg-[#F59E0B] ring-4 ring-[#F59E0B]/25'
              : reached
                ? 'border-[#F59E0B] bg-[#F59E0B]'
                : 'border-slate-500 bg-[#042544]';

            return (
              <li
                key={stop.id}
                aria-current={current ? 'step' : undefined}
                className="min-w-0"
              >
                <button
                  type="button"
                  onClick={() => handleJumpToStop(stop.progress === 0 ? 0 : Math.min(1, stop.progress + 0.02))}
                  className={`w-full text-left rounded-xl border p-3 transition-all duration-300 cursor-pointer ${cardBorder}`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span
                      aria-hidden="true"
                      className={`h-2.5 w-2.5 rounded-full border transition-all duration-300 ${dotStyle}`}
                    />
                    <time
                      className={`text-[10.5px] font-mono font-bold tabular-nums ${
                        reached ? 'text-[#F59E0B]' : 'text-slate-400'
                      }`}
                    >
                      {copy.time}
                    </time>
                  </div>

                  <p
                    className={`font-display text-xs sm:text-sm font-bold leading-tight truncate ${
                      reached ? 'text-white' : 'text-slate-300'
                    }`}
                  >
                    {copy.place}
                  </p>

                  <div className="mt-1.5 flex items-center justify-between gap-1.5 text-[10px]">
                    <span
                      className={`font-medium truncate ${
                        current ? 'text-sky-200' : reached ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      {copy.vehicleLabel}
                    </span>
                    <span
                      className={`font-mono shrink-0 tabular-nums ${
                        reached ? 'text-amber-200' : 'text-slate-500'
                      }`}
                    >
                      {copy.elapsed}
                    </span>
                  </div>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Accessibility live status note */}
      <div className="mt-2.5 flex items-center justify-between gap-2 text-[11px] text-slate-300">
        <span className="inline-flex items-center gap-1.5">
          <Navigation className="w-3 h-3 text-[#F59E0B] shrink-0" />
          <span>
            {lang === 'en'
              ? 'Fleet transfer: Trunk NPR → NKR → Jeep 4x4 → Motorcycle'
              : 'Relevo de flota: Troncal NPR → NKR → Jeep 4x4 → Motocicleta'}
          </span>
        </span>
        <span className="font-mono font-semibold text-amber-200 tabular-nums">
          {Math.round(telemetry.progress * 100)}%
        </span>
      </div>
    </section>
    </div>
  );
}
