import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Calculator,
  Plane,
  Search,
} from 'lucide-react';
import type { Translations } from '../i18n/translations';
import {
  COLOMBIAN_DESTINATIONS,
  COLOMBIAN_ORIGINS,
  DEFAULT_COP_PER_USD,
  VEHICLE_TYPES,
  formatCop,
  formatTitleCase,
  formatUsd,
  searchDestinations,
  type Language,
  type ShippingEstimate,
  type VehicleTypeId,
} from '../utils/logistics';

interface LogisticsCalculatorProps {
  lang: Language;
  t: Translations['calculator'];
  originId: string;
  destinationId: string;
  vehicleId: VehicleTypeId;
  weightKg: number;
  declaredValueCop: number;
  secopInsured: boolean;
  estimate: ShippingEstimate;
  onChangeOrigin: (originId: string) => void;
  onChangeDestination: (destinationId: string) => void;
  onChangeVehicle: (vehicleId: VehicleTypeId) => void;
  onChangeWeight: (weightKg: number) => void;
  onChangeDeclaredValue: (valueCop: number) => void;
  onChangeSecopInsured: (insured: boolean) => void;
  onRequestQuote: () => void;
}

const SAMPLE_PRESETS = [
  {
    labelEs: 'Bogotá → San José del Guaviare',
    labelEn: 'Bogotá → San José del Guaviare',
    originId: 'BOGOTA',
    destinationId: 'SAN JOSE DEL GUAVIARE|GUAVIARE',
  },
  {
    labelEs: 'Medellín → Quibdó',
    labelEn: 'Medellín → Quibdó',
    originId: 'MEDELLIN',
    destinationId: 'QUIBDO|CHOCO',
  },
  {
    labelEs: 'Bogotá → Leticia (Multimodal)',
    labelEn: 'Bogotá → Leticia (Multimodal)',
    originId: 'BOGOTA',
    destinationId: 'LETICIA|AMAZONAS',
  },
  {
    labelEs: 'Bogotá → Quibdó (Especial)',
    labelEn: 'Bogotá → Quibdó (Special)',
    originId: 'BOGOTA',
    destinationId: 'QUIBDO|CHOCO',
  },
];

export default function LogisticsCalculator({
  lang,
  t,
  originId,
  destinationId,
  vehicleId,
  weightKg,
  declaredValueCop,
  secopInsured,
  estimate,
  onChangeOrigin,
  onChangeDestination,
  onChangeVehicle,
  onChangeWeight,
  onChangeDeclaredValue,
  onChangeSecopInsured,
  onRequestQuote,
}: LogisticsCalculatorProps) {
  const [destSearch, setDestSearch] = useState('');
  const [onlyOriginRoutes, setOnlyOriginRoutes] = useState(false);

  const filteredDestinations = useMemo(
    () =>
      searchDestinations(destSearch, onlyOriginRoutes ? originId : undefined),
    [destSearch, onlyOriginRoutes, originId]
  );

  // Ensure the currently selected destination remains selectable even if filtered list doesn't include it yet
  const dropdownDestinations = useMemo(() => {
    if (filteredDestinations.some((d) => d.id === destinationId)) {
      return filteredDestinations;
    }
    const current = COLOMBIAN_DESTINATIONS.find((d) => d.id === destinationId);
    return current ? [current, ...filteredDestinations] : filteredDestinations;
  }, [filteredDestinations, destinationId]);

  const handleSearchChange = (value: string) => {
    setDestSearch(value);
    if (value.trim()) {
      const matches = searchDestinations(
        value,
        onlyOriginRoutes ? originId : undefined
      );
      if (matches.length > 0 && !matches.some((m) => m.id === destinationId)) {
        onChangeDestination(matches[0].id);
      }
    }
  };

  const handleToggleOriginOnly = (checked: boolean) => {
    setOnlyOriginRoutes(checked);
    if (checked) {
      const matches = searchDestinations(destSearch, originId);
      if (matches.length > 0 && !matches.some((m) => m.id === destinationId)) {
        onChangeDestination(matches[0].id);
      }
    }
  };

  const handleOriginSelect = (newOriginId: string) => {
    onChangeOrigin(newOriginId);
    if (onlyOriginRoutes) {
      const matches = searchDestinations(destSearch, newOriginId);
      if (matches.length > 0 && !matches.some((m) => m.id === destinationId)) {
        onChangeDestination(matches[0].id);
      }
    }
  };

  const selectedVehicleSpec = VEHICLE_TYPES.find((v) => v.id === vehicleId);

  return (
    <section
      id="calculadora"
      className="py-16 lg:py-20 bg-[#F6F8FB] border-b border-slate-200/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-9">
          <h2
            className="font-display text-2xl sm:text-3xl font-bold text-[#042544]"
            style={{ textWrap: 'balance' }}
          >
            {t.sectionTitle}
          </h2>
          <p className="text-slate-600 mt-2.5 text-base leading-relaxed">
            {t.sectionSubtitle}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-slate-500">{t.presetsLabel}</span>
            {SAMPLE_PRESETS.map((preset) => {
              const active =
                originId === preset.originId && destinationId === preset.destinationId;
              return (
                <button
                  key={`${preset.originId}-${preset.destinationId}`}
                  type="button"
                  onClick={() => {
                    setDestSearch('');
                    setOnlyOriginRoutes(false);
                    onChangeOrigin(preset.originId);
                    onChangeDestination(preset.destinationId);
                  }}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                    active
                      ? 'border-[#042544] bg-[#042544] text-white ring-1 ring-[#F59E0B]'
                      : 'border-slate-300 bg-white text-[#042544] hover:border-[#B45309]'
                  }`}
                >
                  {lang === 'en' ? preset.labelEn : preset.labelEs}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Form */}
          <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-900/5 space-y-6">
            {/* Origin Selector */}
            <div>
              <label
                htmlFor="calc-origin"
                className="block text-sm font-semibold text-[#042544] mb-2"
              >
                {t.originLabel}
              </label>
              <select
                id="calc-origin"
                value={originId}
                onChange={(e) => handleOriginSelect(e.target.value)}
                className="w-full h-11 px-3.5 bg-white border border-slate-300 rounded-lg text-sm text-[#042544] focus:outline-none focus:border-[#042544] focus:ring-2 focus:ring-[#F59E0B]/30"
              >
                {COLOMBIAN_ORIGINS.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name} ({city.hubCode} · {city.routeCount} {t.routesSuffix})
                  </option>
                ))}
              </select>
            </div>

            {/* Searchable Destination Selector */}
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label
                  htmlFor="calc-destination"
                  className="block text-sm font-semibold text-[#042544]"
                >
                  {t.destinationLabel}
                </label>
                <span className="text-xs font-mono text-slate-500 tabular-nums">
                  {filteredDestinations.length.toLocaleString('es-CO')} {t.destinationsMatchedLabel}
                </span>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <label htmlFor="calc-dest-search" className="sr-only">
                  {t.destinationSearchPlaceholder}
                </label>
                <input
                  id="calc-dest-search"
                  type="text"
                  value={destSearch}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder={t.destinationSearchPlaceholder}
                  className="w-full h-10 pl-10 pr-4 bg-[#F6F8FB] border border-slate-300 rounded-lg text-sm text-[#042544] focus:outline-none focus:bg-white focus:border-[#042544] focus:ring-2 focus:ring-[#F59E0B]/30"
                />
              </div>

              <select
                id="calc-destination"
                value={destinationId}
                onChange={(e) => onChangeDestination(e.target.value)}
                className="w-full h-11 px-3.5 bg-white border border-slate-300 rounded-lg text-sm text-[#042544] focus:outline-none focus:border-[#042544] focus:ring-2 focus:ring-[#F59E0B]/30"
              >
                {dropdownDestinations.length === 0 ? (
                  <option value={destinationId}>{t.noDestinationsMatched}</option>
                ) : (
                  dropdownDestinations.map((dest) => (
                    <option key={dest.id} value={dest.id}>
                      {dest.displayName} · {formatTitleCase(dest.region)}
                    </option>
                  ))
                )}
              </select>

              <label className="inline-flex items-center gap-2 text-xs text-slate-600 cursor-pointer pt-0.5">
                <input
                  type="checkbox"
                  checked={onlyOriginRoutes}
                  onChange={(e) => handleToggleOriginOnly(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-[#042544] focus:ring-[#F59E0B]"
                />
                <span>{t.onlyOriginRoutesLabel}</span>
              </label>
            </div>

            {/* Vehicle Selector Cards */}
            <div>
              <span className="block text-sm font-semibold text-[#042544] mb-2.5">
                {t.vehicleLabel}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {VEHICLE_TYPES.map((v) => {
                  const active = vehicleId === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => onChangeVehicle(v.id)}
                      className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                        active
                          ? 'border-[#042544] bg-amber-50/70 text-[#042544] ring-2 ring-[#F59E0B]'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span className="block text-sm font-bold text-[#042544]">
                        {lang === 'en' ? v.labelEn : v.label}
                      </span>
                      <span className="block text-xs text-slate-600 mt-0.5 tabular-nums">
                        {lang === 'en' ? v.capacityLabelEn : v.capacityLabel}
                      </span>
                    </button>
                  );
                })}
              </div>
              {selectedVehicleSpec && (
                <p className="text-xs text-slate-500 mt-2">
                  {lang === 'en' ? selectedVehicleSpec.idealForEn : selectedVehicleSpec.idealForEs}
                </p>
              )}
            </div>

            {/* Weight + Declared Value Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="calc-weight-input" className="text-sm font-semibold text-[#042544]">
                    {t.weightLabel}
                  </label>
                  <span className="font-mono text-xs font-bold text-[#B45309] tabular-nums">
                    {weightKg.toLocaleString('es-CO')} kg
                  </span>
                </div>
                <input
                  id="calc-weight-input"
                  type="number"
                  min={1}
                  max={5000}
                  value={weightKg}
                  onChange={(e) => {
                    const next = Math.max(1, Math.min(5000, Number(e.target.value) || 1));
                    onChangeWeight(next);
                  }}
                  className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-sm font-mono tabular-nums text-[#042544] focus:outline-none focus:border-[#042544] mb-2"
                />
                <input
                  aria-label={t.weightLabel}
                  type="range"
                  min={1}
                  max={2500}
                  step={5}
                  value={Math.min(2500, weightKg)}
                  onChange={(e) => onChangeWeight(Number(e.target.value))}
                  className="w-full accent-[#042544] cursor-pointer"
                />
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {[25, 40, 100, 550].map((presetKg) => (
                    <button
                      key={presetKg}
                      type="button"
                      onClick={() => onChangeWeight(presetKg)}
                      className={`px-2 py-0.5 text-[11px] font-mono rounded border cursor-pointer tabular-nums ${
                        weightKg === presetKg
                          ? 'bg-[#042544] text-white border-[#042544]'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-[#B45309]'
                      }`}
                    >
                      {presetKg} kg
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="calc-declared-value"
                  className="block text-sm font-semibold text-[#042544] mb-2"
                >
                  {t.declaredValueLabel}
                </label>
                <input
                  id="calc-declared-value"
                  type="number"
                  min={0}
                  step={50000}
                  value={declaredValueCop}
                  onChange={(e) =>
                    onChangeDeclaredValue(Math.max(0, Number(e.target.value) || 0))
                  }
                  className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-sm font-mono tabular-nums text-[#042544] focus:outline-none focus:border-[#042544]"
                />
                <p className="text-[11px] font-mono text-[#0B3C6A] tabular-nums mt-1">
                  ≈ {formatUsd(declaredValueCop)} · TRM ref. {formatCop(DEFAULT_COP_PER_USD)}/USD
                </p>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  {t.declaredValueHint}
                </p>
              </div>
            </div>

            {/* SECOP Insurance Toggle */}
            <label className="flex items-start gap-3 p-4 bg-[#F6F8FB] border border-slate-200/80 rounded-xl cursor-pointer hover:border-[#F59E0B]/60 transition-colors">
              <input
                type="checkbox"
                checked={secopInsured}
                onChange={(e) => onChangeSecopInsured(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#042544] focus:ring-[#F59E0B]"
              />
              <span className="text-sm">
                <span className="block font-semibold text-[#042544]">{t.secopCheckboxTitle}</span>
                <span className="block text-xs text-slate-500 mt-0.5">{t.secopCheckboxDesc}</span>
              </span>
            </label>
          </div>

          {/* Right Live Result Card */}
          <div
            className="lg:col-span-5 bg-[#042544] text-white rounded-2xl overflow-hidden shadow-xl shadow-slate-900/15"
            data-testid="calculator-result"
          >
            <div className="h-1.5 w-full bg-[#F59E0B]" aria-hidden="true" />
            <div className="p-6 sm:p-8 space-y-6">
              {estimate.found ? (
                <>
                  <div className="flex items-center justify-between gap-3 pb-4 border-b border-white/15">
                    <div>
                      <p className="text-xs font-semibold text-[#F59E0B]">{t.resultMatrixEyebrow}</p>
                      <p className="text-sm font-semibold text-white mt-0.5">
                        {estimate.origin.name} → {estimate.destination.displayName}
                      </p>
                    </div>
                    <Calculator className="w-5 h-5 text-[#F59E0B] shrink-0" />
                  </div>

                <div>
                  <span className="text-xs text-slate-300 block">
                    {secopInsured ? t.totalWithSecopLabel : t.totalMatrixLabel}
                  </span>
                  <p className="font-display text-3xl sm:text-4xl font-extrabold text-white tabular-nums mt-1">
                    {formatCop(estimate.estimatedCostCop)}
                  </p>
                  <p className="font-mono text-sm font-semibold text-sky-200 tabular-nums mt-0.5">
                    ≈ {formatUsd(estimate.estimatedCostCop)}{' '}
                    <span className="text-[11px] font-normal text-slate-300">
                      (TRM ref. {formatCop(DEFAULT_COP_PER_USD)})
                    </span>
                  </p>
                  <p className="text-xs text-sky-200 mt-2">
                    {t.transitLabel}:{' '}
                    <strong className="text-white">{estimate.estimatedDaysLabel}</strong>
                  </p>
                  <p className="text-xs text-slate-300 mt-1">
                    {t.tierLabel}: <strong className="text-white">{estimate.routeTierLabel}</strong>{' '}
                    · {t.regionLabel}: {formatTitleCase(estimate.route.destRegion.replace(/^\d+\.\s*/, ''))}
                  </p>
                </div>

                <dl className="space-y-3 text-sm border-t border-white/15 pt-4">
                  <div className="flex justify-between items-start gap-3">
                    <dt className="text-slate-300">{t.lineBaseFreight}</dt>
                    <dd className="font-mono tabular-nums text-white text-right shrink-0">
                      <span>{formatCop(estimate.baseFreightCop)}</span>
                      <span className="block text-[11px] text-slate-400">
                        ≈ {formatUsd(estimate.baseFreightCop)}
                      </span>
                    </dd>
                  </div>
                  <div className="flex justify-between items-start gap-3">
                    <dt className="text-slate-300">
                      {t.lineExcessWeight} ({estimate.excessKg} kg ×{' '}
                      {formatCop(estimate.additionalKgRateCop)})
                      <span className="block text-[11px] text-slate-400 font-mono">
                        ≈ {formatUsd(estimate.additionalKgRateCop)} / kg
                      </span>
                    </dt>
                    <dd className="font-mono tabular-nums text-white text-right shrink-0">
                      <span>{formatCop(estimate.additionalWeightCostCop)}</span>
                      <span className="block text-[11px] text-slate-400">
                        ≈ {formatUsd(estimate.additionalWeightCostCop)}
                      </span>
                    </dd>
                  </div>
                  <div className="flex justify-between items-start gap-3">
                    <dt className="text-slate-300">
                      {t.lineHandling} ({estimate.handlingRatePercent.toFixed(1)}%)
                    </dt>
                    <dd className="font-mono tabular-nums text-white text-right shrink-0">
                      <span>{formatCop(estimate.handlingFeeCop)}</span>
                      <span className="block text-[11px] text-slate-400">
                        ≈ {formatUsd(estimate.handlingFeeCop)}
                      </span>
                    </dd>
                  </div>
                  <div className="flex justify-between items-start gap-3 text-xs text-slate-400 pt-1.5 border-t border-white/10">
                    <dt>{t.lineMinLiquidation}</dt>
                    <dd className="font-mono tabular-nums text-right">
                      <span>{formatCop(estimate.route.minBoxLiquidation)}</span>
                      <span className="block text-[10.5px] text-slate-400">
                        ≈ {formatUsd(estimate.route.minBoxLiquidation)}
                      </span>
                    </dd>
                  </div>
                  {secopInsured && (
                    <div className="flex justify-between items-start gap-3">
                      <dt className="text-sky-200">{t.lineSecopFee}</dt>
                      <dd className="font-mono tabular-nums text-sky-200 text-right shrink-0">
                        <span>{formatCop(estimate.secopComplianceFeeCop)}</span>
                        <span className="block text-[11px] text-sky-300/80">
                          ≈ {formatUsd(estimate.secopComplianceFeeCop)}
                        </span>
                      </dd>
                    </div>
                  )}
                </dl>

                {estimate.requiresVehicleUpgrade && (
                  <p className="text-xs bg-white/10 border border-white/20 text-sky-100 rounded-lg p-3">
                    {t.upgradeWarningPrefix} ({weightKg.toLocaleString('es-CO')} kg),{' '}
                    {t.upgradeWarningMid}{' '}
                    <strong>
                      {lang === 'en'
                        ? estimate.recommendedVehicle.labelEn
                        : estimate.recommendedVehicle.label}
                    </strong>
                    .
                  </p>
                )}

                {estimate.isMultimodal && (
                  <p className="flex items-start gap-2 text-xs bg-[#F59E0B]/15 border border-[#F59E0B]/45 text-amber-100 rounded-lg p-3">
                    <Plane className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
                    <span>{t.multimodalNote}</span>
                  </p>
                )}

                <button
                  type="button"
                  onClick={onRequestQuote}
                  className="w-full py-3.5 px-5 bg-[#F59E0B] hover:bg-amber-400 text-[#042544] font-bold text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer shadow-lg shadow-black/25"
                >
                  <span>{t.requestFormalQuote}</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
              </>
            ) : (
              /* CLEAR SPECIAL QUOTE REQUIRED STATE (NO FABRICATED TARIFF) */
              <div className="space-y-5" data-testid="special-quote-notice">
                <div className="flex items-start justify-between gap-3 pb-4 border-b border-white/15">
                  <div>
                    <p className="text-xs font-semibold text-[#F59E0B]">
                      {t.specialQuoteEyebrow}
                    </p>
                    <p className="text-sm font-semibold text-white mt-0.5">
                      {estimate.origin.name} → {estimate.destination.displayName}
                    </p>
                  </div>
                  <AlertTriangle className="w-5 h-5 text-[#F59E0B] shrink-0" />
                </div>

                <div className="p-4 rounded-xl bg-[#F59E0B]/15 border border-[#F59E0B]/45 space-y-2">
                  <h3 className="font-display text-xl font-bold text-white">
                    {t.specialQuoteTitle}
                  </h3>
                  <p className="text-sm text-amber-50 leading-relaxed">
                    {estimate.reasonMessage}
                  </p>
                </div>

                {estimate.availableOriginsForDestination.length > 0 && (
                  <div className="space-y-2.5">
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {t.availableHubsPrompt}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {estimate.availableOriginsForDestination.map((hub) => (
                        <button
                          key={hub.id}
                          type="button"
                          onClick={() => onChangeOrigin(hub.id)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#042544] bg-sky-100 hover:bg-white rounded-lg transition-colors cursor-pointer"
                        >
                          <span>
                            {t.switchHubPrefix} {hub.name} ({hub.hubCode})
                          </span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={onRequestQuote}
                  className="w-full py-3.5 px-5 bg-[#F59E0B] hover:bg-amber-400 text-[#042544] font-bold text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer shadow-lg shadow-black/25"
                >
                  <span>{t.specialQuoteButton}</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
