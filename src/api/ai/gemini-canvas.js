const axios = require("axios")

module.exports = (app) => {
  async function geminiCanvas(content, imageUrl) {
    const { data } = await axios.get(`https://api.hiuraa.my.id/ai/gemini-canvas?text=${content}&imageUrl=${imageUrl}`)
    return data
  }

  app.get("/ai/gemini-canvas", async (req, res) => {
    try {
      const { text, imageUrl } = req.query

      if (!text || !imageUrl) {
        return res.status(400).json({ status: false, error: "Text & imageUrl is required" })
      }

      const { result } = await geminiCanvas(text, imageUrl)
      const pedo = Buffer.from(result.image.base64, "base64")
      res.writeHead(200, {
        "Content-Type": "image/png",
        "Content-Length": pedo.length,
      })
      res.end(pedo)
    } catch (error) {
      res.status(500).json({ status: false, error: error.message })
    }
  })
}

