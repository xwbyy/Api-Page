const axios = require("axios")

module.exports = (app) => {
  app.get("/ai/yousearch", async (req, res) => {
    try {
      const { text, prompt } = req.query
      if (!text || !prompt) {
        return res.status(400).json({ status: false, error: "Text & prompt is required" })
      }
      const requestData = {
        searchTerm: text,
        promptTemplate: prompt,
        searchParameters: "{}",
        searchResultTemplate: `[{order}] "{snippet}"\nURL: {link}`,
      }
      const { data } = await axios.post("https://app.yoursearch.ai/api", requestData)
      res.status(200).json({
        status: true,
        result: data.response,
      })
    } catch (error) {
      res.status(500).json({ status: false, error: error.message })
    }
  })
}

