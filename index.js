const express = require("express")
const chalk = require("chalk")
const fs = require("fs")
const os = require("os")
const axios = require("axios")
const cors = require("cors")
const path = require("path")

const app = express()
const PORT = process.env.PORT || 3680

app.enable("trust proxy")
app.set("json spaces", 2)

// Configure Express to remove quotes on keys
app.set("json replacer", (key, value) => value)

app.use(express.json())
app.use(
  express.urlencoded({
    extended: false,
  }),
)
app.use(cors())
app.use("/", express.static(path.join(__dirname, "api-page")))
app.use("/src", express.static(path.join(__dirname, "src")))

const settingsPath = path.join(__dirname, "./src/settings.json")
const settings = JSON.parse(fs.readFileSync(settingsPath, "utf-8"))

// REMOVED: API key verification middleware

app.use((req, res, next) => {
  const originalJson = res.json
  res.json = function (data) {
    if (data && typeof data === "object") {
      const responseData = {
        status: data.status,
        creator: settings.apiSettings.creator || "Created Using Rynn UI",
        ...data,
      }
      return originalJson.call(this, responseData)
    }
    return originalJson.call(this, data)
  }
  next()
})

// Api Route
let totalRoutes = 0
const apiFolder = path.join(__dirname, "./src/api")
fs.readdirSync(apiFolder).forEach((subfolder) => {
  const subfolderPath = path.join(apiFolder, subfolder)
  if (fs.statSync(subfolderPath).isDirectory()) {
    fs.readdirSync(subfolderPath).forEach((file) => {
      const filePath = path.join(subfolderPath, file)
      if (path.extname(file) === ".js") {
        require(filePath)(app)
        totalRoutes++
        console.log(
          chalk
            .bgHex("#FFFF99")
            .hex("#333")
            .bold(` Loaded Route: ${path.basename(file)} `),
        )
      }
    })
  }
})
console.log(chalk.bgHex("#90EE90").hex("#333").bold(" Load Complete! ✓ "))
console.log(chalk.bgHex("#90EE90").hex("#333").bold(` Total Routes Loaded: ${totalRoutes} `))

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "api-page", "index.html"))
})

app.get("/contributors", (req, res) => {
  res.sendFile(path.join(__dirname, "api-page", "contributors.html"))
})

function formatUptime(seconds) {
  const days = Math.floor(seconds / (24 * 3600))
  const hours = Math.floor((seconds % (24 * 3600)) / 3600)
  const minutes = Math.floor(seconds % 3600) / 60
  const secs = Math.floor(seconds % 60)

  return `${days}d ${hours}h ${minutes}m ${secs}s`
}

app.get("/list_endpoint", async (req, res) => {
  try {
    const settingsPath = path.join("./src/settings.json")
    const settingsData = fs.readFileSync(settingsPath, "utf-8")
    const settings = JSON.parse(settingsData)

    let totalEndpoints = 0
    const endpoints = []

    settings.categories.forEach((category) => {
      category.items.forEach((item) => {
        totalEndpoints++
        endpoints.push({
          name: item.name,
          path: item.path,
        })
      })
    })

    res.json({
      status: true,
      total: totalEndpoints,
      endpoints,
    })
  } catch (error) {
    res.status(500).json({
      status: false,
      error: error.message,
    })
  }
})

app.get("/runtime", async (req, res) => {
  try {
    const uptime = formatUptime(os.uptime())
    const { data } = await axios.get(
      `https://og.tailgraph.com/og?fontFamily=Poppins&title=Runtime+Server&titleTailwind=font-bold%20text-red-600%20text-7xl&stroke=true&text=Time : ${uptime}&textTailwind=text-red-700%20mt-4%20text-2xl&textFontFamily=Poppins&logoTailwind=h-8&bgUrl=https%3A%2F%2Fwallpaper.dog%2Flarge%2F272766.jpg&bgTailwind=bg-white%20bg-opacity-30&footer=MchaX-Bot&footerTailwind=text-grey-600`,
      {
        responseType: "arraybuffer",
      },
    )
    res.writeHead(200, {
      "Content-Type": "image/png",
      "Content-Length": data.length,
    })
    res.end(data)
  } catch (error) {
    res.status(500).json({
      status: false,
      error: error.message,
    })
  }
})

app.get("/sysinfo", async (req, res) => {
  try {
    const startTime = Date.now()
    const uptime = formatUptime(os.uptime())

    res.status(200).json({
      status: true,
      hostname: os.hostname() || "Unknown",
      platform: os.platform(),
      arch: os.arch(),
      uptime,
      total_memory: (os.totalmem() / 1024 / 1024).toFixed(2) + " MB",
      free_memory: (os.freemem() / 1024 / 1024).toFixed(2) + " MB",
      cpu_model: os.cpus()[0].model,
      cpu_cores: os.cpus().length,
      latency: `${Date.now() - startTime}ms`,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    res.status(500).json({
      status: false,
      error: error.message,
    })
  }
})

app.use((req, res, next) => {
  res.status(404).sendFile(process.cwd() + "/api-page/404.html")
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).sendFile(process.cwd() + "/api-page/500.html")
})

app.listen(PORT, () => {
  console.log(chalk.bgHex("#90EE90").hex("#333").bold(` Server is running on port ${PORT} `))
})

module.exports = app

