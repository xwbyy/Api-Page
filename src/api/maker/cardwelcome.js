const axios = require("axios");

module.exports = (app) => {
  app.get("/maker/cardwelcome", async (req, res) => {
    try {
      const { background, text1, text2, text3 } = req.query; 

      if (!background) { // Cek 'content' bukan 'url'
        return res.status(400).json({ status: false, error: "background is required" });
      }
      const imageResponse = await axios.get(`https://api.popcat.xyz/welcomecard?background=${background}&text1=${text1}&text2=${text2}&text3=${text3}&avatar=${avatar}`,
        { responseType: "arraybuffer" },
      )
      // Mengatur header response
      res.writeHead(200, {
        "Content-Type": "image/png",
        "Content-Length": imageResponse.data.length,
      })

      // Mengirimkan data gambar
      res.end(imageResponse.data)
    } catch (error) {
      res.status(500).json({ status: false, error: error.message });
    }
  });
}
