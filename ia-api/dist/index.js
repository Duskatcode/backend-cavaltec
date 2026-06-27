"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const openai_1 = __importDefault(require("openai"));
dotenv_1.default.config({ override: true });
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
console.log("========== IA SERVICE ==========");
console.log({
    apiKey: process.env.OPENAI_API_KEY ? "OK" : "NO",
    baseURL: process.env.OPENAI_BASE_URL,
    model: process.env.OPENAI_MODEL,
});
console.log("================================");
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL,
});
const MODEL = process.env.OPENAI_MODEL ?? "llama-3.3-70b-versatile";
// ── SYSTEM PROMPT ────────────────────────────────────────────
const SYSTEM_PROMPT = `Eres CAVALTEC, un asistente experto en diagnóstico de cumplimiento de la Ley 1581 de 2012 (Protección de Datos Personales de Colombia).

Tu misión es guiar a empresas colombianas a través de un diagnóstico conversacional de 20 preguntas sobre sus prácticas de protección de datos.

REGLAS ESTRICTAS:
1. Responde SIEMPRE en español.
2. Sé conciso y profesional. Máximo 3 líneas por respuesta antes de la siguiente pregunta.
3. Cuando el usuario responda, reconoce brevemente su respuesta (positiva o negativamente) y pasa a la siguiente pregunta.
4. Cuando hayas hecho las 20 preguntas y recibido respuestas, incluye en tu último mensaje el marcador: [DIAGNOSTICO_COMPLETO]
5. No inventes preguntas — usa SOLO las que se te proporcionan en el contexto.
6. Interpreta respuestas ambiguas como negativas (más seguro para el diagnóstico).
7. Agrupa visualmente las preguntas por categoría cuando cambies de tema.`;
// ── ENDPOINT ORIGINAL — mantener compatibilidad ───────────────
app.post("/explicar", async (req, res) => {
    const { pregunta } = req.body;
    if (!pregunta)
        return res.status(400).json({ error: 'Falta el campo "pregunta"' });
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
    }
    catch (error) {
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
            ? `\n\nPREGUNTAS DEL DIAGNÓSTICO (en orden):\n${preguntas.map((p, i) => `${i + 1}. [${p.categoria}] ${p.texto} (peso: ${p.peso})`).join("\n")}`
            : "";
        const systemContent = SYSTEM_PROMPT + preguntasTexto +
            `\n\nEmpresa evaluada: ${empresa_nombre || "la empresa"}`;
        // Construir mensajes para la API
        const messages = [
            { role: "system", content: systemContent },
            ...historial,
        ];
        // Primer mensaje — inicio del diagnóstico
        if (mensaje === "__inicio__") {
            messages.push({
                role: "user",
                content: "Inicia el diagnóstico. Preséntate brevemente y haz la primera pregunta.",
            });
        }
        else {
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
    }
    catch (error) {
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
