const axios = require("axios")

module.exports = (app) => {
  async function removebg(buffer) {
    try {
      return await new Promise(async (resolve, reject) => {
        const image = buffer.toString("base64")
        const res = await axios.post("https://us-central1-ai-apps-prod.cloudfunctions.net/restorePhoto", {
          image: `data:image/png;base64,${image}`,
          model: "fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003",
        })
        const data = res.data?.replace(`"`, "")
        console.log(res.status, data)
        if (!data) return reject("failed removebg image")
        resolve(data)
      })
    } catch (e) {
      return {
        msg: e,
      }
    }
  }
  app.get("/tools/removebg", async (req, res) => {
    try {
      const { url } = req.query

      if (!url) {
        return res.status(400).json({ status: false, error: "Url is required" })
      }

      const { data } = await axios.get(url, { responseType: "arraybuffer" })
      const result = await removebg(data)
      res.writeHead(200, {
        "Content-Type": "image/jpeg",
        "Content-Length": data.length,
      })
      res.end(data)
    } catch (error) {
      res.status(500).json({ status: false, error: error.message })
    }
  })
}

