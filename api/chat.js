export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

 
  const history = req.body.history || [];

  if (!history.length) {
    return res.status(400).json({ error: "Historial vacío" });
  }
   
  const systemPrompt = {
    role: "user", // Gemini no tiene 'system', usamos user como contexto inicial
    parts: [{
      text: "Eres un asistente especializado en los servicios de Carlos Fernández: impresión profesional, diseño gráfico, migración digital y educación técnica. Responde siempre en ese contexto."
    }]
  };



  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": process.env.GEMINI_API_KEY
        },
          body: JSON.stringify({contents: [systemPrompt, ...history.map(msg => ({role: msg.role === "bot" ? "model" : "user",parts: [{ text: msg.text }]
          }))
        ]
        })
      }
    );

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sin respuesta";

    res.status(200).json({ reply });
  } catch (error) {
    res.status(500).json({ error: "Error en la API Gemini", details: error.message });
  }
}
