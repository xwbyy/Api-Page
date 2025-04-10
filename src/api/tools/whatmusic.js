const acrcloud = require("acrcloud")
const axios = require("axios")

module.exports = (app) => {
  const acr = new acrcloud({
    host: "identify-ap-southeast-1.acrcloud.com",
    access_key: "ee1b81b47cf98cd73a0072a761558ab1",
    access_secret: "ya9OPe8onFAnNkyf9xMTK8qRyMGmsghfuHrIMmUI",
  })

  async function whatmusic(buffer) {
    function toTime(ms) {
      const minutes = Math.floor(ms / 60000) % 60
      const seconds = Math.floor(ms / 1000) % 60
      return [minutes, seconds].map((v) => v.toString().padStart(2, "0")).join(":")
    }

    const response = await acr.identify(buffer)
    const metadata = response.metadata

    if (!metadata || !metadata.music || metadata.music.length === 0) return []

    return metadata.music.map((song) => ({
      title: song.title,
      artist: song.artists?.map((a) => a.name)[0] || "Unknown",
      score: song.score || 0,
      release: song.release_date ? new Date(song.release_date).toLocaleDateString("id-ID") : "Unknown",
      duration: toTime(song.duration_ms || 0),
      url: song.external_metadata
        ? Object.keys(song.external_metadata)
            .map((key) =>
              key === "youtube"
                ? "https://youtu.be/" + song.external_metadata[key].vid
                : key === "deezer"
                  ? "https://www.deezer.com/us/track/" + song.external_metadata[key].track?.id
                  : key === "spotify"
                    ? "https://open.spotify.com/track/" + song.external_metadata[key].track?.id
                    : "",
            )
            .filter(Boolean)
        : [],
    }))
  }

  app.get("/tools/whatmusic", async (req, res) => {
    try {
      const { url } = req.query
      if (!url) {
        return res.status(400).json({ status: false, error: "Url is required" })
      }

      const { data } = await axios.get(url, { responseType: "arraybuffer" })
      const onde = Buffer.from(data)
      const pedo = await whatmusic(onde)

      res.status(200).json({
        status: true,
        result: pedo,
      })
    } catch (error) {
      res.status(500).json({ status: false, error: error.message })
    }
  })
}

