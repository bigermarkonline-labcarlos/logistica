import { useState } from 'react';
import { ArrowRight, CheckSquare, PackageCheck, Square } from 'lucide-react';
import type { Language } from '../utils/logistics';

interface LastMileVasSectionProps {
  lang: Language;
  onRequestVasPilot: (selectedTasksSummary: string) => void;
}

const VAS_SERVICES = [
  {
    id: 'apparel_fitting',
    titleEs: 'Prueba de prendas y devolución inmediata',
    titleEn: 'Doorstep apparel fitting & instant return',
    descEs:
      'El cliente final verifica talla y calce mientras el mensajero aguarda en ventana controlada. Si no se queda con la prenda, la devolución se registra al instante en tablet sin cobros extra ni trámites posteriores.',
    descEn:
      'End customers verify fit and sizing during a controlled courier wait window. Any declined item is logged immediately on tablet for same-trip reverse return with zero extra portal friction.',
  },
  {
    id: 'unboxing_inspection',
    titleEs: 'Desempaque y validación de contenido en sitio',
    titleEn: 'Assisted unboxing & live content check',
    descEs:
      'Apertura asistida del paquete frente al destinatario, conteo de unidades, verificación de seriales o estado físico y captura fotográfica georreferenciada en trazabilidad digital.',
    descEn:
      'Guided package opening in front of the recipient, item count, serial/condition verification and geotagged photographic proof synced to digital traceability.',
  },
  {
    id: 'packaging_haul_away',
    titleEs: 'Retiro de empaques y logística inversa circular',
    titleEn: 'Packaging haul-away & circular reverse pickup',
    descEs:
      'Recolección ordenada de cartón, plástico protector, guacales o estibas retornables al finalizar la entrega para dejar el espacio limpio y reincorporar empaques a bodega.',
    descEn:
      'Clean collection of cardboard cartons, protective wrap, crates or returnable pallets upon delivery completion for recycling or warehouse reuse.',
  },
  {
    id: 'light_assembly_docs',
    titleEs: 'Armado básico y retorno de documentos firmados',
    titleEn: 'Light assembly & signed document return',
    descEs:
      'Ensamble liviano de mobiliario o equipos en el punto de entrega, puesta en marcha básica y devolución física o digitalizada de facturas y actas firmadas.',
    descEn:
      'Light on-site assembly of furniture or equipment, basic commissioning check, and physical or digitized return of signed invoices and delivery certificates.',
  },
];

export default function LastMileVasSection({
  lang,
  onRequestVasPilot,
}: LastMileVasSectionProps) {
  const [selectedTasks, setSelectedTasks] = useState<string[]>([
    'apparel_fitting',
    'packaging_haul_away',
  ]);
  const [imgError, setImgError] = useState(false);

  const toggleTask = (id: string) => {
    setSelectedTasks((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleRequestPilot = () => {
    const selectedLabels = VAS_SERVICES.filter((s) =>
      selectedTasks.includes(s.id)
    ).map((s) => (lang === 'en' ? s.titleEn : s.titleEs));

    const summary =
      selectedLabels.length > 0
        ? `${lang === 'en' ? 'Assisted Last-Mile VAS:' : 'Última Milla Asistida (VAS):'} ${selectedLabels.join(', ')}`
        : lang === 'en'
          ? 'Assisted Last-Mile Value-Added Services inquiry'
          : 'Solicitud de Logística de Última Milla Asistida';

    onRequestVasPilot(summary);
  };

  return (
    <section
      id="ultima-milla"
      className="py-16 lg:py-20 bg-[#F6F8FB] border-b border-slate-200/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          {/* Left Column: High-Fidelity Editorial Photography */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="relative flex-1 min-h-[320px] lg:h-full rounded-2xl overflow-hidden border border-slate-200/80 shadow-xl shadow-slate-900/10 bg-[#042544]">
              <div className="absolute inset-x-0 top-0 h-1.5 bg-[#F59E0B] z-10" aria-hidden="true" />
              {!imgError ? (
                <img
                  src="/src/assets/images/last_mile_assisted_vas_1795240893060.jpg"
                  alt={
                    lang === 'en'
                      ? 'PostCargo specialist assisting customer with apparel unboxing, digital return tablet and packaging removal at home'
                      : 'Especialista PostCargo asistiendo a cliente final con desempaque de prenda, registro digital en tablet y retiro de empaques'
                  }
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-white">
                  <PackageCheck className="w-10 h-10 text-[#F59E0B] mb-2" />
                  <p className="font-display font-bold text-center">
                    {lang === 'en'
                      ? 'Last-Mile Value-Added Services'
                      : 'Logística de Última Milla Asistida'}
                  </p>
                </div>
              )}

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#02182E]/95 via-[#042544]/70 to-transparent p-5 text-white">
                <p className="text-xs font-semibold text-[#F59E0B]">
                  {lang === 'en'
                    ? 'Last-Mile Value-Added Services'
                    : 'Servicio Especial · Última Milla Asistida'}
                </p>
                <p className="font-display text-base font-bold mt-1 leading-snug">
                  {lang === 'en'
                    ? 'Doorstep fitting, unboxing, packaging removal and instant return logging.'
                    : 'Prueba en puerta, desempaque, armado y devolución inmediata en una sola visita.'}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive VAS Capabilities & Pilot Request */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div>
              <h2
                className="font-display text-2xl sm:text-3xl font-bold text-[#042544]"
                style={{ textWrap: 'balance' }}
              >
                {lang === 'en'
                  ? 'Assisted Last-Mile Delivery: tasks completed right at your customer’s door'
                  : 'Logística de Última Milla Asistida para e-commerce y entregas de alto valor'}
              </h2>
              <p className="text-slate-600 mt-3 text-base leading-relaxed">
                {lang === 'en'
                  ? 'Reduce failed returns and elevate end-customer satisfaction. Select the value-added doorstep tasks your operation requires so our trained crew executes them at delivery.'
                  : 'Reduce devoluciones tardías y fricciones postventa. Selecciona las tareas adicionales que ejecutamos en el punto de entrega al cliente final bajo trazabilidad digital:'}
              </p>
            </div>

            <div className="divide-y divide-slate-200 border border-slate-200 bg-white rounded-2xl px-5 shadow-xs">
              {VAS_SERVICES.map((service) => {
                const checked = selectedTasks.includes(service.id);
                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => toggleTask(service.id)}
                    aria-pressed={checked}
                    className="w-full py-4 text-left flex items-start gap-3.5 cursor-pointer group"
                  >
                    <span className="mt-0.5 shrink-0">
                      {checked ? (
                        <CheckSquare className="w-5 h-5 text-[#B45309]" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-400 group-hover:text-[#042544]" />
                      )}
                    </span>
                    <div>
                      <h3 className="font-display font-bold text-[#042544] text-base">
                        {lang === 'en' ? service.titleEn : service.titleEs}
                      </h3>
                      <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                        {lang === 'en' ? service.descEn : service.descEs}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-xs text-slate-600 font-medium tabular-nums">
                <strong className="text-[#B45309]">{selectedTasks.length}</strong>{' '}
                {lang === 'en'
                  ? 'value-added tasks selected for pilot quote'
                  : 'tareas asistidas seleccionadas para cotización'}
              </p>
              <button
                type="button"
                onClick={handleRequestPilot}
                className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-white bg-[#042544] hover:bg-[#0B3C6A] rounded-xl transition-colors cursor-pointer whitespace-nowrap shadow-sm"
              >
                <span>
                  {lang === 'en'
                    ? 'Quote Assisted Last-Mile Service'
                    : 'Cotizar Última Milla Asistida'}
                </span>
                <ArrowRight className="w-4 h-4 text-[#F59E0B] shrink-0" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
