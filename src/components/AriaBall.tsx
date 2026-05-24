'use client'
import { useEffect, useRef } from 'react'

type AriaState = 'idle' | 'listening' | 'thinking' | 'speaking'

interface AriaBallProps {
  state: AriaState
  size?: number
}

export default function AriaBall({ state, size = 200 }: AriaBallProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const timeRef = useRef(0)
  const blobPointsRef = useRef<any[]>([])

  useEffect(() => {
    const numPoints = 8
    blobPointsRef.current = Array.from({ length: numPoints }, (_, i) => ({
      angle: (i / numPoints) * Math.PI * 2,
      radius: 0.8 + Math.random() * 0.2,
      speed: 0.02 + Math.random() * 0.02,
      offset: Math.random() * Math.PI * 2,
    }))
    animate()
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  function getColors(state: AriaState) {
    switch (state) {
      case 'idle': return {
        c1: '#6366f1', c2: '#8b5cf6', c3: '#a78bfa',
        glow: 'rgba(99,102,241,0.4)', speed: 0.008
      }
      case 'listening': return {
        c1: '#10b981', c2: '#34d399', c3: '#6ee7b7',
        glow: 'rgba(16,185,129,0.5)', speed: 0.025
      }
      case 'thinking': return {
        c1: '#f59e0b', c2: '#fbbf24', c3: '#fcd34d',
        glow: 'rgba(245,158,11,0.5)', speed: 0.04
      }
      case 'speaking': return {
        c1: '#8b5cf6', c2: '#ec4899', c3: '#f472b6',
        glow: 'rgba(236,72,153,0.5)', speed: 0.02
      }
    }
  }

  function animate() {
    const canvas = canvasRef.current
    if (!canvas) { animRef.current = requestAnimationFrame(animate); return }
    const ctx = canvas.getContext('2d')
    if (!ctx) { animRef.current = requestAnimationFrame(animate); return }

    const { speed, c1, c2, c3, glow } = getColors(state)
    timeRef.current += speed

    const w = canvas.width
    const h = canvas.height
    const cx = w / 2
    const cy = h / 2
    const baseR = w * 0.28

    ctx.clearRect(0, 0, w, h)

    // Outer glow rings — Siri style
    for (let ring = 3; ring >= 1; ring--) {
      const ringR = baseR + ring * (w * 0.08)
      const alpha = 0.06 / ring
      const grad = ctx.createRadialGradient(cx, cy, baseR * 0.5, cx, cy, ringR)
      grad.addColorStop(0, glow.replace(')', `, ${alpha})`).replace('rgba(', 'rgba('))
      grad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.beginPath()
      ctx.arc(cx, cy, ringR, 0, Math.PI * 2)
      ctx.fillStyle = grad
      ctx.fill()
    }

    // Build blob shape
    const points: { x: number; y: number }[] = []
    const numPoints = blobPointsRef.current.length

    blobPointsRef.current.forEach((p, i) => {
      const wobble = state === 'speaking'
        ? Math.sin(timeRef.current * 8 + p.offset) * 0.18
        : state === 'listening'
        ? Math.sin(timeRef.current * 6 + p.offset) * 0.12
        : state === 'thinking'
        ? Math.sin(timeRef.current * 4 + p.offset) * 0.08
        : Math.sin(timeRef.current * 2 + p.offset) * 0.04

      const r = baseR * (p.radius + wobble)
      points.push({
        x: cx + Math.cos(p.angle + timeRef.current * p.speed * 10) * r,
        y: cy + Math.sin(p.angle + timeRef.current * p.speed * 10) * r,
      })
    })

    // Draw smooth blob with bezier curves
    ctx.beginPath()
    for (let i = 0; i < numPoints; i++) {
      const curr = points[i]
      const next = points[(i + 1) % numPoints]
      const mid = { x: (curr.x + next.x) / 2, y: (curr.y + next.y) / 2 }
      if (i === 0) ctx.moveTo(mid.x, mid.y)
      else ctx.quadraticCurveTo(curr.x, curr.y, mid.x, mid.y)
    }
    ctx.closePath()

    // Gradient fill — Siri liquid glass effect
    const grad = ctx.createRadialGradient(
      cx - baseR * 0.3, cy - baseR * 0.3, baseR * 0.1,
      cx, cy, baseR * 1.2
    )
    grad.addColorStop(0, 'rgba(255,255,255,0.95)')
    grad.addColorStop(0.15, c3)
    grad.addColorStop(0.5, c2)
    grad.addColorStop(0.85, c1)
    grad.addColorStop(1, 'rgba(0,0,0,0.6)')
    ctx.fillStyle = grad
    ctx.fill()

    // Shimmer highlight — top left gloss
    ctx.beginPath()
    for (let i = 0; i < numPoints; i++) {
      const curr = points[i]
      const next = points[(i + 1) % numPoints]
      const mid = { x: (curr.x + next.x) / 2, y: (curr.y + next.y) / 2 }
      if (i === 0) ctx.moveTo(mid.x, mid.y)
      else ctx.quadraticCurveTo(curr.x, curr.y, mid.x, mid.y)
    }
    ctx.closePath()
    const shimmer = ctx.createRadialGradient(
      cx - baseR * 0.35, cy - baseR * 0.4, 0,
      cx - baseR * 0.1, cy - baseR * 0.1, baseR * 0.7
    )
    shimmer.addColorStop(0, 'rgba(255,255,255,0.6)')
    shimmer.addColorStop(0.4, 'rgba(255,255,255,0.1)')
    shimmer.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = shimmer
    ctx.fill()

    // Speaking wave lines — like Siri audio bars
    if (state === 'speaking') {
      const numBars = 5
      for (let i = 0; i < numBars; i++) {
        const barH = (Math.sin(timeRef.current * 10 + i * 1.2) * 0.5 + 0.5) * baseR * 0.4 + baseR * 0.1
        const x = cx + (i - numBars / 2) * (baseR * 0.18)
        const barGrad = ctx.createLinearGradient(x, cy - barH, x, cy + barH)
        barGrad.addColorStop(0, 'rgba(255,255,255,0)')
        barGrad.addColorStop(0.5, 'rgba(255,255,255,0.8)')
        barGrad.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.beginPath()
        ctx.roundRect(x - 2, cy - barH, 4, barH * 2, 2)
        ctx.fillStyle = barGrad
        ctx.fill()
      }
    }

    // Thinking spinner dots
    if (state === 'thinking') {
      for (let i = 0; i < 3; i++) {
        const angle = timeRef.current * 3 + (i / 3) * Math.PI * 2
        const dotX = cx + Math.cos(angle) * baseR * 0.45
        const dotY = cy + Math.sin(angle) * baseR * 0.45
        ctx.beginPath()
        ctx.arc(dotX, dotY, 4, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255,255,255,0.9)'
        ctx.fill()
      }
    }

    // Listening pulse rings
    if (state === 'listening') {
      for (let i = 1; i <= 2; i++) {
        const pulseR = baseR + i * 15 + Math.sin(timeRef.current * 5) * 8
        ctx.beginPath()
        ctx.arc(cx, cy, pulseR, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(16,185,129,${0.3 / i})`
        ctx.lineWidth = 2
        ctx.stroke()
      }
    }

    animRef.current = requestAnimationFrame(animate)
  }

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ display: 'block' }}
    />
  )
}