const axios = require("axios")

module.exports = (app) => {
  async function pin(q) {
    // Cek apakah input adalah URL valid yang mengandung "pinterest.com" atau "pin.it"
    const isPinterestUrl = /pinterest.com|pin.it/.test(q)

    if (isPinterestUrl) {
      return await axios.get(`https://api.siputzx.my.id/api/d/pinterest?url=${q}`).then((response) => response.data)
    } else {
      return await axios.get(`https://api.siputzx.my.id/api/s/pinterest?query=${q}`).then((response) => response.data)
    }
  }

  app.get("/search/pinterest", async (req, res) => {
    try {
      const { q } = req.query

      if (!q) {
        return res.status(400).json({ status: false, error: "Query is required" })
      }

      const { data } = await pin(q)

      res.status(200).json({
        status: true,
        result: data,
      })
    } catch (error) {
      res.status(500).json({ status: false, error: error.message })
    }
  })
}

