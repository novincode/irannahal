import * as React from "react"
import { useDropzone } from "react-dropzone"
import { uploadToCloudinary } from "@actions/media/providers/cloudinary"
import { Progress } from "@ui/components/ui/progress"
import { FiUpload } from "react-icons/fi"

export interface UploadDropzoneProps {
  onDone: (urls: string[]) => void
  onUpload?: (file: File, progressCb: (percent: number) => void) => Promise<string>
  onError?: (error: unknown) => void
  children?: React.ReactNode
}

export type UploadLogicProps = Omit<UploadDropzoneProps, "children"> & {
  onProgress?: (percent: number) => void
}

export function useUpload({ onDone, onProgress, onUpload, onError }: UploadLogicProps) {
  const uploadFn = onUpload || ((file, progressCb) => uploadToCloudinary(file, { onProgress: progressCb }))
  const onDrop = React.useCallback(async (acceptedFiles: File[]) => {
    let completed = 0
    const total = acceptedFiles.length
    const urls: string[] = []
    if (onProgress) onProgress(5) // fake progress start
    try {
      for (const file of acceptedFiles) {
        await uploadFn(file, (percent) => {
          if (onProgress) {
            const overall = ((completed + percent / 100) / total) * 100
            onProgress(Math.max(5, Math.round(overall)))
          }
        })
          .then(url => {
            urls.push(url)
          })
        completed++
      }
      if (onProgress) onProgress(100)
      onDone(urls)
    } catch (err) {
      if (onError) onError(err)
      if (onProgress) onProgress(0)
    }
  }, [onDone, onProgress, uploadFn, onError])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })
  return { getRootProps, getInputProps, isDragActive }
}

export function UploadDropzone({ onDone, onUpload, onError, children }: UploadDropzoneProps) {
  const [progress, setProgress] = React.useState(0)
  const { getRootProps, getInputProps, isDragActive } = useUpload({
    onDone: (urls) => {
      setProgress(0) // Reset progress after upload is finished
      onDone(urls)
    },
    onProgress: setProgress,
    onUpload,
    onError
  })

  return (
    <div {...getRootProps()} className="border border-dashed hover:border-solid hover:bg-secondary/20 active:bg-secondary/60 p-4 rounded-lg text-center cursor-pointer flex flex-col items-center gap-2">
      <input {...getInputProps()} />
      <FiUpload size={32} className="mb-2 opacity-70" />
      {children ? children : (
        <span>{isDragActive ? "فایل‌ها را رها کنید..." : "فایل‌ها را بکشید و رها کنید یا کلیک کنید"}</span>
      )}
      {(progress > 0 && progress <= 100) && (
        <Progress value={progress} className="w-full mt-2" />
      )}
    </div>
  )
}
