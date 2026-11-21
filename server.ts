import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

const POSTCARGO_SYSTEM_INSTRUCTION = `Eres Camila, la "Asistente PostCargo AI", especialista virtual en logística de reexpediciones rurales, operación B2B, licitaciones SECOP y vinculación de transportistas en Colombia (postcargo.co).
Tu tono es empático, cercano, profesional y comercialmente claro en español colombiano neutro. Responde en máximo 3 a 4 frases concretas y útiles, sin rodeos ni tecnicismos innecesarios.

Información clave operativa de PostCargo:
1. Reexpediciones y Tiempos de Tránsito:
   - Ciudades principales e intermedias: 24 a 48 horas hábiles.
   - Municipios apartados y zonas de difícil acceso (ej. San José del Guaviare, Quibdó, Mocoa, Florencia, Tumaco, Arauca, Ipiales): 48 a 72 horas hábiles en modalidad terrestre 4x4/Turbo.
   - Zonas fluviales o aéreas especiales (Puerto Carreño, Mitú, Leticia, Inírida): 3 a 5 días hábiles con transbordo programado.
2. Registro de Transportistas Aliados (Camionetas 4x4, Camperos, Estacas, Turbo):
   - Pueden postularse directamente en la sección "Red de Transportistas" de esta página ingresando nombre, cédula/RUT, WhatsApp, tipo de vehículo, placa y departamento base.
   - Ofrecemos rutas fijas rurales, pagos quincenales garantizados y carga de retorno.
3. Trazabilidad en Tiempo Real y Facturas de Ejemplo:
   - Los clientes B2B y entidades SECOP pueden consultar en tiempo real sus guías, facturas, pedidos o remisiones directamente desde el buscador principal del Hero, o iniciar sesión en la plataforma privada externa desde el botón "Acceso SISCORE" (perfiles: Principal, Operadores y Clientes).
   - Datos actuales de ejemplo para consulta inmediata:
     * Factura #1024 (Remisión REM-4091): Origen Bogotá D.C. -> Destino San José del Guaviare. Estado: En Reexpedición Rural. Transportista: Carlos Méndez (Camioneta 4x4 Estacas, Placa WKL-418). Último reporte: Transbordo verificado en Villavicencio, en ruta hacia Granada.
     * Factura FAC-8841: Bogotá -> Quibdó (Chocó), Estado: Alerta Vial (paso restringido en vía Quibdó-Pereira, desvío activo).
     * Factura FAC-8859: Medellín -> Apartadó (Urabá), Estado: Entregado con cumplido digitalizado.
     * Remisión REM-3092: Cali -> Tumaco (Nariño), Estado: En Tránsito troncal.
4. Cotizaciones B2B y SECOP:
   - Pueden usar la "Calculadora de Costos Interactiva" en la página para estimar fletes por origen, destino, tipo de vehículo, peso y póliza SECOP, y solicitar tarifa formal.

Guía siempre al usuario hacia la acción dentro de la plataforma (Calculadora, Registro de Transportista, o Acceso SISCORE) según su necesidad.`;

function inferSuggestedAction(
  userMessage: string,
  replyText: string
): 'calculator' | 'siscore' | 'carrier' | 'b2b' | null {
  const combined = `${userMessage} ${replyText}`.toLowerCase();
  if (
    combined.includes('1024') ||
    combined.includes('rastreo') ||
    combined.includes('siscore') ||
    combined.includes('factura') ||
    combined.includes('remisión') ||
    combined.includes('remision') ||
    combined.includes('guía')
  ) {
    return 'siscore';
  }
  if (
    combined.includes('registr') ||
    combined.includes('camioneta') ||
    combined.includes('campero') ||
    combined.includes('4x4') ||
    combined.includes('turbo') ||
    combined.includes('transportista') ||
    combined.includes('vehículo') ||
    combined.includes('vehiculo')
  ) {
    return 'carrier';
  }
  if (
    combined.includes('cuánto') ||
    combined.includes('cuanto') ||
    combined.includes('tarifa') ||
    combined.includes('cotiz') ||
    combined.includes('tarda') ||
    combined.includes('precio') ||
    combined.includes('envío') ||
    combined.includes('envio')
  ) {
    return 'calculator';
  }
  if (combined.includes('secop') || combined.includes('b2b') || combined.includes('licitación')) {
    return 'b2b';
  }
  return null;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'postcargo-api' });
  });

  app.post('/api/assistant', async (req, res) => {
    const { message, history } = req.body as {
      message?: string;
      history?: Array<{ role: 'user' | 'assistant'; content: string }>;
    };

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Por favor escribe o dicta una consulta válida.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        error:
          'El servicio de PostCargo AI no tiene configurada la clave GEMINI_API_KEY en el servidor.',
      });
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const conversationHistory = Array.isArray(history)
        ? history
            .slice(-6)
            .filter(
              (item) =>
                item &&
                (item.role === 'user' || item.role === 'assistant') &&
                typeof item.content === 'string'
            )
            .map((item) => ({
              role: item.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: item.content }],
            }))
        : [];

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: [
          ...conversationHistory,
          { role: 'user', parts: [{ text: message.trim() }] },
        ],
        config: {
          systemInstruction: POSTCARGO_SYSTEM_INSTRUCTION,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      const reply = response.text?.trim();
      if (!reply) {
        return res.status(502).json({
          error: 'No se recibió respuesta de texto del asistente. Intenta nuevamente.',
        });
      }

      return res.json({
        reply,
        suggestedAction: inferSuggestedAction(message, reply),
      });
    } catch (err: unknown) {
      const errMessage = err instanceof Error ? err.message : 'Error desconocido con Gemini API';
      console.error('[PostCargo AI Error]:', errMessage);
      return res.status(500).json({
        error: 'Ocurrió un error al consultar a PostCargo AI. Por favor intenta de nuevo.',
        details: errMessage,
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PostCargo server running at http://localhost:${PORT}`);
  });
}

startServer();
