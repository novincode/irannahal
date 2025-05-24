// Modular upload logic for media (default: Cloudinary, easily swappable)
export function uploadWithProgress(
  url: string,
  formData: FormData,
  options?: {
    method?: string;
    onProgress?: (percent: number) => void;
    headers?: Record<string, string>;
  }
): Promise<any> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(options?.method || "POST", url);
    if (options?.headers) {
      Object.entries(options.headers).forEach(([k, v]) => xhr.setRequestHeader(k, v));
    }
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && options?.onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100);
        options.onProgress(percent);
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText} - ${xhr.responseText}`));
      }
    };
    xhr.onerror = () => reject(new Error("Upload failed: network error"));
    xhr.send(formData);
  });
}



// You can add more providers here later (S3, UploadThing, etc.)
