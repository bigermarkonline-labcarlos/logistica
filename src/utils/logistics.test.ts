import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  COLOMBIAN_DESTINATIONS,
  COLOMBIAN_ORIGINS,
  DEFAULT_COP_PER_USD,
  MATRIX_TOTAL_ROUTES,
  calculateShippingEstimate,
  copToUsd,
  filterSiscoreShipments,
  findTrackedShipment,
  formatUsd,
  formatUsdRange,
  getAssistantSmartResponse,
  searchDestinations,
  validateCarrierApplication,
  validateHeroMeetingForm,
  validateQuoteLead,
  validateSiscoreLogin,
} from './logistics';
import { INITIAL_SISCORE_SHIPMENTS } from '../data/mockSiscore';
import { TARIFAS_2026 } from '../data/tarifas2026';
import { TRANSLATIONS } from '../i18n/translations';
import {
  angleOnRouteDeg,
  computeRouteTelemetry,
  getVehicleStageAtProgress,
  pointOnRoute,
} from './routeAnimation';

test('TARIFAS 2026 matrix loads all 1,255 routes and 16 origins matching source JSON', () => {
  const sourcePath = path.resolve(
    process.cwd(),
    'public/assets/aistudio/TARIFAS_2026_5b95baf0.json'
  );
  const rawJson = JSON.parse(fs.readFileSync(sourcePath, 'utf8')) as Array<
    Record<string, string>
  >;

  assert.equal(rawJson.length, 1255);
  assert.equal(MATRIX_TOTAL_ROUTES, 1255);
  assert.equal(TARIFAS_2026.length, 1255);
  assert.equal(COLOMBIAN_ORIGINS.length, 16);
  assert.equal(COLOMBIAN_DESTINATIONS.length, 1255);
});

test('calculateShippingEstimate computes exact 2026 matrix rates up to 25 kg and excess kg', () => {
  // 1. Metropolitan base liquidation ($18,000 + $4,000 = $22,000)
  const metro = calculateShippingEstimate({
    originId: 'BOGOTA',
    destinationId: 'BOGOTA|CUNDINAMARCA',
    vehicleId: 'campero_4x4',
    weightKg: 25,
    declaredValueCop: 400000,
    secopInsured: false,
    lang: 'es',
  });
  assert.equal(metro.found, true);
  if (metro.found) {
    assert.equal(metro.baseFreightCop, 18000);
    assert.equal(metro.excessKg, 0);
    assert.equal(metro.handlingFeeCop, 4000);
    assert.equal(metro.matrixTotalCop, 22000);
    assert.equal(metro.estimatedCostCop, 22000);
  }

  // 2. Extended corridor with excess kg: BOGOTA -> SAN JOSE DEL GUAVIARE (40 kg -> 15 kg * $1,500)
  const guaviare = calculateShippingEstimate({
    originId: 'BOGOTA',
    destinationId: 'SAN JOSE DEL GUAVIARE|GUAVIARE',
    vehicleId: 'campero_4x4',
    weightKg: 40,
    declaredValueCop: 400000,
    secopInsured: false,
    lang: 'es',
  });
  assert.equal(guaviare.found, true);
  if (guaviare.found) {
    assert.equal(guaviare.baseFreightCop, 60000);
    assert.equal(guaviare.excessKg, 15);
    assert.equal(guaviare.additionalKgRateCop, 1500);
    assert.equal(guaviare.additionalWeightCostCop, 22500);
    assert.equal(guaviare.handlingFeeCop, 4000);
    assert.equal(guaviare.matrixTotalCop, 86500);
    assert.equal(guaviare.estimatedDaysLabel, '3 a 4 días hábiles');
  }

  // 3. Declared-value handling rate > minimum $4,000: MEDELLIN -> QUIBDO (1.0% of $1,000,000 = $10,000)
  const quibdo = calculateShippingEstimate({
    originId: 'MEDELLIN',
    destinationId: 'QUIBDO|CHOCO',
    vehicleId: 'campero_4x4',
    weightKg: 25,
    declaredValueCop: 1000000,
    secopInsured: true,
    lang: 'en',
  });
  assert.equal(quibdo.found, true);
  if (quibdo.found) {
    assert.equal(quibdo.baseFreightCop, 48000);
    assert.equal(quibdo.handlingFeeCop, 10000);
    assert.equal(quibdo.matrixTotalCop, 58000);
    assert.ok(quibdo.secopComplianceFeeCop >= 6000);
    assert.equal(quibdo.estimatedCostCop, 58000 + quibdo.secopComplianceFeeCop);
    assert.equal(quibdo.estimatedDaysLabel, '2 to 3 business days');
  }
});

test('calculateShippingEstimate detects multimodal corridor and vehicle upgrade advisory', () => {
  const leticia = calculateShippingEstimate({
    originId: 'BOGOTA',
    destinationId: 'LETICIA|AMAZONAS',
    vehicleId: 'campero_4x4',
    weightKg: 2800,
    declaredValueCop: 500000,
    secopInsured: false,
  });

  assert.equal(leticia.found, true);
  if (leticia.found) {
    assert.equal(leticia.isMultimodal, true);
    assert.equal(leticia.requiresVehicleUpgrade, true);
    assert.equal(leticia.recommendedVehicle.id, 'turbo');
    assert.equal(leticia.baseFreightCop, 200000);
    assert.equal(leticia.additionalKgRateCop, 7200);
  }
});

test('calculateShippingEstimate returns requiresSpecialQuote instead of fabricating rates for unmapped pairs', () => {
  const unmapped = calculateShippingEstimate({
    originId: 'BOGOTA',
    destinationId: 'QUIBDO|CHOCO',
    vehicleId: 'campero_4x4',
    weightKg: 50,
    declaredValueCop: 400000,
    secopInsured: false,
    lang: 'es',
  });

  assert.equal(unmapped.found, false);
  assert.equal(unmapped.requiresSpecialQuote, true);
  if (!unmapped.found) {
    assert.ok(unmapped.reasonMessage.includes('cotización especial'));
    assert.ok(
      unmapped.availableOriginsForDestination.some((o) => o.id === 'MEDELLIN')
    );
  }
});

test('searchDestinations disambiguates same-name cities across departments', () => {
  const granadaMatches = searchDestinations('granada');
  assert.equal(granadaMatches.length, 4);
  const ids = granadaMatches.map((d) => d.id).sort();
  assert.deepEqual(ids, [
    'GRANADA|ANTIOQUIA',
    'GRANADA|CUNDINAMARCA',
    'GRANADA|META',
    'NUEVA GRANADA|MAGDALENA',
  ]);

  const bogotaGranadaMeta = calculateShippingEstimate({
    originId: 'BOGOTA',
    destinationId: 'GRANADA|META',
    vehicleId: 'estacas',
    weightKg: 25,
    secopInsured: false,
  });
  assert.equal(bogotaGranadaMeta.found, true);
  if (bogotaGranadaMeta.found) {
    assert.equal(bogotaGranadaMeta.baseFreightCop, 34000);
  }
});

test('filterSiscoreShipments finds invoice #1024 with or without hash symbol', () => {
  const byHash = filterSiscoreShipments(INITIAL_SISCORE_SHIPMENTS, '#1024', 'Todos');
  assert.equal(byHash.length, 1);
  assert.equal(byHash[0].invoiceNumber, 'FAC-1024');
  assert.equal(byHash[0].progressPercent, 72);

  const byMismatchStatus = filterSiscoreShipments(
    INITIAL_SISCORE_SHIPMENTS,
    '1024',
    'Entregado'
  );
  assert.equal(byMismatchStatus.length, 0);
});

test('getAssistantSmartResponse routes invoice, 4x4 carrier, and tariff questions in ES and EN', () => {
  const invoiceReplyEs = getAssistantSmartResponse('¿Cómo rastreo mi factura #1024?', 'es');
  assert.equal(invoiceReplyEs.suggestedAction, 'siscore');
  assert.ok(invoiceReplyEs.text.includes('1024'));

  const carrierReplyEn = getAssistantSmartResponse('How do I register my 4x4 truck?', 'en');
  assert.equal(carrierReplyEn.suggestedAction, 'carrier');
  assert.ok(carrierReplyEn.text.includes('4x4'));

  const tariffReplyEn = getAssistantSmartResponse('How long does shipping to Chocó take?', 'en');
  assert.equal(tariffReplyEn.suggestedAction, 'calculator');
  assert.ok(tariffReplyEn.text.includes('1,255'));
});

test('validateQuoteLead and validateCarrierApplication enforce formats in ES and EN', () => {
  const badLeadEn = validateQuoteLead(
    {
      companyOrName: '',
      phone: '123',
      email: 'invalid-email',
    },
    'en'
  );
  assert.ok(badLeadEn.companyOrName?.includes('company'));
  assert.ok(badLeadEn.phone?.includes('valid'));
  assert.ok(badLeadEn.email?.includes('email'));

  const goodLead = validateQuoteLead({
    companyOrName: 'Distribuidora Andina SAS',
    phone: '3104567890',
    email: 'logistica@andina.co',
  });
  assert.deepEqual(goodLead, {});

  const badCarrier = validateCarrierApplication({
    fullName: 'Carlos',
    documentId: '12',
    phone: '300',
    vehicleType: 'Campero 4x4',
    plate: '1234',
    baseDepartment: 'Meta',
  });
  assert.ok(badCarrier.documentId);
  assert.ok(badCarrier.phone);
  assert.ok(badCarrier.plate);
});

import { buildCarrierComparison } from './competitorBenchmark';

test('buildCarrierComparison compares real 2026 matrix tariffs against verified public benchmarks without fabricating', () => {
  // 1. BOGOTA -> SAN JOSE DEL GUAVIARE (6. Extendido) at 25 kg
  const guaviare25 = calculateShippingEstimate({
    originId: 'BOGOTA',
    destinationId: 'SAN JOSE DEL GUAVIARE|GUAVIARE',
    vehicleId: 'campero_4x4',
    weightKg: 25,
    declaredValueCop: 400000,
    secopInsured: false,
    lang: 'es',
  });
  const comp25 = buildCarrierComparison(guaviare25, 25, 400000);
  assert.equal(comp25.rows.length, 6);

  const pcRow = comp25.rows.find((r) => r.id === 'postcargo');
  assert.equal(pcRow?.priceStatus, 'exact_matrix');
  assert.equal(pcRow?.minPriceCop, 64000);

  const servRow = comp25.rows.find((r) => r.id === 'servientrega');
  assert.equal(servRow?.priceStatus, 'public_reference');
  // 33000 + 24*8300 + 2% of 400000 (8000) = 240200
  assert.equal(servRow?.minPriceCop, 240200);
  assert.equal(servRow?.savingsVsPostCargoMinCop, 240200 - 64000);

  // Inter (>5 kg), Coordinadora (>3 kg special), TCC (>1 kg), Envía (no flat public table) must NOT invent prices
  const enviaRow = comp25.rows.find((r) => r.id === 'envia');
  assert.equal(enviaRow?.priceStatus, 'quote_required');
  assert.equal(enviaRow?.minPriceCop, null);

  const interRow25 = comp25.rows.find((r) => r.id === 'inter_rapidisimo');
  assert.equal(interRow25?.priceStatus, 'quote_required');

  // 2. 1 kg package BOGOTA -> BOGOTA (1. Metropolitano) compares public 1 kg tiers
  const metro1 = calculateShippingEstimate({
    originId: 'BOGOTA',
    destinationId: 'BOGOTA|CUNDINAMARCA',
    vehicleId: 'campero_4x4',
    weightKg: 1,
    declaredValueCop: 400000,
    secopInsured: false,
    lang: 'es',
  });
  const comp1 = buildCarrierComparison(metro1, 1, 400000);
  const coord1 = comp1.rows.find((r) => r.id === 'coordinadora');
  const tcc1 = comp1.rows.find((r) => r.id === 'tcc');
  const inter1 = comp1.rows.find((r) => r.id === 'inter_rapidisimo');
  assert.equal(coord1?.priceStatus, 'public_reference');
  assert.equal(tcc1?.priceStatus, 'public_reference');
  assert.equal(inter1?.priceStatus, 'public_reference');

  // Every competitor has a representative hex color and no logo dependency
  for (const row of comp1.rows) {
    assert.ok(/^#[0-9A-Fa-f]{6}$/.test(row.representativeColorHex));
  }
});

test('copToUsd, formatUsd, and formatUsdRange convert COP amounts accurately using reference TRM', () => {
  assert.equal(Number(copToUsd(DEFAULT_COP_PER_USD).toFixed(4)), 1);
  assert.equal(formatUsd(64000, 3200), '$20.00 USD');
  assert.equal(formatUsdRange(32000, 64000, 3200), '$10.00 – $20.00 USD');
  assert.equal(formatUsdRange(32000, 32000, 3200), '$10.00 USD');
});

test('validateHeroMeetingForm validates required fields and policy acceptance in ES and EN', () => {
  const emptyErrorsEs = validateHeroMeetingForm(
    {
      fullName: '',
      company: 'A',
      email: 'bad',
      phone: '',
      monthlyShipments: '',
      operationType: '',
      criticalDestinations: '',
      acceptedPolicy: false,
    },
    'es'
  );
  assert.ok(emptyErrorsEs.fullName);
  assert.ok(emptyErrorsEs.company);
  assert.ok(emptyErrorsEs.email);
  assert.ok(emptyErrorsEs.monthlyShipments);
  assert.ok(emptyErrorsEs.operationType);
  assert.ok(emptyErrorsEs.acceptedPolicy);

  const emptyErrorsEn = validateHeroMeetingForm(
    {
      fullName: '',
      company: '',
      email: 'nope',
      phone: '',
      monthlyShipments: '',
      operationType: '',
      criticalDestinations: '',
      acceptedPolicy: false,
    },
    'en'
  );
  assert.ok(emptyErrorsEn.acceptedPolicy?.includes('data protection'));

  const validErrors = validateHeroMeetingForm(
    {
      fullName: 'Andrés Felipe Ruiz',
      company: 'Comercializadora Andina S.A.S.',
      email: 'andres@andina.co',
      phone: '3125558901',
      monthlyShipments: '50 a 250 envíos/mes',
      operationType: 'Reexpedición rural y multimodal',
      criticalDestinations: 'Quibdó, San José del Guaviare',
      acceptedPolicy: true,
    },
    'es'
  );
  assert.deepEqual(validErrors, {});
});

test('findTrackedShipment resolves invoices, remissions, and returns null for empty or unknown references', () => {
  assert.equal(findTrackedShipment(INITIAL_SISCORE_SHIPMENTS, '') , null);
  assert.equal(findTrackedShipment(INITIAL_SISCORE_SHIPMENTS, '   '), null);
  assert.equal(findTrackedShipment(INITIAL_SISCORE_SHIPMENTS, 'NO-EXISTE-999'), null);

  const byHash = findTrackedShipment(INITIAL_SISCORE_SHIPMENTS, '#1024');
  assert.equal(byHash?.invoiceNumber, 'FAC-1024');

  const byRemission = findTrackedShipment(INITIAL_SISCORE_SHIPMENTS, 'rem-4091');
  assert.equal(byRemission?.invoiceNumber, 'FAC-1024');
  assert.ok((byRemission?.milestones.length ?? 0) >= 3);

  const byDelivered = findTrackedShipment(INITIAL_SISCORE_SHIPMENTS, 'FAC-8859');
  assert.equal(byDelivered?.status, 'Entregado');
});

test('validateSiscoreLogin enforces role (principal/operadores/clientes), username, and password in ES and EN', () => {
  const emptyEs = validateSiscoreLogin(
    { role: 'clientes', username: '', password: '' },
    'es'
  );
  assert.ok(emptyEs.username?.includes('usuario'));
  assert.ok(emptyEs.password?.includes('contraseña'));

  const shortEn = validateSiscoreLogin(
    { role: 'operadores', username: 'ab', password: '12' },
    'en'
  );
  assert.ok(shortEn.username?.includes('username'));
  assert.ok(shortEn.password?.includes('password'));

  const validPrincipal = validateSiscoreLogin(
    { role: 'principal', username: 'supervisor.bog', password: 'clave9900' },
    'es'
  );
  assert.deepEqual(validPrincipal, {});
});

test('computeRouteTelemetry drives mountain slope pitch, 4-stage vehicle transitions, and checkpoint illumination', () => {
  const start = computeRouteTelemetry(0, 'es');
  assert.equal(start.stage, 'trunk_truck');
  assert.equal(start.trunkOpacity, 1);
  assert.equal(start.rural4x4Opacity, 0);
  assert.equal(start.lastMileOpacity, 0);
  assert.equal(start.activeStopIndex, 0);
  assert.equal(start.altitudeMeters, 2600);

  // Mid-cordillera climb/descent has non-zero slope pitch and advances along x
  const midTrunk = computeRouteTelemetry(0.18, 'es');
  assert.ok(midTrunk.point.x > start.point.x);
  assert.notEqual(Math.round(angleOnRouteDeg(0.18)), 0);

  // Villavicencio cross-docking relay switches to NKR regional vehicle
  const rural = computeRouteTelemetry(0.42, 'en');
  assert.equal(rural.stage, 'nkr_truck');
  assert.equal(rural.nkrTruckOpacity, 1);
  assert.equal(rural.trunkOpacity, 0);
  assert.equal(rural.activeStopIndex, 1);
  assert.ok(rural.isTransferringTo4x4);

  // Granada relay switches to a jeep, then a motorcycle for final last mile
  const lastMile = computeRouteTelemetry(0.78, 'es');
  assert.equal(getVehicleStageAtProgress(0.78), 'motorcycle');
  assert.equal(lastMile.motorcycleOpacity, 1);
  assert.equal(lastMile.nkrTruckOpacity, 0);
  assert.equal(lastMile.activeStopIndex, 2);

  // Arrival in San José del Guaviare illuminates final checkpoint and 100% completion
  const arrival = computeRouteTelemetry(1, 'es');
  assert.equal(arrival.activeStopIndex, 3);
  assert.equal(arrival.stage, 'motorcycle');
  assert.equal(arrival.altitudeMeters, 175);
  assert.ok(pointOnRoute(1).x > pointOnRoute(0.5).x);
});

test('Tracking UI copy in ES and EN contains no SISCORE word while preserving Acceso SISCORE modal copy', () => {
  const collectStrings = (val: unknown): string[] => {
    if (typeof val === 'string') return [val];
    if (Array.isArray(val)) return val.flatMap(collectStrings);
    if (val && typeof val === 'object') {
      return Object.values(val).flatMap(collectStrings);
    }
    return [];
  };

  for (const lang of ['es', 'en'] as const) {
    const dict = TRANSLATIONS[lang];
    const renderedTrackingStrings = collectStrings([
      dict.hero.tracking,
      dict.hero.pillars,
      dict.hero.videoCaption,
      dict.b2b,
      dict.footer,
      dict.assistant,
    ]);
    for (const text of renderedTrackingStrings) {
      assert.equal(
        /siscore/i.test(text),
        false,
        `Unexpected SISCORE in rendered text (${lang}): ${text}`
      );
    }
    assert.ok(/siscore/i.test(dict.nav.siscoreAccess));
    assert.ok(/siscore/i.test(dict.siscoreModal.title));
  }
});


