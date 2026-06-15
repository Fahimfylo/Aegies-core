"use client"

import { useState, useEffect, useCallback } from "react"
import { Shield, Download, Upload, BarChart3, ExternalLink, Trash2, ArrowLeft } from "lucide-react"
import Link from "next/link"

type VersionInfo = {
  version: string
  file: string
  size: number
  releaseDate: string
  downloadCount: number
}

type StatsData = {
  totalDownloads: number
  todayDownloads: number
  versionBreakdown: { version: string; count: number }[]
  recentDownloads: { _id: string; version: string; ip: string; downloadedAt: string }[]
  versions: VersionInfo[]
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function AdminExtensionsPage() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [version, setVersion] = useState("")
  const [changelog, setChangelog] = useState("")
  const [isLatest, setIsLatest] = useState(true)

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/extensions/stats")
      if (res.ok) {
        setStats(await res.json())
      }
    } catch {} finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchStats() }, [fetchStats])

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !version) return

    setUploading(true)
    setUploadResult("")

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("version", version)
      formData.append("changelog", changelog)
      formData.append("isLatest", String(isLatest))

      const res = await fetch("/api/extensions/upload", { method: "POST", body: formData })
      const data = await res.json()

      if (res.ok) {
        setUploadResult(`Uploaded v${data.version} (${formatSize(data.size)})`)
        setFile(null)
        setVersion("")
        setChangelog("")
        fetchStats()
      } else {
        setUploadResult(`Error: ${data.error}`)
      }
    } catch {
      setUploadResult("Upload failed")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0C16] p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 hover:bg-white/5">
              <ArrowLeft className="h-4 w-4 text-gray-400" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Extension Manager</h1>
              <p className="text-sm text-gray-500">Manage AegisCore browser extension versions and downloads</p>
            </div>
          </div>
          <Link href="/install-extension" className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-300 hover:bg-white/5">
            <ExternalLink className="h-4 w-4" /> View Install Page
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Total Downloads", value: stats?.totalDownloads ?? "-", icon: Download, color: "text-primary" },
            { label: "Today", value: stats?.todayDownloads ?? "-", icon: BarChart3, color: "text-green-500" },
            { label: "Versions", value: stats?.versions.length ?? "-", icon: Shield, color: "text-accent" },
          ].map((card) => (
            <div key={card.label} className="rounded-xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{card.label}</p>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
              <p className="mt-2 text-2xl font-bold text-white">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Upload Form */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
              <Upload className="h-5 w-5 text-primary" /> Upload New Version
            </h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-gray-400">ZIP File</label>
                <input
                  type="file"
                  accept=".zip"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-gray-300 file:mr-3 file:rounded file:border-0 file:bg-primary/20 file:px-3 file:py-1 file:text-sm file:text-primary"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm text-gray-400">Version</label>
                  <input
                    type="text"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    placeholder="2.1.0"
                    className="w-full rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-white placeholder-gray-600 outline-none focus:border-primary/50"
                    required
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-300 cursor-pointer hover:bg-white/5">
                    <input type="checkbox" checked={isLatest} onChange={() => setIsLatest(!isLatest)} className="accent-primary" />
                    Mark as latest
                  </label>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-400">Changelog (one per line)</label>
                <textarea
                  value={changelog}
                  onChange={(e) => setChangelog(e.target.value)}
                  rows={4}
                  placeholder="Fixed phishing detection&#10;Improved UI"
                  className="w-full rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-white placeholder-gray-600 outline-none focus:border-primary/50"
                />
              </div>
              <button
                type="submit"
                disabled={uploading || !file || !version}
                className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Upload Extension"}
              </button>
              {uploadResult && (
                <p className={`text-center text-sm ${uploadResult.startsWith("Error") ? "text-red-400" : "text-green-400"}`}>
                  {uploadResult}
                </p>
              )}
            </form>
          </div>

          {/* Versions List */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
              <Shield className="h-5 w-5 text-primary" /> Version History
            </h2>
            {loading ? (
              <p className="text-sm text-gray-500">Loading...</p>
            ) : stats?.versions.length ? (
              <div className="space-y-3">
                {stats.versions.map((v) => (
                  <div key={v.version} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">v{v.version}</span>
                        <span className="text-xs text-gray-500">{formatSize(v.size)}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-gray-600">{formatDate(v.releaseDate)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">{v.downloadCount}</p>
                      <p className="text-xs text-gray-500">downloads</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No versions uploaded yet</p>
            )}
          </div>
        </div>

        {/* Recent Downloads */}
        <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <BarChart3 className="h-5 w-5 text-primary" /> Recent Downloads
          </h2>
          {loading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : stats?.recentDownloads.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-gray-500">
                    <th className="pb-2 font-medium">Version</th>
                    <th className="pb-2 font-medium">IP</th>
                    <th className="pb-2 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentDownloads.slice(0, 20).map((d) => (
                    <tr key={d._id} className="border-b border-white/5 text-gray-300">
                      <td className="py-2">v{d.version}</td>
                      <td className="py-2 font-mono text-xs">{d.ip}</td>
                      <td className="py-2 text-gray-500">{formatDate(d.downloadedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No downloads yet</p>
          )}
        </div>
      </div>
    </div>
  )
}
