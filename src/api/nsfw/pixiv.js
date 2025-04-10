const axios = require("axios")

module.exports = (app) => {
  app.get("/nsfw/pixiv", async (req, res) => {
    try {
      const { q, r18 } = req.query

      if (!q || !r18) {
        return res.status(400).json({ status: false, error: "Query and r18 parameters are required" })
      }

      // Validasi nilai r18
      let r18Value
      if (r18.toLowerCase() === "yes") {
        r18Value = 1
      } else if (r18.toLowerCase() === "no") {
        r18Value = 0
      } else {
        return res.status(400).json({ status: false, error: 'Invalid r18 value. Use "yes" or "no" only.' })
      }

      const { data } = await axios.get(`https://api.lolicon.app/setu/v1?r18=${r18Value}&keyword=${q}&limit=20`)

      res.status(200).json({
        status: true,
        result: data,
      })
    } catch (error) {
      res.status(500).json({ status: false, error: error.message })
    }
  })
}

