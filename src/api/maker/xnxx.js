const axios = require("axios");

module.exports = (app) => {
  app.get("/maker/xnxx", async (req, res) => {
    try {
      const { title, url } = req.query; 

      if (!title) { // Cek 'content' bukan 'url'
        return res.status(400).json({ status: false, error: "Content is required" });
      }
      const imageResponse = await axios.get(`https://api.siputzx.my.id/api/canvas/xnxx?title=${title}&image=${url}`,
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
