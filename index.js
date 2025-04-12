const express = require("express");
const chalk = require("chalk");
const fs = require("fs");
const os = require("os");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3680;

app.enable("trust proxy");
app.set("json spaces", 2);
app.set("json replacer", (key, value) => value);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use("/", express.static(path.join(__dirname, "api-page")));
app.use("/src", express.static(path.join(__dirname, "src")));

const settingsPath = path.join(__dirname, "./src/settings.json");
const settings = JSON.parse(fs.readFileSync(settingsPath, "utf-8"));

app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function (data) {
    if (data && typeof data === "object") {
      const responseData = {
        status: data.status,
        creator: settings.apiSettings.creator || "Xwby API Services",
        ...data,
      };
      return originalJson.call(this, responseData);
    }
    return originalJson.call(this, data);
  };
  next();
});

// Load API routes
let totalRoutes = 0;
const apiFolder = path.join(__dirname, "./src/api");
fs.readdirSync(apiFolder).forEach((subfolder) => {
  const subfolderPath = path.join(apiFolder, subfolder);
  if (fs.statSync(subfolderPath).isDirectory()) {
    fs.readdirSync(subfolderPath).forEach((file) => {
      const filePath = path.join(subfolderPath, file);
      if (path.extname(file) === ".js") {
        require(filePath)(app);
        totalRoutes++;
        console.log(
          chalk.bgHex("#FFFF99").hex("#333").bold(` Loaded Route: ${path.basename(file)} `)
        );
      }
    });
  }
});

console.log(chalk.bgHex("#90EE90").hex("#333").bold(" Load Complete! ✓ "));
console.log(chalk.bgHex("#90EE90").hex("#333").bold(` Total Routes Loaded: ${totalRoutes} `));

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "api-page", "index.html"));
});

app.get("/contributors", (req, res) => {
  res.sendFile(path.join(__dirname, "api-page", "contributors.html"));
});

// Utility endpoints
app.get("/list_endpoint", async (req, res) => {
  try {
    const settingsPath = path.join("./src/settings.json");
    const settingsData = fs.readFileSync(settingsPath, "utf-8");
    const settings = JSON.parse(settingsData);

    let totalEndpoints = 0;
    const endpoints = [];

    settings.categories.forEach((category) => {
      category.items.forEach((item) => {
        totalEndpoints++;
        endpoints.push({
          name: item.name,
          path: item.path,
        });
      });
    });

    res.json({
      status: true,
      total: totalEndpoints,
      endpoints,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      error: error.message,
    });
  }
});

// Error handling
app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, "api-page", "404.html"));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).sendFile(path.join(__dirname, "api-page", "500.html"));
});

app.listen(PORT, () => {
  console.log(
    chalk.bgHex("#90EE90").hex("#333").bold(` Xwby API running on port ${PORT} `)
  );
});

module.exports = app;