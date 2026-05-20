export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { notes, members, existingTasks } = req.body;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer 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`
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{
        role: "system",
        content: `Eres un asistente experto en gestión de equipos. Analiza notas de reunión y: 1. Extrae TAREAS NUEVAS que no existen aún. 2. Detecta COMENTARIOS o ACTUALIZACIONES sobre tareas ya existentes. El equipo es: ${members}. Tareas existentes (JSON): ${existingTasks}. INSTRUCCIONES: Si las notas mencionan algo relacionado con una tarea existente aunque sea con palabras distintas, añádelo como actualización. Si es información nueva que no corresponde a ninguna tarea existente, créala como tarea nueva. Las fechas como "22/05" conviértelas a "2026-05-22". Responde ÚNICAMENTE con JSON válido sin markdown. Formato exacto: {"tasks":[{"person":"nombre o vacío","title":"tarea nueva","priority":"alta|media|baja","status":"pendiente","deadline":"YYYY-MM-DD o vacío","notes":"contexto o vacío"}],"updates":[{"taskId":123,"taskTitle":"título de la tarea existente","comment":"comentario extraído de las notas"}]}`
      }, {
        role: "user",
        content: `Analiza estas notas y extrae tareas nuevas y actualizaciones de tareas existentes:\n\n${notes}`
      }],
      max_tokens: 1500,
      temperature: 0.1
    })
  });

  const data = await response.json();
  if (data.error) return res.status(500).json({ error: data.error.message, tasks: [], updates: [] });
  const text = data.choices?.[0]?.message?.content || '{"tasks":[],"updates":[]}';
  const clean = text.replace(/```json|```/g, "").trim();
  try {
    res.status(200).json(JSON.parse(clean));
  } catch(e) {
    res.status(200).json({ tasks: [], updates: [] });
  }
}
