const axios = require("axios")

module.exports = (app) => {
  async function darkjoke() {
    try {
      // Mengambil data JSON dari URL
      const { data } = await axios.get(
        "https://raw.githubusercontent.com/tegarpryd/merlynkurnia/d367f3f359df10c09f35d4b3cb9ec384eafb1b47/fun/darkjoke.json",
      )
      // Mengambil gambar secara acak dari data
      const randomJoke = data[Math.floor(Math.random() * data.length)]
      const imageResponse = await axios.get(randomJoke.image, { responseType: "arraybuffer" })
      return Buffer.from(imageResponse.data)
    } catch (error) {
      throw error
    }
  }

  app.get("/random/darkjoke", async (req, res) => {
    try {
      const imageBuffer = await darkjoke()
      res.writeHead(200, {
        "Content-Type": "image/png",
        "Content-Length": imageBuffer.length,
      })
      res.end(imageBuffer)
    } catch (error) {
      res.status(500).send(`Error: ${error.message}`)
    }
  })
}

