import type { Highlight } from '~/composables/useHighlights'

// Выделение хранится как пара смещений в тексте «поверхности» (страница PDF,
// контейнер docx/txt/таблицы), а не как ссылка на узлы DOM: и текстовый слой
// pdf.js, и docx-preview пересобирают разметку при каждом рендере (смена
// страницы, зум, повторное открытие файла), поэтому любые ссылки на элементы
// живут только до следующей перерисовки. Смещения же воспроизводимы: один и
// тот же документ даёт один и тот же поток текста.

export const MARK_CLASS = 'hl-mark'

const SKIP_TAGS = new Set(['STYLE', 'SCRIPT', 'NOSCRIPT'])

const textNodesIn = (root: HTMLElement): Text[] => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      const parent = (node as Text).parentElement
      if (parent && SKIP_TAGS.has(parent.tagName)) return NodeFilter.FILTER_REJECT
      return (node as Text).data.length ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
    },
  })
  const out: Text[] = []
  let node: Node | null
  while ((node = walker.nextNode())) out.push(node as Text)
  return out
}

/** Абсолютное смещение граничной точки диапазона в тексте поверхности. */
const boundaryOffset = (nodes: Text[], container: Node, offset: number): number => {
  const point = document.createRange()
  point.setStart(container, offset)
  point.collapse(true)

  let total = 0
  for (const node of nodes) {
    // Узел целиком до границы (или кончается ровно на ней) — прибавляем длину.
    if (point.comparePoint(node, node.data.length) <= 0) { total += node.data.length; continue }
    // Дальше граница либо внутри этого узла, либо перед ним.
    if (node === container) return total + offset
    return total
  }
  return total
}

export interface SerializedRange { start: number; end: number; text: string }

/**
 * @param text читаемый текст фрагмента. По умолчанию берётся из самого Range,
 *   но у текстового слоя pdf.js строки лежат в отдельных узлах без пробелов
 *   между ними, поэтому вызывающий передаёт сюда текст выделения
 *   (Selection.toString()) — с переводами строк, как их видит пользователь.
 */
export const serializeRange = (root: HTMLElement, range: Range, text?: string): SerializedRange | null => {
  const visible = (text ?? range.toString()).trim()
  if (!visible) return null
  const nodes = textNodesIn(root)
  if (!nodes.length) return null

  const start = boundaryOffset(nodes, range.startContainer, range.startOffset)
  const end = boundaryOffset(nodes, range.endContainer, range.endOffset)
  if (end <= start) return null
  return { start, end, text: visible }
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Ищет фрагмент в тексте поверхности, выбирая вхождение, ближайшее к исходному
 * месту (один и тот же фрагмент может встречаться в документе не раз).
 * Если дословно не нашлось — сравниваем по словам: Range.toString() добавляет
 * переводы строк на <br> текстового слоя pdf.js, а в самих узлах их нет.
 */
const findNearest = (haystack: string, expected: string, near: number): [number, number] | null => {
  const hits: [number, number][] = []
  for (let i = haystack.indexOf(expected); i !== -1; i = haystack.indexOf(expected, i + 1)) {
    hits.push([i, expected.length])
  }
  if (!hits.length) {
    const words = expected.split(/\s+/).filter(Boolean).map(escapeRe)
    if (!words.length) return null
    const re = new RegExp(words.join('\\s*'), 'g')
    for (let m = re.exec(haystack); m; m = re.exec(haystack)) {
      hits.push([m.index, m[0].length])
      if (m.index === re.lastIndex) re.lastIndex++
    }
  }
  if (!hits.length) return null
  return hits.reduce((best, h) => (Math.abs(h[0] - near) < Math.abs(best[0] - near) ? h : best))
}

/**
 * Обратное преобразование: смещения → Range. Если текст по смещениям не сошёлся
 * с сохранённым (документ перерисован иначе), ищем сам фрагмент по тексту —
 * выделение переживает мелкие расхождения вместо того, чтобы просто пропасть.
 */
export const restoreRange = (root: HTMLElement, start: number, end: number, expected?: string): Range | null => {
  const nodes = textNodesIn(root)
  if (!nodes.length) return null

  const build = (from: number, to: number): Range | null => {
    let acc = 0
    let startNode: Text | null = null, startOff = 0
    let endNode: Text | null = null, endOff = 0
    for (const node of nodes) {
      const len = node.data.length
      if (!startNode && from < acc + len) { startNode = node; startOff = from - acc }
      if (startNode && to <= acc + len) { endNode = node; endOff = to - acc; break }
      acc += len
    }
    if (!startNode || !endNode) return null
    const range = document.createRange()
    try {
      range.setStart(startNode, Math.max(0, Math.min(startOff, startNode.data.length)))
      range.setEnd(endNode, Math.max(0, Math.min(endOff, endNode.data.length)))
    } catch { return null }
    return range.collapsed ? null : range
  }

  // Пробелы игнорируем: переводы строк есть в сохранённом тексте выделения,
  // но не в самих текстовых узлах (см. serializeRange).
  const squash = (s: string) => s.replace(/\s+/g, '')
  const direct = build(start, end)
  if (!expected || (direct && squash(direct.toString()) === squash(expected))) return direct

  const hit = findNearest(nodes.map(n => n.data).join(''), expected, start)
  if (!hit) return direct
  return build(hit[0], hit[0] + hit[1])
}

/** Снимает ранее нарисованные подсветки, возвращая текст в исходный вид. */
export const clearMarks = (root: HTMLElement) => {
  root.querySelectorAll(`.${MARK_CLASS}`).forEach(mark => {
    const parent = mark.parentNode
    if (!parent) return
    while (mark.firstChild) parent.insertBefore(mark.firstChild, mark)
    parent.removeChild(mark)
  })
  root.normalize()
}

const wrapRange = (root: HTMLElement, range: Range, hl: Highlight) => {
  const targets = textNodesIn(root)
    .filter(node => range.intersectsNode(node))
    .map(node => ({
      node,
      from: node === range.startContainer ? range.startOffset : 0,
      to: node === range.endContainer ? range.endOffset : node.data.length,
    }))
    .filter(t => t.to > t.from)

  for (const { node, from, to } of targets) {
    let target = node
    // Границы считаем до разрезания: splitText двигает границы живого Range.
    if (to < target.data.length) target.splitText(to)
    if (from > 0) target = target.splitText(from)
    const mark = document.createElement('mark')
    mark.className = `${MARK_CLASS} hl-${hl.color}`
    mark.dataset.hlId = hl.id
    if (hl.note) mark.dataset.hlNote = '1'
    target.parentNode?.insertBefore(mark, target)
    mark.appendChild(target)
  }
}

/** Перерисовывает подсветки поверхности с нуля. */
export const paintHighlights = (root: HTMLElement, list: Highlight[]) => {
  clearMarks(root)
  for (const hl of list) {
    const range = restoreRange(root, hl.start, hl.end, hl.text)
    if (range) wrapRange(root, range, hl)
  }
}
