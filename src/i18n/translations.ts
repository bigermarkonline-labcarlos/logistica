import type { Language, SiscoreStatus } from '../utils/logistics';

export interface Translations {
  htmlTitle: string;
  nav: {
    solutions: string;
    calculator: string;
    compare: string;
    lastMile: string;
    carriers: string;
    tracking: string;
    siscoreAccess: string;
    openMenu: string;
    closeMenu: string;
    homeAria: string;
  };
  hero: {
    h1Start: string;
    h1Highlight: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
    videoBadge: string;
    videoTitle: string;
    videoIframeTitle: string;
    videoCaption: string;
    coveragePrompt: string;
    coverageCta: string;
    pillars: Array<{
      title: string;
      detail: string;
    }>;
    metrics: Array<{
      value: string;
      label: string;
    }>;
    meetingForm: {
      title: string;
      subtitle: string;
      nameLabel: string;
      namePlaceholder: string;
      companyLabel: string;
      companyPlaceholder: string;
      emailLabel: string;
      emailPlaceholder: string;
      phoneLabel: string;
      phonePlaceholder: string;
      shipmentsLabel: string;
      selectPlaceholder: string;
      shipmentsOptions: string[];
      operationLabel: string;
      operationOptions: string[];
      destinationsLabel: string;
      destinationsPlaceholder: string;
      policyPrefix: string;
      policyLink: string;
      policySuffix: string;
      submitButton: string;
      whatsappPrefix: string;
      whatsappLink: string;
      confirmedTitle: string;
      confirmedFolioLabel: string;
      confirmedBody: string;
      resetButton: string;
    };
    tracking: {
      title: string;
      inputPlaceholder: string;
      inputAria: string;
      submitButton: string;
      systemHint: string;
      emptyError: string;
      quickLabel: string;
      notFoundTitle: string;
      notFoundDesc: string;
      tryAnotherButton: string;
      invoiceLabel: string;
      waybillLabel: string;
      vehicleLabel: string;
      progressLabel: string;
      latestReportLabel: string;
      routeTraceLabel: string;
    };
  };
  calculator: {
    sectionTitle: string;
    sectionSubtitle: string;
    originLabel: string;
    routesSuffix: string;
    destinationLabel: string;
    destinationSearchPlaceholder: string;
    onlyOriginRoutesLabel: string;
    destinationsMatchedLabel: string;
    noDestinationsMatched: string;
    presetsLabel: string;
    vehicleLabel: string;
    weightLabel: string;
    declaredValueLabel: string;
    declaredValueHint: string;
    secopCheckboxTitle: string;
    secopCheckboxDesc: string;
    resultMatrixEyebrow: string;
    specialQuoteEyebrow: string;
    specialQuoteTitle: string;
    specialQuoteButton: string;
    availableHubsPrompt: string;
    switchHubPrefix: string;
    totalMatrixLabel: string;
    totalWithSecopLabel: string;
    transitLabel: string;
    tierLabel: string;
    regionLabel: string;
    lineBaseFreight: string;
    lineExcessWeight: string;
    lineHandling: string;
    lineMinLiquidation: string;
    lineSecopFee: string;
    upgradeWarningPrefix: string;
    upgradeWarningMid: string;
    multimodalNote: string;
    requestFormalQuote: string;
  };
  b2b: {
    title: string;
    subtitle: string;
    items: Array<{
      title: string;
      desc: string;
    }>;
    cta: string;
    proofNote: string;
    imgAlt: string;
    imgFallback: string;
  };
  carriers: {
    title: string;
    subtitle: string;
    imgAlt: string;
    formTitle: string;
    formSubtitle: string;
    fullNameLabel: string;
    fullNamePlaceholder: string;
    documentLabel: string;
    documentPlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    vehicleLabel: string;
    plateLabel: string;
    platePlaceholder: string;
    regionLabel: string;
    regionPlaceholder: string;
    submitButton: string;
    confirmedTitle: string;
    confirmedPrefix: string;
    confirmedMid1: string;
    confirmedMid2: string;
    confirmedSuffix: string;
    registerAnother: string;
  };
  footer: {
    description: string;
    modulesTitle: string;
    networkTitle: string;
    networkCities: string;
    rights: string;
    secopBadge: string;
  };
  leadModal: {
    specialQuoteTag: string;
    matrixRateTag: string;
    title: string;
    specialTitle: string;
    closeAria: string;
    confirmedPrefix: string;
    confirmedBodySpecial: string;
    confirmedBodyMatrix: string;
    backButton: string;
    companyLabel: string;
    companyPlaceholder: string;
    phoneLabel: string;
    emailLabel: string;
    notesLabel: string;
    notesPlaceholder: string;
    submitButton: string;
    submitSpecialButton: string;
  };
  siscoreModal: {
    modalAria: string;
    closeAria: string;
    title: string;
    subtitle: string;
    roleLabel: string;
    roles: {
      principal: string;
      operadores: string;
      clientes: string;
    };
    usernameLabel: string;
    usernamePlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    submitButton: string;
    confirmedTitle: string;
    confirmedBodyPrefix: string;
    confirmedBodyMid: string;
    confirmedBodySuffix: string;
    resetButton: string;
  };
  assistant: {
    ariaLabel: string;
    title: string;
    subtitle: string;
    welcomeMessage: string;
    starterPrompts: string[];
    muteAria: string;
    unmuteAria: string;
    closeAria: string;
    listeningText: string;
    stopListening: string;
    micStopAria: string;
    micStartAria: string;
    inputPlaceholder: string;
    sendAria: string;
    launcherOpen: string;
    launcherClose: string;
    actionSiscore: string;
    actionCarrier: string;
    actionCalculator: string;
  };
  statusLabels: Record<SiscoreStatus, string>;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  es: {
    htmlTitle: 'PostCargo — Reexpediciones & Logística en Colombia',
    nav: {
      solutions: 'Soluciones B2B',
      calculator: 'Calculadora',
      compare: 'Comparador',
      lastMile: 'Última Milla',
      carriers: 'Transportistas',
      tracking: 'Rastreo',
      siscoreAccess: 'Acceso SISCORE',
      openMenu: 'Abrir menú',
      closeMenu: 'Cerrar menú',
      homeAria: 'PostCargo Inicio',
    },
    hero: {
      h1Start: 'Porque el mercado no termina',
      h1Highlight: 'donde la vía pavimentada termina',
      subtitle:
        'Entrega de paquetería y carga en poblaciones pequeñas, apartadas o de difícil acceso. En este video le mostramos cómo llevamos los envíos de su empresa a los trayectos especiales de Colombia.',
      primaryCta: 'Cotizar en Matriz 2026',
      secondaryCta: 'Conozca PostCargo',
      videoBadge: 'Presentación Comercial 2026',
      videoTitle: 'Conozca PostCargo 2026',
      videoIframeTitle: 'Presentación comercial PostCargo: Reexpediciones y logística en Colombia',
      videoCaption:
        '13 años conectando centros de distribución con más de 1.100 municipios y zonas de difícil acceso mediante flota adaptada y trazabilidad en tiempo real.',
      coveragePrompt: '¿Quiere ver si llegamos a sus destinos?',
      coverageCta: 'Consulte nuestra cobertura',
      pillars: [
        {
          title: 'A menor costo · 13 años de operación',
          detail: 'Tarifas reales de matriz frente a los sobrecostos de la paquetería convencional.',
        },
        {
          title: 'Entregas ágiles con rutas fijas',
          detail: 'Despachos continuos desde 16 bases regionales sin esperar cupos mínimos.',
        },
        {
          title: 'Adaptados a su operación B2B y SECOP',
          detail: 'Validación de contenido, logística de reversa, retorno de documentos y fotos.',
        },
        {
          title: 'Rastreo con su propia factura',
          detail: 'Visibilidad inmediata en línea usando su factura o remisión, sin códigos extra.',
        },
      ],
      metrics: [
        { value: '+de 1.100', label: 'municipios tiene Colombia' },
        { value: '+de 650', label: 'son trayecto especial para la logística tradicional' },
        { value: '13', label: 'años de servicio llegando a ellos' },
      ],
      meetingForm: {
        title: 'Agendemos 15 minutos para que hablemos de sus destinos más críticos',
        subtitle:
          'Déjenos sus datos y un asesor comercial lo contacta para acordar la reunión.',
        nameLabel: 'Nombre *',
        namePlaceholder: 'Ej. Andrés Felipe Ruiz',
        companyLabel: 'Empresa *',
        companyPlaceholder: 'Ej. Comercializadora Andina',
        emailLabel: 'Correo corporativo *',
        emailPlaceholder: 'nombre@empresa.co',
        phoneLabel: 'Teléfono',
        phonePlaceholder: '312 555 8901',
        shipmentsLabel: 'Envíos al mes *',
        selectPlaceholder: 'Seleccione...',
        shipmentsOptions: [
          'Menos de 50 envíos/mes',
          '50 a 250 envíos/mes',
          '250 a 1.000 envíos/mes',
          'Más de 1.000 envíos/mes',
        ],
        operationLabel: 'Tipo de operación *',
        operationOptions: [
          'Distribución B2B y mayorista',
          'E-commerce / Última milla',
          'Licitación / Contrato SECOP',
          'Reexpedición rural y multimodal',
        ],
        destinationsLabel: '¿Cuáles son sus destinos más críticos?',
        destinationsPlaceholder: 'Municipios o regiones donde hoy le cuesta más entregar',
        policyPrefix:
          'Autorizo el tratamiento de mis datos personales para ser contactado con fines comerciales, conforme a la ',
        policyLink: 'Política de Protección de Datos',
        policySuffix: ' de PostCargo.',
        submitButton: 'Agendar reunión',
        whatsappPrefix: '¿Prefiere hablar ya?',
        whatsappLink: 'Escríbanos por WhatsApp',
        confirmedTitle: 'Reunión solicitada con éxito',
        confirmedFolioLabel: 'Radicado de agenda',
        confirmedBody:
          'Un asesor comercial especializado en trayectos especiales y Matriz 2026 se comunicará muy pronto al correo',
        resetButton: 'Agendar otra consulta',
      },
      tracking: {
        title: 'Rastrea tu envío en tiempo real',
        inputPlaceholder: 'Ej: FAC-1024, #1024, REM-4091 o remesa...',
        inputAria: 'Número de guía, remesa, factura o documento interno',
        submitButton: 'Rastrear envío',
        systemHint:
          'Puede consultar con el número de su factura, pedido o remisión: el mismo que ya usa en su sistema.',
        emptyError:
          'Ingresa un número de guía, remesa, factura o documento interno para consultar.',
        quickLabel: 'Ejemplos:',
        notFoundTitle: 'Sin coincidencias activas en trazabilidad',
        notFoundDesc:
          'No encontramos un despacho con la referencia ingresada. Verifica el número o prueba con uno de los ejemplos:',
        tryAnotherButton: 'Consultar otra guía',
        invoiceLabel: 'Factura / Pedido',
        waybillLabel: 'Guía / Remesa',
        vehicleLabel: 'Vehículo en ruta',
        progressLabel: 'Avance de ruta',
        latestReportLabel: 'Último reporte operativo',
        routeTraceLabel: 'Recorrido por ciudad, bodega, centro de acopio y vehículo',
      },
    },
    calculator: {
      sectionTitle: 'Calcula fletes reales con la Matriz de Tarifas 2026',
      sectionSubtitle:
        'Consulta tarifas oficiales por caja hasta 25 kg, kilo adicional y tasa de manejo sobre los 1.255 trayectos regionales de PostCargo en Colombia.',
      originLabel: 'Origen (Base regional de despacho)',
      routesSuffix: 'rutas',
      destinationLabel: 'Destino de entrega (Ciudad y Departamento)',
      destinationSearchPlaceholder: 'Buscar municipio o departamento (ej. Quibdó, Guaviare, Leticia)...',
      onlyOriginRoutesLabel: 'Mostrar solo destinos operados directamente desde este origen',
      destinationsMatchedLabel: 'destinos disponibles',
      noDestinationsMatched: 'No hay municipios que coincidan con la búsqueda.',
      presetsLabel: 'Trayectos de ejemplo:',
      vehicleLabel: 'Unidad operativa sugerida por volumen',
      weightLabel: 'Peso total del envío (kg)',
      declaredValueLabel: 'Valor declarado de la mercancía (COP)',
      declaredValueHint: 'Base para calcular tasa de manejo (0,8% o 1,0%, mínimo $4.000 por caja)',
      secopCheckboxTitle: 'Incluir Póliza SECOP y retorno de documentos firmados',
      secopCheckboxDesc: 'Validación de contenido, acta firmada y evidencia fotográfica georreferenciada.',
      resultMatrixEyebrow: 'Tarifa oficial Matriz 2026',
      specialQuoteEyebrow: 'Trayecto fuera de matriz estándar',
      specialQuoteTitle: 'Requiere cotización especial',
      specialQuoteButton: 'Solicitar Cotización Especial',
      availableHubsPrompt: 'Este destino sí opera en matriz 2026 desde la siguiente base regional:',
      switchHubPrefix: 'Cambiar origen a',
      totalMatrixLabel: 'Liquidación Matriz 2026',
      totalWithSecopLabel: 'Total estimado con respaldo SECOP',
      transitLabel: 'Tránsito estimado',
      tierLabel: 'Clasificación',
      regionLabel: 'Región',
      lineBaseFreight: 'Flete base caja (hasta 25 kg)',
      lineExcessWeight: 'Kilos adicionales',
      lineHandling: 'Costo de manejo',
      lineMinLiquidation: 'Liquidación mínima de matriz',
      lineSecopFee: 'Póliza y retorno documental SECOP',
      upgradeWarningPrefix: 'Por el peso ingresado',
      upgradeWarningMid: 'recomendamos operar en unidad',
      multimodalNote: 'Corredor Multimodal (Tipo K): integra enlace aéreo o fluvial controlado.',
      requestFormalQuote: 'Solicitar Tarifa Formal',
    },
    b2b: {
      title: 'Trazabilidad documental donde otros operadores no llegan',
      subtitle:
        'Consolidamos inventarios desde tus centros de distribución y garantizamos entregas auditables en cabeceras municipales, resguardos y corregimientos.',
      items: [
        {
          title: 'Cross-Docking y Reexpedición Multimodal',
          desc: 'Transbordo seguro entre vehículos troncales (NPR/Turbo) y flota rural 4x4, fluvial o aérea según condiciones geográficas.',
        },
        {
          title: 'Cumplimiento Licitatorio Colombia Compra Eficiente',
          desc: 'Actas de recibo a satisfacción, registro fotográfico georreferenciado y reportes consolidados por contrato SECOP II.',
        },
        {
          title: 'Visibilidad por Factura Interna en Línea',
          desc: 'Rastreo inmediato con el número de factura o remisión propio de tu ERP, sin depender de códigos externos complejos.',
        },
      ],
      cta: 'Rastrear envío en vivo',
      proofNote: '+340 contratos B2B y públicos ejecutados',
      imgAlt: 'Centro de distribución cross-docking PostCargo para operación B2B y SECOP',
      imgFallback: 'Cross-Docking B2B y SECOP',
    },
    carriers: {
      title: 'Vincula tu 4x4, Estacas, Turbo o NPR y genera ingresos constantes',
      subtitle:
        'Trabaja directamente con PostCargo sin comisiones abusivas. Te asignamos rutas fijas en tu región con liquidación puntual.',
      imgAlt: 'Camioneta 4x4 aliada de PostCargo cubriendo ruta rural colombiana',
      formTitle: 'Formulario de Vinculación de Flota',
      formSubtitle: 'Para propietarios y conductores con SOAT y revisión tecnomecánica vigentes.',
      fullNameLabel: 'Nombre completo',
      fullNamePlaceholder: 'Ej. Carlos Alberto Méndez',
      documentLabel: 'Cédula o NIT',
      documentPlaceholder: 'Ej. 1018452390',
      phoneLabel: 'Celular / WhatsApp',
      phonePlaceholder: '312 555 8901',
      vehicleLabel: 'Tipo de vehículo',
      plateLabel: 'Placa',
      platePlaceholder: 'Ej. WKL-418',
      regionLabel: 'Zona o departamento base',
      regionPlaceholder: 'Ej. Chocó / Meta / Urabá',
      submitButton: 'Postular Vehículo a PostCargo',
      confirmedTitle: 'Vehículo postulado exitosamente',
      confirmedPrefix: 'Radicado',
      confirmedMid1: 'Validaremos los documentos de la placa',
      confirmedMid2: 'y te contactaremos al WhatsApp',
      confirmedSuffix: 'en menos de 24 horas hábiles.',
      registerAnother: 'Registrar otro vehículo',
    },
    footer: {
      description:
        'Plataforma colombiana de reexpediciones rurales, distribución B2B, licitaciones SECOP y trazabilidad en tiempo real en 1.255 trayectos nacionales.',
      modulesTitle: 'Módulos',
      networkTitle: 'Red Nacional',
      networkCities: 'Bogotá D.C. · Medellín · Cali · Barranquilla · Bucaramanga · Pereira',
      rights: 'PostCargo Reexpediciones & Logística S.A.S.',
      secopBadge: 'Operación Nacional Colombia Compra Eficiente',
    },
    leadModal: {
      specialQuoteTag: 'Cotización Especial',
      matrixRateTag: 'Tarifa Matriz 2026',
      title: 'Solicitar Tarifa Formal / Agendar Despacho',
      specialTitle: 'Solicitar Cotización Especial de Trayecto',
      closeAria: 'Cerrar modal de cotización',
      confirmedPrefix: 'Solicitud confirmada · Folio',
      confirmedBodySpecial:
        'Registramos tu solicitud especial para este trayecto. Un especialista comercial enviará la tarifa a',
      confirmedBodyMatrix:
        'Hemos bloqueado esta tarifa de referencia para',
      backButton: 'Volver a la plataforma',
      companyLabel: 'Empresa o nombre de contacto',
      companyPlaceholder: 'Ej. Distribuidora Andina S.A.S.',
      phoneLabel: 'Teléfono / WhatsApp',
      emailLabel: 'Correo corporativo',
      notesLabel: 'Detalles de carga o número de proceso SECOP (opcional)',
      notesPlaceholder: 'Mercancía paletizada, fecha de recogida deseada...',
      submitButton: 'Confirmar Solicitud de Despacho',
      submitSpecialButton: 'Enviar Solicitud de Cotización Especial',
    },
    siscoreModal: {
      modalAria: 'Acceso privado a SISCORE',
      closeAria: 'Cerrar acceso SISCORE',
      title: 'Acceso Privado a SISCORE',
      subtitle:
        'SISCORE es un software privado externo. Selecciona tu perfil e ingresa tus credenciales asignadas.',
      roleLabel: 'Perfil de acceso',
      roles: {
        principal: 'Principal',
        operadores: 'Operadores',
        clientes: 'Clientes',
      },
      usernameLabel: 'Usuario',
      usernamePlaceholder: 'Tu usuario asignado',
      passwordLabel: 'Contraseña',
      passwordPlaceholder: 'Ingresa tu contraseña',
      submitButton: 'Ingresar a SISCORE',
      confirmedTitle: 'Credenciales validadas para ingreso externo',
      confirmedBodyPrefix: 'Solicitud preparada para el perfil',
      confirmedBodyMid: 'con el usuario',
      confirmedBodySuffix:
        'La sesión operativa se completa en el entorno privado externo de SISCORE según permisos de cuenta.',
      resetButton: 'Cambiar perfil o usuario',
    },
    assistant: {
      ariaLabel: 'Asistente IA PostCargo',
      title: 'Asistente PostCargo AI',
      subtitle: 'Camila · Matriz 2026, Flota 4x4 y Rastreo',
      welcomeMessage:
        'Hola, soy Camila, asesora PostCargo AI. Puedo orientarte sobre tarifas de la matriz de 1.255 trayectos, registro de vehículos 4x4/Turbo/NPR o rastreo de tu factura #1024 en línea.',
      starterPrompts: [
        '¿Cuánto tarda un envío a Chocó?',
        '¿Cómo me registro con mi camioneta 4x4?',
        '¿Cómo rastreo mi factura #1024?',
      ],
      muteAria: 'Silenciar voz',
      unmuteAria: 'Activar lectura por voz',
      closeAria: 'Cerrar Asistente PostCargo AI',
      listeningText: 'Escuchando audio... toca una frase o habla',
      stopListening: 'Detener',
      micStopAria: 'Detener micrófono',
      micStartAria: 'Simular consulta por voz',
      inputPlaceholder: 'Pregunta sobre Chocó, 4x4 o #1024...',
      sendAria: 'Enviar mensaje',
      launcherOpen: 'PostCargo AI',
      launcherClose: 'Cerrar AI',
      actionSiscore: 'Rastrear factura #1024 ahora',
      actionCarrier: 'Ir a Registro de Vehículo',
      actionCalculator: 'Ir a Calculadora Logística',
    },
    statusLabels: {
      'En Tránsito': 'En Tránsito',
      'En Reexpedición': 'En Reexpedición',
      'Alerta Vial': 'Alerta Vial',
      Entregado: 'Entregado',
    },
  },
  en: {
    htmlTitle: 'PostCargo — Rural Reexpedition & Logistics in Colombia',
    nav: {
      solutions: 'B2B Solutions',
      calculator: 'Calculator',
      compare: 'Comparator',
      lastMile: 'Last-Mile VAS',
      carriers: 'Carriers',
      tracking: 'Tracking',
      siscoreAccess: 'SISCORE Login',
      openMenu: 'Open navigation menu',
      closeMenu: 'Close navigation menu',
      homeAria: 'PostCargo Home',
    },
    hero: {
      h1Start: 'Because your market does not end',
      h1Highlight: 'where the paved road ends',
      subtitle:
        'Parcel and freight delivery across small, remote, and hard-to-reach municipalities. Watch how we connect your business shipments to Colombia’s special corridors.',
      primaryCta: 'Calculate 2026 Matrix Rate',
      secondaryCta: 'Discover PostCargo',
      videoBadge: '2026 Commercial Presentation',
      videoTitle: 'Discover PostCargo 2026',
      videoIframeTitle: 'PostCargo commercial overview: Rural reexpedition and logistics in Colombia',
      videoCaption:
        '13 years connecting distribution centers with 1,100+ municipalities and hard-to-reach regions through adapted fleets and real-time invoice-level tracking.',
      coveragePrompt: 'Want to check if we cover your destinations?',
      coverageCta: 'Explore our coverage',
      pillars: [
        {
          title: 'Lower cost · 13 years operating',
          detail: 'Transparent regional matrix rates compared to traditional parcel surcharges.',
        },
        {
          title: 'Faster transit on fixed routes',
          detail: 'Scheduled dispatches from 16 regional hubs without waiting for minimum volume.',
        },
        {
          title: 'Built for B2B & SECOP compliance',
          detail: 'Content verification, reverse logistics, signed document return and photo PODs.',
        },
        {
          title: 'Track using your own invoice',
          detail: 'Instant online visibility via your ERP invoice or remission number.',
        },
      ],
      metrics: [
        { value: '1,100+', label: 'municipalities across Colombia' },
        { value: '650+', label: 'require special rural reexpedition' },
        { value: '13 yrs', label: 'delivering reliably to all of them' },
      ],
      meetingForm: {
        title: 'Let’s book 15 minutes to review your hardest-to-reach routes',
        subtitle:
          'Leave your details and a commercial specialist will follow up to confirm your meeting.',
        nameLabel: 'Full name *',
        namePlaceholder: 'e.g., Andrés Felipe Ruiz',
        companyLabel: 'Company *',
        companyPlaceholder: 'e.g., Comercializadora Andina',
        emailLabel: 'Corporate email *',
        emailPlaceholder: 'name@company.co',
        phoneLabel: 'Phone',
        phonePlaceholder: '312 555 8901',
        shipmentsLabel: 'Monthly volume *',
        selectPlaceholder: 'Select...',
        shipmentsOptions: [
          'Under 50 shipments/month',
          '50 to 250 shipments/month',
          '250 to 1,000 shipments/month',
          '1,000+ shipments/month',
        ],
        operationLabel: 'Operation type *',
        operationOptions: [
          'B2B & wholesale distribution',
          'E-commerce / Assisted last mile',
          'Public tender / SECOP contract',
          'Rural & multimodal reexpedition',
        ],
        destinationsLabel: 'Which destinations are your biggest bottleneck?',
        destinationsPlaceholder: 'Municipalities or regions where delivery is most costly today',
        policyPrefix:
          'I authorize the processing of my personal data for commercial follow-up in accordance with PostCargo’s ',
        policyLink: 'Data Protection Policy',
        policySuffix: '.',
        submitButton: 'Schedule meeting',
        whatsappPrefix: 'Prefer to chat now?',
        whatsappLink: 'Message us on WhatsApp',
        confirmedTitle: 'Meeting request received',
        confirmedFolioLabel: 'Booking reference',
        confirmedBody:
          'A commercial advisor specializing in special corridors and our 2026 Tariff Matrix will reach out shortly to',
        resetButton: 'Submit another inquiry',
      },
      tracking: {
        title: 'Track your shipment in real time',
        inputPlaceholder: 'e.g., FAC-1024, #1024, REM-4091 or waybill...',
        inputAria: 'Waybill, remission, invoice, or internal document number',
        submitButton: 'Track shipment',
        systemHint:
          'You can track using your invoice, order, or remission number: the same reference already used in your system.',
        emptyError:
          'Enter a waybill, remission, invoice, or internal document number to track.',
        quickLabel: 'Samples:',
        notFoundTitle: 'No active traceability records matched',
        notFoundDesc:
          'We could not find a dispatch for that reference. Check the number or try one of these samples:',
        tryAnotherButton: 'Track another shipment',
        invoiceLabel: 'Invoice / Order',
        waybillLabel: 'Waybill / Remission',
        vehicleLabel: 'Active vehicle',
        progressLabel: 'Route progress',
        latestReportLabel: 'Latest operational report',
        routeTraceLabel: 'City, town, warehouse, distribution hub & vehicle trace',
      },
    },
    calculator: {
      sectionTitle: 'Calculate real rates from the 2026 Tariff Matrix',
      sectionSubtitle:
        'Check official box rates up to 25 kg, additional kg pricing, and handling fees across all 1,255 PostCargo regional corridors in Colombia.',
      originLabel: 'Origin (Regional dispatch hub)',
      routesSuffix: 'routes',
      destinationLabel: 'Destination (Municipality & Department)',
      destinationSearchPlaceholder: 'Search city or department (e.g., Quibdó, Guaviare, Leticia)...',
      onlyOriginRoutesLabel: 'Only show destinations operated directly from this hub',
      destinationsMatchedLabel: 'matching destinations',
      noDestinationsMatched: 'No municipalities match your search.',
      presetsLabel: 'Sample corridors:',
      vehicleLabel: 'Suggested fleet unit by load weight',
      weightLabel: 'Total shipment weight (kg)',
      declaredValueLabel: 'Declared merchandise value (COP)',
      declaredValueHint: 'Used to compute handling fee (0.8% or 1.0%, $4,000 COP minimum per box)',
      secopCheckboxTitle: 'Include SECOP performance policy & signed document return',
      secopCheckboxDesc: 'Includes content inspection, signed receipt certificate and geotagged photo POD.',
      resultMatrixEyebrow: 'Official 2026 Matrix Quote',
      specialQuoteEyebrow: 'Corridor outside standard matrix',
      specialQuoteTitle: 'Special quote required',
      specialQuoteButton: 'Request Special Quote',
      availableHubsPrompt: 'This destination is covered in the 2026 matrix from this regional hub:',
      switchHubPrefix: 'Switch origin to',
      totalMatrixLabel: '2026 Matrix Total',
      totalWithSecopLabel: 'Estimated total with SECOP & POD return',
      transitLabel: 'Estimated transit',
      tierLabel: 'Route tier',
      regionLabel: 'Region',
      lineBaseFreight: 'Base box freight (up to 25 kg)',
      lineExcessWeight: 'Additional weight',
      lineHandling: 'Handling fee',
      lineMinLiquidation: 'Matrix minimum liquidation',
      lineSecopFee: 'SECOP policy & document return',
      upgradeWarningPrefix: 'Based on entered weight',
      upgradeWarningMid: 'we recommend operating with',
      multimodalNote: 'Multimodal Corridor (Tier K): integrates scheduled air or river transport.',
      requestFormalQuote: 'Request Formal Rate',
    },
    b2b: {
      title: 'Documented traceability where standard carriers do not reach',
      subtitle:
        'We consolidate inventory from your distribution hubs and guarantee auditable deliveries across municipal seats, rural townships and remote communities.',
      items: [
        {
          title: 'Cross-Docking & Multimodal Reexpedition',
          desc: 'Secure cargo transfer between trunk trucks (NPR/Turbo) and rural 4x4, river or air units tailored to terrain conditions.',
        },
        {
          title: 'Colombia Compra Eficiente (SECOP) Compliance',
          desc: 'Signed delivery certificates, geotagged photographic proof and consolidated reporting per SECOP II contract.',
        },
        {
          title: 'Real-Time Internal Invoice Visibility',
          desc: 'Immediate shipment lookup using your own ERP invoice or remission number without extra third-party waybill codes.',
        },
      ],
      cta: 'Track live shipment',
      proofNote: '340+ B2B and public contracts fulfilled',
      imgAlt: 'PostCargo B2B and SECOP cross-docking distribution hub',
      imgFallback: 'B2B & SECOP Cross-Docking',
    },
    carriers: {
      title: 'Register your 4x4, Stakebed, Turbo or NPR for steady regional income',
      subtitle:
        'Partner directly with PostCargo without unfair broker commissions. Receive fixed regional corridors and on-time biweekly settlements.',
      imgAlt: 'PostCargo partner 4x4 utility vehicle operating on a rural Colombian route',
      formTitle: 'Fleet Onboarding Application',
      formSubtitle: 'For owners and drivers with active SOAT insurance and mechanical inspection.',
      fullNameLabel: 'Full name',
      fullNamePlaceholder: 'e.g., Carlos Alberto Méndez',
      documentLabel: 'National ID or Tax ID (NIT)',
      documentPlaceholder: 'e.g., 1018452390',
      phoneLabel: 'Mobile / WhatsApp',
      phonePlaceholder: '312 555 8901',
      vehicleLabel: 'Vehicle type',
      plateLabel: 'License plate',
      platePlaceholder: 'e.g., WKL-418',
      regionLabel: 'Home department or operating zone',
      regionPlaceholder: 'e.g., Chocó / Meta / Urabá',
      submitButton: 'Submit Vehicle Application',
      confirmedTitle: 'Vehicle application submitted',
      confirmedPrefix: 'Filing ID',
      confirmedMid1: 'We will verify documents for plate',
      confirmedMid2: 'and contact you on WhatsApp',
      confirmedSuffix: 'within 24 business hours.',
      registerAnother: 'Register another vehicle',
    },
    footer: {
      description:
        'Colombian logistics platform specializing in rural reexpedition, B2B distribution, SECOP tenders, and real-time shipment tracking across 1,255 corridors.',
      modulesTitle: 'Modules',
      networkTitle: 'National Network',
      networkCities: 'Bogotá D.C. · Medellín · Cali · Barranquilla · Bucaramanga · Pereira',
      rights: 'PostCargo Reexpediciones & Logística S.A.S.',
      secopBadge: 'National Operations · Colombia Compra Eficiente',
    },
    leadModal: {
      specialQuoteTag: 'Special Quote',
      matrixRateTag: '2026 Matrix Rate',
      title: 'Request Formal Rate / Schedule Pickup',
      specialTitle: 'Request Custom Corridor Quote',
      closeAria: 'Close quote modal',
      confirmedPrefix: 'Request confirmed · Reference',
      confirmedBodySpecial:
        'We registered your special quote request for this corridor. A commercial coordinator will send the custom rate to',
      confirmedBodyMatrix: 'We have locked this reference tariff for',
      backButton: 'Return to platform',
      companyLabel: 'Company or contact name',
      companyPlaceholder: 'e.g., Distribuidora Andina S.A.S.',
      phoneLabel: 'Phone / WhatsApp',
      emailLabel: 'Corporate email',
      notesLabel: 'Cargo specs or SECOP tender number (optional)',
      notesPlaceholder: 'Palletized cargo, preferred pickup date...',
      submitButton: 'Confirm Dispatch Request',
      submitSpecialButton: 'Submit Special Quote Request',
    },
    siscoreModal: {
      modalAria: 'Private SISCORE access',
      closeAria: 'Close SISCORE access',
      title: 'Private SISCORE Access',
      subtitle:
        'SISCORE is an external private software platform. Select your role and enter your assigned credentials.',
      roleLabel: 'Access role',
      roles: {
        principal: 'Principal',
        operadores: 'Operators',
        clientes: 'Clients',
      },
      usernameLabel: 'Username',
      usernamePlaceholder: 'Your assigned username',
      passwordLabel: 'Password',
      passwordPlaceholder: 'Enter your password',
      submitButton: 'Sign in to SISCORE',
      confirmedTitle: 'Credentials validated for external login',
      confirmedBodyPrefix: 'Access request prepared for role',
      confirmedBodyMid: 'with username',
      confirmedBodySuffix:
        'Your operational session continues inside the private external SISCORE platform according to your account permissions.',
      resetButton: 'Change role or username',
    },
    assistant: {
      ariaLabel: 'PostCargo AI Assistant',
      title: 'PostCargo AI Assistant',
      subtitle: 'Camila · 2026 Matrix, 4x4 Fleet & Tracking',
      welcomeMessage:
        'Hi! I am Camila, your PostCargo AI advisor. I can help you check rates across our 1,255-corridor 2026 matrix, register a 4x4/Turbo/NPR truck, or track invoice #1024 in real time.',
      starterPrompts: [
        'How long does shipping to Chocó take?',
        'How do I register my 4x4 truck?',
        'How do I track invoice #1024?',
      ],
      muteAria: 'Mute voice readout',
      unmuteAria: 'Enable voice readout',
      closeAria: 'Close PostCargo AI Assistant',
      listeningText: 'Listening... tap a prompt or speak',
      stopListening: 'Stop',
      micStopAria: 'Stop microphone',
      micStartAria: 'Simulate voice query',
      inputPlaceholder: 'Ask about Chocó, 4x4 or #1024...',
      sendAria: 'Send message',
      launcherOpen: 'PostCargo AI',
      launcherClose: 'Close AI',
      actionSiscore: 'Track invoice #1024 now',
      actionCarrier: 'Go to Fleet Registration',
      actionCalculator: 'Go to Rate Calculator',
    },
    statusLabels: {
      'En Tránsito': 'In Transit',
      'En Reexpedición': 'In Reexpedition',
      'Alerta Vial': 'Road Alert',
      Entregado: 'Delivered',
    },
  },
};
