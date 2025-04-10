const axios = require("axios")

module.exports = (app) => {
  async function nsfwwai() {
    try {
      // Mengambil URL gambar dari API
      const { data } = await axios.get("https://api.waifu.pics/nsfw/waifu")
      const imageUrl = data.url // Mengambil URL dari response

      // Mengambil gambar sebagai array buffer
      const response = await axios.get(imageUrl, { responseType: "arraybuffer" })
      return Buffer.from(response.data) // Menggunakan response.data untuk mendapatkan buffer
    } catch (error) {
      throw error
    }
  }

  app.get("/nsfw/hentai", async (req, res) => {
    try {
      const imageBuffer = await nsfwwai()
      res.writeHead(200, {
        "Content-Type": "image/jpeg", // Mengubah Content-Type ke image/jpeg
        "Content-Length": imageBuffer.length,
      })
      res.end(imageBuffer)
    } catch (error) {
      res.status(500).send(`Error: ${error.message}`)
    }
  })
}

