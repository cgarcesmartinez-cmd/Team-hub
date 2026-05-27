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

    // Detect status keywords directly in notes for post-processing
    const notesLower = notes.toLowerCase();
    const isCompleted = notesLower.includes("completada") || notesLower.includes("terminada") || 
                        notesLower.includes("finalizada") || notesLower.includes("hecha") ||
                        notesLower.includes("completado") || notesLower.includes("terminado");

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
          content: `Eres un asistente experto en gestión de equipos. Analiza notas de reunión.

Equipo: ${members || ""}.

Tareas existentes más relevantes:
${relevantTasks.map(t => `taskId:${t.id} | ${t.person} | ${t.title}`).join("\n")}

REGLAS ESTRICTAS:
1. La persona mencionada en las notas DEBE coincidir con la persona de la tarea existente. No vincules actualizaciones a tareas de otras personas.
2. Elige la tarea más específica que coincida. Si hay varias tareas de la misma persona, elige la que tenga más palabras clave en común con las notas.
3. Si el comentario contiene "terminada", "completada", "finalizada", "hecha", "terminado", "completado" → SIEMPRE pon newStatus: "completado"
4. Si contiene "bloqueado", "bloqueada", "no puede", "esperando respuesta", "parado" → newStatus: "bloqueado"
5. Si contiene "en curso", "arrancada", "iniciada", "trabajando", "avanzando" → newStatus: "en-curso"
6. SIEMPRE incluye newStatus en cada update
7. Si no encuentras tarea existente que coincida claramente → crea tarea nueva
8. Fechas como "29/05" → "2026-05-29"
9. Responde SOLO con JSON válido sin markdown

Formato EXACTO obligatorio:
{"tasks":[{"person":"","title":"","priority":"alta|media|baja","status":"pendiente","deadline":"","notes":""}],"updates":[{"taskId":123,"taskTitle":"título exacto","comment":"comentario","newStatus":"completado"}]}`
        }, {
          role: "user",
          content: notes
        }],
        max_tokens: 1500,
        temperature: 0
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
      // Post-process: if notes mention completion words and update has no newStatus, force it
      const updates = (parsed.updates || []).map(u => {
        // Clean taskId - remove any "ID:" or "taskId:" prefix and convert to number
        let cleanId = String(u.taskId || "").replace(/^(ID:|taskId:)/i, "").trim();
        const numId = parseInt(cleanId);
        const taskId = !isNaN(numId) ? numId : cleanId;
        // Force newStatus if completion keywords detected
        const newStatus = u.newStatus || (isCompleted ? "completado" : undefined);
        return { ...u, taskId, newStatus };
      });
      return res.status(200).json({ tasks: parsed.tasks || [], updates });
    } catch(e) {
      return res.status(200).json({ tasks: [], updates: [], error: "Parse error" });
    }
  } catch(e) {
    return res.status(500).json({ tasks: [], updates: [], error: e.message });
  }
}
