import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, Info, Scale } from 'lucide-react';
import {
  buildCarrierComparison,
  getComparisonNote,
} from '../utils/competitorBenchmark';
import {
  DEFAULT_COP_PER_USD,
  formatCop,
  formatUsd,
  formatUsdRange,
  type Language,
  type ShippingEstimate,
} from '../utils/logistics';

interface MultiCarrierComparatorProps {
  lang: Language;
  estimate: ShippingEstimate;
  weightKg: number;
  declaredValueCop: number;
  onChangeWeight: (weightKg: number) => void;
  onRequestQuote: (note?: string) => void;
}

const COMPETITOR_MARKS: Record<string, { initials: string; domain: string }> = {
  servientrega: { initials: 'SE', domain: 'servientrega.com' },
  inter_rapidisimo: { initials: 'IR', domain: 'interrapidisimo.com' },
  coordinadora: { initials: 'CO', domain: 'coordinadora.com' },
  tcc: { initials: 'TC', domain: 'tcc.com.co' },
  envia: { initials: 'EN', domain: 'envia.co' },
};

export default function MultiCarrierComparator({
  lang,
  estimate,
  weightKg,
  declaredValueCop,
  onChangeWeight,
  onRequestQuote,
}: MultiCarrierComparatorProps) {
  const [filterMode, setFilterMode] = useState<'all' | 'numeric'>('all');
  const [showFloatingQuote, setShowFloatingQuote] = useState(false);

  useEffect(() => {
    const section = document.getElementById('comparador');
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => setShowFloatingQuote(entry.isIntersecting),
      { threshold: 0.16 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const comparison = useMemo(
    () => buildCarrierComparison(estimate, weightKg, declaredValueCop),
    [estimate, weightKg, declaredValueCop]
  );

  const visibleRows = useMemo(() => {
    if (filterMode === 'all') return comparison.rows;
    return comparison.rows.filter(
      (row) => row.isPostCargo || row.priceStatus === 'public_reference'
    );
  }, [comparison.rows, filterMode]);

  const note = getComparisonNote(lang);

  return (
    <section
      id="comparador"
      className="py-16 lg:py-20 bg-white border-b border-slate-200/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header & Quick Weight / Filter Bar */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-3xl">
            <h2
              className="font-display text-2xl sm:text-3xl font-bold text-[#042544]"
              style={{ textWrap: 'balance' }}
            >
              {lang === 'en'
                ? 'National Multi-Carrier Rate & Transit Comparator'
                : 'Multi-Cotizador comparativo de paquetería y carga nacional'}
            </h2>
            <p className="text-slate-600 mt-2.5 text-base leading-relaxed">
              {lang === 'en'
                ? 'Compare PostCargo exact 2026 matrix tariffs against publicly documented Colombian carrier references for the same corridor, weight and destination coverage.'
                : 'Compara en tiempo real el tarifario real de PostCargo (TARIFAS 2026) frente a referencias públicas documentadas de transportadoras colombianas que cubren el mismo destino.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Weight quick switcher synced with main calculator */}
            <div
              role="group"
              aria-label={
                lang === 'en' ? 'Quick comparison weights' : 'Pesos de comparación rápida'
              }
              className="inline-flex items-center gap-1 p-1 bg-[#F6F8FB] rounded-xl border border-slate-200"
            >
              {[1, 3, 5, 25].map((kg) => {
                const active = Math.ceil(weightKg) === kg;
                return (
                  <button
                    key={kg}
                    type="button"
                    onClick={() => onChangeWeight(kg)}
                    className={`px-2.5 py-1.5 text-xs font-mono font-semibold rounded-lg transition-colors cursor-pointer tabular-nums ${
                      active
                        ? 'bg-[#042544] text-white ring-1 ring-[#F59E0B]'
                        : 'text-slate-700 hover:bg-white'
                    }`}
                  >
                    {kg} kg
                  </button>
                );
              })}
            </div>

            {/* Row Filter */}
            <div
              role="tablist"
              aria-label={lang === 'en' ? 'Filter operators' : 'Filtrar operadores'}
              className="inline-flex items-center gap-1 p-1 bg-[#F6F8FB] rounded-xl border border-slate-200"
            >
              <button
                type="button"
                role="tab"
                aria-selected={filterMode === 'all'}
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  filterMode === 'all'
                    ? 'bg-white text-[#042544] shadow-xs'
                    : 'text-slate-600 hover:text-[#042544]'
                }`}
              >
                {lang === 'en' ? 'All operators (6)' : 'Todos (6 operadores)'}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={filterMode === 'numeric'}
                onClick={() => setFilterMode('numeric')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  filterMode === 'numeric'
                    ? 'bg-white text-[#042544] shadow-xs'
                    : 'text-slate-600 hover:text-[#042544]'
                }`}
              >
                {lang === 'en' ? 'With public rate' : 'Con tarifa pública'}
              </button>
            </div>
          </div>
        </div>

        {/* Active Corridor Context Strip */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#F6F8FB] border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#042544]">
            <span className="inline-flex items-center gap-2 font-bold">
              <Scale className="w-4 h-4 text-[#B45309] shrink-0" />
              <span>
                {comparison.originName} → {comparison.destinationName}
              </span>
            </span>
            <span className="text-slate-400" aria-hidden="true">
              ·
            </span>
            <span className="font-mono text-xs sm:text-sm font-semibold tabular-nums">
              {comparison.weightKg} kg
            </span>
            <span className="text-slate-400" aria-hidden="true">
              ·
            </span>
            <span className="text-xs sm:text-sm text-slate-600 tabular-nums">
              {lang === 'en' ? 'Declared value:' : 'Valor declarado:'}{' '}
              <strong className="text-[#042544]">{formatCop(comparison.declaredValueCop)}</strong>{' '}
              <span className="font-mono text-[11px] text-slate-500">
                (≈ {formatUsd(comparison.declaredValueCop)})
              </span>
            </span>
          </div>

          {comparison.bestSavingsPct !== null && comparison.bestSavingsPct > 0 && (
            <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#B45309]">
              <CheckCircle2 className="w-4 h-4 text-[#B45309] shrink-0" />
              <span className="tabular-nums">
                {lang === 'en'
                  ? `Up to ${comparison.bestSavingsPct}% lower freight vs standard public rates`
                  : `Hasta ${comparison.bestSavingsPct}% menos en flete frente a referencias públicas`}
              </span>
            </div>
          )}
        </div>

        {/* Compact floating comparison window */}
        <div className="border border-slate-200/90 rounded-2xl overflow-hidden bg-white shadow-[0_18px_50px_-24px_rgba(4,37,68,0.38)] ring-1 ring-slate-950/[0.03]">
          <div className="h-10 px-4 flex items-center justify-between bg-slate-50 border-b border-slate-200">
            <div className="flex items-center gap-1.5" aria-hidden="true">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              {lang === 'en' ? 'Live comparison' : 'Comparativo en vivo'}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[680px]">
              <thead>
                <tr className="bg-[#042544] text-white text-[10px] uppercase tracking-wider border-b-2 border-[#F59E0B]">
                  <th scope="col" className="py-2.5 px-3 font-semibold">
                    {lang === 'en' ? 'Operator' : 'Transportadora'}
                  </th>
                  <th scope="col" className="py-2.5 px-3 font-semibold">
                    {lang === 'en' ? 'Freight (COP)' : 'Flete (COP)'}
                  </th>
                  <th scope="col" className="py-2.5 px-3 font-semibold">
                    {lang === 'en' ? 'Transit' : 'Tiempo'}
                  </th>
                  <th scope="col" className="py-2.5 px-3 font-semibold">
                    {lang === 'en' ? 'Coverage' : 'Cobertura'}
                  </th>
                  <th scope="col" className="py-2.5 px-3 font-semibold text-right">
                    {lang === 'en' ? 'vs. PC' : 'vs. PC'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {visibleRows.map((row) => {
                  const diffMin = row.savingsVsPostCargoMinCop;
                  const diffMax = row.savingsVsPostCargoMaxCop;
                  let diffText = '—';
                  let diffColor = 'text-slate-500';

                  if (row.isPostCargo) {
                    diffText = lang === 'en' ? 'Base Tariff 2026' : 'Tarifa Base 2026';
                    diffColor = 'text-[#B45309] font-bold';
                  } else if (diffMin !== null && diffMax !== null) {
                    if (diffMin > 0) {
                      diffText =
                        diffMin === diffMax
                          ? `+${formatCop(diffMin)}`
                          : `+${formatCop(diffMin)} / +${formatCop(diffMax)}`;
                      diffColor = 'text-emerald-700 font-semibold';
                    } else if (diffMax < 0) {
                      diffText = formatCop(diffMin);
                      diffColor = 'text-slate-700 font-semibold';
                    } else {
                      diffText = `${formatCop(diffMin)} / +${formatCop(diffMax)}`;
                      diffColor = 'text-slate-700 font-semibold';
                    }
                  }

                  return (
                    <tr
                      key={row.id}
                      className={
                        row.isPostCargo
                          ? 'bg-amber-50/55'
                          : 'hover:bg-slate-50/80 transition-colors'
                      }
                    >
                      <td className="py-2 px-3 align-middle">
                        <div className="flex items-center gap-2">
                          {row.isPostCargo ? (
                            <div
                              className="relative grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#042544] text-[11px] font-black text-white shadow-sm ring-1 ring-[#F59E0B]/60"
                              aria-label="PostCargo"
                            >
                              PC
                            </div>
                          ) : (
                            <div
                              className="relative h-9 w-9 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                              title={row.name}
                              aria-label={row.name}
                            >
                              <img
                                src={`https://www.google.com/s2/favicons?domain=${COMPETITOR_MARKS[row.id]?.domain ?? row.sourceDomain}&sz=64`}
                                alt=""
                                className="absolute inset-0 h-full w-full object-contain scale-125 p-1 opacity-55 blur-[1.15px] saturate-[0.85]"
                                loading="lazy"
                              />
                              <span
                                className="absolute inset-0 grid place-items-center text-[10px] font-black tracking-wide"
                                style={{ color: row.representativeColorHex }}
                              >
                                {COMPETITOR_MARKS[row.id]?.initials ?? 'XX'}
                              </span>
                            </div>
                          )}
                          <p className="font-display font-bold text-[#042544] text-sm leading-tight">
                            {row.isPostCargo ? row.name : COMPETITOR_MARKS[row.id]?.initials ?? 'XX'}
                          </p>
                        </div>
                      </td>

                      <td className="py-2 px-3 align-middle">
                        <p
                          className={`font-mono tabular-nums leading-tight ${
                            row.priceStatus === 'quote_required'
                              ? 'text-[11px] text-slate-600 font-medium'
                              : 'text-sm font-bold text-[#042544]'
                          }`}
                        >
                          {lang === 'en' ? row.priceDisplayEn : row.priceDisplayEs}
                        </p>
                        {row.minPriceCop !== null && row.maxPriceCop !== null && (
                          <p className="font-mono text-[10px] text-slate-500 tabular-nums mt-0.5">
                            ≈ {formatUsdRange(row.minPriceCop, row.maxPriceCop)}
                          </p>
                        )}
                      </td>

                      <td className="py-2 px-3 align-middle text-slate-700 whitespace-nowrap">
                        <span className="text-xs font-medium">
                          {lang === 'en' ? row.transitEn : row.transitEs}
                        </span>
                      </td>

                      <td className="py-2 px-3 align-middle text-[11px] text-slate-600 max-w-[220px] leading-tight">
                        {lang === 'en' ? row.coverageEn : row.coverageEs}
                      </td>

                      <td
                        className={`py-2 px-3 align-middle text-right font-mono text-[11px] tabular-nums whitespace-nowrap ${diffColor}`}
                      >
                        <span>{diffText}</span>
                        {!row.isPostCargo && diffMin !== null && diffMax !== null && (
                          <span className="block text-[11px] font-normal text-slate-500 mt-0.5">
                            {diffMin > 0 ? '+' : ''}≈ {formatUsdRange(diffMin, diffMax)}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Transparency Disclaimer & CTA */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
          <p className="flex items-start gap-2.5 text-xs text-slate-600 max-w-3xl leading-relaxed">
            <Info className="w-4 h-4 text-[#0B3C6A] shrink-0 mt-0.5" />
            <span>
              {note} (TRM ref. {formatCop(DEFAULT_COP_PER_USD)} COP/USD)
            </span>
          </p>

          <button
            type="button"
            onClick={() =>
              onRequestQuote(
                lang === 'en'
                  ? `Comparative quote requested for ${comparison.originName} -> ${comparison.destinationName} (${comparison.weightKg} kg).`
                  : `Solicitud comparativa para ${comparison.originName} -> ${comparison.destinationName} (${comparison.weightKg} kg).`
              )
            }
            className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-[#042544] bg-[#F59E0B] hover:bg-amber-400 rounded-xl transition-colors cursor-pointer whitespace-nowrap shrink-0 shadow-sm"
          >
            <span>
              {lang === 'en'
                ? 'Lock PostCargo Matrix Rate'
                : 'Fijar Tarifa PostCargo'}
            </span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </button>
        </div>
      </div>

      {showFloatingQuote && (
        <button
          type="button"
          onClick={() =>
            onRequestQuote(
              lang === 'en'
                ? `Quick quote requested for ${comparison.originName} -> ${comparison.destinationName} (${comparison.weightKg} kg).`
                : `Cotización rápida solicitada para ${comparison.originName} -> ${comparison.destinationName} (${comparison.weightKg} kg).`
            )
          }
          className="fixed bottom-5 right-4 z-40 inline-flex items-center gap-2.5 rounded-2xl border border-white/15 bg-[#042544] px-4 py-3 text-sm font-bold text-white shadow-[0_16px_38px_-12px_rgba(4,37,68,0.75)] ring-1 ring-[#042544]/10 transition-transform hover:-translate-y-0.5 cursor-pointer"
          aria-label={lang === 'en' ? 'Request a quote' : 'Solicitar cotización'}
        >
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#F59E0B] text-[#042544]">
            <ArrowRight className="h-4 w-4" />
          </span>
          {lang === 'en' ? 'Quote this route' : 'Cotizar esta ruta'}
        </button>
      )}
    </section>
  );
}
