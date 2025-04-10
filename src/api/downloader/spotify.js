const axios = require("axios")

module.exports = (app) => {
  async function spotifyCreds() {
    try {
      const { data } = await axios.post("https://accounts.spotify.com/api/token", "grant_type=client_credentials", {
        headers: {
          Authorization:
            "Basic " +
            Buffer.from("4c4fc8c3496243cbba99b39826e2841f:d598f89aba0946e2b85fb8aefa9ae4c8").toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })
      if (!data.access_token) throw new Error("Can't generate token!")
      return {
        status: true,
        data,
      }
    } catch (e) {
      return {
        status: false,
        msg: e.message,
      }
    }
  }

  function convert(ms) {
    const minutes = Math.floor(ms / 60000)
    const seconds = ((ms % 60000) / 1000).toFixed(0)
    return minutes + ":" + (seconds < 10 ? "0" : "") + seconds
  }

  async function spotdl(url) {
    try {
      const { data: yanzz } = await axios.get(`https://api.fabdl.com/spotify/get?url=${encodeURIComponent(url)}`, {
        headers: {
          accept: "application/json",
        },
      })

      if (!yanzz.result) throw new Error("Failed to fetch download link")

      const { data: yanz } = await axios.get(
        `https://api.fabdl.com/spotify/mp3-convert-task/${yanzz.result.gid}/${yanzz.result.id}`,
        {
          headers: {
            accept: "application/json",
          },
        },
      )

      return {
        title: yanzz.result.name,
        type: yanzz.result.type,
        artist: yanzz.result.artists,
        duration: convert(yanzz.result.duration_ms),
        image: yanzz.result.image,
        download: "https://api.fabdl.com" + yanz.result.download_url,
      }
    } catch (error) {
      return {
        msg: error.message,
      }
    }
  }

  app.get("/downloader/spotify", async (req, res) => {
    try {
      const { url } = req.query
      if (!url) {
        return res.status(400).json({ status: false, error: "Url is required" })
      }
      const result = await spotdl(url)
      res.status(200).json({
        status: true,
        result,
      })
    } catch (error) {
      res.status(500).json({ status: false, error: error.message })
    }
  })
}

