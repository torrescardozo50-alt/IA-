
const express = require("express");

const app = express();
app.use(express.json({ limit: "20kb" }));

app.get("/", (req, res) => {
  res.send("ROBLOX AI ASSISTANT está funcionando 🤖");
});

app.post("/chat", async (req, res) => {
  try {
    const message = req.body.message;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Escribe un mensaje válido." });
    }

    if (!apiKey) {
      return res.status(500).json({ error: "Falta la clave de Gemini." });
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: "Eres ROBLOX AI, experto en Roblox y Luau. Responde siempre en español. Genera código claro y explica cómo usarlo."
            }]
          },
          contents: [{
            parts: [{ text: message }]
          }]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(data);
      return res.status(502).json({
        error: data.error?.message || "Error de Gemini."
      });
    }

    const answer = data.candidates?.[0]?.content?.parts
      ?.map(part => part.text || "")
      .join("\n");

    res.json({ reply: answer || "Gemini no devolvió texto." });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error de conexión." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("ROBLOX AI iniciado en el puerto " + PORT);
});
