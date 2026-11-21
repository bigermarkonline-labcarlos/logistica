import { useMemo, useState } from 'react';
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

export default function MultiCarrierComparator({
  lang,
  estimate,
  weightKg,
  declaredValueCop,
  onChangeWeight,
  onRequestQuote,
}: MultiCarrierComparatorProps) {
  const [filterMode, setFilterMode] = useState<'all' | 'numeric'>('all');

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

        {/* Responsive Comparison Table (No competitor logos — representative color swatches only) */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr className="bg-[#042544] text-white text-xs uppercase tracking-wider border-b-2 border-[#F59E0B]">
                  <th scope="col" className="py-3.5 px-5 font-semibold">
                    {lang === 'en' ? 'Operator (Color ID)' : 'Transportadora (Color)'}
                  </th>
                  <th scope="col" className="py-3.5 px-5 font-semibold">
                    {lang === 'en' ? 'Freight + Handling (COP)' : 'Flete + Manejo (COP)'}
                  </th>
                  <th scope="col" className="py-3.5 px-5 font-semibold">
                    {lang === 'en' ? 'Estimated Transit' : 'Tiempo Estimado'}
                  </th>
                  <th scope="col" className="py-3.5 px-5 font-semibold">
                    {lang === 'en' ? 'Destination Coverage' : 'Cobertura en Destino'}
                  </th>
                  <th scope="col" className="py-3.5 px-5 font-semibold text-right">
                    {lang === 'en' ? 'Diff. vs PostCargo' : 'Diferencia vs PostCargo'}
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
                      <td className="py-4 px-5 align-top">
                        <div className="flex items-start gap-3">
                          {/* Representative Brand Color Swatch Only (NO Logos) */}
                          <span
                            aria-label={`${row.name} — ${lang === 'en' ? row.colorNameEn : row.colorNameEs}`}
                            className="w-2.5 h-9 rounded-sm shrink-0 mt-0.5"
                            style={{ backgroundColor: row.representativeColorHex }}
                          />
                          <div>
                            <p className="font-display font-bold text-[#042544] text-base leading-tight">
                              {row.name}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5 font-mono">
                              {row.sourceDomain}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-5 align-top">
                        <p
                          className={`font-mono tabular-nums ${
                            row.priceStatus === 'quote_required'
                              ? 'text-xs text-slate-600 font-medium'
                              : 'text-base font-bold text-[#042544]'
                          }`}
                        >
                          {lang === 'en' ? row.priceDisplayEn : row.priceDisplayEs}
                        </p>
                        {row.minPriceCop !== null && row.maxPriceCop !== null && (
                          <p className="font-mono text-xs text-slate-600 tabular-nums mt-0.5">
                            ≈ {formatUsdRange(row.minPriceCop, row.maxPriceCop)}
                          </p>
                        )}
                        <p className="text-xs text-slate-500 mt-1 max-w-xs leading-snug">
                          {lang === 'en' ? row.methodologyEn : row.methodologyEs}
                        </p>
                      </td>

                      <td className="py-4 px-5 align-top text-slate-700 whitespace-nowrap">
                        <span className="font-medium">
                          {lang === 'en' ? row.transitEn : row.transitEs}
                        </span>
                      </td>

                      <td className="py-4 px-5 align-top text-xs sm:text-sm text-slate-600 max-w-xs leading-snug">
                        {lang === 'en' ? row.coverageEn : row.coverageEs}
                      </td>

                      <td
                        className={`py-4 px-5 align-top text-right font-mono text-xs sm:text-sm tabular-nums whitespace-nowrap ${diffColor}`}
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
    </section>
  );
}
