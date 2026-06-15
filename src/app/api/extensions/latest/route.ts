import { NextResponse } from "next/server"
import config from "@/config/extension.json"

export async function GET() {
  const versionData = config.versions[config.latestVersion as keyof typeof config.versions]

  return NextResponse.json({
    latestVersion: config.latestVersion,
    version: versionData,
  })
}
