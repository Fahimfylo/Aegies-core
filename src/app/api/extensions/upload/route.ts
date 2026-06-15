import { NextRequest, NextResponse } from "next/server"
import { writeFileSync, readFileSync, existsSync } from "fs"
import { join } from "path"
import { connectDB } from "@/lib/db"
import { User } from "@/lib/models/User"
import { extractToken, verifyToken } from "@/lib/jwt"

function sanitizeVersion(version: string): string {
  return version.replace(/[^0-9.]/g, "")
}

export async function POST(req: NextRequest) {
  try {
    const token = extractToken(req)
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    await connectDB()
    const user = await User.findById(payload.userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const version = sanitizeVersion((formData.get("version") as string) || "")

    if (!file || !version) {
      return NextResponse.json({ error: "File and version are required" }, { status: 400 })
    }

    if (!file.name.endsWith(".zip")) {
      return NextResponse.json({ error: "Only ZIP files are allowed" }, { status: 400 })
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: "File size exceeds 50MB limit" }, { status: 400 })
    }

    const extDir = join(process.cwd(), "public", "extensions")
    const fileName = `extension-v${version}.zip`
    const filePath = join(extDir, fileName)

    const buffer = Buffer.from(await file.arrayBuffer())
    writeFileSync(filePath, buffer)

    // Update config
    const configPath = join(process.cwd(), "src", "config", "extension.json")
    const currentConfig = JSON.parse(readFileSync(configPath, "utf-8"))

    currentConfig.versions[version] = {
      version,
      file: fileName,
      size: file.size,
      releaseDate: new Date().toISOString(),
      changelog: formData.get("changelog")
        ? (formData.get("changelog") as string).split("\n").filter(Boolean)
        : ["Updated extension package"],
    }

    const isLatest = formData.get("isLatest") === "true"
    if (isLatest) {
      currentConfig.latestVersion = version
    }

    writeFileSync(configPath, JSON.stringify(currentConfig, null, 2))

    return NextResponse.json({
      success: true,
      version,
      file: fileName,
      size: file.size,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Failed to upload extension" }, { status: 500 })
  }
}
