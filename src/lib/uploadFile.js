/**
 * Upload a File to Vercel Blob via the server-side put() endpoint.
 *
 * Sends the raw file body to /api/upload with filename in a header.
 * The server streams it directly to Vercel Blob storage.
 *
 * @param {File} file — the File object from an <input> or drag-and-drop
 * @returns {Promise<{ url: string, pathname: string }>}
 */
export async function uploadFile(file) {
  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: {
      'content-type': file.type || 'application/octet-stream',
      'x-filename': file.name,
    },
    body: file,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(err.error || `Upload failed: ${res.status}`);
  }

  return res.json();
}
