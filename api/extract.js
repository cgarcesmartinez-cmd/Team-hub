export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { notes, members, existingTasks } = req.body || {};
    if (!notes) return res.status(400).json({ tasks: [], updates: [], error: "No notes provided" });

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
          content: `Eres un asistente experto en gestión de equipos. Analiza notas de reunión y: 1. Extrae TAREAS NUEVAS que no existen aún. 2. Detecta COMENTARIOS o ACTUALIZACIONES sobre tareas ya existentes. El equipo es: ${members || ""}. Tareas existentes: ${existingTasks || "[]"}. INSTRUCCIONES: Si las notas mencionan algo relacionado con una tarea existente añádelo como actualización con el taskId correcto. Si es información nueva créala como tarea nueva. Las fechas como "22/05" conviértelas a "2026-05-22". Responde ÚNICAMENTE con JSON válido sin markdown. Formato: {"tasks":[{"person":"nombre o vacío","title":"tarea","priority":"alta|media|baja","status":"pendiente","deadline":"YYYY-MM-DD o vacío","notes":"contexto o vacío"}],"updates":[{"taskId":123,"taskTitle":"título tarea existente","comment":"comentario"}]}`
        }, {
          role: "user",
          content: `Analiza estas notas:\n\n${notes}`
        }],
        max_tokens: 1500,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(500).json({ tasks: [], updates: [], error: err });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '{"tasks":[],"updates":[]}';
    const clean = text.replace(/```json|```/g, "").trim();
    try {
      const parsed = JSON.parse(clean);
      return res.status(200).json({ tasks: parsed.tasks || [], updates: parsed.updates || [] });
    } catch(e) {
      return res.status(200).json({ tasks: [], updates: [], error: "Parse error" });
    }
  } catch(e) {
    return res.status(500).json({ tasks: [], updates: [], error: e.message });
  }
}
