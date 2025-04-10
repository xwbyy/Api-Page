const axios = require("axios")
module.exports = (app) => {
  async function bluearchive() {
    try {
      const { data } = await axios.get(
        `https://raw.githubusercontent.com/veann-xyz/result-daniapi/main/cecan/cecan.json`,
      )
      const response = await axios.get(data[Math.floor(data.length * Math.random())], { responseType: "arraybuffer" })
      return Buffer.from(response.data)
    } catch (error) {
      throw error
    }
  }
  app.get("/random/cecan", async (req, res) => {
    try {
      const pedo = await bluearchive()
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

