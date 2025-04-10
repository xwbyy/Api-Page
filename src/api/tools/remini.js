const fetch = require("node-fetch")
const axios = require("axios")

module.exports = (app) => {
  async function hade(imageBuffer) {
    try {
      const response = await fetch("https://lexica.qewertyy.dev/upscale", {
        body: JSON.stringify({
          image_data: Buffer.from(imageBuffer, "base64"),
          format: "binary",
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      })
      return Buffer.from(await response.arrayBuffer())
    } catch {
      return null
    }
  }
  app.get("/tools/remini", async (req, res) => {
    try {
      const { url } = req.query

      if (!url) {
        return res.status(400).json({ status: false, error: "Url is required" })
      }

      const { data } = await axios.get(url, { responseType: "arraybuffer" })
      const result = await hade(data)
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

