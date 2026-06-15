export function getPdfViewerUrl(url: string): string {
  if (url.includes('docs.google.com') || url.includes('drive.google.com')) {
    return url
  }
  return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}`
}

export function getVideoEmbedUrl(url: string): string | null {
  const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/)
  if (youtubeMatch) return `https://www.youtube.com/embed/${youtubeMatch[1]}`

  const loomMatch = url.match(/loom\.com\/share\/([^?/]+)/)
  if (loomMatch) return `https://www.loom.com/embed/${loomMatch[1]}`

  return null
}
