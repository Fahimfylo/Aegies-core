/**
 * Build script: creates the extension ZIP file and updates the version config.
 *
 * Usage:
 *   node scripts/zip-extension.js [version]
 *
 * Default version is read from src/config/extension.json
 */

const AdmZip = require("adm-zip")
const { readFileSync, writeFileSync, existsSync } = require("fs")
const { resolve } = require("path")

const EXTENSION_DIR = resolve(__dirname, "..", "extension")
const OUTPUT_DIR = resolve(__dirname, "..", "public", "extensions")
const CONFIG_PATH = resolve(__dirname, "..", "src", "config", "extension.json")

let version = process.argv[2]
if (!version) {
  if (existsSync(CONFIG_PATH)) {
    const config = JSON.parse(readFileSync(CONFIG_PATH, "utf-8"))
    version = config.latestVersion
  } else {
    version = "2.0.0"
  }
}

const zip = new AdmZip()
zip.addLocalFolder(EXTENSION_DIR)

const fileName = `extension-v${version}.zip`
const outputPath = resolve(OUTPUT_DIR, fileName)
zip.writeZip(outputPath)

const stats = zip.toBuffer().length
console.log(`✓ Created ${fileName} (${(stats / 1024).toFixed(1)} KB)`)

// Update config
if (existsSync(CONFIG_PATH)) {
  const config = JSON.parse(readFileSync(CONFIG_PATH, "utf-8"))

  if (!config.versions[version]) {
    config.versions[version] = {
      version,
      file: fileName,
      size: stats,
      releaseDate: new Date().toISOString(),
      changelog: ["Updated extension package"],
    }
  } else {
    config.versions[version].size = stats
    config.versions[version].file = fileName
    config.versions[version].releaseDate = new Date().toISOString()
  }

  config.latestVersion = version
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2))
  console.log(`✓ Updated config with version ${version}`)
}

console.log("Done!")
