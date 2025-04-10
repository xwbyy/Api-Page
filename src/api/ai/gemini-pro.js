const axios = require("axios")

module.exports = (app) => {
  async function geminiPro(content, image_url, sessi) {
    const { data } = await axios.get(
      `https://api.hiuraa.my.id/ai/gemini-advanced?text=${content}&_mediaUrl=${image_url || ""}&sessionid=${sessi}`,
    )
    return data
  }

  app.get("/ai/gemini-pro", async (req, res) => {
    try {
      const { text, imageUrl, sessi } = req.query

      if (!text || !sessi) {
        return res.status(400).json({ status: false, error: "Text & sessi is required" })
      }

      const { result } = await geminiPro(text, imageUrl, sessi)

      res.status(200).json({
        status: true,
        result: result,
      })
    } catch (error) {
      res.status(500).json({ status: false, error: error.message })
    }
  })
}

