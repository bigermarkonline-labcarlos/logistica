import {
  TARIFAS_2026,
  type DestinationTypeCode,
  type MatrixRouteType,
  type TariffRoute,
} from '../data/tarifas2026';

export type Language = 'es' | 'en';

export type VehicleTypeId = 'campero_4x4' | 'estacas' | 'turbo' | 'npr';

export interface OriginCity {
  id: string;
  name: string;
  department: string;
  hubCode: string;
  routeCount: number;
}

export interface DestinationMunicipality {
  id: string; // `${destCity}|${destDept}`
  city: string;
  department: string;
  displayName: string;
  region: string;
  searchKey: string;
  availableOrigins: string[];
  primaryRouteType: MatrixRouteType;
  primaryDestCode: DestinationTypeCode;
}

export interface VehicleSpec {
  id: VehicleTypeId;
  label: string;
  labelEn: string;
  capacityLabel: string;
  capacityLabelEn: string;
  maxWeightKg: number;
  idealForEs: string;
  idealForEn: string;
}

export interface CalculatorInput {
  originId: string;
  destinationId: string;
  vehicleId: VehicleTypeId;
  weightKg: number;
  declaredValueCop?: number;
  secopInsured: boolean;
  lang?: Language;
}

export interface MatrixQuoteFound {
  found: true;
  requiresSpecialQuote: false;
  route: TariffRoute;
  origin: OriginCity;
  destination: DestinationMunicipality;
  selectedVehicle: VehicleSpec;
  recommendedVehicle: VehicleSpec;
  weightKg: number;
  includedWeightKg: number;
  excessKg: number;
  declaredValueCop: number;
  baseFreightCop: number;
  additionalKgRateCop: number;
  additionalWeightCostCop: number;
  handlingBaseCostCop: number;
  handlingRatePercent: number;
  handlingFeeCop: number;
  matrixTotalCop: number;
  secopComplianceFeeCop: number;
  estimatedCostCop: number;
  estimatedDaysLabel: string;
  routeTierLabel: string;
  isMultimodal: boolean;
  requiresVehicleUpgrade: boolean;
}

export interface MatrixQuoteMissing {
  found: false;
  requiresSpecialQuote: true;
  origin: OriginCity;
  destination: DestinationMunicipality;
  selectedVehicle: VehicleSpec;
  weightKg: number;
  declaredValueCop: number;
  secopInsured: boolean;
  availableOriginsForDestination: OriginCity[];
  reasonMessage: string;
}

export type ShippingEstimate = MatrixQuoteFound | MatrixQuoteMissing;

export type SiscoreStatus =
  | 'En Tránsito'
  | 'En Reexpedición'
  | 'Entregado'
  | 'Alerta Vial';

export interface SiscoreMilestone {
  timestamp: string;
  timestampEn?: string;
  location: string;
  description: string;
  descriptionEn?: string;
  completed: boolean;
}

export interface SiscoreShipment {
  id: string;
  invoiceNumber: string;
  remissionNumber: string;
  clientName: string;
  origin: string;
  destination: string;
  status: SiscoreStatus;
  progressPercent: number;
  carrierName: string;
  carrierPhone: string;
  vehicleLabel: string;
  plate: string;
  weightKg: number;
  etaLabel: string;
  etaLabelEn?: string;
  realtimeAlert: string;
  realtimeAlertEn?: string;
  secopContract?: string;
  milestones: SiscoreMilestone[];
}

export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim();
}

export function formatTitleCase(value: string): string {
  const lowerWords = new Set(['DE', 'DEL', 'LA', 'LAS', 'LOS', 'Y', 'EL']);
  return value
    .trim()
    .split(/\s+/)
    .map((word, idx) => {
      const upper = word.toUpperCase();
      if (idx > 0 && lowerWords.has(upper)) {
        return upper.toLowerCase();
      }
      if (upper === 'BOGOTA') return 'Bogotá D.C.';
      if (upper === 'MEDELLIN') return 'Medellín';
      if (upper === 'IBAGUE') return 'Ibagué';
      if (upper === 'POPAYAN') return 'Popayán';
      if (upper === 'CUCUTA') return 'Cúcuta';
      if (upper === 'CHOCO') return 'Chocó';
      if (upper === 'NARINO') return 'Nariño';
      if (upper === 'BOYACA') return 'Boyacá';
      if (upper === 'CAQUETA') return 'Caquetá';
      if (upper === 'GUAINIA') return 'Guainía';
      if (upper === 'VAUPES') return 'Vaupés';
      if (upper === 'ATLANTICO') return 'Atlántico';
      if (upper === 'BOLIVAR') return 'Bolívar';
      if (upper === 'CORDOBA') return 'Córdoba';
      if (upper === 'QUINDIO') return 'Quindío';
      if (upper === 'QUIBDO') return 'Quibdó';
      if (upper === 'SAN ANDRES') return 'San Andrés';
      return upper.charAt(0) + upper.slice(1).toLowerCase();
    })
    .join(' ');
}

const HUB_CODES: Record<string, string> = {
  BOGOTA: 'HUB-BOG',
  IBAGUE: 'HUB-IBE',
  TUNJA: 'HUB-TUN',
  BARRANQUILLA: 'HUB-BAQ',
  CARTAGENA: 'HUB-CTG',
  'SANTA MARTA': 'HUB-SMR',
  SINCELEJO: 'HUB-SJE',
  BUCARAMANGA: 'HUB-BGA',
  CUCUTA: 'HUB-CUC',
  MEDELLIN: 'HUB-MDE',
  CALI: 'HUB-CLO',
  PASTO: 'HUB-PSO',
  POPAYAN: 'HUB-PPN',
  BUENAVENTURA: 'HUB-BUN',
  PEREIRA: 'HUB-PEI',
  NEIVA: 'HUB-NVA',
};

// Build origins and destinations dynamically from the 1,255-row TARIFAS_2026 matrix
const originAccumulator = new Map<
  string,
  { department: string; count: number }
>();
const destinationAccumulator = new Map<
  string,
  {
    city: string;
    department: string;
    region: string;
    origins: Set<string>;
    routeType: MatrixRouteType;
    destCode: DestinationTypeCode;
  }
>();
const routeLookupMap = new Map<string, TariffRoute>();

for (const row of TARIFAS_2026) {
  routeLookupMap.set(`${row.originCity}__${row.destinationId}`, row);

  const existingOrigin = originAccumulator.get(row.originCity);
  if (existingOrigin) {
    existingOrigin.count += 1;
  } else {
    originAccumulator.set(row.originCity, {
      department: row.originDept,
      count: 1,
    });
  }

  const existingDest = destinationAccumulator.get(row.destinationId);
  if (existingDest) {
    existingDest.origins.add(row.originCity);
  } else {
    destinationAccumulator.set(row.destinationId, {
      city: row.destCity,
      department: row.destDept,
      region: row.destRegion,
      origins: new Set([row.originCity]),
      routeType: row.routeType,
      destCode: row.destCode,
    });
  }
}

export const MATRIX_TOTAL_ROUTES = TARIFAS_2026.length;

export const COLOMBIAN_ORIGINS: OriginCity[] = Array.from(
  originAccumulator.entries()
).map(([id, info]) => ({
  id,
  name: formatTitleCase(id),
  department: formatTitleCase(info.department),
  hubCode: HUB_CODES[id] ?? `HUB-${id.slice(0, 3)}`,
  routeCount: info.count,
}));

export const COLOMBIAN_DESTINATIONS: DestinationMunicipality[] = Array.from(
  destinationAccumulator.entries()
)
  .map(([id, info]) => {
    const cityDisplay = formatTitleCase(info.city);
    const deptDisplay = formatTitleCase(info.department);
    return {
      id,
      city: info.city,
      department: info.department,
      displayName: `${cityDisplay} (${deptDisplay})`,
      region: info.region.replace(/^\d+\.\s*/, ''),
      searchKey: normalizeText(`${info.city} ${info.department} ${info.region}`),
      availableOrigins: Array.from(info.origins),
      primaryRouteType: info.routeType,
      primaryDestCode: info.destCode,
    };
  })
  .sort((a, b) => a.displayName.localeCompare(b.displayName, 'es'));

export const VEHICLE_TYPES: VehicleSpec[] = [
  {
    id: 'campero_4x4',
    label: 'Paquetería / 4x4',
    labelEn: 'Parcel / 4x4 Utility',
    capacityLabel: '1 a 900 kg',
    capacityLabelEn: '1 to 900 kg',
    maxWeightKg: 900,
    idealForEs: 'Cajas desde 25 kg, trochas, veredas y municipios de trayecto especial o extendido',
    idealForEn: 'Boxes from 25 kg, unpaved trails, rural townships and special or extended corridors',
  },
  {
    id: 'estacas',
    label: 'Estacas',
    labelEn: 'Stakebed Truck',
    capacityLabel: 'Hasta 1.800 kg',
    capacityLabelEn: 'Up to 1,800 kg',
    maxWeightKg: 1800,
    idealForEs: 'Ferretería, agroinsumos, carga paletizada y maquinaria liviana',
    idealForEn: 'Hardware, agricultural supplies, palletized freight and light machinery',
  },
  {
    id: 'turbo',
    label: 'Turbo',
    labelEn: 'Turbo (3.5 Ton)',
    capacityLabel: 'Hasta 3.500 kg',
    capacityLabelEn: 'Up to 3,500 kg',
    maxWeightKg: 3500,
    idealForEs: 'Consumo masivo, retail, farma y entregas municipales de mediano volumen',
    idealForEn: 'FMCG, retail, pharma and mid-volume municipal distribution',
  },
  {
    id: 'npr',
    label: 'NPR',
    labelEn: 'NPR (5 Ton)',
    capacityLabel: 'Hasta 5.000 kg',
    capacityLabelEn: 'Up to 5,000 kg',
    maxWeightKg: 5000,
    idealForEs: 'Contratos SECOP, abastecimiento institucional y carga consolidada',
    idealForEn: 'SECOP public contracts, institutional supply and consolidated linehaul',
  },
];

const ROUTE_TYPE_TRANSIT: Record<
  MatrixRouteType,
  {
    esDays: string;
    enDays: string;
    esTier: string;
    enTier: string;
  }
> = {
  '1. Metropolitano': {
    esDays: '24 horas (1 día hábil)',
    enDays: '24 hours (1 business day)',
    esTier: 'Metropolitano (Tipo A)',
    enTier: 'Metropolitan (Tier A)',
  },
  '3. Nacional Medio': {
    esDays: '1 a 2 días hábiles',
    enDays: '1 to 2 business days',
    esTier: 'Nacional Medio (Tipo C)',
    enTier: 'Regional Trunk (Tier C)',
  },
  '4. Nacional Abierto': {
    esDays: '2 días hábiles',
    enDays: '2 business days',
    esTier: 'Nacional Abierto (Tipos D / E)',
    enTier: 'Open National (Tiers D / E)',
  },
  '5. Especial': {
    esDays: '2 a 3 días hábiles',
    enDays: '2 to 3 business days',
    esTier: 'Trayecto Especial (Tipos F / G / H)',
    enTier: 'Special Corridor (Tiers F / G / H)',
  },
  '6. Extendido': {
    esDays: '3 a 4 días hábiles',
    enDays: '3 to 4 business days',
    esTier: 'Reexpedición Extendida (Tipos I / J)',
    enTier: 'Extended Reexpedition (Tiers I / J)',
  },
  '7. Multimodal': {
    esDays: '3 a 5 días hábiles',
    enDays: '3 to 5 business days',
    esTier: 'Multimodal Aéreo / Fluvial (Tipo K)',
    enTier: 'Air / River Multimodal (Tier K)',
  },
};

export function formatCop(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

// Reference Colombian TRM (Superintendencia Financiera / Banco de la República)
export const DEFAULT_COP_PER_USD = 3461.92;

export function copToUsd(
  amountCop: number,
  copPerUsd: number = DEFAULT_COP_PER_USD
): number {
  const safeRate = copPerUsd > 0 ? copPerUsd : DEFAULT_COP_PER_USD;
  return amountCop / safeRate;
}

export function formatUsd(
  amountCop: number,
  copPerUsd: number = DEFAULT_COP_PER_USD
): string {
  const usd = copToUsd(amountCop, copPerUsd);
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(usd);
  return `${formatted} USD`;
}

export function formatUsdRange(
  minCop: number,
  maxCop: number,
  copPerUsd: number = DEFAULT_COP_PER_USD
): string {
  const minUsd = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(copToUsd(minCop, copPerUsd));

  if (Math.round(minCop) === Math.round(maxCop)) {
    return `${minUsd} USD`;
  }

  const maxUsd = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(copToUsd(maxCop, copPerUsd));

  return `${minUsd} – ${maxUsd} USD`;
}

export function getRouteFromMatrix(
  originId: string,
  destinationId: string
): TariffRoute | undefined {
  const normOrigin = originId.trim().toUpperCase();
  const normDest = destinationId.trim().toUpperCase();
  return routeLookupMap.get(`${normOrigin}__${normDest}`);
}

export function searchDestinations(
  query: string,
  onlyForOriginId?: string
): DestinationMunicipality[] {
  const normQuery = normalizeText(query);
  const normOrigin = onlyForOriginId ? onlyForOriginId.trim().toUpperCase() : '';

  return COLOMBIAN_DESTINATIONS.filter((dest) => {
    if (normOrigin && !dest.availableOrigins.includes(normOrigin)) {
      return false;
    }
    if (!normQuery) return true;
    return dest.searchKey.includes(normQuery);
  });
}

export function recommendVehicle(
  weightKg: number,
  routeType: MatrixRouteType
): VehicleSpec {
  const safeWeight = Math.max(1, weightKg);
  const candidates = VEHICLE_TYPES.filter((v) => v.maxWeightKg >= safeWeight);
  if (candidates.length === 0) {
    return VEHICLE_TYPES[VEHICLE_TYPES.length - 1];
  }
  if (
    (routeType === '5. Especial' ||
      routeType === '6. Extendido' ||
      routeType === '7. Multimodal') &&
    safeWeight <= 900
  ) {
    return VEHICLE_TYPES[0];
  }
  return candidates[0];
}

export function calculateShippingEstimate(input: CalculatorInput): ShippingEstimate {
  const lang: Language = input.lang ?? 'es';
  const normOrigin = input.originId.trim().toUpperCase();
  const normDest = input.destinationId.trim().toUpperCase();

  const origin =
    COLOMBIAN_ORIGINS.find((o) => o.id === normOrigin) ?? {
      id: normOrigin || 'UNKNOWN',
      name: formatTitleCase(normOrigin || 'Origen'),
      department: '',
      hubCode: 'HUB-EXT',
      routeCount: 0,
    };

  const destination =
    COLOMBIAN_DESTINATIONS.find((d) => d.id === normDest) ?? {
      id: normDest || 'UNKNOWN',
      city: normDest.split('|')[0] ?? normDest,
      department: normDest.split('|')[1] ?? '',
      displayName: formatTitleCase(normDest.replace('|', ' (') + (normDest.includes('|') ? ')' : '')),
      region: '',
      searchKey: normalizeText(normDest),
      availableOrigins: [],
      primaryRouteType: '5. Especial' as MatrixRouteType,
      primaryDestCode: 'F' as DestinationTypeCode,
    };

  const selectedVehicle =
    VEHICLE_TYPES.find((v) => v.id === input.vehicleId) ?? VEHICLE_TYPES[0];

  const weightKg = Math.max(1, Math.min(15000, Number(input.weightKg) || 25));
  const declaredValueCop = Math.max(
    0,
    Math.min(500000000, Number(input.declaredValueCop ?? 400000) || 0)
  );

  const route = getRouteFromMatrix(normOrigin, normDest);

  if (!route) {
    const availableOriginsForDestination = destination.availableOrigins
      .map((origId) => COLOMBIAN_ORIGINS.find((o) => o.id === origId))
      .filter((o): o is OriginCity => Boolean(o));

    return {
      found: false,
      requiresSpecialQuote: true,
      origin,
      destination,
      selectedVehicle,
      weightKg,
      declaredValueCop,
      secopInsured: input.secopInsured,
      availableOriginsForDestination,
      reasonMessage:
        lang === 'en'
          ? `The corridor ${origin.name} → ${destination.displayName} is not directly published in the standard 1,255-route 2026 matrix and requires a special quote.`
          : `El trayecto ${origin.name} → ${destination.displayName} no existe directamente en la matriz estándar de 1.255 rutas 2026 y requiere cotización especial.`,
    };
  }

  const includedWeightKg = route.maxBoxWeightKg;
  const baseFreightCop = route.freightUpTo25Kg;
  const excessKg = Math.max(0, Math.ceil(weightKg - includedWeightKg));
  const additionalKgRateCop = route.additionalKgRate;
  const additionalWeightCostCop = excessKg * additionalKgRateCop;

  const calculatedHandling = Math.round(
    declaredValueCop * (route.handlingRatePercent / 100)
  );
  const handlingFeeCop = Math.max(route.handlingBaseCost, calculatedHandling);

  const matrixTotalCop = Math.max(
    route.minBoxLiquidation,
    baseFreightCop + additionalWeightCostCop + handlingFeeCop
  );

  const secopComplianceFeeCop = input.secopInsured
    ? Math.max(6000, Math.round(matrixTotalCop * 0.05))
    : 0;

  const estimatedCostCop = matrixTotalCop + secopComplianceFeeCop;
  const recommendedVehicle = recommendVehicle(weightKg, route.routeType);
  const transitInfo = ROUTE_TYPE_TRANSIT[route.routeType];

  return {
    found: true,
    requiresSpecialQuote: false,
    route,
    origin,
    destination,
    selectedVehicle,
    recommendedVehicle,
    weightKg,
    includedWeightKg,
    excessKg,
    declaredValueCop,
    baseFreightCop,
    additionalKgRateCop,
    additionalWeightCostCop,
    handlingBaseCostCop: route.handlingBaseCost,
    handlingRatePercent: route.handlingRatePercent,
    handlingFeeCop,
    matrixTotalCop,
    secopComplianceFeeCop,
    estimatedCostCop,
    estimatedDaysLabel: lang === 'en' ? transitInfo.enDays : transitInfo.esDays,
    routeTierLabel: lang === 'en' ? transitInfo.enTier : transitInfo.esTier,
    isMultimodal: route.routeType === '7. Multimodal',
    requiresVehicleUpgrade: weightKg > selectedVehicle.maxWeightKg,
  };
}

export function filterSiscoreShipments(
  shipments: SiscoreShipment[],
  query: string,
  statusFilter: SiscoreStatus | 'Todos'
): SiscoreShipment[] {
  const normalizedQuery = query.trim().toLowerCase().replace(/^#/, '');

  return shipments.filter((item) => {
    const matchesStatus =
      statusFilter === 'Todos' || item.status === statusFilter;

    if (!matchesStatus) return false;
    if (!normalizedQuery) return true;

    const haystack = [
      item.invoiceNumber,
      item.remissionNumber,
      item.clientName,
      item.origin,
      item.destination,
      item.carrierName,
      item.plate,
      item.secopContract ?? '',
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });
}

export interface AssistantReply {
  text: string;
  suggestedAction: 'calculator' | 'siscore' | 'carrier' | null;
}

export function getAssistantSmartResponse(
  rawQuery: string,
  lang: Language = 'es'
): AssistantReply {
  const q = rawQuery.toLowerCase().trim();

  if (
    q.includes('1024') ||
    q.includes('rastreo') ||
    q.includes('track') ||
    q.includes('factura') ||
    q.includes('invoice') ||
    q.includes('guía') ||
    q.includes('guia') ||
    q.includes('remisi') ||
    q.includes('siscore')
  ) {
    return {
      text:
        lang === 'en'
          ? 'Your invoice #1024 (Remission REM-4091) is active in real-time tracking: dispatched from Bogotá to San José del Guaviare under Rural Reexpedition with driver Carlos Méndez (4x4 Utility, plate WKL-418). You can query it right now in the Hero tracker to inspect live route checkpoints.'
          : 'Tu factura #1024 (Remisión REM-4091) está activa en el rastreo en vivo: salió de Bogotá rumbo a San José del Guaviare en modalidad Reexpedición Rural con el conductor Carlos Méndez (Campero 4x4, placa WKL-418). Puedes consultarla ahora mismo en el buscador del inicio para ver cada punto de control.',
      suggestedAction: 'siscore',
    };
  }

  if (
    q.includes('4x4') ||
    q.includes('camioneta') ||
    q.includes('campero') ||
    q.includes('turbo') ||
    q.includes('npr') ||
    q.includes('estacas') ||
    q.includes('registr') ||
    q.includes('register') ||
    q.includes('vincular') ||
    q.includes('vehículo') ||
    q.includes('vehiculo') ||
    q.includes('vehicle') ||
    q.includes('truck') ||
    q.includes('carrier') ||
    q.includes('conductor')
  ) {
    return {
      text:
        lang === 'en'
          ? 'Great! If you own a 4x4 utility, Stakebed, Turbo or NPR truck, you can apply in the Partner Carriers section with your license plate, ID/NIT and home region. We provide fixed regional routes, backhaul loads and guaranteed biweekly settlements.'
          : 'Excelente. Si tienes Campero 4x4, Estacas, Turbo o NPR propio, puedes postularte en la sección de Transportistas Aliados con tu placa, cédula/NIT y zona base. Ofrecemos rutas fijas regionales, carga de retorno y liquidación quincenal.',
      suggestedAction: 'carrier',
    };
  }

  if (
    q.includes('tarifa') ||
    q.includes('rate') ||
    q.includes('cost') ||
    q.includes('price') ||
    q.includes('quote') ||
    q.includes('cuesta') ||
    q.includes('precio') ||
    q.includes('cotiz') ||
    q.includes('tarda') ||
    q.includes('demora') ||
    q.includes('tiempo') ||
    q.includes('how long') ||
    q.includes('chocó') ||
    q.includes('choco') ||
    q.includes('amazonas') ||
    q.includes('catatumbo') ||
    q.includes('guaviare') ||
    q.includes('secop') ||
    q.includes('matriz') ||
    q.includes('matrix')
  ) {
    return {
      text:
        lang === 'en'
          ? 'Our 2026 Tariff Matrix covers 1,255 regional corridors across 16 bases and 32 departments. Special corridors like Chocó (Medellín → Quibdó) take 2 to 3 business days, Extended routes like San José del Guaviare take 3 to 4 business days, and Multimodal routes like Leticia take 3 to 5 days. If a corridor is not in the standard matrix, the calculator flags it for a special quote.'
          : 'Nuestra Matriz de Tarifas 2026 cubre 1.255 trayectos reales desde 16 bases en los 32 departamentos. Trayectos especiales como Medellín → Quibdó tardan de 2 a 3 días hábiles, extendidos como Bogotá → San José del Guaviare de 3 a 4 días, y multimodales como Leticia de 3 a 5 días. Usa la Calculadora para consultar la liquidación exacta o solicitar cotización especial.',
      suggestedAction: 'calculator',
    };
  }

  return {
    text:
      lang === 'en'
        ? 'Happy to help. I can guide you to check exact rates across 1,255 corridors in the 2026 Calculator, register your 4x4/Turbo/NPR vehicle as a partner carrier, or track an internal invoice in real time (such as #1024). What do you need today?'
        : 'Con gusto te ayudo. Puedo orientarte para consultar fletes reales en la matriz de 1.255 trayectos, vincular tu vehículo 4x4/Turbo/NPR como transportista aliado o consultar una factura en tiempo real (como la #1024). ¿Qué necesitas hoy?',
    suggestedAction: 'calculator',
  };
}

export interface QuoteLeadForm {
  companyOrName: string;
  phone: string;
  email: string;
  notes?: string;
}

export interface CarrierApplicationForm {
  fullName: string;
  documentId: string;
  phone: string;
  vehicleType: string;
  plate: string;
  baseDepartment: string;
}

export function validateQuoteLead(
  form: QuoteLeadForm,
  lang: Language = 'es'
): Partial<Record<keyof QuoteLeadForm, string>> {
  const errors: Partial<Record<keyof QuoteLeadForm, string>> = {};
  if (!form.companyOrName.trim() || form.companyOrName.trim().length < 2) {
    errors.companyOrName =
      lang === 'en'
        ? 'Enter your company or contact name.'
        : 'Ingresa el nombre o razón social.';
  }
  const cleanPhone = form.phone.replace(/\D/g, '');
  if (cleanPhone.length < 7 || cleanPhone.length > 13) {
    errors.phone =
      lang === 'en'
        ? 'Enter a valid mobile or WhatsApp number.'
        : 'Ingresa un número celular o WhatsApp válido.';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email =
      lang === 'en'
        ? 'Enter a valid email address.'
        : 'Ingresa un correo electrónico válido.';
  }
  return errors;
}

export function validateCarrierApplication(
  form: CarrierApplicationForm,
  lang: Language = 'es'
): Partial<Record<keyof CarrierApplicationForm, string>> {
  const errors: Partial<Record<keyof CarrierApplicationForm, string>> = {};
  if (!form.fullName.trim() || form.fullName.trim().length < 3) {
    errors.fullName =
      lang === 'en' ? 'Enter your full name.' : 'Ingresa tu nombre completo.';
  }
  const cleanDoc = form.documentId.replace(/\D/g, '');
  if (cleanDoc.length < 6) {
    errors.documentId =
      lang === 'en'
        ? 'Enter a valid ID or NIT number.'
        : 'Ingresa tu número de cédula o NIT válido.';
  }
  const cleanPhone = form.phone.replace(/\D/g, '');
  if (cleanPhone.length < 7) {
    errors.phone =
      lang === 'en'
        ? 'Enter a valid WhatsApp contact number.'
        : 'Ingresa un número WhatsApp de contacto.';
  }
  if (!form.vehicleType.trim()) {
    errors.vehicleType =
      lang === 'en' ? 'Select the vehicle type.' : 'Selecciona el tipo de vehículo.';
  }
  if (!/^[A-Za-z]{3}[-\s]?\d{3}$/.test(form.plate.trim())) {
    errors.plate =
      lang === 'en'
        ? 'Invalid license plate format (e.g., WKL-418).'
        : 'Formato de placa inválido (ej. WKL-418).';
  }
  if (!form.baseDepartment.trim()) {
    errors.baseDepartment =
      lang === 'en'
        ? 'Specify your home department or operating zone.'
        : 'Indica tu departamento o zona base.';
  }
  return errors;
}

export interface HeroMeetingForm {
  fullName: string;
  company: string;
  email: string;
  phone: string;
  monthlyShipments: string;
  operationType: string;
  criticalDestinations: string;
  acceptedPolicy: boolean;
}

export function validateHeroMeetingForm(
  form: HeroMeetingForm,
  lang: Language = 'es'
): Partial<Record<keyof HeroMeetingForm, string>> {
  const errors: Partial<Record<keyof HeroMeetingForm, string>> = {};
  if (!form.fullName.trim() || form.fullName.trim().length < 2) {
    errors.fullName =
      lang === 'en' ? 'Enter your full name.' : 'Ingresa tu nombre.';
  }
  if (!form.company.trim() || form.company.trim().length < 2) {
    errors.company =
      lang === 'en' ? 'Enter your company name.' : 'Ingresa el nombre de tu empresa.';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email =
      lang === 'en'
        ? 'Enter a valid corporate email.'
        : 'Ingresa un correo corporativo válido.';
  }
  if (!form.monthlyShipments.trim()) {
    errors.monthlyShipments =
      lang === 'en'
        ? 'Select your monthly volume.'
        : 'Selecciona el volumen mensual de envíos.';
  }
  if (!form.operationType.trim()) {
    errors.operationType =
      lang === 'en'
        ? 'Select your operation type.'
        : 'Selecciona el tipo de operación.';
  }
  if (!form.acceptedPolicy) {
    errors.acceptedPolicy =
      lang === 'en'
        ? 'Accept the data protection policy to continue.'
        : 'Autoriza el tratamiento de datos para continuar.';
  }
  return errors;
}

export function findTrackedShipment(
  shipments: SiscoreShipment[],
  rawQuery: string
): SiscoreShipment | null {
  const cleaned = rawQuery.trim().toUpperCase().replace(/^#/, '');
  if (!cleaned) return null;

  const exactMatch = shipments.find((item) => {
    const inv = item.invoiceNumber.toUpperCase();
    const invNum = inv.replace(/^FAC-/, '');
    const rem = item.remissionNumber.toUpperCase();
    const remNum = rem.replace(/^REM-/, '');
    const secop = (item.secopContract ?? '').toUpperCase();

    return (
      inv === cleaned ||
      invNum === cleaned ||
      rem === cleaned ||
      remNum === cleaned ||
      item.id.toUpperCase() === cleaned ||
      (secop !== '' && secop === cleaned)
    );
  });

  if (exactMatch) return exactMatch;

  if (cleaned.length < 3) return null;

  return (
    shipments.find((item) => {
      const fields = [
        item.invoiceNumber,
        item.remissionNumber,
        item.plate,
        item.secopContract ?? '',
      ]
        .join(' ')
        .toUpperCase();
      return fields.includes(cleaned);
    }) ?? null
  );
}

export type SiscoreRole = 'principal' | 'operadores' | 'clientes';

export interface SiscoreLoginForm {
  role: SiscoreRole;
  username: string;
  password: string;
}

export function validateSiscoreLogin(
  form: SiscoreLoginForm,
  lang: Language = 'es'
): Partial<Record<keyof SiscoreLoginForm, string>> {
  const errors: Partial<Record<keyof SiscoreLoginForm, string>> = {};
  if (
    form.role !== 'principal' &&
    form.role !== 'operadores' &&
    form.role !== 'clientes'
  ) {
    errors.role =
      lang === 'en' ? 'Select an access profile.' : 'Selecciona un perfil de acceso.';
  }
  if (!form.username.trim() || form.username.trim().length < 3) {
    errors.username =
      lang === 'en'
        ? 'Enter a valid username (min. 3 characters).'
        : 'Ingresa tu usuario (mínimo 3 caracteres).';
  }
  if (!form.password.trim() || form.password.trim().length < 4) {
    errors.password =
      lang === 'en'
        ? 'Enter your password (min. 4 characters).'
        : 'Ingresa tu contraseña (mínimo 4 caracteres).';
  }
  return errors;
}


