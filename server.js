const express = require("express");

const app = express();
app.use(express.json({ limit: "20kb" }));

app.get("/", (req, res) => {
  res.send("ROBLOX AI ASSISTANT está funcionando 🤖");
});

app.post("/chat", async (req, res) => {
  try {
    const message = req.body.message;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "Escribe un mensaje válido."
      });
    }

    if (message.length > 5000) {
      return res.status(400).json({
        error: "El mensaje es demasiado largo."
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "Falta configurar la clave de IA."
      });
    }

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-5.5",
          instructions:
            "Eres ROBLOX AI, un asistente experto en Roblox y Luau. Responde siempre en español. Genera código claro y explica cómo usarlo. No afirmes que has ejecutado o probado un script si no lo has hecho.",
          input: message
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(data);
      return res.status(502).json({
        error: "La IA no pudo responder."
      });
    }

    const answer = (data.output || [])
      .filter(item => item.type === "message")
      .flatMap(item => item.content || [])
      .filter(item => item.type === "output_text")
      .map(item => item.text)
      .join("\n");

    res.json({ reply: answer });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error de conexión con la IA."
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("ROBLOX AI iniciado en el puerto " + PORT);
});
