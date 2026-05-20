export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { notes, members } = req.body;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer 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`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{
        role: "system",
        content: `Eres un asistente de gestión de equipos experto en extraer tareas de notas de reuniones. El equipo disponible es: ${members}. INSTRUCCIONES: Extrae TODAS las tareas mencionadas aunque estén escritas de forma informal. Si se menciona un nombre del equipo asígnale la tarea. Las fechas como "antes del 22/05" se convierten a 2026-05-22. Responde ÚNICAMENTE con JSON válido sin markdown. Formato: {"tasks":[{"person":"nombre o vacío","title":"tarea","priority":"alta|media|baja","status":"pendiente","deadline":"YYYY-MM-DD o vacío","notes":"contexto o vacío"}]}`
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
