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

/**
 * Абсолютное смещение граничной точки диапазона в тексте поверхности.
 * Возвращает null, если граница вообще не лежит в собранных текстовых узлах
 * (например попала в плавающее меню или другой чужой узел): раньше такой
 * случай тихо давал offset = длина всего текста, и пометка сохранялась
 * битой — не находила себя потом ни на сайте, ни в приложении.
 */
const boundaryOffset = (nodes: Text[], container: Node, offset: number): number | null => {
  const point = document.createRange()
  try {
    point.setStart(container, offset)
  } catch {
    return null
  }
  point.collapse(true)

  let total = 0
  for (const node of nodes) {
    let cmp: number
    try {
      cmp = point.comparePoint(node, node.data.length)
    } catch {
      continue
    }
    // Узел целиком до границы (или кончается ровно на ней) — прибавляем длину.
    if (cmp <= 0) { total += node.data.length; continue }
    // Дальше граница либо внутри этого узла, либо перед ним.
    if (node === container) return total + offset
    return total
  }
  // Граница после всех узлов поверхности или внутри постороннего поддерева.
  return container.nodeType === Node.TEXT_NODE && nodes.includes(container as Text)
    ? nodes.reduce((acc, n) => acc + n.data.length, 0)
    : null
}

export interface SerializedRange {
  start: number
  end: number
  text: string
  /** Текст вокруг фрагмента — якорь на случай, если смещения не сойдутся. */
  prefix: string
  suffix: string
}

// Длина якоря: достаточно, чтобы отличить одинаковые фразы в разных местах
// документа, и достаточно мало, чтобы не хранить полстраницы на выделение.
const ANCHOR_CHARS = 60

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
  // null = граница вне текста поверхности (меню и т.п.) — такую пометку не сохраняем.
  if (start == null || end == null || end <= start) return null

  return { start, end, text: visible, ...anchorAround(nodes, start, end) }
}

/**
 * Текст вокруг фрагмента для якоря — из «читаемого» вида поверхности, где
 * соседние узлы разделены переводом строки.
 *
 * Смещения (start/end) считаются по узлам, склеенным подряд, и такими обязаны
 * остаться — иначе они разъедутся с restoreRange. А вот в якорь склейку
 * тащить нельзя: строка pdf.js и ячейка таблицы docx — отдельные узлы без
 * пробелов между ними, и якорь получался вида «Алёна45/100Помазков». В
 * приложении тот же текст приходит от PDFium с пробелами, и такой якорь там не
 * найдётся уже никогда. Лишний пробел, наоборот, безобиден: сравнение всюду
 * идёт без учёта пробелов (см. squashIndexed).
 */
const anchorAround = (nodes: Text[], start: number, end: number) => {
  let plain = 0
  let readable = ''
  let from = 0, to = 0
  for (const node of nodes) {
    if (start >= plain && start <= plain + node.data.length) from = readable.length + (start - plain)
    if (end >= plain && end <= plain + node.data.length) to = readable.length + (end - plain)
    readable += `${node.data}\n`
    plain += node.data.length
  }
  return {
    prefix: readable.slice(Math.max(0, from - ANCHOR_CHARS), from),
    suffix: readable.slice(to, to + ANCHOR_CHARS),
  }
}

export const squash = (s: string) => s.replace(/\s+/g, '')

/** Текст поверхности без пробелов + карта «символ → смещение в оригинале». */
interface Squashed { text: string; map: number[] }

// Весь поиск идёт по тексту БЕЗ пробелов. Пробелы — единственное, в чём
// рендереры расходятся всегда: pdf.js держит строку в отдельном узле без
// разделителя, PDFium в приложении ставит перенос, docx-preview — ячейку
// таблицы. Сравнивая без них, мы находим фрагмент независимо от того, кто и
// чем рисовал документ, а карта возвращает найденное обратно в смещения
// исходного текста поверхности.
const squashIndexed = (s: string): Squashed => {
  let text = ''
  const map: number[] = []
  for (let i = 0; i < s.length; i++) {
    if (/\s/.test(s[i])) continue
    text += s[i]
    map.push(i)
  }
  return { text, map }
}

/** Смещения в сжатом тексте → диапазон [начало, конец) в исходном. */
const toOriginal = (hay: Squashed, from: number, to: number): [number, number] =>
  [hay.map[from], hay.map[to - 1] + 1]

const hitsOf = (haystack: string, needle: string): number[] => {
  const out: number[] = []
  if (!needle) return out
  for (let i = haystack.indexOf(needle); i !== -1; i = haystack.indexOf(needle, i + 1)) out.push(i)
  return out
}

/**
 * Поиск по якорю TextQuoteSelector: prefix + сам фрагмент + suffix. Якорь
 * различает одинаковые фразы в разных местах документа. Если целиком не
 * сошёлся (фрагмент у края страницы, сосед перерисован иначе) — пробуем
 * половинками, это всё равно точнее, чем один голый текст.
 */
const findAnchored = (
  hay: Squashed,
  expected: string,
  anchor?: { prefix?: string; suffix?: string },
): [number, number] | null => {
  const body = squash(expected)
  const prefix = squash(anchor?.prefix || '')
  const suffix = squash(anchor?.suffix || '')
  if (!body || (!prefix && !suffix)) return null

  for (const [head, tail] of [[prefix, suffix], [prefix, ''], ['', suffix]]) {
    if (!head && !tail) continue
    const at = hitsOf(hay.text, head + body + tail)[0]
    if (at == null) continue
    return toOriginal(hay, at + head.length, at + head.length + body.length)
  }
  return null
}

/**
 * Ищет сам фрагмент, выбирая вхождение, ближайшее к исходному месту: один и
 * тот же текст может встречаться в документе не раз, а якорь мог не сойтись.
 */
const findNearest = (hay: Squashed, expected: string, near: number): [number, number] | null => {
  const body = squash(expected)
  const hits = hitsOf(hay.text, body)
  if (!hits.length) return null
  const best = hits.reduce((b, i) => (Math.abs(hay.map[i] - near) < Math.abs(hay.map[b] - near) ? i : b))
  return toOriginal(hay, best, best + body.length)
}

/**
 * Обратное преобразование: смещения → Range. Если текст по смещениям не сошёлся
 * с сохранённым (документ перерисован иначе), ищем сам фрагмент по тексту —
 * выделение переживает мелкие расхождения вместо того, чтобы просто пропасть.
 */
export const restoreRange = (
  root: HTMLElement,
  start: number,
  end: number,
  expected?: string,
  anchor?: { prefix?: string; suffix?: string },
): Range | null => {
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
  const direct = build(start, end)
  if (!expected || (direct && squash(direct.toString()) === squash(expected))) return direct

  const hay = squashIndexed(nodes.map(n => n.data).join(''))

  // Сначала по якорю «текст до + фрагмент + текст после»: он различает
  // одинаковые фразы в разных местах документа надёжнее, чем близость к
  // прежнему смещению (на другом устройстве смещение может уехать сильно).
  const anchored = findAnchored(hay, expected, anchor)
  if (anchored) return build(anchored[0], anchored[1])

  const hit = findNearest(hay, expected, start)
  // Текста нет на этой поверхности вовсе — значит, выделение относится к другой
  // странице (или к другому документу). Рисовать его по исходным смещениям
  // нельзя: там лежит чужой текст, и пометка встала бы наугад не на своё место.
  if (!hit) return null
  return build(hit[0], hit[1])
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
    mark.dataset.hlId = String(hl.id)
    if (hl.comment) mark.dataset.hlNote = '1'
    target.parentNode?.insertBefore(mark, target)
    mark.appendChild(target)
  }
}

/** Перерисовывает подсветки поверхности с нуля. */
export const paintHighlights = (root: HTMLElement, list: Highlight[]) => {
  clearMarks(root)
  for (const hl of list) {
    const range = restoreRange(root, hl.start_offset, hl.end_offset, hl.selected_text, hl)
    if (range) wrapRange(root, range, hl)
  }
}
