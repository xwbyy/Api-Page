const axios = require("axios")

module.exports = (app) => {
  async function transcribe(url) {
    try {
      const res = await axios
        .get("https://yts.kooska.xyz/", {
          params: {
            url: url,
          },
          headers: {
            "Content-Type": "application/json",
            "User-Agent":
              "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36",
            Referer: "https://kooska.xyz/",
          },
        })
        .then((i) => i.data)
      return {
        video_id: res.video_id,
        summarize: res.ai_response,
        transcript: res.transcript,
      }
    } catch (e) {
      return {
        status: false,
        msg: `Gagal mendapatkan respon, dengan pesan: ${e.message}`,
      }
    }
  }

  app.get("/tools/transyt", async (req, res) => {
    try {
      const { url } = req.query

      if (!url) {
        return res.status(400).json({ status: false, error: "Url is required" })
      }

      // Validasi URL hanya boleh dari YouTube
      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/
      if (!youtubeRegex.test(url)) {
        return res.status(400).json({ status: false, error: "Invalid URL. Only YouTube URLs are allowed." })
      }

      const result = await transcribe(url)

      res.status(200).json({
        status: true,
        result,
      })
    } catch (error) {
      res.status(500).json({ status: false, error: error.message })
    }
  })
}

