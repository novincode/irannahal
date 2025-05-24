import { MediaDeleteProvider } from "../delete"
import { uploadWithProgress } from "../upload"

export const cloudinaryDeleteProvider: MediaDeleteProvider = async (url) => {
    const publicId = extractCloudinaryPublicId(url)
    if (!publicId) return
    // Try both env vars for cloud name for flexibility
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET
    if (!cloudName || !apiKey || !apiSecret) {
        console.error('Cloudinary delete failed: Missing env vars', { cloudName, apiKey, apiSecret })
        return
    }
    const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload`;
    const body = new URLSearchParams()
    body.append('public_ids[]', publicId)
    const res = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
            Authorization: 'Basic ' + Buffer.from(`${apiKey}:${apiSecret}`).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
    })
    if (!res.ok) {
        console.error('Cloudinary delete failed:', res.status, await res.text())
    }
}


export function extractCloudinaryPublicId(url: string): string | null {
  // Example: https://res.cloudinary.com/demo/image/upload/v1234567890/folder/myimage.jpg
  // Should return: folder/myimage
  try {
    const parts = url.split("/upload/")
    if (parts.length < 2) return null
    let publicIdWithVersion = parts[1]
    // Remove version if present (e.g. v1234567890/)
    publicIdWithVersion = publicIdWithVersion.replace(/^v\d+\//, "")
    // Remove file extension
    return publicIdWithVersion.replace(/\.[a-zA-Z0-9]+$/, "")
  } catch {
    return null
  }
}


export async function uploadToCloudinary(
  file: File,
  options?: { preset?: string; resourceType?: string; onProgress?: (percent: number) => void }
): Promise<string> {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD;
  const preset = options?.preset || process.env.NEXT_PUBLIC_CLOUDINARY_PRESET;
  const resourceType = options?.resourceType || "image";
  if (!cloud) throw new Error("Cloudinary cloud name is missing in env");
  if (!preset) throw new Error("Cloudinary upload preset is missing in env");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", preset);

  const url = `https://api.cloudinary.com/v1_1/${cloud}/${resourceType}/upload`;
  const data = await uploadWithProgress(url, formData, { onProgress: options?.onProgress });
  return data.secure_url;
}