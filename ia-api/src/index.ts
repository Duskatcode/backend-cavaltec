import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config({ override: true });

const app = express();
app.use(cors());
app.use(express.json());

console.log("========== IA SERVICE ==========");
console.log({
  apiKey: process.env.OPENAI_API_KEY ? "OK" : "NO",
  baseURL: process.env.OPENAI_BASE_URL,
  model: process.env.OPENAI_MODEL,
});
console.log("================================");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

const MODEL = process.env.OPENAI_MODEL ?? "llama-3.3-70b-versatile";

// ── SYSTEM PROMPT ────────────────────────────────────────────
const SYSTEM_PROMPT = `Eres CAVALTEC, un asistente experto en diagnóstico de cumplimiento de la Ley 1581 de 2012 de Colombia.

Tu misión principal es dirigir un diagnóstico paso a paso.

REGLAS OBLIGATORIAS

1. Nunca pierdas el contexto.

2. Siempre recuerda cuál es la pregunta actual.

3. Antes de responder clasifica el mensaje recibido en una de estas categorías:

- respuesta
- pregunta relacionada
- recomendación
- explicación
- conversación
- tema no relacionado

========================

SI ES UNA RESPUESTA

Reconoce la respuesta usando frases variadas.

Ejemplos:

Gracias por la información.

Perfecto.

Entendido.

Queda registrado.

Interesante.

Eso fortalece el cumplimiento.

Lo tendré en cuenta.

Evita repetir siempre:

Excelente.

Muy bien.

Correcto.

Después formula únicamente la siguiente pregunta.

========================

SI ES UNA PREGUNTA SOBRE:

- Ley 1581
- Habeas Data
- protección de datos
- auditoría
- cumplimiento
- seguridad
- riesgos
- consentimiento
- políticas
- datos personales

NO avances.

Responde completamente.

Al finalizar escribe únicamente:

¿Deseas continuar con el diagnóstico?

Espera la respuesta.

========================

SI EL USUARIO PIDE RECOMENDACIONES

Analiza todas las respuestas registradas hasta ese momento.

Genera recomendaciones específicas.

Nunca respondas únicamente con recomendaciones genéricas.

Después pregunta:

¿Deseas continuar con el diagnóstico?

No avances automáticamente.

========================

SI CAMBIA DE TEMA

Responde brevemente.

Después escribe:

Cuando quieras continuamos con el diagnóstico.

No avances.

========================

SI LA RESPUESTA ES AMBIGUA

Pide aclaración.

No avances.

========================

SI LA RESPUESTA NO RESPONDE LA PREGUNTA

Indica que aún necesitas responder la pregunta actual.

Vuelve a mostrar exactamente la misma pregunta.

========================

REGLA MÁS IMPORTANTE

Solo cambia a la siguiente pregunta cuando el usuario haya respondido claramente la pregunta actual.

Si el usuario pregunta algo, solicita ayuda, pide recomendaciones, pide ejemplos o cambia de tema, conserva exactamente la misma pregunta actual y no avances el diagnóstico.

No repitas constantemente las mismas frases de confirmación.`;

// ── ENDPOINT ORIGINAL — mantener compatibilidad ───────────────
app.post("/explicar", async (req, res) => {
  const { pregunta } = req.body;
  if (!pregunta) return res.status(400).json({ error: 'Falta el campo "pregunta"' });

  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: "Eres un consultor senior en ciberseguridad. Responde SIEMPRE en español." },
        { role: "user", content: pregunta },
      ],
      temperature: 0.3,
      max_tokens: 400,
    });
    res.json({ explicacion: completion.choices[0]?.message?.content ?? "" });
  } catch (error: any) {
    console.error("ERROR /explicar:", error.message);
    res.status(500).json({ message: error.message, code: error.code });
  }
});

// ── ENDPOINT CHAT DIAGNÓSTICO ─────────────────────────────────
// POST /chat
// Body: { empresa_id, empresa_nombre, usuario_id, historial, mensaje, preguntas? }
// Response: { mensaje, finalizado, evaluacion_id?, resultado? }
app.post("/chat", async (req, res) => {
  const { empresa_nombre, historial = [], mensaje, preguntas = [] } = req.body;

  try {
    // Construir contexto de preguntas para el sistema
    const preguntasTexto = preguntas.length > 0
      ? `\n\nPREGUNTAS DEL DIAGNÓSTICO (en orden):\n${preguntas.map((p: any, i: number) =>
          `${i + 1}. [${p.categoria}] ${p.texto} (peso: ${p.peso})`
        ).join("\n")}`
      : "";

    const systemContent = SYSTEM_PROMPT + preguntasTexto +
      `\n\nEmpresa evaluada: ${empresa_nombre || "la empresa"}`;

    // Construir mensajes para la API
    const messages: any[] = [
      { role: "system", content: systemContent },
      ...historial,
    ];

    // Primer mensaje — inicio del diagnóstico
    if (mensaje === "__inicio__") {
      messages.push({
        role: "user",
        content: "Inicia el diagnóstico. Preséntate brevemente y haz la primera pregunta.",
      });
    } else {
      messages.push({ role: "user", content: mensaje });
    }

    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages,
      temperature: 0.4,
      max_tokens: 500,
    });

    const respuestaIA = completion.choices[0]?.message?.content ?? "";
    const finalizado = respuestaIA.includes("[DIAGNOSTICO_COMPLETO]");
    const mensajeLimpio = respuestaIA.replace("[DIAGNOSTICO_COMPLETO]", "").trim();

    res.json({
      mensaje: mensajeLimpio,
      finalizado,
      // evaluacion_id se agrega cuando el back NestJS crea la evaluación
      evaluacion_id: null,
    });
  } catch (error: any) {
    console.error("ERROR /chat:", error.message);
    res.status(500).json({ message: error.message, code: error.code });
  }
});

// ── HEALTH ────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", model: MODEL, timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 IA Service corriendo en http://localhost:${PORT}`);
});
