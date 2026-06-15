import { Download, FileArchive, Globe, ToggleLeft, FolderOpen, CheckCircle, Shield, Chrome, ShieldCheck } from "lucide-react"
import { EXTENSION_VERSIONS, EXTENSION_LATEST_VERSION, EXTENSION_STEPS, EXTENSION_PERMISSIONS, EXTENSION_MIN_BROWSER_VERSION } from "@/constants"
import DownloadButton from "@/components/extension/DownloadButton"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Install AegisCore Extension | Chrome Browser Security Guard",
  description:
    "Step-by-step guide to install the AegisCore Security Guard Chrome extension. Get real-time phishing, malware, and URL protection while browsing.",
  openGraph: {
    title: "Install AegisCore Browser Extension",
    description: "Protect your browsing with real-time threat detection. Free Chrome extension.",
    url: "/install-extension",
    siteName: "AegisCore",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Install AegisCore Browser Extension",
    description: "Protect your browsing with real-time threat detection. Free Chrome extension.",
  },
  other: {
    "application/ld+json": JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "AegisCore Security Guard",
      applicationCategory: "SecurityApplication",
      operatingSystem: "Chrome OS, Windows, macOS, Linux",
      browserRequirements: `Requires ${EXTENSION_MIN_BROWSER_VERSION}+`,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      version: EXTENSION_LATEST_VERSION,
    }),
  },
}

const STEPS = [
  { icon: Download, title: EXTENSION_STEPS[0].title, desc: EXTENSION_STEPS[0].description },
  { icon: FileArchive, title: EXTENSION_STEPS[1].title, desc: EXTENSION_STEPS[1].description },
  { icon: Globe, title: EXTENSION_STEPS[2].title, desc: EXTENSION_STEPS[2].description },
  { icon: ToggleLeft, title: EXTENSION_STEPS[3].title, desc: EXTENSION_STEPS[3].description },
  { icon: FolderOpen, title: EXTENSION_STEPS[4].title, desc: EXTENSION_STEPS[4].description },
  { icon: CheckCircle, title: EXTENSION_STEPS[5].title, desc: EXTENSION_STEPS[5].description },
  { icon: Shield, title: EXTENSION_STEPS[6].title, desc: EXTENSION_STEPS[6].description },
]

function StepCard({ icon: Icon, title, desc, step, isLast }: {
  icon: typeof Download
  title: string
  desc: string
  step: number
  isLast: boolean
}) {
  return (
    <div className="relative flex gap-6">
      <div className="flex flex-col items-center">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        {!isLast && <div className="mt-2 h-full w-px bg-gradient-to-b from-primary/30 to-transparent" />}
      </div>
      <div className="pb-12">
        <div className="flex items-center gap-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
            {step}
          </span>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-gray-400" dangerouslySetInnerHTML={{ __html: desc }} />
      </div>
    </div>
  )
}

function PermissionTag({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-gray-300">
      {label}
    </span>
  )
}

export default function InstallExtensionPage() {
  const ext = EXTENSION_VERSIONS[EXTENSION_LATEST_VERSION]

  return (
    <div className="min-h-screen bg-[#0A0C16]">
      <main className="mx-auto max-w-3xl px-4 py-20">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-4xl font-bold text-transparent">
            Install AegisCore Extension
          </h1>
          <p className="mt-3 text-gray-500">
            Add real-time security protection to your Chrome browser in minutes
          </p>
        </div>

        {/* Download Section */}
        <section className="mb-16 rounded-xl border border-white/10 bg-white/5 p-8 text-center">
          <h2 className="mb-2 text-xl font-semibold text-white">Step 1: Download</h2>
          <p className="mb-6 text-sm text-gray-500">
            Get the latest version of the AegisCore Security Guard extension
          </p>
          <DownloadButton extension={ext} />

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-gray-600">Requires:</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-gray-300">
              {EXTENSION_MIN_BROWSER_VERSION}+
            </span>
            {EXTENSION_PERMISSIONS.map((p) => (
              <PermissionTag key={p} label={p} />
            ))}
          </div>
        </section>

        {/* Installation Steps */}
        <section className="mb-16">
          <h2 className="mb-8 text-center text-xl font-semibold text-white">Installation Guide</h2>
          <div className="rounded-xl border border-white/10 bg-white/5 p-8">
            {STEPS.map((step, i) => (
              <StepCard key={i} {...step} step={i + 1} isLast={i === STEPS.length - 1} />
            ))}
          </div>
        </section>

        {/* Chrome Extension v{EXTENSION_LATEST_VERSION} */}
        <section className="mb-16 rounded-xl border border-white/10 bg-white/5 p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Chrome className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Chrome Extension v{EXTENSION_LATEST_VERSION}</h2>
              <p className="text-sm text-gray-500">Real-Time Browser Protection</p>
            </div>
          </div>
          <p className="mb-6 text-sm leading-relaxed text-gray-400">
            Detect phishing sites, malicious domains, and unsafe URLs before they load.
            AegisCore Security Guard integrates directly into your Chrome browser.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["Automatic URL scanning on every page load", ShieldCheck],
              ["Security warning overlays for dangerous sites", ShieldCheck],
              ["Desktop threat notifications", ShieldCheck],
              ["Right-click context menu for instant scans", ShieldCheck],
              ["Email phishing & breach checking on the fly", ShieldCheck],
            ].map(([text, Icon]) => (
              <div key={text as string} className="flex items-center gap-2 text-sm text-gray-400">
                <Icon className="h-4 w-4 shrink-0 text-primary" />
                {text as string}
              </div>
            ))}
          </div>
        </section>

        {/* Troubleshooting */}
        <section className="mb-16 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-6">
          <h2 className="mb-3 text-lg font-semibold text-yellow-400">Troubleshooting</h2>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>
              <strong className="text-gray-300">Extension not loading?</strong> Make sure Developer Mode is enabled and the
              folder contains the extracted files.
            </li>
            <li>
              <strong className="text-gray-300">Can&apos;t find the extension icon?</strong> Click the puzzle piece icon in
              your toolbar and pin AegisCore.
            </li>
            <li>
              <strong className="text-gray-300">Need an update?</strong> Download the latest ZIP, extract, and use
              &quot;Update&quot; on the extensions page.
            </li>
          </ul>
        </section>

        {/* Features Checklist */}
        <section className="rounded-xl border border-green-500/20 bg-green-500/5 p-6">
          <h2 className="mb-4 text-lg font-semibold text-green-400">What You Get</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              "Real-time URL phishing detection",
              "Malicious site warnings",
              "Website security scanning",
              "Email phishing analysis",
              "Breach exposure checking",
              "Right-click context menu scans",
              "Desktop threat notifications",
              "Customizable whitelist",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-sm text-gray-400">
                <CheckCircle className="h-4 w-4 shrink-0 text-green-500" />
                {feature}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
