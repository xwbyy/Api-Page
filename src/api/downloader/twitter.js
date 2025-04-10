const axios = require("axios")
const BodySender = require("form-data")
const cheerio = require("cheerio")

module.exports = (app) => {
  const BASE_URL = "https://savetwitter.net"
  const AJAX_URL = "/api/ajaxSearch"

  async function savetwitter(url) {
    const d = new BodySender()
    d.append("q", url)
    d.append("lang", "en")
    d.append("cftoken", "")
    const headers = {
      ...d.getHeaders(),
    }
    const { data: html } = await axios.post(BASE_URL + AJAX_URL, d, {
      headers,
    })

    const $ = cheerio.load(html.data)

    if ($(".photo-list").length) {
      const images = []
      $(".photo-list .download-items__thumb img").each((i, el) => {
        images.push({
          thumb: $(el).attr("src"),
          download: $(el).closest(".download-items").find("a").attr("href"),
        })
      })
      return {
        type: "image",
        images,
      }
    }

    if ($(".tw-video").length) {
      const videos = []
      $(".tw-video .tw-right .dl-action a").each((i, el) => {
        videos.push({
          quality: $(el).text().trim().replace("Download MP4", "").trim(),
          download: $(el).attr("href"),
        })
      })
      return {
        type: "video",
        videos,
      }
    }

    return {
      error: "No media found",
    }
  }

  app.get("/downloader/twitter", async (req, res) => {
    try {
      const { url } = req.query
      if (!url) {
        return res.status(400).json({ status: false, error: "Url is required" })
      }
      const result = await savetwitter(url)
      res.status(200).json({
        status: true,
        result,
      })
    } catch (error) {
      res.status(500).json({ status: false, error: error.message })
    }
  })
}

