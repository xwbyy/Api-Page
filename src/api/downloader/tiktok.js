const axios = require("axios")

module.exports = (app) => {
  app.get("/downloader/tiktok", async (req, res) => {
    try {
      const { url } = req.query
      if (!url) {
        return res.status(400).json({ status: false, error: "Url is required" })
      }
      const tikwm = "https://www.tikwm.com/api/?url=" + url + "?hd=1"
      const response = await axios.post(tikwm)
      const done = response.data
      const result = done
      res.status(200).json({
        status: true,
        result,
      })
    } catch (error) {
      res.status(500).json({ status: false, error: error.message })
    }
  })
}

