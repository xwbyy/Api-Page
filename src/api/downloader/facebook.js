const cheerio = require("cheerio")
const axios = require("axios")
const fs = require("fs")

module.exports = (app) => {
  async function Facebook(url) {
    let results = {}
    while (Object.keys(results).length === 0) {
      const { data } = await axios
        .post("https://getmyfb.com/process", `id=${encodeURIComponent(url)}&locale=id`, {
          headers: {
            "HX-Request": true,
            "HX-Trigger": "form",
            "HX-Target": "target",
            "HX-Current-URL": "https://getmyfb.com/id",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "User-Agent":
              "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36",
            Referer: "https://getmyfb.com/id",
          },
        })
        .catch((e) => e.response)

      const $ = cheerio.load(data)

      const caption = $(".results-item-text").text().trim()
      const imageUrl = $(".results-item-image").attr("src")

      let newLinksFound = false
      const array = []
      $(".results-list li").each((i, element) => {
        const title = $(element).find(".results-item-text").text().trim()
        const downloadLink = $(element).find("a").attr("href")
        const quality = $(element).text().trim().split("(")[0]
        if (downloadLink) {
          newLinksFound = true
          array.push(downloadLink)
        }
      })
      results = {
        metadata: {
          title: caption,
          image: imageUrl,
        },
        media: array,
      }
      console.log(results)
      break
    }
    return results
  }
  app.get("/downloader/facebook", async (req, res) => {
    try {
      const { url } = req.query
      if (!url) {
        return res.status(400).json({ status: false, error: "Url is required" })
      }
      const result = await Facebook(url)
      res.status(200).json({
        status: true,
        result,
      })
    } catch (error) {
      res.status(500).json({ status: false, error: error.message })
    }
  })
}

