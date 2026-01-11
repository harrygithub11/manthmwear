'use client'

import { useState, useRef } from 'react'
import { Upload, X, File, Image as ImageIcon, Paperclip } from 'lucide-react'

export interface Attachment {
  id: string
  filename: string
  contentType: string
  size: number
  data: string // base64
}

interface AttachmentUploadProps {
  attachments: Attachment[]
  onChange: (attachments: Attachment[]) => void
  maxSize?: number // in MB
  maxFiles?: number
}

export default function AttachmentUpload({ 
  attachments, 
  onChange,
  maxSize = 25,
  maxFiles = 10
}: AttachmentUploadProps) {
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    if (attachments.length + files.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`)
      return
    }

    const newAttachments: Attachment[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      if (file.size > maxSize * 1024 * 1024) {
        alert(`${file.name} exceeds maximum size of ${maxSize}MB`)
        continue
      }

      const reader = new FileReader()
      await new Promise((resolve) => {
        reader.onload = (e) => {
          const base64 = e.target?.result as string
          newAttachments.push({
            id: `${Date.now()}-${i}`,
            filename: file.name,
            contentType: file.type,
            size: file.size,
            data: base64.split(',')[1], // Remove data:image/png;base64, prefix
          })
          resolve(null)
        }
        reader.readAsDataURL(file)
      })
    }

    onChange([...attachments, ...newAttachments])
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragging(false)
  }

  const removeAttachment = (id: string) => {
    onChange(attachments.filter(a => a.id !== id))
  }

  const getFileIcon = (contentType: string) => {
    if (contentType.startsWith('image/')) return <ImageIcon className="w-5 h-5" />
    return <File className="w-5 h-5" />
  }

  return (
    <div className="space-y-3">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200 ${
          dragging 
            ? 'border-text-black bg-gray-50' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
      >
        <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
        <p className="font-bold text-sm mb-1">
          Drop files here or click to upload
        </p>
        <p className="text-xs text-gray-secondary">
          Max {maxSize}MB per file, up to {maxFiles} files
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          accept="*/*"
        />
      </div>

      {attachments.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-secondary">
            <Paperclip className="w-4 h-4" />
            <span>{attachments.length} Attachment{attachments.length !== 1 ? 's' : ''}</span>
          </div>
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center justify-between p-3 bg-gray-50 border border-gray-border rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="text-gray-600">
                  {getFileIcon(attachment.contentType)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{attachment.filename}</p>
                  <p className="text-xs text-gray-secondary">
                    {formatFileSize(attachment.size)}
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeAttachment(attachment.id)
                }}
                className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
