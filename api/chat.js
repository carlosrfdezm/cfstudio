export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const prompt = req.body.prompt;

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": process.env.GEMINI_API_KEY   // ✅ usa este header
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        })
      }
    );

    const data = await response.json();
    console.log("Gemini response:", data);

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sin respuesta";

    res.status(200).json({ reply });
  } catch (error) {
    res.status(500).json({ error: "Error en la API Gemini", details: error.message });
  }
}

let history = []; // memoria temporal en el backend

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const prompt = req.body.prompt;
  history.push({ role: "user", text: prompt });

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": process.env.GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: history.map(msg => ({ parts: [{ text: msg.text }] }))
        })
      }
    );

    const data = await response.json();
    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sin respuesta";

    history.push({ role: "bot", text: reply });

    res.status(200).json({ reply });
  } catch (error) {
    res.status(500).json({ error: "Error en la API Gemini", details: error.message });
  }
}
