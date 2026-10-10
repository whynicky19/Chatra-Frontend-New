export type DocKind = 'image' | 'pdf' | 'docx' | 'office' | 'text' | 'unsupported'

export const extOf = (name: string) => name.split('.').pop()?.toLowerCase().split('?')[0] || ''

export const kindOf = (name: string | undefined | null): DocKind => {
  const ext = extOf(name || '')
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg'].includes(ext)) return 'image'
  if (ext === 'pdf') return 'pdf'
  if (ext === 'docx') return 'docx'
  // Binary Office files are converted by LibreOffice on the backend. This
  // avoids parsing attacker-controlled XLS/XLSX in an unpatched client parser.
  if (['ppt', 'pptx', 'doc', 'rtf', 'xls', 'xlsx'].includes(ext)) return 'office'
  if (['txt', 'md', 'csv'].includes(ext)) return 'text'
  return 'unsupported'
}
