const axios = require("axios")

module.exports = (app) => {
  app.get("/tools/ssweb", async (req, res) => {
    try {
      const { url } = req.query

      if (!url) {
        return res.status(400).json({ status: false, error: "Url is required" })
      }

      const { data } = await axios.get(`https://restapi.botwaaa.web.id/ssweb?url=${url}&apikey=free`, {
        responseType: "arraybuffer",
      })
      res.writeHead(200, {
        "Content-Type": "image/jpeg",
        "Content-Length": data.length,
      })
      res.end(data)
    } catch (error) {
      res.status(500).json({ status: false, error: error.message })
    }
  })
}

