const axios = require("axios")

module.exports = (app) => {
  async function gemini(content, sessi) {
    const { data } = await axios.get(`https://api.hiuraa.my.id/ai/gemini?text=${content}&sessionid=${sessi}`)
    return data
  }

  app.get("/ai/gemini", async (req, res) => {
    try {
      const { text, sessi } = req.query

      if (!text || !sessi) {
        return res.status(400).json({ status: false, error: "Text & sessi is required" })
      }

      const { result } = await gemini(text, sessi)

      res.status(200).json({
        status: true,
        result: result,
      })
    } catch (error) {
      res.status(500).json({ status: false, error: error.message })
    }
  })
}

