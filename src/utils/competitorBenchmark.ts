import type { MatrixRouteType } from '../data/tarifas2026';
import type { Language, ShippingEstimate } from './logistics';

export type CompetitorPriceStatus = 'exact_matrix' | 'public_reference' | 'quote_required';

export interface CarrierComparisonRow {
  id: string;
  name: string;
  isPostCargo: boolean;
  representativeColorHex: string;
  colorNameEs: string;
  colorNameEn: string;
  priceStatus: CompetitorPriceStatus;
  minPriceCop: number | null;
  maxPriceCop: number | null;
  priceDisplayEs: string;
  priceDisplayEn: string;
  transitEs: string;
  transitEn: string;
  coverageEs: string;
  coverageEn: string;
  methodologyEs: string;
  methodologyEn: string;
  sourceDomain: string;
  savingsVsPostCargoMinCop: number | null;
  savingsVsPostCargoMaxCop: number | null;
}

export interface ComparisonSummary {
  originName: string;
  destinationName: string;
  routeType: MatrixRouteType | null;
  weightKg: number;
  declaredValueCop: number;
  rows: CarrierComparisonRow[];
  bestSavingsPct: number | null;
}

// Explicit aerial/special cities documented publicly by TCC
const TCC_DOCUMENTED_AERIAL_CITIES = new Set([
  'SAN ANDRES',
  'PROVIDENCIA',
  'MITU',
  'LETICIA',
  'INIRIDA',
  'PUERTO CARRENO',
  'LA PRIMAVERA',
]);

function formatCopSimple(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

function formatRangeCop(min: number, max: number): string {
  if (Math.round(min) === Math.round(max)) {
    return formatCopSimple(min);
  }
  return `${formatCopSimple(min)} – ${formatCopSimple(max)}`;
}

export function buildCarrierComparison(
  estimate: ShippingEstimate,
  weightKg: number,
  declaredValueCop: number
): ComparisonSummary {
  const safeWeight = Math.max(1, Math.ceil(weightKg));
  const safeDeclared = Math.max(0, declaredValueCop);
  const routeType = estimate.found ? estimate.route.routeType : estimate.destination.primaryRouteType;
  const destCityUpper = estimate.destination.city.toUpperCase();
  const isTccAerialCity = TCC_DOCUMENTED_AERIAL_CITIES.has(destCityUpper);

  const postCargoPrice = estimate.found ? estimate.matrixTotalCop : null;

  const postCargoRow: CarrierComparisonRow = estimate.found
    ? {
        id: 'postcargo',
        name: 'PostCargo',
        isPostCargo: true,
        representativeColorHex: '#0EA5E9',
        colorNameEs: 'Azul Marino y Cian',
        colorNameEn: 'Deep Navy & Cyan',
        priceStatus: 'exact_matrix',
        minPriceCop: estimate.matrixTotalCop,
        maxPriceCop: estimate.matrixTotalCop,
        priceDisplayEs: formatCopSimple(estimate.matrixTotalCop),
        priceDisplayEn: formatCopSimple(estimate.matrixTotalCop),
        transitEs: estimate.estimatedDaysLabel,
        transitEn:
          routeType === '1. Metropolitano'
            ? '24 hours (1 business day)'
            : routeType === '3. Nacional Medio'
              ? '1 to 2 business days'
              : routeType === '4. Nacional Abierto'
                ? '2 business days'
                : routeType === '5. Especial'
                  ? '2 to 3 business days'
                  : routeType === '6. Extendido'
                    ? '3 to 4 business days'
                    : '3 to 5 business days',
        coverageEs: `Cobertura directa Matriz 2026 (${estimate.route.routeType})`,
        coverageEn: `Direct 2026 Matrix coverage (${estimate.route.routeType})`,
        methodologyEs: `Tarifario oficial TARIFAS 2026.json: caja hasta 25 kg (${formatCopSimple(estimate.baseFreightCop)}) + ${estimate.excessKg} kg adic. (${formatCopSimple(estimate.additionalKgRateCop)}/kg) + manejo ${estimate.handlingRatePercent.toFixed(1)}% (mín. $4.000).`,
        methodologyEn: `Official TARIFAS 2026.json: base box up to 25 kg (${formatCopSimple(estimate.baseFreightCop)}) + ${estimate.excessKg} extra kg (${formatCopSimple(estimate.additionalKgRateCop)}/kg) + ${estimate.handlingRatePercent.toFixed(1)}% handling (min. $4,000).`,
        sourceDomain: 'TARIFAS 2026.json',
        savingsVsPostCargoMinCop: null,
        savingsVsPostCargoMaxCop: null,
      }
    : {
        id: 'postcargo',
        name: 'PostCargo',
        isPostCargo: true,
        representativeColorHex: '#0EA5E9',
        colorNameEs: 'Azul Marino y Cian',
        colorNameEn: 'Deep Navy & Cyan',
        priceStatus: 'quote_required',
        minPriceCop: null,
        maxPriceCop: null,
        priceDisplayEs: 'Requiere cotización especial',
        priceDisplayEn: 'Special quote required',
        transitEs: 'Sujeto a confirmación de enlace regional',
        transitEn: 'Subject to regional hub confirmation',
        coverageEs:
          estimate.availableOriginsForDestination.length > 0
            ? `Operado en matriz desde: ${estimate.availableOriginsForDestination.map((o) => o.name).join(', ')}`
            : 'Corredor fuera de matriz estándar',
        coverageEn:
          estimate.availableOriginsForDestination.length > 0
            ? `Matrix coverage available from: ${estimate.availableOriginsForDestination.map((o) => o.name).join(', ')}`
            : 'Corridor outside standard matrix',
        methodologyEs:
          'Este origen-destino exacto no figura en TARIFAS 2026.json. Se cotiza a medida sin inventar tarifa.',
        methodologyEn:
          'This exact origin-destination pair is not in TARIFAS 2026.json. Custom quote required without fabricating rates.',
        sourceDomain: 'TARIFAS 2026.json',
        savingsVsPostCargoMinCop: null,
        savingsVsPostCargoMaxCop: null,
      };

  // 1. SERVIENTREGA (Color: #009A44)
  // Public reference: Mercancía Premier / Normal Terrestre (min 3 kg, 2% handling)
  // Urbano: $7.500 inicial + $3.200/kg | Nacional: $15.000 + $4.000/kg | Especial: $33.000 + $8.300/kg
  const servientregaRow = ((): CarrierComparisonRow => {
    const billableKg = Math.max(3, safeWeight);
    const extraKg = Math.max(0, billableKg - 1);
    const handling = Math.round(safeDeclared * 0.02);

    if (routeType === '7. Multimodal') {
      return {
        id: 'servientrega',
        name: 'Servientrega',
        isPostCargo: false,
        representativeColorHex: '#009A44',
        colorNameEs: 'Verde corporativo',
        colorNameEn: 'Corporate Green',
        priceStatus: 'quote_required',
        minPriceCop: null,
        maxPriceCop: null,
        priceDisplayEs: 'Consultar cotizador oficial (Multimodal)',
        priceDisplayEn: 'Check official calculator (Multimodal)',
        transitEs: '3 a 5+ días hábiles (según enlace aéreo/fluvial)',
        transitEn: '3 to 5+ business days (subject to air/river link)',
        coverageEs: 'Cobertura sujeta a modalidad aérea o reexpedición especial',
        coverageEn: 'Coverage subject to air link or special reexpedition',
        methodologyEs:
          'No publica tabla plana fija para trayectos multimodales insulares/amazónicos. Sobreflete estándar: 2% valor declarado.',
        methodologyEn:
          'No flat public table published for insular/Amazon multimodal corridors. Standard handling fee: 2% declared value.',
        sourceDomain: 'servientrega.com',
        savingsVsPostCargoMinCop: null,
        savingsVsPostCargoMaxCop: null,
      };
    }

    let firstKg = 15000;
    let addKg = 4000;
    let transitEs = '1 a 2 días hábiles (24–48h)';
    let transitEn = '1 to 2 business days (24–48h)';
    let tierNameEs = 'Trayecto Nacional';
    let tierNameEn = 'National Route';

    if (routeType === '1. Metropolitano') {
      firstKg = 7500;
      addKg = 3200;
      transitEs = '1 día hábil (24h)';
      transitEn = '1 business day (24h)';
      tierNameEs = 'Trayecto Urbano';
      tierNameEn = 'Urban Route';
    } else if (routeType === '5. Especial' || routeType === '6. Extendido') {
      firstKg = 33000;
      addKg = 8300;
      transitEs = '2 a 5 días hábiles';
      transitEn = '2 to 5 business days';
      tierNameEs = 'Trayecto Especial';
      tierNameEn = 'Special Corridor';
    }

    const total = firstKg + extraKg * addKg + handling;
    const savings = postCargoPrice !== null ? total - postCargoPrice : null;

    return {
      id: 'servientrega',
      name: 'Servientrega',
      isPostCargo: false,
      representativeColorHex: '#009A44',
      colorNameEs: 'Verde corporativo',
      colorNameEn: 'Corporate Green',
      priceStatus: 'public_reference',
      minPriceCop: total,
      maxPriceCop: total,
      priceDisplayEs: formatCopSimple(total),
      priceDisplayEn: formatCopSimple(total),
      transitEs,
      transitEn,
      coverageEs:
        routeType === '5. Especial' || routeType === '6. Extendido'
          ? 'Cobertura con tarifa Trayecto Especial y menor frecuencia'
          : 'Cobertura directa red nacional / urbana',
      coverageEn:
        routeType === '5. Especial' || routeType === '6. Extendido'
          ? 'Covered under Special Corridor tariff & lower frequency'
          : 'Direct national / urban network coverage',
      methodologyEs: `Ref. pública (${tierNameEs}, mín. 3 kg): ${formatCopSimple(firstKg)} 1.er kg + ${extraKg} kg × ${formatCopSimple(addKg)} + 2% manejo.`,
      methodologyEn: `Public ref. (${tierNameEn}, min. 3 kg): ${formatCopSimple(firstKg)} 1st kg + ${extraKg} kg × ${formatCopSimple(addKg)} + 2% handling.`,
      sourceDomain: 'servientrega.com',
      savingsVsPostCargoMinCop: savings,
      savingsVsPostCargoMaxCop: savings,
    };
  })();

  // 2. INTER RAPIDÍSIMO (Color: #EA580C)
  // Public reference up to 5 kg (2% handling). >5 kg uses Rapicarga table (quote_required).
  const interRow = ((): CarrierComparisonRow => {
    if (safeWeight > 5 || routeType === '7. Multimodal') {
      return {
        id: 'inter_rapidisimo',
        name: 'Inter Rapidísimo',
        isPostCargo: false,
        representativeColorHex: '#EA580C',
        colorNameEs: 'Naranja intenso',
        colorNameEn: 'Vibrant Orange',
        priceStatus: 'quote_required',
        minPriceCop: null,
        maxPriceCop: null,
        priceDisplayEs:
          routeType === '7. Multimodal'
            ? 'Consultar cotizador oficial (Multimodal)'
            : 'Requiere tabla Rapicarga (> 5 kg)',
        priceDisplayEn:
          routeType === '7. Multimodal'
            ? 'Check official quote (Multimodal)'
            : 'Requires Rapicarga table (> 5 kg)',
        transitEs:
          routeType === '1. Metropolitano' || routeType === '3. Nacional Medio'
            ? '24 a 48 horas hábiles'
            : routeType === '4. Nacional Abierto'
              ? '24 a 72 horas hábiles'
              : '3 a 5+ días hábiles',
        transitEn:
          routeType === '1. Metropolitano' || routeType === '3. Nacional Medio'
            ? '24 to 48 business hours'
            : routeType === '4. Nacional Abierto'
              ? '24 to 72 business hours'
              : '3 to 5+ business days',
        coverageEs:
          routeType === '5. Especial' || routeType === '6. Extendido'
            ? 'Cobertura difícil acceso sujeta a frecuencia rural'
            : 'Amplia cobertura municipal nacional',
        coverageEn:
          routeType === '5. Especial' || routeType === '6. Extendido'
            ? 'Hard-to-access coverage subject to rural schedule'
            : 'Broad national municipal coverage',
        methodologyEs:
          'Las tarifas públicas en texto cubren paquetería hasta 5 kg; de 6 a 60+ kg aplica Rapicarga según tabla dinámica y peso volumen (÷6.000).',
        methodologyEn:
          'Published parcel tables cover up to 5 kg; shipments above 5 kg use Rapicarga dynamic rates (volumetric ÷ 6,000).',
        sourceDomain: 'interrapidisimo.com',
        savingsVsPostCargoMinCop: null,
        savingsVsPostCargoMaxCop: null,
      };
    }

    const extraKg = Math.max(0, safeWeight - 1);
    const handling = Math.round(safeDeclared * 0.02);
    let minInit = 14500;
    let maxInit = 16000;
    let minAdd = 3700;
    let maxAdd = 4000;
    let transitEs = '24 a 72 horas hábiles';
    let transitEn = '24 to 72 business hours';
    let tierEs = 'Trayecto Nacional';
    let tierEn = 'National';

    if (routeType === '1. Metropolitano') {
      minInit = 7000;
      maxInit = 7500;
      minAdd = 3000;
      maxAdd = 3200;
      transitEs = '24 a 48 horas hábiles';
      transitEn = '24 to 48 business hours';
      tierEs = 'Trayecto Local';
      tierEn = 'Local';
    } else if (routeType === '3. Nacional Medio') {
      minInit = 9000;
      maxInit = 9500;
      minAdd = 3400;
      maxAdd = 3700;
      transitEs = '24 a 48 horas hábiles';
      transitEn = '24 to 48 business hours';
      tierEs = 'Trayecto Regional';
      tierEn = 'Regional';
    } else if (routeType === '5. Especial' || routeType === '6. Extendido') {
      minInit = 22500;
      maxInit = 76000;
      minAdd = 9600;
      maxAdd = 13000;
      transitEs = '3 a 5+ días hábiles';
      transitEn = '3 to 5+ business days';
      tierEs = 'Difícil Acceso';
      tierEn = 'Hard-to-Access';
    }

    const minTotal = minInit + extraKg * minAdd + handling;
    const maxTotal = maxInit + extraKg * maxAdd + handling;

    return {
      id: 'inter_rapidisimo',
      name: 'Inter Rapidísimo',
      isPostCargo: false,
      representativeColorHex: '#EA580C',
      colorNameEs: 'Naranja intenso',
      colorNameEn: 'Vibrant Orange',
      priceStatus: 'public_reference',
      minPriceCop: minTotal,
      maxPriceCop: maxTotal,
      priceDisplayEs: formatRangeCop(minTotal, maxTotal),
      priceDisplayEn: formatRangeCop(minTotal, maxTotal),
      transitEs,
      transitEn,
      coverageEs:
        routeType === '5. Especial' || routeType === '6. Extendido'
          ? 'Cobertura difícil acceso con recargo por vereda/municipio'
          : 'Cobertura directa red paquetería',
      coverageEn:
        routeType === '5. Especial' || routeType === '6. Extendido'
          ? 'Hard-to-access coverage with rural/town surcharge'
          : 'Direct parcel network coverage',
      methodologyEs: `Rango público ${tierEs} (≤5 kg): ${formatRangeCop(minInit, maxInit)} inicial + ${extraKg} kg × ${formatRangeCop(minAdd, maxAdd)} + 2% manejo.`,
      methodologyEn: `Public ${tierEn} range (≤5 kg): ${formatRangeCop(minInit, maxInit)} 1st kg + ${extraKg} kg × ${formatRangeCop(minAdd, maxAdd)} + 2% handling.`,
      sourceDomain: 'interrapidisimo.com',
      savingsVsPostCargoMinCop: postCargoPrice !== null ? minTotal - postCargoPrice : null,
      savingsVsPostCargoMaxCop: postCargoPrice !== null ? maxTotal - postCargoPrice : null,
    };
  })();

  // 3. COORDINADORA (Color: #2563EB)
  // Public reference: 1% handling. Exact bands published for 1kg, 3kg, 5kg.
  const coordinadoraRow = ((): CarrierComparisonRow => {
    const handling = Math.round(safeDeclared * 0.01);
    let minTotal: number | null = null;
    let maxTotal: number | null = null;
    let transitEs = '1 a 3 días hábiles';
    let transitEn = '1 to 3 business days';

    if (routeType === '1. Metropolitano') {
      transitEs = '1 día hábil';
      transitEn = '1 business day';
      if (safeWeight <= 1) {
        minTotal = 9000 + handling;
        maxTotal = 13192 + handling;
      }
    } else if (routeType === '3. Nacional Medio') {
      transitEs = '1 a 2 días hábiles';
      transitEn = '1 to 2 business days';
      if (safeWeight <= 1) {
        minTotal = 10450 + handling;
        maxTotal = 10450 + handling;
      }
    } else if (routeType === '4. Nacional Abierto') {
      transitEs = '1 a 3 días hábiles';
      transitEn = '1 to 3 business days';
      if (safeWeight <= 1) {
        minTotal = 17830 + handling;
        maxTotal = 24226 + handling;
      } else if (safeWeight <= 3) {
        minTotal = 25420 + handling;
        maxTotal = 25420 + handling;
      } else if (safeWeight <= 5) {
        minTotal = 29270 + handling;
        maxTotal = 29270 + handling;
      }
    } else if (routeType === '5. Especial' || routeType === '6. Extendido') {
      transitEs = '3 a 7+ días hábiles';
      transitEn = '3 to 7+ business days';
      if (safeWeight <= 1) {
        minTotal = 25750 + handling;
        maxTotal = 42150 + handling;
      } else if (safeWeight <= 3) {
        minTotal = 61000 + handling;
        maxTotal = 61000 + handling;
      }
    } else {
      transitEs = '3 a 7+ días hábiles';
      transitEn = '3 to 7+ business days';
    }

    const hasPublishedBand = minTotal !== null && maxTotal !== null;

    return {
      id: 'coordinadora',
      name: 'Coordinadora',
      isPostCargo: false,
      representativeColorHex: '#2563EB',
      colorNameEs: 'Azul industrial',
      colorNameEn: 'Industrial Blue',
      priceStatus: hasPublishedBand ? 'public_reference' : 'quote_required',
      minPriceCop: minTotal,
      maxPriceCop: maxTotal,
      priceDisplayEs: hasPublishedBand
        ? `${formatRangeCop(minTotal!, maxTotal!)}${routeType === '5. Especial' || routeType === '6. Extendido' ? '+' : ''}`
        : 'Requiere cotizador oficial para este peso/ruta',
      priceDisplayEn: hasPublishedBand
        ? `${formatRangeCop(minTotal!, maxTotal!)}${routeType === '5. Especial' || routeType === '6. Extendido' ? '+' : ''}`
        : 'Requires official calculator for weight/route',
      transitEs,
      transitEn,
      coverageEs:
        routeType === '5. Especial' || routeType === '6. Extendido' || routeType === '7. Multimodal'
          ? 'Poblaciones periféricas con frecuencias semanales sujetas a vía'
          : 'Cobertura directa red nacional',
      coverageEn:
        routeType === '5. Especial' || routeType === '6. Extendido' || routeType === '7. Multimodal'
          ? 'Peripheral municipalities subject to weekly schedule & road status'
          : 'Direct national network coverage',
      methodologyEs: hasPublishedBand
        ? 'Según bandas públicas Coordinadora (1–5 kg) + 1% manejo obligatorio sobre valor declarado.'
        : 'Para pesos fuera del bloque público 1–5 kg o rutas multimodales aplica tabla corporativa / peso volumen (÷2.500) en coordinadora.com.',
      methodologyEn: hasPublishedBand
        ? 'Based on published Coordinadora 1–5 kg bands + mandatory 1% declared value fee.'
        : 'Shipments outside published 1–5 kg bands or multimodal routes use corporate table / volumetric weight (÷ 2,500) at coordinadora.com.',
      sourceDomain: 'coordinadora.com',
      savingsVsPostCargoMinCop:
        hasPublishedBand && postCargoPrice !== null ? minTotal! - postCargoPrice : null,
      savingsVsPostCargoMaxCop:
        hasPublishedBand && postCargoPrice !== null ? maxTotal! - postCargoPrice : null,
    };
  })();

  // 4. TCC (Color: #DC2626)
  // Coverage +1.300 destinos; explicit aerial destinations; 1 kg published tiers + 1-2% handling.
  const tccRow = ((): CarrierComparisonRow => {
    const isOneKg = safeWeight <= 1;
    let minTotal: number | null = null;
    let maxTotal: number | null = null;
    let transitEs = '24 a 72 horas hábiles';
    let transitEn = '24 to 72 business hours';

    if (routeType === '1. Metropolitano') {
      transitEs = '24 horas (1 día hábil)';
      transitEn = '24 hours (1 business day)';
      if (isOneKg) {
        const handling = Math.round(safeDeclared * 0.01);
        minTotal = 15900 + handling;
        maxTotal = 17500 + handling;
      }
    } else if (routeType === '3. Nacional Medio' || routeType === '4. Nacional Abierto') {
      transitEs = '1 a 3 días hábiles (24–72h)';
      transitEn = '1 to 3 business days (24–72h)';
      if (isOneKg) {
        const handling = Math.round(safeDeclared * 0.01);
        minTotal = 16500 + handling;
        maxTotal = 16500 + handling;
      }
    } else {
      transitEs = '3+ días hábiles (72h+ según ruta/aéreo)';
      transitEn = '3+ business days (72h+ subject to road/air)';
      if (isOneKg) {
        const handling = Math.round(safeDeclared * 0.02);
        minTotal = 61000 + handling;
        maxTotal = 90000 + handling;
      }
    }

    const hasPublishedBand = minTotal !== null && maxTotal !== null;

    return {
      id: 'tcc',
      name: 'TCC',
      isPostCargo: false,
      representativeColorHex: '#DC2626',
      colorNameEs: 'Rojo carmesí',
      colorNameEn: 'Crimson Red',
      priceStatus: hasPublishedBand ? 'public_reference' : 'quote_required',
      minPriceCop: minTotal,
      maxPriceCop: maxTotal,
      priceDisplayEs: hasPublishedBand
        ? `${formatRangeCop(minTotal!, maxTotal!)} (1 kg)`
        : 'Cotizar en tcc.com.co (> 1 kg)',
      priceDisplayEn: hasPublishedBand
        ? `${formatRangeCop(minTotal!, maxTotal!)} (1 kg)`
        : 'Quote at tcc.com.co (> 1 kg)',
      transitEs,
      transitEn,
      coverageEs: isTccAerialCity
        ? 'Destino aéreo explícito en red TCC (+1.300 destinos)'
        : '+1.300 destinos nacionales (reexpedición en zonas sin perímetro directo)',
      coverageEn: isTccAerialCity
        ? 'Explicit aerial destination in TCC network (1,300+ destinations)'
        : '1,300+ national destinations (reexpedition outside direct hubs)',
      methodologyEs: hasPublishedBand
        ? 'Referencia pública TCC para 1 kg + flete de manejo (1% nacional / hasta 2% especial o aéreo).'
        : 'TCC publica rangos base de 1 kg y adicional aéreo ~$5.000/kg tras rango inicial; para pesos exactos usa tcc.com.co.',
      methodologyEn: hasPublishedBand
        ? 'Published TCC 1 kg base reference + handling fee (1% national / up to 2% special or air).'
        : 'TCC publishes 1 kg base bands and ~$5,000/kg air add-on after base tier; verify exact >1 kg totals at tcc.com.co.',
      sourceDomain: 'tcc.com.co',
      savingsVsPostCargoMinCop:
        hasPublishedBand && postCargoPrice !== null ? minTotal! - postCargoPrice : null,
      savingsVsPostCargoMaxCop:
        hasPublishedBand && postCargoPrice !== null ? maxTotal! - postCargoPrice : null,
    };
  })();

  // 5. ENVÍA (COLVANES) (Color: #B91C1C)
  // Explicitly does not publish fixed flat prices in plain text; covers +1.400 destinations.
  const enviaRow: CarrierComparisonRow = {
    id: 'envia',
    name: 'Envía (Colvanes)',
    isPostCargo: false,
    representativeColorHex: '#B91C1C',
    colorNameEs: 'Rojo borgoña',
    colorNameEn: 'Burgundy Red',
    priceStatus: 'quote_required',
    minPriceCop: null,
    maxPriceCop: null,
    priceDisplayEs: 'Cotización dinámica en envia.co (sin tabla pública fija)',
    priceDisplayEn: 'Dynamic quote at envia.co (no fixed public table)',
    transitEs:
      routeType === '1. Metropolitano' || routeType === '3. Nacional Medio'
        ? '24 a 48 horas hábiles (según ruta)'
        : '2 a 5+ días hábiles (con reexpedición si no hay oficina)',
    transitEn:
      routeType === '1. Metropolitano' || routeType === '3. Nacional Medio'
        ? '24 to 48 business hours (route dependent)'
        : '2 to 5+ business days (reexpedition if no direct branch)',
    coverageEs: '+1.400 destinos en Colombia (aplica recargo de reexpedición sin oficina directa)',
    coverageEn: '1,400+ destinations in Colombia (reexpedition surcharge without direct branch)',
    methodologyEs:
      'No publica tarifario plano en texto libre. Liquida kilo inicial + kilo adicional + reexpedición en zonas apartadas + ~1% valor declarado.',
    methodologyEn:
      'Does not publish flat plain-text rate tables. Computes initial kg + extra kg + remote reexpedition surcharge + ~1% declared value.',
    sourceDomain: 'envia.co',
    savingsVsPostCargoMinCop: null,
    savingsVsPostCargoMaxCop: null,
  };

  const rows = [postCargoRow, servientregaRow, interRow, coordinadoraRow, tccRow, enviaRow];

  // Compute highlight savings vs verified numeric competitor estimates when PostCargo price is available
  let bestSavingsPct: number | null = null;
  if (postCargoPrice !== null && postCargoPrice > 0) {
    const comparablePrices = rows
      .filter((r) => !r.isPostCargo && r.minPriceCop !== null && r.minPriceCop > postCargoPrice)
      .map((r) => r.minPriceCop!);
    if (comparablePrices.length > 0) {
      const highestComparable = Math.max(...comparablePrices);
      bestSavingsPct = Math.round(
        ((highestComparable - postCargoPrice) / highestComparable) * 100
      );
    }
  }

  return {
    originName: estimate.origin.name,
    destinationName: estimate.destination.displayName,
    routeType,
    weightKg: safeWeight,
    declaredValueCop: safeDeclared,
    rows,
    bestSavingsPct,
  };
}

export function getComparisonNote(lang: Language): string {
  return lang === 'en'
    ? 'Competitor figures are strictly based on publicly documented 2025–2026 Colombian tariff ranges. Carrier marks are displayed only as compact, blurred reference identifiers; corridors outside public flat tables are clearly flagged for official carrier quoting.'
    : 'Las cifras de competidores corresponden únicamente a rangos tarifarios públicos vigentes documentados en Colombia (2025–2026). Los logos se muestran de forma compacta y borrosa como identificadores visuales; los pesos o rutas sin tabla pública fija se indican para consulta directa sin inventar valores.';
}
