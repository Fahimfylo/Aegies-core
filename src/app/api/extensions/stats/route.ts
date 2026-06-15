import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { DownloadRecord } from "@/lib/models/DownloadRecord"
import { extractToken } from "@/lib/jwt"
import config from "@/config/extension.json"

export async function GET(req: NextRequest) {
  try {
    const token = extractToken(req)
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    await connectDB()

    const totalDownloads = await DownloadRecord.countDocuments()

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayDownloads = await DownloadRecord.countDocuments({ createdAt: { $gte: today } })

    const versionAgg = await DownloadRecord.aggregate([
      { $group: { _id: "$version", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])
    const versionBreakdown = versionAgg.map((v) => ({ version: v._id, count: v.count }))

    const recentRaw = await DownloadRecord.find().sort({ createdAt: -1 }).limit(50).lean()

    const versions = Object.entries(config.versions).map(([ver, data]) => ({
      version: ver,
      file: data.file,
      size: data.size,
      releaseDate: data.releaseDate,
      downloadCount: versionAgg.find((v) => v._id === ver)?.count || 0,
    }))

    const recentDownloads = recentRaw.map((r) => ({
      _id: r._id.toString(),
      version: r.version,
      ip: r.ip,
      userAgent: r.userAgent,
      referrer: r.referrer,
      downloadedAt: r.createdAt?.toISOString() || "",
    }))

    return NextResponse.json({
      totalDownloads,
      todayDownloads,
      versionBreakdown,
      recentDownloads,
      versions,
    })
  } catch (error) {
    console.error("Stats error:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
