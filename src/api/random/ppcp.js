const axios = require("axios")

module.exports = (app) => {
  async function ppcp() {
    try {
      const { data } = await axios.get(`https://raw.githubusercontent.com/KazukoGans/database/main/anime/ppcouple.json`)
      const randomIndex = Math.floor(Math.random() * data.length)
      const random = data[randomIndex]
      return {
        cowo: random.cowo,
        cewe: random.cewe,
      }
    } catch (error) {
      throw error
    }
  }

  app.get("/random/ppcp", async (req, res) => {
    try {
      const joke = await ppcp()
      res.status(200).json({
        status: true,
        cowo: joke.cowo,
        cewe: joke.cewe,
      })
    } catch (error) {
      res.status(500).json({ status: false, error: error.message })
    }
  })
}

