const cheerio = require("cheerio")

module.exports = (app) => {
  async function googleLyrics(judulLagu) {
    try {
      const response = await fetch(
        `https://r.jina.ai/https://www.google.com/search?q=liirk+lagu+${encodeURIComponent(judulLagu)}&hl=en`,
        {
          headers: {
            "x-return-format": "html",
            "x-engine": "cf-browser-rendering",
          },
        },
      )
      const text = await response.text()
      const $ = cheerio.load(text)
      const lirik = []
      const output = []
      const result = {}

      $("div.PZPZlf").each((i, e) => {
        const penemu = $(e).find('div[jsname="U8S5sf"]').text().trim()
        if (!penemu) output.push($(e).text().trim())
      })

      $('div[jsname="U8S5sf"]').each((i, el) => {
        let out = ""
        $(el)
          .find('span[jsname="YS01Ge"]')
          .each((j, span) => {
            out += $(span).text() + "\n"
          })
        lirik.push(out.trim())
      })

      result.lyrics = lirik.join("\n\n")
      result.title = output.shift()
      result.subtitle = output.shift()
      result.platform = output.filter((_) => !_.includes(":"))
      output.forEach((_) => {
        if (_.includes(":")) {
          const [name, value] = _.split(":")
          result[name.toLowerCase()] = value.trim()
        }
      })
      return result
    } catch (error) {
      return { error: error.message }
    }
  }

  app.get("/tools/lyrics", async (req, res) => {
    try {
      const { q } = req.query
      if (!q) {
        return res.status(400).json({ status: false, error: "Query is required" })
      }
      const pedo = await googleLyrics(q)
      res.status(200).json({
        status: true,
        result: pedo,
      })
    } catch (error) {
      res.status(500).send(`Error: ${error.message}`)
    }
  })
}

