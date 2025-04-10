const axios = require("axios");

module.exports = (app) => {
  app.get("/maker/wasted", async (req, res) => {
    try {
      const { image } = req.query; 

      if (!image) { // Cek 'content' bukan 'url'
        return res.status(400).json({ status: false, error: "image is required" });
      }
      const imageResponse = await axios.get(`https://api.lolhuman.xyz/api/editor/wasted?apikey=${process.env.lolhuman}&img=${image}`,
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
