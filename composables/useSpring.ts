export type SpringConfig = {
  damping: number
  response: number
}

export type SpringOptions = SpringConfig & {
  from?: number
  to: number
  initialVelocity?: number
  onUpdate?: (value: number, velocity: number) => void
  onRest?: () => void
  precision?: number
  hardStop?: boolean
}

export type SpringHandle = {
  stop: () => void
  set: (target: number) => void
  setVelocity: (v: number) => void
  jumpTo: (value: number) => void
  isRunning: () => boolean
}

/**
 * Critically-damped-ish spring with a true second-order solver.
 *
 * Modeling notes (matches Apple's "Designing Fluid Interfaces"):
 *   - `damping` is the *damping ratio* (1.0 = critically damped, no overshoot;
 *     < 1.0 = under-damped, overshoots). Apple's house style: 1.0 default,
 *     0.7–0.85 for momentum-driven reveals.
 *   - `response` is the *settle time* in seconds — how quickly the value
 *     reaches the target. NOT a duration; the actual time-to-rest emerges
 *     from the solver and is usually 2.5–3× the response for non-critical
 *     damping.
 *
 * The solver is a semi-implicit Euler on a damped harmonic oscillator.
 * semi-implicit is what UIAnimation / Core Animation use — it's stable for
 * stiff springs (low response) and conserves energy, so reversals feel
 * continuous instead of snapping.
 */
export function createSpring(opts: SpringOptions): SpringHandle {
  const precision = opts.precision ?? 0.0005
  const response = Math.max(0.0001, opts.response)
  const damping = Math.max(0, opts.damping)

  let value = opts.from ?? opts.to
  let target = opts.to
  let velocity = opts.initialVelocity ?? 0

  let raf = 0
  let lastT = 0
  let resting = false
  let restingCb: (() => void) | null = null

  // Convert (damping ratio, response) to (stiffness, damping coefficient).
  // response ≈ 1 / sqrt(stiffness)  →  stiffness = 1 / response²
  // critical damping coefficient = 2·sqrt(stiffness·mass) with mass=1
  // actual damping = ratio · critical
  const stiffness = 1 / (response * response)
  const criticalDamping = 2 * Math.sqrt(stiffness)
  const dampingCoeff = damping * criticalDamping

  const step = (now: number) => {
    if (!lastT) lastT = now
    // Clamp dt to avoid huge jumps after tab-switch
    const dt = Math.min(0.064, (now - lastT) / 1000)
    lastT = now

    // semi-implicit Euler: update velocity first, then position.
    // This is the key trick that keeps the spring stable at any stiffness.
    const accel = -stiffness * (value - target) - dampingCoeff * velocity
    velocity += accel * dt
    value += velocity * dt

    opts.onUpdate?.(value, velocity)

    const isAtRest =
      Math.abs(value - target) < precision &&
      Math.abs(velocity) < precision

    if (isAtRest) {
      value = target
      velocity = 0
      resting = true
      opts.onUpdate?.(value, velocity)
      restingCb = opts.onRest ?? null
      restingCb?.()
      return
    }

    raf = requestAnimationFrame(step)
  }

  const start = () => {
    lastT = 0
    resting = false
    if (raf) cancelAnimationFrame(raf)
    raf = requestAnimationFrame(step)
  }

  // If we start *exactly* at the target with no velocity, fire onRest once.
  if (
    value === target &&
    (opts.initialVelocity ?? 0) === 0
  ) {
    queueMicrotask(() => opts.onRest?.())
  } else {
    start()
  }

  return {
    stop() {
      if (raf) cancelAnimationFrame(raf)
      raf = 0
    },
    set(newTarget: number) {
      // New target → keep current value & velocity. This is what makes
      // the spring interruptible: a mid-flight re-target does not snap.
      target = newTarget
      if (resting) {
        resting = false
        start()
      }
    },
    setVelocity(v: number) {
      velocity = v
      if (resting) {
        resting = false
        start()
      }
    },
    jumpTo(v: number) {
      // Hard-set without animating. Use this when a layout change moves
      // the element and the spring should pick up from the new presentation
      // value (rather than from a stale logical value).
      value = v
      velocity = 0
      lastT = 0
      opts.onUpdate?.(value, velocity)
    },
    isRunning() {
      return raf !== 0
    },
  }
}

/**
 * Reduced-motion fallback: just snap to the target on the next frame.
 * Returns a no-op handle that satisfies the same interface.
 */
export function createReducedMotionSpring(opts: {
  to: number
  onUpdate?: (value: number, velocity: number) => void
  onRest?: () => void
}): SpringHandle {
  const fire = () => {
    opts.onUpdate?.(opts.to, 0)
    opts.onRest?.()
  }
  // Run async so it composes with normal lifecycle hooks.
  queueMicrotask(fire)
  return {
    stop() {},
    set() {},
    setVelocity() {},
    jumpTo() {},
    isRunning() {
      return false
    },
  }
}

/**
 * Apply a spring to a single CSS transform axis on an element.
 * Convenience wrapper for the most common case (translateX, translateY, scale…).
 */
export function springTo(
  el: HTMLElement,
  axis: 'x' | 'y' | 'scale' | 'opacity' | 'rotate',
  target: number,
  config: SpringConfig,
  opts: { initialVelocity?: number; fromPresentation?: boolean; opacityUnit?: false } = {},
): SpringHandle {
  // Read the current on-screen value so the spring starts from the live
  // presentation, not from a stale logical value. This is the §3 rule.
  let from: number
  if (opts.fromPresentation) {
    const m = new DOMMatrixReadOnly(getComputedStyle(el).transform || 'none')
    from = axis === 'x' ? m.m41 : axis === 'y' ? m.m42 : Number(getComputedStyle(el).opacity)
  } else {
    from = parseFloat(getComputedStyle(el)[axis === 'x' ? 'translate' : axis === 'y' ? 'translate' : axis === 'opacity' ? 'opacity' : 'scale'] as any) || 0
  }
  // We rely on the caller wiring this; for safety default to the same as `to`.
  if (Number.isNaN(from)) from = target

  return createSpring({
    from,
    to: target,
    damping: config.damping,
    response: config.response,
    initialVelocity: opts.initialVelocity,
    onUpdate: (v) => {
      if (axis === 'x') el.style.translate = `${v}px 0`
      else if (axis === 'y') el.style.translate = `0 ${v}px`
      else if (axis === 'scale') el.style.scale = String(v)
      else if (axis === 'opacity') el.style.opacity = String(v)
      else el.style.rotate = `${v}deg`
    },
  })
}

/**
 * 1D damped scroll spring — used to project a scrollTop onto a target
 * with velocity-aware smoothing. Replaces the linear `scrollTop * k`
 * parallax that was here before.
 */
export function createScrollSpring(
  el: HTMLElement,
  axis: 'x' | 'y',
  config: SpringConfig,
): {
  setTarget: (target: number) => void
  stop: () => void
} {
  const handle = createSpring({
    from: 0,
    to: 0,
    damping: config.damping,
    response: config.response,
    onUpdate: (v) => {
      if (axis === 'y') el.style.translate = `0 ${-v}px`
      else el.style.translate = `${-v}px 0`
    },
  })
  return {
    setTarget(t: number) {
      handle.set(t)
    },
    stop() {
      handle.stop()
    },
  }
}
