export const cleanLectureTitle = (t: string) => t.replace(/^\[LECTURE\]\[\d+\]\s*/, '').trim()

// Файл из тела-JSON приложения приходит как "<url>#<имя>" (или битые легаси-строки).
// Приводим к единому виду вложения сайта: 📎 [имя](url).
export const fileEntryToLink = (entry: any): string => {
  if (typeof entry !== 'string' || !entry.trim()) return ''
  if (/^https?:\/\//i.test(entry)) {
    const hash = entry.indexOf('#')
    if (hash !== -1) {
      const url = entry.slice(0, hash)
      let name = entry.slice(hash + 1)
      try { name = decodeURIComponent(name) } catch {}
      return `📎 [${name}](${url})`
    }
    return entry // голый URL — renderBody сам оформит
  }
  // Не-URL (легаси/битые данные): показываем только имя, без сырого JSON
  return entry.split('\n').pop()?.trim() || ''
}

// Понимает оба формата тела поста: текст сайта (📎-ссылки) и JSON приложения
// {content, files:[...]}. Никогда не возвращает сырой JSON.
export const getFullBody = (p: { body?: string } | null | undefined): string => {
  const raw = p?.body || ''
  try {
    const b = JSON.parse(raw)
    if (b && typeof b === 'object') {
      let text = (typeof b.content === 'string' ? b.content : (b.description || '')) || ''
      const files = Array.isArray(b.files) ? b.files : []
      if (files.length) {
        const links = files.map(fileEntryToLink).filter(Boolean).join('\n')
        if (links) text = text ? `${text}\n\n${links}` : links
      }
      return text
    }
    return raw
  } catch { return raw }
}
