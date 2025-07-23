'use client'

import { useState } from 'react'
import { PDFDocument } from 'pdf-lib'

export default function HomePage() {
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null)

  async function mergePdfs(event: React.FormEvent) {
    event.preventDefault()
    const input = document.getElementById('file-upload') as HTMLInputElement
    if (!input.files || input.files.length < 2) {
      alert('Please select at least two PDF files.')
      return
    }

    const mergedPdf = await PDFDocument.create()

    for (const file of input.files) {
      const bytes = await file.arrayBuffer()
      const pdf = await PDFDocument.load(bytes)
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
      copiedPages.forEach(page => mergedPdf.addPage(page))
    }

    const mergedPdfBytes = await mergedPdf.save()
    const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    setMergedPdfUrl(url)
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <h1 className="text-3xl font-bold mb-8">PDF Merger</h1>

      <form onSubmit={mergePdfs} className="flex flex-col items-center space-y-4">
        <input
          id="file-upload"
          type="file"
          accept="application/pdf"
          multiple
          className="file:bg-blue-600 file:text-white file:px-4 file:py-2 rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white rounded px-6 py-2"
        >
          Merge PDFs
        </button>
      </form>

      {mergedPdfUrl && (
        <a
          href={mergedPdfUrl}
          download="merged.pdf"
          className="mt-6 text-blue-600 underline"
          onClick={() => {
            // Revoke URL after download to free memory
            setTimeout(() => URL.revokeObjectURL(mergedPdfUrl), 100)
          }}
        >
          Download Merged PDF
        </a>
      )}
    </main>
  )
}
