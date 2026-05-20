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
      "Authorization": `Bearer TU_KEY_AQUI`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{
        role: "system",
        content: `Eres un asistente de gestión de equipos. Extrae tareas accionables de las notas de reunión. El equipo es: ${members}. Responde SOLO con JSON válido sin markdown: {"tasks":[{"person":"nombre","title":"tarea","priority":"alta|media|baja","status":"pendiente|en-curso|bloqueado","deadline":"YYYY-MM-DD o vacío","notes":"contexto o vacío"}]}`
      }, {
        role: "user",
        content: `Notas del meeting:\n${notes}`
      }],
      max_tokens: 1000
    })
  });

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || "{}";
  const clean = text.replace(/```json|```/g, "").trim();
  res.status(200).json(JSON.parse(clean));
}
