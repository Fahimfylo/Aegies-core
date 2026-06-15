import mongoose from "mongoose"

const DownloadRecordSchema = new mongoose.Schema(
  {
    version: { type: String, required: true },
    ip: { type: String, required: true },
    userAgent: { type: String, default: "" },
    referrer: { type: String, default: "" },
  },
  { timestamps: true }
)

DownloadRecordSchema.index({ createdAt: -1 })
DownloadRecordSchema.index({ createdAt: -1, version: 1 })

export interface IDownloadRecord {
  _id: string
  version: string
  ip: string
  userAgent: string
  referrer: string
  createdAt: Date
  updatedAt: Date
}

export const DownloadRecord =
  mongoose.models.DownloadRecord || mongoose.model("DownloadRecord", DownloadRecordSchema)
