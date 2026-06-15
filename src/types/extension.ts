export type ExtensionVersion = {
  version: string
  file: string
  size: number
  releaseDate: string
  changelog: string[]
}

export type ExtensionConfig = {
  latestVersion: string
  versions: Record<string, ExtensionVersion>
}

export type DownloadRecord = {
  _id: string
  version: string
  ip: string
  userAgent: string
  referrer: string
  downloadedAt: string
}

export type DownloadStats = {
  totalDownloads: number
  todayDownloads: number
  versionBreakdown: { version: string; count: number }[]
  recentDownloads: DownloadRecord[]
}
