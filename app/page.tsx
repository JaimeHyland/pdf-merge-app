'use client'

import React, { useState } from 'react'
import { PDFDocument } from 'pdf-lib'

export default function HomePage() {
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null)
  const [files, setFiles] = useState<File[]>([]) 

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const newFiles = e.target.files ? Array.from(e.target.files) : []

    // Filter only PDFs
    const pdfFiles = newFiles.filter(file => file.type === 'application/pdf')

    if (pdfFiles.length < newFiles.length) {
      alert('Only PDF files are allowed. Non-PDF files have been ignored.')
    }

    setFiles(prev => [...prev, ...pdfFiles])
  }

  function moveFile(index: number, direction: 'up' | 'down') {
    setFiles(prev => {
      const updated = [...prev]
      const newIndex = direction === 'up' ? index - 1 : index + 1
      if (newIndex < 0 || newIndex >= updated.length) return prev
      const [moved] = updated.splice(index, 1)
      updated.splice(newIndex, 0, moved)
      return updated
    })
  }

  function removeFile(index: number) {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  async function mergePdfs(event: React.FormEvent) {
    event.preventDefault()

    if (files.length < 2) {
      alert('Please select at least two PDF files.')
      return
    }

    const mergedPdf = await PDFDocument.create()

    for (const file of files) {
      const bytes = await file.arrayBuffer()
      const pdf = await PDFDocument.load(bytes)
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
      copiedPages.forEach(page => mergedPdf.addPage(page))
    }

    const mergedPdfBytes = await mergedPdf.save()
    const blob = new Blob([new Uint8Array(mergedPdfBytes)], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    setMergedPdfUrl(url)
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <h1 className="text-3xl font-bold mb-8">PDF Merger</h1>

      <form onSubmit={mergePdfs} className="flex flex-col items-center space-y-4 w-full max-w-md">
        <input
          id="file-upload"
          type="file"
          accept="application/pdf"
          multiple
          onChange={handleFileUpload}
          className="file:bg-blue-600 file:text-white file:px-4 file:py-2 rounded w-full"
        />

        {files.length > 0 && (
          <ul className="w-full bg-white shadow rounded-lg p-4 space-y-2">
            {files.map((file, i) => (
              <li
                key={i}
                className="flex justify-between items-center border rounded px-3 py-2"
              >
                <span className="truncate w-2/3">{file.name}</span>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => moveFile(i, 'up')}
                    disabled={i === 0}
                    className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-40"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveFile(i, 'down')}
                    disabled={i === files.length - 1}
                    className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-40"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <button
          type="submit"
          disabled={files.length < 2}
          className={`rounded px-6 py-2 w-full font-medium transition ${
            files.length < 2
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
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
            setTimeout(() => URL.revokeObjectURL(mergedPdfUrl), 100)
          }}
        >
          Save merged PDF
        </a>
      )}
    </main>
  )
}
