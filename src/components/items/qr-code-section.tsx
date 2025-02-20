"use client"

import { useState, useEffect, useRef } from "react"
import { QRCodeSVG } from "qrcode.react"

interface QRCodeData {
  id: string
  url: string
  isActive: boolean
  createdAt: string
}

interface QRCodeSectionProps {
  itemId: string
}

type QRCodeRefs = {
  [key: string]: SVGSVGElement | null
}

export function QRCodeSection({ itemId }: QRCodeSectionProps) {
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const qrCodeRefs = useRef<QRCodeRefs>({})

  const fetchQRCodes = async () => {
    try {
      const response = await fetch(`/api/items/${itemId}/qr-code`)
      if (!response.ok) {
        throw new Error("Failed to fetch QR codes")
      }
      const data = await response.json()
      setQrCodes(data)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to load QR codes")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQRCodes()
  }, [itemId])

  const handleGenerateQRCode = async () => {
    setGenerating(true)
    setError(null)

    try {
      const response = await fetch(`/api/items/${itemId}/qr-code`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to generate QR code")
      }

      const newQRCode = await response.json()
      setQrCodes((prev) => [newQRCode, ...prev])
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to generate QR code")
    } finally {
      setGenerating(false)
    }
  }

  const downloadQRCode = (qrCode: QRCodeData) => {
    const svg = qrCodeRefs.current[qrCode.id]
    if (!svg) return

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const img = new Image()
    
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      
      const pngFile = canvas.toDataURL("image/png")
      const downloadLink = document.createElement("a")
      downloadLink.download = `qr-code-${qrCode.id}.png`
      downloadLink.href = pngFile
      downloadLink.click()
    }

    img.src = "data:image/svg+xml;base64," + btoa(svgData)
  }

  if (loading) {
    return <div>Loading QR codes...</div>
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">QR Codes</h3>
        <button
          onClick={handleGenerateQRCode}
          disabled={generating}
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
        >
          {generating ? "Generating..." : "Generate QR Code"}
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {qrCodes.map((qrCode) => (
          <div
            key={qrCode.id}
            className="relative bg-white p-4 shadow rounded-lg border border-gray-200"
          >
            <div className="flex justify-center mb-4">
              <QRCodeSVG
                ref={(el: SVGSVGElement | null) => (qrCodeRefs.current[qrCode.id] = el)}
                value={qrCode.url}
                size={200}
                level="H"
                includeMargin
              />
            </div>
            <div className="text-sm text-gray-500 text-center">
              <p>Created: {new Date(qrCode.createdAt).toLocaleDateString()}</p>
              <p className="mt-1">
                Status:{" "}
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    qrCode.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {qrCode.isActive ? "Active" : "Inactive"}
                </span>
              </p>
            </div>
            <div className="mt-4 flex justify-center space-x-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(qrCode.url)
                }}
                className="text-sm text-indigo-600 hover:text-indigo-900"
              >
                Copy URL
              </button>
              <button
                onClick={() => downloadQRCode(qrCode)}
                className="text-sm text-indigo-600 hover:text-indigo-900"
              >
                Download
              </button>
            </div>
          </div>
        ))}
      </div>

      {qrCodes.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">No QR codes generated yet</p>
        </div>
      )}
    </div>
  )
} 