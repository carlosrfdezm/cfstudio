export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const prompt = req.body.prompt;

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GEMINI_API_KEY}`
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();

    res.status(200).json({
      reply: data.candidates?.[0]?.content?.parts?.[0]?.text || "Sin respuesta"
    });
  } catch (error) {
    res.status(500).json({ error: "Error en la API Gemini", details: error.message });
  }
}

