export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { notes, members } = req.body;

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
        content: `Eres un asistente de gestión de equipos. Extrae TODAS las tareas accionables de las notas de reunión. El equipo es: ${members}. Asigna cada tarea a la persona mencionada. Las fechas como "22/05" conviértelas a "2026-05-22". Responde ÚNICAMENTE con JSON válido sin markdown ni explicaciones. Formato exacto: {"tasks":[{"person":"nombre del miembro o vacío","title":"descripción de la tarea","priority":"alta|media|baja","status":"pendiente","deadline":"YYYY-MM-DD o vacío","notes":"contexto o vacío"}]}`
      }, {
        role: "user",
        content: `Extrae todas las tareas de estas notas:\n\n${notes}`
      }],
      max_tokens: 1000,
      temperature: 0.1
    })
  });

  const data = await response.json();
  if (data.error) return res.status(500).json({ error: data.error.message, tasks: [] });
  const text = data.choices?.[0]?.message?.content || '{"tasks":[]}';
  const clean = text.replace(/```json|```/g, "").trim();
  try {
    res.status(200).json(JSON.parse(clean));
  } catch(e) {
    res.status(200).json({ tasks: [] });
  }
}
