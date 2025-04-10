const axios = require("axios")

module.exports = (app) => {
  async function ttsape(q) {
    const maxRetries = 10
    let attempt = 0
    let response
    while (attempt < maxRetries) {
      try {
        const data = {
          count: 20,
          cursor: 0,
          web: 1,
          hd: 1,
          keywords: q,
        }
        const config = {
          method: "post",
          url: "https://tikwm.com/api/feed/search",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            Accept: "application/json, text/javascript, */*; q=0.01",
            "X-Requested-With": "XMLHttpRequest",
            "User-Agent":
              "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36",
            Referer: "https://tikwm.com/",
          },
          data: data,
        }
        response = await axios(config)
        console.log(JSON.stringify(response.data, null, 2))
        if (response.data.data) {
          return response.data.data.videos.map((a) => ({
            metadata: {
              title: a.title,
              duration: a.duration,
              region: a.region,
              video_id: a.video_id,
              thumbnail: "https://tikwm.com" + a.cover,
              create_at: new Date(a.create_time * 1000).toLocaleString("ID").toString(),
            },
            stats: {
              play: Number(a.play_count).toLocaleString(),
              like: Number(a.digg_count).toLocaleString(),
              comment: Number(a.comment_count).toLocaleString(),
              share: Number(a.share_count).toLocaleString(),
              download: Number(a.download_count).toLocaleString(),
            },
            music: a.music_info,
            author: {
              name: a.author.nickname,
              username: "@" + a.author.unique_id,
              avatar: "https://tikwm.com" + a.author.avatar,
            },
            media: {
              no_watermark: "https://tikwm.com" + a.play,
              watermark: "https://tikwm.com" + a.wmplay,
              audio: "https://tikwm.com" + a.music,
            },
          }))
        } else {
          console.warn("Tidak ada data, mencoba lagi...")
          attempt++
          await new Promise((resolve) => setTimeout(resolve, 2000))
        }
      } catch (error) {
        console.error("Terjadi kesalahan: ", error.message)
        attempt++
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
    }
    return "Kebanyakan spam ini kasih delay dong"
  }

  app.get("/search/ttsearch", async (req, res) => {
    try {
      const { q } = req.query
      if (!q) {
        return res.status(400).json({ status: false, error: "Query is required" })
      }
      const result = await ttsape(q)
      res.status(200).json({
        status: true,
        result,
      })
    } catch (error) {
      res.status(500).json({ status: false, error: error.message })
    }
  })
}

