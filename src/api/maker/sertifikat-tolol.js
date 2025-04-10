const axios = require("axios");

module.exports = (app) => {
  app.get("/maker/sertifikat-tolol", async (req, res) => {
    try {
      const { text } = req.query; 

      if (!text) { // Cek 'content' bukan 'url'
        return res.status(400).json({ status: false, error: "name is required" });
      }
      const imageResponse = await axios.get(`https://api.siputzx.my.id/api/m/sertifikat-tolol?text=${text}`,
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
