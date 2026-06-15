import { NextRequest, NextResponse } from "next/server"
import { readFileSync, existsSync } from "fs"
import { join } from "path"
import { connectDB } from "@/lib/db"
import { DownloadRecord } from "@/lib/models/DownloadRecord"
import config from "@/config/extension.json"

const RATE_LIMIT_WINDOW = 60 * 1000
const MAX_DOWNLOADS_PER_WINDOW = 10
const ipMap = new Map<string, { count: number; resetAt: number }>()

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0].trim()
  return req.headers.get("x-real-ip") || "127.0.0.1"
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = ipMap.get(ip)
  if (!entry || now > entry.resetAt) {
    ipMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
    return true
  }
  if (entry.count >= MAX_DOWNLOADS_PER_WINDOW) return false
  entry.count++
  return true
}

export async function GET(req: NextRequest) {
  try {
    const ip = getClientIp(req)
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 })
    }

    const { searchParams } = new URL(req.url)
    const version = searchParams.get("version") || config.latestVersion

    const versionData = config.versions[version as keyof typeof config.versions]
    if (!versionData) {
      return NextResponse.json({ error: `Version ${version} not found` }, { status: 404 })
    }

    const filePath = join(process.cwd(), "public", "extensions", versionData.file)
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: "Extension file not found on server" }, { status: 404 })
    }

    // Record download asynchronously
    connectDB().then(() => {
      DownloadRecord.create({
        version,
        ip,
        userAgent: req.headers.get("user-agent") || "",
        referrer: req.headers.get("referer") || "",
      }).catch(() => {})
    })

    const fileBuffer = readFileSync(filePath)

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${versionData.file}"`,
        "Content-Length": fileBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error("Download error:", error)
    return NextResponse.json({ error: "Failed to process download" }, { status: 500 })
  }
}
