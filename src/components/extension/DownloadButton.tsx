"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Download, Loader2, CheckCircle, AlertCircle, Shield } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

type DownloadState = "idle" | "loading" | "success" | "error"

type ExtensionInfo = {
  version: string
  size: number
  releaseDate: string
}

export default function DownloadButton({ extension }: { extension: ExtensionInfo }) {
  const [state, setState] = useState<DownloadState>("idle")
  const [message, setMessage] = useState("")
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handleDownload = useCallback(async () => {
    if (!user) {
      router.push("/sign-up?redirect=/install-extension")
      return
    }

    setState("loading")
    setMessage("")

    try {
      const res = await fetch(`/api/extensions/download?version=${extension.version}`)

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Download failed" }))
        throw new Error(err.error || "Download failed")
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `aegiscore-extension-v${extension.version}.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setState("success")
      setMessage("Download started!")

      setTimeout(() => {
        router.push("/install-extension")
      }, 1500)
    } catch (err) {
      setState("error")
      setMessage(err instanceof Error ? err.message : "Something went wrong")
    }
  }, [extension.version, router, user])

  return (
    <div className="w-full max-w-md mx-auto">
      <button
        onClick={handleDownload}
        disabled={state === "loading"}
        className="w-full group relative overflow-hidden rounded-xl bg-gradient-to-br from-primary to-primary/80 p-[2px] transition-all hover:shadow-lg hover:shadow-primary/25 disabled:opacity-60"
      >
        <div className="flex items-center gap-4 rounded-[10px] bg-[#0A0C16] px-6 py-4 transition-all group-hover:bg-[#0F1120]">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            {state === "loading" ? (
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            ) : state === "success" ? (
              <CheckCircle className="h-6 w-6 text-green-500" />
            ) : state === "error" ? (
              <AlertCircle className="h-6 w-6 text-red-500" />
            ) : (
              <Shield className="h-6 w-6 text-primary" />
            )}
          </div>

          <div className="flex-1 text-left">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">
                {state === "loading"
                  ? "Preparing..."
                  : state === "success"
                    ? "Downloaded!"
                    : state === "error"
                      ? "Download failed"
                      : "Download Extension"}
              </span>
              <span className="rounded-md bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                v{extension.version}
              </span>
            </div>
            <div className="mt-0.5 text-xs text-gray-500">
              {formatSize(extension.size)} &middot; Updated {formatDate(extension.releaseDate)}
            </div>
          </div>

          <Download className="h-5 w-5 shrink-0 text-gray-400 transition-transform group-hover:translate-y-0.5" />
        </div>
      </button>

      {message && (
        <p
          className={`mt-2 text-center text-xs ${
            state === "error" ? "text-red-400" : "text-green-400"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  )
}
