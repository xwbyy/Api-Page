const cheerio = require("cheerio")
const { fetch } = require("undici")
const { lookup } = require("mime-types")

module.exports = (app) => {
  async function mediafire(url) {
    return new Promise(async (resolve, reject) => {
      const response = await fetch(url)
      const html = await response.text()
      const $ = cheerio.load(html)

      const type = $(".dl-btn-cont").find(".icon").attr("class").split("archive")[1].trim()
      const filename = $(".dl-btn-label").attr("title")
      const size = $(".download_link .input")
        .text()
        .trim()
        .match(/$$(.*?)$$/)[1]
      const ext = filename.split(".").pop()
      const mimetype = lookup(ext.toLowerCase()) || "application/" + ext.toLowerCase()
      const download = $(".input").attr("href")
      resolve({
        filename,
        type,
        size,
        ext,
        mimetype,
        download,
      })
    }).catch((e) =>
      reject({
        msg: "Gagal mengambil data dari link tersebut",
      }),
    )
  }

  app.get("/downloader/mediafire", async (req, res) => {
    try {
      const { url } = req.query
      if (!url) {
        return res.status(400).json({ status: false, error: "Url is required" })
      }
      const result = await mediafire(url)
      res.status(200).json({
        status: true,
        result,
      })
    } catch (error) {
      res.status(500).json({ status: false, error: error.message })
    }
  })
}

