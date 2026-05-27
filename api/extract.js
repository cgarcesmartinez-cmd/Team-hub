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
${relevantTasks.map(t => `${t.id} | ${t.person} | ${t.title}`).join("\n")}

REGLAS ESTRICTAS:
1. El taskId debe ser el número exacto del inicio de cada línea de tareas existentes.
2. Si el comentario contiene "terminada", "completada", "finalizada", "hecha", "terminado", "completado" → SIEMPRE pon newStatus: "completado"
3. Si contiene "en curso", "arrancada", "iniciada", "trabajando" → newStatus: "en-curso"
4. Si contiene "bloqueada", "parada", "pendiente de", "esperando" → newStatus: "bloqueado"
5. SIEMPRE incluye newStatus en cada update, nunca lo omitas
6. Si es información nueva → crea tarea nueva
7. Fechas como "29/05" → "2026-05-29"
8. Responde SOLO con JSON válido sin markdown ni prefijos

Formato EXACTO: {"tasks":[{"person":"","title":"","priority":"alta|media|baja","status":"pendiente","deadline":"","notes":""}],"updates":[{"taskId":14,"taskTitle":"título exacto","comment":"comentario","newStatus":"completado"}]}`
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
      const updates = (parsed.updates || []).map(u => {
        let cleanId = String(u.taskId || "").replace(/^(ID:|taskId:)/i, "").trim();
        const numId = parseInt(cleanId);
        const taskId = !isNaN(numId) ? numId : cleanId;
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
