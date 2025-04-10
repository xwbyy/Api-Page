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

  async function spot(query) {
    try {
      const creds = await spotifyCreds()
      if (!creds.status) return creds

      const { data } = await axios.get(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=20`,
        {
          headers: {
            Authorization: "Bearer " + creds.data.access_token,
          },
        },
      )

      if (!data.tracks?.items.length)
        return {
          status: false,
          msg: "Music not found!",
        }

      return {
        status: true,
        data: data.tracks.items.map((v) => ({
          title: `${v.album.artists[0]?.name} - ${v.name}`,
          duration: convert(v.duration_ms),
          popularity: `${v.popularity}%`,
          preview: v.preview_url || "No preview available",
          url: v.external_urls.spotify,
        })),
      }
    } catch (e) {
      return {
        status: false,
        msg: e.message,
      }
    }
  }

  app.get("/search/spotify", async (req, res) => {
    try {
      const { q } = req.query
      if (!q) {
        return res.status(400).json({ status: false, error: "Url is required" })
      }
      const { data } = await spot(q)
      res.status(200).json({
        status: true,
        result: data,
      })
    } catch (error) {
      res.status(500).json({ status: false, error: error.message })
    }
  })
}

