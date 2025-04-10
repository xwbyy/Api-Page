const axios = require("axios")

module.exports = (app) => {
  app.get("/ai/copilot", async (req, res) => {
    try {
      const { text, sessi, imageUrl } = req.query
      if (!text || !sessi) {
        return res.status(400).json({ status: false, error: "Text & sessi are required" })
      }

      const apiParams = new URLSearchParams({
        ask: text,
        style: "kamu adalah kecerdasan buatan (ai)",
        sessionId: sessi,
      })

      // Hanya tambahkan `imageUrl` jika ada
      if (imageUrl) apiParams.append("imageUrl", imageUrl)

      const { data } = await axios.get(`https://fastrestapis.fasturl.cloud/aillm/copilot?${apiParams.toString()}`)

      // Cegah error jika `result` tidak ada
      const result = data?.result || "No result found"

      res.status(200).json({
        status: true,
        result,
      })
    } catch (error) {
      res.status(500).json({ status: false, error: error.message })
    }
  })
}

