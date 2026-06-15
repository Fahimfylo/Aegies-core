import type { ExtensionVersion } from "@/types"

export const EXTENSION_LATEST_VERSION = "2.0.0"

export const EXTENSION_VERSIONS: Record<string, ExtensionVersion> = {
  "2.0.0": {
    version: "2.0.0",
    file: "extension-v2.0.0.zip",
    size: 12938,
    releaseDate: "2026-06-15T00:00:00.000Z",
    changelog: [
      "Added authentication with JWT token storage",
      "Added toolbar badge showing threat level",
      "Added right-click context menu for link/page scanning",
      "Added tabbed popup with Overview, Scanner, Email, Breach checks",
      "Added options/settings page with whitelist management",
      "Improved warning overlay with details link",
      "Added SVG icons for all sizes",
    ],
  },
}

export const EXTENSION_MIN_BROWSER_VERSION = "Chrome 109"
export const EXTENSION_PERMISSIONS = ["storage", "tabs", "webNavigation", "notifications", "contextMenus"]
export const EXTENSION_STEPS = [
  { step: 1, title: "Download the ZIP", description: "Click the download button above to get the extension package." },
  { step: 2, title: "Extract the ZIP", description: "Right-click the downloaded ZIP and select Extract All." },
  { step: 3, title: "Open Extensions Page", description: 'Type <code>chrome://extensions</code> in your address bar.' },
  { step: 4, title: "Enable Developer Mode", description: "Toggle Developer Mode in the top-right corner." },
  { step: 5, title: "Load Unpacked", description: "Click the Load Unpacked button that appears." },
  { step: 6, title: "Select Extension Folder", description: "Navigate to and select the extracted extension folder." },
  { step: 7, title: "Done!", description: "The AegisCore icon will appear in your toolbar." },
]
