const axios = require("axios")
module.exports = (app) => {
  async function cogan() {
    try {
      const { data } = await axios.get(
        `https://raw.githubusercontent.com/veann-xyz/result-daniapi/main/cecan/cogan.json`,
      )
      const response = await axios.get(data[Math.floor(data.length * Math.random())], { responseType: "arraybuffer" })
      return Buffer.from(response.data)
    } catch (error) {
      throw error
    }
  }
  app.get("/random/cogan", async (req, res) => {
    try {
      const pedo = await cogan()
      res.writeHead(200, {
        "Content-Type": "image/png",
        "Content-Length": pedo.length,
      })
      res.end(pedo)
    } catch (error) {
      res.status(500).send(`Error: ${error.message}`)
    }
  })
}

