const axios = require("axios");

module.exports = (app) => {
  app.get("/maker/gay", async (req, res) => {
    try {
      const { nama, avatar, num } = req.query; 

      // Cek apakah 'nama' ada
      if (!nama) {
        return res.status(400).json({ status: false, error: "Nama diperlukan" });
      }

      // Mengambil gambar dari API
      const imageResponse = await axios.get(`https://api.siputzx.my.id/api/canvas/gay?nama=${nama}&avatar=${avatar}&num=${num}`, {
        responseType: "arraybuffer",
      });

      // Mengatur header response
      res.writeHead(200, {
        "Content-Type": "image/png",
        "Content-Length": imageResponse.data.length,
      });

      // Mengirimkan data gambar
      res.end(imageResponse.data);
    } catch (error) {
      res.status(500).json({ status: false, error: error.message });
    }
  });
}
