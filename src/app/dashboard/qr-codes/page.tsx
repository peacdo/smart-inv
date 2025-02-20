"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { useEffect, useState } from "react"
import QRCode from "react-qr-code"
import { toDataURL } from "qrcode"

interface QRCodeData {
  id: string
  url: string
  isActive: boolean
  createdAt: string
  item: {
    id: string
    name: string
  }
}

export default function QRCodesPage() {
  const { data: session, status } = useSession()
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchQRCodes = async () => {
      try {
        const response = await fetch("/api/qr-codes")
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

    fetchQRCodes()
  }, [])

  const handleDelete = async (itemId: string, qrCodeId: string) => {
    if (!confirm("Are you sure you want to delete this QR code?")) {
      return
    }

    try {
      const response = await fetch(`/api/items/${itemId}/qr-code?qrCodeId=${qrCodeId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete QR code")
      }

      setQrCodes((prevCodes) => prevCodes.filter((code) => code.id !== qrCodeId))
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to delete QR code")
    }
  }

  const downloadQRCode = async (qrCode: QRCodeData) => {
    try {
      const dataUrl = await toDataURL(qrCode.url, {
        width: 200,
        margin: 1,
        errorCorrectionLevel: 'H'
      })
      
      const downloadLink = document.createElement("a")
      downloadLink.download = `qr-code-${qrCode.id}.png`
      downloadLink.href = dataUrl
      downloadLink.click()
    } catch (error) {
      console.error("Error generating QR code:", error)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">QR Codes</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all QR codes generated for inventory items.
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {qrCodes.map((qrCode) => (
          <div
            key={qrCode.id}
            className="relative bg-white p-4 shadow rounded-lg border border-gray-200"
          >
            <div className="flex justify-center mb-4">
              <QRCode
                value={qrCode.url}
                size={200}
                level="H"
              />
            </div>
            <div className="text-sm text-gray-500">
              <p className="font-medium text-gray-900">{qrCode.item.name}</p>
              <p className="mt-1">Created: {new Date(qrCode.createdAt).toLocaleDateString()}</p>
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
              <button
                onClick={() => handleDelete(qrCode.item.id, qrCode.id)}
                className="text-sm text-red-600 hover:text-red-900"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {qrCodes.length === 0 && (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">No QR codes found</p>
          </div>
        )}
      </div>
    </div>
  )
} 