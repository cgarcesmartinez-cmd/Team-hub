export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { notes, members, existingTasks } = req.body || {};
    if (!notes) return res.status(400).json({ tasks: [], updates: [], error: "No notes provided" });

    let parsedTasks = [];
    try { parsedTasks = JSON.parse(existingTasks || "[]"); } catch(e) {}

    const notesWords = notes.toLowerCase().split(/\s+/);
    const relevantTasks = parsedTasks
      .map(t => {
        const titleWords = t.title.toLowerCase().split(/\s+/);
        const personWords = (t.person || "").toLowerCase().split(/\s+/);
        let score = 0;
        notesWords.forEach(w => {
          if (w.length > 3) {
            if (titleWords.some(tw => tw.includes(w) || w.includes(tw))) score += 2;
            if (personWords.some(pw => pw.includes(w) || w.includes(pw))) score += 1;
          }
        });
        return { ...t, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 15)
      .map(({ score, ...t }) => t);

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
          content: `Eres un asistente experto en gestión de equipos. Analiza notas de reunión y:
1. Extrae TAREAS NUEVAS que no existen.
2. Detecta ACTUALIZACIONES sobre tareas existentes, incluyendo cambios de estado.

Equipo: ${members || ""}.

Tareas existentes más relevantes:
${relevantTasks.map(t => `ID:${t.id} | ${t.person} | ${t.title}`).join("\n")}

REGLAS:
- Si mencionan que una tarea está completada, terminada, hecha, finalizada → newStatus: "completado"
- Si mencionan que está en curso, arrancada, iniciada → newStatus: "en-curso"
- Si mencionan que está bloqueada, parada, pendiente de algo → newStatus: "bloqueado"
- Si no hay cambio de estado → omite newStatus
- Si es información nueva → crea tarea nueva
- Fechas como "22/05" → "2026-05-22"
- Responde SOLO con JSON válido sin markdown.

Formato: {"tasks":[{"person":"","title":"","priority":"alta|media|baja","status":"pendiente","deadline":"","notes":""}],"updates":[{"taskId":123,"taskTitle":"título","comment":"comentario","newStatus":"completado|en-curso|bloqueado|pendiente"}]}`
        }, {
          role: "user",
          content: notes
        }],
        max_tokens: 1000,
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
