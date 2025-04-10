const axios = require("axios")

module.exports = (app) => {
  async function geminiCanvas(imageUrl) {
    const prompt = `tolong botakkan rambut dari karakter di gambar ini`
    const { data } = await axios.get(`https://api.hiuraa.my.id/ai/gemini-canvas?text=${prompt}&imageUrl=${imageUrl}`)
    return data
  }

  app.get("/ai/botak", async (req, res) => {
    try {
      const { imageUrl } = req.query

      if (!imageUrl) {
        return res.status(400).json({ status: false, error: "imageUrl is required" })
      }

      const { result } = await geminiCanvas(imageUrl)
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
