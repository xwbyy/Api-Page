const axios = require("axios")

module.exports = (app) => {
  app.get("/tools/qr", async (req, res) => {
    try {
      const { url } = req.query
      if (!url) {
        return res.status(400).json({ status: false, error: "Url is required" })
      }
      const { data } = await axios.get(`https://fastrestapis.fasturl.cloud/tool/qr/scanner?url=${url}`)
      res.status(200).json({
        status: true,
        result: data?.result,
      })
    } catch (error) {
      res.status(500).send(`Error: ${error.message}`)
    }
  })
}

